# Driver-Vehicle Allocation Deep Queries

This document provides comprehensive SQL queries for implementing the many-to-many relationship between drivers and vehicles, including allocation tracking, manifests, schedules, and job consignments.

## Table Structure Overview

```sql
-- Core tables for the allocation system
CREATE TABLE driver_vehicle_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES drivers(id),
  vehicle_id UUID REFERENCES vehicles(id),
  allocation_date DATE NOT NULL,
  deallocation_date DATE,
  schedule_title VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE allocation_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  driver_id UUID REFERENCES drivers(id),
  vehicle_id UUID REFERENCES vehicles(id),
  status VARCHAR(50) DEFAULT 'scheduled',
  total_jobs INTEGER DEFAULT 0,
  estimated_distance DECIMAL(10,2),
  estimated_duration INTEGER, -- in minutes
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE manifests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES allocation_schedules(id),
  date DATE NOT NULL,
  driver_id UUID REFERENCES drivers(id),
  vehicle_id UUID REFERENCES vehicles(id),
  total_jobs INTEGER DEFAULT 0,
  total_weight DECIMAL(10,2),
  total_volume DECIMAL(10,2),
  route_notes TEXT,
  driver_notes TEXT,
  management_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE manifest_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_id UUID REFERENCES manifests(id),
  job_id UUID REFERENCES jobs(id),
  job_number VARCHAR(100),
  customer_name VARCHAR(255),
  pickup_location TEXT,
  delivery_location TEXT,
  scheduled_time TIME,
  estimated_duration INTEGER,
  status VARCHAR(50),
  cargo_type VARCHAR(100),
  cargo_weight DECIMAL(10,2),
  special_requirements TEXT
);

CREATE TABLE job_consignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id),
  schedule_id UUID REFERENCES allocation_schedules(id),
  driver_id UUID REFERENCES drivers(id),
  vehicle_id UUID REFERENCES vehicles(id),
  customer_name VARCHAR(255),
  pickup_location TEXT,
  delivery_location TEXT,
  scheduled_date DATE,
  scheduled_time TIME,
  estimated_duration INTEGER,
  status VARCHAR(50),
  cargo_type VARCHAR(100),
  cargo_weight DECIMAL(10,2),
  cargo_volume DECIMAL(10,2),
  special_requirements TEXT,
  notes TEXT,
  driver_notes TEXT,
  management_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE consignment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consignment_id UUID REFERENCES job_consignments(id),
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit VARCHAR(50),
  weight DECIMAL(10,2),
  volume DECIMAL(10,2),
  is_fragile BOOLEAN DEFAULT FALSE,
  is_oversized BOOLEAN DEFAULT FALSE,
  special_handling TEXT
);
```

## Core Queries

### 1. Get All Vehicle Allocations for a Driver

```sql
-- Basic allocation list
SELECT 
  dva.id,
  dva.allocation_date,
  dva.deallocation_date,
  dva.schedule_title,
  dva.status,
  v.registration,
  v.make,
  v.model,
  v.type
FROM driver_vehicle_allocations dva
JOIN vehicles v ON dva.vehicle_id = v.id
WHERE dva.driver_id = $1
ORDER BY dva.allocation_date DESC;

-- With schedule information
SELECT 
  dva.*,
  v.registration,
  v.make,
  v.model,
  v.type,
  as.title as schedule_title,
  as.description as schedule_description,
  as.start_date as schedule_start,
  as.end_date as schedule_end,
  as.total_jobs,
  as.estimated_distance,
  as.estimated_duration
FROM driver_vehicle_allocations dva
JOIN vehicles v ON dva.vehicle_id = v.id
LEFT JOIN allocation_schedules as ON dva.schedule_title = as.title
WHERE dva.driver_id = $1
ORDER BY dva.allocation_date DESC;
```

### 2. Get All Driver Allocations for a Vehicle

