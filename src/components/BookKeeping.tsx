import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  AccountBalance,
  Add,
  Visibility,
  CheckCircle,
  ArrowBack,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';

interface BookKeepingProps {
  onClose: () => void;
}

interface BookRecord {
  id: string;
  type: 'income' | 'expense' | 'asset' | 'liability';
  category: string;
  description: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  reference?: string;
  notes?: string;
}

const BookKeeping: React.FC<BookKeepingProps> = ({ onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BookRecord | null>(null);

  // Mock bookkeeping data
  const [bookRecords] = useState<BookRecord[]>([
    {
      id: '1',
      type: 'income',
      category: 'Transport Services',
      description: 'Freight delivery payment',
      amount: 2500.00,
      date: '2024-01-15',
      status: 'completed',
      reference: 'INV-001',
      notes: 'On-time delivery bonus included'
    },
    {
      id: '2',
      type: 'expense',
      category: 'Fuel',
      description: 'Diesel fuel purchase',
      amount: 450.00,
      date: '2024-01-14',
      status: 'completed',
      reference: 'FUEL-001',
      notes: 'Standard fleet refueling'
    },
    {
      id: '3',
      type: 'expense',
      category: 'Maintenance',
      description: 'Vehicle service and repairs',
      amount: 800.00,
      date: '2024-01-13',
      status: 'pending',
      reference: 'MAINT-001',
      notes: 'Scheduled maintenance'
    },
    {
      id: '4',
      type: 'income',
      category: 'Transport Services',
      description: 'Express delivery service',
      amount: 1800.00,
      date: '2024-01-12',
      status: 'completed',
      reference: 'INV-002',
      notes: 'Premium service charge applied'
    },
    {
      id: '5',
      type: 'expense',
      category: 'Insurance',
      description: 'Fleet insurance premium',
      amount: 1200.00,
      date: '2024-01-10',
      status: 'completed',
      reference: 'INS-001',
      notes: 'Quarterly premium payment'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'income': return <TrendingUp color="success" />;
      case 'expense': return <TrendingDown color="error" />;
      case 'asset': return <AccountBalance color="primary" />;
      case 'liability': return <CheckCircle color="warning" />;
      default: return <AccountBalance />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income': return 'success';
      case 'expense': return 'error';
      case 'asset': return 'primary';
      case 'liability': return 'warning';
      default: return 'default';
    }
  };

  const openViewDialog = (record: BookRecord) => {
    setSelectedRecord(record);
  };

  const closeViewDialog = () => {
    setSelectedRecord(null);
  };

  const getTotalIncome = () => {
    return bookRecords
      .filter(record => record.type === 'income' && record.status === 'completed')
      .reduce((sum, record) => sum + record.amount, 0);
  };

  const getTotalExpenses = () => {
    return bookRecords
      .filter(record => record.type === 'expense' && record.status === 'completed')
      .reduce((sum, record) => sum + record.amount, 0);
  };

  const getNetProfit = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  const getPendingAmount = () => {
    return bookRecords
      .filter(record => record.status === 'pending')
      .reduce((sum, record) => sum + record.amount, 0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onClose} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          Book Keeping
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{
            '& .MuiTab-root': {
              minHeight: 48,
              textTransform: 'none',
              fontSize: '1rem',
            }
          }}
        >
          <Tab label="Overview" />
          <Tab label="Income" />
          <Tab label="Expenses" />
          <Tab label="Assets" />
          <Tab label="Liabilities" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      {tabValue === 0 && (
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            {/* Financial Summary */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Financial Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="h6" color="success.main">
                        £{getTotalIncome().toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Income
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6" color="error.main">
                        £{getTotalExpenses().toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Expenses
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6" color={getNetProfit() >= 0 ? 'success.main' : 'error.main'}>
                        £{getNetProfit().toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Net Profit
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6" color="warning.main">
                        £{getPendingAmount().toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pending Amount
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Transactions */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Transactions
                  </Typography>
                  <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {bookRecords.slice(0, 5).map((record) => (
                      <Box key={record.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ mr: 1 }}>
                          {getTypeIcon(record.type)}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2">
                            {record.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {record.date}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color={getTypeColor(record.type) as any}>
                          £{record.amount.toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Income Tab */}
      {tabValue === 1 && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Income Records</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowAddDialog(true)}
            >
              Add Income
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookRecords.filter(record => record.type === 'income').map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.description}</TableCell>
                    <TableCell>{record.category}</TableCell>
                    <TableCell>£{record.amount.toFixed(2)}</TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>
                      <Chip 
                        label={record.status} 
                        color={getStatusColor(record.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => openViewDialog(record)} size="small">
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Expenses Tab */}
      {tabValue === 2 && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Expense Records</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowAddDialog(true)}
            >
              Add Expense
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookRecords.filter(record => record.type === 'expense').map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.description}</TableCell>
                    <TableCell>{record.category}</TableCell>
                    <TableCell>£{record.amount.toFixed(2)}</TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>
                      <Chip 
                        label={record.status} 
                        color={getStatusColor(record.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => openViewDialog(record)} size="small">
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Assets Tab */}
      {tabValue === 3 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>Assets</Typography>
          <Typography variant="body2" color="text.secondary">
            Asset management functionality would be implemented here.
          </Typography>
        </Box>
      )}

      {/* Liabilities Tab */}
      {tabValue === 4 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>Liabilities</Typography>
          <Typography variant="body2" color="text.secondary">
            Liability management functionality would be implemented here.
          </Typography>
        </Box>
      )}

      {/* Add Record Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Book Record</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Add new book record functionality would go here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button variant="contained">Add Record</Button>
        </DialogActions>
      </Dialog>

      {/* View Record Dialog */}
      <Dialog open={!!selectedRecord} onClose={closeViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>Record Details</DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedRecord.description}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Category: {selectedRecord.category}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Amount: £{selectedRecord.amount.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Date: {selectedRecord.date}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Status: {selectedRecord.status}
              </Typography>
              {selectedRecord.reference && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Reference: {selectedRecord.reference}
                </Typography>
              )}
              {selectedRecord.notes && (
                <Typography variant="body2" color="text.secondary">
                  Notes: {selectedRecord.notes}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookKeeping; 