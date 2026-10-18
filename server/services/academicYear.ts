/**
 * Academic Year & Student Classification Logic
 * ─────────────────────────────────────────────
 * PICT-specific calendar: academic year runs Aug/Sep → June.
 * From July 1st onward, the system treats it as a new academic year.
 *
 * All classification logic is centralised here for trivial verification.
 */

import type { StudentLevel } from '../../src/types/index.js';

// ── Configurable constants ──
const PROGRAM_DURATION_YEARS = 4;

/**
 * Returns the current academic year start number.
 *
 * Rule:
 *   month >= July (7)  →  academic year = current calendar year
 *   month <  July      →  academic year = current calendar year − 1
 *
 * @param now  Override for testing (defaults to Date.now())
 */
export const getCurrentAcademicYear = (now?: Date): number => {
  if (process.env.CURRENT_ACADEMIC_YEAR) {
    const forced = parseInt(process.env.CURRENT_ACADEMIC_YEAR, 10);
    if (!isNaN(forced)) return forced;
  }
  const d = now ?? new Date();
  const calendarYear = d.getFullYear();
  const month = d.getMonth() + 1; // JS months are 0-indexed
  return month >= 7 ? calendarYear : calendarYear - 1;
};

/**
 * Validate that a batch range is well-formed.
 * Returns null if valid, or an error string if invalid.
 */
export const validateBatchRange = (
  startYear: number,
  endYear: number,
): string | null => {
  if (!Number.isInteger(startYear) || !Number.isInteger(endYear)) {
    return 'Batch years must be integers';
  }
  if (startYear < 2000 || startYear > 2099) {
    return `Batch start year ${startYear} is out of reasonable range`;
  }
  if (endYear <= startYear) {
    return `Batch end year (${endYear}) must be after start year (${startYear})`;
  }
  if (endYear - startYear !== PROGRAM_DURATION_YEARS) {
    return `Batch range must span exactly ${PROGRAM_DURATION_YEARS} years, got ${endYear - startYear}`;
  }
  return null;
};

export interface ClassificationResult {
  yearOfStudy: number;
  studentLevel: StudentLevel;
  displayLabel: string;
}

/**
 * Given extracted batch start year, compute the student's year of study
 * and map to a human-readable level.
 *
 * Current year example (e.g. AY 2026):
 *   - 2026-2030 -> 1st Year (Fresher)
 *   - 2025-2029 -> 2nd Year
 *   - 2024-2028 -> 3rd Year
 *   - 2023-2027 -> Final Year (4th Year)
 *   - <= 2022   -> Passed Out Student (Alumni)
 *   - >= 2027   -> Not a student for this year of the college
 *
 * In next academic year, all batches automatically shift by one year.
 *
 * @param batchStartYear  e.g. 2023 from "2023-2027"
 * @param now             Override for testing
 */
export const classifyStudent = (
  batchStartYear: number,
  now?: Date,
): ClassificationResult => {
  const currentAcademicYear = getCurrentAcademicYear(now);
  const yearOfStudy = currentAcademicYear - batchStartYear + 1;

  if (yearOfStudy <= 0) {
    return {
      yearOfStudy,
      studentLevel: 'Invalid',
      displayLabel: 'Not a student for this year of the college',
    };
  }

  const levelMap: Record<number, { level: StudentLevel; label: string }> = {
    1: { level: 'Fresher', label: '1st Year (Fresher)' },
    2: { level: 'SecondYear', label: '2nd Year' },
    3: { level: 'ThirdYear', label: '3rd Year' },
    4: { level: 'FinalYear', label: 'Final Year (4th Year)' },
  };

  const entry = levelMap[yearOfStudy];
  if (entry) {
    return {
      yearOfStudy,
      studentLevel: entry.level,
      displayLabel: entry.label,
    };
  }

  // yearOfStudy > 4
  return {
    yearOfStudy,
    studentLevel: 'Alumni',
    displayLabel: 'Passed Out Student (Alumni)',
  };
};

/**
 * Validate a PICT email address.
 * Accepts exactly: user@pict.edu  OR  user@ms.pict.edu  (case-insensitive).
 * Rejects subdomain tricks like @pict.edu.fake.com, @ce.pict.edu, etc.
 */
export const isValidPictEmail = (email: string): boolean => {
  const lower = email.trim().toLowerCase();
  // Must contain exactly one @
  const parts = lower.split('@');
  if (parts.length !== 2) return false;
  const [localPart, domain] = parts;
  if (!localPart || localPart.length === 0) return false;
  return domain === 'pict.edu' || domain === 'ms.pict.edu';
};

/**
 * Validate password strength.
 * Rules: min 8 chars, at least one uppercase, one lowercase, one digit.
 */
export const validatePasswordStrength = (
  password: string,
): { valid: boolean; reason?: string } => {
  if (password.length < 8) {
    return { valid: false, reason: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one lowercase letter' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one digit' };
  }
  return { valid: true };
};
