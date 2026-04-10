import api from './axios'

export async function getProfile() {
  const res = await api.get('/api/admin/users/profile')
  return res.data
}

export async function updateProfile(data) {
  const res = await api.put('/api/admin/users/profile', data)
  return res.data
}

export async function changePassword(currentPassword, newPassword) {
  const res = await api.post('/api/admin/users/change-password', {
    currentPassword,
    newPassword
  })
  return res.data
}
