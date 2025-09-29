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

  // Super admin bypass for development (remove in production)
  const SUPER_ADMIN_CREDENTIALS = {
    username: 'superadmin',
    password: 'superadmin123'
  };

  const handleStaffLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    dispatch(setLoading(true));
    setError('');

    try {
      console.log('🔍 Attempting Supabase login for:', username);
      
      // Import Supabase client
      const { supabase } = await import('../../lib/supabase');
      
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: username, // Using username field as email
        password: password,
      });

      if (authError) {
        console.error('❌ Supabase auth error:', authError);
        setError(authError.message);
        return;
      }

      if (authData.user) {
        console.log('✅ Supabase auth successful:', authData.user);
        console.log('🔍 Auth user ID:', authData.user.id);
        console.log('🔍 Auth user email:', authData.user.email);
        console.log('🔍 Auth user metadata:', authData.user.user_metadata);
        
        // Try to get user details from our users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        console.log('🔍 Users table lookup result:', { userData, userError });

        if (userData && userData.first_name) {
          console.log('✅ User data retrieved from users table:', userData);
          
          // Create user object for Redux from users table
          const user = {
            id: userData.id,
            email: userData.email || username,
            firstName: userData.first_name,
            lastName: userData.last_name,
            role: userData.role as any,
          };

          dispatch(setUser(user));
          console.log('✅ Login successful (from users table):', user);
          return;
        }

        // If users table lookup failed or no first_name, try to get from email lookup
        console.log('🔍 Trying email lookup for:', username);
        const { data: emailUserData, error: emailError } = await supabase
          .from('users')
          .select('*')
          .eq('email', username)
          .single();

        console.log('🔍 Email lookup result:', { emailUserData, emailError });

        if (emailUserData && emailUserData.first_name) {
          console.log('✅ User data retrieved from email lookup:', emailUserData);
          
          const user = {
            id: emailUserData.id,
            email: emailUserData.email || username,
            firstName: emailUserData.first_name,
            lastName: emailUserData.last_name,
            role: emailUserData.role as any,
          };

          dispatch(setUser(user));
          console.log('✅ Login successful (from email lookup):', user);
          return;
        }

        // Final fallback - use auth metadata or defaults
        console.log('🔍 Using fallback with auth metadata');
        const role = authData.user.user_metadata?.role || 'admin';
        const firstName = authData.user.user_metadata?.first_name || username.split('@')[0] || 'User';
        const lastName = authData.user.user_metadata?.last_name || '';
        
        const user = {
          id: authData.user.id,
          email: authData.user.email || username,
          firstName: firstName,
          lastName: lastName,
          role: role as any,
        };

        dispatch(setUser(user));
        console.log('✅ Login successful (fallback):', user);
        return;
      }

      setError('Login failed. Please check your credentials.');
      
    } catch (err: any) {
      console.error('❌ Login error:', err);
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
                     <strong>Super Admin:</strong> Email: <code>tomboyce@mail.com</code> | Password: (your chosen password)
                     <br />
                     <strong>Business Owner:</strong> Email: <code>adam.mustafa1717@gmail.com</code> | Password: (your chosen password)
                     <br />
                     <strong>Note:</strong> Use your email address as the username
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
                     label="Email Address"
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
                     label="Email Address"
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