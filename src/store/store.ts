import { configureStore } from '@reduxjs/toolkit';
import childrenReducer from './slices/childrenSlice';
import childProfileReducer from './slices/childProfileSlice';
import profileReducer from './slices/profileSlice';
export const store = configureStore({
  reducer: {
    children: childrenReducer, 
    childProfile: childProfileReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;