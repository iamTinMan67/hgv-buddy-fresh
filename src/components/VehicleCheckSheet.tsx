import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Send,
  Edit,
  Home,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../store';
import { addDefectReport } from '../store/slices/vehicleSlice';

interface CheckItem {
  id: number;
  label: string;
  category: 'general' | 'articulated' | 'pcv' | 'fors';
  checked: boolean;
  notes?: string;
}

interface VehicleCheckSheetProps {
  onClose: () => void;
}

const VehicleCheckSheet: React.FC<VehicleCheckSheetProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    driverName: user?.firstName + ' ' + user?.lastName || '',
    vehicleFleetNumber: '',
    dateTime: new Date().toISOString().slice(0, 16),
    speedoOdometer: '',
  });

  const [checkItems, setCheckItems] = useState<CheckItem[]>([
    // General Items (1-14)
    { id: 1, label: 'Fuel / Oil / Fluid Leaks', category: 'general', checked: true },
    { id: 2, label: 'Battery Security', category: 'general', checked: true },
    { id: 3, label: 'Wheel, Tyres & Fixings', category: 'general', checked: true },
    { id: 4, label: 'Spray Suppression', category: 'general', checked: true },
    { id: 5, label: 'Registration Plates', category: 'general', checked: true },
    { id: 6, label: 'Bodywork Condition & Security', category: 'general', checked: true },
    { id: 7, label: 'Steering', category: 'general', checked: true },
    { id: 8, label: 'Brakes Including ABS / EBS', category: 'general', checked: true },
    { id: 9, label: 'Air Build Up / Leaks', category: 'general', checked: true },
    { id: 10, label: 'Licence Visible', category: 'general', checked: true },
    { id: 11, label: 'Odometer / Speed Limiter', category: 'general', checked: true },
    { id: 12, label: 'Seat Belts & Cab Interior', category: 'general', checked: true },
    { id: 13, label: 'Tachograph / Tachograph Rolls', category: 'general', checked: true },
    { id: 14, label: 'Warning Lights', category: 'general', checked: true },
    
    // Right Column Items (15-41)
    { id: 15, label: 'Wipers / Washers / Horn', category: 'general', checked: true },
    { id: 16, label: 'Glass Visibility', category: 'general', checked: true },
    { id: 17, label: 'Exhaust Smoke', category: 'general', checked: true },
    { id: 18, label: 'Reflectors, Markers & Lights', category: 'general', checked: true },
    { id: 19, label: 'Indicators Including Side Repeaters', category: 'general', checked: true },
    { id: 20, label: 'AdBlue', category: 'general', checked: true },
    { id: 21, label: 'Security of Load / Height of Vehicle', category: 'general', checked: true },
    { id: 22, label: 'Brake Lines', category: 'articulated', checked: true },
    { id: 23, label: 'Coupling Security', category: 'articulated', checked: true },
    { id: 24, label: 'Electrical Connections', category: 'articulated', checked: true },
    { id: 25, label: 'Saloon Lighting & Floor Covering', category: 'pcv', checked: true },
    { id: 26, label: 'Heating & Ventilation', category: 'pcv', checked: true },
    { id: 27, label: 'Doors & Exits', category: 'pcv', checked: true },
    { id: 28, label: 'First Aid Kit', category: 'pcv', checked: true },
    { id: 29, label: 'Passenger Seat Belts', category: 'pcv', checked: true },
    { id: 30, label: 'Fire Extinguisher & Emergency Hammer', category: 'pcv', checked: true },
    { id: 31, label: 'Wheelchair Accessibility', category: 'pcv', checked: true },
    { id: 32, label: 'Prominent Warning Signage', category: 'fors', checked: true },
    { id: 33, label: 'Side Under Run Protection', category: 'fors', checked: true },
    { id: 34, label: 'Mirrors (Class IV, Class V, Class VI)', category: 'fors', checked: true },
    { id: 35, label: 'Camera System & Detection Sensors', category: 'fors', checked: true },
    { id: 36, label: 'Tail Lift & Safety Equipment', category: 'fors', checked: true },
    { id: 37, label: 'Fresnel Lenses', category: 'fors', checked: true },
    { id: 38, label: 'Additional Check 1', category: 'general', checked: true },
    { id: 39, label: 'Additional Check 2', category: 'general', checked: true },
    { id: 40, label: 'Additional Check 3', category: 'general', checked: true },
    { id: 41, label: 'Nil Defects', category: 'general', checked: true },
  ]);

  const [defects, setDefects] = useState({
    reported: '',
    assessment: '',
  });

  const [signatures, setSignatures] = useState({
    reportedTo: '',
    rectifiedBy: '',
    rectifiedDate: '',
    driverSignature: user?.firstName + ' ' + user?.lastName || '',
  });

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showDefectDialog, setShowDefectDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CheckItem | null>(null);

  const handleCheckboxChange = (id: number) => {
    setCheckItems(items =>
      items.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleItemNotes = (item: CheckItem) => {
    setSelectedItem(item);
    setShowDefectDialog(true);
  };

  const saveItemNotes = () => {
    if (selectedItem) {
      setCheckItems(items =>
        items.map(item =>
          item.id === selectedItem.id ? selectedItem : item
        )
      );
    }
    setShowDefectDialog(false);
    setSelectedItem(null);
  };



  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'articulated':
        return 'warning';
      case 'pcv':
        return 'info';
      case 'fors':
        return 'success';
      default:
        return 'primary';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'articulated':
        return 'Articulated';
      case 'pcv':
        return 'PCV/PSV';
      case 'fors':
        return 'FORS';
      default:
        return 'General';
    }
  };

  const handleSubmit = () => {
    setShowSubmitDialog(true);
  };

  const confirmSubmit = () => {
    // Create defect report for the store
    const defectReport = {
      id: Date.now().toString(),
      driverId: user?.id || '',
      driverName: formData.driverName,
      vehicleFleetNumber: formData.vehicleFleetNumber,
      dateTime: formData.dateTime,
      speedoOdometer: formData.speedoOdometer,
      checkItems,
      defects,
      signatures,
      submittedBy: user?.id || '',
      submittedAt: new Date().toISOString(),
      status: 'pending' as const,
      priority: (failedChecks.length > 3 ? 'high' : failedChecks.length > 0 ? 'medium' : 'low') as 'low' | 'medium' | 'high' | 'critical',
    };

    // Dispatch to vehicle store
    dispatch(addDefectReport(defectReport));
    
    // Show success message and close
    setShowSubmitDialog(false);
    onClose();
  };

  const failedChecks = checkItems.filter(item => !item.checked);
  const hasDefects = failedChecks.length > 0 || defects.reported.trim() !== '';

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Vehicle Defect Report
        </Typography>
        <Box>
                     <IconButton
             onClick={onClose}
             sx={{ mr: 2, color: 'yellow', fontSize: '1.5rem' }}
           >
             <Home />
           </IconButton>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={handleSubmit}
            color={hasDefects ? 'warning' : 'success'}
          >
            Submit Report
          </Button>
        </Box>
      </Box>

      {/* Header Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Driver's Name"
                value={formData.driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Date / Time"
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vehicle / Fleet Number"
                value={formData.vehicleFleetNumber}
                onChange={(e) => setFormData({ ...formData, vehicleFleetNumber: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Speedo / Odometer Reading"
                value={formData.speedoOdometer}
                onChange={(e) => setFormData({ ...formData, speedoOdometer: e.target.value })}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Status Summary */}
      {hasDefects && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Defects Detected:</strong> {failedChecks.length} items failed inspection
            {defects.reported.trim() !== '' && ' • Additional defects reported'}
          </Typography>
        </Alert>
      )}

      {/* Daily Check Items */}
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        DAILY CHECK
      </Typography>
      
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              General Items (1-14)
            </Typography>
            {checkItems.slice(0, 14).map((item) => (
              <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={item.checked}
                      onChange={() => handleCheckboxChange(item.id)}
                      color={item.checked ? 'success' : 'error'}
                    />
                  }
                  label={`${item.id}. ${item.label}`}
                  sx={{ flexGrow: 1 }}
                />
                {!item.checked && (
                  <IconButton
                    size="small"
                    onClick={() => handleItemNotes(item)}
                    color="warning"
                  >
                    <Edit />
                  </IconButton>
                )}
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Additional Items (15-41)
            </Typography>
            {checkItems.slice(14).map((item) => (
              <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={item.checked}
                      onChange={() => handleCheckboxChange(item.id)}
                      color={item.checked ? 'success' : 'error'}
                    />
                  }
                  label={`${item.id}. ${item.label}`}
                  sx={{ flexGrow: 1 }}
                />
                <Chip
                  label={getCategoryLabel(item.category)}
                  size="small"
                  color={getCategoryColor(item.category) as any}
                  sx={{ mr: 1 }}
                />
                {!item.checked && (
                  <IconButton
                    size="small"
                    onClick={() => handleItemNotes(item)}
                    color="warning"
                  >
                    <Edit />
                  </IconButton>
                )}
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Legend */}
      <Card sx={{ mt: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Legend
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Chip label="General" color="primary" size="small" />
            </Grid>
            <Grid item xs={12} md={3}>
              <Chip label="Articulated" color="warning" size="small" />
            </Grid>
            <Grid item xs={12} md={3}>
              <Chip label="PCV/PSV" color="info" size="small" />
            </Grid>
            <Grid item xs={12} md={3}>
              <Chip label="FORS" color="success" size="small" />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Defect Reporting */}
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Defect Reporting and Rectification
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Record below any defects, damage, or irregularities, however small. Hand a copy to the Transport Office / Officer. 
          Defects MUST be reported to the appointed person who will initial the original copy.
        </Typography>
      </Alert>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Report Defects Here"
            multiline
            rows={6}
            value={defects.reported}
            onChange={(e) => setDefects({ ...defects, reported: e.target.value })}
            placeholder="Describe any defects, damage, or irregularities found during the inspection..."
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Defect Assessment and Rectification"
            multiline
            rows={6}
            value={defects.assessment}
            onChange={(e) => setDefects({ ...defects, assessment: e.target.value })}
            placeholder="Record how defects were assessed and rectified..."
          />
        </Grid>
      </Grid>

      {/* Signatures */}
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Signatures
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Defects reported to"
            value={signatures.reportedTo}
            onChange={(e) => setSignatures({ ...signatures, reportedTo: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Driver Signature"
            value={signatures.driverSignature}
            onChange={(e) => setSignatures({ ...signatures, driverSignature: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Defects rectified by"
            value={signatures.rectifiedBy}
            onChange={(e) => setSignatures({ ...signatures, rectifiedBy: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={signatures.rectifiedDate}
            onChange={(e) => setSignatures({ ...signatures, rectifiedDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      {/* Defect Notes Dialog */}
      <Dialog open={showDefectDialog} onClose={() => setShowDefectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Report Defect: {selectedItem?.label}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Defect Details"
            multiline
            rows={4}
            value={selectedItem?.notes || ''}
            onChange={(e) => setSelectedItem(selectedItem ? { ...selectedItem, notes: e.target.value } : null)}
            placeholder="Describe the defect in detail..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDefectDialog(false)}>
            Cancel
          </Button>
          <Button onClick={saveItemNotes} variant="contained">
            Save Notes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Submit Vehicle Check Sheet
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to submit this vehicle check sheet?
          </Typography>
          {hasDefects && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> This report contains {failedChecks.length} failed checks
                {defects.reported.trim() !== '' && ' and additional defect reports'}.
                Management will be notified of these issues.
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubmitDialog(false)}>
            Cancel
          </Button>
          <Button onClick={confirmSubmit} variant="contained" color="success">
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VehicleCheckSheet; 