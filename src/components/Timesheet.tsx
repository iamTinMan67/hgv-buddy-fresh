import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Save,
  TrendingUp,
  AttachMoney,
} from '@mui/icons-material';
import { format, parse, differenceInMinutes, isWeekend } from 'date-fns';
import { RootState, AppDispatch } from '../store';
import { updateWageCalculation } from '../store/slices/wageSlice';

interface TimeEntry {
  id: string;
  date: string;
  startTime: string;
  breakTime: string;
  lunchTime: string;
  endTime: string;
  totalHours: number;
  isEditing?: boolean;
}

interface TimesheetProps {
  onClose: () => void;
}

const Timesheet: React.FC<TimesheetProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { wageSettings } = useSelector((state: RootState) => state.wage);
  
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<Partial<TimeEntry>>({
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    breakTime: '15',
    lunchTime: '30',
    endTime: '17:00',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Get driver's wage settings
  const driverWageSetting = wageSettings.find(setting => setting.driverId === user?.id);

  // Calculate total hours for a single day
  const calculateDailyHours = (entry: Partial<TimeEntry>): number => {
    if (!entry.startTime || !entry.endTime) return 0;

    const start = parse(entry.startTime, 'HH:mm', new Date());
    const end = parse(entry.endTime, 'HH:mm', new Date());
    
    let totalMinutes = differenceInMinutes(end, start);
    
    // Subtract break and lunch times
    const breakMinutes = parseInt(entry.breakTime || '0');
    const lunchMinutes = parseInt(entry.lunchTime || '0');
    
    totalMinutes -= (breakMinutes + lunchMinutes);
    
    return Math.max(0, totalMinutes / 60); // Convert to hours
  };

  // Calculate wage for a single day with minute-by-minute overtime
  const calculateDailyWage = (entry: Partial<TimeEntry>) => {
    if (!driverWageSetting || !entry.startTime || !entry.endTime || !entry.date) {
      return { 
        totalMinutes: 0, 
        standardMinutes: 0, 
        overtimeMinutes: 0, 
        standardPay: 0, 
        overtimePay: 0, 
        totalPay: 0 
      };
    }

    const startTime = parse(entry.startTime, 'HH:mm', new Date());
    const endTime = parse(entry.endTime, 'HH:mm', new Date());
    const standardStart = parse(driverWageSetting.standardStartTime, 'HH:mm', new Date());
    const standardEnd = parse(driverWageSetting.standardEndTime, 'HH:mm', new Date());
    
    // Calculate total working minutes
    let totalMinutes = differenceInMinutes(endTime, startTime);
    
    // Subtract break and lunch times
    const breakMinutes = parseInt(entry.breakTime || '0');
    const lunchMinutes = parseInt(entry.lunchTime || '0');
    totalMinutes -= (breakMinutes + lunchMinutes);
    
    // Check if it's a weekend (Saturday = 6, Sunday = 0)
    const workDate = new Date(entry.date);
    const isWeekendDay = isWeekend(workDate);
    
    let standardMinutes = 0;
    let overtimeMinutes = 0;
    
    if (isWeekendDay) {
      // All hours on weekends are overtime
      overtimeMinutes = totalMinutes;
    } else {
      // Weekday calculation
      if (startTime < standardStart) {
        // Early start - overtime before standard time
        const earlyMinutes = differenceInMinutes(standardStart, startTime);
        overtimeMinutes += earlyMinutes;
      }
      
      if (endTime > standardEnd) {
        // Late finish - overtime after standard time
        const lateMinutes = differenceInMinutes(endTime, standardEnd);
        overtimeMinutes += lateMinutes;
      }
      
      // Calculate standard minutes (within standard hours)
      const effectiveStart = startTime < standardStart ? standardStart : startTime;
      const effectiveEnd = endTime > standardEnd ? standardEnd : endTime;
      
      if (effectiveEnd > effectiveStart) {
        standardMinutes = differenceInMinutes(effectiveEnd, effectiveStart);
        // Subtract breaks from standard time if they fall within standard hours
        const breakTotal = breakMinutes + lunchMinutes;
        if (standardMinutes > breakTotal) {
          standardMinutes -= breakTotal;
        } else {
          standardMinutes = 0;
        }
      }
    }
    
    // Ensure we don't exceed total minutes
    const totalCalculated = standardMinutes + overtimeMinutes;
    if (totalCalculated > totalMinutes) {
      const excess = totalCalculated - totalMinutes;
      if (overtimeMinutes >= excess) {
        overtimeMinutes -= excess;
      } else {
        standardMinutes -= (excess - overtimeMinutes);
        overtimeMinutes = 0;
      }
    }
    
    // Calculate pay (convert minutes to hours for calculation)
    const standardHours = standardMinutes / 60;
    const overtimeHours = overtimeMinutes / 60;
    
    const standardPay = standardHours * driverWageSetting.hourlyRate;
    const overtimePay = overtimeHours * driverWageSetting.overtimeRate;
    const totalPay = standardPay + overtimePay;

    return { 
      totalMinutes, 
      standardMinutes, 
      overtimeMinutes, 
      standardPay, 
      overtimePay, 
      totalPay 
    };
  };

  // Calculate weekly total
  const calculateWeeklyTotal = (): number => {
    return entries.reduce((total, entry) => total + entry.totalHours, 0);
  };

  // Calculate weekly wage
  const calculateWeeklyWage = () => {
    if (!driverWageSetting) return { standardPay: 0, overtimePay: 0, totalPay: 0 };

    const weeklyCalculations = entries.map(entry => calculateDailyWage(entry));
    const standardPay = weeklyCalculations.reduce((sum, calc) => sum + calc.standardPay, 0);
    const overtimePay = weeklyCalculations.reduce((sum, calc) => sum + calc.overtimePay, 0);
    const totalPay = standardPay + overtimePay;

    return { standardPay, overtimePay, totalPay };
  };

  // Get current week entries
  const getCurrentWeekEntries = (): TimeEntry[] => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfWeek && entryDate <= today;
    });
  };

  const handleAddEntry = () => {
    const totalHours = calculateDailyHours(currentEntry);
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      date: currentEntry.date || new Date().toISOString().split('T')[0],
      startTime: currentEntry.startTime || '08:00',
      breakTime: currentEntry.breakTime || '15',
      lunchTime: currentEntry.lunchTime || '30',
      endTime: currentEntry.endTime || '17:00',
      totalHours,
    };

    setEntries([...entries, newEntry]);
    
    // Calculate and store wage calculation
    const wageCalc = calculateDailyWage(newEntry);
    dispatch(updateWageCalculation({
      driverId: user?.id || '',
      date: newEntry.date,
      startTime: newEntry.startTime,
      endTime: newEntry.endTime,
      ...wageCalc,
    }));

    setCurrentEntry({
      date: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      breakTime: '15',
      lunchTime: '30',
      endTime: '17:00',
    });
    setShowAddDialog(false);
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setCurrentEntry(entry);
    setEditingId(entry.id);
    setShowAddDialog(true);
  };

  const handleUpdateEntry = () => {
    if (!editingId) return;

    const totalHours = calculateDailyHours(currentEntry);
    const updatedEntries = entries.map(entry =>
      entry.id === editingId
        ? {
            ...entry,
            ...currentEntry,
            totalHours,
          }
        : entry
    );

    setEntries(updatedEntries);
    
    // Update wage calculation
    const wageCalc = calculateDailyWage(currentEntry);
    dispatch(updateWageCalculation({
      driverId: user?.id || '',
      date: currentEntry.date || '',
      startTime: currentEntry.startTime || '',
      endTime: currentEntry.endTime || '',
      ...wageCalc,
    }));

    setEditingId(null);
    setCurrentEntry({
      date: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      breakTime: '15',
      lunchTime: '30',
      endTime: '17:00',
    });
    setShowAddDialog(false);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const formatTime = (time: string): string => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, 'EEE, MMM dd');
  };

  const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };


  const weeklyTotal = calculateWeeklyTotal();
  const weeklyWage = calculateWeeklyWage();

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          HGV Driver Timesheet
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowAddDialog(true)}
        >
          Add Entry
        </Button>
      </Box>

      {/* Weekly Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">Weekly Hours</Typography>
              <Typography variant="h4" color="primary">
                {weeklyTotal.toFixed(2)}h
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h6">Standard Pay</Typography>
              <Typography variant="h4" color="success.main">
                £{weeklyWage.standardPay.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h6">Overtime Pay</Typography>
              <Typography variant="h4" color="warning.main">
                £{weeklyWage.overtimePay.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h6">Total Pay</Typography>
              <Typography variant="h4" color="error.main">
                £{weeklyWage.totalPay.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Wage Settings Info */}
      {driverWageSetting && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Your Wage Settings:</strong> Standard Rate: £{driverWageSetting.hourlyRate.toFixed(2)}/hr | 
            Overtime Rate: £{driverWageSetting.overtimeRate.toFixed(2)}/hr | 
            Standard Hours: {driverWageSetting.standardStartTime} - {driverWageSetting.standardEndTime} (Mon-Fri)
          </Typography>
        </Alert>
      )}

      {/* Timesheet Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>Break (min)</TableCell>
              <TableCell>Lunch (min)</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Total Hours</TableCell>
              <TableCell>Standard Time</TableCell>
              <TableCell>Overtime</TableCell>
              <TableCell>Daily Pay</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No timesheet entries yet. Click "Add Entry" to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => {
                const wageCalc = calculateDailyWage(entry);
                return (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.date)}</TableCell>
                    <TableCell>{formatTime(entry.startTime)}</TableCell>
                    <TableCell>{entry.breakTime}</TableCell>
                    <TableCell>{entry.lunchTime}</TableCell>
                    <TableCell>{formatTime(entry.endTime)}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${entry.totalHours.toFixed(2)}h`}
                        color={entry.totalHours >= 8 ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatMinutes(wageCalc.standardMinutes)}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatMinutes(wageCalc.overtimeMinutes)}
                        color="warning"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`£${wageCalc.totalPay.toFixed(2)}`}
                        color="success"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditEntry(entry)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteEntry(entry.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Timesheet Entry' : 'Add Timesheet Entry'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={currentEntry.date}
                onChange={(e) => setCurrentEntry({ ...currentEntry, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={currentEntry.startTime}
                onChange={(e) => setCurrentEntry({ ...currentEntry, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={currentEntry.endTime}
                onChange={(e) => setCurrentEntry({ ...currentEntry, endTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Break Time (minutes)"
                type="number"
                value={currentEntry.breakTime}
                onChange={(e) => setCurrentEntry({ ...currentEntry, breakTime: e.target.value })}
                inputProps={{ min: 0, max: 60 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Lunch Time (minutes)"
                type="number"
                value={currentEntry.lunchTime}
                onChange={(e) => setCurrentEntry({ ...currentEntry, lunchTime: e.target.value })}
                inputProps={{ min: 0, max: 120 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Calculated Total:</strong> {calculateDailyHours(currentEntry).toFixed(2)} hours
                  <br />
                  <strong>Formula:</strong> (End Time - Start Time) - Break Time - Lunch Time
                  {driverWageSetting && (
                    <>
                      <br />
                      <strong>Overtime Rules:</strong> Any time before {driverWageSetting.standardStartTime} or after {driverWageSetting.standardEndTime} is overtime
                      <br />
                      <strong>Estimated Daily Pay:</strong> £{calculateDailyWage(currentEntry).totalPay.toFixed(2)}
                    </>
                  )}
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={editingId ? handleUpdateEntry : handleAddEntry}
            variant="contained"
            startIcon={editingId ? <Save /> : <Add />}
          >
            {editingId ? 'Update' : 'Add Entry'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Timesheet; 