```sql
-- Basic vehicle allocation list
SELECT 
  dva.id,
  dva.allocation_date,
  dva.deallocation_date,
  dva.schedule_title,
  dva.status,
  d.first_name,
  d.last_name,
  d.employee_number
FROM driver_vehicle_allocations dva
JOIN drivers d ON dva.driver_id = d.id
WHERE dva.vehicle_id = $1
ORDER BY dva.allocation_date DESC;

-- With driver details and schedule info
SELECT 
  dva.*,
  d.first_name,
  d.last_name,
  d.employee_number,
  d.phone,
  d.email,
  as.title as schedule_title,
  as.description as schedule_description,
  as.total_jobs,
  as.estimated_distance
FROM driver_vehicle_allocations dva
JOIN drivers d ON dva.driver_id = d.id
LEFT JOIN allocation_schedules as ON dva.schedule_title = as.title
WHERE dva.vehicle_id = $1
ORDER BY dva.allocation_date DESC;
```

### 3. Get Allocation History with Date Range

```sql
-- Driver allocation history
SELECT 
  dva.*,
  v.registration,
  v.make,
  v.model,
  as.title as schedule_title,
  as.total_jobs,
  as.estimated_distance
FROM driver_vehicle_allocations dva
JOIN vehicles v ON dva.vehicle_id = v.id
LEFT JOIN allocation_schedules as ON dva.schedule_title = as.title
WHERE dva.driver_id = $1
  AND dva.allocation_date BETWEEN $2 AND $3
ORDER BY dva.allocation_date DESC;

-- Vehicle allocation history
SELECT 
  dva.*,
  d.first_name,
  d.last_name,
  d.employee_number,
  as.title as schedule_title,
  as.total_jobs,
  as.estimated_distance
FROM driver_vehicle_allocations dva
JOIN drivers d ON dva.driver_id = d.id
LEFT JOIN allocation_schedules as ON dva.schedule_title = as.title
WHERE dva.vehicle_id = $1
  AND dva.allocation_date BETWEEN $2 AND $3
ORDER BY dva.allocation_date DESC;
```

## Deep Query Examples

### 4. Get Complete Manifest Details

```sql
-- Full manifest with all job details
SELECT 
  m.id as manifest_id,
  m.date,
  m.total_jobs,
  m.total_weight,
  m.total_volume,
  m.route_notes,
  m.driver_notes,
  m.management_notes,
  
  -- Driver information
  d.first_name,
  d.last_name,
  d.employee_number,
  d.phone,
  
  -- Vehicle information
  v.registration,
  v.make,
  v.model,
  v.type,
  
  -- Schedule information
  as.title as schedule_title,
  as.description as schedule_description,
  as.start_date as schedule_start,
  as.end_date as schedule_end,
  as.estimated_distance,
  as.estimated_duration,
  
  -- Job details
  mj.job_id,
  mj.job_number,
  mj.customer_name,
  mj.pickup_location,
  mj.delivery_location,
  mj.scheduled_time,
  mj.estimated_duration as job_duration,
  mj.status as job_status,
  mj.cargo_type,
  mj.cargo_weight,
  mj.special_requirements
  
FROM manifests m
JOIN drivers d ON m.driver_id = d.id
JOIN vehicles v ON m.vehicle_id = v.id
JOIN allocation_schedules as ON m.schedule_id = as.id
LEFT JOIN manifest_jobs mj ON m.id = mj.manifest_id
WHERE m.schedule_id = $1
ORDER BY mj.scheduled_time;
```

### 5. Get Job Consignment Details

```sql
-- Complete job consignment information
SELECT 
  jc.id as consignment_id,
  jc.job_id,
  jc.customer_name,
  jc.pickup_location,
  jc.delivery_location,
  jc.scheduled_date,
  jc.scheduled_time,
  jc.estimated_duration,
  jc.status,
  jc.cargo_type,
  jc.cargo_weight,
  jc.cargo_volume,
  jc.special_requirements,
  jc.notes,
  jc.driver_notes,
  jc.management_notes,
  
  -- Driver information
  d.first_name,
  d.last_name,
  d.employee_number,
  
  -- Vehicle information
  v.registration,
  v.make,
  v.model,
  
  -- Schedule information
  as.title as schedule_title,
  as.description as schedule_description,
  
  -- Consignment items
  ci.description as item_description,
  ci.quantity,
  ci.unit,
  ci.weight as item_weight,
  ci.volume as item_volume,
  ci.is_fragile,
  ci.is_oversized,
  ci.special_handling
  
FROM job_consignments jc
JOIN drivers d ON jc.driver_id = d.id
JOIN vehicles v ON jc.vehicle_id = v.id
JOIN allocation_schedules as ON jc.schedule_id = as.id
LEFT JOIN consignment_items ci ON jc.id = ci.consignment_id
WHERE jc.schedule_id = $1
ORDER BY jc.scheduled_time, ci.description;
```

### 6. Get Allocation Summary and Statistics

```sql
-- Driver allocation summary
SELECT 
  d.id as driver_id,
  d.first_name,
  d.last_name,
  d.employee_number,
  
  -- Allocation counts
  COUNT(dva.id) as total_allocations,
  COUNT(CASE WHEN dva.status = 'active' THEN 1 END) as active_allocations,
  COUNT(CASE WHEN dva.status = 'completed' THEN 1 END) as completed_allocations,
  
  -- Date ranges
  MIN(dva.allocation_date) as first_allocation,
  MAX(dva.allocation_date) as last_allocation,
  
  -- Schedule statistics
  COUNT(DISTINCT as.id) as total_schedules,
  SUM(as.total_jobs) as total_jobs,
  SUM(as.estimated_distance) as total_distance,
  SUM(as.estimated_duration) as total_duration
  
FROM drivers d
LEFT JOIN driver_vehicle_allocations dva ON d.id = dva.driver_id
LEFT JOIN allocation_schedules as ON dva.schedule_title = as.title
WHERE d.id = $1
GROUP BY d.id, d.first_name, d.last_name, d.employee_number;

-- Vehicle allocation summary
SELECT 
  v.id as vehicle_id,
  v.registration,
  v.make,
  v.model,
  v.type,
  
  -- Allocation counts
  COUNT(dva.id) as total_allocations,
  COUNT(CASE WHEN dva.status = 'active' THEN 1 END) as active_allocations,
  COUNT(CASE WHEN dva.status = 'completed' THEN 1 END) as completed_allocations,
  
  -- Date ranges
  MIN(dva.allocation_date) as first_allocation,
  MAX(dva.allocation_date) as last_allocation,
  
  -- Driver statistics
  COUNT(DISTINCT dva.driver_id) as unique_drivers,
  
  -- Schedule statistics
  COUNT(DISTINCT as.id) as total_schedules,
  SUM(as.total_jobs) as total_jobs,
  SUM(as.estimated_distance) as total_distance
  
FROM vehicles v
LEFT JOIN driver_vehicle_allocations dva ON v.id = dva.vehicle_id
LEFT JOIN allocation_schedules as ON dva.schedule_title = as.title
WHERE v.id = $1
GROUP BY v.id, v.registration, v.make, v.model, v.type;
```

### 7. Check for Allocation Overlaps

```sql
-- Check for driver allocation overlaps
SELECT 
  dva1.id as allocation1_id,
  dva1.allocation_date as start1,
  dva1.deallocation_date as end1,
  dva1.schedule_title as schedule1,
  v1.registration as vehicle1,
  
  dva2.id as allocation2_id,
  dva2.allocation_date as start2,
  dva2.deallocation_date as end2,
  dva2.schedule_title as schedule2,
  v2.registration as vehicle2,
  
  -- Overlap calculation
  CASE 
    WHEN dva1.deallocation_date IS NULL THEN 'Active allocation'
    WHEN dva2.deallocation_date IS NULL THEN 'Active allocation'
    WHEN dva1.allocation_date <= dva2.deallocation_date 
         AND dva1.deallocation_date >= dva2.allocation_date THEN 'Overlap detected'
    ELSE 'No overlap'
  END as overlap_status
  
FROM driver_vehicle_allocations dva1
JOIN vehicles v1 ON dva1.vehicle_id = v1.id
JOIN driver_vehicle_allocations dva2 ON dva1.driver_id = dva2.driver_id
JOIN vehicles v2 ON dva2.vehicle_id = v2.id
WHERE dva1.id != dva2.id
  AND dva1.driver_id = $1
  AND (
    (dva1.allocation_date <= COALESCE(dva2.deallocation_date, '9999-12-31'))
    AND (COALESCE(dva1.deallocation_date, '9999-12-31') >= dva2.allocation_date)
  )
ORDER BY dva1.allocation_date;

-- Check for vehicle allocation overlaps
SELECT 
  dva1.id as allocation1_id,
  dva1.allocation_date as start1,
  dva1.deallocation_date as end1,
  dva1.schedule_title as schedule1,
  d1.first_name || ' ' || d1.last_name as driver1,
  
  dva2.id as allocation2_id,
  dva2.allocation_date as start2,
  dva2.deallocation_date as end2,
  dva2.schedule_title as schedule2,
  d2.first_name || ' ' || d2.last_name as driver2,
  
  -- Overlap calculation
  CASE 
    WHEN dva1.deallocation_date IS NULL THEN 'Active allocation'
    WHEN dva2.deallocation_date IS NULL THEN 'Active allocation'
    WHEN dva1.allocation_date <= dva2.deallocation_date 
         AND dva1.deallocation_date >= dva2.allocation_date THEN 'Overlap detected'
    ELSE 'No overlap'
  END as overlap_status
  
FROM driver_vehicle_allocations dva1
JOIN drivers d1 ON dva1.driver_id = d1.id
JOIN driver_vehicle_allocations dva2 ON dva1.vehicle_id = dva2.vehicle_id
JOIN drivers d2 ON dva2.driver_id = d2.id
WHERE dva1.id != dva2.id
  AND dva1.vehicle_id = $1
  AND (
    (dva1.allocation_date <= COALESCE(dva2.deallocation_date, '9999-12-31'))
    AND (COALESCE(dva1.deallocation_date, '9999-12-31') >= dva2.allocation_date)
  )
ORDER BY dva1.allocation_date;
```

### 8. Advanced Search and Filtering

```sql
-- Complex allocation search
WITH allocation_data AS (
  SELECT 
    dva.*,
    d.first_name,
    d.last_name,
    d.employee_number,
    v.registration,
    v.make,
    v.model,
    v.type,
    as.title as schedule_title,
    as.description as schedule_description,
    as.total_jobs,
    as.estimated_distance,
    as.estimated_duration
  FROM driver_vehicle_allocations dva
  JOIN drivers d ON dva.driver_id = d.id
  JOIN vehicles v ON dva.vehicle_id = v.id
  LEFT JOIN allocation_schedules as ON dva.schedule_title = as.title
)
SELECT *
FROM allocation_data
WHERE 
  -- Text search
  (
    $1::text IS NULL 
    OR d.first_name ILIKE '%' || $1 || '%'
    OR d.last_name ILIKE '%' || $1 || '%'
    OR d.employee_number ILIKE '%' || $1 || '%'
    OR v.registration ILIKE '%' || $1 || '%'
    OR dva.schedule_title ILIKE '%' || $1 || '%'
  )
  -- Driver filter
  AND ($2::uuid[] IS NULL OR dva.driver_id = ANY($2))
  -- Vehicle filter
  AND ($3::uuid[] IS NULL OR dva.vehicle_id = ANY($3))
  -- Date range filter
  AND ($4::date IS NULL OR dva.allocation_date >= $4)
  AND ($5::date IS NULL OR dva.allocation_date <= $5)
  -- Status filter
  AND ($6::text[] IS NULL OR dva.status = ANY($6))
  -- Schedule title filter
  AND ($7::text[] IS NULL OR dva.schedule_title = ANY($7))
ORDER BY 
  CASE WHEN $8 = 'allocation_date' AND $9 = 'desc' THEN dva.allocation_date END DESC,
  CASE WHEN $8 = 'allocation_date' AND $9 = 'asc' THEN dva.allocation_date END ASC,
  CASE WHEN $8 = 'schedule_title' AND $9 = 'desc' THEN dva.schedule_title END DESC,
  CASE WHEN $8 = 'schedule_title' AND $9 = 'asc' THEN dva.schedule_title END ASC,
  dva.allocation_date DESC
LIMIT $10 OFFSET $11;
```

### 9. Analytics and Reporting Queries

```sql
-- Allocation analytics by date
SELECT 
  DATE_TRUNC('day', dva.allocation_date) as date,
  COUNT(*) as total_allocations,
  COUNT(CASE WHEN dva.status = 'active' THEN 1 END) as active_allocations,
  COUNT(CASE WHEN dva.status = 'completed' THEN 1 END) as completed_allocations,
  COUNT(DISTINCT dva.driver_id) as unique_drivers,
  COUNT(DISTINCT dva.vehicle_id) as unique_vehicles,
  SUM(as.estimated_distance) as total_distance,
  SUM(as.total_jobs) as total_jobs
FROM driver_vehicle_allocations dva
LEFT JOIN allocation_schedules as ON dva.schedule_title = as.title
WHERE dva.allocation_date BETWEEN $1 AND $2
GROUP BY DATE_TRUNC('day', dva.allocation_date)
ORDER BY date;

-- Driver performance analytics
SELECT 
  d.id as driver_id,
  d.first_name,
  d.last_name,
  d.employee_number,
  
  -- Allocation metrics
  COUNT(dva.id) as total_allocations,
  COUNT(CASE WHEN dva.status = 'completed' THEN 1 END) as completed_allocations,
  ROUND(
    COUNT(CASE WHEN dva.status = 'completed' THEN 1 END)::decimal / 
    COUNT(dva.id)::decimal * 100, 2
  ) as completion_rate,
  
  -- Schedule metrics
  COUNT(DISTINCT as.id) as total_schedules,
  SUM(as.total_jobs) as total_jobs,
  SUM(as.estimated_distance) as total_distance,
  SUM(as.estimated_duration) as total_duration,
  
  -- Time metrics
  AVG(as.estimated_duration) as avg_duration,
  MIN(dva.allocation_date) as first_allocation,
  MAX(dva.allocation_date) as last_allocation,
  
  -- Vehicle diversity
  COUNT(DISTINCT dva.vehicle_id) as unique_vehicles
  
FROM drivers d
LEFT JOIN driver_vehicle_allocations dva ON d.id = dva.driver_id
LEFT JOIN allocation_schedules as ON dva.schedule_title = as.title
WHERE dva.allocation_date BETWEEN $1 AND $2
GROUP BY d.id, d.first_name, d.last_name, d.employee_number
ORDER BY total_allocations DESC;

-- Vehicle utilization analytics
SELECT 
  v.id as vehicle_id,
  v.registration,
  v.make,
  v.model,
  v.type,
  
  -- Allocation metrics
  COUNT(dva.id) as total_allocations,
  COUNT(CASE WHEN dva.status = 'active' THEN 1 END) as active_allocations,
  COUNT(CASE WHEN dva.status = 'completed' THEN 1 END) as completed_allocations,
  
  -- Utilization calculation
  ROUND(
    COUNT(CASE WHEN dva.status = 'active' THEN 1 END)::decimal / 
    COUNT(dva.id)::decimal * 100, 2
  ) as utilization_rate,
  
  -- Schedule metrics
  COUNT(DISTINCT as.id) as total_schedules,
  SUM(as.total_jobs) as total_jobs,
  SUM(as.estimated_distance) as total_distance,
  SUM(as.estimated_duration) as total_duration,
  
  -- Driver diversity
  COUNT(DISTINCT dva.driver_id) as unique_drivers,
  
  -- Time metrics
  MIN(dva.allocation_date) as first_allocation,
  MAX(dva.allocation_date) as last_allocation
  
FROM vehicles v
LEFT JOIN driver_vehicle_allocations dva ON v.id = dva.vehicle_id
LEFT JOIN allocation_schedules as ON dva.schedule_title = as.title
WHERE dva.allocation_date BETWEEN $1 AND $2
GROUP BY v.id, v.registration, v.make, v.model, v.type
ORDER BY utilization_rate DESC;
```

### 10. Export and Reporting Queries

```sql
-- Comprehensive allocation report
SELECT 
  -- Allocation details
  dva.id as allocation_id,
  dva.allocation_date,
  dva.deallocation_date,
  dva.schedule_title,
  dva.status,
  dva.notes,
  
  -- Driver details
  d.first_name as driver_first_name,
  d.last_name as driver_last_name,
  d.employee_number,
  d.phone as driver_phone,
  d.email as driver_email,
  
  -- Vehicle details
  v.registration,
  v.make as vehicle_make,
  v.model as vehicle_model,
  v.type as vehicle_type,
  
  -- Schedule details
  as.description as schedule_description,
  as.start_date as schedule_start,
  as.end_date as schedule_end,
  as.total_jobs,
  as.estimated_distance,
  as.estimated_duration,
  as.notes as schedule_notes,
  
  -- Manifest details (if exists)
  m.date as manifest_date,
  m.total_weight,
  m.total_volume,
  m.route_notes,
  m.driver_notes,
  m.management_notes,
  
  -- Job details (if exists)
  mj.job_number,
  mj.customer_name,
  mj.pickup_location,
  mj.delivery_location,
  mj.scheduled_time,
  mj.cargo_type,
  mj.cargo_weight,
  mj.special_requirements
  
FROM driver_vehicle_allocations dva
JOIN drivers d ON dva.driver_id = d.id
JOIN vehicles v ON dva.vehicle_id = v.id
LEFT JOIN allocation_schedules as ON dva.schedule_title = as.title
LEFT JOIN manifests m ON as.id = m.schedule_id
LEFT JOIN manifest_jobs mj ON m.id = mj.manifest_id
WHERE dva.allocation_date BETWEEN $1 AND $2
  AND ($3::uuid[] IS NULL OR dva.driver_id = ANY($3))
  AND ($4::uuid[] IS NULL OR dva.vehicle_id = ANY($4))
  AND ($5::text[] IS NULL OR dva.status = ANY($5))
ORDER BY dva.allocation_date, dva.schedule_title, mj.scheduled_time;
```

## Performance Optimization

### Indexes for Better Performance

```sql
-- Core allocation indexes
CREATE INDEX idx_driver_vehicle_allocations_driver_id ON driver_vehicle_allocations(driver_id);
CREATE INDEX idx_driver_vehicle_allocations_vehicle_id ON driver_vehicle_allocations(vehicle_id);
CREATE INDEX idx_driver_vehicle_allocations_date ON driver_vehicle_allocations(allocation_date);
CREATE INDEX idx_driver_vehicle_allocations_status ON driver_vehicle_allocations(status);
CREATE INDEX idx_driver_vehicle_allocations_schedule_title ON driver_vehicle_allocations(schedule_title);

-- Composite indexes for common queries
CREATE INDEX idx_driver_vehicle_allocations_driver_date ON driver_vehicle_allocations(driver_id, allocation_date);
CREATE INDEX idx_driver_vehicle_allocations_vehicle_date ON driver_vehicle_allocations(vehicle_id, allocation_date);
CREATE INDEX idx_driver_vehicle_allocations_driver_status ON driver_vehicle_allocations(driver_id, status);
CREATE INDEX idx_driver_vehicle_allocations_vehicle_status ON driver_vehicle_allocations(vehicle_id, status);

-- Schedule indexes
CREATE INDEX idx_allocation_schedules_driver_id ON allocation_schedules(driver_id);
CREATE INDEX idx_allocation_schedules_vehicle_id ON allocation_schedules(vehicle_id);
CREATE INDEX idx_allocation_schedules_date_range ON allocation_schedules(start_date, end_date);
CREATE INDEX idx_allocation_schedules_status ON allocation_schedules(status);

-- Manifest indexes
CREATE INDEX idx_manifests_schedule_id ON manifests(schedule_id);
CREATE INDEX idx_manifests_date ON manifests(date);
CREATE INDEX idx_manifest_jobs_manifest_id ON manifest_jobs(manifest_id);

-- Consignment indexes
CREATE INDEX idx_job_consignments_schedule_id ON job_consignments(schedule_id);
CREATE INDEX idx_job_consignments_job_id ON job_consignments(job_id);
CREATE INDEX idx_consignment_items_consignment_id ON consignment_items(consignment_id);
```

### Materialized Views for Complex Reports

