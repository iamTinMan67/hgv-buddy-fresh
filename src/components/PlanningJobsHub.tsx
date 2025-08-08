import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  Button,
  IconButton,
} from '@mui/material';
import {
  Schedule,
  LocalShipping,
  Assignment,
  Route,
  Home,
  TrendingUp,
  Assessment,
  Add,
  Analytics,
  Report,
} from '@mui/icons-material';

import JobAssignmentHub from './JobAssignmentHub';
import PlanningHub from './PlanningHub';

interface PlanningJobsHubProps {
  onClose: () => void;
}

const PlanningJobsHub: React.FC<PlanningJobsHubProps> = ({ onClose }) => {
  const [showJobAssignment, setShowJobAssignment] = useState(false);
  const [showPlanningHub, setShowPlanningHub] = useState(false);

  // Show Job Assignment Hub if requested
  if (showJobAssignment) {
    return <JobAssignmentHub onClose={() => setShowJobAssignment(false)} />;
  }

  // Show Planning Hub if requested
  if (showPlanningHub) {
    return <PlanningHub onClose={() => setShowPlanningHub(false)} />;
  }

  // Main Planning & Jobs Hub
  return (
    <Box sx={{ p: 3, bgcolor: 'black', minHeight: '100vh', color: 'white' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: 'white' }}>
          Planning & Jobs Hub
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ color: 'yellow' }}
        >
          <Home />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
                 {/* Planning Card */}
         <Grid item xs={12} md={4}>
           <Card 
             sx={{ 
               cursor: 'pointer', 
               transition: 'all 0.3s ease',
               '&:hover': {
                 transform: 'translateY(-4px)',
                 boxShadow: 4,
               }
             }}
             onClick={() => setShowPlanningHub(true)}
           >
             <CardContent>
               <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                 <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                   <Schedule />
                 </Avatar>
                 <Box>
                   <Typography variant="h5" component="div">
                     Planning
                   </Typography>
                   <Typography variant="body2" color="text.secondary">
                     Route planning & scheduling
                   </Typography>
                 </Box>
               </Box>
               
               <Divider sx={{ my: 2 }} />
               
               <Box sx={{ mt: 2, minHeight: '60px' }}>
                 <Chip 
                   icon={<Route />} 
                   label="Routes" 
                   size="small" 
                   sx={{ mr: 1, mb: 1 }}
                 />
                 <Chip 
                   icon={<Schedule />} 
                   label="Scheduling" 
                   size="small" 
                   sx={{ mr: 1, mb: 1 }}
                 />
                 <Chip 
                   icon={<TrendingUp />} 
                   label="Optimization" 
                   size="small" 
                   sx={{ mb: 1 }}
                 />
               </Box>
             </CardContent>
           </Card>
         </Grid>

         {/* Job Consignments Card */}
         <Grid item xs={12} md={4}>
           <Card 
             sx={{ 
               cursor: 'pointer', 
               transition: 'all 0.3s ease',
               '&:hover': {
                 transform: 'translateY(-4px)',
                 boxShadow: 4,
               }
             }}
             onClick={() => setShowJobAssignment(true)}
           >
             <CardContent>
               <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                 <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                   <LocalShipping />
                 </Avatar>
                 <Box>
                   <Typography variant="h5" component="div">
                     Job Consignments
                   </Typography>
                   <Typography variant="body2" color="text.secondary">
                     Job assignment & management
                   </Typography>
                 </Box>
               </Box>
               
               <Divider sx={{ my: 2 }} />
               
               <Box sx={{ mt: 2, minHeight: '60px' }}>
                 <Chip 
                   icon={<Assignment />} 
                   label="Jobs" 
                   size="small" 
                   sx={{ mr: 1, mb: 1 }}
                 />
                 <Chip 
                   icon={<LocalShipping />} 
                   label="Consignments" 
                   size="small" 
                   sx={{ mr: 1, mb: 1 }}
                 />
                 <Chip 
                   icon={<Assessment />} 
                   label="Tracking" 
                   size="small" 
                   sx={{ mb: 1 }}
                 />
               </Box>
             </CardContent>
           </Card>
         </Grid>

        {/* Coming Soon Card for consistent layout */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              opacity: 0.3,
              cursor: 'default',
              transition: 'all 0.3s ease',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'grey.400', mr: 2 }}>
                  <Schedule />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div" sx={{ color: 'grey.500' }}>
                    Coming Soon
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Additional planning features
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<TrendingUp />} 
                  label="Future" 
                  size="small" 
                  sx={{ mr: 1, mb: 1, opacity: 0.5 }}
                />
                <Chip 
                  icon={<Analytics />} 
                  label="Features" 
                  size="small" 
                  sx={{ mr: 1, mb: 1, opacity: 0.5 }}
                />
                <Chip 
                  icon={<Report />} 
                  label="Reports" 
                  size="small" 
                  sx={{ mb: 1, opacity: 0.5 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PlanningJobsHub;
