import React, { useState, useEffect, useCallback, FormEvent, useContext } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import { apiService } from '../../services/apiService';
import { LocationContext } from '../LocationContext';

interface Task {
  id: string;
  job_id: string;
  job_date: string;
  job_title: string;
  full_name: string;
  company_name: string;
  rack_number: string;
  encoded_by: string;
  company_location?: string | null;
  job_description?: string | null;
  contact?: string | null;
  is_completed: boolean; 
  completed_at?: string | null; 
  created_at: string;
  updated_at: string;
}

interface EditTaskFormData {
  jobDate: string;
  jobId: string; 
  jobTitle: string;
  fullName: string;
  companyName: string;
  companyLocation: string;
  rackNumber: string;
  jobDescription: string;
  contact: string;
  encodedBy: string;
  isCompleted: boolean; 
}

interface UpdateTaskPayload {
  job_date?: string;
  job_id?: string; 
  job_title?: string;
  full_name?: string;
  company_name?: string;
  company_location?: string | null;
  rack_number?: string;
  job_description?: string | null;
  contact?: string | null;
  encoded_by?: string;
  is_completed?: boolean; 
}

const initialEditFormData: EditTaskFormData = {
  jobDate: '',
  jobId: '',
  jobTitle: '',
  fullName: '',
  companyName: '',
  companyLocation: '',
  rackNumber: '',
  jobDescription: '',
  contact: '',
  encodedBy: '',
  isCompleted: false, 
};

