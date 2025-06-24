import React from 'react';

interface StorageItemData {
  sno: string;
  quantity: string;
  description: string; // This will be used for "Item" column
  rackNo: string;
  remarks: string;
}

interface DeviceStoragePrintData {
  company_name: string;
  date: string; // Expecting formatted date string or ISO string
  office_address: string;
  items: StorageItemData[];
  submitter_name: string;
  submitter_company_name: string;
  submitter_designation: string;
  submitter_contact: string;
  submitter_signature: string; // Typed name as signature
  prepared_by_signature: string; // Typed name as signature
}

interface PrintableDeviceStorageProps {
  storageData: DeviceStoragePrintData;
}

const PrintableDeviceStorage: React.FC<PrintableDeviceStorageProps> = ({ storageData }) => {
  const {
    company_name,
    date,
    office_address,
    items,
    submitter_name,
    submitter_company_name,
    submitter_designation,
    submitter_contact,
    submitter_signature,
    prepared_by_signature,
  } = storageData;

  const displayDate = date ? new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '_____________';

  const renderTableRows = () => {
    const rows = [];
    const minimumRowsToDisplay = 7; 
    const actualItemCount = items.length;

    for (let i = 0; i < actualItemCount; i++) {
      const item = items[i];
      rows.push(
        <tr key={item ? `item-${item.sno}-${i}` : `empty-${i}`} className="h-[2.5em]"> {/* Increased row height a bit */}
          <td className="border border-black px-1 py-0.5 text-center align-middle w-[15%]">{item.sno}</td>
          <td className="border border-black px-1 py-0.5 text-center align-middle w-[10%]">{item.quantity}</td>
          <td className="border border-black px-1 py-0.5 text-center align-middle w-[35%]">{item.description}</td> {/* Using description for "Item" */}
          <td className="border border-black px-1 py-0.5 text-center align-middle w-[15%]">{item.rackNo}</td>
          <td className="border border-black px-1 py-0.5 text-center align-middle w-[25%]">{item.remarks}</td>
        </tr>
      );
    }

    for (let i = actualItemCount; i < minimumRowsToDisplay; i++) {
      rows.push(
        <tr key={`empty-${i}`} className="h-[2.5em]">
          <td className="border border-black px-1 py-0.5 text-center align-middle"> </td>
          <td className="border border-black px-1 py-0.5 text-center align-middle"> </td>
          <td className="border border-black px-1 py-0.5 text-center align-middle"> </td>
          <td className="border border-black px-1 py-0.5 text-center align-middle"> </td>
          <td className="border border-black px-1 py-0.5 text-center align-middle"> </td>
        </tr>
      );
    }
    return rows;
  };
  
  const signatureBaseStyle: React.CSSProperties = {
    display: 'inline-block',
    borderBottom: '1px dotted black',
    minWidth: '200px', 
    marginLeft: '5px',
    paddingBottom: '1px',
    paddingLeft: '2px', 
    paddingRight: '2px', 
    lineHeight: '1.2em',
    boxSizing: 'border-box',
    verticalAlign: 'baseline', 
  };


  return (
    <div 
        className="printable-area bg-white text-black p-6 font-['Arial',_sans-serif] text-[10pt] w-[200mm] min-h-[270mm] mx-auto mb-[10mm] border border-black flex flex-col justify-start"
        style={{ fontFamily: 'Arial, sans-serif', fontSize: '10pt' }} 
    >
      {/* Header Section - Logo, Centered Title, Date */}
      <div className="flex justify-between items-start mb-4 relative print-header-layout">
          <div className="absolute top-0 left-0">
            <img 
              src="/images/Times Global.png"
              alt="Times Global Logo" 
              className="h-10 print-logo" 
            />
          </div>
          <div className="text-center flex-grow">
            <h1 className="font-bold text-lg print-company-form-title">TIMES GLOBAL DEVICE STORAGE FORM</h1>
          </div>
          <div className="absolute top-0 right-0 text-xs print-date-container">
            <span className="print-date-label">Date: </span>
            <span className="font-semibold print-date-value">{displayDate}</span>
          </div>
      </div>
      
      {/* Company Details */}
      <div className="mb-2 text-xs">
        <span className="mr-2">Name of our company:</span>
        <span className="font-semibold">{company_name}</span>
      </div>
      <div className="mb-4 text-xs">
        <span className="mr-2">Registered Office address:</span>
        <span className="font-semibold">{office_address}</span>
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse border border-black text-[9pt] mb-6 print-table">
        <thead>
          <tr className="print-table-header bg-gray-100"> 
            <th className="border border-black p-1 font-semibold w-[15%] text-center">Serial No.</th>
            <th className="border border-black p-1 font-semibold w-[10%] text-center">Quantity</th>
            <th className="border border-black p-1 font-semibold w-[35%] text-center">Item</th>
            <th className="border border-black p-1 font-semibold w-[15%] text-center">Rack Number</th>
            <th className="border border-black p-1 font-semibold w-[25%] text-center">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {renderTableRows()}
        </tbody>
      </table>

      {/* Submitter Details - Increased top and bottom margin (e.g., my-10 equivalent) */}
      <div className="text-xs print-submitter-details" style={{ marginTop: '10mm', marginBottom: '10mm' }}>
        <p className="font-semibold mb-1">Details of the person installing/storing the Devices:</p>
        <p className="ml-2">Name: <span className="font-semibold">{submitter_name}</span></p>
        <p className="ml-2">Company name: <span className="font-semibold">{submitter_company_name || 'N/A'}</span></p>
        <p className="ml-2">Designation: <span className="font-semibold">{submitter_designation || 'N/A'}</span></p>
        <p className="ml-2">Contact number: <span className="font-semibold">{submitter_contact || 'N/A'}</span></p>
        <p className="ml-2">Date: <span className="font-semibold">{displayDate}</span></p>
      </div>

      {/* Signatures - Using flex to align "Prepared by" to the right */}
      <div className="flex justify-between items-end mt-auto pt-6 text-xs print-footer-signatures">
        <div className="text-left">
          <p className="mb-1">Signature: 
            <span style={{ ...signatureBaseStyle, textAlign: 'left' }}>
              {submitter_signature}
            </span>
          </p>
        </div>
        <div className="text-right"> 
          <p className="mb-1">Prepared by Signature: 
            <span style={{ ...signatureBaseStyle, textAlign: 'left' }}> {/* Changed from 'right' to 'left' */}
              {prepared_by_signature}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrintableDeviceStorage;
