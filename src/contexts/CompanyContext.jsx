import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { userRoles, employeeIdConfig } from '../constants';

const CompanyContext = createContext();

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

// Generate unique employee ID for a company
const generateEmployeeId = async (companyId) => {
  try {
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
  } catch (error) {
    console.error('Error generating employee ID:', error);
    throw new Error(`Failed to generate employee ID: ${error.message}`);
  }
};

export const CompanyProvider = ({ children }) => {
  const { userProfile, currentUser } = useAuth();
  const [company, setCompany] = useState(null);
  const [allEmployees, setAllEmployees] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const companyId = userProfile?.companyId;
  const userRole = userProfile?.role || 'employee';
  const userDepartment = userProfile?.department;
  const rolePermissions = userRoles[userRole] || userRoles.employee;

  // Filter employees based on user role
  const employees = useMemo(() => {
    if (!allEmployees.length) return [];

    // Admins see all employees
    if (rolePermissions.canViewAllEmployees) {
      return allEmployees;
    }

    // Managers and Supervisors see only their department
    if (['manager', 'supervisor'].includes(userRole) && userDepartment) {
      return allEmployees.filter(emp => emp.department === userDepartment);
    }

    // Leads see their team members (same department, lower level roles)
    if (userRole === 'lead' && userDepartment) {
      return allEmployees.filter(emp =>
        emp.department === userDepartment &&
        ['technician', 'operator', 'employee'].includes(emp.role)
      );
    }

    // Technicians, operators, and employees see only themselves
    if (['technician', 'operator', 'employee'].includes(userRole)) {
      return allEmployees.filter(emp => emp.userId === currentUser?.uid);
    }

    return allEmployees;
  }, [allEmployees, rolePermissions, userRole, userDepartment, currentUser]);

  // Fetch company data
  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const companyRef = doc(db, 'companies', companyId);

    const unsubscribe = onSnapshot(companyRef, (doc) => {
      if (doc.exists()) {
        setCompany({ id: doc.id, ...doc.data() });
      } else {
        setCompany(null);
      }
      setLoading(false);
    }, (err) => {
      console.error('Error fetching company:', err);
      setError(err.message);
      setLoading(false);
    });

    return unsubscribe;
  }, [companyId]);

  // Fetch employees (all employees, filtering happens in useMemo above)
  useEffect(() => {
    if (!companyId) return;

    const employeesRef = collection(db, 'companies', companyId, 'employees');
    const q = query(employeesRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const employeeList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllEmployees(employeeList);
    }, (err) => {
      console.error('Error fetching employees:', err);
      setError(err.message);
    });

    return unsubscribe;
  }, [companyId]);

  // Fetch trainings
  useEffect(() => {
    if (!companyId) return;

    const trainingsRef = collection(db, 'companies', companyId, 'trainings');
    const q = query(trainingsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const trainingList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTrainings(trainingList);
    }, (err) => {
      console.error('Error fetching trainings:', err);
      setError(err.message);
    });

    return unsubscribe;
  }, [companyId]);

  // Create or update company
  const saveCompany = useCallback(async (companyData) => {
    try {
      setError(null);
      const id = companyId || currentUser?.uid;
      if (!id) throw new Error('No company ID available');

      const companyRef = doc(db, 'companies', id);
      const docSnap = await getDoc(companyRef);
      const isNewCompany = !docSnap.exists();

      if (docSnap.exists()) {
        await updateDoc(companyRef, {
          ...companyData,
          updated_at: serverTimestamp()
        });
      } else {
        // New company - initialize with lastEmployeeNumber
        await setDoc(companyRef, {
          ...companyData,
          ownerId: currentUser?.uid,
          lastEmployeeNumber: 0,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });
      }

      // Update user profile with companyId and create owner as first employee
      if (currentUser?.uid) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            throw new Error('User document not found');
          }
          
          const userData = userSnap.data() || {};

          // Generate employee ID for owner if not already set
          let employeeId = userData.employeeId;
          if (!employeeId && isNewCompany) {
            employeeId = await generateEmployeeId(id);

            // Create owner as employee in company
            const ownerEmployeeRef = doc(db, 'companies', id, 'employees', employeeId);
            await setDoc(ownerEmployeeRef, {
              userId: currentUser.uid,
              employeeId: employeeId,
              name: currentUser.displayName || userData.displayName || 'Admin',
              email: currentUser.email,
              role: 'admin',
              department: 'Management',
              position: 'Administrator',
              status: 'active',
              hireDate: new Date().toISOString().split('T')[0],
              completedTrainings: 0,
              totalTrainings: 0,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          }

          // Update user profile with merge option to preserve other fields
          await updateDoc(userRef, {
            companyId: id,
            employeeId: employeeId || userData.employeeId,
            role: userData.role || 'admin',
            updated_at: serverTimestamp()
          });

          console.log('👤 User assigned to company:', id, 'Employee ID:', employeeId || userData.employeeId);
        } catch (userError) {
          console.error('Error updating user profile:', userError);
          // Still return company ID even if user update fails, but log the error
          setError(`Company saved but failed to update user profile: ${userError.message}`);
        }
      }

      return id;
    } catch (err) {
      console.error('Error saving company:', err);
      setError(`Failed to save company: ${err.message}`);
      throw err;
    }
  }, [companyId, currentUser]);

  // Add employee with unique employee ID
  const addEmployee = useCallback(async (employeeData) => {
    try {
      setError(null);
      if (!companyId) throw new Error('No company ID');
      
      // Validate required fields
      if (!employeeData.name || !employeeData.email) {
        throw new Error('Employee name and email are required');
      }

      // Generate unique employee ID
      const employeeId = await generateEmployeeId(companyId);

      // Use employee ID as the document ID for easy lookup
      const employeeRef = doc(db, 'companies', companyId, 'employees', employeeId);

      await setDoc(employeeRef, {
        ...employeeData,
        employeeId: employeeId,
        status: 'active',
        completedTrainings: 0,
        totalTrainings: 0,
        performance: 0,
        certifications: [],
        trainingHistory: [],
        recommendedTrainings: [],
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      console.log('👤 New employee created with ID:', employeeId);
      return employeeId;
    } catch (err) {
      console.error('Error adding employee:', err);
      setError(`Failed to add employee: ${err.message}`);
      throw err;
    }
  }, [companyId]);

  // Update employee
  const updateEmployee = useCallback(async (employeeId, data) => {
    try {
      setError(null);
      if (!companyId) throw new Error('No company ID');
      if (!employeeId) throw new Error('No employee ID provided');

      const employeeRef = doc(db, 'companies', companyId, 'employees', employeeId);
      await updateDoc(employeeRef, {
        ...data,
        updated_at: serverTimestamp()
      });
    } catch (err) {
      console.error('Error updating employee:', err);
      setError(`Failed to update employee: ${err.message}`);
      throw err;
    }
  }, [companyId]);

  // Save training
  const saveTraining = useCallback(async (trainingData) => {
    try {
      setError(null);
      if (!companyId) throw new Error('No company ID');
      if (!trainingData.title) throw new Error('Training title is required');

      const trainingsRef = collection(db, 'companies', companyId, 'trainings');
      const newTrainingRef = doc(trainingsRef);

      await setDoc(newTrainingRef, {
        ...trainingData,
        createdBy: currentUser?.uid,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      return newTrainingRef.id;
    } catch (err) {
      console.error('Error saving training:', err);
      setError(`Failed to save training: ${err.message}`);
      throw err;
    }
  }, [companyId, currentUser]);

  // Save quiz result
  const saveQuizResult = useCallback(async (resultData) => {
    try {
      setError(null);
      if (!companyId) throw new Error('No company ID');
      if (!resultData.employeeId) throw new Error('Employee ID is required');
      if (!resultData.trainingId) throw new Error('Training ID is required');

      const resultsRef = collection(db, 'companies', companyId, 'quizResults');
      const newResultRef = doc(resultsRef);

      await setDoc(newResultRef, {
        ...resultData,
        completedAt: serverTimestamp()
      });

      // Update employee training stats if passed
      if (resultData.passed && resultData.employeeId) {
        const employeeRef = doc(db, 'companies', companyId, 'employees', resultData.employeeId);
        const employeeSnap = await getDoc(employeeRef);

        if (employeeSnap.exists()) {
          const employeeData = employeeSnap.data();
          await updateDoc(employeeRef, {
            completedTrainings: (employeeData.completedTrainings || 0) + 1,
            trainingHistory: [
              ...(employeeData.trainingHistory || []),
              {
                trainingId: resultData.trainingId,
                title: resultData.trainingTitle,
                score: resultData.percentage,
                completedAt: new Date().toISOString()
              }
            ],
            updated_at: serverTimestamp()
          });
        } else {
          console.warn('Employee not found for quiz result update:', resultData.employeeId);
        }
      }

      return newResultRef.id;
    } catch (err) {
      console.error('Error saving quiz result:', err);
      setError(`Failed to save quiz result: ${err.message}`);
      throw err;
    }
  }, [companyId]);

  const value = {
    company,
    employees,
    trainings,
    loading,
    error,
    userRole,
    rolePermissions,
    userDepartment,
    saveCompany,
    addEmployee,
    updateEmployee,
    saveTraining,
    saveQuizResult
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};

export default CompanyContext;
