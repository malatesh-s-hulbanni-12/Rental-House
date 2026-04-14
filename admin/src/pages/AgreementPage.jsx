import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaPrint, FaArrowLeft, FaHome, FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaRupeeSign, FaKey, FaMoneyBillWave, FaCalendarCheck } from 'react-icons/fa';

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AgreementPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rentalId = searchParams.get('id');
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (rentalId) {
      fetchRentalDetails();
    } else {
      setError('No rental agreement ID provided');
      setLoading(false);
    }
  }, [rentalId]);

  const fetchRentalDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rentals/${rentalId}`);
      const data = await response.json();
      if (data.success) {
        setRental(data.data);
      } else {
        setError('Failed to load agreement details');
      }
    } catch (error) {
      console.error('Error fetching rental:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Get monthly payment day from start date
  const getPaymentDay = (startDate) => {
    const date = new Date(startDate);
    return date.getDate();
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading agreement...</p>
        </div>
      </div>
    );
  }

  if (error || !rental) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4">
          <FaHome className="text-5xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600">{error || 'Rental agreement not found'}</p>
          <button
            onClick={() => navigate('/admin/rentals')}
            className="mt-6 bg-emerald-500 text-white px-6 py-2 rounded-xl hover:bg-emerald-600 transition"
          >
            Back to Rentals
          </button>
        </div>
      </div>
    );
  }

  const paymentDay = getPaymentDay(rental.startDate);
  const advanceAmount = rental.advanceAmount || 0;
  const securityDeposit = rental.rentAmount * 2;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Print Button - Hidden when printing */}
      <div className="bg-white shadow-md sticky top-0 z-10 print:hidden">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
          <button
            onClick={() => navigate('/admin/rentals')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition w-full sm:w-auto justify-center"
          >
            <FaArrowLeft /> Back to Rentals
          </button>
          <button
            onClick={handlePrint}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition w-full sm:w-auto justify-center"
          >
            <FaPrint /> Print Agreement
          </button>
        </div>
      </div>

      {/* Agreement Content - A4 Format */}
      {/* Add print-only class to ensure navbar doesn't print */}
      <div className="print-only-content">
        <div className="p-4 print:p-0" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
          <div className="max-w-4xl mx-auto bg-white shadow-xl print:shadow-none rounded-lg print:rounded-none overflow-hidden">
            
            {/* Agreement Body */}
            <div className="p-6 md:p-8 lg:p-10 print:p-8">
              
              {/* Header */}
              <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                  RENTAL AGREEMENT
                </h1>
                <p className="text-gray-600 text-sm md:text-base">
                  This Rental Agreement is made and executed on this day
                </p>
              </div>

              {/* Date */}
              <div className="mb-6 text-right">
                <p className="text-gray-700 text-sm md:text-base">
                  Date: <span className="font-semibold">{formatDate(new Date())}</span>
                </p>
              </div>

              {/* Parties Involved */}
              <div className="mb-8">
                <h2 className="text-lg md:text-xl font-bold mb-4 border-b border-gray-400 pb-2">
                  1. PARTIES INVOLVED
                </h2>
                <div className="space-y-3 ml-2 md:ml-4">
                  <p className="text-gray-800 text-sm md:text-base">
                    <span className="font-semibold">Landlord/Owner:</span> M/S HULBANNI HOUSING PRIVATE LIMITED
                  </p>
                  <p className="text-gray-800 text-sm md:text-base">
                    <span className="font-semibold">Tenant:</span> {rental.tenantName}
                  </p>
                  <div className="ml-4 md:ml-8 space-y-1">
                    <p className="text-gray-700 text-sm">Email: {rental.tenantEmail}</p>
                    <p className="text-gray-700 text-sm">Phone: {rental.tenantPhone}</p>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="mb-8">
                <h2 className="text-lg md:text-xl font-bold mb-4 border-b border-gray-400 pb-2">
                  2. PROPERTY DETAILS
                </h2>
                <div className="space-y-2 ml-2 md:ml-4">
                  <p className="text-gray-800 text-sm md:text-base">
                    <span className="font-semibold">Property ID:</span> {rental.houseId}
                  </p>
                  <p className="text-gray-800 text-sm md:text-base">
                    <span className="font-semibold">Property Title:</span> {rental.houseTitle}
                  </p>
                  <p className="text-gray-800 text-sm md:text-base">
                    <span className="font-semibold">Property Type:</span> Residential Rental Property
                  </p>
                </div>
              </div>

              {/* Term of Agreement */}
              <div className="mb-8">
                <h2 className="text-lg md:text-xl font-bold mb-4 border-b border-gray-400 pb-2">
                  3. TERM OF AGREEMENT
                </h2>
                <div className="space-y-2 ml-2 md:ml-4">
                  <p className="text-gray-800 text-sm md:text-base">
                    <span className="font-semibold">Start Date:</span> {formatDate(rental.startDate)}
                  </p>
                  <p className="text-gray-800 text-sm md:text-base">
                    <span className="font-semibold">End Date:</span> {formatDate(rental.endDate)}
                  </p>
                  <p className="text-gray-800 text-sm md:text-base">
                    <span className="font-semibold">Agreement Status:</span> {rental.agreementStatus}
                  </p>
                </div>
              </div>

              {/* Rent, Advance & Payment Schedule */}
              <div className="mb-8">
                <h2 className="text-lg md:text-xl font-bold mb-4 border-b border-gray-400 pb-2">
                  4. RENT, ADVANCE & PAYMENT SCHEDULE
                </h2>
                <div className="space-y-3 ml-2 md:ml-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-600 text-sm">Monthly Rent</p>
                      <p className="text-gray-800 font-bold text-xl text-emerald-600">
                        ₹{rental.rentAmount?.toLocaleString()}
                      </p>
                      <p className="text-gray-500 text-xs">per month</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-600 text-sm">Advance/Deposit Amount</p>
                      <p className="text-gray-800 font-bold text-xl text-blue-600">
                        ₹{advanceAmount.toLocaleString()}
                      </p>
                      <p className="text-gray-500 text-xs">paid at signing</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg mt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <FaCalendarCheck className="text-blue-600" />
                      <p className="font-semibold text-gray-800">Monthly Payment Schedule</p>
                    </div>
                    <p className="text-gray-700 text-sm md:text-base">
                      Rent shall be paid on or before the <span className="font-bold text-blue-600">{paymentDay}th</span> day of every month.
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      * First payment is due on {formatDate(rental.startDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Deposit */}
              <div className="mb-8">
                <h2 className="text-lg md:text-xl font-bold mb-4 border-b border-gray-400 pb-2">
                  5. SECURITY DEPOSIT
                </h2>
                <div className="ml-2 md:ml-4">
                  <p className="text-gray-800 text-sm md:text-base">
                    A security deposit of{' '}
                    <span className="font-semibold">₹{securityDeposit.toLocaleString()}</span> 
                    (Two months rent) is paid by the tenant to the landlord, which is refundable at the time of 
                    vacating the property subject to no damages.
                  </p>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="mb-8">
                <h2 className="text-lg md:text-xl font-bold mb-4 border-b border-gray-400 pb-2">
                  6. PAYMENT TERMS
                </h2>
                <div className="ml-2 md:ml-4 space-y-2">
                  <p className="text-gray-800 text-sm md:text-base">
                    • The tenant shall pay the monthly rent of <span className="font-semibold">₹{rental.rentAmount?.toLocaleString()}</span> on or before the <span className="font-semibold">{paymentDay}th</span> of each month.
                  </p>
                  <p className="text-gray-800 text-sm md:text-base">
                    • Late payment will attract a penalty of <span className="font-semibold">₹500 per day</span> after the due date.
                  </p>
                  <p className="text-gray-800 text-sm md:text-base">
                    • Payment can be made via Bank Transfer, UPI, Cheque, or Cash.
                  </p>
                  <p className="text-gray-800 text-sm md:text-base">
                    • The advance amount of <span className="font-semibold">₹{advanceAmount.toLocaleString()}</span> shall be adjusted against the last month's rent.
                  </p>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="mb-8">
                <h2 className="text-lg md:text-xl font-bold mb-4 border-b border-gray-400 pb-2">
                  7. TERMS AND CONDITIONS
                </h2>
                <div className="ml-2 md:ml-4 space-y-2">
                  <p className="text-gray-800 text-sm md:text-base">1. The tenant shall pay the rent on or before the {paymentDay}th of every month.</p>
                  <p className="text-gray-800 text-sm md:text-base">2. Late payment will attract a penalty of ₹500 per day.</p>
                  <p className="text-gray-800 text-sm md:text-base">3. The tenant shall not sublet the property without written consent.</p>
                  <p className="text-gray-800 text-sm md:text-base">4. The tenant shall maintain the property in good condition.</p>
                  <p className="text-gray-800 text-sm md:text-base">5. The landlord is responsible for major repairs and maintenance.</p>
                  <p className="text-gray-800 text-sm md:text-base">6. The tenant shall not make any structural changes to the property.</p>
                  <p className="text-gray-800 text-sm md:text-base">7. The tenant shall follow all society/building rules and regulations.</p>
                  <p className="text-gray-800 text-sm md:text-base">8. The tenant shall allow the landlord to inspect the property with prior notice.</p>
                  <p className="text-gray-800 text-sm md:text-base">9. The tenant shall not cause any nuisance to other residents.</p>
                  <p className="text-gray-800 text-sm md:text-base">10. The tenant is responsible for utility bills (electricity, water, gas).</p>
                </div>
              </div>

              {/* Termination Clause */}
              <div className="mb-8">
                <h2 className="text-lg md:text-xl font-bold mb-4 border-b border-gray-400 pb-2">
                  8. TERMINATION
                </h2>
                <div className="ml-2 md:ml-4">
                  <p className="text-gray-800 text-sm md:text-base">
                    Either party may terminate this agreement by giving{' '}
                    <span className="font-semibold">30 days</span> written notice to the other party. 
                    The agreement will automatically terminate on {formatDate(rental.endDate)} unless renewed.
                  </p>
                </div>
              </div>

              {/* Renewal Terms */}
              <div className="mb-8">
                <h2 className="text-lg md:text-xl font-bold mb-4 border-b border-gray-400 pb-2">
                  9. RENEWAL TERMS
                </h2>
                <div className="ml-2 md:ml-4">
                  <p className="text-gray-800 text-sm md:text-base">
                    The agreement may be renewed upon mutual consent of both parties. 
                    The rent may be revised by <span className="font-semibold">5-10%</span> at the time of renewal.
                    Renewal request must be made at least <span className="font-semibold">15 days</span> before the end date.
                  </p>
                </div>
              </div>

              {/* Security Information */}
              <div className="mb-8">
                <h2 className="text-lg md:text-xl font-bold mb-4 border-b border-gray-400 pb-2">
                  10. SECURITY INFORMATION
                </h2>
                <div className="ml-2 md:ml-4">
                  <p className="text-gray-800 text-sm md:text-base">
                    <span className="font-semibold">Secret Key:</span> 
                    <span className="font-mono bg-gray-100 px-3 py-1 ml-2 text-sm break-all">{rental.secretKey}</span>
                  </p>
                  <p className="text-gray-500 text-xs md:text-sm mt-2">
                    * This secret key is required for tenant portal login and verification.
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="mt-12 pt-8 border-t-2 border-gray-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="text-center">
                    <p className="font-semibold text-gray-800">_____________________</p>
                    <p className="text-gray-600 text-sm mt-2">Landlord/Owner Signature</p>
                    <p className="text-gray-500 text-xs mt-1">M/S Hulbanni Housing</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-800">_____________________</p>
                    <p className="text-gray-600 text-sm mt-2">Tenant Signature</p>
                    <p className="text-gray-500 text-xs mt-1">{rental.tenantName}</p>
                  </div>
                </div>
                <div className="text-center mt-6">
                  <p className="text-gray-500 text-xs">(Seal)</p>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-8 pt-4 border-t border-gray-200">
                <p className="text-gray-400 text-xs">
                  This is a computer generated document and does not require a physical signature.
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  © 2024 MS Hulbanni Housing - All Rights Reserved
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles - Hide everything except agreement content */}
      <style>{`
        @media print {
          /* Hide everything by default */
          body * {
            visibility: hidden;
          }
          
          /* Show only the agreement content */
          .print-only-content,
          .print-only-content * {
            visibility: visible;
          }
          
          /* Position the agreement content */
          .print-only-content {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          
          /* Hide the header/buttons when printing */
          .print\\:hidden {
            display: none !important;
          }
          
          /* Remove shadows and rounded corners for print */
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          
          .print\\:p-0 {
            padding: 0 !important;
          }
          
          /* Set A4 page size */
          @page {
            size: A4;
            margin: 0.5in;
          }
        }
      `}</style>
    </div>
  );
};

export default AgreementPage;