import React, { useState, useEffect } from 'react';
import axiosInstance from '../../services/axiosConfig';
import { User, Edit, Trash2 } from 'lucide-react';
import UserDetailModal from '../../components/users/UserDetailModal';
import UserEditModal from '../../components/users/UserEditModal';
import '../../styles/pages/users.scss';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  useEffect(() => {
    fetchUsers();
  }, []);

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

  const handleUserUpdate = async (userId, userData) => {
    try {
      await axiosInstance.put(`/users/${userId}`, userData);
      await fetchUsers(); // Refresh danh sách
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/users/${userId}`);
      await fetchUsers(); // Refresh danh sách
    } catch (error) {
      console.error('Error deleting user:', error);
    }
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
      <div className="users-header">
        <h1 className="users-title">Users</h1>
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
            {users.map((user) => (
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
                    >
                      <User size={16} />
                    </button>
                    <button 
                      className="action-button edit"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit size={16} />
                    </button>
                    {user.role !== 'admin' && (
                      <button 
                        className="action-button delete"
                        onClick={() => handleDeleteUser(user.user_id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
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
    </div>
  );
};

export default Users;