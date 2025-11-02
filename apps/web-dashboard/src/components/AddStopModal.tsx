import { useState } from 'react'
import { X } from 'lucide-react'
import StopPicker from './StopPicker'
import { createBusStop } from '../api/busStops'

interface BusStop {
  id?: string
  name: string
  address: string
  latitude: number
  longitude: number
  placeId?: string
  formattedAddress?: string
}

interface AddStopModalProps {
  isOpen: boolean
  onClose: () => void
  onStopAdded: (stop: BusStop) => void
}

export default function AddStopModal({ isOpen, onClose, onStopAdded }: AddStopModalProps) {
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null)
  const [customName, setCustomName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleStopSelected = (stop: BusStop) => {
    setSelectedStop(stop)
    setCustomName(stop.name)
  }

  const handleSave = async () => {
    if (!selectedStop) return

    setIsLoading(true)
    try {
      const stopToSave = {
        ...selectedStop,
        name: customName || selectedStop.name
      }

      const savedStop = await createBusStop(stopToSave)
      onStopAdded(savedStop)
      onClose()
      
      // Reset form
      setSelectedStop(null)
      setCustomName('')
    } catch (error) {
      console.error('Error saving bus stop:', error)
      alert('Có lỗi xảy ra khi lưu điểm dừng')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Thêm điểm dừng mới</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Google Places Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm địa điểm
            </label>
            <StopPicker onStopSelected={handleStopSelected} />
          </div>

          {/* Selected Stop Info */}
          {selectedStop && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-2">Địa điểm đã chọn:</h4>
              <p className="text-sm text-gray-600 mb-2">{selectedStop.address}</p>
              <p className="text-xs text-gray-500">
                Tọa độ: {selectedStop.latitude.toFixed(6)}, {selectedStop.longitude.toFixed(6)}
              </p>
            </div>
          )}

          {/* Custom Name */}
          {selectedStop && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên điểm dừng
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Nhập tên điểm dừng..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={isLoading}
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedStop || isLoading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang lưu...' : 'Lưu điểm dừng'}
          </button>
        </div>
      </div>
    </div>
  )
}