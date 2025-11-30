# Agency Contracts Implementation

## Overview

This document describes the implementation of agency contract management functionality, allowing companies to use agency contracts to fulfill additional staff requirements. The system tracks hours worked, standard and overtime hourly rates, staff qualifications, agency contact details, and bank details.

## Database Schema

### Tables Created

1. **agency_contracts** - Stores agency contract information
   - Contract details (number, dates, status)
   - Agency contact information
   - Agency address
   - Bank details for payments
   - Hourly rates (standard and overtime)
   - Standard working hours configuration

2. **agency_staff** - Stores individual agency staff members
   - Staff identification and contact details
   - Address information
   - Qualifications (stored as JSONB)
   - Licenses (stored as JSONB)
   - Status and dates

3. **agency_timesheets** - Weekly timesheets for agency staff
   - Week period (start/end dates)
   - Hours breakdown (total, standard, overtime)
   - Rates applied (snapshot at time of timesheet)
   - Payment calculations
   - Approval workflow status

4. **agency_timesheet_entries** - Individual day entries within timesheets
   - Date and time information
   - Break and lunch durations
   - Calculated standard/overtime minutes
   - Pay calculations per entry

### Key Features

- Auto-generated contract numbers (format: AGY-YYYY-MM-###)
- Automatic updated_at timestamp triggers
- Indexes for performance optimization
- Foreign key relationships with cascade deletes
- Unique constraints to prevent duplicates

## Service Layer

### AgencyContractService (`src/services/agencyContractService.ts`)

Provides comprehensive CRUD operations for:
- **Contracts**: Create, read, update, delete agency contracts
- **Staff**: Manage agency staff members with qualifications and licenses
- **Timesheets**: Create and manage timesheets with automatic hour calculations
- **Timesheet Entries**: Individual day entries with automatic standard/overtime calculation

#### Key Methods

- `getAllContracts()` - Retrieve all agency contracts
- `getContractById(id)` - Get a specific contract
- `createContract(contract, userId)` - Create new contract
- `updateContract(id, updates, userId)` - Update existing contract
- `deleteContract(id)` - Delete contract (cascades to staff and timesheets)
- `getStaffByContract(contractId)` - Get all staff for a contract
- `createStaff(staff, userId)` - Add new agency staff member
- `updateStaff(id, updates, userId)` - Update staff member
- `calculateEntryHours(...)` - Calculate standard vs overtime hours
- `saveTimesheetEntry(...)` - Save/update timesheet entry with automatic calculations
- `recalculateTimesheet(timesheetId)` - Recalculate totals from entries

#### Hour Calculation Logic

The service automatically calculates standard vs overtime hours based on:
- Standard start/end times from contract
- Weekend detection (all weekend hours are overtime)
- Early start times (before standard start = overtime)
- Late finish times (after standard end = overtime)
- Break and lunch deductions

## React Component

### AgencyContractManagement (`src/components/AgencyContractManagement.tsx`)

A comprehensive management interface with three main tabs:

#### 1. Contracts Tab
- List all agency contracts with filtering and search
- View contract details (agency name, contact, rates, status)
- Add/Edit/Delete contracts (admin only)
- Status filtering (active, inactive, expired, terminated)
- Search by agency name or contract number

#### 2. Staff Tab
- Select a contract to view associated staff
- List all staff members for selected contract
- Add/Edit/Delete staff members (admin only)
- View staff details including qualifications count
- Status management (active, inactive, unavailable, terminated)

#### 3. Timesheets Tab
- Placeholder for future timesheet management
- Will allow viewing and managing timesheets for agency staff
- Track hours worked with automatic standard/overtime calculation

#### Features

- **Form Validation**: Required fields are validated before saving
- **Error Handling**: User-friendly error messages
- **Loading States**: Loading indicators during async operations
- **Confirmation Dialogs**: Delete operations require confirmation
- **Responsive Design**: Works on different screen sizes
- **Role-Based Access**: Only admins can add/edit/delete

## TypeScript Types

### Updated Files

1. **src/lib/supabase.ts**
   - Added TypeScript types for all four new tables
   - Includes Row, Insert, and Update types for each table
   - Maintains consistency with existing database types

## Database Migration

### File: `database/migrations/create_agency_contracts_tables.sql`

Run this migration in your Supabase SQL editor to create all necessary tables, indexes, triggers, and functions.

#### Migration Steps

1. Connect to your Supabase project
2. Open the SQL Editor
3. Copy and paste the contents of `create_agency_contracts_tables.sql`
4. Execute the migration
5. Verify tables were created successfully

## Integration Points

### To Add to Dashboard

To make this component accessible from the main dashboard, you'll need to:

1. **Add to dynamic imports** (`src/utils/dynamicImports.tsx`):
```typescript
AgencyContractManagement: lazy(() => import('../components/AgencyContractManagement')),
```

2. **Add to Dashboard component** (`src/components/Dashboard.tsx`):
   - Add state: `const [showAgencyContracts, setShowAgencyContracts] = useState(false);`
   - Add card in the dashboard grid
   - Add conditional rendering similar to other hubs

3. **Add card in dashboard**:
```tsx
<Card>
  <CardContent>
    <Button onClick={() => setShowAgencyContracts(true)}>
      <Business /> Agency Contracts
    </Button>
  </CardContent>
</Card>
```

## Usage Examples

### Creating an Agency Contract

1. Navigate to Agency Contract Management
2. Click "Add Contract"
3. Fill in:
   - Agency information (name, contact details)
   - Agency address
   - Bank details for payments
   - Contract dates
   - Standard and overtime hourly rates
   - Standard working hours configuration
4. Click "Save"

### Adding Agency Staff

1. Go to "Staff" tab
2. Select a contract from the dropdown
3. Click "Add Staff"
4. Fill in:
   - Staff reference number
   - Name and contact details
   - Address (optional)
   - Start date
   - Status
5. Click "Save"
6. Qualifications and licenses can be added later via edit

### Managing Timesheets

1. Go to "Timesheets" tab (when implemented)
2. Select contract and staff member
3. Select week
4. Add daily entries with start/end times
5. System automatically calculates:
   - Standard vs overtime hours
   - Total pay based on rates
6. Submit for approval

## Data Flow

```
Agency Contract
    ↓
Agency Staff (multiple staff per contract)
    ↓
Agency Timesheets (weekly timesheets per staff)
    ↓
Timesheet Entries (daily entries per timesheet)
```

## Future Enhancements

1. **Timesheet Management UI**: Complete the timesheets tab with full CRUD
2. **Qualification Management**: UI for adding/editing qualifications and licenses
3. **Invoice Generation**: Generate invoices for agency payments
4. **Reporting**: Reports on agency costs, hours worked, etc.
5. **Notifications**: Alerts for contract expiry, timesheet approval, etc.
6. **Document Upload**: Upload qualification/license documents
7. **Bulk Operations**: Bulk import of staff or timesheet entries
8. **Integration with Jobs**: Link timesheet entries to specific jobs

## Security Considerations

- Only admin users can create/edit/delete contracts and staff
- All operations are logged with user IDs
- Foreign key constraints ensure data integrity
- Cascade deletes prevent orphaned records

## Testing Recommendations

1. Test contract creation with various data combinations
2. Test staff management with qualifications/licenses
3. Test timesheet calculations for different scenarios:
   - Standard hours only
   - Overtime hours (early start, late finish, weekends)
   - Mixed standard/overtime
4. Test edge cases:
   - Empty timesheets
   - Zero hours
   - Very long shifts
5. Test permissions (admin vs non-admin)

## Notes

- Contract numbers are auto-generated in format: `AGY-YYYY-MM-###`
- Qualifications and licenses are stored as JSONB arrays
- Timesheet calculations use the contract's rates at the time of creation
- All timestamps are automatically managed by database triggers
- The system follows the same patterns as existing staff management for consistency

