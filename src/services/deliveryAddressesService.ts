import { supabase } from '../lib/supabase';

export interface DeliveryAddressRecord {
  id: string;
  name: string;
  clientId?: string | null;
  address: {
    line1: string;
    line2?: string | null;
    line3?: string | null;
    town: string;
    city?: string | null;
    postcode: string;
  };
  coordinates?: {
    lat: number | null;
    lng: number | null;
  } | null;
  contactPerson?: string | null;
  contactPhone?: string | null;
  deliveryInstructions?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
}

function mapFromRow(row: any): DeliveryAddressRecord {
  return {
    id: row.id,
    name: row.name ?? `${row.address_line1}, ${row.postcode}`,
    clientId: row.client_id ?? null,
    address: {
      line1: row.address_line1,
      line2: row.address_line2 ?? undefined,
      line3: row.address_line3 ?? undefined,
      town: row.town ?? row.city ?? '',
      city: row.city ?? undefined,
      postcode: row.postcode,
    },
    coordinates: row.lat != null || row.lng != null ? { lat: row.lat ?? null, lng: row.lng ?? null } : undefined,
    contactPerson: row.contact_person ?? undefined,
    contactPhone: row.contact_phone ?? undefined,
    deliveryInstructions: row.instructions ?? undefined,
    isActive: row.is_active ?? true,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
    createdBy: row.created_by ?? null,
  };
}

export async function fetchAllDeliveryAddresses(): Promise<DeliveryAddressRecord[]> {
  const { data, error } = await supabase
    .from('delivery_addresses')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapFromRow);
}

export async function fetchDeliveryAddressesByClient(clientId: string): Promise<DeliveryAddressRecord[]> {
  const { data, error } = await supabase
    .from('delivery_addresses')
    .select('*')
    .eq('client_id', clientId)
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapFromRow);
}

export interface CreateDeliveryAddressInput {
  name?: string;
  clientId?: string;
  address: {
    line1: string;
    line2?: string;
    line3?: string;
    town: string;
    city?: string;
    postcode: string;
  };
  contactPerson?: string;
  contactPhone?: string;
  deliveryInstructions?: string;
}

export async function createDeliveryAddress(input: CreateDeliveryAddressInput): Promise<DeliveryAddressRecord> {
  const insertRow = {
    name: input.name ?? `${input.address.line1}, ${input.address.postcode}`,
    client_id: input.clientId ?? null,
    address_line1: input.address.line1,
    address_line2: input.address.line2 ?? null,
    address_line3: input.address.line3 ?? null,
    town: input.address.town,
    city: input.address.city ?? null,
    postcode: input.address.postcode,
    contact_person: input.contactPerson ?? null,
    contact_phone: input.contactPhone ?? null,
    instructions: input.deliveryInstructions ?? null,
    is_active: true,
  };
  const { data, error } = await supabase
    .from('delivery_addresses')
    .insert(insertRow)
    .select('*')
    .single();
  if (error) throw error;
  return mapFromRow(data);
}

export async function updateDeliveryAddressRecord(id: string, input: Partial<CreateDeliveryAddressInput>): Promise<DeliveryAddressRecord> {
  const updateRow: any = {};
  if (input.name !== undefined) updateRow.name = input.name;
  if (input.address) {
    if (input.address.line1 !== undefined) updateRow.address_line1 = input.address.line1;
    if (input.address.line2 !== undefined) updateRow.address_line2 = input.address.line2 ?? null;
    if (input.address.line3 !== undefined) updateRow.address_line3 = input.address.line3 ?? null;
    if (input.address.town !== undefined) updateRow.town = input.address.town;
    if (input.address.city !== undefined) updateRow.city = input.address.city ?? null;
    if (input.address.postcode !== undefined) updateRow.postcode = input.address.postcode;
  }
  if (input.contactPerson !== undefined) updateRow.contact_person = input.contactPerson ?? null;
  if (input.contactPhone !== undefined) updateRow.contact_phone = input.contactPhone ?? null;
  if (input.deliveryInstructions !== undefined) updateRow.instructions = input.deliveryInstructions ?? null;

  const { data, error } = await supabase
    .from('delivery_addresses')
    .update(updateRow)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return mapFromRow(data);
}

export async function deleteDeliveryAddressRecord(id: string): Promise<string> {
  const { error } = await supabase
    .from('delivery_addresses')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return id;
}


