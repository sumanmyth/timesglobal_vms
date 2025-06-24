import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getAuthToken, removeAuthToken } from '../services/tokenService';

export interface LocationInfo {
  id: string | number;
  name: string;
}

interface UserData {
  username: string;
  isApprovedByAdmin: boolean;
  authorizedLocations: LocationInfo[];
}

interface LocationContextType {
  isAuthenticated: boolean;
  isApprovedByAdmin: boolean;
  authorizedLocations: LocationInfo[];
  selectedLocation: LocationInfo | null;
  username: string | null;
  isLoadingAuth: boolean;
  login: (userData: UserData) => void;
  logout: () => void;
  selectLocation: (location: LocationInfo) => void;
  switchToLocation: (locationName: string) => void; // Takes name, finds object
}

export const LocationContext = createContext<LocationContextType>({
  isAuthenticated: false,
  isApprovedByAdmin: false,
  authorizedLocations: [],
  selectedLocation: null,
  username: null,
  isLoadingAuth: true,
  login: () => {},
  logout: () => {},
  selectLocation: () => {},
  switchToLocation: () => {},
});

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isApprovedByAdmin, setIsApprovedByAdmin] = useState<boolean>(false);
  const [authorizedLocations, setAuthorizedLocations] = useState<LocationInfo[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationInfo | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  const loadAuthData = useCallback(() => {
    setIsLoadingAuth(true);
    const token = getAuthToken();
    if (token) {
      setIsAuthenticated(true);
      const storedUsername = localStorage.getItem('username');
      const storedIsApproved = localStorage.getItem('isApprovedByAdmin');
      const storedAuthLocations = localStorage.getItem('authorizedLocations');
      const storedSelectedLocation = localStorage.getItem('selectedLocation');

      if (storedUsername) setUsername(storedUsername);
      if (storedIsApproved) setIsApprovedByAdmin(JSON.parse(storedIsApproved));
      if (storedAuthLocations) {
        const parsedLocations: LocationInfo[] = JSON.parse(storedAuthLocations);
        setAuthorizedLocations(parsedLocations);
        if (parsedLocations.length === 1 && !storedSelectedLocation) {
          setSelectedLocation(parsedLocations[0]);
          localStorage.setItem('selectedLocation', JSON.stringify(parsedLocations[0]));
        } else if (storedSelectedLocation) {
          try {
            const parsedSelectedLocation: LocationInfo = JSON.parse(storedSelectedLocation);
            // Ensure the stored selected location is still one of the authorized ones
            if (parsedLocations.some(loc => loc.id === parsedSelectedLocation.id)) {
                setSelectedLocation(parsedSelectedLocation);
            } else {
                localStorage.removeItem('selectedLocation'); // Invalid selected location
                if (parsedLocations.length === 1) { // Auto-select if only one valid option now
                    setSelectedLocation(parsedLocations[0]);
                    localStorage.setItem('selectedLocation', JSON.stringify(parsedLocations[0]));
                }
            }
          } catch (e) {
            console.error("Error parsing stored selected location", e);
            localStorage.removeItem('selectedLocation');
          }
        }
      }
    } else {
      setIsAuthenticated(false);
      setUsername(null);
      setIsApprovedByAdmin(false);
      setAuthorizedLocations([]);
      setSelectedLocation(null);
      localStorage.removeItem('username');
      localStorage.removeItem('isApprovedByAdmin');
      localStorage.removeItem('authorizedLocations');
      localStorage.removeItem('selectedLocation');
    }
    setIsLoadingAuth(false);
  }, []);

  useEffect(() => {
    loadAuthData();
  }, [loadAuthData]);

  const login = (userData: UserData) => {
    localStorage.setItem('username', userData.username);
    localStorage.setItem('isApprovedByAdmin', JSON.stringify(userData.isApprovedByAdmin));
    localStorage.setItem('authorizedLocations', JSON.stringify(userData.authorizedLocations));
    
    setIsAuthenticated(true);
    setUsername(userData.username);
    setIsApprovedByAdmin(userData.isApprovedByAdmin);
    setAuthorizedLocations(userData.authorizedLocations);

    if (userData.isApprovedByAdmin && userData.authorizedLocations.length === 1) {
      setSelectedLocation(userData.authorizedLocations[0]);
      localStorage.setItem('selectedLocation', JSON.stringify(userData.authorizedLocations[0]));
    } else {
      setSelectedLocation(null); 
      localStorage.removeItem('selectedLocation');
    }
    setIsLoadingAuth(false);
  };

  const logout = () => {
    removeAuthToken();
    localStorage.removeItem('username');
    localStorage.removeItem('isApprovedByAdmin');
    localStorage.removeItem('authorizedLocations');
    localStorage.removeItem('selectedLocation');
    
    setIsAuthenticated(false);
    setUsername(null);
    setIsApprovedByAdmin(false);
    setAuthorizedLocations([]);
    setSelectedLocation(null);
    setIsLoadingAuth(false);
  };

  const selectLocation = (location: LocationInfo) => {
    if (authorizedLocations.some(loc => loc.id === location.id)) {
      setSelectedLocation(location);
      localStorage.setItem('selectedLocation', JSON.stringify(location));
    } else {
      console.error("Attempted to select an unauthorized location.");
    }
  };
  
  const switchToLocation = (locationName: string) => {
    const locationToSwitch = authorizedLocations.find(loc => loc.name === locationName);
    if (locationToSwitch) {
      selectLocation(locationToSwitch);
    } else {
      console.error("Attempted to switch to an unknown or unauthorized location name:", locationName);
    }
  };

  return (
    <LocationContext.Provider value={{ 
      isAuthenticated, 
      isApprovedByAdmin, 
      authorizedLocations, 
      selectedLocation, 
      username,
      isLoadingAuth,
      login, 
      logout,
      selectLocation,
      switchToLocation
    }}>
      {children}
    </LocationContext.Provider>
  );
};