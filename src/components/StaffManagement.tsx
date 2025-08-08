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
  staffId: string; // Auto-generated staff ID in format EMP-YYYY-###
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
  role: 'manager' | 'admin' | 'mechanic' | 'dispatcher' | 'accountant' | 'hr' | 'receptionist' | 'cleaner' | 'security' | 'driver' | 'senior_driver' | 'trainer' | 'supervisor';
  isActive: boolean;
  startDate: string;
  lastUpdated: string;
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
}

const StaffManagement: React.FC<StaffManagementProps> = ({ onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
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
    contact: {
      phone: '',
      mobile: '',
      email: '',
    },
    nextOfKin: {
      name: '',
      relationship: '',
      phone: '',
      email: '',
    },
    taxCode: '',
    nationalInsurance: '',
    role: 'receptionist',
    isActive: true,
    startDate: new Date().toISOString().split('T')[0],
  });

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

  // Mock data for staff members
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: '1',
      staffId: 'EMP-2023-001',
      firstName: 'Sarah',
      middleName: 'Jane',
      familyName: 'Johnson',
      address: {
        line1: '123 Main Street',
        line2: 'Apartment 4B',
        line3: '',
        town: 'Manchester',
        postCode: 'M1 1AA',
      },
      contact: {
        phone: '0161 123 4567',
        mobile: '07700 900123',
        email: 'sarah.johnson@company.com',
      },
      nextOfKin: {
        name: 'John Johnson',
        relationship: 'Husband',
        phone: '0161 123 4568',
        email: 'john.johnson@email.com',
      },
      taxCode: '1257L',
      nationalInsurance: 'AB123456C',
      role: 'manager',
      isActive: true,
      startDate: '2023-01-15',
      lastUpdated: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      staffId: 'EMP-2023-002',
      firstName: 'Michael',
      middleName: 'David',
      familyName: 'Smith',
      address: {
        line1: '456 Oak Avenue',
        line2: '',
        line3: '',
        town: 'Liverpool',
        postCode: 'L1 2BB',
      },
      contact: {
        phone: '0151 234 5678',
        mobile: '07700 900456',
        email: 'michael.smith@company.com',
      },
      nextOfKin: {
        name: 'Emma Smith',
        relationship: 'Wife',
        phone: '0151 234 5679',
        email: 'emma.smith@email.com',
      },
      taxCode: '1257L',
      nationalInsurance: 'CD789012E',
      role: 'mechanic',
      isActive: true,
      startDate: '2023-03-20',
      lastUpdated: '2024-01-10T14:30:00Z',
    },
    {
      id: '3',
      staffId: 'EMP-2023-003',
      firstName: 'Lisa',
      middleName: '',
      familyName: 'Brown',
      address: {
        line1: '789 Pine Road',
        line2: 'Flat 2',
        line3: 'Building A',
        town: 'Birmingham',
        postCode: 'B1 3CC',
      },
      contact: {
        phone: '0121 345 6789',
        mobile: '07700 900789',
        email: 'lisa.brown@company.com',
      },
      nextOfKin: {
        name: 'Robert Brown',
        relationship: 'Father',
        phone: '0121 345 6790',
        email: 'robert.brown@email.com',
      },
      taxCode: '1257L',
      nationalInsurance: 'EF345678G',
      role: 'dispatcher',
      isActive: true,
      startDate: '2023-06-10',
      lastUpdated: '2024-01-05T09:15:00Z',
    },
    // Driver data merged from DriverManagement
    {
      id: '4',
      staffId: 'EMP-2020-001',
      firstName: 'John',
      middleName: '',
      familyName: 'Driver',
      address: {
        line1: '123 Main Street',
        line2: '',
        line3: '',
        town: 'London',
        postCode: 'SW1A 1AA',
      },
      contact: {
        phone: '+44 7700 900123',
        mobile: '+44 7700 900123',
        email: 'john.driver@company.com',
      },
      nextOfKin: {
        name: 'Jane Driver',
        relationship: 'Spouse',
        phone: '+44 7700 900124',
        email: 'jane.driver@email.com',
      },
      taxCode: '1257L',
      nationalInsurance: 'GH567890I',
      role: 'driver',
      isActive: true,
      startDate: '2020-01-15',
      lastUpdated: '2024-01-15T10:00:00Z',
      employeeNumber: 'EMP001',
      dateOfBirth: '1985-03-15',
      licenseNumber: 'DRIVER123456',
      licenseExpiry: '2025-03-15',
      cpcCardNumber: 'CPC123456',
      cpcExpiry: '2024-12-31',
      medicalCertificate: 'MED123456',
      medicalExpiry: '2024-06-30',
      currentVehicle: 'HGV001',
      totalHours: 1840,
      totalMiles: 45000,
      safetyScore: 95,
      performanceRating: 4.2,
      notes: 'Excellent driver, very reliable',
    },
    {
      id: '5',
      staffId: 'EMP-2019-001',
      firstName: 'Jane',
      middleName: '',
      familyName: 'Manager',
      address: {
        line1: '456 High Street',
        line2: '',
        line3: '',
        town: 'Manchester',
        postCode: 'M1 1AA',
      },
      contact: {
        phone: '+44 7700 900125',
        mobile: '+44 7700 900125',
        email: 'jane.manager@company.com',
      },
      nextOfKin: {
        name: 'John Manager',
        relationship: 'Spouse',
        phone: '+44 7700 900126',
        email: 'john.manager@email.com',
      },
      taxCode: '1257L',
      nationalInsurance: 'JK901234L',
      role: 'senior_driver',
      isActive: true,
      startDate: '2019-06-01',
      lastUpdated: '2024-01-15T10:00:00Z',
      employeeNumber: 'EMP002',
      dateOfBirth: '1988-07-22',
      licenseNumber: 'DRIVER789012',
      licenseExpiry: '2026-07-22',
      cpcCardNumber: 'CPC789012',
      cpcExpiry: '2025-06-30',
      medicalCertificate: 'MED789012',
      medicalExpiry: '2024-12-31',
      currentVehicle: 'HGV002',
      totalHours: 2200,
      totalMiles: 52000,
      safetyScore: 98,
      performanceRating: 4.5,
      notes: 'Senior driver, excellent safety record',
    },
    {
      id: '6',
      staffId: 'EMP-2021-001',
      firstName: 'Mike',
      middleName: '',
      familyName: 'Wilson',
      address: {
        line1: '789 Park Lane',
        line2: '',
        line3: '',
        town: 'Birmingham',
        postCode: 'B1 1AA',
      },
      contact: {
        phone: '+44 7700 900127',
        mobile: '+44 7700 900127',
        email: 'mike.wilson@company.com',
      },
      nextOfKin: {
        name: 'Sarah Wilson',
        relationship: 'Sister',
        phone: '+44 7700 900128',
        email: 'sarah.wilson@email.com',
      },
      taxCode: '1257L',
      nationalInsurance: 'MN345678O',
      role: 'driver',
      isActive: false,
      startDate: '2021-03-10',
      lastUpdated: '2024-01-15T10:00:00Z',
      employeeNumber: 'EMP003',
      dateOfBirth: '1990-11-08',
      licenseNumber: 'DRIVER345678',
      licenseExpiry: '2024-11-08',
      cpcCardNumber: 'CPC345678',
      cpcExpiry: '2023-12-31',
      medicalCertificate: 'MED345678',
      medicalExpiry: '2024-03-31',
      totalHours: 1200,
      totalMiles: 28000,
      safetyScore: 75,
      performanceRating: 3.1,
      notes: 'Currently suspended due to safety violations',
    },
    // Additional drivers from JobAllocationForm
    {
      id: '7',
      staffId: 'EMP-2022-001',
      firstName: 'Sarah',
      middleName: '',
      familyName: 'Johnson',
      address: {
        line1: '321 Elm Street',
        line2: '',
        line3: '',
        town: 'Leeds',
        postCode: 'LS1 1AA',
      },
      contact: {
        phone: '+44 113 123 4567',
        mobile: '+44 7700 900129',
        email: 'sarah.johnson@company.com',
      },
      nextOfKin: {
        name: 'Tom Johnson',
        relationship: 'Husband',
        phone: '+44 113 123 4568',
        email: 'tom.johnson@email.com',
      },
      taxCode: '1257L',
      nationalInsurance: 'PQ567890R',
      role: 'driver',
      isActive: true,
      startDate: '2022-02-15',
      lastUpdated: '2024-01-15T10:00:00Z',
      employeeNumber: 'EMP004',
      dateOfBirth: '1987-05-12',
      licenseNumber: 'DRIVER901234',
      licenseExpiry: '2025-05-12',
      cpcCardNumber: 'CPC901234',
      cpcExpiry: '2024-08-31',
      medicalCertificate: 'MED901234',
      medicalExpiry: '2024-09-30',
      currentVehicle: 'HGV003',
      totalHours: 1600,
      totalMiles: 38000,
      safetyScore: 92,
      performanceRating: 4.0,
      notes: 'Reliable driver with good safety record',
    },
    {
      id: '8',
      staffId: 'EMP-2021-002',
      firstName: 'David',
      middleName: '',
      familyName: 'Davis',
      address: {
        line1: '654 Oak Road',
        line2: '',
        line3: '',
        town: 'Sheffield',
        postCode: 'S1 1AA',
      },
      contact: {
        phone: '+44 114 234 5678',
        mobile: '+44 7700 900130',
        email: 'david.davis@company.com',
      },
      nextOfKin: {
        name: 'Mary Davis',
        relationship: 'Wife',
        phone: '+44 114 234 5679',
        email: 'mary.davis@email.com',
      },
      taxCode: '1257L',
      nationalInsurance: 'ST789012U',
      role: 'driver',
      isActive: true,
      startDate: '2021-08-20',
      lastUpdated: '2024-01-15T10:00:00Z',
      employeeNumber: 'EMP005',
      dateOfBirth: '1986-09-18',
      licenseNumber: 'DRIVER567890',
      licenseExpiry: '2025-09-18',
      cpcCardNumber: 'CPC567890',
      cpcExpiry: '2024-11-30',
      medicalCertificate: 'MED567890',
      medicalExpiry: '2024-12-31',
      currentVehicle: 'HGV004',
      totalHours: 1800,
      totalMiles: 42000,
      safetyScore: 94,
      performanceRating: 4.1,
      notes: 'Experienced driver with excellent route knowledge',
    },
    {
      id: '9',
      staffId: 'EMP-2023-004',
      firstName: 'Emma',
      middleName: '',
      familyName: 'Taylor',
      address: {
        line1: '987 Pine Avenue',
        line2: '',
        line3: '',
        town: 'Nottingham',
        postCode: 'NG1 1AA',
      },
      contact: {
        phone: '+44 115 345 6789',
        mobile: '+44 7700 900131',
        email: 'emma.taylor@company.com',
      },
      nextOfKin: {
        name: 'James Taylor',
        relationship: 'Husband',
        phone: '+44 115 345 6790',
        email: 'james.taylor@email.com',
      },
      taxCode: '1257L',
      nationalInsurance: 'VW123456X',
      role: 'driver',
      isActive: true,
      startDate: '2023-01-10',
      lastUpdated: '2024-01-15T10:00:00Z',
      employeeNumber: 'EMP006',
      dateOfBirth: '1989-12-03',
      licenseNumber: 'DRIVER123789',
      licenseExpiry: '2026-12-03',
      cpcCardNumber: 'CPC123789',
      cpcExpiry: '2025-03-31',
      medicalCertificate: 'MED123789',
      medicalExpiry: '2024-06-30',
      currentVehicle: 'HGV005',
      totalHours: 1200,
      totalMiles: 28000,
      safetyScore: 96,
      performanceRating: 4.3,
      notes: 'New driver showing excellent potential',
    },
  ]);

  const handleAddStaff = () => {
    const newStaff: StaffMember = {
      ...currentStaff as StaffMember,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString(),
    };
    setStaffMembers([...staffMembers, newStaff]);
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
      role: 'receptionist',
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
    });
    setShowAddDialog(false);
  };

  const handleEditStaff = (staff: StaffMember) => {
    setCurrentStaff(staff);
    setEditingId(staff.id);
    setShowAddDialog(true);
  };

  const handleUpdateStaff = () => {
    if (!editingId) return;
    const updatedStaffMembers = staffMembers.map(staff =>
      staff.id === editingId
        ? { ...currentStaff, id: editingId, lastUpdated: new Date().toISOString() } as StaffMember
        : staff
    );
    setStaffMembers(updatedStaffMembers);
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
      role: 'receptionist',
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
    });
    setEditingId(null);
    setShowAddDialog(false);
  };

  const handleDeleteStaff = (id: string) => {
    setStaffMembers(staffMembers.filter(staff => staff.id !== id));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager': return 'primary';
      case 'admin': return 'secondary';
      case 'mechanic': return 'warning';
      case 'dispatcher': return 'info';
      case 'accountant': return 'success';
      case 'hr': return 'error';
      case 'driver': return 'info';
      case 'senior_driver': return 'primary';
      case 'trainer': return 'warning';
      case 'supervisor': return 'secondary';
      default: return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'manager': return <SupervisorAccount />;
      case 'admin': return <AdminPanelSettings />;
      case 'mechanic': return <Engineering />;
      case 'dispatcher': return <Schedule />;
      case 'accountant': return <Receipt />;
      case 'hr': return <Group />;
      case 'receptionist': return <Person />;
      case 'cleaner': return <CleaningServices />;
      case 'security': return <Security />;
      case 'driver': return <DirectionsCar />;
      case 'senior_driver': return <DirectionsCar />;
      case 'trainer': return <DirectionsCar />;
      case 'supervisor': return <SupervisorAccount />;
      default: return <Person />;
    }
  };

  const activeStaff = staffMembers.filter(s => s.isActive).length;
  const totalStaff = staffMembers.length;

  return (
    <Box sx={{ py: 2 }}>
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

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Group sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">Total Staff</Typography>
              <Typography variant="h4" color="primary">
                {totalStaff}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Person sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h6">Active Staff</Typography>
              <Typography variant="h4" color="success.main">
                {activeStaff}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Work sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h6">Roles</Typography>
              <Typography variant="h4" color="info.main">
                {new Set(staffMembers.map(s => s.role)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
          <Tab label="Add New Staff" />
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
            onClick={() => setShowAddDialog(true)}
          >
            Add Staff Member
          </Button>
        </Box>

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
              {staffMembers.map((staff) => (
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
      </TabPanel>

      {/* Add New Staff Tab */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Quick Add Staff Member
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Use the "Add Staff Member" button above to add new staff members with full details.
        </Alert>
      </TabPanel>

      {/* Reports Tab */}
      <TabPanel value={tabValue} index={2}>
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
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Staff Member' : 'Add New Staff Member'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Staff ID"
                value={currentStaff.staffId || ''}
                InputProps={{
                  readOnly: true,
                }}
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
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Middle Name"
                value={currentStaff.middleName || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, middleName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Family Name *"
                value={currentStaff.familyName || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, familyName: e.target.value })}
                required
              />
            </Grid>

            {/* Address Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
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
                required
              />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
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
                required
              />
            </Grid>

            {/* Next of Kin */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
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

            {/* Employment Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Employment Details
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Role *</InputLabel>
                <Select
                  value={currentStaff.role || 'receptionist'}
                  onChange={(e) => setCurrentStaff({ ...currentStaff, role: e.target.value as StaffMember['role'] })}
                  label="Role *"
                >
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="mechanic">Mechanic</MenuItem>
                  <MenuItem value="dispatcher">Dispatcher</MenuItem>
                  <MenuItem value="accountant">Accountant</MenuItem>
                  <MenuItem value="hr">HR</MenuItem>
                  <MenuItem value="receptionist">Receptionist</MenuItem>
                  <MenuItem value="cleaner">Cleaner</MenuItem>
                  <MenuItem value="security">Security</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Tax Code *"
                value={currentStaff.taxCode || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, taxCode: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="NI Number *"
                value={currentStaff.nationalInsurance || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, nationalInsurance: e.target.value })}
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={editingId ? handleUpdateStaff : handleAddStaff}
            variant="contained"
            startIcon={editingId ? <Save /> : <Add />}
          >
            {editingId ? 'Update' : 'Add Staff Member'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffManagement;
