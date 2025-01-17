import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../../services/axiosConfig';
import { User, Edit, Trash2, Shield, ShieldOff, Search, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

import UserDetailModal from '../../components/users/UserDetailModal';
import UserEditModal from '../../components/users/UserEditModal';
import ResetPasswordButton from '../../components/users/reset-password/ResetPasswordButton';
import ResetPasswordModal from '../../components/users/reset-password/ResetPasswordModal';
import Toast from '../../components/common/Toast';

import '../../styles/pages/users.scss';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [resetPasswordData, setResetPasswordData] = useState(null);
  
  const isSuperAdmin = currentUser?.user_id === 1;

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/users/');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    
    const searchLower = searchTerm.toLowerCase();
    return users.filter(user => 
      user.user_id.toString().includes(searchTerm) ||
      user.username.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  }, [users, searchTerm]);

  const handleUserUpdate = async (userId, userData) => {
    try {
      await axiosInstance.put(`/users/${userId}`, userData);
      await fetchUsers();
      showToastMessage('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      showToastMessage('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/users/${userId}`);
      await fetchUsers();
      showToastMessage('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      showToastMessage('Failed to delete user');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    const actionText = newRole === 'admin' ? 'make this user an admin' : 'revoke admin privileges';
    if (!window.confirm(`Are you sure you want to ${actionText}?`)) {
      return;
    }

    try {
      await axiosInstance.patch(`/users/${userId}/role`, {
        role: newRole
      });
      await fetchUsers();
      showToastMessage(`User role ${newRole === 'admin' ? 'updated to admin' : 'revoked from admin'} successfully`);
    } catch (error) {
      console.error('Error updating user role:', error);
      showToastMessage('Failed to update user role');
    }
  };

  const handlePasswordResetSuccess = (data) => {
    setResetPasswordData(data);
    showToastMessage('Password reset successful');
  };

  const handlePasswordResetError = (error) => {
    showToastMessage(error);
  };

  const handleViewDetail = (user) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  if (loading) return <div className="loading-state">Loading users...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="users-page">
      <Toast 
        message={toastMessage}
        isVisible={showToast}
        onHide={() => setShowToast(false)}
      />

      <div className="users-header">
        <h1 className="users-title">Users</h1>
        <div className="search-bar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by ID, username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <Search className="search-icon" size={20} />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="clear-button"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="users-list">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Full Name</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.user_id}>
                <td>{user.user_id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.full_name}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="action-button view"
                      onClick={() => handleViewDetail(user)}
                      title="View Details"
                    >
                      <User size={16} />
                    </button>
                    <button 
                      className="action-button edit"
                      onClick={() => handleEdit(user)}
                      title="Edit User"
                    >
                      <Edit size={16} />
                    </button>
                    {isSuperAdmin && user.user_id !== 1 && (
                      <>
                        {user.role === 'admin' ? (
                          <button 
                            className="action-button revoke"
                            onClick={() => handleUpdateRole(user.user_id, 'user')}
                            title="Revoke Admin"
                          >
                            <ShieldOff size={16} />
                          </button>
                        ) : (
                          <button 
                            className="action-button promote"
                            onClick={() => handleUpdateRole(user.user_id, 'admin')}
                            title="Make Admin"
                          >
                            <Shield size={16} />
                          </button>
                        )}
                        <ResetPasswordButton
                          userId={user.user_id}
                          username={user.username}
                          onSuccess={handlePasswordResetSuccess}
                          onError={handlePasswordResetError}
                        />
                      </>
                    )}
                    {user.role !== 'admin' && user.user_id !== 1 && (
                      <button 
                        className="action-button delete"
                        onClick={() => handleDeleteUser(user.user_id)}
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No users found matching your search
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && isDetailModalOpen && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => {
            setSelectedUser(null);
            setIsDetailModalOpen(false);
          }}
        />
      )}

      {selectedUser && isEditModalOpen && (
        <UserEditModal
          user={selectedUser}
          onClose={() => {
            setSelectedUser(null);
            setIsEditModalOpen(false);
          }}
          onSave={handleUserUpdate}
        />
      )}

      {resetPasswordData && (
        <ResetPasswordModal
          tempPassword={resetPasswordData.temp_password}
          onClose={() => setResetPasswordData(null)}
        />
      )}
    </div>
  );
};

export default Users;