```sql
-- Driver allocation summary view
CREATE MATERIALIZED VIEW driver_allocation_summary AS
SELECT 
  d.id as driver_id,
  d.first_name,
  d.last_name,
  d.employee_number,
  COUNT(dva.id) as total_allocations,
  COUNT(CASE WHEN dva.status = 'active' THEN 1 END) as active_allocations,
  COUNT(CASE WHEN dva.status = 'completed' THEN 1 END) as completed_allocations,
  COUNT(DISTINCT dva.vehicle_id) as unique_vehicles,
  SUM(as.estimated_distance) as total_distance,
  SUM(as.total_jobs) as total_jobs,
  MIN(dva.allocation_date) as first_allocation,
  MAX(dva.allocation_date) as last_allocation
FROM drivers d
LEFT JOIN driver_vehicle_allocations dva ON d.id = dva.driver_id
LEFT JOIN allocation_schedules as ON dva.schedule_title = as.title
GROUP BY d.id, d.first_name, d.last_name, d.employee_number;

-- Vehicle allocation summary view
CREATE MATERIALIZED VIEW vehicle_allocation_summary AS
SELECT 
  v.id as vehicle_id,
  v.registration,
  v.make,
  v.model,
  v.type,
  COUNT(dva.id) as total_allocations,
  COUNT(CASE WHEN dva.status = 'active' THEN 1 END) as active_allocations,
  COUNT(CASE WHEN dva.status = 'completed' THEN 1 END) as completed_allocations,
  COUNT(DISTINCT dva.driver_id) as unique_drivers,
  SUM(as.estimated_distance) as total_distance,
  SUM(as.total_jobs) as total_jobs,
  MIN(dva.allocation_date) as first_allocation,
  MAX(dva.allocation_date) as last_allocation
FROM vehicles v
LEFT JOIN driver_vehicle_allocations dva ON v.id = dva.vehicle_id
LEFT JOIN allocation_schedules as ON dva.schedule_title = as.title
GROUP BY v.id, v.registration, v.make, v.model, v.type;

-- Refresh materialized views
REFRESH MATERIALIZED VIEW driver_allocation_summary;
REFRESH MATERIALIZED VIEW vehicle_allocation_summary;
```

## Usage Examples

### Frontend Integration

```typescript
// Example of using the service in React components
import DriverVehicleAllocationService from '../services/driverVehicleAllocationService';

// Get driver allocations
const driverAllocations = await DriverVehicleAllocationService.getDriverAllocations(driverId);

// Get manifest details
const manifestDetails = await DriverVehicleAllocationService.getManifestDetails(scheduleId);

// Get job consignments
const jobConsignments = await DriverVehicleAllocationService.getJobConsignments(scheduleId);

// Search allocations
const searchResults = await DriverVehicleAllocationService.searchAllocations({
  query: 'John',
  dateRange: { start: '2024-01-01', end: '2024-12-31' },
  statuses: ['active', 'completed'],
  limit: 50,
  offset: 0,
  sortBy: 'allocation_date',
  sortOrder: 'desc'
});
```

### API Endpoint Examples

```typescript
// Express.js route examples
app.get('/api/drivers/:driverId/allocations', async (req, res) => {
  try {
    const { driverId } = req.params;
    const { startDate, endDate, status } = req.query;
    
    let query = `
      SELECT 
        dva.*,
        v.registration,
        v.make,
        v.model,
        v.type,
        as.title as schedule_title,
        as.total_jobs,
        as.estimated_distance
      FROM driver_vehicle_allocations dva
      JOIN vehicles v ON dva.vehicle_id = v.id
      LEFT JOIN allocation_schedules as ON dva.schedule_title = as.title
      WHERE dva.driver_id = $1
    `;
    
    const params = [driverId];
    let paramCount = 1;
    
    if (startDate) {
      paramCount++;
      query += ` AND dva.allocation_date >= $${paramCount}`;
      params.push(startDate);
    }
    
    if (endDate) {
      paramCount++;
      query += ` AND dva.allocation_date <= $${paramCount}`;
      params.push(endDate);
    }
    
    if (status) {
      paramCount++;
      query += ` AND dva.status = $${paramCount}`;
      params.push(status);
    }
    
    query += ' ORDER BY dva.allocation_date DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching driver allocations:', error);
    res.status(500).json({ error: 'Failed to fetch driver allocations' });
  }
});
```

This comprehensive query system provides all the deep query capabilities you need for the driver-vehicle allocation system, including:

1. **Many-to-many relationships** between drivers and vehicles
2. **Allocation tracking** with dates and status
3. **Schedule management** with detailed information
4. **Manifest generation** with job details
5. **Job consignment tracking** with item-level details
6. **Advanced analytics** and reporting
7. **Performance optimization** with proper indexing
8. **Export capabilities** for reports and data analysis

The system is designed to handle complex queries efficiently while maintaining data integrity and providing comprehensive insights into your fleet operations.
