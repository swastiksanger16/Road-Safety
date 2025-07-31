import React, { useEffect, useState } from 'react';
import ReportCard from './ReportCard';

interface Hazard {
  id: string;
  photo_url: string;
  description: string;
  location: { lat: number; lng: number };
  timestamp: string;
  upvotes: number;
  downvotes: number;
  status: string;
  hazard_type: string;
}

const AdminPanel: React.FC = () => {
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllHazards = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/hazards/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setHazards(data);
    } catch (error) {
      console.error('Failed to fetch hazards:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteHazard = async (id: string) => {
    const token = localStorage.getItem('access_token');
    const confirmed = window.confirm('Are you sure you want to delete this report?');
    if (!confirmed) return;

    try {
      await fetch(`http://localhost:8000/api/hazards/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      } else {
        console.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
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
              location: hazard.location,
              distance: 0,
              timestamp: hazard.timestamp,
              upvotes: hazard.upvotes,
              downvotes: hazard.downvotes,
              userVote: null,
            }}
            onVote={() => {}}
            timeAgo={new Date(hazard.timestamp).toLocaleString()}
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
