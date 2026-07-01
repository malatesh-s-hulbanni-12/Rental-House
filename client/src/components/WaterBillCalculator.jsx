import React, { useState } from 'react'
import PriceDetails, { pricingConfig } from './PriceDetails'

const WaterBillCalculator = () => {
  const [language, setLanguage] = useState('english') // 'english' or 'kannada'
  const [unitType, setUnitType] = useState('liters') // 'liters' or 'kiloliters'
  const [previousReading, setPreviousReading] = useState('')
  const [currentReading, setCurrentReading] = useState('')
  const [consumerType, setConsumerType] = useState('residential')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const translations = {
    title: {
      english: "Water Bill Calculator",
      kannada: "ನೀರಿನ ಬಿಲ್ ಕ್ಯಾಲ್ಕುಲೇಟರ್"
    },
    previousReading: {
      english: "Previous Reading",
      kannada: "ಹಿಂದಿನ ಓದು"
    },
    currentReading: {
      english: "Current Reading",
      kannada: "ಪ್ರಸ್ತುತ ಓದು"
    },
    consumerType: {
      english: "Consumer Type",
      kannada: "ಗ್ರಾಹಕರ ವರ್ಗ"
    },
    calculate: {
      english: "Calculate Bill",
      kannada: "ಬಿಲ್ ಲೆಕ್ಕಾಚಾರ"
    },
    waterUsage: {
      english: "Water Usage",
      kannada: "ನೀರಿನ ಬಳಕೆ"
    },
    totalBill: {
      english: "Total Bill",
      kannada: "ಒಟ್ಟು ಬಿಲ್"
    },
    liters: {
      english: "Liters",
      kannada: "ಲೀಟರ್"
    },
    kiloliters: {
      english: "kL",
      kannada: "ಕಿ.ಲೀ"
    },
    rupees: {
      english: "₹",
      kannada: "₹"
    },
    errorInvalidReadings: {
      english: "Please enter valid readings. Current reading must be greater than previous reading.",
      kannada: "ದಯವಿಟ್ಟು ಸರಿಯಾದ ಓದುಗಳನ್ನು ನಮೂದಿಸಿ. ಪ್ರಸ್ತುತ ಓದು ಹಿಂದಿನ ಓದಿಗಿಂತ ಹೆಚ್ಚಿರಬೇಕು."
    },
    errorNegative: {
      english: "Readings cannot be negative.",
      kannada: "ಓದುಗಳು ಋಣಾತ್ಮಕವಾಗಿರಬಾರದು."
    },
    errorInvalidNumber: {
      english: "Please enter valid numbers.",
      kannada: "ದಯವಿಟ್ಟು ಸರಿಯಾದ ಸಂಖ್ಯೆಗಳನ್ನು ನಮೂದಿಸಿ."
    },
    calculationBreakdown: {
      english: "Calculation Breakdown",
      kannada: "ಲೆಕ್ಕಾಚಾರದ ವಿವರ"
    },
    convertedToKL: {
      english: "Converted to kiloliters",
      kannada: "ಕಿ.ಲೀಗೆ ಪರಿವರ್ತಿಸಲಾಗಿದೆ"
    },
    convertedFromKL: {
      english: "Original reading in kiloliters",
      kannada: "ಮೂಲ ಓದು ಕಿ.ಲೀಯಲ್ಲಿ"
    },
    selectUnit: {
      english: "Select Input Unit",
      kannada: "ಇನ್ಪುಟ್ ಘಟಕವನ್ನು ಆಯ್ಕೆಮಾಡಿ"
    },
    litersOption: {
      english: "Liters",
      kannada: "ಲೀಟರ್"
    },
    kilolitersOption: {
      english: "Kiloliters (kL)",
      kannada: "ಕಿ.ಲೀ"
    }
  }

  // Convert liters to kiloliters (1 kL = 1000 liters)
  const litersToKiloliters = (liters) => {
    return liters / 1000
  }

  // Convert kiloliters to liters
  const kilolitersToLiters = (kiloliters) => {
    return kiloliters * 1000
  }

  // Get reading value in kiloliters for calculation
  const getReadingInKL = (value, unit) => {
    if (unit === 'liters') {
      return litersToKiloliters(value)
    } else {
      return value
    }
  }

  const calculateBill = () => {
    setError('')
    setResult(null)

    const prevValue = parseFloat(previousReading)
    const currValue = parseFloat(currentReading)

    // Validation
    if (isNaN(prevValue) || isNaN(currValue)) {
      setError(translations.errorInvalidNumber[language])
      return
    }

    if (prevValue < 0 || currValue < 0) {
      setError(translations.errorNegative[language])
      return
    }

    if (currValue <= prevValue) {
      setError(translations.errorInvalidReadings[language])
      return
    }

    // Convert readings to kiloliters for calculation
    const prevKL = getReadingInKL(prevValue, unitType)
    const currKL = getReadingInKL(currValue, unitType)
    
    // Calculate usage in kiloliters
    const usageKL = currKL - prevKL
    
    // Calculate usage in liters (for display)
    const usageLiters = kilolitersToLiters(usageKL)
    
    const pricing = pricingConfig[consumerType]
    let totalBill = 0
    let remainingUsage = usageKL
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
          slab: `${slab.min} - ${slab.max === Infinity ? '∞' : slab.max} ${translations.kiloliters[language]}`,
          usageKL: slabUsage,
          rate: slab.rate,
          amount: slabAmount
        })
      }
    }

    // Apply minimum charge if applicable
    if (totalBill < pricing.slabs[0].minCharge) {
      totalBill = pricing.slabs[0].minCharge
      breakdown = [{
        slab: `${language === 'english' ? 'Minimum Charge Applied' : 'ಕನಿಷ್ಠ ದರ ಅನ್ವಯಿಸಲಾಗಿದೆ'}`,
        usageKL: null,
        rate: null,
        amount: pricing.slabs[0].minCharge
      }]
    }

    setResult({
      usageLiters: usageLiters.toFixed(0),
      usageKL: usageKL.toFixed(2),
      totalBill: totalBill.toFixed(2),
      breakdown: breakdown,
      inputUnit: unitType
    })
  }

  const resetForm = () => {
    setPreviousReading('')
    setCurrentReading('')
    setResult(null)
    setError('')
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Top Controls Row - Language and Unit Toggle */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        {/* Language Toggle Button */}
        <button
          onClick={() => setLanguage(language === 'english' ? 'kannada' : 'english')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-300"
        >
          {language === 'english' ? 'ಕನ್ನಡ' : 'English'}
        </button>

        {/* Unit Type Selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">
            {translations.selectUnit[language]}:
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setUnitType('liters')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                unitType === 'liters'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {translations.litersOption[language]}
            </button>
            <button
              onClick={() => setUnitType('kiloliters')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                unitType === 'kiloliters'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {translations.kilolitersOption[language]}
            </button>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
          <h1 className="text-3xl font-bold text-white text-center">
            {translations.title[language]}
          </h1>
          <p className="text-blue-100 text-center mt-2 text-sm">
            {unitType === 'liters' 
              ? (language === 'english' ? 'Enter readings in Liters (Default)' : 'ಲೀಟರ್‌ಗಳಲ್ಲಿ ಓದುಗಳನ್ನು ನಮೂದಿಸಿ (ಡೀಫಾಲ್ಟ್)')
              : (language === 'english' ? 'Enter readings in Kiloliters (kL)' : 'ಕಿ.ಲೀಯಲ್ಲಿ ಓದುಗಳನ್ನು ನಮೂದಿಸಿ')}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Input Fields */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {translations.previousReading[language]} ({unitType === 'liters' ? translations.liters[language] : translations.kiloliters[language]})
              </label>
              <input
                type="number"
                value={previousReading}
                onChange={(e) => setPreviousReading(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder={`0 ${unitType === 'liters' ? translations.liters[language] : translations.kiloliters[language]}`}
                step={unitType === 'liters' ? "1" : "0.001"}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {translations.currentReading[language]} ({unitType === 'liters' ? translations.liters[language] : translations.kiloliters[language]})
              </label>
              <input
                type="number"
                value={currentReading}
                onChange={(e) => setCurrentReading(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder={`0 ${unitType === 'liters' ? translations.liters[language] : translations.kiloliters[language]}`}
                step={unitType === 'liters' ? "1" : "0.001"}
              />
            </div>
          </div>

          {/* Consumer Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {translations.consumerType[language]}
            </label>
            <div className="grid md:grid-cols-3 gap-3">
              {Object.keys(pricingConfig).map((type) => (
                <button
                  key={type}
                  onClick={() => setConsumerType(type)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    consumerType === type
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pricingConfig[type].name[language]}
                </button>
              ))}
            </div>
          </div>

          {/* Price Details Component - Now using centralized pricing */}
          <PriceDetails 
            consumerType={consumerType}
            language={language}
          />

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Calculate Button */}
          <div className="flex gap-4">
            <button
              onClick={calculateBill}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md transition duration-300"
            >
              {translations.calculate[language]}
            </button>
            <button
              onClick={resetForm}
              className="px-6 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-lg shadow-md transition duration-300"
            >
              {language === 'english' ? 'Reset' : 'ಮರುಹೊಂದಿಸಿ'}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {translations.calculationBreakdown[language]}
              </h3>
              <div className="space-y-3">
                {/* Water Usage Display */}
                <div className="bg-white rounded-lg p-3 mb-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="font-semibold text-gray-600">
                      {translations.waterUsage[language]}:
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {parseInt(result.usageLiters).toLocaleString()} {translations.liters[language]}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm text-gray-500">
                      {translations.convertedToKL[language]}:
                    </span>
                    <span className="text-md font-semibold text-purple-600">
                      {result.usageKL} {translations.kiloliters[language]}
                    </span>
                  </div>
                  {result.inputUnit === 'kiloliters' && (
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-gray-400">
                        {translations.convertedFromKL[language]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Breakdown */}
                {result.breakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-gray-600">{item.slab}</span>
                    <span className="font-medium">
                      {item.usageKL ? `${item.usageKL} kL × ₹${item.rate} = ` : ''}
                      ₹{item.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
                
                {/* Total Bill */}
                <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-green-300">
                  <span className="text-xl font-bold text-gray-800">
                    {translations.totalBill[language]}:
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {translations.rupees[language]} {result.totalBill}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WaterBillCalculator