import { useState, useEffect } from 'react';
import { FaSearch, FaEnvelope, FaPhone, FaHome, FaSpinner, FaEye } from 'react-icons/fa';

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch tenants from rental agreements
  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rentals`);
      const data = await response.json();
      if (data.success && data.data) {
        // Transform rental data to tenant format
        const tenantsList = data.data.map(rental => ({
          id: rental._id,
          name: rental.tenantName,
          email: rental.tenantEmail,
          phone: rental.tenantPhone,
          house: rental.houseTitle,
          houseId: rental.houseId,
          rent: `₹${rental.rentAmount?.toLocaleString()}`,
          status: rental.agreementStatus === 'Active' ? 'Active' : 'Inactive',
          moveIn: new Date(rental.startDate).toLocaleDateString(),
          endDate: new Date(rental.endDate).toLocaleDateString(),
          paymentStatus: rental.paymentStatus
        }));
        setTenants(tenantsList);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter tenants based on search
  const filteredTenants = tenants.filter(tenant =>
    tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.house?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.houseId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading tenants...</p>
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Tenants</h1>
            <p className="text-gray-500 mt-1">Manage all tenants renting your properties</p>
          </div>
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-xl shadow">
            Total Tenants: {tenants.length}
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tenants by name, email, house ID or house title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Tenants Table */}
        {filteredTenants.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FaHome className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No tenants found</p>
            <p className="text-gray-400 text-sm mt-2">Tenants will appear here when rental agreements are created</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tenant Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">House Details</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Rent</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Move In</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{tenant.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <FaEnvelope className="text-xs" /> {tenant.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <FaPhone className="text-xs" /> {tenant.phone}
                          </div>
                        </div>
                       </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-700 font-medium">{tenant.house}</div>
                        <div className="text-gray-400 text-xs">ID: {tenant.houseId}</div>
                       </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-emerald-600">{tenant.rent}</span>
                        <div className="text-gray-400 text-xs">per month</div>
                       </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          tenant.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {tenant.status}
                        </span>
                       </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-700 text-sm">{tenant.moveIn}</div>
                        <div className="text-gray-400 text-xs">Until: {tenant.endDate}</div>
                       </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          tenant.paymentStatus === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {tenant.paymentStatus}
                        </span>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tenants;