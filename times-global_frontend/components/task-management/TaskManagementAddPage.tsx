import React, { useState, useEffect, useCallback, useContext } from 'react';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import { apiService } from '../../services/apiService';
import { LocationContext } from '../LocationContext';

// Interface for form state (camelCase)
interface TaskFormData {
  jobDate: string;
  // jobId: string; // Removed, backend will handle
  jobTitle: string;
  fullName: string;
  companyName: string;
  companyLocation: string;
  rackNumber: string;
  jobDescription: string;
  contact: string;
  encodedBy: string;
}

// Interface for API payload (snake_case)
interface TaskPayload {
  location_id?: string | number;
  job_date: string;
  // job_id: string; // Removed
  job_title: string;
  full_name: string;
  company_name: string;
  company_location?: string;
  rack_number: string;
  job_description?: string;
  contact?: string;
  encoded_by: string;
}

// For fetching pre-registered user details (contact)
interface PreRegisteredUser {
  id: string;
  fullName: string; // Ensure backend search works with fullName
  contact?: string; 
  // Other fields from StoredImage if needed, but only contact is used here
}

const initialFormData: TaskFormData = {
  jobDate: '',
  // jobId: '', // Removed
  jobTitle: '',
  fullName: '',
  companyName: '',
  companyLocation: '',
  rackNumber: '',
  jobDescription: '',
  contact: '',
  encodedBy: '',
};

