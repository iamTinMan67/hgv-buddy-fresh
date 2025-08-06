import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Tooltip,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  AccountBalance,
  Receipt,
  ShoppingCart,
  Print,
  Home,
  Book,
  Description,
  AttachMoney,
  Assessment,
  Add,
  Edit,
  Delete,
  FilterList,
  GetApp,
} from '@mui/icons-material';

interface AccountingHubProps {
  onClose: () => void;
}

// Data interfaces
interface BookRecord {
  id: string;
  type: 'asset' | 'liability' | 'vat' | 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
  category: string;
  reference: string;
}

interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  client: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  description: string;
}

interface PurchaseOrderRecord {
  id: string;
  poNumber: string;
  supplier: string;
  amount: number;
  date: string;
  status: 'draft' | 'approved' | 'ordered' | 'delivered';
  items: string;
}

const AccountingHub: React.FC<AccountingHubProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<'main' | 'books' | 'invoices' | 'purchaseOrders'>('main');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [currentRecord, setCurrentRecord] = useState<any>(null);

  // Mock data
  const [booksData, setBooksData] = useState<BookRecord[]>([
    { id: '1', type: 'asset', description: 'Company Vehicle', amount: 25000, date: '2024-01-15', category: 'Equipment', reference: 'VEH001' },
    { id: '2', type: 'liability', description: 'Bank Loan', amount: 45000, date: '2024-01-10', category: 'Finance', reference: 'LOAN001' },
    { id: '3', type: 'vat', description: 'VAT Payable', amount: 12500, date: '2024-01-31', category: 'Tax', reference: 'VAT001' },
  ]);

  const [invoicesData, setInvoicesData] = useState<InvoiceRecord[]>([
    { id: '1', invoiceNumber: 'INV001', client: 'ABC Transport', amount: 5000, date: '2024-01-15', dueDate: '2024-02-15', status: 'paid', description: 'Freight Services' },
    { id: '2', invoiceNumber: 'INV002', client: 'XYZ Logistics', amount: 3000, date: '2024-01-20', dueDate: '2024-02-20', status: 'sent', description: 'Delivery Services' },
    { id: '3', invoiceNumber: 'INV003', client: 'DEF Haulage', amount: 2000, date: '2024-01-10', dueDate: '2024-02-10', status: 'overdue', description: 'Transport Services' },
  ]);

  const [purchaseOrdersData, setPurchaseOrdersData] = useState<PurchaseOrderRecord[]>([
    { id: '1', poNumber: 'PO001', supplier: 'Truck Parts Ltd', amount: 5000, date: '2024-01-15', status: 'delivered', items: 'Brake pads, filters' },
    { id: '2', poNumber: 'PO002', supplier: 'Fuel Supply Co', amount: 3000, date: '2024-01-20', status: 'ordered', items: 'Diesel fuel' },
    { id: '3', poNumber: 'PO003', supplier: 'Tire Warehouse', amount: 2000, date: '2024-01-25', status: 'approved', items: 'Truck tires' },
  ]);

  const handleNavigateToBooks = () => setCurrentView('books');
  const handleNavigateToInvoices = () => setCurrentView('invoices');
  const handleNavigateToPurchaseOrders = () => setCurrentView('purchaseOrders');
  const handleBackToMain = () => setCurrentView('main');

  // Print functionality
  const handlePrintRecord = (record: any, type: string) => {
    console.log(`Printing ${type} record:`, record);
    // In a real app, this would generate and print the specific record
    window.print();
  };

  const handleBatchPrint = (type: string) => {
    console.log(`Batch printing ${type} records:`, selectedRecords);
    // In a real app, this would generate and print all selected records
    window.print();
  };

  // CRUD operations
  const handleAddRecord = (record: any, type: string) => {
    const newRecord = { ...record, id: Date.now().toString() };
    switch (type) {
      case 'books':
        setBooksData([...booksData, newRecord]);
        break;
      case 'invoices':
        setInvoicesData([...invoicesData, newRecord]);
        break;
      case 'purchaseOrders':
        setPurchaseOrdersData([...purchaseOrdersData, newRecord]);
        break;
    }
    setShowAddDialog(false);
  };

  const handleEditRecord = (record: any, type: string) => {
    switch (type) {
      case 'books':
        setBooksData(booksData.map(r => r.id === record.id ? record : r));
        break;
      case 'invoices':
        setInvoicesData(invoicesData.map(r => r.id === record.id ? record : r));
        break;
      case 'purchaseOrders':
        setPurchaseOrdersData(purchaseOrdersData.map(r => r.id === record.id ? record : r));
        break;
    }
    setShowEditDialog(false);
  };

  const handleDeleteRecord = (id: string, type: string) => {
    switch (type) {
      case 'books':
        setBooksData(booksData.filter(r => r.id !== id));
        break;
      case 'invoices':
        setInvoicesData(invoicesData.filter(r => r.id !== id));
        break;
      case 'purchaseOrders':
        setPurchaseOrdersData(purchaseOrdersData.filter(r => r.id !== id));
        break;
    }
  };

  const handleSelectRecord = (id: string) => {
    setSelectedRecords(prev => 
      prev.includes(id) 
        ? prev.filter(r => r !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (type: string) => {
    let allIds: string[] = [];
    switch (type) {
      case 'books':
        allIds = booksData.map(r => r.id);
        break;
      case 'invoices':
        allIds = invoicesData.map(r => r.id);
        break;
      case 'purchaseOrders':
        allIds = purchaseOrdersData.map(r => r.id);
        break;
    }
    setSelectedRecords(selectedRecords.length === allIds.length ? [] : allIds);
  };

  const renderBooksView = () => (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <Book sx={{ mr: 1, verticalAlign: 'middle' }} />
          Books Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<FilterList />}
            onClick={() => setShowFilterDialog(true)}
            sx={{ mr: 2 }}
          >
            Filter
          </Button>
          <Button
            variant="contained"
            startIcon={<Print />}
            onClick={() => handleBatchPrint('books')}
            disabled={selectedRecords.length === 0}
            sx={{ mr: 2 }}
          >
            Print Selected ({selectedRecords.length})
          </Button>
          <IconButton
            onClick={handleBackToMain}
            sx={{ color: 'yellow', fontSize: '1.5rem' }}
          >
            <Home />
          </IconButton>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedRecords.length === booksData.length}
                  indeterminate={selectedRecords.length > 0 && selectedRecords.length < booksData.length}
                  onChange={() => handleSelectAll('books')}
                />
              </TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {booksData.map((record) => (
              <TableRow key={record.id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedRecords.includes(record.id)}
                    onChange={() => handleSelectRecord(record.id)}
                  />
                </TableCell>
                <TableCell>{record.type}</TableCell>
                <TableCell>{record.description}</TableCell>
                <TableCell>£{record.amount.toLocaleString()}</TableCell>
                <TableCell>{record.date}</TableCell>
                <TableCell>{record.category}</TableCell>
                <TableCell>{record.reference}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handlePrintRecord(record, 'book')} size="small">
                    <Print />
                  </IconButton>
                  <IconButton onClick={() => { setCurrentRecord(record); setShowEditDialog(true); }} size="small">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteRecord(record.id, 'books')} size="small">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => { setCurrentRecord(null); setShowAddDialog(true); }}
      >
        <Add />
      </Fab>
    </Box>
  );

  const renderInvoicesView = () => (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <Receipt sx={{ mr: 1, verticalAlign: 'middle' }} />
          Invoice Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<FilterList />}
            onClick={() => setShowFilterDialog(true)}
            sx={{ mr: 2 }}
          >
            Filter
          </Button>
          <Button
            variant="contained"
            startIcon={<Print />}
            onClick={() => handleBatchPrint('invoices')}
            disabled={selectedRecords.length === 0}
            sx={{ mr: 2 }}
          >
            Print Selected ({selectedRecords.length})
          </Button>
          <IconButton
            onClick={handleBackToMain}
            sx={{ color: 'yellow', fontSize: '1.5rem' }}
          >
            <Home />
          </IconButton>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedRecords.length === invoicesData.length}
                  indeterminate={selectedRecords.length > 0 && selectedRecords.length < invoicesData.length}
                  onChange={() => handleSelectAll('invoices')}
                />
              </TableCell>
              <TableCell>Invoice #</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoicesData.map((record) => (
              <TableRow key={record.id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedRecords.includes(record.id)}
                    onChange={() => handleSelectRecord(record.id)}
                  />
                </TableCell>
                <TableCell>{record.invoiceNumber}</TableCell>
                <TableCell>{record.client}</TableCell>
                <TableCell>£{record.amount.toLocaleString()}</TableCell>
                <TableCell>{record.date}</TableCell>
                <TableCell>{record.dueDate}</TableCell>
                <TableCell>
                  <Chip 
                    label={record.status} 
                    color={record.status === 'paid' ? 'success' : record.status === 'overdue' ? 'error' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{record.description}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handlePrintRecord(record, 'invoice')} size="small">
                    <Print />
                  </IconButton>
                  <IconButton onClick={() => { setCurrentRecord(record); setShowEditDialog(true); }} size="small">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteRecord(record.id, 'invoices')} size="small">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => { setCurrentRecord(null); setShowAddDialog(true); }}
      >
        <Add />
      </Fab>
    </Box>
  );

  const renderPurchaseOrdersView = () => (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <ShoppingCart sx={{ mr: 1, verticalAlign: 'middle' }} />
          Purchase Orders
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<FilterList />}
            onClick={() => setShowFilterDialog(true)}
            sx={{ mr: 2 }}
          >
            Filter
          </Button>
          <Button
            variant="contained"
            startIcon={<Print />}
            onClick={() => handleBatchPrint('purchaseOrders')}
            disabled={selectedRecords.length === 0}
            sx={{ mr: 2 }}
          >
            Print Selected ({selectedRecords.length})
          </Button>
          <IconButton
            onClick={handleBackToMain}
            sx={{ color: 'yellow', fontSize: '1.5rem' }}
          >
            <Home />
          </IconButton>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedRecords.length === purchaseOrdersData.length}
                  indeterminate={selectedRecords.length > 0 && selectedRecords.length < purchaseOrdersData.length}
                  onChange={() => handleSelectAll('purchaseOrders')}
                />
              </TableCell>
              <TableCell>PO #</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchaseOrdersData.map((record) => (
              <TableRow key={record.id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedRecords.includes(record.id)}
                    onChange={() => handleSelectRecord(record.id)}
                  />
                </TableCell>
                <TableCell>{record.poNumber}</TableCell>
                <TableCell>{record.supplier}</TableCell>
                <TableCell>£{record.amount.toLocaleString()}</TableCell>
                <TableCell>{record.date}</TableCell>
                <TableCell>
                  <Chip 
                    label={record.status} 
                    color={record.status === 'delivered' ? 'success' : record.status === 'ordered' ? 'info' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{record.items}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handlePrintRecord(record, 'purchaseOrder')} size="small">
                    <Print />
                  </IconButton>
                  <IconButton onClick={() => { setCurrentRecord(record); setShowEditDialog(true); }} size="small">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteRecord(record.id, 'purchaseOrders')} size="small">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => { setCurrentRecord(null); setShowAddDialog(true); }}
      >
        <Add />
      </Fab>
    </Box>
  );

  // Main Accounting Hub
  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <AccountBalance sx={{ mr: 1, verticalAlign: 'middle' }} />
          Accounting Hub
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ color: 'yellow', fontSize: '1.5rem' }}
        >
          <Home />
        </IconButton>
      </Box>

      {/* Sub-Portal Navigation */}
      <Grid container spacing={3}>
        {/* Books Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}
            onClick={handleNavigateToBooks}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalance sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h5" component="div">
                    Books
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Financial records & VAT
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<AttachMoney />} 
                  label="Assets" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<AccountBalance />} 
                  label="Liabilities" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Assessment />} 
                  label="VAT" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Invoices Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}
            onClick={handleNavigateToInvoices}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Receipt sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h5" component="div">
                    Invoices
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Client billing & payments
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<Receipt />} 
                  label="Paid" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Description />} 
                  label="Pending" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<AttachMoney />} 
                  label="Overdue" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Purchase Orders Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}
            onClick={handleNavigateToPurchaseOrders}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShoppingCart sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h5" component="div">
                    Purchase Orders
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Procurement & suppliers
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<ShoppingCart />} 
                  label="Approved" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Description />} 
                  label="Pending" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<AttachMoney />} 
                  label="Delivered" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Conditional rendering for sub-views */}
      {currentView === 'books' && renderBooksView()}
      {currentView === 'invoices' && renderInvoicesView()}
      {currentView === 'purchaseOrders' && renderPurchaseOrdersView()}

      {/* Add/Edit Dialog would go here - simplified for now */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Record</DialogTitle>
        <DialogContent>
          <Typography>Add/Edit form would go here with fields specific to each category</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onClose={() => setShowFilterDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Filter Records</DialogTitle>
        <DialogContent>
          <Typography>Filter form would go here with date ranges, status filters, etc.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFilterDialog(false)}>Cancel</Button>
          <Button variant="contained">Apply Filter</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountingHub;
