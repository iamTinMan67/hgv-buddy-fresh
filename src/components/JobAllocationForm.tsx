import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
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
import { Search, LocationOn as LocationIcon, Add } from '@mui/icons-material';
import { jobIdGenerator } from '../utils/jobIdGenerator';
import { AppDispatch, RootState } from '../store';
import { addJob, addDailySchedule, updateJob } from '../store/slices/jobSlice';
import { JobAssignment, JobStatus, JobLocation, JobPriority } from '../store/slices/jobSlice';
import { PalletPricingService, LoadDimensions, LoadAssessment } from '../services/palletPricingService';
import { DeliveryAddress, fetchDeliveryAddresses, addDeliveryAddress } from '../store/slices/deliveryAddressesSlice';
import { JobService } from '../services/api';
import { createDeliveryAddress } from '../services/deliveryAddressesService';
import { supabase } from '../lib/supabase';
import {
  Assignment,
  Home,
  Save,
  Cancel,
  Delete,
  Edit,
  PersonAdd,
} from '@mui/icons-material';

  // Dynamic pallet options from Pallet Script
  const palletOptions = [
    ...PalletPricingService.getStandardPlots().map(plot => ({
      label: `${plot.name} (${plot.length}x${plot.width}x${plot.height}mm, ${plot.weight}kg)`,
      length: plot.length,
      width: plot.width,
      height: plot.height,
      weight: plot.weight,
      cost: plot.baseCost
    })),
    { label: "Custom", length: 0, width: 0, height: 0, weight: 0, cost: 0 }
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
  length: number; // cm
  width: number; // cm
  height: number; // cm
  tailLift: boolean;
  forkLift: boolean;
  handBall: boolean;
}

interface JobAllocationFormProps {
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
  priority: 'before_9am' | 'am_timed' | 'pm_timed' | 'any_time';
  timeSensitive?: boolean;
  pickupAddress: StructuredAddress;
  deliveryAddress: StructuredAddress;
  pickupDate: string;
  pickupTime: string;
  deliveryDate: string;
  deliveryTime: string;
  

  cargoType: string;
  cargoWeight: number;
  cargoVolume: number;
  specialRequirements: string[];
  equipmentRequirements: {
    tailLift: boolean;
    forkLift: boolean;
    handBall: boolean;
  };
  notes: string;
  estimatedDuration: number;
  estimatedCost: number;
}

interface Contact {
  id: string;
  name: string;
  company: string;
  position: string;
  contactType: 'Client' | 'Supplier' | 'Partner' | 'Prospect';
  addresses: {
    id: string;
    name: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  town: string;
  city: string;
  postcode: string;
    isDefault: boolean;
  }[];
  phone: string;
  email: string;
}

