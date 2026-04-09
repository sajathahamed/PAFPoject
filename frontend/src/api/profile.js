import api from './axiosInstance'

export async function updateProfile(name, email) {
  const res = await api.put('/auth/profile', { name, email })
  return res.data
}

export async function uploadProfilePicture(picture) {
  const res = await api.put('/auth/profile-picture', { picture })
  return res.data
}

export async function changePassword(oldPassword, newPassword) {
  const res = await api.post('/auth/change-password', {
    oldPassword,
    newPassword
  })
  return res.data
}