import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
} from '@mui/material';
import {
  LocalShipping,
  Assignment,
  Speed,
  LocalGasStation,
  Logout,
  Person,
  Upload,
  Route,
  Schedule,
  Report,
  CheckCircle,
  ArrowBack,
  AttachMoney,
} from '@mui/icons-material';
import { logout } from '../store/slices/authSlice';
import { AppDispatch } from '../store';
import Timesheet from './Timesheet';
import WageManagement from './WageManagement';
import VehicleCheckSheet from './VehicleCheckSheet';
import FleetManagement from './FleetManagement';
import ComplianceTracking from './ComplianceTracking';
import DriverManagement from './DriverManagement';
import JobAssignment from './JobAssignment';
import RoutePlanning from './RoutePlanning';
import DailyPlanner from './DailyPlanner';
import DriverDashboard from './DriverDashboard';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'driver' | 'management' | 'admin';
}

interface DashboardProps {
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [showTimesheet, setShowTimesheet] = useState(false);
  const [showWageManagement, setShowWageManagement] = useState(false);
  const [showVehicleCheck, setShowVehicleCheck] = useState(false);
  const [showFleetManagement, setShowFleetManagement] = useState(false);
  const [showComplianceTracking, setShowComplianceTracking] = useState(false);
  const [showDriverManagement, setShowDriverManagement] = useState(false);
  const [showJobAssignment, setShowJobAssignment] = useState(false);
  const [showRoutePlanning, setShowRoutePlanning] = useState(false);
  const [showDailyPlanner, setShowDailyPlanner] = useState(false);
  const [showDriverDashboard, setShowDriverDashboard] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'driver':
        return 'primary';
      case 'management':
        return 'secondary';
      case 'admin':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'driver':
        return <LocalShipping />;
      case 'management':
        return <Person />;
      case 'admin':
        return <Person />;
      default:
        return <Person />;
    }
  };

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  // Show timesheet if requested
  if (showTimesheet) {
    return (
      <Box sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => setShowTimesheet(false)}
            sx={{ mr: 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>
        <Timesheet onClose={() => setShowTimesheet(false)} />
      </Box>
    );
  }

  // Show wage management if requested
  if (showWageManagement) {
    return (
      <Box sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => setShowWageManagement(false)}
            sx={{ mr: 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>
        <WageManagement onClose={() => setShowWageManagement(false)} />
      </Box>
    );
  }

  // Show vehicle check if requested
  if (showVehicleCheck) {
    return (
      <Box sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => setShowVehicleCheck(false)}
            sx={{ mr: 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>
        <VehicleCheckSheet onClose={() => setShowVehicleCheck(false)} />
      </Box>
    );
  }

  // Show fleet management if requested
  if (showFleetManagement) {
    return (
      <Box sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => setShowFleetManagement(false)}
            sx={{ mr: 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>
        <FleetManagement onClose={() => setShowFleetManagement(false)} />
      </Box>
    );
  }

  // Show compliance tracking if requested
  if (showComplianceTracking) {
    return (
      <Box sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => setShowComplianceTracking(false)}
            sx={{ mr: 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>
        <ComplianceTracking onClose={() => setShowComplianceTracking(false)} />
      </Box>
    );
  }

  // Show driver management if requested
  if (showDriverManagement) {
    return (
      <Box sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => setShowDriverManagement(false)}
            sx={{ mr: 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>
        <DriverManagement onClose={() => setShowDriverManagement(false)} />
      </Box>
    );
  }

  // Show job assignment if requested
  if (showJobAssignment) {
    return (
      <Box sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => setShowJobAssignment(false)}
            sx={{ mr: 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>
        <JobAssignment onClose={() => setShowJobAssignment(false)} />
      </Box>
    );
  }

  // Show route planning if requested
  if (showRoutePlanning) {
    return (
      <Box sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => setShowRoutePlanning(false)}
            sx={{ mr: 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>
        <RoutePlanning onClose={() => setShowRoutePlanning(false)} />
      </Box>
    );
  }

  // Show daily planner if requested
  if (showDailyPlanner) {
    return (
      <Box sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => setShowDailyPlanner(false)}
            sx={{ mr: 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>
        <DailyPlanner onClose={() => setShowDailyPlanner(false)} />
      </Box>
    );
  }

  // Show driver dashboard if requested
  if (showDriverDashboard) {
    return (
      <Box sx={{ py: 2 }}>
        <DriverDashboard onClose={() => setShowDriverDashboard(false)} />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user.firstName}!
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getRoleIcon(user.role)}
            <Chip
              label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              color={getRoleColor(user.role) as any}
              size="small"
            />
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Logout />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      {/* Dashboard Content */}
      <Grid container spacing={3}>
        {user.role === 'driver' ? (
          // Driver Dashboard - Complete Feature Set
          <>
            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CheckCircle sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Daily Vehicle Checks</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Digital inspection forms
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowVehicleCheck(true)}
                  >
                    Start Check
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Assignment sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h6">Job Assignment & Tracking</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Real-time job updates
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowDailyPlanner(true)}
                  >
                    View Jobs
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <LocalGasStation sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h6">Fuel Monitoring</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Track fuel consumption
                  </Typography>
                  <Button variant="contained" color="warning" sx={{ mt: 2 }}>
                    View Fuel
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Upload sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h6">Invoice Upload</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Document management
                  </Typography>
                  <Button variant="contained" color="info" sx={{ mt: 2 }}>
                    Upload Invoice
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Route sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h6">Route Planning</Typography>
                  <Typography variant="body2" color="text.secondary">
                    GPS navigation
                  </Typography>
                  <Button variant="contained" color="success" sx={{ mt: 2 }}>
                    Plan Route
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Schedule sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h6">Daily Planner</Typography>
                  <Typography variant="body2" color="text.secondary">
                    View your daily schedule
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="info" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowDailyPlanner(true)}
                  >
                    View Schedule
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Person sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h6">Driver Dashboard</Typography>
                  <Typography variant="body2" color="text.secondary">
                    View jobs, hours & pay
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowDriverDashboard(true)}
                  >
                    Open Dashboard
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Schedule sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                  <Typography variant="h6">Hours Logging</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Working time tracking
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="error" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowTimesheet(true)}
                  >
                    Log Hours
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Report sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                  <Typography variant="h6">Incident Reporting</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Safety incident management
                  </Typography>
                  <Button variant="contained" color="error" sx={{ mt: 2 }}>
                    Report Incident
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </>
        ) : (
          // Management Dashboard
          <>
            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <LocalShipping sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Fleet Management</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monitor all vehicles
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowFleetManagement(true)}
                  >
                    View Fleet
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Person sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h6">Driver Management</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage driver accounts
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowDriverManagement(true)}
                  >
                    Manage Drivers
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Assignment sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h6">Compliance Tracking</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monitor safety compliance
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="success" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowComplianceTracking(true)}
                  >
                    View Reports
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AttachMoney sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h6">Wage Management</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Set driver rates & view payroll
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="warning" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowWageManagement(true)}
                  >
                    Manage Wages
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Assignment sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h6">Job Assignment</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create and assign jobs
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="info" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowJobAssignment(true)}
                  >
                    Manage Jobs
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Route sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h6">Route Planning</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Optimize vehicle routes
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="success" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowRoutePlanning(true)}
                  >
                    Plan Routes
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Schedule sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Daily Planner</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Schedule and track daily operations
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowDailyPlanner(true)}
                  >
                    View Schedule
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard; 