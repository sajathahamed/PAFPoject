import axiosInstance from '../api/axiosInstance';

const notificationService = {
  /**
   * @param {{ isRead?: boolean }} [params] - omit for all; false = unread only; true = read only
   */
  getNotifications: async (params = {}) => {
    const search = new URLSearchParams();
    if (params.isRead === true || params.isRead === false) {
      search.set('isRead', String(params.isRead));
    }
    const q = search.toString();
    const url = q ? `/notifications?${q}` : '/notifications';
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await axiosInstance.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await axiosInstance.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await axiosInstance.put('/notifications/read-all');
    return response.data;
  },
};

export default notificationService;
