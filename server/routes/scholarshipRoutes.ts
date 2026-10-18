import { Router, Request, Response } from 'express';
import { ScholarshipModel } from '../models/Scholarship.js';
import { db } from '../db.js';
import { requireVerifiedSeniorOrAdmin } from './authRoutes.js';

export const scholarshipRouter = Router();

// GET /api/scholarships
scholarshipRouter.get('/', async (_req: Request, res: Response) => {
  try {
    try {
      const scholarships = await ScholarshipModel.find().sort({ createdAt: -1 });
      if (scholarships && scholarships.length > 0) return res.json(scholarships);
    } catch {
      // MongoDB query failed, fall back to persistent local store
    }
    return res.json(db.getScholarships());
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    return res.json(db.getScholarships());
  }
});

// POST /api/scholarships
scholarshipRouter.post('/', requireVerifiedSeniorOrAdmin, async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.title || !data.provider) {
      return res.status(400).json({ error: 'Title and provider are required' });
    }
    const newScholarship = {
      id: `sch-${Date.now()}`,
      title: data.title,
      provider: data.provider,
      category: data.category || 'Merit-Based',
      amount: data.amount || '₹50,000',
      deadline: data.deadline || new Date().toISOString().split('T')[0],
      eligibleBranches: data.eligibleBranches || ['All Branches'],
      eligibleYears: data.eligibleYears || ['All Years'],
      cgpaCriteria: data.cgpaCriteria || '7.0+ CGPA',
      description: data.description || 'Scholarship opportunity for students.',
      applicationLink: data.applicationLink || '#',
      officialDriveLink: data.officialDriveLink || '#',
      documentsRequired: data.documentsRequired || ['ID Proof', 'Mark Sheets'],
      status: data.status || 'Open',
    };

    let doc: any = null;
    try {
      doc = await ScholarshipModel.create(newScholarship);
    } catch {
      // fallback
    }
    const localList = db.getScholarships();
    localList.unshift(newScholarship as any);
    db.saveDatabase();

    return res.status(201).json(doc || newScholarship);
  } catch (error) {
    console.error('Error creating scholarship:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/scholarships/:id
scholarshipRouter.delete('/:id', requireVerifiedSeniorOrAdmin, async (req: Request, res: Response) => {
  try {
    try {
      await ScholarshipModel.findOneAndDelete({ id: req.params.id });
    } catch {
      // fallback
    }
    const localList = db.getScholarships();
    const idx = localList.findIndex(s => s.id === req.params.id);
    if (idx >= 0) {
      localList.splice(idx, 1);
      db.saveDatabase();
    }
    return res.json({ success: true, message: 'Scholarship removed' });
  } catch (error) {
    console.error('Error deleting scholarship:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

