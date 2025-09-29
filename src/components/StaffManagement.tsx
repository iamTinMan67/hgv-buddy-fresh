import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { staffIdGenerator } from '../utils/staffIdGenerator';
import { staffAuthService } from '../services/staffAuthService';
import {
  Add,
  Edit,
  Delete,
  Person,
  Business,
  Work,
  Phone,
  Home,
  Group,
  SupervisorAccount,
  Engineering,
  AdminPanelSettings,
  CleaningServices,
  PhoneAndroid,
  AlternateEmail,
  Schedule,
  Receipt,
  Security,
  Save,
  DirectionsCar,
  TableChart,
  ViewModule,
} from '@mui/icons-material';

interface StaffManagementProps {
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`staff-tabpanel-${index}`}
      aria-labelledby={`staff-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface StaffMember {
  id: string;
  staffId: string; // Auto-generated staff ID in format EMP-YYYY-MM-###
  firstName: string;
  middleName: string;
  familyName: string;
  address: {
    line1: string;
    line2: string;
    line3: string;
    town: string;
    postCode: string;
  };
  contact: {
    phone: string;
    mobile: string;
    email: string;
  };
  nextOfKin: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  };
  taxCode: string;
  nationalInsurance: string;
  role: 'manager' | 'admin' | 'driver';
  isActive: boolean;
  startDate: string;
  lastUpdated: string;
  // Login credentials
  username: string;
  password: string;
  // Driver-specific fields (only populated for driver roles)
  employeeNumber?: string;
  dateOfBirth?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  cpcCardNumber?: string;
  cpcExpiry?: string;
  medicalCertificate?: string;
  medicalExpiry?: string;
  currentVehicle?: string;
  totalHours?: number;
  totalMiles?: number;
  safetyScore?: number;
  performanceRating?: number;
  notes?: string;
  // New fields for multi-page form
  qualifications?: {
    name: string;
    issuingBody: string;
    issueDate: string;
    expiryDate?: string;
    documentUrl?: string;
  }[];
  licenses?: {
    type: string;
    number: string;
    issuingBody: string;
    issueDate: string;
    expiryDate: string;
    documentUrl?: string;
  }[];
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    sortCode: string;
    bankName: string;
    buildingSocietyNumber?: string;
  };
}

const StaffManagement: React.FC<StaffManagementProps> = ({ onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Filter states
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [nameFilter, setNameFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  
  const [currentStaff, setCurrentStaff] = useState<Partial<StaffMember>>({
    staffId: '',
    firstName: '',
    middleName: '',
    familyName: '',
    address: {
      line1: '',
      line2: '',
      line3: '',
      town: '',
      postCode: '',
    },
    contact: { phone: '', mobile: '', email: '' },
    nextOfKin: { name: '', relationship: '', phone: '', email: '' },
    taxCode: '',
    nationalInsurance: '',
    role: 'driver',
    isActive: true,
    startDate: new Date().toISOString().split('T')[0],
    username: '',
    password: '',
    qualifications: [],
    licenses: [],
    bankDetails: {
      accountName: '',
      accountNumber: '',
      sortCode: '',
      bankName: '',
      buildingSocietyNumber: '',
    },
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Multi-page form navigation
  const handleNextPage = async () => {
          // Attempting to go to next page
    if (await validateCurrentPage()) {
              // Validation passed, moving to next page
      setCurrentPage(prev => Math.min(prev + 1, 5)); // 6 pages total (0-5)
    } else {
              // Validation failed, staying on current page
    }
  };

  const handlePreviousPage = () => {
          // Going to previous page
    setCurrentPage(prev => Math.max(prev - 1, 0));
  };

  const validateCurrentPage = async (): Promise<boolean> => {
          // Validating page
    const errors: Record<string, string> = {};
    
    switch (currentPage) {
      case 0: // Personal, Address and Contact Information
        if (!currentStaff.firstName) errors.firstName = 'First name is required';
        if (!currentStaff.familyName) errors.familyName = 'Family name is required';
        if (!currentStaff.address?.line1) errors.addressLine1 = 'Address line 1 is required';
        if (!currentStaff.address?.town) errors.town = 'Town is required';
        if (!currentStaff.address?.postCode) errors.postCode = 'Post code is required';
        if (!currentStaff.contact?.mobile) errors.mobile = 'Mobile is required';
        if (!currentStaff.contact?.email) errors.email = 'Email is required';
        break;
      case 1: // Next of Kin Information
        if (!currentStaff.nextOfKin?.name) errors.nextOfKinName = 'Next of kin name is required';
        if (!currentStaff.nextOfKin?.relationship) errors.relationship = 'Relationship is required';
        break;
      case 2: // Employment Details
        if (!currentStaff.taxCode) errors.taxCode = 'Tax code is required';
        if (!currentStaff.nationalInsurance) errors.nationalInsurance = 'NI number is required';
        if (!currentStaff.startDate) errors.startDate = 'Start date is required';
        if (!currentStaff.username) errors.username = 'Username is required';
        if (!currentStaff.password) errors.password = 'Password is required';
        if (currentStaff.password && currentStaff.password.length < 6) errors.password = 'Password must be at least 6 characters';
        
        // Check for duplicate username (only for new staff, not when editing)
        if (currentStaff.username && !editingId) {
          const isUsernameTaken = await staffAuthService.isUsernameTaken(currentStaff.username);
          if (isUsernameTaken) {
            errors.username = 'Username is already taken';
          }
        }
        break;
      case 3: // Qualifications and Licenses
        // Optional page - no validation required
        // Page 3 (Qualifications) - no validation required
        break;
      case 4: // Bank Details
        if (!currentStaff.bankDetails?.accountName) errors.accountName = 'Account name is required';
        if (!currentStaff.bankDetails?.accountNumber) errors.accountNumber = 'Account number is required';
        if (!currentStaff.bankDetails?.sortCode) errors.sortCode = 'Sort code is required';
        if (!currentStaff.bankDetails?.bankName) errors.bankName = 'Bank name is required';
        break;
    }
    
            // Validation errors
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setCurrentStaff({
      staffId: '',
      firstName: '',
      middleName: '',
      familyName: '',
      address: { line1: '', line2: '', line3: '', town: '', postCode: '' },
      contact: { phone: '', mobile: '', email: '' },
      nextOfKin: { name: '', relationship: '', phone: '', email: '' },
      taxCode: '',
      nationalInsurance: '',
      role: 'driver',
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      username: '',
      password: '',
      qualifications: [],
      licenses: [],
      bankDetails: {
        accountName: '',
        accountNumber: '',
        sortCode: '',
        bankName: '',
        buildingSocietyNumber: '',
      },
    });
    setCurrentPage(0);
    setFormErrors({});
  };

  // Helper functions for qualifications and licenses
  const addQualification = () => {
    const newQualification = {
      name: '',
      issuingBody: '',
      issueDate: '',
      expiryDate: '',
      documentUrl: '',
    };
    setCurrentStaff(prev => ({
      ...prev,
      qualifications: [...(prev.qualifications || []), newQualification]
    }));
  };

  const updateQualification = (index: number, field: string, value: string) => {
    setCurrentStaff(prev => ({
      ...prev,
      qualifications: prev.qualifications?.map((qual, i) => 
        i === index ? { ...qual, [field]: value } : qual
      )
    }));
  };

  const removeQualification = (index: number) => {
    setCurrentStaff(prev => ({
      ...prev,
      qualifications: prev.qualifications?.filter((_, i) => i !== index)
    }));
  };

  const addLicense = () => {
    const newLicense = {
      type: '',
      number: '',
      issuingBody: '',
      issueDate: '',
      expiryDate: '',
      documentUrl: '',
    };
    setCurrentStaff(prev => ({
      ...prev,
      licenses: [...(prev.licenses || []), newLicense]
    }));
  };

  const updateLicense = (index: number, field: string, value: string) => {
    setCurrentStaff(prev => ({
      ...prev,
      licenses: prev.licenses?.map((license, i) => 
        i === index ? { ...license, [field]: value } : license
      )
    }));
  };

  const removeLicense = (index: number) => {
    setCurrentStaff(prev => ({
      ...prev,
      licenses: prev.licenses?.filter((_, i) => i !== index)
    }));
  };

  // Auto-generate Staff ID when start date changes
  useEffect(() => {
    const generateStaffId = async () => {
      if (currentStaff.startDate && !editingId) {
        try {
          const newStaffId = await staffIdGenerator.generateStaffId(currentStaff.startDate);
          setCurrentStaff(prev => ({ ...prev, staffId: newStaffId }));
        } catch (error) {
          console.error('Error generating Staff ID:', error);
          // Fallback to a timestamp-based ID if generation fails
          const startYear = new Date(currentStaff.startDate).getFullYear();
          const fallbackId = `EMP-${startYear}-${Date.now().toString().slice(-3)}`;
          setCurrentStaff(prev => ({ ...prev, staffId: fallbackId }));
        }
      }
    };
    
    generateStaffId();
  }, [currentStaff.startDate, editingId]);

  // Staff members state - starts empty, data will be loaded from Supabase
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);

  // Load staff members from Supabase on component mount
  useEffect(() => {
    const loadStaffMembers = async () => {
      try {
        const { supabase } = await import('../lib/supabase');
        
        const { data: staffMembers, error } = await supabase
          .from('staff_members')
          .select(`
            *,
            staff_qualifications (*),
            staff_licenses (*)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading staff:', error);
          return;
        }

        if (staffMembers) {
          // Convert staff_members to StaffMember format
          const staffData: StaffMember[] = staffMembers.map(staff => ({
            id: staff.id,
            staffId: staff.staff_id,
            firstName: staff.first_name,
            middleName: staff.middle_name || '',
            familyName: staff.family_name,
            address: {
              line1: staff.address_line1 || '',
              line2: staff.address_line2 || '',
              line3: staff.address_line3 || '',
              town: staff.town || '',
              postCode: staff.postcode || ''
            },
            contact: {
              phone: staff.phone || '',
              mobile: staff.mobile || '',
              email: staff.email
            },
            nextOfKin: {
              name: staff.next_of_kin_name || '',
              relationship: staff.next_of_kin_relationship || '',
              phone: staff.next_of_kin_phone || '',
              email: staff.next_of_kin_email || ''
            },
            taxCode: staff.tax_code || '',
            nationalInsurance: staff.national_insurance || '',
            role: staff.role as 'manager' | 'admin' | 'driver',
            isActive: staff.is_active,
            startDate: staff.start_date,
            lastUpdated: staff.updated_at,
            username: staff.email.split('@')[0], // Use email prefix as username
            password: '', // Not stored for security
            // Driver-specific fields
            employeeNumber: staff.employee_number,
            dateOfBirth: staff.date_of_birth,
            licenseNumber: staff.license_number,
            licenseExpiry: staff.license_expiry,
            // Bank details
            bankDetails: staff.bank_account_number ? {
              accountNumber: staff.bank_account_number,
              sortCode: staff.bank_sort_code || '',
              bankName: staff.bank_name || ''
            } : undefined,
            // Qualifications and licenses
            qualifications: staff.staff_qualifications?.map((qual: any) => ({
              name: qual.name,
              issuingBody: qual.issuing_body,
              issueDate: qual.issue_date,
              expiryDate: qual.expiry_date,
              documentUrl: qual.document_url
            })) || [],
            licenses: staff.staff_licenses?.map((license: any) => ({
              type: license.type,
              number: license.number,
              issuingBody: license.issuing_body,
              issueDate: license.issue_date,
              expiryDate: license.expiry_date,
              documentUrl: license.document_url
            })) || []
          }));

          setStaffMembers(staffData);
          
          // Also save to localStorage for backward compatibility
          localStorage.setItem('staffMembers', JSON.stringify(staffData));
        }
      } catch (error) {
        console.error('Error loading staff members:', error);
      }
    };

    loadStaffMembers();
  }, []);

  const handleAddStaff = async () => {
    try {
      // Generate staff ID
      const newStaffId = await staffIdGenerator.generateStaffId(currentStaff.startDate);
      
      // Import Supabase client
      const { supabase } = await import('../lib/supabase');
      
      // Generate a UUID for the new user
      const userId = crypto.randomUUID();
      
      // Create user record in users table (for auth)
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: currentStaff.contact?.email || '',
          first_name: currentStaff.firstName || '',
          last_name: currentStaff.familyName || '',
          role: currentStaff.role || 'driver'
        });

      if (userError) {
        console.error('Failed to create user record:', userError);
        alert(`Failed to create user record: ${userError.message}`);
        return;
      }

      // Create detailed staff record in staff_members table
      const { error: staffError } = await supabase
        .from('staff_members')
        .insert({
          user_id: userId,
          staff_id: newStaffId,
          first_name: currentStaff.firstName || '',
          middle_name: currentStaff.middleName || '',
          family_name: currentStaff.familyName || '',
          address_line1: currentStaff.address?.line1 || '',
          address_line2: currentStaff.address?.line2 || '',
          address_line3: currentStaff.address?.line3 || '',
          town: currentStaff.address?.town || '',
          postcode: currentStaff.address?.postCode || '',
          country: 'UK',
          phone: currentStaff.contact?.phone || '',
          mobile: currentStaff.contact?.mobile || '',
          email: currentStaff.contact?.email || '',
          next_of_kin_name: currentStaff.nextOfKin?.name || '',
          next_of_kin_relationship: currentStaff.nextOfKin?.relationship || '',
          next_of_kin_phone: currentStaff.nextOfKin?.phone || '',
          next_of_kin_email: currentStaff.nextOfKin?.email || '',
          role: currentStaff.role || 'driver',
          is_active: true,
          start_date: currentStaff.startDate || new Date().toISOString().split('T')[0],
          tax_code: currentStaff.taxCode || '',
          national_insurance: currentStaff.nationalInsurance || '',
          employee_number: currentStaff.employeeNumber || '',
          date_of_birth: currentStaff.dateOfBirth || '',
          license_number: currentStaff.licenseNumber || '',
          license_expiry: currentStaff.licenseExpiry || '',
          bank_account_number: currentStaff.bankDetails?.accountNumber || '',
          bank_sort_code: currentStaff.bankDetails?.sortCode || '',
          bank_name: currentStaff.bankDetails?.bankName || '',
          notes: ''
        });

      if (staffError) {
        console.error('Failed to create staff record:', staffError);
        alert(`Failed to create staff record: ${staffError.message}`);
        return;
      }

      // Get the staff_member_id for the newly created record
      const { data: newStaffMember, error: fetchError } = await supabase
        .from('staff_members')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (fetchError || !newStaffMember) {
        console.error('Failed to fetch new staff member:', fetchError);
        alert('Staff member created but failed to fetch ID for qualifications/licenses');
      } else {
        // Save qualifications if any
        if (currentStaff.qualifications && currentStaff.qualifications.length > 0) {
          const qualificationsData = currentStaff.qualifications.map(qual => ({
            staff_member_id: newStaffMember.id,
            name: qual.name,
            issuing_body: qual.issuingBody,
            issue_date: qual.issueDate,
            expiry_date: qual.expiryDate || null,
            document_url: qual.documentUrl || null
          }));

          const { error: qualError } = await supabase
            .from('staff_qualifications')
            .insert(qualificationsData);

          if (qualError) {
            console.error('Failed to save qualifications:', qualError);
          }
        }

        // Save licenses if any
        if (currentStaff.licenses && currentStaff.licenses.length > 0) {
          const licensesData = currentStaff.licenses.map(license => ({
            staff_member_id: newStaffMember.id,
            type: license.type,
            number: license.number,
            issuing_body: license.issuingBody,
            issue_date: license.issueDate,
            expiry_date: license.expiryDate,
            document_url: license.documentUrl || null
          }));

          const { error: licenseError } = await supabase
            .from('staff_licenses')
            .insert(licensesData);

          if (licenseError) {
            console.error('Failed to save licenses:', licenseError);
          }
        }
      }

      if (userError) {
        console.error('Failed to create user record:', userError);
        alert(`Failed to create user record: ${userError.message}`);
        return;
      }

      // Create staff member object for local state
      const newStaff: StaffMember = {
        ...currentStaff as StaffMember,
        id: userId,
        staffId: newStaffId,
        lastUpdated: new Date().toISOString(),
      };
      
      // Update local state
      setStaffMembers(prevStaff => {
        const updatedStaff = [...prevStaff, newStaff];
        
        // Save to localStorage for backward compatibility
        localStorage.setItem('staffMembers', JSON.stringify(updatedStaff));
        
        return updatedStaff;
      });
      
      // Reset form and close dialog
      resetForm();
      setShowAddDialog(false);
      
      // Show success message with instructions
      alert(`✅ Staff member created successfully!\n\nTo complete the setup:\n1. Go to Supabase Dashboard > Authentication > Users\n2. Click "Add User"\n3. Email: ${currentStaff.contact?.email}\n4. Password: ${currentStaff.password}\n5. Raw User Meta Data: {"role": "${currentStaff.role}", "first_name": "${currentStaff.firstName}", "last_name": "${currentStaff.familyName}"}`);
      
      console.log('✅ Staff member created successfully:', {
        id: userId,
        email: currentStaff.contact?.email,
        role: currentStaff.role
      });
      
    } catch (error) {
      console.error('Error creating staff member:', error);
      alert('Failed to create staff member. Please try again.');
    }
  };

  const handleEditStaff = (staff: StaffMember) => {
    // Deep clone the staff member to ensure all nested objects are properly copied
    const staffToEdit = {
      ...staff,
      address: { ...staff.address },
      contact: { ...staff.contact },
      nextOfKin: { ...staff.nextOfKin },
      qualifications: staff.qualifications ? [...staff.qualifications] : [],
      licenses: staff.licenses ? [...staff.licenses] : [],
      bankDetails: staff.bankDetails ? { ...staff.bankDetails } : {
        accountName: '',
        accountNumber: '',
        sortCode: '',
        bankName: '',
        buildingSocietyNumber: '',
      },
    };
    
    setCurrentStaff(staffToEdit);
    setEditingId(staff.id);
    setCurrentPage(0); // Reset to first page when editing
    setShowAddDialog(true);
  };

  const handleUpdateStaff = async () => {
    if (!editingId) return;
    
    try {
      // Import Supabase client
      const { supabase } = await import('../lib/supabase');
      
      // Update user record in Supabase
      const { error: userError } = await supabase
        .from('users')
        .update({
          email: currentStaff.contact?.email || '',
          first_name: currentStaff.firstName || '',
          last_name: currentStaff.familyName || '',
          role: currentStaff.role || 'driver'
        })
        .eq('id', editingId);

      if (userError) {
        console.error('Failed to update user record:', userError);
        alert(`Failed to update user record: ${userError.message}`);
        return;
      }

      // Update detailed staff record in staff_members table
      const { error: staffError } = await supabase
        .from('staff_members')
        .update({
          first_name: currentStaff.firstName || '',
          middle_name: currentStaff.middleName || '',
          family_name: currentStaff.familyName || '',
          address_line1: currentStaff.address?.line1 || '',
          address_line2: currentStaff.address?.line2 || '',
          address_line3: currentStaff.address?.line3 || '',
          town: currentStaff.address?.town || '',
          postcode: currentStaff.address?.postCode || '',
          phone: currentStaff.contact?.phone || '',
          mobile: currentStaff.contact?.mobile || '',
          email: currentStaff.contact?.email || '',
          next_of_kin_name: currentStaff.nextOfKin?.name || '',
          next_of_kin_relationship: currentStaff.nextOfKin?.relationship || '',
          next_of_kin_phone: currentStaff.nextOfKin?.phone || '',
          next_of_kin_email: currentStaff.nextOfKin?.email || '',
          role: currentStaff.role || 'driver',
          tax_code: currentStaff.taxCode || '',
          national_insurance: currentStaff.nationalInsurance || '',
          employee_number: currentStaff.employeeNumber || '',
          date_of_birth: currentStaff.dateOfBirth || '',
          license_number: currentStaff.licenseNumber || '',
          license_expiry: currentStaff.licenseExpiry || '',
          bank_account_number: currentStaff.bankDetails?.accountNumber || '',
          bank_sort_code: currentStaff.bankDetails?.sortCode || '',
          bank_name: currentStaff.bankDetails?.bankName || ''
        })
        .eq('user_id', editingId);

      if (staffError) {
        console.error('Failed to update staff record:', staffError);
        alert(`Failed to update staff record: ${staffError.message}`);
        return;
      }
      
      // Deep clone the current staff data to ensure all nested objects are preserved
      const updatedStaff: StaffMember = {
        ...currentStaff as StaffMember,
        id: editingId,
        lastUpdated: new Date().toISOString(),
        address: { ...currentStaff.address! },
        contact: { ...currentStaff.contact! },
        nextOfKin: { ...currentStaff.nextOfKin! },
        qualifications: currentStaff.qualifications ? [...currentStaff.qualifications] : [],
        licenses: currentStaff.licenses ? [...currentStaff.licenses] : [],
        bankDetails: currentStaff.bankDetails ? { ...currentStaff.bankDetails } : undefined,
      };
      
      const updatedStaffMembers = staffMembers.map(staff =>
        staff.id === editingId ? updatedStaff : staff
      );
      
      // Save to localStorage for authentication service
      localStorage.setItem('staffMembers', JSON.stringify(updatedStaffMembers));
      
      setStaffMembers(updatedStaffMembers);
      resetForm();
      setEditingId(null);
      setShowAddDialog(false);
      
      console.log('✅ Staff member updated successfully');
      
    } catch (error) {
      console.error('Error updating staff member:', error);
      alert('Failed to update staff member. Please try again.');
    }
  };

  const handleDeleteStaff = async (id: string) => {
    try {
      // Import Supabase client
      const { supabase } = await import('../lib/supabase');
      
      // Delete staff record from staff_members table
      const { error: staffError } = await supabase
        .from('staff_members')
        .delete()
        .eq('user_id', id);

      if (staffError) {
        console.error('Failed to delete staff record:', staffError);
        alert(`Failed to delete staff record: ${staffError.message}`);
        return;
      }

      // Delete user record from users table
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (userError) {
        console.error('Failed to delete user record:', userError);
        alert(`Failed to delete user record: ${userError.message}`);
        return;
      }
      
      // Update local state
      const updatedStaffMembers = staffMembers.filter(staff => staff.id !== id);
      setStaffMembers(updatedStaffMembers);
      
      // Save to localStorage for backward compatibility
      localStorage.setItem('staffMembers', JSON.stringify(updatedStaffMembers));
      
      console.log('✅ Staff member deleted successfully');
      
    } catch (error) {
      console.error('Error deleting staff member:', error);
      alert('Failed to delete staff member. Please try again.');
    }
  };


  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager': return 'primary';
      case 'admin': return 'secondary';
      case 'driver': return 'info';
      default: return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'manager':
        return <SupervisorAccount />;
      case 'admin':
        return <AdminPanelSettings />;
      case 'driver':
        return <DirectionsCar />;
      default:
        return <Person />;
    }
  };

  // Filter staff members based on current filters
  const filteredStaffMembers = staffMembers.filter(staff => {
    const matchesRole = roleFilter === 'all' || staff.role === roleFilter;
    const matchesName = nameFilter === '' || 
      `${staff.firstName} ${staff.middleName} ${staff.familyName}`.toLowerCase().includes(nameFilter.toLowerCase()) ||
      staff.staffId.toLowerCase().includes(nameFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && staff.isActive) || 
      (statusFilter === 'inactive' && !staff.isActive);
    
    return matchesRole && matchesName && matchesStatus;
  });

  const activeStaff = staffMembers.filter(s => s.isActive).length;
  const totalStaff = staffMembers.length;

  // Page titles for multi-page form
  const pageTitles = [
    'Personal, Address & Contact Information',
    'Next of Kin Information',
    'Employment Details',
    'Qualifications & Licenses',
    'Bank Details',
    'Review & Submit'
  ];

  return (
    <Box sx={{ py: 2, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
          Staff Management
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ color: 'yellow', fontSize: '1.5rem' }}
        >
          <Home />
        </IconButton>
      </Box>




      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{
            '& .MuiTab-root': {
              color: 'white',
              '&.Mui-selected': {
                color: 'yellow',
              },
              '&:hover': {
                color: 'yellow',
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'yellow',
            }
          }}
        >
          <Tab label="Staff Directory" />
          <Tab label="Reports" />
        </Tabs>
      </Box>

      {/* Staff Directory Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Staff Directory</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              // Opening Add Staff Member dialog
              console.log('Current form state before opening:', currentStaff);
              setShowAddDialog(true);
            }}
          >
            Add Staff Member
          </Button>
        </Box>



        {/* Filter Controls */}
        <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom color="primary">
            Filter Staff Directory
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  label="Role"
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="driver">Driver</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Search by Name or Staff ID"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="Enter name or staff ID..."
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setRoleFilter('all');
                    setNameFilter('');
                    setStatusFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                  Showing {filteredStaffMembers.length} of {totalStaff} staff members
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* View Toggle */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={viewMode === 'table' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setViewMode('table')}
              startIcon={<TableChart />}
            >
              Table View
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setViewMode('cards')}
              startIcon={<ViewModule />}
            >
              Card View
            </Button>
          </Box>
        </Box>

        {viewMode === 'table' ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Staff ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Tax Code</TableCell>
                  <TableCell>NI Number</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStaffMembers.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {staff.staffId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: getRoleColor(staff.role) }}>
                          {getRoleIcon(staff.role)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1">
                            {staff.firstName} {staff.middleName} {staff.familyName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Started: {new Date(staff.startDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getRoleIcon(staff.role)}
                        label={staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                        color={getRoleColor(staff.role) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          <Phone sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          {staff.contact.phone}
                        </Typography>
                        <Typography variant="body2">
                          <PhoneAndroid sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          {staff.contact.mobile}
                        </Typography>
                        <Typography variant="body2">
                          <AlternateEmail sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          {staff.contact.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{staff.address.line1}</Typography>
                        {staff.address.line2 && (
                          <Typography variant="body2">{staff.address.line2}</Typography>
                        )}
                        <Typography variant="body2">
                          {staff.address.town}, {staff.address.postCode}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{staff.taxCode}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{staff.nationalInsurance}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={staff.isActive ? 'Active' : 'Inactive'}
                        color={staff.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditStaff(staff)}
                        sx={{ mr: 1 }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteStaff(staff.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Grid container spacing={3}>
            {filteredStaffMembers.map((staff) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={staff.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    {/* Header with Avatar and Role */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: getRoleColor(staff.role), width: 48, height: 48 }}>
                        {getRoleIcon(staff.role)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="div" gutterBottom>
                          {staff.firstName} {staff.middleName} {staff.familyName}
                        </Typography>
                        <Chip
                          icon={getRoleIcon(staff.role)}
                          label={staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                          color={getRoleColor(staff.role) as any}
                          size="small"
                        />
                      </Box>
                    </Box>

                    {/* Staff ID */}
                    <Typography variant="body2" color="primary" fontWeight="bold" gutterBottom>
                      {staff.staffId}
                    </Typography>

                    {/* Contact Information */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Contact
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Phone sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{staff.contact.phone}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PhoneAndroid sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{staff.contact.mobile}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AlternateEmail sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" noWrap>{staff.contact.email}</Typography>
                      </Box>
                    </Box>

                    {/* Address */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Address
                      </Typography>
                      <Typography variant="body2">{staff.address.line1}</Typography>
                      {staff.address.line2 && (
                        <Typography variant="body2">{staff.address.line2}</Typography>
                      )}
                      <Typography variant="body2">
                        {staff.address.town}, {staff.address.postCode}
                      </Typography>
                    </Box>

                    {/* Employment Details */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Employment
                      </Typography>
                      <Typography variant="body2">
                        <strong>Tax Code:</strong> {staff.taxCode}
                      </Typography>
                      <Typography variant="body2">
                        <strong>NI Number:</strong> {staff.nationalInsurance}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Started:</strong> {new Date(staff.startDate).toLocaleDateString()}
                      </Typography>
                    </Box>

                    {/* Status */}
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={staff.isActive ? 'Active' : 'Inactive'}
                        color={staff.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => handleEditStaff(staff)}
                        fullWidth
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteStaff(staff.id)}
                        fullWidth
                      >
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Reports Tab */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Staff Reports
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Staff by Role
                </Typography>
                {Object.entries(
                  staffMembers.reduce((acc, staff) => {
                    acc[staff.role] = (acc[staff.role] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([role, count]) => (
                  <Box key={role} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      {role.charAt(0).toUpperCase() + role.slice(1)}:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {count}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <List dense>
                  {staffMembers
                    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                    .slice(0, 5)
                    .map((staff) => (
                      <ListItem key={staff.id}>
                        <ListItemIcon>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: getRoleColor(staff.role) }}>
                            {getRoleIcon(staff.role)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={`${staff.firstName} ${staff.familyName}`}
                          secondary={`Updated: ${new Date(staff.lastUpdated).toLocaleDateString()}`}
                        />
                      </ListItem>
                    ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Add/Edit Staff Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
          {editingId ? 'Edit Staff Member' : 'Add New Staff Member'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Page {currentPage + 1} of {pageTitles.length}
            </Typography>
          </Box>
          {/* Progress indicator */}
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              {pageTitles.map((title, index) => (
                <Box
                  key={index}
                  sx={{
                    flex: 1,
                    textAlign: 'center',
                    color: index <= currentPage ? 'primary.main' : 'text.secondary',
                    fontSize: '0.75rem',
                    fontWeight: index === currentPage ? 'bold' : 'normal',
                  }}
                >
                  {title}
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {pageTitles.map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    flex: 1,
                    height: 4,
                    backgroundColor: index <= currentPage ? 'primary.main' : 'grey.300',
                    borderRadius: 1,
                  }}
                />
              ))}
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Page 1: Personal, Address and Contact Information */}
          {currentPage === 0 && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                Personal Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Staff ID"
                value={currentStaff.staffId || ''}
                  InputProps={{ readOnly: true }}
                sx={{ 
                  '& .MuiInputBase-input.Mui-readOnly': { 
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    cursor: 'default'
                  }
                }}
                helperText="Auto-generated unique identifier"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name *"
                value={currentStaff.firstName || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, firstName: e.target.value })}
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
                required
              />
            </Grid>
              <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Middle Name"
                value={currentStaff.middleName || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, middleName: e.target.value })}
              />
            </Grid>
              <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Family Name *"
                value={currentStaff.familyName || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, familyName: e.target.value })}
                  error={!!formErrors.familyName}
                  helperText={formErrors.familyName}
                required
              />
            </Grid>

            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }} color="primary">
                Address Information
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 1 *"
                value={currentStaff.address?.line1 || ''}
                onChange={(e) => setCurrentStaff({
                  ...currentStaff,
                  address: { ...currentStaff.address!, line1: e.target.value }
                })}
                  error={!!formErrors.addressLine1}
                  helperText={formErrors.addressLine1}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 2"
                value={currentStaff.address?.line2 || ''}
                onChange={(e) => setCurrentStaff({
                  ...currentStaff,
                  address: { ...currentStaff.address!, line2: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 3"
                value={currentStaff.address?.line3 || ''}
                onChange={(e) => setCurrentStaff({
                  ...currentStaff,
                  address: { ...currentStaff.address!, line3: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Town *"
                value={currentStaff.address?.town || ''}
                onChange={(e) => setCurrentStaff({
                  ...currentStaff,
                  address: { ...currentStaff.address!, town: e.target.value }
                })}
                  error={!!formErrors.town}
                  helperText={formErrors.town}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Post Code *"
                value={currentStaff.address?.postCode || ''}
                onChange={(e) => setCurrentStaff({
                  ...currentStaff,
                  address: { ...currentStaff.address!, postCode: e.target.value }
                })}
                  error={!!formErrors.postCode}
                  helperText={formErrors.postCode}
                required
              />
            </Grid>

            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }} color="primary">
                Contact Details
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Phone"
                value={currentStaff.contact?.phone || ''}
                onChange={(e) => setCurrentStaff({
                  ...currentStaff,
                  contact: { ...currentStaff.contact!, phone: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Mobile *"
                value={currentStaff.contact?.mobile || ''}
                onChange={(e) => setCurrentStaff({
                  ...currentStaff,
                  contact: { ...currentStaff.contact!, mobile: e.target.value }
                })}
                  error={!!formErrors.mobile}
                  helperText={formErrors.mobile}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={currentStaff.contact?.email || ''}
                onChange={(e) => setCurrentStaff({
                  ...currentStaff,
                  contact: { ...currentStaff.contact!, email: e.target.value }
                })}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                required
              />
            </Grid>
            </Grid>
          )}

          {/* Page 2: Next of Kin Information */}
          {currentPage === 1 && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                Next of Kin Details
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Next of Kin Name *"
                value={currentStaff.nextOfKin?.name || ''}
                onChange={(e) => setCurrentStaff({
                  ...currentStaff,
                  nextOfKin: { ...currentStaff.nextOfKin!, name: e.target.value }
                })}
                  error={!!formErrors.nextOfKinName}
                  helperText={formErrors.nextOfKinName}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Relationship *"
                value={currentStaff.nextOfKin?.relationship || ''}
                onChange={(e) => setCurrentStaff({
                  ...currentStaff,
                  nextOfKin: { ...currentStaff.nextOfKin!, relationship: e.target.value }
                })}
                  error={!!formErrors.relationship}
                  helperText={formErrors.relationship}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Next of Kin Phone"
                value={currentStaff.nextOfKin?.phone || ''}
                onChange={(e) => setCurrentStaff({
                  ...currentStaff,
                  nextOfKin: { ...currentStaff.nextOfKin!, phone: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Next of Kin Email"
                type="email"
                value={currentStaff.nextOfKin?.email || ''}
                onChange={(e) => setCurrentStaff({
                  ...currentStaff,
                  nextOfKin: { ...currentStaff.nextOfKin!, email: e.target.value }
                })}
              />
            </Grid>
            </Grid>
          )}

          {/* Page 3: Employment Details */}
          {currentPage === 2 && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                Employment Details
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Role *</InputLabel>
                <Select
                  value={currentStaff.role || 'driver'}
                  onChange={(e) => setCurrentStaff({ ...currentStaff, role: e.target.value as StaffMember['role'] })}
                  label="Role *"
                >
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="driver">Driver</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Tax Code *"
                value={currentStaff.taxCode || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, taxCode: e.target.value })}
                  error={!!formErrors.taxCode}
                  helperText={formErrors.taxCode}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="NI Number *"
                value={currentStaff.nationalInsurance || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, nationalInsurance: e.target.value })}
                  error={!!formErrors.nationalInsurance}
                  helperText={formErrors.nationalInsurance}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date *"
                type="date"
                value={currentStaff.startDate || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                  error={!!formErrors.startDate}
                  helperText={formErrors.startDate}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentStaff.isActive || false}
                    onChange={(e) => setCurrentStaff({ ...currentStaff, isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }} color="primary">
                Login Credentials
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                These credentials will be used for staff login. Username must be unique.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Username *"
                value={currentStaff.username || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, username: e.target.value })}
                error={!!formErrors.username}
                helperText={formErrors.username}
                required
                placeholder="Enter unique username"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password *"
                type="password"
                value={currentStaff.password || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, password: e.target.value })}
                error={!!formErrors.password}
                helperText={formErrors.password}
                required
                placeholder="Minimum 6 characters"
              />
            </Grid>

            {/* Driver-specific fields */}
            {currentStaff.role === 'driver' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }} color="primary">
                    Driver-Specific Information
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Employee Number"
                    value={currentStaff.employeeNumber || ''}
                    onChange={(e) => setCurrentStaff({ ...currentStaff, employeeNumber: e.target.value })}
                    placeholder="e.g., EMP001"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    value={currentStaff.dateOfBirth || ''}
                    onChange={(e) => setCurrentStaff({ ...currentStaff, dateOfBirth: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="License Number"
                    value={currentStaff.licenseNumber || ''}
                    onChange={(e) => setCurrentStaff({ ...currentStaff, licenseNumber: e.target.value })}
                    placeholder="e.g., DRIVER123456"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="License Expiry Date"
                    type="date"
                    value={currentStaff.licenseExpiry || ''}
                    onChange={(e) => setCurrentStaff({ ...currentStaff, licenseExpiry: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="CPC Card Number"
                    value={currentStaff.cpcCardNumber || ''}
                    onChange={(e) => setCurrentStaff({ ...currentStaff, cpcCardNumber: e.target.value })}
                    placeholder="e.g., CPC123456"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="CPC Expiry Date"
                    type="date"
                    value={currentStaff.cpcExpiry || ''}
                    onChange={(e) => setCurrentStaff({ ...currentStaff, cpcExpiry: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Medical Certificate Number"
                    value={currentStaff.medicalCertificate || ''}
                    onChange={(e) => setCurrentStaff({ ...currentStaff, medicalCertificate: e.target.value })}
                    placeholder="e.g., MED123456"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Medical Certificate Expiry"
                    type="date"
                    value={currentStaff.medicalExpiry || ''}
                    onChange={(e) => setCurrentStaff({ ...currentStaff, medicalExpiry: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Current Vehicle"
                    value={currentStaff.currentVehicle || ''}
                    onChange={(e) => setCurrentStaff({ ...currentStaff, currentVehicle: e.target.value })}
                    placeholder="e.g., HGV001"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Notes"
                    value={currentStaff.notes || ''}
                    onChange={(e) => setCurrentStaff({ ...currentStaff, notes: e.target.value })}
                    placeholder="Additional notes about the driver"
                    multiline
                    rows={2}
                  />
                </Grid>
              </>
            )}
          </Grid>
          )}

          {/* Page 4: Qualifications and Licenses */}
          {currentPage === 3 && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  Qualifications & Licenses
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Add any relevant qualifications, licenses, or certifications. You can upload supporting documents.
                </Typography>
              </Grid>
              
              {/* Qualifications Section */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">Qualifications</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={addQualification}
                    startIcon={<Add />}
                  >
                    Add Qualification
                  </Button>
                </Box>
                {currentStaff.qualifications?.map((qual, index) => (
                  <Card key={index} sx={{ mb: 2, p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Qualification Name"
                          value={qual.name}
                          onChange={(e) => updateQualification(index, 'name', e.target.value)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Issuing Body"
                          value={qual.issuingBody}
                          onChange={(e) => updateQualification(index, 'issuingBody', e.target.value)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Issue Date"
                          type="date"
                          value={qual.issueDate}
                          onChange={(e) => updateQualification(index, 'issueDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Expiry Date (Optional)"
                          type="date"
                          value={qual.expiryDate}
                          onChange={(e) => updateQualification(index, 'expiryDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Document URL (Optional)"
                          value={qual.documentUrl}
                          onChange={(e) => updateQualification(index, 'documentUrl', e.target.value)}
                          size="small"
                          helperText="Link to uploaded document or certificate"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => removeQualification(index)}
                          startIcon={<Delete />}
                        >
                          Remove Qualification
                        </Button>
                      </Grid>
                    </Grid>
                  </Card>
                ))}
              </Grid>

              {/* Licenses Section */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">Licenses & Certifications</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={addLicense}
                    startIcon={<Add />}
                  >
                    Add License
                  </Button>
                </Box>
                {currentStaff.licenses?.map((license, index) => (
                  <Card key={index} sx={{ mb: 2, p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="License Type"
                          value={license.type}
                          onChange={(e) => updateLicense(index, 'type', e.target.value)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="License Number"
                          value={license.number}
                          onChange={(e) => updateLicense(index, 'number', e.target.value)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Issuing Body"
                          value={license.issuingBody}
                          onChange={(e) => updateLicense(index, 'issuingBody', e.target.value)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Issue Date"
                          type="date"
                          value={license.issueDate}
                          onChange={(e) => updateLicense(index, 'issueDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Expiry Date"
                          type="date"
                          value={license.expiryDate}
                          onChange={(e) => updateLicense(index, 'expiryDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Document URL (Optional)"
                          value={license.documentUrl}
                          onChange={(e) => updateLicense(index, 'documentUrl', e.target.value)}
                          size="small"
                          helperText="Link to uploaded document"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => removeLicense(index)}
                          startIcon={<Delete />}
                        >
                          Remove License
                        </Button>
                      </Grid>
                    </Grid>
                  </Card>
                ))}
              </Grid>
            </Grid>
          )}

          {/* Page 5: Bank Details */}
          {currentPage === 4 && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  Bank Details
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Please provide your bank account details for salary payments.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Account Name *"
                  value={currentStaff.bankDetails?.accountName || ''}
                  onChange={(e) => setCurrentStaff({
                    ...currentStaff,
                    bankDetails: { ...currentStaff.bankDetails!, accountName: e.target.value }
                  })}
                  error={!!formErrors.accountName}
                  helperText={formErrors.accountName}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Account Number *"
                  value={currentStaff.bankDetails?.accountNumber || ''}
                  onChange={(e) => setCurrentStaff({
                    ...currentStaff,
                    bankDetails: { ...currentStaff.bankDetails!, accountNumber: e.target.value }
                  })}
                  error={!!formErrors.accountNumber}
                  helperText={formErrors.accountNumber}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Sort Code *"
                  value={currentStaff.bankDetails?.sortCode || ''}
                  onChange={(e) => setCurrentStaff({
                    ...currentStaff,
                    bankDetails: { ...currentStaff.bankDetails!, sortCode: e.target.value }
                  })}
                  error={!!formErrors.sortCode}
                  helperText={formErrors.sortCode}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bank Name *"
                  value={currentStaff.bankDetails?.bankName || ''}
                  onChange={(e) => setCurrentStaff({
                    ...currentStaff,
                    bankDetails: { ...currentStaff.bankDetails!, bankName: e.target.value }
                  })}
                  error={!!formErrors.bankName}
                  helperText={formErrors.bankName}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Building Society Number (Optional)"
                  value={currentStaff.bankDetails?.buildingSocietyNumber || ''}
                  onChange={(e) => setCurrentStaff({
                    ...currentStaff,
                    bankDetails: { ...currentStaff.bankDetails!, buildingSocietyNumber: e.target.value }
                  })}
                />
              </Grid>
            </Grid>
          )}

          {/* Page 6: Review and Submit */}
          {currentPage === 5 && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  Review & Submit
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Please review all the information before submitting.
                </Typography>
              </Grid>
              
              {/* Personal Information Review */}
              <Grid item xs={12}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                      Personal Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2"><strong>Staff ID:</strong> {currentStaff.staffId}</Typography>
                        <Typography variant="body2"><strong>Name:</strong> {currentStaff.firstName} {currentStaff.middleName} {currentStaff.familyName}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2"><strong>Role:</strong> {currentStaff.role}</Typography>
                        <Typography variant="body2"><strong>Start Date:</strong> {currentStaff.startDate}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Address Review */}
              <Grid item xs={12}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                      Address Information
                    </Typography>
                    <Typography variant="body2">
                      {currentStaff.address?.line1}<br />
                      {currentStaff.address?.line2 && <>{currentStaff.address.line2}<br /></>}
                      {currentStaff.address?.line3 && <>{currentStaff.address.line3}<br /></>}
                      {currentStaff.address?.town}, {currentStaff.address?.postCode}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Contact Review */}
              <Grid item xs={12}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                      Contact Details
                    </Typography>
                    <Typography variant="body2"><strong>Phone:</strong> {currentStaff.contact?.phone || 'Not provided'}</Typography>
                    <Typography variant="body2"><strong>Mobile:</strong> {currentStaff.contact?.mobile}</Typography>
                    <Typography variant="body2"><strong>Email:</strong> {currentStaff.contact?.email}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Next of Kin Review */}
              <Grid item xs={12}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                      Next of Kin
                    </Typography>
                    <Typography variant="body2"><strong>Name:</strong> {currentStaff.nextOfKin?.name}</Typography>
                    <Typography variant="body2"><strong>Relationship:</strong> {currentStaff.nextOfKin?.relationship}</Typography>
                    <Typography variant="body2"><strong>Phone:</strong> {currentStaff.nextOfKin?.phone || 'Not provided'}</Typography>
                    <Typography variant="body2"><strong>Email:</strong> {currentStaff.nextOfKin?.email || 'Not provided'}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Employment Review */}
              <Grid item xs={12}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                      Employment Details
                    </Typography>
                    <Typography variant="body2"><strong>Tax Code:</strong> {currentStaff.taxCode}</Typography>
                    <Typography variant="body2"><strong>NI Number:</strong> {currentStaff.nationalInsurance}</Typography>
                    <Typography variant="body2"><strong>Status:</strong> {currentStaff.isActive ? 'Active' : 'Inactive'}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Login Credentials Review */}
              <Grid item xs={12}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                      Login Credentials
                    </Typography>
                    <Typography variant="body2"><strong>Username:</strong> {currentStaff.username}</Typography>
                    <Typography variant="body2"><strong>Password:</strong> {'*'.repeat(currentStaff.password?.length || 0)}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Driver-Specific Review */}
              {currentStaff.role === 'driver' && (
                <Grid item xs={12}>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom color="primary">
                        Driver-Specific Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2"><strong>Employee Number:</strong> {currentStaff.employeeNumber || 'Not provided'}</Typography>
                          <Typography variant="body2"><strong>Date of Birth:</strong> {currentStaff.dateOfBirth || 'Not provided'}</Typography>
                          <Typography variant="body2"><strong>License Number:</strong> {currentStaff.licenseNumber || 'Not provided'}</Typography>
                          <Typography variant="body2"><strong>License Expiry:</strong> {currentStaff.licenseExpiry || 'Not provided'}</Typography>
                          <Typography variant="body2"><strong>CPC Card Number:</strong> {currentStaff.cpcCardNumber || 'Not provided'}</Typography>
                          <Typography variant="body2"><strong>CPC Expiry:</strong> {currentStaff.cpcExpiry || 'Not provided'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2"><strong>Medical Certificate:</strong> {currentStaff.medicalCertificate || 'Not provided'}</Typography>
                          <Typography variant="body2"><strong>Medical Expiry:</strong> {currentStaff.medicalExpiry || 'Not provided'}</Typography>
                          <Typography variant="body2"><strong>Current Vehicle:</strong> {currentStaff.currentVehicle || 'Not assigned'}</Typography>
                          <Typography variant="body2"><strong>Notes:</strong> {currentStaff.notes || 'No notes'}</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Qualifications Review */}
              {currentStaff.qualifications && currentStaff.qualifications.length > 0 && (
                <Grid item xs={12}>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom color="primary">
                        Qualifications ({currentStaff.qualifications.length})
                      </Typography>
                      {currentStaff.qualifications.map((qual, index) => (
                        <Box key={index} sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            <strong>{qual.name}</strong> - {qual.issuingBody}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Issued: {qual.issueDate} {qual.expiryDate && `| Expires: ${qual.expiryDate}`}
                          </Typography>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Licenses Review */}
              {currentStaff.licenses && currentStaff.licenses.length > 0 && (
                <Grid item xs={12}>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom color="primary">
                        Licenses ({currentStaff.licenses.length})
                      </Typography>
                      {currentStaff.licenses.map((license, index) => (
                        <Box key={index} sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            <strong>{license.type}</strong> - {license.number}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {license.issuingBody} | Issued: {license.issueDate} | Expires: {license.expiryDate}
                          </Typography>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Bank Details Review */}
              <Grid item xs={12}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                      Bank Details
                    </Typography>
                    <Typography variant="body2"><strong>Account Name:</strong> {currentStaff.bankDetails?.accountName}</Typography>
                    <Typography variant="body2"><strong>Account Number:</strong> {currentStaff.bankDetails?.accountNumber}</Typography>
                    <Typography variant="body2"><strong>Sort Code:</strong> {currentStaff.bankDetails?.sortCode}</Typography>
                    <Typography variant="body2"><strong>Bank:</strong> {currentStaff.bankDetails?.bankName}</Typography>
                    {currentStaff.bankDetails?.buildingSocietyNumber && (
                      <Typography variant="body2"><strong>Building Society Number:</strong> {currentStaff.bankDetails.buildingSocietyNumber}</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>
            Cancel
          </Button>
          {currentPage > 0 && (
            <Button onClick={handlePreviousPage}>
              Previous
            </Button>
          )}
          {currentPage < 5 ? (
            <Button onClick={handleNextPage} variant="contained">
              Next
            </Button>
          ) : (
          <Button
            onClick={() => {
              console.log('Form submission button clicked!');
              console.log('Current page:', currentPage);
              console.log('Editing ID:', editingId);
              console.log('Current staff data:', currentStaff);
              if (editingId) {
                handleUpdateStaff();
              } else {
                handleAddStaff();
              }
            }}
            variant="contained"
            startIcon={editingId ? <Save /> : <Add />}
          >
              {editingId ? 'Update Staff Member' : 'Add Staff Member'}
          </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffManagement;
