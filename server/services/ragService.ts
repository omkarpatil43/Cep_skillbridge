import { AcademicMaterialModel } from '../models/AcademicMaterial.js';
import { SkillResourceModel } from '../models/SkillResource.js';
import { ClubModel } from '../models/Club.js';
import { PlacementModel } from '../models/Placement.js';
import { ScholarshipModel } from '../models/Scholarship.js';
import { UserModel } from '../models/User.js';
import { Database } from '../db.js';

const localDatabase = new Database();

const compact = (value: unknown) => JSON.stringify(value, (_key, item) => {
  if (typeof item === 'string' && item.length > 600) return `${item.slice(0, 600)}...`;
  return item;
});

export const retrieveSkillBridgeContext = async (query: string, userId?: string): Promise<string> => {
  const normalized = query.toLowerCase();
  const wantsAcademic = /note|pyq|subject|semester|academic|course|study|material/.test(normalized);
  const wantsSkills = /skill|roadmap|learn|resource|python|react|javascript|ai\/ml|devops/.test(normalized);
  const wantsClubs = /club|event|hackathon|workshop|campus/.test(normalized);
  const wantsCareer = /placement|company|interview|resume|career|scholarship|grant/.test(normalized);
  const wantsSkillBridge = /skillbridge|available|my profile|my progress|my skill|my course/.test(normalized);

  if (!wantsSkillBridge && !wantsAcademic && !wantsSkills && !wantsClubs && !wantsCareer) return '';

  try {
    const [academic, skills, clubs, companies, scholarships, user] = await Promise.all([
      wantsAcademic || wantsSkillBridge ? AcademicMaterialModel.find().limit(8).lean() : [],
      wantsSkills || wantsSkillBridge ? SkillResourceModel.find().limit(8).lean() : [],
      wantsClubs || wantsSkillBridge ? ClubModel.find().limit(8).lean() : [],
      wantsCareer || wantsSkillBridge ? PlacementModel.find().limit(8).lean() : [],
      wantsCareer || wantsSkillBridge ? ScholarshipModel.find().limit(8).lean() : [],
      userId ? UserModel.findOne({ id: userId }).lean() : null,
    ]);
    return `Verified SkillBridge context (use only these records; say when a record is unavailable):\n${compact({ academic, skills, clubs, companies, scholarships, user: user ? { id: user.id, name: user.name, branch: user.branch, year: user.year, role: user.role, clubName: user.clubName, badges: user.badges, reputation: user.reputation } : undefined })}`;
  } catch {
    const user = userId ? localDatabase.getUsers().find(candidate => candidate.id === userId) : undefined;
    return `Verified SkillBridge context from local fallback data (use only these records):\n${compact({
      academic: wantsAcademic || wantsSkillBridge ? localDatabase.getAcademicMaterials().slice(0, 8) : [],
      skills: wantsSkills || wantsSkillBridge ? localDatabase.getSkillResources().slice(0, 8) : [],
      clubs: wantsClubs || wantsSkillBridge ? localDatabase.getClubs().slice(0, 8) : [],
      companies: wantsCareer || wantsSkillBridge ? localDatabase.getCompanies().slice(0, 8) : [],
      scholarships: wantsCareer || wantsSkillBridge ? localDatabase.getScholarships().slice(0, 8) : [],
      user: user ? { id: user.id, name: user.name, branch: user.branch, year: user.year, role: user.role, clubName: user.clubName, badges: user.badges, reputation: user.reputation } : undefined,
    })}`;
  }
};
