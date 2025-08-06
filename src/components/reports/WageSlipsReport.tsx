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
} from '@mui/material';
import {
  Receipt,
  FilterList,
  PictureAsPdf,
  TableChart,
  GridOn,
  Home,
  Search,
  Clear,
  TrendingUp,
  AttachMoney,
  Person,
} from '@mui/icons-material';

interface WageSlipsReportProps {
  onClose: () => void;
}

interface WageSlip {
  id: string;
  driverName: string;
  period: string;
  basicHours: number;
  overtimeHours: number;
  basicRate: number;
  overtimeRate: number;
  basicPay: number;
  overtimePay: number;
  totalPay: number;
  tax: number;
  netPay: number;
  status: 'paid' | 'pending' | 'overdue';
}

interface StaffMember {
  id: string;
  name: string;
  role: 'driver' | 'manager' | 'admin' | 'mechanic' | 'dispatcher' | 'accountant' | 'hr' | 'receptionist' | 'cleaner' | 'security';
  type: 'driver' | 'staff';
}

const WageSlipsReport: React.FC<WageSlipsReportProps> = ({ onClose }) => {
  const [filters, setFilters] = useState({
    driverName: '',
    period: '',
    status: '',
    startDate: '',
    endDate: '',
  });

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

  const [wageSlips] = useState<WageSlip[]>([
    {
      id: '1',
      driverName: 'John Smith',
      period: 'Week 1 - Jan 2025',
      basicHours: 40,
      overtimeHours: 8,
      basicRate: 15.50,
      overtimeRate: 23.25,
      basicPay: 620,
      overtimePay: 186,
      totalPay: 806,
      tax: 161.20,
      netPay: 644.80,
      status: 'paid',
    },
    {
      id: '2',
      driverName: 'Mike Johnson',
      period: 'Week 1 - Jan 2025',
      basicHours: 40,
      overtimeHours: 12,
      basicRate: 16.00,
      overtimeRate: 24.00,
      basicPay: 640,
      overtimePay: 288,
      totalPay: 928,
      tax: 185.60,
      netPay: 742.40,
      status: 'pending',
    },
    {
      id: '3',
      driverName: 'Lisa Driver',
      period: 'Week 1 - Jan 2025',
      basicHours: 40,
      overtimeHours: 6,
      basicRate: 15.00,
      overtimeRate: 22.50,
      basicPay: 600,
      overtimePay: 135,
      totalPay: 735,
      tax: 147.00,
      netPay: 588.00,
      status: 'paid',
    },
    {
      id: '4',
      driverName: 'Jane Manager',
      period: 'Week 1 - Jan 2025',
      basicHours: 40,
      overtimeHours: 4,
      basicRate: 18.00,
      overtimeRate: 27.00,
      basicPay: 720,
      overtimePay: 108,
      totalPay: 828,
      tax: 165.60,
      netPay: 662.40,
      status: 'paid',
    },
    {
      id: '5',
      driverName: 'Alice Mechanic',
      period: 'Week 1 - Jan 2025',
      basicHours: 40,
      overtimeHours: 10,
      basicRate: 16.50,
      overtimeRate: 24.75,
      basicPay: 660,
      overtimePay: 247.50,
      totalPay: 907.50,
      tax: 181.50,
      netPay: 726.00,
      status: 'overdue',
    },
    {
      id: '6',
      driverName: 'Sarah Wilson',
      period: 'Week 1 - Jan 2025',
      basicHours: 40,
      overtimeHours: 5,
      basicRate: 15.00,
      overtimeRate: 22.50,
      basicPay: 600,
      overtimePay: 112.50,
      totalPay: 712.50,
      tax: 142.50,
      netPay: 570.00,
      status: 'paid',
    },
    {
      id: '7',
      driverName: 'Tom Admin',
      period: 'Week 1 - Jan 2025',
      basicHours: 40,
      overtimeHours: 3,
      basicRate: 17.00,
      overtimeRate: 25.50,
      basicPay: 680,
      overtimePay: 76.50,
      totalPay: 756.50,
      tax: 151.30,
      netPay: 605.20,
      status: 'paid',
    },
    {
      id: '8',
      driverName: 'Sarah Johnson',
      period: 'Week 1 - Jan 2025',
      basicHours: 40,
      overtimeHours: 7,
      basicRate: 18.50,
      overtimeRate: 27.75,
      basicPay: 740,
      overtimePay: 194.25,
      totalPay: 934.25,
      tax: 186.85,
      netPay: 747.40,
      status: 'pending',
    },
  ]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      driverName: '',
      period: '',
      status: '',
      startDate: '',
      endDate: '',
    });
  };

  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    // Mock export functionality
    console.log(`Exporting wage slips as ${format.toUpperCase()}`);
    alert(`Wage slips exported as ${format.toUpperCase()}`);
  };

  const filteredWageSlips = wageSlips.filter(slip => {
    if (filters.driverName && !slip.driverName.toLowerCase().includes(filters.driverName.toLowerCase())) return false;
    if (filters.period && !slip.period.includes(filters.period)) return false;
    if (filters.status && slip.status !== filters.status) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const totalPay = filteredWageSlips.reduce((sum, slip) => sum + slip.totalPay, 0);
  const totalTax = filteredWageSlips.reduce((sum, slip) => sum + slip.tax, 0);
  const totalNetPay = filteredWageSlips.reduce((sum, slip) => sum + slip.netPay, 0);

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <Receipt sx={{ mr: 1, verticalAlign: 'middle' }} />
          Wage Slips Report
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ color: 'yellow', fontSize: '1.5rem' }}
        >
          <Home />
        </IconButton>
      </Box>

      {/* Filter Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterList sx={{ mr: 1 }} />
            <Typography variant="h6">Filters</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
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
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Period"
                value={filters.period}
                onChange={(e) => handleFilterChange('period', e.target.value)}
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
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
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
          Results ({filteredWageSlips.length} records)
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
              <AttachMoney sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                £{totalPay.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Pay
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                £{totalTax.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Tax
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Person sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                £{totalNetPay.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Net Pay
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
              <TableCell>Driver</TableCell>
              <TableCell>Period</TableCell>
              <TableCell align="right">Basic Hours</TableCell>
              <TableCell align="right">Overtime Hours</TableCell>
              <TableCell align="right">Basic Rate</TableCell>
              <TableCell align="right">Overtime Rate</TableCell>
              <TableCell align="right">Basic Pay</TableCell>
              <TableCell align="right">Overtime Pay</TableCell>
              <TableCell align="right">Total Pay</TableCell>
              <TableCell align="right">Tax</TableCell>
              <TableCell align="right">Net Pay</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredWageSlips.map((slip) => (
              <TableRow key={slip.id}>
                <TableCell>{slip.driverName}</TableCell>
                <TableCell>{slip.period}</TableCell>
                <TableCell align="right">{slip.basicHours}</TableCell>
                <TableCell align="right">{slip.overtimeHours}</TableCell>
                <TableCell align="right">£{slip.basicRate}</TableCell>
                <TableCell align="right">£{slip.overtimeRate}</TableCell>
                <TableCell align="right">£{slip.basicPay}</TableCell>
                <TableCell align="right">£{slip.overtimePay}</TableCell>
                <TableCell align="right">£{slip.totalPay}</TableCell>
                <TableCell align="right">£{slip.tax}</TableCell>
                <TableCell align="right">£{slip.netPay}</TableCell>
                <TableCell>
                  <Chip
                    label={slip.status}
                    color={getStatusColor(slip.status) as any}
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

export default WageSlipsReport;
