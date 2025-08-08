/**
 * Test file for Job ID Generator
 * 
 * This file contains tests to verify the Job ID generation functionality.
 * Run with: npm test
 */

import { jobIdGenerator, LocalStorageJobIdGenerator } from './jobIdGenerator';

// Mock localStorage for testing
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: function(key: string) {
    return this.store[key] || null;
  },
  setItem: function(key: string, value: string) {
    this.store[key] = value;
  },
  removeItem: function(key: string) {
    delete this.store[key];
  },
  clear: function() {
    this.store = {};
  }
};

// Replace global localStorage with mock
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('Job ID Generator', () => {
  let generator: LocalStorageJobIdGenerator;

  beforeEach(() => {
    generator = new LocalStorageJobIdGenerator();
    mockLocalStorage.clear();
  });

  test('should generate Job ID in correct format', async () => {
    const jobId = await generator.generateJobId();
    const currentYear = new Date().getFullYear();
    const pattern = new RegExp(`^JOB-${currentYear}-\\d{3}$`);
    
    expect(jobId).toMatch(pattern);
  });

  test('should generate sequential Job IDs', async () => {
    const jobId1 = await generator.generateJobId();
    const jobId2 = await generator.generateJobId();
    
    const year = new Date().getFullYear();
    const match1 = jobId1.match(new RegExp(`JOB-${year}-(\\d+)`));
    const match2 = jobId2.match(new RegExp(`JOB-${year}-(\\d+)`));
    
    if (match1 && match2) {
      const num1 = parseInt(match1[1], 10);
      const num2 = parseInt(match2[1], 10);
      expect(num2).toBe(num1 + 1);
    }
  });

  test('should validate Job ID format correctly', () => {
    expect(generator.validateJobId('JOB-2024-001')).toBe(true);
    expect(generator.validateJobId('JOB-2024-999')).toBe(true);
    expect(generator.validateJobId('JOB-2024-000')).toBe(true);
    
    expect(generator.validateJobId('JOB-2024-1')).toBe(false); // Missing leading zeros
    expect(generator.validateJobId('JOB-2024-1000')).toBe(false); // Too many digits
    expect(generator.validateJobId('JOB-24-001')).toBe(false); // Wrong year format
    expect(generator.validateJobId('job-2024-001')).toBe(false); // Wrong prefix case
    expect(generator.validateJobId('JOB-2024-001-extra')).toBe(false); // Extra characters
  });

  test('should handle existing Job IDs correctly', async () => {
    // Simulate existing Job IDs
    const existingIds = ['JOB-2024-001', 'JOB-2024-003', 'JOB-2023-999'];
    mockLocalStorage.setItem('existingJobIds', JSON.stringify(existingIds));
    
    const newJobId = await generator.generateJobId();
    expect(newJobId).toBe('JOB-2024-004'); // Should be next sequential number for 2024
  });

  test('should start from 001 for new year', async () => {
    // Clear any existing data
    mockLocalStorage.clear();
    
    const jobId = await generator.generateJobId();
    const currentYear = new Date().getFullYear();
    expect(jobId).toBe(`JOB-${currentYear}-001`);
  });

  test('should get existing Job IDs', async () => {
    const existingIds = ['JOB-2024-001', 'JOB-2024-002'];
    mockLocalStorage.setItem('existingJobIds', JSON.stringify(existingIds));
    
    const retrievedIds = await generator.getExistingJobIds();
    expect(retrievedIds).toEqual(existingIds);
  });

  test('should get next Job ID without storing it', async () => {
    // Simulate existing Job IDs
    const existingIds = ['JOB-2024-001', 'JOB-2024-003'];
    mockLocalStorage.setItem('existingJobIds', JSON.stringify(existingIds));
    
    const nextId = await generator.getNextJobId();
    expect(nextId).toBe('JOB-2024-004');
    
    // Verify it wasn't stored
    const storedIds = await generator.getExistingJobIds();
    expect(storedIds).toEqual(existingIds);
  });

  test('should clear all Job IDs', () => {
    const existingIds = ['JOB-2024-001', 'JOB-2024-002'];
    mockLocalStorage.setItem('existingJobIds', JSON.stringify(existingIds));
    
    generator.clearAllJobIds();
    
    const retrievedIds = mockLocalStorage.getItem('existingJobIds');
    expect(retrievedIds).toBeNull();
  });
});

// Export for manual testing if needed
export { mockLocalStorage };
