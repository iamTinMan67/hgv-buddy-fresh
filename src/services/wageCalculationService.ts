import { supabase } from '../lib/supabase';

// UK Tax and National Insurance calculation constants (2024/25 tax year)
const TAX_BANDS = {
  personalAllowance: 12570, // £12,570 tax-free allowance
  basicRate: { threshold: 50270, rate: 0.20 }, // 20% on £12,571 to £50,270
  higherRate: { threshold: 125140, rate: 0.40 }, // 40% on £50,271 to £125,140
  additionalRate: { rate: 0.45 } // 45% on over £125,140
};

const NATIONAL_INSURANCE_RATES = {
  categoryA: { weekly: { threshold: 242, rate: 0.12 }, monthly: { threshold: 1048, rate: 0.12 } },
  categoryB: { weekly: { threshold: 242, rate: 0.0585 }, monthly: { threshold: 1048, rate: 0.0585 } },
  categoryC: { weekly: { threshold: 242, rate: 0.0585 }, monthly: { threshold: 1048, rate: 0.0585 } },
  categoryD: { weekly: { threshold: 242, rate: 0.0585 }, monthly: { threshold: 1048, rate: 0.0585 } },
  categoryE: { weekly: { threshold: 242, rate: 0.0585 }, monthly: { threshold: 1048, rate: 0.0585 } },
  categoryF: { weekly: { threshold: 242, rate: 0.0585 }, monthly: { threshold: 1048, rate: 0.0585 } },
  categoryG: { weekly: { threshold: 242, rate: 0.0585 }, monthly: { threshold: 1048, rate: 0.0585 } },
  categoryH: { weekly: { threshold: 242, rate: 0.0585 }, monthly: { threshold: 1048, rate: 0.0585 } },
  categoryJ: { weekly: { threshold: 242, rate: 0.02 }, monthly: { threshold: 1048, rate: 0.02 } },
  categoryM: { weekly: { threshold: 242, rate: 0.12 }, monthly: { threshold: 1048, rate: 0.12 } },
  categoryZ: { weekly: { threshold: 242, rate: 0.02 }, monthly: { threshold: 1048, rate: 0.02 } }
};

const STUDENT_LOAN_THRESHOLDS = {
  plan1: { weekly: 480, monthly: 2083, annual: 25000 },
  plan2: { weekly: 524, monthly: 2271, annual: 27295 },
  plan4: { weekly: 480, monthly: 2083, annual: 25000 }
};

export interface WageCalculationData {
  staffMemberId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  totalHours: number;
  standardHours: number;
  overtimeHours: number;
  grossPay: number;
  standardPay: number;
  overtimePay: number;
  incomeTax: number;
  nationalInsurance: number;
  pensionContribution: number;
  studentLoan: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
}

export interface TimesheetEntry {
  id: string;
  staff_member_id: string;
  date: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  lunch_minutes: number;
  total_minutes: number;
  standard_minutes: number;
  overtime_minutes: number;
  notes?: string;
  is_approved: boolean;
}

export interface WageSettings {
  id: string;
  staff_member_id: string;
  standard_hours_per_week: number;
  hourly_rate: number;
  overtime_rate: number;
  standard_start_time: string;
  standard_end_time: string;
  is_active: boolean;
}

export interface TaxSettings {
  id: string;
  staff_member_id: string;
  tax_code: string;
  national_insurance_category: string;
  pension_contribution_rate: number;
  student_loan_plan?: string;
  is_active: boolean;
}

class WageCalculationService {
  /**
   * Calculate income tax based on UK tax bands
   */
  private calculateIncomeTax(grossPay: number, taxCode: string): number {
    // Extract personal allowance from tax code (simplified)
    const personalAllowance = this.extractPersonalAllowance(taxCode);
    
    const taxableIncome = Math.max(0, grossPay - personalAllowance);
    
    if (taxableIncome <= 0) return 0;
    
    let tax = 0;
    
    // Basic rate (20%)
    if (taxableIncome <= TAX_BANDS.basicRate.threshold) {
      tax = taxableIncome * TAX_BANDS.basicRate.rate;
    } else {
      tax = TAX_BANDS.basicRate.threshold * TAX_BANDS.basicRate.rate;
      
      // Higher rate (40%)
      const higherRateIncome = Math.min(
        taxableIncome - TAX_BANDS.basicRate.threshold,
        TAX_BANDS.higherRate.threshold - TAX_BANDS.basicRate.threshold
      );
      tax += higherRateIncome * TAX_BANDS.higherRate.rate;
      
      // Additional rate (45%)
      if (taxableIncome > TAX_BANDS.higherRate.threshold) {
        const additionalRateIncome = taxableIncome - TAX_BANDS.higherRate.threshold;
        tax += additionalRateIncome * TAX_BANDS.additionalRate.rate;
      }
    }
    
    return Math.round(tax * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Extract personal allowance from tax code
   */
  private extractPersonalAllowance(taxCode: string): number {
    // Simplified extraction - in reality this would be more complex
    const numericPart = taxCode.replace(/[A-Z]/g, '');
    if (numericPart) {
      return parseInt(numericPart) * 10; // Tax codes are in hundreds
    }
    return TAX_BANDS.personalAllowance; // Default
  }

  /**
   * Calculate National Insurance contributions
   */
  private calculateNationalInsurance(grossPay: number, category: string): number {
    const rates = NATIONAL_INSURANCE_RATES[category as keyof typeof NATIONAL_INSURANCE_RATES];
    if (!rates) return 0;
    
    // Use monthly rates for monthly pay periods
    const threshold = rates.monthly.threshold;
    const rate = rates.monthly.rate;
    
    const taxableIncome = Math.max(0, grossPay - threshold);
    return Math.round(taxableIncome * rate * 100) / 100;
  }

  /**
   * Calculate student loan deductions
   */
  private calculateStudentLoan(grossPay: number, plan?: string): number {
    if (!plan) return 0;
    
    const thresholds = STUDENT_LOAN_THRESHOLDS[plan as keyof typeof STUDENT_LOAN_THRESHOLDS];
    if (!thresholds) return 0;
    
    const monthlyThreshold = thresholds.monthly;
    const taxableIncome = Math.max(0, grossPay - monthlyThreshold);
    
    return Math.round(taxableIncome * 0.09 * 100) / 100; // 9% of income above threshold
  }

  /**
   * Calculate pension contribution
   */
  private calculatePensionContribution(grossPay: number, rate: number): number {
    return Math.round(grossPay * (rate / 100) * 100) / 100;
  }

  /**
   * Get wage settings for a staff member
   */
  async getWageSettings(staffMemberId: string): Promise<WageSettings | null> {
    const { data, error } = await supabase
      .from('wage_settings')
      .select('*')
      .eq('staff_member_id', staffMemberId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching wage settings:', error);
      return null;
    }

    return data;
  }

  /**
   * Get tax settings for a staff member
   */
  async getTaxSettings(staffMemberId: string): Promise<TaxSettings | null> {
    const { data, error } = await supabase
      .from('tax_settings')
      .select('*')
      .eq('staff_member_id', staffMemberId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching tax settings:', error);
      return null;
    }

    return data;
  }

  /**
   * Get timesheet entries for a pay period
   */
  async getTimesheetEntries(staffMemberId: string, startDate: string, endDate: string): Promise<TimesheetEntry[]> {
    const { data, error } = await supabase
      .from('timesheet_entries')
      .select('*')
      .eq('staff_member_id', staffMemberId)
      .gte('date', startDate)
      .lte('date', endDate)
      .eq('is_approved', true)
      .order('date');

    if (error) {
      console.error('Error fetching timesheet entries:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Calculate wages for a staff member for a pay period
   */
  async calculateWages(staffMemberId: string, payPeriodStart: string, payPeriodEnd: string): Promise<WageCalculationData | null> {
    try {
      // Get wage and tax settings
      const wageSettings = await this.getWageSettings(staffMemberId);
      const taxSettings = await this.getTaxSettings(staffMemberId);

      if (!wageSettings || !taxSettings) {
        console.error('Missing wage or tax settings for staff member:', staffMemberId);
        return null;
      }

      // Get timesheet entries
      const timesheetEntries = await this.getTimesheetEntries(staffMemberId, payPeriodStart, payPeriodEnd);

      // Calculate total hours
      let totalMinutes = 0;
      let standardMinutes = 0;
      let overtimeMinutes = 0;

      timesheetEntries.forEach(entry => {
        totalMinutes += entry.total_minutes;
        standardMinutes += entry.standard_minutes;
        overtimeMinutes += entry.overtime_minutes;
      });

      // Convert to hours
      const totalHours = totalMinutes / 60;
      const standardHours = standardMinutes / 60;
      const overtimeHours = overtimeMinutes / 60;

      // Calculate gross pay
      const standardPay = standardHours * wageSettings.hourly_rate;
      const overtimePay = overtimeHours * wageSettings.overtime_rate;
      const grossPay = standardPay + overtimePay;

      // Calculate deductions
      const incomeTax = this.calculateIncomeTax(grossPay, taxSettings.tax_code);
      const nationalInsurance = this.calculateNationalInsurance(grossPay, taxSettings.national_insurance_category);
      const pensionContribution = this.calculatePensionContribution(grossPay, taxSettings.pension_contribution_rate);
      const studentLoan = this.calculateStudentLoan(grossPay, taxSettings.student_loan_plan);

      const totalDeductions = incomeTax + nationalInsurance + pensionContribution + studentLoan;
      const netPay = grossPay - totalDeductions;

      return {
        staffMemberId,
        payPeriodStart,
        payPeriodEnd,
        totalHours: Math.round(totalHours * 100) / 100,
        standardHours: Math.round(standardHours * 100) / 100,
        overtimeHours: Math.round(overtimeHours * 100) / 100,
        grossPay: Math.round(grossPay * 100) / 100,
        standardPay: Math.round(standardPay * 100) / 100,
        overtimePay: Math.round(overtimePay * 100) / 100,
        incomeTax: Math.round(incomeTax * 100) / 100,
        nationalInsurance: Math.round(nationalInsurance * 100) / 100,
        pensionContribution: Math.round(pensionContribution * 100) / 100,
        studentLoan: Math.round(studentLoan * 100) / 100,
        otherDeductions: 0,
        totalDeductions: Math.round(totalDeductions * 100) / 100,
        netPay: Math.round(netPay * 100) / 100
      };

    } catch (error) {
      console.error('Error calculating wages:', error);
      return null;
    }
  }

  /**
   * Save wage calculation to database
   */
  async saveWageCalculation(calculation: WageCalculationData): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('wage_calculations')
        .insert({
          staff_member_id: calculation.staffMemberId,
          pay_period_start: calculation.payPeriodStart,
          pay_period_end: calculation.payPeriodEnd,
          total_hours: calculation.totalHours,
          standard_hours: calculation.standardHours,
          overtime_hours: calculation.overtimeHours,
          gross_pay: calculation.grossPay,
          standard_pay: calculation.standardPay,
          overtime_pay: calculation.overtimePay,
          income_tax: calculation.incomeTax,
          national_insurance: calculation.nationalInsurance,
          pension_contribution: calculation.pensionContribution,
          student_loan: calculation.studentLoan,
          other_deductions: calculation.otherDeductions,
          total_deductions: calculation.totalDeductions,
          net_pay: calculation.netPay,
          status: 'calculated'
        });

      if (error) {
        console.error('Error saving wage calculation:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving wage calculation:', error);
      return false;
    }
  }

  /**
   * Generate wage slip
   */
  async generateWageSlip(wageCalculationId: string, staffMemberId: string): Promise<boolean> {
    try {
      // Get wage calculation
      const { data: calculation, error: calcError } = await supabase
        .from('wage_calculations')
        .select('*')
        .eq('id', wageCalculationId)
        .single();

      if (calcError || !calculation) {
        console.error('Error fetching wage calculation:', calcError);
        return false;
      }

      // Get staff member details
      const { data: staffMember, error: staffError } = await supabase
        .from('staff_members')
        .select('*')
        .eq('id', staffMemberId)
        .single();

      if (staffError || !staffMember) {
        console.error('Error fetching staff member:', staffError);
        return false;
      }

      // Generate slip number
      const slipNumber = `WS-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

      // Create wage slip
      const { error: slipError } = await supabase
        .from('wage_slips')
        .insert({
          wage_calculation_id: wageCalculationId,
          staff_member_id: staffMemberId,
          slip_number: slipNumber,
          pay_period_start: calculation.pay_period_start,
          pay_period_end: calculation.pay_period_end,
          employee_name: `${staffMember.first_name} ${staffMember.family_name}`,
          employee_number: staffMember.employee_number,
          national_insurance: staffMember.national_insurance,
          tax_code: staffMember.tax_code,
          gross_pay: calculation.gross_pay,
          total_deductions: calculation.total_deductions,
          net_pay: calculation.net_pay,
          standard_pay: calculation.standard_pay,
          overtime_pay: calculation.overtime_pay,
          income_tax: calculation.income_tax,
          national_insurance_deduction: calculation.national_insurance,
          pension_contribution: calculation.pension_contribution,
          student_loan: calculation.student_loan,
          other_deductions: calculation.other_deductions,
          total_hours: calculation.total_hours,
          standard_hours: calculation.standard_hours,
          overtime_hours: calculation.overtime_hours,
          status: 'generated'
        });

      if (slipError) {
        console.error('Error generating wage slip:', slipError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error generating wage slip:', error);
      return false;
    }
  }

  /**
   * Automatically calculate wages for all active staff members
   */
  async calculateAllWages(payPeriodStart: string, payPeriodEnd: string): Promise<void> {
    try {
      // Get all active staff members
      const { data: staffMembers, error } = await supabase
        .from('staff_members')
        .select('id')
        .eq('is_active', true);

      if (error || !staffMembers) {
        console.error('Error fetching staff members:', error);
        return;
      }

      // Calculate wages for each staff member
      for (const staffMember of staffMembers) {
        const calculation = await this.calculateWages(staffMember.id, payPeriodStart, payPeriodEnd);
        if (calculation) {
          await this.saveWageCalculation(calculation);
          console.log(`✅ Calculated wages for staff member ${staffMember.id}`);
        }
      }

      console.log(`🎉 Wage calculation completed for ${staffMembers.length} staff members`);
    } catch (error) {
      console.error('Error calculating all wages:', error);
    }
  }
}

export const wageCalculationService = new WageCalculationService();
