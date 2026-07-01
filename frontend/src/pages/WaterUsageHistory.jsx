// src/pages/WaterUsageHistory.jsx
import React, { useState, useEffect } from 'react'
import { 
  FaTint, 
  FaCalendarAlt, 
  FaClock, 
  FaUser, 
  FaChartLine, 
  FaWater, 
  FaArrowLeft, 
  FaDownload, 
  FaTrash,
  FaHistory,
  FaEye,
  FaFileDownload,
  FaPlay,
  FaStop,
  FaFilter,
  FaTimes,
  FaCalendar,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import RenterNavbar from '../components/RenterNavbar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const WaterUsageHistory = () => {
  const navigate = useNavigate()
  const [usageRecords, setUsageRecords] = useState([])
  const [filteredRecords, setFilteredRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [filteredStats, setFilteredStats] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter states - Default empty (no filters applied)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filterType, setFilterType] = useState('month') // 'month' or 'range'

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'))
    if (!loggedInUser) {
      navigate('/')
      return
    }
    setUserInfo(loggedInUser)
    fetchWaterUsageHistory(loggedInUser.rentalId)
  }, [])

  const fetchWaterUsageHistory = async (rentalId) => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`${API_URL}/api/water-usage/tenant/${rentalId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setUsageRecords(data.data || [])
        setFilteredRecords(data.data || []) // Show all records by default
        setStats(data.statistics || null)
        setFilteredStats(data.statistics || null) // Show all stats by default
        
        if (data.data && data.data.length === 0) {
          toast.info('No water usage records found. Start tracking your water usage!')
        }
      } else {
        toast.error('Failed to fetch water usage history')
        loadFromLocalStorage(rentalId)
      }
    } catch (error) {
      console.error('Error fetching water usage history:', error)
      loadFromLocalStorage(rentalId)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFromLocalStorage = (rentalId) => {
    try {
      const allHistory = JSON.parse(localStorage.getItem('waterUsageHistory') || '[]')
      const userRecords = allHistory.filter(record => record.rentalId === rentalId || record.tenantId === rentalId)
      
      if (userRecords.length > 0) {
        setUsageRecords(userRecords)
        setFilteredRecords(userRecords) // Show all records by default
        const totalLiters = userRecords.reduce((sum, r) => sum + (r.totalLiters || 0), 0)
        const totalMinutes = userRecords.reduce((sum, r) => sum + (r.totalMinutes || 0), 0)
        const statsData = {
          totalLiters,
          totalMinutes,
          averageLiters: totalLiters / userRecords.length,
          totalRecords: userRecords.length
        }
        setStats(statsData)
        setFilteredStats(statsData)
        toast.info('Showing data from local storage')
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const parts = dateStr.split('/')
    if (parts.length === 3) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return `${parts[0]} ${months[parseInt(parts[1]) - 1]} ${parts[2]}`
    }
    return dateStr
  }

  const parseDate = (dateStr) => {
    if (!dateStr) return null
    const parts = dateStr.split('/')
    if (parts.length === 3) {
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
    }
    return null
  }

  const getUsageLevel = (liters) => {
    if (liters < 500) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100' }
    if (liters < 1000) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    if (liters < 2000) return { level: 'High', color: 'text-orange-600', bg: 'bg-orange-100' }
    return { level: 'Very High', color: 'text-red-600', bg: 'bg-red-100' }
  }

  // Get unique months and years from records
  const getAvailableMonths = () => {
    const months = new Set()
    const years = new Set()
    
    usageRecords.forEach(record => {
      const date = record.date || record.usageDate || record.savedDate
      if (date) {
        const parts = date.split('/')
        if (parts.length === 3) {
          months.add(parts[1])
          years.add(parts[2])
        }
      }
    })
    
    return {
      months: Array.from(months).sort(),
      years: Array.from(years).sort()
    }
  }

  // Apply month filter - NO NOTIFICATION
  const applyMonthFilter = (month, year) => {
    if (!month || !year) {
      setFilteredRecords(usageRecords)
      calculateFilteredStats(usageRecords)
      return
    }
    
    const filtered = usageRecords.filter(record => {
      const date = record.date || record.usageDate || record.savedDate
      if (!date) return false
      const parts = date.split('/')
      if (parts.length !== 3) return false
      return parts[1] === month && parts[2] === year
    })
    
    setFilteredRecords(filtered)
    calculateFilteredStats(filtered)
  }

  // Apply date range filter - NO NOTIFICATION
  const applyDateRangeFilter = (start, end) => {
    if (!start || !end) {
      setFilteredRecords(usageRecords)
      calculateFilteredStats(usageRecords)
      return
    }
    
    const startDateObj = new Date(start)
    const endDateObj = new Date(end)
    endDateObj.setHours(23, 59, 59)
    
    const filtered = usageRecords.filter(record => {
      const date = record.date || record.usageDate || record.savedDate
      if (!date) return false
      const parsedDate = parseDate(date)
      if (!parsedDate) return false
      return parsedDate >= startDateObj && parsedDate <= endDateObj
    })
    
    setFilteredRecords(filtered)
    calculateFilteredStats(filtered)
  }

  // Calculate filtered statistics
  const calculateFilteredStats = (records) => {
    if (records.length === 0) {
      setFilteredStats({
        totalLiters: 0,
        totalMinutes: 0,
        averageLiters: 0,
        totalRecords: 0
      })
      return
    }
    
    const totalLiters = records.reduce((sum, r) => sum + (r.totalLiters || 0), 0)
    const totalMinutes = records.reduce((sum, r) => sum + (r.totalMinutes || 0), 0)
    
    setFilteredStats({
      totalLiters,
      totalMinutes,
      averageLiters: totalLiters / records.length,
      totalRecords: records.length
    })
  }

  // Handle month filter change - NO NOTIFICATION
  const handleMonthChange = (e) => {
    const month = e.target.value
    setSelectedMonth(month)
    setFilterType('month')
    setStartDate('')
    setEndDate('')
    if (month && selectedYear) {
      applyMonthFilter(month, selectedYear)
    } else {
      setFilteredRecords(usageRecords)
      calculateFilteredStats(usageRecords)
    }
  }

  const handleYearChange = (e) => {
    const year = e.target.value
    setSelectedYear(year)
    setFilterType('month')
    setStartDate('')
    setEndDate('')
    if (selectedMonth && year) {
      applyMonthFilter(selectedMonth, year)
    } else {
      setFilteredRecords(usageRecords)
      calculateFilteredStats(usageRecords)
    }
  }

  // Handle date range filter - NO NOTIFICATION
  const handleApplyDateRange = () => {
    if (startDate && endDate) {
      setFilterType('range')
      setSelectedMonth('')
      setSelectedYear('')
      applyDateRangeFilter(startDate, endDate)
    } else {
      toast.warning('Please select both start and end dates')
    }
  }

  // Clear all filters - NO NOTIFICATION
  const clearFilters = () => {
    setSelectedMonth('')
    setSelectedYear('')
    setStartDate('')
    setEndDate('')
    setFilterType('month')
    setFilteredRecords(usageRecords)
    calculateFilteredStats(usageRecords)
    setShowFilters(false)
    // Removed toast notification
  }

  const handleViewDetails = (record) => {
    setSelectedRecord(record)
    setShowDetails(true)
  }

  const handleCloseDetails = () => {
    setShowDetails(false)
    setSelectedRecord(null)
  }

  const handleDeleteRecord = (recordId) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      const updatedRecords = usageRecords.filter(r => r.id !== recordId && r._id !== recordId)
      setUsageRecords(updatedRecords)
      setFilteredRecords(filteredRecords.filter(r => r.id !== recordId && r._id !== recordId))
      calculateFilteredStats(filteredRecords.filter(r => r.id !== recordId && r._id !== recordId))
      toast.success('Record deleted successfully')
    }
  }

  // Export to CSV
  const exportToCSV = () => {
    const recordsToExport = filteredRecords.length > 0 ? filteredRecords : usageRecords
    
    if (recordsToExport.length === 0) {
      toast.warning('No data to export')
      return
    }

    const headers = [
      'Date', 
      'Start Time', 
      'End Time', 
      'Duration (min)', 
      'Water Used (L)', 
      'Purpose', 
      'Status', 
      'Flow Rate (L/min)'
    ]
    
    const csvData = recordsToExport.map(record => [
      formatDate(record.date || record.usageDate || record.savedDate),
      record.startTimeFormatted || record.startTime || 'N/A',
      record.endTimeFormatted || record.endTime || 'N/A',
      record.totalMinutes || 0,
      (record.totalLiters || 0).toFixed(1),
      record.purpose || 'General',
      getUsageLevel(record.totalLiters || 0).level,
      (record.flowRate || 0).toFixed(2)
    ])

    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `water_usage_history_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    toast.success('Data exported successfully as CSV!')
  }

  const { months, years } = getAvailableMonths()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <RenterNavbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading your water usage data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <ToastContainer />
      <RenterNavbar />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={() => navigate('/renter-dashboard')}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-all"
                >
                  <FaArrowLeft className="text-white text-lg sm:text-xl" />
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
                    <FaTint className="text-blue-300" /> Water Usage History
                  </h1>
                  <p className="text-blue-100 text-xs sm:text-sm mt-0.5 sm:mt-1">
                    Track your water consumption and usage patterns
                  </p>
                </div>
              </div>
              {userInfo && (
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 w-full sm:w-auto">
                  <p className="text-white text-xs sm:text-sm">
                    <FaUser className="inline mr-1 sm:mr-2" />
                    {userInfo.tenantName} • {userInfo.houseTitle}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Statistics Cards - Shows all records by default */}
          {filteredStats && filteredStats.totalRecords > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
              <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500">Total Records</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">{filteredStats.totalRecords}</p>
                  </div>
                  <FaChartLine className="text-blue-500 text-xl sm:text-2xl opacity-50" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500">Water Used</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                      {filteredStats.totalLiters ? filteredStats.totalLiters.toFixed(0) : 0} L
                    </p>
                  </div>
                  <FaWater className="text-green-500 text-xl sm:text-2xl opacity-50" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500">Total Time</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">
                      {filteredStats.totalMinutes ? filteredStats.totalMinutes.toFixed(0) : 0} min
                    </p>
                  </div>
                  <FaClock className="text-purple-500 text-xl sm:text-2xl opacity-50" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500">Average per Use</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">
                      {filteredStats.averageLiters ? filteredStats.averageLiters.toFixed(0) : 0} L
                    </p>
                  </div>
                  <FaTint className="text-orange-500 text-xl sm:text-2xl opacity-50" />
                </div>
              </div>
            </div>
          )}

          {/* Filter Section */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden mb-4 sm:mb-6">
            <div 
              className="p-3 sm:p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition"
              onClick={() => setShowFilters(!showFilters)}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <FaFilter className="text-blue-600 text-sm sm:text-base" />
                <span className="font-semibold text-gray-700 text-sm sm:text-base">Filter Records</span>
                {filteredRecords.length !== usageRecords.length && usageRecords.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                    {filteredRecords.length} of {usageRecords.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {(selectedMonth || startDate) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      clearFilters()
                    }}
                    className="text-red-500 hover:text-red-700 text-xs sm:text-sm"
                  >
                    <FaTimes /> Clear
                  </button>
                )}
                {showFilters ? <FaChevronUp className="text-gray-500" /> : <FaChevronDown className="text-gray-500" />}
              </div>
            </div>
            
            {showFilters && (
              <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {/* Month Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Filter by Month</label>
                    <div className="flex gap-2">
                      <select
                        value={selectedMonth}
                        onChange={handleMonthChange}
                        className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Month</option>
                        {months.map(month => (
                          <option key={month} value={month}>
                            {new Date(2000, parseInt(month) - 1, 1).toLocaleString('default', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                      <select
                        value={selectedYear}
                        onChange={handleYearChange}
                        className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Year</option>
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Date Range</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-500 text-xs self-center hidden sm:block">to</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Apply Filter Button */}
                  <div className="flex items-end gap-2">
                    <button
                      onClick={handleApplyDateRange}
                      disabled={!startDate || !endDate}
                      className={`flex-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                        startDate && endDate
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <FaCalendar className="inline mr-1" /> Apply Range
                    </button>
                    <button
                      onClick={clearFilters}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs sm:text-sm font-medium transition"
                    >
                      <FaTimes className="inline mr-1" /> Clear
                    </button>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(selectedMonth || startDate) && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-2">
                    {selectedMonth && selectedYear && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                        <FaCalendarAlt className="text-[10px]" />
                        {new Date(2000, parseInt(selectedMonth) - 1, 1).toLocaleString('default', { month: 'long' })} {selectedYear}
                        <button onClick={clearFilters} className="ml-1 hover:text-red-600">
                          <FaTimes size={10} />
                        </button>
                      </span>
                    )}
                    {startDate && endDate && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                        <FaCalendarAlt className="text-[10px]" />
                        {formatDate(startDate.replace(/-/g, '/').split('/').reverse().join('/'))} - {formatDate(endDate.replace(/-/g, '/').split('/').reverse().join('/'))}
                        <button onClick={clearFilters} className="ml-1 hover:text-red-600">
                          <FaTimes size={10} />
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
            <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FaHistory className="text-blue-600" /> Your Water Usage Records
                  <span className="text-xs sm:text-sm text-gray-500 font-normal ml-1 sm:ml-2">
                    ({filteredRecords.length} records)
                  </span>
                </h2>
                {filteredRecords.length > 0 && (
                  <button
                    onClick={exportToCSV}
                    className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition text-xs sm:text-sm"
                  >
                    <FaFileDownload /> Export CSV
                  </button>
                )}
              </div>
            </div>

            {filteredRecords.length === 0 ? (
              <div className="p-6 sm:p-8 md:p-12 text-center">
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🚿</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No Water Usage Records Found</h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4">
                  {usageRecords.length > 0 ? 'No records match your filter criteria. Try adjusting your filters.' : 'Start tracking your water usage to see your consumption patterns.'}
                </p>
                {usageRecords.length > 0 ? (
                  <button
                    onClick={clearFilters}
                    className="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm sm:text-base"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/water-usage')}
                    className="px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition text-sm sm:text-base"
                  >
                    Start Tracking Now
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">#</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Start</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">End</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Water Used</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Purpose</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Status</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRecords.map((record, index) => {
                      const usageLevel = getUsageLevel(record.totalLiters || 0)
                      return (
                        <tr key={record.id || record._id || index} className="hover:bg-blue-50 transition-colors">
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600">{index + 1}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <FaCalendarAlt className="text-blue-500 text-[10px] sm:text-xs" />
                              <span className="font-medium text-gray-800 text-[10px] sm:text-sm">
                                {formatDate(record.date || record.usageDate || record.savedDate)}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">
                            <span className="text-gray-600 text-[10px] sm:text-sm">
                              {record.startTimeFormatted || record.startTime || 'N/A'}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">
                            <span className="text-gray-600 text-[10px] sm:text-sm">
                              {record.endTimeFormatted || record.endTime || 'N/A'}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <span className="font-medium text-gray-700 text-[10px] sm:text-sm">
                              {record.totalMinutes || 0} min
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <span className="font-bold text-blue-600 text-[10px] sm:text-sm">
                              {(record.totalLiters || 0).toFixed(1)} L
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 hidden md:table-cell">
                            <span className="text-gray-600 text-[10px] sm:text-sm">
                              {record.purpose || 'General'}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">
                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-semibold ${usageLevel.bg} ${usageLevel.color}`}>
                              {usageLevel.level}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <button
                                onClick={() => handleViewDetails(record)}
                                className="px-1.5 sm:px-2 py-1 text-[8px] sm:text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-0.5 sm:gap-1"
                              >
                                <FaEye size={10} /> <span className="hidden sm:inline">View</span>
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(record.id || record._id)}
                                className="px-1.5 sm:px-2 py-1 text-[8px] sm:text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg transition flex items-center gap-0.5 sm:gap-1"
                              >
                                <FaTrash size={10} /> <span className="hidden sm:inline">Del</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer Info */}
          {filteredRecords.length > 0 && (
            <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-500">
              Showing {filteredRecords.length} record{filteredRecords.length > 1 ? 's' : ''}
              {usageRecords.length !== filteredRecords.length && (
                <span className="text-blue-600 ml-2">
                  (Filtered from {usageRecords.length} total records)
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetails && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={handleCloseDetails}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-3 sm:p-4 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
                <FaTint /> Water Usage Details
              </h3>
              <button
                onClick={handleCloseDetails}
                className="bg-white/20 hover:bg-white/30 p-1.5 sm:p-2 rounded-xl transition"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-gray-500">Date</p>
                  <p className="font-semibold text-gray-800 text-xs sm:text-sm">
                    {formatDate(selectedRecord.date || selectedRecord.usageDate || selectedRecord.savedDate)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-gray-500">Duration</p>
                  <p className="font-semibold text-gray-800 text-xs sm:text-sm">
                    {selectedRecord.totalMinutes || 0} minutes
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-gray-500">Start Time</p>
                  <p className="font-semibold text-green-600 text-xs sm:text-sm flex items-center gap-1">
                    <FaPlay size={10} /> {selectedRecord.startTimeFormatted || selectedRecord.startTime || 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-gray-500">End Time</p>
                  <p className="font-semibold text-red-600 text-xs sm:text-sm flex items-center gap-1">
                    <FaStop size={10} /> {selectedRecord.endTimeFormatted || selectedRecord.endTime || 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-gray-500">Water Used</p>
                  <p className="font-semibold text-blue-600 text-xs sm:text-sm">
                    {(selectedRecord.totalLiters || 0).toFixed(1)} Liters
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-gray-500">Flow Rate</p>
                  <p className="font-semibold text-gray-800 text-xs sm:text-sm">
                    {(selectedRecord.flowRate || 0).toFixed(2)} L/min
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-gray-500">Purpose</p>
                  <p className="font-semibold text-gray-800 text-xs sm:text-sm">
                    {selectedRecord.purpose || 'General'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-gray-500">Status</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getUsageLevel(selectedRecord.totalLiters || 0).bg} ${getUsageLevel(selectedRecord.totalLiters || 0).color}`}>
                    {getUsageLevel(selectedRecord.totalLiters || 0).level}
                  </span>
                </div>
              </div>

              {/* Tank Breakdown */}
              {selectedRecord.breakdown && selectedRecord.breakdown.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 text-xs sm:text-sm mb-1 sm:mb-2">Tank Breakdown</h4>
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3 space-y-1.5 sm:space-y-2 max-h-40 overflow-y-auto">
                    {selectedRecord.breakdown.map((tank, idx) => (
                      <div key={idx} className="flex flex-wrap justify-between items-center border-b border-gray-200 pb-1.5 sm:pb-2 last:border-0 gap-1">
                        <span className="text-[10px] sm:text-sm text-gray-600">Tank {tank.tankNumber}</span>
                        <span className="text-[10px] sm:text-sm text-gray-600">{tank.duration?.toFixed(1)} min</span>
                        <span className="text-[10px] sm:text-sm font-medium text-blue-600">{tank.liters?.toFixed(1)} L</span>
                        <span className={`text-[8px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${tank.isFull ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {tank.isFull ? 'Full' : 'Partial'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tenant Details */}
              <div className="bg-blue-50 rounded-lg p-2 sm:p-3 mt-2 sm:mt-3">
                <p className="text-[10px] sm:text-xs text-gray-500">Tenant</p>
                <p className="font-semibold text-gray-800 text-sm sm:text-base">
                  {selectedRecord.personName || selectedRecord.tenantName || userInfo?.tenantName || 'N/A'}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">
                  House: {selectedRecord.houseId || selectedRecord.location || userInfo?.houseTitle || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default WaterUsageHistory