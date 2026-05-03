'use client';

import { motion } from 'framer-motion';
import { Star, Bookmark, Home, MapPin, CheckCircle2, Trash2, Navigation } from 'lucide-react';
import { SavedLocation } from '@/types/user';

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

export function BoothCard({ 
  booth, 
  idx, 
  isSelected, 
  isSaved, 
  onSelect, 
  onSave, 
  showSave 
}: { 
  booth: Booth; 
  idx: number; 
  isSelected: boolean; 
  isSaved: boolean; 
  onSelect: () => void; 
  onSave: (e: React.MouseEvent) => void;
  showSave: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      onClick={onSelect}
      className={`relative p-5 rounded-3xl cursor-pointer backdrop-blur-xl transition-all duration-300 border-2 ${
        isSelected 
          ? 'bg-white dark:bg-indigo-900/40 border-indigo-500 shadow-xl' 
          : 'bg-white/60 dark:bg-gray-900/60 border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg dark:text-white">{booth.name}</h3>
          {booth.isRecommended && <Star className="w-4 h-4 fill-amber-400 text-amber-400" />}
        </div>
        {showSave && (
          <button 
            onClick={onSave}
            className={`p-2 rounded-xl transition-all ${isSaved ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-indigo-600'}`}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
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
  );
}

export function SavedLocationCard({ 
  loc, 
  idx, 
  isSelected, 
  onSelect, 
  onRemove, 
  onSetDefault 
}: { 
  loc: SavedLocation; 
  idx: number; 
  isSelected: boolean; 
  onSelect: () => void; 
  onRemove: (e: React.MouseEvent) => void;
  onSetDefault: (e: React.MouseEvent) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      onClick={onSelect}
      className={`relative p-5 rounded-3xl cursor-pointer backdrop-blur-xl transition-all duration-300 border-2 ${
        isSelected 
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
            onClick={onRemove}
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
            onClick={onSetDefault}
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
  );
}
