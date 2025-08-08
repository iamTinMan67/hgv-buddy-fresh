import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  AccountBalance,
  Receipt,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Add,
  Download,
  Print,
  Warning,
  ArrowBack,
  Book,
} from '@mui/icons-material';

import BookKeeping from './BookKeeping';

interface AccountingHubProps {
  onClose: () => void;
}

interface AccountingRecord {
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

const AccountingHub: React.FC<AccountingHubProps> = ({ onClose }) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AccountingRecord | null>(null);
  const [showBookKeeping, setShowBookKeeping] = useState(false);

  // Mock accounting data
  const [accountingRecords] = useState<AccountingRecord[]>([
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'income': return <TrendingUp color="success" />;
      case 'expense': return <TrendingDown color="error" />;
      case 'asset': return <AccountBalance color="primary" />;
      case 'liability': return <Warning color="warning" />;
      default: return <Receipt />;
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

  const closeViewDialog = () => {
    setSelectedRecord(null);
  };

  const getTotalIncome = () => {
    return accountingRecords
      .filter(record => record.type === 'income' && record.status === 'completed')
      .reduce((sum, record) => sum + record.amount, 0);
  };

  const getTotalExpenses = () => {
    return accountingRecords
      .filter(record => record.type === 'expense' && record.status === 'completed')
      .reduce((sum, record) => sum + record.amount, 0);
  };

  const getNetProfit = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  const getPendingAmount = () => {
    return accountingRecords
      .filter(record => record.status === 'pending')
      .reduce((sum, record) => sum + record.amount, 0);
  };

  // Main Accounting Hub
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onClose} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          Accounting Hub
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Financial Overview Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ transform: 'scale(0.6)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h6" component="div">
                    Financial Overview
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Current financial status
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
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

        {/* Recent Transactions Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ transform: 'scale(0.6)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <Receipt />
                </Avatar>
                <Box>
                  <Typography variant="h6" component="div">
                    Recent Transactions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Latest accounting records
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                {accountingRecords.slice(0, 5).map((record) => (
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

        {/* Records Management Card */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              transform: 'scale(0.6)',
              '&:hover': {
                transform: 'translateY(-4px) scale(0.6)',
                boxShadow: 4,
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Receipt />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Records
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage accounting records
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<TrendingUp />} 
                  label="Income" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<TrendingDown />} 
                  label="Expenses" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<AccountBalance />} 
                  label="Assets" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Books Card */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              transform: 'scale(0.6)',
              '&:hover': {
                transform: 'translateY(-4px) scale(0.6)',
                boxShadow: 4,
              }
            }}
            onClick={() => setShowBookKeeping(true)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Book />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Books
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bookkeeping & ledgers
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<TrendingUp />} 
                  label="Income Ledger" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<TrendingDown />} 
                  label="Expense Ledger" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<AccountBalance />} 
                  label="General Ledger" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Reports Card */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              transform: 'scale(0.6)',
              '&:hover': {
                transform: 'translateY(-4px) scale(0.6)',
                boxShadow: 4,
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <AttachMoney />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Reports
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Financial reports & analytics
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<TrendingUp />} 
                  label="Profit & Loss" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<AccountBalance />} 
                  label="Balance Sheet" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Receipt />} 
                  label="Cash Flow" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ transform: 'scale(0.6)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <Add />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Quick Actions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Common accounting tasks
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  fullWidth
                  sx={{ mb: 1 }}
                  onClick={() => setShowAddDialog(true)}
                >
                  Add Record
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  Export Data
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Print />}
                  fullWidth
                >
                  Print Report
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Record Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Accounting Record</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Add new accounting record functionality would go here.
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

      {/* BookKeeping Component */}
      {showBookKeeping && (
        <BookKeeping onClose={() => setShowBookKeeping(false)} />
      )}
    </Box>
  );
};

export default AccountingHub;
