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
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Person,
  Business,
  Phone,
  CheckCircle,
  Contacts,
  PhoneAndroid,
  AlternateEmail,
} from '@mui/icons-material';

interface ClientContactsProps {
  onClose: () => void;
}

interface ClientContact {
  id: string;
  name: string;
  company: string;
  position: string;
  email: string;
  phone: string;
  mobile: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  category: 'client' | 'supplier' | 'partner' | 'prospect';
  status: 'active' | 'inactive' | 'lead';
  notes?: string;
  createdAt: string;
  lastUpdated: string;
}

const ClientContacts: React.FC<ClientContactsProps> = ({ onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentContact, setCurrentContact] = useState<Partial<ClientContact>>({
    name: '',
    company: '',
    position: '',
    email: '',
    phone: '',
    mobile: '',
    address: '',
    city: '',
    postcode: '',
    country: 'UK',
    category: 'client',
    status: 'active',
    notes: ''
  });

  // Mock contacts data
  const [contacts] = useState<ClientContact[]>([
    {
      id: '1',
      name: 'John Smith',
      company: 'ABC Transport Ltd',
      position: 'Transport Manager',
      email: 'john.smith@abctransport.com',
      phone: '020 7123 4567',
      mobile: '07700 900123',
      address: '123 Transport Way',
      city: 'London',
      postcode: 'SW1A 1AA',
      country: 'UK',
      category: 'client',
      status: 'active',
      notes: 'Main contact for freight deliveries',
      createdAt: '2024-01-15T10:30:00Z',
      lastUpdated: '2024-01-20T14:45:00Z'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      company: 'XYZ Logistics',
      position: 'Operations Director',
      email: 'sarah.johnson@xyzlogistics.co.uk',
      phone: '0161 234 5678',
      mobile: '07800 123456',
      address: '456 Industrial Estate',
      city: 'Manchester',
      postcode: 'M1 1AA',
      country: 'UK',
      category: 'client',
      status: 'active',
      notes: 'Prefers email communication',
      createdAt: '2024-01-10T09:15:00Z',
      lastUpdated: '2024-01-18T11:20:00Z'
    },
    {
      id: '3',
      name: 'Mike Wilson',
      company: 'Truck Parts Supply',
      position: 'Sales Manager',
      email: 'mike.wilson@truckparts.com',
      phone: '0121 345 6789',
      mobile: '07900 654321',
      address: '789 Warehouse Road',
      city: 'Birmingham',
      postcode: 'B1 1AA',
      country: 'UK',
      category: 'supplier',
      status: 'active',
      notes: 'Reliable parts supplier',
      createdAt: '2024-01-05T08:45:00Z',
      lastUpdated: '2024-01-15T16:30:00Z'
    },
    {
      id: '4',
      name: 'Emma Davis',
      company: 'Fast Freight Solutions',
      position: 'Business Development',
      email: 'emma.davis@fastfreight.co.uk',
      phone: '0113 456 7890',
      mobile: '07600 987654',
      address: '321 Business Park',
      city: 'Leeds',
      postcode: 'LS1 1AA',
      country: 'UK',
      category: 'prospect',
      status: 'lead',
      notes: 'Interested in partnership opportunities',
      createdAt: '2024-01-12T13:20:00Z',
      lastUpdated: '2024-01-19T10:15:00Z'
    },
    {
      id: '5',
      name: 'David Brown',
      company: 'National Haulage',
      position: 'Fleet Manager',
      email: 'david.brown@nationalhaulage.com',
      phone: '0141 567 8901',
      mobile: '07500 112233',
      address: '654 Transport Hub',
      city: 'Glasgow',
      postcode: 'G1 1AA',
      country: 'UK',
      category: 'client',
      status: 'active',
      notes: 'Large fleet operator',
      createdAt: '2024-01-08T11:00:00Z',
      lastUpdated: '2024-01-16T15:45:00Z'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'lead': return 'warning';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'client': return <Business />;
      case 'supplier': return <Person />;
      case 'partner': return <CheckCircle />;
      case 'prospect': return <Contacts />;
      default: return <Person />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'client': return 'primary';
      case 'supplier': return 'secondary';
      case 'partner': return 'success';
      case 'prospect': return 'warning';
      default: return 'default';
    }
  };

  const handleAddContact = () => {
    const newContact: ClientContact = {
      ...currentContact as ClientContact,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    // In a real app, this would dispatch to Redux or call an API
    console.log('Adding contact:', newContact);
    setShowAddDialog(false);
    setCurrentContact({
      name: '',
      company: '',
      position: '',
      email: '',
      phone: '',
      mobile: '',
      address: '',
      city: '',
      postcode: '',
      country: 'UK',
      category: 'client',
      status: 'active',
      notes: ''
    });
  };

  const handleEditContact = (contact: ClientContact) => {
    setCurrentContact(contact);
    setShowEditDialog(true);
  };

  const handleUpdateContact = () => {
    const updatedContact: ClientContact = {
      ...currentContact as ClientContact,
      lastUpdated: new Date().toISOString(),
    };
    // In a real app, this would dispatch to Redux or call an API
    console.log('Updating contact:', updatedContact);
    setShowEditDialog(false);
    setCurrentContact({
      name: '',
      company: '',
      position: '',
      email: '',
      phone: '',
      mobile: '',
      address: '',
      city: '',
      postcode: '',
      country: 'UK',
      category: 'client',
      status: 'active',
      notes: ''
    });
  };

  const handleDeleteContact = (id: string) => {
    // In a real app, this would dispatch to Redux or call an API
    console.log('Deleting contact:', id);
  };

  const getFilteredContacts = () => {
    switch (tabValue) {
      case 0: return contacts; // All
      case 1: return contacts.filter(c => c.category === 'client');
      case 2: return contacts.filter(c => c.category === 'supplier');
      case 3: return contacts.filter(c => c.category === 'partner');
      case 4: return contacts.filter(c => c.category === 'prospect');
      default: return contacts;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button onClick={onClose} sx={{ mr: 2 }}>
          ← Back
        </Button>
        <Typography variant="h4" component="h1">
          Client Contacts
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
          <Tab label="All Contacts" />
          <Tab label="Clients" />
          <Tab label="Suppliers" />
          <Tab label="Partners" />
          <Tab label="Prospects" />
        </Tabs>
      </Box>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {tabValue === 0 && 'All Contacts'}
          {tabValue === 1 && 'Clients'}
          {tabValue === 2 && 'Suppliers'}
          {tabValue === 3 && 'Partners'}
          {tabValue === 4 && 'Prospects'}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowAddDialog(true)}
        >
          Add Contact
        </Button>
      </Box>

      <Grid container spacing={3}>
        {getFilteredContacts().map((contact) => (
          <Grid item xs={12} md={6} lg={4} key={contact.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    {getCategoryIcon(contact.category)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div">
                      {contact.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {contact.position} at {contact.company}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PhoneAndroid sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {contact.mobile}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AlternateEmail sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {contact.email}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Phone sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {contact.phone}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Chip 
                    icon={getCategoryIcon(contact.category)}
                    label={contact.category} 
                    color={getCategoryColor(contact.category) as any}
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    label={contact.status} 
                    color={getStatusColor(contact.status) as any}
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => handleEditContact(contact)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => handleDeleteContact(contact.id)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Contact Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Contact</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                value={currentContact.name}
                onChange={(e) => setCurrentContact({ ...currentContact, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company"
                value={currentContact.company}
                onChange={(e) => setCurrentContact({ ...currentContact, company: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Position"
                value={currentContact.position}
                onChange={(e) => setCurrentContact({ ...currentContact, position: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={currentContact.email}
                onChange={(e) => setCurrentContact({ ...currentContact, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={currentContact.phone}
                onChange={(e) => setCurrentContact({ ...currentContact, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mobile"
                value={currentContact.mobile}
                onChange={(e) => setCurrentContact({ ...currentContact, mobile: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={currentContact.address}
                onChange={(e) => setCurrentContact({ ...currentContact, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={currentContact.city}
                onChange={(e) => setCurrentContact({ ...currentContact, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Postcode"
                value={currentContact.postcode}
                onChange={(e) => setCurrentContact({ ...currentContact, postcode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Country"
                value={currentContact.country}
                onChange={(e) => setCurrentContact({ ...currentContact, country: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={currentContact.category}
                  onChange={(e) => setCurrentContact({ ...currentContact, category: e.target.value as any })}
                  label="Category"
                >
                  <MenuItem value="client">Client</MenuItem>
                  <MenuItem value="supplier">Supplier</MenuItem>
                  <MenuItem value="partner">Partner</MenuItem>
                  <MenuItem value="prospect">Prospect</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={currentContact.status}
                  onChange={(e) => setCurrentContact({ ...currentContact, status: e.target.value as any })}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="lead">Lead</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={currentContact.notes}
                onChange={(e) => setCurrentContact({ ...currentContact, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddContact}>Add Contact</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Contact</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                value={currentContact.name}
                onChange={(e) => setCurrentContact({ ...currentContact, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company"
                value={currentContact.company}
                onChange={(e) => setCurrentContact({ ...currentContact, company: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Position"
                value={currentContact.position}
                onChange={(e) => setCurrentContact({ ...currentContact, position: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={currentContact.email}
                onChange={(e) => setCurrentContact({ ...currentContact, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={currentContact.phone}
                onChange={(e) => setCurrentContact({ ...currentContact, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mobile"
                value={currentContact.mobile}
                onChange={(e) => setCurrentContact({ ...currentContact, mobile: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={currentContact.address}
                onChange={(e) => setCurrentContact({ ...currentContact, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={currentContact.city}
                onChange={(e) => setCurrentContact({ ...currentContact, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Postcode"
                value={currentContact.postcode}
                onChange={(e) => setCurrentContact({ ...currentContact, postcode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Country"
                value={currentContact.country}
                onChange={(e) => setCurrentContact({ ...currentContact, country: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={currentContact.category}
                  onChange={(e) => setCurrentContact({ ...currentContact, category: e.target.value as any })}
                  label="Category"
                >
                  <MenuItem value="client">Client</MenuItem>
                  <MenuItem value="supplier">Supplier</MenuItem>
                  <MenuItem value="partner">Partner</MenuItem>
                  <MenuItem value="prospect">Prospect</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={currentContact.status}
                  onChange={(e) => setCurrentContact({ ...currentContact, status: e.target.value as any })}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="lead">Lead</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={currentContact.notes}
                onChange={(e) => setCurrentContact({ ...currentContact, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateContact}>Update Contact</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientContacts;
