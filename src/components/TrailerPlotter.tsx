import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Badge,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  LocalShipping,
  DragIndicator,
  Delete,
  Edit,
  Visibility,
  CheckCircle,
  Cancel,
  Warning,
  Info,
  Close,
  Add,
  Remove,
  ExpandMore,
  ExpandLess,
  Download,
  Print,
  Share,
  Refresh,
  Save,
  Undo,
  Redo,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../store';
import {
  JobAssignment,
  updateJobStatus,
} from '../store/slices/jobSlice';

interface TrailerPlanProps {
  onClose: () => void;
  selectedJobs?: JobAssignment[];
}

interface PlotPosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  jobId: string;
  job: JobAssignment;
  status: 'allocated' | 'rejected' | 'modified';
  driverNotes?: string;
  loadSequence?: number; // For delivery order
}

interface LoadPlan {
  id: string;
  name: string;
  description: string;
  trailerType: string;
  maxWeight: number;
  maxVolume: number;
  positions: PlotPosition[];
  createdAt: string;
  createdBy: string;
}

const TrailerPlan: React.FC<TrailerPlanProps> = ({ onClose, selectedJobs = [] }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs } = useSelector((state: RootState) => state.job);
  const { user } = useSelector((state: RootState) => state.auth);

  const [plotPositions, setPlotPositions] = useState<PlotPosition[]>([]);
  const [draggedItem, setDraggedItem] = useState<PlotPosition | null>(null);
  const [showConsignmentDialog, setShowConsignmentDialog] = useState(false);
  const [selectedConsignment, setSelectedConsignment] = useState<PlotPosition | null>(null);
  const [driverNotes, setDriverNotes] = useState('');
  const [viewMode, setViewMode] = useState<'planning' | 'driver'>('planning');
  const [trailerDimensions, setTrailerDimensions] = useState({
    width: 800,
    height: 300,
    maxWeight: 26000, // kg
    maxVolume: 100, // m³
  });
  
  // Load planning state
  const [loadPlans, setLoadPlans] = useState<LoadPlan[]>([]);
  const [currentLoadPlan, setCurrentLoadPlan] = useState<LoadPlan | null>(null);
  const [showLoadPlanDialog, setShowLoadPlanDialog] = useState(false);
  const [newLoadPlan, setNewLoadPlan] = useState<Partial<LoadPlan>>({
    name: '',
    description: '',
    trailerType: 'Standard Trailer',
    maxWeight: 26000,
    maxVolume: 100,
  });

  // Auto-allocate jobs to trailer positions
  useEffect(() => {
    if (selectedJobs.length > 0 && plotPositions.length === 0) {
      const newPositions = autoAllocateJobs(selectedJobs);
      setPlotPositions(newPositions);
    }
  }, [selectedJobs]);

  const autoAllocateJobs = (jobsToAllocate: JobAssignment[]): PlotPosition[] => {
    const positions: PlotPosition[] = [];
    let currentX = 0;
    let currentY = 0;
    const maxWidth = trailerDimensions.width;
    const maxHeight = trailerDimensions.height;

    jobsToAllocate.forEach((job, index) => {
      const volume = job.loadDimensions?.volume || 1;
      const weight = job.loadDimensions?.weight || 1000;
      
      // Calculate position based on volume and weight
      const width = Math.min(volume * 20, maxWidth / 3); // Scale width by volume
      const height = Math.min(weight / 100, maxHeight / 2); // Scale height by weight

      // Check if we need to move to next row
      if (currentX + width > maxWidth) {
        currentX = 0;
        currentY += Math.max(...positions.filter(p => p.y === currentY).map(p => p.height)) + 10;
      }

      // Check if we need to move to next column
      if (currentY + height > maxHeight) {
        currentX += Math.max(...positions.filter(p => p.x === currentX).map(p => p.width)) + 10;
        currentY = 0;
      }

      positions.push({
        id: `plot-${index}`,
        x: currentX,
        y: currentY,
        width,
        height,
        jobId: job.id,
        job,
        status: 'allocated',
      });

      currentX += width + 10;
    });

    return positions;
  };

  const handleDragStart = (e: React.DragEvent, position: PlotPosition) => {
    setDraggedItem(position);
    e.dataTransfer.setData('text/plain', position.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update position
    setPlotPositions(prev => prev.map(pos => 
      pos.id === draggedItem.id 
        ? { ...pos, x, y, status: 'modified' as const }
        : pos
    ));

    setDraggedItem(null);
  };

  const handleRejectConsignment = (positionId: string) => {
    setPlotPositions(prev => prev.map(pos => 
      pos.id === positionId 
        ? { ...pos, status: 'rejected' as const }
        : pos
    ));
  };

  const handleAcceptConsignment = (positionId: string) => {
    setPlotPositions(prev => prev.map(pos => 
      pos.id === positionId 
        ? { ...pos, status: 'allocated' as const }
        : pos
    ));
  };

  const openConsignmentDialog = (position: PlotPosition) => {
    setSelectedConsignment(position);
    setDriverNotes(position.driverNotes || '');
    setShowConsignmentDialog(true);
  };

  const handleSaveConsignmentNotes = () => {
    if (selectedConsignment) {
      setPlotPositions(prev => prev.map(pos => 
        pos.id === selectedConsignment.id 
          ? { ...pos, driverNotes }
          : pos
      ));
      setShowConsignmentDialog(false);
      setSelectedConsignment(null);
      setDriverNotes('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'allocated': return 'success';
      case 'rejected': return 'error';
      case 'modified': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'allocated': return <CheckCircle />;
      case 'rejected': return <Cancel />;
      case 'modified': return <Warning />;
      default: return <Info />;
    }
  };

  const totalWeight = plotPositions.reduce((sum, pos) => sum + (pos.job.loadDimensions?.weight || 0), 0);
  const totalVolume = plotPositions.reduce((sum, pos) => sum + (pos.job.loadDimensions?.volume || 0), 0);
  const allocatedCount = plotPositions.filter(pos => pos.status === 'allocated').length;
  const rejectedCount = plotPositions.filter(pos => pos.status === 'rejected').length;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Trailer Plan
        </Typography>
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={viewMode === 'driver'}
                onChange={(e) => setViewMode(e.target.checked ? 'driver' : 'planning')}
              />
            }
            label="Driver Mode"
          />
          <Button variant="outlined" onClick={onClose} sx={{ ml: 2 }}>
            Close
          </Button>
        </Box>
      </Box>

      {/* Load Plan Management */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Load Plan Management
            </Typography>
            <Box>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => setShowLoadPlanDialog(true)}
                sx={{ mr: 1 }}
              >
                New Load Plan
              </Button>
              <Button
                variant="outlined"
                startIcon={<Save />}
                onClick={() => {/* Save current plan */}}
              >
                Save Plan
              </Button>
            </Box>
          </Box>
          
          {loadPlans.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Saved Load Plans:
              </Typography>
              <List dense>
                {loadPlans.map((plan) => (
                  <ListItem key={plan.id}>
                    <ListItemText
                      primary={plan.name}
                      secondary={`${plan.trailerType} - ${plan.positions.length} items`}
                    />
                    <Button size="small" onClick={() => setCurrentLoadPlan(plan)}>
                      Load
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <LocalShipping sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {plotPositions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Consignments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {allocatedCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Allocated
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Cancel sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {rejectedCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rejected
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Info sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {totalWeight.toFixed(0)}kg
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Weight
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Trailer Visualization */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trailer Loading Plan
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                {viewMode === 'driver' 
                  ? 'Drag consignments to reposition or reject them. Click for details.'
                  : 'Drag consignments to optimize loading plan. Click for details.'
                }
              </Alert>
              
              <Box
                sx={{
                  width: trailerDimensions.width,
                  height: trailerDimensions.height,
                  border: '2px solid #333',
                  borderRadius: 2,
                  position: 'relative',
                  backgroundColor: '#f5f5f5',
                  mx: 'auto',
                  overflow: 'hidden',
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {/* Trailer outline */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    border: '1px dashed #ccc',
                    pointerEvents: 'none',
                  }}
                />
                
                {/* Plot positions */}
                {plotPositions.map((position) => (
                  <Box
                    key={position.id}
                    draggable={viewMode === 'driver'}
                    onDragStart={(e) => handleDragStart(e, position)}
                    onClick={() => openConsignmentDialog(position)}
                    sx={{
                      position: 'absolute',
                      left: position.x,
                      top: position.y,
                      width: position.width,
                      height: position.height,
                      backgroundColor: position.status === 'rejected' ? '#ffebee' : 
                                    position.status === 'modified' ? '#fff3e0' : '#e8f5e8',
                      border: `2px solid ${
                        position.status === 'rejected' ? '#f44336' :
                        position.status === 'modified' ? '#ff9800' : '#4caf50'
                      }`,
                      borderRadius: 1,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      p: 1,
                      '&:hover': {
                        opacity: 0.8,
                        transform: 'scale(1.02)',
                        transition: 'all 0.2s ease-in-out',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="caption" fontWeight="bold">
                        {position.job.jobNumber}
                      </Typography>
                      {viewMode === 'driver' && (
                        <Box>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectConsignment(position.id);
                              }}
                              sx={{ p: 0, color: 'error.main' }}
                            >
                              <Cancel fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary">
                      {position.job.cargoType}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption">
                        {position.job.loadDimensions?.volume?.toFixed(1)}m³
                      </Typography>
                      <Typography variant="caption">
                        {position.job.loadDimensions?.weight}kg
                      </Typography>
                    </Box>
                    
                    {viewMode === 'driver' && position.status === 'rejected' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptConsignment(position.id);
                        }}
                        sx={{ mt: 1 }}
                      >
                        Accept
                      </Button>
                    )}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Consignment List */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Consignment Details
              </Typography>
              <List>
                {plotPositions.map((position) => (
                  <ListItem key={position.id} dense>
                    <ListItemIcon>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                        {position.job.jobNumber.slice(-2)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={position.job.jobNumber}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {position.job.cargoType}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {position.job.loadDimensions?.volume?.toFixed(1)}m³ • {position.job.loadDimensions?.weight}kg
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      icon={getStatusIcon(position.status)}
                      label={position.status}
                      color={getStatusColor(position.status) as any}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" color="text.secondary">
                Total Volume: {totalVolume.toFixed(1)} m³ / {trailerDimensions.maxVolume} m³
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Weight: {totalWeight.toFixed(0)} kg / {trailerDimensions.maxWeight} kg
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  Export Loading Plan
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Print />}
                  fullWidth
                >
                  Print Plan
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Consignment Details Dialog */}
      <Dialog
        open={showConsignmentDialog}
        onClose={() => setShowConsignmentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Consignment Details - {selectedConsignment?.job.jobNumber}
        </DialogTitle>
        <DialogContent>
          {selectedConsignment && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Job Information
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Job Number:</strong> {selectedConsignment.job.jobNumber}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Title:</strong> {selectedConsignment.job.title}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Customer:</strong> {selectedConsignment.job.customerName}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Cargo Type:</strong> {selectedConsignment.job.cargoType}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Priority:</strong> 
                  <Chip
                    label={selectedConsignment.job.priority}
                    size="small"
                    color={selectedConsignment.job.priority === 'urgent' ? 'error' : 'default'}
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Load Dimensions
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Dimensions:</strong> {selectedConsignment.job.loadDimensions?.length}×{selectedConsignment.job.loadDimensions?.width}×{selectedConsignment.job.loadDimensions?.height}cm
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Volume:</strong> {selectedConsignment.job.loadDimensions?.volume?.toFixed(2)} m³
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Weight:</strong> {selectedConsignment.job.loadDimensions?.weight} kg
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {selectedConsignment.job.loadDimensions?.isOversized && (
                    <Chip label="Oversized" color="warning" size="small" sx={{ mr: 1 }} />
                  )}
                  {selectedConsignment.job.loadDimensions?.isProtruding && (
                    <Chip label="Protruding" color="error" size="small" sx={{ mr: 1 }} />
                  )}
                  {selectedConsignment.job.loadDimensions?.isBalanced && (
                    <Chip label="Balanced" color="success" size="small" sx={{ mr: 1 }} />
                  )}
                  {selectedConsignment.job.loadDimensions?.isFragile && (
                    <Chip label="Fragile" color="info" size="small" sx={{ mr: 1 }} />
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Delivery Information
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Delivery Address:</strong> {selectedConsignment.job.deliveryLocation.address}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Contact:</strong> {selectedConsignment.job.deliveryLocation.contactPerson} - {selectedConsignment.job.deliveryLocation.contactPhone}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Instructions:</strong> {selectedConsignment.job.deliveryLocation.deliveryInstructions}
                </Typography>
              </Grid>
              
              {selectedConsignment.job.deliveryNotes && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Delivery Notes
                  </Typography>
                  <Typography variant="body2">
                    {selectedConsignment.job.deliveryNotes}
                  </Typography>
                </Grid>
              )}
              
              {selectedConsignment.job.loadDimensions?.loadNotes && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Load Notes
                  </Typography>
                  <Typography variant="body2">
                    {selectedConsignment.job.loadDimensions.loadNotes}
                  </Typography>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Driver Notes
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={driverNotes}
                  onChange={(e) => setDriverNotes(e.target.value)}
                  placeholder="Add notes about this consignment..."
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConsignmentDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveConsignmentNotes} variant="contained">Save Notes</Button>
        </DialogActions>
      </Dialog>

      {/* Load Plan Dialog */}
      <Dialog open={showLoadPlanDialog} onClose={() => setShowLoadPlanDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Load Plan</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Load Plan Name"
                value={newLoadPlan.name}
                onChange={(e) => setNewLoadPlan({ ...newLoadPlan, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newLoadPlan.description}
                onChange={(e) => setNewLoadPlan({ ...newLoadPlan, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Trailer Type"
                value={newLoadPlan.trailerType}
                onChange={(e) => setNewLoadPlan({ ...newLoadPlan, trailerType: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Weight (kg)"
                type="number"
                value={newLoadPlan.maxWeight}
                onChange={(e) => setNewLoadPlan({ ...newLoadPlan, maxWeight: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Volume (m³)"
                type="number"
                value={newLoadPlan.maxVolume}
                onChange={(e) => setNewLoadPlan({ ...newLoadPlan, maxVolume: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLoadPlanDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              if (newLoadPlan.name) {
                const plan: LoadPlan = {
                  id: `plan-${Date.now()}`,
                  name: newLoadPlan.name || '',
                  description: newLoadPlan.description || '',
                  trailerType: newLoadPlan.trailerType || 'Standard Trailer',
                  maxWeight: newLoadPlan.maxWeight || 26000,
                  maxVolume: newLoadPlan.maxVolume || 100,
                  positions: plotPositions,
                  createdAt: new Date().toISOString(),
                  createdBy: user?.id || 'unknown',
                };
                setLoadPlans(prev => [...prev, plan]);
                setNewLoadPlan({
                  name: '',
                  description: '',
                  trailerType: 'Standard Trailer',
                  maxWeight: 26000,
                  maxVolume: 100,
                });
                setShowLoadPlanDialog(false);
              }
            }}
          >
            Create Plan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrailerPlan;
