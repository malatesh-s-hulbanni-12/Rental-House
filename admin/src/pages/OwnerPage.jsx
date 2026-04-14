import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBuilding, FaIdCard, FaUniversity, FaSave, FaEdit, FaWrench, FaCalendarAlt, FaCheckCircle, FaClock, FaExclamationTriangle, FaHome } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const OwnerPage = () => {
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);

  useEffect(() => {
    fetchOwner();
    fetchMaintenanceRequests();
  }, []);

  const fetchOwner = async () => {
    try {
      const response = await fetch(`${API_URL}/api/owner`);
      const data = await response.json();
      if (data.success) {
        setOwner(data.data);
        setFormData(data.data);
      }
    } catch (error) {
      console.error('Error fetching owner:', error);
      toast.error('Failed to load owner data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMaintenanceRequests = async () => {
    // Fetch maintenance requests from maintenance API
    try {
      const response = await fetch(`${API_URL}/api/maintenance`);
      const data = await response.json();
      if (data.success) {
        setMaintenanceRequests(data.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/owner`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setOwner(data.data);
        setEditing(false);
        toast.success('Owner profile updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'text-green-600 bg-green-50';
      case 'In Progress': return 'text-blue-600 bg-blue-50';
      case 'Pending': return 'text-yellow-600 bg-yellow-50';
      case 'Rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Completed': return <FaCheckCircle className="text-green-500" />;
      case 'In Progress': return <FaClock className="text-blue-500" />;
      case 'Pending': return <FaExclamationTriangle className="text-yellow-500" />;
      case 'Rejected': return <FaExclamationTriangle className="text-red-500" />;
      default: return <FaClock />;
    }
  };

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'High': return 'bg-red-100 text-red-600';
      case 'Medium': return 'bg-orange-100 text-orange-600';
      case 'Low': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer />
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Owner Profile</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Manage owner information and view maintenance requests</p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          
          {/* Left Side - Owner Details Form */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 md:px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <FaUser /> Owner Details
              </h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 md:px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                >
                  <FaEdit /> Edit
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData(owner);
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 md:px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
            
            <div className="p-4 md:p-6">
              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">Full Name *</label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">Email *</label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">Phone *</label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">Address *</label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                      <textarea
                        name="address"
                        value={formData.address || ''}
                        onChange={handleChange}
                        required
                        rows="2"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">Company Name</label>
                    <div className="relative">
                      <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName || ''}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm">GST Number</label>
                      <div className="relative">
                        <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="gstNumber"
                          value={formData.gstNumber || ''}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm">Bank Name</label>
                      <div className="relative">
                        <FaUniversity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="bankName"
                          value={formData.bankName || ''}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm">Account Number</label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm">IFSC Code</label>
                      <input
                        type="text"
                        name="ifscCode"
                        value={formData.ifscCode || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <FaSave /> Save Changes
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 py-2 border-b">
                    <FaUser className="text-emerald-500" />
                    <span className="text-gray-500 w-24">Name:</span>
                    <span className="font-semibold text-gray-800">{owner?.name}</span>
                  </div>
                  <div className="flex items-center gap-3 py-2 border-b">
                    <FaEnvelope className="text-emerald-500" />
                    <span className="text-gray-500 w-24">Email:</span>
                    <span className="font-semibold text-gray-800">{owner?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 py-2 border-b">
                    <FaPhone className="text-emerald-500" />
                    <span className="text-gray-500 w-24">Phone:</span>
                    <span className="font-semibold text-gray-800">{owner?.phone}</span>
                  </div>
                  <div className="flex items-start gap-3 py-2 border-b">
                    <FaMapMarkerAlt className="text-emerald-500 mt-1" />
                    <span className="text-gray-500 w-24">Address:</span>
                    <span className="font-semibold text-gray-800 flex-1">{owner?.address}</span>
                  </div>
                  {owner?.companyName && (
                    <div className="flex items-center gap-3 py-2 border-b">
                      <FaBuilding className="text-emerald-500" />
                      <span className="text-gray-500 w-24">Company:</span>
                      <span className="font-semibold text-gray-800">{owner?.companyName}</span>
                    </div>
                  )}
                  {owner?.gstNumber && (
                    <div className="flex items-center gap-3 py-2 border-b">
                      <FaIdCard className="text-emerald-500" />
                      <span className="text-gray-500 w-24">GST:</span>
                      <span className="font-semibold text-gray-800">{owner?.gstNumber}</span>
                    </div>
                  )}
                  {(owner?.bankName || owner?.accountNumber) && (
                    <div className="bg-gray-50 rounded-xl p-3 mt-2">
                      <p className="font-semibold text-gray-700 mb-2">Bank Details</p>
                      <p className="text-sm text-gray-600">Bank: {owner?.bankName}</p>
                      <p className="text-sm text-gray-600">Account: {owner?.accountNumber}</p>
                      <p className="text-sm text-gray-600">IFSC: {owner?.ifscCode}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Maintenance Requests */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 md:px-6 py-4">
              <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <FaWrench /> Recent Maintenance Requests
              </h2>
            </div>
            
            <div className="p-4 md:p-6">
              {maintenanceRequests.length === 0 ? (
                <div className="text-center py-8">
                  <FaWrench className="text-5xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No maintenance requests yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {maintenanceRequests.map((request) => (
                    <div key={request._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <FaHome className="text-gray-500 text-sm" />
                            <h3 className="font-semibold text-gray-800">{request.houseTitle}</h3>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            House ID: {request.houseId} • {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Tenant: {request.tenantName}
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)} {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-3">{request.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency || 'Medium'} Urgency
                        </span>
                        {request.preferredDate && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                            <FaCalendarAlt className="inline mr-1 text-xs" /> {new Date(request.preferredDate).toLocaleDateString()}
                          </span>
                        )}
                        {request.preferredTime && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                            {request.preferredTime}
                          </span>
                        )}
                      </div>
                      {request.adminRemarks && (
                        <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                          <p className="text-xs text-gray-600">
                            <span className="font-semibold">Admin Remark:</span> {request.adminRemarks}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerPage;