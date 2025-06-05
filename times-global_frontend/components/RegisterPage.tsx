import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from './common/Input';
import Button from './common/Button';
import AuthLayout from './AuthLayout';
import { apiService } from '../services/apiService';

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value);
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!fullName || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const registrationData = {
        username: email,
        email: email,
        password: password,
        password2: confirmPassword,
        first_name: fullName.split(' ')[0] || '',
        last_name: fullName.split(' ').slice(1).join(' ') || '',
      };

      // console.log("Attempting to register with data:", registrationData); // Removed this line

      await apiService.post('/auth/register/', registrationData);
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.data && typeof err.data === 'object') {
        const backendErrors = Object.entries(err.data)
          .map(([key, value]) => `${key}: ${(Array.isArray(value) ? value.join(', ') : String(value))}`)
          .join(' ');
        setError(backendErrors || 'Registration failed. Please try again.');
      } else {
        setError(err.message || 'An unexpected error occurred during registration.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={handleFullNameChange}
          required
          aria-label="Full Name"
        />
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Email Address (will be your username)"
          value={email}
          onChange={handleEmailChange}
          required
          aria-label="Email Address"
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
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          required
          aria-label="Confirm Password"
        />
        {error && <p role="alert" aria-live="assertive" className="text-sm text-red-400">{error}</p>}
        <Button type="submit" fullWidth disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </Button>
        <p className="text-sm text-center text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-red-500 hover:text-red-400">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;