const TaskManagementAddPage: React.FC = () => {
  const [formData, setFormData] = useState<TaskFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { selectedLocation, username } = useContext(LocationContext); // Get username for Encoded By

  const [userLookupError, setUserLookupError] = useState<string | null>(null);
  const [isUserFoundForContact, setIsUserFoundForContact] = useState<boolean | null>(null);


  // Auto-fill "Encoded By" with the logged-in user's name
  useEffect(() => {
    if (username) {
      setFormData(prev => ({ ...prev, encodedBy: username }));
    }
  }, [username, selectedLocation]); // Re-fill if user or location changes, implying new session/context

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "fullName") { 
        setIsUserFoundForContact(null); // Reset contact lookup status
        setUserLookupError(null);
    }
  };

  const fetchPreRegisteredUserContact = useCallback(async (name: string) => {
    if (!name.trim()) {
        setIsUserFoundForContact(false); 
        setFormData(prev => ({ ...prev, contact: '' })); // Clear contact if name is empty
        return;
    }
    setUserLookupError(null);
    setIsUserFoundForContact(null); 
    try {
      const users = await apiService.getAll<PreRegisteredUser>(`/images/?search=${encodeURIComponent(name)}`);
      
      if (users.length > 0) {
        const foundUser = users[0];
        if (foundUser.contact) {
            setFormData(prev => ({ ...prev, contact: foundUser.contact || '' }));
            setIsUserFoundForContact(true);
        } else {
            setUserLookupError(`User '${name}' found, but no contact number registered.`);
            setIsUserFoundForContact(false); // Found, but no contact
        }
      } else {
        setUserLookupError(`User '${name}' not found in registered images. Contact needs manual entry.`);
        setIsUserFoundForContact(false);
      }
    } catch (err: any) {
      console.error('User contact lookup error:', err);
      setUserLookupError(`Error looking up contact: ${err.message}. Please enter manually.`);
      setIsUserFoundForContact(false);
    }
  }, []);

  const handleFullNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const currentFullName = e.target.value;
    if (currentFullName.trim()) { 
        fetchPreRegisteredUserContact(currentFullName.trim());
    } else { 
        setIsUserFoundForContact(false);
        setUserLookupError(null);
        setFormData(prev => ({ ...prev, contact: '' })); // Clear contact if name is cleared
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!selectedLocation || !selectedLocation.id) {
        setError("No location selected. Please select a location from the dashboard.");
        setIsLoading(false);
        return;
    }

    const payload: TaskPayload = {
      location_id: selectedLocation.id,
      job_date: formData.jobDate,
      job_title: formData.jobTitle,
      full_name: formData.fullName,
      company_name: formData.companyName,
      company_location: formData.companyLocation || undefined, 
      rack_number: formData.rackNumber,
      job_description: formData.jobDescription || undefined,
      contact: formData.contact || undefined,
      encoded_by: formData.encodedBy,
    };

    if (!payload.job_date || !payload.job_title || !payload.full_name || !payload.company_name || !payload.rack_number || !payload.encoded_by) {
      setError("Please fill in all required fields: Job Date, Job Title, Full Name, Company Name, Rack Number, Encoded By.");
      setIsLoading(false);
      return;
    }
    
    try {
      await apiService.post('/task-management/tasks/', payload);
      setSuccessMessage('Task added successfully!'); 
      
      const currentEncodedBy = username || '';
      setFormData({...initialFormData, encodedBy: currentEncodedBy});
      setIsUserFoundForContact(null);
      setUserLookupError(null);

    } catch (err: any) { 
      console.error('Add Task Error:', err);
      
      // Safely access err.data
      const errorData = (err as { data?: any; message?: string })?.data;

      if (errorData && typeof errorData === 'object') {
        const backendErrors = Object.entries(errorData)
          .map(([key, value]) => {
            const fieldName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); 
            return `${fieldName}: ${(Array.isArray(value) ? value.join(', ') : String(value))}`;
           })
          .join(' \n');
        setError(backendErrors || 'Failed to add task. Please check the details and try again.');
      } else {
        // Fallback to err.message if err.data is not available or not an object
        setError((err as Error)?.message || 'An unexpected error occurred while adding the task.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyles = "bg-slate-600 border-slate-500 text-gray-100 placeholder-gray-400 focus:ring-red-500 focus:border-red-500";
  const labelStyles = "block text-sm font-medium text-gray-300 mb-1";

  return (
    <div className="h-full flex flex-col">
      <header className="bg-red-700 text-white py-3 px-6 shadow-md rounded-t-lg mb-4">
        <h2 className="text-2xl font-bold text-center">Add Task ({selectedLocation?.name || 'No Location Selected'})</h2>
      </header>
      <div className="flex-grow p-4 sm:p-6 bg-slate-700 bg-opacity-60 backdrop-blur-sm rounded-b-lg shadow-inner_lg overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl mx-auto">
          {error && <p role="alert" aria-live="assertive" className="text-center text-red-300 bg-red-800/70 p-3 rounded whitespace-pre-wrap">{error}</p>}
          {successMessage && <p role="alert" aria-live="polite" className="text-center text-green-300 bg-green-800/70 p-3 rounded">{successMessage}</p>}

          <div className="md:col-span-2"> 
            <label htmlFor="jobDate" className={labelStyles}>Job Date:<span className="text-red-400">*</span></label>
            <Input type="date" id="jobDate" name="jobDate" value={formData.jobDate} onChange={handleChange} className={inputStyles} required />
          </div>

          <div>
            <label htmlFor="jobTitle" className={labelStyles}>Job Title:<span className="text-red-400">*</span></label>
            <Input type="text" id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className={inputStyles} placeholder="Enter Job Title" required />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fullName" className={labelStyles}>Full Name:<span className="text-red-400">*</span></label>
              <Input 
                type="text" 
                id="fullName" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                onBlur={handleFullNameBlur}
                className={inputStyles} 
                placeholder="Enter Full Name (for contact lookup)" 
                required 
              />
                {isUserFoundForContact === null && formData.fullName.trim() && !userLookupError && <p className="text-xs text-yellow-300 mt-1">Checking for contact...</p>}
                {userLookupError && <p className="text-xs text-yellow-400 mt-1">{userLookupError}</p>}
                {isUserFoundForContact === true && <p className="text-xs text-green-400 mt-1">Contact auto-filled where available.</p>}
            </div>
            <div>
              <label htmlFor="companyName" className={labelStyles}>Company Name:<span className="text-red-400">*</span></label>
              <Input type="text" id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} className={inputStyles} placeholder="Enter Company Name" required />
            </div>
          </div>

          <div>
            <label htmlFor="companyLocation" className={labelStyles}>Company Location:</label>
            <Input type="text" id="companyLocation" name="companyLocation" value={formData.companyLocation} onChange={handleChange} className={inputStyles} placeholder="Enter Company Location" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="rackNumber" className={labelStyles}>Rack Number:<span className="text-red-400">*</span></label>
              <Input type="text" id="rackNumber" name="rackNumber" value={formData.rackNumber} onChange={handleChange} className={inputStyles} placeholder="Enter Rack Number" required />
            </div>
            <div>
              <label htmlFor="contact" className={labelStyles}>Contact:</label>
              <Input type="tel" id="contact" name="contact" value={formData.contact} onChange={handleChange} className={inputStyles} placeholder="Auto-fills or Enter Contact" />
            </div>
          </div>

          <div>
            <label htmlFor="jobDescription" className={labelStyles}>Job Description:</label>
            <Textarea id="jobDescription" name="jobDescription" value={formData.jobDescription} onChange={handleChange} className={inputStyles + " min-h-[100px]"} placeholder="Enter Job Description" />
          </div>
          
          <div>
            <label htmlFor="encodedBy" className={labelStyles}>Encoded By:<span className="text-red-400">*</span></label>
            <Input type="text" id="encodedBy" name="encodedBy" value={formData.encodedBy} onChange={handleChange} className={inputStyles} placeholder="Auto-filled or Enter Encoder's Name" required />
          </div>

          <div className="pt-3">
            <Button 
              type="submit" 
              fullWidth 
              className="bg-red-600 hover:bg-red-700 text-white" 
              disabled={isLoading || !selectedLocation}
            >
              {isLoading ? 'Submitting...' : 'Submit Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskManagementAddPage;