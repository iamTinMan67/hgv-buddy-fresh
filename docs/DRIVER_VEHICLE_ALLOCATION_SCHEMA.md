# Driver-Vehicle Allocation Database Schema

## Overview
This document outlines the database schema for implementing a many-to-many relationship between drivers and vehicles, allowing comprehensive tracking of allocations, schedules, manifests, and job consignments.

## Core Tables

### 1. Drivers Table
```sql
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_number VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address_line1 TEXT,
  address_line2 TEXT,
  address_line3 TEXT,
  town VARCHAR(100),
  city VARCHAR(100),
  postcode VARCHAR(10),
  date_of_birth DATE,
  hire_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'terminated')),
  role VARCHAR(20) DEFAULT 'driver' CHECK (role IN ('driver', 'senior_driver', 'trainer', 'supervisor')),
  license_number VARCHAR(50),
  license_expiry DATE,
  cpc_card_number VARCHAR(50),
  cpc_expiry DATE,
  medical_certificate VARCHAR(100),
  medical_expiry DATE,
  total_hours DECIMAL(10,2) DEFAULT 0,
  total_miles DECIMAL(10,2) DEFAULT 0,
  safety_score DECIMAL(3,1) DEFAULT 0,
  performance_rating DECIMAL(3,1) DEFAULT 0,
  notes TEXT,
  emergency_contact_name VARCHAR(100),
  emergency_contact_relationship VARCHAR(50),
  emergency_contact_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_drivers_employee_number ON drivers(employee_number);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_role ON drivers(role);
CREATE INDEX idx_drivers_license_expiry ON drivers(license_expiry);
CREATE INDEX idx_drivers_cpc_expiry ON drivers(cpc_expiry);
CREATE INDEX idx_drivers_medical_expiry ON drivers(medical_expiry);
```

### 2. Vehicles Table
```sql
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_number VARCHAR(20) UNIQUE NOT NULL,
  registration VARCHAR(20) UNIQUE NOT NULL,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('HGV', 'Articulated', 'PCV', 'PSV', 'Van', 'Car')),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'out_of_service')),
  capacity DECIMAL(10,2) NOT NULL, -- in tons
  last_inspection DATE,
  next_mot DATE,
  next_service DATE,
  location TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_vehicles_fleet_number ON vehicles(fleet_number);
CREATE INDEX idx_vehicles_registration ON vehicles(registration);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_type ON vehicles(type);
CREATE INDEX idx_vehicles_next_mot ON vehicles(next_mot);
CREATE INDEX idx_vehicles_next_service ON vehicles(next_service);
```

### 3. Driver-Vehicle Allocations Table (Junction Table)
```sql
CREATE TABLE driver_vehicle_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  allocation_date DATE NOT NULL,
  deallocation_date DATE,
  schedule_title VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'scheduled')),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure no overlapping active allocations for the same driver-vehicle combination
  CONSTRAINT unique_active_allocation UNIQUE (driver_id, vehicle_id, allocation_date),
  CONSTRAINT valid_allocation_dates CHECK (deallocation_date IS NULL OR deallocation_date >= allocation_date)
);

-- Indexes for performance
CREATE INDEX idx_allocations_driver_id ON driver_vehicle_allocations(driver_id);
CREATE INDEX idx_allocations_vehicle_id ON driver_vehicle_allocations(vehicle_id);
CREATE INDEX idx_allocations_allocation_date ON driver_vehicle_allocations(allocation_date);
CREATE INDEX idx_allocations_status ON driver_vehicle_allocations(status);
CREATE INDEX idx_allocations_driver_vehicle ON driver_vehicle_allocations(driver_id, vehicle_id);
```

