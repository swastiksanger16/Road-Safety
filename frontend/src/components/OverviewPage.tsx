import React, { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, LogOut, Camera, Navigation } from 'lucide-react';
import HazardForm from './HazardForm';
// import { useNavigate } from 'react-router-dom';
import Feed from './Feed';

const OverviewPage = () => {
  const [showHazardForm, setShowHazardForm] = useState(false);
  // const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationPermission, setLocationPermission] = useState<string>('prompt');

  const handleReportHazard = async () => {
    // Capture location when user wants to report
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setShowHazardForm(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Location access is required to report hazards. Please enable location services.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

//   const handleLogout = () => {
//   localStorage.removeItem('access_token');
//   navigate('/')
// };


  useEffect(() => {
    // Check location permission on load
    if (navigator.permissions) {
      navigator.permissions.query({name: 'geolocation'}).then((result) => {
        setLocationPermission(result.state);
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Doodles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-orange-100 rounded-full opacity-30"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-teal-100 rounded-full opacity-25"></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-purple-100 rounded-full opacity-20"></div>
        
        {/* Road doodles */}
        <svg className="absolute top-1/3 right-1/4 w-40 h-40 opacity-10 text-gray-400" viewBox="0 0 100 100">
          <path d="M10 50 Q50 10 90 50 Q50 90 10 50" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="5,5"/>
        </svg>
        
        <svg className="absolute bottom-1/3 left-1/3 w-32 h-32 opacity-10 text-blue-400" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M30 50 L50 30 L70 50 L50 70 Z" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      </div>


      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 pt-24">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Welcome to Your 
            <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent"> Safety Hub</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Report road hazards in real-time and stay informed about safety issues in your area
          </p>
        </div>

        {/* Report Hazard Section */}
        <div className="mb-12">
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Report a Road Hazard</h3>
              <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                Spotted a pothole, accident, or other road hazard? Help keep your community safe by reporting it instantly.
              </p>
              
              <button
                onClick={handleReportHazard}
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 active:scale-95"
              >
                <Camera className="w-6 h-6" />
                <span>Report Hazard</span>
                <Navigation className="w-5 h-5" />
              </button>
              
              {locationPermission !== 'granted' && (
                <p className="text-sm text-amber-600 mt-4 flex items-center justify-center space-x-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Location access required for reporting</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Feed Section */}
        <Feed userLocation={userLocation} />
      </main>

      {/* Hazard Form Modal */}
      {showHazardForm && (
        <HazardForm
          isOpen={showHazardForm}
          onClose={() => setShowHazardForm(false)}
          userLocation={userLocation}
        />
      )}
    </div>
  );
};

export default OverviewPage;