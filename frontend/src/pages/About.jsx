import Navbar from '../components/Navbar';
import { FaHandshake, FaHome, FaUsers, FaShieldAlt } from 'react-icons/fa';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navbar />
      <div className="pt-28 pb-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">About MS Hulbanni Housing</h1>
            <p className="text-gray-600 text-lg">Your trusted partner for quality rental homes</p>
          </div>

          {/* Owner Photo & Mission Section */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12">
            <div className="grid md:grid-cols-2 gap-0">
              
              {/* Left Side - Mission */}
              <div className="p-8 md:p-10">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <FaHandshake className="text-white text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
                <p className="text-gray-700 leading-relaxed text-base">
                  At MS Hulbanni Housing, we connect quality homeowners with responsible tenants. 
                  We provide safe, comfortable, and affordable rental homes while ensuring a 
                  smooth and transparent renting experience for everyone.
                </p>
                
                {/* Small Stats */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="text-center">
                    <FaHome className="text-blue-600 text-xl mx-auto mb-2" />
                    <div className="text-xl font-bold text-gray-800">50+</div>
                    <div className="text-xs text-gray-500">Properties</div>
                  </div>
                  <div className="text-center">
                    <FaUsers className="text-blue-600 text-xl mx-auto mb-2" />
                    <div className="text-xl font-bold text-gray-800">200+</div>
                    <div className="text-xs text-gray-500">Tenants</div>
                  </div>
                  <div className="text-center">
                    <FaShieldAlt className="text-blue-600 text-xl mx-auto mb-2" />
                    <div className="text-xl font-bold text-gray-800">24/7</div>
                    <div className="text-xs text-gray-500">Support</div>
                  </div>
                </div>
              </div>

              {/* Right Side - Owner Photo */}
              <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-8 md:p-10 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-48 h-48 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/50 mb-4">
                    <img 
                      src="https://randomuser.me/api/portraits/men/32.jpg" 
                      alt="Owner"
                      className="w-44 h-44 rounded-full object-cover"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">M S Hulbanni</h3>
                  <p className="text-white/80 text-lg">Founder & Owner</p>
                  <p className="text-white/60 text-sm mt-2">15+ years of experience in real estate</p>
                  
                  {/* Quote */}
                  <div className="mt-6 p-4 bg-white/10 rounded-xl">
                    <p className="text-white/90 text-sm italic">
                      "We believe everyone deserves a place to call home"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Footer Note */}
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              © 2024 MS Hulbanni Housing - Making house renting simple and trustworthy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;