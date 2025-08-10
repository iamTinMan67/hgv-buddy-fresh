import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Circle,
  HealthAndSafety,
  Schedule,
  Work,
  DirectionsCar,
  Person,
  Edit,
  Download,
  Print,
  Share,
  History,
  Timeline,
  Assessment,
  Security,
  School,
  TrendingUp,
  Speed,
  LocalShipping,
} from '@mui/icons-material';

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
      id={`driver-details-tabpanel-${index}`}
      aria-labelledby={`driver-details-tab-${index}`}
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

interface DriverDetailsProps {
  driver: Driver;
  onBack: () => void;
}

interface Qualification {
  id: string;
  type: 'license' | 'cpc' | 'medical' | 'training' | 'certification';
  name: string;
  number: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expired' | 'expiring_soon' | 'suspended';
  issuingAuthority: string;
  notes?: string;
}

interface PerformanceRecord {
  id: string;
  date: string;
  type: 'job_completion' | 'safety_assessment' | 'customer_feedback' | 'training_completion';
  score: number;
  maxScore: number;
  description: string;
  evaluator: string;
  notes?: string;
}

interface SafetyRecord {
  id: string;
  date: string;
  type: 'incident' | 'violation' | 'inspection' | 'training' | 'award';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: string;
  vehicleInvolved?: string;
  outcome: string;
  investigator: string;
  notes?: string;
}

