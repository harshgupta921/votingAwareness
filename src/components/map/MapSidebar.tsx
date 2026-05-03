'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Navigation, Compass } from 'lucide-react';
import { SavedLocation, UserProfile } from '@/types/user';

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

interface MapSidebarProps {
  activeTab: 'booths' | 'saved';
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onRequestLocation: () => void;
  filteredBooths: Booth[];
  filteredSaved: SavedLocation[];
  onPointSelect: (point: Booth | SavedLocation) => void;
  selectedPointId?: string;
  user: UserProfile | null;
  onSaveClick: (booth: Booth) => void;
  onRemoveLocation: (id: string) => void;
  onSetDefault: (id: string) => void;
  isPointSaved: (lat: number, lng: number) => boolean;
  t: (key: string) => string;
  renderBoothCard: (booth: Booth, idx: number) => React.ReactNode;
  renderSavedCard: (loc: SavedLocation, idx: number) => React.ReactNode;
}

export default function MapSidebar({
  activeTab,
  loading,
  searchQuery,
  setSearchQuery,
  onRequestLocation,
  filteredBooths,
  filteredSaved,
  t,
  renderBoothCard,
  renderSavedCard
}: MapSidebarProps) {
  return (
    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-[420px] flex flex-col gap-4 z-10 lg:h-full lg:min-h-0 flex-shrink-0">
      <div className="flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-3xl rounded-[2.5rem] p-6 shadow-2xl border border-white dark:border-gray-800">
        <div className="flex gap-2 mb-5">
          <button
            onClick={onRequestLocation}
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
              {filteredBooths.map((booth, idx) => renderBoothCard(booth, idx))}
            </motion.div>
          ) : (
            <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {filteredSaved.length === 0 ? (
                <div className="p-10 text-center bg-white/50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-500 font-medium">No saved locations found</p>
                </div>
              ) : (
                filteredSaved.map((loc, idx) => renderSavedCard(loc, idx))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
