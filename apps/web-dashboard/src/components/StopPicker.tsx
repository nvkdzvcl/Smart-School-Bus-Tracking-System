import { useState, useEffect, useRef } from 'react'
import { MapPin, Search } from 'lucide-react'

interface BusStop {
  id?: string
  name: string
  address: string
  latitude: number
  longitude: number
  placeId?: string
  formattedAddress?: string
}

interface StopPickerProps {
  onStopSelected: (stop: BusStop) => void
  initialValue?: string
}

declare global {
  interface Window {
    google: any
  }
}

export default function StopPicker({ onStopSelected, initialValue = '' }: StopPickerProps) {
  const [searchValue, setSearchValue] = useState(initialValue)
  const [isLoading, setIsLoading] = useState(false)
  const [predictions, setPredictions] = useState<any[]>([])
  const [showPredictions, setShowPredictions] = useState(false)
  
  const autocompleteService = useRef<any>(null)
  const placesService = useRef<any>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load Google Maps API nếu chưa có
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`
      script.async = true
      script.onload = initializeServices
      document.head.appendChild(script)
    } else {
      initializeServices()
    }
  }, [])

  const initializeServices = () => {
    if (window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService()
      
      // Tạo map ẩn để sử dụng PlacesService
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 10.8231, lng: 106.6297 }, // TP.HCM
        zoom: 13
      })
      placesService.current = new window.google.maps.places.PlacesService(map)
    }
  }

  const handleSearch = (value: string) => {
    setSearchValue(value)
    
    if (value.length > 2 && autocompleteService.current) {
      setIsLoading(true)
      
      const request = {
        input: value,
        componentRestrictions: { country: 'vn' }, // Chỉ tìm ở Việt Nam
        types: ['establishment', 'geocode'] // Các loại địa điểm
      }

      autocompleteService.current.getPlacePredictions(request, (predictions: any[], status: any) => {
        setIsLoading(false)
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setPredictions(predictions)
          setShowPredictions(true)
        } else {
          setPredictions([])
          setShowPredictions(false)
        }
      })
    } else {
      setPredictions([])
      setShowPredictions(false)
    }
  }

  const handleSelectPlace = (prediction: any) => {
    setIsLoading(true)
    setShowPredictions(false)
    setSearchValue(prediction.description)

    // Lấy chi tiết địa điểm
    const request = {
      placeId: prediction.place_id,
      fields: ['name', 'formatted_address', 'geometry', 'place_id', 'url']
    }

    placesService.current.getDetails(request, (place: any, status: any) => {
      setIsLoading(false)
      
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        const busStop: BusStop = {
          name: place.name || prediction.structured_formatting.main_text,
          address: prediction.description,
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
          placeId: place.place_id,
          formattedAddress: place.formatted_address
        }
        
        onStopSelected(busStop)
      }
    })
  }

  return (
    <div className="relative">
      {/* Hidden map for PlacesService */}
      <div ref={mapRef} style={{ display: 'none' }} />
      
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Tìm kiếm địa điểm trên Google Maps..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          </div>
        )}
      </div>

      {/* Predictions Dropdown */}
      {showPredictions && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              onClick={() => handleSelectPlace(prediction)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">
                    {prediction.structured_formatting.main_text}
                  </p>
                  <p className="text-sm text-gray-600">
                    {prediction.structured_formatting.secondary_text}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}