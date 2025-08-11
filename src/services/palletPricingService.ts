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

export class PalletPricingService {
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

  /**
   * Get all standard plot specifications
   */
  static getStandardPlots(): PalletSpecification[] {
    return [...this.STANDARD_PLOTS];
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
}
