// Plot Allocation Service - Handles allocation of consignments to trailer plots
import { PalletPricingService, PalletSpecification } from './palletPricingService';

export interface PlotAllocation {
  plotId: string;
  plotType: string;
  position: {
    x: number; // cm from front
    y: number; // cm from left side
    z: number; // cm from bottom
    width: number; // cm
    height: number; // cm
    length: number; // cm
  };
  palletItems: any[];
  totalWeight: number; // kg
  totalVolume: number; // m³
  jobId: string;
  jobTitle: string;
}

export interface TrailerCapacity {
  length: number; // cm
  width: number; // cm
  height: number; // cm
  maxWeight: number; // kg
  maxVolume: number; // m³
}

export class PlotAllocationService {
  /**
   * Allocate pallet items from a job to plots on a trailer
   */
  static allocatePlots(
    palletItems: any[],
    trailerCapacity: TrailerCapacity,
    existingAllocations: PlotAllocation[] = []
  ): PlotAllocation[] {
    const allocations: PlotAllocation[] = [];
    let currentX = 0; // Position along trailer length
    let currentY = 0; // Position across trailer width
    let currentZ = 0; // Height from floor
    let plotCounter = 1;

    // Calculate used space from existing allocations
    const usedSpace = existingAllocations.reduce(
      (acc, alloc) => {
        return {
          x: Math.max(acc.x, alloc.position.x + alloc.position.length),
          weight: acc.weight + alloc.totalWeight,
          volume: acc.volume + alloc.totalVolume,
        };
      },
      { x: 0, weight: 0, volume: 0 }
    );

    currentX = usedSpace.x;

    // Group pallet items and allocate to appropriate plots
    for (const palletItem of palletItems) {
      const itemCount = palletItem.quantity || 1;
      const itemLength = palletItem.length || 0; // cm
      const itemWidth = palletItem.width || 0; // cm
      const itemHeight = palletItem.height || 0; // cm
      const itemWeight = palletItem.totalWeight || 0; // kg
      
      // Normalize volume - ensure it's in m³
      // First, check if volume seems wrong and recalculate from dimensions
      let itemVolume = palletItem.totalVolume || 0;
      
      // If we have dimensions, always recalculate volume to ensure accuracy
      // Dimensions are stored in cm, so: (cm × cm × cm) / 1,000,000 = m³
      if (itemLength > 0 && itemWidth > 0 && itemHeight > 0) {
        const calculatedVolume = (itemLength * itemWidth * itemHeight) / 1000000;
        
        // If stored volume is way off (more than 10x different), use calculated
        // Or if volume is > 100 m³ (unreasonable for a pallet), use calculated
        if (itemVolume === 0 || itemVolume > 100 || Math.abs(itemVolume - calculatedVolume) > calculatedVolume * 10) {
          console.warn(`Volume mismatch: stored=${itemVolume}m³, calculated=${calculatedVolume.toFixed(4)}m³. Using calculated.`);
          itemVolume = calculatedVolume;
        } else {
          // Use stored volume if it's reasonable
          itemVolume = itemVolume;
        }
      } else if (itemVolume > 1000) {
        // No dimensions available, but volume is suspiciously large - might be in cm³
        console.warn(`Volume too large (${itemVolume}), might be in cm³. Converting to m³.`);
        itemVolume = itemVolume / 1000000;
      }
      
      // Final safety check
      if (itemVolume > 100) {
        console.error(`Volume still too large (${itemVolume} m³). Setting to 0.`);
        itemVolume = 0;
      }

      // Find best matching plot specification
      const plotSpec = this.findBestPlotSpec({
        length: itemLength * 10, // Convert cm to mm for comparison
        width: itemWidth * 10,
        height: itemHeight * 10,
        weight: itemWeight,
        notes: '',
      });

      // Check if allocation fits
      const plotLength = (plotSpec.length / 10); // Convert mm to cm
      const plotWidth = plotSpec.width / 10;
      const plotHeight = plotSpec.height / 10;

      // Check if we need to move to next row (width constraint)
      if (currentY + plotWidth > trailerCapacity.width) {
        currentY = 0;
        currentX += Math.max(...allocations.slice(-5).map(a => a.position.length), plotLength);
        currentZ = 0; // Reset height when moving to new row
      }

      // Check if we need to stack (height constraint)
      const stackedHeight = itemHeight * itemCount;
      if (currentZ + stackedHeight > trailerCapacity.height) {
        currentZ = 0;
        currentY += plotWidth + 10; // 10cm gap
        if (currentY + plotWidth > trailerCapacity.width) {
          currentY = 0;
          currentX += plotLength + 10;
        }
      }

      // Check if we exceed trailer length
      if (currentX + plotLength > trailerCapacity.length) {
        console.warn(`Cannot allocate more items - trailer full`);
        break;
      }

      // Check weight and volume constraints
      const totalWeight = usedSpace.weight + allocations.reduce((sum, a) => sum + a.totalWeight, 0) + itemWeight;
      const totalVolume = usedSpace.volume + allocations.reduce((sum, a) => sum + a.totalVolume, 0) + itemVolume;

      if (totalWeight > trailerCapacity.maxWeight) {
        console.warn(`Cannot allocate - weight exceeded`);
        break;
      }

      if (totalVolume > trailerCapacity.maxVolume) {
        console.warn(`Cannot allocate - volume exceeded`);
        break;
      }

      // Create allocation
      const allocation: PlotAllocation = {
        plotId: `PLOT-${plotCounter.toString().padStart(3, '0')}`,
        plotType: plotSpec.name,
        position: {
          x: currentX,
          y: currentY,
          z: currentZ,
          width: plotWidth,
          height: stackedHeight,
          length: plotLength,
        },
        palletItems: [palletItem],
        totalWeight: itemWeight,
        totalVolume: itemVolume,
        jobId: palletItem.jobId || '',
        jobTitle: palletItem.palletType || 'Consignment',
      };

      allocations.push(allocation);
      plotCounter++;

      // Update positions for next item
      currentZ += stackedHeight + 10; // 10cm gap between stacked items
      if (currentZ + itemHeight > trailerCapacity.height) {
        currentZ = 0;
        currentY += plotWidth + 10;
      }
    }

    return allocations;
  }

