import { useState } from 'react';
import { FaHome, FaIdCard, FaBuilding, FaUpload, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AddHousing = () => {
  const [formData, setFormData] = useState({
    houseTitle: '',
    houseId: '',
    bhkType: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/housing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
        setFormData({
          houseTitle: '',
          houseId: '',
          bhkType: ''
        });
      } else {
        setError(data.message || 'Failed to add house');
      }
    } catch (error) {
      setError('Network error. Please make sure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Add New Housing</h1>
          <p className="text-gray-500 mt-1">Fill in the details to list a new house for rent</p>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <FaCheckCircle />
            <span>House added successfully to database!</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <FaExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* House Title */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">House Title *</label>
                <div className="relative">
                  <FaHome className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="houseTitle"
                    value={formData.houseTitle}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500"
                    placeholder="e.g., Sunrise Villa, Green Apartment"
                  />
                </div>
              </div>

              {/* House ID */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">House ID *</label>
                <div className="relative">
                  <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="houseId"
                    value={formData.houseId}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500"
                    placeholder="e.g., H-001, H-002"
                  />
                </div>
              </div>

              {/* BHK Type Select */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Type (BHK) *</label>
                <div className="relative">
                  <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="bhkType"
                    value={formData.bhkType}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 appearance-none bg-white"
                  >
                    <option value="">Select BHK Type</option>
                    <option value="1 BHK">1 BHK</option>
                    <option value="2 BHK">2 BHK</option>
                    <option value="3 BHK">3 BHK</option>
                    <option value="4 BHK">4 BHK</option>
                    <option value="5 BHK">5 BHK</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Adding...' : <><FaUpload /> Add Housing</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddHousing;