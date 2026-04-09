import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import DashboardSidebar from '../components/DashboardSidebar'
import { User, Mail, Shield, LogIn, Camera, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { updateProfile, uploadProfilePicture, changePassword } from '../api/profile'

const Dashboard = () => {
  const { user, isAdmin, checkAuth } = useAuth()
  const fileInputRef = useRef(null)
  
  const [viewMode, setViewMode] = useState('view')
  const [editForm, setEditForm] = useState({ name: '', email: '' })
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const handleEdit = () => {
    setEditForm({ name: user?.name || '', email: user?.email || '' })
    setViewMode('edit')
    setAlert({ type: '', message: '' })
  }

  const handleCancel = () => {
    setViewMode('view')
    setAlert({ type: '', message: '' })
  }

  const handleSave = async () => {
    setLoading(true)
    setAlert({ type: '', message: '' })
    
    try {
      await updateProfile(editForm.name, editForm.email)
      await checkAuth()
      setViewMode('view')
      setAlert({ type: 'success', message: 'Profile updated successfully!' })
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to update profile'
      setAlert({ type: 'error', message: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setAlert({ type: 'error', message: 'New passwords do not match' })
      return
    }
    if (passwordForm.newPassword.length < 8) {
      setAlert({ type: 'error', message: 'Password must be at least 8 characters' })
      return
    }

    setLoading(true)
    setAlert({ type: '', message: '' })

    try {
      await changePassword(passwordForm.oldPassword, passwordForm.newPassword)
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setViewMode('view')
      setAlert({ type: 'success', message: 'Password changed successfully!' })
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to change password'
      setAlert({ type: 'error', message: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async () => {
      setUploadingImage(true)
      try {
        await uploadProfilePicture(reader.result)
        await checkAuth()
        setAlert({ type: 'success', message: 'Profile picture updated!' })
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to upload image'
        setAlert({ type: 'error', message: errorMsg })
      } finally {
        setUploadingImage(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN': return 'role-admin'
      case 'TECHNICIAN': return 'role-technician'
      case 'LECTURER': return 'role-lecturer'
      default: return 'role-student'
    }
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
          <p className="page-subtitle">Smart Campus Operations Hub</p>
        </div>

        {alert.message && (
          <div className={`alert ${alert.type === 'error' ? 'alert-error' : 'alert-success'}`}>
            {alert.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {alert.message}
          </div>
        )}

        <div className="dashboard-grid">
          {/* Profile Card */}
          <div className="card profile-card-full">
            <div className="card-header">
              <h3><User size={18} /> My Profile</h3>
              {viewMode === 'view' && (
                <div className="header-actions">
                  <button className="btn btn-sm btn-outline" onClick={() => setViewMode('password')}>
                    <Lock size={14} /> Change Password
                  </button>
                  <button className="btn btn-sm btn-primary" onClick={handleEdit}>
                    Edit Profile
                  </button>
                </div>
              )}
            </div>

            {viewMode === 'view' ? (
              <div className="profile-view-modern">
                <div className="profile-avatar-section">
                  <div className="profile-avatar-large">
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt="Profile" />
                    ) : (
                      <div className="avatar-placeholder-lg">{user?.name?.[0] || '?'}</div>
                    )}
                    <button 
                      className="avatar-upload-btn" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      <Camera size={16} />
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <p className="avatar-hint">Click to upload new photo</p>
                </div>
                <div className="profile-info-modern">
                  <div className="info-row">
                    <div className="info-item-modern">
                      <User size={18} />
                      <div>
                        <label>Full Name</label>
                        <span>{user?.name}</span>
                      </div>
                    </div>
                    <div className="info-item-modern">
                      <Mail size={18} />
                      <div>
                        <label>Email</label>
                        <span>{user?.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-item-modern">
                      <Shield size={18} />
                      <div>
                        <label>Role</label>
                        <span className={`role-badge ${getRoleBadgeClass(user?.role)}`}>
                          {user?.role}
                        </span>
                      </div>
                    </div>
                    <div className="info-item-modern">
                      <LogIn size={18} />
                      <div>
                        <label>Login Provider</label>
                        <span>{user?.provider}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : viewMode === 'edit' ? (
              <div className="profile-edit-modern">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="form-input-modern"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email {(!isAdmin()) && <span className="text-muted">(read-only)</span>}</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="form-input-modern"
                      disabled={!isAdmin()}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div className="form-actions-modern">
                  <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="password-change-modern">
                <div className="password-header">
                  <Lock size={24} />
                  <div>
                    <h4>Change Password</h4>
                    <p>Update your account password</p>
                  </div>
                </div>
                <div className="form-stack">
                  <div className="form-group">
                    <label>Current Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                        className="form-input-modern"
                        placeholder="Enter current password"
                      />
                      <button 
                        type="button" 
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="form-input-modern"
                      placeholder="Enter new password (min 8 chars)"
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="form-input-modern"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <div className="form-actions-modern">
                  <button className="btn btn-primary" onClick={handlePasswordChange} disabled={loading}>
                    {loading ? 'Changing...' : 'Update Password'}
                  </button>
                  <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="card stat-card-modern">
            <div className="stat-icon-modern">
              <User size={24} />
            </div>
            <div className="stat-content-modern">
              <h3>Your Account</h3>
              <p>Manage your profile and settings</p>
            </div>
          </div>

          {/* Role-specific content */}
          {isAdmin() && (
            <div className="card action-card-modern">
              <div className="action-icon-modern">
                <Shield size={24} />
              </div>
              <div className="action-content-modern">
                <h3>Admin Controls</h3>
                <p>Manage system users and settings</p>
                <Link to="/admin/users" className="btn btn-primary mt-2">
                  Manage Users
                </Link>
              </div>
            </div>
          )}

          {/* Campus Services */}
          <div className="card services-card-modern">
            <h3>Campus Services</h3>
            <ul className="services-list-modern">
              <li>
                <span className="service-icon">📋</span>
                Report facility issues
              </li>
              <li>
                <span className="service-icon">🔧</span>
                Request maintenance
              </li>
              <li>
                <span className="service-icon">📢</span>
                View announcements
              </li>
              <li>
                <span className="service-icon">📊</span>
                Track requests
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard