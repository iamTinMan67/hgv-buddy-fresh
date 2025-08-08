# Job ID Generation System

## Overview

The HGV Buddy application includes an automated Job ID generation system that creates unique identifiers for job assignments in the format `JOB-YYYY-NNN` where:
- `JOB` is the fixed prefix
- `YYYY` is the current year (e.g., 2024)
- `NNN` is a 3-digit sequential number (e.g., 001, 002, 003...)

## Examples

- `JOB-2024-001` - First job of 2024
- `JOB-2024-002` - Second job of 2024
- `JOB-2025-001` - First job of 2025 (resets counter for new year)

## Current Implementation

### Storage
- Uses browser localStorage to track existing Job IDs
- Maintains a list of all generated Job IDs to ensure uniqueness
- Automatically resets counter each year

### Usage in JobAllocationForm
- Job ID field is auto-generated when the form loads
- Field is read-only to prevent manual editing
- Includes helper text: "Auto-generated unique identifier"

## Files

### Core Implementation
- `src/utils/jobIdGenerator.ts` - Main utility class and interface
- `src/components/JobAllocationForm.tsx` - Form component that uses the generator

### Testing
- `src/utils/jobIdGenerator.test.ts` - Unit tests for the generator

## API Reference

### JobIdGenerator Interface
```typescript
interface JobIdGenerator {
  generateJobId(): Promise<string>;
  validateJobId(jobId: string): boolean;
  getExistingJobIds(): Promise<string[]>;
}
```

### LocalStorageJobIdGenerator Class
```typescript
class LocalStorageJobIdGenerator implements JobIdGenerator {
  generateJobId(): Promise<string>           // Generate and store new Job ID
  validateJobId(jobId: string): boolean      // Validate Job ID format
  getExistingJobIds(): Promise<string[]>     // Get all existing Job IDs
  clearAllJobIds(): void                     // Clear all stored Job IDs
  getNextJobId(): Promise<string>            // Get next ID without storing
}
```

## Database Integration

When ready to integrate with a database, create a new class that implements the `JobIdGenerator` interface:

```typescript
class DatabaseJobIdGenerator implements JobIdGenerator {
  async generateJobId(): Promise<string> {
    // 1. Query database for max job number for current year
    // 2. Use database transaction to ensure uniqueness
    // 3. Insert new job record with generated ID
    // 4. Return generated ID
  }
  
  async getExistingJobIds(): Promise<string[]> {
    // Query database for all job IDs
    // SELECT job_id FROM jobs ORDER BY job_id
  }
  
  validateJobId(jobId: string): boolean {
    // Same validation logic as current implementation
    const pattern = /^JOB-\d{4}-\d{3}$/;
    return pattern.test(jobId);
  }
}
```

### Database Schema Example
```sql
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  job_id VARCHAR(12) UNIQUE NOT NULL,  -- Format: JOB-YYYY-NNN
  job_title VARCHAR(255) NOT NULL,
  assigned_driver VARCHAR(100),
  vehicle_type VARCHAR(50),
  pickup_location TEXT,
  delivery_location TEXT,
  pickup_date DATE,
  pickup_time TIME,
  delivery_date DATE,
  delivery_time TIME,
  cargo_type VARCHAR(100),
  cargo_weight DECIMAL(10,2),
  cargo_volume DECIMAL(10,2),
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient Job ID lookups
CREATE INDEX idx_jobs_job_id ON jobs(job_id);
CREATE INDEX idx_jobs_year ON jobs(SUBSTRING(job_id, 5, 4));
```

### Migration Strategy
1. **Phase 1**: Continue using localStorage, but log all generated Job IDs
2. **Phase 2**: Create database table and migrate existing Job IDs
3. **Phase 3**: Switch to database-based generation
4. **Phase 4**: Remove localStorage dependency

## Testing

Run the test suite to verify Job ID generation:
```bash
npm test src/utils/jobIdGenerator.test.ts
```

### Test Coverage
- ✅ Correct format validation
- ✅ Sequential numbering
- ✅ Year-based reset
- ✅ Uniqueness enforcement
- ✅ Error handling
- ✅ Storage operations

## Error Handling

The system includes robust error handling:
- Fallback to timestamp-based ID if generation fails
- Validation of Job ID format
- Graceful handling of localStorage errors
- Console logging for debugging

## Future Enhancements

### Potential Improvements
1. **Prefix Customization**: Allow configurable prefixes (e.g., `DEL-`, `PICK-`)
2. **Branch Support**: Add branch/office codes (e.g., `JOB-2024-LON-001`)
3. **Category Support**: Add job type codes (e.g., `JOB-2024-URG-001`)
4. **Bulk Generation**: Generate multiple Job IDs at once
5. **Audit Trail**: Track who generated which Job IDs and when

### Integration Points
- **Redux Store**: Store Job IDs in global state
- **API Endpoints**: RESTful endpoints for Job ID management
- **Real-time Updates**: WebSocket notifications for new Job IDs
- **Export/Import**: CSV/Excel export of Job ID history
