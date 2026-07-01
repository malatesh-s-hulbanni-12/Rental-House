// src/pages/TankCalculator.jsx
import React, { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const TankCalculator = () => {
  const [language, setLanguage] = useState('english')
  const [tankCapacity, setTankCapacity] = useState(1000)
  const [fillTime, setFillTime] = useState(35)
  const [startTime, setStartTime] = useState('20:05')
  const [endTime, setEndTime] = useState('20:30')
  const [calculatedMinutes, setCalculatedMinutes] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [currentDate, setCurrentDate] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  
  const [showTankSettings, setShowTankSettings] = useState(false)
  
  const [tenants, setTenants] = useState([])
  const [selectedTenant, setSelectedTenant] = useState('')
  const [usagePurpose, setUsagePurpose] = useState('')
  const [location, setLocation] = useState('')
  const [usageHistory, setUsageHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState(null)
  const [apiError, setApiError] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  const getCurrentDate = () => {
    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = now.getFullYear()
    return `${day}/${month}/${year}`
  }

  useEffect(() => {
    setCurrentDate(getCurrentDate())
  }, [])

  const getCurrentTime = () => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const setCurrentStartTime = () => {
    setStartTime(getCurrentTime())
    toast.info(language === 'english' ? 'Start time set to current time' : 'ಪ್ರಾರಂಭ ಸಮಯವನ್ನು ಪ್ರಸ್ತುತ ಸಮಯಕ್ಕೆ ಹೊಂದಿಸಲಾಗಿದೆ')
  }

  const setCurrentEndTime = () => {
    setEndTime(getCurrentTime())
    toast.info(language === 'english' ? 'End time set to current time' : 'ಅಂತ್ಯ ಸಮಯವನ್ನು ಪ್ರಸ್ತುತ ಸಮಯಕ್ಕೆ ಹೊಂದಿಸಲಾಗಿದೆ')
  }

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setIsLoading(true)
        setApiError(false)
        
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'))
        
        const response = await fetch(`${API_URL}/api/rentals`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success && data.data && data.data.length > 0) {
          const activeTenants = data.data.filter(rental => 
            rental.rentalStatus === 'Active' || rental.rentalStatus === 'active'
          )
          
          const tenantsToShow = activeTenants.length > 0 ? activeTenants : data.data
          setTenants(tenantsToShow)
          
          if (loggedInUser && loggedInUser.rentalId) {
            const userTenant = tenantsToShow.find(t => t._id === loggedInUser.rentalId)
            if (userTenant) {
              setSelectedTenant(userTenant._id)
              setLocation(userTenant.houseTitle || '')
              setUserData(userTenant)
            }
          }
        } else {
          if (loggedInUser) {
            setTenants([{
              _id: loggedInUser.rentalId || 'local',
              tenantName: loggedInUser.tenantName || 'Guest',
              houseTitle: loggedInUser.houseTitle || 'Unknown',
              houseId: loggedInUser.houseId || 'N/A',
              bhkType: 'N/A',
              rentalStatus: 'Active'
            }])
            setSelectedTenant(loggedInUser.rentalId || 'local')
            setLocation(loggedInUser.houseTitle || '')
          }
        }
      } catch (error) {
        console.error('Error fetching tenants:', error)
        setApiError(true)
        toast.error('Failed to load tenants. Using local data.')
        
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'))
        if (loggedInUser) {
          setTenants([{
            _id: loggedInUser.rentalId || 'local',
            tenantName: loggedInUser.tenantName || 'Guest',
            houseTitle: loggedInUser.houseTitle || 'Unknown',
            houseId: loggedInUser.houseId || 'N/A',
            bhkType: 'N/A',
            rentalStatus: 'Active'
          }])
          setSelectedTenant(loggedInUser.rentalId || 'local')
          setLocation(loggedInUser.houseTitle || '')
        } else {
          setTenants([{
            _id: 'demo1',
            tenantName: 'Demo User',
            houseTitle: 'Demo House',
            houseId: 'DEMO-001',
            bhkType: '2 BHK',
            rentalStatus: 'Active'
          }])
          setSelectedTenant('demo1')
          setLocation('Demo House')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchTenants()
  }, [])

  useEffect(() => {
    if (selectedTenant) {
      const selected = tenants.find(t => t._id === selectedTenant)
      if (selected) {
        setUserData(selected)
        setLocation(selected.houseTitle || selected.houseId || '')
      }
    }
  }, [selectedTenant, tenants])

  const translations = {
    title: {
      english: "Water Usage Tracker",
      kannada: "ನೀರಿನ ಬಳಕೆ ಟ್ರ್ಯಾಕರ್"
    },
    dateLabel: {
      english: "📅 Date",
      kannada: "📅 ದಿನಾಂಕ"
    },
    tankSettings: {
      english: "⚙️ Tank Settings",
      kannada: "⚙️ ಟ್ಯಾಂಕ್ ಸೆಟ್ಟಿಂಗ್ಗಳು"
    },
    tankCapacity: {
      english: "Tank Capacity (Liters)",
      kannada: "ಟ್ಯಾಂಕ್ ಸಾಮರ್ಥ್ಯ (ಲೀಟರ್)"
    },
    fillTime: {
      english: "Time to Fill Tank (Minutes)",
      kannada: "ಟ್ಯಾಂಕ್ ತುಂಬುವ ಸಮಯ (ನಿಮಿಷಗಳು)"
    },
    startTime: {
      english: "Start Time",
      kannada: "ಪ್ರಾರಂಭ ಸಮಯ"
    },
    endTime: {
      english: "End Time",
      kannada: "ಅಂತ್ಯ ಸಮಯ"
    },
    start: {
      english: "Start",
      kannada: "ಪ್ರಾರಂಭ"
    },
    end: {
      english: "End",
      kannada: "ಅಂತ್ಯ"
    },
    calculate: {
      english: "Calculate",
      kannada: "ಲೆಕ್ಕಾಚಾರ"
    },
    save: {
      english: "Save",
      kannada: "ಉಳಿಸಿ"
    },
    saving: {
      english: "Saving...",
      kannada: "ಉಳಿಸಲಾಗುತ್ತಿದೆ..."
    },
    calculating: {
      english: "Calculating...",
      kannada: "ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತಿದೆ..."
    },
    flowRate: {
      english: "Flow Rate",
      kannada: "ಹರಿವಿನ ದರ"
    },
    litersPerMinute: {
      english: "Liters per Minute",
      kannada: "ನಿಮಿಷಕ್ಕೆ ಲೀಟರ್"
    },
    totalWaterUsed: {
      english: "Total Water Used",
      kannada: "ಒಟ್ಟು ನೀರಿನ ಬಳಕೆ"
    },
    timeDuration: {
      english: "Time Duration",
      kannada: "ಸಮಯದ ಅವಧಿ"
    },
    minutes: {
      english: "Minutes",
      kannada: "ನಿಮಿಷಗಳು"
    },
    liters: {
      english: "Liters",
      kannada: "ಲೀಟರ್"
    },
    errorInvalidTime: {
      english: "Please enter valid start and end times. End time must be after start time.",
      kannada: "ದಯವಿಟ್ಟು ಸರಿಯಾದ ಪ್ರಾರಂಭ ಮತ್ತು ಅಂತ್ಯ ಸಮಯಗಳನ್ನು ನಮೂದಿಸಿ. ಅಂತ್ಯ ಸಮಯವು ಪ್ರಾರಂಭ ಸಮಯಕ್ಕಿಂತ ನಂತರ ಇರಬೇಕು."
    },
    errorInvalidNumbers: {
      english: "Please enter valid numbers.",
      kannada: "ದಯವಿಟ್ಟು ಸರಿಯಾದ ಸಂಖ್ಯೆಗಳನ್ನು ನಮೂದಿಸಿ."
    },
    errorCapacity: {
      english: "Tank capacity and fill time must be greater than zero.",
      kannada: "ಟ್ಯಾಂಕ್ ಸಾಮರ್ಥ್ಯ ಮತ್ತು ತುಂಬುವ ಸಮಯ ಶೂನ್ಯಕ್ಕಿಂತ ಹೆಚ್ಚಿರಬೇಕು."
    },
    totalTanks: {
      english: "Total Tanks Filled",
      kannada: "ಒಟ್ಟು ಟ್ಯಾಂಕ್‌ಗಳು ತುಂಬಿದವು"
    },
    remainingWater: {
      english: "Remaining in Current Tank",
      kannada: "ಪ್ರಸ್ತುತ ಟ್ಯಾಂಕ್‌ನಲ್ಲಿ ಉಳಿದಿದೆ"
    },
    fullTanks: {
      english: "Full Tanks",
      kannada: "ಪೂರ್ಣ ಟ್ಯಾಂಕ್‌ಗಳು"
    },
    partialTank: {
      english: "Partial Tank",
      kannada: "ಭಾಗಶಃ ಟ್ಯಾಂಕ್"
    },
    editHint: {
      english: "💡 Edit values below to match your system",
      kannada: "💡 ನಿಮ್ಮ ಸಿಸ್ಟಮ್ಗೆ ಹೊಂದಿಸಲು ಕೆಳಗಿನ ಮೌಲ್ಯಗಳನ್ನು ಸಂಪಾದಿಸಿ"
    },
    timeCalculated: {
      english: "Time Duration Calculated",
      kannada: "ಸಮಯದ ಅವಧಿ ಲೆಕ್ಕಹಾಕಲಾಗಿದೆ"
    },
    clickCalculate: {
      english: "Click 'Calculate' to see the results",
      kannada: "ಫಲಿತಾಂಶಗಳನ್ನು ನೋಡಲು 'ಲೆಕ್ಕಾಚಾರ' ಕ್ಲಿಕ್ ಮಾಡಿ"
    },
    timeRange: {
      english: "Time Range",
      kannada: "ಸಮಯದ ವ್ಯಾಪ್ತಿ"
    },
    usageDetails: {
      english: "Usage Details",
      kannada: "ಬಳಕೆಯ ವಿವರಗಳು"
    },
    selectTenant: {
      english: "Select Tenant/Renter",
      kannada: "ಬಾಡಿಗೆದಾರರನ್ನು ಆಯ್ಕೆಮಾಡಿ"
    },
    personName: {
      english: "Tenant Name",
      kannada: "ಬಾಡಿಗೆದಾರರ ಹೆಸರು"
    },
    purpose: {
      english: "Purpose of Usage",
      kannada: "ಬಳಕೆಯ ಉದ್ದೇಶ"
    },
    location: {
      english: "House/Location",
      kannada: "ಮನೆ/ಸ್ಥಳ"
    },
    selectTenantPlaceholder: {
      english: "-- Select a tenant --",
      kannada: "-- ಬಾಡಿಗೆದಾರರನ್ನು ಆಯ್ಕೆಮಾಡಿ --"
    },
    noTenants: {
      english: "No tenants found in the system",
      kannada: "ಸಿಸ್ಟಮ್ನಲ್ಲಿ ಯಾವುದೇ ಬಾಡಿಗೆದಾರರು ಕಂಡುಬಂದಿಲ್ಲ"
    },
    tenantDetails: {
      english: "Tenant Details",
      kannada: "ಬಾಡಿಗೆದಾರರ ವಿವರಗಳು"
    },
    houseId: {
      english: "House ID",
      kannada: "ಮನೆ ID"
    },
    bhkType: {
      english: "BHK Type",
      kannada: "BHK ಪ್ರಕಾರ"
    },
    status: {
      english: "Status",
      kannada: "ಸ್ಥಿತಿ"
    },
    savedSuccess: {
      english: "✅ Usage saved successfully to database! Refreshing page...",
      kannada: "✅ ಬಳಕೆ ಡೇಟಾಬೇಸ್ಗೆ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ! ಪುಟವನ್ನು ರಿಫ್ರೆಶ್ ಮಾಡಲಾಗುತ್ತಿದೆ..."
    },
    savedLocal: {
      english: "⚠️ Saved to local storage only. Database connection failed. Refreshing page...",
      kannada: "⚠️ ಸ್ಥಳೀಯ ಸಂಗ್ರಹದಲ್ಲಿ ಮಾತ್ರ ಉಳಿಸಲಾಗಿದೆ. ಡೇಟಾಬೇಸ್ ಸಂಪರ್ಕ ವಿಫಲವಾಗಿದೆ. ಪುಟವನ್ನು ರಿಫ್ರೆಶ್ ಮಾಡಲಾಗುತ್ತಿದೆ..."
    },
    apiError: {
      english: "⚠️ Unable to connect to server. Using local data.",
      kannada: "⚠️ ಸರ್ವರ್ಗೆ ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ. ಸ್ಥಳೀಯ ಡೇಟಾವನ್ನು ಬಳಸಲಾಗುತ್ತಿದೆ."
    },
    resetDefault: {
      english: "Reset to Default",
      kannada: "ಡೀಫಾಲ್ಟ್ಗೆ ಮರುಹೊಂದಿಸಿ"
    },
    resetConfirm: {
      english: "Reset tank settings to default values?",
      kannada: "ಟ್ಯಾಂಕ್ ಸೆಟ್ಟಿಂಗ್ಗಳನ್ನು ಡೀಫಾಲ್ಟ್ ಮೌಲ್ಯಗಳಿಗೆ ಮರುಹೊಂದಿಸುವುದೇ?"
    },
    showSettings: {
      english: "Show Settings",
      kannada: "ಸೆಟ್ಟಿಂಗ್ಗಳನ್ನು ತೋರಿಸು"
    },
    hideSettings: {
      english: "Hide Settings",
      kannada: "ಸೆಟ್ಟಿಂಗ್ಗಳನ್ನು ಮರೆಮಾಡು"
    },
    currentValues: {
      english: "Current:",
      kannada: "ಪ್ರಸ್ತುತ:"
    },
    savedOn: {
      english: "Saved on",
      kannada: "ಉಳಿಸಲಾಗಿದೆ"
    },
    calculateError: {
      english: "Please select a tenant and enter valid times",
      kannada: "ದಯವಿಟ್ಟು ಬಾಡಿಗೆದಾರರನ್ನು ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ಸರಿಯಾದ ಸಮಯಗಳನ್ನು ನಮೂದಿಸಿ"
    },
    selectTenantError: {
      english: "Please select a tenant first",
      kannada: "ದಯವಿಟ್ಟು ಮೊದಲು ಬಾಡಿಗೆದಾರರನ್ನು ಆಯ್ಕೆಮಾಡಿ"
    },
    pageRefresh: {
      english: "Page will refresh in a moment...",
      kannada: "ಪುಟವು ಕ್ಷಣದಲ್ಲಿ ರಿಫ್ರೆಶ್ ಆಗಲಿದೆ..."
    }
  }

  const calculateTimeDifference = (start, end) => {
    if (!start || !end) return 0
    
    const [startHours, startMinutes] = start.split(':').map(Number)
    const [endHours, endMinutes] = end.split(':').map(Number)
    
    if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
      return 0
    }
    
    let totalStartMinutes = startHours * 60 + startMinutes
    let totalEndMinutes = endHours * 60 + endMinutes
    
    if (totalEndMinutes <= totalStartMinutes) {
      totalEndMinutes += 24 * 60
    }
    
    return totalEndMinutes - totalStartMinutes
  }

  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return ''
    const [hours, minutes] = timeStr.split(':')
    const h = parseInt(hours)
    const m = parseInt(minutes)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const displayHours = h % 12 || 12
    return `${displayHours}:${String(m).padStart(2, '0')} ${ampm}`
  }

  useEffect(() => {
    if (startTime && endTime) {
      const minutes = calculateTimeDifference(startTime, endTime)
      if (minutes > 0) {
        setCalculatedMinutes(minutes)
        setError('')
      } else {
        setCalculatedMinutes(null)
        if (startTime && endTime) {
          setError(translations.errorInvalidTime[language])
        }
      }
    }
  }, [startTime, endTime, language])

  const calculateWaterUsage = () => {
    setError('')
    setResult(null)

    if (!selectedTenant) {
      toast.warning(translations.selectTenantError[language])
      return
    }

    if (!calculatedMinutes || calculatedMinutes <= 0) {
      setError(translations.errorInvalidTime[language])
      toast.error(translations.errorInvalidTime[language])
      return
    }

    if (tankCapacity <= 0 || fillTime <= 0) {
      setError(translations.errorCapacity[language])
      toast.error(translations.errorCapacity[language])
      return
    }

    setIsCalculating(true)

    try {
      const selected = tenants.find(t => t._id === selectedTenant)
      const tenantName = selected ? selected.tenantName : 'Unnamed'

      const rate = tankCapacity / fillTime
      const totalLiters = calculatedMinutes * rate
      const fullTanks = Math.floor(totalLiters / tankCapacity)
      const remainingLiters = totalLiters % tankCapacity
      const partialPercentage = (remainingLiters / tankCapacity) * 100

      const breakdown = []
      let remainingTime = calculatedMinutes
      let currentTime = startTime
      let tankCount = 0

      while (remainingTime > 0.01) {
        const timeForThisTank = Math.min(remainingTime, fillTime)
        const litersForThisTank = timeForThisTank * rate
        tankCount++
        
        const [hours, minutes] = currentTime.split(':').map(Number)
        const totalMinutes = hours * 60 + minutes + timeForThisTank
        const endHours = Math.floor(totalMinutes / 60) % 24
        const endMins = Math.round(totalMinutes % 60)
        const endTimeStr = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`
        
        breakdown.push({
          tankNumber: tankCount,
          startTime: currentTime,
          endTime: endTimeStr,
          duration: timeForThisTank,
          liters: litersForThisTank,
          isFull: Math.abs(timeForThisTank - fillTime) < 0.01
        })
        
        remainingTime -= timeForThisTank
        currentTime = endTimeStr
      }

      const newResult = {
        totalMinutes: calculatedMinutes,
        flowRate: rate,
        totalLiters: totalLiters,
        fullTanks: fullTanks,
        remainingLiters: remainingLiters,
        partialPercentage: partialPercentage,
        breakdown: breakdown,
        tankCapacity: tankCapacity,
        fillTime: fillTime,
        startTime: startTime,
        endTime: endTime,
        startTimeFormatted: formatTimeDisplay(startTime),
        endTimeFormatted: formatTimeDisplay(endTime),
        personName: tenantName,
        tenantId: selectedTenant,
        purpose: usagePurpose || 'General',
        location: location || 'Not specified',
        houseId: selected?.houseId || 'N/A',
        houseTitle: selected?.houseTitle || 'Unknown',
        rentalId: selectedTenant,
        timestamp: new Date().toLocaleString(),
        date: currentDate,
        time: getCurrentTime()
      }

      setResult(newResult)
      toast.success('✅ Calculation completed successfully!')
    } catch (error) {
      console.error('Error calculating water usage:', error)
      toast.error('Error calculating water usage. Please try again.')
    } finally {
      setIsCalculating(false)
    }
  }

  // Save current result to database and localStorage with page refresh
  const saveResult = async () => {
    if (!result) {
      toast.warning('Please calculate first before saving')
      return
    }
    
    setIsSaving(true)
    
    try {
      const waterUsageData = {
        rentalId: result.rentalId,
        tenantName: result.personName,
        houseId: result.houseId,
        houseTitle: result.houseTitle || 'Unknown',
        tankCapacity: result.tankCapacity,
        fillTime: result.fillTime,
        startTime: result.startTime,
        endTime: result.endTime,
        startTimeFormatted: result.startTimeFormatted,
        endTimeFormatted: result.endTimeFormatted,
        totalMinutes: result.totalMinutes,
        purpose: result.purpose,
        location: result.location,
        flowRate: result.flowRate,
        totalLiters: result.totalLiters,
        fullTanks: result.fullTanks,
        remainingLiters: result.remainingLiters,
        partialPercentage: result.partialPercentage,
        breakdown: result.breakdown,
        usageDate: currentDate,
        usageTime: getCurrentTime()
      }

      const response = await fetch(`${API_URL}/api/water-usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(waterUsageData)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const historyEntry = {
          ...result,
          id: Date.now(),
          savedAt: new Date().toLocaleString(),
          savedDate: currentDate,
          savedTime: getCurrentTime(),
          dbId: data.data._id
        }
        
        const existingHistory = JSON.parse(localStorage.getItem('waterUsageHistory') || '[]')
        const updatedHistory = [...existingHistory, historyEntry]
        localStorage.setItem('waterUsageHistory', JSON.stringify(updatedHistory))
        setUsageHistory(updatedHistory)
        
        toast.success(translations.savedSuccess[language])
        toast.info(translations.pageRefresh[language])
        
        // Refresh the page after 2.5 seconds
        setTimeout(() => {
          window.location.reload()
        }, 2500)
        
      } else {
        const historyEntry = {
          ...result,
          id: Date.now(),
          savedAt: new Date().toLocaleString(),
          savedDate: currentDate,
          savedTime: getCurrentTime()
        }
        
        const existingHistory = JSON.parse(localStorage.getItem('waterUsageHistory') || '[]')
        const updatedHistory = [...existingHistory, historyEntry]
        localStorage.setItem('waterUsageHistory', JSON.stringify(updatedHistory))
        setUsageHistory(updatedHistory)
        
        toast.warning(translations.savedLocal[language])
        toast.info(translations.pageRefresh[language])
        
        setTimeout(() => {
          window.location.reload()
        }, 2500)
      }
    } catch (error) {
      console.error('Error saving water usage:', error)
      
      const historyEntry = {
        ...result,
        id: Date.now(),
        savedAt: new Date().toLocaleString(),
        savedDate: currentDate,
        savedTime: getCurrentTime()
      }
      
      const existingHistory = JSON.parse(localStorage.getItem('waterUsageHistory') || '[]')
      const updatedHistory = [...existingHistory, historyEntry]
      localStorage.setItem('waterUsageHistory', JSON.stringify(updatedHistory))
      setUsageHistory(updatedHistory)
      
      toast.error(translations.savedLocal[language])
      toast.info(translations.pageRefresh[language])
      
      setTimeout(() => {
        window.location.reload()
      }, 2500)
    } finally {
      setIsSaving(false)
    }
  }

  const resetToDefault = () => {
    if (window.confirm(translations.resetConfirm[language])) {
      setTankCapacity(1000)
      setFillTime(35)
      toast.info('Tank settings reset to default values')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[400px] px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 pb-8">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="mt-14 sm:mt-0"
      />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
              {translations.title[language]}
            </h1>
            <div className="mt-2 flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 inline-block">
              <span className="text-white text-xs sm:text-sm font-medium">
                {translations.dateLabel[language]}:
              </span>
              <span className="text-white text-xs sm:text-sm font-bold">
                {currentDate}
              </span>
            </div>
            {apiError && (
              <div className="mt-2 bg-yellow-500/20 backdrop-blur-sm rounded-lg p-2 border border-yellow-400/50">
                <p className="text-yellow-100 text-xs sm:text-sm">
                  {translations.apiError[language]}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setLanguage(language === 'english' ? 'kannada' : 'english')}
            className="bg-white text-orange-600 hover:bg-gray-100 font-bold py-1.5 sm:py-2 px-3 sm:px-6 rounded-lg shadow-md transition duration-300 text-xs sm:text-sm md:text-base w-full sm:w-auto"
          >
            {language === 'english' ? 'ಕನ್ನಡ' : 'English'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
        <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
          
          {/* Collapsible Tank Settings */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowTankSettings(!showTankSettings)}
              className="w-full px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition flex justify-between items-center"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-base sm:text-lg md:text-xl">⚙️</span>
                <span className="font-semibold text-gray-700 text-xs sm:text-sm md:text-base">
                  {translations.tankSettings[language]}
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500 bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                  {translations.currentValues[language]} {tankCapacity}L / {fillTime}min
                </span>
              </div>
              <span className="text-gray-500 text-lg sm:text-xl md:text-2xl transition-transform duration-300">
                {showTankSettings ? '−' : '+'}
              </span>
            </button>
            
            {showTankSettings && (
              <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 border-t border-gray-200 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                      {translations.tankCapacity[language]}
                    </label>
                    <input
                      type="number"
                      value={tankCapacity}
                      onChange={(e) => setTankCapacity(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-xs sm:text-sm md:text-base"
                      min="1"
                      step="100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                      {translations.fillTime[language]}
                    </label>
                    <input
                      type="number"
                      value={fillTime}
                      onChange={(e) => setFillTime(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-xs sm:text-sm md:text-base"
                      min="1"
                      step="1"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={resetToDefault}
                    className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-[10px] sm:text-xs md:text-sm rounded-lg transition flex items-center gap-1 sm:gap-2"
                  >
                    <span>↺</span> {translations.resetDefault[language]}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Time Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                {translations.startTime[language]}
              </label>
              <div className="flex gap-1 sm:gap-2">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="flex-1 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-xs sm:text-sm md:text-base"
                  step="60"
                />
                <button
                  onClick={setCurrentStartTime}
                  className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 bg-green-500 hover:bg-green-600 text-white text-[10px] sm:text-xs md:text-sm font-medium rounded-lg transition whitespace-nowrap"
                >
                  {translations.start[language]}
                </button>
              </div>
              {startTime && (
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                  {formatTimeDisplay(startTime)}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                {translations.endTime[language]}
              </label>
              <div className="flex gap-1 sm:gap-2">
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="flex-1 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-xs sm:text-sm md:text-base"
                  step="60"
                />
                <button
                  onClick={setCurrentEndTime}
                  className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 bg-red-500 hover:bg-red-600 text-white text-[10px] sm:text-xs md:text-sm font-medium rounded-lg transition whitespace-nowrap"
                >
                  {translations.end[language]}
                </button>
              </div>
              {endTime && (
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                  {formatTimeDisplay(endTime)}
                </p>
              )}
            </div>
          </div>

          {/* Usage Details */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-2.5 sm:p-3 md:p-4 border border-blue-200">
            <h4 className="font-semibold text-gray-700 text-xs sm:text-sm md:text-base mb-2 sm:mb-3">
              {translations.usageDetails[language]}
            </h4>
            <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-600 mb-0.5 sm:mb-1">
                  {translations.selectTenant[language]}
                </label>
                {tenants.length > 0 ? (
                  <select
                    value={selectedTenant}
                    onChange={(e) => setSelectedTenant(e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-[10px] sm:text-sm bg-white"
                  >
                    <option value="">{translations.selectTenantPlaceholder[language]}</option>
                    {tenants.map((tenant) => (
                      <option key={tenant._id} value={tenant._id}>
                        {tenant.tenantName} - {tenant.houseTitle} ({tenant.houseId})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-500">{translations.noTenants[language]}</p>
                )}
              </div>

              {selectedTenant && userData && (
                <div className="bg-white/70 rounded-lg p-1.5 sm:p-2 md:p-3 border border-blue-100">
                  <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    {translations.tenantDetails[language]}:
                  </p>
                  <div className="grid grid-cols-2 gap-1 sm:gap-2 text-[10px] sm:text-xs">
                    <div>
                      <span className="text-gray-500">{translations.personName[language]}:</span>
                      <span className="ml-1 font-medium text-gray-800">{userData.tenantName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">{translations.houseId[language]}:</span>
                      <span className="ml-1 font-medium text-gray-800">{userData.houseId}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">{translations.bhkType[language]}:</span>
                      <span className="ml-1 font-medium text-gray-800">{userData.bhkType || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">{translations.status[language]}:</span>
                      <span className={`ml-1 font-medium ${userData.rentalStatus === 'Active' || userData.rentalStatus === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                        {userData.rentalStatus || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-600 mb-0.5 sm:mb-1">
                  {translations.purpose[language]}
                </label>
                <select
                  value={usagePurpose}
                  onChange={(e) => setUsagePurpose(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-[10px] sm:text-sm"
                >
                  <option value="">Select purpose</option>
                  <option value="Bathing">Bathing</option>
                  <option value="Washing Clothes">Washing Clothes</option>
                  <option value="Kitchen Use">Kitchen Use</option>
                  <option value="Gardening">Gardening</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Toilet Flush">Toilet Flush</option>
                  <option value="Vehicle Wash">Vehicle Wash</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-600 mb-0.5 sm:mb-1">
                  {translations.location[language]}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Bathroom, Garden"
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-[10px] sm:text-sm bg-white"
                  readOnly={!!selectedTenant}
                />
                {selectedTenant && (
                  <p className="text-[10px] sm:text-xs text-green-600 mt-0.5 sm:mt-1">✓ Auto-filled from tenant profile</p>
                )}
              </div>
            </div>
          </div>

          {/* Auto-calculated Minutes Display */}
          {calculatedMinutes !== null && calculatedMinutes > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-2.5 sm:p-3 md:p-4 border-2 border-blue-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                    <span className="font-semibold text-gray-700 text-[10px] sm:text-xs md:text-sm">
                      {translations.timeRange[language]}:
                    </span>
                    <span className="text-xs sm:text-sm md:text-base font-bold text-blue-600">
                      {formatTimeDisplay(startTime)} → {formatTimeDisplay(endTime)}
                    </span>
                  </div>
                  <div className="mt-0.5 sm:mt-1">
                    <span className="font-semibold text-gray-700 text-[10px] sm:text-xs md:text-sm">
                      {translations.timeCalculated[language]}:
                    </span>
                    <span className="ml-1 sm:ml-2 text-base sm:text-lg md:text-xl font-bold text-blue-600">
                      {calculatedMinutes} {translations.minutes[language]}
                    </span>
                  </div>
                </div>
                <div className="border-t sm:border-t-0 sm:border-l border-blue-200 pt-2 sm:pt-0 sm:pl-3 md:pl-4">
                  <div className="flex flex-wrap justify-between items-center">
                    <span className="text-[10px] sm:text-xs md:text-sm text-gray-600">
                      {translations.flowRate[language]}:
                    </span>
                    <span className="font-semibold text-purple-600 text-[10px] sm:text-xs md:text-sm">
                      {(tankCapacity / fillTime).toFixed(2)} {translations.litersPerMinute[language]}
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-between items-center mt-0.5 sm:mt-1">
                    <span className="text-[10px] sm:text-xs md:text-sm text-gray-600">
                      {language === 'english' ? 'Water per minute:' : 'ನಿಮಿಷಕ್ಕೆ ನೀರು:'}
                    </span>
                    <span className="font-semibold text-green-600 text-[10px] sm:text-xs md:text-sm">
                      {(tankCapacity / fillTime).toFixed(2)} L
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-2.5 sm:p-3 md:p-4 rounded">
              <p className="text-red-700 text-[10px] sm:text-xs md:text-sm">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4">
            <button
              onClick={calculateWaterUsage}
              disabled={!calculatedMinutes || calculatedMinutes <= 0 || !selectedTenant || isCalculating}
              className={`flex-1 font-bold py-2 sm:py-2.5 md:py-3 rounded-lg shadow-md transition duration-300 text-xs sm:text-sm md:text-base ${
                !calculatedMinutes || calculatedMinutes <= 0 || !selectedTenant || isCalculating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
              }`}
            >
              {isCalculating ? translations.calculating[language] : translations.calculate[language]}
            </button>
            <button
              onClick={() => {
                setStartTime('20:05')
                setEndTime('20:30')
                setResult(null)
                setError('')
                setCalculatedMinutes(null)
                setUsagePurpose('')
                toast.info('Form has been reset')
              }}
              className="px-4 sm:px-6 py-2 sm:py-2.5 md:py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg shadow-md transition duration-300 text-xs sm:text-sm md:text-base"
            >
              {language === 'english' ? 'Reset' : 'ಮರುಹೊಂದಿಸಿ'}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="mt-3 sm:mt-4 md:mt-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 sm:p-4 md:p-6 border-2 border-orange-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                <div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
                    {translations.totalWaterUsed[language]}
                  </h3>
                  <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-gray-500">
                    {translations.savedOn[language]}: {result.date} {result.time}
                  </div>
                </div>
                <button
                  onClick={saveResult}
                  disabled={isSaving}
                  className={`w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 text-white text-[10px] sm:text-xs md:text-sm font-bold rounded-lg transition ${
                    isSaving 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isSaving ? translations.saving[language] : translations.save[language]}
                </button>
              </div>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                <div className="bg-white rounded-lg p-2.5 sm:p-3 md:p-4 shadow-sm">
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">{translations.timeDuration[language]}</p>
                  <p className="text-base sm:text-lg md:text-2xl font-bold text-blue-600">
                    {result.totalMinutes} {translations.minutes[language]}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400">
                    {result.startTimeFormatted} → {result.endTimeFormatted}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-2.5 sm:p-3 md:p-4 shadow-sm">
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">{translations.totalWaterUsed[language]}</p>
                  <p className="text-base sm:text-lg md:text-2xl font-bold text-green-600">
                    {result.totalLiters.toFixed(1)} {translations.liters[language]}
                  </p>
                  {result.personName && (
                    <p className="text-[10px] sm:text-xs text-gray-500">By: {result.personName}</p>
                  )}
                </div>
                <div className="bg-white rounded-lg p-2.5 sm:p-3 md:p-4 shadow-sm">
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">{translations.flowRate[language]}</p>
                  <p className="text-base sm:text-lg md:text-2xl font-bold text-purple-600">
                    {result.flowRate.toFixed(2)} L/min
                  </p>
                  {result.purpose && (
                    <p className="text-[10px] sm:text-xs text-gray-500">Purpose: {result.purpose}</p>
                  )}
                </div>
              </div>

              {/* Tank Breakdown */}
              <div className="bg-white rounded-lg p-2.5 sm:p-3 md:p-4 mb-3 sm:mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
                  <div>
                    <div className="flex justify-between items-center pb-1.5 sm:pb-2 border-b border-gray-200">
                      <span className="font-semibold text-gray-700 text-[10px] sm:text-xs md:text-sm">{translations.fullTanks[language]}</span>
                      <span className="text-base sm:text-lg md:text-xl font-bold text-purple-600">
                        {result.fullTanks}
                      </span>
                    </div>
                  </div>
                  {result.remainingLiters > 0 && (
                    <div>
                      <div className="flex justify-between items-center pb-1.5 sm:pb-2 border-b border-gray-200">
                        <span className="font-semibold text-gray-700 text-[10px] sm:text-xs md:text-sm">{translations.partialTank[language]}</span>
                        <span className="text-base sm:text-lg md:text-xl font-bold text-orange-600">
                          {result.remainingLiters.toFixed(1)} L ({result.partialPercentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="mt-3 sm:mt-4">
                <h4 className="font-semibold text-gray-700 text-[10px] sm:text-xs md:text-sm mb-2 sm:mb-3">
                  {language === 'english' ? 'Detailed Breakdown by Tank:' : 'ಟ್ಯಾಂಕ್ ವಾರು ವಿವರ:'}
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-1.5 sm:space-y-2">
                  {result.breakdown.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-1.5 sm:p-2 md:p-3 border border-gray-200 hover:shadow-md transition">
                      <div className="flex flex-wrap justify-between items-center gap-1">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="font-medium text-gray-700 text-[10px] sm:text-xs md:text-sm">
                            {language === 'english' ? `Tank ${item.tankNumber}` : `ಟ್ಯಾಂಕ್ ${item.tankNumber}`}
                          </span>
                          {item.isFull ? (
                            <span className="px-1 sm:px-2 py-0.5 bg-green-100 text-green-800 text-[8px] sm:text-xs rounded-full font-semibold">
                              ✓ Full
                            </span>
                          ) : (
                            <span className="px-1 sm:px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[8px] sm:text-xs rounded-full font-semibold">
                              Partial
                            </span>
                          )}
                        </div>
                        <span className="text-[8px] sm:text-xs md:text-sm text-gray-600">
                          {formatTimeDisplay(item.startTime)} → {formatTimeDisplay(item.endTime)}
                        </span>
                      </div>
                      <div className="flex flex-wrap justify-between items-center mt-0.5 sm:mt-1">
                        <span className="text-[8px] sm:text-xs md:text-sm text-gray-500">
                          {item.duration.toFixed(1)} {translations.minutes[language]}
                        </span>
                        <span className="font-semibold text-blue-600 text-[8px] sm:text-xs md:text-sm">
                          {item.liters.toFixed(1)} {translations.liters[language]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Hint */}
          {!result && calculatedMinutes && calculatedMinutes > 0 && selectedTenant && (
            <div className="text-center py-2.5 sm:py-3 md:py-4 text-gray-500 text-[10px] sm:text-xs md:text-sm">
              {translations.clickCalculate[language]}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TankCalculator