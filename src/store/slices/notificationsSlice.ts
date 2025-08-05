import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  type: 'driver_update' | 'vehicle_alert' | 'system_alert' | 'eta_update' | 'fuel_alert' | 'maintenance_alert' | 'compliance_alert' | 'job_update';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
  source: {
    driverId?: string;
    driverName?: string;
    vehicleId?: string;
    vehicleRegistration?: string;
    jobId?: string;
  };
  metadata?: {
    location?: string;
    speed?: number;
    fuelLevel?: number;
    eta?: string;
    distance?: number;
    weather?: string;
    traffic?: string;
    engineHours?: number;
  };
  actions?: Array<{
    label: string;
    action: string;
    url?: string;
  }>;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  lastUpdate: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  lastUpdate: null,
};

// Mock API calls - replace with real API endpoints
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'driver_update',
        title: 'Driver Status Update',
        message: 'John Smith (AB12 CDE) has started their journey to London Distribution Center',
        severity: 'info',
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        read: false,
        source: {
          driverId: 'D001',
          driverName: 'John Smith',
          vehicleId: 'V001',
          vehicleRegistration: 'AB12 CDE',
          jobId: 'J001',
        },
        metadata: {
          location: 'Manchester City Centre, UK',
          speed: 45,
          eta: '2024-06-01T18:30:00Z',
          distance: 180,
        },
        actions: [
          { label: 'View Tracking', action: 'view_tracking', url: '/driver/tracking' },
          { label: 'Contact Driver', action: 'contact_driver' },
        ],
      },
      {
        id: '2',
        type: 'fuel_alert',
        title: 'Low Fuel Alert',
        message: 'Vehicle CD34 FGH fuel level is below 25% (45% remaining)',
        severity: 'warning',
        timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
        read: false,
        source: {
          driverId: 'D002',
          driverName: 'Sarah Johnson',
          vehicleId: 'V002',
          vehicleRegistration: 'CD34 FGH',
        },
        metadata: {
          location: 'Birmingham City Centre, UK',
          fuelLevel: 45,
        },
        actions: [
          { label: 'Find Fuel Station', action: 'find_fuel' },
          { label: 'Contact Driver', action: 'contact_driver' },
        ],
      },
      {
        id: '3',
        type: 'eta_update',
        title: 'ETA Updated',
        message: 'Vehicle AB12 CDE ETA updated to 18:30 due to traffic conditions',
        severity: 'info',
        timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
        read: true,
        source: {
          driverId: 'D001',
          driverName: 'John Smith',
          vehicleId: 'V001',
          vehicleRegistration: 'AB12 CDE',
          jobId: 'J001',
        },
        metadata: {
          eta: '2024-06-01T18:30:00Z',
          traffic: 'Moderate traffic on M6',
        },
        actions: [
          { label: 'View Details', action: 'view_details' },
        ],
      },
      {
        id: '4',
        type: 'vehicle_alert',
        title: 'Vehicle Offline',
        message: 'Vehicle GH78 LMN has been offline for more than 1 hour',
        severity: 'error',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        read: false,
        source: {
          driverId: 'D004',
          driverName: 'Lisa Brown',
          vehicleId: 'V004',
          vehicleRegistration: 'GH78 LMN',
        },
        metadata: {
          location: 'Edinburgh, UK',
        },
        actions: [
          { label: 'Contact Driver', action: 'contact_driver' },
          { label: 'Check Location', action: 'check_location' },
        ],
      },
      {
        id: '5',
        type: 'maintenance_alert',
        title: 'Maintenance Due',
        message: 'Scheduled maintenance due for vehicle EF56 IJK',
        severity: 'warning',
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        read: true,
        source: {
          vehicleId: 'V003',
          vehicleRegistration: 'EF56 IJK',
        },
        actions: [
          { label: 'Schedule Maintenance', action: 'schedule_maintenance' },
          { label: 'View Vehicle', action: 'view_vehicle' },
        ],
      },
      {
        id: '6',
        type: 'compliance_alert',
        title: 'Driver Hours Warning',
        message: 'Mike Wilson approaching maximum driving hours (8.5/9 hours)',
        severity: 'warning',
        timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
        read: false,
        source: {
          driverId: 'D003',
          driverName: 'Mike Wilson',
          vehicleId: 'V003',
          vehicleRegistration: 'EF56 IJK',
        },
        metadata: {
          engineHours: 8.5,
        },
        actions: [
          { label: 'Plan Rest Stop', action: 'plan_rest' },
          { label: 'Contact Driver', action: 'contact_driver' },
        ],
      },
    ];

    return mockNotifications;
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return notificationId;
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return notificationId;
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
      state.lastUpdate = new Date().toISOString();
    },
    updateNotification: (state, action: PayloadAction<{ id: string; updates: Partial<Notification> }>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        const wasRead = state.notifications[index].read;
        state.notifications[index] = { ...state.notifications[index], ...action.payload.updates };
        const isNowRead = state.notifications[index].read;
        
        if (!wasRead && isNowRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else if (wasRead && !isNowRead) {
          state.unreadCount += 1;
        }
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    setLastUpdate: (state, action: PayloadAction<string>) => {
      state.lastUpdate = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.read).length;
        state.lastUpdate = new Date().toISOString();
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch notifications';
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => n.read = true);
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n.id === action.payload);
        if (index !== -1) {
          const wasRead = state.notifications[index].read;
          state.notifications.splice(index, 1);
          if (!wasRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      });
  },
});

export const { addNotification, updateNotification, clearNotifications, setLastUpdate } = notificationsSlice.actions;
export default notificationsSlice.reducer; 