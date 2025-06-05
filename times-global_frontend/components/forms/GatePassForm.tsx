
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import { apiService } from '../../services/apiService';
import PrintableGatePass from './PrintableGatePass'; 

interface GatePassFormProps {
  onLogout: () => void;
}

interface GatePassItem {
  id: string; 
  sno: string; 
  itemName: string;
  description: string;
  quantity: string;
  remarks: string;
}

interface GatePassItemPayload { 
  sno: string;
  itemName: string;
  description: string;
  quantity: string;
  remarks: string;
}

interface GatePassResponseData { 
  id: string; 
  recipient_name: string;
  recipient_address: string;
  items: GatePassItemPayload[]; 
  prepared_by: string;
  received_by: string;
  approved_by: string;
  pass_date: string; 
}

interface ApiResponse<T> {
  results?: T[];
  [key: string]: any;
}


const GatePassForm: React.FC<GatePassFormProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [recipientName, setRecipientName] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  
  const [items, setItems] = useState<GatePassItem[]>([
    { id: Date.now().toString(), sno: '', itemName: '', description: '', quantity: '', remarks: '' } 
  ]);

  const [preparedBy, setPreparedBy] = useState<string>('');
  const [receivedBy, setReceivedBy] = useState<string>('');
  const [approvedBy, setApprovedBy] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [submittedGatePassData, setSubmittedGatePassData] = useState<GatePassResponseData | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState<boolean>(false);

  // State for "View Previous Passes" modal
  const [showPreviousPassesModal, setShowPreviousPassesModal] = useState<boolean>(false);
  const [previousPasses, setPreviousPasses] = useState<GatePassResponseData[]>([]);
  const [isLoadingPreviousPasses, setIsLoadingPreviousPasses] = useState<boolean>(false);
  const [previousPassesError, setPreviousPassesError] = useState<string | null>(null);
  const [reprintLoadingId, setReprintLoadingId] = useState<string | null>(null);


  const handleRecipientNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setRecipientName(e.target.value);
  const handleRecipientAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => setRecipientAddress(e.target.value);
  const handlePreparedByChange = (e: React.ChangeEvent<HTMLInputElement>) => setPreparedBy(e.target.value);
  const handleReceivedByChange = (e: React.ChangeEvent<HTMLInputElement>) => setReceivedBy(e.target.value);
  const handleApprovedByChange = (e: React.ChangeEvent<HTMLInputElement>) => setApprovedBy(e.target.value);

  const handleAddItemRow = () => {
    setItems((prevItems: GatePassItem[]) => [
        ...prevItems, 
        { 
            id: Date.now().toString(), 
            sno: '', 
            itemName: '', description: '', quantity: '', remarks: '' 
        }
    ]);
  };

  const handleRemoveItemRow = (id: string) => {
    setItems((prevItems: GatePassItem[]) => 
        prevItems.filter((item: GatePassItem) => item.id !== id)
    ); 
  };

  const handleItemChange = (id: string, field: keyof GatePassItemPayload, value: string) => {
    setItems((prevItems: GatePassItem[]) =>
      prevItems.map((item: GatePassItem) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const resetForm = () => {
    setRecipientName('');
    setRecipientAddress('');
    setItems([{ id: Date.now().toString(), sno: '', itemName: '', description: '', quantity: '', remarks: '' }]);
    setPreparedBy('');
    setReceivedBy('');
    setApprovedBy('');
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setSubmittedGatePassData(null);
    setShowPrintPreview(false);

    const itemsPayload: GatePassItemPayload[] = items.map(({ id, ...restOfItem }) => restOfItem);


    const formDataToSubmit = {
      recipient_name: recipientName,
      recipient_address: recipientAddress,
      items: itemsPayload,
      prepared_by: preparedBy,
      received_by: receivedBy,
      approved_by: approvedBy,
    };

    try {
      const response = await apiService.post<GatePassResponseData>('/gate-passes/', formDataToSubmit);
      setSuccessMessage('Gate Pass form submitted successfully! Preparing print preview...');
      
      setSubmittedGatePassData(response); 
      setShowPrintPreview(true);
      resetForm(); 
    } catch (err: any) {
      console.error('Gate Pass Form Submission Error:', err);
      const errorMessage = err.data?.detail || err.message || 'Failed to submit gate pass form.';
      if (err.status === 500) {
        setError(`Internal Server Error. Please check backend logs. Details: ${errorMessage}`);
      } else if (err.data) { 
        const fieldErrors = Object.entries(err.data).map(([key, value]) => {
            if (key === 'items' && Array.isArray(value)) {
                return value.map((itemError: any, index: number) => 
                    Object.entries(itemError).map(([itemKey, itemValue]) => 
                        `Item ${index+1} ${itemKey}: ${ (Array.isArray(value) ? value.join(', ') : String(value))}`
                    ).join('; ')
                ).join(' | ');
            }
            return `${key}: ${(Array.isArray(value) ? value.join(', ') : String(value))}`;
        }).join(' ');
        setError(fieldErrors || errorMessage);
      }
      else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    const printWrapper = document.querySelector('.gate-pass-print-preview-wrapper');
    if(printWrapper) {
        document.body.classList.add('printing-now');
        document.body.classList.add('gate-pass-active-print'); 
        printWrapper.classList.add('print-this-section');
    }
    
    window.print();
    
    if(printWrapper) {
        printWrapper.classList.remove('print-this-section');
    }
    document.body.classList.remove('gate-pass-active-print');
    document.body.classList.remove('printing-now');
  };

  const handleClosePrintPreview = () => {
    setShowPrintPreview(false);
    setSubmittedGatePassData(null);
    setSuccessMessage(null); 
  };

  const handleEditForm = () => {
    if (submittedGatePassData) {
      setRecipientName(submittedGatePassData.recipient_name);
      setRecipientAddress(submittedGatePassData.recipient_address);
      
      const repopulatedItems = submittedGatePassData.items.map((item, index) => ({
        ...item,
        id: Date.now().toString() + index 
      }));
      setItems(repopulatedItems);

      setPreparedBy(submittedGatePassData.prepared_by);
      setReceivedBy(submittedGatePassData.received_by);
      setApprovedBy(submittedGatePassData.approved_by);

      setShowPrintPreview(false);
      setSubmittedGatePassData(null);
      setError(null);
      setSuccessMessage(null);
    }
  };

  const fetchPreviousPasses = async () => {
    setIsLoadingPreviousPasses(true);
    setPreviousPassesError(null);
    try {
      const response = await apiService.get<ApiResponse<GatePassResponseData>>('/gate-passes/');
      setPreviousPasses(response.results || []);
    } catch (err: any) {
      console.error('Fetch Previous Passes Error:', err);
      setPreviousPassesError(err.message || 'Failed to fetch previous gate passes.');
      setPreviousPasses([]);
    } finally {
      setIsLoadingPreviousPasses(false);
    }
  };

  const handleTogglePreviousPassesModal = () => {
    setShowPreviousPassesModal(prev => !prev);
    if (!showPreviousPassesModal) { // If opening modal
      fetchPreviousPasses();
    }
  };

  const handleReprintPass = async (passId: string) => {
    setReprintLoadingId(passId);
    setError(null);
    setSuccessMessage(null);
    try {
      const passData = await apiService.get<GatePassResponseData>(`/gate-passes/${passId}/`);
      setSubmittedGatePassData(passData);
      setShowPrintPreview(true);
      setShowPreviousPassesModal(false); 
    } catch (err: any) {
      console.error('Reprint Gate Pass Error:', err);
      setError(`Failed to load gate pass for reprint: ${err.message || err.detail}`);
    } finally {
      setReprintLoadingId(null);
    }
  };
  
  const formatModalDate = (isoDate: string) => {
    try {
      return new Date(isoDate).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch {
      return isoDate;
    }
  };


  if (showPrintPreview && submittedGatePassData) {
    return (
      <div className="bg-gray-100 py-10 px-4 gate-pass-print-preview-wrapper"> 
        <div className="max-w-4xl mx-auto bg-white p-6 shadow-xl rounded-lg no-print"> 
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Gate Pass Preview</h2>
          {successMessage && <p className="mb-4 text-center text-green-600">{successMessage}</p>}
        </div>

        <div className="print-container-for-two-slips flex flex-col items-center gap-5"> 
            <PrintableGatePass gatePassData={submittedGatePassData} />
            <PrintableGatePass gatePassData={submittedGatePassData} /> 
        </div>

        <div className="mt-8 flex justify-center items-center space-x-4 no-print">
          <Button onClick={handlePrint} className="bg-red-600 hover:bg-red-700 text-white">
            Print Gate Pass (2 Copies)
          </Button>
          <Button onClick={handleEditForm} variant="secondary" className="bg-blue-600 hover:bg-blue-700 text-white">
            Edit Pass
          </Button>
          <Button onClick={handleClosePrintPreview} variant="secondary">
            Create New Gate Pass
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative" 
      style={{ 
        backgroundImage: "url('/images/bgdatacenter.jpeg')", 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed' 
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-lg z-0"></div>
      <div className="relative z-10 min-h-screen text-gray-100 flex flex-col">
        <header className="bg-slate-800 bg-opacity-70 backdrop-blur-md shadow-lg p-4 no-print">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button type="button" onClick={() => navigate('/dashboard')} variant="secondary" className="!px-4 !py-2">
                ← Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-red-600">Times Global</h1>
                <p className="text-gray-300">Management Software</p>
              </div>
            </div>
            <Button type="button" onClick={onLogout} variant="secondary">
              Logout
            </Button>
          </div>
        </header>

        <main className="flex-grow container mx-auto p-6 md:p-8 no-print">
          <form onSubmit={handleSubmit} className="bg-slate-700 bg-opacity-60 backdrop-blur-md p-6 md:p-8 rounded-lg shadow-2xl max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-semibold text-red-500">Create Gatepass</h2>
              <Button 
                type="button" 
                onClick={handleTogglePreviousPassesModal} 
                variant="secondary" 
                className="bg-teal-600 hover:bg-teal-700"
              >
                View Previous Passes
              </Button>
            </div>
            
            {error && <p role="alert" aria-live="assertive" className="mb-4 text-center text-red-300 bg-red-800/50 p-3 rounded whitespace-pre-wrap">{error}</p>}

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-red-500 mb-1 border-b-2 border-red-500 pb-2">Recipient Details</h3>
              <div className="mt-4 grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="recipientName" className="block text-sm font-medium text-gray-300 mb-1">MR/MRS.:</label>
                  <Input id="recipientName" name="recipientName" type="text" value={recipientName} onChange={handleRecipientNameChange} placeholder="Recipient's Full Name" required/>
                </div>
                <div>
                  <label htmlFor="recipientAddress" className="block text-sm font-medium text-gray-300 mb-1">ADDRESS:</label>
                  <Input id="recipientAddress" name="recipientAddress" type="text" value={recipientAddress} onChange={handleRecipientAddressChange} placeholder="Recipient's Address" />
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-red-500 mb-1 border-b-2 border-red-500 pb-2">Items Details</h3>
              <div className="mt-4 space-y-4">
                <div className="hidden md:grid grid-cols-[minmax(100px,1fr)_1.5fr_2fr_1fr_1.5fr_auto] gap-2 text-sm font-medium text-gray-300 px-2 py-1 border-b border-gray-700 items-center">
                  <span>S.NO.</span>
                  <span>ITEM</span>
                  <span>DESCRIPTION</span>
                  <span>QUANTITY</span>
                  <span>REMARKS</span>
                  <span className="text-center">ACTION</span>
                </div>
                {items.map((item: GatePassItem, index: number) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-[minmax(100px,1fr)_1.5fr_2fr_1fr_1.5fr_auto] gap-3 items-center bg-gray-700/50 p-3 rounded">
                    <Input 
                      aria-label="Serial Number" 
                      type="text" 
                      placeholder="S.No." 
                      value={item.sno} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(item.id, 'sno', e.target.value)} 
                    />
                    <Input aria-label="Item Name" type="text" placeholder="Item" value={item.itemName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(item.id, 'itemName', e.target.value)} required />
                    <Input aria-label="Description" type="text" placeholder="Description" value={item.description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(item.id, 'description', e.target.value)} />
                    <Input aria-label="Quantity" type="text" placeholder="Quantity" value={item.quantity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(item.id, 'quantity', e.target.value)} required />
                    <Input aria-label="Remarks" type="text" placeholder="Remarks" value={item.remarks} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(item.id, 'remarks', e.target.value)} />
                    <Button type="button" onClick={() => handleRemoveItemRow(item.id)} className="bg-red-600 hover:bg-red-700 text-white !py-2 w-full md:w-auto" disabled={items.length <= 1}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" onClick={handleAddItemRow} className="mt-4 bg-red-600 hover:bg-red-700 text-white w-full">
                ADD ITEM ROW
              </Button>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-red-500 mb-1 border-b-2 border-red-500 pb-2">Approval Details</h3>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="preparedBy" className="block text-sm font-medium text-gray-300 mb-1">PREPARED BY:</label>
                  <Input id="preparedBy" name="preparedBy" type="text" value={preparedBy} onChange={handlePreparedByChange} placeholder="Name of preparer" required/>
                </div>
                <div>
                  <label htmlFor="receivedBy" className="block text-sm font-medium text-gray-300 mb-1">RECEIVED BY:</label>
                  <Input id="receivedBy" name="receivedBy" type="text" value={receivedBy} onChange={handleReceivedByChange} placeholder="Name of receiver" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="approvedBy" className="block text-sm font-medium text-gray-300 mb-1">APPROVED BY:</label>
                  <Input id="approvedBy" name="approvedBy" type="text" value={approvedBy} onChange={handleApprovedByChange} placeholder="Name of approver" required/>
                </div>
              </div>
            </section>

            <div className="mt-10 text-center">
              <Button type="submit" className="w-full md:w-auto bg-red-700 hover:bg-red-800 text-white text-lg px-10 py-3" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'SAVE & GENERATE PASS'}
              </Button>
            </div>
          </form>
        </main>

        {showPreviousPassesModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={handleTogglePreviousPassesModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="previousPassesModalTitle"
          >
            <div 
              className="bg-slate-800 bg-opacity-80 backdrop-blur-md p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()} 
            >
              <div className="flex justify-between items-center mb-4">
                  <h3 id="previousPassesModalTitle" className="text-2xl font-semibold text-red-500">Previous Gate Passes</h3>
                  <Button type="button" onClick={handleTogglePreviousPassesModal} variant="secondary" className="!p-2">&times;</Button>
              </div>
              {isLoadingPreviousPasses && <p className="text-center text-gray-300">Loading previous passes...</p>}
              {previousPassesError && <p role="alert" className="text-center text-red-400 bg-red-900/50 p-3 rounded">{previousPassesError}</p>}
              {!isLoadingPreviousPasses && !previousPassesError && (
                <div className="overflow-y-auto flex-grow">
                  {previousPasses.length === 0 ? (
                    <p className="text-center text-gray-400 py-4">No previous gate passes found.</p>
                  ) : (
                    <ul className="space-y-3">
                      {previousPasses.map((pass) => (
                        <li key={pass.id} className="bg-slate-700 bg-opacity-70 backdrop-blur-sm p-4 rounded-md flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-300">Date: <span className="font-semibold text-gray-100">{formatModalDate(pass.pass_date)}</span></p>
                            <p className="text-sm text-gray-300">Recipient: <span className="font-semibold text-gray-100">{pass.recipient_name}</span></p>
                          </div>
                          <Button 
                            type="button"
                            onClick={() => handleReprintPass(pass.id)} 
                            variant="primary" 
                            className="!px-3 !py-1.5 text-sm"
                            disabled={reprintLoadingId === pass.id}
                          >
                            {reprintLoadingId === pass.id ? 'Loading...' : 'Reprint'}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <div className="mt-4 text-right">
                  <Button type="button" onClick={handleTogglePreviousPassesModal} variant="secondary">Close</Button>
              </div>
            </div>
          </div>
        )}

        <footer className="bg-slate-800 bg-opacity-70 backdrop-blur-md p-4 text-center text-gray-300 text-sm mt-auto no-print">
          © {new Date().getFullYear()} Times Global Data Centre. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default GatePassForm;
