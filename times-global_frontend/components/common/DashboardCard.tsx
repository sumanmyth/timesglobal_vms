
import React from 'react';

interface DashboardCardProps {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, icon, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-slate-700 bg-opacity-60 backdrop-blur-sm p-6 rounded-lg shadow-xl hover:shadow-2xl hover:bg-slate-600 hover:bg-opacity-75 transition-all duration-300 ease-in-out cursor-pointer flex flex-col items-center text-center transform hover:scale-105"
    >
      <div className="mb-4 text-red-500">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-100">{title}</h3>
    </div>
  );
};

export default DashboardCard;
