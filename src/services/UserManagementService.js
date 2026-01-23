// User Management Service - Handles invitations, employee IDs, and user onboarding
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { employeeIdConfig } from '../constants';

class UserManagementService {

  // Generate unique employee ID for a company
  async generateEmployeeId(companyId) {
    const companyRef = doc(db, 'companies', companyId);
    const companySnap = await getDoc(companyRef);

    let nextNumber = 1;
    if (companySnap.exists()) {
      const data = companySnap.data();
      nextNumber = (data.lastEmployeeNumber || 0) + 1;
    }

    // Update the company's last employee number
    await updateDoc(companyRef, {
      lastEmployeeNumber: nextNumber
    });

    // Format the employee ID (e.g., EMP-0001)
    const { prefix, digits } = employeeIdConfig;
    const paddedNumber = String(nextNumber).padStart(digits, '0');
    return `${prefix}-${paddedNumber}`;
  }

  // Create an invitation for a new user
  async createInvitation(companyId, invitedBy, invitationData) {
    const { email, role, department, position, name } = invitationData;

    // Generate employee ID
    const employeeId = await this.generateEmployeeId(companyId);

    // Create invitation code (6 character alphanumeric)
    const inviteCode = this.generateInviteCode();

    // Set expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = {
      email: email.toLowerCase(),
      name,
      role,
      department,
      position,
      employeeId,
      companyId,
      invitedBy,
      inviteCode,
      status: 'pending',
      createdAt: serverTimestamp(),
      expiresAt: expiresAt.toISOString(),
      acceptedAt: null
    };

    // Store invitation in Firestore
    const invitationsRef = collection(db, 'companies', companyId, 'invitations');
    const inviteDocRef = doc(invitationsRef);
    await setDoc(inviteDocRef, invitation);

    return {
      id: inviteDocRef.id,
      ...invitation,
      inviteLink: this.generateInviteLink(companyId, inviteCode)
    };
  }

  // Generate a random invite code
  generateInviteCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar chars (I, O, 0, 1)
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Generate invite link
  generateInviteLink(companyId, inviteCode) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/join?company=${companyId}&code=${inviteCode}`;
  }

  // Verify an invitation code
  async verifyInvitation(companyId, inviteCode) {
    const invitationsRef = collection(db, 'companies', companyId, 'invitations');
    const q = query(
      invitationsRef,
      where('inviteCode', '==', inviteCode),
      where('status', '==', 'pending')
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { valid: false, error: 'Invalid or expired invitation code' };
    }

    const inviteDoc = snapshot.docs[0];
    const invitation = inviteDoc.data();

    // Check expiration
    if (new Date(invitation.expiresAt) < new Date()) {
      await updateDoc(inviteDoc.ref, { status: 'expired' });
      return { valid: false, error: 'Invitation has expired' };
    }

    return {
      valid: true,
      invitation: { id: inviteDoc.id, ...invitation }
    };
  }

  // Accept an invitation and create user profile
  async acceptInvitation(companyId, inviteCode, userId) {
    const verification = await this.verifyInvitation(companyId, inviteCode);

    if (!verification.valid) {
      throw new Error(verification.error);
    }

    const { invitation } = verification;

    // Update invitation status
    const inviteRef = doc(db, 'companies', companyId, 'invitations', invitation.id);
    await updateDoc(inviteRef, {
      status: 'accepted',
      acceptedAt: serverTimestamp(),
      acceptedBy: userId
    });

    // Create/update user profile with company details
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      companyId,
      employeeId: invitation.employeeId,
      role: invitation.role,
      department: invitation.department,
      position: invitation.position,
      onboardingStatus: 'in_progress',
      invitedBy: invitation.invitedBy,
      joinedAt: serverTimestamp(),
      updated_at: serverTimestamp()
    }, { merge: true });

    // Create employee record in company
    const employeeRef = doc(db, 'companies', companyId, 'employees', invitation.employeeId);
    await setDoc(employeeRef, {
      userId,
      employeeId: invitation.employeeId,
      name: invitation.name,
      email: invitation.email,
      role: invitation.role,
      department: invitation.department,
      position: invitation.position,
      status: 'active',
      hireDate: new Date().toISOString().split('T')[0],
      completedTrainings: 0,
      totalTrainings: 0,
      onboardingStatus: 'in_progress',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return {
      success: true,
      employeeId: invitation.employeeId,
      role: invitation.role,
      department: invitation.department
    };
  }

  // Get all invitations for a company
  async getCompanyInvitations(companyId, status = null) {
    const invitationsRef = collection(db, 'companies', companyId, 'invitations');

    let q;
    if (status) {
      q = query(invitationsRef, where('status', '==', status), orderBy('createdAt', 'desc'));
    } else {
      q = query(invitationsRef, orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Cancel an invitation
  async cancelInvitation(companyId, invitationId) {
    const inviteRef = doc(db, 'companies', companyId, 'invitations', invitationId);
    await updateDoc(inviteRef, {
      status: 'cancelled',
      cancelledAt: serverTimestamp()
    });
  }

  // Resend an invitation (generate new code and extend expiration)
  async resendInvitation(companyId, invitationId) {
    const inviteRef = doc(db, 'companies', companyId, 'invitations', invitationId);
    const inviteSnap = await getDoc(inviteRef);

    if (!inviteSnap.exists()) {
      throw new Error('Invitation not found');
    }

    const newCode = this.generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await updateDoc(inviteRef, {
      inviteCode: newCode,
      expiresAt: expiresAt.toISOString(),
      status: 'pending',
      resentAt: serverTimestamp()
    });

    return {
      inviteCode: newCode,
      inviteLink: this.generateInviteLink(companyId, newCode)
    };
  }

  // Get company members (all users in a company)
  async getCompanyMembers(companyId) {
    const employeesRef = collection(db, 'companies', companyId, 'employees');
    const q = query(employeesRef, orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Update user role
  async updateUserRole(companyId, employeeId, newRole) {
    // Update employee record
    const employeeRef = doc(db, 'companies', companyId, 'employees', employeeId);
    const employeeSnap = await getDoc(employeeRef);

    if (!employeeSnap.exists()) {
      throw new Error('Employee not found');
    }

    const employeeData = employeeSnap.data();

    await updateDoc(employeeRef, {
      role: newRole,
      updatedAt: serverTimestamp()
    });

    // Update user profile if linked
    if (employeeData.userId) {
      const userRef = doc(db, 'users', employeeData.userId);
      await updateDoc(userRef, {
        role: newRole,
        updated_at: serverTimestamp()
      });
    }
  }

  // Deactivate user
  async deactivateUser(companyId, employeeId) {
    const employeeRef = doc(db, 'companies', companyId, 'employees', employeeId);
    await updateDoc(employeeRef, {
      status: 'inactive',
      deactivatedAt: serverTimestamp()
    });
  }

  // Reactivate user
  async reactivateUser(companyId, employeeId) {
    const employeeRef = doc(db, 'companies', companyId, 'employees', employeeId);
    await updateDoc(employeeRef, {
      status: 'active',
      reactivatedAt: serverTimestamp()
    });
  }

  // Complete user onboarding
  async completeOnboarding(companyId, employeeId, userId) {
    // Update employee record
    const employeeRef = doc(db, 'companies', companyId, 'employees', employeeId);
    await updateDoc(employeeRef, {
      onboardingStatus: 'completed',
      onboardingCompletedAt: serverTimestamp()
    });

    // Update user profile
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      onboardingStatus: 'completed',
      updated_at: serverTimestamp()
    });
  }
}

export default new UserManagementService();
