import { configureStore } from '@reduxjs/toolkit';
import childrenReducer from './slices/childrenSlice/childrenSlice';
import childProfileReducer from './slices/childProfileSlice/childProfileSlice';
import profileReducer from './slices/profileSlice';
import authReducer from './slices/authSlice/authSlice';
import supportTicketsReducer from './slices/supportTicketsSlice';
import adminAnalyticsReducer from './slices/adminAnalyticsSlice/adminAnalyticsSlice';
import plansReducer from './slices/plansSlice';
import paymentReducer from './slices/paymentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    children: childrenReducer, 
    childProfile: childProfileReducer,
    profile: profileReducer,
    supportTickets: supportTicketsReducer,
    adminAnalytics: adminAnalyticsReducer,
    plans: plansReducer,
    payment: paymentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;