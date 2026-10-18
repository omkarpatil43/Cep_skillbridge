import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Modal } from '../components/Modal';
import { DeleteButton } from '../components/DeleteButton';
import { Club, ClubEvent } from '../types';
import {
  Users,
  Calendar,
  MapPin,
  Mail,
  Globe,
  PlusCircle,
  CheckCircle2,
  Search,
  ArrowUpRight,
  ShieldCheck,
  UserCheck,
  Share2,
  Phone,
  Building2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ClubsPageProps {
  onToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ClubsPage: React.FC<ClubsPageProps> = ({ onToast }) => {
  const { currentUser } = useAuth();
  const {
    clubs,
    clubRegistrations,
    addClub,
    updateClub,
    removeClub,
    addClubEvent,
    removeClubEvent,
    registerForClub,
    acceptClubRegistration,
    rejectClubRegistration,
    registerForEvent,
  } = useData();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'clubs' | 'events' | 'college_admin'>('clubs');

  // Add Club Form State
  const [isAddClubModalOpen, setIsAddClubModalOpen] = useState(false);
  const [clubNameInput, setClubNameInput] = useState('');
  const [clubCategoryInput, setClubCategoryInput] = useState<Club['category']>('Technical');
  const [clubTaglineInput, setClubTaglineInput] = useState('');
  const [clubDescInput, setClubDescInput] = useState('');
  const [clubLogoInput, setClubLogoInput] = useState('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80');
  const [clubBannerInput, setClubBannerInput] = useState('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80');
  const [clubLeadNameInput, setClubLeadNameInput] = useState('');
  const [clubLeadRoleInput, setClubLeadRoleInput] = useState('Club Lead / President');
  const [clubLeadEmailInput, setClubLeadEmailInput] = useState('');
  const [clubLeadPhoneInput, setClubLeadPhoneInput] = useState('');
  const [clubRecruitmentOpenInput, setClubRecruitmentOpenInput] = useState(true);

  // Edit Club Form State
  const [isEditClubModalOpen, setIsEditClubModalOpen] = useState(false);
  const [editingClubId, setEditingClubId] = useState<string | null>(null);

  // Selected Club for Details / Apply Modal
  const [selectedClubForApply, setSelectedClubForApply] = useState<Club | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [interestReason, setInterestReason] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentSkills, setStudentSkills] = useState('');
  const [studentExperience, setStudentExperience] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');

  const [selectedEventForRsvp, setSelectedEventForRsvp] = useState<(ClubEvent & { clubName: string; clubLogo: string }) | null>(null);
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false);
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvpBranch, setRsvpBranch] = useState('');
  const [rsvpYear, setRsvpYear] = useState('');
  const [rsvpNotes, setRsvpNotes] = useState('');

  // Admin New Event Modal
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [selectedClubIdForEvent, setSelectedClubIdForEvent] = useState(clubs[0]?.id || '');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventBanner, setEventBanner] = useState('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80');
  const [eventRegLink, setEventRegLink] = useState('');
  const [eventTags, setEventTags] = useState('');

  // Admin Club Filter in Admin Section
  const [adminClubFilter, setAdminClubFilter] = useState<'all' | 'my'>('all');

  // Only club_admin or college_admin (not seniors/students) can manage
  const isClubAdmin = currentUser?.role === 'club_admin' || currentUser?.role === 'college_admin' || (currentUser?.role as any) === 'admin';
  const isInstituteAdmin = currentUser?.role === 'college_admin' || (currentUser?.role as any) === 'admin';
  const clubIdentity = currentUser?.clubName?.toLowerCase().match(/[a-z0-9]+/)?.[0];
  const managedClub = currentUser?.clubName
    ? clubs.find(club => club.name.toLowerCase() === currentUser.clubName?.toLowerCase() || (clubIdentity && club.name.toLowerCase().includes(clubIdentity)))
    : undefined;
  const managedClubId = isInstituteAdmin ? undefined : managedClub?.id;

  const visibleTab = !isClubAdmin && activeTab === 'college_admin'
    ? 'clubs'
    : activeTab;

  const categories = ['All', 'Technical', 'Entrepreneurship', 'Cultural', 'Sports', 'Social & Community'];

  const filteredClubs = clubs.filter(club => {
    const matchCategory = selectedCategory === 'All' || club.category === selectedCategory;
    const matchSearch =
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.leadName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // In admin section: filter based on adminClubFilter
  const visibleAdminClubs = adminClubFilter === 'my' && managedClubId
    ? clubs.filter(club => club.id === managedClubId)
    : clubs;

  const visibleEvents = clubs;
  const visibleRegistrations = isInstituteAdmin || adminClubFilter === 'all'
    ? clubRegistrations
    : clubRegistrations.filter(reg => reg.clubId === managedClubId);
  const allEvents = visibleEvents.flatMap(c => c.events.map(ev => ({ ...ev, clubName: c.name, clubLogo: c.logo })));

  // Handle Apply to Club Submit
  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClubForApply || !currentUser) {
      onToast('Login Required', 'Please sign in with your Roll No to apply.', 'error');
      return;
    }
    if (!interestReason.trim()) {
      onToast('Missing Reason', 'Please explain why you want to join this club.', 'error');
      return;
    }

    registerForClub({
      clubId: selectedClubForApply.id,
      clubName: selectedClubForApply.name,
      studentName: currentUser.name,
      rollNo: currentUser.rollNo,
      email: currentUser.email,
      branch: currentUser.branch,
      year: currentUser.year,
      interestReason,
      phone: studentPhone,
      skills: studentSkills,
      experience: studentExperience,
      portfolioLink,
    });

    confetti({ particleCount: 70, spread: 70 });
    onToast('Application Submitted!', `Your registration for ${selectedClubForApply.name} has been sent to the club lead.`, 'success');
    setIsApplyModalOpen(false);
    setInterestReason('');
    setStudentPhone('');
    setStudentSkills('');
    setStudentExperience('');
    setPortfolioLink('');
  };

  const handleEventRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventForRsvp || !currentUser) return;
    registerForEvent(selectedEventForRsvp.id);
    confetti({ particleCount: 50, spread: 60 });
    onToast('Registration Confirmed!', `Your registration for ${selectedEventForRsvp.title} is complete.`, 'success');
    setIsRsvpModalOpen(false);
    setRsvpPhone(''); setRsvpBranch(''); setRsvpYear(''); setRsvpNotes('');
  };

  // Handle Create Event
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDate || !eventVenue) {
      onToast('Incomplete Event', 'Please fill in Title, Date, and Venue.', 'error');
      return;
    }

    const eventClubId = isInstituteAdmin ? selectedClubIdForEvent : managedClubId;
    if (!eventClubId) {
      onToast('Club Required', 'This club admin is not linked to a club profile yet.', 'error');
      return;
    }

    addClubEvent(eventClubId, {
      title: eventTitle,
      date: eventDate,
      time: eventTime || '10:00 AM IST',
      venue: eventVenue,
      description: eventDesc || 'Join us for this exciting campus workshop/event.',
      bannerImage: eventBanner,
      registrationLink: eventRegLink || undefined,
      registrationOpen: true,
      tags: eventTags ? eventTags.split(',').map(t => t.trim()) : ['Campus Event'],
    });

    confetti({ particleCount: 60, spread: 60 });
    onToast('Event Published!', 'The event is now live on the campus calendar.', 'success');
    setIsAddEventModalOpen(false);

    // Reset
    setEventTitle('');
    setEventDate('');
    setEventTime('');
    setEventVenue('');
    setEventDesc('');
    setEventTags('');
  };

  const handleCreateClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubNameInput.trim()) {
      onToast('Name Required', 'Please enter club name.', 'error');
      return;
    }

    addClub({
      name: clubNameInput.trim(),
      category: clubCategoryInput,
      tagline: clubTaglineInput.trim() || 'Official Student Guild at PICT',
      description: clubDescInput.trim() || 'Active campus club organizing technical workshops and competitive events.',
      logo: clubLogoInput.trim() || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80',
      banner: clubBannerInput.trim() || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
      leadName: clubLeadNameInput.trim() || currentUser?.name || 'Club Lead',
      leadRole: clubLeadRoleInput.trim() || 'Club President',
      leadEmail: clubLeadEmailInput.trim() || currentUser?.email || 'club@pict.edu',
      leadPhone: clubLeadPhoneInput.trim() || '+91 9876543210',
      recruitmentOpen: clubRecruitmentOpenInput,
      socialLinks: { instagram: '#', linkedin: '#', github: '#' },
    });

    confetti({ particleCount: 60, spread: 60 });
    onToast('Club Created!', `New campus club "${clubNameInput}" is live.`, 'success');
    setIsAddClubModalOpen(false);
    setClubNameInput('');
    setClubTaglineInput('');
    setClubDescInput('');
    setClubLeadNameInput('');
    setClubLeadEmailInput('');
    setClubLeadPhoneInput('');
  };

  const handleOpenEditClub = (club: Club) => {
    setEditingClubId(club.id);
    setClubNameInput(club.name);
    setClubCategoryInput(club.category);
    setClubTaglineInput(club.tagline || '');
    setClubDescInput(club.description || '');
    setClubLogoInput(club.logo || '');
    setClubBannerInput(club.banner || '');
    setClubLeadNameInput(club.leadName || '');
    setClubLeadRoleInput(club.leadRole || '');
    setClubLeadEmailInput(club.leadEmail || '');
    setClubLeadPhoneInput(club.leadPhone || '');
    setClubRecruitmentOpenInput(club.recruitmentOpen ?? true);
    setIsEditClubModalOpen(true);
  };

  const handleSaveEditClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClubId || !clubNameInput.trim()) return;

    updateClub(editingClubId, {
      name: clubNameInput.trim(),
      category: clubCategoryInput,
      tagline: clubTaglineInput.trim(),
      description: clubDescInput.trim(),
      logo: clubLogoInput.trim(),
      banner: clubBannerInput.trim(),
      leadName: clubLeadNameInput.trim(),
      leadRole: clubLeadRoleInput.trim(),
      leadEmail: clubLeadEmailInput.trim(),
      leadPhone: clubLeadPhoneInput.trim(),
      recruitmentOpen: clubRecruitmentOpenInput,
    });

    confetti({ particleCount: 50, spread: 50 });
    onToast('Club Updated!', `Changes saved for ${clubNameInput}.`, 'success');
    setIsEditClubModalOpen(false);
    setEditingClubId(null);
  };

  return (
    <div className="animate-fade-in">
      {/* Header Banner */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        marginBottom: 28,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--accent-cyan)',
            marginBottom: 6,
          }}>
            <Users size={14} /> Student Societies & Guilds
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            Campus <span className="gradient-text-cyan">Clubs & Events</span> Hub
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 680, fontSize: '0.95rem' }}>
            Join premier technical guilds, robotics labs, cultural societies & startup incubators. Connect with club leads, RSVP for hackathons, or recruit new members.
          </p>
        </div>

        {/* Club Admin Controls Action */}
        <div>
          {isClubAdmin ? (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => setIsAddClubModalOpen(true)}
                className="btn btn-primary btn-lg"
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <PlusCircle size={20} /> Add New Club (+)
              </button>
              <button
                onClick={() => setIsAddEventModalOpen(true)}
                className="btn btn-glow-cyan btn-lg"
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <PlusCircle size={20} /> Host New Event (+)
              </button>
            </div>
          ) : (
            <div style={{
              background: 'rgba(2, 132, 199, 0.08)',
              border: '1px solid rgba(2, 132, 199, 0.25)',
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <ShieldCheck size={18} color="#0284c7" />
              <span>Are you a club lead? Sign in with a Club Admin role to post events.</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Tabs (Clubs Directory vs Events Calendar vs Admin Portal) */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 24,
        borderBottom: '1px solid var(--border-glass)',
        paddingBottom: 14,
        flexWrap: 'wrap',
      }}>
        <button
          onClick={() => setActiveTab('clubs')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'clubs' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
            border: `1px solid ${activeTab === 'clubs' ? 'var(--accent-primary)' : 'var(--border-glass)'}`,
            color: activeTab === 'clubs' ? '#fff' : 'var(--text-primary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Users size={18} /> Active Clubs Directory ({clubs.length})
        </button>

        <button
          onClick={() => setActiveTab('events')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'events' ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
            border: `1px solid ${activeTab === 'events' ? 'var(--accent-cyan)' : 'var(--border-glass)'}`,
            color: activeTab === 'events' ? '#fff' : 'var(--text-primary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Calendar size={18} /> Upcoming Hackathons & Events ({allEvents.length})
        </button>

        {isClubAdmin && (
          <button
            onClick={() => setActiveTab('college_admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              background: activeTab === 'college_admin' ? 'var(--gradient-primary)' : 'var(--bg-secondary)',
              border: `1px solid ${activeTab === 'college_admin' ? 'var(--accent-primary)' : 'var(--border-glass)'}`,
              color: activeTab === 'college_admin' ? '#fff' : 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <ShieldCheck size={18} /> Club Admin Portal ({clubRegistrations.length} Applications)
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: CLUBS DIRECTORY */}
      {/* ========================================================================= */}
      {visibleTab === 'clubs' && (
        <div className="animate-fade-in">
          {/* Filters Bar */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            marginBottom: 24,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    background: selectedCategory === cat ? 'var(--accent-cyan)' : 'var(--bg-tertiary)',
                    border: selectedCategory === cat ? '1px solid var(--accent-cyan)' : '1px solid var(--border-glass)',
                    color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
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
                placeholder="Search club or president..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search size={16} style={{ position: 'absolute', right: 12, top: 12, color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Clubs Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: 24,
          }}>
            {filteredClubs.map(club => (
              <div
                key={club.id}
                className="glass-panel"
                style={{
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-glass)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div>
                  {/* Banner Image */}
                  <div style={{ height: 140, position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={club.banner}
                      alt={club.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                    }}>
                      <span className={`badge ${club.recruitmentOpen ? 'badge-emerald' : 'badge-amber'}`}>
                        {club.recruitmentOpen ? 'Recruitment Open' : 'Members Only'}
                      </span>
                    </div>
                  </div>

                  {/* Club Details */}
                  <div style={{ padding: 24, position: 'relative', marginTop: -32 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 14 }}>
                      <img
                        src={club.logo}
                        alt={club.name}
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 'var(--radius-md)',
                          objectFit: 'cover',
                          border: '3px solid var(--bg-secondary)',
                          boxShadow: 'var(--shadow-md)',
                          background: 'var(--bg-tertiary)',
                        }}
                      />
                      <div>
                        <span className="badge badge-indigo" style={{ marginBottom: 4 }}>
                          {club.category}
                        </span>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                          {club.name}
                        </h3>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: 10 }}>
                      "{club.tagline}"
                    </p>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                      {club.description}
                    </p>

                    {/* Lead Contacts */}
                    <div style={{
                      background: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 14px',
                      marginBottom: 16,
                      border: '1px solid var(--border-glass)',
                    }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                        Club Leadership & Contact:
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {club.leadName} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.75rem' }}>({club.leadRole})</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Mail size={12} color="#4f46e5" /> {club.leadEmail}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Phone size={12} color="#059669" /> {club.leadPhone}
                        </span>
                      </div>
                    </div>

                    {/* Social Links & Member Count */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <Users size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> {club.memberCount} active members
                      </span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {club.socialLinks.website && (
                          <a href={club.socialLinks.website} target="_blank" rel="noreferrer" style={{ color: '#0284c7' }} title="Club Portal">
                            <Globe size={16} />
                          </a>
                        )}
                        <a href={`mailto:${club.leadEmail}`} style={{ color: '#4f46e5' }} title="Contact Lead">
                          <Share2 size={16} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Apply / Edit / Delete Buttons */}
                <div style={{ padding: '0 24px 24px 24px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {/* Students and non-logged-in can apply */}
                  {(!isClubAdmin || currentUser?.role === 'student') && (
                    <button
                      onClick={() => {
                        setSelectedClubForApply(club);
                        setIsApplyModalOpen(true);
                      }}
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                    >
                      Apply / Join {club.name.split(' ')[0]}
                    </button>
                  )}

                  {/* Club admin and college admin can edit club */}
                  {isClubAdmin && (
                    <button
                      onClick={() => handleOpenEditClub(club)}
                      className="btn btn-secondary"
                      style={{ padding: '8px 14px', fontSize: '0.82rem', fontWeight: 600 }}
                      title="Edit Club Profile & Details"
                    >
                      ✏️ Edit Club
                    </button>
                  )}

                  {/* Club admin and college admin can delete club */}
                  {isClubAdmin && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to permanently delete "${club.name}"? This action will remove all events and registrations.`)) {
                          removeClub(club.id);
                          onToast('Club Deleted', `"${club.name}" has been removed.`, 'info');
                        }
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '8px 14px', fontSize: '0.82rem', fontWeight: 600, color: '#ef4444', borderColor: '#ef4444' }}
                      title="Delete Club Permanently"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: EVENTS & HACKATHONS */}
      {/* ========================================================================= */}
      {visibleTab === 'events' && (
        <div className="animate-fade-in">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: 24,
          }}>
            {allEvents.map(event => (
              <div
                key={event.id}
                className="glass-panel"
                style={{
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div>
                  <div style={{ height: 160, position: 'relative' }}>
                    <img
                      src={event.bannerImage}
                      alt={event.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: 12,
                      left: 12,
                      background: 'rgba(255, 255, 255, 0.92)',
                      backdropFilter: 'blur(8px)',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--accent-cyan)',
                      border: '1px solid var(--border-glass)',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      Organized by {event.clubName}
                    </div>
                  </div>

                  <div style={{ padding: 22 }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.3 }}>
                      {event.title}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Calendar size={15} color="#4f46e5" /> {event.date} â€¢ {event.time}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MapPin size={15} color="#e11d48" /> {event.venue}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                      {event.description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                      {event.tags.map((t, i) => (
                        <span key={i} className="badge badge-indigo">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '16px 22px',
                  borderTop: '1px solid var(--border-glass)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Users size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> {event.registeredCount} students registered
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isClubAdmin && (
                      <DeleteButton
                        label="Remove Event"
                        onDelete={() => {
                          removeClubEvent(event.id);
                          onToast('Event Removed', `${event.title} is no longer listed.`, 'info');
                        }}
                      />
                    )}
                    {!isClubAdmin && <button
                      onClick={() => {
                        if (!currentUser) {
                          onToast('Login Required', 'Please sign in before registering for an event.', 'error');
                          return;
                        }
                        setSelectedEventForRsvp(event);
                        setRsvpBranch(currentUser.branch);
                        setRsvpYear(currentUser.year);
                        setIsRsvpModalOpen(true);
                      }}
                      className="btn btn-glow-cyan btn-sm"
                    >
                      <CheckCircle2 size={14} /> Register for Event
                    </button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: CLUB ADMIN PANEL */}
      {/* ========================================================================= */}
      {visibleTab === 'college_admin' && isClubAdmin && (
        <div className="animate-fade-in">
          {/* Section 1: Campus Clubs Management */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-xl)',
            padding: 28,
            marginBottom: 24,
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Campus Clubs & Guilds Management
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Display, edit, and manage all campus clubs, leadership contacts, and recruitment statuses.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {/* Option to toggle between All Clubs vs My Managed Club */}
                <div style={{
                  display: 'inline-flex',
                  background: 'var(--bg-tertiary)',
                  padding: 3,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-glass)'
                }}>
                  <button
                    onClick={() => setAdminClubFilter('all')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      background: adminClubFilter === 'all' ? 'var(--accent-primary)' : 'transparent',
                      color: adminClubFilter === 'all' ? '#fff' : 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Display All Clubs ({clubs.length})
                  </button>
                  <button
                    onClick={() => setAdminClubFilter('my')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      background: adminClubFilter === 'my' ? 'var(--accent-primary)' : 'transparent',
                      color: adminClubFilter === 'my' ? '#fff' : 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Display My Club {managedClub ? `(${managedClub.name.split(' ')[0]})` : ''}
                  </button>
                </div>

                <button
                  onClick={() => setIsAddClubModalOpen(true)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <PlusCircle size={15} /> Add New Club
                </button>
                <button
                  onClick={() => setIsAddEventModalOpen(true)}
                  className="btn btn-glow-cyan btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <PlusCircle size={15} /> Host Event
                </button>
              </div>
            </div>

            {/* Grid of Clubs in the Admin Section */}
            {visibleAdminClubs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
                <Building2 size={36} style={{ marginBottom: 8, opacity: 0.5 }} />
                <p>No clubs found matching current filter.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: 18,
              }}>
                {visibleAdminClubs.map(club => (
                  <div
                    key={club.id}
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                  >
                    <div style={{ padding: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <img
                          src={club.logo}
                          alt={club.name}
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 'var(--radius-md)',
                            objectFit: 'cover',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-glass)',
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>{club.category}</span>
                            <span className={`badge ${club.recruitmentOpen ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.7rem' }}>
                              {club.recruitmentOpen ? 'Recruitment Open' : 'Closed'}
                            </span>
                          </div>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {club.name}
                          </h4>
                        </div>
                      </div>

                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {club.description || club.tagline}
                      </p>

                      <div style={{
                        background: 'var(--bg-secondary)',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                      }}>
                        <div><strong>Lead:</strong> {club.leadName} ({club.leadRole})</div>
                        <div><strong>Email:</strong> {club.leadEmail} • <strong>Phone:</strong> {club.leadPhone}</div>
                        <div><strong>Members:</strong> {club.memberCount} • <strong>Events:</strong> {club.events?.length || 0}</div>
                      </div>
                    </div>

                    <div style={{
                      padding: '12px 18px',
                      borderTop: '1px solid var(--border-glass)',
                      background: 'rgba(0,0,0,0.02)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => handleOpenEditClub(club)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}
                          title="Edit Club Details"
                        >
                          ✏️ Edit Club
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to permanently delete "${club.name}"? This action will remove all events and registrations.`)) {
                              removeClub(club.id);
                              onToast('Club Deleted', `"${club.name}" has been removed.`, 'info');
                            }
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.78rem', color: '#ef4444', borderColor: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}
                          title="Delete Club"
                        >
                          🗑️ Delete
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedClubIdForEvent(club.id);
                          setIsAddEventModalOpen(true);
                        }}
                        className="btn btn-glow-cyan btn-sm"
                        style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                      >
                        + Event
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Student Recruitment Applications */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-xl)',
            padding: 28,
            marginBottom: 24,
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Student Recruitment Applications
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Review freshers applying to join your college club.
                </p>
              </div>

              <button
                onClick={() => setIsAddEventModalOpen(true)}
                className="btn btn-glow-cyan btn-sm"
              >
                <PlusCircle size={15} /> Publish New Club Event
              </button>
            </div>

            {clubRegistrations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <UserCheck size={36} style={{ marginBottom: 8 }} />
                <p>No new student applications currently pending.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {visibleRegistrations.map(reg => (
                  <div
                    key={reg.id}
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--radius-md)',
                      padding: 16,
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 14,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>{reg.studentName}</strong>
                        <span className="badge badge-cyan">{reg.rollNo}</span>
                        <span className="badge badge-indigo">{reg.clubName}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {reg.branch} â€¢ {reg.year} â€¢ {reg.email}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        Phone: {reg.phone} â€¢ Skills: {reg.skills} â€¢ Experience: {reg.experience}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 6, fontStyle: 'italic' }}>
                        "{reg.interestReason}"
                      </p>
                      {reg.portfolioLink && (
                        <a href={reg.portfolioLink} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                          Portfolio / GitHub <ArrowUpRight size={13} />
                        </a>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      {reg.status === 'pending' ? <>
                        <button onClick={() => { acceptClubRegistration(reg.id); onToast('Application Accepted', `${reg.studentName} added to ${reg.clubName} roster!`, 'success'); confetti({ particleCount: 40 }); }} className="btn btn-primary btn-sm">Accept</button>
                        <button onClick={() => { rejectClubRegistration(reg.id); onToast('Application Reviewed', `${reg.studentName}'s application was marked for review.`, 'info'); }} className="btn btn-secondary btn-sm">Reject</button>
                      </> : <span className="badge">{reg.status === 'accepted' ? 'Accepted' : 'Reviewed'}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: APPLY TO CLUB */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title={`Apply to ${selectedClubForApply?.name || 'Club'}`}
        subtitle="Submit your details and interest to the club core team"
      >
        <form onSubmit={handleApplySubmit}>
          <div style={{
            background: 'rgba(79, 70, 229, 0.08)',
            border: '1px solid rgba(79, 70, 229, 0.25)',
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            fontSize: '0.85rem',
            color: 'var(--accent-primary)',
          }}>
            Applying as: <strong>{currentUser?.name || 'Student'}</strong> (Roll: {currentUser?.rollNo || 'Pending'}) â€¢ {currentUser?.branch}
          </div>

          <div className="form-group">
            <label className="form-label">Phone number</label>
            <input type="tel" className="form-control" placeholder="Your active phone number" value={studentPhone} onChange={e => setStudentPhone(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Skills and tools</label>
            <input type="text" className="form-control" placeholder="e.g. React, Python, Figma, public speaking" value={studentSkills} onChange={e => setStudentSkills(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Relevant experience</label>
            <textarea className="form-control" placeholder="Projects, competitions, volunteering, or other relevant experience" value={studentExperience} onChange={e => setStudentExperience(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Why do you want to join {selectedClubForApply?.name}?</label>
            <textarea
              className="form-control"
              placeholder="Tell the club lead about your skills, past projects, or what you want to learn..."
              value={interestReason}
              onChange={e => setInterestReason(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Portfolio / GitHub / LinkedIn Link (Optional)</label>
            <input
              type="url"
              className="form-control"
              placeholder="https://github.com/yourhandle"
              value={portfolioLink}
              onChange={e => setPortfolioLink(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }}>
            Submit Club Application
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={isRsvpModalOpen}
        onClose={() => setIsRsvpModalOpen(false)}
        title={`Register for ${selectedEventForRsvp?.title || 'Event'}`}
        subtitle="Share the details the event team needs to confirm your place."
      >
        <form onSubmit={handleEventRegistration}>
          <div className="info-banner" style={{ marginBottom: 16 }}>
            Registering as <strong>{currentUser?.name}</strong> ({currentUser?.rollNo}, {currentUser?.email})
          </div>
          <div className="form-group"><label className="form-label">Phone number</label><input type="tel" className="form-control" required value={rsvpPhone} onChange={e => setRsvpPhone(e.target.value)} /></div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Branch</label><input className="form-control" required value={rsvpBranch} onChange={e => setRsvpBranch(e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Year</label><input className="form-control" required value={rsvpYear} onChange={e => setRsvpYear(e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Requirements or questions for the organisers</label><textarea className="form-control" required placeholder="Mention team details, accessibility needs, or questions" value={rsvpNotes} onChange={e => setRsvpNotes(e.target.value)} /></div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}><CheckCircle2 size={18} /> Confirm event registration</button>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: PUBLISH NEW CLUB EVENT */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAddEventModalOpen}
        onClose={() => setIsAddEventModalOpen(false)}
        title="Publish New Club Event / Hackathon"
        subtitle="Create an announcement for students to RSVP and attend"
      >
        <form onSubmit={handleCreateEvent}>
          <div className="form-group">
            <label className="form-label">Host Club</label>
            <select
              className="form-control"
              value={selectedClubIdForEvent}
              onChange={e => setSelectedClubIdForEvent(e.target.value)}
            >
              {(isInstituteAdmin ? clubs : managedClub ? [managedClub] : []).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Event / Hackathon Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. AI Prompt Engineering & GenAI Hackathon 2026"
              value={eventTitle}
              onChange={e => setEventTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Event Date</label>
              <input
                type="date"
                className="form-control"
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Time</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 05:00 PM IST"
                value={eventTime}
                onChange={e => setEventTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Venue / Hall</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Seminar Hall 3 / CS Lab 2"
              value={eventVenue}
              onChange={e => setEventVenue(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Event Description & Perks</label>
            <textarea
              className="form-control"
              placeholder="Describe event agenda, prizes, refreshments, and prerequisites..."
              value={eventDesc}
              onChange={e => setEventDesc(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Banner Image URL</label>
            <input
              type="url"
              className="form-control"
              placeholder="https://images.unsplash.com/..."
              value={eventBanner}
              onChange={e => setEventBanner(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">External Registration Link (Optional)</label>
            <input
              type="url"
              className="form-control"
              placeholder="e.g. Google Form or Unstop link"
              value={eventRegLink}
              onChange={e => setEventRegLink(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Hackathon, AI, Cash Prize, Freshers"
              value={eventTags}
              onChange={e => setEventTags(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-glow-cyan btn-lg" style={{ width: '100%', marginTop: 8 }}>
            Broadcast Event to Campus
          </button>
        </form>
      </Modal>

      {/* Modal 4: Add New Club */}
      <Modal
        isOpen={isAddClubModalOpen}
        onClose={() => setIsAddClubModalOpen(false)}
        title="Add New Campus Student Club / Guild"
        subtitle="Register a new technical, cultural, entrepreneurship, or sports club."
      >
        <form onSubmit={handleCreateClub}>
          <div className="form-group">
            <label className="form-label">Club Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. IEEE Student Branch / Robotics Guild"
              value={clubNameInput}
              onChange={e => setClubNameInput(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-control"
                value={clubCategoryInput}
                onChange={e => setClubCategoryInput(e.target.value as Club['category'])}
              >
                <option value="Technical">Technical</option>
                <option value="Entrepreneurship">Entrepreneurship</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Social & Community">Social & Community</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tagline</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Innovate & Build for tomorrow"
                value={clubTaglineInput}
                onChange={e => setClubTaglineInput(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              placeholder="Overview of club activities, workshops, hackathons, and domain focus..."
              value={clubDescInput}
              onChange={e => setClubDescInput(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Club Lead Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Aarav Sharma"
                value={clubLeadNameInput}
                onChange={e => setClubLeadNameInput(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lead Role</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. President / Convenor"
                value={clubLeadRoleInput}
                onChange={e => setClubLeadRoleInput(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Lead Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="lead@pict.edu"
                value={clubLeadEmailInput}
                onChange={e => setClubLeadEmailInput(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lead Phone</label>
              <input
                type="text"
                className="form-control"
                placeholder="+91 9876543210"
                value={clubLeadPhoneInput}
                onChange={e => setClubLeadPhoneInput(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Logo Image URL</label>
            <input
              type="url"
              className="form-control"
              placeholder="https://images.unsplash.com/..."
              value={clubLogoInput}
              onChange={e => setClubLogoInput(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Banner Image URL</label>
            <input
              type="url"
              className="form-control"
              placeholder="https://images.unsplash.com/..."
              value={clubBannerInput}
              onChange={e => setClubBannerInput(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }}>
            <PlusCircle size={18} /> Register & Create Club
          </button>
        </form>
      </Modal>

      {/* Modal 5: Edit Club */}
      <Modal
        isOpen={isEditClubModalOpen}
        onClose={() => setIsEditClubModalOpen(false)}
        title="Edit Club Details"
        subtitle="Update club branding, leadership contact, and recruitment status."
      >
        <form onSubmit={handleSaveEditClub}>
          <div className="form-group">
            <label className="form-label">Club Name *</label>
            <input
              type="text"
              className="form-control"
              value={clubNameInput}
              onChange={e => setClubNameInput(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-control"
                value={clubCategoryInput}
                onChange={e => setClubCategoryInput(e.target.value as Club['category'])}
              >
                <option value="Technical">Technical</option>
                <option value="Entrepreneurship">Entrepreneurship</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Social & Community">Social & Community</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Recruitment Status</label>
              <select
                className="form-control"
                value={clubRecruitmentOpenInput ? 'open' : 'closed'}
                onChange={e => setClubRecruitmentOpenInput(e.target.value === 'open')}
              >
                <option value="open">Recruitment Open</option>
                <option value="closed">Members Only (Closed)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tagline</label>
            <input
              type="text"
              className="form-control"
              value={clubTaglineInput}
              onChange={e => setClubTaglineInput(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              value={clubDescInput}
              onChange={e => setClubDescInput(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Lead Name</label>
              <input
                type="text"
                className="form-control"
                value={clubLeadNameInput}
                onChange={e => setClubLeadNameInput(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lead Email</label>
              <input
                type="email"
                className="form-control"
                value={clubLeadEmailInput}
                onChange={e => setClubLeadEmailInput(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Logo Image URL</label>
            <input
              type="url"
              className="form-control"
              value={clubLogoInput}
              onChange={e => setClubLogoInput(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Banner Image URL</label>
            <input
              type="url"
              className="form-control"
              value={clubBannerInput}
              onChange={e => setClubBannerInput(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }}>
            Save Club Details
          </button>
        </form>
      </Modal>
    </div>
  );
};
