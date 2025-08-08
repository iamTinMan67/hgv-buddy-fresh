# Staff ID Generation System

## Overview

The HGV Buddy application includes an automated Staff ID generation system that creates unique identifiers for staff members in the format `EMP-YYYY-NNN` where:
- `EMP` is the fixed prefix (Employee)
- `YYYY` is the start date year (e.g., 2024)
- `NNN` is a 3-digit sequential number (e.g., 001, 002, 003...)

## Examples

- `EMP-2024-001` - First employee starting in 2024
- `EMP-2024-002` - Second employee starting in 2024
- `EMP-2025-001` - First employee starting in 2025 (resets counter for new year)

## Current Implementation

### Storage
- Uses browser localStorage to track existing Staff IDs
- Maintains a list of all generated Staff IDs to ensure uniqueness
- Automatically resets counter each year based on start date

### Usage in StaffManagement
- Staff ID field is auto-generated when the start date is set
- Field is read-only to prevent manual editing
- Includes helper text: "Auto-generated unique identifier"
- Displayed prominently in the staff directory table

## Files

### Core Implementation
- `src/utils/staffIdGenerator.ts` - Main utility class and interface
- `src/components/StaffManagement.tsx` - Form component that uses the generator

### Testing
- `src/utils/staffIdGenerator.test.ts` - Unit tests for the generator

## API Reference

### StaffIdGenerator Interface
```typescript
interface StaffIdGenerator {
  generateStaffId(startDate: string): Promise<string>;
  validateStaffId(staffId: string): boolean;
  getExistingStaffIds(): Promise<string[]>;
}
```

### LocalStorageStaffIdGenerator Class
```typescript
class LocalStorageStaffIdGenerator implements StaffIdGenerator {
  generateStaffId(startDate: string): Promise<string>    // Generate and store new Staff ID
  validateStaffId(staffId: string): boolean              // Validate Staff ID format
  getExistingStaffIds(): Promise<string[]>               // Get all existing Staff IDs
  clearAllStaffIds(): void                               // Clear all stored Staff IDs
  getNextStaffId(startDate: string): Promise<string>     // Get next ID without storing
  extractYearFromStaffId(staffId: string): number | null // Extract year from Staff ID
  extractSequenceFromStaffId(staffId: string): number | null // Extract sequence from Staff ID
}
```

## Database Integration

When ready to integrate with a database, create a new class that implements the `StaffIdGenerator` interface:

```typescript
class DatabaseStaffIdGenerator implements StaffIdGenerator {
  async generateStaffId(startDate: string): Promise<string> {
    // 1. Query database for max staff number for start year
    // 2. Use database transaction to ensure uniqueness
    // 3. Insert new staff record with generated ID
    // 4. Return generated ID
  }
  
  async getExistingStaffIds(): Promise<string[]> {
    // Query database for all staff IDs
    // SELECT staff_id FROM staff ORDER BY staff_id
  }
  
  validateStaffId(staffId: string): boolean {
    // Same validation logic as current implementation
    const pattern = /^EMP-\d{4}-\d{3}$/;
    return pattern.test(staffId);
  }
}
```

### Database Schema Example
```sql
CREATE TABLE staff (
  id SERIAL PRIMARY KEY,
  staff_id VARCHAR(12) UNIQUE NOT NULL,  -- Format: EMP-YYYY-NNN
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  family_name VARCHAR(100) NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  address_line3 TEXT,
  town VARCHAR(100) NOT NULL,
  post_code VARCHAR(20) NOT NULL,
  phone VARCHAR(20),
  mobile VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  next_of_kin_name VARCHAR(100) NOT NULL,
  next_of_kin_relationship VARCHAR(50) NOT NULL,
  next_of_kin_phone VARCHAR(20),
  next_of_kin_email VARCHAR(255),
  tax_code VARCHAR(10) NOT NULL,
  national_insurance VARCHAR(20) NOT NULL,
  role VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  start_date DATE NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- Driver-specific fields
  employee_number VARCHAR(20),
  date_of_birth DATE,
  license_number VARCHAR(50),
  license_expiry DATE,
  cpc_card_number VARCHAR(50),
  cpc_expiry DATE,
  medical_certificate VARCHAR(50),
  medical_expiry DATE,
  current_vehicle VARCHAR(50),
  total_hours INTEGER,
  total_miles INTEGER,
  safety_score INTEGER,
  performance_rating DECIMAL(3,1),
  notes TEXT
);

-- Index for efficient Staff ID lookups
CREATE INDEX idx_staff_staff_id ON staff(staff_id);
CREATE INDEX idx_staff_start_year ON staff(EXTRACT(YEAR FROM start_date));
```

### Migration Strategy
1. **Phase 1**: Continue using localStorage, but log all generated Staff IDs
2. **Phase 2**: Create database table and migrate existing Staff IDs
3. **Phase 3**: Switch to database-based generation
4. **Phase 4**: Remove localStorage dependency

## Testing

Run the test suite to verify Staff ID generation:
```bash
npm test src/utils/staffIdGenerator.test.ts
```

### Test Coverage
- ✅ Correct format validation
- ✅ Sequential numbering within year
- ✅ Year-based reset
- ✅ Uniqueness enforcement
- ✅ Error handling
- ✅ Storage operations
- ✅ Year and sequence extraction
- ✅ Different start date handling

## Error Handling

The system includes robust error handling:
- Fallback to timestamp-based ID if generation fails
- Validation of Staff ID format
- Graceful handling of localStorage errors
- Console logging for debugging

## Integration with Existing Data

### Current Staff Members
The system has been updated to include Staff IDs for all existing staff members:

- Sarah Johnson: `EMP-2023-001`
- Michael Smith: `EMP-2023-002`
- Lisa Brown: `EMP-2023-003`
- John Driver: `EMP-2020-001`
- Jane Manager: `EMP-2019-001`
- Mike Wilson: `EMP-2021-001`
- Sarah Johnson (Driver): `EMP-2022-001`
- David Davis: `EMP-2021-002`
- Emma Taylor: `EMP-2023-004`

### Form Integration
- Staff ID field appears in the "Add New Staff Member" form
- Auto-generated when start date is selected
- Read-only field with visual indication
- Displayed in staff directory table

## Future Enhancements

### Potential Improvements
1. **Prefix Customization**: Allow configurable prefixes (e.g., `DRV-` for drivers, `MGR-` for managers)
2. **Department Support**: Add department codes (e.g., `EMP-2024-IT-001`)
3. **Location Support**: Add office/location codes (e.g., `EMP-2024-LON-001`)
4. **Bulk Generation**: Generate multiple Staff IDs at once
5. **Audit Trail**: Track who generated which Staff IDs and when

### Integration Points
- **Redux Store**: Store Staff IDs in global state
- **API Endpoints**: RESTful endpoints for Staff ID management
- **Real-time Updates**: WebSocket notifications for new Staff IDs
- **Export/Import**: CSV/Excel export of Staff ID history
- **Reporting**: Staff ID-based reporting and analytics

## Comparison with Job ID Generation

| Feature | Job ID | Staff ID |
|---------|--------|----------|
| Format | `JOB-YYYY-NNN` | `EMP-YYYY-NNN` |
| Year Source | Current Year | Start Date Year |
| Reset Logic | Calendar Year | Start Date Year |
| Usage | Job Allocation Form | Staff Management |
| Display | Hidden (scheduling pages) | Visible in table |

Both systems use the same underlying architecture and can be easily migrated to database storage when needed.
