'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  MapPin, Navigation, AlertCircle, Search, 
  ArrowRight, Bookmark, BookmarkCheck, Loader2,
  Home, Star, Info, Trash2, Map as MapIcon,
  CheckCircle2, Compass
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import SaveLocationModal from '@/components/map/SaveLocationModal';
import AdvancedMarker from '@/components/map/AdvancedMarker';
import { SavedLocation } from '@/types/user';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '2.5rem'
};
const GOOGLE_MAP_LIBRARIES: ("marker")[] = ['marker'];

interface Booth {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distance: number;
  boothNumber: number;
  crowdLevel: 'Low' | 'Medium' | 'High';
  isRecommended?: boolean;
  address: string;
}

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const generateMockBooths = (lat: number, lng: number): Booth[] => {
  const booths: Booth[] = [
    { id: '1', name: 'Govt. Primary School, Sector 12', lat: lat + 0.005, lng: lng + 0.005, address: 'Sector 12 Main Road', boothNumber: 45, crowdLevel: 'Low', distance: 0 },
    { id: '2', name: 'Community Hall, Green Park', lat: lat - 0.008, lng: lng + 0.012, address: 'Green Park Extension', boothNumber: 46, crowdLevel: 'High', distance: 0 },
    { id: '3', name: 'Municipal College', lat: lat + 0.015, lng: lng - 0.007, address: 'College Road', boothNumber: 88, crowdLevel: 'Medium', distance: 0 },
    { id: '4', name: 'Public Library, Phase 2', lat: lat - 0.003, lng: lng - 0.015, address: 'Phase 2 Market', boothNumber: 12, crowdLevel: 'Low', distance: 0 },
    { id: '5', name: 'City Sports Complex', lat: lat + 0.012, lng: lng + 0.018, address: 'Sports Avenue', boothNumber: 105, crowdLevel: 'Medium', distance: 0 },
  ];

  let recommendedId = '';
  let minScore = Infinity;

  booths.forEach(b => {
    b.distance = parseFloat(getDistance(lat, lng, b.lat, b.lng).toFixed(1));
    const crowdScore = b.crowdLevel === 'Low' ? 1 : b.crowdLevel === 'Medium' ? 2 : 3;
    const score = b.distance * crowdScore;
    if (score < minScore) {
      minScore = score;
      recommendedId = b.id;
    }
  });

  return booths.map(b => ({ ...b, isRecommended: b.id === recommendedId })).sort((a, b) => a.distance - b.distance);
};

