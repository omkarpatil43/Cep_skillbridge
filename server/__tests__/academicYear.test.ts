/**
 * Comprehensive Unit Tests for Academic Year, Student Classification,
 * PICT Email Validation, Password Strength, and OCR Fallback Extraction.
 *
 * Can be executed directly with: npx tsx server/__tests__/academicYear.test.ts
 */

import {
  getCurrentAcademicYear,
  validateBatchRange,
  classifyStudent,
  isValidPictEmail,
  validatePasswordStrength,
} from '../services/academicYear.js';
import { extractBatchYearsFromText } from '../services/ocrService.js';

let passed = 0;
let failed = 0;

const assert = (condition: boolean, message: string) => {
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${message}`);
  }
};

console.log('\n🧪 Running SkillBridge Academic Year & Classification Test Suite...\n');

// ── 1. Academic Year Calculation (July Rollover Boundary) ──
console.log('--- 1. July Rollover & Academic Year Calculation ---');
{
  // Note: JS month is 0-indexed (5 = June, 6 = July)
  const preJuly = new Date(2026, 5, 30, 23, 59, 59); // June 30th local time
  assert(getCurrentAcademicYear(preJuly) === 2025, 'June 30th belongs to academic year 2025');

  const postJuly = new Date(2026, 6, 1, 0, 0, 0);   // July 1st local time
  assert(getCurrentAcademicYear(postJuly) === 2026, 'July 1st rolls over to academic year 2026');

  const august = new Date(2026, 7, 15);              // August local time
  assert(getCurrentAcademicYear(august) === 2026, 'August belongs to academic year 2026');

  const january = new Date(2026, 0, 15);             // January local time
  assert(getCurrentAcademicYear(january) === 2025, 'January belongs to previous academic year (2025)');
}

// ── 2. Batch Range Validation ──
console.log('\n--- 2. Batch Range Validation ---');
{
  assert(validateBatchRange(2023, 2027) === null, 'Standard 4-year batch 2023-2027 is valid');
  assert(validateBatchRange(2024, 2028) === null, 'Standard 4-year batch 2024-2028 is valid');
  assert(validateBatchRange(2023, 2026) !== null, '3-year batch is rejected (must span 4 years)');
  assert(validateBatchRange(2023, 2028) !== null, '5-year batch is rejected');
  assert(validateBatchRange(2027, 2023) !== null, 'Inverted years are rejected');
  assert(validateBatchRange(1990, 1994) !== null, 'Out of range batch year is rejected');
}

// ── 3. Student Year Classification ──
console.log('\n--- 3. Student Year Classification ---');
{
  // Assume mock date is in September 2026 (AY 2026)
  const mockNow = new Date('2026-09-15T00:00:00Z');

  const fresher = classifyStudent(2026, mockNow);
  assert(fresher.yearOfStudy === 1 && fresher.studentLevel === 'Fresher', 'Batch starting 2026 classified as Fresher (Year 1)');

  const sophomore = classifyStudent(2025, mockNow);
  assert(sophomore.yearOfStudy === 2 && sophomore.studentLevel === 'SecondYear', 'Batch starting 2025 classified as SecondYear (Year 2)');

  const junior = classifyStudent(2024, mockNow);
  assert(junior.yearOfStudy === 3 && junior.studentLevel === 'ThirdYear', 'Batch starting 2024 classified as ThirdYear (Year 3)');

  const senior = classifyStudent(2023, mockNow);
  assert(senior.yearOfStudy === 4 && senior.studentLevel === 'FinalYear', 'Batch starting 2023 classified as FinalYear (Year 4)');

  const alumni = classifyStudent(2020, mockNow);
  assert(alumni.yearOfStudy === 7 && alumni.studentLevel === 'Alumni', 'Batch starting 2020 classified as Alumni');

  const future = classifyStudent(2028, mockNow);
  assert(future.studentLevel === 'Invalid', 'Future-dated batch classified as Invalid');
}

// ── 4. PICT Email Domain Validation ──
console.log('\n--- 4. PICT Email Domain Validation ---');
{
  assert(isValidPictEmail('student@pict.edu'), 'Accepts user@pict.edu');
  assert(isValidPictEmail('STUDENT@PICT.EDU'), 'Case-insensitive: accepts uppercase @PICT.EDU');
  assert(isValidPictEmail('aarav.sharma@ms.pict.edu'), 'Accepts user@ms.pict.edu');
  assert(isValidPictEmail('  rahul@pict.edu  '), 'Trims whitespace in email');

  // Strict domain spoofing and subdomain rejections
  assert(!isValidPictEmail('student@pict.edu.fake.com'), 'Rejects trailing spoof @pict.edu.fake.com');
  assert(!isValidPictEmail('student@ce.pict.edu'), 'Rejects unofficial subdomain @ce.pict.edu');
  assert(!isValidPictEmail('student@ms.pict.edu.phishing.org'), 'Rejects phishing @ms.pict.edu.phishing.org');
  assert(!isValidPictEmail('student@gmail.com'), 'Rejects non-PICT domain @gmail.com');
  assert(!isValidPictEmail('student@pict.edu.in'), 'Rejects @pict.edu.in');
  assert(!isValidPictEmail('@pict.edu'), 'Rejects missing local part');
  assert(!isValidPictEmail('invalid-email'), 'Rejects malformed email string');
}

// ── 5. Password Strength Validation ──
console.log('\n--- 5. Password Strength Validation ---');
{
  assert(validatePasswordStrength('P@ssword123').valid, 'Valid strong password accepted');
  assert(validatePasswordStrength('PictCampus2026').valid, 'Valid alphanumeric password accepted');
  assert(!validatePasswordStrength('short1A').valid, 'Rejects password shorter than 8 characters');
  assert(!validatePasswordStrength('alllowercase1').valid, 'Rejects password without uppercase letter');
  assert(!validatePasswordStrength('ALLUPPERCASE1').valid, 'Rejects password without lowercase letter');
  assert(!validatePasswordStrength('NoNumbersHere').valid, 'Rejects password without numbers');
}

// ── 6. OCR Regex & Misread Extraction ──
console.log('\n--- 6. OCR Batch Year Extraction & Normalization ---');
{
  const standardText = 'PUNE INSTITUTE OF COMPUTER TECHNOLOGY\nName: Aarav Sharma\nRoll: 24CS042\nBatch: 2023-2027';
  const res1 = extractBatchYearsFromText(standardText);
  assert(res1 !== null && res1.startYear === 2023 && res1.endYear === 2027, 'Extracts standard 2023-2027 from text');

  const enDashText = 'Student ID Card — Duration: 2024–2028 — Computer Engg';
  const res2 = extractBatchYearsFromText(enDashText);
  assert(res2 !== null && res2.startYear === 2024 && res2.endYear === 2028, 'Normalizes en-dash (–) to hyphen');

  const oConfusionText = 'PICT ID Card 2O23-2O27 Department of IT';
  const res3 = extractBatchYearsFromText(oConfusionText);
  assert(res3 !== null && res3.startYear === 2023 && res3.endYear === 2027, 'Normalizes OCR letter O/o to digit 0');

  const noYearText = 'PICT Pune Library Card No: 49204';
  const res4 = extractBatchYearsFromText(noYearText);
  assert(res4 === null, 'Returns null when no valid batch year range is present');
}

console.log(`\n======================================================`);
console.log(`Test Results: ${passed} passed, ${failed} failed`);
console.log(`======================================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
