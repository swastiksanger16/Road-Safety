import React, { useEffect, useState, useRef } from 'react';
import ReportCard from './ReportCard';
import { getPlaceName } from '../utils/locationiq';

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

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff} min${diff === 1 ? '' : 's'} ago`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

const Profile: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const placeCache = useRef<Map<string, string>>(new Map());

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const savedLocation = localStorage.getItem('user_location');
    if (savedLocation) {
      setUserLocation(JSON.parse(savedLocation));
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('http://localhost:8000/api/hazards/mine', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (!response.ok) throw new Error('Failed to fetch user reports');
        const data = await response.json();

        const formattedReports = await Promise.all(
          data.map(async (hazard: any) => {
            const cacheKey = `${hazard.lat},${hazard.lng}`;
            let placeName = placeCache.current.get(cacheKey);
            if (!placeName) {
              placeName = await getPlaceName(hazard.lat, hazard.lng);
              placeCache.current.set(cacheKey, placeName);
            }

            return {
              id: hazard.id.toString(),
              image: hazard.photo_url,
              description: hazard.description,
              location: { lat: hazard.lat, lng: hazard.lng },
              distance: userLocation
                ? calculateDistance(userLocation.lat, userLocation.lng, hazard.lat, hazard.lng)
                : 0,
              timestamp: hazard.created_at,
              upvotes: hazard.upvotes || 0,
              downvotes: hazard.downvotes || 0,
              userVote: hazard.userVote || null,
              placeName,
            };
          })
        );

        setReports(formattedReports);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
    return () => controller.abort();
  }, [userLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden p-6 pt-24">
      {/* User Info */}
      <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/50 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{user.name}</h2>
        <p className="text-gray-600">Email: {user.email}</p>
        <p className="text-gray-600">Role: {user.role}</p>
        <p className="text-gray-600">Created at: {new Date(user.created_at).toLocaleDateString()}</p>
      </div>

      {/* Reports Section */}
      <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/50 mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Your Reports</h3>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/50 rounded-3xl p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-2xl mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
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
                onVote={() => {}}
                timeAgo={getTimeAgo(report.timestamp)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
