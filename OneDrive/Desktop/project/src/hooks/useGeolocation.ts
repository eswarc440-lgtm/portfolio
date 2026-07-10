import { useState, useEffect, useCallback } from 'react';

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GeolocationState {
  coordinates: GeolocationCoordinates | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation(options: PositionOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }) {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    loading: true,
    error: null,
  });

  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        coordinates: null,
        loading: false,
        error: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
          loading: false,
          error: null,
        });
      },
      (error) => {
        let errorMessage = 'Failed to fetch location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access permission was denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is currently unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Request to retrieve location timed out.';
            break;
        }
        setState({
          coordinates: null,
          loading: false,
          error: errorMessage,
        });
      },
      options
    );
  }, [options]);

  useEffect(() => {
    fetchLocation();
  }, []);

  return { ...state, refetch: fetchLocation };
}
