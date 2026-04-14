import { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaHome, FaWater, FaBolt, FaWifi, FaBug, FaTrash, FaArrowLeft, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RenterNavbar from '../components/RenterNavbar';

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const RaiseComplaint = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    complaintType: '',
    title: '',
    description: '',
    urgency: 'Medium',
    preferredTime: 'Any time'
  });

  useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
      navigate('/');
      return;
    }
    setUserData(JSON.parse(loggedInUser));
  }, [navigate]);

  const complaintTypes = [
    { value: 'plumbing', label: 'Plumbing Issue', icon: <FaWater />, color: 'orange' },
    { value: 'electrical', label: 'Electrical Issue', icon: <FaBolt />, color: 'yellow' },
    { value: 'internet', label: 'Internet/WiFi', icon: <FaWifi />, color: 'purple' },
    { value: 'pest', label: 'Pest Control', icon: <FaBug />, color: 'green' },
    { value: 'garbage', label: 'Garbage/Sanitation', icon: <FaTrash />, color: 'red' },
    { value: 'other', label: 'Other Issue', icon: <FaExclamationTriangle />, color: 'gray' }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.complaintType) {
      toast.error('Please select a complaint type');
      return;
    }
    
    if (!formData.title.trim()) {
      toast.error('Please enter a complaint title');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Please enter complaint description');
      return;
    }

    setSubmitting(true);

    try {
      const complaintData = {
        houseId: userData.houseId,
        houseTitle: userData.houseTitle,
        tenantName: userData.tenantName,
        tenantEmail: userData.tenantEmail,
        tenantPhone: userData.tenantPhone,
        ...formData
      };

      const response = await fetch(`${API_URL}/api/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(complaintData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Complaint submitted successfully! We will contact you soon.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Reset form
        setFormData({
          complaintType: '',
          title: '',
          description: '',
          urgency: 'Medium',
          preferredTime: 'Any time'
        });
        
        // Navigate back after 2 seconds
        setTimeout(() => {
          navigate('/renter-dashboard');
        }, 2000);
      } else {
        toast.error(data.message || 'Failed to submit complaint');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <ToastContainer />
      <RenterNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => navigate('/renter-dashboard')}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaArrowLeft className="text-2xl" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Raise a Complaint</h1>
              <p className="text-gray-500 mt-1">We'll address your issue as soon as possible</p>
            </div>
          </div>

          {/* Property Info Card */}
          <div className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-200">
            <div className="flex items-center gap-3">
              <FaHome className="text-blue-600 text-xl" />
              <div>
                <p className="text-sm text-gray-600">Property Details</p>
                <p className="font-semibold text-gray-800">
                  {userData.houseTitle} ({userData.houseId})
                </p>
                <p className="text-sm text-gray-600">Tenant: {userData.tenantName}</p>
              </div>
            </div>
          </div>

          {/* Complaint Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Complaint Type */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Complaint Type *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {complaintTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, complaintType: type.value })}
                      className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                        formData.complaintType === type.value
                          ? `bg-${type.color}-500 text-white border-${type.color}-500`
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {type.icon}
                      <span className="text-sm">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Complaint Title */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Complaint Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g., Water leakage in bathroom"
                />
              </div>

              {/* Urgency Level */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Urgency Level *</label>
                <div className="flex gap-3 flex-wrap">
                  {['High', 'Medium', 'Low'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({ ...formData, urgency: level })}
                      className={`px-6 py-2 rounded-xl border-2 font-semibold transition-all ${
                        formData.urgency === level
                          ? level === 'High' 
                            ? 'bg-red-500 text-white border-red-500'
                            : level === 'Medium'
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-green-500 text-white border-green-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Detailed Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Please provide detailed description of the issue..."
                />
              </div>

              {/* Preferred Time */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Preferred Visit Time</label>
                <select
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                >
                  <option>Morning (9 AM - 12 PM)</option>
                  <option>Afternoon (12 PM - 3 PM)</option>
                  <option>Evening (3 PM - 6 PM)</option>
                  <option>Any time</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className={`w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
                  submitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? 'Submitting...' : <><FaPaperPlane /> Submit Complaint</>}
              </button>
            </form>
          </div>

          {/* Info Note */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Note:</span> Our support team will acknowledge your complaint within 24 hours and schedule a visit based on urgency level.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaiseComplaint;