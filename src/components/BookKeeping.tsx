import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  Badge,
  Tooltip,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  AccountBalance,
  Add,
  Remove,
  TrendingUp,
  TrendingDown,
  Receipt,
  AttachMoney,
  Business,
  Inventory,
  LocalShipping,
  Home,
  Build,
  Computer,
  DirectionsCar,
  Print,
  FileDownload,
  Visibility,
  Edit,
  Delete,
  ExpandMore,
  Assessment,
  Calculate,
  Euro,
  CreditCard,
  AccountBalanceWallet,
  Savings,
  ShoppingCart,
  LocalGasStation,
  Apartment,
  Handyman,
  Description,
  DateRange,
  Category,
  MonetizationOn,
} from '@mui/icons-material';

interface BookKeepingProps {
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
      id={`books-tabpanel-${index}`}
      aria-labelledby={`books-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  subcategory: string;
  amount: number;
  type: 'debit' | 'credit';
  vatRate: number;
  vatAmount: number;
  netAmount: number;
  reference: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface AssetGroup {
  name: string;
  total: number;
  items: Transaction[];
}

interface LiabilityGroup {
  name: string;
  total: number;
  items: Transaction[];
}

const BookKeeping: React.FC<BookKeepingProps> = ({ onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Mock transaction data
  const [transactions] = useState<Transaction[]>([
    // Assets (Debits)
    {
      id: '1',
      date: '2024-01-15',
      description: 'HGV Vehicle Purchase',
      category: 'Fixed Assets',
      subcategory: 'Vehicles',
      amount: 45000.00,
      type: 'debit',
      vatRate: 20,
      vatAmount: 7500.00,
      netAmount: 37500.00,
      reference: 'INV-2024-001',
      status: 'approved',
    },
    {
      id: '2',
      date: '2024-01-10',
      description: 'Office Equipment',
      category: 'Fixed Assets',
      subcategory: 'Equipment',
      amount: 5000.00,
      type: 'debit',
      vatRate: 20,
      vatAmount: 833.33,
      netAmount: 4166.67,
      reference: 'INV-2024-002',
      status: 'approved',
    },
    {
      id: '3',
      date: '2024-01-20',
      description: 'Fuel Purchase',
      category: 'Operating Expenses',
      subcategory: 'Fuel',
      amount: 2500.00,
      type: 'credit',
      vatRate: 20,
      vatAmount: 416.67,
      netAmount: 2083.33,
      reference: 'FUEL-2024-001',
      status: 'approved',
    },
    {
      id: '4',
      date: '2024-01-25',
      description: 'Office Rent',
      category: 'Operating Expenses',
      subcategory: 'Rent',
      amount: 3000.00,
      type: 'credit',
      vatRate: 0,
      vatAmount: 0,
      netAmount: 3000.00,
      reference: 'RENT-2024-001',
      status: 'approved',
    },
    {
      id: '5',
      date: '2024-01-30',
      description: 'Transport Income',
      category: 'Income',
      subcategory: 'Services',
      amount: 15000.00,
      type: 'debit',
      vatRate: 20,
      vatAmount: 2500.00,
      netAmount: 12500.00,
      reference: 'INV-2024-003',
      status: 'approved',
    },
    {
      id: '6',
      date: '2024-02-01',
      description: 'Bank Loan',
      category: 'Liabilities',
      subcategory: 'Loans',
      amount: 100000.00,
      type: 'credit',
      vatRate: 0,
      vatAmount: 0,
      netAmount: 100000.00,
      reference: 'LOAN-2024-001',
      status: 'approved',
    },
    {
      id: '7',
      date: '2024-02-05',
      description: 'Inventory Purchase',
      category: 'Current Assets',
      subcategory: 'Inventory',
      amount: 8000.00,
      type: 'debit',
      vatRate: 20,
      vatAmount: 1333.33,
      netAmount: 6666.67,
      reference: 'INV-2024-004',
      status: 'approved',
    },
    {
      id: '8',
      date: '2024-02-10',
      description: 'Cash Deposit',
      category: 'Current Assets',
      subcategory: 'Cash',
      amount: 25000.00,
      type: 'debit',
      vatRate: 0,
      vatAmount: 0,
      netAmount: 25000.00,
      reference: 'CASH-2024-001',
      status: 'approved',
    },
  ]);

  // Categories and subcategories
  const categories = {
    'Fixed Assets': ['Vehicles', 'Equipment', 'Buildings', 'Land'],
    'Current Assets': ['Cash', 'Inventory', 'Accounts Receivable', 'Prepaid Expenses'],
    'Income': ['Services', 'Sales', 'Interest', 'Other Income'],
    'Capital': ['Owner Investment', 'Retained Earnings'],
    'Liabilities': ['Loans', 'Accounts Payable', 'Accrued Expenses'],
    'Operating Expenses': ['Fuel', 'Rent', 'Utilities', 'Insurance', 'Maintenance', 'Salaries'],
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Fixed Assets': return <Build />;
      case 'Current Assets': return <AccountBalanceWallet />;
      case 'Income': return <TrendingUp />;
      case 'Capital': return <Business />;
      case 'Liabilities': return <AccountBalance />;
      case 'Operating Expenses': return <TrendingDown />;
      default: return <Description />;
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'debit' ? 'success' : 'error';
  };

  const getTypeIcon = (type: string) => {
    return type === 'debit' ? <Add /> : <Remove />;
  };

  // Calculate totals
  const totalAssets = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalLiabilities = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalVAT = transactions.reduce((sum, t) => sum + t.vatAmount, 0);

  // Group transactions by category
  const assetGroups = Object.keys(categories).reduce((acc, category) => {
    const categoryTransactions = transactions.filter(t => 
      t.category === category && t.type === 'debit'
    );
    if (categoryTransactions.length > 0) {
      acc.push({
        name: category,
        total: categoryTransactions.reduce((sum, t) => sum + t.amount, 0),
        items: categoryTransactions,
      });
    }
    return acc;
  }, [] as AssetGroup[]);

  const liabilityGroups = Object.keys(categories).reduce((acc, category) => {
    const categoryTransactions = transactions.filter(t => 
      t.category === category && t.type === 'credit'
    );
    if (categoryTransactions.length > 0) {
      acc.push({
        name: category,
        total: categoryTransactions.reduce((sum, t) => sum + t.amount, 0),
        items: categoryTransactions,
      });
    }
    return acc;
  }, [] as LiabilityGroup[]);

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const categoryMatch = !filterCategory || transaction.category === filterCategory;
    const typeMatch = !filterType || transaction.type === filterType;
    const startDateMatch = !dateRange.start || transaction.date >= dateRange.start;
    const endDateMatch = !dateRange.end || transaction.date <= dateRange.end;
    return categoryMatch && typeMatch && startDateMatch && endDateMatch;
  });

  const handleAddTransaction = () => {
    setShowAddDialog(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowEditDialog(true);
  };

  const handlePrintReport = () => {
    alert('Printing accounting report...');
  };

  const handleExportVAT = () => {
    alert('Exporting VAT report to CSV...');
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Book-Keeping
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddTransaction}
            sx={{ mr: 1 }}
          >
            Add Transaction
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                £{totalAssets.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Assets
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingDown sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                £{totalLiabilities.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Liabilities
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccountBalance sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                £{(totalAssets - totalLiabilities).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Net Worth
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Euro sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                £{totalVAT.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total VAT
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

             {/* Tabs */}
       <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
         <Tabs 
           value={tabValue} 
           onChange={(e, newValue) => setTabValue(newValue)}
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
           <Tab label="Balance Sheet" />
           <Tab label="Transactions" />
           <Tab label="VAT Report" />
         </Tabs>
       </Box>

      {/* Balance Sheet Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Assets Column */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="success.main">
                  Assets (Debits)
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {assetGroups.map((group) => (
                  <Accordion key={group.name} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        {getCategoryIcon(group.name)}
                        <Typography sx={{ ml: 1, flexGrow: 1 }}>
                          {group.name}
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          £{group.total.toLocaleString()}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {group.items.map((item) => (
                          <ListItem key={item.id}>
                            <ListItemText
                              primary={item.description}
                              secondary={`${item.subcategory} - ${new Date(item.date).toLocaleDateString()}`}
                            />
                            <ListItemSecondaryAction>
                              <Typography variant="body2" color="success.main">
                                £{item.amount.toLocaleString()}
                              </Typography>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))}
                
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Total Assets</Typography>
                  <Typography variant="h6" color="success.main">
                    £{totalAssets.toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Liabilities Column */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error.main">
                  Liabilities & Equity (Credits)
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {liabilityGroups.map((group) => (
                  <Accordion key={group.name} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        {getCategoryIcon(group.name)}
                        <Typography sx={{ ml: 1, flexGrow: 1 }}>
                          {group.name}
                        </Typography>
                        <Typography variant="h6" color="error.main">
                          £{group.total.toLocaleString()}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {group.items.map((item) => (
                          <ListItem key={item.id}>
                            <ListItemText
                              primary={item.description}
                              secondary={`${item.subcategory} - ${new Date(item.date).toLocaleDateString()}`}
                            />
                            <ListItemSecondaryAction>
                              <Typography variant="body2" color="error.main">
                                £{item.amount.toLocaleString()}
                              </Typography>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))}
                
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Total Liabilities</Typography>
                  <Typography variant="h6" color="error.main">
                    £{totalLiabilities.toLocaleString()}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Net Worth</Typography>
                  <Typography variant="h6" color="primary.main">
                    £{(totalAssets - totalLiabilities).toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Transactions Tab */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Transaction Ledger
            </Typography>
            
            {/* Search Filters */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <Category />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {Object.keys(categories).map(category => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <MonetizationOn />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="debit">Debit (Assets)</MenuItem>
                    <MenuItem value="credit">Credit (Liabilities)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateRange />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateRange />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            {/* Results Summary */}
            <Alert severity="info" sx={{ mb: 2 }}>
              Found {filteredTransactions.length} transaction(s) matching your criteria
            </Alert>

            {/* Transactions Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>VAT</TableCell>
                    <TableCell>Net Amount</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getCategoryIcon(transaction.category)}
                          <Typography sx={{ ml: 1 }}>
                            {transaction.category} - {transaction.subcategory}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={getTypeIcon(transaction.type)}
                          label={transaction.type.toUpperCase()} 
                          color={getTypeColor(transaction.type)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>£{transaction.amount.toLocaleString()}</TableCell>
                      <TableCell>£{transaction.vatAmount.toLocaleString()}</TableCell>
                      <TableCell>£{transaction.netAmount.toLocaleString()}</TableCell>
                      <TableCell>{transaction.reference}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit Transaction">
                          <IconButton onClick={() => handleEditTransaction(transaction)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Details">
                          <IconButton>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* VAT Report Tab */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                VAT Report
              </Typography>
              <Button
                variant="contained"
                startIcon={<FileDownload />}
                onClick={handleExportVAT}
              >
                Export VAT Report
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="success.main">
                      VAT Output (Sales)
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      £{transactions
                        .filter(t => t.type === 'debit' && t.vatAmount > 0)
                        .reduce((sum, t) => sum + t.vatAmount, 0)
                        .toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      VAT collected on sales and income
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="error.main">
                      VAT Input (Purchases)
                    </Typography>
                    <Typography variant="h4" color="error.main">
                      £{transactions
                        .filter(t => t.type === 'credit' && t.vatAmount > 0)
                        .reduce((sum, t) => sum + t.vatAmount, 0)
                        .toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      VAT paid on purchases and expenses
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              VAT Summary
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Transaction Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>VAT Rate</TableCell>
                    <TableCell>Net Amount</TableCell>
                    <TableCell>VAT Amount</TableCell>
                    <TableCell>Total Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions
                    .filter(t => t.vatAmount > 0)
                    .map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Chip 
                            icon={getTypeIcon(transaction.type)}
                            label={transaction.type.toUpperCase()} 
                            color={getTypeColor(transaction.type)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.vatRate}%</TableCell>
                        <TableCell>£{transaction.netAmount.toLocaleString()}</TableCell>
                        <TableCell>£{transaction.vatAmount.toLocaleString()}</TableCell>
                        <TableCell>£{transaction.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                VAT Calculation Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">VAT Output (Sales)</Typography>
                  <Typography variant="h6" color="success.main">
                    £{transactions
                      .filter(t => t.type === 'debit' && t.vatAmount > 0)
                      .reduce((sum, t) => sum + t.vatAmount, 0)
                      .toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">VAT Input (Purchases)</Typography>
                  <Typography variant="h6" color="error.main">
                    £{transactions
                      .filter(t => t.type === 'credit' && t.vatAmount > 0)
                      .reduce((sum, t) => sum + t.vatAmount, 0)
                      .toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="text.secondary">VAT Due to HMRC</Typography>
                  <Typography variant="h5" color="primary.main">
                    £{(transactions
                      .filter(t => t.type === 'debit' && t.vatAmount > 0)
                      .reduce((sum, t) => sum + t.vatAmount, 0) -
                      transactions
                      .filter(t => t.type === 'credit' && t.vatAmount > 0)
                      .reduce((sum, t) => sum + t.vatAmount, 0))
                      .toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Add Transaction Dialog */}
      <Dialog 
        open={showAddDialog} 
        onClose={() => setShowAddDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Add New Transaction
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Reference"
                placeholder="e.g., INV-2024-001"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                placeholder="Transaction description"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select label="Category">
                  {Object.keys(categories).map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Subcategory</InputLabel>
                <Select label="Subcategory">
                  <MenuItem value="">Select Category First</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select label="Type">
                  <MenuItem value="debit">Debit (Asset/Income)</MenuItem>
                  <MenuItem value="credit">Credit (Liability/Expense)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                placeholder="0.00"
                InputProps={{
                  startAdornment: <InputAdornment position="start">£</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="VAT Rate"
                type="number"
                placeholder="20"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                placeholder="Additional notes"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            alert('Transaction added successfully!');
            setShowAddDialog(false);
          }}>
            Add Transaction
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog 
        open={showEditDialog} 
        onClose={() => setShowEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Transaction
        </DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  defaultValue={selectedTransaction.date}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Reference"
                  defaultValue={selectedTransaction.reference}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  defaultValue={selectedTransaction.description}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select label="Category" defaultValue={selectedTransaction.category}>
                    {Object.keys(categories).map(category => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Subcategory</InputLabel>
                  <Select label="Subcategory" defaultValue={selectedTransaction.subcategory}>
                    {categories[selectedTransaction.category as keyof typeof categories]?.map(subcategory => (
                      <MenuItem key={subcategory} value={subcategory}>
                        {subcategory}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select label="Type" defaultValue={selectedTransaction.type}>
                    <MenuItem value="debit">Debit (Asset/Income)</MenuItem>
                    <MenuItem value="credit">Credit (Liability/Expense)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  defaultValue={selectedTransaction.amount}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">£</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="VAT Rate"
                  type="number"
                  defaultValue={selectedTransaction.vatRate}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={2}
                  defaultValue={selectedTransaction.notes}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            alert('Transaction updated successfully!');
            setShowEditDialog(false);
          }}>
            Update Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookKeeping; 