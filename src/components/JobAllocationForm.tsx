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
} from '@mui/material';
import { jobIdGenerator } from '../utils/jobIdGenerator';
import { AppDispatch } from '../store';
import { addJob, addDailySchedule } from '../store/slices/jobSlice';
import { JobAssignment, JobStatus, JobLocation, JobPriority } from '../store/slices/jobSlice';
import {
  Assignment,
  Person,
  LocalShipping,
  Route,
  Schedule,
  Home,
  Save,
  Cancel,
  Add,
  Delete,
  Edit,
} from '@mui/icons-material';

interface JobConsignmentFormProps {
  onClose: () => void;
}

interface JobConsignmentData {
  jobId: string;
  clientName: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedDriver: string;
  vehicleType: string;
  pickupLocation: string;
  deliveryLocation: string;
  pickupDate: string;
  pickupTime: string;
  deliveryDate: string;
  deliveryTime: string;
  alternateDeliveryAddress: string;
  useSecondAlternateDeliveryAddress: boolean;
  secondAlternateDeliveryAddress: string;
  cargoType: string;
  cargoWeight: number;
  cargoVolume: number;
  specialRequirements: string[];
  notes: string;
  estimatedDuration: number;
  estimatedCost: number;
  customerPhone: string;
  customerEmail: string;
  pickupPostcode: string;
  deliveryPostcode: string;
}

interface Client {
  id: string;
  name: string;
  company: string;
  address: string;
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

  // Get active drivers from staff data (this would typically come from a global state or API)
  const activeDrivers = [
    'Adam Mustafa',
    'Jane Manager',
    'Sarah Johnson',
    'David Davis',
    'Emma Taylor'
  ];

  // Mock clients data
  const clients: Client[] = [
    {
      id: '1',
      name: 'John Smith',
      company: 'ABC Transport Ltd',
      address: '123 Transport Way, London',
      city: 'London',
      postcode: 'SW1A 1AA',
      phone: '020 7123 4567',
      email: 'john.smith@abctransport.com'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      company: 'XYZ Logistics',
      address: '456 Industrial Estate, Manchester',
      city: 'Manchester',
      postcode: 'M1 1AA',
      phone: '0161 234 5678',
      email: 'sarah.johnson@xyzlogistics.co.uk'
    },
    {
      id: '3',
      name: 'David Wilson',
      company: 'Wilson Freight Services',
      address: '789 Business Park, Birmingham',
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
    assignedDriver: 'Adam Mustafa',
    vehicleType: 'Tail-Lift',
    pickupLocation: '',
    deliveryLocation: '',
    pickupDate: tomorrowString,
    pickupTime: '12:00',
    deliveryDate: tomorrowString,
    deliveryTime: '12:00',
    alternateDeliveryAddress: '',
    useSecondAlternateDeliveryAddress: false,
    secondAlternateDeliveryAddress: '',
    cargoType: '',
    cargoWeight: 0,
    cargoVolume: 0,
    specialRequirements: [],
    notes: '',
    estimatedDuration: 0,
    estimatedCost: 0,
    customerPhone: '',
    customerEmail: '',
    pickupPostcode: '',
    deliveryPostcode: '',
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
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail,
      priority: formData.priority as JobPriority,
      status: 'scheduled' as JobStatus,
      assignedDriver: formData.assignedDriver,
      assignedVehicle: formData.vehicleType,
      scheduledDate: formData.pickupDate,
      scheduledTime: formData.pickupTime,
      estimatedDuration: formData.estimatedDuration,
      pickupLocation: {
        id: `pickup-${formData.jobId}`,
        name: 'Pickup Location',
        address: formData.pickupLocation,
        postcode: formData.pickupPostcode,
      },
      deliveryLocation: {
        id: `delivery-${formData.jobId}`,
        name: 'Delivery Location',
        address: formData.alternateDeliveryAddress || formData.deliveryLocation,
        postcode: formData.deliveryPostcode,
      },
      useDifferentDeliveryAddress: !!formData.alternateDeliveryAddress,
      deliveryAddress: formData.alternateDeliveryAddress,
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
      vehicleId: formData.vehicleType,
      driverId: formData.assignedDriver,
      date: formData.pickupDate,
      jobs: [{
        jobId: formData.jobId,
        scheduledTime: formData.pickupTime,
        estimatedDuration: formData.estimatedDuration,
        status: 'scheduled' as JobStatus,
      }],
      totalJobs: 1,
      completedJobs: 0,
      totalDistance: 0, // Would calculate from coordinates
      totalDuration: formData.estimatedDuration,
      status: 'scheduled',
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

  const handleLocationChange = (field: 'pickupLocation' | 'deliveryLocation', value: string) => {
    // Format commas to line breaks for location fields
    const formattedValue = value.replace(/, /g, ',\n');
    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
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
        pickupLocation: formattedAddress,
        deliveryLocation: formattedAddress
      }));
      
