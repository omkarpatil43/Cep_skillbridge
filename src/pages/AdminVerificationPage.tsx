import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, StudentLevel } from '../types';
import {
  ShieldCheck, CheckCircle2, XCircle, Clock, Eye,
  RefreshCw, Search, UserCheck
} from 'lucide-react';
import { Modal } from '../components/Modal';

export const AdminVerificationPage: React.FC<{ onSuccessToast?: (msg: string) => void }> = ({ onSuccessToast }) => {
  const { currentUser, authToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Verified' | 'Rejected'>('Pending');
  const [roleFilter, setRoleFilter] = useState<'All' | 'student' | 'senior' | 'club_admin'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // ID card image view modal
  const [selectedImageUser, setSelectedImageUser] = useState<User | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  // Manual adjustment modal
  const [adjustingUser, setAdjustingUser] = useState<User | null>(null);
  const [adjustedLevel, setAdjustedLevel] = useState<StudentLevel>('Fresher');

  const fetchUsers = useCallback(async () => {
    if (!authToken) return;
    setLoading(true);
    try {
      const statusParam = filterStatus === 'All' ? undefined : filterStatus;
      const res = await api.getAdminPendingUsers(authToken, statusParam);
      if (res && res.users) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error('Failed to load pending users:', err);
    } finally {
      setLoading(false);
    }
  }, [authToken, filterStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Load ID card photo securely via authenticated blob fetch
  const handleViewIdCard = async (user: User) => {
    setSelectedImageUser(user);
    setImageLoading(true);
    setImageUrl(null);

    try {
      const res = await fetch(`/api/auth/admin/id-card/${user.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error('Could not load ID card image');
      const blob = await res.blob();
      setImageUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
    } finally {
      setImageLoading(false);
    }
  };

  const handleApprove = async (user: User, level?: StudentLevel) => {
    if (!authToken) return;
    setActionInProgress(user.id);
    try {
      const finalLevel = level || user.studentLevel || (user.role === 'senior' ? 'ThirdYear' : 'Fresher');
      const yearLabel =
        user.role === 'club_admin'
          ? `Club Admin (${user.clubName || 'PICT'})`
          : user.role === 'senior'
          ? (finalLevel === 'FinalYear' ? 'Final Year (Senior)' : '3rd Year (Senior)')
          : finalLevel === 'Fresher'
          ? '1st Year (Fresher)'
          : finalLevel === 'SecondYear'
          ? '2nd Year'
          : finalLevel === 'ThirdYear'
          ? '3rd Year (Senior)'
          : finalLevel === 'FinalYear'
          ? 'Final Year (4th Year)'
          : 'Passed Out Student (Alumni)';

      await api.adminVerifyUser(authToken, user.id, 'approve', finalLevel, yearLabel);
      if (onSuccessToast) onSuccessToast(user.role === 'club_admin' ? `Approved Club Admin ${user.name} for ${user.clubName || 'club'}!` : `Verified ${user.name} as ${finalLevel}!`);
      setAdjustingUser(null);
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (user: User) => {
    if (!authToken) return;
    if (!confirm(`Are you sure you want to reject verification for ${user.name}?`)) return;

    setActionInProgress(user.id);
    try {
      await api.adminVerifyUser(authToken, user.id, 'reject');
      if (onSuccessToast) onSuccessToast(`Rejected verification for ${user.name}`);
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Rejection failed');
    } finally {
      setActionInProgress(null);
    }
  };

  if (!currentUser || (currentUser.role !== 'college_admin' && currentUser.role !== 'admin')) {
    return (
      <div style={{ maxWidth: 800, margin: '60px auto', padding: 24, textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)',
          color: '#dc2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
        }}>
          <ShieldCheck size={28} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
          Faculty / Admin Access Required
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 460, margin: '0 auto 20px' }}>
          This page is reserved for PICT faculty members and portal administrators to review and verify student college ID cards, senior mentor qualifications, and club administrator requests.
        </p>
      </div>
    );
  }

  const clubAdminPendingCount = users.filter(u => u.role === 'club_admin' && (u.verificationStatus === 'Pending' || u.adminStatus === 'Pending')).length;
  const seniorPendingCount = users.filter(u => u.role === 'senior' && u.verificationStatus === 'Pending').length;

  const filteredUsers = users.filter((u) => {
    if (roleFilter === 'student' && u.role !== 'student') return false;
    if (roleFilter === 'senior' && u.role !== 'senior') return false;
    if (roleFilter === 'club_admin' && u.role !== 'club_admin') return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.rollNo && u.rollNo.toLowerCase().includes(q)) ||
      (u.clubName && u.clubName.toLowerCase().includes(q)) ||
      (u.branch && u.branch.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 28,
        paddingBottom: 24,
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{
              display: 'inline-flex',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(2, 132, 199, 0.1)',
              color: 'var(--sky-600)',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}>
              FACULTY & ADMIN PORTAL
            </span>
            {clubAdminPendingCount > 0 && (
              <span style={{
                display: 'inline-flex',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(79, 70, 229, 0.1)',
                color: '#4f46e5',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}>
                🛡️ {clubAdminPendingCount} Club Admin Request{clubAdminPendingCount === 1 ? '' : 's'} Pending
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Student & Club Admin Verification Portal
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '6px 0 0' }}>
            Review pending student registrations, inspect uploaded college ID cards, and verify campus club administrator registrations.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 16px',
            borderRadius: 10,
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh Queue
        </button>
      </div>

      {/* Control Bar: Tabs & Search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          {/* Status Filter */}
          <div style={{ display: 'flex', gap: 6, background: 'var(--bg-secondary)', padding: 4, borderRadius: 10 }}>
            {(['Pending', 'All', 'Verified', 'Rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 7,
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  background: filterStatus === status ? 'var(--card-bg)' : 'transparent',
                  color: filterStatus === status ? 'var(--sky-600)' : 'var(--text-muted)',
                  boxShadow: filterStatus === status ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Role Filter */}
          <div style={{ display: 'flex', gap: 6, background: 'var(--bg-secondary)', padding: 4, borderRadius: 10 }}>
            {(['All', 'student', 'senior', 'club_admin'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 7,
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  background: roleFilter === role ? 'var(--card-bg)' : 'transparent',
                  color: roleFilter === role ? (role === 'club_admin' ? '#4f46e5' : role === 'senior' ? '#0284c7' : 'var(--sky-600)') : 'var(--text-muted)',
                  boxShadow: roleFilter === role ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {role === 'All' ? 'All Roles' : role === 'student' ? 'Students' : role === 'senior' ? `Seniors ${seniorPendingCount > 0 ? `(${seniorPendingCount})` : ''}` : `Club Admins ${clubAdminPendingCount > 0 ? `(${clubAdminPendingCount})` : ''}`}
              </button>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', minWidth: 260 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by name, email, roll no, or club..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: 8,
              border: '1px solid var(--border-color)',
              background: 'var(--card-bg)',
              color: 'var(--text-main)',
              fontSize: '0.82rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Table of Users */}
      <div style={{
        background: 'var(--card-bg)',
        borderRadius: 14,
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <div>Loading verification queue...</div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            <UserCheck size={36} style={{ margin: '0 auto 12px', color: 'var(--sky-500)' }} />
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>Queue is Clear!</div>
            <div style={{ fontSize: '0.84rem', marginTop: 4 }}>No student accounts currently match the "{filterStatus}" filter.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '12px 16px' }}>Student</th>
                  <th style={{ padding: '12px 16px' }}>Roll Number</th>
                  <th style={{ padding: '12px 16px' }}>Detected Batch</th>
                  <th style={{ padding: '12px 16px' }}>Classification</th>
                  <th style={{ padding: '12px 16px' }}>OCR Confidence</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isPending = u.verificationStatus === 'Pending';
                  const isVerified = u.verificationStatus === 'Verified';
                  const isRejected = u.verificationStatus === 'Rejected';

                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      {/* Student details */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {u.name}
                          {u.role === 'club_admin' && (
                            <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: 4, background: '#4f46e5', color: '#fff', fontWeight: 700 }}>
                              Club Admin
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{u.email}</div>
                        {u.role === 'club_admin' ? (
                          <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600, marginTop: 2 }}>
                            🏛️ {u.clubName || 'PICT Student Club'}
                          </div>
                        ) : u.branch ? (
                          <div style={{ fontSize: '0.72rem', color: 'var(--sky-600)', marginTop: 2 }}>{u.branch}</div>
                        ) : null}
                      </td>

                      {/* Roll Number */}
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-main)' }}>
                        {u.role === 'club_admin' ? (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>— (Club Admin)</span>
                        ) : (
                          <code>{u.rollNo || 'Pending'}</code>
                        )}
                      </td>

                      {/* Detected Batch */}
                      <td style={{ padding: '14px 16px' }}>
                        {u.role === 'club_admin' ? (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>N/A (Club Lead)</span>
                        ) : u.batchStartYear && u.batchEndYear ? (
                          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                            {u.batchStartYear} – {u.batchEndYear}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.78rem' }}>
                            Not detected
                          </span>
                        )}
                      </td>

                      {/* Classification */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: u.role === 'club_admin' ? '#4f46e5' : u.role === 'senior' ? '#0284c7' : 'var(--sky-700)' }}>
                          {u.role === 'club_admin' ? `Club Admin (${u.clubName || 'PICT'})` : u.role === 'senior' ? `🧑‍🏫 Senior Mentor (${u.year || '3rd/4th Year'})` : (u.year || u.studentLevel || '1st Year (Fresher)')}
                        </div>
                        {u.bio?.includes('[Requested Level:') && (
                          <div style={{ fontSize: '0.72rem', color: '#ea580c', fontWeight: 600, marginTop: 3 }}>
                            ⚠️ Flagged: {u.bio.split('[Requested Level:')[1]?.replace(']', '')}
                          </div>
                        )}
                      </td>

                      {/* OCR Confidence */}
                      <td style={{ padding: '14px 16px' }}>
                        {u.role === 'club_admin' ? (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No OCR</span>
                        ) : u.ocrConfidenceScore !== undefined ? (
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: u.ocrConfidenceScore >= 0.85 ? '#dcfce7' : u.ocrConfidenceScore >= 0.6 ? '#fef9c3' : '#fee2e2',
                            color: u.ocrConfidenceScore >= 0.85 ? '#15803d' : u.ocrConfidenceScore >= 0.6 ? '#a16207' : '#b91c1c',
                          }}>
                            {Math.round(u.ocrConfidenceScore * 100)}%
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>N/A</span>
                        )}
                      </td>

                      {/* Verification Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 9px',
                          borderRadius: 6,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: isVerified ? '#dcfce7' : isRejected ? '#fee2e2' : '#fef9c3',
                          color: isVerified ? '#15803d' : isRejected ? '#b91c1c' : '#a16207',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}>
                          {isVerified ? <CheckCircle2 size={12} /> : isRejected ? <XCircle size={12} /> : <Clock size={12} />}
                          {u.verificationStatus || 'Pending'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          {u.idCardImageRef ? (
                            <button
                              onClick={() => handleViewIdCard(u)}
                              title="Inspect uploaded ID card photo"
                              style={{
                                padding: '6px 10px',
                                borderRadius: 8,
                                border: '1px solid var(--border-color)',
                                background: 'var(--card-bg)',
                                color: 'var(--text-main)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <Eye size={13} />
                              <span>ID Card</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0 4px' }}>
                              No ID needed
                            </span>
                          )}

                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(u)}
                                disabled={actionInProgress === u.id}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: 8,
                                  border: 'none',
                                  background: '#16a34a',
                                  color: '#fff',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                Approve
                              </button>

                              <button
                                onClick={() => { setAdjustingUser(u); setAdjustedLevel(u.studentLevel || 'Fresher'); }}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: 8,
                                  border: '1px solid var(--border-color)',
                                  background: 'var(--bg-secondary)',
                                  color: 'var(--text-main)',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Edit Year
                              </button>

                              <button
                                onClick={() => handleReject(u)}
                                disabled={actionInProgress === u.id}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: 8,
                                  border: '1px solid #fecaca',
                                  background: '#fff1f2',
                                  color: '#dc2626',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ID Card Image Inspection Modal */}
      <Modal
        isOpen={!!selectedImageUser}
        onClose={() => { setSelectedImageUser(null); setImageUrl(null); }}
        maxWidth={780}
        title={`College ID Card â€” ${selectedImageUser?.name || 'Student'}`}
      >
        <div style={{ padding: '8px 4px 16px', textAlign: 'center' }}>
          {imageLoading ? (
            <div style={{ padding: 48, color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
              <div>Fetching secure ID card image...</div>
            </div>
          ) : imageUrl ? (
            <div>
              <div style={{
                borderRadius: 12,
                overflow: 'hidden',
                background: '#0f172a',
                border: '1px solid var(--border-color)',
                marginBottom: 16,
              }}>
                <img
                  src={imageUrl}
                  alt="Student ID Card"
                  style={{ maxWidth: '100%', maxHeight: 420, objectFit: 'contain', display: 'block', margin: '0 auto' }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 10,
                textAlign: 'left',
                fontSize: '0.8rem',
                background: 'var(--bg-secondary)',
                padding: 12,
                borderRadius: 10,
                marginBottom: 16,
              }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Student Name</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{selectedImageUser?.name}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Roll Number</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{selectedImageUser?.rollNo}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Detected Batch</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                    {selectedImageUser?.batchStartYear ? `${selectedImageUser.batchStartYear}-${selectedImageUser.batchEndYear}` : 'Not Detected'}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Current Level</div>
                  <div style={{ fontWeight: 700, color: 'var(--sky-600)' }}>{selectedImageUser?.year}</div>
                </div>
              </div>

              {selectedImageUser?.verificationStatus === 'Pending' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    onClick={() => {
                      if (selectedImageUser) handleReject(selectedImageUser);
                      setSelectedImageUser(null);
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: '1px solid #fecaca',
                      background: '#fff1f2',
                      color: '#dc2626',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    Reject Account
                  </button>
                  <button
                    onClick={() => {
                      if (selectedImageUser) handleApprove(selectedImageUser);
                      setSelectedImageUser(null);
                    }}
                    style={{
                      padding: '8px 20px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#16a34a',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    Approve Student
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: 32, color: 'var(--text-muted)' }}>
              Could not display ID card image for this student.
            </div>
          )}
        </div>
      </Modal>

      {/* Adjust Year Modal */}
      <Modal
        isOpen={!!adjustingUser}
        onClose={() => setAdjustingUser(null)}
        maxWidth={460}
        title="Adjust Academic Year"
      >
        <div style={{ padding: '8px 4px 16px' }}>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: 14 }}>
            Manually override the academic year for <strong>{adjustingUser?.name}</strong>:
          </p>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
              Select Year of Study:
            </label>
            <select
              value={adjustedLevel}
              onChange={(e) => setAdjustedLevel(e.target.value as StudentLevel)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                background: 'var(--card-bg)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
              }}
            >
              <option value="Fresher">1st Year (Fresher)</option>
              <option value="SecondYear">2nd Year</option>
              <option value="ThirdYear">3rd Year</option>
              <option value="FinalYear">Final Year (4th Year)</option>
              <option value="Alumni">Passed Out Student (Alumni)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              onClick={() => setAdjustingUser(null)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                background: 'var(--card-bg)',
                color: 'var(--text-muted)',
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => adjustingUser && handleApprove(adjustingUser, adjustedLevel)}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--sky-500)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              Save & Verify
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
