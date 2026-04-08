import axios from './axios';

export const bookingAPI = {
  getAll: () => axios.get('/api/bookings'),
  getById: (id) => axios.get(`/api/bookings/${id}`),
  getUserBookings: (userId) => axios.get(`/api/bookings/user/${userId}`),
  getForApproval: (assignedTo) => axios.get(`/api/bookings/approval/${assignedTo}`),
  create: (booking) => axios.post('/api/bookings', booking),
  update: (id, booking) => axios.put(`/api/bookings/${id}`, booking),
  approve: (id) => axios.post(`/api/bookings/${id}/approve`),
  reject: (id, reason) => axios.post(`/api/bookings/${id}/reject`, { reason }),
  cancel: (id) => axios.post(`/api/bookings/${id}/cancel`),
  delete: (id) => axios.delete(`/api/bookings/${id}`),
  checkConflicts: (resource, startTime, endTime) =>
    axios.get('/api/bookings/conflicts', { params: { resource, startTime, endTime } }),
  createRecurring: (booking) => axios.post('/api/bookings/recurring', booking)
};