import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from './common/Input';
import Button from './common/Button';
import AuthLayout from './AuthLayout';
import { apiService } from '../services/apiService';
import { setAuthToken, setRefreshToken } from '../services/tokenService';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

interface LoginApiResponse {
  access?: string;
  refresh?: string;
  detail?: string;
  [key: string]: any; 
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !password) {
      setError('Username and password are required.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiService.post<LoginApiResponse>('/auth/login/', { username, password });
      if (response.access && response.refresh) {
        setAuthToken(response.access);
        setRefreshToken(response.refresh);
        localStorage.setItem('username', username); 
        onLoginSuccess();
        navigate('/dashboard', { replace: true });
      } else {
        setError(response.detail || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.data?.detail || err.message || 'An unexpected error occurred during login.';
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
          placeholder="Username or Email Address"
          value={username}
          onChange={handleUsernameChange}
          required
          aria-label="Username or Email Address"
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