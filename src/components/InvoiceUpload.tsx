import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Alert,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  CloudUpload,
  Receipt,
  LocalGasStation,
  DocumentScanner,
  CheckCircle,
  Error,
  Warning,
  Info,
  Upload,
  Download,
  Delete,
  Edit,
  Save,
  Cancel,
  Visibility,
  AttachMoney,
  CalendarToday,
  Business,
  Person,
  LocalShipping,
  Speed,
  Timeline,
  TrendingUp,
  Home,
} from '@mui/icons-material';

interface InvoiceUploadProps {
  onClose: () => void;
}

interface ExtractedData {
  invoiceNumber?: string;
  date?: string;
  amount?: number;
  vendor?: string;
  description?: string;
  fuelQuantity?: number;
  fuelPrice?: number;
  stationName?: string;
  confidence: number;
  rawText: string;
}

interface ProcessedInvoice {
  id: string;
  type: 'invoice' | 'fuel_receipt';
  fileName: string;
  uploadedAt: string;
  extractedData: ExtractedData;
  status: 'processing' | 'completed' | 'error' | 'manual_review';
  manualData?: any;
  notes?: string;
}

const InvoiceUpload: React.FC<InvoiceUploadProps> = ({ onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<ProcessedInvoice[]>([]);
  const [processingFile, setProcessingFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ProcessedInvoice | null>(null);
  const [manualData, setManualData] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock OCR processing function
  const processImageWithOCR = async (file: File): Promise<ExtractedData> => {
    // Simulate OCR processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock extracted data based on file name
    const isFuelReceipt = file.name.toLowerCase().includes('fuel') || file.name.toLowerCase().includes('gas');
    
    if (isFuelReceipt) {
      return {
        fuelQuantity: Math.random() * 100 + 50,
        fuelPrice: Math.random() * 2 + 1.5,
        stationName: 'Shell Station',
        date: new Date().toISOString().split('T')[0],
        amount: Math.random() * 200 + 100,
        confidence: Math.random() * 0.3 + 0.7,
        rawText: 'Mock OCR text for fuel receipt...',
      };
    } else {
      return {
        invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
        date: new Date().toISOString().split('T')[0],
        amount: Math.random() * 1000 + 500,
        vendor: 'ABC Transport Services',
        description: 'Transportation services',
        confidence: Math.random() * 0.3 + 0.7,
        rawText: 'Mock OCR text for invoice...',
      };
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setProcessingFile(file);
    setIsProcessing(true);

    try {
      const extractedData = await processImageWithOCR(file);
      
      const processedInvoice: ProcessedInvoice = {
        id: Date.now().toString(),
        type: file.name.toLowerCase().includes('fuel') ? 'fuel_receipt' : 'invoice',
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        extractedData,
        status: extractedData.confidence > 0.8 ? 'completed' : 'manual_review',
      };

      setUploadedFiles(prev => [processedInvoice, ...prev]);
      
      if (extractedData.confidence <= 0.8) {
        setSelectedInvoice(processedInvoice);
        setManualData(extractedData);
        setShowEditDialog(true);
      }
    } catch (error) {
      console.error('OCR processing failed:', error);
    } finally {
      setIsProcessing(false);
      setProcessingFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleManualEdit = () => {
    if (selectedInvoice) {
      const updatedInvoice = {
        ...selectedInvoice,
        manualData,
        status: 'completed' as const,
      };
      setUploadedFiles(prev => 
        prev.map(inv => inv.id === selectedInvoice.id ? updatedInvoice : inv)
      );
      setShowEditDialog(false);
      setSelectedInvoice(null);
      setManualData({});
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'info';
      case 'error': return 'error';
      case 'manual_review': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'processing': return <Info />;
      case 'error': return <Error />;
      case 'manual_review': return <Warning />;
      default: return <Info />;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'fuel_receipt' ? <LocalGasStation /> : <Receipt />;
  };

  const getTypeColor = (type: string) => {
    return type === 'fuel_receipt' ? 'warning' : 'primary';
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onClose} sx={{ mr: 2 }}>
          <Home />
        </IconButton>
        <Typography variant="h4" component="h1">
          Invoice & Receipt Upload
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>OCR Feature:</strong> Upload invoice or fuel receipt images to automatically extract data. 
          The system will attempt to read key information like amounts, dates, vendor details, and fuel quantities.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Upload Section */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload Documents
              </Typography>
              
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <Button
                  variant="contained"
                  startIcon={<CloudUpload />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  sx={{ mb: 2 }}
                >
                  Upload Image/PDF
                </Button>
                
                <Typography variant="body2" color="text.secondary">
                  Supported: JPG, PNG, PDF
                </Typography>
              </Box>

              {isProcessing && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Processing: {processingFile?.name}
                  </Typography>
                  <LinearProgress />
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistics
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {uploadedFiles.length}
                    </Typography>
                    <Typography variant="body2">Total Uploaded</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {uploadedFiles.filter(f => f.status === 'completed').length}
                    </Typography>
                    <Typography variant="body2">Processed</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {uploadedFiles.filter(f => f.type === 'fuel_receipt').length}
                    </Typography>
                    <Typography variant="body2">Fuel Receipts</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">
                      {uploadedFiles.filter(f => f.type === 'invoice').length}
                    </Typography>
                    <Typography variant="body2">Invoices</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Documents List */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                  <Tab label="All Documents" />
                  <Tab label="Invoices" />
                  <Tab label="Fuel Receipts" />
                  <Tab label="Needs Review" />
                </Tabs>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Document</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Extracted Data</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {uploadedFiles
                      .filter(file => {
                        if (tabValue === 1) return file.type === 'invoice';
                        if (tabValue === 2) return file.type === 'fuel_receipt';
                        if (tabValue === 3) return file.status === 'manual_review';
                        return true;
                      })
                      .map((file) => (
                        <TableRow key={file.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ bgcolor: getTypeColor(file.type), mr: 2 }}>
                                {getTypeIcon(file.type)}
                              </Avatar>
                              <Typography variant="body2">
                                {file.fileName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={file.type === 'fuel_receipt' ? 'Fuel Receipt' : 'Invoice'}
                              color={getTypeColor(file.type)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box>
                              {file.type === 'fuel_receipt' ? (
                                <>
                                  <Typography variant="body2">
                                    {file.extractedData.fuelQuantity?.toFixed(2)}L @ £{file.extractedData.fuelPrice?.toFixed(2)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {file.extractedData.stationName}
                                  </Typography>
                                </>
                              ) : (
                                <>
                                  <Typography variant="body2">
                                    {file.extractedData.invoiceNumber}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    £{file.extractedData.amount?.toFixed(2)}
                                  </Typography>
                                </>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(file.status)}
                              label={file.status.replace('_', ' ')}
                              color={getStatusColor(file.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(file.uploadedAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedInvoice(file);
                                setShowViewDialog(true);
                              }}
                            >
                              <Visibility />
                            </IconButton>
                            {file.status === 'manual_review' && (
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedInvoice(file);
                                  setManualData(file.extractedData);
                                  setShowEditDialog(true);
                                }}
                              >
                                <Edit />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {uploadedFiles.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No documents uploaded yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload your first invoice or fuel receipt to get started
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* View Document Dialog */}
      <Dialog
        open={showViewDialog}
        onClose={() => setShowViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Document Details
        </DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  File Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="File Name"
                      secondary={selectedInvoice.fileName}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Type"
                      secondary={selectedInvoice.type === 'fuel_receipt' ? 'Fuel Receipt' : 'Invoice'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Upload Date"
                      secondary={new Date(selectedInvoice.uploadedAt).toLocaleString()}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Status"
                      secondary={selectedInvoice.status}
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Extracted Data
                </Typography>
                <List dense>
                  {selectedInvoice.type === 'fuel_receipt' ? (
                    <>
                      <ListItem>
                        <ListItemText
                          primary="Fuel Quantity"
                          secondary={`${selectedInvoice.extractedData.fuelQuantity?.toFixed(2)}L`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Price per Liter"
                          secondary={`£${selectedInvoice.extractedData.fuelPrice?.toFixed(2)}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Total Amount"
                          secondary={`£${selectedInvoice.extractedData.amount?.toFixed(2)}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Station"
                          secondary={selectedInvoice.extractedData.stationName}
                        />
                      </ListItem>
                    </>
                  ) : (
                    <>
                      <ListItem>
                        <ListItemText
                          primary="Invoice Number"
                          secondary={selectedInvoice.extractedData.invoiceNumber}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Amount"
                          secondary={`£${selectedInvoice.extractedData.amount?.toFixed(2)}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Vendor"
                          secondary={selectedInvoice.extractedData.vendor}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Description"
                          secondary={selectedInvoice.extractedData.description}
                        />
                      </ListItem>
                    </>
                  )}
                  <ListItem>
                    <ListItemText
                      primary="Confidence"
                      secondary={`${(selectedInvoice.extractedData.confidence * 100).toFixed(1)}%`}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Manual Edit Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Review & Edit Extracted Data
        </DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  The OCR confidence was low. Please review and correct the extracted data below.
                </Alert>
              </Grid>
              
              {selectedInvoice.type === 'fuel_receipt' ? (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Fuel Quantity (L)"
                      type="number"
                      value={manualData.fuelQuantity || ''}
                      onChange={(e) => setManualData({
                        ...manualData,
                        fuelQuantity: Number(e.target.value)
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Price per Liter (£)"
                      type="number"
                      value={manualData.fuelPrice || ''}
                      onChange={(e) => setManualData({
                        ...manualData,
                        fuelPrice: Number(e.target.value)
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Station Name"
                      value={manualData.stationName || ''}
                      onChange={(e) => setManualData({
                        ...manualData,
                        stationName: e.target.value
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Total Amount (£)"
                      type="number"
                      value={manualData.amount || ''}
                      onChange={(e) => setManualData({
                        ...manualData,
                        amount: Number(e.target.value)
                      })}
                    />
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Invoice Number"
                      value={manualData.invoiceNumber || ''}
                      onChange={(e) => setManualData({
                        ...manualData,
                        invoiceNumber: e.target.value
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Amount (£)"
                      type="number"
                      value={manualData.amount || ''}
                      onChange={(e) => setManualData({
                        ...manualData,
                        amount: Number(e.target.value)
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Vendor"
                      value={manualData.vendor || ''}
                      onChange={(e) => setManualData({
                        ...manualData,
                        vendor: e.target.value
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={manualData.description || ''}
                      onChange={(e) => setManualData({
                        ...manualData,
                        description: e.target.value
                      })}
                    />
                  </Grid>
                </>
              )}
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={manualData.date || ''}
                  onChange={(e) => setManualData({
                    ...manualData,
                    date: e.target.value
                  })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button onClick={handleManualEdit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvoiceUpload;
