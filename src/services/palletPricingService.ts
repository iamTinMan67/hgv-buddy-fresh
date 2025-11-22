// Pallet Pricing Service - Implements the Pallet Script business logic
export interface PalletSpecification {
  name: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  baseCost: number;
  description: string;
}

export interface LoadDimensions {
  length: number;
  width: number;
  height: number;
  weight: number;
  notes: string;
  distance?: number; // Distance in miles or km (optional for backward compatibility)
}

export interface LoadAssessment {
  isOversized: boolean;
  isProtruding: boolean;
  isBalanced: boolean;
  isFragile: boolean;
  recommendedPlot: string;
  calculatedCost: number;
  additionalCharges: string[];
  totalCost: number;
}

// Extended interface for consignment pricing with distance and weight ratio
export interface ConsignmentPricingItem {
  id: string;
  palletType: string;
  quantity: number;
  plotSpaceCost: number; // Cost for the plot space allocation
  distanceTraveled: number; // Distance in miles or km
  distanceCost: number; // Cost based on distance
  weightRatio: number; // Ratio of actual weight to standard plot weight
  weightRatioCost: number; // Cost based on weight ratio
  totalItemCost: number; // Plot space cost + distance cost + weight ratio cost for this item
  weight: number;
  totalWeight: number;
  volume: number;
  totalVolume: number;
  length: number;
  width: number;
  height: number;
  tailLift: boolean;
  forkLift: boolean;
  handBall: boolean;
}

// Pricing summary for all consignments
export interface ConsignmentPricingSummary {
  items: ConsignmentPricingItem[];
  totalPlotSpaceCost: number; // Sum of all plot space costs
  totalDistanceCost: number; // Sum of all distance costs
  totalWeightRatioCost: number; // Sum of all weight ratio costs
  totalDistanceTraveled: number; // Total distance for all items
  grandTotal: number; // Total plot space cost + total distance cost + total weight ratio cost
  breakdown: {
    plotSpaceBreakdown: Array<{ palletType: string; quantity: number; cost: number }>;
    distanceBreakdown: Array<{ distance: number; cost: number }>;
    weightRatioBreakdown: Array<{ weightRatio: number; cost: number; description: string }>;
  };
}

export class PalletPricingService {
  // Cache for overrides
  private static overrideCache: {
    plotOverrides?: Array<{ name: string; baseCost: number }>;
    distanceTierOverrides?: Array<{ tier: number; rate: number }>;
    weightRatioTierOverrides?: Array<{ tier: number; multiplier: number }>;
    loadedAt?: number;
  } | null = null;

  // Load overrides from localStorage or database
  private static loadOverrides(): {
    plotOverrides?: Array<{ name: string; baseCost: number }>;
    distanceTierOverrides?: Array<{ tier: number; rate: number }>;
    weightRatioTierOverrides?: Array<{ tier: number; multiplier: number }>;
  } {
    // Check cache first (valid for 5 minutes)
    if (this.overrideCache && this.overrideCache.loadedAt && Date.now() - this.overrideCache.loadedAt < 300000) {
      return {
        plotOverrides: this.overrideCache.plotOverrides,
        distanceTierOverrides: this.overrideCache.distanceTierOverrides,
        weightRatioTierOverrides: this.overrideCache.weightRatioTierOverrides,
      };
    }

    try {
      const stored = localStorage.getItem('pricing_overrides');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.overrideCache = {
          plotOverrides: parsed.plotOverrides,
          distanceTierOverrides: parsed.distanceTierOverrides,
          weightRatioTierOverrides: parsed.weightRatioTierOverrides,
          loadedAt: Date.now(),
        };
        return {
          plotOverrides: parsed.plotOverrides,
          distanceTierOverrides: parsed.distanceTierOverrides,
          weightRatioTierOverrides: parsed.weightRatioTierOverrides,
        };
      }
    } catch (error) {
      console.error('Error loading pricing overrides:', error);
    }

    return {};
  }

  // Clear override cache (call after saving new overrides)
  static clearOverrideCache(): void {
    this.overrideCache = null;
  }

  // Standard plot specifications from the Pallet Script
  private static readonly STANDARD_PLOTS: PalletSpecification[] = [
    {
      name: "Full Plot",
      weight: 1200,
      length: 1200,
      width: 1200,
      height: 2200,
      baseCost: 65.00,
      description: "Full Plot consists of weight = 1200kg, length = 1200mm, width = 1200mm, height = 2200mm costs £65"
    },
    {
      name: "Light Plot",
      weight: 750,
      length: 1200,
      width: 1200,
      height: 2200,
      baseCost: 60.00,
      description: "Light plot consists of weight = 750kg, length = 1200mm, width = 1200mm height = 2200mm costs £60"
    },
    {
      name: "Euro Half",
      weight: 500,
      length: 1200,
      width: 1200,
      height: 2200,
      baseCost: 55.00,
      description: "Euro half weight = 500kg, length = 1200mm, width = 1200mm, height = 2200mm costs £55"
    },
    {
      name: "Half Plot",
      weight: 500,
      length: 1200,
      width: 800,
      height: 800,
      baseCost: 50.00,
      description: "Half Plot consists of weight 500kg, length = 1200mm, width = 800mm, height = 800mm costs £50"
    },
    {
      name: "Quarter Plot",
      weight: 250,
      length: 1200,
      width: 1000,
      height: 800,
      baseCost: 45.00,
      description: "Quarter Plot consists of weight = 250kg length = 1200mm, width = 1000m, height = 800mm costs £45"
    },
    {
      name: "Mini Plot",
      weight: 150,
      length: 1200,
      width: 1200,
      height: 600,
      baseCost: 40.00,
      description: "Mini Plot consists of weight = 150kg, length = 1200mm, width 1200mm, height = 600mm costs £40"
    }
  ];

  // Constants from the Pallet Script
  private static readonly OVERSIZED_RATE_PER_KG = 18.46;
  private static readonly TAIL_LIFT_DROP_COST = 7.50;
  private static readonly MAX_STANDARD_LENGTH = 1200;
  private static readonly MAX_STANDARD_WIDTH = 1000;
  private static readonly MAX_QUARTER_PLOT_HEIGHT = 800;
  
  // Distance-based pricing constants - Tiered pricing structure
  // Tier 1: <=50 miles: £3.50 per mile per pallet
  // Tier 2: 51-99 miles: £3.25 per mile per pallet
  // Tier 3: 100-150 miles: £3.00 per mile per pallet
  // Tier 4: >=151 miles: £2.75 per mile per pallet
  private static readonly DISTANCE_TIER_1_MAX = 50;
  private static readonly DISTANCE_TIER_1_RATE = 3.50;
  private static readonly DISTANCE_TIER_2_MAX = 99;
  private static readonly DISTANCE_TIER_2_RATE = 3.25;
  private static readonly DISTANCE_TIER_3_MAX = 150;
  private static readonly DISTANCE_TIER_3_RATE = 3.00;
  private static readonly DISTANCE_TIER_4_RATE = 2.75; // For >=151 miles
  private static readonly USE_MILES = true; // Set to false to use kilometers

  // Weight ratio pricing constants - Tiered pricing structure
  // Weight ratio = actual weight / standard plot weight
  // Tier 1: ratio <= 0.5 (light load): 0.9x multiplier (10% discount)
  // Tier 2: ratio 0.51-0.75: 1.0x multiplier (standard)
  // Tier 3: ratio 0.76-1.0: 1.1x multiplier (10% surcharge)
  // Tier 4: ratio 1.01-1.25: 1.25x multiplier (25% surcharge)
  // Tier 5: ratio > 1.25: 1.5x multiplier (50% surcharge)
  private static readonly WEIGHT_RATIO_TIER_1_MAX = 0.5;
  private static readonly WEIGHT_RATIO_TIER_1_MULTIPLIER = 0.9;
  private static readonly WEIGHT_RATIO_TIER_2_MAX = 0.75;
  private static readonly WEIGHT_RATIO_TIER_2_MULTIPLIER = 1.0;
  private static readonly WEIGHT_RATIO_TIER_3_MAX = 1.0;
  private static readonly WEIGHT_RATIO_TIER_3_MULTIPLIER = 1.1;
  private static readonly WEIGHT_RATIO_TIER_4_MAX = 1.25;
  private static readonly WEIGHT_RATIO_TIER_4_MULTIPLIER = 1.25;
  private static readonly WEIGHT_RATIO_TIER_5_MULTIPLIER = 1.5; // For > 1.25

  /**
   * Get all standard plot specifications (with overrides applied)
   */
  static getStandardPlots(): PalletSpecification[] {
    const overrides = this.loadOverrides();
    const plots = [...this.STANDARD_PLOTS];

    if (overrides.plotOverrides) {
      return plots.map(plot => {
        const override = overrides.plotOverrides!.find(o => o.name === plot.name);
        if (override) {
          return { ...plot, baseCost: override.baseCost };
        }
        return plot;
      });
    }

    return plots;
  }

  /**
   * Calculate the volume in cubic meters
   */
  static calculateVolume(length: number, width: number, height: number): number {
    return (length * width * height) / 1000000; // Convert mm³ to m³
  }

  /**
   * Assess load dimensions and provide recommendations
   */
  static assessLoad(dimensions: LoadDimensions): LoadAssessment {
    const { length, width, height, weight } = dimensions;
    
    // Check if load exceeds standard dimensions
    const isOversized = length > this.MAX_STANDARD_LENGTH || width > this.MAX_STANDARD_WIDTH;
    const isProtruding = height > this.MAX_QUARTER_PLOT_HEIGHT;
    
    // Find the best matching standard plot
    const recommendedPlot = this.findBestMatchingPlot(dimensions);
    
    // Calculate base cost
    let calculatedCost = recommendedPlot.baseCost;
    
    // Apply oversized charges if applicable
    const additionalCharges: string[] = [];
    if (isOversized) {
      const oversizedCharge = weight * this.OVERSIZED_RATE_PER_KG;
      calculatedCost = oversizedCharge;
      additionalCharges.push(`Oversized load: £${oversizedCharge.toFixed(2)} (${this.OVERSIZED_RATE_PER_KG}/kg)`);
    }
    
    // Check if tail-lift is needed (simplified logic - could be enhanced)
    const needsTailLift = height > 1500; // If height > 1.5m, might need tail-lift
    if (needsTailLift) {
      calculatedCost += this.TAIL_LIFT_DROP_COST;
      additionalCharges.push(`Tail-lift drop: £${this.TAIL_LIFT_DROP_COST.toFixed(2)}`);
    }
    
    return {
      isOversized,
      isProtruding,
      isBalanced: !isOversized && !isProtruding,
      isFragile: false, // Would need user input
      recommendedPlot: recommendedPlot.name,
      calculatedCost,
      additionalCharges,
      totalCost: calculatedCost
    };
  }

  /**
   * Find the best matching standard plot for given dimensions
   */
  private static findBestMatchingPlot(dimensions: LoadDimensions): PalletSpecification {
    const { length, width, height, weight } = dimensions;
    
    // Sort plots by cost (cheapest first) and find the first one that can accommodate the load
    const sortedPlots = [...this.STANDARD_PLOTS].sort((a, b) => a.baseCost - b.baseCost);
    
    for (const plot of sortedPlots) {
      if (length <= plot.length && width <= plot.width && height <= plot.height && weight <= plot.weight) {
        return plot;
      }
    }
    
    // If no standard plot fits, return the most expensive one as base
    return sortedPlots[sortedPlots.length - 1];
  }

  /**
   * Get field hints for the form
   */
  static getFieldHints(): Record<string, string[]> {
    return {
      length: [
        "Is the load over-sized? (exceeds 1200mm)",
        "Consider if this will fit in standard plot dimensions",
        "Oversized loads incur additional charges"
      ],
      width: [
        "Is the load over-sized? (exceeds 1000mm)",
        "Check if width fits within plot boundaries",
        "Consider balance and stability"
      ],
      height: [
        "Is the load protruding? (exceeds 800mm for quarter plots)",
        "Check clearance requirements",
        "May need tail-lift service"
      ],
      weight: [
        "Does weight exceed plot capacity?",
        "Oversized loads charged at £18.46/kg",
        "Consider weight distribution"
      ],
      notes: [
        "Mark if load is fragile",
        "Note any special handling requirements",
        "Document oversized or protruding dimensions"
      ]
    };
  }

  /**
   * Calculate cost for multiple pallets
   */
  static calculateMultiplePalletCost(palletItems: Array<{ type: string; quantity: number }>): number {
    let totalCost = 0;
    
    for (const item of palletItems) {
      const plot = this.STANDARD_PLOTS.find(p => p.name === item.type);
      if (plot) {
        totalCost += plot.baseCost * item.quantity;
      }
    }
    
    return totalCost;
  }

  /**
   * Get pricing breakdown for display
   */
  static getPricingBreakdown(dimensions: LoadDimensions): {
    baseCost: number;
    additionalCharges: number;
    totalCost: number;
    breakdown: string[];
  } {
    const assessment = this.assessLoad(dimensions);
    const baseCost = assessment.calculatedCost - assessment.additionalCharges.reduce((sum, charge) => {
      const match = charge.match(/£(\d+\.?\d*)/);
      return sum + (match ? parseFloat(match[1]) : 0);
    }, 0);
    
    const additionalCharges = assessment.totalCost - baseCost;
    
    return {
      baseCost,
      additionalCharges,
      totalCost: assessment.totalCost,
      breakdown: [
        `Base cost: £${baseCost.toFixed(2)}`,
        ...assessment.additionalCharges
      ]
    };
  }

  /**
   * Get the distance rate based on tiered pricing structure (with overrides applied)
   * @param distance Distance in miles
   * @returns Rate per mile based on distance tier
   */
  private static getDistanceRate(distance: number): number {
    if (distance <= 0) return 0;
    
    const overrides = this.loadOverrides();
    let baseRate: number;

    if (distance <= this.DISTANCE_TIER_1_MAX) {
      baseRate = this.DISTANCE_TIER_1_RATE; // <=50 miles: £3.50
    } else if (distance <= this.DISTANCE_TIER_2_MAX) {
      baseRate = this.DISTANCE_TIER_2_RATE; // 51-99 miles: £3.25
    } else if (distance <= this.DISTANCE_TIER_3_MAX) {
      baseRate = this.DISTANCE_TIER_3_RATE; // 100-150 miles: £3.00
    } else {
      baseRate = this.DISTANCE_TIER_4_RATE; // >=151 miles: £2.75
    }

    // Apply override if exists
    if (overrides.distanceTierOverrides) {
      let tier = 1;
      if (distance <= this.DISTANCE_TIER_1_MAX) tier = 1;
      else if (distance <= this.DISTANCE_TIER_2_MAX) tier = 2;
      else if (distance <= this.DISTANCE_TIER_3_MAX) tier = 3;
      else tier = 4;

      const override = overrides.distanceTierOverrides.find(o => o.tier === tier);
      if (override) {
        return override.rate;
      }
    }

    return baseRate;
  }

  /**
   * Calculate distance cost based on tiered pricing structure
   * @param distance Distance in miles
   * @param quantity Number of pallets (default: 1)
   * @returns Cost for the distance traveled (rate per mile per pallet)
   */
  static calculateDistanceCost(distance: number, quantity: number = 1): number {
    if (distance <= 0) return 0;
    
    const rate = this.getDistanceRate(distance);
    // Cost = distance × rate × quantity (per mile per pallet)
    return distance * rate * quantity;
  }

  /**
   * Get distance tier information for display
   * @param distance Distance in miles
   * @returns Object with tier info and rate
   */
  static getDistanceTierInfo(distance: number): {
    tier: number;
    rate: number;
    description: string;
  } {
    if (distance <= 0) {
      return { tier: 0, rate: 0, description: 'No distance' };
    }
    
    if (distance <= this.DISTANCE_TIER_1_MAX) {
      return {
        tier: 1,
        rate: this.DISTANCE_TIER_1_RATE,
        description: `≤${this.DISTANCE_TIER_1_MAX} miles: £${this.DISTANCE_TIER_1_RATE.toFixed(2)} per mile per pallet`
      };
    } else if (distance <= this.DISTANCE_TIER_2_MAX) {
      return {
        tier: 2,
        rate: this.DISTANCE_TIER_2_RATE,
        description: `${this.DISTANCE_TIER_1_MAX + 1}-${this.DISTANCE_TIER_2_MAX} miles: £${this.DISTANCE_TIER_2_RATE.toFixed(2)} per mile per pallet`
      };
    } else if (distance <= this.DISTANCE_TIER_3_MAX) {
      return {
        tier: 3,
        rate: this.DISTANCE_TIER_3_RATE,
        description: `${this.DISTANCE_TIER_2_MAX + 1}-${this.DISTANCE_TIER_3_MAX} miles: £${this.DISTANCE_TIER_3_RATE.toFixed(2)} per mile per pallet`
      };
    } else {
      return {
        tier: 4,
        rate: this.DISTANCE_TIER_4_RATE,
        description: `≥${this.DISTANCE_TIER_3_MAX + 1} miles: £${this.DISTANCE_TIER_4_RATE.toFixed(2)} per mile per pallet`
      };
    }
  }

  /**
   * Calculate plot space cost for a single pallet item
   * @param dimensions Load dimensions
   * @param quantity Quantity of items
   * @returns Plot space cost for the item(s)
   */
  static calculatePlotSpaceCost(dimensions: LoadDimensions, quantity: number = 1): number {
    const assessment = this.assessLoad(dimensions);
    return assessment.totalCost * quantity;
  }

  /**
   * Calculate total cost for a single consignment item (plot space + distance + weight ratio)
   * @param dimensions Load dimensions
   * @param distance Distance traveled in miles
   * @param quantity Quantity of items (pallets)
   * @param palletType Type of pallet/plot (e.g., "Full Plot", "Half Plot")
   * @param actualWeight Actual weight of the consignment in kg (optional, uses dimensions.weight if not provided)
   * @returns Object with plot space cost, distance cost, weight ratio cost, and total cost
   */
  static calculateConsignmentItemCost(
    dimensions: LoadDimensions,
    distance: number,
    quantity: number = 1,
    palletType: string = 'Full Plot',
    actualWeight?: number
  ): {
    plotSpaceCost: number;
    distanceCost: number;
    weightRatio: number;
    weightRatioCost: number;
    totalCost: number;
    distanceTier: { tier: number; rate: number; description: string };
    weightRatioTier: { tier: number; multiplier: number; description: string; percentage: string };
  } {
    const plotSpaceCost = this.calculatePlotSpaceCost(dimensions, quantity);
    const distanceCost = this.calculateDistanceCost(distance, quantity);
    
    // Calculate weight ratio
    const weight = actualWeight || dimensions.weight || 0;
    const weightRatio = this.calculateWeightRatio(weight, palletType);
    const weightRatioCost = this.calculateWeightRatioCost(plotSpaceCost, weightRatio);
    
    const totalCost = plotSpaceCost + distanceCost + weightRatioCost;
    const distanceTier = this.getDistanceTierInfo(distance);
    const weightRatioTier = this.getWeightRatioTierInfo(weightRatio);

    return {
      plotSpaceCost,
      distanceCost,
      weightRatio,
      weightRatioCost,
      totalCost,
      distanceTier,
      weightRatioTier
    };
  }

  /**
   * Calculate pricing for multiple consignment items with distance and weight ratio
   * @param items Array of consignment items with dimensions and distance
   * @returns Complete pricing summary with totals
   */
  static calculateConsignmentPricing(
    items: Array<{
      id: string;
      palletType: string;
      quantity: number;
      dimensions: LoadDimensions;
      distance: number;
      weight: number;
      totalWeight: number;
      volume: number;
      totalVolume: number;
      length: number;
      width: number;
      height: number;
      tailLift: boolean;
      forkLift: boolean;
      handBall: boolean;
    }>
  ): ConsignmentPricingSummary {
    const pricingItems: ConsignmentPricingItem[] = [];
    let totalPlotSpaceCost = 0;
    let totalDistanceCost = 0;
    let totalWeightRatioCost = 0;
    let totalDistanceTraveled = 0;
    const plotSpaceBreakdown: Array<{ palletType: string; quantity: number; cost: number }> = [];
    const distanceBreakdown: Array<{ distance: number; cost: number }> = [];
    const weightRatioBreakdown: Array<{ weightRatio: number; cost: number; description: string }> = [];

    // Group by pallet type for breakdown
    const plotSpaceByType: Record<string, { quantity: number; cost: number }> = {};

    for (const item of items) {
      const itemCost = this.calculateConsignmentItemCost(
        item.dimensions,
        item.distance,
        item.quantity,
        item.palletType,
        item.weight
      );

      totalPlotSpaceCost += itemCost.plotSpaceCost;
      totalDistanceCost += itemCost.distanceCost;
      totalWeightRatioCost += itemCost.weightRatioCost;
      totalDistanceTraveled += item.distance; // Distance is the same for all items, just track once per item type

      // Track plot space by type
      if (!plotSpaceByType[item.palletType]) {
        plotSpaceByType[item.palletType] = { quantity: 0, cost: 0 };
      }
      plotSpaceByType[item.palletType].quantity += item.quantity;
      plotSpaceByType[item.palletType].cost += itemCost.plotSpaceCost;

      // Track distance breakdown
      distanceBreakdown.push({
        distance: item.distance,
        cost: itemCost.distanceCost
      });

      // Track weight ratio breakdown
      weightRatioBreakdown.push({
        weightRatio: itemCost.weightRatio,
        cost: itemCost.weightRatioCost,
        description: itemCost.weightRatioTier.description
      });

      pricingItems.push({
        id: item.id,
        palletType: item.palletType,
        quantity: item.quantity,
        plotSpaceCost: itemCost.plotSpaceCost,
        distanceTraveled: item.distance,
        distanceCost: itemCost.distanceCost,
        weightRatio: itemCost.weightRatio,
        weightRatioCost: itemCost.weightRatioCost,
        totalItemCost: itemCost.totalCost,
        weight: item.weight,
        totalWeight: item.totalWeight,
        volume: item.volume,
        totalVolume: item.totalVolume,
        length: item.length,
        width: item.width,
        height: item.height,
        tailLift: item.tailLift,
        forkLift: item.forkLift,
        handBall: item.handBall
      });
    }

    // Convert plot space breakdown to array
    for (const [palletType, data] of Object.entries(plotSpaceByType)) {
      plotSpaceBreakdown.push({
        palletType,
        quantity: data.quantity,
        cost: data.cost
      });
    }

    return {
      items: pricingItems,
      totalPlotSpaceCost,
      totalDistanceCost,
      totalWeightRatioCost,
      totalDistanceTraveled,
      grandTotal: totalPlotSpaceCost + totalDistanceCost + totalWeightRatioCost,
      breakdown: {
        plotSpaceBreakdown,
        distanceBreakdown,
        weightRatioBreakdown
      }
    };
  }

  /**
   * Get distance unit (miles or km)
   */
  static getDistanceUnit(): string {
    return this.USE_MILES ? 'miles' : 'km';
  }

  /**
   * Calculate weight ratio (actual weight / standard plot weight)
   * @param actualWeight Actual weight of the consignment in kg
   * @param palletType Type of pallet/plot (e.g., "Full Plot", "Half Plot")
   * @returns Weight ratio (actual weight / standard plot weight)
   */
  static calculateWeightRatio(actualWeight: number, palletType: string): number {
    if (actualWeight <= 0) return 0;
    
    const plot = this.STANDARD_PLOTS.find(p => p.name === palletType);
    if (!plot || plot.weight <= 0) {
      // If plot not found, use Full Plot as default
      const defaultPlot = this.STANDARD_PLOTS.find(p => p.name === 'Full Plot');
      if (!defaultPlot || defaultPlot.weight <= 0) return 1.0;
      return actualWeight / defaultPlot.weight;
    }
    
    return actualWeight / plot.weight;
  }

  /**
   * Get weight ratio multiplier based on tiered pricing structure (with overrides applied)
   * @param weightRatio Weight ratio (actual weight / standard plot weight)
   * @returns Multiplier to apply to base cost
   */
  private static getWeightRatioMultiplier(weightRatio: number): number {
    if (weightRatio <= 0) return 1.0;
    
    const overrides = this.loadOverrides();
    let baseMultiplier: number;

    if (weightRatio <= this.WEIGHT_RATIO_TIER_1_MAX) {
      baseMultiplier = this.WEIGHT_RATIO_TIER_1_MULTIPLIER; // <= 0.5: 0.9x (10% discount)
    } else if (weightRatio <= this.WEIGHT_RATIO_TIER_2_MAX) {
      baseMultiplier = this.WEIGHT_RATIO_TIER_2_MULTIPLIER; // 0.51-0.75: 1.0x (standard)
    } else if (weightRatio <= this.WEIGHT_RATIO_TIER_3_MAX) {
      baseMultiplier = this.WEIGHT_RATIO_TIER_3_MULTIPLIER; // 0.76-1.0: 1.1x (10% surcharge)
    } else if (weightRatio <= this.WEIGHT_RATIO_TIER_4_MAX) {
      baseMultiplier = this.WEIGHT_RATIO_TIER_4_MULTIPLIER; // 1.01-1.25: 1.25x (25% surcharge)
    } else {
      baseMultiplier = this.WEIGHT_RATIO_TIER_5_MULTIPLIER; // > 1.25: 1.5x (50% surcharge)
    }

    // Apply override if exists
    if (overrides.weightRatioTierOverrides) {
      let tier = 1;
      if (weightRatio <= this.WEIGHT_RATIO_TIER_1_MAX) tier = 1;
      else if (weightRatio <= this.WEIGHT_RATIO_TIER_2_MAX) tier = 2;
      else if (weightRatio <= this.WEIGHT_RATIO_TIER_3_MAX) tier = 3;
      else if (weightRatio <= this.WEIGHT_RATIO_TIER_4_MAX) tier = 4;
      else tier = 5;

      const override = overrides.weightRatioTierOverrides.find(o => o.tier === tier);
      if (override) {
        return override.multiplier;
      }
    }

    return baseMultiplier;
  }

  /**
   * Calculate weight ratio cost based on tiered pricing structure
   * @param baseCost Base cost (plot space cost)
   * @param weightRatio Weight ratio (actual weight / standard plot weight)
   * @returns Additional cost or discount based on weight ratio
   */
  static calculateWeightRatioCost(baseCost: number, weightRatio: number): number {
    if (baseCost <= 0 || weightRatio <= 0) return 0;
    
    const multiplier = this.getWeightRatioMultiplier(weightRatio);
    // Weight ratio cost = (multiplier - 1) * baseCost
    // This gives us the additional cost (positive) or discount (negative)
    return (multiplier - 1) * baseCost;
  }

  /**
   * Get weight ratio tier information for display
   * @param weightRatio Weight ratio (actual weight / standard plot weight)
   * @returns Object with tier info and multiplier
   */
  static getWeightRatioTierInfo(weightRatio: number): {
    tier: number;
    multiplier: number;
    description: string;
    percentage: string;
  } {
    if (weightRatio <= 0) {
      return { tier: 0, multiplier: 1.0, description: 'No weight', percentage: '0%' };
    }
    
    const multiplier = this.getWeightRatioMultiplier(weightRatio);
    const percentage = ((multiplier - 1) * 100).toFixed(0);
    const percentageStr = multiplier < 1 ? `${percentage}% discount` : `${percentage}% surcharge`;
    
    if (weightRatio <= this.WEIGHT_RATIO_TIER_1_MAX) {
      return {
        tier: 1,
        multiplier: this.WEIGHT_RATIO_TIER_1_MULTIPLIER,
        description: `≤${(this.WEIGHT_RATIO_TIER_1_MAX * 100).toFixed(0)}% of standard weight: ${percentageStr}`,
        percentage: percentageStr
      };
    } else if (weightRatio <= this.WEIGHT_RATIO_TIER_2_MAX) {
      return {
        tier: 2,
        multiplier: this.WEIGHT_RATIO_TIER_2_MULTIPLIER,
        description: `${((this.WEIGHT_RATIO_TIER_1_MAX + 0.01) * 100).toFixed(0)}-${(this.WEIGHT_RATIO_TIER_2_MAX * 100).toFixed(0)}% of standard weight: ${percentageStr}`,
        percentage: percentageStr
      };
    } else if (weightRatio <= this.WEIGHT_RATIO_TIER_3_MAX) {
      return {
        tier: 3,
        multiplier: this.WEIGHT_RATIO_TIER_3_MULTIPLIER,
        description: `${((this.WEIGHT_RATIO_TIER_2_MAX + 0.01) * 100).toFixed(0)}-${(this.WEIGHT_RATIO_TIER_3_MAX * 100).toFixed(0)}% of standard weight: ${percentageStr}`,
        percentage: percentageStr
      };
    } else if (weightRatio <= this.WEIGHT_RATIO_TIER_4_MAX) {
      return {
        tier: 4,
        multiplier: this.WEIGHT_RATIO_TIER_4_MULTIPLIER,
        description: `${((this.WEIGHT_RATIO_TIER_3_MAX + 0.01) * 100).toFixed(0)}-${(this.WEIGHT_RATIO_TIER_4_MAX * 100).toFixed(0)}% of standard weight: ${percentageStr}`,
        percentage: percentageStr
      };
    } else {
      return {
        tier: 5,
        multiplier: this.WEIGHT_RATIO_TIER_5_MULTIPLIER,
        description: `>${(this.WEIGHT_RATIO_TIER_4_MAX * 100).toFixed(0)}% of standard weight: ${percentageStr}`,
        percentage: percentageStr
      };
    }
  }

  /**
   * Get all weight ratio tier multipliers for display (with overrides applied)
   */
  static getWeightRatioTiers(): Array<{ range: string; multiplier: number; description: string; percentage: string }> {
    const overrides = this.loadOverrides();
    const tiers = [
      {
        range: `≤${(this.WEIGHT_RATIO_TIER_1_MAX * 100).toFixed(0)}%`,
        multiplier: this.WEIGHT_RATIO_TIER_1_MULTIPLIER,
        description: `${((this.WEIGHT_RATIO_TIER_1_MULTIPLIER - 1) * 100).toFixed(0)}% discount`,
        percentage: `${((this.WEIGHT_RATIO_TIER_1_MULTIPLIER - 1) * 100).toFixed(0)}%`
      },
      {
        range: `${((this.WEIGHT_RATIO_TIER_1_MAX + 0.01) * 100).toFixed(0)}-${(this.WEIGHT_RATIO_TIER_2_MAX * 100).toFixed(0)}%`,
        multiplier: this.WEIGHT_RATIO_TIER_2_MULTIPLIER,
        description: 'Standard rate',
        percentage: '0%'
      },
      {
        range: `${((this.WEIGHT_RATIO_TIER_2_MAX + 0.01) * 100).toFixed(0)}-${(this.WEIGHT_RATIO_TIER_3_MAX * 100).toFixed(0)}%`,
        multiplier: this.WEIGHT_RATIO_TIER_3_MULTIPLIER,
        description: `${((this.WEIGHT_RATIO_TIER_3_MULTIPLIER - 1) * 100).toFixed(0)}% surcharge`,
        percentage: `+${((this.WEIGHT_RATIO_TIER_3_MULTIPLIER - 1) * 100).toFixed(0)}%`
      },
      {
        range: `${((this.WEIGHT_RATIO_TIER_3_MAX + 0.01) * 100).toFixed(0)}-${(this.WEIGHT_RATIO_TIER_4_MAX * 100).toFixed(0)}%`,
        multiplier: this.WEIGHT_RATIO_TIER_4_MULTIPLIER,
        description: `${((this.WEIGHT_RATIO_TIER_4_MULTIPLIER - 1) * 100).toFixed(0)}% surcharge`,
        percentage: `+${((this.WEIGHT_RATIO_TIER_4_MULTIPLIER - 1) * 100).toFixed(0)}%`
      },
      {
        range: `>${(this.WEIGHT_RATIO_TIER_4_MAX * 100).toFixed(0)}%`,
        multiplier: this.WEIGHT_RATIO_TIER_5_MULTIPLIER,
        description: `${((this.WEIGHT_RATIO_TIER_5_MULTIPLIER - 1) * 100).toFixed(0)}% surcharge`,
        percentage: `+${((this.WEIGHT_RATIO_TIER_5_MULTIPLIER - 1) * 100).toFixed(0)}%`
      }
    ];

    // Apply overrides if they exist
    if (overrides.weightRatioTierOverrides) {
      return tiers.map((tier, index) => {
        const override = overrides.weightRatioTierOverrides!.find(o => o.tier === index + 1);
        if (override) {
          const percentage = ((override.multiplier - 1) * 100).toFixed(0);
          return {
            ...tier,
            multiplier: override.multiplier,
            description: override.multiplier < 1 ? `${percentage}% discount` : override.multiplier === 1 ? 'Standard rate' : `${percentage}% surcharge`,
            percentage: override.multiplier < 1 ? `${percentage}%` : override.multiplier === 1 ? '0%' : `+${percentage}%`
          };
        }
        return tier;
      });
    }

    return tiers;
  }

  /**
   * Get all distance tier rates for display (with overrides applied)
   */
  static getDistanceTiers(): Array<{ range: string; rate: number; description: string }> {
    const overrides = this.loadOverrides();
    const tiers = [
      {
        range: `≤${this.DISTANCE_TIER_1_MAX} miles`,
        rate: this.DISTANCE_TIER_1_RATE,
        description: `£${this.DISTANCE_TIER_1_RATE.toFixed(2)} per mile per pallet`
      },
      {
        range: `${this.DISTANCE_TIER_1_MAX + 1}-${this.DISTANCE_TIER_2_MAX} miles`,
        rate: this.DISTANCE_TIER_2_RATE,
        description: `£${this.DISTANCE_TIER_2_RATE.toFixed(2)} per mile per pallet`
      },
      {
        range: `${this.DISTANCE_TIER_2_MAX + 1}-${this.DISTANCE_TIER_3_MAX} miles`,
        rate: this.DISTANCE_TIER_3_RATE,
        description: `£${this.DISTANCE_TIER_3_RATE.toFixed(2)} per mile per pallet`
      },
      {
        range: `≥${this.DISTANCE_TIER_3_MAX + 1} miles`,
        rate: this.DISTANCE_TIER_4_RATE,
        description: `£${this.DISTANCE_TIER_4_RATE.toFixed(2)} per mile per pallet`
      }
    ];

    // Apply overrides if they exist
    if (overrides.distanceTierOverrides) {
      return tiers.map((tier, index) => {
        const override = overrides.distanceTierOverrides!.find(o => o.tier === index + 1);
        if (override) {
          return {
            ...tier,
            rate: override.rate,
            description: `£${override.rate.toFixed(2)} per mile per pallet`
          };
        }
        return tier;
      });
    }

    return tiers;
  }

  /**
   * Set distance rate (allows customization)
   * Note: This would require making the constants non-readonly or using a different approach
   * For now, users can modify the constants directly in the code
   */
  static setDistanceRate(rate: number, useMiles: boolean = true): void {
    // Note: Since constants are readonly, this would need to be refactored
    // to use instance variables or a configuration object if dynamic changes are needed
    console.warn('Distance rate is currently a constant. Modify DISTANCE_RATE_PER_MILE or DISTANCE_RATE_PER_KM in the code to change it.');
  }
}
