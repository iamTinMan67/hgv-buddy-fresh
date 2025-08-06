import React, { useState } from 'react';
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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  Person,
  Business,
  Work,
  Settings,
  Assignment,
  Phone,
  Email,
  LocationOn,
  AccountCircle,
  VpnKey,
  VerifiedUser,
  Gavel,
  Policy,
  DataUsage,
  Storage,
  Backup,
  RestoreFromTrash,
  DeleteForever,
  Restore,
  ArchiveOutlined,
  Unarchive,
  VisibilityOff,
  ExpandMore,
  Home,
  Warning,
  CheckCircle,
  Error,
  Info,
  Visibility,
  ArrowBack,
  FamilyRestroom,
  ContactPhone,
  ContactMail,
  HomeWork,
  Badge as BadgeIcon,
  Security,
  Receipt,
  Payment,
  Schedule,
  EventNote,
  LocationCity,
  LocalPhone,
  PhoneAndroid,
  AlternateEmail,
  PersonAdd,
  Group,
  SupervisorAccount,
  Engineering,
  DirectionsCar,
  LocalShipping,
  AdminPanelSettings,
  CleaningServices,
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
  role: 'manager' | 'admin' | 'mechanic' | 'dispatcher' | 'accountant' | 'hr' | 'receptionist' | 'cleaner' | 'security';
  isActive: boolean;
  startDate: string;
  lastUpdated: string;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [currentStaff, setCurrentStaff] = useState<Partial<StaffMember>>({
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

  // Mock data for staff members
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: '1',
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
  ]);

  const handleAddStaff = () => {
    const newStaff: StaffMember = {
      id: Date.now().toString(),
      ...currentStaff as StaffMember,
      lastUpdated: new Date().toISOString(),
    };
    setStaffMembers([...staffMembers, newStaff]);
    setCurrentStaff({
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
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            '& .MuiTab-root': {
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            },
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
            <Grid item xs={12} md={4}>
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