### 4. Allocation Schedules Table
```sql
CREATE TABLE allocation_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'completed', 'cancelled')),
  route_plan_id UUID REFERENCES route_plans(id),
  total_jobs INTEGER DEFAULT 0,
  estimated_distance DECIMAL(10,2) DEFAULT 0, -- in miles
  estimated_duration INTEGER DEFAULT 0, -- in minutes
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_schedule_dates CHECK (end_date >= start_date)
);

-- Indexes for performance
CREATE INDEX idx_schedules_driver_id ON allocation_schedules(driver_id);
CREATE INDEX idx_schedules_vehicle_id ON allocation_schedules(vehicle_id);
CREATE INDEX idx_schedules_start_date ON allocation_schedules(start_date);
CREATE INDEX idx_schedules_end_date ON allocation_schedules(end_date);
CREATE INDEX idx_schedules_status ON allocation_schedules(status);
CREATE INDEX idx_schedules_driver_vehicle ON allocation_schedules(driver_id, vehicle_id);
```

### 5. Schedule Jobs Table (Many-to-Many between Schedules and Jobs)
```sql
CREATE TABLE schedule_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES allocation_schedules(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  scheduled_time TIME NOT NULL,
  estimated_duration INTEGER NOT NULL, -- in minutes
  sequence_order INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  actual_start_time TIMESTAMP,
  actual_end_time TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_job_in_schedule UNIQUE (schedule_id, job_id),
  CONSTRAINT valid_sequence_order CHECK (sequence_order > 0)
);

-- Indexes for performance
CREATE INDEX idx_schedule_jobs_schedule_id ON schedule_jobs(schedule_id);
CREATE INDEX idx_schedule_jobs_job_id ON schedule_jobs(job_id);
CREATE INDEX idx_schedule_jobs_sequence_order ON schedule_jobs(sequence_order);
CREATE INDEX idx_schedule_jobs_status ON schedule_jobs(status);
```

## Advanced Query Examples

### 1. Get All Vehicle Allocations for a Driver
```sql
SELECT 
  va.id,
  v.fleet_number,
  v.registration,
  v.make,
  v.model,
  va.allocation_date,
  va.deallocation_date,
  va.schedule_title,
  va.status,
  COUNT(sj.job_id) as total_jobs,
  SUM(CASE WHEN sj.status = 'completed' THEN 1 ELSE 0 END) as completed_jobs
FROM driver_vehicle_allocations va
JOIN vehicles v ON va.vehicle_id = v.id
LEFT JOIN allocation_schedules s ON va.driver_id = s.driver_id AND va.vehicle_id = s.vehicle_id
LEFT JOIN schedule_jobs sj ON s.id = sj.schedule_id
WHERE va.driver_id = $1
GROUP BY va.id, v.fleet_number, v.registration, v.make, v.model, va.allocation_date, va.deallocation_date, va.schedule_title, va.status
ORDER BY va.allocation_date DESC;
```

### 2. Get All Driver Allocations for a Vehicle
```sql
SELECT 
  da.id,
  d.employee_number,
  d.first_name,
  d.last_name,
  da.allocation_date,
  da.deallocation_date,
  da.schedule_title,
  da.status,
  COUNT(sj.job_id) as total_jobs,
  SUM(CASE WHEN sj.status = 'completed' THEN 1 ELSE 0 END) as completed_jobs,
  SUM(CASE WHEN sj.actual_duration IS NOT NULL THEN sj.actual_duration ELSE sj.estimated_duration END) as total_duration
FROM driver_vehicle_allocations da
JOIN drivers d ON da.driver_id = d.id
LEFT JOIN allocation_schedules s ON da.driver_id = s.driver_id AND da.vehicle_id = s.vehicle_id
LEFT JOIN schedule_jobs sj ON s.id = sj.schedule_id
WHERE da.vehicle_id = $1
GROUP BY da.id, d.employee_number, d.first_name, d.last_name, da.allocation_date, da.deallocation_date, da.schedule_title, da.status
ORDER BY da.allocation_date DESC;
```

