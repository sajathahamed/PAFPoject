import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateProfile, changePassword, uploadProfilePicture } from '../api/profile'

export default function ProfilePage() {
  const { user, checkAuth } = useAuth()
  const [isEditMode, setIsEditMode] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const isAdmin = user?.role === 'ADMIN'

  async function handleSaveProfile() {
    try {
      setError('')
      setSuccess('')
      setLoading(true)

      if (!formData.name.trim()) {
        setError('Name cannot be empty')
        return
      }

      if (!isAdmin && user?.email !== formData.email) {
        setError('You cannot change your email')
        return
      }

      await updateProfile(formData.name, formData.email)
      await checkAuth()
      setSuccess('Profile updated successfully!')
      setIsEditMode(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  async function handleChangePassword() {
    try {
      setError('')
      setSuccess('')

      if (!passwordForm.oldPassword) {
        setError('Current password is required')
        return
      }

      if (!passwordForm.newPassword) {
        setError('New password is required')
        return
      }

      if (passwordForm.newPassword.length < 8) {
        setError('New password must be at least 8 characters')
        return
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setError('Passwords do not match')
        return
      }

      setLoading(true)
      await changePassword(passwordForm.oldPassword, passwordForm.newPassword)
      setSuccess('Password changed successfully!')
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordForm(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  function handleCancel() {
    setIsEditMode(false)
    setShowPasswordForm(false)
    setFormData({ name: user?.name || '', email: user?.email || '' })
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    setError('')
  }

  async function handlePictureUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    try {
      setError('')
      setLoading(true)
      
      const reader = new FileReader()
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
      })
      reader.readAsDataURL(file)
      const base64 = await base64Promise
      
      const result = await uploadProfilePicture(base64)
      if (result.picture) {
        await checkAuth()
        setSuccess('Profile picture updated!')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to upload picture')
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="container" style={{ paddingTop: '24px' }}>
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account information</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="profile-picture-section">
          <div className="profile-picture-circle">
            {user?.picture ? (
              <img src={user.picture} alt="Profile" />
            ) : (
              <div className="picture-placeholder-circle">
                {user?.name?.[0] || '?'}
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handlePictureUpload}
            style={{ display: 'none' }}
          />
          <button
            className="btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            style={{ marginTop: '12px' }}
          >
            Change Photo
          </button>
        </div>

        {!isEditMode && !showPasswordForm && (
          <div className="profile-details-view">
            <div className="profile-detail-row">
              <span className="profile-detail-label">Full Name</span>
              <span className="profile-detail-value">{user?.name || 'N/A'}</span>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">Email Address</span>
              <span className="profile-detail-value">{user?.email || 'N/A'}</span>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">User Role</span>
              <span className={`badge badge-${user?.role?.toLowerCase()}`}>
                {user?.role || 'N/A'}
              </span>
            </div>
          </div>
        )}

        {isEditMode && !showPasswordForm && (
          <div className="profile-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Email Address {!isAdmin && <span style={{ fontWeight: 'normal', color: '#999' }}>(read-only)</span>}
              </label>
              <input
                type="email"
                className={`form-input ${!isAdmin ? 'form-input-disabled' : ''}`}
                value={formData.email}
                onChange={(e) => isAdmin && setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                disabled={!isAdmin || loading}
              />
            </div>
          </div>
        )}

        {showPasswordForm && !isEditMode && (
          <div className="profile-form">
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                placeholder="Enter your current password"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password (min 8 characters)</label>
              <input
                type="password"
                className="form-input"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Enter new password"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                disabled={loading}
              />
            </div>
          </div>
        )}

        <div className="profile-actions-row">
          {!isEditMode && !showPasswordForm && (
            <>
              <button className="btn btn-primary" onClick={() => setIsEditMode(true)}>
                Edit Profile
              </button>
              <button className="btn btn-secondary" onClick={() => setShowPasswordForm(true)}>
                Change Password
              </button>
            </>
          )}

          {isEditMode && (
            <>
              <button className="btn btn-primary" onClick={handleSaveProfile} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button className="btn btn-secondary" onClick={handleCancel} disabled={loading}>
                Cancel
              </button>
            </>
          )}

          {showPasswordForm && (
            <>
              <button className="btn btn-primary" onClick={handleChangePassword} disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
              <button className="btn btn-secondary" onClick={handleCancel} disabled={loading}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}