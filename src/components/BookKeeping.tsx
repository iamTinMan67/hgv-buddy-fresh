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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import {
  AccountBalance,
  Add,
  Visibility,
  CheckCircle,
  Home,
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

interface AssetRecord {
  id: string;
  name: string;
  type: 'vehicle' | 'equipment' | 'property' | 'investment' | 'other';
  description: string;
  purchaseDate: string;
  purchaseValue: number;
  currentValue: number;
  location: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  depreciationRate: number;
  notes?: string;
}

interface LiabilityRecord {
  id: string;
  name: string;
  type: 'loan' | 'mortgage' | 'credit' | 'tax' | 'insurance' | 'other';
  description: string;
  originalAmount: number;
  currentBalance: number;
  startDate: string;
  dueDate: string;
  interestRate: number;
  monthlyPayment: number;
  status: 'active' | 'paid' | 'overdue';
  notes?: string;
}

const BookKeeping: React.FC<BookKeepingProps> = ({ onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BookRecord | null>(null);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showLiabilityForm, setShowLiabilityForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetRecord | null>(null);
  const [selectedLiability, setSelectedLiability] = useState<LiabilityRecord | null>(null);

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

  // Mock asset data
  const [assetRecords] = useState<AssetRecord[]>([
    {
      id: '1',
      name: 'HGV Truck - Volvo FH16',
      type: 'vehicle',
      description: 'Primary delivery vehicle',
      purchaseDate: '2023-01-15',
      purchaseValue: 85000.00,
      currentValue: 72000.00,
      location: 'Main Depot',
      condition: 'excellent',
      depreciationRate: 15,
      notes: 'Well maintained, low mileage'
    },
    {
      id: '2',
      name: 'Forklift - Toyota',
      type: 'equipment',
      description: 'Warehouse loading equipment',
      purchaseDate: '2022-06-10',
      purchaseValue: 25000.00,
      currentValue: 18000.00,
      location: 'Warehouse A',
      condition: 'good',
      depreciationRate: 20,
      notes: 'Regular service schedule maintained'
    }
  ]);

  // Mock liability data
  const [liabilityRecords] = useState<LiabilityRecord[]>([
    {
      id: '1',
      name: 'Business Loan',
      type: 'loan',
      description: 'Equipment financing loan',
      originalAmount: 100000.00,
      currentBalance: 75000.00,
      startDate: '2023-03-01',
      dueDate: '2028-03-01',
      interestRate: 5.5,
      monthlyPayment: 1200.00,
      status: 'active',
      notes: '5-year term loan for fleet expansion'
    },
    {
      id: '2',
      name: 'Commercial Property Mortgage',
      type: 'mortgage',
      description: 'Warehouse property mortgage',
      originalAmount: 500000.00,
      currentBalance: 420000.00,
      startDate: '2022-01-15',
      dueDate: '2032-01-15',
      interestRate: 4.2,
      monthlyPayment: 3500.00,
      status: 'active',
      notes: '10-year fixed rate mortgage'
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
    <Box sx={{ p: 3, bgcolor: 'black', minHeight: '100vh', color: 'white' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: 'white', mr: 2 }}>
          Book Keeping
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'yellow' }}>
          <Home />
        </IconButton>
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
              color: 'white',
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
          <Tab label="Income" />
          <Tab label="Expenses" />
          <Tab label="Assets" />
          <Tab label="Liabilities" />
        </Tabs>
      </Box>

      {/* Income Tab */}
      {tabValue === 0 && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: 'white' }}>Income Records</Typography>
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
      {tabValue === 1 && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: 'white' }}>Expense Records</Typography>
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
      {tabValue === 2 && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: 'white' }}>Asset Management</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowAssetForm(true)}
            >
              Add Asset
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Purchase Value</TableCell>
                  <TableCell>Current Value</TableCell>
                  <TableCell>Condition</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assetRecords.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>{asset.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={asset.type} 
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>£{asset.purchaseValue.toFixed(2)}</TableCell>
                    <TableCell>£{asset.currentValue.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={asset.condition} 
                        color={asset.condition === 'excellent' ? 'success' : asset.condition === 'good' ? 'primary' : asset.condition === 'fair' ? 'warning' : 'error' as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{asset.location}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => setSelectedAsset(asset)} size="small">
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

      {/* Liabilities Tab */}
      {tabValue === 3 && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: 'white' }}>Liability Management</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowLiabilityForm(true)}
            >
              Add Liability
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Original Amount</TableCell>
                  <TableCell>Current Balance</TableCell>
                  <TableCell>Monthly Payment</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {liabilityRecords.map((liability) => (
                  <TableRow key={liability.id}>
                    <TableCell>{liability.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={liability.type} 
                        color="secondary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>£{liability.originalAmount.toFixed(2)}</TableCell>
                    <TableCell>£{liability.currentBalance.toFixed(2)}</TableCell>
                    <TableCell>£{liability.monthlyPayment.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={liability.status} 
                        color={liability.status === 'active' ? 'primary' : liability.status === 'paid' ? 'success' : 'error' as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => setSelectedLiability(liability)} size="small">
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

      {/* Add Asset Dialog */}
      <Dialog open={showAssetForm} onClose={() => setShowAssetForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Asset</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Asset Name"
                variant="outlined"
                placeholder="e.g., HGV Truck - Volvo FH16"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Asset Type</InputLabel>
                <Select label="Asset Type">
                  <MenuItem value="vehicle">Vehicle</MenuItem>
                  <MenuItem value="equipment">Equipment</MenuItem>
                  <MenuItem value="property">Property</MenuItem>
                  <MenuItem value="investment">Investment</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                variant="outlined"
                multiline
                rows={2}
                placeholder="Brief description of the asset"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Purchase Date"
                type="date"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Purchase Value (£)"
                type="number"
                variant="outlined"
                placeholder="0.00"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Current Value (£)"
                type="number"
                variant="outlined"
                placeholder="0.00"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                variant="outlined"
                placeholder="e.g., Main Depot"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Condition</InputLabel>
                <Select label="Condition">
                  <MenuItem value="excellent">Excellent</MenuItem>
                  <MenuItem value="good">Good</MenuItem>
                  <MenuItem value="fair">Fair</MenuItem>
                  <MenuItem value="poor">Poor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Depreciation Rate (%)"
                type="number"
                variant="outlined"
                placeholder="0"
                helperText="Annual depreciation percentage"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                variant="outlined"
                multiline
                rows={3}
                placeholder="Additional notes about the asset"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAssetForm(false)}>Cancel</Button>
          <Button variant="contained">Add Asset</Button>
        </DialogActions>
      </Dialog>

      {/* Add Liability Dialog */}
      <Dialog open={showLiabilityForm} onClose={() => setShowLiabilityForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Liability</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Liability Name"
                variant="outlined"
                placeholder="e.g., Business Loan"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Liability Type</InputLabel>
                <Select label="Liability Type">
                  <MenuItem value="loan">Loan</MenuItem>
                  <MenuItem value="mortgage">Mortgage</MenuItem>
                  <MenuItem value="credit">Credit</MenuItem>
                  <MenuItem value="tax">Tax</MenuItem>
                  <MenuItem value="insurance">Insurance</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                variant="outlined"
                multiline
                rows={2}
                placeholder="Brief description of the liability"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Original Amount (£)"
                type="number"
                variant="outlined"
                placeholder="0.00"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Current Balance (£)"
                type="number"
                variant="outlined"
                placeholder="0.00"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Interest Rate (%)"
                type="number"
                variant="outlined"
                placeholder="0.00"
                helperText="Annual interest rate"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Monthly Payment (£)"
                type="number"
                variant="outlined"
                placeholder="0.00"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                variant="outlined"
                multiline
                rows={3}
                placeholder="Additional notes about the liability"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLiabilityForm(false)}>Cancel</Button>
          <Button variant="contained">Add Liability</Button>
        </DialogActions>
      </Dialog>

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

      {/* View Asset Dialog */}
      <Dialog open={!!selectedAsset} onClose={() => setSelectedAsset(null)} maxWidth="md" fullWidth>
        <DialogTitle>Asset Details</DialogTitle>
        <DialogContent>
          {selectedAsset && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedAsset.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Type: {selectedAsset.type}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Description: {selectedAsset.description}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Purchase Date: {selectedAsset.purchaseDate}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Purchase Value: £{selectedAsset.purchaseValue.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Value: £{selectedAsset.currentValue.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Location: {selectedAsset.location}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Condition: {selectedAsset.condition}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Depreciation Rate: {selectedAsset.depreciationRate}%
              </Typography>
              {selectedAsset.notes && (
                <Typography variant="body2" color="text.secondary">
                  Notes: {selectedAsset.notes}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedAsset(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* View Liability Dialog */}
      <Dialog open={!!selectedLiability} onClose={() => setSelectedLiability(null)} maxWidth="md" fullWidth>
        <DialogTitle>Liability Details</DialogTitle>
        <DialogContent>
          {selectedLiability && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedLiability.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Type: {selectedLiability.type}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Description: {selectedLiability.description}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Original Amount: £{selectedLiability.originalAmount.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Balance: £{selectedLiability.currentBalance.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Start Date: {selectedLiability.startDate}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Due Date: {selectedLiability.dueDate}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Interest Rate: {selectedLiability.interestRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Monthly Payment: £{selectedLiability.monthlyPayment.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Status: {selectedLiability.status}
              </Typography>
              {selectedLiability.notes && (
                <Typography variant="body2" color="text.secondary">
                  Notes: {selectedLiability.notes}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedLiability(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookKeeping; 