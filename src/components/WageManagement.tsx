import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
  AttachMoney,
  TrendingUp,
  Person,
  AccessTime,
  AccountBalance,
  AccountBalanceWallet,
  CreditCard,
  CalendarToday,
  Work,
  BeachAccess,
  Block,
  Archive,
  Security,
  Receipt,
  Payment,
  Schedule,
  EventNote,
  Business,
  LocationOn,
  Phone,
  Email,
  Lock,
  Download,
  Print,
  Share,
  Notifications,
  Settings,
  Help,
  Star,
  StarBorder,
  StarHalf,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  MonetizationOn,
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
  Warning,
  CheckCircle,
  Error,
  Info,
  Visibility,
  ArrowBack,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../store';
import { addWageSetting, updateWageSetting, deleteWageSetting } from '../store/slices/wageSlice';

interface WageManagementProps {
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
      id={`wage-tabpanel-${index}`}
      aria-labelledby={`wage-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Extended interfaces for new features
interface BankDetails {
  id: string;
  driverId: string;
  accountName: string;
  accountNumber: string;
  sortCode: string;
  bankName: string;
  isActive: boolean;
  lastUpdated: string;
}

interface DriverStatus {
  id: string;
  driverId: string;
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
}

const WageManagement: React.FC<WageManagementProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { wageSettings, wageCalculations } = useSelector((state: RootState) => state.wage);
  
  const [tabValue, setTabValue] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showTerminatedDialog, setShowTerminatedDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentSetting, setCurrentSetting] = useState({
    driverName: '',
    standardHours: 40,
    hourlyRate: 15.50,
    overtimeRate: 23.25,
    standardStartTime: '08:00',
    standardEndTime: '16:00',
    isActive: true,
  });

  // Mock data for new features
  const [bankDetails, setBankDetails] = useState<BankDetails[]>([
    {
      id: '1',
      driverId: '1',
      accountName: 'John Driver',
      accountNumber: '12345678',
      sortCode: '12-34-56',
      bankName: 'Barclays Bank',
      isActive: true,
      lastUpdated: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      driverId: '2',
      accountName: 'Jane Manager',
      accountNumber: '87654321',
      sortCode: '65-43-21',
      bankName: 'HSBC Bank',
      isActive: true,
      lastUpdated: '2024-01-10T14:30:00Z',
    },
  ]);

  const [driverStatuses, setDriverStatuses] = useState<DriverStatus[]>([
    {
      id: '1',
      driverId: '1',
      status: 'active',
      startDate: '2024-01-01',
      isActive: true,
    },
    {
      id: '2',
      driverId: '2',
      status: 'holiday',
      startDate: '2024-01-20',
      endDate: '2024-01-25',
      reason: 'Annual Leave',
      notes: 'Family vacation',
      isActive: true,
    },
  ]);

  const [terminatedDrivers, setTerminatedDrivers] = useState<TerminatedDriverData[]>([
    {
      id: '1',
      driverId: '3',
      driverName: 'Mike Smith',
      terminationDate: '2023-12-15',
      reason: 'Resigned - Personal reasons',
      finalPayDate: '2023-12-31',
      dataRetentionUntil: '2026-12-15',
      archivedData: {
        wageSettings: { hourlyRate: 16.00, overtimeRate: 24.00 },
        bankDetails: { accountNumber: '11111111', sortCode: '11-11-11' },
        jobHistory: [],
        timesheets: [],
        vehicleChecks: [],
        incidentReports: [],
      },
      complianceNotes: 'All data archived for 3-year retention period as per GDPR requirements',
      isArchived: true,
    },
  ]);

  const [currentBankDetails, setCurrentBankDetails] = useState({
    accountName: '',
    accountNumber: '',
    sortCode: '',
    bankName: '',
    isActive: true,
  });

  const [currentDriverStatus, setCurrentDriverStatus] = useState({
    status: 'active' as DriverStatus['status'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    reason: '',
    notes: '',
    isActive: true,
  });

  const handleAddSetting = () => {
    const newSetting = {
      id: Date.now().toString(),
      driverId: Date.now().toString(),
      ...currentSetting,
    };
    dispatch(addWageSetting(newSetting));
    setCurrentSetting({
      driverName: '',
      standardHours: 40,
      hourlyRate: 15.50,
      overtimeRate: 23.25,
      standardStartTime: '08:00',
      standardEndTime: '16:00',
      isActive: true,
    });
    setShowAddDialog(false);
  };

  const handleEditSetting = (setting: any) => {
    setCurrentSetting({
      driverName: setting.driverName,
      standardHours: setting.standardHours,
      hourlyRate: setting.hourlyRate,
      overtimeRate: setting.overtimeRate,
      standardStartTime: setting.standardStartTime,
      standardEndTime: setting.standardEndTime,
      isActive: setting.isActive,
    });
    setEditingId(setting.id);
    setShowAddDialog(true);
  };

  const handleUpdateSetting = () => {
    if (!editingId) return;
    
    const updatedSetting = {
      id: editingId,
      driverId: editingId,
      ...currentSetting,
    };
    dispatch(updateWageSetting(updatedSetting));
    setEditingId(null);
    setCurrentSetting({
      driverName: '',
      standardHours: 40,
      hourlyRate: 15.50,
      overtimeRate: 23.25,
      standardStartTime: '08:00',
      standardEndTime: '16:00',
      isActive: true,
    });
    setShowAddDialog(false);
  };

  const handleDeleteSetting = (id: string) => {
    dispatch(deleteWageSetting(id));
  };

  const handleAddBankDetails = () => {
    const newBankDetails = {
      id: Date.now().toString(),
      driverId: Date.now().toString(),
      ...currentBankDetails,
      lastUpdated: new Date().toISOString(),
    };
    setBankDetails([...bankDetails, newBankDetails]);
    setCurrentBankDetails({
      accountName: '',
      accountNumber: '',
      sortCode: '',
      bankName: '',
      isActive: true,
    });
    setShowBankDialog(false);
  };

  const handleAddDriverStatus = () => {
    const newStatus = {
      id: Date.now().toString(),
      driverId: Date.now().toString(),
      ...currentDriverStatus,
    };
    setDriverStatuses([...driverStatuses, newStatus]);
    setCurrentDriverStatus({
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      reason: '',
      notes: '',
      isActive: true,
    });
    setShowStatusDialog(false);
  };

  const calculateOvertimeRate = (hourlyRate: number) => {
    return hourlyRate * 1.5;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'holiday': return 'info';
      case 'sick': return 'warning';
      case 'terminated': return 'error';
      case 'suspended': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Work />;
      case 'holiday': return <BeachAccess />;
      case 'sick': return <Warning />;
      case 'terminated': return <Block />;
      case 'suspended': return <Block />;
      default: return <Person />;
    }
  };

  const activeDrivers = wageSettings.filter(s => s.isActive).length;
  const driversOnHoliday = driverStatuses.filter(s => s.status === 'holiday' && s.isActive).length;
  const terminatedDriversCount = terminatedDrivers.length;

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <AttachMoney sx={{ mr: 1, verticalAlign: 'middle' }} />
          Wage Management
        </Typography>
        <Button
          startIcon={<ArrowBack />}
          onClick={onClose}
        >
          Back to Dashboard
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Person sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">Active Drivers</Typography>
              <Typography variant="h4" color="primary">
                {activeDrivers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h6">Avg Hourly Rate</Typography>
              <Typography variant="h4" color="success.main">
                £{(wageSettings.reduce((sum, s) => sum + s.hourlyRate, 0) / Math.max(wageSettings.length, 1)).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccountBalance sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h6">Bank Details</Typography>
              <Typography variant="h4" color="info.main">
                {bankDetails.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            '& .MuiTab-root': {
              color: '#FFD700', // Yellow color for inactive tabs
              fontWeight: 'bold',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            },
          }}
        >
          <Tab label="Wage Settings" />
          <Tab label="Bank Details" />
        </Tabs>
      </Box>

      {/* Wage Settings Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Driver Wage Settings</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowAddDialog(true)}
          >
            Add Driver Wage Setting
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Driver Name</TableCell>
                <TableCell>Standard Hours/Week</TableCell>
                <TableCell>Standard Time</TableCell>
                <TableCell>Hourly Rate (£)</TableCell>
                <TableCell>Overtime Rate (£)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {wageSettings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No wage settings configured. Click "Add Driver Wage Setting" to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                wageSettings.map((setting) => (
                  <TableRow key={setting.id}>
                    <TableCell>{setting.driverName}</TableCell>
                    <TableCell>{setting.standardHours}h</TableCell>
                    <TableCell>{setting.standardStartTime} - {setting.standardEndTime}</TableCell>
                    <TableCell>£{setting.hourlyRate.toFixed(2)}</TableCell>
                    <TableCell>£{setting.overtimeRate.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={setting.isActive ? 'Active' : 'Inactive'}
                        color={setting.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditSetting(setting)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteSetting(setting.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Bank Details Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Driver Bank Details</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowBankDialog(true)}
          >
            Add Bank Details
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Driver Name</TableCell>
                <TableCell>Bank Name</TableCell>
                <TableCell>Account Name</TableCell>
                <TableCell>Account Number</TableCell>
                <TableCell>Sort Code</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bankDetails.map((bank) => (
                <TableRow key={bank.id}>
                  <TableCell>{bank.accountName}</TableCell>
                  <TableCell>{bank.bankName}</TableCell>
                  <TableCell>{bank.accountName}</TableCell>
                  <TableCell>****{bank.accountNumber.slice(-4)}</TableCell>
                  <TableCell>{bank.sortCode}</TableCell>
                  <TableCell>
                    <Chip
                      label={bank.isActive ? 'Active' : 'Inactive'}
                      color={bank.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(bank.lastUpdated).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>



      {/* Add/Edit Wage Setting Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Driver Wage Setting' : 'Add Driver Wage Setting'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Driver Name"
                value={currentSetting.driverName}
                onChange={(e) => setCurrentSetting({ ...currentSetting, driverName: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Standard Hours per Week"
                type="number"
                value={currentSetting.standardHours}
                onChange={(e) => setCurrentSetting({ ...currentSetting, standardHours: Number(e.target.value) })}
                inputProps={{ min: 1, max: 168 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Hourly Rate (£)"
                type="number"
                value={currentSetting.hourlyRate}
                onChange={(e) => {
                  const rate = Number(e.target.value);
                  setCurrentSetting({ 
                    ...currentSetting, 
                    hourlyRate: rate,
                    overtimeRate: calculateOvertimeRate(rate)
                  });
                }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Standard Start Time"
                type="time"
                value={currentSetting.standardStartTime}
                onChange={(e) => setCurrentSetting({ ...currentSetting, standardStartTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Standard End Time"
                type="time"
                value={currentSetting.standardEndTime}
                onChange={(e) => setCurrentSetting({ ...currentSetting, standardEndTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Overtime Rate (£)"
                type="number"
                value={currentSetting.overtimeRate}
                onChange={(e) => setCurrentSetting({ ...currentSetting, overtimeRate: Number(e.target.value) })}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentSetting.isActive}
                    onChange={(e) => setCurrentSetting({ ...currentSetting, isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Overtime Rules:</strong>
                  <br />
                  • Any time worked before {currentSetting.standardStartTime} or after {currentSetting.standardEndTime} is overtime
                  <br />
                  • All weekend hours are overtime
                  <br />
                  • Overtime rate is automatically calculated as 1.5x the hourly rate
                  <br />
                  • Minutes are calculated precisely for accurate overtime pay
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={editingId ? handleUpdateSetting : handleAddSetting}
            variant="contained"
            startIcon={editingId ? <Save /> : <Add />}
          >
            {editingId ? 'Update' : 'Add Setting'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Bank Details Dialog */}
      <Dialog open={showBankDialog} onClose={() => setShowBankDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Bank Details</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Account Holder Name"
                value={currentBankDetails.accountName}
                onChange={(e) => setCurrentBankDetails({ ...currentBankDetails, accountName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bank Name"
                value={currentBankDetails.bankName}
                onChange={(e) => setCurrentBankDetails({ ...currentBankDetails, bankName: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Account Number"
                value={currentBankDetails.accountNumber}
                onChange={(e) => setCurrentBankDetails({ ...currentBankDetails, accountNumber: e.target.value })}
                inputProps={{ maxLength: 8 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Sort Code"
                value={currentBankDetails.sortCode}
                onChange={(e) => setCurrentBankDetails({ ...currentBankDetails, sortCode: e.target.value })}
                placeholder="12-34-56"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentBankDetails.isActive}
                    onChange={(e) => setCurrentBankDetails({ ...currentBankDetails, isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Security Notice:</strong> Bank details are encrypted and stored securely. 
                  Only authorized personnel can access this information for payroll purposes.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBankDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddBankDetails}
            variant="contained"
            startIcon={<Add />}
          >
            Add Bank Details
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Driver Status Dialog */}
      <Dialog open={showStatusDialog} onClose={() => setShowStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Driver Status</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={currentDriverStatus.status}
                  onChange={(e) => setCurrentDriverStatus({ ...currentDriverStatus, status: e.target.value as DriverStatus['status'] })}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="holiday">Holiday</MenuItem>
                  <MenuItem value="sick">Sick Leave</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="terminated">Terminated</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={currentDriverStatus.startDate}
                onChange={(e) => setCurrentDriverStatus({ ...currentDriverStatus, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Date (Optional)"
                type="date"
                value={currentDriverStatus.endDate}
                onChange={(e) => setCurrentDriverStatus({ ...currentDriverStatus, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason"
                value={currentDriverStatus.reason}
                onChange={(e) => setCurrentDriverStatus({ ...currentDriverStatus, reason: e.target.value })}
                placeholder="e.g., Annual Leave, Sick Leave, etc."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={currentDriverStatus.notes}
                onChange={(e) => setCurrentDriverStatus({ ...currentDriverStatus, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStatusDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddDriverStatus}
            variant="contained"
            startIcon={<Add />}
          >
            Add Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WageManagement; 