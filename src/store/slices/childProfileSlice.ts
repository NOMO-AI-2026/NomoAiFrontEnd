import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getChildProfileApi, 
  getSpeechLevelHistoryApi, 
  getChildNotesApi, 
  deleteDoctorNoteApi, 
  addDoctorNoteApi, 
  updateDoctorNoteApi, 
  getChildActivitiesApi,
  type PaginatedNotesResponse,
  type ActivityItem
} from '../../api/doctorApi';
import { type ChildProfileData, type PaginatedSpeechHistory } from '../../types/child.types';

interface ChildProfileState {
  profileData: ChildProfileData | null;
  isLoading: boolean;
  error: string | null;
  speechHistory: PaginatedSpeechHistory | null;
  isHistoryLoading: boolean;
  historyError: string | null;
  notesData: PaginatedNotesResponse | null;
  isNotesLoading: boolean;
  notesError: string | null;
  activities: ActivityItem[];
  isActivitiesLoading: boolean;
  activitiesError: string | null;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: {
        description?: string;
      };
    };
  };
  message?: string;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  const err = error as ApiError;
  return err.response?.data?.error?.description || err.response?.data?.message || err.message || fallback;
};

const initialState: ChildProfileState = {
  profileData: null,
  isLoading: false,
  error: null,
  speechHistory: null,
  isHistoryLoading: false,
  historyError: null,
  notesData: null,
  isNotesLoading: false,
  notesError: null,
  activities: [],
  isActivitiesLoading: false,
  activitiesError: null,
};

export const fetchChildProfile = createAsyncThunk(
  'childProfile/fetchChildProfile',
  async (id: number, { rejectWithValue }) => {
    try {
      const data = await getChildProfileApi(id);
      return data; 
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'حدث خطأ في جلب بيانات الطفل'));
    }
  }
);

export const fetchSpeechHistory = createAsyncThunk(
  'childProfile/fetchSpeechHistory',
  async ({ childId, pageNumber = 1, pageSize = 10 }: { childId: number; pageNumber?: number; pageSize?: number }, { rejectWithValue }) => {
    try {
      const data = await getSpeechLevelHistoryApi(childId, pageNumber, pageSize);
      if (data.isSuccess) {
        return data.value; 
      }
      return rejectWithValue(data.error?.description || 'حدث خطأ في جلب السجل');
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'حدث خطأ في الاتصال بالخادم'));
    }
  }
);

export const fetchChildNotes = createAsyncThunk(
  'childProfile/fetchChildNotes',
  async ({ childId, pageNumber = 1, pageSize = 5 }: { childId: number; pageNumber?: number; pageSize?: number }, { rejectWithValue }) => {
    try {
      const data = await getChildNotesApi(childId, pageNumber, pageSize);
      if (data && 'value' in data && data.value) {
        return data.value as PaginatedNotesResponse;
      }
      if (data && 'items' in data && Array.isArray((data as PaginatedNotesResponse).items)) {
        return data as PaginatedNotesResponse;
      }
      return {
        items: Array.isArray(data) ? data : [],
        pageNumber: 1,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      };
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'حدث خطأ في جلب الملاحظات'));
    }
  }
);

export const deleteChildNote = createAsyncThunk(
  'childProfile/deleteChildNote',
  async (noteId: number, { rejectWithValue }) => {
    try {
      await deleteDoctorNoteApi(noteId);
      return noteId;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'حدث خطأ في حذف الملاحظة'));
    }
  }
);

export const addChildNote = createAsyncThunk(
  'childProfile/addChildNote',
  async (payload: { childId: number; noteTitle: string; noteContent: string }, { rejectWithValue }) => {
    try {
      const response = await addDoctorNoteApi(payload.childId, {
        noteTitle: payload.noteTitle,
        noteContent: payload.noteContent,
      });
      return response;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'حدث خطأ في إضافة الملاحظة'));
    }
  }
);

export const updateChildNote = createAsyncThunk(
  'childProfile/updateChildNote',
  async (payload: { noteId: number; title: string; description: string }, { rejectWithValue }) => {
    try {
      const response = await updateDoctorNoteApi(payload.noteId, {
        title: payload.title,
        description: payload.description,
      });
      return response;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'حدث خطأ في تعديل الملاحظة'));
    }
  }
);

export const fetchChildActivities = createAsyncThunk(
  'childProfile/fetchChildActivities',
  async (childId: number, { rejectWithValue }) => {
    try {
      const data = await getChildActivitiesApi(childId);
      const activitiesList = Array.isArray(data) ? data : (data?.value || []);
      return activitiesList;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'حدث خطأ في جلب الأنشطة'));
    }
  }
);

const childProfileSlice = createSlice({
  name: 'childProfile',
  initialState,
  reducers: {
    clearProfileData: (state) => {
      state.profileData = null;
      state.speechHistory = null;
      state.notesData = null;
      state.activities = [];
      state.activitiesError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChildProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChildProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profileData = action.payload;
      })
      .addCase(fetchChildProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSpeechHistory.pending, (state) => {
        state.isHistoryLoading = true;
        state.historyError = null;
      })
      .addCase(fetchSpeechHistory.fulfilled, (state, action) => {
        state.isHistoryLoading = false;
        state.speechHistory = action.payload;
      })
      .addCase(fetchSpeechHistory.rejected, (state, action) => {
        state.isHistoryLoading = false;
        state.historyError = action.payload as string;
      })
      .addCase(fetchChildNotes.pending, (state) => {
        state.isNotesLoading = true;
        state.notesError = null;
      })
      .addCase(fetchChildNotes.fulfilled, (state, action) => {
        state.isNotesLoading = false;
        state.notesData = action.payload;
      })
      .addCase(fetchChildNotes.rejected, (state, action) => {
        state.isNotesLoading = false;
        state.notesError = action.payload as string;
      })
      .addCase(deleteChildNote.fulfilled, (state, action) => {
        if (state.notesData && state.notesData.items) {
          state.notesData.items = state.notesData.items.filter((n) => n.id !== action.payload);
        }
      })
      .addCase(fetchChildActivities.pending, (state) => {
        state.isActivitiesLoading = true;
        state.activitiesError = null;
      })
      .addCase(fetchChildActivities.fulfilled, (state, action) => {
        state.isActivitiesLoading = false;
        state.activities = action.payload;
      })
      .addCase(fetchChildActivities.rejected, (state, action) => {
        state.isActivitiesLoading = false;
        state.activitiesError = action.payload as string;
      });
  },
});

export const { clearProfileData } = childProfileSlice.actions;
export default childProfileSlice.reducer;