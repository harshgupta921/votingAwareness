'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleMap, useJsApiLoader, InfoWindow } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import SaveLocationModal from '@/components/map/SaveLocationModal';
import AdvancedMarker from '@/components/map/AdvancedMarker';
import { SavedLocation } from '@/types/user';

// Sub-components
import MapSidebar from '@/components/map/MapSidebar';
import { BoothCard, SavedLocationCard } from '@/components/map/LocationCard';

const containerStyle = { width: '100%', height: '100%', borderRadius: '2.5rem' };
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

/**
 * Calculates distance between two points using Haversine formula
 */
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

/**
 * Generates mock voting booth data centered around a location
 */
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
    if (userData?.savedLocations) {
      const defaultLoc = userData.savedLocations.find(l => l.isDefault);
      if (defaultLoc && !location) {
        const boothLoc = { lat: defaultLoc.lat, lng: defaultLoc.lng };
        setLocation(boothLoc);
        setBooths(generateMockBooths(boothLoc.lat, boothLoc.lng));
      }
    }
  }, [userData]);

  const requestLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
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
      () => setLoading(false)
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
        <MapSidebar 
          activeTab={activeTab}
          loading={loading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onRequestLocation={requestLocation}
          filteredBooths={filteredBooths}
          filteredSaved={filteredSaved}
          user={user}
          t={t}
          onPointSelect={handlePointSelect}
          onSaveClick={(b) => setSaveModalData({ isOpen: true, data: { ...b, type: 'booth' } })}
          onRemoveLocation={removeLocation}
          onSetDefault={setDefaultLocation}
          isPointSaved={isPointSaved}
          renderBoothCard={(booth, idx) => (
            <BoothCard 
              key={booth.id}
              booth={booth}
              idx={idx}
              isSelected={selectedPoint?.id === booth.id}
              isSaved={isPointSaved(booth.lat, booth.lng)}
              onSelect={() => handlePointSelect(booth)}
              onSave={(e) => { e.stopPropagation(); setSaveModalData({ isOpen: true, data: { ...booth, type: 'booth' } }); }}
              showSave={!!user}
            />
          )}
          renderSavedCard={(loc, idx) => (
            <SavedLocationCard 
              key={loc.id}
              loc={loc}
              idx={idx}
              isSelected={selectedPoint?.id === loc.id}
              onSelect={() => handlePointSelect(loc)}
              onRemove={(e) => { e.stopPropagation(); removeLocation(loc.id); }}
              onSetDefault={(e) => { e.stopPropagation(); setDefaultLocation(loc.id); }}
            />
          )}
        />

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 lg:h-full min-h-[500px] bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-2xl border border-white/40 dark:border-gray-800 relative">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={location || { lat: 20.5937, lng: 78.9629 }}
              zoom={location ? 14 : 5}
              onLoad={(m) => setMap(m)}
              onUnmount={() => setMap(null)}
              options={{ disableDefaultUI: true, zoomControl: true, mapId: 'DEMO_MAP_ID' }}
            >
              {location && <AdvancedMarker map={map} position={location} title="Your Location" />}
              {booths.map(b => <AdvancedMarker key={b.id} map={map} position={{ lat: b.lat, lng: b.lng }} onClick={() => handlePointSelect(b)} title={b.name} />)}
              {userData?.savedLocations.map(l => <AdvancedMarker key={l.id} map={map} position={{ lat: l.lat, lng: l.lng }} onClick={() => handlePointSelect(l)} title={l.label} />)}
              {selectedPoint && (
                <InfoWindow position={{ lat: selectedPoint.lat, lng: selectedPoint.lng }} onCloseClick={() => setSelectedPoint(null)}>
                  <div className="p-2 min-w-[200px]">
                    <h4 className="font-bold text-gray-900">{(selectedPoint as any).label || selectedPoint.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{selectedPoint.address}</p>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPoint.lat},${selectedPoint.lng}`} target="_blank" rel="noopener noreferrer" className="mt-3 block text-center py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg">Navigate</a>
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

      <SaveLocationModal isOpen={saveModalData.isOpen} onClose={() => setSaveModalData({ isOpen: false, data: null })} location={saveModalData.data} />
      <style dangerouslySetInnerHTML={{__html: `.custom-scrollbar::-webkit-scrollbar { width: 5px; } .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(99, 102, 241, 0.2); border-radius: 10px; }`}} />
    </div>
  );
}
