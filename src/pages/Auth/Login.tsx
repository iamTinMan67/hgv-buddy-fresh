import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  Alert,
} from '@mui/material';
import { LocalShipping, Computer } from '@mui/icons-material';
import { setUser, setLoading } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // 🛠️ DEVELOPMENT MODE: Login screen is bypassed with auto-login
  // This component is only shown if auto-login fails

  // Default credentials for testing
  const DEFAULT_CREDENTIALS = {
    email: 'Owner',
    password: 'HGVBuddy.2025'
  };

  const handleDriverLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    dispatch(setLoading(true));
    setError('');

    try {
      // Simulate API call - replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login for driver (allow any credentials for testing)
      const mockUser = {
        id: '1',
        email: email,
        firstName: 'John',
        lastName: 'Driver',
        role: 'driver' as const,
      };
      
      dispatch(setUser(mockUser));
      console.log('Driver logged in successfully:', mockUser);
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleManagementLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    dispatch(setLoading(true));
    setError('');

    try {
      // Simulate API call - replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login for admin (allow any credentials for testing)
      const mockUser = {
        id: '2',
        email: email,
        firstName: 'Jane',
        lastName: 'Admin',
        role: 'admin' as const,
      };
      
      dispatch(setUser(mockUser));
      console.log('Admin logged in successfully:', mockUser);
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleQuickLogin = (role: 'driver' | 'admin') => {
    setEmail(DEFAULT_CREDENTIALS.email);
    setPassword(DEFAULT_CREDENTIALS.password);
    
    if (role === 'driver') {
      handleDriverLogin();
    } else {
      handleManagementLogin();
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Grid container spacing={3} maxWidth={800}>
        {error && (
          <Grid item xs={12}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          </Grid>
        )}
        
        <Grid item xs={12}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Testing Credentials:</strong> Username: <code>Owner</code> | Password: <code>HGVBuddy.2025</code>
              <br />
              <strong>Quick Login:</strong> Use the buttons below for instant access
            </Typography>
          </Alert>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <LocalShipping sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Driver Portal
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Access your daily vehicle checks, fuel monitoring, and job assignments
            </Typography>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleDriverLogin}
              sx={{ mb: 2 }}
            >
              Driver Login
            </Button>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={() => handleQuickLogin('driver')}
            >
              Quick Driver Login
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Computer sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Admin Portal
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Monitor fleet, manage drivers, and track compliance
            </Typography>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="secondary"
              size="large"
              fullWidth
              onClick={handleManagementLogin}
              sx={{ mb: 2 }}
            >
              Admin Login
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              fullWidth
              onClick={() => handleQuickLogin('admin')}
            >
              Quick Admin Login
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;