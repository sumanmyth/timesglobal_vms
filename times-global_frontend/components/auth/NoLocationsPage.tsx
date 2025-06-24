import React from 'react';
import Button from '../common/Button';
import AuthLayout from '../AuthLayout';

interface NoLocationsPageProps {
  onLogout: () => void;
}

const NoLocationsPage: React.FC<NoLocationsPageProps> = ({ onLogout }) => {
  return (
    <AuthLayout title="No Locations Assigned">
      <div className="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <p className="text-gray-300 mb-6">
          Your account has been approved, but no data center locations have been assigned to you yet. 
          You need access to at least one location to use the dashboard.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Please contact an administrator to request location access.
        </p>
        <Button onClick={onLogout} fullWidth variant="secondary">
          Logout
        </Button>
      </div>
    </AuthLayout>
  );
};

export default NoLocationsPage;
