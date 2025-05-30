import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import Button from '../common/Button';
import { apiService } from '../../services/apiService';

interface VMSDashboardLayoutProps {
  onLogout: () => void;
}

interface VisitorStat {
  id: string;
  checkInTime: string;
  checkOutTime?: string | null;
}

interface StatsData {
  totalToday: number | string;
  unexited: number | string;
  exited: number | string;
}

interface SidebarNavItem {
  name: string;
  path: string;
}

interface StatDisplayItem {
    title: string;
    value: string | number;
}

interface ApiResponse<T> {
  results?: T[];
  [key: string]: any; 
}

const VMSDashboardLayout: React.FC<VMSDashboardLayoutProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [statsData, setStatsData] = useState<StatsData>({
    totalToday: 'N/A',
    unexited: 'N/A',
    exited: 'N/A',
  });
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const sidebarNavItems: SidebarNavItem[] = [
    { name: 'Home', path: '/vms/home' },
    { name: 'Add Record', path: '/vms/add-record' },
    { name: 'Visitor List', path: '/vms/visitor-list' },
    { name: 'Reports', path: '/vms/reports' },
    { name: 'Add Document', path: '/vms/add-document' },
    { name: 'Add Image', path: '/vms/add-image' },
    { name: 'Register User', path: '/vms/register-user' },
  ];

  const showStatsBar = location.pathname === '/vms/home' || location.pathname === '/vms';

  const fetchDashboardStats = useCallback(async () => {
    if (!showStatsBar) return;

    setIsLoadingStats(true);
    setStatsError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const queryParams = new URLSearchParams({
        check_in_time_after: today,
        check_in_time_before: today,
      });

      const data = await apiService.get<VisitorStat[] | ApiResponse<VisitorStat>>(`/visitors/?${queryParams.toString()}`);
      const todaysVisitors: VisitorStat[] = Array.isArray(data) ? data : (data.results || []);

      let unexitedCount = 0;
      let exitedCount = 0;

      todaysVisitors.forEach((visitor: VisitorStat) => {
        if (visitor.checkOutTime) {
          exitedCount++;
        } else {
          unexitedCount++;
        }
      });

      setStatsData({
        totalToday: todaysVisitors.length,
        unexited: unexitedCount,
        exited: exitedCount,
      });

    } catch (err: any) {
      console.error('Fetch Dashboard Stats Error:', err);
      setStatsError(err.message || 'Failed to load dashboard stats.');
      setStatsData({ totalToday: 'Error', unexited: 'Error', exited: 'Error' });
    } finally {
      setIsLoadingStats(false);
    }
  }, [showStatsBar]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats, location.pathname]);


  const handleLogoutClick = () => {
    onLogout();
    navigate('/login', {replace: true});
  }

  const handleBackToDashboardClick = () => {
    navigate('/dashboard');
  };

  const statsToDisplay: StatDisplayItem[] = [
    { title: 'TOTAL VISITORS TODAY', value: isLoadingStats ? '...' : statsError ? 'X' : statsData.totalToday },
    { title: 'UNEXITED VISITORS', value: isLoadingStats ? '...' : statsError ? 'X' : statsData.unexited },
    { title: 'EXITED VISITORS', value: isLoadingStats ? '...' : statsError ? 'X' : statsData.exited },
  ];


  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <aside className="w-60 bg-gray-800 flex flex-col fixed top-0 left-0 h-full shadow-lg z-20">
        <div className="p-5 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-red-600 text-center">TIMES GLOBAL</h1>
        </div>
        <nav className="flex-grow p-4 space-y-1">
          {sidebarNavItems.map((item: SidebarNavItem) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }: { isActive: boolean }) =>
                `block py-2.5 px-4 rounded-md transition duration-200 text-sm 
                hover:bg-red-600 hover:text-white 
                focus:outline-none focus:bg-red-600 focus:text-white
                ${isActive ? 'bg-red-600 text-white shadow-md' : 'text-gray-300'}`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 mt-auto border-t border-gray-700 space-y-2">
          <Button 
            onClick={handleBackToDashboardClick} 
            fullWidth 
            variant="secondary" 
            className="bg-gray-600 hover:bg-gray-500"
          >
            Back to Main Dashboard
          </Button>
          <Button 
            onClick={handleLogoutClick} 
            fullWidth 
            className="bg-red-700 hover:bg-red-800"
          >
            Log Out
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col ml-60">
        <header className="bg-red-700 text-white p-4 text-center shadow-md sticky top-0 z-10">
          <h2 className="text-lg font-semibold">Welcome to TimesGlobal Visitor Management System !!!</h2>
        </header>

        {showStatsBar && (
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5 bg-gray-900">
            {statsToDisplay.map((stat: StatDisplayItem) => (
              <div key={stat.title} className="bg-gray-800 p-5 rounded-lg shadow-xl text-center">
                <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">{stat.title}</h4>
                <p className="text-4xl font-bold text-red-500 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>
        )}
         {showStatsBar && statsError && <p className="text-red-400 text-center py-2 bg-gray-800">{statsError}</p>}

        <main className={`flex-grow p-5 overflow-y-auto bg-gray-900 ${showStatsBar ? '' : 'pt-0'}`}>
          <Outlet />
        </main>
        
        <footer className="bg-gray-800 p-3 text-center text-gray-500 text-xs">
          © {new Date().getFullYear()} Times Global Visitor Management. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default VMSDashboardLayout;