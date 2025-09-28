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
import { staffAuthService } from '../../services/staffAuthService';

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Default credentials for testing (if no staff members exist)
  const DEFAULT_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
  };

  const handleStaffLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    dispatch(setLoading(true));
    setError('');

    try {
      // Try staff authentication first
      const authResult = await staffAuthService.authenticate({ username, password });
      
      if (authResult.success && authResult.staff) {
        // Convert staff data to user format
        const user = {
          id: authResult.staff.id,
          email: `${authResult.staff.firstName}.${authResult.staff.lastName}@company.com`,
          firstName: authResult.staff.firstName,
          lastName: authResult.staff.lastName,
          role: authResult.staff.role,
        };

        dispatch(setUser(user));
        console.log('Staff logged in successfully:', user);
        return;
      }

      // Fallback to default credentials if no staff members exist
      if (username === DEFAULT_CREDENTIALS.username && password === DEFAULT_CREDENTIALS.password) {
        const defaultUser = {
          id: 'default-admin',
          email: 'admin@company.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin' as const,
        };

        dispatch(setUser(defaultUser));
        console.log('Default admin logged in successfully:', defaultUser);
        return;
      }

      // Authentication failed
      setError(authResult.error || 'Invalid username or password');
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      dispatch(setLoading(false));
    }
  };


  const handleQuickLogin = (role: 'driver' | 'admin') => {
    setUsername(DEFAULT_CREDENTIALS.username);
    setPassword(DEFAULT_CREDENTIALS.password);
    handleStaffLogin();
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
              <strong>Default Credentials:</strong> Username: <code>admin</code> | Password: <code>admin123</code>
              <br />
              <strong>Staff Login:</strong> Use credentials created in Staff Management
            </Typography>
          </Alert>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <LocalShipping sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Staff Portal
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Access your daily vehicle checks, fuel monitoring, and job assignments
            </Typography>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              onClick={handleStaffLogin}
              sx={{ mb: 2 }}
            >
              Staff Login
            </Button>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={() => handleQuickLogin('driver')}
            >
              Quick Login
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Computer sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Management Portal
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Monitor fleet, manage drivers, and track compliance
            </Typography>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              onClick={handleStaffLogin}
              sx={{ mb: 2 }}
            >
              Staff Login
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              fullWidth
              onClick={() => handleQuickLogin('admin')}
            >
              Quick Login
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;