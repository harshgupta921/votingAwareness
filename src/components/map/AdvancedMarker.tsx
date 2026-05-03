'use client';

import { useEffect, useRef, memo } from 'react';

interface AdvancedMarkerProps {
  map: google.maps.Map | null;
  position: google.maps.LatLngLiteral;
  title?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

const AdvancedMarker = memo(({ map, position, title, onClick }: AdvancedMarkerProps) => {
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  useEffect(() => {
    if (!map || !position) return;

    if (!google.maps.marker || !google.maps.marker.AdvancedMarkerElement) {
      console.warn('AdvancedMarkerElement not available. Ensure libraries=["marker"] is passed to useJsApiLoader.');
      return;
    }

    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position,
      title,
    });

    if (onClick) {
      marker.addEventListener('gmp-click', onClick);
    }

    markerRef.current = marker;

    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
      }
    };
  }, [map, position, title, onClick]);

  return null;
});

AdvancedMarker.displayName = 'AdvancedMarker';
export default AdvancedMarker;