  /**
   * Find best matching plot specification for given dimensions
   */
  private static findBestPlotSpec(dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
    notes: string;
  }): PalletSpecification {
    const plots = PalletPricingService.getStandardPlots();
    
    // Find plot that fits dimensions with minimum waste
    let bestPlot = plots[0]; // Default to Full Plot
    let bestFit = Infinity;

    for (const plot of plots) {
      const fits = dimensions.length <= plot.length &&
                   dimensions.width <= plot.width &&
                   dimensions.height <= plot.height &&
                   dimensions.weight <= plot.weight * 1.2; // 20% weight tolerance

      if (fits) {
        const waste = (plot.length * plot.width * plot.height) - 
                      (dimensions.length * dimensions.width * dimensions.height);
        if (waste < bestFit) {
          bestFit = waste;
          bestPlot = plot;
        }
      }
    }

    // If no standard plot fits, use oversized calculation
    if (bestFit === Infinity) {
      // Return a custom oversized plot spec
      return {
        name: 'Oversized',
        weight: dimensions.weight,
        length: dimensions.length,
        width: dimensions.width,
        height: dimensions.height,
        baseCost: dimensions.weight * 18.46 / 100, // £18.46 per kg
        description: 'Oversized load',
      };
    }

    return bestPlot;
  }

  /**
   * Normalize volume to m³ - handles potential unit mismatches
   */
  private static normalizeVolume(volume: number, length?: number, width?: number, height?: number): number {
    // If volume seems too large (> 1000 m³), it might be in cm³ - convert it
    if (volume > 1000) {
      console.warn(`Volume appears to be in cm³ (${volume}), converting to m³`);
      return volume / 1000000;
    }
    
    // If volume is 0 but we have dimensions, calculate it
    if (volume === 0 && length && width && height && length > 0 && width > 0 && height > 0) {
      // Dimensions are in cm, convert to m³: (cm × cm × cm) / 1,000,000 = m³
      return (length * width * height) / 1000000;
    }
    
    return volume;
  }

  /**
   * Check if allocation fits in trailer capacity
   */
  static canAllocate(
    palletItems: any[],
    trailerCapacity: TrailerCapacity,
    existingAllocations: PlotAllocation[] = []
  ): { canAllocate: boolean; reason?: string } {
    const totalWeight = palletItems.reduce((sum, item) => sum + (item.totalWeight || 0), 0);
    
    // Normalize volumes for each pallet item
    const normalizedVolumes = palletItems.map(item => 
      this.normalizeVolume(
        item.totalVolume || 0,
        item.length,
        item.width,
        item.height
      )
    );
    const totalVolume = normalizedVolumes.reduce((sum, vol) => sum + vol, 0);

    const existingWeight = existingAllocations.reduce((sum, alloc) => sum + alloc.totalWeight, 0);
    const existingVolume = existingAllocations.reduce((sum, alloc) => sum + alloc.totalVolume, 0);

    if (totalWeight + existingWeight > trailerCapacity.maxWeight) {
      return {
        canAllocate: false,
        reason: `Weight exceeded: ${totalWeight + existingWeight}kg > ${trailerCapacity.maxWeight}kg`,
      };
    }

    if (totalVolume + existingVolume > trailerCapacity.maxVolume) {
      return {
        canAllocate: false,
        reason: `Volume exceeded: ${(totalVolume + existingVolume).toFixed(2)}m³ > ${trailerCapacity.maxVolume}m³`,
      };
    }

    return { canAllocate: true };
  }
}

