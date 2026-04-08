import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import DashboardSidebar from '../components/DashboardSidebar'
import { updateProfile, changePassword } from '../api/profile'
import '../styles/ProfilePage.css'

const ProfilePage = () => {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  
  const [viewMode, setViewMode] = useState('view')
  const [form, setForm] = useState({ name: '', email: '' })
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)

  const isAdmin = user?.role === 'ADMIN'

  const handleEdit = () => {
    setForm({ name: user?.name || '', email: user?.email || '' })
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
      const updated = await updateProfile(form.name, form.email)
      setUser({ ...user, name: updated.name, email: updated.email })
      setViewMode('view')
      setAlert({ type: 'success', message: 'Profile updated successfully!' })
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Failed to update profile' })
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
      setAlert({ type: 'success', message: 'Password changed successfully!' })
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Failed to change password' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content">
        <div className="profile-container">
          <div className="profile-header">
            <h1>My Profile</h1>
            <p className="profile-subtitle">Manage your account settings</p>
          </div>

          {alert.message && (
            <div className={`alert alert-${alert.type}`}>
              {alert.message}
            </div>
          )}

          <div className="profile-card">
            <div className="profile-picture-section">
              <div className="profile-picture">
                {user?.picture ? (
                  <img src={user.picture} alt="Profile" />
                ) : (
                  <div className="picture-placeholder">{user?.name?.[0] || '?'}</div>
                )}
              </div>
            </div>

            {viewMode === 'view' ? (
              <>
                <div className="profile-details">
                  <div className="detail-group">
                    <label>Name</label>
                    <div className="detail-value">{user?.name}</div>
                  </div>
                  <div className="detail-group">
                    <label>Email</label>
                    <div className="detail-value">{user?.email}</div>
                  </div>
                  <div className="detail-group">
                    <label>Role</label>
                    <span className={`role-badge role-${user?.role?.toLowerCase()}`}>
                      {user?.role}
                    </span>
                  </div>
                  <div className="detail-group">
                    <label>Login Provider</label>
                    <div className="detail-value">{user?.provider}</div>
                  </div>
                </div>

                <div className="profile-actions">
                  <button className="btn-primary" onClick={handleEdit}>Edit Profile</button>
                  <button className="btn-secondary" onClick={() => setViewMode('password')}>Change Password</button>
                </div>
              </>
            ) : viewMode === 'edit' ? (
              <>
                <div className="profile-form">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      Email
                      {!isAdmin && <span className="read-only-label"> (read-only)</span>}
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      disabled={!isAdmin}
                      className={!isAdmin ? 'input-disabled' : ''}
                    />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <div className="role-display">
                      <span className={`role-badge role-${user?.role?.toLowerCase()}`}>
                        {user?.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="profile-actions">
                  <button className="btn-primary" onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="btn-cancel" onClick={handleCancel} disabled={loading}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <div className="profile-form password-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>

                <div className="profile-actions">
                  <button className="btn-primary" onClick={handlePasswordChange} disabled={loading}>
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                  <button className="btn-cancel" onClick={handleCancel} disabled={loading}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
