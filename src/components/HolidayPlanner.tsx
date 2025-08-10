import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Avatar,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
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
  FormHelperText,
} from '@mui/material';
import {
  Schedule,
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  Add,
  Home,
  Person,
  Business,
  Work,
  SupervisorAccount,
  AdminPanelSettings,
  DirectionsCar,
} from '@mui/icons-material';

interface HolidayPlannerProps {
  onClose: () => void;
}

interface HolidayRequest {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: 'manager' | 'admin' | 'driver';
  startDate: string;
  endDate: string;
  daysRequested: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  conflictWith?: string[];
}

const HolidayPlanner: React.FC<HolidayPlannerProps> = ({ onClose }) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRequest, setNewRequest] = useState({
    staffId: '',
    staffName: '',
    staffRole: 'driver' as 'manager' | 'admin' | 'driver',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const [holidayRequests, setHolidayRequests] = useState<HolidayRequest[]>([
    {
      id: '1',
      staffId: 'EMP-2020-001',
      staffName: 'Adam Mustafa',
      staffRole: 'driver',
      startDate: '2024-02-15',
      endDate: '2024-02-20',
      daysRequested: 5,
      reason: 'Family vacation',
      status: 'pending',
      submittedDate: '2024-01-10T10:00:00Z',
      conflictWith: ['2']
    },
    {
      id: '2',
      staffId: 'EMP-2019-001',
      staffName: 'Jane Manager',
      staffRole: 'driver',
      startDate: '2024-02-18',
      endDate: '2024-02-22',
      daysRequested: 4,
      reason: 'Medical appointment',
      status: 'pending',
      submittedDate: '2024-01-12T14:30:00Z',
      conflictWith: ['1']
    },
    {
      id: '3',
      staffId: 'EMP-2023-001',
      staffName: 'Sarah Johnson',
      staffRole: 'manager',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      daysRequested: 4,
      reason: 'Personal time',
      status: 'approved',
      submittedDate: '2024-01-05T09:00:00Z',
      approvedBy: 'Owner',
      approvedDate: '2024-01-08T11:00:00Z'
    },
    {
      id: '4',
      staffId: 'EMP-2023-002',
      staffName: 'Michael Smith',
      staffRole: 'admin',
      startDate: '2024-02-25',
      endDate: '2024-02-27',
      daysRequested: 2,
      reason: 'Training course',
      status: 'pending',
      submittedDate: '2024-01-15T16:00:00Z'
    }
  ]);

  // Mock staff data - in a real app this would come from a database
  const availableStaff = [
    { id: 'EMP-2020-001', name: 'Adam Mustafa', role: 'driver' as const },
    { id: 'EMP-2019-001', name: 'Jane Manager', role: 'driver' as const },
    { id: 'EMP-2023-001', name: 'Sarah Johnson', role: 'manager' as const },
    { id: 'EMP-2023-002', name: 'Michael Smith', role: 'admin' as const },
    { id: 'EMP-2024-001', name: 'John Driver', role: 'driver' as const },
    { id: 'EMP-2024-002', name: 'Alice Admin', role: 'admin' as const },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager':
        return 'primary';
      case 'admin':
        return 'secondary';
      case 'driver':
        return 'info';
      default:
        return 'default';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle />;
      case 'rejected':
        return <ErrorIcon />;
      case 'pending':
        return <Schedule />;
      default:
        return <Schedule />;
    }
  };

  const checkForConflicts = (request: HolidayRequest) => {
    return holidayRequests.filter(other => 
      other.id !== request.id && 
      other.staffRole === request.staffRole && 
      other.status === 'pending' &&
      ((new Date(request.startDate) <= new Date(other.endDate) && 
        new Date(request.endDate) >= new Date(other.startDate)))
    );
  };

  const getImminentHolidays = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return holidayRequests.filter(request => {
      const startDate = new Date(request.startDate);
      return startDate >= today && startDate <= thirtyDaysFromNow && request.status === 'approved';
    });
  };

  const getUpcomingRequests = () => {
    return holidayRequests.filter(request => request.status === 'pending');
  };

  const calculateDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!newRequest.staffId) errors.staffId = 'Staff member is required';
    if (!newRequest.startDate) errors.startDate = 'Start date is required';
    if (!newRequest.endDate) errors.endDate = 'End date is required';
    if (!newRequest.reason) errors.reason = 'Reason is required';
    
    if (newRequest.startDate && newRequest.endDate) {
      const start = new Date(newRequest.startDate);
      const end = new Date(newRequest.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (start < today) {
        errors.startDate = 'Start date cannot be in the past';
      }
      if (end < start) {
        errors.endDate = 'End date must be after start date';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStaffChange = (staffId: string) => {
    const staff = availableStaff.find(s => s.id === staffId);
    if (staff) {
      setNewRequest({
        ...newRequest,
        staffId: staff.id,
        staffName: staff.name,
        staffRole: staff.role,
      });
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    const daysRequested = calculateDays(newRequest.startDate, newRequest.endDate);
    
    const newHolidayRequest: HolidayRequest = {
      id: Date.now().toString(),
      staffId: newRequest.staffId,
      staffName: newRequest.staffName,
      staffRole: newRequest.staffRole,
      startDate: newRequest.startDate,
      endDate: newRequest.endDate,
      daysRequested,
      reason: newRequest.reason,
      status: 'pending',
      submittedDate: new Date().toISOString(),
    };
    
    setHolidayRequests([...holidayRequests, newHolidayRequest]);
    
    // Reset form
    setNewRequest({
      staffId: '',
      staffName: '',
      staffRole: 'driver',
      startDate: '',
      endDate: '',
      reason: '',
    });
    setFormErrors({});
    setShowAddDialog(false);
  };

  const handleClose = () => {
    setShowAddDialog(false);
    setNewRequest({
      staffId: '',
      staffName: '',
      staffRole: 'driver',
      startDate: '',
      endDate: '',
      reason: '',
    });
    setFormErrors({});
  };

  return (
    <Box sx={{ py: 2, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
          Holiday Planner
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
              <Schedule sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h6">Imminent Holidays</Typography>
              <Typography variant="h4" color="warning.main">
                {getImminentHolidays().length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Next 30 Days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Schedule sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h6">Pending Requests</Typography>
              <Typography variant="h4" color="info.main">
                {getUpcomingRequests().length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Awaiting Approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Warning sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h6">Role Conflicts</Typography>
              <Typography variant="h4" color="error.main">
                {holidayRequests.filter(req => req.conflictWith && req.conflictWith.length > 0).length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Need Attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowAddDialog(true)}
        >
          Add Holiday Request
        </Button>
      </Box>

      {/* Holiday Requests Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Staff Member</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Holiday Period</TableCell>
              <TableCell>Days</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Conflicts</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {holidayRequests.map((request) => {
              const conflicts = checkForConflicts(request);
              return (
                <TableRow key={request.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: getRoleColor(request.staffRole) }}>
                        {getRoleIcon(request.staffRole)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1">
                          {request.staffName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.staffId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getRoleIcon(request.staffRole)}
                      label={request.staffRole.charAt(0).toUpperCase() + request.staffRole.slice(1)}
                      color={getRoleColor(request.staffRole) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {request.daysRequested} days
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {request.reason}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(request.status)}
                      label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      color={getStatusColor(request.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {conflicts.length > 0 ? (
                      <Alert severity="warning" sx={{ py: 0, px: 1 }}>
                        <Typography variant="caption">
                          {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''}
                        </Typography>
                      </Alert>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        None
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {request.status === 'pending' && (
                      <Box>
                        <IconButton
                          size="small"
                          color="success"
                          sx={{ mr: 1 }}
                          onClick={() => {/* TODO: Approve request */}}
                        >
                          <CheckCircle />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {/* TODO: Reject request */}}
                        >
                          <ErrorIcon />
                        </IconButton>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Holiday Request Dialog */}
      <Dialog open={showAddDialog} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Add Holiday Request</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.staffId}>
                <InputLabel>Staff Member</InputLabel>
                <Select
                  value={newRequest.staffId}
                  onChange={(e) => handleStaffChange(e.target.value)}
                  label="Staff Member"
                >
                  {availableStaff.map((staff) => (
                    <MenuItem key={staff.id} value={staff.id}>
                      {staff.name} ({staff.id}) - {staff.role}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.staffId && <FormHelperText>{formErrors.staffId}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Staff Role"
                value={newRequest.staffRole.charAt(0).toUpperCase() + newRequest.staffRole.slice(1)}
                InputProps={{ readOnly: true }}
                sx={{ '& .MuiInputBase-input': { color: 'text.secondary' } }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={newRequest.startDate}
                onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
                error={!!formErrors.startDate}
                helperText={formErrors.startDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={newRequest.endDate}
                onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
                error={!!formErrors.endDate}
                helperText={formErrors.endDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason for Holiday"
                multiline
                rows={3}
                value={newRequest.reason}
                onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                error={!!formErrors.reason}
                helperText={formErrors.reason}
                placeholder="Please provide a reason for your holiday request..."
              />
            </Grid>
            
            {newRequest.startDate && newRequest.endDate && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Days Requested:</strong> {calculateDays(newRequest.startDate, newRequest.endDate)} days
                    {newRequest.startDate && newRequest.endDate && (
                      <span> ({new Date(newRequest.startDate).toLocaleDateString()} to {new Date(newRequest.endDate).toLocaleDateString()})</span>
                    )}
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!newRequest.staffId || !newRequest.startDate || !newRequest.endDate || !newRequest.reason}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HolidayPlanner;
