# Staff Management Database Schema

## Overview
The Staff Management system uses a comprehensive database structure to store all detailed staff information across multiple related tables.

## Database Tables

### 1. `users` Table (Authentication)
- **Purpose**: Basic user authentication and role management
- **Fields**:
  - `id` (UUID) - Primary key
  - `email` (VARCHAR) - Unique email address
  - `first_name` (VARCHAR) - First name
  - `last_name` (VARCHAR) - Last name
  - `role` (VARCHAR) - User role (admin, driver, manager, owner, supa_admin)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)

### 2. `staff_members` Table (Detailed Staff Information)
- **Purpose**: Comprehensive staff details from the multi-page form
- **Fields**:
  - `id` (UUID) - Primary key
  - `user_id` (UUID) - Foreign key to users table
  - `staff_id` (VARCHAR) - Auto-generated staff ID (EMP-YYYY-MM-001)
  
  **Personal Information**:
  - `first_name`, `middle_name`, `family_name`
  
  **Address Information**:
  - `address_line1`, `address_line2`, `address_line3`
  - `town`, `postcode`, `country`
  
  **Contact Information**:
  - `phone`, `mobile`, `email`
  
  **Next of Kin Information**:
  - `next_of_kin_name`, `next_of_kin_relationship`
  - `next_of_kin_phone`, `next_of_kin_email`
  
  **Employment Information**:
  - `role`, `is_active`, `start_date`
  
  **Tax Information**:
  - `tax_code`, `national_insurance`
  
  **Driver-specific Information**:
  - `employee_number`, `date_of_birth`
  - `license_number`, `license_expiry`
  
  **Bank Details**:
  - `bank_account_number`, `bank_sort_code`, `bank_name`
  
  **Additional**:
  - `notes`, `created_at`, `updated_at`

### 3. `staff_qualifications` Table (Multiple Qualifications)
- **Purpose**: Store multiple qualifications per staff member
- **Fields**:
  - `id` (UUID) - Primary key
  - `staff_member_id` (UUID) - Foreign key to staff_members
  - `name` (VARCHAR) - Qualification name
  - `issuing_body` (VARCHAR) - Issuing organization
  - `issue_date` (DATE) - When qualification was issued
  - `expiry_date` (DATE) - When qualification expires (optional)
  - `document_url` (TEXT) - Link to qualification document
  - `created_at`, `updated_at`

### 4. `staff_licenses` Table (Multiple Licenses)
- **Purpose**: Store multiple licenses per staff member
- **Fields**:
  - `id` (UUID) - Primary key
  - `staff_member_id` (UUID) - Foreign key to staff_members
  - `type` (VARCHAR) - License type (e.g., "HGV Class 1", "Forklift")
  - `number` (VARCHAR) - License number
  - `issuing_body` (VARCHAR) - Issuing authority
  - `issue_date` (DATE) - When license was issued
  - `expiry_date` (DATE) - When license expires
  - `document_url` (TEXT) - Link to license document
  - `created_at`, `updated_at`

## Form Pages Mapping

### Page 0: Personal, Address and Contact Information
- Maps to: `staff_members` table fields
- Fields: first_name, family_name, address, contact details

### Page 1: Next of Kin Information
- Maps to: `staff_members` table next_of_kin fields
- Fields: next_of_kin_name, relationship, phone, email

### Page 2: Employment Details
- Maps to: `staff_members` table + `users` table
- Fields: role, start_date, tax_code, national_insurance, login credentials

### Page 3: Qualifications and Licenses
- Maps to: `staff_qualifications` and `staff_licenses` tables
- Fields: Multiple qualifications and licenses with full details

### Page 4: Bank Details
- Maps to: `staff_members` table bank fields
- Fields: account_number, sort_code, bank_name

### Page 5: Review and Submit
- Displays all collected information for final review

## Data Flow

1. **Create Staff Member**:
   - Create record in `users` table (for authentication)
   - Create detailed record in `staff_members` table
   - Create multiple records in `staff_qualifications` table (if any)
   - Create multiple records in `staff_licenses` table (if any)

2. **Load Staff Members**:
   - Join `staff_members` with `staff_qualifications` and `staff_licenses`
   - Transform data to match frontend interface

3. **Update Staff Member**:
   - Update `users` table
   - Update `staff_members` table
   - Delete and recreate qualifications/licenses (if changed)

4. **Delete Staff Member**:
   - Delete from `staff_licenses` (cascade)
   - Delete from `staff_qualifications` (cascade)
   - Delete from `staff_members` (cascade)
   - Delete from `users` (cascade)

## Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Foreign key constraints** ensure data integrity
- **Cascade deletes** maintain referential integrity
- **Indexes** on frequently queried fields for performance
- **Triggers** for automatic timestamp updates

## Setup Instructions

1. Run `database/add_staff_members_table.sql` in Supabase SQL Editor
2. This creates all tables, indexes, triggers, and RLS policies
3. Existing users are automatically migrated to the new structure
4. Staff Management component is updated to use the new schema

## Notes

- You (super admin) and Adam (business owner) are NOT added as staff members
- Only new staff added through the form will have detailed records
- All form data is properly normalized across multiple tables
- The system supports unlimited qualifications and licenses per staff member
