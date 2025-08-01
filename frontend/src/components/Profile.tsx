import React, { useEffect, useState } from 'react';
import ReportCard from './ReportCard';
import { getPlaceName } from '../utils/locationiq';
//import { getPlaceName } from '../utils/geolocation';

interface Report {
  id: string;
  image?: string;
  description: string;
  location: { lat: number; lng: number };
  distance: number;
  timestamp: string;
  upvotes: number;
  downvotes: number;
  userVote: 'up' | 'down' | null;
  placeName?: string;
}

const Profile: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // ✅ Fetch saved location from localStorage
  useEffect(() => {
    const savedLocation = localStorage.getItem('user_location');
    if (savedLocation) {
      setUserLocation(JSON.parse(savedLocation));
    }
  }, []);

  // ✅ Distance calculation function (same as Feed)
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('http://localhost:8000/api/hazards/mine', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user reports');
        }

        const data = await response.json();

        const formatted = await Promise.all(
          data.map(async (hazard: any) => {
            const placeName = await getPlaceName(hazard.lat, hazard.lng);
            const distance = userLocation
              ? calculateDistance(userLocation.lat, userLocation.lng, hazard.lat, hazard.lng)
              : 0;

            return {
              id: hazard.id.toString(),
              image: hazard.photo_url,
              description: hazard.description,
              location: { lat: hazard.lat, lng: hazard.lng },
              distance,
              timestamp: hazard.created_at,
              upvotes: hazard.upvotes || 0,
              downvotes: hazard.downvotes || 0,
              userVote: hazard.userVote || null,
              placeName,
            };
          })
        );

        setReports(formatted);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [userLocation]); // ✅ re-fetch if location is updated

  const handleVote = () => {
    // Dummy function for voting in profile view
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden p-6 pt-24">
      {/* User Info */}
      <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/50 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{user.name}</h2>
        <p className="text-gray-600">Email: {user.email}</p>
        <p className="text-gray-600">Role: {user.role}</p>
        <p className="text-gray-600">Created at: {user.created_at}</p>
      </div>

      {/* Reports Section */}
      <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/50 mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Your Reports</h3>
        {loading ? (
          <p>Loading reports...</p>
        ) : reports.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-12 text-center shadow-xl border border-white/50">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Reports Found</h3>
            <p className="text-gray-500">You haven't submitted any reports yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onVote={handleVote}
                timeAgo={new Date(report.timestamp).toLocaleString()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
