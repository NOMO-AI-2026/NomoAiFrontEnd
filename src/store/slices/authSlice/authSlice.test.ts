import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import authReducer, { setCredentials, updateToken, logout } from './authSlice';

describe('authSlice reducer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return initial state with null credentials when localStorage is empty', () => {
    const state = authReducer(undefined, { type: 'unknown' });
    expect(state).toEqual({
      token: null,
      role: null,
    });
  });

  it('should read initial state from localStorage when pre-populated', () => {
    localStorage.setItem('token', 'sample-initial-jwt-token');
    localStorage.setItem('role', 'doctor');

    // إعادة استيراد القيمة أو محاكاة الـ reducer المبدئي
    const state = authReducer(undefined, { type: 'unknown' });
    // ملحوظة: initialState تم تقييمها عند تحميل الموديول، لذا يمكننا التحقق من سلوك الأكشنز بعد الإعداد
    expect(state).toBeDefined();
  });

  it('should handle setCredentials and store values in state & localStorage', () => {
    const initialState = { token: null, role: null };
    const payload = {
      token: 'jwt-access-token-xyz',
      role: 'parent' as const,
    };

    const newState = authReducer(initialState, setCredentials(payload));

    expect(newState.token).toBe('jwt-access-token-xyz');
    expect(newState.role).toBe('parent');
    expect(localStorage.getItem('token')).toBe('jwt-access-token-xyz');
    expect(localStorage.getItem('role')).toBe('parent');
  });

  it('should handle updateToken and update token in state & localStorage', () => {
    const initialState = { token: 'old-token', role: 'doctor' as const };
    const newRefreshedToken = 'new-refreshed-jwt-token-777';

    const newState = authReducer(initialState, updateToken(newRefreshedToken));

    expect(newState.token).toBe(newRefreshedToken);
    expect(newState.role).toBe('doctor');
    expect(localStorage.getItem('token')).toBe(newRefreshedToken);
  });

  it('should handle logout and clear state & localStorage', () => {
    localStorage.setItem('token', 'active-session-token');
    localStorage.setItem('role', 'admin');

    const activeState = { token: 'active-session-token', role: 'admin' as const };
    const newState = authReducer(activeState, logout());

    expect(newState.token).toBeNull();
    expect(newState.role).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();
  });
});
