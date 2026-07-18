import { configureStore } from '@reduxjs/toolkit';
import childrenReducer from './slices/childrenSlice';

export const store = configureStore({
  reducer: {
    children: childrenReducer, 
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;