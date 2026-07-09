import React, { useState, useEffect } from 'react';
import { 
  X, Mail, Phone, Calendar, Briefcase, DollarSign, FileText, 
  Trash2, Save, ExternalLink, RefreshCw, AlertCircle
} from 'lucide-react';

function InquiryDetailModal({ contact, token, onClose, onUpdate }) {
  const [status, setStatus] = useState(contact.status || 'New');
  const [notes, setNotes] = useState(contact.notes || '');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  // Keep state in sync if contact changes
  useEffect(() => {
    setStatus(contact.status || 'New');
    setNotes(contact.notes || '');
    setError('');
    setShowConfirmDelete(false);
  }, [contact]);

  // Handle status update
  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/contacts/${contact.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status.');

      setStatus(newStatus);
      onUpdate(); // Reload dashboard lists
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle saving notes
  const handleSaveNotes = async () => {
    setSavingNotes(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/contacts/${contact.id}/notes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save notes.');

      onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingNotes(false);
    }
  };

  // Handle deletion
  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/contacts/${contact.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete inquiry.');

      onUpdate();
      onClose(); // Close details view after successful deletion
    } catch (err) {
      setError(err.message);
      setDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  // Check if file is image/video or file
  const renderAttachment = (url) => {
    if (!url) return <p style={{ fontSize: '0.85rem', color: '#707892' }}>No files attached.</p>;

    // Cloudinary demo placeholder or simple files
    const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)/i) || url.includes('w_640') || url.includes('e_sepia') || url.includes('image/upload');
    const isVideo = url.match(/\.(mp4|webm|ogg|mov)/i) || url.includes('video/upload') || url.includes('dog.mp4') || url.includes('elephants.mp4');

    return (
      <div style={{ marginTop: '0.5rem' }}>
        {isImage && (
          <img 
            src={url} 
            alt="Attachment" 
            style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-line)', marginBottom: '0.5rem' }} 
          />
        )}
        {isVideo && (
          <video 
            src={url} 
            controls 
            style={{ width: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid var(--color-line)', marginBottom: '0.5rem', backgroundColor: '#000' }} 
          />
        )}
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="admin-btn"
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.8rem',
            background: 'rgba(76, 219, 232, 0.1)',
            color: 'var(--color-cyan)',
            border: '1px solid rgba(76, 219, 232, 0.2)',
            display: 'inline-flex',
            width: '100%',
            justifyContent: 'center'
          }}
        >
          <span>Open File Attachment</span>
          <ExternalLink size={14} />
        </a>
      </div>
    );
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(4, 5, 10, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 20
        }}
      />

      {/* Detail Slide Panel */}
      <div className="glass-panel animate-slide-left" style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '520px',
        zIndex: 21,
        boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid var(--color-line)',
        borderTop: 'none',
        borderBottom: 'none',
        borderRight: 'none',
        backgroundColor: '#070912'
      }}>
        {/* Panel Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--color-line)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Inquiry Details</h2>
            <p style={{ fontSize: '0.75rem', color: '#aab1c5', fontFamily: 'var(--font-mono)' }}>ID: {contact.id}</p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#aab1c5',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Panel Content (Scrollable) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              color: '#f87171',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Status Controls */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--color-line)',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#aab1c5' }}>Update Status</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {updatingStatus && <RefreshCw size={14} className="spin-anim" style={{ color: 'var(--color-cyan)' }} />}
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                className="admin-input"
                style={{ padding: '0.4rem 2rem 0.4rem 0.75rem', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          {/* 2. Client Info Card */}
          <div className="glass-panel" style={{ borderRadius: '12px', padding: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: '#aab1c5', marginBottom: '0.75rem', fontWeight: 700 }}>Contact Information</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ color: 'var(--color-cyan)' }}><FileText size={16} /></div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#707892' }}>Full Name</div>
                  <div style={{ fontWeight: 700 }}>{contact.name}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ color: 'var(--color-cyan)' }}><Mail size={16} /></div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#707892' }}>Email Address</div>
                  <div>{contact.email}</div>
                </div>
              </div>
              {contact.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ color: 'var(--color-cyan)' }}><Phone size={16} /></div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#707892' }}>Phone Number</div>
                    <div>{contact.phone}</div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ color: 'var(--color-cyan)' }}><Calendar size={16} /></div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#707892' }}>Date Submitted</div>
                  <div style={{ fontSize: '0.85rem' }}>
                    {new Date(contact.createdAt).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Scope Card */}
          <div className="glass-panel" style={{ borderRadius: '12px', padding: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: '#aab1c5', marginBottom: '0.75rem', fontWeight: 700 }}>Project Scope</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ color: 'var(--color-cyan)' }}><Briefcase size={16} /></div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#707892' }}>Selected Service</div>
                  <div style={{ fontWeight: 600 }}>{contact.service}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ color: 'var(--color-cyan)' }}><DollarSign size={16} /></div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#707892' }}>Estimated Budget</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600 }}>{contact.budget}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Client Message */}
          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#aab1c5', marginBottom: '0.5rem', fontWeight: 700 }}>Message Details</h4>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--color-line)',
              borderRadius: '12px',
              padding: '1rem',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap'
            }}>
              {contact.message}
            </div>
          </div>

          {/* 5. Attached Files */}
          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#aab1c5', marginBottom: '0.5rem', fontWeight: 700 }}>File Submission</h4>
            {renderAttachment(contact.fileUrl)}
          </div>

          {/* 6. Admin Internal Notes */}
          <div style={{
            borderTop: '1px solid var(--color-line)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <h4 style={{ fontSize: '0.85rem', color: '#aab1c5', fontWeight: 700 }}>Internal Operations Notes</h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal remarks about this inquiry, client calls, negotiations..."
              rows={4}
              className="admin-input"
              style={{ resize: 'vertical', width: '100%', fontSize: '0.9rem', padding: '0.75rem' }}
            />
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="admin-btn admin-btn-primary"
              style={{
                alignSelf: 'flex-end',
                padding: '0.5rem 1.25rem',
                fontSize: '0.85rem',
                borderRadius: '8px'
              }}
            >
              {savingNotes ? <RefreshCw size={14} className="spin-anim" /> : <Save size={14} />}
              <span>Save Remarks</span>
            </button>
          </div>

        </div>

        {/* Panel Footer */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderTop: '1px solid var(--color-line)',
          background: 'rgba(255,255,255,0.01)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {!showConfirmDelete ? (
            <button 
              onClick={() => setShowConfirmDelete(true)}
              className="admin-btn"
              style={{
                background: 'transparent',
                color: '#ef4444',
                border: 'none',
                padding: '0.5rem',
                fontSize: '0.85rem'
              }}
            >
              <Trash2 size={16} />
              <span>Delete Entry</span>
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
              <span style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: 600 }}>Confirm deletion?</span>
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className="admin-btn"
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                  borderRadius: '6px'
                }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
              <button 
                onClick={() => setShowConfirmDelete(false)}
                className="admin-btn"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#aab1c5',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                  borderRadius: '6px',
                  border: '1px solid var(--color-line)'
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

      </div>

      <style>{`
        .spin-anim {
          animation: spin 1.2s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

export default InquiryDetailModal;
