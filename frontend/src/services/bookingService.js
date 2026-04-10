import axiosInstance from '../api/axiosInstance';

const bookingService = {
  checkConflict: async (resourceId, start, end, excludeBookingId) => {
    const params = { resourceId, start, end };
    if (excludeBookingId) params.excludeBookingId = excludeBookingId;
    const { data } = await axiosInstance.get('/bookings/conflict', { params });
    return data;
  },

  create: async (payload) => {
    const { data } = await axiosInstance.post('/bookings', payload);
    return data;
  },

  createRecurring: async (payload) => {
    const { data } = await axiosInstance.post('/bookings/recurring', payload);
    return data;
  },

  getMy: async () => {
    const { data } = await axiosInstance.get('/bookings/my');
    return data;
  },

  getOne: async (id) => {
    const { data } = await axiosInstance.get(`/bookings/${id}`);
    return data;
  },

  update: async (id, payload) => {
    const { data } = await axiosInstance.put(`/bookings/${id}`, payload);
    return data;
  },

  remove: async (id) => {
    await axiosInstance.delete(`/bookings/${id}`);
  },

  approve: async (id) => {
    const { data } = await axiosInstance.put(`/bookings/${id}/approve`);
    return data;
  },

  reject: async (id, reason) => {
    const { data } = await axiosInstance.put(`/bookings/${id}/reject`, { reason });
    return data;
  },

  cancel: async (id, reason) => {
    const { data } = await axiosInstance.put(`/bookings/${id}/cancel`, reason ? { reason } : {});
    return data;
  },

  listResources: async () => {
    const { data } = await axiosInstance.get('/resources');
    return data;
  },

  adminList: async (params) => {
    const { data } = await axiosInstance.get('/admin/bookings', { params });
    return data;
  },

  bulkApprove: async (ids) => {
    const { data } = await axiosInstance.post('/admin/bookings/bulk-approve', { ids });
    return data;
  },

  bulkReject: async (ids, reason) => {
    const { data } = await axiosInstance.post('/admin/bookings/bulk-reject', { ids, reason });
    return data;
  },
};

export default bookingService;
