import { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaClock, FaSpinner, FaEye, FaEdit, FaTimesCircle, FaWater, FaBolt, FaWifi, FaBug, FaTrash, FaHome, FaUser, FaPhone, FaEnvelope, FaChevronDown } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await fetch(`${API_URL}/api/complaints`);
      const data = await response.json();
      if (data.success) {
        setComplaints(data.data);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (id, status, adminRemarks = '') => {
    setUpdatingStatus(id);
    try {
      const response = await fetch(`${API_URL}/api/complaints/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, adminRemarks })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Complaint marked as ${status}`);
        fetchComplaints();
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Resolved': return 'bg-green-100 text-green-600';
      case 'In Progress': return 'bg-blue-100 text-blue-600';
      case 'Pending': return 'bg-yellow-100 text-yellow-600';
      case 'Rejected': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Resolved': return <FaCheckCircle />;
      case 'In Progress': return <FaSpinner className="animate-spin" />;
      case 'Pending': return <FaClock />;
      case 'Rejected': return <FaTimesCircle />;
      default: return <FaClock />;
    }
  };

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-orange-600 bg-orange-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getComplaintTypeIcon = (type) => {
    switch(type) {
      case 'plumbing': return <FaWater />;
      case 'electrical': return <FaBolt />;
      case 'internet': return <FaWifi />;
      case 'pest': return <FaBug />;
      case 'garbage': return <FaTrash />;
      default: return <FaExclamationTriangle />;
    }
  };

  const getComplaintTypeLabel = (type) => {
    const types = {
      plumbing: 'Plumbing',
      electrical: 'Electrical',
      internet: 'Internet/WiFi',
      pest: 'Pest Control',
      garbage: 'Garbage',
      other: 'Other'
    };
    return types[type] || type;
  };

  const filteredComplaints = complaints.filter(complaint => {
    if (filter !== 'all' && complaint.status !== filter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        complaint.complaintId?.toLowerCase().includes(search) ||
        complaint.houseId?.toLowerCase().includes(search) ||
        complaint.tenantName?.toLowerCase().includes(search) ||
        complaint.title?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length
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
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800">Complaints Management</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Manage and respond to tenant complaints</p>
        </div>

        {/* Stats Cards - Mobile Responsive */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-4 text-center">
            <div className="text-xl md:text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs md:text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-4 text-center">
            <div className="text-xl md:text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs md:text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-4 text-center">
            <div className="text-xl md:text-3xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-xs md:text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-4 text-center">
            <div className="text-xl md:text-3xl font-bold text-green-600">{stats.resolved}</div>
            <div className="text-xs md:text-sm text-gray-600">Resolved</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by ID, house, tenant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 text-sm md:text-base"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'Pending', 'In Progress', 'Resolved'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status === 'all' ? 'all' : status)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl font-medium transition-all text-xs md:text-sm ${
                    filter === (status === 'all' ? 'all' : status)
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Complaints List */}
        {filteredComplaints.length === 0 ? (
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-8 md:p-12 text-center">
            <FaExclamationTriangle className="text-5xl md:text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No complaints found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComplaints.map((complaint) => (
              <div key={complaint._id} className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-col gap-4">
                  
                  {/* Top Row - Complaint Title & Status Dropdown */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg md:text-xl font-bold text-gray-800">{complaint.title}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                          {getStatusIcon(complaint.status)} {complaint.status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs md:text-sm mt-1">
                        ID: {complaint.complaintId} • {new Date(complaint.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {/* Status Update Dropdown */}
                    <div className="relative w-full sm:w-48">
                      <select
                        value={complaint.status}
                        onChange={(e) => updateComplaintStatus(complaint._id, e.target.value, complaint.adminRemarks)}
                        disabled={updatingStatus === complaint._id}
                        className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 p-2.5 pr-10"
                      >
                        <option value="Pending">🟡 Pending</option>
                        <option value="In Progress">🔵 In Progress</option>
                        <option value="Resolved">🟢 Resolved</option>
                        <option value="Rejected">🔴 Rejected</option>
                      </select>
                      <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                      {updatingStatus === complaint._id && (
                        <FaSpinner className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-500 animate-spin" />
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm md:text-base">{complaint.description}</p>

                  {/* Highlighted Renter Name & House ID */}
                  <div className="flex flex-wrap gap-3 items-center">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-full text-blue-700 text-sm font-semibold">
                      <FaUser className="text-blue-600" />
                      {complaint.tenantName}
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-full text-purple-700 text-sm font-semibold">
                      <FaHome className="text-purple-600" />
                      {complaint.houseId} - {complaint.houseTitle}
                    </span>
                  </div>

                  {/* Complaint Type & Urgency */}
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getUrgencyColor(complaint.urgency)}`}>
                      {getComplaintTypeIcon(complaint.complaintType)} {getComplaintTypeLabel(complaint.complaintType)}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getUrgencyColor(complaint.urgency)}`}>
                      Urgency: {complaint.urgency}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                      <FaEnvelope /> {complaint.tenantEmail}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                      <FaPhone /> {complaint.tenantPhone}
                    </span>
                  </div>

                  {/* Admin Remarks */}
                  {complaint.adminRemarks && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-xl">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">📝 Admin Remark:</span> {complaint.adminRemarks}
                      </p>
                    </div>
                  )}

                  {/* View Details Button */}
                  <button
                    onClick={() => {
                      setSelectedComplaint(complaint);
                      setShowModal(true);
                    }}
                    className="mt-2 w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
                  >
                    <FaEye /> View Full Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Full Details Modal */}
      {showModal && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-4 md:px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Complaint Details</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <div className="p-4 md:p-6">
              <div className="space-y-4">
                {/* Complaint Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-3">📋 Complaint Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-500 text-sm">Complaint ID</p>
                      <p className="font-medium">{selectedComplaint.complaintId}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Status</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedComplaint.status)}`}>
                        {getStatusIcon(selectedComplaint.status)} {selectedComplaint.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Type</p>
                      <p className="font-medium flex items-center gap-1">
                        {getComplaintTypeIcon(selectedComplaint.complaintType)} {getComplaintTypeLabel(selectedComplaint.complaintType)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Urgency</p>
                      <p className={`font-medium ${getUrgencyColor(selectedComplaint.urgency)} inline-block px-2 py-1 rounded-full text-sm`}>
                        {selectedComplaint.urgency}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-gray-500 text-sm">Title</p>
                      <p className="font-medium">{selectedComplaint.title}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-gray-500 text-sm">Description</p>
                      <p className="text-gray-700">{selectedComplaint.description}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Created Date</p>
                      <p className="font-medium">{new Date(selectedComplaint.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Preferred Time</p>
                      <p className="font-medium">{selectedComplaint.preferredTime}</p>
                    </div>
                  </div>
                </div>

                {/* Highlighted Renter & House */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-3">🏠 Property & 👤 Tenant Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-gray-500 text-sm">House ID</p>
                      <p className="font-bold text-purple-700 text-lg">{selectedComplaint.houseId}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-gray-500 text-sm">House Title</p>
                      <p className="font-medium">{selectedComplaint.houseTitle}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-gray-500 text-sm">Tenant Name</p>
                      <p className="font-bold text-blue-700 text-lg">{selectedComplaint.tenantName}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-gray-500 text-sm">Email</p>
                      <p className="font-medium">{selectedComplaint.tenantEmail}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-gray-500 text-sm">Phone</p>
                      <p className="font-medium">{selectedComplaint.tenantPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Add Remarks */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-3">✏️ Add Admin Remarks</h3>
                  <div className="space-y-3">
                    <textarea
                      id="modalAdminRemarks"
                      rows="3"
                      defaultValue={selectedComplaint.adminRemarks || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500"
                      placeholder="Add remarks about the complaint..."
                    />
                    <button
                      onClick={() => {
                        const remarks = document.getElementById('modalAdminRemarks').value;
                        updateComplaintStatus(selectedComplaint._id, selectedComplaint.status, remarks);
                        setShowModal(false);
                      }}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Save Remarks
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;