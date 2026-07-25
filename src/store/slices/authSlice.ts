import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  role: 'doctor' | 'parent' | 'admin' | null;
}

// هنا السحر: نأخذ القيمة المبدئية من اللوكال ستوريج مباشرة
const initialState: AuthState = {
  token: localStorage.getItem('token'),
  role: (localStorage.getItem('role') as AuthState['role']) || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // تتنفذ وقت الـ Login
    setCredentials: (state, action: PayloadAction<{ token: string; role: AuthState['role']}>) => {
      state.token = action.payload.token;
      state.role = action.payload.role;
      
      // حفظهم في اللوكال ستوريج عشان الـ Refresh
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('role', action.payload.role as string);
    },
    // تتنفذ وقت الـ Logout
    logout: (state) => {
      state.token = null;
      state.role = null;
      
      // مسحهم من اللوكال ستوريج
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;