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
  Analytics,
} from '@mui/icons-material';
import { logout } from '../store/slices/authSlice';
import { AppDispatch } from '../store';
import { DynamicComponents, LoadingSpinner } from '../utils/dynamicImports';
import ErrorBoundary from './ErrorBoundary';
import { generatePlaceholderCards, PlaceholderCard } from '../utils/placeholderCards';

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
  CompanyInfo,
} = DynamicComponents;

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'driver' | 'admin' | 'staff' | 'supa_admin';
}

interface DashboardProps {
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Define the cards configuration for main dashboard
  const functionalCards = 8; // Fleet, Staff, Legal, Jobs & Planning, Print Screen, Financial, Clients, Company Info
  const comingSoonCards = 0; // Coming soon cards replaced with placeholders
  const columnsPerRow = 3;
  
  // Generate placeholder cards to complete incomplete rows
  const placeholderCards = generatePlaceholderCards(functionalCards, comingSoonCards, columnsPerRow);
  
  // Debug: Log the card counts
  console.log('Dashboard - Functional cards:', functionalCards);
  console.log('Dashboard - Coming soon cards:', comingSoonCards);
  console.log('Dashboard - Placeholder cards:', placeholderCards.length);
  console.log('Dashboard - Total cards:', functionalCards + comingSoonCards + placeholderCards.length);
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
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    // Clear the auto-login flag so user can be auto-logged in again if needed
    localStorage.removeItem('hasAutoLoggedIn');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'driver':
        return 'primary';
      case 'admin':
        return 'secondary';
      case 'staff':
        return 'info';
      case 'supa_admin':
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
      case 'staff':
        return <Person />;
      case 'supa_admin':
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
            <FleetManagementHub onClose={() => setShowFleetManagement(false)} userRole={user?.role} />
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

  // Show company info if requested
  if (showCompanyInfo) {
    return (
      <Box sx={{ py: 2 }}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <CompanyInfo onClose={() => setShowCompanyInfo(false)} />
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
              <Card sx={{ transform: 'scale(0.94)', width: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CheckCircle sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Daily Vehicle Checks</Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2, width: 'calc(100% - 160px)', backgroundColor: 'primary.main', '&:hover': { backgroundColor: 'primary.dark' } }}
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
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2, width: 'calc(100% - 160px)', backgroundColor: 'primary.main', '&:hover': { backgroundColor: 'primary.dark' } }}
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
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2, width: 'calc(100% - 160px)', backgroundColor: 'primary.main', '&:hover': { backgroundColor: 'primary.dark' } }}
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
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2, width: 'calc(100% - 160px)', backgroundColor: 'primary.main', '&:hover': { backgroundColor: 'primary.dark' } }}
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
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2, width: 'calc(100% - 160px)', backgroundColor: 'primary.main', '&:hover': { backgroundColor: 'primary.dark' } }}
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
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2, width: 'calc(100% - 160px)', backgroundColor: 'primary.main', '&:hover': { backgroundColor: 'primary.dark' } }}
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
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2, width: 'calc(100% - 160px)', backgroundColor: 'primary.main', '&:hover': { backgroundColor: 'primary.dark' } }}
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
                  <Button variant="contained" sx={{ mt: 2, width: 'calc(100% - 160px)', backgroundColor: 'primary.main', '&:hover': { backgroundColor: 'primary.dark' } }}>
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
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                  <LocalShipping sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Fleet Manager</Typography>
                </CardContent>
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Button 
                    variant="contained" 
                    sx={{ width: 'calc(100% - 160px)', backgroundColor: 'primary.main', '&:hover': { backgroundColor: 'primary.dark' } }}
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
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                  <Person sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h6">Staff Manager</Typography>
                </CardContent>
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Button 
                    variant="contained" 
                    sx={{ width: 'calc(100% - 160px)', backgroundColor: 'primary.main', '&:hover': { backgroundColor: 'primary.dark' } }}
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
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                  <Assessment sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h6">Legal Manager</Typography>
                </CardContent>
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Button 
                    variant="contained" 
                    sx={{ width: 'calc(100% - 160px)', backgroundColor: 'primary.main', '&:hover': { backgroundColor: 'primary.dark' } }}
                    onClick={() => setShowLegalHub(true)}
                  >
                    Legal Hub
                  </Button>
                </Box>
              </Card>
            </Grid>

            {/* Additional Tools Row */}
            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ transform: 'scale(0.94)', width: 'calc(100% - 20px)' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Schedule sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h6">Jobs & Planning Manager</Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2, width: 'calc(100% - 160px)', backgroundColor: 'primary.main', '&:hover': { backgroundColor: 'primary.dark' } }}
                    onClick={() => setShowPlanningHub(true)}
                  >
                    Main Hub
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ transform: 'scale(0.94)', width: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Assessment sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h6">Print Manager</Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2, width: 'calc(100% - 160px)', backgroundColor: 'primary.main', '&:hover': { backgroundColor: 'primary.dark' } }}
                    onClick={() => setShowReportsHub(true)}
                  >
                    PrintOut Hub
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ transform: 'scale(0.94)', width: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AccountBalance sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h6">Financial</Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2, width: 'calc(100% - 160px)', backgroundColor: 'primary.main', '&:hover': { backgroundColor: 'primary.dark' } }}
                    onClick={() => setShowAccountingHub(true)}
                  >
                    Finance Hub
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ transform: 'scale(0.94)', width: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Business sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h6">Clients Manager</Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2, width: 'calc(100% - 160px)', backgroundColor: 'primary.main', '&:hover': { backgroundColor: 'primary.dark' } }}
                    onClick={() => setShowClientHub(true)}
                  >
                    Client Hub
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ transform: 'scale(0.94)', width: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Business sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Company Info Manager</Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2, width: 'calc(100% - 160px)', backgroundColor: 'primary.main', '&:hover': { backgroundColor: 'primary.dark' } }}
                    onClick={() => setShowCompanyInfo(true)}
                  >
                    Update
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Dynamic Placeholder Cards */}
            {placeholderCards.map((card) => (
              <Grid item xs={12} md={6} lg={4} key={card.id}>
                <Card sx={{ 
                  transform: 'scale(0.94)',
                  opacity: 0.7,
                  cursor: 'default',
                  '&:hover': {
                    transform: 'translateY(-4px) scale(0.94)',
                    boxShadow: 4,
                  }
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Analytics sx={{ fontSize: 40, color: 'grey.500', mb: 1 }} />
                    <Typography variant="h6" color="grey.600">{card.title}</Typography>
                    <Button 
                      variant="contained" 
                      sx={{ mt: 2, width: 'calc(100% - 160px)', backgroundColor: 'grey.500', '&:hover': { backgroundColor: 'grey.600' } }}
                      disabled
                    >
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard; 