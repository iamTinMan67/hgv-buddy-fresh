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
import { addJob, addDailySchedule, updateJob } from '../store/slices/jobSlice';
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

  // Standard pallet options
  const palletOptions = [
    { label: "Full Plot (1200x1200x2200mm, 1200kg)", length: 1200, width: 1200, height: 2200, weight: 1200, cost: 65.00 },
    { label: "Light Plot (1200x1200x2200mm, 750kg)", length: 1200, width: 1200, height: 2200, weight: 750, cost: 60.00 },
    { label: "Euro Half (1200x1200x2200mm, 500kg)", length: 1200, width: 1200, height: 2200, weight: 500, cost: 55.00 },
    { label: "Half Plot (1200x800x800mm, 500kg)", length: 1200, width: 800, height: 800, weight: 500, cost: 50.00 },
    { label: "Quarter Plot (1200x1000x800mm, 250kg)", length: 1200, width: 1000, height: 800, weight: 250, cost: 45.00 },
    { label: "Mini Plot (1200x1200x600mm, 150kg)", length: 1200, width: 1200, height: 600, weight: 150, cost: 40.00 },
    { label: "Custom", length: 0, width: 0, height: 0, weight: 0, cost: 0 },
  ];

interface PalletItem {
  id: string;
  palletType: string;
  quantity: number;
  cost: number;
  totalCost: number;
  weight: number;
  totalWeight: number;
  volume: number;
  totalVolume: number;
}

interface JobConsignmentFormProps {
  onClose: () => void;
  initialData?: any;
  isEditing?: boolean;
}

