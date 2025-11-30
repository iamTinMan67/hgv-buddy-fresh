import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Stack,
  InputAdornment,
} from '@mui/material';
import { RootState } from '../store';
import {
  Add,
  Edit,
  Delete,
  Business,
  People,
  Schedule,
  Phone,
  Email,
  Home,
  AccountBalance,
  Close,
  Save,
  Search,
  Clear,
  AttachMoney,
  Work,
  School,
  CreditCard,
} from '@mui/icons-material';
import {
  agencyContractService,
  AgencyContract,
  AgencyStaff,
  AgencyTimesheet,
  AgencyTimesheetEntry,
} from '../services/agencyContractService';
import { startOfWeek, format, addDays, parseISO } from 'date-fns';

interface AgencyContractManagementProps {
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
      id={`agency-tabpanel-${index}`}
      aria-labelledby={`agency-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AgencyContractManagement: React.FC<AgencyContractManagementProps> = ({ onClose }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === 'admin' || user?.role === 'supa_admin';
  
  const [tabValue, setTabValue] = useState(0);
  const [contracts, setContracts] = useState<AgencyContract[]>([]);
  const [staff, setStaff] = useState<AgencyStaff[]>([]);
  const [timesheets, setTimesheets] = useState<AgencyTimesheet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Contract dialog state
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [editingContractId, setEditingContractId] = useState<string | null>(null);
  const [currentContract, setCurrentContract] = useState<Partial<AgencyContract>>({
    agencyName: '',
    agencyContactName: '',
    agencyContactEmail: '',
    agencyContactPhone: '',
    agencyContactMobile: '',
    agencyAddress: {
      line1: '',
      line2: '',
      line3: '',
      town: '',
      city: '',
      postcode: '',
      country: 'United Kingdom',
    },
    bankDetails: {
      accountName: '',
      accountNumber: '',
      sortCode: '',
      bankName: '',
      buildingSocietyNumber: '',
    },
    contractStartDate: new Date().toISOString().split('T')[0],
    contractStatus: 'active',
    standardHourlyRate: 0,
    overtimeHourlyRate: 0,
    standardStartTime: '08:00',
    standardEndTime: '17:00',
    standardHoursPerWeek: 40,
  });
  
  // Staff dialog state
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<string>('');
  const [currentStaff, setCurrentStaff] = useState<Partial<AgencyStaff>>({
    staffReferenceNumber: '',
    firstName: '',
    middleName: '',
    familyName: '',
    email: '',
    phone: '',
    mobile: '',
    address: {
      line1: '',
      line2: '',
      line3: '',
      town: '',
      city: '',
      postcode: '',
      country: 'United Kingdom',
    },
    status: 'active',
    startDate: new Date().toISOString().split('T')[0],
    qualifications: [],
    licenses: [],
  });
  
  // Timesheet dialog state
  const [showTimesheetDialog, setShowTimesheetDialog] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedWeekStart, setSelectedWeekStart] = useState<string>(
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  );
  const [currentTimesheet, setCurrentTimesheet] = useState<AgencyTimesheet | null>(null);
  const [timesheetEntries, setTimesheetEntries] = useState<AgencyTimesheetEntry[]>([]);
  
  // Filters
  const [contractFilter, setContractFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Load data
  useEffect(() => {
    loadContracts();
  }, []);

  useEffect(() => {
    if (tabValue === 1 && selectedContractId) {
      loadStaff(selectedContractId);
    }
  }, [tabValue, selectedContractId]);

  const loadContracts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await agencyContractService.getAllContracts();
      setContracts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async (contractId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await agencyContractService.getStaffByContract(contractId);
      setStaff(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleContractSave = async () => {
    if (!currentContract.agencyName || !currentContract.agencyContactName || !currentContract.agencyContactEmail) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (editingContractId) {
        await agencyContractService.updateContract(editingContractId, currentContract as AgencyContract, user?.id);
      } else {
        await agencyContractService.createContract(currentContract as Omit<AgencyContract, 'id' | 'contractNumber' | 'createdAt' | 'updatedAt'>, user?.id);
      }
      await loadContracts();
      setShowContractDialog(false);
      resetContractForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save contract');
    } finally {
      setLoading(false);
    }
  };

  const handleContractEdit = (contract: AgencyContract) => {
    setCurrentContract(contract);
    setEditingContractId(contract.id);
    setShowContractDialog(true);
  };

  const handleContractDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contract? This will also delete all associated staff and timesheets.')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await agencyContractService.deleteContract(id);
      await loadContracts();
    } catch (err: any) {
      setError(err.message || 'Failed to delete contract');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSave = async () => {
    if (!currentStaff.firstName || !currentStaff.familyName || !currentStaff.staffReferenceNumber) {
      setError('Please fill in all required fields');
      return;
    }

    if (!selectedContractId) {
      setError('Please select a contract');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const staffData = {
        ...currentStaff,
        agencyContractId: selectedContractId,
      } as Omit<AgencyStaff, 'id' | 'createdAt' | 'updatedAt'>;

      if (editingStaffId) {
        await agencyContractService.updateStaff(editingStaffId, staffData, user?.id);
      } else {
        await agencyContractService.createStaff(staffData, user?.id);
      }
      await loadStaff(selectedContractId);
      setShowStaffDialog(false);
      resetStaffForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save staff member');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffEdit = (staffMember: AgencyStaff) => {
    setCurrentStaff(staffMember);
    setEditingStaffId(staffMember.id);
    setSelectedContractId(staffMember.agencyContractId);
    setShowStaffDialog(true);
  };

  const handleStaffDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await agencyContractService.deleteStaff(id);
      if (selectedContractId) {
        await loadStaff(selectedContractId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete staff member');
    } finally {
      setLoading(false);
    }
  };

  const resetContractForm = () => {
    setCurrentContract({
      agencyName: '',
      agencyContactName: '',
      agencyContactEmail: '',
      agencyContactPhone: '',
      agencyContactMobile: '',
      agencyAddress: {
        line1: '',
        line2: '',
        line3: '',
        town: '',
        city: '',
        postcode: '',
        country: 'United Kingdom',
      },
      bankDetails: {
        accountName: '',
        accountNumber: '',
        sortCode: '',
        bankName: '',
        buildingSocietyNumber: '',
      },
      contractStartDate: new Date().toISOString().split('T')[0],
      contractStatus: 'active',
      standardHourlyRate: 0,
      overtimeHourlyRate: 0,
      standardStartTime: '08:00',
      standardEndTime: '17:00',
      standardHoursPerWeek: 40,
    });
    setEditingContractId(null);
  };

  const resetStaffForm = () => {
    setCurrentStaff({
      staffReferenceNumber: '',
      firstName: '',
      middleName: '',
      familyName: '',
      email: '',
      phone: '',
      mobile: '',
      address: {
        line1: '',
        line2: '',
        line3: '',
        town: '',
        city: '',
        postcode: '',
        country: 'United Kingdom',
      },
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      qualifications: [],
      licenses: [],
    });
    setEditingStaffId(null);
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesStatus = contractFilter === 'all' || contract.contractStatus === contractFilter;
    const matchesSearch = searchTerm === '' || 
      contract.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'expired': return 'warning';
      case 'terminated': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Agency Contract Management
        </Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
        <Tab icon={<Business />} label="Contracts" />
        <Tab icon={<People />} label="Staff" />
        <Tab icon={<Schedule />} label="Timesheets" />
      </Tabs>

      {/* Contracts Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              resetContractForm();
              setShowContractDialog(true);
            }}
            disabled={!isAdmin}
          >
            Add Contract
          </Button>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={contractFilter}
              label="Status"
              onChange={(e) => setContractFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
              <MenuItem value="terminated">Terminated</MenuItem>
            </Select>
          </FormControl>
          <TextField
            placeholder="Search contracts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Contract Number</TableCell>
                <TableCell>Agency Name</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>Standard Rate</TableCell>
                <TableCell>Overtime Rate</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>{contract.contractNumber}</TableCell>
                  <TableCell>{contract.agencyName}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{contract.agencyContactName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {contract.agencyContactEmail}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{format(parseISO(contract.contractStartDate), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>£{contract.standardHourlyRate.toFixed(2)}</TableCell>
                  <TableCell>£{contract.overtimeHourlyRate.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={contract.contractStatus}
                      color={getStatusColor(contract.contractStatus) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleContractEdit(contract)}
                      disabled={!isAdmin}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleContractDelete(contract.id)}
                      disabled={!isAdmin}
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

      {/* Staff Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel>Select Contract</InputLabel>
            <Select
              value={selectedContractId}
              label="Select Contract"
              onChange={(e) => {
                setSelectedContractId(e.target.value);
                loadStaff(e.target.value);
              }}
            >
              {contracts.map((contract) => (
                <MenuItem key={contract.id} value={contract.id}>
                  {contract.contractNumber} - {contract.agencyName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              if (!selectedContractId) {
                setError('Please select a contract first');
                return;
              }
              resetStaffForm();
              setCurrentStaff({ ...currentStaff, agencyContractId: selectedContractId });
              setShowStaffDialog(true);
            }}
            disabled={!isAdmin || !selectedContractId}
          >
            Add Staff
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Reference</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Qualifications</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staff.map((staffMember) => (
                <TableRow key={staffMember.id}>
                  <TableCell>{staffMember.staffReferenceNumber}</TableCell>
                  <TableCell>
                    {staffMember.firstName} {staffMember.middleName} {staffMember.familyName}
                  </TableCell>
                  <TableCell>
                    <Box>
                      {staffMember.email && (
                        <Typography variant="body2">{staffMember.email}</Typography>
                      )}
                      {staffMember.mobile && (
                        <Typography variant="caption" color="text.secondary">
                          {staffMember.mobile}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{format(parseISO(staffMember.startDate), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    <Chip
                      label={staffMember.status}
                      color={staffMember.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {(staffMember.qualifications?.length || 0) + (staffMember.licenses?.length || 0)} items
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleStaffEdit(staffMember)}
                      disabled={!isAdmin}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleStaffDelete(staffMember.id)}
                      disabled={!isAdmin}
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

      {/* Timesheets Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Timesheet functionality will be available after selecting a contract and staff member.
          </Typography>
        </Box>
      </TabPanel>

      {/* Contract Dialog */}
      <Dialog open={showContractDialog} onClose={() => setShowContractDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingContractId ? 'Edit Agency Contract' : 'Add Agency Contract'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Agency Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Agency Name *"
                value={currentContract.agencyName || ''}
                onChange={(e) => setCurrentContract({ ...currentContract, agencyName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Name *"
                value={currentContract.agencyContactName || ''}
                onChange={(e) => setCurrentContract({ ...currentContract, agencyContactName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Email *"
                type="email"
                value={currentContract.agencyContactEmail || ''}
                onChange={(e) => setCurrentContract({ ...currentContract, agencyContactEmail: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={currentContract.agencyContactPhone || ''}
                onChange={(e) => setCurrentContract({ ...currentContract, agencyContactPhone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Mobile"
                value={currentContract.agencyContactMobile || ''}
                onChange={(e) => setCurrentContract({ ...currentContract, agencyContactMobile: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Agency Address
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 1 *"
                value={currentContract.agencyAddress?.line1 || ''}
                onChange={(e) => setCurrentContract({
                  ...currentContract,
                  agencyAddress: { ...currentContract.agencyAddress!, line1: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address Line 2"
                value={currentContract.agencyAddress?.line2 || ''}
                onChange={(e) => setCurrentContract({
                  ...currentContract,
                  agencyAddress: { ...currentContract.agencyAddress!, line2: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Town"
                value={currentContract.agencyAddress?.town || ''}
                onChange={(e) => setCurrentContract({
                  ...currentContract,
                  agencyAddress: { ...currentContract.agencyAddress!, town: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City *"
                value={currentContract.agencyAddress?.city || ''}
                onChange={(e) => setCurrentContract({
                  ...currentContract,
                  agencyAddress: { ...currentContract.agencyAddress!, city: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postcode *"
                value={currentContract.agencyAddress?.postcode || ''}
                onChange={(e) => setCurrentContract({
                  ...currentContract,
                  agencyAddress: { ...currentContract.agencyAddress!, postcode: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Bank Details
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Account Name *"
                value={currentContract.bankDetails?.accountName || ''}
                onChange={(e) => setCurrentContract({
                  ...currentContract,
                  bankDetails: { ...currentContract.bankDetails!, accountName: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Account Number *"
                value={currentContract.bankDetails?.accountNumber || ''}
                onChange={(e) => setCurrentContract({
                  ...currentContract,
                  bankDetails: { ...currentContract.bankDetails!, accountNumber: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sort Code *"
                value={currentContract.bankDetails?.sortCode || ''}
                onChange={(e) => setCurrentContract({
                  ...currentContract,
                  bankDetails: { ...currentContract.bankDetails!, sortCode: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bank Name *"
                value={currentContract.bankDetails?.bankName || ''}
                onChange={(e) => setCurrentContract({
                  ...currentContract,
                  bankDetails: { ...currentContract.bankDetails!, bankName: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Contract Details
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date *"
                type="date"
                value={currentContract.contractStartDate || ''}
                onChange={(e) => setCurrentContract({ ...currentContract, contractStartDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={currentContract.contractEndDate || ''}
                onChange={(e) => setCurrentContract({ ...currentContract, contractEndDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={currentContract.contractStatus || 'active'}
                  label="Status"
                  onChange={(e) => setCurrentContract({ ...currentContract, contractStatus: e.target.value as any })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                  <MenuItem value="terminated">Terminated</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Hourly Rates
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Standard Hourly Rate *"
                type="number"
                value={currentContract.standardHourlyRate || 0}
                onChange={(e) => setCurrentContract({ ...currentContract, standardHourlyRate: parseFloat(e.target.value) })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">£</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Overtime Hourly Rate *"
                type="number"
                value={currentContract.overtimeHourlyRate || 0}
                onChange={(e) => setCurrentContract({ ...currentContract, overtimeHourlyRate: parseFloat(e.target.value) })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">£</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Standard Start Time"
                type="time"
                value={currentContract.standardStartTime || '08:00'}
                onChange={(e) => setCurrentContract({ ...currentContract, standardStartTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Standard End Time"
                type="time"
                value={currentContract.standardEndTime || '17:00'}
                onChange={(e) => setCurrentContract({ ...currentContract, standardEndTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Standard Hours Per Week"
                type="number"
                value={currentContract.standardHoursPerWeek || 40}
                onChange={(e) => setCurrentContract({ ...currentContract, standardHoursPerWeek: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={currentContract.notes || ''}
                onChange={(e) => setCurrentContract({ ...currentContract, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowContractDialog(false)}>Cancel</Button>
          <Button onClick={handleContractSave} variant="contained" startIcon={<Save />} disabled={loading}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Staff Dialog */}
      <Dialog open={showStaffDialog} onClose={() => setShowStaffDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingStaffId ? 'Edit Agency Staff' : 'Add Agency Staff'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Staff Reference Number *"
                value={currentStaff.staffReferenceNumber || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, staffReferenceNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date *"
                type="date"
                value={currentStaff.startDate || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="First Name *"
                value={currentStaff.firstName || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Middle Name"
                value={currentStaff.middleName || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, middleName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Family Name *"
                value={currentStaff.familyName || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, familyName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={currentStaff.email || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mobile"
                value={currentStaff.mobile || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, mobile: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Address (Optional)
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 1"
                value={currentStaff.address?.line1 || ''}
                onChange={(e) => setCurrentStaff({
                  ...currentStaff,
                  address: { ...currentStaff.address!, line1: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={currentStaff.address?.city || ''}
                onChange={(e) => setCurrentStaff({
                  ...currentStaff,
                  address: { ...currentStaff.address!, city: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postcode"
                value={currentStaff.address?.postcode || ''}
                onChange={(e) => setCurrentStaff({
                  ...currentStaff,
                  address: { ...currentStaff.address!, postcode: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={currentStaff.status || 'active'}
                  label="Status"
                  onChange={(e) => setCurrentStaff({ ...currentStaff, status: e.target.value as any })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="unavailable">Unavailable</MenuItem>
                  <MenuItem value="terminated">Terminated</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Note: Qualifications and licenses can be added after creating the staff member.
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStaffDialog(false)}>Cancel</Button>
          <Button onClick={handleStaffSave} variant="contained" startIcon={<Save />} disabled={loading}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgencyContractManagement;

