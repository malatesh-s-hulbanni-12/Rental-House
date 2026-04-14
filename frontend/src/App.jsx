import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import RenterDashboard from './pages/RenterDashboard';
import RenterProfile from './pages/RenterProfile';
import RaiseComplaint from './pages/RaiseComplaint';
import ComplaintHistory from './pages/ComplaintHistory';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/renter-dashboard" element={<RenterDashboard />} />
        <Route path="/renter-profile" element={<RenterProfile />} />
        <Route path="/raise-complaint" element={<RaiseComplaint />} />
        <Route path="/complaint-history" element={<ComplaintHistory />} />
      </Routes>
    </Router>
  );
}

export default App;