/**
 * Database Validation Utilities
 * 
 * This module provides utilities to validate data before sending to Supabase,
 * preventing errors from schema mismatches.
 */

/**
 * Known table schemas - based on actual database constraints
 * Updated from Supabase schema audit
 * 
 * NOTE: These are the columns that ACTUALLY exist. Many columns we're trying to send don't exist yet.
 * Run database/migrations/get_full_schema.sql to see complete column list.
 */
export const KNOWN_TABLE_COLUMNS: Record<string, string[]> = {
  vehicles: [
    'id',                    // NOT NULL, PRIMARY KEY
    'registration',          // NOT NULL, UNIQUE
    'permanent_trailer_id',  // FOREIGN KEY (nullable)
    // TODO: These columns need to be added via migration:
    // 'fleet_number',
    // 'make',
    // 'model',
    // 'year',
    // 'type',
    // 'status',
    // 'capacity',
    // 'width',
    // 'height',
    // 'length',
    // 'location',
    // 'notes',
    // 'last_inspection',
    // 'next_mot',
    // 'next_service',
    // 'is_active',
    // 'created_at',
    // 'updated_at'
  ],
  jobs: [
    'id',              // NOT NULL, PRIMARY KEY
    'job_number',      // NOT NULL, UNIQUE
    'title',           // NOT NULL
    'created_by',      // FOREIGN KEY (nullable)
    'route_id',        // FOREIGN KEY (nullable)
    // TODO: These may need to be added:
    // 'description',
    // 'status',
    // 'priority',
    // 'created_at',
    // 'updated_at'
  ],
  drivers: [
    'id',              // NOT NULL, PRIMARY KEY
    'staff_id',        // NOT NULL, UNIQUE
    'first_name',      // NOT NULL
    'last_name',       // NOT NULL
    'email',           // NOT NULL, UNIQUE
    'user_id',         // FOREIGN KEY (nullable)
    // TODO: These may need to be added:
    // 'phone',
    // 'status',
    // 'created_at',
    // 'updated_at'
  ],
  client_contacts: [
    'id',              // NOT NULL, PRIMARY KEY
    'company_name',    // NOT NULL
    'name',            // NOT NULL
    'company',         // NOT NULL
    'address_line1',   // NOT NULL
    'city',            // NOT NULL
    'postcode',        // NOT NULL
    'country',         // NOT NULL
    'category',        // NOT NULL, CHECK: 'client', 'supplier', 'partner', 'prospect'
    'status',          // NOT NULL, CHECK: 'active', 'inactive', 'lead'
    // TODO: These may exist but weren't in constraints:
    // 'email',
    // 'phone',
    // 'address_line2',
    // 'address_line3',
    // 'town',
    // 'job_title',
    // 'position',
    // 'mobile',
    // 'notes',
    // 'created_at',
    // 'updated_at'
  ],
  delivery_addresses: [
    'id',              // NOT NULL, PRIMARY KEY
    'address_line1',   // NOT NULL
    'city',            // NOT NULL
    'postcode',        // NOT NULL
    'client_id',       // FOREIGN KEY (nullable)
    // TODO: These may exist but weren't in constraints:
    // 'address_line2',
    // 'address_line3',
    // 'town',
    // 'contact_person',
    // 'contact_phone',
    // 'instructions',
    // 'is_active',
    // 'created_at',
    // 'updated_at'
  ],
  users: [
    'id',              // NOT NULL, PRIMARY KEY
    'email',           // NOT NULL, UNIQUE
    'first_name',      // NOT NULL
    'last_name',       // NOT NULL
    'role',            // NOT NULL
    // TODO: These may exist but weren't in constraints:
    // 'created_at',
    // 'updated_at'
  ]
};

/**
 * Filters out columns that don't exist in the table schema
 * @param tableName Name of the table
 * @param data Data object to filter
 * @returns Filtered data object with only valid columns
 */
export function filterValidColumns<T extends Record<string, any>>(
  tableName: string,
  data: T
): Partial<T> {
  const validColumns = KNOWN_TABLE_COLUMNS[tableName];
  
  if (!validColumns) {
    console.warn(`Unknown table: ${tableName}. Allowing all columns.`);
    return data;
  }

  const filtered: Partial<T> = {};
  const invalidColumns: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (validColumns.includes(key)) {
      filtered[key as keyof T] = value;
    } else {
      invalidColumns.push(key);
    }
  }

  if (invalidColumns.length > 0) {
    console.warn(
      `Table "${tableName}" does not have columns: ${invalidColumns.join(', ')}. ` +
      `These fields were filtered out before sending to database.`
    );
  }

  return filtered;
}

/**
 * Validates that required columns are present
 * @param tableName Name of the table
 * @param data Data object to validate
 * @param requiredColumns List of required column names
 * @returns Error message if validation fails, null if valid
 */
export function validateRequiredColumns(
  tableName: string,
  data: Record<string, any>,
  requiredColumns: string[]
): string | null {
  const missing: string[] = [];

  for (const col of requiredColumns) {
    if (data[col] === undefined || data[col] === null || data[col] === '') {
      missing.push(col);
    }
  }

  if (missing.length > 0) {
    return `Missing required columns for table "${tableName}": ${missing.join(', ')}`;
  }

  return null;
}

/**
 * Removes React components and other non-serializable data from an object
 */
export function sanitizeForDatabase<T extends Record<string, any>>(data: T): Partial<T> {
  const sanitized: Partial<T> = {};

  for (const [key, value] of Object.entries(data)) {
    // Skip React components
    if (value && typeof value === 'object' && '$$typeof' in value) {
      console.warn(`Skipping React component in field "${key}"`);
      continue;
    }

    // Skip functions
    if (typeof value === 'function') {
      console.warn(`Skipping function in field "${key}"`);
      continue;
    }

    // Recursively sanitize nested objects
    if (value && typeof value === 'object' && !Array.isArray(value) && value.constructor === Object) {
      sanitized[key as keyof T] = sanitizeForDatabase(value) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value;
    }
  }

  return sanitized;
}

