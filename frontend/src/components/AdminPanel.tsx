import React, { useEffect, useState } from 'react';
import ReportCard from './ReportCard';
import { getPlaceName } from '../utils/locationiq'; // ✅ Import place name utility
// import { getPlaceName } from '../utils/geolocation';

interface Hazard {
  id: string;
  photo_url: string;
  description: string;
  location?: { lat: number; lng: number } | null;
  lat?: number;
  lng?: number;
  timestamp: string;
  upvotes: number;
  downvotes: number;
  status: string;
  hazard_type: string;
  placeName?: string;
  distance?: number;
  created_at?: string;
  timeAgo?: string; 
}

const AdminPanel: React.FC = () => {
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
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
    try {
      const savedLocation = localStorage.getItem('user_location');
      if (savedLocation) {
        setUserLocation(JSON.parse(savedLocation));
      }
    } catch (err) {
      console.error('Failed to parse user_location:', err);
    }
  }, []);

  const fetchAllHazards = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/hazards/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      // ✅ Fetch place names for each hazard
      const formattedHazards = await Promise.all(
        data.map(async (hazard: Hazard) => {
          const lat = hazard.location?.lat ?? hazard.lat;
          const lng = hazard.location?.lng ?? hazard.lng;

          const placeName = lat && lng ? await getPlaceName(lat, lng) : 'Unknown Location';
          const distance =
            userLocation && lat && lng
              ? Number(calculateDistance(userLocation.lat, userLocation.lng, lat, lng).toFixed(2))
              : 0;

          const timestamp = hazard.created_at || hazard.timestamp || '';
    const timeAgo = getTimeAgo(timestamp);
          
          return { ...hazard, placeName, distance, lat, lng };
        })
      );

      setHazards(formattedHazards);
    } catch (error) {
      console.error('Failed to fetch hazards:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteHazard = async (id: string) => {
    const token = localStorage.getItem('access_token');
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      await fetch(`http://localhost:8000/api/hazards/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setHazards((hazards) => hazards.filter((h) => h.id !== id));
    } catch (error) {
      console.error('Failed to delete hazard:', error);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`http://localhost:8000/api/hazards/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updatedHazard = await response.json();
        setHazards((prev) =>
          prev.map((h) => (h.id === id ? { ...h, status: updatedHazard.status } : h))
        );
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };
  
  const getTimeAgo = (dateString: string) => {
  const utcDate = new Date(dateString);
  const localDate = new Date(utcDate.getTime() + new Date().getTimezoneOffset() * -60000);
  const now = new Date();

  const diffInMs = now.getTime() - localDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''} ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hr${diffInHours > 1 ? 's' : ''} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
};


  useEffect(() => {
    fetchAllHazards();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading hazards...</div>;

  return (
    <div className="p-4 mt-5 space-y-4">
      <h1 className="text-2xl font-bold text-center">Admin Panel - All Reports</h1>
      {hazards.map((hazard) => (
        <div key={hazard.id} className="relative">
          <ReportCard
            report={{
              id: hazard.id,
              image: hazard.photo_url,
              description: hazard.description,
              location: { lat: hazard.lat ?? 0, lng: hazard.lng ?? 0 },
              distance: hazard.distance ?? 0,
              timestamp: hazard.timestamp,
              upvotes: hazard.upvotes,
              downvotes: hazard.downvotes,
              userVote: null,
              placeName: hazard.placeName, // ✅ Added place name
            }}
            onVote={() => {}}
            timeAgo={hazard.timeAgo} 
          />

          {/* Admin Controls */}
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => deleteHazard(hazard.id)}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>

            <select
              value={hazard.status}
              onChange={(e) => updateStatus(hazard.id, e.target.value)}
              className="px-2 py-1 rounded border border-gray-300"
            >
              <option value="unresolved">Unresolved</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminPanel;
