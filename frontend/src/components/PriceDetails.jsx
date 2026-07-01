import React from 'react'

// Centralized pricing configuration - Easy to update!
export const pricingConfig = {
  residential: {
    name: {
      english: "Residential",
      kannada: "ಗೃಹ ಬಳಕೆ"
    },
    slabs: [
      { min: 0, max: 8, rate: 7, minCharge: 56 },
      { min: 8, max: 15, rate: 9, minCharge: null },
      { min: 15, max: 25, rate: 11, minCharge: null },
      { min: 25, max: Infinity, rate: 13, minCharge: null }
    ]
  },
  nonResidential: {
    name: {
      english: "Non-Residential",
      kannada: "ಗೃಹೇತರ ಬಳಕೆ"
    },
    slabs: [
      { min: 0, max: 8, rate: 14, minCharge: 112 },
      { min: 8, max: 15, rate: 18, minCharge: null },
      { min: 15, max: 25, rate: 22, minCharge: null },
      { min: 25, max: Infinity, rate: 26, minCharge: null }
    ]
  },
  commercial: {
    name: {
      english: "Commercial / Industrial",
      kannada: "ವಾಣಿಜ್ಯ / ಕೈಗಾರಿಕೆ ಬಳಕೆ"
    },
    slabs: [
      { min: 0, max: 8, rate: 28, minCharge: 224 },
      { min: 8, max: 15, rate: 36, minCharge: null },
      { min: 15, max: 25, rate: 44, minCharge: null },
      { min: 25, max: Infinity, rate: 52, minCharge: null }
    ]
  }
}

const PriceDetails = ({ consumerType, language }) => {
  const translations = {
    priceDetails: {
      english: "Price Details",
      kannada: "ದರಗಳ ವಿವರ"
    },
    slab: {
      english: "Slab (kL)",
      kannada: "ವ್ಯಾಪ್ತಿ (ಕಿ.ಲೀ)"
    },
    rate: {
      english: "Rate (₹/kL)",
      kannada: "ದರ (₹/ಕಿ.ಲೀ)"
    },
    minCharge: {
      english: "Min. Charge (₹)",
      kannada: "ಕನಿಷ್ಠ ದರ (₹)"
    },
    consumerCategory: {
      english: "Consumer Category",
      kannada: "ಗ್ರಾಹಕರ ವರ್ಗ"
    },
    note: {
      english: "Note: Rates are per kiloliter (kL)",
      kannada: "ಸೂಚನೆ: ದರಗಳು ಪ್ರತಿ ಕಿ.ಲೀಗೆ (kL)"
    }
  }

  const currentPricing = pricingConfig[consumerType]

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          {translations.priceDetails[language]}
        </h3>
        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
          {currentPricing.name[language]}
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-blue-500 to-blue-600">
              <th className="px-4 py-3 text-left text-white font-semibold rounded-l-lg">
                {translations.slab[language]}
              </th>
              <th className="px-4 py-3 text-left text-white font-semibold">
                {translations.rate[language]}
              </th>
              <th className="px-4 py-3 text-left text-white font-semibold rounded-r-lg">
                {translations.minCharge[language]}
              </th>
            </tr>
          </thead>
          <tbody>
            {currentPricing.slabs.map((slab, idx) => (
              <tr 
                key={idx} 
                className={`border-b border-gray-200 ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } hover:bg-blue-50 transition-colors duration-150`}
              >
                <td className="px-4 py-3 font-medium text-gray-700">
                  {slab.min} - {slab.max === Infinity ? '∞' : slab.max}
                  {slab.max === Infinity && (
                    <span className="ml-2 text-xs text-blue-600">(Above)</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-green-600">₹{slab.rate}</span>
                  <span className="text-xs text-gray-500 ml-1">/kL</span>
                </td>
                <td className="px-4 py-3">
                  {slab.minCharge ? (
                    <span className="font-semibold text-orange-600">₹{slab.minCharge}</span>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Note about pricing */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 italic">
          {translations.note[language]}
        </p>
      </div>
    </div>
  )
}

export default PriceDetails