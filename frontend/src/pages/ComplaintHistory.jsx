import { useState, useEffect } from 'react';
import { FaArrowLeft, FaCheckCircle, FaClock, FaSpinner, FaExclamationTriangle, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RenterNavbar from '../components/RenterNavbar';

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ComplaintHistory = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
      navigate('/');
      return;
    }
    const user = JSON.parse(loggedInUser);
    setUserData(user);
    fetchComplaints(user.houseId);
  }, [navigate]);

  const fetchComplaints = async (houseId) => {
    try {
      const response = await fetch(`${API_URL}/api/complaints/house/${houseId}`);
      const data = await response.json();
      if (data.success) {
        setComplaints(data.data);
      } else {
        setComplaints([]);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
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
      case 'Rejected': return <FaExclamationTriangle />;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <RenterNavbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <ToastContainer />
      <RenterNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => navigate('/renter-dashboard')}
              className="text-gray-600 hover:text-gray-800"
            >
              <FaArrowLeft className="text-2xl" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Complaint History</h1>
              <p className="text-gray-500 mt-1">Track your previous complaints</p>
            </div>
          </div>

          {complaints.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <FaExclamationTriangle className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No complaints found</p>
              <button 
                onClick={() => navigate('/raise-complaint')}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Raise a Complaint →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div key={complaint._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{complaint.title}</h3>
                      <p className="text-gray-500 text-sm">
                        Complaint ID: {complaint.complaintId} • {new Date(complaint.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
                      {getStatusIcon(complaint.status)} {complaint.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{complaint.description}</p>
                  
                  <div className="flex flex-wrap gap-2 text-sm mb-3">
                    <span className={`px-2 py-1 rounded-full ${getUrgencyColor(complaint.urgency)}`}>
                      Urgency: {complaint.urgency}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                      Type: {getComplaintTypeLabel(complaint.complaintType)}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                      Preferred: {complaint.preferredTime}
                    </span>
                  </div>

                  {complaint.adminRemarks && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Admin Remark:</span> {complaint.adminRemarks}
                      </p>
                    </div>
                  )}

                  {complaint.resolvedAt && (
                    <p className="text-xs text-green-600 mt-2">
                      Resolved on: {new Date(complaint.resolvedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintHistory;