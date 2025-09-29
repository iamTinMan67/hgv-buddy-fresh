# 💰 Wage Automation Integration with Staff Data

## 🎯 Overview

The staff data you've created is **directly integrated** with a comprehensive wage automation system that handles:

- ✅ **Automatic wage calculations** based on hours worked
- ✅ **UK tax calculations** (Income Tax, National Insurance)
- ✅ **Pension contributions** and other deductions
- ✅ **Student loan deductions** (Plan 1, 2, 4)
- ✅ **Overtime calculations** with different rates
- ✅ **Automated wage slip generation**

## 🔗 Data Integration Flow

### 1. **Staff Data → Wage Settings**
```
staff_members table
├── Personal details (name, address, contact)
├── Employment details (role, start_date)
├── Tax information (tax_code, national_insurance)
└── Bank details (for payments)

↓ Links to ↓

wage_settings table
├── hourly_rate (based on role)
├── overtime_rate (1.5x hourly rate)
├── standard_hours_per_week (40)
└── standard_start_time/end_time
```

### 2. **Staff Data → Tax Settings**
```
staff_members.tax_code → tax_settings.tax_code
staff_members.national_insurance → tax_settings.national_insurance_category
staff_members.role → pension_contribution_rate
```

### 3. **Timesheet Data → Wage Calculations**
```
timesheet_entries table
├── start_time, end_time
├── break_minutes, lunch_minutes
├── total_minutes, standard_minutes, overtime_minutes
└── is_approved (must be true for calculation)

↓ Calculates ↓

wage_calculations table
├── gross_pay (standard_pay + overtime_pay)
├── income_tax (UK tax bands)
├── national_insurance (category-based)
├── pension_contribution
├── student_loan (if applicable)
└── net_pay (gross_pay - total_deductions)
```

## 📊 Automatic Calculations

### **Hourly Rate by Role:**
- **Driver**: £15.50/hour (Overtime: £23.25)
- **Admin**: £18.00/hour (Overtime: £27.00)
- **Manager**: £20.00/hour (Overtime: £30.00)

### **UK Tax Calculations (2024/25):**
- **Personal Allowance**: £12,570 (tax-free)
- **Basic Rate**: 20% on £12,571 - £50,270
- **Higher Rate**: 40% on £50,271 - £125,140
- **Additional Rate**: 45% on over £125,140

### **National Insurance (Category A):**
- **Threshold**: £1,048/month
- **Rate**: 12% on income above threshold

### **Student Loan Deductions:**
- **Plan 1**: 9% on income above £25,000/year
- **Plan 2**: 9% on income above £27,295/year
- **Plan 4**: 9% on income above £25,000/year

## 🚀 Automation Features

### **1. Automatic Wage Calculation**
```typescript
// Runs automatically for all staff members
await wageCalculationService.calculateAllWages('2024-01-01', '2024-01-31');
```

### **2. Real-time Timesheet Processing**
- Timesheet entries are automatically processed
- Only approved timesheets are included in calculations
- Standard vs overtime hours calculated automatically

### **3. Automated Wage Slip Generation**
- Generates unique wage slip numbers
- Includes all pay details and deductions
- Ready for printing or digital distribution

### **4. Tax Code Processing**
- Automatically extracts personal allowance from tax codes
- Handles complex UK tax calculations
- Supports all National Insurance categories

## 📋 Database Tables Created

### **Core Tables:**
1. **`wage_settings`** - Hourly rates, overtime rates, standard hours
2. **`tax_settings`** - Tax codes, NI categories, pension rates
3. **`timesheet_entries`** - Daily time tracking with approval status
4. **`wage_calculations`** - Automated wage calculations with all deductions
5. **`wage_slips`** - Generated pay slips ready for distribution

### **Relationships:**
- All tables link to `staff_members` via `staff_member_id`
- `wage_slips` link to `wage_calculations` for audit trail
- `timesheet_entries` require approval before wage calculation

## 🔧 Setup Instructions

### **1. Run Database Schema:**
```sql
-- Run in Supabase SQL Editor
database/add_wage_automation_tables.sql
```

### **2. Default Settings Created:**
- ✅ Wage settings for all existing staff members
- ✅ Tax settings with default UK tax codes
- ✅ Ready for immediate wage calculations

### **3. Integration Points:**
- ✅ Staff Management form data populates wage/tax settings
- ✅ Timesheet component feeds into wage calculations
- ✅ Wage Management component displays calculated wages
- ✅ Reports component generates wage reports

## 💡 Key Benefits

### **For Management:**
- **Automated calculations** eliminate manual errors
- **UK tax compliance** built-in
- **Real-time wage tracking** for all staff
- **Audit trail** for all calculations

### **For Staff:**
- **Accurate wage slips** with detailed breakdowns
- **Transparent calculations** showing all deductions
- **Digital access** to wage information
- **Automatic overtime** recognition

### **For Compliance:**
- **HMRC compliant** tax calculations
- **National Insurance** properly calculated
- **Student loan** deductions handled
- **Pension contributions** automated

## 🎯 Next Steps

1. **Run the wage automation schema** in Supabase
2. **Test wage calculations** with sample timesheet data
3. **Generate wage slips** for existing staff
4. **Set up automated payroll** processes

**Your staff data is now fully integrated with a comprehensive wage automation system that handles all UK tax calculations and deductions automatically!** 🚀
