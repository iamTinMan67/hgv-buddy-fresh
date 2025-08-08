/**
 * Test file for Staff ID Generator
 * 
 * This file contains tests to verify the Staff ID generation functionality.
 * Run with: npm test
 */

import { staffIdGenerator, LocalStorageStaffIdGenerator } from './staffIdGenerator';

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

describe('Staff ID Generator', () => {
  let generator: LocalStorageStaffIdGenerator;

  beforeEach(() => {
    generator = new LocalStorageStaffIdGenerator();
    mockLocalStorage.clear();
  });

  test('should generate Staff ID in correct format', async () => {
    const startDate = '2024-01-15';
    const staffId = await generator.generateStaffId(startDate);
    const pattern = /^EMP-2024-\d{3}$/;
    
    expect(staffId).toMatch(pattern);
  });

  test('should generate sequential Staff IDs for same year', async () => {
    const startDate = '2024-01-15';
    const staffId1 = await generator.generateStaffId(startDate);
    const staffId2 = await generator.generateStaffId(startDate);
    
    const match1 = staffId1.match(/^EMP-2024-(\d+)$/);
    const match2 = staffId2.match(/^EMP-2024-(\d+)$/);
    
    if (match1 && match2) {
      const num1 = parseInt(match1[1], 10);
      const num2 = parseInt(match2[1], 10);
      expect(num2).toBe(num1 + 1);
    }
  });

  test('should start from 001 for new year', async () => {
    const startDate1 = '2024-01-15';
    const startDate2 = '2025-01-15';
    
    const staffId1 = await generator.generateStaffId(startDate1);
    const staffId2 = await generator.generateStaffId(startDate2);
    
    expect(staffId1).toBe('EMP-2024-001');
    expect(staffId2).toBe('EMP-2025-001');
  });

  test('should validate Staff ID format correctly', () => {
    expect(generator.validateStaffId('EMP-2024-001')).toBe(true);
    expect(generator.validateStaffId('EMP-2024-999')).toBe(true);
    expect(generator.validateStaffId('EMP-2024-000')).toBe(true);
    
    expect(generator.validateStaffId('EMP-2024-1')).toBe(false); // Missing leading zeros
    expect(generator.validateStaffId('EMP-2024-1000')).toBe(false); // Too many digits
    expect(generator.validateStaffId('EMP-24-001')).toBe(false); // Wrong year format
    expect(generator.validateStaffId('emp-2024-001')).toBe(false); // Wrong prefix case
    expect(generator.validateStaffId('EMP-2024-001-extra')).toBe(false); // Extra characters
  });

  test('should handle existing Staff IDs correctly', async () => {
    // Simulate existing Staff IDs
    const existingIds = ['EMP-2024-001', 'EMP-2024-003', 'EMP-2023-999'];
    mockLocalStorage.setItem('existingStaffIds', JSON.stringify(existingIds));
    
    const newStaffId = await generator.generateStaffId('2024-06-15');
    expect(newStaffId).toBe('EMP-2024-004'); // Should be next sequential number for 2024
  });

  test('should get existing Staff IDs', async () => {
    const existingIds = ['EMP-2024-001', 'EMP-2024-002'];
    mockLocalStorage.setItem('existingStaffIds', JSON.stringify(existingIds));
    
    const retrievedIds = await generator.getExistingStaffIds();
    expect(retrievedIds).toEqual(existingIds);
  });

  test('should get next Staff ID without storing it', async () => {
    // Simulate existing Staff IDs
    const existingIds = ['EMP-2024-001', 'EMP-2024-003'];
    mockLocalStorage.setItem('existingStaffIds', JSON.stringify(existingIds));
    
    const nextId = await generator.getNextStaffId('2024-06-15');
    expect(nextId).toBe('EMP-2024-004');
    
    // Verify it wasn't stored
    const storedIds = await generator.getExistingStaffIds();
    expect(storedIds).toEqual(existingIds);
  });

  test('should clear all Staff IDs', () => {
    const existingIds = ['EMP-2024-001', 'EMP-2024-002'];
    mockLocalStorage.setItem('existingStaffIds', JSON.stringify(existingIds));
    
    generator.clearAllStaffIds();
    
    const retrievedIds = mockLocalStorage.getItem('existingStaffIds');
    expect(retrievedIds).toBeNull();
  });

  test('should extract year from Staff ID', () => {
    expect(generator.extractYearFromStaffId('EMP-2024-001')).toBe(2024);
    expect(generator.extractYearFromStaffId('EMP-2023-999')).toBe(2023);
    expect(generator.extractYearFromStaffId('EMP-2025-123')).toBe(2025);
    expect(generator.extractYearFromStaffId('invalid-id')).toBeNull();
  });

  test('should extract sequence from Staff ID', () => {
    expect(generator.extractSequenceFromStaffId('EMP-2024-001')).toBe(1);
    expect(generator.extractSequenceFromStaffId('EMP-2024-999')).toBe(999);
    expect(generator.extractSequenceFromStaffId('EMP-2024-123')).toBe(123);
    expect(generator.extractSequenceFromStaffId('invalid-id')).toBeNull();
  });

  test('should handle different start dates correctly', async () => {
    const startDate1 = '2024-01-15';
    const startDate2 = '2024-06-20';
    const startDate3 = '2024-12-31';
    
    const staffId1 = await generator.generateStaffId(startDate1);
    const staffId2 = await generator.generateStaffId(startDate2);
    const staffId3 = await generator.generateStaffId(startDate3);
    
    expect(staffId1).toBe('EMP-2024-001');
    expect(staffId2).toBe('EMP-2024-002');
    expect(staffId3).toBe('EMP-2024-003');
  });
});

// Export for manual testing if needed
export { mockLocalStorage };
