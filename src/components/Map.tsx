import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, Navigation, Info, Phone, Clock, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers';

// Fix for default marker icon in Leaflet + React using CDN
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom marker icon for pad locations
const padIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2859/2859706.png', // A heart or pad-like icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface Location {
  id: string;
  name: string;
  address: string;
  type: 'School' | 'NGO' | 'Community Center' | 'Health Center';
  lat: number;
  lng: number;
  phone?: string;
  hours?: string;
  description: string;
}

const MOCK_LOCATIONS: Location[] = [
  {
    id: 'fct-special-needs',
    name: 'FCT School for Children with Special Needs',
    address: 'GGSSS Road, Paseli, Kuje, Abuja',
    type: 'School',
    lat: 8.8786,
    lng: 7.2276,
    phone: '08051070352 (Mrs. Musili Yusuf Ayinla)',
    hours: 'Day & Boarding',
    description: 'Government-owned primary school specializing in support for intellectually challenged children. Located along GGSSS Road.'
  },
  {
    id: 'school-deaf',
    name: 'FCT School for the Deaf',
    address: 'Kuje-Gwagwalada Road, Paseli, Kuje, Abuja',
    type: 'School',
    lat: 8.8850,
    lng: 7.2350,
    phone: '08055270565 (Onoja John Edache) / 0803 628 6622',
    hours: 'Day & Boarding (Closes 4:00 PM)',
    description: 'Government-owned institution for students with hearing impairments. Menstrual hygiene support provided by partners like Sus Pads.'
  },
  {
    id: 'jabbi-blind',
    name: 'FCT School for the Blind Children',
    address: '12 Asheik Jarma Street, Jabi, Abuja',
    type: 'School',
    lat: 9.0617,
    lng: 7.4244,
    phone: '+234 805 294 4449',
    hours: 'Day & Boarding',
    description: 'Government-owned school catering to students with visual impairments. Located near No. 15 Audu Ogbe Street.'
  }
];

// Component to center map on selection
const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  map.setView(center, 14);
  return null;
};

interface PadLocatorProps {
  onRequestPad: (location: Location) => void;
}

const PadLocator: React.FC<PadLocatorProps> = ({ onRequestPad }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([9.0579, 7.4951]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'locations'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const locsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Location));
      if (locsData.length > 0) {
        setLocations(locsData);
      } else {
        setLocations(MOCK_LOCATIONS);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'locations');
      setLocations(MOCK_LOCATIONS);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(coords);
          setMapCenter(coords);
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
          // Fallback to a default location (e.g., Abuja) if geolocation fails
          setMapCenter([9.0617, 7.4244]);
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    }
  }, []);

  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-brand-400">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Search for locations nearby..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-brand-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
        />
      </div>

      {/* Header Image / Map Section */}
      <div className="h-[300px] rounded-3xl overflow-hidden shadow-sm border border-brand-100 z-0 relative bg-brand-100">
        {!selectedLocation ? (
          <div className="w-full h-full relative group">
            <img 
              src="/images/Pad Bank.jpeg" 
              alt="Pad Bank Locations" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900/40 to-transparent flex items-end p-6">
              <div className="text-white">
                <h3 className="text-xl font-bold">Find a Pad Bank</h3>
                <p className="text-sm opacity-90">Select a location below to see it on the map</p>
              </div>
            </div>
            {/* Note: Replace the src above with the user provided image */}
          </div>
        ) : (
          <MapContainer 
            center={[selectedLocation.lat, selectedLocation.lng]} 
            zoom={14} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {userLocation && (
              <Marker position={userLocation}>
                <Popup>You are here</Popup>
              </Marker>
            )}
            <Marker 
              position={[selectedLocation.lat, selectedLocation.lng]}
              icon={padIcon}
            >
              <Popup>
                <div className="p-1">
                  <p className="font-bold text-brand-900">{selectedLocation.name}</p>
                  <p className="text-xs text-brand-600">{selectedLocation.address}</p>
                </div>
              </Popup>
            </Marker>
            <ChangeView center={[selectedLocation.lat, selectedLocation.lng]} />
          </MapContainer>
        )}
      </div>

      {/* Location List / Details */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {selectedLocation ? (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button 
              onClick={() => setSelectedLocation(null)}
              className="mb-4 text-brand-500 text-sm font-bold flex items-center gap-1"
            >
              <ChevronLeft size={16} /> Back to list
            </button>
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="inline-block px-2 py-1 bg-brand-50 text-brand-600 text-[10px] font-bold uppercase rounded-lg mb-2">
                  {selectedLocation.type}
                </span>
                <h3 className="text-xl font-bold text-brand-900">{selectedLocation.name}</h3>
                <p className="text-brand-500 text-sm flex items-center gap-1 mt-1">
                  <MapPin size={14} /> {selectedLocation.address}
                </p>
              </div>
              <button className="p-3 bg-brand-600 text-white rounded-2xl shadow-lg shadow-brand-200">
                <Navigation size={20} />
              </button>
            </div>

            <div className="space-y-4 mt-6 pt-6 border-t border-brand-50">
              <div className="flex items-start gap-3">
                <Info size={18} className="text-brand-400 mt-1" />
                <p className="text-sm text-brand-700 leading-relaxed">
                  {selectedLocation.description}
                </p>
              </div>
              {selectedLocation.phone && (
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-brand-400" />
                  <p className="text-sm text-brand-700 font-medium">{selectedLocation.phone}</p>
                </div>
              )}
              {selectedLocation.hours && (
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-brand-400" />
                  <p className="text-sm text-brand-700">{selectedLocation.hours}</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => onRequestPad(selectedLocation)}
              className="w-full mt-8 py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-200 flex items-center justify-center gap-2 hover:bg-brand-700 transition-colors"
            >
              <Heart size={18} fill="currentColor" />
              Request Pad
            </button>
          </div>
        ) : (
          filteredLocations.map(loc => (
            <div 
              key={loc.id}
              onClick={() => setSelectedLocation(loc)}
              className="bg-white p-5 rounded-3xl shadow-sm border border-brand-100 flex items-center justify-between hover:border-brand-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-50 text-brand-500 rounded-2xl flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-brand-900">{loc.name}</h4>
                  <p className="text-xs text-brand-500">{loc.address}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-brand-300 group-hover:text-brand-500 transition-colors" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PadLocator;
