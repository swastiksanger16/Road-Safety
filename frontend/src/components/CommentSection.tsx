import React, { useEffect, useState } from 'react';

interface Comment {
  id: number;
  report_id: number;
  user_id: string;
  user_name: string; // ✅ added
  text: string;
  created_at: string;
}

interface CommentSectionProps {
  reportId: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ reportId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('access_token');

  const fetchComments = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/comments/${reportId}`);
      if (!res.ok) throw new Error('Failed to load comments');
      const data = await res.json();
      setComments(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to fetch comments.');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!token) {
      setError('You must be logged in to post a comment.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8000/api/comments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          report_id: reportId,
          text: newComment.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to post comment');

      setNewComment('');
      await fetchComments();
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to post comment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [reportId]);

  return (
    <div className="mt-4 bg-gray-50 rounded-xl p-4 border">
      <h3 className="text-lg font-semibold mb-2 text-gray-700">Comments</h3>

      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white p-3 rounded-lg shadow-sm border">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-sm text-gray-700">
                  {comment.user_name}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-800 text-sm">{comment.text}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleCommentSubmit} className="mt-4 flex flex-col gap-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full border rounded-lg p-2 text-sm resize-none shadow-sm focus:ring focus:ring-blue-300"
          rows={3}
          placeholder="Write a comment..."
        />
        <button
          type="submit"
          className="self-end bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </div>
  );
};

export default CommentSection;
