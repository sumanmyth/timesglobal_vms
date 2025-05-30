import React from 'react';

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, children }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-600">Times Global</h1>
          <p className="text-gray-400 text-lg">Data Centre Management</p>
        </div>
        <div className="bg-gray-800 p-8 rounded-lg shadow-2xl">
          <h2 className="text-2xl font-semibold text-center text-gray-100 mb-6">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;