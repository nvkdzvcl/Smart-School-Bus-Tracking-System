// API functions để làm việc với bus stops

export interface BusStop {
  id?: string
  name: string
  address: string
  latitude: number
  longitude: number
  placeId?: string
  formattedAddress?: string
  googleMapsUrl?: string
}

// Lấy tất cả điểm dừng
export const getAllBusStops = async (): Promise<BusStop[]> => {
  try {
    const response = await fetch('/api/bus-stops')
    if (!response.ok) throw new Error('Failed to fetch bus stops')
    return await response.json()
  } catch (error) {
    console.error('Error fetching bus stops:', error)
    return []
  }
}

// Tạo điểm dừng mới
export const createBusStop = async (stop: Omit<BusStop, 'id'>): Promise<BusStop> => {
  try {
    const response = await fetch('/api/bus-stops', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stop)
    })
    
    if (!response.ok) throw new Error('Failed to create bus stop')
    return await response.json()
  } catch (error) {
    console.error('Error creating bus stop:', error)
    throw error
  }
}

// Cập nhật điểm dừng
export const updateBusStop = async (id: string, stop: Partial<BusStop>): Promise<BusStop> => {
  try {
    const response = await fetch(`/api/bus-stops/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stop)
    })
    
    if (!response.ok) throw new Error('Failed to update bus stop')
    return await response.json()
  } catch (error) {
    console.error('Error updating bus stop:', error)
    throw error
  }
}

// Xóa điểm dừng
export const deleteBusStop = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`/api/bus-stops/${id}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) throw new Error('Failed to delete bus stop')
  } catch (error) {
    console.error('Error deleting bus stop:', error)
    throw error
  }
}

// Tìm điểm dừng gần nhất
export const findNearestBusStops = async (
  latitude: number, 
  longitude: number, 
  radiusKm: number = 1
): Promise<BusStop[]> => {
  try {
    const response = await fetch(
      `/api/bus-stops/nearby?lat=${latitude}&lng=${longitude}&radius=${radiusKm}`
    )
    if (!response.ok) throw new Error('Failed to find nearby bus stops')
    return await response.json()
  } catch (error) {
    console.error('Error finding nearby bus stops:', error)
    return []
  }
}

// Geocoding - Chuyển địa chỉ thành tọa độ
export const geocodeAddress = async (address: string): Promise<{lat: number, lng: number} | null> => {
  try {
    const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`)
    if (!response.ok) throw new Error('Failed to geocode address')
    const data = await response.json()
    return data.coordinates
  } catch (error) {
    console.error('Error geocoding address:', error)
    return null
  }
}

// Reverse Geocoding - Chuyển tọa độ thành địa chỉ
export const reverseGeocode = async (latitude: number, longitude: number): Promise<string | null> => {
  try {
    const response = await fetch(`/api/reverse-geocode?lat=${latitude}&lng=${longitude}`)
    if (!response.ok) throw new Error('Failed to reverse geocode')
    const data = await response.json()
    return data.address
  } catch (error) {
    console.error('Error reverse geocoding:', error)
    return null
  }
}