      // Focus on pickup location field after client selection
      setTimeout(() => {
        const pickupLocationField = document.querySelector('textarea[name="pickupLocation"]') as HTMLTextAreaElement;
        if (pickupLocationField) {
          pickupLocationField.focus();
        }
      }, 100);
    } else {
      setFormData(prev => ({
        ...prev,
        clientName: clientName,
        pickupLocation: '',
        deliveryLocation: ''
      }));
      
      // Focus on pickup location field even if no client is selected
      setTimeout(() => {
        const pickupLocationField = document.querySelector('textarea[name="pickupLocation"]') as HTMLTextAreaElement;
        if (pickupLocationField) {
          pickupLocationField.focus();
        }
      }, 100);
    }
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
                        <Grid item xs={12} md={6}>
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
                        </Grid>
                        
                        {/* Priority */}
                        <Grid item xs={12} md={6}>
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
                        
                        {/* Assigned Driver */}
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel sx={{ color: 'grey.400' }}>Assigned Driver</InputLabel>
                            <Select
                              value={formData.assignedDriver}
                              onChange={(e) => handleInputChange('assignedDriver', e.target.value)}
                              sx={{ 
                                color: 'white',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                              }}
                            >
                              <MenuItem value="">
                                <em>Select a driver</em>
                              </MenuItem>
                              {activeDrivers.map((driver) => (
                                <MenuItem key={driver} value={driver}>
                                  {driver}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        {/* Vehicle Type */}
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel sx={{ color: 'grey.400' }}>Vehicle Type</InputLabel>
                            <Select
                              value={formData.vehicleType}
                              onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                              sx={{ 
                                color: 'white',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                              }}
                            >
                              <MenuItem value="Van">Van</MenuItem>
                              <MenuItem value="Rigid">Rigid</MenuItem>
                              <MenuItem value="Tail-Lift">Tail-Lift</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        {/* Pickup and Delivery Location - Same line, equal width */}
                        <Grid item xs={12}>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                label="Pickup Location"
                                value={formData.pickupLocation}
                                onChange={(e) => handleLocationChange('pickupLocation', e.target.value)}
                                multiline
                                rows={3}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    const deliveryLocationField = document.querySelector('input[name="deliveryLocation"]') as HTMLInputElement;
                                    if (deliveryLocationField) {
                                      deliveryLocationField.focus();
                                    }
                                  }
                                }}
                                name="pickupLocation"
                                sx={{ 
                                  '& .MuiOutlinedInput-root': { color: 'white' },
                                  '& .MuiInputLabel-root': { color: 'grey.400' },
                                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                                }}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                label="Delivery Location"
                                value={formData.deliveryLocation}
                                onChange={(e) => handleLocationChange('deliveryLocation', e.target.value)}
                                multiline
                                rows={3}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    const nextField = document.querySelector('input[name="pickupDate"]') as HTMLInputElement;
                                    if (nextField) {
                                      nextField.focus();
                                    }
                                  }
                                }}
                                name="deliveryLocation"
                                sx={{ 
                                  '& .MuiOutlinedInput-root': { color: 'white' },
                                  '& .MuiInputLabel-root': { color: 'grey.400' },
                                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                                }}
                              />
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
                        
                        {/* Alternate Delivery Address Field - Only show if checkbox is checked */}
                        {formData.useSecondAlternateDeliveryAddress && (
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              multiline
                              rows={3}
                              label="Alternate Delivery Address"
                              value={formData.alternateDeliveryAddress}
                              onChange={(e) => handleInputChange('alternateDeliveryAddress', e.target.value)}
                              placeholder="Enter full delivery address..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  const nextField = document.querySelector('input[name="pickupDate"]') as HTMLInputElement;
                                  if (nextField) {
                                    nextField.focus();
                                  }
                                }
                              }}
                              name="alternateDeliveryAddress"
                              sx={{ 
                                '& .MuiOutlinedInput-root': { color: 'white' },
                                '& .MuiInputLabel-root': { color: 'grey.400' },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                              }}
                            />
                          </Grid>
                        )}
                        
                        {/* Second Alternate Delivery Address Field - Only show if first alternate address is filled */}
                        {formData.useSecondAlternateDeliveryAddress && formData.alternateDeliveryAddress && (
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              multiline
                              rows={3}
                              label="Second Alternate Delivery Address"
                              value={formData.secondAlternateDeliveryAddress}
                              onChange={(e) => handleInputChange('secondAlternateDeliveryAddress', e.target.value)}
                              placeholder="Enter full delivery address..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  const nextField = document.querySelector('input[name="pickupDate"]') as HTMLInputElement;
                                  if (nextField) {
                                    nextField.focus();
                                  }
                                }
                              }}
                              name="secondAlternateDeliveryAddress"
                              sx={{ 
                                '& .MuiOutlinedInput-root': { color: 'white' },
                                '& .MuiInputLabel-root': { color: 'grey.400' },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                              }}
                            />
                          </Grid>
                        )}
                        
                        {/* Pickup Date */}
                        <Grid item xs={12} md={3}>
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
                        <Grid item xs={12} md={3}>
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
                        <Grid item xs={12} md={3}>
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
                        <Grid item xs={12} md={3}>
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
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" sx={{ color: 'grey.400' }}>Assigned Driver:</Typography>
                            <Typography variant="body1" sx={{ color: 'white' }}>{formData.assignedDriver}</Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" sx={{ color: 'grey.400' }}>Vehicle Type:</Typography>
                            <Typography variant="body1" sx={{ color: 'white' }}>{formData.vehicleType}</Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" sx={{ color: 'grey.400' }}>Route:</Typography>
                            <Typography variant="body1" sx={{ color: 'white' }}>
                              {formData.pickupLocation} → {formData.deliveryLocation}
                            </Typography>
                          </Grid>
                          {formData.alternateDeliveryAddress && (
                            <Grid item xs={12}>
                              <Typography variant="body2" sx={{ color: 'grey.400' }}>Alternate Delivery Address:</Typography>
                              <Typography variant="body1" sx={{ color: 'white' }}>
                                {formData.alternateDeliveryAddress}
                              </Typography>
                            </Grid>
                          )}
                          {formData.useSecondAlternateDeliveryAddress && formData.secondAlternateDeliveryAddress && (
                            <Grid item xs={12}>
                              <Typography variant="body2" sx={{ color: 'grey.400' }}>Second Alternate Delivery Address:</Typography>
                              <Typography variant="body1" sx={{ color: 'white' }}>
                                {formData.secondAlternateDeliveryAddress}
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
    </Box>
  );
};

export default JobConsignmentForm;
