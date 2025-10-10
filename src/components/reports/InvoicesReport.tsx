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
  Description,
  FilterList,
  PictureAsPdf,
  TableChart,
  GridOn,
  Home,
  Search,
  Clear,
  AttachMoney,
  Payment,
  Business,
  LocationOn,
  Phone,
  Email,
  Language,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface InvoicesReportProps {
  onClose: () => void;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  outstandingAmount: number;
  jobReference: string;
  driverName: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: 'driver' | 'manager' | 'admin' | 'mechanic' | 'dispatcher' | 'accountant' | 'hr' | 'receptionist' | 'cleaner' | 'security';
  type: 'driver' | 'staff';
}

const InvoicesReport: React.FC<InvoicesReportProps> = ({ onClose }) => {
  const [filters, setFilters] = useState({
    invoiceNumber: '',
    customerName: '',
    status: '',
    driverName: '',
    jobReference: '',
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

  const [invoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-2025-001',
      customerName: 'ABC Logistics Ltd',
      issueDate: '2025-01-10',
      dueDate: '2025-01-24',
      status: 'paid',
      subtotal: 1200.00,
      tax: 240.00,
      total: 1440.00,
      paidAmount: 1440.00,
      outstandingAmount: 0.00,
      jobReference: 'JOB-001',
      driverName: 'John Smith',
    },
    {
      id: '2',
      invoiceNumber: 'INV-2025-002',
      customerName: 'XYZ Transport',
      issueDate: '2025-01-12',
      dueDate: '2025-01-26',
      status: 'sent',
      subtotal: 850.00,
      tax: 170.00,
      total: 1020.00,
      paidAmount: 0.00,
      outstandingAmount: 1020.00,
      jobReference: 'JOB-002',
      driverName: 'Mike Johnson',
    },
    {
      id: '3',
      invoiceNumber: 'INV-2025-003',
      customerName: 'Fast Freight Co',
      issueDate: '2025-01-08',
      dueDate: '2025-01-22',
      status: 'overdue',
      subtotal: 1500.00,
      tax: 300.00,
      total: 1800.00,
      paidAmount: 0.00,
      outstandingAmount: 1800.00,
      jobReference: 'JOB-003',
      driverName: 'Sarah Wilson',
    },
  ]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      invoiceNumber: '',
      customerName: '',
      status: '',
      driverName: '',
      jobReference: '',
      startDate: '',
      endDate: '',
    });
  };

  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    // Mock export functionality
    console.log(`Exporting invoices as ${format.toUpperCase()}`);
    alert(`Invoices exported as ${format.toUpperCase()}`);
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (filters.invoiceNumber && !invoice.invoiceNumber.toLowerCase().includes(filters.invoiceNumber.toLowerCase())) return false;
    if (filters.customerName && !invoice.customerName.toLowerCase().includes(filters.customerName.toLowerCase())) return false;
    if (filters.status && invoice.status !== filters.status) return false;
    if (filters.driverName && !invoice.driverName.toLowerCase().includes(filters.driverName.toLowerCase())) return false;
    if (filters.jobReference && !invoice.jobReference.toLowerCase().includes(filters.jobReference.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'sent': return 'info';
      case 'draft': return 'default';
      case 'overdue': return 'error';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const totalInvoiced = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const totalPaid = filteredInvoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
  const totalOutstanding = filteredInvoices.reduce((sum, invoice) => sum + invoice.outstandingAmount, 0);

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mr: 2 }}>
          <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
          Invoices Report
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
                    Invoices Report
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
                label="Invoice Number"
                value={filters.invoiceNumber}
                onChange={(e) => handleFilterChange('invoiceNumber', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Customer Name"
                value={filters.customerName}
                onChange={(e) => handleFilterChange('customerName', e.target.value)}
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
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Staff Name</InputLabel>
                <Select
                  value={filters.driverName}
                  label="Staff Name"
                  onChange={(e) => handleFilterChange('driverName', e.target.value)}
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
                label="Job Reference"
                value={filters.jobReference}
                onChange={(e) => handleFilterChange('jobReference', e.target.value)}
                size="small"
              />
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
          Results ({filteredInvoices.length} records)
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
              <Description sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                £{totalInvoiced.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Invoiced
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Payment sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                £{totalPaid.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Paid
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                £{totalOutstanding.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Outstanding
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
              <TableCell>Invoice Number</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Issue Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Job Reference</TableCell>
              <TableCell>Driver</TableCell>
              <TableCell align="right">Subtotal</TableCell>
              <TableCell align="right">Tax</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Paid</TableCell>
              <TableCell align="right">Outstanding</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.customerName}</TableCell>
                <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>{invoice.jobReference}</TableCell>
                <TableCell>{invoice.driverName}</TableCell>
                <TableCell align="right">£{invoice.subtotal}</TableCell>
                <TableCell align="right">£{invoice.tax}</TableCell>
                <TableCell align="right">£{invoice.total}</TableCell>
                <TableCell align="right">£{invoice.paidAmount}</TableCell>
                <TableCell align="right">£{invoice.outstandingAmount}</TableCell>
                <TableCell>
                  <Chip
                    label={invoice.status}
                    color={getStatusColor(invoice.status) as any}
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

export default InvoicesReport;
