import { supabase } from '../lib/supabase';
import { differenceInMinutes, parse, format, startOfWeek, endOfWeek, addDays } from 'date-fns';

export interface AgencyContract {
  id: string;
  contractNumber: string;
  agencyName: string;
  agencyContactName: string;
  agencyContactEmail: string;
  agencyContactPhone?: string;
  agencyContactMobile?: string;
  agencyAddress: {
    line1: string;
    line2?: string;
    line3?: string;
    town?: string;
    city: string;
    postcode: string;
    country: string;
  };
  bankDetails: {
    accountName: string;
    accountNumber: string;
    sortCode: string;
    bankName: string;
    buildingSocietyNumber?: string;
  };
  contractStartDate: string;
  contractEndDate?: string;
  contractStatus: 'active' | 'inactive' | 'expired' | 'terminated';
  standardHourlyRate: number;
  overtimeHourlyRate: number;
  standardStartTime: string;
  standardEndTime: string;
  standardHoursPerWeek: number;
  notes?: string;
  termsAndConditions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgencyStaff {
  id: string;
  agencyContractId: string;
  staffReferenceNumber: string;
  firstName: string;
  middleName?: string;
  familyName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: {
    line1?: string;
    line2?: string;
    line3?: string;
    town?: string;
    city?: string;
    postcode?: string;
    country: string;
  };
  status: 'active' | 'inactive' | 'unavailable' | 'terminated';
  startDate: string;
  endDate?: string;
  qualifications?: Array<{
    name: string;
    issuingBody: string;
    issueDate: string;
    expiryDate?: string;
    documentUrl?: string;
  }>;
  licenses?: Array<{
    type: string;
    number: string;
    issuingBody: string;
    issueDate: string;
    expiryDate: string;
    documentUrl?: string;
  }>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgencyTimesheet {
  id: string;
  agencyStaffId: string;
  agencyContractId: string;
  weekStartDate: string;
  weekEndDate: string;
  totalHours: number;
  standardHours: number;
  overtimeHours: number;
  standardHourlyRate: number;
  overtimeHourlyRate: number;
  standardPay: number;
  overtimePay: number;
  totalPay: number;
  status: 'draft' | 'submitted' | 'approved' | 'paid' | 'rejected';
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  notes?: string;
  entries?: AgencyTimesheetEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface AgencyTimesheetEntry {
  id: string;
  agencyTimesheetId: string;
  jobId?: string;
  entryDate: string;
  startTime: string;
  endTime: string;
  breakDuration: number; // minutes
  lunchDuration: number; // minutes
  totalMinutes: number;
  standardMinutes: number;
  overtimeMinutes: number;
  standardHours: number;
  overtimeHours: number;
  standardPay: number;
  overtimePay: number;
  totalPay: number;
  description?: string;
  jobReference?: string;
  createdAt: string;
  updatedAt: string;
}

class AgencyContractService {
  /**
   * Get all agency contracts
   */
  async getAllContracts(): Promise<AgencyContract[]> {
    try {
      const { data, error } = await supabase
        .from('agency_contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(this.mapContractFromDb);
    } catch (error) {
      console.error('Error fetching agency contracts:', error);
      throw error;
    }
  }

  /**
   * Get a single agency contract by ID
   */
  async getContractById(id: string): Promise<AgencyContract | null> {
    try {
      const { data, error } = await supabase
        .from('agency_contracts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return this.mapContractFromDb(data);
    } catch (error) {
      console.error('Error fetching agency contract:', error);
      throw error;
    }
  }

  /**
   * Create a new agency contract
   */
  async createContract(contract: Omit<AgencyContract, 'id' | 'contractNumber' | 'createdAt' | 'updatedAt'>, userId?: string): Promise<AgencyContract> {
    try {
      const contractData = this.mapContractToDb(contract);
      
      const { data, error } = await supabase
        .from('agency_contracts')
        .insert({
          ...contractData,
          created_by: userId || null,
          updated_by: userId || null,
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapContractFromDb(data);
    } catch (error) {
      console.error('Error creating agency contract:', error);
      throw error;
    }
  }

  /**
   * Update an agency contract
   */
  async updateContract(id: string, updates: Partial<AgencyContract>, userId?: string): Promise<AgencyContract> {
    try {
      const updateData: any = {};
      
      if (updates.agencyName !== undefined) updateData.agency_name = updates.agencyName;
      if (updates.agencyContactName !== undefined) updateData.agency_contact_name = updates.agencyContactName;
      if (updates.agencyContactEmail !== undefined) updateData.agency_contact_email = updates.agencyContactEmail;
      if (updates.agencyContactPhone !== undefined) updateData.agency_contact_phone = updates.agencyContactPhone;
      if (updates.agencyContactMobile !== undefined) updateData.agency_contact_mobile = updates.agencyContactMobile;
      if (updates.agencyAddress !== undefined) {
        updateData.agency_address_line1 = updates.agencyAddress.line1;
        updateData.agency_address_line2 = updates.agencyAddress.line2;
        updateData.agency_address_line3 = updates.agencyAddress.line3;
        updateData.agency_town = updates.agencyAddress.town;
        updateData.agency_city = updates.agencyAddress.city;
        updateData.agency_postcode = updates.agencyAddress.postcode;
        updateData.agency_country = updates.agencyAddress.country;
      }
      if (updates.bankDetails !== undefined) {
        updateData.bank_account_name = updates.bankDetails.accountName;
        updateData.bank_account_number = updates.bankDetails.accountNumber;
        updateData.bank_sort_code = updates.bankDetails.sortCode;
        updateData.bank_name = updates.bankDetails.bankName;
        updateData.building_society_number = updates.bankDetails.buildingSocietyNumber;
      }
      if (updates.contractStartDate !== undefined) updateData.contract_start_date = updates.contractStartDate;
      if (updates.contractEndDate !== undefined) updateData.contract_end_date = updates.contractEndDate;
      if (updates.contractStatus !== undefined) updateData.contract_status = updates.contractStatus;
      if (updates.standardHourlyRate !== undefined) updateData.standard_hourly_rate = updates.standardHourlyRate;
      if (updates.overtimeHourlyRate !== undefined) updateData.overtime_hourly_rate = updates.overtimeHourlyRate;
      if (updates.standardStartTime !== undefined) updateData.standard_start_time = updates.standardStartTime;
      if (updates.standardEndTime !== undefined) updateData.standard_end_time = updates.standardEndTime;
      if (updates.standardHoursPerWeek !== undefined) updateData.standard_hours_per_week = updates.standardHoursPerWeek;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.termsAndConditions !== undefined) updateData.terms_and_conditions = updates.termsAndConditions;
      
      updateData.updated_by = userId || null;

      const { data, error } = await supabase
        .from('agency_contracts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.mapContractFromDb(data);
    } catch (error) {
      console.error('Error updating agency contract:', error);
      throw error;
    }
  }

  /**
   * Delete an agency contract
   */
  async deleteContract(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('agency_contracts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting agency contract:', error);
      throw error;
    }
  }

  /**
   * Get all staff for an agency contract
   */
  async getStaffByContract(contractId: string): Promise<AgencyStaff[]> {
    try {
      const { data, error } = await supabase
        .from('agency_staff')
        .select('*')
        .eq('agency_contract_id', contractId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(this.mapStaffFromDb);
    } catch (error) {
      console.error('Error fetching agency staff:', error);
      throw error;
    }
  }

  /**
   * Get a single agency staff member by ID
   */
  async getStaffById(id: string): Promise<AgencyStaff | null> {
    try {
      const { data, error } = await supabase
        .from('agency_staff')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return this.mapStaffFromDb(data);
    } catch (error) {
      console.error('Error fetching agency staff:', error);
      throw error;
    }
  }

  /**
   * Create a new agency staff member
   */
  async createStaff(staff: Omit<AgencyStaff, 'id' | 'createdAt' | 'updatedAt'>, userId?: string): Promise<AgencyStaff> {
    try {
      const staffData = this.mapStaffToDb(staff);
      
      const { data, error } = await supabase
        .from('agency_staff')
        .insert({
          ...staffData,
          created_by: userId || null,
          updated_by: userId || null,
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapStaffFromDb(data);
    } catch (error) {
      console.error('Error creating agency staff:', error);
      throw error;
    }
  }

  /**
   * Update an agency staff member
   */
  async updateStaff(id: string, updates: Partial<AgencyStaff>, userId?: string): Promise<AgencyStaff> {
    try {
      const updateData: any = {};
      
      if (updates.staffReferenceNumber !== undefined) updateData.staff_reference_number = updates.staffReferenceNumber;
      if (updates.firstName !== undefined) updateData.first_name = updates.firstName;
      if (updates.middleName !== undefined) updateData.middle_name = updates.middleName;
      if (updates.familyName !== undefined) updateData.family_name = updates.familyName;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.mobile !== undefined) updateData.mobile = updates.mobile;
      if (updates.address !== undefined) {
        updateData.address_line1 = updates.address.line1;
        updateData.address_line2 = updates.address.line2;
        updateData.address_line3 = updates.address.line3;
        updateData.town = updates.address.town;
        updateData.city = updates.address.city;
        updateData.postcode = updates.address.postcode;
        updateData.country = updates.address.country;
      }
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
      if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
      if (updates.qualifications !== undefined) updateData.qualifications = updates.qualifications;
      if (updates.licenses !== undefined) updateData.licenses = updates.licenses;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      
      updateData.updated_by = userId || null;

      const { data, error } = await supabase
        .from('agency_staff')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.mapStaffFromDb(data);
    } catch (error) {
      console.error('Error updating agency staff:', error);
      throw error;
    }
  }

  /**
   * Delete an agency staff member
   */
  async deleteStaff(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('agency_staff')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting agency staff:', error);
      throw error;
    }
  }

  /**
   * Calculate hours and pay for a timesheet entry
   */
  calculateEntryHours(
    startTime: string,
    endTime: string,
    breakMinutes: number,
    lunchMinutes: number,
    standardStartTime: string,
    standardEndTime: string,
    isWeekend: boolean
  ): { totalMinutes: number; standardMinutes: number; overtimeMinutes: number } {
    const start = parse(startTime, 'HH:mm', new Date());
    const end = parse(endTime, 'HH:mm', new Date());
    const standardStart = parse(standardStartTime, 'HH:mm', new Date());
    const standardEnd = parse(standardEndTime, 'HH:mm', new Date());

    const totalMinutes = differenceInMinutes(end, start) - breakMinutes - lunchMinutes;
    let standardMinutes = 0;
    let overtimeMinutes = 0;

    if (isWeekend) {
      // All hours on weekends are overtime
      overtimeMinutes = totalMinutes;
    } else {
      // Calculate standard and overtime minutes
      if (start < standardStart) {
        const earlyMinutes = differenceInMinutes(standardStart, start);
        overtimeMinutes += Math.min(earlyMinutes, totalMinutes);
      }
      
      if (end > standardEnd) {
        const lateMinutes = differenceInMinutes(end, standardEnd);
        overtimeMinutes += Math.min(lateMinutes, totalMinutes - overtimeMinutes);
      }
      
      const effectiveStart = start < standardStart ? standardStart : start;
      const effectiveEnd = end > standardEnd ? standardEnd : end;
      
      if (effectiveEnd > effectiveStart) {
        standardMinutes = differenceInMinutes(effectiveEnd, effectiveStart);
        const breakTotal = breakMinutes + lunchMinutes;
        if (standardMinutes > breakTotal) {
          standardMinutes -= breakTotal;
        } else {
          standardMinutes = 0;
        }
      }
    }

    // Ensure we don't exceed total minutes
    const totalCalculated = standardMinutes + overtimeMinutes;
    if (totalCalculated > totalMinutes) {
      const excess = totalCalculated - totalMinutes;
      if (overtimeMinutes >= excess) {
        overtimeMinutes -= excess;
      } else {
        standardMinutes -= (excess - overtimeMinutes);
        overtimeMinutes = 0;
      }
    }

    return { totalMinutes, standardMinutes, overtimeMinutes };
  }

  /**
   * Create or update a timesheet entry
   */
  async saveTimesheetEntry(
    timesheetId: string,
    entry: Omit<AgencyTimesheetEntry, 'id' | 'createdAt' | 'updatedAt' | 'standardHours' | 'overtimeHours' | 'standardPay' | 'overtimePay' | 'totalPay' | 'standardMinutes' | 'overtimeMinutes'>,
    contract: AgencyContract
  ): Promise<AgencyTimesheetEntry> {
    try {
      const entryDate = new Date(entry.entryDate);
      const isWeekend = entryDate.getDay() === 0 || entryDate.getDay() === 6;

      const { totalMinutes, standardMinutes, overtimeMinutes } = this.calculateEntryHours(
        entry.startTime,
        entry.endTime,
        entry.breakDuration,
        entry.lunchDuration,
        contract.standardStartTime,
        contract.standardEndTime,
        isWeekend
      );

      const standardHours = standardMinutes / 60;
      const overtimeHours = overtimeMinutes / 60;
      const standardPay = standardHours * contract.standardHourlyRate;
      const overtimePay = overtimeHours * contract.overtimeHourlyRate;
      const totalPay = standardPay + overtimePay;

      const entryData = {
        agency_timesheet_id: timesheetId,
        job_id: entry.jobId || null,
        entry_date: entry.entryDate,
        start_time: entry.startTime,
        end_time: entry.endTime,
        break_duration: entry.breakDuration,
        lunch_duration: entry.lunchDuration,
        total_minutes: totalMinutes,
        standard_minutes: standardMinutes,
        overtime_minutes: overtimeMinutes,
        standard_hours: standardHours,
        overtime_hours: overtimeHours,
        standard_pay: standardPay,
        overtime_pay: overtimePay,
        total_pay: totalPay,
        description: entry.description || null,
        job_reference: entry.jobReference || null,
      };

      const { data, error } = await supabase
        .from('agency_timesheet_entries')
        .upsert(entryData, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;

      // Recalculate timesheet totals
      await this.recalculateTimesheet(timesheetId);

      return this.mapTimesheetEntryFromDb(data);
    } catch (error) {
      console.error('Error saving timesheet entry:', error);
      throw error;
    }
  }

  /**
   * Recalculate timesheet totals from entries
   */
  async recalculateTimesheet(timesheetId: string): Promise<void> {
    try {
      // Get all entries for this timesheet
      const { data: entries, error: entriesError } = await supabase
        .from('agency_timesheet_entries')
        .select('*')
        .eq('agency_timesheet_id', timesheetId);

      if (entriesError) throw entriesError;

      // Get the timesheet to get rates
      const { data: timesheet, error: timesheetError } = await supabase
        .from('agency_timesheets')
        .select('*')
        .eq('id', timesheetId)
        .single();

      if (timesheetError) throw timesheetError;

      // Calculate totals
      let totalHours = 0;
      let standardHours = 0;
      let overtimeHours = 0;
      let standardPay = 0;
      let overtimePay = 0;

      (entries || []).forEach(entry => {
        totalHours += entry.total_minutes / 60;
        standardHours += entry.standard_hours;
        overtimeHours += entry.overtime_hours;
        standardPay += entry.standard_pay;
        overtimePay += entry.overtime_pay;
      });

      const totalPay = standardPay + overtimePay;

      // Update timesheet
      const { error: updateError } = await supabase
        .from('agency_timesheets')
        .update({
          total_hours: totalHours,
          standard_hours: standardHours,
          overtime_hours: overtimeHours,
          standard_pay: standardPay,
          overtime_pay: overtimePay,
          total_pay: totalPay,
        })
        .eq('id', timesheetId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error recalculating timesheet:', error);
      throw error;
    }
  }

  /**
   * Get timesheet for a staff member and week
   */
  async getTimesheet(staffId: string, weekStartDate: string): Promise<AgencyTimesheet | null> {
    try {
      const { data, error } = await supabase
        .from('agency_timesheets')
        .select(`
          *,
          agency_timesheet_entries (*)
        `)
        .eq('agency_staff_id', staffId)
        .eq('week_start_date', weekStartDate)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return this.mapTimesheetFromDb(data);
    } catch (error) {
      console.error('Error fetching timesheet:', error);
      throw error;
    }
  }

  /**
   * Create a new timesheet
   */
  async createTimesheet(
    staffId: string,
    contractId: string,
    weekStartDate: string,
    contract: AgencyContract,
    userId?: string
  ): Promise<AgencyTimesheet> {
    try {
      const weekStart = new Date(weekStartDate);
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

      const { data, error } = await supabase
        .from('agency_timesheets')
        .insert({
          agency_staff_id: staffId,
          agency_contract_id: contractId,
          week_start_date: format(weekStart, 'yyyy-MM-dd'),
          week_end_date: format(weekEnd, 'yyyy-MM-dd'),
          standard_hourly_rate: contract.standardHourlyRate,
          overtime_hourly_rate: contract.overtimeHourlyRate,
          total_hours: 0,
          standard_hours: 0,
          overtime_hours: 0,
          standard_pay: 0,
          overtime_pay: 0,
          total_pay: 0,
          status: 'draft',
          created_by: userId || null,
          updated_by: userId || null,
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapTimesheetFromDb(data);
    } catch (error) {
      console.error('Error creating timesheet:', error);
      throw error;
    }
  }

  // Mapping functions
  private mapContractFromDb(data: any): AgencyContract {
    return {
      id: data.id,
      contractNumber: data.contract_number,
      agencyName: data.agency_name,
      agencyContactName: data.agency_contact_name,
      agencyContactEmail: data.agency_contact_email,
      agencyContactPhone: data.agency_contact_phone,
      agencyContactMobile: data.agency_contact_mobile,
      agencyAddress: {
        line1: data.agency_address_line1,
        line2: data.agency_address_line2,
        line3: data.agency_address_line3,
        town: data.agency_town,
        city: data.agency_city,
        postcode: data.agency_postcode,
        country: data.agency_country,
      },
      bankDetails: {
        accountName: data.bank_account_name,
        accountNumber: data.bank_account_number,
        sortCode: data.bank_sort_code,
        bankName: data.bank_name,
        buildingSocietyNumber: data.building_society_number,
      },
      contractStartDate: data.contract_start_date,
      contractEndDate: data.contract_end_date,
      contractStatus: data.contract_status,
      standardHourlyRate: parseFloat(data.standard_hourly_rate),
      overtimeHourlyRate: parseFloat(data.overtime_hourly_rate),
      standardStartTime: data.standard_start_time,
      standardEndTime: data.standard_end_time,
      standardHoursPerWeek: data.standard_hours_per_week,
      notes: data.notes,
      termsAndConditions: data.terms_and_conditions,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapContractToDb(contract: Omit<AgencyContract, 'id' | 'contractNumber' | 'createdAt' | 'updatedAt'>): any {
    return {
      agency_name: contract.agencyName,
      agency_contact_name: contract.agencyContactName,
      agency_contact_email: contract.agencyContactEmail,
      agency_contact_phone: contract.agencyContactPhone,
      agency_contact_mobile: contract.agencyContactMobile,
      agency_address_line1: contract.agencyAddress.line1,
      agency_address_line2: contract.agencyAddress.line2,
      agency_address_line3: contract.agencyAddress.line3,
      agency_town: contract.agencyAddress.town,
      agency_city: contract.agencyAddress.city,
      agency_postcode: contract.agencyAddress.postcode,
      agency_country: contract.agencyAddress.country,
      bank_account_name: contract.bankDetails.accountName,
      bank_account_number: contract.bankDetails.accountNumber,
      bank_sort_code: contract.bankDetails.sortCode,
      bank_name: contract.bankDetails.bankName,
      building_society_number: contract.bankDetails.buildingSocietyNumber,
      contract_start_date: contract.contractStartDate,
      contract_end_date: contract.contractEndDate,
      contract_status: contract.contractStatus,
      standard_hourly_rate: contract.standardHourlyRate,
      overtime_hourly_rate: contract.overtimeHourlyRate,
      standard_start_time: contract.standardStartTime,
      standard_end_time: contract.standardEndTime,
      standard_hours_per_week: contract.standardHoursPerWeek,
      notes: contract.notes,
      terms_and_conditions: contract.termsAndConditions,
    };
  }

  private mapStaffFromDb(data: any): AgencyStaff {
    return {
      id: data.id,
      agencyContractId: data.agency_contract_id,
      staffReferenceNumber: data.staff_reference_number,
      firstName: data.first_name,
      middleName: data.middle_name,
      familyName: data.family_name,
      email: data.email,
      phone: data.phone,
      mobile: data.mobile,
      address: {
        line1: data.address_line1,
        line2: data.address_line2,
        line3: data.address_line3,
        town: data.town,
        city: data.city,
        postcode: data.postcode,
        country: data.country,
      },
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date,
      qualifications: data.qualifications || [],
      licenses: data.licenses || [],
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapStaffToDb(staff: Omit<AgencyStaff, 'id' | 'createdAt' | 'updatedAt'>): any {
    return {
      agency_contract_id: staff.agencyContractId,
      staff_reference_number: staff.staffReferenceNumber,
      first_name: staff.firstName,
      middle_name: staff.middleName,
      family_name: staff.familyName,
      email: staff.email,
      phone: staff.phone,
      mobile: staff.mobile,
      address_line1: staff.address?.line1,
      address_line2: staff.address?.line2,
      address_line3: staff.address?.line3,
      town: staff.address?.town,
      city: staff.address?.city,
      postcode: staff.address?.postcode,
      country: staff.address?.country || 'United Kingdom',
      status: staff.status,
      start_date: staff.startDate,
      end_date: staff.endDate,
      qualifications: staff.qualifications || [],
      licenses: staff.licenses || [],
      notes: staff.notes,
    };
  }

  private mapTimesheetFromDb(data: any): AgencyTimesheet {
    return {
      id: data.id,
      agencyStaffId: data.agency_staff_id,
      agencyContractId: data.agency_contract_id,
      weekStartDate: data.week_start_date,
      weekEndDate: data.week_end_date,
      totalHours: parseFloat(data.total_hours),
      standardHours: parseFloat(data.standard_hours),
      overtimeHours: parseFloat(data.overtime_hours),
      standardHourlyRate: parseFloat(data.standard_hourly_rate),
      overtimeHourlyRate: parseFloat(data.overtime_hourly_rate),
      standardPay: parseFloat(data.standard_pay),
      overtimePay: parseFloat(data.overtime_pay),
      totalPay: parseFloat(data.total_pay),
      status: data.status,
      submittedAt: data.submitted_at,
      approvedBy: data.approved_by,
      approvedAt: data.approved_at,
      rejectedReason: data.rejected_reason,
      notes: data.notes,
      entries: (data.agency_timesheet_entries || []).map((e: any) => this.mapTimesheetEntryFromDb(e)),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapTimesheetEntryFromDb(data: any): AgencyTimesheetEntry {
    return {
      id: data.id,
      agencyTimesheetId: data.agency_timesheet_id,
      jobId: data.job_id,
      entryDate: data.entry_date,
      startTime: data.start_time,
      endTime: data.end_time,
      breakDuration: data.break_duration,
      lunchDuration: data.lunch_duration,
      totalMinutes: data.total_minutes,
      standardMinutes: data.standard_minutes,
      overtimeMinutes: data.overtime_minutes,
      standardHours: parseFloat(data.standard_hours),
      overtimeHours: parseFloat(data.overtime_hours),
      standardPay: parseFloat(data.standard_pay),
      overtimePay: parseFloat(data.overtime_pay),
      totalPay: parseFloat(data.total_pay),
      description: data.description,
      jobReference: data.job_reference,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const agencyContractService = new AgencyContractService();