interface StructuredAddress {
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  town: string;
  city: string;
  postcode: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
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
  useAlternateDeliveryAddress: boolean;
  alternateDeliveryAddress: StructuredAddress;

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

const JobConsignmentForm: React.FC<JobConsignmentFormProps> = ({ onClose, initialData, isEditing = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeStep, setActiveStep] = useState(0);
  
  // Pallet selection state
  const [selectedPallet, setSelectedPallet] = useState("Custom");
  // Add dimension fields to formData if not present
  const [dimensions, setDimensions] = useState({
    length: 0,
    width: 0,
    height: 0,
  });

  // When pallet is selected, autofill dimensions, weight, and cargo type unless 'Custom'
  useEffect(() => {
    const pallet = palletOptions.find(p => p.label === selectedPallet);
    if (pallet && pallet.label !== "Custom") {
      setDimensions({ length: pallet.length, width: pallet.width, height: pallet.height });
      setFormData(prev => ({ 
        ...prev, 
        cargoWeight: pallet.weight,
        cargoType: pallet.label 
      }));
    }
  }, [selectedPallet]);
  
  // Get tomorrow's date for default values
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowString = tomorrow.toISOString().split('T')[0];

  // Pallet items state
  const [palletItems, setPalletItems] = useState<PalletItem[]>([]);
  const [selectedPalletForCounter, setSelectedPalletForCounter] = useState<string>('');
  const [palletQuantity, setPalletQuantity] = useState<number>(1);

  // Calculate totals from pallet items
  const totalCost = palletItems.reduce((sum, item) => sum + item.totalCost, 0);
  const totalWeight = palletItems.reduce((sum, item) => sum + item.totalWeight, 0);
  const totalVolume = palletItems.reduce((sum, item) => sum + item.totalVolume, 0);

  // Add pallet item to counter
  const addPalletItem = () => {
    if (!selectedPalletForCounter) return;
    
    const pallet = palletOptions.find(p => p.label === selectedPalletForCounter);
    if (!pallet) return;

    const newItem: PalletItem = {
      id: Date.now().toString(),
      palletType: selectedPalletForCounter,
      quantity: palletQuantity,
      cost: pallet.cost,
      totalCost: pallet.cost * palletQuantity,
      weight: pallet.weight,
      totalWeight: pallet.weight * palletQuantity,
      volume: (pallet.length * pallet.width * pallet.height) / 1000000, // Convert to m³
      totalVolume: (pallet.length * pallet.width * pallet.height * palletQuantity) / 1000000,
    };

    setPalletItems(prev => [...prev, newItem]);
    setSelectedPalletForCounter('');
    setPalletQuantity(1);
  };

  // Remove pallet item from counter
  const removePalletItem = (id: string) => {
    setPalletItems(prev => prev.filter(item => item.id !== id));
  };

  // Update pallet item quantity
  const updatePalletItemQuantity = (id: string, newQuantity: number) => {
    setPalletItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          quantity: newQuantity,
          totalCost: item.cost * newQuantity,
          totalWeight: item.weight * newQuantity,
          totalVolume: (item.volume * newQuantity),
        };
      }
      return item;
    }));
  };

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
      contactName: '',
      contactPhone: '',
      contactEmail: '',
    },
    deliveryAddress: {
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      town: '',
      city: '',
      postcode: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
    },
    pickupDate: tomorrowString,
    pickupTime: '12:00',
    deliveryDate: tomorrowString,
    deliveryTime: '12:00',
    useAlternateDeliveryAddress: false,
    alternateDeliveryAddress: {
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      town: '',
      city: '',
      postcode: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
    },

    cargoType: 'Custom',
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

  // Alternate delivery address state
  const [useAlternateDeliveryAddress, setUseAlternateDeliveryAddress] = useState(false);

  // Selected client state
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

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
    
    if (!isEditing) {
      generateAndSetJobId();
    }
  }, [isEditing]);

  // Populate form with initial data when editing
  useEffect(() => {
    if (isEditing && initialData) {
      // Map the job data to form data structure
      const mappedData: JobConsignmentData = {
        jobId: initialData.jobNumber || initialData.id || '',
        clientName: initialData.customerName || '',
        priority: initialData.priority || 'medium',
        pickupAddress: {
          addressLine1: initialData.pickupLocation?.address?.line1 || '',
          addressLine2: initialData.pickupLocation?.address?.line2 || '',
          addressLine3: initialData.pickupLocation?.address?.addressLine3 || '',
          town: initialData.pickupLocation?.address?.town || '',
          city: initialData.pickupLocation?.address?.city || '',
          postcode: initialData.pickupLocation?.address?.postcode || '',
          contactName: initialData.pickupLocation?.contactPerson || '',
          contactPhone: initialData.pickupLocation?.contactPhone || '',
          contactEmail: '',
        },
        deliveryAddress: {
          addressLine1: initialData.deliveryLocation?.address?.line1 || '',
          addressLine2: initialData.deliveryLocation?.address?.line2 || '',
          addressLine3: initialData.deliveryLocation?.address?.addressLine3 || '',
          town: initialData.deliveryLocation?.address?.town || '',
          city: initialData.deliveryLocation?.address?.city || '',
          postcode: initialData.deliveryLocation?.address?.postcode || '',
          contactName: initialData.deliveryLocation?.contactPerson || '',
          contactPhone: initialData.deliveryLocation?.contactPhone || '',
          contactEmail: '',
        },
        pickupDate: initialData.scheduledDate || initialData.pickupDate || '',
        pickupTime: initialData.scheduledTime || initialData.pickupTime || '12:00',
        deliveryDate: initialData.deliveryDate || '',
        deliveryTime: initialData.deliveryTime || '12:00',
        useAlternateDeliveryAddress: false,
        alternateDeliveryAddress: {
          addressLine1: '',
          addressLine2: '',
          addressLine3: '',
          town: '',
          city: '',
          postcode: '',
          contactName: '',
          contactPhone: '',
          contactEmail: '',
        },
        cargoType: initialData.cargoType || '',
        cargoWeight: initialData.cargoWeight || initialData.loadDimensions?.weight || 0,
        cargoVolume: initialData.loadDimensions?.volume || 0,
        specialRequirements: initialData.specialRequirements || [],
        notes: initialData.notes || '',
        estimatedDuration: initialData.estimatedDuration || 0,
        estimatedCost: 0,
      };
      
      setFormData(mappedData);
      
      // Set client name if available
      if (initialData.customerName) {
        setSelectedClient(clients.find(client => client.name === initialData.customerName) || null);
      }
      
      // Sync selectedPallet with cargoType if it matches a pallet option
      if (initialData.cargoType) {
        const matchingPallet = palletOptions.find(p => p.label === initialData.cargoType);
        if (matchingPallet) {
          setSelectedPallet(matchingPallet.label);
        }
      }

      // Load pallet items if they exist in the initial data
      if (initialData.palletItems && Array.isArray(initialData.palletItems)) {
        setPalletItems(initialData.palletItems);
      }
    }
  }, [isEditing, initialData]);

  // Reset pallet items when form is closed
  const handleClose = () => {
    setPalletItems([]);
    setSelectedPalletForCounter('');
    setPalletQuantity(1);
    onClose();
  };

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
      description: palletItems.length > 0 
        ? `Multiple Pallets: ${palletItems.map(item => `${item.palletType} × ${item.quantity}`).join(', ')} - Total: £${totalCost.toFixed(2)}, ${totalWeight}kg`
        : `Cargo: ${formData.cargoType}, Weight: ${formData.cargoWeight}kg`,
      customerName: formData.clientName,

      priority: formData.priority as JobPriority,
      status: isEditing && initialData?.status ? initialData.status : 'pending' as JobStatus,
      assignedDriver: isEditing && initialData?.assignedDriver ? initialData.assignedDriver : undefined,
      assignedVehicle: isEditing && initialData?.assignedVehicle ? initialData.assignedVehicle : undefined,

      scheduledDate: formData.pickupDate,
      scheduledTime: formData.pickupTime,
      estimatedDuration: formData.estimatedDuration,
      pickupLocation: {
        id: `pickup-${formData.jobId}`,
        name: 'Pickup Location',
        address: {
          line1: formData.pickupAddress.addressLine1,
          line2: formData.pickupAddress.addressLine2,
          line3: formData.pickupAddress.addressLine3,
          town: formData.pickupAddress.town,
          city: formData.pickupAddress.city,
          postcode: formData.pickupAddress.postcode,
        },
        contactPerson: formData.pickupAddress.contactName,
        contactPhone: formData.pickupAddress.contactPhone,
        deliveryInstructions: `Contact: ${formData.pickupAddress.contactName} (${formData.pickupAddress.contactPhone})`,
      },
      deliveryLocation: {
        id: `delivery-${formData.jobId}`,
        name: 'Delivery Location',
        address: {
          line1: useAlternateDeliveryAddress ? formData.alternateDeliveryAddress.addressLine1 : formData.deliveryAddress.addressLine1,
          line2: useAlternateDeliveryAddress ? formData.alternateDeliveryAddress.addressLine2 : formData.deliveryAddress.addressLine2,
          line3: useAlternateDeliveryAddress ? formData.alternateDeliveryAddress.addressLine3 : formData.deliveryAddress.addressLine3,
          town: useAlternateDeliveryAddress ? formData.alternateDeliveryAddress.town : formData.deliveryAddress.town,
          city: useAlternateDeliveryAddress ? formData.alternateDeliveryAddress.city : formData.deliveryAddress.city,
          postcode: useAlternateDeliveryAddress ? formData.alternateDeliveryAddress.postcode : formData.deliveryAddress.postcode,
        },
        contactPerson: useAlternateDeliveryAddress ? formData.alternateDeliveryAddress.contactName : formData.deliveryAddress.contactName,
        contactPhone: useAlternateDeliveryAddress ? formData.alternateDeliveryAddress.contactPhone : formData.deliveryAddress.contactPhone,
        deliveryInstructions: `Contact: ${useAlternateDeliveryAddress ? formData.alternateDeliveryAddress.contactName : formData.deliveryAddress.contactName} (${useAlternateDeliveryAddress ? formData.alternateDeliveryAddress.contactPhone : formData.deliveryAddress.contactPhone})`,
      },
      useDifferentDeliveryAddress: false,
      cargoType: palletItems.length > 0 ? `Multiple Pallets (${palletItems.length} types)` : formData.cargoType,
      cargoWeight: palletItems.length > 0 ? totalWeight : formData.cargoWeight,
      specialRequirements: formData.specialRequirements.join(', '),
      notes: formData.notes,
      createdAt: isEditing && initialData?.createdAt ? initialData.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: isEditing && initialData?.createdBy ? initialData.createdBy : 'current-user', // Would need to get from auth context
      authorizedBy: isEditing && initialData?.authorizedBy ? initialData.authorizedBy : 'current-user', // Would need to get from auth context
      loadDimensions: {
        length: 0, // Would need to add to form
        width: 0, // Would need to add to form
        height: 0, // Would need to add to form
        weight: palletItems.length > 0 ? totalWeight : formData.cargoWeight,
        volume: palletItems.length > 0 ? totalVolume : formData.cargoVolume,
        isOversized: false,
        isProtruding: false,
        isBalanced: true,
        isFragile: false,
      }
    };

    // Add pallet items data to the job assignment if any exist
    if (palletItems.length > 0) {
      (jobAssignment as any).palletItems = palletItems;
      (jobAssignment as any).totalCost = totalCost;
      (jobAssignment as any).totalVolume = totalVolume;
    }

    // Dispatch to Redux store based on whether we're editing or creating
    if (isEditing) {
      // Update existing job
      dispatch(updateJob(jobAssignment));
              // Job updated in Redux store
    } else {
      // Create new job
      dispatch(addJob(jobAssignment));

      // Create a daily schedule entry for new jobs only
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
              // Job saved to Redux store
        // Daily schedule created
    }
    
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

  const handleAlternateDeliveryAddressFieldChange = (field: keyof StructuredAddress, value: string) => {
    setFormData(prev => ({
      ...prev,
      alternateDeliveryAddress: {
        ...prev.alternateDeliveryAddress,
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
      const fullAddress = `${selectedClient.addressLine1}, ${selectedClient.city}, ${selectedClient.postcode}`;
      const formattedAddress = fullAddress.replace(/, /g, ',\n');
      setFormData(prev => ({
        ...prev,
        clientName: clientName,
        pickupAddress: {
          addressLine1: selectedClient.addressLine1,
          addressLine2: selectedClient.addressLine2,
          addressLine3: selectedClient.addressLine3,
          town: selectedClient.town,
          city: selectedClient.city,
          postcode: selectedClient.postcode,
          contactName: selectedClient.name,
          contactPhone: selectedClient.phone,
          contactEmail: selectedClient.email,
        },
        deliveryAddress: {
          addressLine1: selectedClient.addressLine1,
          addressLine2: selectedClient.addressLine2,
          addressLine3: selectedClient.addressLine3,
          town: selectedClient.town,
          city: selectedClient.city,
          postcode: selectedClient.postcode,
          contactName: selectedClient.name,
          contactPhone: selectedClient.phone,
          contactEmail: selectedClient.email,
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
          contactName: '',
          contactPhone: '',
          contactEmail: '',
        },
        deliveryAddress: {
          addressLine1: '',
          addressLine2: '',
          addressLine3: '',
          town: '',
          city: '',
          postcode: '',
          contactName: '',
          contactPhone: '',
          contactEmail: '',
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
      contactName: 'Sample Contact',
      contactPhone: '01234567890',
      contactEmail: 'sample@example.com',
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
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      town: '',
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
            // New client created
    
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
          {isEditing ? 'Edit Job Consignment' : 'Job Consignment Form'}
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
                        <Grid item xs={6} md={3.15}>
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
                        <Grid item xs={6} md={2.4}>
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
                        

                        
                        {/* Pickup and Delivery Contact Information */}
                        <Grid item xs={12}>
                          <Grid container spacing={2}>
                            {/* Pickup Contact Fields */}
                            <Grid item xs={12} md={3.44}>
                              <Typography variant="h6" gutterBottom sx={{ color: 'white', mb: 2 }}>
                                Pickup Contact Information
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Pickup Contact Name"
                                    value={formData.pickupAddress.contactName}
                                    onChange={(e) => handleAddressFieldChange('pickupAddress', 'contactName', e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const nextField = document.querySelector('input[name="pickupContactPhone"]') as HTMLInputElement;
                                        if (nextField) {
                                          nextField.focus();
                                        }
                                      }
                                    }}
                                    name="pickupContactName"
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
                                    label="Pickup Contact Phone"
                                    value={formData.pickupAddress.contactPhone}
                                    onChange={(e) => handleAddressFieldChange('pickupAddress', 'contactPhone', e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const nextField = document.querySelector('input[name="pickupContactPhone"]') as HTMLInputElement;
                                        if (nextField) {
                                          nextField.focus();
                                        }
                                      }
                                    }}
                                    name="pickupContactPhone"
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
                                    label="Pickup Contact Email"
                                    value={formData.pickupAddress.contactEmail}
                                    onChange={(e) => handleAddressFieldChange('pickupAddress', 'contactEmail', e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const nextField = document.querySelector('input[name="deliveryContactName"]') as HTMLInputElement;
                                        if (nextField) {
                                          nextField.focus();
                                        }
                                      }
                                    }}
                                    name="pickupContactEmail"
                                    sx={{ 
                                      '& .MuiOutlinedInput-root': { color: 'white' },
                                      '& .MuiInputLabel-root': { color: 'grey.400' },
                                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                                    }}
                                  />
                                </Grid>
                              </Grid>
                            </Grid>

                            {/* Delivery Contact Fields */}
                            <Grid item xs={12} md={3.44}>
                              <Typography variant="h6" gutterBottom sx={{ color: 'white', mb: 2 }}>
                                Delivery Contact Information
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Delivery Contact Name"
                                    value={formData.deliveryAddress.contactName}
                                    onChange={(e) => handleAddressFieldChange('deliveryAddress', 'contactName', e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const nextField = document.querySelector('input[name="deliveryContactPhone"]') as HTMLInputElement;
                                        if (nextField) {
                                          nextField.focus();
                                        }
                                      }
                                    }}
                                    name="deliveryContactName"
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
                                    label="Delivery Contact Phone"
                                    value={formData.deliveryAddress.contactPhone}
                                    onChange={(e) => handleAddressFieldChange('deliveryAddress', 'contactPhone', e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const nextField = document.querySelector('input[name="deliveryContactPhone"]') as HTMLInputElement;
                                        if (nextField) {
                                          nextField.focus();
                                        }
                                      }
                                    }}
                                    name="deliveryContactPhone"
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
                                    label="Delivery Contact Email"
                                    value={formData.deliveryAddress.contactEmail}
                                    onChange={(e) => handleAddressFieldChange('deliveryAddress', 'contactEmail', e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const nextField = document.querySelector('textarea[name="pickupAddress"]') as HTMLTextAreaElement;
                                        if (nextField) {
                                          nextField.focus();
                                        }
                                      }
                                    }}
                                    name="deliveryContactEmail"
                                    sx={{ 
                                      '& .MuiOutlinedInput-root': { color: 'white' },
                                      '& .MuiInputLabel-root': { color: 'grey.400' },
                                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                                    }}
                                  />
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                        

                        
                        {/* Pickup and Delivery Location - Aligned with contact fields */}
                        <Grid item xs={12}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={3.44}>
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
                                    contactName: formData.pickupAddress.contactName,
                                    contactPhone: formData.pickupAddress.contactPhone,
                                    contactEmail: formData.pickupAddress.contactEmail,
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
                            <Grid item xs={12} md={3.44}>
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
                                    contactName: formData.deliveryAddress.contactName,
                                    contactPhone: formData.deliveryAddress.contactPhone,
                                    contactEmail: formData.deliveryAddress.contactEmail,
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
                            <Grid item xs={12} md={3.44}>
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
                            <Grid item xs={12} md={3.44}>
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


                        {/* Alternate Delivery Address */}
                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={useAlternateDeliveryAddress}
                                onChange={(e) => setUseAlternateDeliveryAddress(e.target.checked)}
                                sx={{ color: 'primary.main' }}
                              />
                            }
                            label="Use Alternate Delivery Address"
                            sx={{ color: 'white', mb: 2 }}
                          />
                        </Grid>

                        <Collapse in={useAlternateDeliveryAddress}>
                          <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ color: 'white', mb: 2 }}>
                              Alternate Delivery Address
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={3.44}>
                                <TextField
                                  fullWidth
                                  label="Alternate Delivery Location"
                                  value={`${formData.alternateDeliveryAddress.addressLine1}${formData.alternateDeliveryAddress.addressLine2 ? ', ' + formData.alternateDeliveryAddress.addressLine2 : ''}${formData.alternateDeliveryAddress.addressLine3 ? ', ' + formData.alternateDeliveryAddress.addressLine3 : ''}${formData.alternateDeliveryAddress.town ? ', ' + formData.alternateDeliveryAddress.town : ''}${formData.alternateDeliveryAddress.city ? ', ' + formData.alternateDeliveryAddress.city : ''}`}
                                  onChange={(e) => {
                                    // Parse the combined address back into structured fields
                                    const addressParts = e.target.value.split(',').map(part => part.trim());
                                    const newAddress: StructuredAddress = {
                                      addressLine1: addressParts[0] || '',
                                      addressLine2: addressParts[1] || '',
                                      addressLine3: addressParts[2] || '',
                                      town: addressParts[3] || '',
                                      city: addressParts[4] || '',
                                      postcode: formData.alternateDeliveryAddress.postcode,
                                      contactName: formData.alternateDeliveryAddress.contactName,
                                      contactPhone: formData.alternateDeliveryAddress.contactPhone,
                                      contactEmail: formData.alternateDeliveryAddress.contactEmail,
                                    };
                                    setFormData(prev => ({
                                      ...prev,
                                      alternateDeliveryAddress: newAddress
                                    }));
                                  }}
                                  multiline
                                  rows={4}
                                  sx={{ 
                                    '& .MuiOutlinedInput-root': { color: 'white' },
                                    '& .MuiInputLabel-root': { color: 'grey.400' },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} md={3.44}>
                                <TextField
                                  fullWidth
                                  label="Alternate Delivery Postcode"
                                  value={formData.alternateDeliveryAddress.postcode}
                                  onChange={(e) => handleAlternateDeliveryAddressFieldChange('postcode', e.target.value)}
                                  sx={{ 
                                    '& .MuiOutlinedInput-root': { color: 'white' },
                                    '& .MuiInputLabel-root': { color: 'grey.400' },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                                  }}
                                />
                              </Grid>
                            </Grid>
                          </Grid>
                        </Collapse>

                        

                        

                        
                        {/* Pickup Date */}
                        <Grid item xs={12} md={2.4}>
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
                        <Grid item xs={12} md={1.0}>
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
                        <Grid item xs={12} md={2.4}>
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
                        <Grid item xs={12} md={1.0}>
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
                                const nextField = document.querySelector('input[name="cargoWeight"]') as HTMLInputElement;
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
                          <FormControl fullWidth>
                            <InputLabel id="cargo-type-label">Cargo Type</InputLabel>
                            <Select
                              labelId="cargo-type-label"
                              value={formData.cargoType}
                              label="Cargo Type"
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
                                color: 'white', 
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' },
                                '& .MuiInputLabel-root': { color: 'grey.400' }
                              }}
                            >
                              {palletOptions.map(option => (
                                <MenuItem key={option.label} value={option.label}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        {/* Pallet size dropdown */}
                        <Grid item xs={12} md={4}>
                          <FormControl fullWidth>
                            <InputLabel id="pallet-size-label">Pallet Size</InputLabel>
                            <Select
                              labelId="pallet-size-label"
                              value={selectedPallet}
                              label="Pallet Size"
                              onChange={e => setSelectedPallet(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const nextField = document.querySelector('input[name="length"]') as HTMLInputElement;
                                  if (nextField) {
                                    nextField.focus();
                                  }
                                }
                              }}
                              sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' } }}
                            >
                              {palletOptions.map(option => (
                                <MenuItem key={option.label} value={option.label}>{option.label}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        {/* Dimension fields */}
                        <Grid item xs={12} md={2}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Length (mm)"
                            value={dimensions.length}
                            onChange={e => {
                              setDimensions(d => ({ ...d, length: Number(e.target.value) }));
                              setSelectedPallet("Custom");
                            }}
                            name="length"
                            sx={{ '& .MuiOutlinedInput-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'grey.400' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' } }}
                          />
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Width (mm)"
                            value={dimensions.width}
                            onChange={e => {
                              setDimensions(d => ({ ...d, width: Number(e.target.value) }));
                              setSelectedPallet("Custom");
                            }}
                            name="width"
                            sx={{ '& .MuiOutlinedInput-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'grey.400' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' } }}
                          />
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Height (mm)"
                            value={dimensions.height}
                            onChange={e => {
                              setDimensions(d => ({ ...d, height: Number(e.target.value) }));
                              setSelectedPallet("Custom");
                            }}
                            name="height"
                            sx={{ '& .MuiOutlinedInput-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'grey.400' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' } }}
                          />
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Cargo Weight (kg)"
                            value={formData.cargoWeight}
                            onChange={e => {
                              handleInputChange('cargoWeight', Number(e.target.value));
                              setSelectedPallet("Custom");
                            }}
                            name="cargoWeight"
                            sx={{ '& .MuiOutlinedInput-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'grey.400' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' } }}
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

                        {/* Pallet Counter Section */}
                        <Grid item xs={12}>
                          <Box sx={{ 
                            border: '1px solid rgba(255, 255, 255, 0.2)', 
                            borderRadius: 2, 
                            p: 2, 
                            mb: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.05)'
                          }}>
                            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                              📦 Pallet Counter - Multiple Items
                            </Typography>
                            
                            {/* Add Pallet Item Controls */}
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                              <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                  <InputLabel id="pallet-counter-label">Select Pallet Type</InputLabel>
                                  <Select
                                    labelId="pallet-counter-label"
                                    value={selectedPalletForCounter}
                                    label="Select Pallet Type"
                                    onChange={(e) => setSelectedPalletForCounter(e.target.value)}
                                    sx={{ 
                                      color: 'white', 
                                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' },
                                      '& .MuiInputLabel-root': { color: 'grey.400' }
                                    }}
                                  >
                                    {palletOptions.filter(p => p.label !== 'Custom').map(option => (
                                      <MenuItem key={option.label} value={option.label}>
                                        {option.label} - £{option.cost.toFixed(2)}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} md={3}>
                                <TextField
                                  fullWidth
                                  type="number"
                                  label="Quantity"
                                  value={palletQuantity}
                                  onChange={(e) => setPalletQuantity(Number(e.target.value))}
                                  inputProps={{ min: 1 }}
                                  sx={{ 
                                    '& .MuiOutlinedInput-root': { color: 'white' },
                                    '& .MuiInputLabel-root': { color: 'grey.400' },
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} md={3}>
                                <Button
                                  variant="contained"
                                  onClick={addPalletItem}
                                  disabled={!selectedPalletForCounter}
                                  startIcon={<Add />}
                                  sx={{ height: '56px', width: '100%' }}
                                >
                                  Add Item
                                </Button>
                              </Grid>
                            </Grid>

                            {/* Pallet Items Table */}
                            {palletItems.length > 0 && (
                              <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                                  Pallet Items ({palletItems.length})
                                </Typography>
                                
                                {/* Table Header */}
                                <Grid container spacing={1} sx={{ mb: 1, px: 1 }}>
                                  <Grid item xs={3}>
                                    <Typography variant="body2" sx={{ color: 'grey.400', fontWeight: 'bold' }}>
                                      Pallet Type
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <Typography variant="body2" sx={{ color: 'grey.400', fontWeight: 'bold' }}>
                                      Qty
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <Typography variant="body2" sx={{ color: 'grey.400', fontWeight: 'bold' }}>
                                      Unit Cost
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <Typography variant="body2" sx={{ color: 'grey.400', fontWeight: 'bold' }}>
                                      Total Cost
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <Typography variant="body2" sx={{ color: 'grey.400', fontWeight: 'bold' }}>
                                      Weight
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={1}>
                                    <Typography variant="body2" sx={{ color: 'grey.400', fontWeight: 'bold' }}>
                                      Action
                                    </Typography>
                                  </Grid>
                                </Grid>

                                {/* Table Rows */}
                                {palletItems.map((item, index) => (
                                  <Grid container spacing={1} key={item.id} sx={{ 
                                    mb: 1, 
                                    px: 1, 
                                    py: 1, 
                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: 1,
                                    alignItems: 'center'
                                  }}>
                                    <Grid item xs={3}>
                                      <Typography variant="body2" sx={{ color: 'white' }}>
                                        {item.palletType}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                      <TextField
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updatePalletItemQuantity(item.id, Number(e.target.value))}
                                        inputProps={{ min: 1 }}
                                        size="small"
                                        sx={{ 
                                          '& .MuiOutlinedInput-root': { color: 'white' },
                                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                                        }}
                                      />
                                    </Grid>
                                    <Grid item xs={2}>
                                      <Typography variant="body2" sx={{ color: 'white' }}>
                                        £{item.cost.toFixed(2)}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                      <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                        £{item.totalCost.toFixed(2)}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                      <Typography variant="body2" sx={{ color: 'white' }}>
                                        {item.totalWeight}kg
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={1}>
                                      <IconButton
                                        size="small"
                                        onClick={() => removePalletItem(item.id)}
                                        sx={{ color: 'error.main' }}
                                      >
                                        <Delete />
                                      </IconButton>
                                    </Grid>
                                  </Grid>
                                ))}

                                {/* Totals Row */}
                                <Grid container spacing={1} sx={{ 
                                  mt: 2, 
                                  px: 1, 
                                  py: 2, 
                                  bgcolor: 'rgba(76, 175, 80, 0.1)',
                                  borderRadius: 1,
                                  border: '1px solid rgba(76, 175, 80, 0.3)'
                                }}>
                                  <Grid item xs={7}>
                                    <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                      RUNNING TOTALS
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                      £{totalCost.toFixed(2)}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={2}>
                                    <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                      {totalWeight}kg
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={1}></Grid>
                                </Grid>
                              </Box>
                            )}

                            {/* Summary Info */}
                            {palletItems.length === 0 && (
                              <Typography variant="body2" sx={{ color: 'grey.500', fontStyle: 'italic' }}>
                                No pallet items added yet. Use the controls above to add multiple pallet types and quantities.
                              </Typography>
                            )}
                          </Box>
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
                              {formData.pickupAddress.addressLine1} → {useAlternateDeliveryAddress ? formData.alternateDeliveryAddress.addressLine1 : formData.deliveryAddress.addressLine1}
                            </Typography>
                          </Grid>

                          {useAlternateDeliveryAddress && (
                            <Grid item xs={12}>
                              <Typography variant="body2" sx={{ color: 'grey.400' }}>Alternate Delivery Address:</Typography>
                              <Typography variant="body1" sx={{ color: 'white' }}>
                                {formData.alternateDeliveryAddress.addressLine1}, {formData.alternateDeliveryAddress.town}, {formData.alternateDeliveryAddress.postcode}
                              </Typography>
                            </Grid>
                          )}


                          <Grid item xs={12}>
                            <Typography variant="body2" sx={{ color: 'grey.400' }}>Cargo:</Typography>
                            <Typography variant="body1" sx={{ color: 'white' }}>
                              {formData.cargoType} - {formData.cargoWeight}kg, {formData.cargoVolume}m³
                            </Typography>
                          </Grid>

                          {/* Pallet Counter Summary */}
                          {palletItems.length > 0 && (
                            <>
                              <Grid item xs={12}>
                                <Typography variant="body2" sx={{ color: 'grey.400' }}>Pallet Items:</Typography>
                                <Box sx={{ mt: 1 }}>
                                  {palletItems.map((item, index) => (
                                    <Box key={item.id} sx={{ 
                                      display: 'flex', 
                                      justifyContent: 'space-between', 
                                      alignItems: 'center',
                                      py: 0.5,
                                      px: 1,
                                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                                      borderRadius: 1,
                                      mb: 0.5
                                    }}>
                                      <Typography variant="body2" sx={{ color: 'white', flex: 1 }}>
                                        {item.palletType} × {item.quantity}
                                      </Typography>
                                      <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 'bold', minWidth: '80px', textAlign: 'right' }}>
                                        £{item.totalCost.toFixed(2)}
                                      </Typography>
                                      <Typography variant="body2" sx={{ color: 'white', minWidth: '60px', textAlign: 'right' }}>
                                        {item.totalWeight}kg
                                      </Typography>
                                    </Box>
                                  ))}
                                </Box>
                              </Grid>
                              <Grid item xs={12}>
                                <Box sx={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  py: 1,
                                  px: 2,
                                  bgcolor: 'rgba(76, 175, 80, 0.1)',
                                  borderRadius: 1,
                                  border: '1px solid rgba(76, 175, 80, 0.3)',
                                  mt: 1
                                }}>
                                  <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                    TOTAL
                                  </Typography>
                                  <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                    £{totalCost.toFixed(2)}
                                  </Typography>
                                  <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                    {totalWeight}kg
                                  </Typography>
                                </Box>
                              </Grid>
                            </>
                          )}
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
                        {index === steps.length - 1 ? (isEditing ? 'Update Job Consignment' : 'Submit Job Consignment') : 'Continue'}
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
