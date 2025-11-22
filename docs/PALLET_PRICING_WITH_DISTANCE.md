# Pallet Pricing with Distance Calculations

This document explains how to use the enhanced pallet pricing service that includes distance-based calculations.

## Overview

The pricing service now calculates costs in two separate components:
1. **Plot Space Cost**: Based on pallet size and specifications
2. **Distance Cost**: Based on distance traveled (collection + delivery)

These are calculated separately and then combined to give grand totals.

## New Features

### Distance-Based Pricing Constants

Located in `src/services/palletPricingService.ts`:

```typescript
DISTANCE_RATE_PER_MILE = 1.50  // Cost per mile (default)
DISTANCE_RATE_PER_KM = 0.93    // Cost per km (1 mile ≈ 1.609 km)
USE_MILES = true                // Set to false to use kilometers
```

### New Interfaces

#### ConsignmentPricingItem
Represents a single consignment item with both plot space and distance costs:
- `plotSpaceCost`: Cost for the plot allocation
- `distanceTraveled`: Distance in miles/km
- `distanceCost`: Cost based on distance
- `totalItemCost`: Combined cost for this item

#### ConsignmentPricingSummary
Complete pricing breakdown for all consignments:
- `totalPlotSpaceCost`: Sum of all plot space costs
- `totalDistanceCost`: Sum of all distance costs
- `totalDistanceTraveled`: Total distance for all items
- `grandTotal`: Combined total (plot space + distance)

## Usage Examples

### Example 1: Calculate Cost for a Single Item

```typescript
import { PalletPricingService } from '../services/palletPricingService';

const dimensions = {
  length: 1200,  // mm
  width: 1200,   // mm
  height: 2200,  // mm
  weight: 500,   // kg
  notes: 'Standard pallet'
};

const distance = 25.5; // miles (or km if USE_MILES = false)
const quantity = 2;

const cost = PalletPricingService.calculateConsignmentItemCost(
  dimensions,
  distance,
  quantity
);

console.log('Plot Space Cost:', cost.plotSpaceCost);  // e.g., £110.00
console.log('Distance Cost:', cost.distanceCost);     // e.g., £76.50
console.log('Total Cost:', cost.totalCost);            // e.g., £186.50
```

### Example 2: Calculate Pricing for Multiple Consignments

```typescript
const consignments = [
  {
    id: '1',
    palletType: 'Full Plot',
    quantity: 1,
    dimensions: {
      length: 1200,
      width: 1200,
      height: 2200,
      weight: 1200,
      notes: 'Heavy load'
    },
    distance: 30.0, // miles
    weight: 1200,
    totalWeight: 1200,
    volume: 3.168,
    totalVolume: 3.168,
    length: 120,
    width: 120,
    height: 220,
    tailLift: false,
    forkLift: true,
    handBall: false
  },
  {
    id: '2',
    palletType: 'Half Plot',
    quantity: 2,
    dimensions: {
      length: 1200,
      width: 800,
      height: 800,
      weight: 500,
      notes: 'Light items'
    },
    distance: 45.5, // miles
    weight: 500,
    totalWeight: 1000,
    volume: 0.768,
    totalVolume: 1.536,
    length: 120,
    width: 80,
    height: 80,
    tailLift: true,
    forkLift: false,
    handBall: false
  }
];

const pricing = PalletPricingService.calculateConsignmentPricing(consignments);

console.log('Total Plot Space Cost:', pricing.totalPlotSpaceCost);
console.log('Total Distance Cost:', pricing.totalDistanceCost);
console.log('Total Distance Traveled:', pricing.totalDistanceTraveled);
console.log('Grand Total:', pricing.grandTotal);

// Access individual item costs
pricing.items.forEach(item => {
  console.log(`${item.palletType}: Plot £${item.plotSpaceCost.toFixed(2)}, Distance £${item.distanceCost.toFixed(2)}, Total £${item.totalItemCost.toFixed(2)}`);
});

// Access breakdown
console.log('Plot Space Breakdown:', pricing.breakdown.plotSpaceBreakdown);
console.log('Distance Breakdown:', pricing.breakdown.distanceBreakdown);
```

### Example 3: Calculate Only Distance Cost

```typescript
const distance = 50; // miles
const distanceCost = PalletPricingService.calculateDistanceCost(distance);
console.log(`Distance cost for ${distance} miles: £${distanceCost.toFixed(2)}`);
// Output: Distance cost for 50 miles: £75.00
```

### Example 4: Calculate Only Plot Space Cost

```typescript
const dimensions = {
  length: 1200,
  width: 1000,
  height: 800,
  weight: 250,
  notes: 'Quarter plot'
};

const plotCost = PalletPricingService.calculatePlotSpaceCost(dimensions, 3);
console.log(`Plot space cost for 3 items: £${plotCost.toFixed(2)}`);
// Output: Plot space cost for 3 items: £135.00
```

## Customizing Distance Rates

To change the distance rate, edit the constants in `palletPricingService.ts`:

```typescript
// For miles
private static readonly DISTANCE_RATE_PER_MILE = 2.00; // Change from 1.50

// For kilometers
private static readonly DISTANCE_RATE_PER_KM = 1.25; // Change from 0.93

// Switch between miles and kilometers
private static readonly USE_MILES = false; // Change to false to use km
```

## Integration with Job Allocation Form

When integrating with the Job Allocation Form, you'll need to:

1. Add a distance field to the form
2. Calculate distance from pickup to delivery location (or allow manual entry)
3. Use `calculateConsignmentPricing()` to get complete pricing
4. Display the breakdown showing:
   - Plot space costs per item
   - Distance costs per item
   - Total plot space cost
   - Total distance cost
   - Grand total

## Output Format

The pricing summary provides a structured breakdown:

```typescript
{
  items: [
    {
      id: '1',
      palletType: 'Full Plot',
      quantity: 1,
      plotSpaceCost: 65.00,
      distanceTraveled: 30.0,
      distanceCost: 45.00,
      totalItemCost: 110.00,
      // ... other item details
    }
  ],
  totalPlotSpaceCost: 65.00,
  totalDistanceCost: 45.00,
  totalDistanceTraveled: 30.0,
  grandTotal: 110.00,
  breakdown: {
    plotSpaceBreakdown: [
      { palletType: 'Full Plot', quantity: 1, cost: 65.00 }
    ],
    distanceBreakdown: [
      { distance: 30.0, cost: 45.00 }
    ]
  }
}
```

## Notes

- Distance is calculated per item, then multiplied by quantity
- Plot space cost includes base cost, oversized charges, and tail-lift fees
- Distance cost is calculated separately and added to plot space cost
- All costs are in the same currency (default: GBP £)
- Distance can be in miles or kilometers (configurable via `USE_MILES`)

