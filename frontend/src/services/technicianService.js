import axiosInstance from '../api/axiosInstance';

/**
 * Technician Service - Handles all technician-related API calls
 * 
 * API Endpoints:
 * - GET /api/technician/tickets - List all tickets
 * - PUT /api/technician/tickets/:id/status - Update ticket status
 * - POST /api/technician/tickets/:id/comments - Add comment
 * - POST /api/technician/tickets/:id/images - Add images to ticket
 * - DELETE /api/technician/tickets/:id/images/:imageIndex - Delete image from ticket
 */

const technicianService = {
  /**
   * Fetch all tickets for technician
   * @returns {Promise<Array>} List of ticket objects
   */
  getAllTickets: async () => {
    const response = await axiosInstance.get('/technician/tickets');
    return response.data;
  },

  /**
   * Fetch tickets by status
   * @param {string} status - OPEN, IN_PROGRESS, RESOLVED, CLOSED
   * @returns {Promise<Array>} List of filtered tickets
   */
  getTicketsByStatus: async (status) => {
    const response = await axiosInstance.get(`/technician/tickets?status=${status}`);
    return response.data;
  },

  /**
   * Get single ticket details
   * @param {string} ticketId - Ticket ID
   * @returns {Promise<Object>} Ticket details
   */
  getTicketById: async (ticketId) => {
    const response = await axiosInstance.get(`/technician/tickets/${ticketId}`);
    return response.data;
  },

  /**
   * Update ticket status
   * @param {string} ticketId - Ticket ID
   * @param {string} status - New status: OPEN, IN_PROGRESS, RESOLVED, CLOSED
   * @returns {Promise<Object>} Updated ticket
   */
  updateTicketStatus: async (ticketId, status) => {
    const response = await axiosInstance.put(`/technician/tickets/${ticketId}/status`, {
      status
    });
    return response.data;
  },

  /**
   * Add comment to a ticket
   * @param {string} ticketId - Ticket ID
   * @param {string} content - Comment content
   * @returns {Promise<Object>} Created comment
   */
  addComment: async (ticketId, content) => {
    const response = await axiosInstance.post(`/technician/tickets/${ticketId}/comments`, {
      content
    });
    return response.data;
  },

  /**
   * Get comments for a ticket
   * @param {string} ticketId - Ticket ID
   * @returns {Promise<Array>} List of comments
   */
  getComments: async (ticketId) => {
    const response = await axiosInstance.get(`/technician/tickets/${ticketId}/comments`);
    return response.data;
  },

  /**
   * Add images to a ticket (multipart form data)
   * @param {string} ticketId - Ticket ID
   * @param {File[]} images - Array of image files
   * @returns {Promise<Object>} Updated ticket with images
   */
  addImages: async (ticketId, images) => {
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append('images', image);
    });
    const response = await axiosInstance.post(
      `/technician/tickets/${ticketId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },

  /**
   * Delete image from ticket
   * @param {string} ticketId - Ticket ID
   * @param {number} imageIndex - Index of image to delete
   * @returns {Promise<Object>} Updated ticket
   */
  deleteImage: async (ticketId, imageIndex) => {
    const response = await axiosInstance.delete(
      `/technician/tickets/${ticketId}/images/${imageIndex}`
    );
    return response.data;
  },

  /**
   * Assign ticket to technician (self-assign)
   * @param {string} ticketId - Ticket ID
   * @returns {Promise<Object>} Updated ticket
   */
  assignToSelf: async (ticketId) => {
    const response = await axiosInstance.put(`/technician/tickets/${ticketId}/assign`);
    return response.data;
  }
};

export default technicianService;
