import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocationContext, LocationInfo } from '../LocationContext';
import Button from '../common/Button';
import AuthLayout from '../AuthLayout';

const LocationSelectionPage: React.FC = () => {
  const { authorizedLocations, selectLocation, username, logout, selectedLocation } = useContext(LocationContext);
  const [currentSelectionId, setCurrentSelectionId] = useState<string | number | null>(null);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // If a location is already selected, or not enough locations to choose from, redirect.
    if (selectedLocation || !authorizedLocations || authorizedLocations.length <= 1) {
      navigate('/dashboard', { replace: true });
    }
  }, [selectedLocation, authorizedLocations, navigate]);


  const handleSelectionChange = (locationId: string | number) => {
    setCurrentSelectionId(locationId);
    setError(''); 
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentSelectionId) {
      setError('Please select a location to proceed.');
      return;
    }
    const chosenLocation = authorizedLocations.find(loc => loc.id === currentSelectionId);
    if (chosenLocation) {
      selectLocation(chosenLocation);
      navigate('/dashboard', { replace: true });
    } else {
      setError('Invalid location selected. Please try again.');
    }
  };


  if (!authorizedLocations || authorizedLocations.length === 0) {
    // This case should be handled by App.tsx redirecting to /no-locations-assigned
    return <AuthLayout title="Error"><p className="text-center text-red-400">No authorized locations found.</p></AuthLayout>;
  }
  
  // This check is now in useEffect, but good for direct render
  if (authorizedLocations.length <= 1) {
    return null; // Redirect handled by useEffect or App.tsx
  }


  return (
    <AuthLayout title={`Welcome, ${username || 'User'}!`}>
      <div className="bg-gray-800 bg-opacity-90 p-8 rounded-lg shadow-2xl">
        <h2 className="text-xl font-semibold text-center text-gray-100 mb-2">Location Access Control</h2>
        <p className="text-sm text-center text-gray-400 mb-6">Please select your active location for this session.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset>
            <legend className="block text-sm font-medium text-gray-300 mb-3">Authorized Locations:</legend>
            <div className="space-y-3">
              {authorizedLocations.map((location: LocationInfo) => {
                const isSelected = currentSelectionId === location.id;
                return (
                  <label
                    key={location.id}
                    htmlFor={`location-${location.id}`}
                    className={`flex items-center p-4 rounded-lg border-2 transition-all duration-200 ease-in-out cursor-pointer
                      ${isSelected 
                        ? 'bg-red-600 border-red-500 shadow-lg ring-2 ring-red-400 ring-offset-2 ring-offset-gray-800' 
                        : 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500'
                      }
                    `}
                  >
                    {/* Visually hidden actual radio button */}
                    <input
                      type="radio"
                      id={`location-${location.id}`}
                      name="location"
                      value={location.id}
                      checked={isSelected}
                      onChange={() => handleSelectionChange(location.id)}
                      className="sr-only" // Tailwind class to visually hide
                      aria-labelledby={`location-name-${location.id}`}
                    />

                    {/* Custom radio button visual */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ease-in-out mr-3
                      ${isSelected ? 'bg-red-500 border-red-300' : 'bg-slate-600 border-slate-500 group-hover:border-slate-400'}
                    `}>
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    
                    <span 
                      id={`location-name-${location.id}`}
                      className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-200'}`}
                    >
                      {location.name || `ID:${location.id} (Name Missing)`}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {error && <p role="alert" aria-live="assertive" className="text-sm text-red-400 text-center pt-2">{error}</p>}

          <Button type="submit" fullWidth disabled={!currentSelectionId} className="mt-8">
            Proceed to Dashboard
          </Button>
          <Button type="button" variant="secondary" fullWidth onClick={logout} className="mt-3">
            Logout
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default LocationSelectionPage;