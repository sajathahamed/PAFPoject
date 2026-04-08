import api from './axios'

export async function fetchTickets(status = 'ALL') {
  const res = await api.get('/api/technician/tickets', { params: { status } })
  return res.data
}

export async function updateTicketStatus(ticketId, status, resolutionNote = '') {
  const body = { status }
  if (resolutionNote.trim()) {
    body.resolutionNote = resolutionNote.trim()
  }
  const res = await api.put(`/api/technician/tickets/${ticketId}/status`, body)
  return res.data
}
