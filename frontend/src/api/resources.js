import api from './axios'

export async function fetchResources(params = {}) {
  const res = await api.get('/api/resources', { params })
  return res.data
}

export async function fetchResourceById(id) {
  const res = await api.get(`/api/resources/${id}`)
  return res.data
}

export async function createResource(payload) {
  const res = await api.post('/api/resources', payload)
  return res.data
}

export async function updateResource(id, payload) {
  const res = await api.put(`/api/resources/${id}`, payload)
  return res.data
}

export async function deleteResource(id) {
  await api.delete(`/api/resources/${id}`)
}

export async function patchResourceStatus(id, status) {
  const res = await api.patch(`/api/resources/${id}/status`, { status })
  return res.data
}

