# HGV Buddy - Supabase Integration Setup Guide

## 🚀 Quick Start

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Choose a region close to your users
4. Set a strong database password

### 2. Get Your Project Credentials
1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy your **Project URL** and **anon public** key

### 3. Set Up Environment Variables
Create a `.env.local` file in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# App Configuration
VITE_APP_NAME=HGV Buddy
VITE_APP_VERSION=1.0.0
```

### 4. Set Up Database Schema
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `database/schema.sql`
3. Click **Run** to create all tables and relationships

### 5. Configure Authentication
1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Configure your **Site URL** (e.g., `http://localhost:5173` for development)
3. Add your domain to **Redirect URLs** if needed

### 6. Set Up Row Level Security (RLS)
The schema includes basic RLS policies, but you may want to customize them:

1. Go to **Authentication** → **Policies** in your Supabase dashboard
2. Review and modify policies based on your security requirements
3. Consider adding role-based access control

## 📊 Database Schema Overview

### Core Tables
- **users** - User accounts and roles
- **companies** - Company information and branding
- **drivers** - Driver profiles and details
- **vehicles** - Fleet vehicles and maintenance
- **jobs** - Job assignments and tracking
- **client_contacts** - Customer and supplier contacts
- **fuel_records** - Fuel consumption tracking
- **driver_vehicle_allocations** - Many-to-many driver-vehicle relationships
- **vehicle_checks** - Vehicle inspection records
- **delivery_addresses** - Delivery locations
- **notifications** - System notifications

### Key Features
- **UUID Primary Keys** - Secure, non-sequential IDs
- **Timestamps** - Automatic created_at/updated_at tracking
- **JSONB Fields** - Flexible data storage for addresses and check data
- **Foreign Keys** - Proper relational integrity
- **Indexes** - Optimized for common queries
- **RLS Policies** - Row-level security for data protection

## 🔧 API Integration

### Services Available
- **AuthService** - User authentication and management
- **CompanyService** - Company information management
- **DriverService** - Driver CRUD operations
- **VehicleService** - Vehicle management
- **JobService** - Job assignment and tracking
- **ClientContactService** - Contact management
- **FuelRecordService** - Fuel tracking

### Usage Example
```typescript
import { DriverService } from '../services/api';

// Get all drivers
const response = await DriverService.getDrivers();
if (response.success) {
  console.log(response.data); // Array of drivers
}

// Create a new driver
const newDriver = await DriverService.createDriver({
  employee_id: 'EMP-2024-001',
  first_name: 'John',
  last_name: 'Smith',
  email: 'john@example.com',
  // ... other fields
});
```

## 🔄 Migration from localStorage

### What's Been Migrated
- ✅ **Authentication** - Now uses Supabase Auth
- ✅ **Company Info** - Stored in database
- ✅ **API Layer** - Complete service layer created

### What Still Needs Migration
- ❌ **Driver Data** - Currently in Redux only
- ❌ **Vehicle Data** - Currently in Redux only
- ❌ **Job Data** - Currently in Redux only
- ❌ **Client Contacts** - Currently in Redux only
- ❌ **Fuel Records** - Currently in Redux only
- ❌ **ID Generation** - Still using localStorage

### Migration Steps
1. Update Redux slices to use API services
2. Replace mock data with real API calls
3. Update components to handle loading/error states
4. Remove localStorage dependencies
5. Add proper error handling and user feedback

## 🛡️ Security Considerations

### Row Level Security (RLS)
- All tables have RLS enabled
- Basic policies allow authenticated users full access
- **Customize policies** based on your security requirements

### Authentication
- Uses Supabase Auth with JWT tokens
- Automatic token refresh
- Secure session management

### Data Validation
- Database constraints ensure data integrity
- TypeScript interfaces provide compile-time validation
- API service layer handles data transformation

## 🚨 Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env.local` is in project root
   - Restart development server after adding variables
   - Check variable names start with `VITE_`

2. **Database Connection Errors**
   - Verify Supabase URL and key are correct
   - Check if project is paused (upgrade if needed)
   - Ensure RLS policies allow your operations

3. **Authentication Issues**
   - Check Site URL configuration in Supabase
   - Verify redirect URLs are set correctly
   - Clear browser storage and try again

4. **Type Errors**
   - Run `npm run build` to check for TypeScript errors
   - Update type definitions if database schema changes
   - Ensure all imports are correct

### Getting Help
- Check Supabase documentation: [docs.supabase.com](https://docs.supabase.com)
- Review error messages in browser console
- Check Supabase logs in dashboard
- Verify database schema matches TypeScript types

## 📈 Next Steps

1. **Complete Migration** - Update remaining Redux slices
2. **Add Real-time Features** - Use Supabase subscriptions
3. **Implement File Storage** - Use Supabase Storage for logos/documents
4. **Add Advanced Queries** - Use Supabase PostgREST features
5. **Set Up Monitoring** - Add error tracking and analytics
6. **Performance Optimization** - Add caching and query optimization

## 🎯 Benefits of Supabase Integration

- **Real-time Data** - Automatic UI updates when data changes
- **Scalable** - Handles growth from startup to enterprise
- **Secure** - Built-in authentication and authorization
- **Type-safe** - Full TypeScript support
- **Real-time** - WebSocket connections for live updates
- **File Storage** - Built-in file upload and management
- **Edge Functions** - Serverless functions for complex logic
- **Analytics** - Built-in usage and performance metrics
