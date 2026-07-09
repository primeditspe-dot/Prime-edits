import React, { useState, useEffect } from 'react';
import { 
  LogOut, RefreshCw, Search, Filter, Mail, Phone, Calendar, 
  ChevronRight, Inbox, Compass, Users, CheckCircle, Clock, Trash2, Edit2
} from 'lucide-react';
import InquiryDetailModal from './InquiryDetailModal.jsx';

function AdminDashboard({ token, handleLogout }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [connectionStatus, setConnectionStatus] = useState('Checking...');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch inquiries and connection health
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch health status
        const healthRes = await fetch('/api/health');
        const healthData = await healthRes.json();
        setConnectionStatus(healthData.firestore === 'active' ? 'Live Firestore' : 'Mock DB');
      } catch (err) {
        setConnectionStatus('Offline');
      }

      try {
        const res = await fetch('/api/admin/contacts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            handleLogout(); // Auto-logout if token expired
          }
          throw new Error('Failed to load inquiries.');
        }
        
        const data = await res.json();
        setContacts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Helper for formatting date
  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter contacts
  const filteredContacts = contacts.filter(c => {
    const matchesSearch = 
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm) ||
      c.message?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesService = serviceFilter === 'All' || c.service === serviceFilter;
    
    return matchesSearch && matchesStatus && matchesService;
  });

  // Calculate statistics
  const totalCount = contacts.length;
  const newCount = contacts.filter(c => c.status === 'New').length;
  const inProgressCount = contacts.filter(c => c.status === 'In Progress').length;
  const completedCount = contacts.filter(c => c.status === 'Completed').length;
  const archivedCount = contacts.filter(c => c.status === 'Archived').length;

  // Budget distributions for chart
  const budgetData = contacts.reduce((acc, c) => {
    const b = c.budget || 'Not Specified';
    acc[b] = (acc[b] || 0) + 1;
    return acc;
  }, {});

  // Service distribution for chart
  const serviceData = contacts.reduce((acc, c) => {
    const s = c.service || 'General Inquiry';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  // Render status badge
  const renderBadge = (status) => {
    switch (status) {
      case 'New': return <span className="badge badge-new">New</span>;
      case 'In Progress': return <span className="badge badge-in-progress">In Progress</span>;
      case 'Completed': return <span className="badge badge-completed">Completed</span>;
      case 'Archived': return <span className="badge badge-archived">Archived</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#04050a',
      color: '#f4f6fb',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* Top Navbar */}
      <header className="glass-panel" style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--color-line)'
      }}>
        {/* Left Side: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #4cdbe8, #3a86ff)',
            padding: '0.5rem',
            borderRadius: '10px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Inbox size={20} />
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '1.5rem',
              letterSpacing: '0.05em',
              lineHeight: 1
            }}>
              PRIME EDITS
            </h1>
            <span className="hide-on-mobile" style={{ fontSize: '0.7rem', color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              ADMIN OPERATIONS PORTAL
            </span>
          </div>
        </div>

        {/* Right Side: Connection status + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Connection status indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: connectionStatus === 'Live Firestore' ? '#14a394' : 
                               connectionStatus === 'Mock DB' ? '#3a86ff' : '#ef4444',
              display: 'inline-block',
              animation: 'pulseGlow 2s infinite'
            }} />
            <span className="hide-on-mobile" style={{ fontFamily: 'var(--font-mono)', color: '#aab1c5' }}>{connectionStatus}</span>
          </div>

          {/* Refresh Button */}
          <button 
            onClick={handleRefresh}
            className="tooltip"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--color-line)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-fg)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <RefreshCw size={16} className={loading ? 'spin-anim' : ''} />
            <span className="tooltiptext">Refresh Data</span>
          </button>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="admin-btn"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            <LogOut size={16} />
            <span className="hide-on-mobile">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '1rem',
            borderRadius: '12px',
            color: '#f87171',
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        {/* 1. Stat Cards Row */}
        <section className="dashboard-grid" style={{ marginBottom: '2rem' }}>
          {/* Total Inquiries */}
          <div className="glass-panel stat-card">
            <div style={{ color: '#aab1c5', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Inquiries</span>
              <Users size={16} />
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>{totalCount}</h3>
            <span style={{ fontSize: '0.75rem', color: '#707892' }}>All recorded submissions</span>
          </div>

          {/* New Inquiries */}
          <div className="glass-panel stat-card" style={{ borderLeft: '3px solid var(--color-cyan)' }}>
            <div style={{ color: 'var(--color-cyan)', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>New</span>
              <Clock size={16} />
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--color-cyan)' }}>{newCount}</h3>
            <span style={{ fontSize: '0.75rem', color: '#707892' }}>Awaiting initial review</span>
          </div>

          {/* In Progress */}
          <div className="glass-panel stat-card" style={{ borderLeft: '3px solid var(--color-accent)' }}>
            <div style={{ color: 'var(--color-accent)', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>In Progress</span>
              <Compass size={16} />
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--color-accent)' }}>{inProgressCount}</h3>
            <span style={{ fontSize: '0.75rem', color: '#707892' }}>Currently being handled</span>
          </div>

          {/* Completed */}
          <div className="glass-panel stat-card" style={{ borderLeft: '3px solid var(--color-accent-2)' }}>
            <div style={{ color: 'var(--color-accent-2)', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Completed</span>
              <CheckCircle size={16} />
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--color-accent-2)' }}>{completedCount}</h3>
            <span style={{ fontSize: '0.75rem', color: '#707892' }}>Delivered or resolved</span>
          </div>
        </section>

        {/* 2. Visual Analytics Section (SVG charts) */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {/* Services Distribution Chart */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-fg-dim)' }}>
              Inquiries by Requested Service
            </h4>
            
            {totalCount === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#707892', textAlign: 'center', padding: '2rem' }}>No data available</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(serviceData).map(([service, count]) => {
                  const percent = Math.round((count / totalCount) * 100);
                  return (
                    <div key={service}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        <span>{service}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{count} ({percent}%)</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${percent}%`,
                          background: 'linear-gradient(to right, #4cdbe8, #3a86ff)',
                          borderRadius: '4px',
                          transition: 'width 1s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Budgets Distribution Chart */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-fg-dim)' }}>
              Budget Allocations
            </h4>
            
            {totalCount === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#707892', textAlign: 'center', padding: '2rem' }}>No data available</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(budgetData).map(([budget, count]) => {
                  const percent = Math.round((count / totalCount) * 100);
                  return (
                    <div key={budget}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        <span>{budget}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{count} ({percent}%)</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${percent}%`,
                          background: 'linear-gradient(to right, #14a394, #4cdbe8)',
                          borderRadius: '4px',
                          transition: 'width 1s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* 3. Inquiries Table Section */}
        <section className="glass-panel animate-slide-up" style={{ borderRadius: '20px', padding: '1.5rem' }}>
          
          {/* Table Filters & Search */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '1rem', 
            marginBottom: '1.5rem' 
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Inquiry Entries</h3>

            <div className="filters-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {/* Search Bar */}
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#707892' }} />
                <input
                  type="text"
                  placeholder="Search inquiries..."
                  className="admin-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '2.5rem', width: '220px', fontSize: '0.85rem' }}
                />
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={14} style={{ color: '#707892' }} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="admin-input"
                  style={{ padding: '0.5rem 2rem 0.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  <option value="All">All Statuses</option>
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              {/* Service Filter */}
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="admin-input"
                style={{ padding: '0.5rem 2rem 0.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                <option value="All">All Services</option>
                <option value="General Inquiry">General Inquiry</option>
                <option value="YouTube Style Edit">YouTube Style Edit</option>
                <option value="TikTok/Shorts Package">TikTok/Shorts Package</option>
                <option value="Corporate/Promo Video">Corporate/Promo Video</option>
              </select>
            </div>
          </div>

          {/* Inquiries Table */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
              <div className="spin-anim" style={{
                width: '30px',
                height: '30px',
                border: '2px solid rgba(76, 219, 232, 0.1)',
                borderTopColor: '#4cdbe8',
                borderRadius: '50%'
              }} />
            </div>
          ) : filteredContacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#707892' }}>
              <Inbox size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ fontSize: '0.95rem' }}>No inquiries matching your criteria were found.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Client / Contact</th>
                      <th>Requested Service</th>
                      <th>Estimated Budget</th>
                      <th>Date Received</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((contact) => (
                      <tr key={contact.id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{contact.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#aab1c5', display: 'flex', flexDirection: 'column', marginTop: '0.15rem' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Mail size={10} /> {contact.email}
                            </span>
                            {contact.phone && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}>
                                <Phone size={10} /> {contact.phone}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{contact.service}</div>
                        </td>
                        <td>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{contact.budget}</div>
                        </td>
                        <td>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#aab1c5' }}>
                            <Calendar size={12} />
                            {formatDate(contact.createdAt)}
                          </div>
                        </td>
                        <td>
                          {renderBadge(contact.status)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            onClick={() => setSelectedContact(contact)}
                            className="admin-btn"
                            style={{
                              padding: '0.35rem 0.75rem',
                              fontSize: '0.8rem',
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid var(--color-line)',
                              borderRadius: '8px'
                            }}
                          >
                            <span>Review</span>
                            <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="mobile-card-list">
                {filteredContacts.map((contact) => (
                  <div key={contact.id} className="mobile-inquiry-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{contact.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#aab1c5', marginTop: '0.1rem', wordBreak: 'break-all' }}>{contact.email}</div>
                        {contact.phone && (
                          <div style={{ fontSize: '0.75rem', color: '#aab1c5', marginTop: '0.05rem' }}>{contact.phone}</div>
                        )}
                      </div>
                      {renderBadge(contact.status)}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.8rem', margin: '0.1rem 0' }}>
                      <div><span style={{ color: '#707892' }}>Service:</span> <span style={{ fontWeight: 600 }}>{contact.service}</span></div>
                      <div><span style={{ color: '#707892' }}>Budget:</span> <span style={{ fontFamily: 'var(--font-mono)' }}>{contact.budget}</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#aab1c5', marginTop: '0.25rem' }}>
                        <Calendar size={10} />
                        {formatDate(contact.createdAt)}
                      </div>
                    </div>

                    <button 
                      onClick={() => setSelectedContact(contact)}
                      className="admin-btn"
                      style={{
                        padding: '0.45rem',
                        fontSize: '0.8rem',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--color-line)',
                        borderRadius: '8px',
                        width: '100%',
                        justifyContent: 'center',
                        marginTop: '0.25rem'
                      }}
                    >
                      <span>Review Details</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      {/* Slide-over Detail Modal */}
      {selectedContact && (
        <InquiryDetailModal 
          contact={selectedContact} 
          token={token}
          onClose={() => setSelectedContact(null)} 
          onUpdate={handleRefresh}
        />
      )}

      {/* Inline styles for dashboard specific items */}
      <style>{`
        .spin-anim {
          animation: spin 1.2s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;
