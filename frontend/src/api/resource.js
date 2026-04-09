import api from './axios'

export const getResources = async (filters = {}) => {
  const { type, minCapacity, location } = filters
  const params = new URLSearchParams()
  if (type) params.append('type', type)
  if (minCapacity) params.append('minCapacity', minCapacity)
  if (location) params.append('location', location)

  const response = await api.get(`/api/resources?${params.toString()}`)
  return response.data
}

export const getResourceById = async (id) => {
  const response = await api.get(`/api/resources/${id}`)
  return response.data
}

export const createResource = async (data) => {
  const response = await api.post('/api/resources', data)
  return response.data
}

export const updateResource = async (id, data) => {
  const response = await api.put(`/api/resources/${id}`, data)
  return response.data
}

export const deleteResource = async (id) => {
  const response = await api.delete(`/api/resources/${id}`)
  return response.data
}

export const updateResourceStatus = async (id, status) => {
  const response = await api.patch(`/api/resources/${id}/status?status=${status}`)
  return response.data
}