### 3. Get Complete Manifest for a Schedule
```sql
SELECT 
  s.id as schedule_id,
  s.title as schedule_title,
  s.start_date,
  d.first_name || ' ' || d.last_name as driver_name,
  d.employee_number,
  v.registration as vehicle_registration,
  v.make as vehicle_make,
  v.model as vehicle_model,
  j.job_number,
  j.customer_name,
  j.pickup_location,
  j.delivery_location,
  sj.scheduled_time,
  sj.estimated_duration,
  sj.status as job_status,
  j.cargo_type,
  j.cargo_weight,
  j.cargo_volume,
  j.special_requirements,
  sj.sequence_order
FROM allocation_schedules s
JOIN drivers d ON s.driver_id = d.id
JOIN vehicles v ON s.vehicle_id = v.id
JOIN schedule_jobs sj ON s.id = sj.schedule_id
JOIN jobs j ON sj.job_id = j.id
WHERE s.id = $1
ORDER BY sj.sequence_order;
```

### 4. Get Job Consignment Details
```sql
SELECT 
  j.id as job_id,
  j.job_number,
  s.title as schedule_title,
  d.first_name || ' ' || d.last_name as driver_name,
  v.registration as vehicle_registration,
  j.customer_name,
  j.pickup_location,
  j.delivery_location,
  j.scheduled_date,
  j.scheduled_time,
  j.estimated_duration,
  j.status,
  j.cargo_type,
  j.cargo_weight,
  j.cargo_volume,
  j.special_requirements,
  ci.description as item_description,
  ci.quantity,
  ci.unit,
  ci.weight as item_weight,
  ci.volume as item_volume,
  ci.is_fragile,
  ci.is_oversized,
  ci.special_handling
FROM jobs j
JOIN schedule_jobs sj ON j.id = sj.job_id
JOIN allocation_schedules s ON sj.schedule_id = s.id
JOIN drivers d ON s.driver_id = d.id
JOIN vehicles v ON s.vehicle_id = v.id
LEFT JOIN consignment_items ci ON j.id = ci.job_id
WHERE s.id = $1
ORDER BY sj.sequence_order, ci.id;
```

### 5. Get Active Allocations with Overlap Detection
```sql
SELECT 
  d1.first_name || ' ' || d1.last_name as driver1_name,
  d2.first_name || ' ' || d2.last_name as driver2_name,
  v1.registration as vehicle1_registration,
  v2.registration as vehicle2_registration,
  a1.allocation_date,
  a1.deallocation_date,
  a2.allocation_date as overlap_start,
  a2.deallocation_date as overlap_end
FROM driver_vehicle_allocations a1
JOIN driver_vehicle_allocations a2 ON 
  (a1.driver_id = a2.driver_id OR a1.vehicle_id = a2.vehicle_id) AND
  a1.id != a2.id
JOIN drivers d1 ON a1.driver_id = d1.id
JOIN drivers d2 ON a2.driver_id = d2.id
JOIN vehicles v1 ON a1.vehicle_id = v1.id
JOIN vehicles v2 ON a2.vehicle_id = v2.id
WHERE a1.status = 'active' 
  AND a2.status = 'active'
  AND a1.allocation_date <= COALESCE(a2.deallocation_date, CURRENT_DATE)
  AND COALESCE(a1.deallocation_date, CURRENT_DATE) >= a2.allocation_date;
```

## Database Policies and Constraints

### 1. Row Level Security (RLS) Policies
```sql
-- Enable RLS on all tables
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_vehicle_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_jobs ENABLE ROW LEVEL SECURITY;

-- Example policy for drivers table
CREATE POLICY drivers_select_policy ON drivers
  FOR SELECT USING (
    auth.role() = 'admin' OR 
    auth.uid() IN (
      SELECT user_id FROM user_driver_assignments WHERE driver_id = id
    )
  );
```

