import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Divider,
  Chip,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Collapse,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { jobIdGenerator } from '../utils/jobIdGenerator';
import { AppDispatch } from '../store';
import { addJob, addDailySchedule } from '../store/slices/jobSlice';
import { JobAssignment, JobStatus, JobLocation, JobPriority } from '../store/slices/jobSlice';
import {
  Assignment,
  Home,
  Save,
  Cancel,
  Add,
  Delete,
  Edit,
  PersonAdd,
} from '@mui/icons-material';

interface JobConsignmentFormProps {
  onClose: () => void;
}

interface StructuredAddress {
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  town: string;
  city: string;
  postcode: string;
}

interface PostcodeLookupResult {
  postcode: string;
  addresses: string[];
}

interface JobConsignmentData {
  jobId: string;
  clientName: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  pickupAddress: StructuredAddress;
  deliveryAddress: StructuredAddress;
  pickupDate: string;
  pickupTime: string;
  deliveryDate: string;
  deliveryTime: string;
  alternateDeliveryAddress: StructuredAddress;
  useSecondAlternateDeliveryAddress: boolean;
  secondAlternateDeliveryAddress: StructuredAddress;
  cargoType: string;
  cargoWeight: number;
  cargoVolume: number;
  specialRequirements: string[];
  notes: string;
  estimatedDuration: number;
  estimatedCost: number;
}

interface Client {
  id: string;
  name: string;
  company: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  town: string;
  city: string;
  postcode: string;
  phone: string;
  email: string;
}

