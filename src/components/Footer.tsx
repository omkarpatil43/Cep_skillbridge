import React from 'react';
import { GraduationCap, Heart, ShieldAlert, PhoneCall, Globe, Mail, Sparkles } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-glass)',
      padding: '50px 24px 30px 24px',
      color: 'var(--text-secondary)',
      fontSize: '0.875rem',
      position: 'relative',
      zIndex: 10,
    }}>
      <div style={{
        maxWidth: 1380,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 36,
        marginBottom: 40,
      }}>
        {/* Brand & Mission */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}>
              <GraduationCap size={20} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
              Skill<span style={{ color: 'var(--accent-primary)' }}>Bridge</span>
            </span>
          </div>
          <p style={{ lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: 16 }}>
            The all-in-one academic repository, club events hub, peer mentorship, and placement acceleration ecosystem for university students.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: 'rgba(79, 70, 229, 0.08)', color: 'var(--accent-primary)', fontSize: '0.78rem', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
            <Sparkles size={12} /> Campus Knowledge Hub
          </div>
        </div>

        {/* Quick Nav */}
        <div>
          <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 16, fontSize: '0.95rem' }}>
            Academic & Skills
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>
              <button onClick={() => setActiveTab('branch')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', font: 'inherit' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                Curated PYQs & Notes
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('branch')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', font: 'inherit' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                Google Drive Lecture Folders
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('branch')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', font: 'inherit' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                Web Dev & AI Roadmaps
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('ai-chatbot')} style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', textAlign: 'left', font: 'inherit', fontWeight: 600 }}>
                AI Academic Tutor
              </button>
            </li>
          </ul>
        </div>

        {/* Campus & Community */}
        <div>
          <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 16, fontSize: '0.95rem' }}>
            Campus Life & Career
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>
              <button onClick={() => setActiveTab('clubs')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', font: 'inherit' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                College Clubs & Hackathons
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('doubts')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', font: 'inherit' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                Senior-Fresher Doubt Chat
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('placement')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', font: 'inherit' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                Placement & Interview Archives
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('scholarships')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', font: 'inherit' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                National & CSR Scholarships
              </button>
            </li>
          </ul>
        </div>

        {/* Campus Support & Safety */}
        <div>
          <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 16, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldAlert size={16} color="#e11d48" /> Student Helplines
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#be123c', fontWeight: 600 }}>
              <PhoneCall size={14} /> Anti-Ragging Cell: 1800-180-5522
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
              <Mail size={14} /> Dean Academics: academics@pict.edu
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
              <Globe size={14} /> Training & Placement Office (TPO)
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{
        maxWidth: 1380,
        margin: '0 auto',
        paddingTop: 24,
        borderTop: '1px solid var(--border-glass)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div>
          © 2026 SkillBridge. Built with <Heart size={12} color="#e11d48" style={{ display: 'inline', verticalAlign: 'middle' }} /> for University Students & Seniors.
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <span>Academic Portal v2.4</span>
          <span>•</span>
          <span>Zero-Backlog Initiative</span>
          <span>•</span>
          <span>Open Knowledge Hub</span>
        </div>
      </div>
    </footer>
  );
};
