import { useState } from 'react';
import { FaBars, FaTimes, FaHome, FaPhoneAlt, FaInfoCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', icon: <FaHome className="mr-2" />, path: '/' },
    { name: 'About', icon: <FaInfoCircle className="mr-2" />, path: '/about' },
    { name: 'Contact', icon: <FaPhoneAlt className="mr-2" />, path: '/contact' },
  ];

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-md shadow-md px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaHome className="text-white text-xl" />
            </div>
            <div className="font-bold text-xl md:text-2xl tracking-tight">
              MS <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Hulbanni</span>
              <span className="text-xs md:text-sm block font-normal text-gray-500 -mt-1">Housing</span>
            </div>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-1 lg:space-x-2">
          {navLinks.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 rounded-xl transition-all duration-300 text-sm lg:text-base font-medium hover:bg-blue-50"
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-700 text-2xl focus:outline-none p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden fixed top-[68px] left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col space-y-2 px-6 py-4">
          {navLinks.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 rounded-xl transition-all duration-300 text-base font-medium hover:bg-blue-50"
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

export default Navbar;