import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Avatar,
  Tooltip,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  Warning,
  Home,
  Error as ErrorIcon,
  Circle,
  HealthAndSafety,
  Archive,
  AttachMoney,
  AccountBalance,
  Download,
  Schedule,
  Work,
  DirectionsCar as DirectionsCarIcon,
  Person,
} from '@mui/icons-material';
import DriverDetails from './DriverDetails';
import { RootState } from '../store';

interface DriverManagementProps {
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
      id={`driver-tabpanel-${index}`}
      aria-labelledby={`driver-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  town: string;
  city: string;
  postcode: string;
  dateOfBirth: string;
  employeeNumber: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'suspended' | 'terminated';
  role: 'driver' | 'senior_driver' | 'trainer' | 'supervisor';
  licenseNumber: string;
  licenseExpiry: string;
  cpcCardNumber: string;
  cpcExpiry: string;
  medicalCertificate: string;
  medicalExpiry: string;
  currentVehicle?: string;
  totalHours: number;
  totalMiles: number;
  safetyScore: number;
  performanceRating: number;
  notes?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

interface DriverStatus {
  id: string;
  driverId: string;
  driverName: string;
  status: 'active' | 'holiday' | 'sick' | 'terminated' | 'suspended';
  startDate: string;
  endDate?: string;
  reason?: string;
  notes?: string;
  isActive: boolean;
}

interface TerminatedDriverData {
  id: string;
  driverId: string;
  driverName: string;
  terminationDate: string;
  reason: string;
  finalPayDate: string;
  dataRetentionUntil: string;
  archivedData: {
    wageSettings: any;
    bankDetails: any;
    jobHistory: any;
    timesheets: any;
    vehicleChecks: any;
    incidentReports: any;
  };
  complianceNotes: string;
  isArchived: boolean;
  retentionPeriodExpired: boolean;
  dataRetentionComplete: boolean;
  complianceIssues: string[];
}

const DriverManagement: React.FC<DriverManagementProps> = ({ onClose }) => {

  const [tabValue, setTabValue] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showDriverDetails, setShowDriverDetails] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editableDriver, setEditableDriver] = useState<Driver | null>(null);

  const user = useSelector((state: RootState) => state.auth.user);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  useEffect(() => {
    const loadDrivers = async () => {
      try {
        const { supabase } = await import('../lib/supabase');
        const { data, error } = await supabase
          .from('staff_members')
          .select('*, staff_id') // Ensure staff_id is included (it should be with *, but explicit for clarity)
          .eq('role', 'driver')
          .order('created_at', { ascending: false });
        if (error) {
          console.error('Error loading drivers:', error);
          return;
        }
        const mapped: Driver[] = (data || []).map((d: any) => {
          // Use staff_id as employee number if employee_number is not set
          // staff_id is auto-generated in format EMP-YYYY-MM-001 and should always be available
          const employeeNum = d.employee_number || d.staff_id || '';
          
          console.log('Loading driver:', {
            id: d.id,
            name: `${d.first_name} ${d.family_name}`,
            staff_id: d.staff_id,
            employee_number: d.employee_number,
            final_employeeNumber: employeeNum
          });
          
          return {
            id: d.id,
            firstName: d.first_name,
            lastName: d.family_name,
            email: d.email,
            phone: d.phone || '',
            addressLine1: d.address_line1 || '',
            addressLine2: d.address_line2 || '',
            addressLine3: d.address_line3 || '',
            town: d.town || '',
            city: '',
            postcode: d.postcode || '',
            dateOfBirth: d.date_of_birth || '',
            employeeNumber: employeeNum,
            hireDate: d.start_date || '',
            status: d.is_active ? 'active' : 'inactive',
            role: 'driver',
            licenseNumber: d.license_number || '',
            licenseExpiry: d.license_expiry || '',
            cpcCardNumber: d.cpc_card_number || '',
            cpcExpiry: d.cpc_expiry || '',
            medicalCertificate: d.medical_certificate || '',
            medicalExpiry: d.medical_expiry || '',
            currentVehicle: d.current_vehicle || '',
            totalHours: d.total_hours || 0,
            totalMiles: d.total_miles || 0,
            safetyScore: d.safety_score || 0,
            performanceRating: d.performance_rating || 0,
            notes: d.notes || '',
            emergencyContact: {
              name: d.next_of_kin_name || '',
              relationship: d.next_of_kin_relationship || '',
              phone: d.next_of_kin_phone || ''
            }
          };
        });
        setDrivers(mapped);
      } catch (e) {
        console.error('Failed to load drivers:', e);
      }
    };
    loadDrivers();
  }, []);
  

  // Mock driver status data
  const [driverStatuses] = useState<DriverStatus[]>([
    {
      id: '1',
      driverId: '1',
      driverName: 'Adam Mustafa',
      status: 'active',
      startDate: '2024-01-01',
      isActive: true,
    },
    {
      id: '2',
      driverId: '2',
      driverName: 'Jane Manager',
      status: 'holiday',
      startDate: '2024-01-15',
      endDate: '2024-01-22',
      reason: 'Annual Leave',
      notes: 'Family vacation',
      isActive: true,
    },
    {
      id: '3',
      driverId: '3',
      driverName: 'Mike Wilson',
      status: 'suspended',
      startDate: '2024-01-10',
      reason: 'Safety violations',
      notes: 'Pending investigation',
      isActive: true,
    },
  ]);

  // Mock terminated drivers data
  const [terminatedDrivers] = useState<TerminatedDriverData[]>([
    {
      id: '1',
      driverId: '4',
      driverName: 'David Smith',
      terminationDate: '2023-06-15',
      reason: 'Performance issues',
      finalPayDate: '2023-06-30',
      dataRetentionUntil: '2026-06-15',
      archivedData: {
        wageSettings: { hourlyRate: 12.50, overtimeRate: 18.75 },
        bankDetails: { accountNumber: '****1234', sortCode: '12-34-56' },
        jobHistory: [],
        timesheets: [],
        vehicleChecks: [],
        incidentReports: [],
      },
      complianceNotes: 'All data archived as per GDPR requirements',
      isArchived: true,
      retentionPeriodExpired: false,
      dataRetentionComplete: true,
      complianceIssues: [],
    },
    {
      id: '2',
      driverId: '5',
      driverName: 'Sarah Johnson',
      terminationDate: '2023-03-20',
      reason: 'Resignation',
      finalPayDate: '2023-04-05',
      dataRetentionUntil: '2026-03-20',
      archivedData: {
        wageSettings: { hourlyRate: 13.00, overtimeRate: 19.50 },
        bankDetails: { accountNumber: '****5678', sortCode: '78-90-12' },
        jobHistory: [],
        timesheets: [],
        vehicleChecks: [],
        incidentReports: [],
      },
      complianceNotes: 'Data retention period active',
      isArchived: true,
      retentionPeriodExpired: false,
      dataRetentionComplete: true,
      complianceIssues: [],
    },
  ]);

  const [newDriver, setNewDriver] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    town: '',
    city: '',
    postcode: '',
    dateOfBirth: '',
    employeeNumber: '',
    hireDate: new Date().toISOString().split('T')[0],
    status: 'active' as Driver['status'],
    role: 'driver' as Driver['role'],
    licenseNumber: '',
    licenseExpiry: '',
    cpcCardNumber: '',
    cpcExpiry: '',
    medicalCertificate: '',
    medicalExpiry: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'suspended':
        return 'warning';
      case 'terminated':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle />;
      case 'inactive':
        return <Circle />;
      case 'suspended':
        return <Warning />;
      case 'terminated':
        return <ErrorIcon />;
      default:
        return <Circle />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'driver':
        return 'primary';
      case 'senior_driver':
        return 'secondary';
      case 'trainer':
        return 'info';
      case 'supervisor':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'driver':
        return 'Driver';
      case 'senior_driver':
        return 'Senior Driver';
      case 'trainer':
        return 'Trainer';
      case 'supervisor':
        return 'Supervisor';
      default:
        return role;
    }
  };

  const getPerformanceColor = (rating: number) => {
    if (rating >= 4.5) return 'success';
    if (rating >= 4.0) return 'info';
    if (rating >= 3.0) return 'warning';
    return 'error';
  };

  const getSafetyColor = (score: number) => {
    if (score >= 95) return 'success';
    if (score >= 85) return 'info';
    if (score >= 75) return 'warning';
    return 'error';
  };

  const getDriverStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'holiday': return 'info';
      case 'sick': return 'warning';
      case 'suspended': return 'error';
      case 'terminated': return 'default';
      default: return 'default';
    }
  };

  const getDriverStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle />;
              case 'holiday': return <DirectionsCarIcon />;
      case 'sick': return <HealthAndSafety />;
      case 'suspended': return <Archive />;
      case 'terminated': return <Archive />;
      default: return <Circle />;
    }
  };

  const handleAddDriver = () => {
    // In a real app, you'd dispatch an action to add the driver
          // Adding driver
    setShowAddDialog(false);
    setNewDriver({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      town: '',
      city: '',
      postcode: '',
      dateOfBirth: '',
      employeeNumber: '',
      hireDate: new Date().toISOString().split('T')[0],
      status: 'active',
      role: 'driver',
      licenseNumber: '',
      licenseExpiry: '',
      cpcCardNumber: '',
      cpcExpiry: '',
      medicalCertificate: '',
      medicalExpiry: '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
      },
    });
  };

  const openEditDialog = (driver: Driver) => {
    setSelectedDriver(driver);
    // Edit dialog functionality removed
  };

  const openViewDialog = (driver: Driver) => {
    setSelectedDriver(driver);
    setEditableDriver(driver);
    setEditMode(false);
    setShowViewDialog(true);
  };

  const openDriverDetails = (driver: Driver) => {
    setSelectedDriver(driver);
    setEditableDriver(driver);
    setShowDriverDetails(true);
  };

  const isAdam = user?.email === 'adam.mustafa1717@gmail.com';
  const isAdmin = user?.role === 'admin' || user?.role === 'supa_admin';
  const canEdit = Boolean(isAdam || isAdmin);

  const handleSaveDriver = async () => {
    if (!editableDriver || !canEdit) return;
    try {
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase
        .from('staff_members')
        .update({
          first_name: editableDriver.firstName,
          family_name: editableDriver.lastName,
          phone: editableDriver.phone,
          address_line1: editableDriver.addressLine1,
          address_line2: editableDriver.addressLine2,
          address_line3: editableDriver.addressLine3,
          town: editableDriver.town,
          postcode: editableDriver.postcode,
          employee_number: editableDriver.employeeNumber,
          license_number: editableDriver.licenseNumber,
          license_expiry: editableDriver.licenseExpiry || null,
          cpc_card_number: editableDriver.cpcCardNumber,
          cpc_expiry: editableDriver.cpcExpiry || null,
          medical_certificate: editableDriver.medicalCertificate,
          medical_expiry: editableDriver.medicalExpiry || null,
          current_vehicle: editableDriver.currentVehicle || null,
          notes: editableDriver.notes || null
        })
        .eq('id', editableDriver.id);
      if (error) {
        console.error('Error saving driver:', error);
        return;
      }
      // reflect changes locally
      setDrivers(prev => prev.map(d => d.id === editableDriver.id ? editableDriver : d));
      setSelectedDriver(editableDriver);
      setEditMode(false);
    } catch (e) {
      console.error('Failed to save driver:', e);
    }
  };

  // Calculate statistics
  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter(d => d.status === 'active').length;
  const suspendedDrivers = drivers.filter(d => d.status === 'suspended').length;
  const expiringLicenses = drivers.filter(d => 
    new Date(d.licenseExpiry) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  ).length;
  const expiringCPC = drivers.filter(d => 
    new Date(d.cpcExpiry) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  ).length;
  const expiringMedical = drivers.filter(d => 
    new Date(d.medicalExpiry) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  ).length;

  const criticalDrivers = drivers.filter(d => 
    d.status === 'suspended' || 
    new Date(d.licenseExpiry) <= new Date() ||
    new Date(d.cpcExpiry) <= new Date() ||
    new Date(d.medicalExpiry) <= new Date()
  );

  return (
    <Box sx={{ py: 2, px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mr: 2 }}>
          Driver Management
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ color: 'yellow', fontSize: '1.5rem' }}
        >
          <Home />
        </IconButton>
      </Box>





      

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{
            '& .MuiTab-root': {
              color: 'white',
              fontWeight: 'bold',
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
          <Tab label="All Drivers" />
          <Tab label="Active Drivers" />
          <Tab label="Driver Status" />
          <Tab label="Terminated Drivers" />
        </Tabs>
      </Box>

      {/* All Drivers Tab */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Driver</TableCell>
                <TableCell>Employee #</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Current Vehicle</TableCell>
                <TableCell>Performance</TableCell>
                <TableCell>Safety Score</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>
                        {driver.firstName.charAt(0)}{driver.lastName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {driver.firstName} {driver.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Employee #{driver.employeeNumber || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{driver.employeeNumber || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleLabel(driver.role)}
                      color={getRoleColor(driver.role) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(driver.status)}
                      label={driver.status}
                      color={getStatusColor(driver.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {driver.currentVehicle ? (
                      <Chip label={driver.currentVehicle} size="small" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Unassigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${driver.performanceRating}/5`}
                      color={getPerformanceColor(driver.performanceRating) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${driver.safetyScore}%`}
                      color={getSafetyColor(driver.safetyScore) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => openViewDialog(driver)}
                        color="info"
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Driver">
                      <IconButton
                        size="small"
                        onClick={() => openEditDialog(driver)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Driver">
                      <IconButton size="small" color="error">
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Active Drivers Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {drivers
            .filter(driver => driver.status === 'active')
            .map(driver => (
              <Grid item xs={12} md={8} lg={6} key={driver.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2 }}>
                        {driver.firstName.charAt(0)}{driver.lastName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {driver.firstName} {driver.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {driver.employeeNumber}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Role
                        </Typography>
                        <Typography variant="body2">
                          {getRoleLabel(driver.role)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Vehicle
                        </Typography>
                        <Typography variant="body2">
                          {driver.currentVehicle || 'Unassigned'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Performance
                        </Typography>
                        <Chip
                          label={`${driver.performanceRating}/5`}
                          color={getPerformanceColor(driver.performanceRating) as any}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Safety Score
                        </Typography>
                        <Chip
                          label={`${driver.safetyScore}%`}
                          color={getSafetyColor(driver.safetyScore) as any}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        size="small"
                        onClick={() => openViewDialog(driver)}
                        startIcon={<Visibility />}
                      >
                        View Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      </TabPanel>



      {/* Performance Tab */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Overview
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Driver</TableCell>
                        <TableCell>Total Hours</TableCell>
                        <TableCell>Total Miles</TableCell>
                        <TableCell>Performance Rating</TableCell>
                        <TableCell>Safety Score</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {drivers.map(driver => (
                        <TableRow key={driver.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {driver.firstName} {driver.lastName}
                            </Typography>
                          </TableCell>
                          <TableCell>{driver.totalHours.toLocaleString()}</TableCell>
                          <TableCell>{driver.totalMiles.toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip
                              label={`${driver.performanceRating}/5`}
                              color={getPerformanceColor(driver.performanceRating) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${driver.safetyScore}%`}
                              color={getSafetyColor(driver.safetyScore) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(driver.status)}
                              label={driver.status}
                              color={getStatusColor(driver.status) as any}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>



