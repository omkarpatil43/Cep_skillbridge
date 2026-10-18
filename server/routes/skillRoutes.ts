import { Router, Request, Response } from 'express';
import { SkillResourceModel } from '../models/SkillResource.js';
import { db } from '../db.js';
import { requireVerifiedSeniorOrAdmin } from './authRoutes.js';

export const skillRouter = Router();

// GET /api/skills (with filters for category, level, type, search)
skillRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { category, level, type, search } = req.query;
    const query: Record<string, any> = {};

    if (category && category !== 'All') {
      query.category = category;
    }
    if (level && level !== 'All') {
      query.level = level;
    }
    if (type && type !== 'All') {
      query.type = type;
    }
    if (search) {
      const q = String(search).trim();
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ];
    }

    try {
      const skills = await SkillResourceModel.find(query).sort({ rating: -1, createdAt: -1 });
      if (skills && skills.length > 0) return res.json(skills);
    } catch {
      // MongoDB query failed, fall back to persistent local store
    }

    const localSkills = db.getSkillResources({
      category: category as string,
      level: level as string,
      type: type as string,
      search: search as string,
    });
    return res.json(localSkills);
  } catch (error) {
    console.error('Error fetching skill resources:', error);
    return res.json(db.getSkillResources());
  }
});

// POST /api/skills (Add skill resource / roadmap)
skillRouter.post('/', requireVerifiedSeniorOrAdmin, async (req: Request, res: Response) => {
  try {
    const { title, category, type, level, duration, link, description, authorName, authorRole, tags } = req.body;
    if (!title || !link) {
      return res.status(400).json({ error: 'Title and link are required' });
    }

    const newSkill = {
      id: `sk-${Date.now()}`,
      title,
      category: category || 'Web Dev',
      type: type || 'roadmap',
      level: level || 'Beginner',
      duration: duration || '8 Weeks',
      link,
      description: description || 'Industry skill learning track.',
      authorName: authorName || 'Senior Mentor',
      authorRole: authorRole || 'senior',
      tags: tags || [category || 'Skill'],
      rating: 5.0,
      dateAdded: new Date().toISOString().split('T')[0],
    };

    let doc: any = null;
    try {
      doc = await SkillResourceModel.create(newSkill);
    } catch {
      // fallback
    }
    const localSaved = db.addSkillResource(newSkill as any);

    return res.status(201).json(doc || localSaved);
  } catch (error) {
    console.error('Error creating skill resource:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/skills/:id
skillRouter.delete('/:id', requireVerifiedSeniorOrAdmin, async (req: Request, res: Response) => {
  try {
    try {
      await SkillResourceModel.findOneAndDelete({ id: req.params.id });
    } catch {
      // fallback
    }
    db.removeSkillResource(req.params.id);
    return res.json({ success: true, message: 'Skill resource removed' });
  } catch (error) {
    console.error('Error deleting skill resource:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
