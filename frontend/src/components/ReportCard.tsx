import CommentSection from './CommentSection';
import React, { useState } from 'react';
import {
  MapPin,
  ThumbsUp,
  ThumbsDown,
  Clock,
  AlertTriangle,
  MessageCircle
} from 'lucide-react';

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
}

interface ReportCardProps {
  report: Report;
  onVote: (reportId: string, voteType: 'up' | 'down') => void;
  timeAgo?: string;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onVote, timeAgo }) => {
  const [showComments, setShowComments] = useState(false);
  const getHazardType = (description: string) => {
    const text = description.toLowerCase();
    if (text.includes('pothole')) return { type: 'Pothole', color: 'text-orange-600', bg: 'bg-orange-100' };
    if (text.includes('accident') || text.includes('crash')) return { type: 'Accident', color: 'text-red-600', bg: 'bg-red-100' };
    if (text.includes('construction') || text.includes('debris')) return { type: 'Construction', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (text.includes('flood') || text.includes('water')) return { type: 'Flooding', color: 'text-blue-600', bg: 'bg-blue-100' };
    return { type: 'Hazard', color: 'text-purple-600', bg: 'bg-purple-100' };
  };

  const hazardInfo = getHazardType(report.description);

  // Convert string ID to number safely
  const reportIdNumber = parseInt(report.id, 10);

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg border border-white/50 overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="relative overflow-hidden">
        <img
          src={report.image || '/placeholder.png'}
          alt="Hazard report"
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className={`absolute top-4 left-4 ${hazardInfo.bg} ${hazardInfo.color} px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 backdrop-blur-sm`}>
          <AlertTriangle className="w-3 h-3" />
          <span>{hazardInfo.type}</span>
        </div>
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 backdrop-blur-sm">
          <MapPin className="w-3 h-3" />
          <span>{report.distance.toFixed(1)} km away</span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <p className="text-gray-700 leading-relaxed">{report.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{timeAgo || 'Just now'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>Public Road</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onVote(report.id, 'up')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
                report.userVote === 'up'
                  ? 'bg-green-100 text-green-700 shadow-sm'
                  : 'hover:bg-green-50 text-gray-600 hover:text-green-600'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{report.upvotes}</span>
            </button>

            <button
              onClick={() => onVote(report.id, 'down')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
                report.userVote === 'down'
                  ? 'bg-red-100 text-red-700 shadow-sm'
                  : 'hover:bg-red-50 text-gray-600 hover:text-red-600'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              <span>{report.downvotes}</span>
            </button>
          </div>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-xl text-gray-600 hover:text-gray-800 font-medium transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{showComments ? 'Hide' : 'Comment'}</span>
          </button>
        </div>

        {showComments && (
          <div className="pt-4 border-t border-gray-200">
            <CommentSection reportId={reportIdNumber} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportCard;
