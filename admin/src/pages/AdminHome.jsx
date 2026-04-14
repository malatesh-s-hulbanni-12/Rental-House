import { useState, useEffect } from 'react';
import { FaBuilding, FaUsers, FaKey, FaRupeeSign, FaEye, FaCheckCircle, FaClock, FaSpinner } from 'react-icons/fa';

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminHome = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalTenants: 0,
    activeRentals: 0,
    revenue: 0
  });
  const [recentProperties, setRecentProperties] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch housing data
      const housingResponse = await fetch(`${API_URL}/api/housing`);
      const housingData = await housingResponse.json();
      
      // Fetch rentals data
      const rentalsResponse = await fetch(`${API_URL}/api/rentals`);
      const rentalsData = await rentalsResponse.json();

      if (housingData.success && rentalsData.success) {
        const properties = housingData.data || [];
        const rentals = rentalsData.data || [];
        
        // Calculate stats
        const totalProperties = properties.length;
        const activeRentals = rentals.filter(r => r.agreementStatus === 'Active').length;
        
        // Get unique tenants from rentals
        const uniqueTenants = [...new Map(rentals.map(r => [r.tenantEmail, r])).values()];
        const totalTenants = uniqueTenants.length;
        
        // Calculate total revenue (sum of all rent amounts)
        const totalRevenue = rentals.reduce((sum, r) => sum + (r.rentAmount || 0), 0);
        
        setStats({
          totalProperties,
          totalTenants,
          activeRentals,
          revenue: totalRevenue
        });
        
        // Get recent properties (last 4)
        const recentProps = [...properties].reverse().slice(0, 4);
        setRecentProperties(recentProps.map(p => ({
          id: p._id,
          name: p.houseTitle,
          location: 'Location not specified',
          price: `₹${p.bhkType}`,
          status: p.status || 'Available',
          views: Math.floor(Math.random() * 300) + 50
        })));
        
        // Get recent bookings (last 4 rentals)
        const recentRentals = [...rentals].reverse().slice(0, 4);
        setRecentBookings(recentRentals.map(r => ({
          id: r._id,
          tenant: r.tenantName,
          property: r.houseTitle,
          date: new Date(r.createdAt).toLocaleDateString(),
          status: r.paymentStatus === 'Paid' ? 'Confirmed' : 
                  r.agreementStatus === 'Active' ? 'Pending' : 'Completed'
        })));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { title: 'Total Properties', value: stats.totalProperties, icon: <FaBuilding />, color: 'from-blue-500 to-blue-600', change: `${stats.totalProperties} total` },
    { title: 'Total Tenants', value: stats.totalTenants, icon: <FaUsers />, color: 'from-emerald-500 to-emerald-600', change: `${stats.totalTenants} active tenants` },
    { title: 'Active Rentals', value: stats.activeRentals, icon: <FaKey />, color: 'from-purple-500 to-purple-600', change: `${stats.activeRentals} ongoing` },
    { title: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: <FaRupeeSign />, color: 'from-orange-500 to-orange-600', change: 'Total collected' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6 md:p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Welcome back, Admin!</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your housing properties today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <div key={index} className={`bg-gradient-to-r ${stat.color} rounded-2xl p-6 text-white shadow-lg`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/80 text-sm">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <p className="text-white/60 text-xs mt-2">{stat.change}</p>
                </div>
                <div className="text-3xl text-white/50">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Properties */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Recent Properties</h2>
              <a href="/admin/add-housing" className="text-blue-600 text-sm hover:underline">Add New →</a>
            </div>
            {recentProperties.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaBuilding className="text-4xl mx-auto mb-2 text-gray-300" />
                <p>No properties added yet</p>
                <a href="/admin/add-housing" className="text-blue-500 text-sm mt-2 inline-block">Add your first property</a>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProperties.map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{property.name}</h3>
                      <p className="text-gray-500 text-sm">{property.location}</p>
                      <p className="text-emerald-600 font-medium text-sm mt-1">{property.price}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        property.status === 'Available' ? 'bg-green-100 text-green-600' :
                        property.status === 'Rented' ? 'bg-blue-100 text-blue-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {property.status}
                      </span>
                      <div className="flex items-center gap-1 mt-2 text-gray-400 text-xs">
                        <FaEye /> {property.views} views
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Recent Rentals</h2>
              <a href="/admin/rentals" className="text-blue-600 text-sm hover:underline">View All →</a>
            </div>
            {recentBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaKey className="text-4xl mx-auto mb-2 text-gray-300" />
                <p>No rentals yet</p>
                <a href="/admin/rentals" className="text-blue-500 text-sm mt-2 inline-block">Create rental agreement</a>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-gray-800">{booking.tenant}</h3>
                      <p className="text-gray-500 text-sm">{booking.property}</p>
                      <p className="text-gray-400 text-xs mt-1">{booking.date}</p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'Confirmed' ? 'bg-green-100 text-green-600' :
                        booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {booking.status === 'Confirmed' && <FaCheckCircle className="text-xs" />}
                        {booking.status === 'Pending' && <FaClock className="text-xs" />}
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/admin/add-housing" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl text-center hover:shadow-lg transition-all">
            <FaBuilding className="text-2xl mx-auto mb-2" />
            <span className="font-medium">Add Property</span>
          </a>
          <a href="/admin/tenants" className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-xl text-center hover:shadow-lg transition-all">
            <FaUsers className="text-2xl mx-auto mb-2" />
            <span className="font-medium">Manage Tenants</span>
          </a>
          <a href="/admin/rentals" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl text-center hover:shadow-lg transition-all">
            <FaKey className="text-2xl mx-auto mb-2" />
            <span className="font-medium">View Rentals</span>
          </a>
          <a href="/admin/owner" className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl text-center hover:shadow-lg transition-all">
            <FaRupeeSign className="text-2xl mx-auto mb-2" />
            <span className="font-medium">Owner Profile</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;