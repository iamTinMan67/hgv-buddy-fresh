import { lazy } from 'react';

// Dynamic imports for all major components
export const DynamicComponents = {
  // Dashboard and Core Components
  Dashboard: lazy(() => import('../components/Dashboard')),
  Layout: lazy(() => import('../components/Layout/Layout')),
  Login: lazy(() => import('../pages/Auth/Login')),
  
  // Hub Components
  PlanningHub: lazy(() => import('../components/PlanningHub')),
  FleetManagementHub: lazy(() => import('../components/FleetManagementHub')),
  LegalHub: lazy(() => import('../components/LegalHub')),
  DriverHub: lazy(() => import('../components/DriverHub')),
  StaffManagement: lazy(() => import('../components/StaffManagement')),
  ReportsHub: lazy(() => import('../components/ReportsHub')),
  AccountingHub: lazy(() => import('../components/AccountingHub')),
  ClientHub: lazy(() => import('../components/ClientHub')),
  JobAssignmentHub: lazy(() => import('../components/JobAssignmentHub')),
  CompanyInfo: lazy(() => import('../components/CompanyInfo')),
  
  // Management Components
  FleetManagement: lazy(() => import('../components/FleetManagement')),
  DriverManagement: lazy(() => import('../components/DriverManagement')),
  DriverDashboard: lazy(() => import('../components/DriverDashboard')),
  DriverDetails: lazy(() => import('../components/DriverDetails')),
  DriverPlanner: lazy(() => import('../components/DriverPlanner')),
  DriverVehicleAllocationView: lazy(() => import('../components/DriverVehicleAllocationView')),
  
  // Planning and Route Components
  DailyPlanner: lazy(() => import('../components/DailyPlanner')),
  RoutePlanning: lazy(() => import('../components/RoutePlanning')),
  GarminRoutePlanning: lazy(() => import('../components/GarminRoutePlanning')),
  TrailerPlanner: lazy(() => import('../components/TrailerPlanner')),
  TrailerPlotter: lazy(() => import('../components/TrailerPlotter')),
  LoadMap: lazy(() => import('../components/LoadMap')),
  
  // Job and Assignment Components
  JobAllocationForm: lazy(() => import('../components/JobAllocationForm')),
  JobAssignment: lazy(() => import('../components/JobAssignment')),
  
  // Client and Invoice Components
  ClientContacts: lazy(() => import('../components/ClientContacts')),
  ClientInvoices: lazy(() => import('../components/ClientInvoices')),
  InvoiceUpload: lazy(() => import('../components/InvoiceUpload')),
  
  // Reports Components
  Reports: lazy(() => import('../components/Reports')),
  FuelReport: lazy(() => import('../components/reports/FuelReport')),
  InvoicesReport: lazy(() => import('../components/reports/InvoicesReport')),
  ManifestsReport: lazy(() => import('../components/reports/ManifestsReport')),
  PurchaseOrdersReport: lazy(() => import('../components/reports/PurchaseOrdersReport')),
  WageSlipsReport: lazy(() => import('../components/reports/WageSlipsReport')),
  
  // Other Components
  Timesheet: lazy(() => import('../components/Timesheet')),
  VehicleCheckSheet: lazy(() => import('../components/VehicleCheckSheet')),
  FuelManagement: lazy(() => import('../components/FuelManagement')),
  WageManagement: lazy(() => import('../components/WageManagement')),
  ComplianceTracking: lazy(() => import('../components/ComplianceTracking')),
  HolidayPlanner: lazy(() => import('../components/HolidayPlanner')),
  BookKeeping: lazy(() => import('../components/BookKeeping')),
  InteractiveStatusChip: lazy(() => import('../components/InteractiveStatusChip')),
};

// Preloading functions for better performance
export const preloadComponent = (componentName: keyof typeof DynamicComponents) => {
  const component = DynamicComponents[componentName];
  if (component && typeof component === 'object') {
    // For React.lazy components, we can't directly trigger loading
    // The component will load when it's first rendered
    console.log(`Component ${componentName} is available for loading`);
  }
};

// Preload commonly used components
export const preloadCommonComponents = () => {
  // Note: React.lazy components are loaded automatically when first rendered
  // This function is kept for future optimization strategies
  console.log('Common components will be loaded on demand');
};

// Loading component for Suspense fallback
export const LoadingSpinner = (): JSX.Element => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <div className="loading-text">Loading...</div>
  </div>
);

// Enhanced loading component with progress
export const LoadingWithProgress = ({ progress = 0 }: { progress?: number }): JSX.Element => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <div className="loading-text">Loading... {progress}%</div>
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${progress}%` }}></div>
    </div>
  </div>
);

// Error boundary component for dynamic imports
export const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }): JSX.Element => (
  <div className="error-fallback">
    <h3>Something went wrong</h3>
    <p>{error.message}</p>
    <button onClick={resetErrorBoundary} className="retry-button">
      Try again
    </button>
  </div>
);

// Utility to check if a component is loaded
export const isComponentLoaded = (componentName: keyof typeof DynamicComponents): boolean => {
  const component = DynamicComponents[componentName];
  return component && typeof component === 'object' && '_result' in component;
};
