'use client';

/** v1.0.1 - Fixed null pointer crash and icon error */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Tag, FileText, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SaveLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: {
    name: string;
    address: string;
    lat: number;
    lng: number;
    type: 'booth' | 'home' | 'other';
  } | null;
}

export default function SaveLocationModal({ isOpen, onClose, location }: SaveLocationModalProps) {
  const { addLocation } = useAuth();
  const [label, setLabel] = useState('');
  const [notes, setNotes] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when location changes
  useEffect(() => {
    if (location) {
      setLabel(location.name);
      setNotes('');
      setIsDefault(false);
    }
  }, [location]);

  if (!location) return null;

  const handleSave = async () => {
    if (!location || !label.trim() || isSaving) return;

    setIsSaving(true);
    const payload = {
      name: location.name,
      address: location.address,
      lat: location.lat,
      lng: location.lng,
      label: label.trim(),
      notes,
      isDefault,
      type: location.type
    };

    try {
      await addLocation(payload);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 dark:border-gray-800"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold dark:text-white">Save Location</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Custom Label
                  </label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g., My Voting Booth, Home"
                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-3.5 outline-none focus:border-indigo-500 transition-all dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any details about this location..."
                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-3.5 outline-none focus:border-indigo-500 transition-all dark:text-white h-24 resize-none"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div 
                    onClick={() => setIsDefault(!isDefault)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isDefault ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-gray-600 group-hover:border-indigo-400'}`}
                  >
                    {isDefault && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Set as default location</span>
                </label>

                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50">
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100">{location.name}</p>
                      <p className="text-xs text-indigo-700/70 dark:text-indigo-300/60 mt-1">{location.address}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={isSaving || !label.trim()}
                  className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Save'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
