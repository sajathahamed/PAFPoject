import api from './axiosInstance'

export async function updateProfile(name, email) {
<<<<<<< HEAD
  const res = await api.put('/api/users/profile', { name, email })
  return res.data
}

export async function uploadProfilePicture(base64Image) {
  const res = await api.put('/api/users/profile-picture', { picture: base64Image })
=======
  const res = await api.put('/auth/profile', { name, email })
  return res.data
}

export async function uploadProfilePicture(picture) {
  const res = await api.put('/auth/profile-picture', { picture })
>>>>>>> bd701d76c6f9bee465cf19d54b5d81dd77e597aa
  return res.data
}

export async function changePassword(oldPassword, newPassword) {
<<<<<<< HEAD
  const res = await api.post('/api/users/change-password', {
=======
  const res = await api.post('/auth/change-password', {
>>>>>>> bd701d76c6f9bee465cf19d54b5d81dd77e597aa
    oldPassword,
    newPassword
  })
  return res.data
<<<<<<< HEAD
}
=======
}
>>>>>>> bd701d76c6f9bee465cf19d54b5d81dd77e597aa
