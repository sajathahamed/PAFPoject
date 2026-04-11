import axiosInstance from './axiosInstance';

export const bookingAPI = {
  getAll: () => axiosInstance.get('/bookings/my'),
  getById: (id) => axiosInstance.get(`/bookings/${id}`),
  getUserBookings: () => axiosInstance.get('/bookings/my'),
  getForApproval: () => axiosInstance.get('/admin/bookings'),
  create: (booking) => axiosInstance.post('/bookings', booking),
  update: () => Promise.reject(new Error('Booking update endpoint is not supported')),
  approve: (id) => axiosInstance.put(`/bookings/${id}/approve`),
  reject: (id, reason) => axiosInstance.put(`/bookings/${id}/reject`, { reason }),
  cancel: (id) => axiosInstance.put(`/bookings/${id}/cancel`),
  delete: () => Promise.reject(new Error('Booking delete endpoint is not supported')),
  checkConflicts: (resourceId, start, end) =>
    axiosInstance.get('/bookings/conflict', { params: { resourceId, start, end } })
};