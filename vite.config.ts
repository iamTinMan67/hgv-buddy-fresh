import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Configure source maps for development
  css: {
    devSourcemap: true
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'redux-vendor': ['react-redux', '@reduxjs/toolkit'],
          
          // Feature chunks
          'dashboard': [
            './src/components/Dashboard.tsx',
            './src/components/Layout/Layout.tsx'
          ],
          'planning': [
            './src/components/PlanningHub.tsx',
            './src/components/DailyPlanner.tsx',
            './src/components/RoutePlanning.tsx',
            './src/components/GarminRoutePlanning.tsx',
            './src/components/TrailerPlanner.tsx',
            './src/components/TrailerPlotter.tsx',
            './src/components/LoadMap.tsx'
          ],
          'fleet': [
            './src/components/FleetManagementHub.tsx',
            './src/components/FleetManagement.tsx',
            './src/components/VehicleCheckSheet.tsx',
            './src/components/FuelManagement.tsx'
          ],
          'drivers': [
            './src/components/DriverHub.tsx',
            './src/components/DriverManagement.tsx',
            './src/components/DriverDashboard.tsx',
            './src/components/DriverDetails.tsx',
            './src/components/DriverPlanner.tsx',
            './src/components/DriverVehicleAllocationView.tsx'
          ],
          'jobs': [
            './src/components/JobAllocationForm.tsx',
            './src/components/JobAssignment.tsx',
            './src/components/JobAssignmentHub.tsx'
          ],
          'reports': [
            './src/components/ReportsHub.tsx',
            './src/components/Reports.tsx',
            './src/components/reports/FuelReport.tsx',
            './src/components/reports/InvoicesReport.tsx',
            './src/components/reports/ManifestsReport.tsx',
            './src/components/reports/PurchaseOrdersReport.tsx',
            './src/components/reports/WageSlipsReport.tsx'
          ],
          'admin': [
            './src/components/StaffManagement.tsx',
            './src/components/AccountingHub.tsx',
            './src/components/BookKeeping.tsx',
            './src/components/WageManagement.tsx',
            './src/components/ComplianceTracking.tsx'
          ],
          'clients': [
            './src/components/ClientHub.tsx',
            './src/components/ClientContacts.tsx',
            './src/components/ClientInvoices.tsx',
            './src/components/InvoiceUpload.tsx'
          ],
          'utils': [
            './src/utils/jobIdGenerator.ts',
            './src/utils/staffIdGenerator.ts',
            './src/utils/dynamicImports.tsx'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false, // Disable source maps in production builds
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@mui/material', '@mui/icons-material']
  }
})