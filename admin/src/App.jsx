import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import AdminNavbar from './components/AdminNavbar';
import AdminHome from './pages/AdminHome';
import AddHousing from './pages/AddHousing';
import Tenants from './pages/Tenants';
import Rentals from './pages/Rentals';
import AdminComplaints from './pages/AdminComplaints';
import OwnerPage from './pages/OwnerPage';
import AgreementPage from './pages/AgreementPage';

function App() {
  return (
    <Router>
      <div>
        <AdminNavbar />
        <div className="pt-16">
          <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="/add-housing" element={<AddHousing />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/rentals" element={<Rentals />} />
            <Route path="/complaints" element={<AdminComplaints />} />
            <Route path="/owner" element={<OwnerPage />} />
            <Route path="/agreement" element={<AgreementPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;