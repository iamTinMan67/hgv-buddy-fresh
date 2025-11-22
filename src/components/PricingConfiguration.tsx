import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
  Alert,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save,
  Restore,
  ArrowBack,
  Edit,
  Check,
  Cancel,
  Info,
} from '@mui/icons-material';
import { RootState } from '../store';
import { PalletPricingService, PalletSpecification } from '../services/palletPricingService';
import { supabase } from '../lib/supabase';

interface PricingConfigurationProps {
  onClose: () => void;
}

interface PlotOverride extends PalletSpecification {
  isOverridden: boolean;
  originalCost: number;
}

interface DistanceTierOverride {
  tier: number;
  range: string;
  rate: number;
  originalRate: number;
  isOverridden: boolean;
  maxDistance?: number;
}

interface WeightRatioTierOverride {
  tier: number;
  range: string;
  multiplier: number;
  originalMultiplier: number;
  isOverridden: boolean;
  percentage: string;
}

const PricingConfiguration: React.FC<PricingConfigurationProps> = ({ onClose }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === 'admin' || user?.role === 'supa_admin';

  // Get default values from service
  const defaultPlots = PalletPricingService.getStandardPlots();
  const defaultTiers = PalletPricingService.getDistanceTiers();
  const defaultWeightRatioTiers = PalletPricingService.getWeightRatioTiers();

  const [plotOverrides, setPlotOverrides] = useState<PlotOverride[]>([]);
  const [distanceTierOverrides, setDistanceTierOverrides] = useState<DistanceTierOverride[]>([]);
  const [weightRatioTierOverrides, setWeightRatioTierOverrides] = useState<WeightRatioTierOverride[]>([]);
  const [editingPlotId, setEditingPlotId] = useState<string | null>(null);
  const [editingTierId, setEditingTierId] = useState<number | null>(null);
  const [editingWeightRatioTierId, setEditingWeightRatioTierId] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Initialize with default values
  useEffect(() => {
    const plots: PlotOverride[] = defaultPlots.map(plot => ({
      ...plot,
      isOverridden: false,
      originalCost: plot.baseCost,
    }));

    const tiers: DistanceTierOverride[] = defaultTiers.map((tier, index) => ({
      tier: index + 1,
      range: tier.range,
      rate: tier.rate,
      originalRate: tier.rate,
      isOverridden: false,
      maxDistance: index === 0 ? 50 : index === 1 ? 99 : index === 2 ? 150 : undefined,
    }));

    const weightRatioTiers: WeightRatioTierOverride[] = defaultWeightRatioTiers.map((tier, index) => ({
      tier: index + 1,
      range: tier.range,
      multiplier: tier.multiplier,
      originalMultiplier: tier.multiplier,
      isOverridden: false,
      percentage: tier.percentage,
    }));

    setPlotOverrides(plots);
    setDistanceTierOverrides(tiers);
    setWeightRatioTierOverrides(weightRatioTiers);

    // Load overrides from database
    loadOverrides();
  }, []);

  const loadOverrides = async () => {
    try {
      // Check if pricing_config table exists, if not create it
      const { data: config, error } = await supabase
        .from('pricing_config')
        .select('*')
        .single();

      if (error && error.code === 'PGRST116') {
        // Table doesn't exist, use defaults
        console.log('Pricing config table not found, using defaults');
        return;
      }

      if (config && !error) {
        // Load plot overrides
        if (config.plot_overrides) {
          const loadedPlots = plotOverrides.map(plot => {
            const override = config.plot_overrides.find((p: any) => p.name === plot.name);
            if (override) {
              return {
                ...plot,
                baseCost: override.baseCost,
                isOverridden: true,
              };
            }
            return plot;
          });
          setPlotOverrides(loadedPlots);
        }

        // Load distance tier overrides
        if (config.distance_tier_overrides) {
          const loadedTiers = distanceTierOverrides.map(tier => {
            const override = config.distance_tier_overrides.find((t: any) => t.tier === tier.tier);
            if (override) {
              return {
                ...tier,
                rate: override.rate,
                isOverridden: true,
              };
            }
            return tier;
          });
          setDistanceTierOverrides(loadedTiers);
        }

        // Load weight ratio tier overrides
        if (config.weight_ratio_tier_overrides) {
          const loadedWeightRatioTiers = weightRatioTierOverrides.map(tier => {
            const override = config.weight_ratio_tier_overrides.find((t: any) => t.tier === tier.tier);
            if (override) {
              return {
                ...tier,
                multiplier: override.multiplier,
                isOverridden: true,
                percentage: ((override.multiplier - 1) * 100).toFixed(0) + (override.multiplier < 1 ? '%' : override.multiplier === 1 ? '%' : '%'),
              };
            }
            return tier;
          });
          setWeightRatioTierOverrides(loadedWeightRatioTiers);
        }
      }
    } catch (error) {
      console.error('Error loading overrides:', error);
    }
  };

  const handlePlotCostChange = (plotName: string, newCost: number) => {
    setPlotOverrides(prev =>
      prev.map(plot =>
        plot.name === plotName
          ? { ...plot, baseCost: newCost, isOverridden: true }
          : plot
      )
    );
    setHasChanges(true);
  };

  const handleTierRateChange = (tier: number, newRate: number) => {
    setDistanceTierOverrides(prev =>
      prev.map(t =>
        t.tier === tier
          ? { ...t, rate: newRate, isOverridden: true }
          : t
      )
    );
    setHasChanges(true);
  };

  const handleWeightRatioTierMultiplierChange = (tier: number, newMultiplier: number) => {
    setWeightRatioTierOverrides(prev =>
      prev.map(t =>
        t.tier === tier
          ? {
              ...t,
              multiplier: newMultiplier,
              isOverridden: true,
              percentage: ((newMultiplier - 1) * 100).toFixed(0) + (newMultiplier < 1 ? '% discount' : newMultiplier === 1 ? '%' : '% surcharge'),
            }
          : t
      )
    );
    setHasChanges(true);
  };

  const resetPlotToDefault = (plotName: string) => {
    setPlotOverrides(prev =>
      prev.map(plot =>
        plot.name === plotName
          ? { ...plot, baseCost: plot.originalCost, isOverridden: false }
          : plot
      )
    );
    setHasChanges(true);
  };

  const resetTierToDefault = (tier: number) => {
    setDistanceTierOverrides(prev =>
      prev.map(t =>
        t.tier === tier
          ? { ...t, rate: t.originalRate, isOverridden: false }
          : t
      )
    );
    setHasChanges(true);
  };

  const resetWeightRatioTierToDefault = (tier: number) => {
    setWeightRatioTierOverrides(prev =>
      prev.map(t =>
        t.tier === tier
          ? {
              ...t,
              multiplier: t.originalMultiplier,
              isOverridden: false,
              percentage: ((t.originalMultiplier - 1) * 100).toFixed(0) + (t.originalMultiplier < 1 ? '% discount' : t.originalMultiplier === 1 ? '%' : '% surcharge'),
            }
          : t
      )
    );
    setHasChanges(true);
  };

  const resetAllToDefaults = () => {
    setPlotOverrides(prev =>
      prev.map(plot => ({
        ...plot,
        baseCost: plot.originalCost,
        isOverridden: false,
      }))
    );
    setDistanceTierOverrides(prev =>
      prev.map(tier => ({
        ...tier,
        rate: tier.originalRate,
        isOverridden: false,
      }))
    );
    setWeightRatioTierOverrides(prev =>
      prev.map(tier => ({
        ...tier,
        multiplier: tier.originalMultiplier,
        isOverridden: false,
        percentage: ((tier.originalMultiplier - 1) * 100).toFixed(0) + (tier.originalMultiplier < 1 ? '% discount' : tier.originalMultiplier === 1 ? '%' : '% surcharge'),
      }))
    );
    setHasChanges(true);
  };

  const saveOverrides = async () => {
    if (!isAdmin) {
      setErrorMessage('Only administrators can save pricing configurations');
      setSaveStatus('error');
      return;
    }

    setSaveStatus('saving');
    setErrorMessage('');

    try {
      // Create or update pricing config
      const plotOverridesData = plotOverrides
        .filter(p => p.isOverridden)
        .map(p => ({
          name: p.name,
          baseCost: p.baseCost,
        }));

      const tierOverridesData = distanceTierOverrides
        .filter(t => t.isOverridden)
        .map(t => ({
          tier: t.tier,
          rate: t.rate,
        }));

      const weightRatioTierOverridesData = weightRatioTierOverrides
        .filter(t => t.isOverridden)
        .map(t => ({
          tier: t.tier,
          multiplier: t.multiplier,
        }));

      const { error } = await supabase
        .from('pricing_config')
        .upsert({
          id: 'default',
          plot_overrides: plotOverridesData,
          distance_tier_overrides: tierOverridesData,
          weight_ratio_tier_overrides: weightRatioTierOverridesData,
          updated_at: new Date().toISOString(),
          updated_by: user?.id || null,
        }, {
          onConflict: 'id'
        });

      if (error) {
        // If table doesn't exist, try to create it via RPC or just use localStorage
        console.warn('Could not save to database, using localStorage:', error);
        const weightRatioTierOverridesData = weightRatioTierOverrides
          .filter(t => t.isOverridden)
          .map(t => ({ tier: t.tier, multiplier: t.multiplier }));
        localStorage.setItem('pricing_overrides', JSON.stringify({
          plotOverrides: plotOverridesData,
          distanceTierOverrides: tierOverridesData,
          weightRatioTierOverrides: weightRatioTierOverridesData,
          updatedAt: new Date().toISOString(),
        }));
      }

      // Clear pricing service cache so overrides are reloaded
      PalletPricingService.clearOverrideCache();
      
      setSaveStatus('saved');
      setHasChanges(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error: any) {
      console.error('Error saving overrides:', error);
      setErrorMessage(error.message || 'Failed to save configuration');
      setSaveStatus('error');
      
      // Fallback to localStorage
      try {
        const plotOverridesData = plotOverrides
          .filter(p => p.isOverridden)
          .map(p => ({ name: p.name, baseCost: p.baseCost }));
        const tierOverridesData = distanceTierOverrides
          .filter(t => t.isOverridden)
          .map(t => ({ tier: t.tier, rate: t.rate }));
        
        const weightRatioTierOverridesData = weightRatioTierOverrides
          .filter(t => t.isOverridden)
          .map(t => ({ tier: t.tier, multiplier: t.multiplier }));
        
        localStorage.setItem('pricing_overrides', JSON.stringify({
          plotOverrides: plotOverridesData,
          distanceTierOverrides: tierOverridesData,
          weightRatioTierOverrides: weightRatioTierOverridesData,
          updatedAt: new Date().toISOString(),
        }));
        setSaveStatus('saved');
        setHasChanges(false);
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (localError) {
        console.error('Error saving to localStorage:', localError);
      }
    }
  };

  if (!isAdmin) {
    return (
      <Box sx={{ py: 2, px: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Access Denied: Only administrators can access pricing configuration.
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={onClose}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2, px: 3, bgcolor: 'black', minHeight: '100vh', color: 'white' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ color: 'white' }}>
            Pricing Configuration
          </Typography>
          <Typography variant="body2" sx={{ color: 'grey.400' }}>
            Override automated pricing calculations (Admin Only)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Restore />}
            onClick={resetAllToDefaults}
            disabled={!hasChanges}
            sx={{ color: 'yellow', borderColor: 'yellow' }}
          >
            Reset All
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={saveOverrides}
            disabled={!hasChanges || saveStatus === 'saving'}
            sx={{ bgcolor: 'primary.main' }}
          >
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
          </Button>
          <IconButton onClick={onClose} sx={{ color: 'yellow' }}>
            <ArrowBack />
          </IconButton>
        </Box>
      </Box>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      {saveStatus === 'saved' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Pricing configuration saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Plot Space Pricing */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'white', flexGrow: 1 }}>
                  Plot Space Costs
                </Typography>
                <Tooltip title="Base costs for different plot sizes. These are multiplied by quantity when calculating total plot space cost.">
                  <IconButton size="small" sx={{ color: 'grey.400' }}>
                    <Info />
                  </IconButton>
                </Tooltip>
              </Box>
              <Divider sx={{ mb: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'grey.400', borderColor: 'rgba(255, 255, 255, 0.1)' }}>Plot Type</TableCell>
                      <TableCell sx={{ color: 'grey.400', borderColor: 'rgba(255, 255, 255, 0.1)' }}>Cost (£)</TableCell>
                      <TableCell sx={{ color: 'grey.400', borderColor: 'rgba(255, 255, 255, 0.1)' }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {plotOverrides.map((plot) => (
                      <TableRow key={plot.name}>
                        <TableCell sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                          {plot.name}
                          {plot.isOverridden && (
                            <Typography variant="caption" sx={{ color: 'warning.main', display: 'block' }}>
                              Overridden
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                          {editingPlotId === plot.name ? (
                            <TextField
                              type="number"
                              value={plot.baseCost}
                              onChange={(e) => handlePlotCostChange(plot.name, parseFloat(e.target.value) || 0)}
                              size="small"
                              inputProps={{ step: 0.01, min: 0 }}
                              sx={{
                                width: 100,
                                '& .MuiOutlinedInput-root': { color: 'white' },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                              }}
                            />
                          ) : (
                            <Typography sx={{ color: plot.isOverridden ? 'warning.main' : 'white' }}>
                              £{plot.baseCost.toFixed(2)}
                              {plot.isOverridden && (
                                <Typography component="span" variant="caption" sx={{ color: 'grey.500', ml: 1 }}>
                                  (was £{plot.originalCost.toFixed(2)})
                                </Typography>
                              )}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                          {editingPlotId === plot.name ? (
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                              <IconButton
                                size="small"
                                onClick={() => setEditingPlotId(null)}
                                sx={{ color: 'success.main' }}
                              >
                                <Check />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  handlePlotCostChange(plot.name, plot.originalCost);
                                  setEditingPlotId(null);
                                }}
                                sx={{ color: 'error.main' }}
                              >
                                <Cancel />
                              </IconButton>
                            </Box>
                          ) : (
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                              <IconButton
                                size="small"
                                onClick={() => setEditingPlotId(plot.name)}
                                sx={{ color: 'primary.main' }}
                              >
                                <Edit />
                              </IconButton>
                              {plot.isOverridden && (
                                <IconButton
                                  size="small"
                                  onClick={() => resetPlotToDefault(plot.name)}
                                  sx={{ color: 'warning.main' }}
                                >
                                  <Restore />
                                </IconButton>
                              )}
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Distance Tier Pricing */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'white', flexGrow: 1 }}>
                  Distance Tier Rates
                </Typography>
                <Tooltip title="Cost per mile per pallet based on distance traveled. Rates are multiplied by distance and quantity.">
                  <IconButton size="small" sx={{ color: 'grey.400' }}>
                    <Info />
                  </IconButton>
                </Tooltip>
              </Box>
              <Divider sx={{ mb: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'grey.400', borderColor: 'rgba(255, 255, 255, 0.1)' }}>Distance Range</TableCell>
                      <TableCell sx={{ color: 'grey.400', borderColor: 'rgba(255, 255, 255, 0.1)' }}>Rate (£/mile/pallet)</TableCell>
                      <TableCell sx={{ color: 'grey.400', borderColor: 'rgba(255, 255, 255, 0.1)' }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {distanceTierOverrides.map((tier) => (
                      <TableRow key={tier.tier}>
                        <TableCell sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                          {tier.range}
                          {tier.isOverridden && (
                            <Typography variant="caption" sx={{ color: 'warning.main', display: 'block' }}>
                              Overridden
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                          {editingTierId === tier.tier ? (
                            <TextField
                              type="number"
                              value={tier.rate}
                              onChange={(e) => handleTierRateChange(tier.tier, parseFloat(e.target.value) || 0)}
                              size="small"
                              inputProps={{ step: 0.01, min: 0 }}
                              sx={{
                                width: 120,
                                '& .MuiOutlinedInput-root': { color: 'white' },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                              }}
                            />
                          ) : (
                            <Typography sx={{ color: tier.isOverridden ? 'warning.main' : 'white' }}>
                              £{tier.rate.toFixed(2)}
                              {tier.isOverridden && (
                                <Typography component="span" variant="caption" sx={{ color: 'grey.500', ml: 1 }}>
                                  (was £{tier.originalRate.toFixed(2)})
                                </Typography>
                              )}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                          {editingTierId === tier.tier ? (
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                              <IconButton
                                size="small"
                                onClick={() => setEditingTierId(null)}
                                sx={{ color: 'success.main' }}
                              >
                                <Check />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  handleTierRateChange(tier.tier, tier.originalRate);
                                  setEditingTierId(null);
                                }}
                                sx={{ color: 'error.main' }}
                              >
                                <Cancel />
                              </IconButton>
                            </Box>
                          ) : (
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                              <IconButton
                                size="small"
                                onClick={() => setEditingTierId(tier.tier)}
                                sx={{ color: 'primary.main' }}
                              >
                                <Edit />
                              </IconButton>
                              {tier.isOverridden && (
                                <IconButton
                                  size="small"
                                  onClick={() => resetTierToDefault(tier.tier)}
                                  sx={{ color: 'warning.main' }}
                                >
                                  <Restore />
                                </IconButton>
                              )}
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Weight Ratio Tier Pricing */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'white', flexGrow: 1 }}>
                  Weight Ratio Multipliers
                </Typography>
                <Tooltip title="Multiplier applied to base plot cost based on weight ratio (actual weight / standard plot weight). Values < 1.0 give discounts, > 1.0 add surcharges.">
                  <IconButton size="small" sx={{ color: 'grey.400' }}>
                    <Info />
                  </IconButton>
                </Tooltip>
              </Box>
              <Divider sx={{ mb: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'grey.400', borderColor: 'rgba(255, 255, 255, 0.1)' }}>Weight Ratio Range</TableCell>
                      <TableCell sx={{ color: 'grey.400', borderColor: 'rgba(255, 255, 255, 0.1)' }}>Multiplier</TableCell>
                      <TableCell sx={{ color: 'grey.400', borderColor: 'rgba(255, 255, 255, 0.1)' }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {weightRatioTierOverrides.map((tier) => (
                      <TableRow key={tier.tier}>
                        <TableCell sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                          {tier.range}
                          {tier.isOverridden && (
                            <Typography variant="caption" sx={{ color: 'warning.main', display: 'block' }}>
                              Overridden
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                          {editingWeightRatioTierId === tier.tier ? (
                            <TextField
                              type="number"
                              value={tier.multiplier}
                              onChange={(e) => handleWeightRatioTierMultiplierChange(tier.tier, parseFloat(e.target.value) || 1.0)}
                              size="small"
                              inputProps={{ step: 0.01, min: 0 }}
                              sx={{
                                width: 120,
                                '& .MuiOutlinedInput-root': { color: 'white' },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.600' }
                              }}
                            />
                          ) : (
                            <Typography sx={{ color: tier.isOverridden ? 'warning.main' : 'white' }}>
                              {tier.multiplier.toFixed(2)}x ({tier.percentage})
                              {tier.isOverridden && (
                                <Typography component="span" variant="caption" sx={{ color: 'grey.500', ml: 1 }}>
                                  (was {tier.originalMultiplier.toFixed(2)}x)
                                </Typography>
                              )}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                          {editingWeightRatioTierId === tier.tier ? (
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                              <IconButton
                                size="small"
                                onClick={() => setEditingWeightRatioTierId(null)}
                                sx={{ color: 'success.main' }}
                              >
                                <Check />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  handleWeightRatioTierMultiplierChange(tier.tier, tier.originalMultiplier);
                                  setEditingWeightRatioTierId(null);
                                }}
                                sx={{ color: 'error.main' }}
                              >
                                <Cancel />
                              </IconButton>
                            </Box>
                          ) : (
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                              <IconButton
                                size="small"
                                onClick={() => setEditingWeightRatioTierId(tier.tier)}
                                sx={{ color: 'primary.main' }}
                              >
                                <Edit />
                              </IconButton>
                              {tier.isOverridden && (
                                <IconButton
                                  size="small"
                                  onClick={() => resetWeightRatioTierToDefault(tier.tier)}
                                  sx={{ color: 'warning.main' }}
                                >
                                  <Restore />
                                </IconButton>
                              )}
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Constants */}
      <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            Additional Pricing Constants
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Oversized rate (£18.46/kg) and Tail-lift cost (£7.50) are currently hardcoded in the service.
            Contact system administrator to modify these values.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PricingConfiguration;

