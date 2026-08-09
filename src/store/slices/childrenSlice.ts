import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
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

interface SpeechLevelItem {
  id: number;
  levelName?: string;
  name?: string;
}

interface GenericPaginatedResponse<T> {
  items?: T[];
  pageNumber?: number;
  totalPages?: number;
  totalCount?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  value?: T[] | GenericPaginatedResponse<T>;
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
    let levelsList: SpeechLevelItem[] = [];
    try {
      const levelsData = await getSpeechLevelsApi() as unknown as GenericPaginatedResponse<SpeechLevelItem> | SpeechLevelItem[];
      if (Array.isArray(levelsData)) {
        levelsList = levelsData;
      } else if (levelsData) {
        if (Array.isArray(levelsData.value)) {
          levelsList = levelsData.value;
        } else if (typeof levelsData.value === 'object' && levelsData.value !== null && 'items' in levelsData.value) {
          const valObj = levelsData.value as GenericPaginatedResponse<SpeechLevelItem>;
          if (Array.isArray(valObj.items)) {
            levelsList = valObj.items;
          }
        } else if (levelsData.items && Array.isArray(levelsData.items)) {
          levelsList = levelsData.items;
        }
      }
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
              const idx = levelsList.findIndex((l: SpeechLevelItem) => l.id === profile.speechLevel?.id);
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

function extractPaginatedData(data: unknown, reqPage = 1) {
  let rawItems: Child[] = [];
  let pageNumber = reqPage;
  let totalPages = 1;
  let totalCount = 0;
  let hasPreviousPage = false;
  let hasNextPage = false;

  const res = data as GenericPaginatedResponse<Child>;

  if (res) {
    if (Array.isArray(res)) {
      rawItems = res;
      totalCount = res.length;
    } else if (res.items && Array.isArray(res.items)) {
      rawItems = res.items;
      pageNumber = res.pageNumber || reqPage;
      totalPages = res.totalPages || 1;
      totalCount = res.totalCount || rawItems.length;
      hasPreviousPage = !!res.hasPreviousPage;
      hasNextPage = !!res.hasNextPage;
    } else if (res.value) {
      if (Array.isArray(res.value)) {
        rawItems = res.value;
        totalCount = res.value.length;
      } else if (typeof res.value === 'object' && res.value !== null && 'items' in res.value) {
        const valObj = res.value as GenericPaginatedResponse<Child>;
        if (valObj.items && Array.isArray(valObj.items)) {
          rawItems = valObj.items;
          pageNumber = valObj.pageNumber || reqPage;
          totalPages = valObj.totalPages || 1;
          totalCount = valObj.totalCount || rawItems.length;
          hasPreviousPage = !!valObj.hasPreviousPage;
          hasNextPage = !!valObj.hasNextPage;
        }
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
    } catch (error: unknown) {
      console.error('Error fetching doctor children:', error);
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'فشل الاتصال بالخادم');
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
    } catch (error: unknown) {
      console.error('Error fetching parent children:', error);
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'فشل الاتصال بالخادم');
    }
  }
);

const childrenSlice = createSlice({
  name: 'children',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
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