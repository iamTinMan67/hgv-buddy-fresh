import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Divider,
} from '@mui/material';
import {
  ShoppingCart,
  FilterList,
  PictureAsPdf,
  TableChart,
  GridOn,
  Home,
  Search,
  Clear,
  TrendingUp,
  AttachMoney,
  Business,
  LocationOn,
  Phone,
  Email,
  Language,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface PurchaseOrdersReportProps {
  onClose: () => void;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  orderDate: string;
  deliveryDate: string;
  status: 'pending' | 'approved' | 'delivered' | 'cancelled';
  totalAmount: number;
  items: number;
  requestedBy: string;
  approvedBy: string;
  category: 'parts' | 'supplies' | 'equipment' | 'services';
}

interface StaffMember {
  id: string;
  name: string;
  role: 'driver' | 'manager' | 'admin' | 'mechanic' | 'dispatcher' | 'accountant' | 'hr' | 'receptionist' | 'cleaner' | 'security';
  type: 'driver' | 'staff';
}

const PurchaseOrdersReport: React.FC<PurchaseOrdersReportProps> = ({ onClose }) => {
  const [filters, setFilters] = useState({
    orderNumber: '',
    supplier: '',
    status: '',
    category: '',
    requestedBy: '',
    startDate: '',
    endDate: '',
  });
  
  // Get company data from Redux store
  const companyData = useSelector((state: RootState) => state.company?.data);

  // Combined staff and driver data for dropdown
  const [staffMembers] = useState<StaffMember[]>([
    // Drivers
    { id: '1', name: 'John Smith', role: 'driver', type: 'driver' },
    { id: '2', name: 'Mike Johnson', role: 'driver', type: 'driver' },
    { id: '3', name: 'Lisa Driver', role: 'driver', type: 'driver' },
    { id: '4', name: 'Tom Wilson', role: 'driver', type: 'driver' },
    { id: '5', name: 'Sarah Brown', role: 'driver', type: 'driver' },
    // Staff
    { id: '6', name: 'Jane Manager', role: 'manager', type: 'staff' },
    { id: '7', name: 'Bob Manager', role: 'manager', type: 'staff' },
    { id: '8', name: 'Alice Mechanic', role: 'mechanic', type: 'staff' },
    { id: '9', name: 'Mike Mechanic', role: 'mechanic', type: 'staff' },
    { id: '10', name: 'Sarah Dispatcher', role: 'dispatcher', type: 'staff' },
    { id: '11', name: 'Tom Admin', role: 'admin', type: 'staff' },
    { id: '12', name: 'Sarah Johnson', role: 'manager', type: 'staff' },
    { id: '13', name: 'David Accountant', role: 'accountant', type: 'staff' },
    { id: '14', name: 'Emma HR', role: 'hr', type: 'staff' },
    { id: '15', name: 'Frank Receptionist', role: 'receptionist', type: 'staff' },
  ]);

  const [purchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: '1',
      orderNumber: 'PO-2025-001',
      supplier: 'ABC Parts Ltd',
      orderDate: '2025-01-10',
      deliveryDate: '2025-01-15',
      status: 'delivered',
      totalAmount: 1250.00,
      items: 5,
      requestedBy: 'John Smith',
      approvedBy: 'Mike Johnson',
      category: 'parts',
    },
    {
      id: '2',
      orderNumber: 'PO-2025-002',
      supplier: 'XYZ Supplies',
      orderDate: '2025-01-12',
      deliveryDate: '2025-01-18',
      status: 'approved',
      totalAmount: 850.50,
      items: 3,
      requestedBy: 'Sarah Wilson',
      approvedBy: 'Mike Johnson',
      category: 'supplies',
    },
    {
      id: '3',
      orderNumber: 'PO-2025-003',
      supplier: 'Equipment Co',
      orderDate: '2025-01-14',
      deliveryDate: '2025-01-20',
      status: 'pending',
      totalAmount: 2200.00,
      items: 2,
      requestedBy: 'John Smith',
      approvedBy: '',
      category: 'equipment',
    },
  ]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      orderNumber: '',
      supplier: '',
      status: '',
      category: '',
      requestedBy: '',
      startDate: '',
      endDate: '',
    });
  };

  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    // Mock export functionality
    console.log(`Exporting purchase orders as ${format.toUpperCase()}`);
    alert(`Purchase orders exported as ${format.toUpperCase()}`);
  };

  const filteredPurchaseOrders = purchaseOrders.filter(order => {
    if (filters.orderNumber && !order.orderNumber.toLowerCase().includes(filters.orderNumber.toLowerCase())) return false;
    if (filters.supplier && !order.supplier.toLowerCase().includes(filters.supplier.toLowerCase())) return false;
    if (filters.status && order.status !== filters.status) return false;
    if (filters.category && order.category !== filters.category) return false;
    if (filters.requestedBy && !order.requestedBy.toLowerCase().includes(filters.requestedBy.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'approved': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'parts': return 'primary';
      case 'supplies': return 'secondary';
      case 'equipment': return 'warning';
      case 'services': return 'success';
      default: return 'default';
    }
  };

  const totalAmount = filteredPurchaseOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = filteredPurchaseOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mr: 2 }}>
          <ShoppingCart sx={{ mr: 1, verticalAlign: 'middle' }} />
          Purchase Orders Report
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'yellow', fontSize: '1.5rem' }}>
          <Home />
        </IconButton>
      </Box>

      {/* Company Information Header */}
      {companyData && (
        <Card sx={{ mb: 3, bgcolor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={2}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Avatar
                    src={companyData.logo || undefined}
                    sx={{ 
                      width: 80, 
                      height: 80,
                      bgcolor: 'primary.main',
                      fontSize: '2rem'
                    }}
                  >
                    {!companyData.logo && <Business />}
                  </Avatar>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {companyData.name || 'Your Company Name'}
                </Typography>
                {companyData.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {companyData.description}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {companyData.address.line1 && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
                      <Typography variant="body2">
                        {companyData.address.line1}
                        {companyData.address.city && `, ${companyData.address.city}`}
                        {companyData.address.postcode && ` ${companyData.address.postcode}`}
                      </Typography>
                    </Box>
                  )}
                  {companyData.contact.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Phone sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
                      <Typography variant="body2">{companyData.contact.phone}</Typography>
                    </Box>
                  )}
                  {companyData.contact.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Email sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
                      <Typography variant="body2">{companyData.contact.email}</Typography>
                    </Box>
                  )}
                  {companyData.contact.website && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Language sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
                      <Typography variant="body2">{companyData.contact.website}</Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    Purchase Orders Report
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Generated on {new Date().toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Filter Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterList sx={{ mr: 1 }} />
            <Typography variant="h6">Filters</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Order Number"
                value={filters.orderNumber}
                onChange={(e) => handleFilterChange('orderNumber', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Supplier"
                value={filters.supplier}
                onChange={(e) => handleFilterChange('supplier', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  label="Category"
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="parts">Parts</MenuItem>
                  <MenuItem value="supplies">Supplies</MenuItem>
                  <MenuItem value="equipment">Equipment</MenuItem>
                  <MenuItem value="services">Services</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Staff Name</InputLabel>
                <Select
                  value={filters.requestedBy}
                  label="Staff Name"
                  onChange={(e) => handleFilterChange('requestedBy', e.target.value)}
                >
                  <MenuItem value="">All Staff & Drivers</MenuItem>
                  <MenuItem value="drivers" disabled>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      Drivers
                    </Typography>
                  </MenuItem>
                  {staffMembers.filter(member => member.type === 'driver').map((member) => (
                    <MenuItem key={member.id} value={member.name} sx={{ pl: 3 }}>
                      {member.name} - Driver
                    </MenuItem>
                  ))}
                  <MenuItem value="staff" disabled>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                      Staff
                    </Typography>
                  </MenuItem>
                  {staffMembers.filter(member => member.type === 'staff').map((member) => (
                    <MenuItem key={member.id} value={member.name} sx={{ pl: 3 }}>
                      {member.name} - {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<Search />}
              size="small"
            >
              Apply Filters
            </Button>
            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={handleClearFilters}
              size="small"
            >
              Clear
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Results ({filteredPurchaseOrders.length} records)
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<PictureAsPdf />}
            onClick={() => handleExport('pdf')}
            sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
          >
            PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<TableChart />}
            onClick={() => handleExport('csv')}
            sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
          >
            CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<GridOn />}
            onClick={() => handleExport('excel')}
            sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
          >
            Excel
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ShoppingCart sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {totalOrders}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Orders
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                £{totalAmount.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Value
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                £{averageOrderValue.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Order Value
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Results Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order Number</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Order Date</TableCell>
              <TableCell>Delivery Date</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Items</TableCell>
              <TableCell align="right">Total Amount</TableCell>
              <TableCell>Requested By</TableCell>
              <TableCell>Approved By</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPurchaseOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{order.supplier}</TableCell>
                <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(order.deliveryDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    label={order.category}
                    color={getCategoryColor(order.category) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">{order.items}</TableCell>
                <TableCell align="right">£{order.totalAmount}</TableCell>
                <TableCell>{order.requestedBy}</TableCell>
                <TableCell>{order.approvedBy || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={getStatusColor(order.status) as any}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PurchaseOrdersReport;
