import axiosInstance from './axiosInstance'

export const getResources = async (filters = {}) => {
  const { type, minCapacity, location } = filters
  const params = new URLSearchParams()
  if (type) params.append('type', type)
  if (minCapacity) params.append('minCapacity', minCapacity)
  if (location) params.append('location', location)

  const response = await axiosInstance.get(`/resources?${params.toString()}`)
  return response.data
}

export const getResourceById = async (id) => {
  const response = await axiosInstance.get(`/resources/${id}`)
  return response.data
}

export const createResource = async (data) => {
  const response = await axiosInstance.post('/resources', data)
  return response.data
}

export const updateResource = async (id, data) => {
  const response = await axiosInstance.put(`/resources/${id}`, data)
  return response.data
}

export const deleteResource = async (id) => {
  const response = await axiosInstance.delete(`/resources/${id}`)
  return response.data
}

export const updateResourceStatus = async (id, status) => {
  const response = await axiosInstance.patch(`/resources/${id}/status?status=${status}`)
  return response.data
}
