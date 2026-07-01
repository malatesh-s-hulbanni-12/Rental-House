import { useState } from 'react';
import { 
  FaHome, 
  FaMoneyBillWave, 
  FaExclamationTriangle, 
  FaUserEdit, 
  FaSignOutAlt, 
  FaHistory, 
  FaBars, 
  FaTimes, 
  FaTint,
  FaFileInvoice
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RenterNavbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/');
  };

  const handlePayRent = () => {
    toast.info('🏠 Pay Rent feature coming soon!', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
  };

  const handleRaiseComplaint = () => {
    navigate('/raise-complaint');
    setIsMobileMenuOpen(false);
  };

  const handleComplaintHistory = () => {
    navigate('/complaint-history');
    setIsMobileMenuOpen(false);
  };

  const handleEditProfile = () => {
    navigate('/renter-profile');
    setIsMobileMenuOpen(false);
  };

  const handleWaterUsage = () => {
    navigate('/water-usage-history');
    setIsMobileMenuOpen(false);
  };

  const handleWaterBill = () => {
    navigate('/water-bill');
    setIsMobileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    handleLogout();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <ToastContainer />
      <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <FaHome className="text-2xl" />
              <div>
                <h1 className="text-lg md:text-xl font-bold">MS Hulbanni Housing</h1>
                <p className="text-xs opacity-90 hidden sm:block">Renter Portal</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-3">
              {/* Water Usage Button - Red with pulsing light effect */}
              <button 
                onClick={handleWaterUsage}
                className="relative bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl flex items-center gap-2 transition-all text-sm font-semibold shadow-lg hover:shadow-red-500/50"
              >
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <FaTint className="text-white animate-pulse" /> Water Usage
              </button>

              {/* Water Bill Button - Green */}
              <button 
                onClick={handleWaterBill}
                className="relative bg-green-500 hover:bg-green-600 px-4 py-2 rounded-xl flex items-center gap-2 transition-all text-sm font-semibold shadow-lg hover:shadow-green-500/50"
              >
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <FaFileInvoice className="text-white" /> Water Bill
              </button>
              
              <button 
                onClick={handlePayRent}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl flex items-center gap-2 transition-all text-sm"
              >
                <FaMoneyBillWave /> Pay Rent
              </button>
              <button 
                onClick={handleRaiseComplaint}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl flex items-center gap-2 transition-all text-sm"
              >
                <FaExclamationTriangle /> Raise Complaint
              </button>
              <button 
                onClick={handleComplaintHistory}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl flex items-center gap-2 transition-all text-sm"
              >
                <FaHistory /> Complaint History
              </button>
              <button 
                onClick={handleEditProfile}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl flex items-center gap-2 transition-all text-sm"
              >
                <FaUserEdit /> Edit Profile
              </button>
              <button 
                onClick={handleLogoutClick}
                className="bg-red-500/80 hover:bg-red-600 px-4 py-2 rounded-xl flex items-center gap-2 transition-all text-sm"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>

            {/* Mobile Menu Button - Hamburger */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden bg-white/20 p-2 rounded-xl focus:outline-none"
            >
              {isMobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>

          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-white/20 animate-fade-in">
              <div className="flex flex-col gap-2">
                {/* Water Usage Button - Mobile with red color */}
                <button 
                  onClick={handleWaterUsage}
                  className="bg-red-500 hover:bg-red-600 px-4 py-3 rounded-xl flex items-center gap-3 transition-all text-base font-semibold"
                >
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <FaTint className="text-white animate-pulse" /> Water Usage
                </button>

                {/* Water Bill Button - Mobile with green color */}
                <button 
                  onClick={handleWaterBill}
                  className="bg-green-500 hover:bg-green-600 px-4 py-3 rounded-xl flex items-center gap-3 transition-all text-base font-semibold"
                >
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <FaFileInvoice className="text-white" /> Water Bill
                </button>
                
                <button 
                  onClick={() => {
                    handlePayRent();
                    setIsMobileMenuOpen(false);
                  }}
                  className="bg-white/20 hover:bg-white/30 px-4 py-3 rounded-xl flex items-center gap-3 transition-all text-base"
                >
                  <FaMoneyBillWave className="text-lg" /> Pay Rent
                </button>
                <button 
                  onClick={handleRaiseComplaint}
                  className="bg-white/20 hover:bg-white/30 px-4 py-3 rounded-xl flex items-center gap-3 transition-all text-base"
                >
                  <FaExclamationTriangle className="text-lg" /> Raise Complaint
                </button>
                <button 
                  onClick={handleComplaintHistory}
                  className="bg-white/20 hover:bg-white/30 px-4 py-3 rounded-xl flex items-center gap-3 transition-all text-base"
                >
                  <FaHistory className="text-lg" /> Complaint History
                </button>
                <button 
                  onClick={handleEditProfile}
                  className="bg-white/20 hover:bg-white/30 px-4 py-3 rounded-xl flex items-center gap-3 transition-all text-base"
                >
                  <FaUserEdit className="text-lg" /> Edit Profile
                </button>
                <button 
                  onClick={handleLogoutClick}
                  className="bg-red-500/80 hover:bg-red-600 px-4 py-3 rounded-xl flex items-center gap-3 transition-all text-base"
                >
                  <FaSignOutAlt className="text-lg" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </>
  );
};

export default RenterNavbar;