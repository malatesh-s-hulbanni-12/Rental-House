import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPlus, FaEye, FaCheckCircle, FaClock, FaTimesCircle, FaHome, FaUser, FaEnvelope, FaPhone, FaRupeeSign, FaCalendarAlt, FaEdit, FaFileAlt, FaSpinner, FaKey, FaMoneyBillWave } from 'react-icons/fa';

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Rentals = () => {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingHouses, setFetchingHouses] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form data for new rental
  const [formData, setFormData] = useState({
    houseId: '',
    houseTitle: '',
    tenantName: '',
    tenantEmail: '',
    tenantPhone: '',
    rentAmount: '',
    advanceAmount: '',
    startDate: '',
    endDate: '',
    secretKey: ''
  });
  
  // Renew form data
  const [renewData, setRenewData] = useState({
    newEndDate: '',
    rentAmount: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [renewError, setRenewError] = useState('');
  const [renewSuccess, setRenewSuccess] = useState('');

  // Fetch all rentals and houses
  useEffect(() => {
    fetchRentals();
    fetchHouses();
  }, []);

  const fetchRentals = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rentals`);
      const data = await response.json();
      if (data.success) {
        setRentals(data.data);
      }
    } catch (error) {
      console.error('Error fetching rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHouses = async () => {
    setFetchingHouses(true);
    try {
      const response = await fetch(`${API_URL}/api/housing`);
      const data = await response.json();
      if (data.success && data.data) {
        setHouses(data.data);
      } else {
        setHouses([]);
      }
    } catch (error) {
      console.error('Error fetching houses:', error);
      setHouses([]);
    } finally {
      setFetchingHouses(false);
    }
  };

  const handleHouseSelect = (e) => {
    const selectedHouseId = e.target.value;
    const selectedHouse = houses.find(house => house.houseId === selectedHouseId);
    
    if (selectedHouse) {
      setFormData({
        ...formData,
        houseId: selectedHouse.houseId,
        houseTitle: selectedHouse.houseTitle
      });
      setError('');
    } else {
      setFormData({
        ...formData,
        houseId: '',
        houseTitle: ''
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRenewChange = (e) => {
    setRenewData({ ...renewData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.houseId) {
      setError('Please select a house');
      return;
    }

    if (!formData.secretKey) {
      setError('Please enter a secret key');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/rentals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Rental agreement created successfully!');
        setTimeout(() => {
          setShowModal(false);
          fetchRentals();
          fetchHouses();
          setFormData({
            houseId: '',
            houseTitle: '',
            tenantName: '',
            tenantEmail: '',
            tenantPhone: '',
            rentAmount: '',
            advanceAmount: '',
            startDate: '',
            endDate: '',
            secretKey: ''
          });
          setSuccess('');
        }, 2000);
      } else {
        setError(data.message || 'Failed to create rental agreement');
      }
    } catch (error) {
      setError('Network error. Please make sure backend server is running.');
    }
  };

  const handleViewDetails = (rental) => {
    setSelectedRental(rental);
    setShowDetailsModal(true);
  };

  // Navigate to Agreement Page when clicking View Agreement
  const handleViewAgreement = (rental) => {
    navigate(`/admin/agreement?id=${rental._id}`);
  };

  const handleRenewClick = (rental) => {
    setSelectedRental(rental);
    setRenewData({
      newEndDate: '',
      rentAmount: rental.rentAmount
    });
    setShowRenewModal(true);
    setRenewError('');
    setRenewSuccess('');
  };

  const handleRenewSubmit = async (e) => {
    e.preventDefault();
    setRenewError('');
    setRenewSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/rentals/${selectedRental._id}/renew`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newEndDate: renewData.newEndDate,
          rentAmount: renewData.rentAmount
        })
      });

      const data = await response.json();

      if (response.ok) {
        setRenewSuccess('Rental agreement renewed successfully!');
        setTimeout(() => {
          setShowRenewModal(false);
          fetchRentals();
          setRenewData({ newEndDate: '', rentAmount: '' });
        }, 2000);
      } else {
        setRenewError(data.message || 'Failed to renew agreement');
      }
    } catch (error) {
      setRenewError('Network error. Please try again.');
    }
  };

  const filteredRentals = rentals.filter(rental =>
    rental.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rental.houseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rental.houseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rental.secretKey?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || fetchingHouses) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Rental Agreements</h1>
            <p className="text-gray-500 mt-1">Manage all rental agreements and contracts</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
          >
            <FaPlus /> New Agreement
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by tenant name, house title, house ID or secret key..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Rentals Grid */}
        {filteredRentals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <FaHome className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No rental agreements found</p>
            <button 
              onClick={() => setShowModal(true)}
              className="mt-4 text-emerald-500 hover:text-emerald-600 font-medium"
            >
              + Create your first rental agreement
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRentals.map((rental) => (
              <div key={rental._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{rental.houseTitle}</h3>
                      <p className="text-gray-500 text-sm">House ID: {rental.houseId}</p>
                      <p className="text-gray-500 text-sm">Tenant: {rental.tenantName}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      rental.agreementStatus === 'Active' ? 'bg-green-100 text-green-600' :
                      rental.agreementStatus === 'Expired' ? 'bg-red-100 text-red-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {rental.agreementStatus === 'Active' && <FaCheckCircle className="text-xs" />}
                      {rental.agreementStatus === 'Expired' && <FaTimesCircle className="text-xs" />}
                      {rental.agreementStatus}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Monthly Rent:</span>
                      <span className="font-semibold text-emerald-600">₹{rental.rentAmount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Advance Amount:</span>
                      <span className="font-semibold text-blue-600">₹{rental.advanceAmount?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Start Date:</span>
                      <span className="text-gray-700 text-sm">{new Date(rental.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">End Date:</span>
                      <span className="text-gray-700 text-sm">{new Date(rental.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Secret Key:</span>
                      <span className="font-mono text-sm text-gray-700">••••••</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Payment Status:</span>
                      <span className={`text-sm font-medium ${rental.paymentStatus === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                        {rental.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleViewDetails(rental)}
                      className="flex-1 bg-blue-500 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition flex items-center justify-center gap-1"
                    >
                      <FaEye /> View Details
                    </button>
                    <button 
                      onClick={() => handleViewAgreement(rental)}
                      className="flex-1 bg-purple-500 text-white py-2 rounded-xl text-sm font-medium hover:bg-purple-600 transition flex items-center justify-center gap-1"
                    >
                      <FaFileAlt /> View Agreement
                    </button>
                    <button 
                      onClick={() => handleRenewClick(rental)}
                      className="flex-1 border border-emerald-500 text-emerald-600 py-2 rounded-xl text-sm font-medium hover:bg-emerald-50 transition flex items-center justify-center gap-1"
                    >
                      <FaEdit /> Renew
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Agreement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">New Rental Agreement</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Select House */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Select House *</label>
                  <div className="relative">
                    <FaHome className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      value={formData.houseId}
                      onChange={handleHouseSelect}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 appearance-none bg-white"
                    >
                      <option value="">-- Select a House --</option>
                      {houses.map((house) => (
                        <option key={house._id} value={house.houseId}>
                          {house.houseId} - {house.houseTitle} ({house.bhkType}) - Status: {house.status}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formData.houseTitle && (
                    <p className="text-green-600 text-sm mt-1">✓ Selected: {formData.houseTitle}</p>
                  )}
                </div>

                {/* Tenant Name */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Tenant Name *</label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="tenantName"
                      value={formData.tenantName}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500"
                      placeholder="Enter tenant full name"
                    />
                  </div>
                </div>

                {/* Tenant Email */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Tenant Email *</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="tenantEmail"
                      value={formData.tenantEmail}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500"
                      placeholder="tenant@email.com"
                    />
                  </div>
                </div>

                {/* Tenant Phone */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Tenant Phone *</label>
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="tenantPhone"
                      value={formData.tenantPhone}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                {/* Monthly Rent */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Monthly Rent (₹) *</label>
                  <div className="relative">
                    <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="rentAmount"
                      value={formData.rentAmount}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500"
                      placeholder="25000"
                    />
                  </div>
                </div>

                {/* Advance Amount */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Advance Amount (₹) *</label>
                  <div className="relative">
                    <FaMoneyBillWave className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="advanceAmount"
                      value={formData.advanceAmount}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500"
                      placeholder="Enter advance amount paid"
                    />
                  </div>
                  <p className="text-gray-400 text-xs mt-1">Advance payment made at the time of agreement signing</p>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Start Date *</label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">End Date *</label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Secret Key */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Secret Key *</label>
                  <div className="relative">
                    <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="secretKey"
                      value={formData.secretKey}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                      placeholder="Enter a unique secret key for this agreement"
                    />
                  </div>
                  <p className="text-gray-400 text-xs mt-1">This secret key will be used for tenant login and agreement verification</p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Create Rental Agreement
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetailsModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Rental Agreement Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-3">Property Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-gray-500 text-sm">House ID</p><p className="font-medium">{selectedRental.houseId}</p></div>
                    <div><p className="text-gray-500 text-sm">House Title</p><p className="font-medium">{selectedRental.houseTitle}</p></div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-3">Tenant Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-gray-500 text-sm">Name</p><p className="font-medium">{selectedRental.tenantName}</p></div>
                    <div><p className="text-gray-500 text-sm">Email</p><p className="font-medium">{selectedRental.tenantEmail}</p></div>
                    <div><p className="text-gray-500 text-sm">Phone</p><p className="font-medium">{selectedRental.tenantPhone}</p></div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-3">Agreement Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-gray-500 text-sm">Monthly Rent</p><p className="font-medium text-emerald-600">₹{selectedRental.rentAmount?.toLocaleString()}</p></div>
                    <div><p className="text-gray-500 text-sm">Advance Amount</p><p className="font-medium text-blue-600">₹{selectedRental.advanceAmount?.toLocaleString() || '0'}</p></div>
                    <div><p className="text-gray-500 text-sm">Start Date</p><p className="font-medium">{new Date(selectedRental.startDate).toLocaleDateString()}</p></div>
                    <div><p className="text-gray-500 text-sm">End Date</p><p className="font-medium">{new Date(selectedRental.endDate).toLocaleDateString()}</p></div>
                    <div><p className="text-gray-500 text-sm">Secret Key</p><p className="font-mono font-medium text-gray-800">{selectedRental.secretKey}</p></div>
                    <div><p className="text-gray-500 text-sm">Agreement Status</p><p className={`font-medium ${selectedRental.agreementStatus === 'Active' ? 'text-green-600' : 'text-red-600'}`}>{selectedRental.agreementStatus}</p></div>
                    <div><p className="text-gray-500 text-sm">Payment Status</p><p className={`font-medium ${selectedRental.paymentStatus === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>{selectedRental.paymentStatus}</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Renew Modal */}
      {showRenewModal && selectedRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRenewModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Renew Agreement</h2>
              <button onClick={() => setShowRenewModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <div className="p-6">
              {renewError && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                  {renewError}
                </div>
              )}
              {renewSuccess && (
                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl">
                  {renewSuccess}
                </div>
              )}

              <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">Property: <span className="font-semibold">{selectedRental.houseTitle}</span></p>
                <p className="text-sm text-gray-600">Tenant: <span className="font-semibold">{selectedRental.tenantName}</span></p>
                <p className="text-sm text-gray-600">Current End Date: <span className="font-semibold">{new Date(selectedRental.endDate).toLocaleDateString()}</span></p>
              </div>

              <form onSubmit={handleRenewSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">New End Date *</label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      name="newEndDate"
                      value={renewData.newEndDate}
                      onChange={handleRenewChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">New Rent Amount (₹)</label>
                  <div className="relative">
                    <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="rentAmount"
                      value={renewData.rentAmount}
                      onChange={handleRenewChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500"
                      placeholder="Leave empty to keep same rent"
                    />
                  </div>
                  <p className="text-gray-400 text-xs mt-1">Current rent: ₹{selectedRental.rentAmount?.toLocaleString()}</p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Renew Agreement
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rentals;