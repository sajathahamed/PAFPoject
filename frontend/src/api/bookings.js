import api from './axiosInstance'

export async function checkBookingConflict(resourceId, start, end) {
  const res = await api.get('/bookings/conflict', {
    params: { resourceId, start, end }
  })
  return res.data
}

export async function createBooking(payload) {
  const res = await api.post('/bookings', payload)
  return res.data
}

export async function createRecurringBooking(payload) {
  const res = await api.post('/bookings/recurring', payload)
  return res.data
}

export async function listBookingResources() {
  const res = await api.get('/bookings/resources')
  return res.data
}

export async function listMyBookings() {
  const res = await api.get('/bookings/my')
  return res.data
}

export async function getBooking(id) {
  const res = await api.get(`/bookings/${id}`)
  return res.data
}

export async function cancelBooking(id) {
  const res = await api.put(`/bookings/${id}/cancel`)
  return res.data
}

export async function approveBooking(id) {
  const res = await api.put(`/bookings/${id}/approve`)
  return res.data
}

export async function rejectBooking(id, reason) {
  const res = await api.put(`/bookings/${id}/reject`, { reason })
  return res.data
}

export async function adminListBookings(filters = {}) {
  const params = {}
  if (filters.status) params.status = filters.status
  if (filters.userQuery) params.userQuery = filters.userQuery
  if (filters.resourceQuery) params.resourceQuery = filters.resourceQuery
  const res = await api.get('/admin/bookings', { params })
  return res.data
}