const DriverDetails: React.FC<DriverDetailsProps> = ({ driver, onBack }) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  // Mock data for qualifications
  const [qualifications] = useState<Qualification[]>([
    {
      id: '1',
      type: 'license',
      name: 'HGV Class 1 License',
      number: driver.licenseNumber,
      issueDate: '2020-01-15',
      expiryDate: driver.licenseExpiry,
      status: new Date(driver.licenseExpiry) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'expiring_soon' : 'valid',
      issuingAuthority: 'DVLA',
      notes: 'Full HGV license with all endorsements',
    },
    {
      id: '2',
      type: 'cpc',
      name: 'Driver CPC Qualification',
      number: driver.cpcCardNumber,
      issueDate: '2020-01-15',
      expiryDate: driver.cpcExpiry,
      status: new Date(driver.cpcExpiry) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'expiring_soon' : 'valid',
      issuingAuthority: 'JAUPT',
      notes: '35 hours of periodic training completed',
    },
    {
      id: '3',
      type: 'medical',
      name: 'HGV Medical Certificate',
      number: driver.medicalCertificate,
      issueDate: '2020-01-15',
      expiryDate: driver.medicalExpiry,
      status: new Date(driver.medicalExpiry) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'expiring_soon' : 'valid',
      issuingAuthority: 'GP Practice',
      notes: 'Annual medical assessment for HGV drivers',
    },
    {
      id: '4',
      type: 'training',
      name: 'Advanced Driver Training',
      number: 'ADT001',
      issueDate: '2021-06-15',
      expiryDate: '2024-06-15',
      status: 'valid',
      issuingAuthority: 'Advanced Driving Institute',
      notes: 'Advanced defensive driving techniques',
    },
    {
      id: '5',
      type: 'certification',
      name: 'Dangerous Goods Transportation',
      number: 'DGT001',
      issueDate: '2022-03-20',
      expiryDate: '2027-03-20',
      status: 'valid',
      issuingAuthority: 'Transport Safety Authority',
      notes: 'Certified to transport dangerous goods',
    },
  ]);

  // Mock data for performance records
  const [performanceRecords] = useState<PerformanceRecord[]>([
    {
      id: '1',
      date: '2024-01-15',
      type: 'job_completion',
      score: 95,
      maxScore: 100,
      description: 'On-time delivery performance',
      evaluator: 'Fleet Manager',
      notes: 'Excellent punctuality and customer service',
    },
    {
      id: '2',
      date: '2024-01-10',
      type: 'safety_assessment',
      score: 92,
      maxScore: 100,
      description: 'Quarterly safety assessment',
      evaluator: 'Safety Officer',
      notes: 'Good safety practices, minor improvements needed',
    },
    {
      id: '3',
      date: '2023-12-20',
      type: 'customer_feedback',
      score: 98,
      maxScore: 100,
      description: 'Customer satisfaction survey',
      evaluator: 'Customer Service',
      notes: 'Highly rated by customers for professionalism',
    },
    {
      id: '4',
      date: '2023-12-15',
      type: 'training_completion',
      score: 100,
      maxScore: 100,
      description: 'Annual refresher training',
      evaluator: 'Training Coordinator',
      notes: 'Completed all required training modules',
    },
  ]);

  // Mock data for safety records
  const [safetyRecords] = useState<SafetyRecord[]>([
    {
      id: '1',
      date: '2024-01-05',
      type: 'inspection',
      severity: 'low',
      description: 'Routine vehicle inspection',
      location: 'Depot',
      vehicleInvolved: driver.currentVehicle,
      outcome: 'Passed inspection with minor recommendations',
      investigator: 'Vehicle Inspector',
      notes: 'Vehicle in good condition, minor maintenance recommended',
    },
    {
      id: '2',
      date: '2023-12-10',
      type: 'training',
      severity: 'low',
      description: 'Winter driving safety training',
      location: 'Training Center',
      outcome: 'Successfully completed training',
      investigator: 'Safety Trainer',
      notes: 'Excellent participation and understanding of winter driving hazards',
    },
    {
      id: '3',
      date: '2023-11-25',
      type: 'award',
      severity: 'low',
      description: 'Safety Excellence Award',
      location: 'Company Meeting',
      outcome: 'Received recognition for outstanding safety record',
      investigator: 'Safety Committee',
      notes: '12 months without any safety incidents',
    },
    {
      id: '4',
      date: '2023-10-15',
      type: 'incident',
      severity: 'medium',
      description: 'Minor traffic violation',
      location: 'M25 Motorway',
      vehicleInvolved: driver.currentVehicle,
      outcome: 'Warning issued, additional training completed',
      investigator: 'Traffic Officer',
      notes: 'Speed limit violation, driver completed speed awareness course',
    },
  ]);

  const getQualificationStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'success';
      case 'expiring_soon':
        return 'warning';
      case 'expired':
        return 'error';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  const getQualificationStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle />;
      case 'expiring_soon':
        return <Warning />;
      case 'expired':
        return <ErrorIcon />;
      case 'suspended':
        return <ErrorIcon />;
      default:
        return <Circle />;
    }
  };

  const getPerformanceColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'info';
    if (percentage >= 70) return 'warning';
    return 'error';
  };

  const getSafetySeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSafetyTypeIcon = (type: string) => {
    switch (type) {
      case 'incident':
        return <ErrorIcon />;
      case 'violation':
        return <Warning />;
      case 'inspection':
        return <Assessment />;
      case 'training':
        return <School />;
      case 'award':
        return <CheckCircle />;
      default:
        return <Circle />;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ py: 2, px: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onBack} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            {driver.firstName.charAt(0)}{driver.lastName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4">
              {driver.firstName} {driver.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Employee #{driver.employeeNumber} • {driver.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Driver Summary Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  {driver.totalHours.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Hours
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  {driver.totalMiles.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Miles
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  {driver.performanceRating}/5
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Performance Rating
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  {driver.safetyScore}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Safety Score
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
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
          <Tab label="Qualifications" icon={<School />} />
          <Tab label="Performance" icon={<TrendingUp />} />
          <Tab label="Safety Records" icon={<Security />} />
        </Tabs>
      </Box>

      {/* Qualifications Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    <School sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Driver Qualifications
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    size="small"
                  >
                    Export Qualifications
                  </Button>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Qualification</TableCell>
                        <TableCell>Number</TableCell>
                        <TableCell>Issue Date</TableCell>
                        <TableCell>Expiry Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Issuing Authority</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {qualifications.map((qual) => (
                        <TableRow key={qual.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {qual.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {qual.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Typography>
                          </TableCell>
                          <TableCell>{qual.number}</TableCell>
                          <TableCell>{new Date(qual.issueDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(qual.expiryDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Chip
                              icon={getQualificationStatusIcon(qual.status)}
                              label={qual.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              color={getQualificationStatusColor(qual.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{qual.issuingAuthority}</TableCell>
                          <TableCell>
                            <IconButton size="small" color="primary">
                              <Edit />
                            </IconButton>
                            <IconButton size="small" color="info">
                              <Download />
                            </IconButton>
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

      {/* Performance Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Performance Records
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Assessment />}
                    size="small"
                  >
                    Performance Report
                  </Button>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Score</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Evaluator</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {performanceRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Chip
                              label={record.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              size="small"
                              color="primary"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${record.score}/${record.maxScore}`}
                              color={getPerformanceColor(record.score, record.maxScore) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{record.description}</TableCell>
                          <TableCell>{record.evaluator}</TableCell>
                          <TableCell>
                            <IconButton size="small" color="primary">
                              <Edit />
                            </IconButton>
                            <IconButton size="small" color="info">
                              <Visibility />
                            </IconButton>
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
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Safety Records
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    size="small"
                  >
                    Safety Report
                  </Button>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Severity</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Outcome</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {safetyRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getSafetyTypeIcon(record.type)}
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {record.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={record.severity.charAt(0).toUpperCase() + record.severity.slice(1)}
                              color={getSafetySeverityColor(record.severity) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{record.description}</TableCell>
                          <TableCell>{record.location}</TableCell>
                          <TableCell>{record.outcome}</TableCell>
                          <TableCell>
                            <IconButton size="small" color="primary">
                              <Edit />
                            </IconButton>
                            <IconButton size="small" color="info">
                              <Visibility />
                            </IconButton>
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
    </Box>
  );
};

export default DriverDetails;
