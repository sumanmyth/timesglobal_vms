import React, { useState, useCallback } from 'react';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import { apiService } from '../../services/apiService';

interface FormData {
  idNumberType: string;
  fullName: string;
  contact: string;
  email: string;
  reason: string;
  approvedBy: string;
  requestedBy: string;
  requestSource: string;
}

interface PreRegisteredUser {
  id: string;
  fullName: string;
  idType: string;
  contact?: string; 
  email?: string;   
  imageFile?: string; 
}

interface ApiResponse<T> {
  results?: T[];
  [key: string]: any; 
}


const VMSAddRecordPage: React.FC = () => {
  const initialFormData: FormData = {
    idNumberType: '',
    fullName: '',
    contact: '',
    email: '',
    reason: '',
    approvedBy: '',
    requestedBy: '',
    requestSource: '',
  };
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userLookupError, setUserLookupError] = useState<string | null>(null);
  const [isUserPreRegistered, setIsUserPreRegistered] = useState<boolean | null>(null);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: FormData) => ({ ...prev, [name]: value }));
    if (name === "fullName") { 
        setIsUserPreRegistered(null);
        setUserLookupError(null);
        if (isUserPreRegistered !== null) { 
            setFormData((prev: FormData) => ({
                ...prev,
                idNumberType: '',
                contact: '',
                email: '',
            }));
        }
    }
  };

  const fetchPreRegisteredUserDetails = useCallback(async (name: string) => {
    if (!name.trim()) {
        setIsUserPreRegistered(false); 
        setFormData((prev: FormData) => ({
            ...prev,
            idNumberType: '',
            contact: '',
            email: '',
        }));
        return;
    }
    setUserLookupError(null);
    setIsUserPreRegistered(null); 
    try {
      const data = await apiService.get<PreRegisteredUser[] | ApiResponse<PreRegisteredUser>>(`/images/?search=${encodeURIComponent(name)}`);
      const users: PreRegisteredUser[] = Array.isArray(data) ? data : (data.results || []);
      
      if (users.length > 0) {
        const foundUser = users[0];
        setFormData((prev: FormData) => ({
          ...prev,
          fullName: prev.fullName, 
          idNumberType: foundUser.idType || '',
          contact: foundUser.contact || '', 
          email: foundUser.email || '',   
        }));
        setIsUserPreRegistered(true);
      } else {
        setUserLookupError(`User '${name}' not found or not pre-registered. Please register first for auto-filled details, or proceed with manual entry.`);
        setFormData((prev: FormData) => ({
            ...prev,
            idNumberType: '',
            contact: '',
            email: '',
        }));
        setIsUserPreRegistered(false);
      }
    } catch (err: any) {
      console.error('User lookup error:', err);
      setUserLookupError(`Error looking up user: ${err.message}. Proceed with manual entry.`);
      setIsUserPreRegistered(false);
    }
  }, []);

  const handleFullNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const currentFullName = e.target.value;
    if (currentFullName.trim()) { 
        fetchPreRegisteredUserDetails(currentFullName.trim());
    } else { 
        setIsUserPreRegistered(false);
        setUserLookupError(null);
        setFormData((prev: FormData) => ({
            ...prev,
            idNumberType: '',
            contact: '',
            email: '',
        }));
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!formData.fullName) {
        setError("Full Name is required to add a record.");
        setIsLoading(false);
        return;
    }
    
    const payload = { ...formData };

    try {
      await apiService.post('/visitors/', payload);
      setSuccessMessage('New visitor record submitted successfully!');
      setFormData(initialFormData); 
      setIsUserPreRegistered(null);
      setUserLookupError(null);
    } catch (err: any) {
      console.error('Add Visitor Error:', err);
      setError(err.message || err.detail || 'Failed to submit new visitor record.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyles = "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-red-500 focus:border-red-500";
  const labelStyles = "block text-sm font-medium text-gray-300 mb-1";

  return (
    <div className="flex flex-col h-full"> {/* bg-gray-900 removed */}
      <div className="bg-red-700 bg-opacity-75 backdrop-blur-sm text-white p-3 shadow-md">
        <h2 className="text-xl font-semibold text-center">Add New Visitor Record</h2>
      </div>

      <div className="flex-grow p-6 bg-slate-700 bg-opacity-60 backdrop-blur-md rounded-b-lg shadow-inner_lg overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto">
          {error && <p role="alert" aria-live="assertive" className="mb-4 text-center text-red-300 bg-red-800/70 p-3 rounded">{error}</p>}
          {successMessage && <p role="alert" aria-live="polite" className="mb-4 text-center text-green-300 bg-green-800/70 p-3 rounded">{successMessage}</p>}
          
          <div>
            <label htmlFor="fullName" className={labelStyles}>Full Name:</label>
            <Input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleFullNameBlur} 
              className={inputStyles}
              placeholder="Type full name and tab out to find registered user"
              required
            />
            {isUserPreRegistered === null && formData.fullName.trim() && !userLookupError && <p className="text-xs text-yellow-400 mt-1">Looking up user...</p>}
            {userLookupError && <p className="text-xs text-yellow-400 mt-1">{userLookupError}</p>}
            {isUserPreRegistered === true && <p className="text-xs text-green-400 mt-1">User details found and pre-filled where available.</p>}
          </div>

          <div>
            <label htmlFor="idNumberType" className={labelStyles}>ID Number/type:</label>
            <Input
              type="text"
              id="idNumberType"
              name="idNumberType"
              value={formData.idNumberType}
              onChange={handleChange}
              className={inputStyles}
            />
          </div>
          
          <div>
            <label htmlFor="contact" className={labelStyles}>Contact:</label>
            <Input
              type="tel"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className={inputStyles}
            />
          </div>
          <div>
            <label htmlFor="email" className={labelStyles}>Email:</label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputStyles}
            />
          </div>
          <div>
            <label htmlFor="reason" className={labelStyles}>Reason:</label>
            <Textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className={inputStyles + " min-h-[100px]"}
            />
          </div>
          <div>
            <label htmlFor="approvedBy" className={labelStyles}>Approved By:</label>
            <Input
              type="text"
              id="approvedBy"
              name="approvedBy"
              value={formData.approvedBy}
              onChange={handleChange}
              className={inputStyles}
            />
          </div>
          <div>
            <label htmlFor="requestedBy" className={labelStyles}>Requested By:</label>
            <Input
              type="text"
              id="requestedBy"
              name="requestedBy"
              value={formData.requestedBy}
              onChange={handleChange}
              className={inputStyles}
            />
          </div>
          <div>
            <label htmlFor="requestSource" className={labelStyles}>Request Source:</label>
            <Input
              type="text"
              id="requestSource"
              name="requestSource"
              value={formData.requestSource}
              onChange={handleChange}
              className={inputStyles}
            />
          </div>
          <div className="pt-3">
            <Button type="submit" fullWidth className="bg-red-600 hover:bg-red-700 text-white" disabled={isLoading}>
              {isLoading ? 'Checking In...' : 'Check In'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VMSAddRecordPage;