import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDoctorChildrenApi, getChildProfileApi, getSpeechLevelsApi, type Child, type GetChildrenQueryParams } from '../../api/doctorApi'; 
import { getParentChildrenApi } from '../../api/parentApi';

interface ChildrenState {
  children: Child[]; 
  isLoading: boolean;
  error: string | null;
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  searchQuery: string;
}

const initialState: ChildrenState = {
  children: [],
  isLoading: false,
  error: null,
  pageNumber: 1,
  totalPages: 1,
  totalCount: 0,
  hasPreviousPage: false,
  hasNextPage: false,
  searchQuery: '',
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

function extractPaginatedData(data: any, reqPage = 1) {
  let rawItems: Child[] = [];
  let pageNumber = reqPage;
  let totalPages = 1;
  let totalCount = 0;
  let hasPreviousPage = false;
  let hasNextPage = false;

  if (data) {
    if (Array.isArray(data)) {
      rawItems = data;
      totalCount = data.length;
    } else if (data.items && Array.isArray(data.items)) {
      rawItems = data.items;
      pageNumber = data.pageNumber || reqPage;
      totalPages = data.totalPages || 1;
      totalCount = data.totalCount || rawItems.length;
      hasPreviousPage = !!data.hasPreviousPage;
      hasNextPage = !!data.hasNextPage;
    } else if (data.value) {
      if (Array.isArray(data.value)) {
        rawItems = data.value;
        totalCount = data.value.length;
      } else if (data.value.items && Array.isArray(data.value.items)) {
        rawItems = data.value.items;
        pageNumber = data.value.pageNumber || reqPage;
        totalPages = data.value.totalPages || 1;
        totalCount = data.value.totalCount || rawItems.length;
        hasPreviousPage = !!data.value.hasPreviousPage;
        hasNextPage = !!data.value.hasNextPage;
      }
    }
  }

  return { rawItems, pageNumber, totalPages, totalCount, hasPreviousPage, hasNextPage };
}

// جلب أطفال الطبيب مع Pagination والبحث
export const fetchChildren = createAsyncThunk(
  'children/fetchChildren',
  async (params: GetChildrenQueryParams | undefined, { rejectWithValue }) => {
    try {
      const data = await getDoctorChildrenApi(params);
      const parsed = extractPaginatedData(data, params?.pageNumber || 1);
      const enriched = await enrichChildrenWithLevels(parsed.rawItems);
      return {
        items: enriched,
        pageNumber: parsed.pageNumber,
        totalPages: parsed.totalPages,
        totalCount: parsed.totalCount,
        hasPreviousPage: parsed.hasPreviousPage,
        hasNextPage: parsed.hasNextPage,
      };
    } catch (error) {
      console.error('Error fetching doctor children:', error);
      return rejectWithValue('فشل الاتصال بالخادم');
    }
  }
);

// جلب أطفال ولي الأمر مع Pagination والبحث
export const fetchParentChildren = createAsyncThunk(
  'children/fetchParentChildren',
  async (params: GetChildrenQueryParams | undefined, { rejectWithValue }) => {
    try {
      const data = await getParentChildrenApi(params);
      const parsed = extractPaginatedData(data, params?.pageNumber || 1);
      const enriched = await enrichChildrenWithLevels(parsed.rawItems);
      return {
        items: enriched,
        pageNumber: parsed.pageNumber,
        totalPages: parsed.totalPages,
        totalCount: parsed.totalCount,
        hasPreviousPage: parsed.hasPreviousPage,
        hasNextPage: parsed.hasNextPage,
      };
    } catch (error) {
      console.error('Error fetching parent children:', error);
      return rejectWithValue('فشل الاتصال بالخادم');
    }
  }
);

const childrenSlice = createSlice({
  name: 'children',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // أطفال الطبيب
      .addCase(fetchChildren.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChildren.fulfilled, (state, action) => {
        state.isLoading = false;
        state.children = action.payload.items;
        state.pageNumber = action.payload.pageNumber;
        state.totalPages = action.payload.totalPages;
        state.totalCount = action.payload.totalCount;
        state.hasPreviousPage = action.payload.hasPreviousPage;
        state.hasNextPage = action.payload.hasNextPage;
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
        state.children = action.payload.items;
        state.pageNumber = action.payload.pageNumber;
        state.totalPages = action.payload.totalPages;
        state.totalCount = action.payload.totalCount;
        state.hasPreviousPage = action.payload.hasPreviousPage;
        state.hasNextPage = action.payload.hasNextPage;
      })
      .addCase(fetchParentChildren.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSearchQuery } = childrenSlice.actions;
export default childrenSlice.reducer;