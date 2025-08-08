import React, { useState, useEffect } from 'react';
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
  CheckCircle,
  Warning,
  Info,
} from '@mui/icons-material';

interface JobAllocationFormProps {
  onClose: () => void;
}

interface JobAllocationData {
  jobId: string;
  jobTitle: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedDriver: string;
  vehicleType: string;
  pickupLocation: string;
  deliveryLocation: string;
  pickupDate: string;
  pickupTime: string;
  deliveryDate: string;
  deliveryTime: string;
  useAlternateDeliveryAddress: boolean;
  alternateDeliveryAddress: string;
  cargoType: string;
  cargoWeight: number;
  cargoVolume: number;
  specialRequirements: string[];
  notes: string;
  estimatedDuration: number;
  estimatedCost: number;
}

const JobAllocationForm: React.FC<JobAllocationFormProps> = ({ onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  // Get tomorrow's date for default values
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowString = tomorrow.toISOString().split('T')[0];

  // Get active drivers from staff data (this would typically come from a global state or API)
  const activeDrivers = [
    'John Driver',
    'Jane Manager',
    'Sarah Johnson',
    'David Davis',
    'Emma Taylor'
  ];



  const [formData, setFormData] = useState<JobAllocationData>({
    jobId: '',
    jobTitle: '',
    priority: 'medium',
    assignedDriver: '',
    vehicleType: 'Tail-Lift',
    pickupLocation: '',
    deliveryLocation: '',
    pickupDate: tomorrowString,
    pickupTime: '12:00',
    deliveryDate: tomorrowString,
    deliveryTime: '12:00',
    useAlternateDeliveryAddress: false,
    alternateDeliveryAddress: '',
    cargoType: '',
    cargoWeight: 0,
    cargoVolume: 0,
    specialRequirements: [],
    notes: '',
    estimatedDuration: 0,
    estimatedCost: 0,
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
    'Basic Information',
    'Driver & Vehicle',
    'Route Details',
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
    // Handle form submission
    console.log('Job Allocation Data:', formData);
    // Here you would typically save to database or dispatch to Redux
    onClose();
  };

  const handleInputChange = (field: keyof JobAllocationData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Warning />;
      case 'high': return <Warning />;
      case 'medium': return <Info />;
      case 'low': return <CheckCircle />;
      default: return <Info />;
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'black', minHeight: '100vh', color: 'white' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: 'white' }}>
          <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
          Job Allocation Form
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
                         <Grid item xs={12} md={6}>
                           <TextField
                             fullWidth
                             label="Job Title"
                             value={formData.jobTitle}
                             onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                             sx={{ 
                               '& .MuiOutlinedInput-root': { color: 'white' },
                               '& .MuiInputLabel-root': { color: 'grey.400' },
                               '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                             }}
                           />
                         </Grid>
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
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              icon={getPriorityIcon(formData.priority)}
                              label={`Priority: ${formData.priority.toUpperCase()}`}
                              color={getPriorityColor(formData.priority) as any}
                              size="small"
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    )}

                                         {index === 1 && (
                       <Grid container spacing={3}>
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
                       </Grid>
                     )}

                                         {index === 2 && (
                       <Grid container spacing={3}>
                         <Grid item xs={12} md={6}>
                           <TextField
                             fullWidth
                             label="Pickup Location"
                             value={formData.pickupLocation}
                             onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
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
                             label="Delivery Location"
                             value={formData.deliveryLocation}
                             onChange={(e) => handleInputChange('deliveryLocation', e.target.value)}
                             sx={{ 
                               '& .MuiOutlinedInput-root': { color: 'white' },
                               '& .MuiInputLabel-root': { color: 'grey.400' },
                               '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                             }}
                           />
                         </Grid>
                         <Grid item xs={12}>
                           <FormControlLabel
                             control={
                               <Checkbox
                                 checked={formData.useAlternateDeliveryAddress}
                                 onChange={(e) => handleInputChange('useAlternateDeliveryAddress', e.target.checked)}
                                 sx={{ 
                                   color: 'primary.main',
                                   '&.Mui-checked': { color: 'primary.main' }
                                 }}
                               />
                             }
                             label="Use delivery address other than client's stored business address"
                             sx={{ color: 'white' }}
                           />
                         </Grid>
                         {formData.useAlternateDeliveryAddress && (
                           <Grid item xs={12}>
                             <TextField
                               fullWidth
                               multiline
                               rows={3}
                               label="Alternate Delivery Address"
                               value={formData.alternateDeliveryAddress}
                               onChange={(e) => handleInputChange('alternateDeliveryAddress', e.target.value)}
                               placeholder="Enter full delivery address..."
                               sx={{ 
                                 '& .MuiOutlinedInput-root': { color: 'white' },
                                 '& .MuiInputLabel-root': { color: 'grey.400' },
                                 '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                               }}
                             />
                           </Grid>
                         )}
                         <Grid item xs={12} md={3}>
                           <TextField
                             fullWidth
                             type="date"
                             label="Pickup Date"
                             value={formData.pickupDate}
                             onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                             InputLabelProps={{ shrink: true }}
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
                             type="time"
                             label="Pickup Time"
                             value={formData.pickupTime}
                             onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                             InputLabelProps={{ shrink: true }}
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
                             type="date"
                             label="Delivery Date"
                             value={formData.deliveryDate}
                             onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                             InputLabelProps={{ shrink: true }}
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
                             type="time"
                             label="Delivery Time"
                             value={formData.deliveryTime}
                             onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                             InputLabelProps={{ shrink: true }}
                             sx={{ 
                               '& .MuiOutlinedInput-root': { color: 'white' },
                               '& .MuiInputLabel-root': { color: 'grey.400' },
                               '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                             }}
                           />
                         </Grid>
                       </Grid>
                     )}

                    {index === 3 && (
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Cargo Type"
                            value={formData.cargoType}
                            onChange={(e) => handleInputChange('cargoType', e.target.value)}
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
                            sx={{ 
                              '& .MuiOutlinedInput-root': { color: 'white' },
                              '& .MuiInputLabel-root': { color: 'grey.400' },
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                            }}
                          />
                        </Grid>
                      </Grid>
                    )}

                    {index === 4 && (
                      <Box>
                        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                          Review Job Allocation Details
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" sx={{ color: 'grey.400' }}>Job ID:</Typography>
                            <Typography variant="body1" sx={{ color: 'white' }}>{formData.jobId}</Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" sx={{ color: 'grey.400' }}>Job Title:</Typography>
                            <Typography variant="body1" sx={{ color: 'white' }}>{formData.jobTitle}</Typography>
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
                        {index === steps.length - 1 ? 'Submit Job Allocation' : 'Continue'}
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

export default JobAllocationForm;
