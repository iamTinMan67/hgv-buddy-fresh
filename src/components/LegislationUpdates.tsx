import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Link,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Home,
  Article,
  ExpandMore,
  Update,
  Gavel,
  Warning,
  CheckCircle,
  Info,
} from '@mui/icons-material';

interface LegislationUpdatesProps {
  onClose: () => void;
}

// UpdateItem interface - matches the API response
interface UpdateItem {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  date: string;
  summary: string;
  category: 'dvsa' | 'dft' | 'traffic-commissioner' | 'general';
  priority: 'high' | 'medium' | 'low';
  tags: string[];
}

const LegislationUpdates: React.FC<LegislationUpdatesProps> = ({ onClose }) => {
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Source URLs
  const sourceUrls = [
    {
      url: 'https://www.transporthalo.co.uk/blog/dvsa-updates-april-2025',
      category: 'dvsa' as const,
      name: 'Transport Halo - DVSA Updates',
    },
    {
      url: 'https://www.gov.uk/government/consultations/amendments-to-licensing-restrictions-bus-coach-and-heavy-goods-vehicles',
      category: 'dft' as const,
      name: 'DfT - Licensing Restrictions',
    },
    {
      url: 'https://www.gov.uk/government/organisations/department-for-transport',
      category: 'dft' as const,
      name: 'Department for Transport',
    },
    {
      url: 'https://www.gov.uk/government/organisations/traffic-commissioners',
      category: 'traffic-commissioner' as const,
      name: 'Traffic Commissioners',
    },
    {
      url: 'https://www.gov.uk/government/organisations/driver-and-vehicle-standards-agency',
      category: 'dvsa' as const,
      name: 'DVSA',
    },
  ];

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        setLoading(true);
        
        // Call the Vercel serverless function
        const response = await fetch('/api/legislation-updates');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setUpdates(result.data);
          setError(null);
        } else {
          throw new Error(result.error || 'Failed to fetch updates');
        }
      } catch (err) {
        setError('Failed to fetch legislation updates. Please try again later.');
        console.error('Error fetching updates:', err);
        // Fallback to empty array on error
        setUpdates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
  }, []);

  const getCategoryColor = (category: UpdateItem['category']) => {
    switch (category) {
      case 'dvsa':
        return 'error';
      case 'dft':
        return 'primary';
      case 'traffic-commissioner':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: UpdateItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getCategoryIcon = (category: UpdateItem['category']) => {
    switch (category) {
      case 'dvsa':
        return <Warning />;
      case 'dft':
        return <Gavel />;
      case 'traffic-commissioner':
        return <CheckCircle />;
      default:
        return <Info />;
    }
  };

  return (
    <Box sx={{ py: 2, px: 2, bgcolor: 'black', minHeight: '100vh', color: 'white' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mr: 2 }}>
          Legislation Updates
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ 
            color: 'yellow', 
            fontSize: '1.5rem',
            height: '2.5rem',
            width: '2.5rem'
          }}
        >
          <Home />
        </IconButton>
      </Box>


      {/* Source Information */}
      <Card sx={{ mb: 3, bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Monitored Sources
          </Typography>
          <Divider sx={{ mb: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          <Grid container spacing={2}>
            {sourceUrls.map((source, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Article sx={{ mr: 1, fontSize: '1rem' }} />
                  <Link 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {source.name}
                  </Link>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Updates List */}
      {!loading && !error && (
        <Grid container spacing={3}>
          {updates.length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
                <CardContent>
                  <Typography variant="body1" align="center" color="text.secondary">
                    No updates available at this time.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            updates.map((update) => (
              <Grid item xs={12} key={update.id}>
                <Accordion sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: 'white' }} />}
                    sx={{ '& .MuiAccordionSummary-content': { alignItems: 'center' } }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mr: 2 }}>
                      <Box sx={{ mr: 2 }}>
                        {getCategoryIcon(update.category)}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                          <Typography variant="h6" sx={{ mr: 1 }}>
                            {update.title}
                          </Typography>
                          <Chip
                            icon={getCategoryIcon(update.category)}
                            label={update.category.toUpperCase()}
                            size="small"
                            color={getCategoryColor(update.category)}
                            sx={{ mr: 1 }}
                          />
                          <Chip
                            label={update.priority.toUpperCase()}
                            size="small"
                            color={getPriorityColor(update.priority)}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                          <Typography variant="caption" color="text.secondary">
                            <Update sx={{ fontSize: '0.875rem', verticalAlign: 'middle', mr: 0.5 }} />
                            {new Date(update.date).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Source: {update.source}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <Typography variant="body1" paragraph>
                        {update.summary}
                      </Typography>
                      <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Tags:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {update.tags.map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                      <Link
                        href={update.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ 
                          color: 'primary.main', 
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        <Article sx={{ mr: 0.5, fontSize: '1rem' }} />
                        Read full article
                      </Link>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Box>
  );
};

export default LegislationUpdates;

