import { useState, useEffect } from 'react';
import { FaHome, FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaRupeeSign, FaCheckCircle, FaClock, FaEdit, FaExclamationTriangle, FaWater, FaBolt, FaWifi, FaBug, FaTrash, FaTimes, FaBuilding, FaIdCard, FaUniversity, FaMapMarkerAlt, FaFileAlt, FaPrint, FaArrowLeft, FaCalendarCheck, FaMoneyBillWave, FaWrench, FaPaperPlane } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RenterNavbar from '../components/RenterNavbar';

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const RenterDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [rentalDetails, setRentalDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [ownerDetails, setOwnerDetails] = useState(null);
  const [fetchingOwner, setFetchingOwner] = useState(false);
  const [submittingMaintenance, setSubmittingMaintenance] = useState(false);
  
  // Maintenance Request Form Data - Simplified
  const [maintenanceData, setMaintenanceData] = useState({
    description: ''
  });

  useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
      navigate('/');
      return;
    }
    
    const user = JSON.parse(loggedInUser);
    setUserData(user);
    fetchRentalDetails(user.rentalId);
  }, [navigate]);

  const fetchRentalDetails = async (rentalId) => {
    try {
      const response = await fetch(`${API_URL}/api/rentals/${rentalId}`);
      const data = await response.json();
      if (data.success) {
        setRentalDetails(data.data);
      }
    } catch (error) {
      console.error('Error fetching rental details:', error);
      toast.error('Failed to load rental details');
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnerDetails = async () => {
    setFetchingOwner(true);
    try {
      const response = await fetch(`${API_URL}/api/owner`);
      const data = await response.json();
      if (data.success) {
        setOwnerDetails(data.data);
        setShowOwnerModal(true);
      } else {
        toast.error('Failed to load owner details');
      }
    } catch (error) {
      console.error('Error fetching owner:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setFetchingOwner(false);
    }
  };

  const handleMaintenanceChange = (e) => {
    setMaintenanceData({ description: e.target.value });
  };

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    
    if (!maintenanceData.description.trim()) {
      toast.error('Please describe your maintenance requirement');
      return;
    }

    setSubmittingMaintenance(true);

    try {
      const maintenanceRequest = {
        houseId: rentalDetails?.houseId,
        houseTitle: rentalDetails?.houseTitle,
        tenantName: rentalDetails?.tenantName,
        tenantEmail: rentalDetails?.tenantEmail,
        tenantPhone: rentalDetails?.tenantPhone,
        description: maintenanceData.description,
        requestType: 'maintenance',
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      const response = await fetch(`${API_URL}/api/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(maintenanceRequest)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Maintenance request submitted successfully! Our team will contact you soon.');
        setShowMaintenanceModal(false);
        setMaintenanceData({ description: '' });
      } else {
        toast.error(data.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting maintenance:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setSubmittingMaintenance(false);
    }
  };

  const handlePrint = () => {
    const printContents = document.getElementById('agreement-print-content').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rental Agreement</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { margin: 0; padding: 0.5in; font-family: 'Times New Roman', Times, serif; background-color: white; }
          .agreement-container { max-width: 800px; margin: 0 auto; background-color: white; color: black; }
          h1 { font-size: 24px; text-align: center; margin-bottom: 20px; font-weight: bold; }
          h2 { font-size: 18px; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; font-weight: bold; }
          p { font-size: 14px; line-height: 1.5; margin: 5px 0; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .bg-gray-50 { background-color: #f9fafb; padding: 8px; border-radius: 8px; }
          .bg-blue-50 { background-color: #eff6ff; padding: 8px; border-radius: 8px; }
          .font-bold { font-weight: bold; }
          .font-mono { font-family: monospace; }
          .mt-8 { margin-top: 30px; }
          .pt-6 { padding-top: 20px; }
          .border-t-2 { border-top: 2px solid #ccc; }
          .ml-2 { margin-left: 10px; }
          .ml-4 { margin-left: 20px; }
          @media print { body { margin: 0; padding: 0.5in; } }
        </style>
      </head>
      <body>
        <div class="agreement-container">${printContents}</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  // Get monthly payment day from start date
  const getPaymentDay = (startDate) => {
    if (!startDate) return 5;
    const date = new Date(startDate);
    return date.getDate();
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <RenterNavbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const paymentDay = getPaymentDay(rentalDetails?.startDate);
  const advanceAmount = rentalDetails?.advanceAmount || 0;
  const securityDeposit = (rentalDetails?.rentAmount || 0) * 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <ToastContainer />
      <RenterNavbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section with Edit Button */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back, {rentalDetails?.tenantName}!</h2>
              <p className="text-gray-600">Here's your rental agreement details</p>
            </div>
            <button 
              onClick={() => navigate('/renter-profile')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
            >
              <FaEdit /> Edit Profile
            </button>
          </div>
        </div>

        {/* Raise Complaint Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaExclamationTriangle className="text-orange-500" /> Raise a Complaint
              </h3>
              <p className="text-gray-500 text-sm mt-1">Report any issues or problems with your property</p>
            </div>
            <button 
              onClick={() => navigate('/raise-complaint')}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <FaExclamationTriangle /> Raise Complaint
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
            <div className="bg-orange-50 rounded-xl p-3 text-center hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/raise-complaint')}>
              <FaWater className="text-orange-600 text-xl mx-auto mb-1" />
              <span className="text-xs font-medium text-gray-700">Plumbing</span>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3 text-center hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/raise-complaint')}>
              <FaBolt className="text-yellow-600 text-xl mx-auto mb-1" />
              <span className="text-xs font-medium text-gray-700">Electrical</span>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 text-center hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/raise-complaint')}>
              <FaWifi className="text-purple-600 text-xl mx-auto mb-1" />
              <span className="text-xs font-medium text-gray-700">Internet</span>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/raise-complaint')}>
              <FaBug className="text-green-600 text-xl mx-auto mb-1" />
              <span className="text-xs font-medium text-gray-700">Pest</span>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/raise-complaint')}>
              <FaTrash className="text-red-600 text-xl mx-auto mb-1" />
              <span className="text-xs font-medium text-gray-700">Garbage</span>
            </div>
            <div className="bg-gray-100 rounded-xl p-3 text-center hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/raise-complaint')}>
              <FaExclamationTriangle className="text-gray-600 text-xl mx-auto mb-1" />
              <span className="text-xs font-medium text-gray-700">Other</span>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/complaint-history')}
            className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            View Complaint History →
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Property Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaHome className="text-blue-600" /> Property Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">House ID:</span>
                <span className="font-semibold">{rentalDetails?.houseId}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">House Title:</span>
                <span className="font-semibold">{rentalDetails?.houseTitle}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Monthly Rent:</span>
                <span className="font-semibold text-emerald-600">₹{rentalDetails?.rentAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Advance Amount:</span>
                <span className="font-semibold text-blue-600">₹{advanceAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Agreement Status:</span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  rentalDetails?.agreementStatus === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {rentalDetails?.agreementStatus === 'Active' && <FaCheckCircle className="text-xs" />}
                  {rentalDetails?.agreementStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Tenant Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaUser className="text-blue-600" /> Tenant Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Name:</span>
                <span className="font-semibold">{rentalDetails?.tenantName}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Email:</span>
                <span className="font-semibold">{rentalDetails?.tenantEmail}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Phone:</span>
                <span className="font-semibold">{rentalDetails?.tenantPhone}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Payment Status:</span>
                <span className={`font-semibold ${rentalDetails?.paymentStatus === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                  {rentalDetails?.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Agreement Dates */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaCalendarAlt className="text-blue-600" /> Agreement Dates
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Start Date:</span>
                <span className="font-semibold">{formatDate(rentalDetails?.startDate)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">End Date:</span>
                <span className="font-semibold">{formatDate(rentalDetails?.endDate)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Payment Due Date:</span>
                <span className="font-semibold text-blue-600">{paymentDay}th of every month</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Days Remaining:</span>
                <span className="font-semibold text-blue-600">
                  {Math.ceil((new Date(rentalDetails?.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-4">Quick Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Rent Paid:</span>
                <span className="font-semibold">₹{rentalDetails?.rentAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Security Deposit:</span>
                <span className="font-semibold">₹{securityDeposit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Support Available:</span>
                <span className="font-semibold">24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => toast.info('Payment gateway coming soon!')}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl text-center hover:shadow-lg transition-all"
          >
            Pay Rent
          </button>
          <button 
            onClick={() => setShowMaintenanceModal(true)}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-xl text-center hover:shadow-lg transition-all"
          >
            Request Maintenance
          </button>
          <button 
            onClick={() => setShowAgreementModal(true)}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl text-center hover:shadow-lg transition-all"
          >
            <FaFileAlt className="text-xl mx-auto mb-1" />
            View Agreement
          </button>
          <button 
            onClick={fetchOwnerDetails}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl text-center hover:shadow-lg transition-all"
          >
            Contact Owner
          </button>
        </div>
      </div>

      {/* Maintenance Request Modal - Simplified */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FaWrench /> Request Maintenance
              </h2>
              <button 
                onClick={() => setShowMaintenanceModal(false)}
                className="text-white/80 hover:text-white text-2xl"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleMaintenanceSubmit} className="space-y-5">
                
                {/* Heading */}
                <div className="text-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">Tell us about your maintenance requirement</h3>
                  <p className="text-sm text-gray-500 mt-1">Share your experience and what needs to be fixed</p>
                </div>

                {/* Property Info Display */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Property:</span> {rentalDetails?.houseTitle} ({rentalDetails?.houseId})
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold">Tenant:</span> {rentalDetails?.tenantName}
                  </p>
                </div>

                {/* Description Textarea */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Describe your maintenance requirement *</label>
                  <textarea
                    name="description"
                    value={maintenanceData.description}
                    onChange={handleMaintenanceChange}
                    required
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    placeholder="Example:&#10;• The AC is not cooling properly since last week&#10;• Water leakage in the bathroom pipe&#10;• The geyser is not working&#10;• Need to fix the kitchen cabinet door&#10;• Paint peeling off in the living room"
                  />
                </div>

                {/* What We Maintain */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FaWrench className="text-blue-600" /> What we maintain:
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>• AC / Refrigerator</div>
                    <div>• Plumbing & Pipes</div>
                    <div>• Electrical Wiring</div>
                    <div>• Geyser / Water Heater</div>
                    <div>• Furniture Repair</div>
                    <div>• Pest Control</div>
                    <div>• Painting & Walls</div>
                    <div>• Doors & Windows</div>
                    <div>• Kitchen Appliances</div>
                    <div>• Bathroom Fittings</div>
                  </div>
                </div>

                {/* Note */}
                <div className="bg-yellow-50 rounded-xl p-3">
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Note:</span> Our maintenance team will contact you within 24 hours to schedule a visit.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submittingMaintenance}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {submittingMaintenance ? 'Submitting...' : <><FaPaperPlane /> Submit Request</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Agreement Modal */}
      {showAgreementModal && rentalDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
          <div className="relative bg-white shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <div className="sticky top-0 bg-gray-100 border-b px-4 py-3 flex justify-between items-center">
              <button 
                onClick={() => setShowAgreementModal(false)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                <FaArrowLeft /> Back
              </button>
              <button 
                onClick={handlePrint}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm"
              >
                <FaPrint /> Print
              </button>
            </div>

            <div id="agreement-print-content" className="p-4 md:p-6" style={{ fontFamily: "'Times New Roman', Times, serif", backgroundColor: 'white', color: 'black' }}>
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-6 border-b-2 border-gray-300 pb-4">
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">RENTAL AGREEMENT</h1>
                  <p className="text-gray-600 text-xs md:text-sm">This Rental Agreement is made and executed on this day</p>
                </div>
                <div className="mb-4 text-right">
                  <p className="text-gray-700 text-xs md:text-sm">Date: <span className="font-semibold">{formatDate(new Date())}</span></p>
                </div>
                <div className="mb-6">
                  <h2 className="text-base md:text-lg font-bold mb-3 border-b border-gray-400 pb-1">1. PARTIES INVOLVED</h2>
                  <div className="space-y-2 ml-2">
                    <p className="text-gray-800 text-sm"><span className="font-semibold">Landlord/Owner:</span> M/S HULBANNI HOUSING PRIVATE LIMITED</p>
                    <p className="text-gray-800 text-sm"><span className="font-semibold">Tenant:</span> {rentalDetails.tenantName}</p>
                    <div className="ml-4 space-y-1">
                      <p className="text-gray-700 text-xs">Email: {rentalDetails.tenantEmail}</p>
                      <p className="text-gray-700 text-xs">Phone: {rentalDetails.tenantPhone}</p>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <h2 className="text-base md:text-lg font-bold mb-3 border-b border-gray-400 pb-1">2. PROPERTY DETAILS</h2>
                  <div className="space-y-2 ml-2">
                    <p className="text-gray-800 text-sm"><span className="font-semibold">Property ID:</span> {rentalDetails.houseId}</p>
                    <p className="text-gray-800 text-sm"><span className="font-semibold">Property Title:</span> {rentalDetails.houseTitle}</p>
                    <p className="text-gray-800 text-sm"><span className="font-semibold">Property Type:</span> Residential Rental Property</p>
                  </div>
                </div>
                <div className="mb-6">
                  <h2 className="text-base md:text-lg font-bold mb-3 border-b border-gray-400 pb-1">3. TERM OF AGREEMENT</h2>
                  <div className="space-y-2 ml-2">
                    <p className="text-gray-800 text-sm"><span className="font-semibold">Start Date:</span> {formatDate(rentalDetails.startDate)}</p>
                    <p className="text-gray-800 text-sm"><span className="font-semibold">End Date:</span> {formatDate(rentalDetails.endDate)}</p>
                    <p className="text-gray-800 text-sm"><span className="font-semibold">Agreement Status:</span> {rentalDetails.agreementStatus}</p>
                  </div>
                </div>
                <div className="mb-6">
                  <h2 className="text-base md:text-lg font-bold mb-3 border-b border-gray-400 pb-1">4. RENT & ADVANCE DETAILS</h2>
                  <div className="space-y-3 ml-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-2 rounded-lg"><p className="text-gray-600 text-xs">Monthly Rent</p><p className="text-gray-800 font-bold text-base text-emerald-600">₹{rentalDetails.rentAmount?.toLocaleString()}</p></div>
                      <div className="bg-gray-50 p-2 rounded-lg"><p className="text-gray-600 text-xs">Advance Amount</p><p className="text-gray-800 font-bold text-base text-blue-600">₹{advanceAmount.toLocaleString()}</p></div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <div className="flex items-center gap-2 mb-1"><FaCalendarCheck className="text-blue-600 text-sm" /><p className="font-semibold text-gray-800 text-sm">Monthly Payment Schedule</p></div>
                      <p className="text-gray-700 text-xs">Rent shall be paid on or before the <span className="font-bold text-blue-600">{paymentDay}th</span> day of every month.</p>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <h2 className="text-base md:text-lg font-bold mb-3 border-b border-gray-400 pb-1">5. SECURITY DEPOSIT</h2>
                  <div className="ml-2"><p className="text-gray-800 text-sm">A security deposit of <span className="font-semibold">₹{securityDeposit.toLocaleString()}</span> (Two months rent) is paid by the tenant to the landlord, which is refundable at the time of vacating the property subject to no damages.</p></div>
                </div>
                <div className="mb-6">
                  <h2 className="text-base md:text-lg font-bold mb-3 border-b border-gray-400 pb-1">6. PAYMENT TERMS</h2>
                  <div className="ml-2 space-y-1">
                    <p className="text-gray-800 text-xs">• Monthly rent of ₹{rentalDetails.rentAmount?.toLocaleString()} due on {paymentDay}th of each month.</p>
                    <p className="text-gray-800 text-xs">• Late payment penalty: ₹500 per day after due date.</p>
                    <p className="text-gray-800 text-xs">• Advance amount of ₹{advanceAmount.toLocaleString()} adjusted against last month's rent.</p>
                  </div>
                </div>
                <div className="mb-6">
                  <h2 className="text-base md:text-lg font-bold mb-3 border-b border-gray-400 pb-1">7. TERMS & CONDITIONS</h2>
                  <div className="ml-2 space-y-1">
                    <p className="text-gray-800 text-xs">1. Pay rent on or before {paymentDay}th of every month.</p>
                    <p className="text-gray-800 text-xs">2. No subletting without written consent.</p>
                    <p className="text-gray-800 text-xs">3. Maintain property in good condition.</p>
                    <p className="text-gray-800 text-xs">4. No structural changes without permission.</p>
                    <p className="text-gray-800 text-xs">5. Follow society/building rules.</p>
                  </div>
                </div>
                <div className="mb-6">
                  <h2 className="text-base md:text-lg font-bold mb-3 border-b border-gray-400 pb-1">8. TERMINATION</h2>
                  <div className="ml-2"><p className="text-gray-800 text-sm">30 days notice required for termination. Agreement auto-terminates on {formatDate(rentalDetails.endDate)} unless renewed.</p></div>
                </div>
                <div className="mb-6">
                  <h2 className="text-base md:text-lg font-bold mb-3 border-b border-gray-400 pb-1">9. SECURITY INFORMATION</h2>
                  <div className="ml-2"><p className="text-gray-800 text-sm"><span className="font-semibold">Secret Key:</span> <span className="font-mono bg-gray-100 px-2 py-0.5 ml-2 text-xs break-all">{rentalDetails.secretKey}</span></p></div>
                </div>
                <div className="mt-8 pt-6 border-t-2 border-gray-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center"><p className="font-semibold text-gray-800 text-sm">_____________________</p><p className="text-gray-600 text-xs mt-1">Landlord/Owner Signature</p></div>
                    <div className="text-center"><p className="font-semibold text-gray-800 text-sm">_____________________</p><p className="text-gray-600 text-xs mt-1">Tenant Signature</p><p className="text-gray-500 text-xs">{rentalDetails.tenantName}</p></div>
                  </div>
                </div>
                <div className="text-center mt-6 pt-3 border-t border-gray-200"><p className="text-gray-400 text-xs">© 2024 MS Hulbanni Housing - All Rights Reserved</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Owner Details Modal */}
      {showOwnerModal && ownerDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowOwnerModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto animate-fade-in-up">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><FaUser /> Owner Details</h2>
              <button onClick={() => setShowOwnerModal(false)} className="text-white/80 hover:text-white"><FaTimes className="text-xl" /></button>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-6"><div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"><FaUser className="text-white text-4xl" /></div></div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><FaUser className="text-blue-500" /> Personal Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3"><FaUser className="text-gray-400 text-sm w-5" /><span className="text-gray-600 text-sm">Name:</span><span className="font-semibold text-gray-800 flex-1 break-all">{ownerDetails?.name}</span></div>
                    <div className="flex items-center gap-3"><FaEnvelope className="text-gray-400 text-sm w-5" /><span className="text-gray-600 text-sm">Email:</span><span className="font-semibold text-gray-800 flex-1 break-all">{ownerDetails?.email}</span></div>
                    <div className="flex items-center gap-3"><FaPhone className="text-gray-400 text-sm w-5" /><span className="text-gray-600 text-sm">Phone:</span><span className="font-semibold text-gray-800 flex-1">{ownerDetails?.phone}</span></div>
                    <div className="flex items-start gap-3"><FaMapMarkerAlt className="text-gray-400 text-sm w-5 mt-1" /><span className="text-gray-600 text-sm">Address:</span><span className="font-semibold text-gray-800 flex-1 break-all">{ownerDetails?.address}</span></div>
                  </div>
                </div>
                {(ownerDetails?.bankName || ownerDetails?.accountNumber) && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><FaUniversity className="text-blue-500" /> Bank Details</h3>
                    <div className="space-y-2">
                      {ownerDetails?.bankName && <div className="flex items-center gap-3"><FaUniversity className="text-gray-400 text-sm w-5" /><span className="text-gray-600 text-sm">Bank:</span><span className="font-semibold text-gray-800 flex-1">{ownerDetails?.bankName}</span></div>}
                      {ownerDetails?.accountNumber && <div className="flex items-center gap-3"><span className="text-gray-400 text-sm w-5">#</span><span className="text-gray-600 text-sm">Account:</span><span className="font-semibold text-gray-800 flex-1">{ownerDetails?.accountNumber}</span></div>}
                      {ownerDetails?.ifscCode && <div className="flex items-center gap-3"><span className="text-gray-400 text-sm w-5">#</span><span className="text-gray-600 text-sm">IFSC:</span><span className="font-semibold text-gray-800 flex-1">{ownerDetails?.ifscCode}</span></div>}
                    </div>
                  </div>
                )}
                <button onClick={() => setShowOwnerModal(false)} className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {fetchingOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Loading owner details...</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default RenterDashboard;