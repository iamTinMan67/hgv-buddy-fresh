import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Tooltip,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Person,
  Add,
  Edit,
  Delete,
  Visibility,
  ArrowBack,
  Assignment,
  Schedule,
  Warning,
  CheckCircle,
  Error,
  LocalShipping,
  Security,
  Description,
  Phone,
  Email,
  LocationOn,
  CalendarToday,
  Speed,
  TrendingUp,
  TrendingDown,
  Circle,
  Report,
  Build,
  School,
  Work,
  HealthAndSafety,
} from '@mui/icons-material';
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
  address: string;
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

const DriverManagement: React.FC<DriverManagementProps> = ({ onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  // Mock driver data
  const [drivers] = useState<Driver[]>([
    {
      id: '1',
      firstName: 'John',
      lastName: 'Driver',
      email: 'john.driver@company.com',
      phone: '+44 7700 900123',
      address: '123 Main Street, London, SW1A 1AA',
      dateOfBirth: '1985-03-15',
      employeeNumber: 'EMP001',
      hireDate: '2020-01-15',
      status: 'active',
      role: 'driver',
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
      emergencyContact: {
        name: 'Jane Driver',
        relationship: 'Spouse',
        phone: '+44 7700 900124',
      },
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Manager',
      email: 'jane.manager@company.com',
      phone: '+44 7700 900125',
      address: '456 High Street, Manchester, M1 1AA',
      dateOfBirth: '1988-07-22',
      employeeNumber: 'EMP002',
      hireDate: '2019-06-01',
      status: 'active',
      role: 'senior_driver',
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
      emergencyContact: {
        name: 'John Manager',
        relationship: 'Spouse',
        phone: '+44 7700 900126',
      },
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Wilson',
      email: 'mike.wilson@company.com',
      phone: '+44 7700 900127',
      address: '789 Park Lane, Birmingham, B1 1AA',
      dateOfBirth: '1990-11-08',
      employeeNumber: 'EMP003',
      hireDate: '2021-03-10',
      status: 'suspended',
      role: 'driver',
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
      emergencyContact: {
        name: 'Sarah Wilson',
        relationship: 'Sister',
        phone: '+44 7700 900128',
      },
    },
  ]);

  const [newDriver, setNewDriver] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
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
        return <Error />;
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

  const handleAddDriver = () => {
    // In a real app, you'd dispatch an action to add the driver
    console.log('Adding driver:', newDriver);
    setShowAddDialog(false);
    setNewDriver({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
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
    setShowEditDialog(true);
  };

  const openViewDialog = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowViewDialog(true);
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
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Driver Management
        </Typography>
        <Box>
          <Button
            startIcon={<Add />}
            variant="contained"
            onClick={() => setShowAddDialog(true)}
            sx={{ mr: 2 }}
          >
            Add Driver
          </Button>
          <Button
            startIcon={<ArrowBack />}
            onClick={onClose}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Box>

      {/* Driver Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {totalDrivers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Drivers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {activeDrivers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Drivers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {suspendedDrivers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Suspended
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {expiringLicenses}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expiring Licenses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {expiringCPC}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expiring CPC
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {expiringMedical}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expiring Medical
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Critical Alerts */}
      {criticalDrivers.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Critical Alert:</strong> {criticalDrivers.length} drivers have critical issues requiring immediate attention!
          </Typography>
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Drivers" />
          <Tab label="Active Drivers" />
          <Tab label="Qualifications" />
          <Tab label="Performance" />
          <Tab label="Safety Records" />
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
                          {driver.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{driver.employeeNumber}</TableCell>
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
              <Grid item xs={12} md={6} lg={4} key={driver.id}>
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

      {/* Qualifications Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  License Expiry Alerts
                </Typography>
                <List>
                  {drivers
                    .filter(driver => new Date(driver.licenseExpiry) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
                    .map(driver => (
                      <ListItem key={driver.id}>
                        <ListItemIcon>
                          <Warning color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${driver.firstName} ${driver.lastName}`}
                          secondary={`License expires: ${new Date(driver.licenseExpiry).toLocaleDateString()}`}
                        />
                      </ListItem>
                    ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  CPC Expiry Alerts
                </Typography>
                <List>
                  {drivers
                    .filter(driver => new Date(driver.cpcExpiry) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
                    .map(driver => (
                      <ListItem key={driver.id}>
                        <ListItemIcon>
                          <Warning color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${driver.firstName} ${driver.lastName}`}
                          secondary={`CPC expires: ${new Date(driver.cpcExpiry).toLocaleDateString()}`}
                        />
                      </ListItem>
                    ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
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

      {/* Safety Records Tab */}
      <TabPanel value={tabValue} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Safety Performance
                </Typography>
                <List>
                  {drivers
                    .sort((a, b) => b.safetyScore - a.safetyScore)
                    .map(driver => (
                      <ListItem key={driver.id}>
                        <ListItemIcon>
                          {driver.safetyScore >= 95 ? (
                            <CheckCircle color="success" />
                          ) : driver.safetyScore >= 85 ? (
                            <Circle color="info" />
                          ) : driver.safetyScore >= 75 ? (
                            <Warning color="warning" />
                          ) : (
                            <Error color="error" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={`${driver.firstName} ${driver.lastName}`}
                          secondary={`Safety Score: ${driver.safetyScore}%`}
                        />
                      </ListItem>
                    ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Safety Statistics
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Average Safety Score: {Math.round(drivers.reduce((sum, d) => sum + d.safetyScore, 0) / drivers.length)}%
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Drivers with 95%+ Safety: {drivers.filter(d => d.safetyScore >= 95).length}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Drivers Needing Improvement: {drivers.filter(d => d.safetyScore < 85).length}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Suspended Drivers: {drivers.filter(d => d.status === 'suspended').length}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
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
                label="Email"
                type="email"
                value={newDriver.email}
                onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={newDriver.address}
                onChange={(e) => setNewDriver({ ...newDriver, address: e.target.value })}
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
            Driver Details: {selectedDriver.firstName} {selectedDriver.lastName}
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
                  <strong>Email:</strong> {selectedDriver.email}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Phone:</strong> {selectedDriver.phone}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Address:</strong> {selectedDriver.address}
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
              {selectedDriver.notes && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Notes
                  </Typography>
                  <Typography variant="body2">
                    {selectedDriver.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            <Button onClick={() => openEditDialog(selectedDriver)} variant="contained">
              Edit Driver
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default DriverManagement; 