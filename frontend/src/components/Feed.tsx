import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Users, RefreshCw } from 'lucide-react';
import ReportCard from './ReportCard';

interface Report {
  id: string;
  image: string;
  description: string;
  location: { lat: number; lng: number };
  distance: number;
  timestamp: Date;
  upvotes: number;
  downvotes: number;
  userVote: 'up' | 'down' | null;
}

interface FeedProps {
  userLocation: {lat: number, lng: number} | null;
}

const Feed: React.FC<FeedProps> = ({ userLocation }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'recent' | 'nearby'>('all');

  // Mock data for demonstration
  const mockReports: Report[] = [
    {
      id: '1',
      image: 'https://images.pexels.com/photos/161799/pothole-road-damage-asphalt-161799.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Large pothole on Main Street causing traffic issues. Multiple vehicles have been damaged.',
      location: { lat: 40.7128, lng: -74.0060 },
      distance: 0.5,
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      upvotes: 15,
      downvotes: 2,
      userVote: null
    },
    {
      id: '2',
      image: 'https://images.pexels.com/photos/417054/pexels-photo-417054.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Construction debris blocking the right lane on Highway 101. Proceed with caution.',
      location: { lat: 40.7580, lng: -73.9855 },
      distance: 1.2,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      upvotes: 8,
      downvotes: 1,
      userVote: null
    },
    {
      id: '3',
      image: 'https://images.pexels.com/photos/163016/crash-test-collision-60-km-h-distraction-163016.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Minor accident at Oak Avenue intersection. Traffic is moving slowly but emergency services have cleared the scene.',
      location: { lat: 40.7308, lng: -73.9728 },
      distance: 0.8,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      upvotes: 12,
      downvotes: 0,
      userVote: null
    },
    {
      id: '4',
      image: 'https://images.pexels.com/photos/280209/pexels-photo-280209.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Flooding on River Road after heavy rain. Water level is about 6 inches deep, avoid if possible.',
      location: { lat: 40.7489, lng: -73.9680 },
      distance: 1.8,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      upvotes: 20,
      downvotes: 3,
      userVote: null
    }
  ];

  useEffect(() => {
    // Simulate loading reports
    setLoading(true);
    setTimeout(() => {
      setReports(mockReports);
      setLoading(false);
    }, 1000);
  }, []);

  const handleVote = (reportId: string, voteType: 'up' | 'down') => {
    setReports(prevReports =>
      prevReports.map(report => {
        if (report.id === reportId) {
          const newReport = { ...report };
          
          // Remove previous vote if any
          if (report.userVote === 'up') newReport.upvotes--;
          if (report.userVote === 'down') newReport.downvotes--;
          
          // Add new vote if different from current
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

  const filteredReports = reports.filter(report => {
    switch (filter) {
      case 'recent':
        return Date.now() - report.timestamp.getTime() < 24 * 60 * 60 * 1000; // Last 24 hours
      case 'nearby':
        return report.distance <= 1; // Within 1km
      default:
        return report.distance <= 2; // Within 2km (as per requirement)
    }
  });

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInHours >= 24) {
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (diffInHours >= 1) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
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
              <p className="text-gray-600">Hazards reported within 2km of your location</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1000);
            }}
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
            { key: 'nearby', label: 'Nearby', icon: Users }
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