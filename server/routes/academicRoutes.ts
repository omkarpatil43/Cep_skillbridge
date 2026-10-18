import { Router, Request, Response } from 'express';
import { AcademicMaterialModel } from '../models/AcademicMaterial.js';
import { db } from '../db.js';
import { requireVerifiedSeniorOrAdmin } from './authRoutes.js';

export const academicRouter = Router();

// GET /api/academic (with filters for branch, semester, type, search)
academicRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { branch, semester, type, search } = req.query;
    const query: Record<string, any> = {};

    if (branch && branch !== 'All') {
      query.$or = [{ branch }, { branch: 'Common / All Branches' }];
    }
    if (semester) {
      query.semester = Number(semester);
    }
    if (type && type !== 'All') {
      query.type = type;
    }
    if (search) {
      const q = String(search).trim();
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { subject: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ];
    }

    try {
      const materials = await AcademicMaterialModel.find(query).sort({ createdAt: -1 });
      if (materials && materials.length > 0) return res.json(materials);
    } catch {
      // MongoDB unavailable, fallback to local database
    }

    const localMaterials = db.getAcademicMaterials({
      branch: branch as string,
      semester: semester ? Number(semester) : undefined,
      type: type as string,
      search: search as string,
    });
    return res.json(localMaterials);
  } catch (error) {
    console.error('Error fetching academic materials:', error);
    return res.json(db.getAcademicMaterials());
  }
});

// POST /api/academic (Upload study material)
academicRouter.post('/', requireVerifiedSeniorOrAdmin, async (req: Request, res: Response) => {
  try {
    const { title, branch, semester, subject, type, link, description, authorName, authorRole, authorRollNo, tags } = req.body;
    if (!title || !subject || !link) {
      return res.status(400).json({ error: 'Title, Subject, and Link are required.' });
    }

    const newMaterial = {
      id: `mat-${Date.now()}`,
      title,
      branch: branch || 'Computer Science & Engg',
      semester: Number(semester) || 1,
      subject,
      type: type || 'drive',
      link,
      description: description || 'Academic notes uploaded by campus senior/mentor.',
      authorName: authorName || 'Senior Mentor',
      authorRole: authorRole || 'senior',
      authorRollNo,
      tags: tags || [subject, `Sem ${semester || 1}`],
      dateAdded: new Date().toISOString().split('T')[0],
      downloadsCount: 1,
    };

    let doc: any = null;
    try {
      doc = await AcademicMaterialModel.create(newMaterial);
    } catch {
      // fallback
    }
    const localSaved = db.addAcademicMaterial(newMaterial as any);

    return res.status(201).json(doc || localSaved);
  } catch (error) {
    console.error('Error creating academic material:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/academic/:id
academicRouter.delete('/:id', requireVerifiedSeniorOrAdmin, async (req: Request, res: Response) => {
  try {
    try {
      await AcademicMaterialModel.findOneAndDelete({ id: req.params.id });
    } catch {
      // fallback
    }
    db.removeAcademicMaterial(req.params.id);
    return res.json({ success: true, message: 'Material removed' });
  } catch (error) {
    console.error('Error deleting academic material:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/academic/:id/download (Increment download counter)
academicRouter.post('/:id/download', async (req: Request, res: Response) => {
  try {
    const updated = await AcademicMaterialModel.findOneAndUpdate(
      { id: req.params.id },
      { $inc: { downloadsCount: 1 } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Material not found' });
    }
    return res.json(updated);
  } catch (error) {
    console.error('Error incrementing download:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