export default function MapPage() {
  const { t } = useLanguage();
  const { user, userData, removeLocation, setDefaultLocation } = useAuth();
  
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'booths' | 'saved'>('booths');
  
  const [booths, setBooths] = useState<Booth[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<Booth | SavedLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveModalData, setSaveModalData] = useState<{ isOpen: boolean; data: any }>({ isOpen: false, data: null });
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAP_LIBRARIES
  });

  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    // If user has a default location, use it initially
    if (userData?.savedLocations) {
      const defaultLoc = userData.savedLocations.find(l => l.isDefault);
      if (defaultLoc && !location) {
        const boothLoc = { lat: defaultLoc.lat, lng: defaultLoc.lng };
        setLocation(boothLoc);
        setBooths(generateMockBooths(boothLoc.lat, boothLoc.lng));
      }
    }
  }, [userData]);

  const onLoad = useCallback(function callback(mapInstance: any) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const requestLocation = () => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLoc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setLocation(newLoc);
        setBooths(generateMockBooths(newLoc.lat, newLoc.lng));
        setLoading(false);
        if (map) map.panTo(newLoc);
      },
      () => {
        setError('Unable to retrieve location');
        setLoading(false);
      }
    );
  };

  const filteredBooths = useMemo(() => {
    return booths.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.address.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [booths, searchQuery]);

  const filteredSaved = useMemo(() => {
    return (userData?.savedLocations || []).filter(l => l.label.toLowerCase().includes(searchQuery.toLowerCase()) || l.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [userData?.savedLocations, searchQuery]);

  const handlePointSelect = (point: Booth | SavedLocation) => {
    setSelectedPoint(point);
    if (map) {
      map.panTo({ lat: point.lat, lng: point.lng });
      map.setZoom(16);
    }
  };

  const isPointSaved = (lat: number, lng: number) => {
    return userData?.savedLocations.some(l => l.lat === lat && l.lng === lng);
  };

  return (
    <div className="lg:h-[calc(100vh-7rem)] min-h-screen w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col relative z-10">
      
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight">
            {t('map.title')}
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 font-medium">{t('map.subtitle')}</p>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl w-fit border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('booths')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'booths' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-md' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Nearest Booths
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'saved' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-md' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Saved Locations {(userData?.savedLocations?.length || 0) > 0 && <span className="bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full text-[10px]">{userData?.savedLocations.length}</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 relative w-full lg:min-h-0">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-[420px] flex flex-col gap-4 z-10 lg:h-full lg:min-h-0 flex-shrink-0">
          
          <div className="flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-3xl rounded-[2.5rem] p-6 shadow-2xl border border-white dark:border-gray-800">
            <div className="flex gap-2 mb-5">
              <button
                onClick={requestLocation}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-2xl text-white font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                {t('map.findNearest')}
              </button>
            </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder={activeTab === 'booths' ? t('map.searchPlaceholder') : 'Search saved locations...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white font-medium"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-4 custom-scrollbar rounded-xl">
            <AnimatePresence mode="wait">
              {activeTab === 'booths' ? (
                <motion.div key="booths" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  {filteredBooths.length === 0 && (
                    <div className="p-10 text-center bg-white/50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                      <Compass className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">Use location to find booths nearby</p>
                    </div>
                  )}
                  {filteredBooths.map((booth, idx) => (
                    <motion.div
                      key={booth.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handlePointSelect(booth)}
                      className={`relative p-5 rounded-3xl cursor-pointer backdrop-blur-xl transition-all duration-300 border-2 ${
                        selectedPoint?.id === booth.id 
                          ? 'bg-white dark:bg-indigo-900/40 border-indigo-500 shadow-xl' 
                          : 'bg-white/60 dark:bg-gray-900/60 border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg dark:text-white">{booth.name}</h3>
                          {booth.isRecommended && <Star className="w-4 h-4 fill-amber-400 text-amber-400" />}
                        </div>
                        {user && (
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setSaveModalData({ isOpen: true, data: { ...booth, type: 'booth' } }); 
                            }}
                            className={`p-2 rounded-xl transition-all ${isPointSaved(booth.lat, booth.lng) ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-indigo-600'}`}
                          >
                            <Bookmark className={`w-5 h-5 ${isPointSaved(booth.lat, booth.lng) ? 'fill-current' : ''}`} />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-4">{booth.address}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold px-3 py-1 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg">
                          {booth.distance} km
                        </span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                          booth.crowdLevel === 'Low' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          booth.crowdLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {booth.crowdLevel} Crowd
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  {!user && (
                    <div className="p-8 text-center bg-indigo-50/50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800/50">
                      <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Sign in to save and manage locations</p>
                    </div>
                  )}
                  {user && filteredSaved.length === 0 && (
                    <div className="p-10 text-center bg-white/50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                      <Bookmark className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No saved locations yet</p>
                    </div>
                  )}
                  {filteredSaved.map((loc, idx) => (
                    <motion.div
                      key={loc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handlePointSelect(loc)}
                      className={`relative p-5 rounded-3xl cursor-pointer backdrop-blur-xl transition-all duration-300 border-2 ${
                        selectedPoint?.id === loc.id 
                          ? 'bg-white dark:bg-indigo-900/40 border-indigo-500 shadow-xl' 
                          : 'bg-white/60 dark:bg-gray-900/60 border-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {loc.type === 'home' ? <Home className="w-4 h-4 text-indigo-500" /> : <MapPin className="w-4 h-4 text-purple-500" />}
                          <h3 className="font-bold text-lg dark:text-white">{loc.label}</h3>
                          {loc.isDefault && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeLocation(loc.id); }}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">{loc.address}</p>
                      {loc.notes && <p className="text-xs text-gray-400 italic mb-4">"{loc.notes}"</p>}
                      
                      <div className="flex gap-2">
                        {!loc.isDefault && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setDefaultLocation(loc.id); }}
                            className="text-[10px] font-bold px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                          >
                            Set Default
                          </button>
                        )}
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-all"
                        >
                          <Navigation className="w-3.5 h-3.5" /> Directions
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 lg:h-full min-h-[500px] bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-2xl border border-white/40 dark:border-gray-800 relative"
        >
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={location || { lat: 20.5937, lng: 78.9629 }}
              zoom={location ? 14 : 5}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{
                disableDefaultUI: true,
                zoomControl: true,
                mapId: 'DEMO_MAP_ID', // Required for AdvancedMarkerElement
              }}
            >
              {location && (
                <AdvancedMarker 
                  map={map}
                  position={location} 
                  title="Your Location"
                />
              )}
              
              {booths.map(booth => (
                <AdvancedMarker 
                  key={booth.id}
                  map={map}
                  position={{ lat: booth.lat, lng: booth.lng }} 
                  onClick={() => handlePointSelect(booth)}
                  title={booth.name}
                />
              ))}
 
              {userData?.savedLocations.map(loc => (
                <AdvancedMarker 
                  key={loc.id}
                  map={map}
                  position={{ lat: loc.lat, lng: loc.lng }}
                  onClick={() => handlePointSelect(loc)}
                  title={loc.label}
                />
              ))}

              {selectedPoint && (
                <InfoWindow
                  position={{ lat: selectedPoint.lat, lng: selectedPoint.lng }}
                  onCloseClick={() => setSelectedPoint(null)}
                >
                  <div className="p-2 min-w-[200px]">
                    <h4 className="font-bold text-gray-900">{(selectedPoint as any).label || selectedPoint.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{selectedPoint.address}</p>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPoint.lat},${selectedPoint.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 block text-center py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg"
                    >
                      Navigate
                    </a>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
            </div>
          )}
        </motion.div>
      </div>

      <SaveLocationModal 
        isOpen={saveModalData.isOpen}
        onClose={() => setSaveModalData({ isOpen: false, data: null })}
        location={saveModalData.data}
      />

      <style dangerouslySetInnerHTML={{__html: `.custom-scrollbar::-webkit-scrollbar { width: 5px; } .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(99, 102, 241, 0.2); border-radius: 10px; }`}} />
    </div>
  );
}
