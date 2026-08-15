import { describe, it, expect, vi, beforeEach } from 'vitest';
import adminDoctorsReducer, {
  fetchDoctorDetailsByAdmin,
  acceptPendingDoctorDocuments,
  rejectPendingDoctorDocuments,
  clearSelectedDoctor,
  type AdminDoctorsState,
} from './adminDoctorsSlice';
import * as adminApi from '../../../api/adminApi';

vi.mock('../../../api/adminApi', () => ({
  getDoctorDetailsByAdminApi: vi.fn(),
  acceptPendingDoctorDocumentsApi: vi.fn(),
  rejectPendingDoctorDocumentsApi: vi.fn(),
}));

describe('adminDoctorsSlice reducer & thunk', () => {
  const initialState: AdminDoctorsState = {
    selectedDoctor: null,
    isDetailsLoading: false,
    detailsError: null,
    isActionLoading: false,
  };

  const sampleDoctorDetails: adminApi.AdminDoctorDetails = {
    id: 101,
    userId: 'doc-user-123',
    fullName: 'د. محمد أحمد',
    email: 'doctor@example.com',
    phoneNumber: '01012345678',
    gender: 0,
    age: 40,
    isApproved: true,
    yearsOfExperience: 10,
    clinicName: 'عيادة الأمل',
    professionalBio: 'طبيب تخاطب استشاري',
    practiceLicenseUrl: 'https://example.com/license.png',
    syndicateCardUrl: 'https://example.com/syndicate.png',
    pendingPracticeLicenseUrl: 'https://example.com/new-license.png',
    pendingSyndicateCardUrl: 'https://example.com/new-syndicate.png',
    hasPendingDocuments: true,
    createdAt: '2026-08-15T20:57:23Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state when passed unknown action', () => {
    const state = adminDoctorsReducer(undefined, { type: 'unknown' });
    expect(state).toEqual(initialState);
  });

  it('should clear selected doctor on clearSelectedDoctor action', () => {
    const activeState: AdminDoctorsState = {
      selectedDoctor: sampleDoctorDetails,
      isDetailsLoading: false,
      detailsError: 'error',
      isActionLoading: false,
    };

    const state = adminDoctorsReducer(activeState, clearSelectedDoctor());

    expect(state.selectedDoctor).toBeNull();
    expect(state.detailsError).toBeNull();
    expect(state.isDetailsLoading).toBe(false);
  });

  it('should promote pending documents to active on acceptPendingDoctorDocuments.fulfilled', () => {
    const activeState: AdminDoctorsState = {
      selectedDoctor: { ...sampleDoctorDetails },
      isDetailsLoading: false,
      detailsError: null,
      isActionLoading: true,
    };

    const action = {
      type: acceptPendingDoctorDocuments.fulfilled.type,
      payload: { userId: 'doc-user-123', data: {} },
    };

    const state = adminDoctorsReducer(activeState, action);

    expect(state.isActionLoading).toBe(false);
    expect(state.selectedDoctor?.practiceLicenseUrl).toBe('https://example.com/new-license.png');
    expect(state.selectedDoctor?.syndicateCardUrl).toBe('https://example.com/new-syndicate.png');
    expect(state.selectedDoctor?.pendingPracticeLicenseUrl).toBeNull();
    expect(state.selectedDoctor?.pendingSyndicateCardUrl).toBeNull();
    expect(state.selectedDoctor?.hasPendingDocuments).toBe(false);
  });

  it('should discard pending documents on rejectPendingDoctorDocuments.fulfilled', () => {
    const activeState: AdminDoctorsState = {
      selectedDoctor: { ...sampleDoctorDetails },
      isDetailsLoading: false,
      detailsError: null,
      isActionLoading: true,
    };

    const action = {
      type: rejectPendingDoctorDocuments.fulfilled.type,
      payload: { userId: 'doc-user-123', data: {} },
    };

    const state = adminDoctorsReducer(activeState, action);

    expect(state.isActionLoading).toBe(false);
    expect(state.selectedDoctor?.practiceLicenseUrl).toBe('https://example.com/license.png');
    expect(state.selectedDoctor?.syndicateCardUrl).toBe('https://example.com/syndicate.png');
    expect(state.selectedDoctor?.pendingPracticeLicenseUrl).toBeNull();
    expect(state.selectedDoctor?.pendingSyndicateCardUrl).toBeNull();
    expect(state.selectedDoctor?.hasPendingDocuments).toBe(false);
  });

  describe('fetchDoctorDetailsByAdmin thunk execution', () => {
    it('dispatches fulfilled when API succeeds', async () => {
      vi.mocked(adminApi.getDoctorDetailsByAdminApi).mockResolvedValueOnce(sampleDoctorDetails);

      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await fetchDoctorDetailsByAdmin('doc-user-123')(dispatch, getState, undefined);

      expect(result.type).toBe('adminDoctors/fetchDetails/fulfilled');
      expect(result.payload).toEqual(sampleDoctorDetails);
    });
  });
});
