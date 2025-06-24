import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom'; // useNavigate removed
import Input from './common/Input';
import Button from './common/Button';
import AuthLayout from './AuthLayout';
import { apiService } from '../services/apiService';
import { setAuthToken, setRefreshToken } from '../services/tokenService';
import { LocationContext, LocationInfo } from './LocationContext'; 

interface LoginPageProps {
  // onLoginSuccess is now handled by context
}

interface BackendUserLocation {
  id: number | string; // Backend should ideally send number
  name: string;
}

interface LoginApiResponse {
  access?: string;
  refresh?: string;
  detail?: string;
  user?: {
    username?: string; // This will be the email from backend
    email?: string;
    display_name?: string; // New field from backend
    is_approved_by_admin?: boolean;
    authorized_locations?: BackendUserLocation[] | string[]; 
  }
  [key: string]: any; 
}

const LoginPage: React.FC<LoginPageProps> = () => {
  const [usernameInput, setUsernameInput] = useState<string>(''); // This holds what user types (email)
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { login } = useContext(LocationContext); 

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsernameInput(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!usernameInput || !password) {
      setError('Username and password are required.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiService.post<LoginApiResponse>('/auth/login/', { username: usernameInput, password });
      
      // Check if response is defined before accessing its properties
      if (!response) {
        setError('Login failed: No response from server.');
        setIsLoading(false);
        return;
      }
      
      let processedAuthLocations: LocationInfo[] = [];
      // Safely access response.user
      const backendUser = response.user;
      const backendAuthLocations = backendUser?.authorized_locations;

      if (backendAuthLocations && Array.isArray(backendAuthLocations) && backendAuthLocations.length > 0) {
        const firstElement = backendAuthLocations[0];
        if (typeof firstElement === 'object' && firstElement !== null && 'id' in firstElement && 'name' in firstElement) {
          console.log("LoginPage: Received authorized_locations as objects from backend:", backendAuthLocations);
          processedAuthLocations = (backendAuthLocations as BackendUserLocation[]).map(loc => ({
            id: typeof loc.id === 'string' ? parseInt(loc.id, 10) : loc.id, 
            name: loc.name
          }));
        } else if (typeof firstElement === 'string') {
          console.warn("LoginPage: Received authorized_locations as an array of strings. Backend should provide {id, name} objects. Using names as IDs (lowercased, hyphenated).", backendAuthLocations);
          processedAuthLocations = backendAuthLocations.map((name: any, index: number) => ({
            id: String(name).toLowerCase().replace(/\s+/g, '-') || `loc-name-${index + 1}`, 
            name: String(name),
          }));
        } else {
          console.warn("LoginPage: Received authorized_locations in an unexpected format:", backendAuthLocations);
        }
      } else if (backendAuthLocations && backendAuthLocations.length === 0) {
        console.log("LoginPage: User has no authorized locations assigned from the backend.");
      } else if (!backendAuthLocations && backendUser) { // Check if backendUser exists before logging this
         console.log("LoginPage: No 'authorized_locations' field in backend user response.");
      }


      if (processedAuthLocations.length === 0 && !backendUser?.authorized_locations) {
        console.warn("LoginPage: No valid authorized_locations from backend. USING SIMULATION with NUMERIC IDs.");
        processedAuthLocations = [
          { id: 1, name: 'Kathmandu (Simulated)' },
          { id: 2, name: 'Butwal (Simulated)' },
        ];
      }
      
      const contextUsername = backendUser?.display_name || backendUser?.username || usernameInput;

      const userDataToStore = {
        username: contextUsername, 
        isApprovedByAdmin: backendUser?.is_approved_by_admin !== undefined ? backendUser.is_approved_by_admin : false,
        authorizedLocations: processedAuthLocations,
      };

      if (response.access && response.refresh) {
        setAuthToken(response.access);
        setRefreshToken(response.refresh);
        
        login(userDataToStore); 
      } else {
        setError(response.detail || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorData = (err as { data?: any; message?: string })?.data;
      const errorMessage = errorData?.detail || (err as Error)?.message || 'An unexpected error occurred during login.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign In">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="username"
          name="username"
          type="text" 
          placeholder="Email Address (used as Username)" 
          value={usernameInput}
          onChange={handleUsernameChange}
          required
          aria-label="Email Address (used as Username)"
        />
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={handlePasswordChange}
          required
          aria-label="Password"
        />
        {error && <p role="alert" aria-live="assertive" className="text-sm text-red-400">{error}</p>}
        <Button type="submit" fullWidth disabled={isLoading}>
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
        <p className="text-sm text-center text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-red-500 hover:text-red-400">
            Register here
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;