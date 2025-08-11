import React, { useState, Suspense } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,

} from '@mui/material';
import {
  LocalShipping,
  Assignment,
  Logout,
  Person,
  Upload,
  Route,
  Schedule,
  Report,
  CheckCircle,
  ArrowBack,
  Assessment,
  AccountBalance,
  Business,
  History,
  Receipt,
} from '@mui/icons-material';
import { logout } from '../store/slices/authSlice';
import { AppDispatch } from '../store';
import { DynamicComponents, LoadingSpinner } from '../utils/dynamicImports';
import ErrorBoundary from './ErrorBoundary';

// Destructure all the components we need
const {
  Timesheet,
  VehicleCheckSheet,
  FleetManagementHub,
  PlanningHub,
  LegalHub,
  DriverHub,
  StaffManagement,
  DriverDashboard,
  DriverPlanner,
  ReportsHub,
  TrailerPlotter,
  AccountingHub,
  InvoiceUpload,
  ClientHub,
} = DynamicComponents;

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'driver' | 'admin' | 'owner';
}

interface DashboardProps {
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [showTimesheet, setShowTimesheet] = useState(false);
  const [showVehicleCheck, setShowVehicleCheck] = useState(false);
  const [showFleetManagement, setShowFleetManagement] = useState(false);
  const [showLegalHub, setShowLegalHub] = useState(false);
  const [showDriverHub, setShowDriverHub] = useState(false);
  const [showStaffManagement, setShowStaffManagement] = useState(false);
  const [showPlanningHub, setShowPlanningHub] = useState(false);
  // showPlanningMainHub state removed - using showPlanningHub directly
  const [showReportsHub, setShowReportsHub] = useState(false);
  const [showDriverDashboard, setShowDriverDashboard] = useState(false);
  const [showDriverPlanner, setShowDriverPlanner] = useState(false);
  const [showTrailerPlan, setShowTrailerPlan] = useState(false);


