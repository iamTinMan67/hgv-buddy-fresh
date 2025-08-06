import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Alert,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Avatar,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  Person,
  Business,
  Work,
  Settings,
  Assignment,
  Phone,
  Email,
  LocationOn,
  AccountCircle,
  VpnKey,
  VerifiedUser,
  Gavel,
  Policy,
  DataUsage,
  Storage,
  Backup,
  RestoreFromTrash,
  DeleteForever,
  Restore,
  ArchiveOutlined,
  Unarchive,
  VisibilityOff,
  ExpandMore,
  Home,
  Warning,
  CheckCircle,
  Error,
  Info,
  Visibility,
  ArrowBack,
  FamilyRestroom,
  ContactPhone,
  ContactMail,
  HomeWork,
  Badge as BadgeIcon,
  Security,
  Receipt,
  Payment,
  Schedule,
  EventNote,
  LocationCity,
  LocalPhone,
  PhoneAndroid,
  AlternateEmail,
  PersonAdd,
  Group,
  SupervisorAccount,
  Engineering,
  DirectionsCar,
  LocalShipping,
  AdminPanelSettings,
  CleaningServices,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Download,
  Print,
  Send,
} from '@mui/icons-material';

interface ClientInvoicesProps {
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
      id={`client-invoices-tabpanel-${index}`}
      aria-labelledby={`client-invoices-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface ClientInvoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientType: 'company' | 'individual';
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentDate?: string;
  notes: string;
  createdAt: string;
  lastUpdated: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const ClientInvoices: React.FC<ClientInvoicesProps> = ({ onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [currentInvoice, setCurrentInvoice] = useState<Partial<ClientInvoice>>({
    invoiceNumber: '',
    clientId: '',
    clientName: '',
    clientType: 'company',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [],
    subtotal: 0,
    taxAmount: 0,
    totalAmount: 0,
    status: 'draft',
    notes: '',
  });

  // Mock data for client invoices
  const [clientInvoices, setClientInvoices] = useState<ClientInvoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      clientId: '1',
      clientName: 'ABC Logistics Ltd',
      clientType: 'company',
      issueDate: '2024-01-15',
      dueDate: '2024-02-14',
      items: [
        {
          id: '1',
          description: 'HGV Transport Services - Manchester to London',
          quantity: 1,
          unitPrice: 850.00,
          total: 850.00,
        },
        {
          id: '2',
          description: 'Additional Fuel Surcharge',
          quantity: 1,
          unitPrice: 75.00,
          total: 75.00,
        },
      ],
      subtotal: 925.00,
      taxAmount: 185.00,
      totalAmount: 1110.00,
      status: 'sent',
      notes: 'Standard delivery service',
      createdAt: '2024-01-15T10:00:00Z',
      lastUpdated: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      clientId: '2',
      clientName: 'Sarah Johnson',
      clientType: 'individual',
      issueDate: '2024-01-20',
      dueDate: '2024-02-03',
      items: [
        {
          id: '3',
          description: 'Consultation Services - Route Planning',
          quantity: 2,
          unitPrice: 150.00,
          total: 300.00,
        },
      ],
      subtotal: 300.00,
      taxAmount: 60.00,
      totalAmount: 360.00,
      status: 'paid',
      paymentDate: '2024-01-25',
      notes: 'Individual consultation',
      createdAt: '2024-01-20T14:30:00Z',
      lastUpdated: '2024-01-25T09:15:00Z',
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-003',
      clientId: '3',
      clientName: 'XYZ Transport Solutions',
      clientType: 'company',
      issueDate: '2024-01-25',
      dueDate: '2024-03-11',
      items: [
        {
          id: '4',
          description: 'Fleet Management Services - Monthly',
          quantity: 1,
          unitPrice: 2500.00,
          total: 2500.00,
        },
        {
          id: '5',
          description: 'Vehicle Maintenance Reports',
          quantity: 1,
          unitPrice: 200.00,
          total: 200.00,
        },
      ],
      subtotal: 2700.00,
      taxAmount: 540.00,
      totalAmount: 3240.00,
      status: 'overdue',
      notes: 'Large fleet client - extended payment terms',
      createdAt: '2024-01-25T16:45:00Z',
      lastUpdated: '2024-01-25T16:45:00Z',
    },
  ]);

  const handleAddInvoice = () => {
    const newInvoice: ClientInvoice = {
      id: Date.now().toString(),
      ...currentInvoice as ClientInvoice,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    setClientInvoices([...clientInvoices, newInvoice]);
    setCurrentInvoice({
      invoiceNumber: '',
      clientId: '',
      clientName: '',
      clientType: 'company',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [],
      subtotal: 0,
      taxAmount: 0,
      totalAmount: 0,
      status: 'draft',
      notes: '',
    });
    setShowAddDialog(false);
  };

  const handleEditInvoice = (invoice: ClientInvoice) => {
    setCurrentInvoice(invoice);
    setEditingId(invoice.id);
    setShowAddDialog(true);
  };

  const handleUpdateInvoice = () => {
    if (!editingId) return;
    const updatedInvoices = clientInvoices.map(invoice =>
      invoice.id === editingId
        ? { ...currentInvoice, id: editingId, lastUpdated: new Date().toISOString() } as ClientInvoice
        : invoice
    );
    setClientInvoices(updatedInvoices);
    setCurrentInvoice({
      invoiceNumber: '',
      clientId: '',
      clientName: '',
      clientType: 'company',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [],
      subtotal: 0,
      taxAmount: 0,
      totalAmount: 0,
      status: 'draft',
      notes: '',
    });
    setEditingId(null);
    setShowAddDialog(false);
  };

  const handleDeleteInvoice = (id: string) => {
    setClientInvoices(clientInvoices.filter(invoice => invoice.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'sent': return 'info';
      case 'paid': return 'success';
      case 'overdue': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit />;
      case 'sent': return <Send />;
      case 'paid': return <CheckCircle />;
      case 'overdue': return <Warning />;
      case 'cancelled': return <Cancel />;
      default: return <Edit />;
    }
  };

  const totalInvoices = clientInvoices.length;
  const paidInvoices = clientInvoices.filter(i => i.status === 'paid').length;
  const overdueInvoices = clientInvoices.filter(i => i.status === 'overdue').length;
  const totalAmount = clientInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const paidAmount = clientInvoices
    .filter(i => i.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const overdueAmount = clientInvoices
    .filter(i => i.status === 'overdue')
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0);

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <Receipt sx={{ mr: 1, verticalAlign: 'middle' }} />
          Client Invoices
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ color: 'yellow', fontSize: '1.5rem' }}
        >
          <Home />
        </IconButton>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Receipt sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">Total Invoices</Typography>
              <Typography variant="h4" color="primary">
                {totalInvoices}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h6">Paid</Typography>
              <Typography variant="h4" color="success.main">
                {paidInvoices}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Warning sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h6">Overdue</Typography>
              <Typography variant="h4" color="error.main">
                {overdueInvoices}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h6">Total Amount</Typography>
              <Typography variant="h4" color="info.main">
                £{totalAmount.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            '& .MuiTab-root': {
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            },
          }}
        >
          <Tab label="All Invoices" />
          <Tab label="Draft" />
          <Tab label="Sent" />
          <Tab label="Paid" />
          <Tab label="Overdue" />
          <Tab label="Reports" />
        </Tabs>
      </Box>

      {/* All Invoices Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">All Client Invoices</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowAddDialog(true)}
          >
            Create Invoice
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Issue Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {invoice.invoiceNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {invoice.items.length} items
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {invoice.clientName}
                      </Typography>
                      <Chip
                        label={invoice.clientType}
                        size="small"
                        color={invoice.clientType === 'company' ? 'primary' : 'secondary'}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="bold">
                      £{invoice.totalAmount.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tax: £{invoice.taxAmount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(invoice.status)}
                      label={invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      color={getStatusColor(invoice.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEditInvoice(invoice)}
                      sx={{ mr: 1 }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      <Print />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="success"
                      sx={{ mr: 1 }}
                    >
                      <Download />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteInvoice(invoice.id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Draft Tab */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Draft Invoices
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Issue Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientInvoices
                .filter(invoice => invoice.status === 'draft')
                .map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        {invoice.invoiceNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{invoice.clientName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        £{invoice.totalAmount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditInvoice(invoice)}
                        sx={{ mr: 1 }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="success"
                      >
                        <Send />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Sent Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Sent Invoices
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientInvoices
                .filter(invoice => invoice.status === 'sent')
                .map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        {invoice.invoiceNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{invoice.clientName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        £{invoice.totalAmount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        sx={{ mr: 1 }}
                      >
                        <Print />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="success"
                      >
                        <Send />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Paid Tab */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Paid Invoices
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Payment Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientInvoices
                .filter(invoice => invoice.status === 'paid')
                .map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        {invoice.invoiceNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{invoice.clientName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        £{invoice.totalAmount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        sx={{ mr: 1 }}
                      >
                        <Print />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="success"
                      >
                        <Download />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Overdue Tab */}
      <TabPanel value={tabValue} index={4}>
        <Typography variant="h6" gutterBottom>
          Overdue Invoices
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Days Overdue</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientInvoices
                .filter(invoice => invoice.status === 'overdue')
                .map((invoice) => {
                  const daysOverdue = Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Typography variant="body1" fontWeight="bold">
                          {invoice.invoiceNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{invoice.clientName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${daysOverdue} days`}
                          color="error"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight="bold">
                          £{invoice.totalAmount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="warning"
                          sx={{ mr: 1 }}
                        >
                          <Send />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                        >
                          <Print />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Reports Tab */}
      <TabPanel value={tabValue} index={5}>
        <Typography variant="h6" gutterBottom>
          Invoice Reports
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Financial Summary
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Total Invoiced:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    £{totalAmount.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Total Paid:</Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    £{paidAmount.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Total Overdue:</Typography>
                  <Typography variant="body2" fontWeight="bold" color="error.main">
                    £{overdueAmount.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Outstanding:</Typography>
                  <Typography variant="body2" fontWeight="bold" color="warning.main">
                    £{(totalAmount - paidAmount).toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Status Distribution
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Draft:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {clientInvoices.filter(i => i.status === 'draft').length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Sent:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {clientInvoices.filter(i => i.status === 'sent').length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Paid:</Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    {paidInvoices}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Overdue:</Typography>
                  <Typography variant="body2" fontWeight="bold" color="error.main">
                    {overdueInvoices}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Add/Edit Invoice Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Invoice' : 'Create New Invoice'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Invoice Number *"
                value={currentInvoice.invoiceNumber || ''}
                onChange={(e) => setCurrentInvoice({ ...currentInvoice, invoiceNumber: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status *</InputLabel>
                <Select
                  value={currentInvoice.status || 'draft'}
                  onChange={(e) => setCurrentInvoice({ ...currentInvoice, status: e.target.value as ClientInvoice['status'] })}
                  label="Status *"
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Client Information */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Client Name *"
                value={currentInvoice.clientName || ''}
                onChange={(e) => setCurrentInvoice({ ...currentInvoice, clientName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Client Type *</InputLabel>
                <Select
                  value={currentInvoice.clientType || 'company'}
                  onChange={(e) => setCurrentInvoice({ ...currentInvoice, clientType: e.target.value as 'company' | 'individual' })}
                  label="Client Type *"
                >
                  <MenuItem value="company">Company</MenuItem>
                  <MenuItem value="individual">Individual</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Dates */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Issue Date *"
                type="date"
                value={currentInvoice.issueDate || ''}
                onChange={(e) => setCurrentInvoice({ ...currentInvoice, issueDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Due Date *"
                type="date"
                value={currentInvoice.dueDate || ''}
                onChange={(e) => setCurrentInvoice({ ...currentInvoice, dueDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            {/* Payment Information */}
            {currentInvoice.status === 'paid' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Payment Date"
                  type="date"
                  value={currentInvoice.paymentDate || ''}
                  onChange={(e) => setCurrentInvoice({ ...currentInvoice, paymentDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={currentInvoice.notes || ''}
                onChange={(e) => setCurrentInvoice({ ...currentInvoice, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={editingId ? handleUpdateInvoice : handleAddInvoice}
            variant="contained"
            startIcon={editingId ? <Save /> : <Add />}
          >
            {editingId ? 'Update' : 'Create Invoice'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientInvoices;
