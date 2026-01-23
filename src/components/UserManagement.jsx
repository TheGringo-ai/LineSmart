import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Mail, Shield, Building, Briefcase,
  Check, X, Clock, RefreshCw, Copy, Trash2, Edit2,
  ChevronDown, Search, Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCompany } from '../contexts/CompanyContext';
import UserManagementService from '../services/UserManagementService';
import {
  userRoles,
  standardDepartments,
  positionsByDepartment,
  inviteStatus
} from '../constants';

const UserManagement = ({ onClose }) => {
  const { userProfile } = useAuth();
  const { company } = useCompany();

  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');

  // Invite form state
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({
    name: '',
    email: '',
    role: 'employee',
    department: '',
    position: ''
  });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(null);
  const [inviteError, setInviteError] = useState(null);

  // Edit modal state
  const [editingMember, setEditingMember] = useState(null);

  const companyId = userProfile?.companyId;

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [membersData, invitationsData] = await Promise.all([
        UserManagementService.getCompanyMembers(companyId),
        UserManagementService.getCompanyInvitations(companyId)
      ]);
      setMembers(membersData);
      setInvitations(invitationsData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
    setLoading(false);
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      const result = await UserManagementService.createInvitation(
        companyId,
        userProfile.id,
        inviteData
      );

      setInviteSuccess({
        message: `Invitation sent to ${inviteData.email}`,
        inviteLink: result.inviteLink,
        inviteCode: result.inviteCode
      });

      // Reset form
      setInviteData({
        name: '',
        email: '',
        role: 'employee',
        department: '',
        position: ''
      });

      // Reload invitations
      const invitationsData = await UserManagementService.getCompanyInvitations(companyId);
      setInvitations(invitationsData);

    } catch (error) {
      setInviteError(error.message);
    }
    setInviteLoading(false);
  };

  const handleCancelInvitation = async (invitationId) => {
    if (!window.confirm('Are you sure you want to cancel this invitation?')) return;

    try {
      await UserManagementService.cancelInvitation(companyId, invitationId);
      const invitationsData = await UserManagementService.getCompanyInvitations(companyId);
      setInvitations(invitationsData);
    } catch (error) {
      alert('Error cancelling invitation: ' + error.message);
    }
  };

  const handleResendInvitation = async (invitationId) => {
    try {
      const result = await UserManagementService.resendInvitation(companyId, invitationId);
      alert(`Invitation resent! New code: ${result.inviteCode}`);
      const invitationsData = await UserManagementService.getCompanyInvitations(companyId);
      setInvitations(invitationsData);
    } catch (error) {
      alert('Error resending invitation: ' + error.message);
    }
  };

  const handleUpdateRole = async (employeeId, newRole) => {
    try {
      await UserManagementService.updateUserRole(companyId, employeeId, newRole);
      loadData();
      setEditingMember(null);
    } catch (error) {
      alert('Error updating role: ' + error.message);
    }
  };

  const handleDeactivateUser = async (employeeId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;

    try {
      await UserManagementService.deactivateUser(companyId, employeeId);
      loadData();
    } catch (error) {
      alert('Error deactivating user: ' + error.message);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  // Filter members
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.employeeId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesDept = filterDepartment === 'all' || member.department === filterDepartment;
    return matchesSearch && matchesRole && matchesDept;
  });

  // Get positions for selected department
  const availablePositions = inviteData.department
    ? positionsByDepartment[inviteData.department] || []
    : [];

  const departments = company?.departments || standardDepartments;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-3 border-b-2 font-medium text-sm ${
              activeTab === 'members'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Members ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`px-4 py-3 border-b-2 font-medium text-sm ${
              activeTab === 'invitations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Mail className="h-4 w-4 inline mr-2" />
            Invitations ({invitations.filter(i => i.status === 'pending').length} pending)
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Invite Button */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>

              {/* Role Filter */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                {Object.entries(userRoles).map(([key, role]) => (
                  <option key={key} value={key}>{role.name}</option>
                ))}
              </select>

              {/* Department Filter */}
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowInviteForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Invite User</span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              {/* Members Tab */}
              {activeTab === 'members' && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div>
                              <div className="font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                              {member.employeeId || member.id}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              member.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                              member.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                              member.role === 'supervisor' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {userRoles[member.role]?.name || member.role}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {member.department || '-'}
                            {member.position && (
                              <div className="text-xs text-gray-400">{member.position}</div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              member.status === 'active' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {member.status || 'Active'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setEditingMember(member)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              {member.status === 'active' && member.role !== 'admin' && (
                                <button
                                  onClick={() => handleDeactivateUser(member.id)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                                  title="Deactivate"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredMembers.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No members found matching your filters
                    </div>
                  )}
                </div>
              )}

              {/* Invitations Tab */}
              {activeTab === 'invitations' && (
                <div className="space-y-4">
                  {invitations.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      No invitations yet. Click "Invite User" to get started.
                    </div>
                  ) : (
                    invitations.map((invite) => (
                      <div
                        key={invite.id}
                        className={`p-4 rounded-lg border ${
                          invite.status === 'pending' ? 'border-yellow-200 bg-yellow-50' :
                          invite.status === 'accepted' ? 'border-green-200 bg-green-50' :
                          'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-3">
                              <span className="font-medium text-gray-900">{invite.name}</span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                invite.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                invite.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                invite.status === 'expired' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {inviteStatus[invite.status]?.label || invite.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {invite.email} | {userRoles[invite.role]?.name} | {invite.department}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Employee ID: {invite.employeeId} | Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                            </div>
                          </div>

                          {invite.status === 'pending' && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => copyToClipboard(invite.inviteCode)}
                                className="p-2 text-gray-600 hover:bg-gray-200 rounded"
                                title="Copy invite code"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleResendInvitation(invite.id)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                                title="Resend invitation"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleCancelInvitation(invite.id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded"
                                title="Cancel invitation"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Invite Form Modal */}
        {showInviteForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Invite New User</h3>
              </div>

              <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
                {inviteError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {inviteError}
                  </div>
                )}

                {inviteSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    <p className="font-medium">{inviteSuccess.message}</p>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="font-mono text-sm bg-green-100 px-2 py-1 rounded">
                        {inviteSuccess.inviteCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(inviteSuccess.inviteLink)}
                        className="text-green-700 hover:text-green-900"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteData.name}
                    onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteData.email}
                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    required
                    value={inviteData.role}
                    onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(userRoles).map(([key, role]) => (
                      <option key={key} value={key}>{role.name} - {role.description}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    required
                    value={inviteData.department}
                    onChange={(e) => setInviteData({ ...inviteData, department: e.target.value, position: '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <select
                    value={inviteData.position}
                    onChange={(e) => setInviteData({ ...inviteData, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!inviteData.department}
                  >
                    <option value="">Select Position</option>
                    {availablePositions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteForm(false);
                      setInviteSuccess(null);
                      setInviteError(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {inviteLoading ? 'Sending...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Member Modal */}
        {editingMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Member</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editingMember.name}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={editingMember.employeeId || editingMember.id}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={editingMember.role}
                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(userRoles).map(([key, role]) => (
                      <option key={key} value={key}>{role.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setEditingMember(null)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateRole(editingMember.id, editingMember.role)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
