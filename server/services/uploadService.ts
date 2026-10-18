/**
 * Upload Service — Multer configuration & secure file handling
 * ────────────────────────────────────────────────────────────
 * Stores uploaded ID cards with UUID filenames in server/uploads/id-cards/
 * Validates file size (max 10MB) and MIME type (JPEG/PNG/WebP).
 * Protects against path traversal attacks.
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Base directory for uploaded ID card images
const UPLOADS_DIR = path.resolve(process.cwd(), 'server', 'uploads', 'id-cards');

// Ensure directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Allowed MIME types
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.png';
    const uniqueName = `${crypto.randomUUID()}${safeExt}`;
    cb(null, uniqueName);
  },
});

export const uploadIdCard = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and WebP image files are allowed'));
    }
  },
});

/**
 * Returns absolute path for a filename, guaranteeing it stays within UPLOADS_DIR.
 * Throws an error if directory traversal is attempted.
 */
export const getSecureImagePath = (filename: string): string => {
  const safeFilename = path.basename(filename);
  const resolvedPath = path.resolve(UPLOADS_DIR, safeFilename);

  if (!resolvedPath.startsWith(UPLOADS_DIR)) {
    throw new Error('Access denied: invalid file path');
  }

  return resolvedPath;
};

export { UPLOADS_DIR };

// ── Chat Attachments Storage ──
const CHAT_UPLOADS_DIR = path.resolve(process.cwd(), 'server', 'uploads', 'chat');

if (!fs.existsSync(CHAT_UPLOADS_DIR)) {
  fs.mkdirSync(CHAT_UPLOADS_DIR, { recursive: true });
}

const chatStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, CHAT_UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${crypto.randomUUID()}${ext}`;
    cb(null, uniqueName);
  },
});

export const uploadChatFile = multer({
  storage: chatStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
    files: 5,
  },
});

export const getSecureChatFilePath = (filename: string): string => {
  const safeFilename = path.basename(filename);
  const resolvedPath = path.resolve(CHAT_UPLOADS_DIR, safeFilename);

  if (!resolvedPath.startsWith(CHAT_UPLOADS_DIR)) {
    throw new Error('Access denied: invalid file path');
  }

  return resolvedPath;
};

export { CHAT_UPLOADS_DIR };

