import React, { useState, useEffect } from 'react';
import { Camera, Navigation } from 'lucide-react';
import HazardForm from './HazardForm';
import Feed from './Feed';

const OverviewPage = () => {
  const [showHazardForm, setShowHazardForm] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Location access is required to view nearby hazards.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const handleReportHazard = () => {
    setShowHazardForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 pt-24">
        {/* Feed Section */}
        {userLocation && <Feed userLocation={userLocation} />}
      </main>

      {/* Floating Report Hazard Button */}
      <button
        onClick={handleReportHazard}
        className="fixed top-28 right-6 z-50 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 hover:scale-105 transition-transform"
      >
        <Camera className="w-5 h-5" />
        <span>Report Hazard</span>
        <Navigation className="w-4 h-4" />
      </button>

      {/* Hazard Form Modal */}
      {showHazardForm && userLocation && (
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
