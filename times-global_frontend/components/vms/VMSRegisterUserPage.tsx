import React from 'react';

const VMSRegisterUserPage: React.FC = () => {
  return (
    <div className="bg-slate-700 bg-opacity-60 backdrop-blur-md rounded-lg shadow-xl p-8 text-center h-full flex flex-col justify-center items-center">
      <h2 className="text-2xl font-semibold text-red-500 mb-4">Register User</h2>
      <p className="text-gray-300">
        This section will provide a form to register new users for the VMS system (e.g., employees, security personnel).
      </p>
      <p className="text-yellow-400 mt-2 animate-pulse">Feature under construction.</p>
    </div>
  );
};

export default VMSRegisterUserPage;