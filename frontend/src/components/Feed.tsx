import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Users, RefreshCw } from 'lucide-react';
import ReportCard from './ReportCard';
import { useNavigate } from 'react-router-dom';

interface Report {
  id: string;
  image: string;
  description: string;
  location: { lat: number; lng: number };
  distance: number;
  timestamp: string; // ISO string from API
  upvotes: number;
  downvotes: number;
  userVote: 'up' | 'down' | null;
  status: string;
}

interface FeedProps {
  userLocation: { lat: number; lng: number } | null;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
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

const Feed: React.FC<FeedProps> = ({ userLocation }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'recent'>('all');
  const navigate = useNavigate();

  // Fetch reports from backend
  const fetchReports = async () => {
    if (!userLocation) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      const response = await fetch(
        `http://localhost:8000/api/hazards/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/login'); // Redirect to login if token invalid
          return;
        }
        throw new Error(`Error ${response.status}`);
      }

      const data = await response.json();

      const formattedReports = data.map((hazard: any) => {
        const dist = userLocation
          ? calculateDistance(userLocation.lat, userLocation.lng, hazard.lat, hazard.lng)
          : 0;

        return {
          id: hazard.id.toString(),
          image: hazard.photo_url,
          description: hazard.description,
          location: { lat: hazard.lat, lng: hazard.lng },
          distance: dist,
          timestamp: hazard.created_at,
          upvotes: hazard.upvotes ?? 0,
          downvotes: hazard.downvotes ?? 0,
          userVote: null,
          status: hazard.status ?? 'Unresolved',
        };
      });

      setReports(formattedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [userLocation]);

  const handleVote = (reportId: string, voteType: 'up' | 'down') => {
    setReports((prevReports) =>
      prevReports.map((report) => {
        if (report.id === reportId) {
          const newReport = { ...report };
          if (report.userVote === 'up') newReport.upvotes--;
          if (report.userVote === 'down') newReport.downvotes--;

          if (report.userVote !== voteType) {
            if (voteType === 'up') newReport.upvotes++;
            if (voteType === 'down') newReport.downvotes++;
            newReport.userVote = voteType;
          } else {
            newReport.userVote = null;
          }
          return newReport;
        }
        return report;
      })
    );
  };

  const filteredReports = reports.filter((report) => {
    const reportDate = new Date(report.timestamp);
    switch (filter) {
      case 'recent':
        return Date.now() - reportDate.getTime() < 2 * 24 * 60 * 60 * 1000;
      case 'all':
      default:
        return report.distance <= 2;
    }
  });

  const getTimeAgo = (dateString: string) => {
    const utcDate = new Date(dateString);
    const localDate = new Date(utcDate.getTime() + new Date().getTimezoneOffset() * -60000);
    const now = new Date();

    const diffInMs = now.getTime() - localDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60)
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  };

  return (
    <div className="space-y-6">
      {/* Feed Header */}
      <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Community Reports</h2>
              <p className="text-gray-600">
                {filter === 'recent'
                  ? 'Recent hazards reported in the last 2 days (within 2km)'
                  : 'All hazards reported within 2km of your location'}
              </p>
            </div>
          </div>

          <button
            onClick={fetchReports}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-2xl p-1">
          {[
            { key: 'all', label: 'All Reports', icon: MapPin },
            { key: 'recent', label: 'Recent', icon: Clock },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all ${
                filter === key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reports Feed */}
      <div className="space-y-4">
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
        ) : filteredReports.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-12 text-center shadow-xl border border-white/50">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Reports Found</h3>
            <p className="text-gray-500">
              No hazard reports in your area yet. Be the first to help keep your community safe!
            </p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onVote={handleVote}
              timeAgo={getTimeAgo(report.timestamp)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;
