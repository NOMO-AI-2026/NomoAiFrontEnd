import { configureStore } from '@reduxjs/toolkit';
import childrenReducer from './slices/childrenSlice';
import childProfileReducer from './slices/childProfileSlice';
export const store = configureStore({
  reducer: {
    children: childrenReducer, 
    childProfile: childProfileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;