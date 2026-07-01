// src/pages/WaterBillGenerator.jsx
import React, { useState, useEffect } from 'react'
import { 
  FaFileInvoice, 
  FaCalendarAlt, 
  FaUser, 
  FaArrowLeft, 
  FaDownload, 
  FaPrint,
  FaEye,
  FaWater,
  FaTint,
  FaChartBar,
  FaSpinner
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import RenterNavbar from '../components/RenterNavbar'
import { pricingConfig } from '../components/PriceDetails'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const WaterBillGenerator = () => {
  const navigate = useNavigate()
  const [usageRecords, setUsageRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [userInfo, setUserInfo] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [billData, setBillData] = useState(null)
  const [showBill, setShowBill] = useState(false)
  const [consumerType, setConsumerType] = useState('residential')
  const [isDownloading, setIsDownloading] = useState(false)

  const getYears = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = 0; i < 5; i++) {
      years.push(String(currentYear - i))
    }
    return years
  }

  const getMonths = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return monthNames.map((name, index) => ({
      value: String(index + 1).padStart(2, '0'),
      label: name
    }))
  }

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
      setUsageRecords(userRecords)
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

  const generateBill = () => {
    if (!selectedMonth || !selectedYear) {
      toast.warning('Please select a month and year')
      return
    }

    const monthRecords = usageRecords.filter(record => {
      const date = record.date || record.usageDate || record.savedDate
      if (!date) return false
      const parts = date.split('/')
      if (parts.length !== 3) return false
      return parts[1] === selectedMonth && parts[2] === selectedYear
    })

    if (monthRecords.length === 0) {
      toast.warning('No water usage records found for the selected month')
      setBillData(null)
      setShowBill(false)
      return
    }

    const totalLiters = monthRecords.reduce((sum, record) => sum + (record.totalLiters || 0), 0)
    const totalKL = totalLiters / 1000
    const totalMinutes = monthRecords.reduce((sum, record) => sum + (record.totalMinutes || 0), 0)

    const pricing = pricingConfig[consumerType]
    
    let totalBill = 0
    let remainingUsage = totalKL
    let breakdown = []

    for (let i = 0; i < pricing.slabs.length; i++) {
      const slab = pricing.slabs[i]
      let slabUsage = 0

      if (remainingUsage > 0) {
        if (remainingUsage > slab.max - slab.min && slab.max !== Infinity) {
          slabUsage = slab.max - slab.min
        } else {
          slabUsage = remainingUsage
        }

        const slabAmount = slabUsage * slab.rate
        totalBill += slabAmount
        remainingUsage -= slabUsage

        breakdown.push({
          slab: `${slab.min} - ${slab.max === Infinity ? '∞' : slab.max} kL`,
          usageKL: slabUsage,
          rate: slab.rate,
          amount: slabAmount
        })
      }
    }

    if (totalBill < pricing.slabs[0].minCharge) {
      totalBill = pricing.slabs[0].minCharge
      breakdown = [{
        slab: 'Minimum Charge Applied',
        usageKL: null,
        rate: null,
        amount: pricing.slabs[0].minCharge
      }]
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthName = monthNames[parseInt(selectedMonth) - 1]
    
    let prevMonth = parseInt(selectedMonth) - 1
    let prevYear = parseInt(selectedYear)
    if (prevMonth === 0) {
      prevMonth = 12
      prevYear = parseInt(selectedYear) - 1
    }
    const prevMonthName = monthNames[prevMonth - 1]
    
    const billingPeriod = `8 ${prevMonthName} ${prevYear} to 8 ${monthName} ${selectedYear}`

    const previousMonthRecords = usageRecords.filter(record => {
      const date = record.date || record.usageDate || record.savedDate
      if (!date) return false
      const parts = date.split('/')
      if (parts.length !== 3) return false
      const recordMonth = parseInt(parts[1])
      const recordYear = parseInt(parts[2])
      return recordMonth === prevMonth && recordYear === prevYear
    })
    
    const previousTotalLiters = previousMonthRecords.reduce((sum, record) => sum + (record.totalLiters || 0), 0)
    const previousTotalKL = previousTotalLiters / 1000

    const billDataObj = {
      billNumber: `WB-${selectedYear}${selectedMonth}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      consumerNumber: userInfo?.houseId || 'N/A',
      consumerName: userInfo?.tenantName || 'N/A',
      address: userInfo?.houseTitle || 'N/A',
      billingPeriod: billingPeriod,
      billDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 15)).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      
      previousReading: previousTotalKL.toFixed(2),
      currentReading: totalKL.toFixed(2),
      consumption: totalKL.toFixed(2),
      
      totalLiters: totalLiters,
      totalKL: totalKL,
      totalMinutes: totalMinutes,
      totalBill: totalBill,
      breakdown: breakdown,
      consumerType: consumerType,
      
      serviceCharge: 0,
      tax: 0,
      otherCharges: 0,
      
      records: monthRecords,
      recordsCount: monthRecords.length,
      monthName: monthName,
      year: selectedYear
    }

    setBillData(billDataObj)
    setShowBill(true)
    toast.success(`Bill generated for ${monthName} ${selectedYear}!`)
  }

  // Open bill in new window for printing
  const openPrintWindow = () => {
    if (!billData) return

    const printWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes')
    if (!printWindow) {
      toast.error('Please allow popups for this site')
      return
    }

    const printContent = generateBillHTML()
    printWindow.document.write(printContent)
    printWindow.document.close()
    
    toast.success('Bill opened in new window')
  }

  // Generate Bill HTML for printing
  const generateBillHTML = () => {
    if (!billData) return ''
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Water Bill - ${billData.billNumber}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Times New Roman', Arial, sans-serif; background: #f0f0f0; padding: 20px; color: black; }
            .bill-container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border: 2px solid #333; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 3px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .header h1 { font-size: 28px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #000; }
            .header .sub-title { font-size: 18px; font-weight: 600; margin-top: 5px; color: #000; }
            .header .dept { font-size: 13px; margin-top: 3px; color: #333; font-style: italic; }
            .bill-meta { display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 15px; font-size: 13px; flex-wrap: wrap; gap: 5px; }
            .bill-meta span { font-weight: bold; }
            .section { border-bottom: 1px solid #333; padding-bottom: 15px; margin-bottom: 15px; }
            .section-title { font-weight: bold; font-size: 15px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; color: #000; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px; }
            .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px; }
            .box { border: 1px solid #333; padding: 8px; text-align: center; background: #fafafa; }
            .box .label { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #555; }
            .box .value { font-size: 16px; font-weight: bold; margin-top: 3px; color: #000; }
            .box.highlight { background: #f0f0f0; border: 2px solid #333; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
            th, td { border: 1px solid #333; padding: 8px 10px; text-align: left; }
            th { background: #e8e8e8; font-weight: bold; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; text-align: center; }
            td { text-align: center; }
            td.text-right { text-align: right; }
            .total-row { background: #e8e8e8; font-weight: bold; }
            .total-row td { border-top: 3px solid #333; font-size: 16px; text-align: center; }
            .records-list { border: 1px solid #333; max-height: 200px; overflow-y: auto; }
            .record-item { display: flex; justify-content: space-between; padding: 6px 10px; border-bottom: 1px solid #ddd; font-size: 12px; flex-wrap: wrap; gap: 5px; }
            .record-item:last-child { border-bottom: none; }
            .record-item:nth-child(even) { background: #f9f9f9; }
            .terms { margin-top: 20px; padding-top: 15px; border-top: 2px solid #333; font-size: 11px; }
            .terms p { margin: 3px 0; color: #333; }
            .terms .bold { font-weight: bold; color: #000; }
            .footer { text-align: center; margin-top: 20px; font-size: 11px; border-top: 1px solid #333; padding-top: 15px; color: #555; }
            .no-print { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 2px solid #ccc; }
            .no-print button { padding: 10px 30px; background: #2563eb; color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; margin: 0 8px; font-weight: bold; }
            .no-print button:hover { background: #1d4ed8; }
            .no-print button.close-btn { background: #6b7280; }
            .no-print button.close-btn:hover { background: #4b5563; }
            @media print {
              body { background: white; padding: 10px; }
              .bill-container { border: none; padding: 15px; box-shadow: none; }
              .no-print { display: none; }
              .box { background: white; }
              .box.highlight { background: #f5f5f5; }
            }
            @media (max-width: 600px) {
              body { padding: 10px; }
              .bill-container { padding: 15px; }
              .grid-2 { grid-template-columns: 1fr; }
              .grid-4 { grid-template-columns: 1fr 1fr; }
              .grid-3 { grid-template-columns: 1fr; }
              .header h1 { font-size: 22px; }
              .header .sub-title { font-size: 15px; }
              table { font-size: 11px; }
              th, td { padding: 5px 6px; }
              .box .value { font-size: 14px; }
              .record-item { font-size: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="bill-container">
            <div class="header">
              <h1>WATER BILL</h1>
              <div class="sub-title">MS Hulbanni Housing</div>
              <div class="dept">(Water Supply & Sanitation Department)</div>
            </div>
            <div class="bill-meta">
              <div><span>Bill No:</span> ${billData.billNumber}</div>
              <div><span>Date:</span> ${billData.billDate}</div>
            </div>
            <div class="section">
              <div class="section-title">CONSUMER DETAILS</div>
              <div class="grid-2">
                <div><span class="font-bold">Consumer Number:</span> ${billData.consumerNumber}</div>
                <div><span class="font-bold">Consumer Name:</span> ${billData.consumerName}</div>
                <div class="mt-10" style="grid-column: span 2;"><span class="font-bold">Address:</span> ${billData.address}</div>
              </div>
            </div>
            <div class="section">
              <div><span class="font-bold">Billing Period:</span> ${billData.billingPeriod}</div>
              <div style="margin-top: 5px; display: flex; flex-wrap: wrap; gap: 10px;">
                <span><span class="font-bold">Consumer Type:</span> ${billData.consumerType.charAt(0).toUpperCase() + billData.consumerType.slice(1)}</span>
                <span><span class="font-bold">Due Date:</span> ${billData.dueDate}</span>
              </div>
            </div>
            <div class="grid-4">
              <div class="box"><div class="label">Previous Reading</div><div class="value">${billData.previousReading} kL</div></div>
              <div class="box"><div class="label">Current Reading</div><div class="value">${billData.currentReading} kL</div></div>
              <div class="box highlight"><div class="label">Consumption</div><div class="value">${billData.consumption} kL</div></div>
              <div class="box"><div class="label">Records</div><div class="value">${billData.recordsCount}</div></div>
            </div>
            <div class="section">
              <div class="section-title">BILL BREAKDOWN</div>
              <table>
                <thead><tr><th>Slab (kL)</th><th>Usage (kL)</th><th>Rate (₹/kL)</th><th style="text-align: right;">Amount (₹)</th></tr></thead>
                <tbody>
                  ${billData.breakdown.map((item, idx) => `
                    <tr style="background: ${idx % 2 === 0 ? 'white' : '#f9f9f9'};">
                      <td>${item.slab}</td>
                      <td>${item.usageKL ? item.usageKL.toFixed(2) : '-'}</td>
                      <td>${item.rate ? '₹' + item.rate : '-'}</td>
                      <td style="text-align: right; font-weight: bold;">₹${item.amount.toFixed(2)}</td>
                    </tr>
                  `).join('')}
                  <tr class="total-row">
                    <td colspan="3" style="text-align: right; font-size: 18px; font-weight: bold;">TOTAL BILL:</td>
                    <td style="text-align: right; font-size: 22px; font-weight: bold;">₹${billData.totalBill.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="grid-3">
              <div class="box"><div class="label">Total Water Used</div><div class="value">${billData.totalLiters.toFixed(0)} L</div></div>
              <div class="box"><div class="label">Total Time</div><div class="value">${billData.totalMinutes.toFixed(0)} min</div></div>
              <div class="box"><div class="label">Avg per Day</div><div class="value">${(billData.totalLiters / 30).toFixed(0)} L</div></div>
            </div>
            <div class="section">
              <div class="section-title">Water Usage Records (${billData.recordsCount})</div>
              <div class="records-list">
                ${billData.records.map(record => `
                  <div class="record-item">
                    <span>${formatDate(record.date || record.usageDate || record.savedDate)}</span>
                    <span>${record.startTimeFormatted || record.startTime || 'N/A'} - ${record.endTimeFormatted || record.endTime || 'N/A'}</span>
                    <span style="font-weight: bold;">${(record.totalLiters || 0).toFixed(1)} L</span>
                    <span>${record.purpose || 'General'}</span>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="terms">
              <p class="bold">TERMS & CONDITIONS:</p>
              <p>1. Bill generated based on water usage records for the selected billing period.</p>
              <p>2. Please pay the bill on or before the due date to avoid late payment charges.</p>
              <p>3. For any discrepancies, please contact the housing office within 7 days.</p>
              <p>4. This is a system-generated bill and does not require a signature.</p>
            </div>
            <div class="footer">--- This is a computer-generated bill ---<br>Generated on: ${new Date().toLocaleString()}</div>
            <div class="no-print">
              <button onclick="window.print()">🖨️ Print Bill</button>
              <button onclick="window.close()" class="close-btn">Close</button>
            </div>
          </div>
        </body>
      </html>
    `
  }

  // Download PDF - FIXED VERSION
  const downloadPDF = () => {
    if (!billData) {
      toast.warning('Please generate a bill first')
      return
    }

    setIsDownloading(true)

    try {
      const doc = new jsPDF('p', 'mm', 'a4')
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      let yPosition = 20

      // Title
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text('WATER BILL', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 10

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('MS Hulbanni Housing', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 8

      doc.setFontSize(12)
      doc.setFont('helvetica', 'italic')
      doc.text('(Water Supply & Sanitation Department)', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 12

      // Bill Meta
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text(`Bill No: ${billData.billNumber}`, 20, yPosition)
      doc.text(`Date: ${billData.billDate}`, pageWidth - 50, yPosition)
      yPosition += 10

      // Consumer Details
      doc.setFont('helvetica', 'bold')
      doc.text('CONSUMER DETAILS', 20, yPosition)
      yPosition += 7
      doc.setFont('helvetica', 'normal')
      doc.text(`Consumer Number: ${billData.consumerNumber}`, 20, yPosition)
      doc.text(`Consumer Name: ${billData.consumerName}`, 120, yPosition)
      yPosition += 7
      doc.text(`Address: ${billData.address}`, 20, yPosition)
      yPosition += 10

      // Billing Period
      doc.setFont('helvetica', 'bold')
      doc.text(`Billing Period:`, 20, yPosition)
      doc.setFont('helvetica', 'normal')
      doc.text(`${billData.billingPeriod}`, 70, yPosition)
      yPosition += 7
      doc.setFont('helvetica', 'bold')
      doc.text(`Consumer Type:`, 20, yPosition)
      doc.setFont('helvetica', 'normal')
      doc.text(`${billData.consumerType.charAt(0).toUpperCase() + billData.consumerType.slice(1)}`, 65, yPosition)
      doc.setFont('helvetica', 'bold')
      doc.text(`Due Date:`, 120, yPosition)
      doc.setFont('helvetica', 'normal')
      doc.text(`${billData.dueDate}`, 150, yPosition)
      yPosition += 12

      // Meter Readings - Table
      const readingData = [
        ['Previous Reading', 'Current Reading', 'Consumption', 'Records'],
        [`${billData.previousReading} kL`, `${billData.currentReading} kL`, `${billData.consumption} kL`, `${billData.recordsCount}`]
      ]

      autoTable(doc, {
        head: [readingData[0]],
        body: [readingData[1]],
        startY: yPosition,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 4, halign: 'center' },
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
        margin: { left: 20, right: 20 }
      })

      yPosition = doc.lastAutoTable.finalY + 10

      // Bill Breakdown - Table
      const breakdownHeaders = ['Slab (kL)', 'Usage (kL)', 'Rate (₹/kL)', 'Amount (₹)']
      const breakdownRows = billData.breakdown.map(item => [
        item.slab || '',
        item.usageKL ? item.usageKL.toFixed(2) : '-',
        item.rate ? `₹${item.rate}` : '-',
        `₹${item.amount.toFixed(2)}`
      ])

      // Add total row
      breakdownRows.push(['TOTAL', '', '', `₹${billData.totalBill.toFixed(2)}`])

      autoTable(doc, {
        head: [breakdownHeaders],
        body: breakdownRows,
        startY: yPosition,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { 
          fillColor: [240, 240, 240], 
          textColor: [0, 0, 0], 
          fontStyle: 'bold',
          halign: 'center'
        },
        footStyles: { 
          fillColor: [230, 230, 230], 
          textColor: [0, 0, 0], 
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 40, halign: 'center' },
          2: { cellWidth: 40, halign: 'center' },
          3: { cellWidth: 50, halign: 'right' }
        },
        margin: { left: 20, right: 20 }
      })

      yPosition = doc.lastAutoTable.finalY + 10

      // Summary Cards
      const summaryData = [
        ['Total Water Used', 'Total Time', 'Avg per Day'],
        [`${billData.totalLiters.toFixed(0)} L`, `${billData.totalMinutes.toFixed(0)} min`, `${(billData.totalLiters / 30).toFixed(0)} L`]
      ]

      autoTable(doc, {
        head: [summaryData[0]],
        body: [summaryData[1]],
        startY: yPosition,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 5, halign: 'center' },
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
        margin: { left: 20, right: 20 }
      })

      yPosition = doc.lastAutoTable.finalY + 10

      // Terms & Conditions
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('TERMS & CONDITIONS:', 20, yPosition)
      yPosition += 7
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      const terms = [
        '1. Bill generated based on water usage records for the selected billing period.',
        '2. Please pay the bill on or before the due date to avoid late payment charges.',
        '3. For any discrepancies, please contact the housing office within 7 days.',
        '4. This is a system-generated bill and does not require a signature.'
      ]
      
      terms.forEach(term => {
        doc.text(term, 20, yPosition)
        yPosition += 5
      })
      
      yPosition += 5

      // Footer
      doc.setFontSize(10)
      doc.setFont('helvetica', 'italic')
      doc.text('--- This is a computer-generated bill ---', pageWidth / 2, pageHeight - 20, { align: 'center' })
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 12, { align: 'center' })

      // Save PDF
      doc.save(`Water_Bill_${billData.billNumber}.pdf`)
      toast.success('PDF downloaded successfully!')

    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Error generating PDF. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const months = getMonths()
  const years = getYears()

  const hasRecordsForMonth = (month, year) => {
    return usageRecords.some(record => {
      const date = record.date || record.usageDate || record.savedDate
      if (!date) return false
      const parts = date.split('/')
      if (parts.length !== 3) return false
      return parts[1] === month && parts[2] === year
    })
  }

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
        <div className="max-w-6xl mx-auto">
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
                    <FaFileInvoice className="text-blue-300" /> Water Bill Generator
                  </h1>
                  <p className="text-blue-100 text-xs sm:text-sm mt-0.5 sm:mt-1">
                    Generate and view your monthly water bills
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

          {/* Bill Generator Controls */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 md:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-blue-600" /> Select Billing Month
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Select Month</option>
                    {months.map((month) => {
                      const hasRecords = selectedYear ? hasRecordsForMonth(month.value, selectedYear) : false
                      return (
                        <option key={month.value} value={month.value}>
                          {month.label} {selectedYear && !hasRecords ? '(No records)' : ''}
                        </option>
                      )
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Select Year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Consumer Type</label>
                  <select
                    value={consumerType}
                    onChange={(e) => setConsumerType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="residential">Residential</option>
                    <option value="nonResidential">Non-Residential</option>
                    <option value="commercial">Commercial / Industrial</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={generateBill}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition"
                  >
                    <FaEye className="inline mr-2" /> View Bill
                  </button>
                  {showBill && billData && (
                    <button
                      onClick={() => setShowBill(false)}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                <FaChartBar className="inline mr-1 text-blue-500" />
                {usageRecords.length} total records available. 
                {selectedMonth && selectedYear && (
                  <span className="ml-2">
                    {hasRecordsForMonth(selectedMonth, selectedYear) 
                      ? '✅ Records found for this month' 
                      : '⚠️ No records found for this month'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bill Display - Centered Preview */}
          {showBill && billData && (
            <div className="flex justify-center">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border-2 border-blue-200 w-full max-w-4xl">
                {/* Bill Preview Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-3 sm:p-4 text-white">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                    <h2 className="text-base sm:text-xl font-bold flex items-center gap-2">
                      <FaFileInvoice /> Bill Preview
                    </h2>
                    <div className="flex flex-wrap justify-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={downloadPDF}
                        disabled={isDownloading}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg flex items-center gap-2 transition font-semibold text-xs sm:text-sm"
                      >
                        {isDownloading ? <FaSpinner className="animate-spin" /> : <FaDownload />} 
                        {isDownloading ? 'Downloading...' : 'Download PDF'}
                      </button>
                      <button
                        onClick={openPrintWindow}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition font-semibold text-xs sm:text-sm"
                      >
                        <FaPrint /> Print Bill
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bill Content - Centered */}
                <div className="p-3 sm:p-4 md:p-6">
                  {/* Bill Header */}
                  <div className="text-center border-b-2 border-gray-300 pb-3 sm:pb-4 mb-3 sm:mb-4">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">WATER BILL</h1>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-700">MS Hulbanni Housing</p>
                    <p className="text-xs sm:text-sm text-gray-500">(Water Supply & Sanitation Department)</p>
                  </div>

                  {/* Bill Meta */}
                  <div className="flex flex-col sm:flex-row justify-between border-b border-gray-300 pb-2 mb-3 text-sm sm:text-base">
                    <div><span className="font-bold">Bill No:</span> {billData.billNumber}</div>
                    <div><span className="font-bold">Date:</span> {billData.billDate}</div>
                  </div>

                  {/* Consumer Details */}
                  <div className="border-b border-gray-300 pb-3 mb-3">
                    <h3 className="font-bold text-gray-700 mb-2 text-xs sm:text-sm md:text-base">CONSUMER DETAILS</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm md:text-base">
                      <div><span className="font-bold">Consumer Number:</span> {billData.consumerNumber}</div>
                      <div><span className="font-bold">Consumer Name:</span> {billData.consumerName}</div>
                      <div className="col-span-1 sm:col-span-2"><span className="font-bold">Address:</span> {billData.address}</div>
                    </div>
                  </div>

                  {/* Billing Period */}
                  <div className="border-b border-gray-300 pb-3 mb-3 text-xs sm:text-sm md:text-base">
                    <div><span className="font-bold">Billing Period:</span> {billData.billingPeriod}</div>
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 mt-1">
                      <span><span className="font-bold">Consumer Type:</span> {billData.consumerType.charAt(0).toUpperCase() + billData.consumerType.slice(1)}</span>
                      <span><span className="font-bold">Due Date:</span> {billData.dueDate}</span>
                    </div>
                  </div>

                  {/* Meter Readings */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 md:gap-3 mb-3 sm:mb-4">
                    <div className="border p-1.5 sm:p-2 md:p-3 text-center bg-gray-50">
                      <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 font-bold">Previous Reading</p>
                      <p className="text-xs sm:text-sm md:text-lg font-bold">{billData.previousReading} kL</p>
                    </div>
                    <div className="border p-1.5 sm:p-2 md:p-3 text-center bg-gray-50">
                      <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 font-bold">Current Reading</p>
                      <p className="text-xs sm:text-sm md:text-lg font-bold">{billData.currentReading} kL</p>
                    </div>
                    <div className="border-2 p-1.5 sm:p-2 md:p-3 text-center bg-blue-50 border-blue-300">
                      <p className="text-[8px] sm:text-[10px] md:text-xs text-blue-600 font-bold">Consumption</p>
                      <p className="text-xs sm:text-sm md:text-lg font-bold text-blue-600">{billData.consumption} kL</p>
                    </div>
                    <div className="border p-1.5 sm:p-2 md:p-3 text-center bg-gray-50">
                      <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 font-bold">Records</p>
                      <p className="text-xs sm:text-sm md:text-lg font-bold">{billData.recordsCount}</p>
                    </div>
                  </div>

                  {/* Bill Breakdown Table */}
                  <div className="border overflow-hidden mb-3 sm:mb-4 overflow-x-auto">
                    <table className="w-full text-[10px] sm:text-xs md:text-sm min-w-[300px]">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="px-1 sm:px-2 md:px-4 py-1 sm:py-2 text-left font-bold">Slab (kL)</th>
                          <th className="px-1 sm:px-2 md:px-4 py-1 sm:py-2 text-left font-bold">Usage (kL)</th>
                          <th className="px-1 sm:px-2 md:px-4 py-1 sm:py-2 text-left font-bold">Rate (₹/kL)</th>
                          <th className="px-1 sm:px-2 md:px-4 py-1 sm:py-2 text-right font-bold">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {billData.breakdown.map((item, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-1 sm:px-2 md:px-4 py-0.5 sm:py-1 md:py-2">{item.slab}</td>
                            <td className="px-1 sm:px-2 md:px-4 py-0.5 sm:py-1 md:py-2">{item.usageKL ? item.usageKL.toFixed(2) : '-'}</td>
                            <td className="px-1 sm:px-2 md:px-4 py-0.5 sm:py-1 md:py-2">{item.rate ? `₹${item.rate}` : '-'}</td>
                            <td className="px-1 sm:px-2 md:px-4 py-0.5 sm:py-1 md:py-2 text-right font-bold">₹{item.amount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-200 border-t-2 border-gray-400">
                        <tr>
                          <td colSpan="3" className="px-1 sm:px-2 md:px-4 py-1.5 sm:py-2 md:py-3 text-right font-bold text-xs sm:text-sm md:text-lg">TOTAL BILL:</td>
                          <td className="px-1 sm:px-2 md:px-4 py-1.5 sm:py-2 md:py-3 text-right font-bold text-sm sm:text-base md:text-2xl text-green-700">₹{billData.totalBill.toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 md:gap-3 mb-3 sm:mb-4">
                    <div className="border p-1.5 sm:p-2 md:p-3 text-center bg-gray-50">
                      <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 font-bold">Total Water Used</p>
                      <p className="text-xs sm:text-sm md:text-lg font-bold">{billData.totalLiters.toFixed(0)} L</p>
                    </div>
                    <div className="border p-1.5 sm:p-2 md:p-3 text-center bg-gray-50">
                      <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 font-bold">Total Time</p>
                      <p className="text-xs sm:text-sm md:text-lg font-bold">{billData.totalMinutes.toFixed(0)} min</p>
                    </div>
                    <div className="border p-1.5 sm:p-2 md:p-3 text-center bg-gray-50">
                      <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 font-bold">Avg per Day</p>
                      <p className="text-xs sm:text-sm md:text-lg font-bold">{(billData.totalLiters / 30).toFixed(0)} L</p>
                    </div>
                  </div>

                  {/* Action Buttons at Bottom */}
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                    <button
                      onClick={downloadPDF}
                      disabled={isDownloading}
                      className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg flex items-center gap-1 sm:gap-2 transition font-semibold text-xs sm:text-sm md:text-base"
                    >
                      {isDownloading ? <FaSpinner className="animate-spin" /> : <FaDownload />} 
                      {isDownloading ? 'Downloading...' : 'Download PDF'}
                    </button>
                    <button
                      onClick={openPrintWindow}
                      className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 sm:gap-2 transition font-semibold text-xs sm:text-sm md:text-base"
                    >
                      <FaPrint /> Print Bill
                    </button>
                    <button
                      onClick={() => setShowBill(false)}
                      className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg flex items-center gap-1 sm:gap-2 transition font-semibold text-xs sm:text-sm md:text-base"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WaterBillGenerator