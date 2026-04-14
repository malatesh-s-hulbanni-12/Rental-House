import { useState } from 'react';
import { FaBars, FaTimes, FaHome, FaBuilding, FaUsers, FaFileContract, FaSignOutAlt, FaUserShield, FaPlusCircle, FaExclamationTriangle, FaUserCog } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', icon: <FaHome className="mr-2" />, path: '/' },
    { name: 'Add Housing', icon: <FaPlusCircle className="mr-2" />, path: '/add-housing' },
    { name: 'Tenants', icon: <FaUsers className="mr-2" />, path: '/tenants' },
    { name: 'Rentals', icon: <FaFileContract className="mr-2" />, path: '/rentals' },
    { name: 'Complaints', icon: <FaExclamationTriangle className="mr-2" />, path: '/complaints' },
    { name: 'Owner', icon: <FaUserCog className="mr-2" />, path: '/owner' },
  ];

  return (
    <nav className="bg-gray-900 shadow-lg px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <FaUserShield className="text-white text-xl" />
            </div>
            <div className="font-bold text-xl md:text-2xl tracking-tight">
              <span className="text-white">Admin </span>
              <span className="text-emerald-400">Panel</span>
              <span className="text-xs md:text-sm block font-normal text-gray-400 -mt-1">MS Hulbanni Housing</span>
            </div>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-1 lg:space-x-2">
          {navLinks.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              className="flex items-center px-4 py-2 text-gray-300 hover:text-white rounded-xl transition-all duration-300 text-sm lg:text-base font-medium hover:bg-gray-800"
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-300 text-2xl focus:outline-none p-2 rounded-xl hover:bg-gray-800 transition-colors"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col space-y-2 pt-4 border-t border-gray-700">
          {navLinks.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              className="flex items-center px-4 py-3 text-gray-300 hover:text-white rounded-xl transition-all duration-300 text-base font-medium hover:bg-gray-800"
              onClick={() => setIsOpen(false)}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;