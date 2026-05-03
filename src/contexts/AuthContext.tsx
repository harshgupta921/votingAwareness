'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  User 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { UserData, UserProfile, SavedLocation } from '@/types/user';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProgress: (data: Partial<UserData>) => Promise<void>;
  addLocation: (location: Omit<SavedLocation, 'id' | 'timestamp'>) => Promise<void>;
  removeLocation: (id: string) => Promise<void>;
  setDefaultLocation: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const createInitialUserData = (uid: string): UserData => ({
    profile: {
      uid,
      email: auth.currentUser?.email || null,
      displayName: auth.currentUser?.displayName || null,
      photoURL: auth.currentUser?.photoURL || null,
      createdAt: Date.now(),
      lastLogin: Date.now(),
    },
    readinessScore: {
      score: 0,
      totalPossible: 100,
      lastUpdated: Date.now(),
      history: [],
    },
    checklistProgress: [],
    savedLocations: [],
    preferences: {
      language: 'en',
      theme: 'dark',
    },
    lastVisitedPage: '/',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchUserData(user.uid);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      let userDoc;
      
      try {
        // Try getting from server first with a timeout or just normal getDoc
        userDoc = await getDoc(userDocRef);
      } catch (error: any) {
        // If offline or failed, try cache explicitly
        console.log('Server fetch failed, attempting to read from cache...', error.message);
        try {
          const { getDocFromCache } = await import('firebase/firestore');
          userDoc = await getDocFromCache(userDocRef);
        } catch (cacheError) {
          // Cache can be empty on first login; avoid noisy hard-failure logs.
          console.log('Cache fetch skipped/unavailable:', cacheError);
          throw error; // Re-throw original error if cache also fails
        }
      }

      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        // Migration check for old data structure
        if (!data.savedLocations) {
          data.savedLocations = [];
          // @ts-ignore - Handle old savedBooth migration if it exists
          if (data.savedBooth) {
            const oldBooth = (data as any).savedBooth;
            data.savedLocations.push({
              id: 'booth-migration',
              name: oldBooth.name,
              lat: oldBooth.coordinates.lat,
              lng: oldBooth.coordinates.lng,
              address: oldBooth.address,
              label: 'My Booth',
              isDefault: true,
              type: 'booth',
              timestamp: Date.now()
            });
          }
          await updateDoc(userDocRef, { savedLocations: data.savedLocations });
        }
        setUserData(data);
      } else {
        const initialUserData: UserData = createInitialUserData(uid);
        await setDoc(userDocRef, initialUserData);
        setUserData(initialUserData);
      }
    } catch (error: any) {
      // Handle the specific "offline" error gracefully
      if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
        console.log('Firebase is operating in offline mode. Using cached data.');
      } else {
        console.error('Error fetching user data:', error);
      }

      // Keep app usable even if the first read fails.
      setUserData(prev => prev ?? createInitialUserData(uid));
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateUserProgress = async (data: Partial<UserData>) => {
    if (!user) {
      throw new Error('User must be logged in to update progress.');
    }
    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      // Separate top-level fields and nested fields
      const { profile, ...topLevel } = data;
      const baseProfile = userData?.profile ?? createInitialUserData(user.uid).profile;
      const updatePayload: Partial<UserData> & { profile: UserData['profile'] } = {
        ...topLevel,
        // setDoc does not support dot-path field updates like updateDoc.
        // Always provide a merged nested profile object.
        profile: {
          ...baseProfile,
          ...(profile ?? {}),
          lastLogin: Date.now(),
        },
      };

      // Merge avoids "document does not exist" failures for first-time users.
      await setDoc(userDocRef, updatePayload, { merge: true });
      
      // Update local state with merged data
      setUserData(prev => {
        const base = prev ?? createInitialUserData(user.uid);
        return {
          ...base,
          ...topLevel,
          profile: updatePayload.profile,
        };
      });

      console.log('User progress updated successfully');
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw error; // Re-throw to handle in the component
    }
  };

  const addLocation = async (location: Omit<SavedLocation, 'id' | 'timestamp'>) => {
    if (!user) {
      throw new Error('User must be logged in to add a location.');
    }
    
    try {
      const newLocation: SavedLocation = {
        ...location,
        id: `loc_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        timestamp: Date.now()
      };

      // Use local state for instant UX and rely on Firestore offline persistence to sync.
      const currentLocations: SavedLocation[] = userData?.savedLocations || [];
      let updatedLocations = [...currentLocations, newLocation];
      
      // Logic for default location
      if (updatedLocations.length === 1) {
        updatedLocations[0].isDefault = true;
      } else if (location.isDefault) {
        updatedLocations = updatedLocations.map(loc => ({
          ...loc,
          isDefault: loc.id === newLocation.id
        }));
      }

      await updateUserProgress({ savedLocations: updatedLocations });
    } catch (error) {
      console.error('Error in addLocation:', error);
      alert('Failed to save location. Please try again.');
      throw error;
    }
  };

  const removeLocation = async (id: string) => {
    if (!user) return;
    try {
      const currentLocations: SavedLocation[] = userData?.savedLocations || [];

      let updatedLocations = currentLocations.filter(loc => loc.id !== id);
      // Keep a default location if any remain.
      if (updatedLocations.length > 0 && !updatedLocations.some(loc => loc.isDefault)) {
        updatedLocations = updatedLocations.map((loc, idx) => ({ ...loc, isDefault: idx === 0 }));
      }

      await updateUserProgress({ savedLocations: updatedLocations });
    } catch (error) {
      console.error('Error removing location:', error);
    }
  };

  const setDefaultLocation = async (id: string) => {
    if (!user) return;
    try {
      const currentLocations: SavedLocation[] = userData?.savedLocations || [];

      const updatedLocations = currentLocations.map(loc => ({
        ...loc,
        isDefault: loc.id === id
      }));
      await updateUserProgress({ savedLocations: updatedLocations });
    } catch (error) {
      console.error('Error setting default location:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      loading, 
      signInWithGoogle, 
      signOut, 
      updateUserProgress,
      addLocation,
      removeLocation,
      setDefaultLocation
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
