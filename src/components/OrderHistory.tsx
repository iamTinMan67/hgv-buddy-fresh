import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { JobAssignment, JobStatus, JobPriority } from '../store/slices/jobSlice';
import { DeliveryAddress } from '../store/slices/deliveryAddressesSlice';

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
      id={`order-history-tabpanel-${index}`}
      aria-labelledby={`order-history-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface OrderHistoryProps {
  onViewOrder?: (order: JobAssignment) => void;
  onEditOrder?: (order: JobAssignment) => void;
  onDeleteOrder?: (orderId: string) => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({
  onViewOrder,
  onEditOrder,
  onDeleteOrder
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all' as JobStatus | 'all',
    priority: 'all' as JobPriority | 'all',
    dateRange: 'all' as 'all' | 'today' | 'week' | 'month' | 'custom',
    startDate: '',
    endDate: '',
    customerName: '',
    assignedDriver: ''
  });

  // Mock data for demonstration - in real app this would come from the store
  const mockOrders: JobAssignment[] = [
    {
      id: '1',
      jobNumber: 'JOB-001',
      title: 'Warehouse to Distribution Center',
      description: 'Transport of pallets from main warehouse to distribution center',
      customerName: 'ABC Transport Ltd',
      customerPhone: '020 7123 4567',
      customerEmail: 'orders@abctransport.com',
      priority: 'high',
      status: 'completed',
      assignedDriver: 'John Driver',
      assignedVehicle: 'HGV-001',
      scheduledDate: '2024-01-15',
      scheduledTime: '09:00',
      estimatedDuration: 120,
      actualStartTime: '2024-01-15T09:15:00Z',
      actualEndTime: '2024-01-15T11:30:00Z',
      pickupLocation: {
        id: 'pickup-1',
        name: 'Main Warehouse',
        address: {
          line1: '123 Industrial Estate',
          line2: 'Unit 15',
          town: 'Manchester',
          city: 'Manchester',
          postcode: 'M1 1AA'
        }
      },
      deliveryLocation: {
        id: 'delivery-1',
        name: 'Distribution Center',
        address: {
          line1: '456 Logistics Park',
          line2: 'Building B',
          town: 'Birmingham',
          city: 'Birmingham',
          postcode: 'B1 1BB'
        }
      },
      useDifferentDeliveryAddress: false,
      cargoType: 'Pallets',
      cargoWeight: 2000,
      specialRequirements: 'Fragile items, handle with care',
      notes: 'Delivered on time, customer satisfied',
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-15T11:30:00Z',
      createdBy: 'admin',
      authorizedBy: 'manager',
      loadDimensions: {
        length: 200,
        width: 120,
        height: 150,
        weight: 2000,
        volume: 3.6,
        isOversized: false,
        isProtruding: false,
        isBalanced: true,
        isFragile: true
      }
    },
    {
      id: '2',
      jobNumber: 'JOB-002',
      title: 'Retail Store Delivery',
      description: 'Delivery of goods to retail store chain',
      customerName: 'Retail Chain Ltd',
      customerPhone: '020 7123 4568',
      customerEmail: 'deliveries@retailchain.com',
      priority: 'medium',
      status: 'in_progress',
      assignedDriver: 'Sarah Driver',
      assignedVehicle: 'HGV-002',
      scheduledDate: '2024-01-16',
      scheduledTime: '14:00',
      estimatedDuration: 90,
      actualStartTime: '2024-01-16T14:05:00Z',
      pickupLocation: {
        id: 'pickup-2',
        name: 'Distribution Hub',
        address: {
          line1: '789 Logistics Way',
          line2: '',
          town: 'Leeds',
          city: 'Leeds',
          postcode: 'LS1 1CC'
        }
      },
      deliveryLocation: {
        id: 'delivery-2',
        name: 'Retail Store',
        address: {
          line1: '321 High Street',
          line2: '',
          town: 'York',
          city: 'York',
          postcode: 'YO1 1DD'
        }
      },
      useDifferentDeliveryAddress: false,
      cargoType: 'Retail Goods',
      cargoWeight: 1500,
      specialRequirements: 'Temperature controlled',
      notes: 'In transit to delivery location',
      createdAt: '2024-01-12T10:00:00Z',
      updatedAt: '2024-01-16T14:05:00Z',
      createdBy: 'admin',
      authorizedBy: 'manager',
      loadDimensions: {
        length: 180,
        width: 100,
        height: 120,
        weight: 1500,
        volume: 2.16,
        isOversized: false,
        isProtruding: false,
        isBalanced: true,
        isFragile: false
      }
    }
  ];

  const [filteredOrders, setFilteredOrders] = useState<JobAssignment[]>(mockOrders);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyFilters = () => {
    let filtered = mockOrders;

    // Apply search term
    if (filters.searchTerm) {
      filtered = filtered.filter(order =>
        order.jobNumber.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        order.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        order.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(order => order.priority === filters.priority);
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const today = new Date();
      const orderDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filtered = filtered.filter(order => {
            orderDate.setTime(Date.parse(order.scheduledDate));
            return orderDate.toDateString() === today.toDateString();
          });
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(order => {
            orderDate.setTime(Date.parse(order.scheduledDate));
            return orderDate >= weekAgo;
          });
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(order => {
            orderDate.setTime(Date.parse(order.scheduledDate));
            return orderDate >= monthAgo;
          });
          break;
        case 'custom':
          if (filters.startDate && filters.endDate) {
            const startDate = new Date(filters.startDate);
            const endDate = new Date(filters.endDate);
            filtered = filtered.filter(order => {
              orderDate.setTime(Date.parse(order.scheduledDate));
              return orderDate >= startDate && orderDate <= endDate;
            });
          }
          break;
      }
    }

    // Apply customer name filter
    if (filters.customerName) {
      filtered = filtered.filter(order =>
        order.customerName.toLowerCase().includes(filters.customerName.toLowerCase())
      );
    }

    // Apply assigned driver filter
    if (filters.assignedDriver) {
      filtered = filtered.filter(order =>
        order.assignedDriver?.toLowerCase().includes(filters.assignedDriver.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: 'all',
      priority: 'all',
      dateRange: 'all',
      startDate: '',
      endDate: '',
      customerName: '',
      assignedDriver: ''
    });
    setFilteredOrders(mockOrders);
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: JobPriority) => {
    switch (priority) {
      case 'urgent':
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  useEffect(() => {
    applyFilters();
  }, [filters]);

  return (
    <Box sx={{ p: 3, bgcolor: 'black', minHeight: '100vh', color: 'white' }}>
      <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', color: 'white' }}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'white', mb: 3 }}>
            Order History & Tracking
          </Typography>

          {/* Filters Section */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Filters
            </Typography>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Search Orders"
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'grey.400', mr: 1 }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': { color: 'white' },
                    '& .MuiInputLabel-root': { color: 'grey.400' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'grey.400' }}>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                    }}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="assigned">Assigned</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'grey.400' }}>Priority</InputLabel>
                  <Select
                    value={filters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                    }}
                  >
                    <MenuItem value="all">All Priorities</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'grey.400' }}>Date Range</InputLabel>
                  <Select
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                    }}
                  >
                    <MenuItem value="all">All Time</MenuItem>
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="week">This Week</MenuItem>
                    <MenuItem value="month">This Month</MenuItem>
                    <MenuItem value="custom">Custom Range</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={applyFilters}
                    startIcon={<SearchIcon />}
                    sx={{ bgcolor: 'primary.main' }}
                  >
                    Apply Filters
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={clearFilters}
                    startIcon={<ClearIcon />}
                    sx={{ color: 'grey.400', borderColor: 'grey.600' }}
                  >
                    Clear
                  </Button>
                </Box>
              </Grid>
            </Grid>

            {/* Custom Date Range Fields */}
            {filters.dateRange === 'custom' && (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Start Date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': { color: 'white' },
                      '& .MuiInputLabel-root': { color: 'grey.400' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label="End Date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': { color: 'white' },
                      '& .MuiInputLabel-root': { color: 'grey.400' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                    }}
                  />
                </Grid>
              </Grid>
            )}
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'grey.700' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': { color: 'grey.400' },
                '& .Mui-selected': { color: 'white' },
                '& .MuiTabs-indicator': { bgcolor: 'primary.main' }
              }}
            >
              <Tab label="All Orders" />
              <Tab label="Active Orders" />
              <Tab label="Completed Orders" />
              <Tab label="Cancelled Orders" />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <TabPanel value={tabValue} index={0}>
            <OrdersTable 
              orders={filteredOrders}
              onViewOrder={onViewOrder}
              onEditOrder={onEditOrder}
              onDeleteOrder={onDeleteOrder}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <OrdersTable 
              orders={filteredOrders.filter(order => 
                ['pending', 'assigned', 'in_progress'].includes(order.status)
              )}
              onViewOrder={onViewOrder}
              onEditOrder={onEditOrder}
              onDeleteOrder={onDeleteOrder}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <OrdersTable 
              orders={filteredOrders.filter(order => order.status === 'completed')}
              onViewOrder={onViewOrder}
              onEditOrder={onEditOrder}
              onDeleteOrder={onDeleteOrder}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <OrdersTable 
              orders={filteredOrders.filter(order => order.status === 'cancelled')}
              onViewOrder={onViewOrder}
              onEditOrder={onEditOrder}
              onDeleteOrder={onDeleteOrder}
            />
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

// Orders Table Component
interface OrdersTableProps {
  orders: JobAssignment[];
  onViewOrder?: (order: JobAssignment) => void;
  onEditOrder?: (order: JobAssignment) => void;
  onDeleteOrder?: (orderId: string) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  onViewOrder,
  onEditOrder,
  onDeleteOrder
}) => {
  if (orders.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" sx={{ color: 'grey.400' }}>
          No orders found matching the current filters
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Job Number</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Title</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Customer</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Priority</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Scheduled Date</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Driver</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } }}>
              <TableCell sx={{ color: 'white' }}>{order.jobNumber}</TableCell>
              <TableCell sx={{ color: 'white' }}>{order.title}</TableCell>
              <TableCell sx={{ color: 'white' }}>{order.customerName}</TableCell>
              <TableCell>
                <Chip
                  label={order.status.replace('_', ' ')}
                  color={getStatusColor(order.status) as any}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={order.priority}
                  color={getPriorityColor(order.priority) as any}
                  size="small"
                />
              </TableCell>
              <TableCell sx={{ color: 'white' }}>
                {formatDate(order.scheduledDate)} {formatTime(order.scheduledTime)}
              </TableCell>
              <TableCell sx={{ color: 'white' }}>{order.assignedDriver || 'Unassigned'}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {onViewOrder && (
                    <Tooltip title="View Order">
                      <IconButton
                        size="small"
                        onClick={() => onViewOrder(order)}
                        sx={{ color: 'info.main' }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {onEditOrder && (
                    <Tooltip title="Edit Order">
                      <IconButton
                        size="small"
                        onClick={() => onEditOrder(order)}
                        sx={{ color: 'warning.main' }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {onDeleteOrder && (
                    <Tooltip title="Delete Order">
                      <IconButton
                        size="small"
                        onClick={() => onDeleteOrder(order.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Helper functions
const getStatusColor = (status: JobStatus) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'info';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const getPriorityColor = (priority: JobPriority) => {
  switch (priority) {
    case 'urgent':
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB');
};

const formatTime = (timeString: string) => {
  return timeString;
};

export default OrderHistory;
