import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Visibility,
  LocalShipping,
  CheckCircle,
  Warning,
  Home,
  Circle,
  Build,
  Error,
  Speed,
  Assignment,
  Person,
} from '@mui/icons-material';
import { RootState } from '../store';

interface TrailerFleetProps {
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
      id={`trailer-tabpanel-${index}`}
      aria-labelledby={`trailer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const TrailerFleet: React.FC<TrailerFleetProps> = ({ onClose }) => {
  const { vehicles, defectReports, fleetStatus } = useSelector((state: RootState) => state.vehicle);
  
  const [tabValue, setTabValue] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showAddVehicleDialog, setShowAddVehicleDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'Service':
      case 'MOT':
      case 'Repair':
        return 'warning';
      case 'V.O.R':
      case 'Off Road':
      case 'Breakdown':
        return 'error';
      case 'Reserved':
      case 'Training':
        return 'info';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Available':
        return <CheckCircle />;
      case 'Service':
      case 'MOT':
      case 'Repair':
        return <Build />;
      case 'V.O.R':
      case 'Off Road':
      case 'Breakdown':
        return <Error />;
      case 'Reserved':
      case 'Training':
        return <Speed />;
      default:
        return <Circle />;
    }
  };

  const handleVehicleStatusUpdate = () => {
    if (selectedVehicle) {
      setShowVehicleDialog(false);
    }
  };

  const handleReportStatusUpdate = () => {
    if (selectedReport) {
      setShowReportDialog(false);
    }
  };

  const handleAddVehicle = () => {
    setShowAddVehicleDialog(false);
  };

  const openVehicleDialog = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setShowVehicleDialog(true);
  };

  const openReportDialog = (report: any) => {
    setSelectedReport(report);
    setShowReportDialog(true);
  };

  return (
    <Box>
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{
            '& .MuiTab-root': {
              color: '#FFD700',
              fontWeight: 'bold',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            },
          }}
        >
          <Tab label="Trailer Overview" />
          <Tab label="Defect Reports" />
          <Tab label="Maintenance Schedule" />
          <Tab label="Trailer Assignment" />
        </Tabs>
      </Box>

      {/* Trailer Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Trailer Fleet</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowAddVehicleDialog(true)}
          >
            Add Trailer
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Trailer</TableCell>
                <TableCell>Registration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Current Driver</TableCell>
                <TableCell>Last Service</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocalShipping sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {vehicle.make} {vehicle.model}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {vehicle.year}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{vehicle.registration}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(vehicle.status)}
                      label={vehicle.status.replace('_', ' ')}
                      color={getStatusColor(vehicle.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {vehicle.currentDriver || 'Unassigned'}
                  </TableCell>
                  <TableCell>
                    {vehicle.lastInspection ? new Date(vehicle.lastInspection).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => openVehicleDialog(vehicle)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Trailer">
                      <IconButton
                        size="small"
                        onClick={() => openVehicleDialog(vehicle)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Defect Reports Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Defect Reports</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {/* Add defect report handler */}}
          >
            Add Defect Report
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Trailer</TableCell>
                <TableCell>Driver</TableCell>
                <TableCell>Defect Type</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {defectReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.vehicleFleetNumber}</TableCell>
                  <TableCell>{report.driverName}</TableCell>
                  <TableCell>{report.defects.reported}</TableCell>
                  <TableCell>
                    <Chip
                      label={report.priority}
                      color={getPriorityColor(report.priority) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={report.status}
                      color={report.status === 'resolved' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(report.dateTime).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => openReportDialog(report)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Update Status">
                      <IconButton
                        size="small"
                        onClick={() => openReportDialog(report)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Maintenance Schedule Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Maintenance Schedule
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Maintenance Schedule:</strong> Track scheduled maintenance, MOT tests, and service intervals for all trailers.
          </Typography>
        </Alert>
        
        <Grid container spacing={3}>
          {vehicles.map((vehicle) => (
            <Grid item xs={12} md={6} key={vehicle.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{vehicle.make} {vehicle.model}</Typography>
                    <Chip
                      icon={getStatusIcon(vehicle.status)}
                      label={vehicle.status.replace('_', ' ')}
                      color={getStatusColor(vehicle.status) as any}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Registration: {vehicle.registration}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Last Service: {vehicle.lastInspection ? new Date(vehicle.lastInspection).toLocaleDateString() : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Next Service: {vehicle.nextService ? new Date(vehicle.nextService).toLocaleDateString() : 'Not scheduled'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Trailer Assignment Tab */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Trailer Assignment Management</Typography>
          <Button
            variant="contained"
            startIcon={<Assignment />}
            onClick={() => {/* Add assignment handler */}}
          >
            Assign Trailer
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Trailer Assignment:</strong> Manage trailer allocations, track current usage, and view assignment history.
          </Typography>
        </Alert>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Trailer</TableCell>
                <TableCell>Registration</TableCell>
                <TableCell>Current Driver</TableCell>
                <TableCell>Assignment Date</TableCell>
                <TableCell>Assignment Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocalShipping sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {vehicle.make} {vehicle.model}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {vehicle.year}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{vehicle.registration}</TableCell>
                  <TableCell>
                    {vehicle.currentDriver ? (
                      <Chip
                        icon={<Person />}
                        label={vehicle.currentDriver}
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        icon={<Warning />}
                        label="Unassigned"
                        color="warning"
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {vehicle.updatedAt ? new Date(vehicle.updatedAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={vehicle.currentDriver ? <CheckCircle /> : <Circle />}
                      label={vehicle.currentDriver ? 'Assigned' : 'Available'}
                      color={vehicle.currentDriver ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Assignment Details">
                      <IconButton
                        size="small"
                        onClick={() => {/* View assignment details */}}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Change Assignment">
                      <IconButton
                        size="small"
                        onClick={() => {/* Change assignment */}}
                      >
                        <Assignment />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Assignment Summary Cards */}
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Assigned Trailers
                </Typography>
                <Typography variant="h4">
                  {vehicles.filter(v => v.currentDriver).length}
                </Typography>
                <Typography variant="body2">
                  Currently in use
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Available Trailers
                </Typography>
                <Typography variant="h4">
                  {vehicles.filter(v => !v.currentDriver).length}
                </Typography>
                <Typography variant="body2">
                  Ready for assignment
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'info.light', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Trailers
                </Typography>
                <Typography variant="h4">
                  {vehicles.length}
                </Typography>
                <Typography variant="body2">
                  All trailers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Add Trailer Dialog */}
      <Dialog open={showAddVehicleDialog} onClose={() => setShowAddVehicleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Trailer</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Trailer addition form will be implemented here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddVehicleDialog(false)}>Cancel</Button>
          <Button onClick={handleAddVehicle} variant="contained">Add Trailer</Button>
        </DialogActions>
      </Dialog>

      {/* Trailer Details Dialog */}
      {selectedVehicle && (
        <Dialog open={showVehicleDialog} onClose={() => setShowVehicleDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Trailer Details: {selectedVehicle.make} {selectedVehicle.model}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Trailer details and status update form will be implemented here.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowVehicleDialog(false)}>Cancel</Button>
            <Button onClick={handleVehicleStatusUpdate} variant="contained">Update Status</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Defect Report Dialog */}
      {selectedReport && (
        <Dialog open={showReportDialog} onClose={() => setShowReportDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Defect Report Details</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Defect report details and status update form will be implemented here.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowReportDialog(false)}>Cancel</Button>
            <Button onClick={handleReportStatusUpdate} variant="contained">Update Status</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default TrailerFleet;


