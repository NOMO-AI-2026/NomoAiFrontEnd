import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDoctorChildrenApi, getChildProfileApi, getSpeechLevelsApi, type Child } from '../../api/doctorApi'; 
import { getParentChildrenApi } from '../../api/parentApi';

interface ChildrenState {
  children: Child[]; 
  isLoading: boolean;
  error: string | null;
}

const initialState: ChildrenState = {
  children: [],
  isLoading: false,
  error: null,
};

// دالة مساعدة لجلب مستويات الكلام الحقيقية للأطفال من خلال /children/{id} و /speech-levels
async function enrichChildrenWithLevels(rawChildren: Child[]): Promise<Child[]> {
  try {
    let levelsList: any[] = [];
    try {
      const levelsData = await getSpeechLevelsApi();
      levelsList = Array.isArray(levelsData) ? levelsData : (levelsData?.value || levelsData?.items || []);
    } catch (e) {
      console.warn('Could not fetch speech levels list:', e);
    }

    const enriched = await Promise.all(
      rawChildren.map(async (child) => {
        try {
          const profile = await getChildProfileApi(child.id);
          if (profile && profile.speechLevel) {
            let levelNum = 0;
            if (levelsList.length > 0) {
              const idx = levelsList.findIndex((l: any) => l.id === profile.speechLevel?.id);
              if (idx !== -1) {
                levelNum = idx + 1;
              }
            }
            if (!levelNum) {
              levelNum = profile.speechLevel.id || 0;
            }
            return {
              ...child,
              speechLevelNumber: levelNum,
              speechLevelName: profile.speechLevel.levelName,
              speechLevel: profile.speechLevel,
            };
          }
        } catch (e) {
          console.warn(`Could not fetch profile for child ${child.id}:`, e);
        }
        return child;
      })
    );
    return enriched;
  } catch (error) {
    console.error('Error enriching children:', error);
    return rawChildren;
  }
}

// جلب أطفال الطبيب
export const fetchChildren = createAsyncThunk(
  'children/fetchChildren',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getDoctorChildrenApi();
      if (data.isSuccess && Array.isArray(data.value)) {
        const enriched = await enrichChildrenWithLevels(data.value);
        return enriched;
      }
      return rejectWithValue(data.error?.description || 'حدث خطأ غير معروف');
    } catch (error) {
      console.error('Error fetching children:', error);
      return rejectWithValue('فشل الاتصال بالخادم');
    }
  }
);

// جلب أطفال ولي الأمر
export const fetchParentChildren = createAsyncThunk(
  'children/fetchParentChildren',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getParentChildrenApi();
      if (Array.isArray(data)) {
        const enriched = await enrichChildrenWithLevels(data);
        return enriched;
      }
      return data;
    } catch (error) {
      console.error('Error fetching parent children:', error);
      return rejectWithValue('فشل الاتصال بالخادم');
    }
  }
);

const childrenSlice = createSlice({
  name: 'children',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // أطفال الطبيب
      .addCase(fetchChildren.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChildren.fulfilled, (state, action) => {
        state.isLoading = false;
        state.children = action.payload; 
      })
      .addCase(fetchChildren.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // أطفال ولي الأمر
      .addCase(fetchParentChildren.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchParentChildren.fulfilled, (state, action) => {
        state.isLoading = false;
        state.children = action.payload; 
      })
      .addCase(fetchParentChildren.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default childrenSlice.reducer;