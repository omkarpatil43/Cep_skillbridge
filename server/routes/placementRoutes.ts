import { Router, Request, Response } from 'express';
import { PlacementModel } from '../models/Placement.js';
import { db } from '../db.js';
import { requireVerifiedSeniorOrAdmin } from './authRoutes.js';

export const placementRouter = Router();

// GET /api/placements
placementRouter.get('/', async (_req: Request, res: Response) => {
  try {
    try {
      const placements = await PlacementModel.find().sort({ createdAt: -1 });
      if (placements && placements.length > 0) return res.json(placements);
    } catch {
      // MongoDB query failed, fall back to persistent local store
    }
    return res.json(db.getCompanies());
  } catch (error) {
    console.error('Error fetching placement data:', error);
    return res.json(db.getCompanies());
  }
});

// POST /api/placements
placementRouter.post('/', requireVerifiedSeniorOrAdmin, async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.name) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    const newCompany = {
      id: `co-${Date.now()}`,
      name: data.name,
      logo: data.logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=80&q=80',
      tier: data.tier || 'Standard (6-12 LPA)',
      packageLPA: data.packageLPA || '8 LPA',
      eligibleBranches: data.eligibleBranches || ['All Branches'],
      hiringRounds: data.hiringRounds || ['Online Test', 'Technical', 'HR'],
      prepRoadmapLink: data.prepRoadmapLink || '#',
      driveLink: data.driveLink || '#',
      overview: data.overview || 'Campus hiring drive.',
      importantTopics: data.importantTopics || ['DSA', 'Core CS'],
      recentInterviewExperiences: data.recentInterviewExperiences || [],
    };

    let doc: any = null;
    try {
      doc = await PlacementModel.create(newCompany);
    } catch {
      // fallback
    }
    const companies = db.getCompanies();
    companies.unshift(newCompany as any);
    db.saveDatabase();

    return res.status(201).json(doc || newCompany);
  } catch (error) {
    console.error('Error creating placement:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/placements/:id
placementRouter.put('/:id', requireVerifiedSeniorOrAdmin, async (req: Request, res: Response) => {
  try {
    let updated: any = null;
    try {
      updated = await PlacementModel.findOneAndUpdate(
        { id: req.params.id },
        req.body,
        { new: true }
      );
    } catch {
      // fallback
    }

    const companies = db.getCompanies();
    const idx = companies.findIndex(c => c.id === req.params.id);
    if (idx >= 0) {
      companies[idx] = { ...companies[idx], ...req.body };
      db.saveDatabase();
      if (!updated) updated = companies[idx];
    }

    if (!updated) {
      return res.status(404).json({ error: 'Company not found' });
    }
    return res.json(updated);
  } catch (error) {
    console.error('Error updating placement:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/placements/:id
placementRouter.delete('/:id', requireVerifiedSeniorOrAdmin, async (req: Request, res: Response) => {
  try {
    try {
      await PlacementModel.findOneAndDelete({ id: req.params.id });
    } catch {
      // fallback
    }
    const companies = db.getCompanies();
    const idx = companies.findIndex(c => c.id === req.params.id);
    if (idx >= 0) {
      companies.splice(idx, 1);
      db.saveDatabase();
    }
    return res.json({ success: true, message: 'Company removed' });
  } catch (error) {
    console.error('Error deleting placement:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

