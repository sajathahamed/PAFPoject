import { useState, useEffect } from 'react';
import authService from '../services/authService';
import DashboardSidebar from '../components/DashboardSidebar';
import { Trash2, Edit2 } from 'lucide-react';

/**
 * Admin page for managing users and their roles.
 */
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);

  // New user modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT'
  });

  // Fetch all users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdating(userId);
      setError(null);
      const updatedUser = await authService.updateUserRole(userId, newRole);

      // Update user in local state
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update role');
    } finally {
      setUpdating(null);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    // Validate fields
    if (!newUserData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (newUserData.name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (!newUserData.email.trim()) {
      setError('Email is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserData.email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    if (!newUserData.password || newUserData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      setIsCreating(true);
      setError(null);
      await authService.adminCreateUser(newUserData);

      // Close modal and refresh list
      setIsModalOpen(false);
      setNewUserData({ name: '', email: '', password: '', role: 'STUDENT' });
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  // Edit user modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserData, setEditUserData] = useState({ name: '', email: '', role: 'STUDENT' });
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditUserData({ name: user.name, email: user.email, role: user.role });
    setIsEditModalOpen(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    // Validate fields
    if (!editUserData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (editUserData.name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (!editUserData.email.trim()) {
      setError('Email is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editUserData.email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    try {
      setIsEditing(true);
      setError(null);
      console.log('Updating user:', editingUser.id, editUserData);
      await authService.updateUser(editingUser.id, editUserData);
      console.log('Update successful');
      setIsEditModalOpen(false);
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      console.error('Edit error:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to update user';
      setError(errorMsg);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      setUpdating(userId);
      setError(null);
      console.log('Deleting user:', userId);
      await authService.deleteUser(userId);
      console.log('Delete successful');
      await fetchUsers();
      await fetchUsers();
    } catch (err) {
      console.error('Delete error:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to delete user';
      setError(errorMsg);
    } finally {
      setUpdating(null);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        <div className="page-header flex-between">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage user roles and permissions</p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            + Create New Account
          </button>
          <button onClick={fetchUsers} className="btn btn-secondary">
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Create New Account</h2>
            <form onSubmit={handleCreateUser}>
              <div className="form-group mb-1">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  required
                  placeholder="John Doe"
                />
              </div>
              <div className="form-group mb-1">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  required
                  placeholder="email@example.com"
                />
              </div>
              <div className="form-group mb-1">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  required
                  placeholder="Min 6 characters"
                  minLength={6}
                />
              </div>
              <div className="form-group mb-2">
                <label className="form-label">Initial Role</label>
                <select
                  className="form-select"
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                  required
                >
                  <option value="STUDENT">STUDENT</option>
                  <option value="LECTURER">LECTURER</option>
                  <option value="TECHNICIAN">TECHNICIAN</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Edit User</h2>
            <form onSubmit={handleEditSave}>
              <div className="form-group mb-1">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editUserData.name}
                  onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group mb-1">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={editUserData.email}
                  onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group mb-2">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={editUserData.role}
                  onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}
                  required
                >
                  <option value="STUDENT">STUDENT</option>
                  <option value="LECTURER">LECTURER</option>
                  <option value="TECHNICIAN">TECHNICIAN</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={isEditing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isEditing}
                >
                  {isEditing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Provider</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="flex gap-1" style={{ alignItems: 'center' }}>
                    {user.profilePicture && (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                        }}
                      />
                    )}
                    <span>{user.name}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge badge-${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>{user.provider}</td>
                <td>{formatDate(user.lastLoginAt)}</td>
                <td>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditClick(user)}
                      className="btn btn-sm btn-outline"
                      title="Edit user"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="btn btn-sm btn-danger"
                      title="Delete user"
                      disabled={updating === user.id}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <p className="text-center mt-2" style={{ color: '#666' }}>
            No users found.
          </p>
        )}
      </div>
      </div>
    </div>
  );
};

export default AdminUsers;
