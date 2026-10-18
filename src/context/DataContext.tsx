import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AcademicMaterial,
  SkillResource,
  Club,
  ClubEvent,
  ClubRegistration,
  DoubtQuestion,
  DoubtReply,
  CompanyPlacementInfo,
  Scholarship,
} from '../types';
import {
  INITIAL_ACADEMIC_MATERIALS,
  INITIAL_SKILL_RESOURCES,
  INITIAL_CLUBS,
  INITIAL_DOUBTS,
  INITIAL_COMPANIES,
  INITIAL_SCHOLARSHIPS,
} from '../data/initialData';
import { api } from '../services/api';

interface DataContextType {
  academicMaterials: AcademicMaterial[];
  addAcademicMaterial: (mat: Omit<AcademicMaterial, 'id' | 'dateAdded' | 'downloadsCount'>) => AcademicMaterial;
  removeAcademicMaterial: (id: string) => void;
  incrementDownload: (id: string) => void;

  skillResources: SkillResource[];
  addSkillResource: (res: Omit<SkillResource, 'id' | 'dateAdded' | 'rating'>) => SkillResource;
  removeSkillResource: (id: string) => void;

  clubs: Club[];
  clubRegistrations: ClubRegistration[];
  addClub: (clubData: Omit<Club, 'id' | 'memberCount' | 'events'>) => Club;
  updateClub: (id: string, clubData: Partial<Club>) => void;
  removeClub: (id: string) => void;
  addClubEvent: (clubId: string, eventData: Omit<ClubEvent, 'id' | 'clubId' | 'registeredCount'>) => void;
  removeClubEvent: (eventId: string) => void;
  registerForClub: (regData: Omit<ClubRegistration, 'id' | 'appliedDate' | 'status'>) => void;
  acceptClubRegistration: (id: string) => void;
  rejectClubRegistration: (id: string) => void;
  removeClubRegistration: (id: string) => void;
  registerForEvent: (eventId: string) => void;

  doubts: DoubtQuestion[];
  postDoubt: (doubt: Omit<DoubtQuestion, 'id' | 'date' | 'upvotes' | 'solved' | 'replies'>) => DoubtQuestion;
  removeDoubt: (id: string) => void;
  replyToDoubt: (doubtId: string, reply: Omit<DoubtReply, 'id' | 'date' | 'upvotes'>) => void;
  removeReply: (doubtId: string, replyId: string) => void;
  verifyReply: (doubtId: string, replyId: string) => void;
  upvoteDoubt: (doubtId: string) => void;
  upvoteReply: (doubtId: string, replyId: string) => void;

  companies: CompanyPlacementInfo[];
  addCompany: (company: Omit<CompanyPlacementInfo, 'id'>) => CompanyPlacementInfo;
  updateCompany: (id: string, companyData: Partial<CompanyPlacementInfo>) => void;
  removeCompany: (id: string) => void;

