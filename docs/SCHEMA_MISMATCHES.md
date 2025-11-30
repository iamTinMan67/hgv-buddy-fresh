# Critical Schema Mismatches Found

## Summary
The actual database schema is **significantly different** from what the code expects. Many columns that the application tries to insert/update **do not exist** in the database.

## Vehicles Table - CRITICAL ISSUES

### What Actually Exists (from constraints audit):
- `id` (PRIMARY KEY, NOT NULL)
- `registration` (UNIQUE, NOT NULL)
- `permanent_trailer_id` (FOREIGN KEY, nullable)

### What Code Tries to Send (but doesn't exist):
- ❌ `fleet_number` - **DOES NOT EXIST**
- ❌ `make` - **DOES NOT EXIST**
- ❌ `model` - **DOES NOT EXIST**
- ❌ `year` - **DOES NOT EXIST**
- ❌ `type` - **DOES NOT EXIST**
- ❌ `status` - **DOES NOT EXIST**
- ❌ `capacity` - **DOES NOT EXIST**
- ❌ `width` - **DOES NOT EXIST**
- ❌ `height` - **DOES NOT EXIST**
- ❌ `length` - **DOES NOT EXIST**
- ❌ `location` - **DOES NOT EXIST**
- ❌ `notes` - **DOES NOT EXIST**
- ❌ `last_inspection` - **DOES NOT EXIST**
- ❌ `next_mot` - **DOES NOT EXIST**
- ❌ `next_service` - **DOES NOT EXIST**
- ❌ `is_active` - **DOES NOT EXIST**
- ❌ `created_at` - **MAY NOT EXIST**
- ❌ `updated_at` - **MAY NOT EXIST**

### Action Required:
**URGENT**: Create a comprehensive migration to add all missing columns to the vehicles table.

## Jobs Table

### What Actually Exists:
- `id` (PRIMARY KEY, NOT NULL)
- `job_number` (UNIQUE, NOT NULL)
- `title` (NOT NULL)
- `created_by` (FOREIGN KEY, nullable)
- `route_id` (FOREIGN KEY, nullable)

### What Code May Try to Send:
- ❓ `description` - **UNKNOWN IF EXISTS**
- ❓ `status` - **UNKNOWN IF EXISTS**
- ❓ `priority` - **UNKNOWN IF EXISTS**
- ❓ `created_at` - **UNKNOWN IF EXISTS**
- ❓ `updated_at` - **UNKNOWN IF EXISTS**

## Drivers Table

### What Actually Exists:
- `id` (PRIMARY KEY, NOT NULL)
- `staff_id` (UNIQUE, NOT NULL)
- `first_name` (NOT NULL)
- `last_name` (NOT NULL)
- `email` (UNIQUE, NOT NULL)
- `user_id` (FOREIGN KEY, nullable)

### What Code May Try to Send:
- ❓ `phone` - **UNKNOWN IF EXISTS**
- ❓ `status` - **UNKNOWN IF EXISTS**
- ❓ `created_at` - **UNKNOWN IF EXISTS**
- ❓ `updated_at` - **UNKNOWN IF EXISTS**

## Client Contacts Table

### What Actually Exists (from constraints):
- `id` (PRIMARY KEY, NOT NULL)
- `company_name` (NOT NULL)
- `name` (NOT NULL)
- `company` (NOT NULL)
- `address_line1` (NOT NULL)
- `city` (NOT NULL)
- `postcode` (NOT NULL)
- `country` (NOT NULL)
- `category` (NOT NULL, CHECK: 'client'|'supplier'|'partner'|'prospect')
- `status` (NOT NULL, CHECK: 'active'|'inactive'|'lead')

### Constraints:
- `category` must be one of: 'client', 'supplier', 'partner', 'prospect'
- `status` must be one of: 'active', 'inactive', 'lead'

## Delivery Addresses Table

### What Actually Exists:
- `id` (PRIMARY KEY, NOT NULL)
- `address_line1` (NOT NULL)
- `city` (NOT NULL)
- `postcode` (NOT NULL)
- `client_id` (FOREIGN KEY, nullable)

## Immediate Actions Required

1. **Run `database/migrations/get_full_schema.sql`** to get complete column list
2. **Create comprehensive vehicles table migration** to add all missing columns
3. **Update TypeScript types** in `src/lib/supabase.ts` to match actual schema
4. **Test all forms** that create/update records:
   - FleetManagement (vehicles)
   - JobAllocationForm (jobs, client_contacts)
   - StaffManagement (users, drivers)
   - DeliveryAddressesService (delivery_addresses)

## Migration Priority

1. **HIGH**: Vehicles table - add all missing columns
2. **MEDIUM**: Verify and add missing columns to jobs, drivers, users tables
3. **LOW**: Update TypeScript types to match reality

