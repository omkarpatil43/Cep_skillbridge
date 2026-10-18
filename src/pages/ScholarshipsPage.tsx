import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { DeleteButton } from '../components/DeleteButton';
import {
  Award,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FolderArchive,
  Search,
  DollarSign,
  GraduationCap,
  TrendingUp,
  Clock,
} from 'lucide-react';

export const ScholarshipsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { scholarships, addScholarship, removeScholarship } = useData();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // ─── Max Grant editable stat ───────────────────────────────────────
  const [maxGrant, setMaxGrant] = useState<string>(() => {
    return localStorage.getItem('skillbridge_scholarship_max_grant') || '₹2,00,000+';
  });
  const [isEditMaxGrantOpen, setIsEditMaxGrantOpen] = useState(false);
  const [maxGrantDraft, setMaxGrantDraft] = useState(maxGrant);

  // ─── Add Scholarship form state ────────────────────────────────────
  const [isAddScholarshipOpen, setIsAddScholarshipOpen] = useState(false);
  const [scholarshipTitle, setScholarshipTitle] = useState('');
  const [scholarshipProvider, setScholarshipProvider] = useState('');
  const [scholarshipAmount, setScholarshipAmount] = useState('');
  const [scholarshipDeadline, setScholarshipDeadline] = useState('');
  const [scholarshipApplicationLink, setScholarshipApplicationLink] = useState('');
  const [scholarshipDriveLink, setScholarshipDriveLink] = useState('');
  const [scholarshipDescription, setScholarshipDescription] = useState('');
  const [scholarshipCategory, setScholarshipCategory] = useState<Scholarship['category']>('Merit-Based');

  const canManageScholarships = Boolean(
    currentUser && (
      ['college_admin', 'admin'].includes(currentUser.role) ||
      (currentUser.role === 'senior' && currentUser.verificationStatus === 'Verified')
    )
  );
  const isPendingSenior = Boolean(currentUser && currentUser.role === 'senior' && currentUser.verificationStatus !== 'Verified');

  const categories = [
    'All',
    'Merit-Based',
    'Need-Based / EWS',
    'Women in STEM',
    'Government Schemes',
    'Corporate CSR',
  ];

  const filteredScholarships = scholarships.filter(sch => {
    const matchCat = selectedCategory === 'All' || sch.category === selectedCategory;
    const matchSearch =
      sch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sch.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sch.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAddScholarship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scholarshipTitle.trim() || !scholarshipProvider.trim()) return;

    addScholarship({
      title: scholarshipTitle.trim(),
      provider: scholarshipProvider.trim(),
      category: scholarshipCategory,
      amount: scholarshipAmount.trim() || 'See official portal',
      deadline: scholarshipDeadline.trim() || 'Check official portal',
      eligibleBranches: ['All branches'],
      eligibleYears: ['All years'],
      cgpaCriteria: 'As per official criteria',
      description: scholarshipDescription.trim() || 'Verified scholarship opportunity for eligible students.',
      applicationLink: scholarshipApplicationLink.trim() || '#',
      officialDriveLink: scholarshipDriveLink.trim() || scholarshipApplicationLink.trim() || '#',
      documentsRequired: ['Academic transcripts', 'Identity proof', 'Domicile certificate'],
      status: 'Open',
    });

    // Reset form
    setScholarshipTitle('');
    setScholarshipProvider('');
    setScholarshipAmount('');
    setScholarshipDeadline('');
    setScholarshipApplicationLink('');
    setScholarshipDriveLink('');
    setScholarshipDescription('');
    setScholarshipCategory('Merit-Based');
    setIsAddScholarshipOpen(false);
  };

  // Safe link handler — prevents opening bare '#' or empty hrefs
  const safeHref = (link?: string) => {
    if (!link || link === '#' || link.trim() === '') return undefined;
    return link;
  };

  return (
    <div className="animate-fade-in">
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(245, 158, 11, 0.15) 100%)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        marginBottom: 28,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#fbbf24',
            marginBottom: 6,
          }}>
            <Award size={14} /> Student Financial Aid & Grants
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            Scholarships & <span className="gradient-text">Opportunities</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 680, fontSize: '0.95rem' }}>
            Verified national, state, merit, need-based, and corporate scholarships. Review eligibility, prepare documents from drive folders, and apply before deadlines.
          </p>
        </div>

        {/* Max Grant Stat — editable for admins */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          cursor: canManageScholarships ? 'pointer' : 'default',
          position: 'relative',
        }}
          onClick={() => {
            if (canManageScholarships) {
              setMaxGrantDraft(maxGrant);
              setIsEditMaxGrantOpen(true);
            }
          }}
          title={canManageScholarships ? 'Click to edit Max Grant' : undefined}
        >
          <div style={{ padding: 10, borderRadius: 10, background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>{maxGrant}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max Grant per Student</div>
          </div>
          {canManageScholarships && (
            <div style={{ fontSize: '0.65rem', color: '#fbbf24', position: 'absolute', bottom: 6, right: 10, opacity: 0.7 }}>
              ✏️ click to edit
            </div>
          )}
        </div>

        {canManageScholarships && (
          <button className="btn btn-primary" onClick={() => setIsAddScholarshipOpen(true)}>
            <Award size={16} /> Add scholarship card
          </button>
        )}

        {isPendingSenior && (
          <div style={{
            padding: '8px 14px',
            borderRadius: 10,
            background: 'rgba(2, 132, 199, 0.08)',
            border: '1px solid var(--sky-200)',
            fontSize: '0.8rem',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Clock size={16} color="#0284c7" />
            <span>Senior verification pending admin review to publish scholarships</span>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 20px',
        marginBottom: 24,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                background: selectedCategory === cat ? 'var(--accent-amber)' : 'rgba(255, 255, 255, 0.05)',
                border: selectedCategory === cat ? '1px solid var(--accent-amber)' : '1px solid var(--border-glass)',
                color: selectedCategory === cat ? '#080c14' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: 280 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search scholarship or provider..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Search size={16} style={{ position: 'absolute', right: 12, top: 12, color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* Scholarships Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: 24,
      }}>
        {filteredScholarships.map(sch => (
          <div
            key={sch.id}
            className="glass-panel"
            style={{
              padding: 24,
              borderRadius: 'var(--radius-xl)',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              {/* Header Badges */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="badge badge-amber">{sch.category}</span>
                <span className={`badge ${sch.status === 'Open' ? 'badge-emerald' : sch.status === 'Closing Soon' ? 'badge-rose' : 'badge-indigo'}`}>
                  {sch.status}
                </span>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: 6, lineHeight: 1.35 }}>
                {sch.title}
              </h3>

              <div style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 600, marginBottom: 12 }}>
                Provider: {sch.provider}
              </div>

              <div style={{
                background: 'rgba(8, 12, 20, 0.6)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                marginBottom: 16,
                border: '1px solid var(--border-glass)',
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Grant Value:
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', marginTop: 2 }}>
                  {sch.amount}
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                {sch.description}
              </p>

              {/* Eligibility & Dates */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={14} color="#fb7185" />
                  <span>Deadline: <strong style={{ color: '#fff' }}>{sch.deadline}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <GraduationCap size={14} color="#818cf8" />
                  <span>Criteria: {sch.cgpaCriteria}</span>
                </div>
              </div>

              {/* Required Documents Checklist */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                  📋 Required Documents:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {sch.documentsRequired.map((doc, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#cbd5e1',
                        border: '1px solid var(--border-glass)',
                      }}
                    >
                      <CheckCircle2 size={10} style={{ display: 'inline', marginRight: 4, color: '#34d399' }} />
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 16,
              borderTop: '1px solid var(--border-glass)',
              gap: 10,
            }}>
              {safeHref(sch.officialDriveLink) ? (
                <a
                  href={safeHref(sch.officialDriveLink)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                >
                  <FolderArchive size={14} /> Drive Docs
                </a>
              ) : (
                <span
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, opacity: 0.4, cursor: 'not-allowed' }}
                  title="Drive link not available"
                >
                  <FolderArchive size={14} /> Drive Docs
                </span>
              )}

              {safeHref(sch.applicationLink) ? (
                <a
                  href={safeHref(sch.applicationLink)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                >
                  <ExternalLink size={14} /> Apply Portal
                </a>
              ) : (
                <span
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, opacity: 0.4, cursor: 'not-allowed' }}
                  title="Application link not available"
                >
                  <ExternalLink size={14} /> Apply Portal
                </span>
              )}

              {canManageScholarships && (
                <DeleteButton label="Remove" onDelete={() => removeScholarship(sch.id)} />
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredScholarships.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Award size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>No scholarships found for your filters. Try a different category or search term.</p>
        </div>
      )}

      {/* Edit Max Grant Modal */}
      <Modal
        isOpen={isEditMaxGrantOpen}
        onClose={() => setIsEditMaxGrantOpen(false)}
        title="Edit Max Grant Per Student"
        subtitle="Update the highest possible grant amount displayed in the header banner."
      >
        <form onSubmit={e => {
          e.preventDefault();
          setMaxGrant(maxGrantDraft.trim() || '₹2,00,000+');
          localStorage.setItem('skillbridge_scholarship_max_grant', maxGrantDraft.trim() || '₹2,00,000+');
          setIsEditMaxGrantOpen(false);
        }}>
          <div className="form-group">
            <label className="form-label">Max Grant Per Student</label>
            <input
              className="form-control"
              required
              placeholder="e.g. ₹2,00,000+  or  Up to ₹75,000"
              value={maxGrantDraft}
              onChange={e => setMaxGrantDraft(e.target.value)}
            />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
              This figure is displayed in the header banner to highlight the highest available grant.
            </div>
          </div>
          <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: 8 }}>
            <TrendingUp size={16} /> Save Max Grant
          </button>
        </form>
      </Modal>

      {/* Add Scholarship Modal */}
      <Modal
        isOpen={isAddScholarshipOpen}
        onClose={() => setIsAddScholarshipOpen(false)}
        title="Add Scholarship Opportunity"
        subtitle="Give students the details they need to apply with confidence."
      >
        <form onSubmit={handleAddScholarship}>
          <div className="form-group">
            <label className="form-label">Scholarship Title *</label>
            <input
              className="form-control"
              required
              placeholder="e.g. PM YASASVI Scholarship 2025"
              value={scholarshipTitle}
              onChange={e => setScholarshipTitle(e.target.value)}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Provider / Organisation *</label>
              <input
                className="form-control"
                required
                placeholder="e.g. Ministry of Education"
                value={scholarshipProvider}
                onChange={e => setScholarshipProvider(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-control"
                value={scholarshipCategory}
                onChange={e => setScholarshipCategory(e.target.value as Scholarship['category'])}
              >
                <option value="Merit-Based">Merit-Based</option>
                <option value="Need-Based / EWS">Need-Based / EWS</option>
                <option value="Women in STEM">Women in STEM</option>
                <option value="Government Schemes">Government Schemes</option>
                <option value="Corporate CSR">Corporate CSR</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Grant Amount</label>
              <input
                className="form-control"
                placeholder="e.g. Up to ₹50,000 per year"
                value={scholarshipAmount}
                onChange={e => setScholarshipAmount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Application Deadline</label>
              <input
                className="form-control"
                placeholder="e.g. 31 December 2025"
                value={scholarshipDeadline}
                onChange={e => setScholarshipDeadline(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Official Application Portal Link (URL)</label>
            <input
              className="form-control"
              type="url"
              placeholder="https://scholarships.gov.in/..."
              value={scholarshipApplicationLink}
              onChange={e => setScholarshipApplicationLink(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Google Drive Docs / Resources Link (URL)</label>
            <input
              className="form-control"
              type="url"
              placeholder="https://drive.google.com/drive/folders/..."
              value={scholarshipDriveLink}
              onChange={e => setScholarshipDriveLink(e.target.value)}
            />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Optional: Provide a shared Google Drive folder with required documents, filled forms, or guidelines.
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Brief description of eligibility criteria, scholarship purpose, and important notes..."
              value={scholarshipDescription}
              onChange={e => setScholarshipDescription(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: 8 }}>
            <Award size={16} /> Publish Scholarship Card
          </button>
        </form>
      </Modal>
    </div>
  );
};

// ─── Type alias needed in this file ─────────────────────────────────────────
type Scholarship = import('../types').Scholarship;
