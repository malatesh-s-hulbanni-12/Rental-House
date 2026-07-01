// src/App.js
import React, { useState } from 'react'
import WaterBillCalculator from './components/WaterBillCalculator'
import TankCalculator from './pages/TankCalculator'

function App() {
  const [currentPage, setCurrentPage] = useState('tank')

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex gap-4 mb-8 justify-center flex-wrap">
        <button
          onClick={() => setCurrentPage('calculator')}
          className={`px-6 py-2 rounded-lg transition ${
            currentPage === 'calculator'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Bill Calculator
        </button>
        <button
          onClick={() => setCurrentPage('tank')}
          className={`px-6 py-2 rounded-lg transition ${
            currentPage === 'tank'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tank Calculator
        </button>
      </nav>

      {currentPage === 'calculator' && <WaterBillCalculator />}
      {currentPage === 'tank' && <TankCalculator />}
    </div>
  )
}

export default App