const JobConsignmentForm: React.FC<JobConsignmentFormProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeStep, setActiveStep] = useState(0);
  // Get tomorrow's date for default values
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowString = tomorrow.toISOString().split('T')[0];



  // Mock clients data
  const clients: Client[] = [
    {
      id: '1',
      name: 'John Smith',
      company: 'ABC Transport Ltd',
      addressLine1: '123 Transport Way',
      addressLine2: '',
      addressLine3: '',
      town: 'Westminster',
      city: 'London',
      postcode: 'SW1A 1AA',
      phone: '020 7123 4567',
      email: 'john.smith@abctransport.com'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      company: 'XYZ Logistics',
      addressLine1: '456 Industrial Estate',
      addressLine2: 'Unit 12',
      addressLine3: '',
      town: 'Salford',
      city: 'Manchester',
      postcode: 'M1 1AA',
      phone: '0161 234 5678',
      email: 'sarah.johnson@xyzlogistics.co.uk'
    },
    {
      id: '3',
      name: 'David Wilson',
      company: 'Wilson Freight Services',
      addressLine1: '789 Business Park',
      addressLine2: 'Building A',
      addressLine3: 'Floor 3',
      town: 'Digbeth',
      city: 'Birmingham',
      postcode: 'B1 1AA',
      phone: '0121 345 6789',
      email: 'david.wilson@wilsonfreight.co.uk'
    }
  ];

  const [formData, setFormData] = useState<JobConsignmentData>({
    jobId: '',
    clientName: '',
    priority: 'medium',
    pickupAddress: {
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      town: '',
      city: '',
      postcode: '',
    },
    deliveryAddress: {
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      town: '',
      city: '',
      postcode: '',
    },
    pickupDate: tomorrowString,
    pickupTime: '12:00',
    deliveryDate: tomorrowString,
    deliveryTime: '12:00',
    alternateDeliveryAddress: {
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      town: '',
      city: '',
      postcode: '',
    },
    useSecondAlternateDeliveryAddress: false,
    secondAlternateDeliveryAddress: {
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      town: '',
      city: '',
      postcode: '',
    },
    cargoType: '',
    cargoWeight: 0,
    cargoVolume: 0,
    specialRequirements: [],
    notes: '',
    estimatedDuration: 0,
    estimatedCost: 0,
  });

  // Postcode lookup state
  const [pickupPostcodeResults, setPickupPostcodeResults] = useState<PostcodeLookupResult[]>([]);
  const [deliveryPostcodeResults, setDeliveryPostcodeResults] = useState<PostcodeLookupResult[]>([]);
  const [showPickupPostcodeLookup, setShowPickupPostcodeLookup] = useState(false);
  const [showDeliveryPostcodeLookup, setShowDeliveryPostcodeLookup] = useState(false);
  const [isLoadingPostcode, setIsLoadingPostcode] = useState(false);

  // Client form dialog state
  const [showClientForm, setShowClientForm] = useState(false);
  const [newClient, setNewClient] = useState<Omit<Client, 'id'>>({
    name: '',
    company: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    town: '',
    city: '',
    postcode: '',
    phone: '',
    email: '',
  });

  // Auto-generate Job ID when component mounts
  useEffect(() => {
    const generateAndSetJobId = async () => {
      try {
        const newJobId = await jobIdGenerator.generateJobId();
        setFormData(prev => ({ ...prev, jobId: newJobId }));
      } catch (error) {
        console.error('Error generating Job ID:', error);
        // Fallback to a timestamp-based ID if generation fails
        const fallbackId = `JOB-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`;
        setFormData(prev => ({ ...prev, jobId: fallbackId }));
      }
    };
    
    generateAndSetJobId();
  }, []);

  const [newRequirement, setNewRequirement] = useState('');

  const steps = [
    'Driver, Vehicle & Route',
    'Cargo Information',
    'Review & Submit'
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = () => {
    // Convert form data to JobAssignment format
    const jobAssignment: JobAssignment = {
      id: formData.jobId,
      jobNumber: formData.jobId,
      title: `Job for ${formData.clientName}`,
      description: `Cargo: ${formData.cargoType}, Weight: ${formData.cargoWeight}kg`,
      customerName: formData.clientName,

      priority: formData.priority as JobPriority,
      status: 'pending' as JobStatus,

      scheduledDate: formData.pickupDate,
      scheduledTime: formData.pickupTime,
      estimatedDuration: formData.estimatedDuration,
      pickupLocation: {
        id: `pickup-${formData.jobId}`,
        name: 'Pickup Location',
        address: formData.pickupAddress.addressLine1,
        postcode: formData.pickupAddress.postcode,
      },
      deliveryLocation: {
        id: `delivery-${formData.jobId}`,
        name: 'Delivery Location',
        address: formData.useSecondAlternateDeliveryAddress ? formData.alternateDeliveryAddress.addressLine1 : formData.deliveryAddress.addressLine1,
        postcode: formData.useSecondAlternateDeliveryAddress ? formData.alternateDeliveryAddress.postcode : formData.deliveryAddress.postcode,
      },
      useDifferentDeliveryAddress: formData.useSecondAlternateDeliveryAddress,
      deliveryAddress: formData.useSecondAlternateDeliveryAddress 
        ? `${formData.alternateDeliveryAddress.addressLine1}, ${formData.alternateDeliveryAddress.town}, ${formData.alternateDeliveryAddress.city}, ${formData.alternateDeliveryAddress.postcode}`
        : `${formData.deliveryAddress.addressLine1}, ${formData.deliveryAddress.town}, ${formData.deliveryAddress.city}, ${formData.deliveryAddress.postcode}`,
      cargoType: formData.cargoType,
      cargoWeight: formData.cargoWeight,
      specialRequirements: formData.specialRequirements.join(', '),
      notes: formData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user', // Would need to get from auth context
      authorizedBy: 'current-user', // Would need to get from auth context
      loadDimensions: {
        length: 0, // Would need to add to form
        width: 0, // Would need to add to form
        height: 0, // Would need to add to form
        weight: formData.cargoWeight,
        volume: formData.cargoVolume,
        isOversized: false,
        isProtruding: false,
        isBalanced: true,
        isFragile: false,
      }
    };

    // Dispatch to Redux store
    dispatch(addJob(jobAssignment));

    // Create a daily schedule entry
    const dailySchedule = {
      id: `schedule-${formData.jobId}`,
      date: formData.pickupDate,
      jobs: [{
        jobId: formData.jobId,
        scheduledTime: formData.pickupTime,
        estimatedDuration: formData.estimatedDuration,
        status: 'pending' as JobStatus,
      }],
      totalJobs: 1,
      completedJobs: 0,
      totalDistance: 0, // Would calculate from coordinates
      totalDuration: formData.estimatedDuration,
      status: 'pending' as const,
      notes: `Job created from consignment form`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(addDailySchedule(dailySchedule));

    console.log('Job saved to Redux store:', jobAssignment);
    console.log('Daily schedule created:', dailySchedule);
    
    // Close the form
    onClose();
  };

  const handleInputChange = (field: keyof JobConsignmentData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressFieldChange = (addressType: 'pickupAddress' | 'deliveryAddress', field: keyof StructuredAddress, value: string) => {
    setFormData(prev => ({
      ...prev,
      [addressType]: {
        ...prev[addressType],
        [field]: value
      }
    }));
  };

  const handleLocationChange = (field: 'pickupAddress' | 'deliveryAddress', value: string) => {
    // Format commas to line breaks for location fields
    const formattedValue = value.replace(/, /g, ',\n');
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        addressLine1: formattedValue
      }
    }));
  };

  const handleClientChange = (clientName: string) => {
    const selectedClient = clients.find(client => client.name === clientName);
    if (selectedClient) {
      const fullAddress = `${selectedClient.address}, ${selectedClient.city}, ${selectedClient.postcode}`;
      const formattedAddress = fullAddress.replace(/, /g, ',\n');
      setFormData(prev => ({
        ...prev,
        clientName: clientName,
        pickupAddress: {
          addressLine1: selectedClient.address,
          addressLine2: '',
          addressLine3: '',
          town: '',
          city: selectedClient.city,
          postcode: selectedClient.postcode,
        },
        deliveryAddress: {
          addressLine1: selectedClient.address,
          addressLine2: '',
          addressLine3: '',
          town: '',
          city: selectedClient.city,
          postcode: selectedClient.postcode,
        },

      }));
      
      // Focus on pickup location field after client selection
      setTimeout(() => {
        const pickupLocationField = document.querySelector('textarea[name="pickupAddress"]') as HTMLTextAreaElement;
        if (pickupLocationField) {
          pickupLocationField.focus();
        }
      }, 100);
    } else {
      setFormData(prev => ({
        ...prev,
        clientName: clientName,
        pickupAddress: {
          addressLine1: '',
          addressLine2: '',
          addressLine3: '',
          town: '',
          city: '',
          postcode: '',
        },
        deliveryAddress: {
          addressLine1: '',
          addressLine2: '',
          addressLine3: '',
          town: '',
          city: '',
          postcode: '',
        },

      }));
      
      // Focus on pickup location field even if no client is selected
      setTimeout(() => {
        const pickupLocationField = document.querySelector('textarea[name="pickupAddress"]') as HTMLTextAreaElement;
        if (pickupLocationField) {
          pickupLocationField.focus();
        }
      }, 100);
    }
  };

  // Postcode lookup functions
  const handlePostcodeLookup = async (postcode: string, addressType: 'pickup' | 'delivery') => {
    if (!postcode || postcode.length < 3) {
      if (addressType === 'pickup') {
        setPickupPostcodeResults([]);
        setShowPickupPostcodeLookup(false);
      } else {
        setDeliveryPostcodeResults([]);
        setShowDeliveryPostcodeLookup(false);
      }
      return;
    }

    setIsLoadingPostcode(true);
    try {
      // Use postcodes.io API for postcode lookup
      const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}/autocomplete`);
      if (response.ok) {
        const data = await response.json();
        const results: PostcodeLookupResult[] = data.result.map((result: string) => ({
          postcode: result,
          addresses: [result] // For now, just show the postcode
        }));

        if (addressType === 'pickup') {
          setPickupPostcodeResults(results);
          setShowPickupPostcodeLookup(results.length > 0);
        } else {
          setDeliveryPostcodeResults(results);
          setShowDeliveryPostcodeLookup(results.length > 0);
        }
      } else {
        // Fallback to mock data if API fails
        const mockResults: PostcodeLookupResult[] = [
          { postcode: postcode, addresses: [`${postcode} - Mock Address 1`] },
          { postcode: postcode, addresses: [`${postcode} - Mock Address 2`] }
        ];
        
        if (addressType === 'pickup') {
          setPickupPostcodeResults(mockResults);
          setShowPickupPostcodeLookup(true);
        } else {
          setDeliveryPostcodeResults(mockResults);
          setShowDeliveryPostcodeLookup(true);
        }
      }
    } catch (error) {
      console.error('Postcode lookup error:', error);
      // Fallback to mock data
      const mockResults: PostcodeLookupResult[] = [
        { postcode: postcode, addresses: [`${postcode} - Mock Address 1`] },
        { postcode: postcode, addresses: [`${postcode} - Mock Address 2`] }
      ];
      
      if (addressType === 'pickup') {
        setPickupPostcodeResults(mockResults);
        setShowPickupPostcodeLookup(true);
      } else {
        setDeliveryPostcodeResults(mockResults);
        setShowDeliveryPostcodeLookup(true);
      }
    } finally {
      setIsLoadingPostcode(false);
    }
  };

  const handlePostcodeSelection = (selectedPostcode: string, addressType: 'pickup' | 'delivery') => {
    // For now, we'll populate with mock structured address data
    // In a real implementation, you'd make another API call to get full address details
    const mockAddress: StructuredAddress = {
      addressLine1: `123 ${selectedPostcode} Street`,
      addressLine2: 'Business District',
      addressLine3: '',
      town: 'Sample Town',
      city: 'Sample City',
      postcode: selectedPostcode,
    };

    if (addressType === 'pickup') {
      setFormData(prev => ({
        ...prev,
        pickupAddress: mockAddress
      }));
      setShowPickupPostcodeLookup(false);
    } else {
      setFormData(prev => ({
        ...prev,
        deliveryAddress: mockAddress
      }));
      setShowDeliveryPostcodeLookup(false);
    }
  };

  const handlePostcodeChange = (postcode: string, addressType: 'pickup' | 'delivery') => {
    // Update the postcode field
    if (addressType === 'pickup') {
      handleAddressFieldChange('pickupAddress', 'postcode', postcode);
    } else {
      handleAddressFieldChange('deliveryAddress', 'postcode', postcode);
    }

    // Debounce the lookup
    const timeoutId = setTimeout(() => {
      handlePostcodeLookup(postcode, addressType);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const addSpecialRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        specialRequirements: [...prev.specialRequirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeSpecialRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialRequirements: prev.specialRequirements.filter((_, i) => i !== index)
    }));
  };

  // Client form functions
  const handleAddClient = () => {
    setShowClientForm(true);
  };

  const handleClientFormClose = () => {
    setShowClientForm(false);
    setNewClient({
      name: '',
      company: '',
      address: '',
      city: '',
      postcode: '',
      phone: '',
      email: '',
    });
  };

  const handleClientFormSubmit = () => {
    // Create a new client with a generated ID
    const newClientWithId: Client = {
      ...newClient,
      id: `client-${Date.now()}`,
    };
    
    // Add to clients array (in a real app, this would be saved to a database)
    // For now, we'll just close the dialog and the user can refresh
    console.log('New client created:', newClientWithId);
    
    // Close the dialog
    handleClientFormClose();
    
    // In a real app, you would dispatch an action to add the client to the store
    // dispatch(addClient(newClientWithId));
  };

  const handleNewClientInputChange = (field: keyof Omit<Client, 'id'>, value: string) => {
    setNewClient(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'black', minHeight: '100vh', color: 'white' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: 'white' }}>
          <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
          Job Consignment Form
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ color: 'yellow' }}
        >
          <Home />
        </IconButton>
      </Box>

      <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', color: 'white' }}>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="vertical" sx={{ color: 'white' }}>
            {steps.map((step, index) => (
              <Step key={step}>
                <StepLabel sx={{ color: 'white' }}>{step}</StepLabel>
                <StepContent>
                  <Box sx={{ mb: 2 }}>
                    {index === 0 && (
                      <Grid container spacing={3}>
                        {/* Client Name */}
                        <Grid item xs={6} md={3}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                          <FormControl fullWidth>
                            <InputLabel sx={{ color: 'grey.400' }}>Client Name</InputLabel>
                            <Select
                              value={formData.clientName}
                              onChange={(e) => handleClientChange(e.target.value)}
                              sx={{ 
                                color: 'white',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                              }}
                            >
                              <MenuItem value="">
                                <em>Select a client</em>
                              </MenuItem>
                              {clients.map((client) => (
                                <MenuItem key={client.id} value={client.name}>
                                  {client.name} - {client.company}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                            <IconButton
                              onClick={handleAddClient}
                            sx={{ 
                                color: 'primary.main',
                                border: '1px solid',
                                borderColor: 'primary.main',
                                '&:hover': {
                                  backgroundColor: 'primary.main',
                                  color: 'white'
                                }
                              }}
                              title="Add New Client"
                            >
                              <PersonAdd />
                            </IconButton>
                          </Box>
                        </Grid>
                        

                        
                        {/* Priority */}
                        <Grid item xs={6} md={3}>
                          <FormControl fullWidth>
                            <InputLabel sx={{ color: 'grey.400' }}>Priority</InputLabel>
                            <Select
                              value={formData.priority}
                              onChange={(e) => handleInputChange('priority', e.target.value)}
                              sx={{ 
                                color: 'white',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                              }}
                            >
                              <MenuItem value="low">Low</MenuItem>
                              <MenuItem value="medium">Medium</MenuItem>
                              <MenuItem value="high">High</MenuItem>
                              <MenuItem value="urgent">Urgent</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        

                        
                        {/* Pickup and Delivery Location - Reduced width by 50%, increased length by 5% */}
                        <Grid item xs={12}>
                          <Grid container spacing={2}>
                            <Grid item xs={3}>
                              <TextField
                                fullWidth
                                label="Pickup Location"
                                value={`${formData.pickupAddress.addressLine1}${formData.pickupAddress.addressLine2 ? ', ' + formData.pickupAddress.addressLine2 : ''}${formData.pickupAddress.addressLine3 ? ', ' + formData.pickupAddress.addressLine3 : ''}${formData.pickupAddress.town ? ', ' + formData.pickupAddress.town : ''}${formData.pickupAddress.city ? ', ' + formData.pickupAddress.city : ''}`}
                                onChange={(e) => {
                                  // Parse the combined address back into structured fields
                                  const addressParts = e.target.value.split(',').map(part => part.trim());
                                  const newAddress: StructuredAddress = {
                                    addressLine1: addressParts[0] || '',
                                    addressLine2: addressParts[1] || '',
                                    addressLine3: addressParts[2] || '',
                                    town: addressParts[3] || '',
                                    city: addressParts[4] || '',
                                    postcode: formData.pickupAddress.postcode,
                                  };
                                  setFormData(prev => ({
                                    ...prev,
                                    pickupAddress: newAddress
                                  }));
                                }}
                                multiline
                                rows={4}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    const deliveryLocationField = document.querySelector('textarea[name="deliveryAddress"]') as HTMLTextAreaElement;
                                    if (deliveryLocationField) {
                                      deliveryLocationField.focus();
                                    }
                                  }
                                }}
                                name="pickupAddress"
                                sx={{ 
                                  '& .MuiOutlinedInput-root': { color: 'white' },
                                  '& .MuiInputLabel-root': { color: 'grey.400' },
                                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                                }}
                              />
                            </Grid>
                            <Grid item xs={3}>
                              <TextField
                                fullWidth
                                label="Delivery Location"
                                value={`${formData.deliveryAddress.addressLine1}${formData.deliveryAddress.addressLine2 ? ', ' + formData.deliveryAddress.addressLine2 : ''}${formData.deliveryAddress.addressLine3 ? ', ' + formData.deliveryAddress.addressLine3 : ''}${formData.deliveryAddress.town ? ', ' + formData.deliveryAddress.town : ''}${formData.deliveryAddress.city ? ', ' + formData.deliveryAddress.city : ''}`}
                                onChange={(e) => {
                                  // Parse the combined address back into structured fields
                                  const addressParts = e.target.value.split(',').map(part => part.trim());
                                  const newAddress: StructuredAddress = {
                                    addressLine1: addressParts[0] || '',
                                    addressLine2: addressParts[1] || '',
                                    addressLine3: addressParts[2] || '',
                                    town: addressParts[3] || '',
                                    city: addressParts[4] || '',
                                    postcode: formData.deliveryAddress.postcode,
                                  };
                                  setFormData(prev => ({
                                    ...prev,
                                    deliveryAddress: newAddress
                                  }));
                                }}
                                multiline
                                rows={4}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    const nextField = document.querySelector('input[name="pickupDate"]') as HTMLInputElement;
                                    if (nextField) {
                                      nextField.focus();
                                    }
                                  }
                                }}
                                name="deliveryAddress"
                                sx={{ 
                                  '& .MuiOutlinedInput-root': { color: 'white' },
                                  '& .MuiInputLabel-root': { color: 'grey.400' },
                                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                                }}
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                        
                        {/* Pickup and Delivery Postcodes with Lookup */}
                        <Grid item xs={12}>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                label="Pickup Postcode"
                                value={formData.pickupAddress.postcode}
                                onChange={(e) => handlePostcodeChange(e.target.value, 'pickup')}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const deliveryPostcodeField = document.querySelector('input[name="deliveryPostcode"]') as HTMLInputElement;
                                    if (deliveryPostcodeField) {
                                      deliveryPostcodeField.focus();
                                    }
                                  }
                                }}
                                name="pickupPostcode"
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      {isLoadingPostcode ? (
                                        <CircularProgress size={20} />
                                      ) : (
                                        <IconButton
                                          onClick={() => handlePostcodeLookup(formData.pickupAddress.postcode, 'pickup')}
                                          size="small"
                                        >
                                          <Search />
                                        </IconButton>
                                      )}
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{ 
                                  '& .MuiOutlinedInput-root': { color: 'white' },
                                  '& .MuiInputLabel-root': { color: 'grey.400' },
                                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                                }}
                              />
                              <Collapse in={showPickupPostcodeLookup}>
                                <List sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', mt: 1, borderRadius: 1 }}>
                                  {pickupPostcodeResults.map((result, index) => (
                                    <ListItem key={index} disablePadding>
                                      <ListItemButton
                                        onClick={() => handlePostcodeSelection(result.postcode, 'pickup')}
                                        sx={{ color: 'white' }}
                                      >
                                        <ListItemText primary={result.postcode} />
                                      </ListItemButton>
                                    </ListItem>
                                  ))}
                                </List>
                              </Collapse>
                            </Grid>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                label="Delivery Postcode"
                                value={formData.deliveryAddress.postcode}
                                onChange={(e) => handlePostcodeChange(e.target.value, 'delivery')}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const nextField = document.querySelector('input[name="pickupDate"]') as HTMLInputElement;
                                    if (nextField) {
                                      nextField.focus();
                                    }
                                  }
                                }}
                                name="deliveryPostcode"
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      {isLoadingPostcode ? (
                                        <CircularProgress size={20} />
                                      ) : (
                                        <IconButton
                                          onClick={() => handlePostcodeLookup(formData.deliveryAddress.postcode, 'delivery')}
                                          size="small"
                                        >
                                          <Search />
                                        </IconButton>
                                      )}
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{ 
                                  '& .MuiOutlinedInput-root': { color: 'white' },
                                  '& .MuiInputLabel-root': { color: 'grey.400' },
                                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                                }}
                              />
                              <Collapse in={showDeliveryPostcodeLookup}>
                                <List sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', mt: 1, borderRadius: 1 }}>
                                  {deliveryPostcodeResults.map((result, index) => (
                                    <ListItem key={index} disablePadding>
                                      <ListItemButton
                                        onClick={() => handlePostcodeSelection(result.postcode, 'delivery')}
                                        sx={{ color: 'white' }}
                                      >
                                        <ListItemText primary={result.postcode} />
                                      </ListItemButton>
                                    </ListItem>
                                  ))}
                                </List>
                              </Collapse>
                            </Grid>
                          </Grid>
                        </Grid>
                        
                        {/* Second Alternate Delivery Address Checkbox */}
                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.useSecondAlternateDeliveryAddress}
                                onChange={(e) => handleInputChange('useSecondAlternateDeliveryAddress', e.target.checked)}
                                sx={{ 
                                  color: 'primary.main',
                                  '&.Mui-checked': { color: 'primary.main' }
                                }}
                              />
                            }
                            label="Add another alternative delivery address"
                            sx={{ color: 'white' }}
                          />
                        </Grid>
                        
                        {/* Alternate Delivery Address Fields - Only show if checkbox is checked */}
                        {formData.useSecondAlternateDeliveryAddress && (
                          <>
                          <Grid item xs={12}>
                              <Typography variant="h6" gutterBottom sx={{ mt: 2, color: 'white' }}>
                                Alternate Delivery Address
                              </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                                label="Address Line 1"
                                value={formData.alternateDeliveryAddress.addressLine1}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  alternateDeliveryAddress: {
                                    ...prev.alternateDeliveryAddress,
                                    addressLine1: e.target.value
                                  }
                                }))}
                                sx={{ 
                                  '& .MuiOutlinedInput-root': { color: 'white' },
                                  '& .MuiInputLabel-root': { color: 'grey.400' },
                                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Address Line 2"
                                value={formData.alternateDeliveryAddress.addressLine2}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  alternateDeliveryAddress: {
                                    ...prev.alternateDeliveryAddress,
                                    addressLine2: e.target.value
                                  }
                                }))}
                                sx={{ 
                                  '& .MuiOutlinedInput-root': { color: 'white' },
                                  '& .MuiInputLabel-root': { color: 'grey.400' },
                                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Address Line 3"
                                value={formData.alternateDeliveryAddress.addressLine3}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  alternateDeliveryAddress: {
                                    ...prev.alternateDeliveryAddress,
                                    addressLine3: e.target.value
                                  }
                                }))}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { color: 'white' },
                                '& .MuiInputLabel-root': { color: 'grey.400' },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                              }}
                            />
                          </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Town"
                                value={formData.alternateDeliveryAddress.town}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  alternateDeliveryAddress: {
                                    ...prev.alternateDeliveryAddress,
                                    town: e.target.value
                                  }
                                }))}
                                sx={{ 
                                  '& .MuiOutlinedInput-root': { color: 'white' },
                                  '& .MuiInputLabel-root': { color: 'grey.400' },
                                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="City"
                                value={formData.alternateDeliveryAddress.city}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  alternateDeliveryAddress: {
                                    ...prev.alternateDeliveryAddress,
                                    city: e.target.value
                                  }
                                }))}
                                sx={{ 
                                  '& .MuiOutlinedInput-root': { color: 'white' },
                                  '& .MuiInputLabel-root': { color: 'grey.400' },
                                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Post Code"
                                value={formData.alternateDeliveryAddress.postcode}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  alternateDeliveryAddress: {
                                    ...prev.alternateDeliveryAddress,
                                    postcode: e.target.value
                                  }
                                }))}
                                sx={{ 
                                  '& .MuiOutlinedInput-root': { color: 'white' },
                                  '& .MuiInputLabel-root': { color: 'grey.400' },
                                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                                }}
                              />
                            </Grid>
                          </>
                        )}
                        
                        {/* Second Alternate Delivery Address Fields - Only show if first alternate address is filled */}
                        {formData.useSecondAlternateDeliveryAddress && formData.alternateDeliveryAddress && (
                          <>
                          <Grid item xs={12}>
                              <Typography variant="h6" gutterBottom sx={{ mt: 2, color: 'white' }}>
                                Second Alternate Delivery Address
                              </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                                label="Address Line 1"
                                value={formData.secondAlternateDeliveryAddress.addressLine1}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  secondAlternateDeliveryAddress: {
                                    ...prev.secondAlternateDeliveryAddress,
                                    addressLine1: e.target.value
                                  }
                                }))}
                                sx={{ 
                                  '& .MuiOutlinedInput-root': { color: 'white' },
                                  '& .MuiInputLabel-root': { color: 'grey.400' },
                                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Address Line 2"
                                value={formData.secondAlternateDeliveryAddress.addressLine2}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  secondAlternateDeliveryAddress: {
                                    ...prev.secondAlternateDeliveryAddress,
                                    addressLine2: e.target.value
                                  }
                                }))}
                                sx={{ 
                                  '& .MuiOutlinedInput-root': { color: 'white' },
                                  '& .MuiInputLabel-root': { color: 'grey.400' },
                                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Address Line 3"
                                value={formData.secondAlternateDeliveryAddress.addressLine3}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  secondAlternateDeliveryAddress: {
                                    ...prev.secondAlternateDeliveryAddress,
                                    addressLine3: e.target.value
                                  }
                                }))}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { color: 'white' },
                                '& .MuiInputLabel-root': { color: 'grey.400' },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                              }}
                            />
                          </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Town"
                                value={formData.secondAlternateDeliveryAddress.town}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  secondAlternateDeliveryAddress: {
                                    ...prev.secondAlternateDeliveryAddress,
                                    town: e.target.value
                                  }
                                }))}
                                sx={{ 
                                  '& .MuiOutlinedInput-root': { color: 'white' },
                                  '& .MuiInputLabel-root': { color: 'grey.400' },
                                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="City"
                                value={formData.secondAlternateDeliveryAddress.city}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  secondAlternateDeliveryAddress: {
                                    ...prev.secondAlternateDeliveryAddress,
                                    city: e.target.value
                                  }
                                }))}
                                sx={{ 
                                  '& .MuiOutlinedInput-root': { color: 'white' },
                                  '& .MuiInputLabel-root': { color: 'grey.400' },
                                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Post Code"
                                value={formData.secondAlternateDeliveryAddress.postcode}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  secondAlternateDeliveryAddress: {
                                    ...prev.secondAlternateDeliveryAddress,
                                    postcode: e.target.value
                                  }
                                }))}
                                sx={{ 
                                  '& .MuiOutlinedInput-root': { color: 'white' },
                                  '& .MuiInputLabel-root': { color: 'grey.400' },
                                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                                }}
                              />
                            </Grid>
                          </>
                        )}
                        
                        {/* Pickup Date */}
                        <Grid item xs={12} md={2}>
                          <TextField
                            fullWidth
                            type="date"
                            label="Pickup Date"
                            value={formData.pickupDate}
                            onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const nextField = document.querySelector('input[name="pickupTime"]') as HTMLInputElement;
                                if (nextField) {
                                  nextField.focus();
                                }
                              }
                            }}
                            name="pickupDate"
                            sx={{ 
                              '& .MuiOutlinedInput-root': { color: 'white' },
                              '& .MuiInputLabel-root': { color: 'grey.400' },
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                            }}
                          />
                        </Grid>
                        
                        {/* Pickup Time */}
                        <Grid item xs={12} md={2}>
                          <TextField
                            fullWidth
                            type="time"
                            label="Pickup Time"
                            value={formData.pickupTime}
                            onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const nextField = document.querySelector('input[name="deliveryDate"]') as HTMLInputElement;
                                if (nextField) {
                                  nextField.focus();
                                }
                              }
                            }}
                            name="pickupTime"
                            sx={{ 
                              '& .MuiOutlinedInput-root': { color: 'white' },
                              '& .MuiInputLabel-root': { color: 'grey.400' },
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                            }}
                          />
                        </Grid>
                        
                        {/* Delivery Date */}
                        <Grid item xs={12} md={2}>
                          <TextField
                            fullWidth
                            type="date"
                            label="Delivery Date"
                            value={formData.deliveryDate}
                            onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const nextField = document.querySelector('input[name="deliveryTime"]') as HTMLInputElement;
                                if (nextField) {
                                  nextField.focus();
                                }
                              }
                            }}
                            name="deliveryDate"
                            sx={{ 
                              '& .MuiOutlinedInput-root': { color: 'white' },
                              '& .MuiInputLabel-root': { color: 'grey.400' },
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                            }}
                          />
                        </Grid>
                        
                        {/* Delivery Time */}
                        <Grid item xs={12} md={2}>
                          <TextField
                            fullWidth
                            type="time"
                            label="Delivery Time"
                            value={formData.deliveryTime}
                            onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const nextField = document.querySelector('input[name="cargoType"]') as HTMLInputElement;
                                if (nextField) {
                                  nextField.focus();
                                }
                              }
                            }}
                            name="deliveryTime"
                            sx={{ 
                              '& .MuiOutlinedInput-root': { color: 'white' },
                              '& .MuiInputLabel-root': { color: 'grey.400' },
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                            }}
                          />
                        </Grid>
                      </Grid>
                    )}

                    {index === 1 && (
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Cargo Type"
                            value={formData.cargoType}
                            onChange={(e) => handleInputChange('cargoType', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const nextField = document.querySelector('input[name="cargoWeight"]') as HTMLInputElement;
                                if (nextField) {
                                  nextField.focus();
                                }
                              }
                            }}
                            name="cargoType"
                            sx={{ 
                              '& .MuiOutlinedInput-root': { color: 'white' },
                              '& .MuiInputLabel-root': { color: 'grey.400' },
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Cargo Weight (kg)"
                            value={formData.cargoWeight}
                            onChange={(e) => handleInputChange('cargoWeight', Number(e.target.value))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const nextField = document.querySelector('input[name="cargoVolume"]') as HTMLInputElement;
                                if (nextField) {
                                  nextField.focus();
                                }
                              }
                            }}
                            name="cargoWeight"
                            sx={{ 
                              '& .MuiOutlinedInput-root': { color: 'white' },
                              '& .MuiInputLabel-root': { color: 'grey.400' },
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Cargo Volume (m³)"
                            value={formData.cargoVolume}
                            onChange={(e) => handleInputChange('cargoVolume', Number(e.target.value))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const nextField = document.querySelector('input[name="specialRequirement"]') as HTMLInputElement;
                                if (nextField) {
                                  nextField.focus();
                                }
                              }
                            }}
                            name="cargoVolume"
                            sx={{ 
                              '& .MuiOutlinedInput-root': { color: 'white' },
                              '& .MuiInputLabel-root': { color: 'grey.400' },
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
                            <TextField
                              label="Add Special Requirement"
                              value={newRequirement}
                              onChange={(e) => setNewRequirement(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addSpecialRequirement();
                                  const nextField = document.querySelector('textarea[name="notes"]') as HTMLTextAreaElement;
                                  if (nextField) {
                                    nextField.focus();
                                  }
                                }
                              }}
                              name="specialRequirement"
                              sx={{ 
                                flexGrow: 1,
                                '& .MuiOutlinedInput-root': { color: 'white' },
                                '& .MuiInputLabel-root': { color: 'grey.400' },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                              }}
                            />
                            <IconButton onClick={addSpecialRequirement} sx={{ color: 'primary.main' }}>
                              <Add />
                            </IconButton>
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {formData.specialRequirements.map((req, idx) => (
                              <Chip
                                key={idx}
                                label={req}
                                onDelete={() => removeSpecialRequirement(idx)}
                                color="primary"
                                size="small"
                              />
                            ))}
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Additional Notes"
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                // Move to the next step or submit
                                handleNext();
                              }
                            }}
                            name="notes"
                            sx={{ 
                              '& .MuiOutlinedInput-root': { color: 'white' },
                              '& .MuiInputLabel-root': { color: 'grey.400' },
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                            }}
                          />
                        </Grid>
                      </Grid>
                    )}

                    {index === 2 && (
                      <Box>
                        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                          Review Job Consignment Details
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" sx={{ color: 'grey.400' }}>Job ID:</Typography>
                            <Typography variant="body1" sx={{ color: 'white' }}>{formData.jobId}</Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" sx={{ color: 'grey.400' }}>Client Name:</Typography>
                            <Typography variant="body1" sx={{ color: 'white' }}>{formData.clientName || 'Not selected'}</Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" sx={{ color: 'grey.400' }}>Priority:</Typography>
                            <Typography variant="body1" sx={{ color: 'white' }}>{formData.priority.toUpperCase()}</Typography>
                          </Grid>

                          <Grid item xs={12}>
                            <Typography variant="body2" sx={{ color: 'grey.400' }}>Route:</Typography>
                            <Typography variant="body1" sx={{ color: 'white' }}>
                              {formData.pickupAddress.addressLine1} → {formData.deliveryAddress.addressLine1}
                            </Typography>
                          </Grid>
                          {formData.alternateDeliveryAddress && (
                            <Grid item xs={12}>
                              <Typography variant="body2" sx={{ color: 'grey.400' }}>Alternate Delivery Address:</Typography>
                              <Typography variant="body1" sx={{ color: 'white' }}>
                                {`${formData.alternateDeliveryAddress.addressLine1}, ${formData.alternateDeliveryAddress.town}, ${formData.alternateDeliveryAddress.city}, ${formData.alternateDeliveryAddress.postcode}`}
                              </Typography>
                            </Grid>
                          )}
                          {formData.useSecondAlternateDeliveryAddress && formData.secondAlternateDeliveryAddress && (
                            <Grid item xs={12}>
                              <Typography variant="body2" sx={{ color: 'grey.400' }}>Second Alternate Delivery Address:</Typography>
                              <Typography variant="body1" sx={{ color: 'white' }}>
                                {`${formData.secondAlternateDeliveryAddress.addressLine1}, ${formData.secondAlternateDeliveryAddress.town}, ${formData.secondAlternateDeliveryAddress.city}, ${formData.secondAlternateDeliveryAddress.postcode}`}
                              </Typography>
                            </Grid>
                          )}
                          <Grid item xs={12}>
                            <Typography variant="body2" sx={{ color: 'grey.400' }}>Cargo:</Typography>
                            <Typography variant="body1" sx={{ color: 'white' }}>
                              {formData.cargoType} - {formData.cargoWeight}kg, {formData.cargoVolume}m³
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    )}

                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={index === steps.length - 1 ? handleSubmit : handleNext}
                        sx={{ mr: 1 }}
                        startIcon={index === steps.length - 1 ? <Save /> : undefined}
                      >
                        {index === steps.length - 1 ? 'Submit Job Consignment' : 'Continue'}
                      </Button>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mr: 1 }}
                      >
                        Back
                      </Button>
                      <Button
                        onClick={onClose}
                        startIcon={<Cancel />}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Client Form Dialog */}
      <Dialog 
        open={showClientForm} 
        onClose={handleClientFormClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'white', backgroundColor: 'grey.800' }}>
          Add New Client
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: 'grey.800', pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Client Name"
                value={newClient.name}
                onChange={(e) => handleNewClientInputChange('name', e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-root': { color: 'white' },
                  '& .MuiInputLabel-root': { color: 'grey.400' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company"
                value={newClient.company}
                onChange={(e) => handleNewClientInputChange('company', e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-root': { color: 'white' },
                  '& .MuiInputLabel-root': { color: 'grey.400' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 1"
                value={newClient.addressLine1}
                onChange={(e) => handleNewClientInputChange('addressLine1', e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-root': { color: 'white' },
                  '& .MuiInputLabel-root': { color: 'grey.400' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Address Line 2"
                value={newClient.addressLine2}
                onChange={(e) => handleNewClientInputChange('addressLine2', e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-root': { color: 'white' },
                  '& .MuiInputLabel-root': { color: 'grey.400' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Address Line 3"
                value={newClient.addressLine3}
                onChange={(e) => handleNewClientInputChange('addressLine3', e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-root': { color: 'white' },
                  '& .MuiInputLabel-root': { color: 'grey.400' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Town"
                value={newClient.town}
                onChange={(e) => handleNewClientInputChange('town', e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-root': { color: 'white' },
                  '& .MuiInputLabel-root': { color: 'grey.400' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City"
                value={newClient.city}
                onChange={(e) => handleNewClientInputChange('city', e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-root': { color: 'white' },
                  '& .MuiInputLabel-root': { color: 'grey.400' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Postcode"
                value={newClient.postcode}
                onChange={(e) => handleNewClientInputChange('postcode', e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-root': { color: 'white' },
                  '& .MuiInputLabel-root': { color: 'grey.400' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={newClient.phone}
                onChange={(e) => handleNewClientInputChange('phone', e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-root': { color: 'white' },
                  '& .MuiInputLabel-root': { color: 'grey.400' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={newClient.email}
                onChange={(e) => handleNewClientInputChange('email', e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-root': { color: 'white' },
                  '& .MuiInputLabel-root': { color: 'grey.400' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: 'grey.800' }}>
          <Button onClick={handleClientFormClose} sx={{ color: 'grey.400' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleClientFormSubmit} 
            variant="contained"
            disabled={!newClient.name.trim() || !newClient.company.trim()}
          >
            Add Client
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobConsignmentForm;
