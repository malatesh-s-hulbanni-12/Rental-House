import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaSave, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RenterNavbar from '../components/RenterNavbar';

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const RenterProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tenantName: '',
    tenantEmail: '',
    tenantPhone: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
      navigate('/');
      return;
    }
    
    const user = JSON.parse(loggedInUser);
    setFormData({
      tenantName: user.tenantName || '',
      tenantEmail: user.tenantEmail || '',
      tenantPhone: user.tenantPhone || ''
    });
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      
      const response = await fetch(`${API_URL}/api/rentals/${loggedInUser.rentalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantName: formData.tenantName,
          tenantEmail: formData.tenantEmail,
          tenantPhone: formData.tenantPhone
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Update localStorage
        const updatedUser = {
          ...loggedInUser,
          tenantName: formData.tenantName,
          tenantEmail: formData.tenantEmail,
          tenantPhone: formData.tenantPhone
        };
        localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
        
        toast.success('Profile updated successfully!');
        setTimeout(() => {
          navigate('/renter-dashboard');
        }, 1500);
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <ToastContainer />
      <RenterNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => navigate('/renter-dashboard')}
              className="text-gray-600 hover:text-gray-800"
            >
              <FaArrowLeft className="text-2xl" />
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Edit Profile</h1>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="tenantName"
                    value={formData.tenantName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="tenantEmail"
                    value={formData.tenantEmail}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="tenantPhone"
                    value={formData.tenantPhone}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><FaSave /> Save Changes</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenterProfile;