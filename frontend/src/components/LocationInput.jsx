import React, { useEffect, useRef, useState } from 'react';

const LocationInput = ({ value, onChange, placeholder, onPlaceSelected }) => {
  const inputRef = useRef(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Function to initialize autocomplete
  const initAutocomplete = () => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('Google Maps JavaScript API not loaded yet');
      return null;
    }

    try {
      const autocompleteInstance = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['establishment', 'geocode'],
          componentRestrictions: { country: 'in' },
          fields: ['formatted_address', 'geometry', 'name', 'address_components']
        }
      );

      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace();
        if (place.geometry) {
          const location = {
            address: place.formatted_address || place.name,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            placeId: place.place_id,
            components: place.address_components
          };
          onPlaceSelected && onPlaceSelected(location);
        }
      });

      setAutocomplete(autocompleteInstance);
      return autocompleteInstance;
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
      return null;
    }
  };

  // Check if Google Maps API is already loaded
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      const instance = initAutocomplete();
      return () => {
        if (instance) {
          window.google.maps.event.clearInstanceListeners(instance);
        }
      };
    } else {
      // If not loaded, set up a listener for when it loads
      const checkApiLoaded = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(checkApiLoaded);
          initAutocomplete();
        }
      }, 100);

      return () => clearInterval(checkApiLoaded);
    }
  }, []);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default LocationInput;
