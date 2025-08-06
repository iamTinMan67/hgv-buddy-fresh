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
} from '@mui/icons-material';

interface ClientContactsProps {
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
      id={`client-contacts-tabpanel-${index}`}
      aria-labelledby={`client-contacts-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface ClientContact {
  id: string;
  type: 'company' | 'individual';
  companyName?: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  address: {
    line1: string;
    line2: string;
    line3: string;
    town: string;
    postCode: string;
    country: string;
  };
  contact: {
    phone: string;
    mobile: string;
    email: string;
    website?: string;
  };
  billing: {
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    paymentTerms: string;
    taxNumber?: string;
  };
  notes: string;
  isActive: boolean;
  createdAt: string;
  lastUpdated: string;
}

const ClientContacts: React.FC<ClientContactsProps> = ({ onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [currentContact, setCurrentContact] = useState<Partial<ClientContact>>({
    type: 'company',
    companyName: '',
    firstName: '',
    lastName: '',
    position: '',
    address: {
      line1: '',
      line2: '',
      line3: '',
      town: '',
      postCode: '',
      country: 'United Kingdom',
    },
    contact: {
      phone: '',
      mobile: '',
      email: '',
      website: '',
    },
    billing: {
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      paymentTerms: '30 days',
      taxNumber: '',
    },
    notes: '',
    isActive: true,
  });

  // Mock data for client contacts
  const [clientContacts, setClientContacts] = useState<ClientContact[]>([
    {
      id: '1',
      type: 'company',
      companyName: 'ABC Logistics Ltd',
      position: 'Operations Manager',
      address: {
        line1: '123 Business Park',
        line2: 'Unit 5',
        line3: '',
        town: 'Manchester',
        postCode: 'M1 2AB',
        country: 'United Kingdom',
      },
      contact: {
        phone: '0161 123 4567',
        mobile: '07700 900123',
        email: 'info@abclogistics.co.uk',
        website: 'www.abclogistics.co.uk',
      },
      billing: {
        contactName: 'John Smith',
        contactEmail: 'accounts@abclogistics.co.uk',
        contactPhone: '0161 123 4568',
        paymentTerms: '30 days',
        taxNumber: 'GB123456789',
      },
      notes: 'Regular client, prefers email communication',
      isActive: true,
      createdAt: '2023-01-15T10:00:00Z',
      lastUpdated: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      type: 'individual',
      firstName: 'Sarah',
      lastName: 'Johnson',
      position: 'Freelance Consultant',
      address: {
        line1: '456 Oak Street',
        line2: 'Apartment 3B',
        line3: '',
        town: 'Liverpool',
        postCode: 'L1 2CD',
        country: 'United Kingdom',
      },
      contact: {
        phone: '0151 234 5678',
        mobile: '07700 900456',
        email: 'sarah.johnson@email.com',
        website: '',
      },
      billing: {
        contactName: 'Sarah Johnson',
        contactEmail: 'sarah.johnson@email.com',
        contactPhone: '0151 234 5678',
        paymentTerms: '14 days',
        taxNumber: '',
      },
      notes: 'Individual client, occasional jobs',
      isActive: true,
      createdAt: '2023-03-20T14:30:00Z',
      lastUpdated: '2024-01-10T14:30:00Z',
    },
    {
      id: '3',
      type: 'company',
      companyName: 'XYZ Transport Solutions',
      position: 'Fleet Manager',
      address: {
        line1: '789 Industrial Estate',
        line2: 'Building 12',
        line3: 'Floor 2',
        town: 'Birmingham',
        postCode: 'B1 3EF',
        country: 'United Kingdom',
      },
      contact: {
        phone: '0121 345 6789',
        mobile: '07700 900789',
        email: 'fleet@xyztransport.co.uk',
        website: 'www.xyztransport.co.uk',
      },
      billing: {
        contactName: 'Mike Wilson',
        contactEmail: 'accounts@xyztransport.co.uk',
        contactPhone: '0121 345 6790',
        paymentTerms: '45 days',
        taxNumber: 'GB987654321',
      },
      notes: 'Large fleet client, requires detailed reporting',
      isActive: true,
      createdAt: '2023-06-10T09:15:00Z',
      lastUpdated: '2024-01-05T09:15:00Z',
    },
  ]);

  const handleAddContact = () => {
    const newContact: ClientContact = {
      id: Date.now().toString(),
      ...currentContact as ClientContact,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    setClientContacts([...clientContacts, newContact]);
    setCurrentContact({
      type: 'company',
      companyName: '',
      firstName: '',
      lastName: '',
      position: '',
      address: { line1: '', line2: '', line3: '', town: '', postCode: '', country: 'United Kingdom' },
      contact: { phone: '', mobile: '', email: '', website: '' },
      billing: { contactName: '', contactEmail: '', contactPhone: '', paymentTerms: '30 days', taxNumber: '' },
      notes: '',
      isActive: true,
    });
    setShowAddDialog(false);
  };

  const handleEditContact = (contact: ClientContact) => {
    setCurrentContact(contact);
    setEditingId(contact.id);
    setShowAddDialog(true);
  };

  const handleUpdateContact = () => {
    if (!editingId) return;
    const updatedContacts = clientContacts.map(contact =>
      contact.id === editingId
        ? { ...currentContact, id: editingId, lastUpdated: new Date().toISOString() } as ClientContact
        : contact
    );
    setClientContacts(updatedContacts);
    setCurrentContact({
      type: 'company',
      companyName: '',
      firstName: '',
      lastName: '',
      position: '',
      address: { line1: '', line2: '', line3: '', town: '', postCode: '', country: 'United Kingdom' },
      contact: { phone: '', mobile: '', email: '', website: '' },
      billing: { contactName: '', contactEmail: '', contactPhone: '', paymentTerms: '30 days', taxNumber: '' },
      notes: '',
      isActive: true,
    });
    setEditingId(null);
    setShowAddDialog(false);
  };

  const handleDeleteContact = (id: string) => {
    setClientContacts(clientContacts.filter(contact => contact.id !== id));
  };

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'company': return 'primary';
      case 'individual': return 'secondary';
      default: return 'default';
    }
  };

  const getContactTypeIcon = (type: string) => {
    switch (type) {
      case 'company': return <Business />;
      case 'individual': return <Person />;
      default: return <Person />;
    }
  };

  const activeContacts = clientContacts.filter(c => c.isActive).length;
  const totalContacts = clientContacts.length;
  const companyContacts = clientContacts.filter(c => c.type === 'company').length;
  const individualContacts = clientContacts.filter(c => c.type === 'individual').length;

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <Contacts sx={{ mr: 1, verticalAlign: 'middle' }} />
          Client Contacts
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
              <Contacts sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">Total Contacts</Typography>
              <Typography variant="h4" color="primary">
                {totalContacts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Person sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h6">Active Contacts</Typography>
              <Typography variant="h4" color="success.main">
                {activeContacts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Business sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h6">Companies</Typography>
              <Typography variant="h4" color="info.main">
                {companyContacts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Person sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h6">Individuals</Typography>
              <Typography variant="h4" color="warning.main">
                {individualContacts}
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
          <Tab label="All Contacts" />
          <Tab label="Companies" />
          <Tab label="Individuals" />
          <Tab label="Reports" />
        </Tabs>
      </Box>

      {/* All Contacts Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">All Client Contacts</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowAddDialog(true)}
          >
            Add Contact
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Contact</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Contact Details</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Billing Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: getContactTypeColor(contact.type) }}>
                        {getContactTypeIcon(contact.type)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1">
                          {contact.type === 'company' 
                            ? contact.companyName 
                            : `${contact.firstName} ${contact.lastName}`
                          }
                        </Typography>
                        {contact.position && (
                          <Typography variant="caption" color="text.secondary">
                            {contact.position}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getContactTypeIcon(contact.type)}
                      label={contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
                      color={getContactTypeColor(contact.type) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        <Phone sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                        {contact.contact.phone}
                      </Typography>
                      <Typography variant="body2">
                        <PhoneAndroid sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                        {contact.contact.mobile}
                      </Typography>
                      <Typography variant="body2">
                        <AlternateEmail sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                        {contact.contact.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{contact.address.line1}</Typography>
                      {contact.address.line2 && (
                        <Typography variant="body2">{contact.address.line2}</Typography>
                      )}
                      <Typography variant="body2">
                        {contact.address.town}, {contact.address.postCode}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{contact.billing.contactName}</Typography>
                      <Typography variant="body2">{contact.billing.contactEmail}</Typography>
                      <Typography variant="body2">{contact.billing.paymentTerms}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={contact.isActive ? 'Active' : 'Inactive'}
                      color={contact.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEditContact(contact)}
                      sx={{ mr: 1 }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteContact(contact.id)}
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

      {/* Companies Tab */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Company Contacts
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Company</TableCell>
                <TableCell>Contact Person</TableCell>
                <TableCell>Contact Details</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Billing</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientContacts
                .filter(contact => contact.type === 'company')
                .map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <Business />
                        </Avatar>
                        <Box>
                          <Typography variant="body1">{contact.companyName}</Typography>
                          {contact.position && (
                            <Typography variant="caption" color="text.secondary">
                              {contact.position}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{contact.billing.contactName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{contact.contact.phone}</Typography>
                        <Typography variant="body2">{contact.contact.email}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{contact.address.town}, {contact.address.postCode}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{contact.billing.paymentTerms}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={contact.isActive ? 'Active' : 'Inactive'}
                        color={contact.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditContact(contact)}
                        sx={{ mr: 1 }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteContact(contact.id)}
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

      {/* Individuals Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Individual Contacts
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Contact Details</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Billing</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientContacts
                .filter(contact => contact.type === 'individual')
                .map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography variant="body1">
                            {contact.firstName} {contact.lastName}
                          </Typography>
                          {contact.position && (
                            <Typography variant="caption" color="text.secondary">
                              {contact.position}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{contact.position}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{contact.contact.phone}</Typography>
                        <Typography variant="body2">{contact.contact.email}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{contact.address.town}, {contact.address.postCode}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{contact.billing.paymentTerms}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={contact.isActive ? 'Active' : 'Inactive'}
                        color={contact.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditContact(contact)}
                        sx={{ mr: 1 }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteContact(contact.id)}
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

      {/* Reports Tab */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Contact Reports
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contact Distribution
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Companies:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {companyContacts} ({((companyContacts / totalContacts) * 100).toFixed(1)}%)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Individuals:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {individualContacts} ({((individualContacts / totalContacts) * 100).toFixed(1)}%)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Active Contacts:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {activeContacts} ({((activeContacts / totalContacts) * 100).toFixed(1)}%)
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <List dense>
                  {clientContacts
                    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                    .slice(0, 5)
                    .map((contact) => (
                      <ListItem key={contact.id}>
                        <ListItemIcon>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: getContactTypeColor(contact.type) }}>
                            {getContactTypeIcon(contact.type)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            contact.type === 'company' 
                              ? contact.companyName 
                              : `${contact.firstName} ${contact.lastName}`
                          }
                          secondary={`Updated: ${new Date(contact.lastUpdated).toLocaleDateString()}`}
                        />
                      </ListItem>
                    ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Add/Edit Contact Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Client Contact' : 'Add New Client Contact'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Contact Type */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Contact Type *</InputLabel>
                <Select
                  value={currentContact.type || 'company'}
                  onChange={(e) => setCurrentContact({ ...currentContact, type: e.target.value as 'company' | 'individual' })}
                  label="Contact Type *"
                >
                  <MenuItem value="company">Company</MenuItem>
                  <MenuItem value="individual">Individual</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Company/Individual Information */}
            {currentContact.type === 'company' ? (
              <>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Company Name *"
                    value={currentContact.companyName || ''}
                    onChange={(e) => setCurrentContact({ ...currentContact, companyName: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Position"
                    value={currentContact.position || ''}
                    onChange={(e) => setCurrentContact({ ...currentContact, position: e.target.value })}
                  />
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name *"
                    value={currentContact.firstName || ''}
                    onChange={(e) => setCurrentContact({ ...currentContact, firstName: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name *"
                    value={currentContact.lastName || ''}
                    onChange={(e) => setCurrentContact({ ...currentContact, lastName: e.target.value })}
                    required
                  />
                </Grid>
              </>
            )}

            {/* Address Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Address Information
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 1 *"
                value={currentContact.address?.line1 || ''}
                onChange={(e) => setCurrentContact({
                  ...currentContact,
                  address: { ...currentContact.address!, line1: e.target.value }
                })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 2"
                value={currentContact.address?.line2 || ''}
                onChange={(e) => setCurrentContact({
                  ...currentContact,
                  address: { ...currentContact.address!, line2: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 3"
                value={currentContact.address?.line3 || ''}
                onChange={(e) => setCurrentContact({
                  ...currentContact,
                  address: { ...currentContact.address!, line3: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Town *"
                value={currentContact.address?.town || ''}
                onChange={(e) => setCurrentContact({
                  ...currentContact,
                  address: { ...currentContact.address!, town: e.target.value }
                })}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Post Code *"
                value={currentContact.address?.postCode || ''}
                onChange={(e) => setCurrentContact({
                  ...currentContact,
                  address: { ...currentContact.address!, postCode: e.target.value }
                })}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Country *"
                value={currentContact.address?.country || ''}
                onChange={(e) => setCurrentContact({
                  ...currentContact,
                  address: { ...currentContact.address!, country: e.target.value }
                })}
                required
              />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Contact Details
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={currentContact.contact?.phone || ''}
                onChange={(e) => setCurrentContact({
                  ...currentContact,
                  contact: { ...currentContact.contact!, phone: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mobile *"
                value={currentContact.contact?.mobile || ''}
                onChange={(e) => setCurrentContact({
                  ...currentContact,
                  contact: { ...currentContact.contact!, mobile: e.target.value }
                })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={currentContact.contact?.email || ''}
                onChange={(e) => setCurrentContact({
                  ...currentContact,
                  contact: { ...currentContact.contact!, email: e.target.value }
                })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Website"
                value={currentContact.contact?.website || ''}
                onChange={(e) => setCurrentContact({
                  ...currentContact,
                  contact: { ...currentContact.contact!, website: e.target.value }
                })}
              />
            </Grid>

            {/* Billing Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Billing Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Billing Contact Name *"
                value={currentContact.billing?.contactName || ''}
                onChange={(e) => setCurrentContact({
                  ...currentContact,
                  billing: { ...currentContact.billing!, contactName: e.target.value }
                })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Billing Contact Email *"
                type="email"
                value={currentContact.billing?.contactEmail || ''}
                onChange={(e) => setCurrentContact({
                  ...currentContact,
                  billing: { ...currentContact.billing!, contactEmail: e.target.value }
                })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Billing Contact Phone *"
                value={currentContact.billing?.contactPhone || ''}
                onChange={(e) => setCurrentContact({
                  ...currentContact,
                  billing: { ...currentContact.billing!, contactPhone: e.target.value }
                })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Terms *</InputLabel>
                <Select
                  value={currentContact.billing?.paymentTerms || '30 days'}
                  onChange={(e) => setCurrentContact({
                    ...currentContact,
                    billing: { ...currentContact.billing!, paymentTerms: e.target.value }
                  })}
                  label="Payment Terms *"
                >
                  <MenuItem value="7 days">7 days</MenuItem>
                  <MenuItem value="14 days">14 days</MenuItem>
                  <MenuItem value="30 days">30 days</MenuItem>
                  <MenuItem value="45 days">45 days</MenuItem>
                  <MenuItem value="60 days">60 days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tax Number (VAT)"
                value={currentContact.billing?.taxNumber || ''}
                onChange={(e) => setCurrentContact({
                  ...currentContact,
                  billing: { ...currentContact.billing!, taxNumber: e.target.value }
                })}
              />
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={currentContact.notes || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, notes: e.target.value })}
              />
            </Grid>

            {/* Active Status */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentContact.isActive || false}
                    onChange={(e) => setCurrentContact({ ...currentContact, isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={editingId ? handleUpdateContact : handleAddContact}
            variant="contained"
            startIcon={editingId ? <Save /> : <Add />}
          >
            {editingId ? 'Update' : 'Add Contact'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientContacts;
