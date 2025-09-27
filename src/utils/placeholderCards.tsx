import React from 'react';
import { Analytics } from '@mui/icons-material';

export interface PlaceholderCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactElement;
  features: string[];
}

/**
 * Generates placeholder cards to complete incomplete rows in a grid layout
 * @param functionalCards - Number of functional/active cards
 * @param comingSoonCards - Number of "Coming Soon" cards
 * @param columnsPerRow - Number of columns per row (default: 3)
 * @returns Array of placeholder card objects
 */
export const generatePlaceholderCards = (
  functionalCards: number, 
  comingSoonCards: number, 
  columnsPerRow: number = 3
): PlaceholderCard[] => {
  const totalCards = functionalCards + comingSoonCards;
  const cardsInCurrentRow = totalCards % columnsPerRow;
  
  console.log('Placeholder calculation:');
  console.log('- Functional cards:', functionalCards);
  console.log('- Coming soon cards:', comingSoonCards);
  console.log('- Total cards:', totalCards);
  console.log('- Cards in current row:', cardsInCurrentRow);
  console.log('- Columns per row:', columnsPerRow);
  
  // If current row is complete (cardsInCurrentRow === 0), don't add any placeholders
  if (cardsInCurrentRow === 0) {
    console.log('- No placeholders needed (row is complete)');
    return [];
  }
  
  // Only add placeholders to complete the current row, never start a new row
  const placeholdersNeeded = columnsPerRow - cardsInCurrentRow;
  console.log('- Placeholders needed:', placeholdersNeeded);
  
  // Never add more placeholders than needed to complete the current row
  return Array.from({ length: placeholdersNeeded }, (_, index) => ({
    id: `placeholder-${index}`,
    title: 'Coming Soon',
    description: 'Additional features and tools',
    icon: <Analytics />,
    features: ['Feature 1', 'Feature 2', 'Feature 3']
  }));
};

/**
 * Renders placeholder cards in a Grid layout
 * @param placeholderCards - Array of placeholder card objects
 * @param columnsPerRow - Number of columns per row (default: 3)
 * @returns JSX elements for placeholder cards
 */
export const renderPlaceholderCards = (
  placeholderCards: PlaceholderCard[], 
  columnsPerRow: number = 3
) => {
  return placeholderCards.map((card) => (
    <div key={card.id} style={{ width: `${100/columnsPerRow}%`, padding: '8px' }}>
      {/* This will be replaced with actual Grid components in each hub */}
      <div style={{ 
        background: '#f5f5f5', 
        border: '2px dashed #ccc', 
        borderRadius: '8px', 
        padding: '16px',
        textAlign: 'center',
        opacity: 0.7,
        transform: 'scale(0.94)'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
          {card.title}
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          {card.description}
        </div>
      </div>
    </div>
  ));
};
