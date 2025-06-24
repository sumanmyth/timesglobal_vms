import React from 'react';
import Button from '../common/Button';
import AuthLayout from '../AuthLayout';

interface PendingApprovalPageProps {
  onLogout: () => void;
}

const PendingApprovalPage: React.FC<PendingApprovalPageProps> = ({ onLogout }) => {
  return (
    <AuthLayout title="Account Pending Approval">
      <div className="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-yellow-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-300 mb-6">
          Your account registration is successful and is currently awaiting approval from an administrator. 
          You will not be able to access the dashboard until your account is approved.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Please check back later or contact support if you have any questions.
        </p>
        <Button onClick={onLogout} fullWidth variant="secondary">
          Logout
        </Button>
      </div>
    </AuthLayout>
  );
};

export default PendingApprovalPage;
