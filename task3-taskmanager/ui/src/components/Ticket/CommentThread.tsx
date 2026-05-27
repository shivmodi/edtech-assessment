import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { apiClient } from '../../api/client';

interface Comment {
  id: string;
  body: string;
  author_name: string;
  created_at: string;
}

export default function CommentThread({ ticketId }: { ticketId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => { load(); }, [ticketId]);

  async function load() {
    try {
      const data = await apiClient.get(`/tickets/${ticketId}/comments`);
      console.log('[Comments] Loaded', data.length, 'comments for ticket', ticketId);
      setComments(data);
    } catch (err) {
      console.error('[Comments] Load failed:', err);
    } finally {
      setLoading(false);
    }
  }

  async function post() {
    if (!text.trim()) return;
    try {
      setPosting(true);
      const comment = await apiClient.post(`/tickets/${ticketId}/comments`, {
        body: text.trim(),
        author_id: 'user-1',
      });
      console.log('[Comments] Posted comment', comment.id, 'to ticket', ticketId);
      setText('');
      load();
    } catch (err) {
      console.error('[Comments] Post failed:', err);
      alert('Failed to post comment');
    } finally {
      setPosting(false);
    }
  }

  if (loading) return <div className="spinner" style={{ margin: '8px auto' }} />;

  return (
    <div style={{ marginTop: 12 }}>
      <div className="comments-list">
        {comments.length === 0 ? (
          <div style={{ color: 'var(--text3)', fontSize: 12, textAlign: 'center', padding: '8px 0' }}>
            No comments yet
          </div>
        ) : comments.map(c => (
          <div key={c.id} className="comment-item">
            <div className="comment-meta">
              <span className="comment-author">{c.author_name || 'User'}</span>
              <span className="comment-date">{new Date(c.created_at).toLocaleDateString()}</span>
            </div>
            <div className="comment-body">{c.body}</div>
          </div>
        ))}
      </div>

      <div className="comment-input-row">
        <input
          className="form-control"
          placeholder="Write a comment..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); post(); } }}
        />
        <button className="btn btn-primary btn-sm" onClick={post} disabled={posting || !text.trim()}>
          {posting ? <div className="spinner" /> : <Send size={14} />}
        </button>
      </div>
    </div>
  );
}