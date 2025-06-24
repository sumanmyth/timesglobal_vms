import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/apiService';

const ClipboardListIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12 text-white" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

interface CompletedCountResponse {
  count: number;
}

const TaskManagementHomePage: React.FC = () => {
  const [completedTodayCount, setCompletedTodayCount] = useState<number | string>(0);
  const [isLoadingCount, setIsLoadingCount] = useState<boolean>(true);
  const [countError, setCountError] = useState<string | null>(null);

  const fetchCompletedTodayCount = useCallback(async () => {
    setIsLoadingCount(true);
    setCountError(null);
    try {
      const response = await apiService.get<CompletedCountResponse>('/task-management/tasks/completed-today-count/');
      if (response !== undefined) {
        setCompletedTodayCount(response.count);
      } else {
        // Handle undefined response: API call was successful but no data (e.g., 204 No Content)
        // For a count, this might imply 0 or an unexpected empty response.
        console.warn("Completed today count API returned undefined, defaulting to 0.");
        setCompletedTodayCount(0);
        // Optionally, set a specific error if this state is truly unexpected
        // setCountError("Count data not available (empty response)."); 
      }
    } catch (err: any) {
      console.error('Fetch Completed Today Count Error:', err);
      setCountError('Failed to load count');
      setCompletedTodayCount('Error'); // UI will show 'X'
    } finally {
      setIsLoadingCount(false);
    }
  }, []);

  useEffect(() => {
    fetchCompletedTodayCount();
    // Optional: Set up an interval to refresh the count periodically
    // const intervalId = setInterval(fetchCompletedTodayCount, 60000); // Refresh every minute
    // return () => clearInterval(intervalId);
  }, [fetchCompletedTodayCount]);

  return (
    <div className="h-full flex flex-col">
      <header className="bg-red-700 text-white py-3 px-6 shadow-md rounded-t-lg">
        <h2 className="text-2xl font-bold text-center">Welcome to TimesGlobal Task Management System !!!</h2>
      </header>
      <div className="flex-grow flex items-center justify-center p-4 bg-slate-700 bg-opacity-30 backdrop-blur-sm rounded-b-lg">
        <div 
          className="bg-red-600 p-6 sm:p-8 rounded-xl shadow-2xl text-white w-full max-w-sm sm:max-w-md text-center transform hover:scale-105 transition-transform duration-300"
          role="status"
          aria-labelledby="task-completed-title"
        >
          <div className="flex justify-center mb-4">
            <ClipboardListIcon className="w-16 h-16 sm:w-20 sm:h-20 text-red-100" />
          </div>
          <h3 id="task-completed-title" className="text-lg sm:text-xl font-semibold mb-2 text-red-50">Total client task completed Today</h3>
          <p className="text-5xl sm:text-6xl font-bold text-red-50" aria-live="polite">
            {isLoadingCount ? '...' : countError ? 'X' : completedTodayCount}
          </p>
          {countError && <p className="text-xs text-red-200 mt-1">{countError}</p>}
        </div>
      </div>
    </div>
  );
};

export default TaskManagementHomePage;