const JobAllocationForm: React.FC<JobAllocationFormProps> = ({ onClose, initialData, isEditing = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const [activeStep, setActiveStep] = useState(0);
  // using pallet counter dropdown (selectedPalletForCounter) for selecting pallet type, including Custom
  const [dimensions, setDimensions] = useState({
    length: '',
    width: '',
    height: '',
    weight: ''
  });
  const [loadAssessment, setLoadAssessment] = useState<LoadAssessment | null>(null);
  const [showFieldHints, setShowFieldHints] = useState<Record<string, boolean>>({});
  const [palletItems, setPalletItems] = useState<PalletItem[]>([]);
  const [selectedPalletForCounter, setSelectedPalletForCounter] = useState<string>('');
  const [palletQuantity, setPalletQuantity] = useState<number>(1);
  const [newPalletFlags, setNewPalletFlags] = useState<{ tailLift: boolean; forkLift: boolean; handBall: boolean }>({
    tailLift: false,
    forkLift: true,
    handBall: false,
  });

  // Auto-calculate cargo volume for Custom pallets whenever dimensions/quantity change
  useEffect(() => {
    if (selectedPalletForCounter === 'Custom') {
      const length = Number(dimensions.length);
      const width = Number(dimensions.width);
      const height = Number(dimensions.height);
      if (length && width && height) {
        const baseVolume = PalletPricingService.calculateVolume(length, width, height);
        const qty = Number(palletQuantity) || 1;
        setFormData(prev => ({ ...prev, cargoVolume: baseVolume * qty }));
      }
    }
  }, [dimensions, palletQuantity, selectedPalletForCounter]);

  // Delivery address integration state
  const [selectedPickupAddressId, setSelectedPickupAddressId] = useState<string>('');
  const [selectedDeliveryAddressId, setSelectedDeliveryAddressId] = useState<string>('');
  const [showDeliveryAddressesDialog, setShowDeliveryAddressesDialog] = useState(false);
  const [addressDialogMode, setAddressDialogMode] = useState<'pickup' | 'delivery'>('pickup');
  const [newAddress, setNewAddress] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    town: '',
    city: '',
    postcode: '',
    contactName: '',
    contactPhone: '',
    deliveryInstructions: ''
  });

  // Get delivery addresses from Redux store
  const { addresses: deliveryAddresses } = useSelector((state: RootState) => state.deliveryAddresses);
  

  // Get tomorrow's date for default values
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowString = tomorrow.toISOString().split('T')[0];

  // Add pallet item to counter
  const addPalletItem = () => {
    if (!selectedPalletForCounter) return;
    
    const pallet = palletOptions.find(p => p.label === selectedPalletForCounter);
    if (!pallet) return;

    const isCustom = selectedPalletForCounter === 'Custom';
    const qty = Number(palletQuantity) || 1;
    const unitVolume = isCustom
      ? PalletPricingService.calculateVolume(Number(dimensions.length), Number(dimensions.width), Number(dimensions.height))
      : (pallet.length * pallet.width * pallet.height) / 1000000;
    const unitWeight = isCustom ? Number(formData.cargoWeight) || 0 : pallet.weight;
    const unitCost = isCustom ? 0 : pallet.cost;

    // Get dimensions - for custom use form input, for standard pallets use pallet dimensions
    const itemLength = isCustom ? Number(dimensions.length) : pallet.length; // mm to cm (pallet dimensions are in mm)
    const itemWidth = isCustom ? Number(dimensions.width) : pallet.width;
    const itemHeight = isCustom ? Number(dimensions.height) : pallet.height;

    const newItem: PalletItem = {
      id: Date.now().toString(),
      palletType: selectedPalletForCounter,
      quantity: qty,
      cost: unitCost,
      totalCost: unitCost * qty,
      weight: unitWeight,
      totalWeight: unitWeight * qty,
      volume: unitVolume,
      totalVolume: unitVolume * qty,
      length: itemLength / 10, // Convert mm to cm
      width: itemWidth / 10, // Convert mm to cm
      height: itemHeight / 10, // Convert mm to cm
      tailLift: newPalletFlags.tailLift,
      forkLift: newPalletFlags.forkLift,
      handBall: newPalletFlags.handBall,
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

  // Update per-item equipment flags
  const updatePalletItemFlag = (id: string, key: 'tailLift' | 'forkLift' | 'handBall', value: boolean) => {
    setPalletItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      // Enforce single selection across TL/FL/HB
      const next: PalletItem = { ...item, tailLift: false, forkLift: false, handBall: false } as PalletItem;
      if (value) {
        (next as any)[key] = true;
      }
      return next;
    }));
  };

  // Clients - load from Supabase
  const [clients, setClients] = useState<Contact[]>([]);
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('client_contacts')
        .select('*')
        .eq('category', 'client')
        .eq('status', 'active')
        .order('name', { ascending: true });
      if (!error) {
        const mapped: Contact[] = (data || []).map((row: any) => ({
          id: row.id,
          name: row.contact_name || row.name,
          company: row.company_name || row.company,
          position: row.job_title || row.position,
          contactType: 'Client',
          addresses: [{
            id: `${row.id}-address`,
            name: `${row.contact_name || row.name} - ${row.company_name || row.company}`,
            addressLine1: row.address_line1 || '',
            addressLine2: row.address_line2 || '',
            addressLine3: row.address_line3 || '',
            town: row.town || '',
            city: row.city || '',
            postcode: row.postcode || '',
            isDefault: true
          }],
          phone: row.phone || '',
          email: row.email || ''
        }));
        setClients(mapped);
      } else {
        console.error('Failed to load clients', error);
      }
    })();
  }, []);

  const [formData, setFormData] = useState<JobConsignmentData>({
    jobId: '',
    clientName: '',
    priority: 'any_time',
    timeSensitive: false,
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

    cargoType: 'Custom',
    cargoWeight: 0,
    cargoVolume: 0,
    specialRequirements: [],
    equipmentRequirements: {
      tailLift: false,
      forkLift: true,
      handBall: false,
    },
    notes: '',
    estimatedDuration: 0,
    estimatedCost: 0,
  });

  // Assess load when dimensions change using Pallet Script logic
  useEffect(() => {
    const length = parseFloat(dimensions.length);
    const width = parseFloat(dimensions.width);
    const height = parseFloat(dimensions.height);
    const weight = parseFloat(dimensions.weight);
    
    if (length > 0 && width > 0 && height > 0 && weight > 0) {
      const loadDimensions: LoadDimensions = {
        length,
        width,
        height,
        weight,
        notes: formData.notes || ''
      };
      
      const assessment = PalletPricingService.assessLoad(loadDimensions);
      setLoadAssessment(assessment);
      
      // Update estimated cost based on Pallet Script calculation
      setFormData(prev => ({
        ...prev,
        estimatedCost: assessment.totalCost
      }));
    }
  }, [dimensions, formData.notes]);

  // Postcode lookup state
  const [pickupPostcodeResults, setPickupPostcodeResults] = useState<PostcodeLookupResult[]>([]);
  const [deliveryPostcodeResults, setDeliveryPostcodeResults] = useState<PostcodeLookupResult[]>([]);
  const [showPickupPostcodeLookup, setShowPickupPostcodeLookup] = useState(false);
  const [showDeliveryPostcodeLookup, setShowDeliveryPostcodeLookup] = useState(false);
  const [isLoadingPostcode, setIsLoadingPostcode] = useState(false);

  

  // Selected client state
  const [selectedClient, setSelectedClient] = useState<Contact | null>(null);

  // Client form dialog state
  const [showClientForm, setShowClientForm] = useState(false);
  
  // Pickup contact fields visibility state
  const [showPickupContactFields, setShowPickupContactFields] = useState(false);
  
  // Delivery contact fields visibility state
  const [showDeliveryContactFields, setShowDeliveryContactFields] = useState(false);
  const [newClient, setNewClient] = useState<Omit<Contact, 'id'>>({
    name: '',
    company: '',
    position: '',
    contactType: 'Client',
    addresses: [
      {
        id: '',
        name: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    town: '',
    city: '',
    postcode: '',
        isDefault: true,
      },
    ],
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
        priority: initialData.priority || 'any_time',
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
        cargoType: initialData.cargoType || '',
        cargoWeight: initialData.cargoWeight || initialData.loadDimensions?.weight || 0,
        cargoVolume: initialData.loadDimensions?.volume || 0,
        specialRequirements: initialData.specialRequirements || [],
        equipmentRequirements: {
          tailLift: false,
          forkLift: true,
          handBall: false,
        },
        notes: initialData.notes || '',
        estimatedDuration: initialData.estimatedDuration || 0,
        estimatedCost: 0,
      };
      
      setFormData(mappedData);
      
      // Set client name if available
      if (initialData.customerName) {
        setSelectedClient(clients.find(client => client.name === initialData.customerName) || null);
      }
      
      // Derive timeSensitive from existing priority when editing
      setFormData(prev => ({
        ...prev,
        timeSensitive: !!initialData.priority && initialData.priority !== 'any_time'
      }));
      
      // Sync pallet counter selection with cargoType if it matches a pallet option
      if (initialData.cargoType) {
        const matchingPallet = palletOptions.find(p => p.label === initialData.cargoType);
        if (matchingPallet) {
          setSelectedPalletForCounter(matchingPallet.label);
        }
      }

      // Load pallet items if they exist in the initial data
      if (initialData.palletItems && Array.isArray(initialData.palletItems)) {
        setPalletItems(initialData.palletItems);
      }
    }
  }, [isEditing, initialData]);

  // Fetch delivery addresses when component mounts
  useEffect(() => {
    // Fetch all delivery addresses initially to see what's in the database
    console.log('🔍 Initial fetch of all delivery addresses');
    dispatch(fetchDeliveryAddresses());
  }, [dispatch]);

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
    // Calculate totals from pallet items
    const totalCost = palletItems.reduce((sum, item) => sum + item.totalCost, 0);
    const totalWeight = palletItems.reduce((sum, item) => sum + item.totalWeight, 0);
    const totalVolume = palletItems.reduce((sum, item) => sum + item.totalVolume, 0);

    // Map UI priority to DB-valid JobPriority
    const priorityMap: Record<string, JobPriority> = {
      before_9am: 'urgent',
      am_timed: 'high',
      pm_timed: 'medium',
      any_time: 'low',
    };
    const mappedPriority: JobPriority = priorityMap[formData.priority] || 'low';

    // Convert form data to JobAssignment format
    const jobAssignment: JobAssignment = {
      id: formData.jobId,
      jobNumber: formData.jobId,
      title: `Job for ${formData.clientName}`,
      description: palletItems.length > 0 
        ? `Multiple Pallets: ${palletItems.map(item => `${item.palletType} × ${item.quantity}`).join(', ')} - Total: £${totalCost.toFixed(2)}, ${totalWeight}kg`
        : (formData.cargoWeight > 0 || formData.cargoVolume > 0 
          ? `Cargo: ${selectedPalletForCounter || formData.cargoType || 'N/A'}${formData.cargoWeight > 0 ? `, Weight: ${formData.cargoWeight}kg` : ''}${formData.cargoVolume > 0 ? `, Volume: ${formData.cargoVolume}m³` : ''}`
          : `Job for ${formData.clientName}`),
      customerName: formData.clientName,

      priority: mappedPriority,
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
          line1: formData.deliveryAddress.addressLine1,
          line2: formData.deliveryAddress.addressLine2,
          line3: formData.deliveryAddress.addressLine3,
          town: formData.deliveryAddress.town,
          city: formData.deliveryAddress.city,
          postcode: formData.deliveryAddress.postcode,
        },
        contactPerson: formData.deliveryAddress.contactName,
        contactPhone: formData.deliveryAddress.contactPhone,
        deliveryInstructions: `Contact: ${formData.deliveryAddress.contactName} (${formData.deliveryAddress.contactPhone})`,
      },
      useDifferentDeliveryAddress: false,
      cargoType: palletItems.length > 0 ? `Multiple Pallets (${palletItems.length} types)` : (selectedPalletForCounter || formData.cargoType),
      cargoWeight: palletItems.length > 0 ? totalWeight : formData.cargoWeight,
      specialRequirements: formData.specialRequirements.join(', '),
      notes: formData.notes,
      createdAt: isEditing && initialData?.createdAt ? initialData.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: isEditing && initialData?.createdBy ? initialData.createdBy : 'current-user', // Would need to get from auth context
      authorizedBy: isEditing && initialData?.authorizedBy ? initialData.authorizedBy : 'current-user', // Would need to get from auth context
      loadDimensions: (() => {
        if (palletItems.length > 0) {
          // Calculate aggregate dimensions from all pallet items
          // Max length and width (longest/widest pallet)
          // Total height (sum of heights - assuming pallets can be stacked)
          const maxLength = Math.max(...palletItems.map(item => item.length));
          const maxWidth = Math.max(...palletItems.map(item => item.width));
          const totalHeight = palletItems.reduce((sum, item) => sum + (item.height * item.quantity), 0);
          
          return {
            length: Math.round(maxLength), // cm
            width: Math.round(maxWidth), // cm
            height: Math.round(totalHeight), // cm (total if stacked)
            weight: totalWeight,
            volume: totalVolume,
            isOversized: maxLength > 300 || maxWidth > 300 || totalHeight > 400, // > 3m x 3m x 4m
            isProtruding: false,
            isBalanced: true,
            isFragile: false,
          };
        } else {
          // For non-pallet items, use form data if available
          const formLength = Number(dimensions.length) || 0;
          const formWidth = Number(dimensions.width) || 0;
          const formHeight = Number(dimensions.height) || 0;
          
          return {
            length: formLength / 10, // Convert mm to cm if from form
            width: formWidth / 10,
            height: formHeight / 10,
            weight: formData.cargoWeight,
            volume: formData.cargoVolume,
            isOversized: formLength > 3000 || formWidth > 3000 || formHeight > 4000,
            isProtruding: false,
            isBalanced: true,
            isFragile: false,
          };
        }
      })()
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
      // Optimistically add job locally so it appears in Daily Planner immediately
      dispatch(addJob(jobAssignment));

      // Persist job to DB in background
      (async () => {
        try {
          // Ensure delivery addresses exist in DB and capture their IDs if not already persisted
          const ensureAddress = async (addr: any): Promise<string> => {
            // If we have a matching existing address in Redux by line1+postcode, reuse it
            const existing = deliveryAddresses.find(a => a.address.line1 === addr.address.line1 && a.address.postcode === addr.address.postcode);
            if (existing) return existing.id;
            const created = await createDeliveryAddress({
              name: addr.name || `${addr.address.line1}, ${addr.address.postcode}`,
              clientId: undefined,
              address: addr.address,
              contactPerson: addr.contactPerson,
              contactPhone: addr.contactPhone,
              deliveryInstructions: addr.deliveryInstructions
            });
            return created.id;
          };

          const pickupId = await ensureAddress(jobAssignment.pickupLocation);
          const deliveryId = await ensureAddress(jobAssignment.deliveryLocation);

          // Build complete payload for jobs table with all schema fields
          // Note: customer_name, customer_phone, customer_email removed - client data is in client_contacts table
          // Client information is stored in pickup_address/delivery_address JSON fields
          const payload = {
            job_number: String(jobAssignment.jobNumber || ''),
            title: String(jobAssignment.title || ''),
            description: String(jobAssignment.description || ''),
            priority: mappedPriority,
            status: 'pending',
            estimated_duration: Number(jobAssignment.estimatedDuration || 0),
            scheduled_date: String(jobAssignment.scheduledDate || formData.pickupDate),
            scheduled_time: String(jobAssignment.scheduledTime || formData.pickupTime),
            // Note: pickup_address and delivery_address columns don't exist in jobs table
            // Address data is stored in delivery_addresses table and linked via IDs (pickupId, deliveryId)
            // Store metadata (pallet_items, time_sensitive, clientId) as JSON in special_requirements
            special_requirements: (() => {
              const metadata = {
                pallet_items: palletItems.length > 0 ? palletItems : null,
                time_sensitive: formData.timeSensitive || false,
                clientId: selectedClient?.id || null,
                clientName: formData.clientName || '',
                pickupId: pickupId || null,
                deliveryId: deliveryId || null,
                originalPriority: formData.priority || null, // Store original UI priority value (e.g., "before_9am") for display
              };
              const existingReqs = jobAssignment.specialRequirements || '';
              // Store metadata as JSON, append existing requirements if any
              const metadataJson = JSON.stringify(metadata);
              return existingReqs 
                ? `${existingReqs} | METADATA:${metadataJson}`
                : `METADATA:${metadataJson}`;
            })(),
          } as any;

          const result = await JobService.createJob(payload as any);
          if (!result.success || !result.data) {
            console.error('Failed to persist job to DB:', result.error);
            alert(`Failed to save job to database: ${result.error || 'Unknown error'}`);
          } else {
            console.log('Job saved to DB:', result.data);
          }
        } catch (err) {
          console.error('Error creating job in DB:', err);
        }
      })();

      // Create a daily schedule entry for new jobs only (local planning data)
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

  const handleEquipmentRequirementChange = (equipment: 'tailLift' | 'forkLift' | 'handBall', checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      equipmentRequirements: {
        ...prev.equipmentRequirements,
        [equipment]: checked
      }
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
    console.log('handleClientChange called with:', clientName);
    const selectedClient = clients.find(client => client.name === clientName);
    console.log('Selected client:', selectedClient);
    
    if (selectedClient) {
      const defaultAddress = selectedClient.addresses.find(addr => addr.isDefault) || selectedClient.addresses[0];
      console.log('Default address:', defaultAddress);
      
      const fullAddress = `${defaultAddress.addressLine1}, ${defaultAddress.city}, ${defaultAddress.postcode}`;
      const formattedAddress = fullAddress.replace(/, /g, ',\n');
      
      const newPickupAddress = {
        addressLine1: defaultAddress.addressLine1,
        addressLine2: defaultAddress.addressLine2 || '',
        addressLine3: defaultAddress.addressLine3 || '',
        town: defaultAddress.town,
        city: defaultAddress.city,
        postcode: defaultAddress.postcode,
        contactName: selectedClient.name,
        contactPhone: selectedClient.phone,
        contactEmail: selectedClient.email,
      };
      
      console.log('New pickup address to set:', newPickupAddress);
      
      setFormData(prev => {
        const newData = {
          ...prev,
          clientName: clientName,
          pickupAddress: newPickupAddress,
          deliveryAddress: {
            addressLine1: defaultAddress.addressLine1,
            addressLine2: defaultAddress.addressLine2 || '',
            addressLine3: defaultAddress.addressLine3 || '',
            town: defaultAddress.town,
            city: defaultAddress.city,
            postcode: defaultAddress.postcode,
            contactName: selectedClient.name,
            contactPhone: selectedClient.phone,
            contactEmail: selectedClient.email,
          },
        };
        console.log('New formData keys:', Object.keys(newData));
        return newData;
      });
      
      // Focus on pickup location field after client selection
      setTimeout(() => {
        const pickupLocationField = document.querySelector('textarea[name="pickupAddress"]') as HTMLTextAreaElement;
        if (pickupLocationField) {
          pickupLocationField.focus();
        }
      }, 100);
    } else {
      console.log('No client found, clearing addresses');
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

  // Add useEffect to monitor formData changes
  useEffect(() => {
    console.log('formData.pickupAddress changed:', formData.pickupAddress);
  }, [formData.pickupAddress]);

  // Add useEffect to monitor clientName changes
  useEffect(() => {
    console.log('formData.clientName changed:', formData.clientName);
    
    // Refetch delivery addresses when client changes
    if (formData.clientName) {
      const selectedClient = clients.find(client => client.name === formData.clientName);
      if (selectedClient) {
        console.log('🔍 Refetching delivery addresses for client:', selectedClient.name, selectedClient.id);
        dispatch(fetchDeliveryAddresses(selectedClient.id));
      }
    } else {
      // If no client selected, fetch all delivery addresses
      console.log('🔍 Refetching all delivery addresses');
      dispatch(fetchDeliveryAddresses());
    }
  }, [formData.clientName, dispatch, clients]);

  // Add useEffect to log initial state
  useEffect(() => {
    console.log('Initial formData keys:', Object.keys(formData));
    console.log('Initial clients:', clients);
  }, []);

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
      position: '',
      contactType: 'Client',
      addresses: [
        {
          id: '',
          name: '',
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      town: '',
      city: '',
      postcode: '',
          isDefault: true,
        },
      ],
      phone: '',
      email: '',
    });
  };

  const handleClientFormSubmit = async () => {
    try {
      const addr = newClient.addresses[0] || {
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        town: '',
        city: '',
        postcode: ''
      };

      const insertRow = {
        // Support both schemas by writing to both new and legacy columns
        contact_name: newClient.name,
        name: newClient.name,
        company_name: newClient.company,
        company: newClient.company,
        job_title: newClient.position,
        position: newClient.position,
        email: newClient.email,
        phone: newClient.phone || null,
        mobile: null as string | null,
        address_line1: addr.addressLine1,
        address_line2: addr.addressLine2 || null,
        address_line3: addr.addressLine3 || null,
        town: addr.town || null,
        city: addr.city,
        postcode: addr.postcode,
        country: 'UK',
        category: 'client' as const,
        status: 'active' as const,
        notes: null as string | null,
      };

      const { data: created, error } = await supabase
        .from('client_contacts')
        .insert(insertRow)
        .select('*')
        .single();

      if (error) throw error;

      // Map created record into local Contact type and update dropdown
      const mapped: Contact = {
        id: created.id,
        name: created.name,
        company: created.company,
        position: created.position,
        contactType: 'Client',
        addresses: [],
        phone: created.phone || '',
        email: created.email || ''
      };

      setClients(prev => {
        const next = [...prev, mapped].sort((a, b) => a.name.localeCompare(b.name));
        return next;
      });

      // Select the newly created client in the form
      setFormData(prev => ({ ...prev, clientName: mapped.name }));

      // Close the dialog and reset form
      handleClientFormClose();
    } catch (err) {
      console.error('Failed to create client contact', err);
    }
  };

  const handleNewClientInputChange = (field: keyof Omit<Contact, 'id'>, value: string | number, addressIndex?: number, addressField?: string) => {
    if (field === 'addresses' && addressIndex !== undefined && addressField) {
      setNewClient(prev => ({
        ...prev,
        addresses: prev.addresses.map((addr, index) => 
          index === addressIndex 
            ? { ...addr, [addressField]: value }
            : addr
        )
      }));
    } else {
    setNewClient(prev => ({
      ...prev,
      [field]: value
    }));
    }
  };

  const togglePickupContactFields = () => {
    setShowPickupContactFields(prev => !prev);
  };

  const toggleDeliveryContactFields = () => {
    setShowDeliveryContactFields(prev => !prev);
  };

  // Field hints from Pallet Script
  const getFieldHints = (fieldName: string): string[] => {
    return PalletPricingService.getFieldHints()[fieldName] || [];
  };

  const toggleFieldHints = (fieldName: string) => {
    setShowFieldHints(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  // Debug logging
      console.log('JobAllocationForm: Rendering form with props:', { isEditing, hasInitialData: !!initialData });

  // Delivery address selection handlers
  const handlePickupAddressSelect = (addressId: string) => {
    setSelectedPickupAddressId(addressId);
    if (addressId) {
      // Check if it's a client address or general address
      if (addressId.startsWith('client-')) {
        // It's a client address - find it in the filtered addresses
        const selectedAddress = filteredPickupAddresses.find(addr => addr.id === addressId);
        if (selectedAddress) {
          const contactLine = [
            selectedAddress.contactPerson,
            selectedAddress.contactPhone
          ].filter(Boolean).join(' • ');

          setFormData(prev => ({
            ...prev,
            pickupAddress: {
              addressLine1: selectedAddress.address.line1,
              addressLine2: selectedAddress.address.line2 || '',
              addressLine3: selectedAddress.address.line3 || '',
              town: selectedAddress.address.town,
              city: selectedAddress.address.city || '',
              postcode: selectedAddress.address.postcode,
              contactName: selectedAddress.contactPerson || '',
              contactPhone: selectedAddress.contactPhone || '',
              contactEmail: selectedAddress.contactEmail || '',
            },
            // Also inject into the multiline pickup location text (top line as contact)
            // We rely on rendering value from formData fields, so the helper text already shows contact.
          }));
        }
      } else {
        // It's a general address
        const selectedAddress = deliveryAddresses.find(addr => addr.id === addressId);
        if (selectedAddress) {
          setFormData(prev => ({
            ...prev,
            pickupAddress: {
              addressLine1: selectedAddress.address.line1,
              addressLine2: selectedAddress.address.line2 || '',
              addressLine3: selectedAddress.address.line3 || '',
              town: selectedAddress.address.town,
              city: selectedAddress.address.city || '',
              postcode: selectedAddress.address.postcode,
              contactName: selectedAddress.contactPerson || '',
              contactPhone: selectedAddress.contactPhone || '',
              contactEmail: '',
            }
          }));
        }
      }
    }
  };

  const handleDeliveryAddressSelect = (addressId: string) => {
    setSelectedDeliveryAddressId(addressId);
    if (addressId) {
      // Check if it's a client address or general address
      if (addressId.startsWith('client-')) {
        // It's a client address - find it in the filtered addresses
        const selectedAddress = filteredDeliveryAddresses.find(addr => addr.id === addressId);
        if (selectedAddress) {
          setFormData(prev => ({
            ...prev,
            deliveryAddress: {
              addressLine1: selectedAddress.address.line1,
              addressLine2: selectedAddress.address.line2 || '',
              addressLine3: selectedAddress.address.line3 || '',
              town: selectedAddress.address.town,
              city: selectedAddress.address.city || '',
              postcode: selectedAddress.address.postcode,
              contactName: selectedAddress.contactPerson || '',
              contactPhone: selectedAddress.contactPhone || '',
              contactEmail: selectedAddress.contactEmail || '',
            }
          }));
        }
      } else {
        // It's a general address
        const selectedAddress = deliveryAddresses.find(addr => addr.id === addressId);
        if (selectedAddress) {
          setFormData(prev => ({
            ...prev,
            deliveryAddress: {
              addressLine1: selectedAddress.address.line1,
              addressLine2: selectedAddress.address.line2 || '',
              addressLine3: selectedAddress.address.line3 || '',
              town: selectedAddress.address.town,
              city: selectedAddress.address.city || '',
              postcode: selectedAddress.address.postcode,
              contactName: selectedAddress.contactPerson || '',
              contactPhone: selectedAddress.contactPhone || '',
              contactEmail: '',
            }
          }));
        }
      }
    }
  };

  // Calculate totals from pallet items for display
  const totalCost = palletItems.reduce((sum, item) => sum + item.totalCost, 0);
  const totalWeight = palletItems.reduce((sum, item) => sum + item.totalWeight, 0);
  const totalVolume = palletItems.reduce((sum, item) => sum + item.totalVolume, 0);

  // Get client-specific addresses for pickup and delivery
  const getClientAddresses = (clientName: string) => {
    const selectedClient = clients.find(client => client.name === clientName);
    return selectedClient ? selectedClient.addresses : [];
  };

  // Use useMemo to recalculate filtered addresses when clientName or deliveryAddresses change
  const filteredPickupAddresses = React.useMemo(() => {
    const selectedClient = clients.find(client => client.name === formData.clientName);
    if (!selectedClient) return [];

    const clientAddresses = getClientAddresses(formData.clientName);

    const clientMapped = clientAddresses.map(addr => ({
      id: `client-${addr.id}`,
      name: `${addr.name} (${formData.clientName})`,
      address: {
        line1: addr.addressLine1,
        line2: addr.addressLine2,
        line3: addr.addressLine3,
        town: addr.town,
        city: addr.city,
        postcode: addr.postcode
      },
      contactPerson: selectedClient.name,
      contactPhone: selectedClient.phone,
      contactEmail: selectedClient.email
    }));

    const linked = deliveryAddresses
      .filter(addr => addr.clientId === selectedClient.id)
      .filter(addr => !clientAddresses.some(ca => ca.addressLine1 === addr.address.line1 && ca.postcode === addr.address.postcode));

    return [...clientMapped, ...linked];
  }, [formData.clientName, deliveryAddresses, clients]);

  const filteredDeliveryAddresses = React.useMemo(() => {
    const selectedClient = clients.find(client => client.name === formData.clientName);
    if (!selectedClient) return [];

    const clientAddresses = getClientAddresses(formData.clientName);

    const clientMapped = clientAddresses.map(addr => ({
      id: `client-${addr.id}`,
      name: `${addr.name} (${formData.clientName})`,
      address: {
        line1: addr.addressLine1,
        line2: addr.addressLine2,
        line3: addr.addressLine3,
        town: addr.town,
        city: addr.city,
        postcode: addr.postcode
      },
      contactPerson: selectedClient.name,
      contactPhone: selectedClient.phone,
      contactEmail: selectedClient.email
    }));

    const linked = deliveryAddresses
      .filter(addr => addr.clientId === selectedClient.id)
      .filter(addr => !clientAddresses.some(ca => ca.addressLine1 === addr.address.line1 && ca.postcode === addr.address.postcode));

    return [...clientMapped, ...linked];
  }, [formData.clientName, deliveryAddresses, clients]);

  // Selected option lookups for helper text
  const selectedPickupOption = React.useMemo(() => {
    return filteredPickupAddresses.find(a => a.id === selectedPickupAddressId);
  }, [filteredPickupAddresses, selectedPickupAddressId]);
  const selectedDeliveryOption = React.useMemo(() => {
    return filteredDeliveryAddresses.find(a => a.id === selectedDeliveryAddressId);
  }, [filteredDeliveryAddresses, selectedDeliveryAddressId]);

  const selectedClientForHelpers = React.useMemo(() => {
    return clients.find(c => c.name === formData.clientName) || null;
  }, [clients, formData.clientName]);

  return (
    <Box sx={{ p: 3, bgcolor: 'black', minHeight: '100vh', color: 'white' }}>
      <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', color: 'white' }}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'white', mb: 3 }}>
            {isEditing ? 'Edit Job Consignment' : 'New Job Consignment'}
          </Typography>
          
          <Typography variant="body1" sx={{ color: 'yellow', mb: 3, fontStyle: 'italic' }}>
            💡 Integrated with Pallet Script for dynamic pricing and load assessment
          </Typography>

          <Stepper activeStep={activeStep} orientation="vertical" sx={{ color: 'white' }}>
            {steps.map((step, index) => (
              <Step key={step}>
                <StepLabel sx={{ color: 'white' }}>{step}</StepLabel>
                <StepContent>
                  <Box sx={{ mb: 2 }}>
                    {index === 0 && (
                      <Grid container spacing={3}>
                        {/* Client Name */}
                        <Grid item xs={6} md={4}>
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
                                  {client.name} - {client.position} at {client.company} ({client.contactType})
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
                              title="Add New Contact"
                            >
                              <PersonAdd />
                            </IconButton>
                          </Box>
                          {/* Debug display */}
                          <Typography variant="caption" sx={{ color: 'yellow', fontSize: '10px', mt: 1, display: 'block' }}>
                            Debug - Current Client: {formData.clientName || 'None selected'}
                          </Typography>
                        </Grid>
                        

                        
                        {/* Priority moved to Page 2 */}
                        

                        
                        {/* Pickup and Delivery Contact Information */}
                        <Grid item xs={12}>
                          <Grid container spacing={2}>
                            {/* Pickup Contact Fields */}
                            <Grid item xs={12} md={5}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" sx={{ color: 'white' }}>
                                Pickup Contact
                              </Typography>
                                <IconButton
                                  onClick={togglePickupContactFields}
                                  sx={{ 
                                    color: 'primary.main',
                                    '&:hover': {
                                      backgroundColor: 'primary.main',
                                      color: 'white'
                                    }
                                  }}
                                  title={showPickupContactFields ? 'Hide Contact Fields' : 'Edit Contact Fields'}
                                >
                                  <Edit />
                                </IconButton>
                              </Box>
                              {showPickupContactFields && (
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
                                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' },
                                      mb: 2
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
                                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' },
                                      mb: 2
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
                              )}
                              
                              {/* Add Pickup Button */}
                              <Box sx={{ mt: 2 }}>
                                <Button
                                  variant="outlined"
                                  startIcon={<LocationIcon />}
                                  onClick={() => { 
                                    setAddressDialogMode('pickup'); 
                                    setShowDeliveryAddressesDialog(true); 
                                  }}
                                  sx={{ 
                                    color: 'grey.400', 
                                    borderColor: 'grey.600',
                                    height: '56px',
                                    width: '50%'
                                  }}
                                >
                                  Store Pickup
                                </Button>
                              </Box>
                            </Grid>

                            {/* Custom Pallet Fields (shown when Custom is selected) */}
                            {selectedPalletForCounter === 'Custom' && (
                              <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12} md={3}>
                                  <TextField
                                    fullWidth
                                    type="number"
                                    label="Length (mm)"
                                    value={dimensions.length}
                                    onChange={e => {
                                      const newLength = e.target.value;
                                      setDimensions(d => ({ ...d, length: newLength }));
                                      setSelectedPalletForCounter("Custom");
                                      if (newLength && dimensions.width && dimensions.height) {
                                        const volume = PalletPricingService.calculateVolume(Number(newLength), Number(dimensions.width), Number(dimensions.height));
                                        setFormData(prev => ({ ...prev, cargoVolume: volume }));
                                      }
                                    }}
                                    name="length"
                                    onMouseEnter={() => toggleFieldHints('length')}
                                    onMouseLeave={() => toggleFieldHints('length')}
                                    sx={{ '& .MuiOutlinedInput-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'grey.400' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' } }}
                                  />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                  <TextField
                                    fullWidth
                                    type="number"
                                    label="Width (mm)"
                                    value={dimensions.width}
                                    onChange={e => {
                                      const newWidth = e.target.value;
                                      setDimensions(d => ({ ...d, width: newWidth }));
                                      setSelectedPalletForCounter("Custom");
                                      if (dimensions.length && newWidth && dimensions.height) {
                                        const volume = PalletPricingService.calculateVolume(Number(dimensions.length), Number(newWidth), Number(dimensions.height));
                                        setFormData(prev => ({ ...prev, cargoVolume: volume }));
                                      }
                                    }}
                                    name="width"
                                    onMouseEnter={() => toggleFieldHints('width')}
                                    onMouseLeave={() => toggleFieldHints('width')}
                                    sx={{ '& .MuiOutlinedInput-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'grey.400' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' } }}
                                  />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                  <TextField
                                    fullWidth
                                    type="number"
                                    label="Height (mm)"
                                    value={dimensions.height}
                                    onChange={e => {
                                      const newHeight = e.target.value;
                                      setDimensions(d => ({ ...d, height: newHeight }));
                                      setSelectedPalletForCounter("Custom");
                                      if (dimensions.length && dimensions.width && newHeight) {
                                        const volume = PalletPricingService.calculateVolume(Number(dimensions.length), Number(dimensions.width), Number(newHeight));
                                        setFormData(prev => ({ ...prev, cargoVolume: volume }));
                                      }
                                    }}
                                    name="height"
                                    onMouseEnter={() => toggleFieldHints('height')}
                                    onMouseLeave={() => toggleFieldHints('height')}
                                    sx={{ '& .MuiOutlinedInput-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'grey.400' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' } }}
                                  />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                  <TextField
                                    fullWidth
                                    type="number"
                                    label="Cargo Weight (kg)"
                                    value={formData.cargoWeight}
                                    onChange={e => {
                                      handleInputChange('cargoWeight', Number(e.target.value));
                                      setSelectedPalletForCounter("Custom");
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
                                    name="cargoVolume"
                                    sx={{ 
                                      '& .MuiOutlinedInput-root': { color: 'white' },
                                      '& .MuiInputLabel-root': { color: 'grey.400' },
                                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                                    }}
                                  />
                                </Grid>
                              </Grid>
                            )}

                            {/* Delivery Contact Fields */}
                            <Grid item xs={12} md={5}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" sx={{ color: 'white' }}>
                                  Delivery Contact
                                </Typography>
                                <IconButton
                                  onClick={toggleDeliveryContactFields}
                                  sx={{ 
                                    color: 'primary.main',
                                    '&:hover': {
                                      backgroundColor: 'primary.main',
                                      color: 'white'
                                    }
                                  }}
                                  title={showDeliveryContactFields ? 'Hide Contact Fields' : 'Edit Contact Fields'}
                                >
                                  <Edit />
                                </IconButton>
                              </Box>
                              {showDeliveryContactFields && (
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
                              )}
                              
                              {/* Add Delivery Button */}
                              <Box sx={{ mt: 2 }}>
                                <Button
                                  variant="outlined"
                                  startIcon={<LocationIcon />}
                                  onClick={() => { 
                                    setAddressDialogMode('delivery'); 
                                    setShowDeliveryAddressesDialog(true); 
                                  }}
                                  sx={{ 
                                    color: 'grey.400', 
                                    borderColor: 'grey.600',
                                    height: '56px',
                                    width: '50%'
                                  }}
                                >
                                  Store Delivery
                                </Button>
                              </Box>
                            </Grid>
                          </Grid>
                        </Grid>
                        

                        
                        {/* Address Selection */}
                        <Grid item xs={12}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={5}>
                              <FormControl fullWidth sx={{ minHeight: '80px', '& .MuiInputLabel-root': { transform: 'translate(14px, -9px) scale(0.75)' } }}>
                                <InputLabel id="pickup-address-label" sx={{ color: 'grey.400' }}>Select Pickup Address</InputLabel>
                                <Select
                                  labelId="pickup-address-label"
                                  id="pickup-address-select"
                                  value={selectedPickupAddressId || ''}
                                  onChange={(e) => handlePickupAddressSelect(e.target.value as string)}
                                  displayEmpty
                                  MenuProps={{
                                    PaperProps: {
                                      sx: {
                                        bgcolor: 'black',
                                        color: 'white',
                                        '& .MuiMenuItem-root': { color: 'white' }
                                      }
                                    }
                                  }}
                                  sx={{
                                    color: 'white',
                                    height: '56px',
                                    backgroundColor: 'black',
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' },
                                    '& .MuiSelect-select': { paddingTop: '16px', paddingBottom: '16px', backgroundColor: 'black' }
                                  }}
                                >
                                  {filteredPickupAddresses.map((address) => (
                                    <MenuItem 
                                      key={address.id} 
                                      value={address.id} 
                                      sx={{ color: 'white' }}
                                    >
                                      {address.address.line1}{address.address.town ? `, ${address.address.town}` : ''}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} md={5}>
                              <FormControl fullWidth sx={{ minHeight: '80px', '& .MuiInputLabel-root': { transform: 'translate(14px, -9px) scale(0.75)' } }}>
                                <InputLabel id="delivery-address-label" sx={{ color: 'grey.400' }}>Select Delivery Address</InputLabel>
                                <Select
                                  labelId="delivery-address-label"
                                  id="delivery-address-select"
                                  value={selectedDeliveryAddressId || ''}
                                  onChange={(e) => handleDeliveryAddressSelect(e.target.value as string)}
                                  displayEmpty
                                  MenuProps={{
                                    PaperProps: {
                                      sx: {
                                        bgcolor: 'black',
                                        color: 'white',
                                        '& .MuiMenuItem-root': { color: 'white' }
                                      }
                                    }
                                  }}
                                  sx={{
                                    color: 'white',
                                    height: '56px',
                                    backgroundColor: 'black',
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' },
                                    '& .MuiSelect-select': { paddingTop: '16px', paddingBottom: '16px', backgroundColor: 'black' }
                                  }}
                                >
                                  {filteredDeliveryAddresses.map((address) => (
                                    <MenuItem 
                                      key={address.id} 
                                      value={address.id}
                                      sx={{ color: 'white' }}
                                    >
                                      {address.address.line1}{address.address.town ? `, ${address.address.town}` : ''}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} md={5}>
                              {/* Add Pickup button will be moved below pickup contact fields */}
                            </Grid>
                          </Grid>
                        </Grid>

                        
                        {/* Pickup and Delivery Location - Aligned with contact fields */}
                        <Grid item xs={12}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={5}>
                              <TextField
                                fullWidth
                                label="Pickup Location"
                                value={[
                                  formData.pickupAddress.addressLine1,
                                  formData.pickupAddress.addressLine2,
                                  formData.pickupAddress.addressLine3,
                                  formData.pickupAddress.town,
                                  formData.pickupAddress.city
                                ].filter((v, i) => v || i < 3).join('\n')}
                                onChange={(e) => {
                                  // Map each line to a structured field
                                  const lines = e.target.value.split('\n').map(l => l.trim());
                                  const newAddress: StructuredAddress = {
                                    addressLine1: lines[0] || '',
                                    addressLine2: lines[1] || '',
                                    addressLine3: lines[2] || '',
                                    town: lines[3] || '',
                                    city: lines[4] || '',
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
                                rows={5}
                                helperText={(selectedPickupAddressId ? (selectedPickupOption?.contactPerson || selectedPickupOption?.contactPhone || selectedPickupOption?.contactEmail) : (selectedClientForHelpers ? `${selectedClientForHelpers.name}${selectedClientForHelpers.phone ? ' • ' + selectedClientForHelpers.phone : ''}${selectedClientForHelpers.email ? ' • ' + selectedClientForHelpers.email : ''}` : '')) || ''}
                                name="pickupAddress"
                                sx={{ 
                                  '& .MuiOutlinedInput-root': { color: 'white' },
                                  '& .MuiInputLabel-root': { color: 'grey.400' },
                                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={5}>
                              <TextField
                                fullWidth
                                label="Delivery Location"
                                value={[
                                  formData.deliveryAddress.addressLine1,
                                  formData.deliveryAddress.addressLine2,
                                  formData.deliveryAddress.addressLine3,
                                  formData.deliveryAddress.town,
                                  formData.deliveryAddress.city
                                ].filter((v, i) => v || i < 3).join('\n')}
                                onChange={(e) => {
                                  // Map each line to a structured field
                                  const lines = e.target.value.split('\n').map(l => l.trim());
                                  const newAddress: StructuredAddress = {
                                    addressLine1: lines[0] || '',
                                    addressLine2: lines[1] || '',
                                    addressLine3: lines[2] || '',
                                    town: lines[3] || '',
                                    city: lines[4] || '',
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
                                rows={5}
                                helperText={(selectedDeliveryAddressId ? (selectedDeliveryOption?.contactPerson || selectedDeliveryOption?.contactPhone || selectedDeliveryOption?.contactEmail) : (selectedClientForHelpers ? `${selectedClientForHelpers.name}${selectedClientForHelpers.phone ? ' • ' + selectedClientForHelpers.phone : ''}${selectedClientForHelpers.email ? ' • ' + selectedClientForHelpers.email : ''}` : '')) || ''}
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
                            <Grid item xs={12} md={5}>
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
                            <Grid item xs={12} md={5}>
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

                        

                        

                        

                        
                        {/* Schedule Row: Pickup (cols 1-2) and Delivery (cols 3-4) */}
                        <Grid item xs={12}>
                          <Grid container spacing={2}>
                            {/* Pickup group (columns 1 & 2) */}
                            <Grid item xs={12} md={6}>
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                  <TextField
                                    type="date"
                                    label="Pickup Date"
                                    value={formData.pickupDate}
                                    onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const nextField = document.querySelector('input[name=\"pickupTime\"]') as HTMLInputElement;
                                        if (nextField) nextField.focus();
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
                                <Grid item xs={12} md={6}>
                                  <TextField
                                    type="time"
                                    label="Pickup Time"
                                    value={formData.pickupTime}
                                    onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const nextField = document.querySelector('input[name=\"deliveryDate\"]') as HTMLInputElement;
                                        if (nextField) nextField.focus();
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
                              </Grid>
                            </Grid>
                            {/* Delivery group (columns 3 & 4) */}
                            <Grid item xs={12} md={6}>
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                  <TextField
                                    type="date"
                                    label="Delivery Date"
                                    value={formData.deliveryDate}
                                    onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const nextField = document.querySelector('input[name=\"deliveryTime\"]') as HTMLInputElement;
                                        if (nextField) nextField.focus();
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
                                <Grid item xs={12} md={6}>
                                  <TextField
                                    type="time"
                                    label="Delivery Time"
                                    value={formData.deliveryTime}
                                    onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const nextField = document.querySelector('input[name=\"cargoWeight\"]') as HTMLInputElement;
                                        if (nextField) nextField.focus();
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
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    )}

                    {index === 1 && (
                      <Grid container spacing={3}>
                        {/* Pallet size dropdown removed; using Pallet Counter dropdown with Custom */}
                        
                        {/* Equipment Requirements moved to per-pallet controls below */}
                        
                        {/* Dimension fields with Pallet Script hints (visible only when Custom selected in Pallet Counter) */}
                        {selectedPalletForCounter === 'Custom' && (<>
                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Quantity"
                            value={palletQuantity}
                            onChange={e => {
                              const val = Number(e.target.value) || 1;
                              setPalletQuantity(val);
                            }}
                            inputProps={{ min: 1 }}
                            sx={{ '& .MuiOutlinedInput-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'grey.400' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' } }}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Length (mm)"
                            value={dimensions.length}
                            onChange={e => {
                              const newLength = e.target.value;
                              setDimensions(d => ({ ...d, length: newLength }));
                              setSelectedPalletForCounter("Custom");
                              // Update volume using Pallet Script calculation
                              if (newLength && dimensions.width && dimensions.height) {
                                const volume = PalletPricingService.calculateVolume(Number(newLength), Number(dimensions.width), Number(dimensions.height));
                                setFormData(prev => ({ ...prev, cargoVolume: volume }));
                              }
                            }}
                            name="length"
                            onMouseEnter={() => toggleFieldHints('length')}
                            onMouseLeave={() => toggleFieldHints('length')}
                            sx={{ '& .MuiOutlinedInput-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'grey.400' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' } }}
                          />
                          {showFieldHints.length && (
                            <Box sx={{ 
                              position: 'absolute', 
                              zIndex: 1000, 
                              bgcolor: 'rgba(0, 0, 0, 0.9)', 
                              p: 1, 
                              borderRadius: 1, 
                              mt: 1,
                              maxWidth: 300
                            }}>
                              {getFieldHints('length').map((hint, idx) => (
                                <Typography key={idx} variant="caption" sx={{ color: 'yellow', display: 'block', mb: 0.5 }}>
                                  • {hint}
                                </Typography>
                              ))}
                            </Box>
                          )}
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Width (mm)"
                            value={dimensions.width}
                            onChange={e => {
                              const newWidth = e.target.value;
                              setDimensions(d => ({ ...d, width: newWidth }));
                              setSelectedPalletForCounter("Custom");
                              // Update volume using Pallet Script calculation
                              if (dimensions.length && newWidth && dimensions.height) {
                                const volume = PalletPricingService.calculateVolume(Number(dimensions.length), Number(newWidth), Number(dimensions.height));
                                setFormData(prev => ({ ...prev, cargoVolume: volume }));
                              }
                            }}
                            name="width"
                            onMouseEnter={() => toggleFieldHints('width')}
                            onMouseLeave={() => toggleFieldHints('width')}
                            sx={{ '& .MuiOutlinedInput-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'grey.400' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' } }}
                          />
                          {showFieldHints.width && (
                            <Box sx={{ 
                              position: 'absolute', 
                              zIndex: 1000, 
                              bgcolor: 'rgba(0, 0, 0, 0.9)', 
                              p: 1, 
                              borderRadius: 1, 
                              mt: 1,
                              maxWidth: 300
                            }}>
                              {getFieldHints('width').map((hint, idx) => (
                                <Typography key={idx} variant="caption" sx={{ color: 'yellow', display: 'block', mb: 0.5 }}>
                                  • {hint}
                                </Typography>
                              ))}
                            </Box>
                          )}
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Height (mm)"
                            value={dimensions.height}
                            onChange={e => {
                              const newHeight = e.target.value;
                              setDimensions(d => ({ ...d, height: newHeight }));
                              setSelectedPalletForCounter("Custom");
                              // Update volume using Pallet Script calculation
                              if (dimensions.length && dimensions.width && newHeight) {
                                const volume = PalletPricingService.calculateVolume(Number(dimensions.length), Number(dimensions.width), Number(newHeight));
                                setFormData(prev => ({ ...prev, cargoVolume: volume }));
                              }
                            }}
                            name="height"
                            onMouseEnter={() => toggleFieldHints('height')}
                            onMouseLeave={() => toggleFieldHints('height')}
                            sx={{ '& .MuiOutlinedInput-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'grey.400' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' } }}
                          />
                          {showFieldHints.height && (
                            <Box sx={{ 
                              position: 'absolute', 
                              bgcolor: 'rgba(0, 0, 0, 0.9)', 
                              p: 1, 
                              borderRadius: 1, 
                              mt: 1,
                              maxWidth: 300
                            }}>
                              {getFieldHints('height').map((hint, idx) => (
                                <Typography key={idx} variant="caption" sx={{ color: 'yellow', display: 'block', mb: 0.5 }}>
                                  • {hint}
                                </Typography>
                              ))}
                            </Box>
                          )}
                        </Grid>
                        <Grid item xs={12} md={3}>
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
                        </>)}

                        {/* Load Assessment from Pallet Script */}
                        {loadAssessment && (
                          <Grid item xs={12}>
                            <Box sx={{ 
                              border: '1px solid rgba(76, 175, 80, 0.5)', 
                              borderRadius: 2, 
                              p: 2, 
                              mb: 2,
                              bgcolor: 'rgba(76, 175, 80, 0.1)'
                            }}>
                              <Typography variant="h6" sx={{ color: 'success.main', mb: 2 }}>
                                📋 Pallet Script Assessment
                              </Typography>
                              
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>
                                    Recommended Plot: <span style={{ color: 'white' }}>{loadAssessment.recommendedPlot}</span>
                                  </Typography>
                                  <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>
                                    Base Cost: <span style={{ color: 'success.main' }}>£{loadAssessment?.calculatedCost?.toFixed(2) || '0.00'}</span>
                                  </Typography>
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    <Chip 
                                      label={loadAssessment.isOversized ? "Oversized" : "Standard Size"} 
                                      color={loadAssessment.isOversized ? "error" : "success"} 
                                      size="small" 
                                    />
                                    <Chip 
                                      label={loadAssessment.isProtruding ? "Protruding" : "Within Height"} 
                                      color={loadAssessment.isProtruding ? "warning" : "success"} 
                                      size="small" 
                                    />
                                    <Chip 
                                      label={loadAssessment.isBalanced ? "Balanced" : "Unbalanced"} 
                                      color={loadAssessment.isBalanced ? "success" : "error"} 
                                      size="small" 
                                    />
                                  </Box>
                                </Grid>

                                {loadAssessment.additionalCharges.length > 0 && (
                                  <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ color: 'warning.main', mb: 1 }}>
                                      Additional Charges:
                                    </Typography>
                                    {loadAssessment.additionalCharges.map((charge, idx) => (
                                      <Typography key={idx} variant="body2" sx={{ color: 'white', ml: 2 }}>
                                        • {charge}
                                      </Typography>
                                    ))}
                                  </Grid>
                                )}

                                <Grid item xs={12}>
                                  <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    py: 1,
                                    px: 2,
                                    bgcolor: 'rgba(76, 175, 80, 0.2)',
                                    borderRadius: 1,
                                    border: '1px solid rgba(76, 175, 80, 0.5)'
                                  }}>
                                    <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                      TOTAL COST (Pallet Script)
                                    </Typography>
                                    <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                      £{loadAssessment?.totalCost?.toFixed(2) || '0.00'}
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>
                          </Grid>
                        )}

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
                                  <InputLabel id="pallet-counter-label" sx={{ color: 'white', '&.Mui-focused': { color: 'white' } }}>Select Pallet Type</InputLabel>
                  <Select
                                    labelId="pallet-counter-label"
                                    value={selectedPalletForCounter}
                                    label="Select Pallet Type"
                                    onChange={(e) => setSelectedPalletForCounter(e.target.value)}
                                    sx={{ 
                                      color: 'white', 
                                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' },
                      '& .MuiSelect-select': { color: 'white' },
                      '& .MuiSvgIcon-root': { color: 'white' }
                                    }}
                                  >
                    {palletOptions.map(option => (
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
                              {/* Priority selection (after Quantity, before Equipment) */}
                              <Grid item xs={12} md={3}>
                                <FormControl fullWidth>
                                  <InputLabel id="counter-priority-label" sx={{ color: 'white', '&.Mui-focused': { color: 'white' } }}>Priority</InputLabel>
                                  <Select
                                    labelId="counter-priority-label"
                                    value={formData.priority}
                                    label="Priority"
                                    onChange={(e) => {
                                      const val = e.target.value as any;
                                      setFormData(prev => ({
                                        ...prev,
                                        priority: val,
                                        timeSensitive: val !== 'any_time' ? true : prev.timeSensitive
                                      }));
                                    }}
                                    sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }, '& .MuiSelect-select': { color: 'white' }, '& .MuiSvgIcon-root': { color: 'white' } }}
                                  >
                                    <MenuItem value="before_9am">Before 9am</MenuItem>
                                    <MenuItem value="am_timed">AM Timed</MenuItem>
                                    <MenuItem value="pm_timed">PM Timed</MenuItem>
                                    <MenuItem value="any_time">Any time</MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                              {/* Per-item equipment selection (single choice) */}
                              <Grid item xs={12} md={6}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', height: '56px' }}>
                                  <FormControlLabel
                                    control={<Checkbox checked={newPalletFlags.tailLift} onChange={(e) => setNewPalletFlags({ tailLift: e.target.checked, forkLift: false, handBall: false })} sx={{ color: 'grey.400', '&.Mui-checked': { color: 'primary.main' } }} />}
                                    label="Tail-Lift"
                                    sx={{ color: 'white' }}
                                  />
                                  <FormControlLabel
                                    control={<Checkbox checked={newPalletFlags.forkLift} onChange={(e) => setNewPalletFlags({ tailLift: false, forkLift: e.target.checked, handBall: false })} sx={{ color: 'grey.400', '&.Mui-checked': { color: 'primary.main' } }} />}
                                    label="Fork-Lift"
                                    sx={{ color: 'white' }}
                                  />
                                  <FormControlLabel
                                    control={<Checkbox checked={newPalletFlags.handBall} onChange={(e) => setNewPalletFlags({ tailLift: false, forkLift: false, handBall: e.target.checked })} sx={{ color: 'grey.400', '&.Mui-checked': { color: 'primary.main' } }} />}
                                    label="Hand-Ball"
                                    sx={{ color: 'white' }}
                                  />
                                </Box>
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
                            {/* Time Sensitivity (consignment-level) */}
                            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={!!formData.timeSensitive}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      setFormData(prev => ({ ...prev, timeSensitive: checked, priority: checked ? prev.priority : 'any_time' }));
                                    }}
                                    sx={{ color: 'grey.400', '&.Mui-checked': { color: 'primary.main' } }}
                                  />
                                }
                                label="Time Sensitive"
                                sx={{ color: 'white' }}
                              />
                            </Box>
                                
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
                                  <Grid item xs={3}>
                                    <Typography variant="body2" sx={{ color: 'grey.400', fontWeight: 'bold' }}>
                                      Equipment
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
                                    <Grid item xs={3}>
                                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <FormControlLabel
                                          control={<Checkbox checked={item.tailLift} onChange={(e) => updatePalletItemFlag(item.id, 'tailLift', e.target.checked)} sx={{ color: 'grey.400', '&.Mui-checked': { color: 'primary.main' } }} />}
                                          label="TL"
                                          sx={{ color: 'white' }}
                                        />
                                        <FormControlLabel
                                          control={<Checkbox checked={item.forkLift} onChange={(e) => updatePalletItemFlag(item.id, 'forkLift', e.target.checked)} sx={{ color: 'grey.400', '&.Mui-checked': { color: 'primary.main' } }} />}
                                          label="FL"
                                          sx={{ color: 'white' }}
                                        />
                                        <FormControlLabel
                                          control={<Checkbox checked={item.handBall} onChange={(e) => updatePalletItemFlag(item.id, 'handBall', e.target.checked)} sx={{ color: 'grey.400', '&.Mui-checked': { color: 'primary.main' } }} />}
                                          label="HB"
                                          sx={{ color: 'white' }}
                                        />
                                      </Box>
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
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Estimated Duration (minutes)"
                            value={formData.estimatedDuration}
                            onChange={(e) => handleInputChange('estimatedDuration', Number(e.target.value) || 0)}
                            inputProps={{ min: 0, step: 5 }}
                            helperText="Estimated time needed for pickup and delivery (for route planning)"
                            name="estimatedDuration"
                            sx={{ 
                              '& .MuiOutlinedInput-root': { color: 'white' },
                              '& .MuiInputLabel-root': { color: 'grey.400' },
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' },
                              '& .MuiFormHelperText-root': { color: 'grey.500' }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
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
                            <Typography variant="body2" sx={{ color: 'grey.400' }}>Time Sensitive:</Typography>
                            <Typography variant="body1" sx={{ color: 'white' }}>{formData.timeSensitive ? 'YES' : 'NO'}</Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" sx={{ color: 'grey.400' }}>Priority:</Typography>
                            <Typography variant="body1" sx={{ color: 'white' }}>
                              {formData.priority === 'before_9am' ? 'Before 9am' :
                               formData.priority === 'am_timed' ? 'AM Timed' :
                               formData.priority === 'pm_timed' ? 'PM Timed' :
                               formData.priority === 'any_time' ? 'Any time' :
                               formData.priority.toUpperCase()}
                            </Typography>
                          </Grid>

                          {/* Pickup Location Details */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>📍 Pickup Location</Typography>
                            <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                              <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                                {[
                                  formData.pickupAddress.addressLine1,
                                  formData.pickupAddress.addressLine2,
                                  formData.pickupAddress.addressLine3,
                                  formData.pickupAddress.town,
                                  formData.pickupAddress.city,
                                  formData.pickupAddress.postcode,
                                ].filter(Boolean).join(', ')}
                              </Typography>
                              {formData.pickupAddress.contactName && (
                                <Typography variant="body2" sx={{ color: 'grey.400' }}>
                                  Contact: {formData.pickupAddress.contactName}
                                  {formData.pickupAddress.contactPhone && ` (${formData.pickupAddress.contactPhone})`}
                                  {formData.pickupAddress.contactEmail && ` - ${formData.pickupAddress.contactEmail}`}
                                </Typography>
                              )}
                            </Box>
                          </Grid>

                          {/* Delivery Location Details */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>🚚 Delivery Location</Typography>
                            <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                              <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                                {[
                                  formData.deliveryAddress.addressLine1,
                                  formData.deliveryAddress.addressLine2,
                                  formData.deliveryAddress.addressLine3,
                                  formData.deliveryAddress.town,
                                  formData.deliveryAddress.city,
                                  formData.deliveryAddress.postcode,
                                ].filter(Boolean).join(', ')}
                              </Typography>
                              {formData.deliveryAddress.contactName && (
                                <Typography variant="body2" sx={{ color: 'grey.400' }}>
                                  Contact: {formData.deliveryAddress.contactName}
                                  {formData.deliveryAddress.contactPhone && ` (${formData.deliveryAddress.contactPhone})`}
                                  {formData.deliveryAddress.contactEmail && ` - ${formData.deliveryAddress.contactEmail}`}
                                </Typography>
                              )}
                            </Box>
                          </Grid>

                          {/* Scheduled Date/Time */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" sx={{ color: 'grey.400' }}>Scheduled Date:</Typography>
                            <Typography variant="body1" sx={{ color: 'white' }}>{formData.pickupDate}</Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" sx={{ color: 'grey.400' }}>Scheduled Time:</Typography>
                            <Typography variant="body1" sx={{ color: 'white' }}>{formData.pickupTime}</Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" sx={{ color: 'grey.400' }}>Estimated Duration:</Typography>
                            <Typography variant="body1" sx={{ color: 'white' }}>{formData.estimatedDuration} minutes</Typography>
                          </Grid>


                          {/* Cargo section - only show if no pallet items and has valid cargo data */}
                          {palletItems.length === 0 && (() => {
                            const selectedPallet = palletOptions.find(p => p.label === selectedPalletForCounter);
                            const qty = palletQuantity || 1;
                            
                            // Calculate volume from selected pallet type
                            let calculatedVolume = 0;
                            let calculatedWeight = 0;
                            if (selectedPallet) {
                              if (selectedPalletForCounter === 'Custom') {
                                calculatedVolume = formData.cargoVolume || 0;
                                calculatedWeight = formData.cargoWeight || 0;
                              } else {
                                // Standard pallet - calculate volume from dimensions
                                calculatedVolume = (selectedPallet.length * selectedPallet.width * selectedPallet.height) / 1000000; // Convert mm³ to m³
                                calculatedWeight = selectedPallet.weight || 0;
                                // Multiply by quantity if specified
                                calculatedVolume = calculatedVolume * qty;
                                calculatedWeight = calculatedWeight * qty;
                              }
                            }
                            
                            const hasValidData = formData.cargoWeight > 0 || formData.cargoVolume > 0 || 
                                               calculatedWeight > 0 || calculatedVolume > 0 || 
                                               (selectedPalletForCounter && selectedPalletForCounter !== 'Custom');
                            
                            return hasValidData ? (
                              <Grid item xs={12}>
                                <Typography variant="body2" sx={{ color: 'grey.400' }}>Cargo:</Typography>
                                <Typography variant="body1" sx={{ color: 'white' }}>
                                  {selectedPalletForCounter || formData.cargoType || 'N/A'}
                                  {selectedPalletForCounter && selectedPalletForCounter !== 'Custom' && selectedPallet && (
                                    <> ({selectedPallet.length}x{selectedPallet.width}x{selectedPallet.height}mm{selectedPallet.weight ? `, ${selectedPallet.weight}kg` : ''})</>
                                  )}
                                  {qty > 1 && ` × ${qty}`}
                                  {(calculatedWeight > 0 || formData.cargoWeight > 0) && ` - ${calculatedWeight || formData.cargoWeight}kg`}
                                  {(calculatedVolume > 0 || formData.cargoVolume > 0) && `, ${(calculatedVolume || formData.cargoVolume).toFixed(3)}m³`}
                                </Typography>
                                {loadAssessment && (
                                  <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 1 }}>
                                    <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                      Pallet Script: {loadAssessment.recommendedPlot} - £{loadAssessment.totalCost.toFixed(2)}
                                    </Typography>
                                    {loadAssessment.additionalCharges.length > 0 && (
                                      <Typography variant="caption" sx={{ color: 'warning.main' }}>
                                        + {loadAssessment.additionalCharges.join(', ')}
                                      </Typography>
                                    )}
                                  </Box>
                                )}
                              </Grid>
                            ) : null;
                          })()}

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
                                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1, color: 'white' }}>
                                        <Typography variant="body2" sx={{ color: 'white' }}>
                                          {item.palletType} × {item.quantity}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'grey.400' }}>
                                          |
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'white' }}>
                                          Handling: {item.forkLift ? 'Fork-Lift' : item.tailLift ? 'Tail-Lift' : item.handBall ? 'Hand-Ball' : 'None'}
                                        </Typography>
                                      </Box>
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
          Add New Contact
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Position"
                value={newClient.position}
                onChange={(e) => handleNewClientInputChange('position', e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-root': { color: 'white' },
                  '& .MuiInputLabel-root': { color: 'grey.400' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'grey.400' }}>Contact Type</InputLabel>
                <Select
                  value={newClient.contactType}
                  onChange={(e) => handleNewClientInputChange('contactType', e.target.value)}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { color: 'white' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                  }}
                >
                  <MenuItem value="Client">Client</MenuItem>
                  <MenuItem value="Supplier">Supplier</MenuItem>
                  <MenuItem value="Partner">Partner</MenuItem>
                  <MenuItem value="Prospect">Prospect</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 1"
                value={newClient.addresses[0].addressLine1}
                onChange={(e) => handleNewClientInputChange('addresses', e.target.value, 0, 'addressLine1')}
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
                value={newClient.addresses[0].addressLine2}
                onChange={(e) => handleNewClientInputChange('addresses', e.target.value, 0, 'addressLine2')}
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
                value={newClient.addresses[0].addressLine3}
                onChange={(e) => handleNewClientInputChange('addresses', e.target.value, 0, 'addressLine3')}
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
                value={newClient.addresses[0].town}
                onChange={(e) => handleNewClientInputChange('addresses', e.target.value, 0, 'town')}
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
                value={newClient.addresses[0].city}
                onChange={(e) => handleNewClientInputChange('addresses', e.target.value, 0, 'city')}
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
                value={newClient.addresses[0].postcode}
                onChange={(e) => handleNewClientInputChange('addresses', e.target.value, 0, 'postcode')}
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
            disabled={!newClient.name.trim() || !newClient.company.trim() || !newClient.position.trim() || !newClient.contactType}
          >
            Add Contact
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delivery Addresses Dialog */}
      <Dialog 
        open={showDeliveryAddressesDialog} 
        onClose={() => setShowDeliveryAddressesDialog(false)}
        maxWidth="md"
        fullWidth
        sx={{ zIndex: 9999 }}
      >
        <DialogTitle sx={{ color: 'white', backgroundColor: 'grey.800' }}>
          {addressDialogMode === 'pickup' ? 'Store Pickup Address' : 'Store Delivery Address'}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: 'grey.800', pt: 2 }}>
          <ThemeProvider theme={createTheme({
            components: {
              MuiTextField: { defaultProps: { size: 'small' } },
              MuiFormControl: { defaultProps: { margin: 'dense' } },
              MuiSelect: { defaultProps: { size: 'small' } },
              MuiButton: { defaultProps: { size: 'small' } },
            }
          })}>
          <Box sx={{ display: 'grid', gap: 1.25, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
            {/* Move contact fields to the top-left */}
            <TextField
              fullWidth
              label="Contact Name"
              value={newAddress.contactName}
              onChange={(e) => setNewAddress(prev => ({ ...prev, contactName: e.target.value }))}
              sx={{ 
                '& .MuiOutlinedInput-root': { color: 'white' },
                '& .MuiInputLabel-root': { color: 'grey.400' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
              }}
            />
            <TextField
              fullWidth
              label="Contact Phone"
              value={newAddress.contactPhone}
              onChange={(e) => setNewAddress(prev => ({ ...prev, contactPhone: e.target.value }))}
              sx={{ 
                '& .MuiOutlinedInput-root': { color: 'white' },
                '& .MuiInputLabel-root': { color: 'grey.400' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
              }}
            />
            {/* Address Name before address lines */}
            <TextField
              fullWidth
              label="Address Name"
              value={newAddress.name}
              onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
              sx={{ 
                '& .MuiOutlinedInput-root': { color: 'white' },
                '& .MuiInputLabel-root': { color: 'grey.400' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
              }}
            />
            <TextField
              fullWidth
              label="Address Line 1"
              value={newAddress.addressLine1}
              onChange={(e) => setNewAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
              sx={{ 
                '& .MuiOutlinedInput-root': { color: 'white' },
                '& .MuiInputLabel-root': { color: 'grey.400' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
              }}
            />
            <TextField
              fullWidth
              label="Address Line 2"
              value={newAddress.addressLine2}
              onChange={(e) => setNewAddress(prev => ({ ...prev, addressLine2: e.target.value }))}
              sx={{ 
                '& .MuiOutlinedInput-root': { color: 'white' },
                '& .MuiInputLabel-root': { color: 'grey.400' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
              }}
            />
            <TextField
              fullWidth
              label="Address Line 3"
              value={newAddress.addressLine3}
              onChange={(e) => setNewAddress(prev => ({ ...prev, addressLine3: e.target.value }))}
              sx={{ 
                '& .MuiOutlinedInput-root': { color: 'white' },
                '& .MuiInputLabel-root': { color: 'grey.400' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
              }}
            />
            <TextField
              fullWidth
              label="Town"
              value={newAddress.town}
              onChange={(e) => setNewAddress(prev => ({ ...prev, town: e.target.value }))}
              sx={{ 
                '& .MuiOutlinedInput-root': { color: 'white' },
                '& .MuiInputLabel-root': { color: 'grey.400' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
              }}
            />
            <TextField
              fullWidth
              label="City"
              value={newAddress.city}
              onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
              sx={{ 
                '& .MuiOutlinedInput-root': { color: 'white' },
                '& .MuiInputLabel-root': { color: 'grey.400' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
              }}
            />
            <TextField
              fullWidth
              label="Postcode"
              value={newAddress.postcode}
              onChange={(e) => setNewAddress(prev => ({ ...prev, postcode: e.target.value }))}
              sx={{ 
                '& .MuiOutlinedInput-root': { color: 'white' },
                '& .MuiInputLabel-root': { color: 'grey.400' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
              }}
            />
            
          </Box>
          </ThemeProvider>
        </DialogContent>
        <DialogActions sx={{ 
          backgroundColor: 'grey.800', 
          padding: '16px 24px',
          gap: '8px',
          zIndex: 10000
        }}>
          <Button 
            onClick={() => setShowDeliveryAddressesDialog(false)}
            sx={{ color: 'grey.400' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={async () => {
              console.log('🔍 Add Address button clicked');
              try {
                // Validate required fields
                if (!newAddress.name.trim() || !newAddress.addressLine1.trim() || !newAddress.town.trim() || !newAddress.postcode.trim()) {
                  console.error('❌ Missing required fields');
                  alert('Please fill in all required fields (Name, Address Line 1, Town, Postcode)');
                  return;
                }

                // Create the address data in the format expected by the Redux action
                const selectedClientForAddress = clients.find(c => c.name === formData.clientName);
                if (!selectedClientForAddress) {
                  alert('Please select a client before adding an address.');
                  return;
                }

                const addressToAdd = {
                  name: newAddress.name,
                  address: {
                    line1: newAddress.addressLine1,
                    line2: newAddress.addressLine2 || '',
                    line3: newAddress.addressLine3 || '',
                    town: newAddress.town,
                    city: newAddress.city || '',
                    postcode: newAddress.postcode
                  },
                  contactPerson: newAddress.contactName,
                  contactPhone: newAddress.contactPhone,
                  deliveryInstructions: '',
                  isActive: true,
                  clientId: selectedClientForAddress.id
                };
                
                console.log('🔍 Adding address:', addressToAdd);
                console.log('🔍 Selected client for address:', {
                  id: selectedClientForAddress.id,
                  name: selectedClientForAddress.name
                });
                
                // Add to delivery addresses (this will make it available in both pickup and delivery dropdowns)
                const result = await dispatch(addDeliveryAddress(addressToAdd));
                
                console.log('🔍 Redux result:', result);
                console.log('🔍 Error details:', result.error);
                console.log('🔍 Meta:', result.meta);
                
                if (result.type.endsWith('/fulfilled')) {
                  console.log('✅ Address added successfully');
                  
                  // Use returned payload immediately to avoid race conditions
                  const created = result.payload as any;
                  const createdId: string = created.id;
                  const createdAddr = created.address;
                  
                  if (addressDialogMode === 'pickup') {
                    // Immediately update pickup form fields and selected ID
                    setSelectedPickupAddressId(createdId);
                    setFormData(prev => ({
                      ...prev,
                      pickupAddress: {
                        addressLine1: createdAddr.line1 || '',
                        addressLine2: createdAddr.line2 || '',
                        addressLine3: createdAddr.line3 || '',
                        town: createdAddr.town || '',
                        city: createdAddr.city || '',
                        postcode: createdAddr.postcode || '',
                        contactName: created.contactPerson || '',
                        contactPhone: created.contactPhone || '',
                        contactEmail: ''
                      }
                    }));
                  } else {
                    // Immediately update delivery form fields and selected ID
                    setSelectedDeliveryAddressId(createdId);
                    setFormData(prev => ({
                      ...prev,
                      deliveryAddress: {
                        addressLine1: createdAddr.line1 || '',
                        addressLine2: createdAddr.line2 || '',
                        addressLine3: createdAddr.line3 || '',
                        town: createdAddr.town || '',
                        city: createdAddr.city || '',
                        postcode: createdAddr.postcode || '',
                        contactName: created.contactPerson || '',
                        contactPhone: created.contactPhone || '',
                        contactEmail: ''
                      }
                    }));
                  }
                  
                  // Refresh the delivery addresses list for the selected client
                  await dispatch(fetchDeliveryAddresses(selectedClientForAddress.id));
                  
                  // Reset form and close dialog
                  setNewAddress({
                    name: '',
                    addressLine1: '',
                    addressLine2: '',
                    addressLine3: '',
                    town: '',
                    city: '',
                    postcode: '',
                    contactName: '',
                    contactPhone: '',
                    deliveryInstructions: ''
                  });
                  setShowDeliveryAddressesDialog(false);
                } else {
                  console.error('❌ Failed to add address:', result.payload);
                  console.error('❌ Error object:', result.error);
                  console.error('❌ Meta:', result.meta);
                  alert('Failed to add address. Error: ' + (result.error?.message || 'Unknown error'));
                }
              } catch (error) {
                console.error('❌ Error adding address:', error);
                alert('Error adding address: ' + error.message);
              }
            }}
            variant="contained"
            sx={{ 
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark'
              }
            }}
          >
            Add Address
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobAllocationForm;
