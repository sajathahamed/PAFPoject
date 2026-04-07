import api from './axiosInstance'

export async function updateProfile(name, email) {
  const res = await api.put('/api/users/profile', { name, email })
  return res.data
}

export async function uploadProfilePicture(base64Image) {
  const res = await api.put('/api/users/profile-picture', { picture: base64Image })
  return res.data
}

export async function changePassword(oldPassword, newPassword) {
  const res = await api.post('/api/users/change-password', {
    oldPassword,
    newPassword
  })
  return res.data
}
