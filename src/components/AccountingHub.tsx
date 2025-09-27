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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  AccountBalance,
  Receipt,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Home,
  Book,
  Assessment,
  LocalShipping,
  Payment,
  Analytics,
  Report,
} from '@mui/icons-material';

import BookKeeping from './BookKeeping';
import ReportsHub from './ReportsHub';

// Utility function to generate placeholder cards
const generatePlaceholderCards = (functionalCards: number, comingSoonCards: number, columnsPerRow: number = 3) => {
  const totalCards = functionalCards + comingSoonCards;
  const currentRow = Math.floor(totalCards / columnsPerRow);
  const cardsInCurrentRow = totalCards % columnsPerRow;
  
  // If current row is complete (cardsInCurrentRow === 0), don't add any placeholders
  if (cardsInCurrentRow === 0) {
    return [];
  }
  
  // Calculate how many placeholders needed to complete the current row
  const placeholdersNeeded = columnsPerRow - cardsInCurrentRow;
  
  return Array.from({ length: placeholdersNeeded }, (_, index) => ({
    id: `placeholder-${index}`,
    title: 'Coming Soon',
    description: 'Additional features and tools',
    icon: <Analytics />,
    features: ['Feature 1', 'Feature 2', 'Feature 3']
  }));
};
import FuelManagement from './FuelManagement';
import WageManagement from './WageManagement';

interface AccountingHubProps {
  onClose: () => void;
}



const AccountingHub: React.FC<AccountingHubProps> = ({ onClose }) => {
  const [showBookKeeping, setShowBookKeeping] = useState(false);
  const [showReportsHub, setShowReportsHub] = useState(false);
  const [showFuelHub, setShowFuelHub] = useState(false);
  const [showWagesHub, setShowWagesHub] = useState(false);
  
  // Define the cards configuration
  const functionalCards = 4; // Book Keeping, Reports, Invoice Upload, Fuel
  const comingSoonCards = 2; // Coming Soon Card 1, Coming Soon Card 2
  const columnsPerRow = 3;
  
  // Generate placeholder cards to complete incomplete rows
  const placeholderCards = generatePlaceholderCards(functionalCards, comingSoonCards, columnsPerRow);



  // Conditional rendering for child components
  if (showBookKeeping) {
    return <BookKeeping onClose={() => setShowBookKeeping(false)} />;
  }

  if (showReportsHub) {
    return <ReportsHub onClose={() => setShowReportsHub(false)} />;
  }

  if (showFuelHub) {
    return <FuelManagement onClose={() => setShowFuelHub(false)} />;
  }

  if (showWagesHub) {
    return <WageManagement onClose={() => setShowWagesHub(false)} />;
  }

  // Main Accounting Hub
  return (
    <Box sx={{ py: 2, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <Receipt sx={{ mr: 1, verticalAlign: 'middle' }} />
          Accounting Hub
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ color: 'yellow', fontSize: '1.5rem' }}
        >
          <Home />
        </IconButton>
      </Box>

      {/* Sub-Portal Navigation */}
      <Grid container spacing={3}>
        {/* Book-Keeping Card */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              transform: 'scale(0.94)',
              '&:hover': {
                transform: 'translateY(-4px) scale(0.94)',
                boxShadow: 4,
              }
            }}
            onClick={() => setShowBookKeeping(true)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Book />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Book-Keeping
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Data entry & ledgers
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<TrendingUp />} 
                  label="Income Ledger" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<TrendingDown />} 
                  label="Expense Ledger" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<AccountBalance />} 
                  label="General Ledger" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Wages Card */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              transform: 'scale(0.94)',
              '&:hover': {
                transform: 'translateY(-4px) scale(0.94)',
                boxShadow: 4,
              }
            }}
            onClick={() => setShowWagesHub(true)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <Payment />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Wages
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Payroll management
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<Payment />} 
                  label="Payroll" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<TrendingUp />} 
                  label="Overtime" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<AccountBalance />} 
                  label="Tax" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Fuel Card */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              transform: 'scale(0.94)',
              '&:hover': {
                transform: 'translateY(-4px) scale(0.94)',
                boxShadow: 4,
              }
            }}
            onClick={() => setShowFuelHub(true)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                  <LocalShipping />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Fuel
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fuel expense tracking
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<LocalShipping />} 
                  label="Diesel" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<TrendingDown />} 
                  label="Expenses" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Receipt />} 
                  label="Receipts" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>



        {/* Reports Card */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              transform: 'scale(0.94)',
              '&:hover': {
                transform: 'translateY(-4px) scale(0.94)',
                boxShadow: 4,
              }
            }}
            onClick={() => setShowReportsHub(true)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <Assessment />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Reports
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Financial reports & analytics
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<TrendingUp />} 
                  label="Profit & Loss" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<AccountBalance />} 
                  label="Balance Sheet" 
                  size="small" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Receipt />} 
                  label="Cash Flow" 
                  size="small" 
                  sx={{ mb: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>



        {/* Coming Soon Card 1 */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              opacity: 0.6,
              cursor: 'not-allowed',
              '&:hover': {
                transform: 'none',
                boxShadow: 1
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'grey.500', mr: 2 }}>
                  <Analytics />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div" color="grey.600">
                    Coming Soon
                  </Typography>
                  <Typography variant="body2" color="grey.500">
                    Advanced accounting features
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<TrendingUp />} 
                  label="Feature 1" 
                  size="small" 
                  sx={{ mr: 1, mb: 1, opacity: 0.7 }}
                />
                <Chip 
                  icon={<Analytics />} 
                  label="Feature 2" 
                  size="small" 
                  sx={{ mr: 1, mb: 1, opacity: 0.7 }}
                />
                <Chip 
                  icon={<Report />} 
                  label="Feature 3" 
                  size="small" 
                  sx={{ mb: 1, opacity: 0.7 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Coming Soon Card 2 */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              opacity: 0.6,
              cursor: 'not-allowed',
              '&:hover': {
                transform: 'none',
                boxShadow: 1
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'grey.500', mr: 2 }}>
                  <Analytics />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div" color="grey.600">
                    Coming Soon
                  </Typography>
                  <Typography variant="body2" color="grey.500">
                    Enhanced financial tools
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2, minHeight: '60px' }}>
                <Chip 
                  icon={<TrendingUp />} 
                  label="Feature 1" 
                  size="small" 
                  sx={{ mr: 1, mb: 1, opacity: 0.7 }}
                />
                <Chip 
                  icon={<Analytics />} 
                  label="Feature 2" 
                  size="small" 
                  sx={{ mr: 1, mb: 1, opacity: 0.7 }}
                />
                <Chip 
                  icon={<Report />} 
                  label="Feature 3" 
                  size="small" 
                  sx={{ mb: 1, opacity: 0.7 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>





    </Box>
  );
};

export default AccountingHub;
