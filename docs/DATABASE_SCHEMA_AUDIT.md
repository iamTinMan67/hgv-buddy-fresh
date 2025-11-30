# Database Schema Audit

## Issue Identified
The TypeScript types in `src/lib/supabase.ts` do not match the actual Supabase database schema, causing insert/update failures.

## Vehicles Table Mismatches Found

### TypeScript Types (src/lib/supabase.ts)
```typescript
vehicles: {
  type: 'truck' | 'trailer' | 'van';
  status: 'active' | 'maintenance' | 'retired';
  capacity: number; // Required in Insert
  // Missing: fleet_number, width, height, length, notes, location
}
```

### Actual Database Schema (from errors)
- `type`: Should accept 'HGV', 'Articulated', 'PCV', 'PSV', 'Van', 'Car', 'Rigid'
- `status`: Should accept 'available', 'in_use', 'maintenance', 'out_of_service'
- `capacity`: Column doesn't exist (needs migration)
- `fleet_number`: Column doesn't exist (needs migration)
- `width`, `height`, `length`: Don't exist (needs migration)
- `notes`: Exists but not in TypeScript types
- `location`: Exists but not in TypeScript types

## Forms/Components That Need Auditing

### 1. FleetManagement.tsx
- ✅ Fixed: Added fleet_number, capacity, dimensions
- ⚠️ Needs: TypeScript type updates

### 2. JobAllocationForm.tsx
- Creates jobs via JobService
- Creates client_contacts
- ⚠️ Needs: Verify job table schema matches

### 3. TrailerFleet.tsx
- Creates vehicles (same issues as FleetManagement)
- ⚠️ Needs: Same fixes as FleetManagement

### 4. StaffManagement.tsx
- Creates/updates staff/users
- ⚠️ Needs: Verify users/staff table schema

### 5. DeliveryAddressesService
- Creates delivery_addresses
- ✅ Has comments about missing 'name' column
- ⚠️ Needs: Full schema verification

## Action Items

1. **Run SQL query to get actual schema:**
```sql
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('vehicles', 'jobs', 'users', 'drivers', 'client_contacts', 'delivery_addresses')
ORDER BY table_name, ordinal_position;
```

2. **Update TypeScript types** in `src/lib/supabase.ts` to match actual schema

3. **Create migrations** for missing columns

4. **Audit all Service classes:**
   - VehicleService
   - JobService
   - DriverService
   - StaffService (if exists)
   - DeliveryAddressesService

5. **Add validation** to prevent sending non-existent columns

