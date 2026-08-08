import { configureStore } from '@reduxjs/toolkit';
import childrenReducer from './slices/childrenSlice';
import childProfileReducer from './slices/childProfileSlice';
import profileReducer from './slices/profileSlice';
import authReducer from './slices/authSlice';
import supportTicketsReducer from './slices/supportTicketsSlice';
import adminAnalyticsReducer from './slices/adminAnalyticsSlice';
import plansReducer from './slices/plansSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    children: childrenReducer, 
    childProfile: childProfileReducer,
    profile: profileReducer,
    supportTickets: supportTicketsReducer,
    adminAnalytics: adminAnalyticsReducer,
    plans: plansReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;