  const [showAccountingHub, setShowAccountingHub] = useState(false);
  const [showInvoiceUpload, setShowInvoiceUpload] = useState(false);
  const [showClientHub, setShowClientHub] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'driver':
        return 'primary';
      case 'admin':
        return 'secondary';
      case 'owner':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'driver':
        return <LocalShipping />;
      case 'admin':
        return <Person />;
      case 'owner':
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
      <Box sx={{ py: 2, bgcolor: 'black', minHeight: '100vh', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => setShowTimesheet(false)}
            sx={{ mr: 2, color: 'yellow' }}
          >
            Back to Dashboard
          </Button>
        </Box>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <Timesheet onClose={() => setShowTimesheet(false)} />
          </Suspense>
        </ErrorBoundary>
      </Box>
    );
  }

  // Show vehicle check if requested
  if (showVehicleCheck) {
    return (
      <Box sx={{ py: 2, bgcolor: 'black', minHeight: '100vh', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => setShowVehicleCheck(false)}
            sx={{ mr: 2, color: 'yellow' }}
          >
            Back to Dashboard
          </Button>
        </Box>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <VehicleCheckSheet onClose={() => setShowVehicleCheck(false)} />
          </Suspense>
        </ErrorBoundary>
      </Box>
    );
  }

  // Show fleet management if requested
  if (showFleetManagement) {
    return (
      <Box sx={{ py: 2, bgcolor: 'black', minHeight: '100vh', color: 'white' }}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <FleetManagementHub onClose={() => setShowFleetManagement(false)} />
          </Suspense>
        </ErrorBoundary>
      </Box>
    );
  }

  // Show legal hub if requested
  if (showLegalHub) {
    return (
      <Box sx={{ py: 2, bgcolor: 'black', minHeight: '100vh', color: 'white' }}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <LegalHub onClose={() => setShowLegalHub(false)} />
          </Suspense>
        </ErrorBoundary>
      </Box>
    );
  }

  // Show staff management if requested
  if (showStaffManagement) {
    return (
      <Box sx={{ py: 2, bgcolor: 'black', minHeight: '100vh', color: 'white' }}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <StaffManagement onClose={() => setShowStaffManagement(false)} />
          </Suspense>
        </ErrorBoundary>
      </Box>
    );
  }

  // Show driver hub if requested
  if (showDriverHub) {
    return (
      <Box sx={{ py: 2 }}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <DriverHub onClose={() => setShowDriverHub(false)} />
          </Suspense>
        </ErrorBoundary>
      </Box>
    );
  }

  // Show planning hub if requested
  if (showPlanningHub) {
    return (
      <Box sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => setShowPlanningHub(false)}
            sx={{ mr: 2, color: 'yellow' }}
          >
            Back to Dashboard
          </Button>
        </Box>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <PlanningHub onClose={() => setShowPlanningHub(false)} />
          </Suspense>
        </ErrorBoundary>
      </Box>
    );
  }



  // Show reports hub if requested
  if (showReportsHub) {
    return (
      <Box sx={{ py: 2 }}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <ReportsHub onClose={() => setShowReportsHub(false)} />
          </Suspense>
        </ErrorBoundary>
      </Box>
    );
  }

  // Show accounting hub if requested
  if (showAccountingHub) {
    return (
      <Box sx={{ py: 2 }}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <AccountingHub onClose={() => setShowAccountingHub(false)} />
          </Suspense>
        </ErrorBoundary>
      </Box>
    );
  }

  // Show invoice upload if requested
  if (showInvoiceUpload) {
    return (
      <Box sx={{ py: 2 }}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <InvoiceUpload onClose={() => setShowInvoiceUpload(false)} />
          </Suspense>
        </ErrorBoundary>
      </Box>
    );
  }

  // Show client hub if requested
  if (showClientHub) {
    return (
      <Box sx={{ py: 2 }}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <ClientHub onClose={() => setShowClientHub(false)} />
          </Suspense>
        </ErrorBoundary>
      </Box>
    );
  }

  // Show driver dashboard if requested
  if (showDriverDashboard) {
    return (
      <Box sx={{ py: 2 }}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <DriverDashboard onClose={() => setShowDriverDashboard(false)} />
          </Suspense>
        </ErrorBoundary>
      </Box>
    );
  }

  // Show driver planner if requested
  if (showDriverPlanner) {
    return (
      <Box sx={{ py: 2 }}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <DriverPlanner onClose={() => setShowDriverPlanner(false)} />
          </Suspense>
        </ErrorBoundary>
      </Box>
    );
  }

  // Show trailer plan if requested
  if (showTrailerPlan) {
    return (
      <Box sx={{ py: 2 }}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <TrailerPlotter onClose={() => setShowTrailerPlan(false)} />
          </Suspense>
        </ErrorBoundary>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2, bgcolor: 'black', minHeight: '100vh', color: 'white' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ color: 'white' }}>
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
          sx={{ color: 'yellow', borderColor: 'yellow' }}
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
              <Card sx={{ transform: 'scale(0.94)' }}>
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
              <Card sx={{ transform: 'scale(0.94)' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Upload sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h6">Invoice Upload</Typography>
                  <Typography variant="body2" color="text.secondary">
                    OCR document processing
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="info" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowInvoiceUpload(true)}
                  >
                    Upload & Process
                  </Button>
                </CardContent>
              </Card>
            </Grid>



            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ transform: 'scale(0.94)' }}>
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
                    onClick={() => {/* Daily planner functionality removed */}}
                  >
                    View Schedule
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ transform: 'scale(0.94)' }}>
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
              <Card sx={{ transform: 'scale(0.94)' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Route sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h6">Driver Planner</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Daily/weekly schedule reports & route optimization
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="warning" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowDriverPlanner(true)}
                  >
                    Open Planner
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ transform: 'scale(0.94)' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <LocalShipping sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h6">Trailer Plan</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Load planning & trailer optimization with drag & drop
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowTrailerPlan(true)}
                  >
                    Open Trailer Plan
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ transform: 'scale(0.94)' }}>
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
              <Card sx={{ transform: 'scale(0.94)' }}>
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
          // Admin Dashboard (Admin & Owner)
          <>
            {/* Main 3-Card Dashboard Row */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                transform: 'scale(0.94)',
                height: '280px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                  <LocalShipping sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Fleet Management</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monitor all vehicles, track defects, and manage maintenance
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => setShowFleetManagement(true)}
                  >
                    Fleet Hub
                  </Button>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ 
                transform: 'scale(0.94)',
                height: '280px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                  <Person sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h6">Staff Hub</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage staff, wages, qualifications, and employment details
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    fullWidth
                    onClick={() => setShowStaffManagement(true)}
                  >
                    Staff Hub
                  </Button>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ 
                transform: 'scale(0.94)',
                height: '280px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                  <Assessment sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h6">Legal Hub</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Legal compliance, regulations, and driver hours tracking
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Button 
                    variant="contained" 
                    color="success" 
                    fullWidth
                    onClick={() => setShowLegalHub(true)}
                  >
                    Legal Hub
                  </Button>
                </Box>
              </Card>
            </Grid>

            {/* Additional Tools Row */}
            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ transform: 'scale(0.94)' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Schedule sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h6">Jobs & Planning</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Daily planning, routes & job assignment
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="info" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowPlanningHub(true)}
                  >
                    Main Hub
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ transform: 'scale(0.94)' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Assessment sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h6">Print Screen</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Wage slips, fuel, purchase orders & invoices
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowReportsHub(true)}
                  >
                    PrintOut Hub
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ transform: 'scale(0.94)' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AccountBalance sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h6">Financial</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Books, Invoices, Purchase Orders & Print
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="info" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowAccountingHub(true)}
                  >
                    Finance Hub
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ transform: 'scale(0.94)' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Business sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h6">Clients</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage client relationships
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="info" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowClientHub(true)}
                  >
                    Client Hub
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Coming Soon Cards Row */}
            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ 
                transform: 'scale(0.94)',
                opacity: 0.6,
                cursor: 'not-allowed',
                '&:hover': {
                  transform: 'scale(0.94)',
                  boxShadow: 1
                }
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Schedule sx={{ fontSize: 40, color: 'grey.500', mb: 1 }} />
                  <Typography variant="h6" color="grey.600">Coming Soon</Typography>
                  <Typography variant="body2" color="grey.500">
                    Additional features and tools
                  </Typography>
                  <Button 
                    variant="outlined" 
                    disabled
                    sx={{ mt: 2 }}
                  >
                    Unavailable
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ 
                transform: 'scale(0.94)',
                opacity: 0.6,
                cursor: 'not-allowed',
                '&:hover': {
                  transform: 'scale(0.94)',
                  boxShadow: 1
                }
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Assessment sx={{ fontSize: 40, color: 'grey.500', mb: 1 }} />
                  <Typography variant="h6" color="grey.600">Coming Soon</Typography>
                  <Typography variant="body2" color="grey.500">
                    Advanced analytics and reporting
                  </Typography>
                  <Button 
                    variant="outlined" 
                    disabled
                    sx={{ mt: 2 }}
                  >
                    Unavailable
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ 
                transform: 'scale(0.94)',
                opacity: 0.6,
                cursor: 'not-allowed',
                '&:hover': {
                  transform: 'scale(0.94)',
                  boxShadow: 1
                }
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Business sx={{ fontSize: 40, color: 'grey.500', mb: 1 }} />
                  <Typography variant="h6" color="grey.600">Coming Soon</Typography>
                  <Typography variant="body2" color="grey.500">
                    Enhanced client management
                  </Typography>
                  <Button 
                    variant="outlined" 
                    disabled
                    sx={{ mt: 2 }}
                  >
                    Unavailable
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