import { useState, useEffect } from 'react';
import { FaArrowRight, FaShieldAlt, FaClock, FaBuilding, FaTimes, FaHome, FaSpinner, FaKey } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Hero = () => {
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingHouses, setFetchingHouses] = useState(true);
  const [loginError, setLoginError] = useState('');

  // Fetch houses from MongoDB when component mounts
  useEffect(() => {
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    setFetchingHouses(true);
    try {
      const response = await fetch(`${API_URL}/api/housing`);
      const data = await response.json();
      console.log('Fetched houses for login:', data);
      if (data.success && data.data) {
        setHouses(data.data);
      } else {
        setHouses([]);
      }
    } catch (error) {
      console.error('Error fetching houses:', error);
      toast.error('Failed to load houses. Please check connection.');
      setHouses([]);
    } finally {
      setFetchingHouses(false);
    }
  };

  // Reset form function
  const resetForm = () => {
    setSelectedHouse('');
    setSecretKey('');
    setLoginError('');
  };

  // Close login modal and reset form
  const handleCloseModal = () => {
    setIsLoginOpen(false);
    resetForm();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    if (!selectedHouse) {
      toast.warning('Please select your house');
      return;
    }
    
    if (!secretKey) {
      toast.warning('Please enter your secret key');
      return;
    }

    setLoading(true);
    
    try {
      // Check if the secret key matches for the selected house
      const response = await fetch(`${API_URL}/api/rentals/verify-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          houseId: selectedHouse,
          secretKey: secretKey
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store user info in localStorage
        localStorage.setItem('loggedInUser', JSON.stringify({
          houseId: data.rental.houseId,
          houseTitle: data.rental.houseTitle,
          tenantName: data.rental.tenantName,
          tenantEmail: data.rental.tenantEmail,
          tenantPhone: data.rental.tenantPhone,
          secretKey: secretKey,
          rentalId: data.rental._id
        }));
        
        // Success notification
        toast.success(`🎉 Welcome ${data.rental.tenantName}! Login successful.`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Close popup and reset form
        setIsLoginOpen(false);
        resetForm();
        
        // Navigate after short delay
        setTimeout(() => {
          navigate('/renter-dashboard');
        }, 1500);
      } else {
        setLoginError(data.message || 'Invalid secret key for this house');
        toast.error(data.message || 'Invalid secret key for this house');
      }
    } catch (error) {
      const errorMsg = 'Network error. Please make sure backend is running.';
      setLoginError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/* Clean White/Gray Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>

      {/* Content */}
      <div className="relative z-10 w-full px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-6xl mx-auto text-center">
          {/* Welcome Badge */}
          <div className="inline-flex items-center bg-blue-50 rounded-full px-4 py-2 mb-6 shadow-sm">
            <span className="text-blue-600 mr-2">✦</span>
            <span className="text-gray-700 text-sm font-medium">Welcome to Luxury Living</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-6 leading-tight">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MS Hulbanni
            </span>
            <br />
            <span className="text-4xl md:text-6xl text-gray-700">Housing</span>
          </h1>

          {/* Description */}
          <p className="text-gray-600 text-base md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Experience the perfect blend of luxury, comfort, and modern living. 
            Your dream home awaits with world-class amenities.
          </p>

          {/* Login Button */}
          <div className="max-w-md mx-auto mb-10">
            <button 
              onClick={() => {
                resetForm();
                setIsLoginOpen(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-105 text-lg w-full"
            >
              Login to Your Home <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white rounded-2xl p-4 text-center shadow-md border border-gray-100">
              <div className="text-2xl md:text-3xl font-bold text-blue-600">50+</div>
              <div className="text-gray-600 text-sm">Luxury Properties</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-md border border-gray-100">
              <div className="text-2xl md:text-3xl font-bold text-blue-600">200+</div>
              <div className="text-gray-600 text-sm">Happy Families</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-md border border-gray-100">
              <div className="text-2xl md:text-3xl font-bold text-blue-600">24/7</div>
              <div className="text-gray-600 text-sm">Security Support</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-md border border-gray-100">
              <div className="text-2xl md:text-3xl font-bold text-blue-600">5★</div>
              <div className="text-gray-600 text-sm">Rated Service</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl transition-all">
              Explore Housing <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-white text-gray-700 px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all">
              <FaShieldAlt /> Virtual Tour
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 p-3 rounded-xl inline-block mb-4">
              <FaClock className="text-blue-600 text-2xl" />
            </div>
            <h3 className="text-gray-800 font-semibold mb-2 text-lg">Flexible Visit Hours</h3>
            <p className="text-gray-500 text-sm">Schedule at your convenience</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 p-3 rounded-xl inline-block mb-4">
              <FaShieldAlt className="text-blue-600 text-2xl" />
            </div>
            <h3 className="text-gray-800 font-semibold mb-2 text-lg">24/7 Security</h3>
            <p className="text-gray-500 text-sm">CCTV & Professional guards</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 p-3 rounded-xl inline-block mb-4">
              <FaBuilding className="text-blue-600 text-2xl" />
            </div>
            <h3 className="text-gray-800 font-semibold mb-2 text-lg">Modern Amenities</h3>
            <p className="text-gray-500 text-sm">Gym, pool & clubhouse</p>
          </div>
        </div>
      </div>

      {/* Login Popup Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop - Click to close and reset */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={handleCloseModal}
          ></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in-up">
            {/* Close Button - Reset form on close */}
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaBuilding className="text-white text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Login to Your Home</h2>
              <p className="text-gray-500 mt-2">Select your house and enter your secret key</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {loginError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {loginError}
                </div>
              )}

              {/* Select House Dropdown */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Select Your House *</label>
                <div className="relative">
                  <FaHome className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={selectedHouse}
                    onChange={(e) => setSelectedHouse(e.target.value)}
                    required
                    disabled={fetchingHouses}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 appearance-none bg-white disabled:bg-gray-100"
                  >
                    <option value="">-- Select Your House --</option>
                    {houses.map((house) => (
                      <option key={house._id} value={house.houseId}>
                        {house.houseId} - {house.houseTitle} ({house.bhkType})
                      </option>
                    ))}
                  </select>
                </div>
                {fetchingHouses && (
                  <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                    <FaSpinner className="animate-spin" /> Loading houses...
                  </p>
                )}
              </div>

              {/* Secret Key Field */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Secret Key *</label>
                <div className="relative">
                  <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    required
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="Enter your secret key"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-mono"
                  />
                </div>
              </div>

              {/* Selected House Info */}
              {selectedHouse && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold text-blue-700">Selected House:</span><br />
                    {houses.find(h => h.houseId === selectedHouse)?.houseTitle} ({selectedHouse})
                  </p>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading || fetchingHouses}
                className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 ${(loading || fetchingHouses) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? <FaSpinner className="animate-spin" /> : <><FaArrowRight /> Login</>}
              </button>
            </form>
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
    </section>
  );
};

export default Hero;