  scholarships: Scholarship[];
  addScholarship: (scholarship: Omit<Scholarship, 'id'>) => Scholarship;
  removeScholarship: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const KEYS = {
  ACADEMIC: 'skillbridge_academic_v1',
  SKILLS: 'skillbridge_skills_v1',
  CLUBS: 'skillbridge_clubs_v1',
  CLUB_REGS: 'skillbridge_club_regs_v1',
  DOUBTS: 'skillbridge_doubts_v1',
  COMPANIES: 'skillbridge_companies_v1',
  SCHOLARSHIPS: 'skillbridge_scholarships_v1',
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [academicMaterials, setAcademicMaterials] = useState<AcademicMaterial[]>(() => {
    const saved = localStorage.getItem(KEYS.ACADEMIC);
    return saved ? JSON.parse(saved) : INITIAL_ACADEMIC_MATERIALS;
  });

  const [skillResources, setSkillResources] = useState<SkillResource[]>(() => {
    const saved = localStorage.getItem(KEYS.SKILLS);
    return saved ? JSON.parse(saved) : INITIAL_SKILL_RESOURCES;
  });

  const [clubs, setClubs] = useState<Club[]>(() => {
    const saved = localStorage.getItem(KEYS.CLUBS);
    return saved ? JSON.parse(saved) : INITIAL_CLUBS;
  });

  const [clubRegistrations, setClubRegistrations] = useState<ClubRegistration[]>(() => {
    const saved = localStorage.getItem(KEYS.CLUB_REGS);
    return saved ? JSON.parse(saved) : [];
  });

  const [doubts, setDoubts] = useState<DoubtQuestion[]>(() => {
    const saved = localStorage.getItem(KEYS.DOUBTS);
    return saved ? JSON.parse(saved) : INITIAL_DOUBTS;
  });

  const [companies, setCompanies] = useState<CompanyPlacementInfo[]>(() => {
    const saved = localStorage.getItem(KEYS.COMPANIES);
    return saved ? JSON.parse(saved) : INITIAL_COMPANIES;
  });

  const [scholarships, setScholarships] = useState<Scholarship[]>(() => {
    const saved = localStorage.getItem(KEYS.SCHOLARSHIPS);
    return saved ? JSON.parse(saved) : INITIAL_SCHOLARSHIPS;
  });

  useEffect(() => { localStorage.setItem(KEYS.ACADEMIC, JSON.stringify(academicMaterials)); }, [academicMaterials]);
  useEffect(() => { localStorage.setItem(KEYS.SKILLS, JSON.stringify(skillResources)); }, [skillResources]);
  useEffect(() => { localStorage.setItem(KEYS.CLUBS, JSON.stringify(clubs)); }, [clubs]);
  useEffect(() => { localStorage.setItem(KEYS.CLUB_REGS, JSON.stringify(clubRegistrations)); }, [clubRegistrations]);
  useEffect(() => { localStorage.setItem(KEYS.DOUBTS, JSON.stringify(doubts)); }, [doubts]);
  useEffect(() => { localStorage.setItem(KEYS.COMPANIES, JSON.stringify(companies)); }, [companies]);
  useEffect(() => { localStorage.setItem(KEYS.SCHOLARSHIPS, JSON.stringify(scholarships)); }, [scholarships]);

  useEffect(() => {
    const fetchRemoteData = async () => {
      try {
        const results = await Promise.allSettled([
          api.getAcademicMaterials(),
          api.getSkillResources(),
          api.getClubs(),
          api.getDoubts(),
          api.getCompanies(),
          api.getScholarships(),
          api.getClubRegistrations(),
        ]);

        const [academic, skills, clubsData, doubtsData, placements, scholarshipsData, regs] = results;
        if (academic.status === 'fulfilled' && academic.value?.length > 0) setAcademicMaterials(academic.value);
        if (skills.status === 'fulfilled' && skills.value?.length > 0) setSkillResources(skills.value);
        if (clubsData.status === 'fulfilled' && clubsData.value?.length > 0) setClubs(clubsData.value);
        if (doubtsData.status === 'fulfilled' && doubtsData.value?.length > 0) setDoubts(doubtsData.value);
        if (placements.status === 'fulfilled' && placements.value?.length > 0) setCompanies(placements.value);
        if (scholarshipsData.status === 'fulfilled' && scholarshipsData.value?.length > 0) setScholarships(scholarshipsData.value);
        if (regs.status === 'fulfilled' && regs.value?.length > 0) setClubRegistrations(regs.value);
      } catch (err) {
        console.info('Backend initial sync notice:', err);
      }
    };
    fetchRemoteData();
  }, []);

  const addAcademicMaterial = useCallback((mat: Omit<AcademicMaterial, 'id' | 'dateAdded' | 'downloadsCount'>): AcademicMaterial => {
    const newMat: AcademicMaterial = {
      ...mat,
      id: `mat-${Date.now()}`,
      dateAdded: new Date().toISOString().split('T')[0],
      downloadsCount: 1,
    };
    setAcademicMaterials(prev => [newMat, ...prev]);
    api.addAcademicMaterial(mat).catch(e => console.warn('Could not sync to MongoDB:', e));
    return newMat;
  }, []);

  const removeAcademicMaterial = useCallback((id: string) => {
    setAcademicMaterials(prev => prev.filter(m => m.id !== id));
    api.removeAcademicMaterial(id).catch(e => console.warn('Could not sync delete:', e));
  }, []);

  const incrementDownload = useCallback((id: string) => {
    setAcademicMaterials(prev => prev.map(m => (m.id === id ? { ...m, downloadsCount: m.downloadsCount + 1 } : m)));
    api.incrementDownload(id).catch(e => console.warn('Could not sync download:', e));
  }, []);

  const addSkillResource = useCallback((res: Omit<SkillResource, 'id' | 'dateAdded' | 'rating'>): SkillResource => {
    const newRes: SkillResource = {
      ...res,
      id: `sk-${Date.now()}`,
      dateAdded: new Date().toISOString().split('T')[0],
      rating: 5.0,
    };
    setSkillResources(prev => [newRes, ...prev]);
    api.addSkillResource(res).catch(e => console.warn('Could not sync to MongoDB:', e));
    return newRes;
  }, []);

  const removeSkillResource = useCallback((id: string) => {
    setSkillResources(prev => prev.filter(s => s.id !== id));
    api.removeSkillResource(id).catch(e => console.warn('Could not sync delete:', e));
  }, []);

  const addClubEvent = useCallback((clubId: string, eventData: Omit<ClubEvent, 'id' | 'clubId' | 'registeredCount'>) => {
    const newEvent: ClubEvent = {
      ...eventData,
      id: `ev-${Date.now()}`,
      clubId,
      registeredCount: 0,
    };
    setClubs(prev => prev.map(c => (c.id === clubId ? { ...c, events: [newEvent, ...c.events] } : c)));
    api.addClubEvent(clubId, eventData).catch(e => console.warn('Could not sync event:', e));
  }, []);

  const removeClubEvent = useCallback((eventId: string) => {
    setClubs(prev => prev.map(club => ({
      ...club,
      events: club.events.filter(ev => ev.id !== eventId),
    })));
    api.removeClubEvent(eventId).catch(e => console.warn('Could not sync delete:', e));
  }, []);

  const registerForClub = useCallback((regData: Omit<ClubRegistration, 'id' | 'appliedDate' | 'status'>) => {
    const newReg: ClubRegistration = {
      ...regData,
      id: `reg-${Date.now()}`,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
    };
    setClubRegistrations(prev => [newReg, ...prev]);
    api.registerForClub(regData).catch(e => console.warn('Could not sync club reg:', e));
  }, []);

  const acceptClubRegistration = useCallback((id: string) => {
    setClubRegistrations(prev => prev.map(r => (r.id === id ? { ...r, status: 'accepted' as const } : r)));
    api.acceptClubRegistration(id).catch(e => console.warn('Could not sync accept:', e));
  }, []);

  const rejectClubRegistration = useCallback((id: string) => {
    setClubRegistrations(prev => prev.map(r => (r.id === id ? { ...r, status: 'reviewed' as const } : r)));
    api.rejectClubRegistration(id).catch(e => console.warn('Could not sync rejection:', e));
  }, []);

  const removeClubRegistration = useCallback((id: string) => {
    setClubRegistrations(prev => prev.filter(r => r.id !== id));
    api.removeClubRegistration(id).catch(e => console.warn('Could not sync delete:', e));
  }, []);

  const registerForEvent = useCallback((eventId: string) => {
    setClubs(prev => prev.map(club => ({
      ...club,
      events: club.events.map(ev => (ev.id === eventId ? { ...ev, registeredCount: ev.registeredCount + 1 } : ev)),
    })));
    api.rsvpEvent(eventId).catch(e => console.warn('Could not sync RSVP:', e));
  }, []);

  const postDoubt = useCallback((doubt: Omit<DoubtQuestion, 'id' | 'date' | 'upvotes' | 'solved' | 'replies'>): DoubtQuestion => {
    const newDoubt: DoubtQuestion = {
      ...doubt,
      id: `d-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      upvotes: 0,
      solved: false,
      replies: [],
    };
    setDoubts(prev => [newDoubt, ...prev]);
    api.postDoubt(doubt).catch(e => console.warn('Could not sync doubt:', e));
    return newDoubt;
  }, []);

  const removeDoubt = useCallback((id: string) => {
    setDoubts(prev => prev.filter(d => d.id !== id));
    api.removeDoubt(id).catch(e => console.warn('Could not sync delete:', e));
  }, []);

  const replyToDoubt = useCallback((doubtId: string, reply: Omit<DoubtReply, 'id' | 'date' | 'upvotes'>) => {
    const newReply: DoubtReply = {
      ...reply,
      id: `rep-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      upvotes: 0,
      isSeniorVerified: reply.authorRole === 'senior' || reply.authorRole === 'college_admin',
    };
    setDoubts(prev => prev.map(d => {
      if (d.id === doubtId) {
        return { ...d, solved: d.solved || newReply.isSeniorVerified || false, replies: [...d.replies, newReply] };
      }
      return d;
    }));
    api.replyToDoubt(doubtId, reply).catch(e => console.warn('Could not sync reply:', e));
  }, []);

  const removeReply = useCallback((doubtId: string, replyId: string) => {
    setDoubts(prev => prev.map(d => {
      if (d.id === doubtId) {
        return { ...d, replies: d.replies.filter(r => r.id !== replyId) };
      }
      return d;
    }));
    api.removeReply(doubtId, replyId).catch(e => console.warn('Could not sync delete:', e));
  }, []);

  const verifyReply = useCallback((doubtId: string, replyId: string) => {
    setDoubts(prev => prev.map(d => {
      if (d.id === doubtId) {
        return {
          ...d,
          solved: true,
          replies: d.replies.map(r => (r.id === replyId ? { ...r, isSeniorVerified: true } : r)),
        };
      }
      return d;
    }));
    api.verifyReply(doubtId, replyId).catch(e => console.warn('Could not sync verification:', e));
  }, []);

  const upvoteDoubt = useCallback((doubtId: string) => {
    setDoubts(prev => prev.map(d => (d.id === doubtId ? { ...d, upvotes: d.upvotes + 1 } : d)));
    api.upvoteDoubt(doubtId).catch(e => console.warn('Could not sync upvote:', e));
  }, []);

  const upvoteReply = useCallback((doubtId: string, replyId: string) => {
    setDoubts(prev => prev.map(d => {
      if (d.id === doubtId) {
        return { ...d, replies: d.replies.map(r => (r.id === replyId ? { ...r, upvotes: r.upvotes + 1 } : r)) };
      }
      return d;
    }));
    api.upvoteReply(doubtId, replyId).catch(e => console.warn('Could not sync upvote:', e));
  }, []);

  const addClub = useCallback((clubData: Omit<Club, 'id' | 'memberCount' | 'events'>): Club => {
    const newClub: Club = {
      ...clubData,
      id: `club-${Date.now()}`,
      memberCount: 1,
      events: [],
    };
    setClubs(prev => [newClub, ...prev]);
    api.addClub(clubData).catch(e => console.warn('Could not sync club:', e));
    return newClub;
  }, []);

  const updateClub = useCallback((id: string, clubData: Partial<Club>) => {
    setClubs(prev => prev.map(c => (c.id === id ? { ...c, ...clubData } : c)));
    api.updateClub(id, clubData).catch(e => console.warn('Could not sync club update:', e));
  }, []);

  const removeClub = useCallback((id: string) => {
    setClubs(prev => prev.filter(c => c.id !== id));
    // Also remove associated registrations
    setClubRegistrations(prev => prev.filter(r => r.clubId !== id));
    api.removeClub(id).catch(e => console.warn('Could not sync club delete:', e));
  }, []);

  const addCompany = useCallback((company: Omit<CompanyPlacementInfo, 'id'>): CompanyPlacementInfo => {
    const newCompany: CompanyPlacementInfo = { ...company, id: `co-${Date.now()}` };
    setCompanies(prev => [newCompany, ...prev]);
    api.addCompany(company).catch(e => console.warn('Could not sync company:', e));
    return newCompany;
  }, []);

  const updateCompany = useCallback((id: string, companyData: Partial<CompanyPlacementInfo>) => {
    setCompanies(prev => prev.map(c => (c.id === id ? { ...c, ...companyData } : c)));
    api.updateCompany(id, companyData).catch(e => console.warn('Could not sync company update:', e));
  }, []);

  const removeCompany = useCallback((id: string) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
    api.removeCompany(id).catch(e => console.warn('Could not sync delete:', e));
  }, []);

  const addScholarship = useCallback((scholarship: Omit<Scholarship, 'id'>): Scholarship => {
    const newSch: Scholarship = { ...scholarship, id: `sch-${Date.now()}` };
    setScholarships(prev => [newSch, ...prev]);
    api.addScholarship(scholarship).catch(e => console.warn('Could not sync scholarship:', e));
    return newSch;
  }, []);

  const removeScholarship = useCallback((id: string) => {
    setScholarships(prev => prev.filter(s => s.id !== id));
    api.removeScholarship(id).catch(e => console.warn('Could not sync delete:', e));
  }, []);

  return (
    <DataContext.Provider
      value={{
        academicMaterials, addAcademicMaterial, removeAcademicMaterial, incrementDownload,
        skillResources, addSkillResource, removeSkillResource,
        clubs, clubRegistrations, addClub, updateClub, removeClub, addClubEvent, removeClubEvent,
        registerForClub, acceptClubRegistration, rejectClubRegistration, removeClubRegistration, registerForEvent,
        doubts, postDoubt, removeDoubt, replyToDoubt, removeReply, verifyReply, upvoteDoubt, upvoteReply,
        companies, addCompany, updateCompany, removeCompany,
        scholarships, addScholarship, removeScholarship,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