      {/* Driver Status Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Driver Status Management</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {/* Add status handler */}}
          >
            Add Status
          </Button>
        </Box>

        <Grid container spacing={3}>
          {driverStatuses.map((status) => (
            <Grid item xs={12} md={6} lg={4} key={status.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{status.driverName}</Typography>
                    <Chip
                      icon={getDriverStatusIcon(status.status)}
                      label={status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                      color={getDriverStatusColor(status.status) as any}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Start Date:</strong> {new Date(status.startDate).toLocaleDateString()}
                  </Typography>
                  {status.endDate && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>End Date:</strong> {new Date(status.endDate).toLocaleDateString()}
                    </Typography>
                  )}
                  {status.reason && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Reason:</strong> {status.reason}
                    </Typography>
                  )}
                  {status.notes && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Notes:</strong> {status.notes}
                    </Typography>
                  )}
                  <Box sx={{ mt: 2 }}>
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Terminated Drivers Tab */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Terminated Driver Data Compliance</Typography>
          <Button
            variant="contained"
            startIcon={<Archive />}
            onClick={() => {/* Archive driver handler */}}
          >
            Archive Driver
          </Button>
        </Box>

        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Data Compliance Notice:</strong> All terminated driver data is retained for 3 years as per GDPR requirements. 
            This includes wage settings, bank details, job history, timesheets, and incident reports.
          </Typography>
        </Alert>

        <Grid container spacing={3}>
          {terminatedDrivers.map((driver) => (
            <Grid item xs={12} key={driver.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{driver.driverName}</Typography>
                    <Chip
                      icon={<Archive />}
                      label="Archived"
                      color="warning"
                      size="small"
                    />
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Termination Date:</strong> {new Date(driver.terminationDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Reason:</strong> {driver.reason}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Final Pay Date:</strong> {new Date(driver.finalPayDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Data Retention Until:</strong> {new Date(driver.dataRetentionUntil).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Compliance Notes:</strong> {driver.complianceNotes}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Archived Data Summary:
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6} md={3}>
                      <Chip icon={<AttachMoney />} label="Wage Settings" size="small" />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Chip icon={<AccountBalance />} label="Bank Details" size="small" />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Chip icon={<Work />} label="Job History" size="small" />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Chip icon={<Schedule />} label="Timesheets" size="small" />
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    <Button size="small" startIcon={<Download />}>
                      Export Data
                    </Button>
                    <Button size="small" startIcon={<Visibility />} sx={{ ml: 1 }}>
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Add Driver Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Driver</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                value={newDriver.firstName}
                onChange={(e) => setNewDriver({ ...newDriver, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={newDriver.lastName}
                onChange={(e) => setNewDriver({ ...newDriver, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={newDriver.phone}
                onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Address Line 1"
                value={newDriver.addressLine1}
                onChange={(e) => setNewDriver({ ...newDriver, addressLine1: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Address Line 2"
                value={newDriver.addressLine2}
                onChange={(e) => setNewDriver({ ...newDriver, addressLine2: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Address Line 3"
                value={newDriver.addressLine3}
                onChange={(e) => setNewDriver({ ...newDriver, addressLine3: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Town"
                value={newDriver.town}
                onChange={(e) => setNewDriver({ ...newDriver, town: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City"
                value={newDriver.city}
                onChange={(e) => setNewDriver({ ...newDriver, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Post Code"
                value={newDriver.postcode}
                onChange={(e) => setNewDriver({ ...newDriver, postcode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={newDriver.dateOfBirth}
                onChange={(e) => setNewDriver({ ...newDriver, dateOfBirth: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Employee Number"
                value={newDriver.employeeNumber}
                onChange={(e) => setNewDriver({ ...newDriver, employeeNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hire Date"
                type="date"
                value={newDriver.hireDate}
                onChange={(e) => setNewDriver({ ...newDriver, hireDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={newDriver.role}
                  onChange={(e) => setNewDriver({ ...newDriver, role: e.target.value as Driver['role'] })}
                  label="Role"
                >
                  <MenuItem value="driver">Driver</MenuItem>
                  <MenuItem value="senior_driver">Senior Driver</MenuItem>
                  <MenuItem value="trainer">Trainer</MenuItem>
                  <MenuItem value="supervisor">Supervisor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="License Number"
                value={newDriver.licenseNumber}
                onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="License Expiry"
                type="date"
                value={newDriver.licenseExpiry}
                onChange={(e) => setNewDriver({ ...newDriver, licenseExpiry: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CPC Card Number"
                value={newDriver.cpcCardNumber}
                onChange={(e) => setNewDriver({ ...newDriver, cpcCardNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CPC Expiry"
                type="date"
                value={newDriver.cpcExpiry}
                onChange={(e) => setNewDriver({ ...newDriver, cpcExpiry: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Medical Certificate"
                value={newDriver.medicalCertificate}
                onChange={(e) => setNewDriver({ ...newDriver, medicalCertificate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Medical Expiry"
                type="date"
                value={newDriver.medicalExpiry}
                onChange={(e) => setNewDriver({ ...newDriver, medicalExpiry: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Emergency Contact
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Contact Name"
                value={newDriver.emergencyContact.name}
                onChange={(e) => setNewDriver({
                  ...newDriver,
                  emergencyContact: { ...newDriver.emergencyContact, name: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Relationship"
                value={newDriver.emergencyContact.relationship}
                onChange={(e) => setNewDriver({
                  ...newDriver,
                  emergencyContact: { ...newDriver.emergencyContact, relationship: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={newDriver.emergencyContact.phone}
                onChange={(e) => setNewDriver({
                  ...newDriver,
                  emergencyContact: { ...newDriver.emergencyContact, phone: e.target.value }
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddDriver} variant="contained">
            Add Driver
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Driver Dialog */}
      {selectedDriver && (
        <Dialog open={showViewDialog} onClose={() => setShowViewDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Driver Details: {editMode ? (
              <>
                <TextField size="small" label="First Name" value={editableDriver?.firstName || ''} onChange={(e) => setEditableDriver(prev => prev ? { ...prev, firstName: e.target.value } : prev)} sx={{ mr: 1 }} />
                <TextField size="small" label="Last Name" value={editableDriver?.lastName || ''} onChange={(e) => setEditableDriver(prev => prev ? { ...prev, lastName: e.target.value } : prev)} />
              </>
            ) : (
              <>{selectedDriver.firstName} {selectedDriver.lastName}</>
            )}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Name:</strong> {selectedDriver.firstName} {selectedDriver.lastName}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Employee #:</strong> {selectedDriver.employeeNumber || 'N/A'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Phone:</strong> {editMode ? (
                    <TextField size="small" value={editableDriver?.phone || ''} onChange={(e) => setEditableDriver(prev => prev ? { ...prev, phone: e.target.value } : prev)} />
                  ) : selectedDriver.phone}
                </Typography>
                                  <Typography variant="body2" gutterBottom>
                    <strong>Address:</strong> {editMode ? (
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1 }}>
                        <TextField size="small" label="Line 1" value={editableDriver?.addressLine1 || ''} onChange={(e) => setEditableDriver(prev => prev ? { ...prev, addressLine1: e.target.value } : prev)} />
                        <TextField size="small" label="Line 2" value={editableDriver?.addressLine2 || ''} onChange={(e) => setEditableDriver(prev => prev ? { ...prev, addressLine2: e.target.value } : prev)} />
                        <TextField size="small" label="Line 3" value={editableDriver?.addressLine3 || ''} onChange={(e) => setEditableDriver(prev => prev ? { ...prev, addressLine3: e.target.value } : prev)} />
                        <TextField size="small" label="Town" value={editableDriver?.town || ''} onChange={(e) => setEditableDriver(prev => prev ? { ...prev, town: e.target.value } : prev)} />
                        <TextField size="small" label="Postcode" value={editableDriver?.postcode || ''} onChange={(e) => setEditableDriver(prev => prev ? { ...prev, postcode: e.target.value } : prev)} />
                      </Box>
                    ) : ([
                      selectedDriver.addressLine1,
                      selectedDriver.addressLine2,
                      selectedDriver.addressLine3,
                      selectedDriver.town,
                      selectedDriver.city,
                      selectedDriver.postcode
                    ].filter(Boolean).join(', '))}
                  </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Date of Birth:</strong> {new Date(selectedDriver.dateOfBirth).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Employment Details
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Employee #:</strong> {selectedDriver.employeeNumber}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Hire Date:</strong> {new Date(selectedDriver.hireDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Status:</strong> 
                  <Chip
                    icon={getStatusIcon(selectedDriver.status)}
                    label={selectedDriver.status}
                    color={getStatusColor(selectedDriver.status) as any}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Role:</strong> 
                  <Chip
                    label={getRoleLabel(selectedDriver.role)}
                    color={getRoleColor(selectedDriver.role) as any}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Current Vehicle:</strong> {selectedDriver.currentVehicle || 'Unassigned'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Qualifications
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" gutterBottom>
                      <strong>License:</strong> {selectedDriver.licenseNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Expires: {new Date(selectedDriver.licenseExpiry).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" gutterBottom>
                      <strong>CPC Card:</strong> {selectedDriver.cpcCardNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Expires: {new Date(selectedDriver.cpcExpiry).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Medical:</strong> {selectedDriver.medicalCertificate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Expires: {new Date(selectedDriver.medicalExpiry).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Performance & Safety
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Total Hours:</strong> {selectedDriver.totalHours.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Total Miles:</strong> {selectedDriver.totalMiles.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Performance:</strong> 
                      <Chip
                        label={`${selectedDriver.performanceRating}/5`}
                        color={getPerformanceColor(selectedDriver.performanceRating) as any}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Safety Score:</strong> 
                      <Chip
                        label={`${selectedDriver.safetyScore}%`}
                        color={getSafetyColor(selectedDriver.safetyScore) as any}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Notes
                </Typography>
                <Typography variant="body2">
                  {editMode ? (
                    <TextField size="small" fullWidth multiline minRows={2} value={editableDriver?.notes || ''} onChange={(e) => setEditableDriver(prev => prev ? { ...prev, notes: e.target.value } : prev)} />
                  ) : (selectedDriver.notes || '')}
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            {canEdit && !editMode && (
              <Button onClick={() => setEditMode(true)} variant="contained">
                Edit
              </Button>
            )}
            {canEdit && editMode && (
              <Button onClick={handleSaveDriver} variant="contained" color="success">
                Save
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default DriverManagement; 