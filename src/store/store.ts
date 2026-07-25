import { configureStore } from '@reduxjs/toolkit';
import childrenReducer from './slices/childrenSlice';
import childProfileReducer from './slices/childProfileSlice';
import profileReducer from './slices/profileSlice';
import authReducer from './slices/authSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    children: childrenReducer, 
    childProfile: childProfileReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;