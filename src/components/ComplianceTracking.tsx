import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Home,
  Person,
  Description,
  Security,
  CheckCircle,
  Warning,
  Error,
  Circle,
  LocalShipping,
  Assignment,
  Visibility,
} from '@mui/icons-material';
import {
  Tooltip,
} from '@mui/material';

interface ComplianceTrackingProps {
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
      id={`compliance-tabpanel-${index}`}
      aria-labelledby={`compliance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface ComplianceItem {
  id: string;
  type: 'driver' | 'vehicle' | 'document' | 'safety';
  category: string;
  title: string;
  description: string;
  status: 'compliant' | 'warning' | 'non-compliant' | 'expired';
  dueDate?: string;
  expiryDate?: string;
  lastChecked: string;
  responsible: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
}

const ComplianceTracking: React.FC<ComplianceTrackingProps> = ({ onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Mock compliance data
  const [complianceItems] = useState<ComplianceItem[]>([
    {
      id: '1',
      type: 'driver',
      category: 'Driver Hours',
      title: 'Adam Mustafa - Weekly Hours',
      description: 'Driver hours compliance for week ending 2024-01-21',
      status: 'compliant',
      lastChecked: '2024-01-21',
      responsible: 'Adam Mustafa',
      priority: 'medium',
    },
    {
      id: '2',
      type: 'vehicle',
      category: 'MOT Compliance',
      title: 'HGV001 - MOT Certificate',
      description: 'MOT certificate for Mercedes-Benz Actros',
      status: 'warning',
      dueDate: '2024-07-15',
      expiryDate: '2024-07-15',
      lastChecked: '2024-01-15',
      responsible: 'Fleet Manager',
      priority: 'high',
      notes: 'MOT due in 6 months - schedule reminder',
    },
    {
      id: '3',
      type: 'document',
      category: 'Tachograph Records',
      title: 'Tachograph Downloads',
      description: 'Monthly tachograph data downloads',
      status: 'non-compliant',
      dueDate: '2024-01-31',
      lastChecked: '2024-01-15',
      responsible: 'Transport Manager',
      priority: 'critical',
      notes: 'Overdue - must download by end of month',
    },
    {
      id: '4',
      type: 'safety',
      category: 'Defect Reports',
      title: 'Critical Defect Reports',
      description: 'Review of critical vehicle defect reports',
      status: 'warning',
      lastChecked: '2024-01-20',
      responsible: 'Safety Manager',
      priority: 'high',
      notes: '2 critical defects pending review',
    },
    {
      id: '5',
      type: 'driver',
      category: 'CPC Cards',
      title: 'Jane Manager - CPC Card',
      description: 'Driver CPC qualification card',
      status: 'expired',
      expiryDate: '2023-12-31',
      lastChecked: '2024-01-01',
      responsible: 'Jane Manager',
      priority: 'critical',
      notes: 'CPC card expired - immediate action required',
    },
    {
      id: '6',
      type: 'vehicle',
      category: 'Service Compliance',
      title: 'HGV002 - Service Schedule',
      description: 'Routine service compliance for Volvo FH16',
      status: 'compliant',
      lastChecked: '2024-01-20',
      responsible: 'Service Team',
      priority: 'medium',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'success';
      case 'warning':
        return 'warning';
      case 'non-compliant':
        return 'error';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle />;
      case 'warning':
        return <Warning />;
      case 'non-compliant':
      case 'expired':
        return <Error />;
      default:
        return <Circle />;
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'driver':
        return <Person />;
      case 'vehicle':
        return <LocalShipping />;
      case 'document':
        return <Description />;
      case 'safety':
        return <Security />;
      default:
        return <Assignment />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'driver':
        return 'primary';
      case 'vehicle':
        return 'secondary';
      case 'document':
        return 'info';
      case 'safety':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Calculate compliance statistics
  const totalItems = complianceItems.length;
  const compliantItems = complianceItems.filter(item => item.status === 'compliant').length;
  const warningItems = complianceItems.filter(item => item.status === 'warning').length;
  const nonCompliantItems = complianceItems.filter(item => item.status === 'non-compliant' || item.status === 'expired').length;
  const criticalItems = complianceItems.filter(item => item.priority === 'critical').length;

  const complianceRate = Math.round((compliantItems / totalItems) * 100);

  const criticalItemsList = complianceItems.filter(item => item.priority === 'critical');
  const expiringItems = complianceItems.filter(item => 
    item.dueDate && new Date(item.dueDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  return (
    <Box sx={{ py: 2, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Compliance Tracking
        </Typography>
        <Box>
          <Button
            startIcon={<Add />}
            variant="contained"
            onClick={() => setShowAddDialog(true)}
            sx={{ mr: 2 }}
          >
            Add Compliance Item
          </Button>
          <IconButton
            onClick={onClose}
            sx={{ color: 'yellow', fontSize: '1.5rem' }}
          >
            <Home />
          </IconButton>
        </Box>
      </Box>

      {/* Compliance Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {complianceRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Compliance Rate
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={complianceRate} 
                sx={{ mt: 1 }}
                color={complianceRate >= 90 ? 'success' : complianceRate >= 70 ? 'warning' : 'error'}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {compliantItems}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Compliant
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {warningItems}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Warnings
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {nonCompliantItems}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Non-Compliant
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {criticalItems}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Critical Issues
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {expiringItems.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expiring Soon
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Critical Alerts */}
      {criticalItemsList.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Critical Alert:</strong> {criticalItemsList.length} critical compliance issues require immediate attention!
          </Typography>
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
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
          <Tab label="All Compliance" />
          <Tab label="Driver Compliance" />
          <Tab label="Vehicle Compliance" />
          <Tab label="Documentation" />
          <Tab label="Safety & Incidents" />
        </Tabs>
      </Box>

      {/* All Compliance Tab */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Responsible</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {complianceItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Chip
                      icon={getTypeIcon(item.type)}
                      label={item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      color={getTypeColor(item.type) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(item.status)}
                      label={item.status}
                      color={getStatusColor(item.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.priority}
                      color={getPriorityColor(item.priority) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {item.dueDate ? (
                      <Typography variant="body2">
                        {new Date(item.dueDate).toLocaleDateString()}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{item.responsible}</TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton size="small" color="info">
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary">
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

      {/* Driver Compliance Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Driver Hours Compliance
                </Typography>
                <List>
                  {complianceItems
                    .filter(item => item.type === 'driver' && item.category === 'Driver Hours')
                    .map(item => (
                      <ListItem key={item.id}>
                        <ListItemIcon>
                          {getStatusIcon(item.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.title}
                          secondary={`Status: ${item.status} • Last checked: ${item.lastChecked}`}
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
                  Driver Qualifications
                </Typography>
                <List>
                  {complianceItems
                    .filter(item => item.type === 'driver' && item.category === 'CPC Cards')
                    .map(item => (
                      <ListItem key={item.id}>
                        <ListItemIcon>
                          {getStatusIcon(item.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.title}
                          secondary={`Expires: ${item.expiryDate} • Priority: ${item.priority}`}
                        />
                      </ListItem>
                    ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Vehicle Compliance Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  MOT Compliance
                </Typography>
                <List>
                  {complianceItems
                    .filter(item => item.type === 'vehicle' && item.category === 'MOT Compliance')
                    .map(item => (
                      <ListItem key={item.id}>
                        <ListItemIcon>
                          {getStatusIcon(item.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.title}
                          secondary={`Due: ${item.dueDate} • Status: ${item.status}`}
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
                  Service Compliance
                </Typography>
                <List>
                  {complianceItems
                    .filter(item => item.type === 'vehicle' && item.category === 'Service Compliance')
                    .map(item => (
                      <ListItem key={item.id}>
                        <ListItemIcon>
                          {getStatusIcon(item.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.title}
                          secondary={`Last checked: ${item.lastChecked} • Status: ${item.status}`}
                        />
                      </ListItem>
                    ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Documentation Tab */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Required Documentation
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Document Type</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Responsible</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {complianceItems
                        .filter(item => item.type === 'document')
                        .map(item => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {item.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.description}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={getStatusIcon(item.status)}
                                label={item.status}
                                color={getStatusColor(item.status) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell>{item.responsible}</TableCell>
                            <TableCell>
                              <IconButton size="small" color="primary">
                                <Edit />
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

      {/* Safety & Incidents Tab */}
      <TabPanel value={tabValue} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Safety Incidents
                </Typography>
                <List>
                  {complianceItems
                    .filter(item => item.type === 'safety')
                    .map(item => (
                      <ListItem key={item.id}>
                        <ListItemIcon>
                          {getStatusIcon(item.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.title}
                          secondary={`Priority: ${item.priority} • ${item.notes}`}
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
                    Critical Issues: {criticalItemsList.length}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Pending Reviews: {complianceItems.filter(item => item.status === 'warning').length}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Resolved This Month: 0
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Add Compliance Item Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Compliance Item</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select label="Type">
                  <MenuItem value="driver">Driver</MenuItem>
                  <MenuItem value="vehicle">Vehicle</MenuItem>
                  <MenuItem value="document">Document</MenuItem>
                  <MenuItem value="safety">Safety</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Category" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Title" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={2} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select label="Status">
                  <MenuItem value="compliant">Compliant</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="non-compliant">Non-Compliant</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select label="Priority">
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Due Date" type="date" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Responsible Person" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Notes" multiline rows={3} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained">
            Add Item
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComplianceTracking; 