### 2. Check Constraints
```sql
-- Ensure no driver is allocated to multiple vehicles on the same date
ALTER TABLE driver_vehicle_allocations 
ADD CONSTRAINT no_driver_overlap CHECK (
  NOT EXISTS (
    SELECT 1 FROM driver_vehicle_allocations dva2
    WHERE dva2.driver_id = driver_id
      AND dva2.id != id
      AND dva2.status = 'active'
      AND allocation_date <= COALESCE(dva2.deallocation_date, CURRENT_DATE)
      AND COALESCE(deallocation_date, CURRENT_DATE) >= dva2.allocation_date
  )
);

-- Ensure no vehicle is allocated to multiple drivers on the same date
ALTER TABLE driver_vehicle_allocations 
ADD CONSTRAINT no_vehicle_overlap CHECK (
  NOT EXISTS (
    SELECT 1 FROM driver_vehicle_allocations dva2
    WHERE dva2.vehicle_id = vehicle_id
      AND dva2.id != id
      AND dva2.status = 'active'
      AND allocation_date <= COALESCE(dva2.deallocation_date, CURRENT_DATE)
      AND COALESCE(deallocation_date, CURRENT_DATE) >= dva2.allocation_date
  )
);
```

### 3. Triggers for Data Integrity
```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_allocations_updated_at BEFORE UPDATE ON driver_vehicle_allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON allocation_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedule_jobs_updated_at BEFORE UPDATE ON schedule_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Performance Optimization

### 1. Composite Indexes
```sql
-- Optimize common query patterns
CREATE INDEX idx_allocations_driver_vehicle_date ON driver_vehicle_allocations(driver_id, vehicle_id, allocation_date);
CREATE INDEX idx_allocations_vehicle_driver_date ON driver_vehicle_allocations(vehicle_id, driver_id, allocation_date);
CREATE INDEX idx_schedules_driver_vehicle_dates ON allocation_schedules(driver_id, vehicle_id, start_date, end_date);
CREATE INDEX idx_schedule_jobs_schedule_sequence ON schedule_jobs(schedule_id, sequence_order);
```

### 2. Partial Indexes
```sql
-- Only index active allocations
CREATE INDEX idx_active_allocations ON driver_vehicle_allocations(driver_id, vehicle_id) 
WHERE status = 'active';

-- Only index future schedules
CREATE INDEX idx_future_schedules ON allocation_schedules(driver_id, vehicle_id, start_date) 
WHERE start_date >= CURRENT_DATE;
```

### 3. Materialized Views for Complex Queries
```sql
-- Materialized view for driver allocation summary
CREATE MATERIALIZED VIEW driver_allocation_summary AS
SELECT 
  d.id as driver_id,
  d.first_name || ' ' || d.last_name as driver_name,
  d.employee_number,
  COUNT(DISTINCT va.vehicle_id) as total_vehicles_allocated,
  COUNT(va.id) as total_allocations,
  SUM(CASE WHEN va.status = 'active' THEN 1 ELSE 0 END) as active_allocations,
  MAX(va.allocation_date) as last_allocation_date
FROM drivers d
LEFT JOIN driver_vehicle_allocations va ON d.id = va.driver_id
GROUP BY d.id, d.first_name, d.last_name, d.employee_number;

-- Refresh materialized view
REFRESH MATERIALIZED VIEW driver_allocation_summary;
```

## API Endpoints

### 1. Driver Allocations
- `GET /api/drivers/:id/allocations` - Get all vehicle allocations for a driver
- `GET /api/drivers/:id/allocations/active` - Get active vehicle allocations for a driver
- `GET /api/drivers/:id/allocations/history` - Get allocation history for a driver

### 2. Vehicle Allocations
- `GET /api/vehicles/:id/allocations` - Get all driver allocations for a vehicle
- `GET /api/vehicles/:id/allocations/active` - Get active driver allocations for a vehicle
- `GET /api/vehicles/:id/allocations/history` - Get allocation history for a vehicle

### 3. Schedules and Manifests
- `GET /api/schedules/:id` - Get schedule details
- `GET /api/schedules/:id/manifest` - Get manifest for a schedule
- `GET /api/schedules/:id/consignments` - Get job consignments for a schedule

### 4. Allocation Management
- `POST /api/allocations` - Create new allocation
- `PUT /api/allocations/:id` - Update allocation
- `PATCH /api/allocations/:id/deactivate` - Deactivate allocation
- `DELETE /api/allocations/:id` - Delete allocation

This schema provides a robust foundation for managing complex driver-vehicle relationships while maintaining data integrity and performance for deep queries.