const TaskManagementListPage: React.FC = () => {
  const { selectedLocation } = useContext(LocationContext);

  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isLoadingAllTasks, setIsLoadingAllTasks] = useState<boolean>(true);
  const [allTasksError, setAllTasksError] = useState<string | null>(null);

  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [isLoadingRecentTasks, setIsLoadingRecentTasks] = useState<boolean>(true);
  const [recentTasksError, setRecentTasksError] = useState<string | null>(null);
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editFormData, setEditFormData] = useState<EditTaskFormData>(initialEditFormData);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);


  const fetchAllTasks = useCallback(async () => {
    if (!selectedLocation?.id) {
        setAllTasks([]);
        setIsLoadingAllTasks(false);
        setAllTasksError("Please select a location to view all tasks.");
        return;
    }
    setIsLoadingAllTasks(true);
    setAllTasksError(null);
    try {
      const tasks = await apiService.getAll<Task>('/task-management/tasks/');
      setAllTasks(tasks || []);
    } catch (err: any) {
      console.error('Fetch All Tasks Error:', err);
      setAllTasksError(err.data?.detail || err.message || 'Failed to fetch all tasks.');
      setAllTasks([]);
    } finally {
      setIsLoadingAllTasks(false);
    }
  }, [selectedLocation]);

  const fetchRecentTasks = useCallback(async () => {
    if (!selectedLocation?.id) {
        setRecentTasks([]);
        setIsLoadingRecentTasks(false);
        setRecentTasksError("Please select a location to view recent tasks.");
        return;
    }
    setIsLoadingRecentTasks(true);
    setRecentTasksError(null);
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const queryParams = new URLSearchParams();
      // Using created_at for "recent" for this example. Adjust if job_date is intended.
      queryParams.append('created_at__gte', twentyFourHoursAgo);
      
      const tasks = await apiService.getAll<Task>(`/task-management/tasks/?${queryParams.toString()}`);
      if (tasks) {
         setRecentTasks(tasks.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } else {
         setRecentTasks([]);
      }
    } catch (err: any) {
      console.error('Fetch Recent Tasks Error:', err);
      setRecentTasksError(err.data?.detail || err.message || 'Failed to fetch recent tasks.');
      setRecentTasks([]);
    } finally {
      setIsLoadingRecentTasks(false);
    }
  }, [selectedLocation]);


  useEffect(() => {
    if(selectedLocation?.id){
        fetchAllTasks();
        fetchRecentTasks();
    } else {
        // Clear tasks if no location is selected
        setAllTasks([]);
        setRecentTasks([]);
        setIsLoadingAllTasks(false);
        setIsLoadingRecentTasks(false);
        setAllTasksError("No location selected.");
        setRecentTasksError("No location selected.");
    }
  }, [fetchAllTasks, fetchRecentTasks, selectedLocation]);

  const formatDateForInput = (isoDateString: string | null | undefined): string => {
    if (!isoDateString) return '';
    try {
      return new Date(isoDateString).toISOString().split('T')[0];
    } catch (e) {
      console.warn("Error formatting date for input:", isoDateString, e);
      if (typeof isoDateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(isoDateString)) {
        return isoDateString;
      }
      return '';
    }
  };

  const handleEditTaskClick = (task: Task) => {
    setEditingTask(task);
    setEditFormData({
      jobDate: formatDateForInput(task.job_date),
      jobId: task.job_id,
      jobTitle: task.job_title,
      fullName: task.full_name,
      companyName: task.company_name,
      companyLocation: task.company_location || '',
      rackNumber: task.rack_number,
      jobDescription: task.job_description || '',
      contact: task.contact || '',
      encodedBy: task.encoded_by,
      isCompleted: task.is_completed, 
    });
    setIsEditModalOpen(true);
    setEditError(null);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setEditFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setEditFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateTaskSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTask) return;

    setEditError(null);
    setIsUpdating(true);

    const payload: UpdateTaskPayload = {
      job_date: editFormData.jobDate,
      job_id: editFormData.jobId,
      job_title: editFormData.jobTitle,
      full_name: editFormData.fullName,
      company_name: editFormData.companyName,
      rack_number: editFormData.rackNumber,
      encoded_by: editFormData.encodedBy,
      company_location: editFormData.companyLocation || null,
      job_description: editFormData.jobDescription || null,
      contact: editFormData.contact || null,
      is_completed: editFormData.isCompleted, 
    };
    
    if (!payload.job_date || !payload.job_id || !payload.job_title || !payload.full_name || !payload.company_name || !payload.rack_number || !payload.encoded_by) {
      setEditError("Please fill in all required fields: Job Date, Job ID, Job Title, Full Name, Company Name, Rack Number, Encoded By.");
      setIsUpdating(false);
      return;
    }

    try {
      await apiService.patch<Task>(`/task-management/tasks/${editingTask.id}/`, payload);
      setIsEditModalOpen(false);
      setEditingTask(null);
      setSuccessMessage('Task updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchAllTasks(); // Refetch both lists
      fetchRecentTasks();
    } catch (err: any) {
      console.error('Update Task Error:', err);
      const errorData = (err as { data?: any; message?: string })?.data;
      if (errorData && typeof errorData === 'object') {
        const backendErrors = Object.entries(errorData)
          .map(([key, value]) => {
            const fieldName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            return `${fieldName}: ${(Array.isArray(value) ? value.join(', ') : String(value))}`;
          })
          .join(' \n');
        setEditError(backendErrors || 'Failed to update task. Please check details.');
      } else {
        setEditError((err as Error)?.message || 'An unexpected error occurred while updating the task.');
      }
    } finally {
      setIsUpdating(false);
    }
  };


  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setAllTasksError(null); 
      setRecentTasksError(null);
      setSuccessMessage(null);
      try {
        await apiService.delete(`/task-management/tasks/${taskId}/`);
        setSuccessMessage('Task deleted successfully.');
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchAllTasks(); // Refetch both lists
        fetchRecentTasks();
      } catch (err: any) {
        console.error('Delete Task Error:', err);
        const generalError = `Failed to delete task: ${err.data?.detail || err.message}`;
        setAllTasksError(generalError); // Show error potentially in both sections or a general one
        setRecentTasksError(generalError);
      }
    }
  };
  
  const formatDateForDisplay = (dateString: string | null | undefined, includeTime: boolean = false) => {
    if (!dateString) return 'N/A';
    try {
      const dateObj = new Date(dateString);
       const options: Intl.DateTimeFormatOptions = {
        year: 'numeric', month: '2-digit', day: '2-digit',
      };
      if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.hour12 = true;
      }
      return new Intl.DateTimeFormat('en-CA', options).format(dateObj).replace(',',''); 
    } catch {
      if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateString)) {
        return dateString.split('T')[0]; 
      }
      return dateString; 
    }
  };

  const inputStyles = "bg-slate-600 border-slate-500 text-gray-100 placeholder-gray-400 focus:ring-red-500 focus:border-red-500";
  const labelStyles = "block text-sm font-medium text-gray-300 mb-1";

  const renderTaskTable = (tasksToRender: Task[], listTitle: string) => (
    <div className="bg-slate-700 bg-opacity-60 backdrop-blur-md shadow-md rounded-lg overflow-hidden border border-gray-700 mb-6">
      <h3 className="text-md font-semibold text-red-400 py-2 px-6">{listTitle}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Job ID</th>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Job Date</th>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Job Title</th>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Full Name</th>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Company Name</th>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rack Number</th>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Encoded By</th>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-gray-700">
            {tasksToRender.map((task) => (
              <tr key={task.id} className={`hover:bg-slate-700/70 transition-colors ${task.is_completed ? 'opacity-70' : ''}`}>
                <td className={`px-3 py-2 whitespace-nowrap text-sm text-gray-200 ${task.is_completed ? 'line-through' : ''}`}>{task.job_id}</td>
                <td className={`px-3 py-2 whitespace-nowrap text-sm text-gray-200 ${task.is_completed ? 'line-through' : ''}`}>{formatDateForDisplay(task.job_date)}</td>
                <td className={`px-3 py-2 whitespace-nowrap text-sm text-gray-100 font-medium max-w-xs truncate ${task.is_completed ? 'line-through' : ''}`} title={task.job_title}>{task.job_title}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  {task.is_completed ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-600 text-green-100">
                      Completed
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-500 text-yellow-100">
                      Pending
                    </span>
                  )}
                </td>
                <td className={`px-3 py-2 whitespace-nowrap text-sm text-gray-200 ${task.is_completed ? 'line-through' : ''}`}>{task.full_name}</td>
                <td className={`px-3 py-2 whitespace-nowrap text-sm text-gray-200 max-w-xs truncate ${task.is_completed ? 'line-through' : ''}`} title={task.company_name}>{task.company_name}</td>
                <td className={`px-3 py-2 whitespace-nowrap text-sm text-gray-200 ${task.is_completed ? 'line-through' : ''}`}>{task.rack_number}</td>
                <td className={`px-3 py-2 whitespace-nowrap text-sm text-gray-200 ${task.is_completed ? 'line-through' : ''}`}>{task.encoded_by}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <Button onClick={() => handleEditTaskClick(task)} variant="secondary" className="!py-1 !px-2 text-xs mr-1 bg-blue-600 hover:bg-blue-700 text-white">
                    Edit
                  </Button>
                  <Button onClick={() => handleDeleteTask(task.id)} variant="primary" className="!py-1 !px-2 text-xs bg-red-700 hover:bg-red-800">
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       {tasksToRender.length === 0 && <p className="text-center text-gray-400 py-6">No tasks found for this category.</p>}
    </div>
  );


  return (
    <div className="h-full flex flex-col">
      <header className="bg-red-700 text-white py-3 px-6 shadow-md rounded-t-lg">
        <h2 className="text-2xl font-bold text-center">Task List ({selectedLocation?.name || 'No Location'})</h2>
      </header>
      
      {successMessage && <p role="alert" aria-live="polite" className="mx-2 sm:mx-4 my-2 text-center text-green-300 bg-green-800/70 p-2 rounded">{successMessage}</p>}
      
      <div className="flex-grow p-2 sm:p-4 bg-slate-700 bg-opacity-30 backdrop-blur-sm rounded-b-lg shadow-inner_lg overflow-y-auto">
        {/* Recent Tasks Section */}
        {isLoadingRecentTasks && <p className="text-center text-gray-300 py-10">Loading recent tasks...</p>}
        {recentTasksError && <p role="alert" aria-live="assertive" className="mx-2 sm:mx-4 my-2 text-center text-red-400 bg-red-900/70 p-3 rounded">{recentTasksError}</p>}
        {!isLoadingRecentTasks && !recentTasksError && renderTaskTable(recentTasks, "Tasks from Recent 24 Hours")}

        {/* Separator */}
        {!isLoadingRecentTasks && !isLoadingAllTasks && <hr className="my-6 border-gray-600"/>}

        {/* All Tasks Section */}
        {isLoadingAllTasks && <p className="text-center text-gray-300 py-10">Loading all tasks...</p>}
        {allTasksError && <p role="alert" aria-live="assertive" className="mx-2 sm:mx-4 my-2 text-center text-red-400 bg-red-900/70 p-3 rounded">{allTasksError}</p>}
        {!isLoadingAllTasks && !allTasksError && renderTaskTable(allTasks, "All Tasks")}
      </div>

      {isEditModalOpen && editingTask && (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setIsEditModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="editTaskModalTitle"
        >
          <div 
            className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="flex justify-between items-center mb-4">
              <h4 id="editTaskModalTitle" className="text-xl font-semibold text-red-500">Edit Task: {editingTask.job_title}</h4>
              <Button onClick={() => setIsEditModalOpen(false)} variant="secondary" className="!p-1.5 text-xl leading-none">×</Button>
            </div>

            {editError && <p role="alert" aria-live="assertive" className="mb-3 text-center text-red-300 bg-red-800/70 p-3 rounded whitespace-pre-wrap">{editError}</p>}
            
            <form onSubmit={handleUpdateTaskSubmit} className="space-y-3 overflow-y-auto flex-grow pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="editJobDate" className={labelStyles}>Job Date:<span className="text-red-400">*</span></label>
                  <Input type="date" id="editJobDate" name="jobDate" value={editFormData.jobDate} onChange={handleEditFormChange} className={inputStyles} required />
                </div>
                <div>
                  <label htmlFor="editJobId" className={labelStyles}>Job ID:<span className="text-red-400">*</span></label>
                  <Input type="text" id="editJobId" name="jobId" value={editFormData.jobId} onChange={handleEditFormChange} className={inputStyles} placeholder="Job ID" required />
                </div>
              </div>
              <div>
                <label htmlFor="editJobTitle" className={labelStyles}>Job Title:<span className="text-red-400">*</span></label>
                <Input type="text" id="editJobTitle" name="jobTitle" value={editFormData.jobTitle} onChange={handleEditFormChange} className={inputStyles} placeholder="Job Title" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="editFullName" className={labelStyles}>Full Name:<span className="text-red-400">*</span></label>
                  <Input type="text" id="editFullName" name="fullName" value={editFormData.fullName} onChange={handleEditFormChange} className={inputStyles} placeholder="Full Name" required />
                </div>
                <div>
                  <label htmlFor="editCompanyName" className={labelStyles}>Company Name:<span className="text-red-400">*</span></label>
                  <Input type="text" id="editCompanyName" name="companyName" value={editFormData.companyName} onChange={handleEditFormChange} className={inputStyles} placeholder="Company Name" required />
                </div>
              </div>
              <div>
                <label htmlFor="editCompanyLocation" className={labelStyles}>Company Location:</label>
                <Input type="text" id="editCompanyLocation" name="companyLocation" value={editFormData.companyLocation} onChange={handleEditFormChange} className={inputStyles} placeholder="Company Location" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="editRackNumber" className={labelStyles}>Rack Number:<span className="text-red-400">*</span></label>
                  <Input type="text" id="editRackNumber" name="rackNumber" value={editFormData.rackNumber} onChange={handleEditFormChange} className={inputStyles} placeholder="Rack Number" required />
                </div>
                <div>
                  <label htmlFor="editContact" className={labelStyles}>Contact:</label>
                  <Input type="tel" id="editContact" name="contact" value={editFormData.contact} onChange={handleEditFormChange} className={inputStyles} placeholder="Contact Number" />
                </div>
              </div>
              <div>
                <label htmlFor="editJobDescription" className={labelStyles}>Job Description:</label>
                <Textarea id="editJobDescription" name="jobDescription" value={editFormData.jobDescription} onChange={handleEditFormChange} className={inputStyles + " min-h-[80px]"} placeholder="Job Description" />
              </div>
              <div>
                <label htmlFor="editEncodedBy" className={labelStyles}>Encoded By:<span className="text-red-400">*</span></label>
                <Input type="text" id="editEncodedBy" name="encodedBy" value={editFormData.encodedBy} onChange={handleEditFormChange} className={inputStyles} placeholder="Encoder's Name" required />
              </div>
              <div className="flex items-center pt-2">
                <input
                  id="editIsCompleted"
                  name="isCompleted"
                  type="checkbox"
                  checked={editFormData.isCompleted}
                  onChange={handleEditFormChange}
                  className="h-4 w-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-offset-gray-800"
                />
                <label htmlFor="editIsCompleted" className="ml-2 block text-sm text-gray-300">
                  Task Completed
                </label>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:justify-end sm:space-x-2 space-y-2 sm:space-y-0">
                <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)} className="w-full sm:w-auto !px-3 !py-1.5 text-sm">
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white !px-3 !py-1.5 text-sm" disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagementListPage;