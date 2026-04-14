import Navbar from '../components/Navbar';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navbar />
      <div className="pt-28 pb-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Get in touch with us. We'd love to hear from you!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Send us a Message</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 font-medium">Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 font-medium">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 font-medium">Message</label>
                  <textarea 
                    rows="4" 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Get in Touch</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FaPhone className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Phone</p>
                      <p className="text-gray-800 font-medium">+1 234 567 890</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FaEnvelope className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Email</p>
                      <p className="text-gray-800 font-medium">info@mshulbanni.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FaMapMarkerAlt className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Address</p>
                      <p className="text-gray-800 font-medium">123 Luxury Street, City, Country</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FaClock className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Working Hours</p>
                      <p className="text-gray-800 font-medium">Mon-Sun: 9:00 AM - 8:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Follow Us</h2>
                <div className="flex gap-4">
                  <a href="#" className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center hover:bg-blue-200 transition-colors">
                    <FaFacebook className="text-blue-600 text-2xl" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center hover:bg-blue-200 transition-colors">
                    <FaTwitter className="text-blue-600 text-2xl" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center hover:bg-blue-200 transition-colors">
                    <FaInstagram className="text-blue-600 text-2xl" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;