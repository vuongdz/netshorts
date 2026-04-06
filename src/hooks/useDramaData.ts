import { useState, useEffect, useCallback } from 'react';
import { dramaApi } from '@/src/api/dramaApi';
import {
  TheatersResponse,
  SectionData,
  HeroData,
  transformDramaToMovie,
  transformSectionToSectionData
} from '@/src/types';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface UseDramaDataState {
  sections: SectionData[];
  heroData: any;
  loading: boolean;
  error: Error | null;
  allDrama: {
    items: any[];
    nextPage: boolean;
    page: number;
    url: string;
  };
  loadingMore: boolean;
}

interface UseDramaDataReturn extends UseDramaDataState {
  refetch: () => void;
  loadMoreAllData: () => void;
}

let homeDataCache: UseDramaDataState | null = null;

/**
 * Custom hook for fetching and transforming drama data from theaters API
 * Used for Home page
 */
export function useDramaData(): UseDramaDataReturn {
  const [state, setState] = useState<UseDramaDataState>({
    sections: [],
    heroData: null,
    loading: true,
    error: null,
    allDrama: { items: [], nextPage: false, page: 1, url: '' },
    loadingMore: false
  });

  const fetchData = useCallback(async () => {
    if (homeDataCache && homeDataCache.sections.length > 0) {
      setState(homeDataCache);
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const res = await fetch(`${API_BASE_URL}/api/home`);
      const apiResponse = await res.json();

      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to fetch home data');
      }

      // Map hero banner từ apiResponse.data
      let heroData: any = null; // Cố ý để any để bypass interface trong file types.ts
      if (apiResponse.data && apiResponse.data.length > 0) {
        heroData = apiResponse.data.map((item: any) => ({
          id: item.playId,
          title: item.name,
          subtitle: '',
          description: item.intro || 'Khám phá phim ngắn, Kịch tính, Hấp dẫn ngay hôm nay!',
          bgImage: item.thumbnail,
          badge: 'ĐỘC QUYỀN',
        }));
      }

      // Map series thành sections
      const sections: SectionData[] = (apiResponse.series || []).map((s: any, index: number) => ({
        title: s.title,
        layout: 'scroll', // Cưỡng chế tất cả các mục thành vuốt ngang
        showViewAll: s.nextPage,
        items: (s.data || []).map((item: any) => ({
          id: item.playId,
          title: item.name,
          tags: item.labelList ? item.labelList.replace(/ ⦁ /g, ' | ') : 'Drama',
          imageUrl: item.thumbnail,
          badge: item.badge || (index === 0 ? 'XU HƯỚNG' : undefined),
          badgeColor: index === 0 ? 'red' : 'primary',
          heatScore: item.heatScore || undefined,
        }))
      }));

      // Map all data
      let allDramaState = { items: [], nextPage: false, page: 1, url: '' };
      if (apiResponse.all) {
        allDramaState = {
          items: (apiResponse.all.data || []).map((item: any) => ({
            id: item.playId,
            title: item.name,
            tags: item.labelList ? item.labelList.replace(/ ⦁ /g, ' | ') : 'Drama',
            imageUrl: item.thumbnail,
          })),
          nextPage: apiResponse.all.nextPage,
          page: apiResponse.all.page,
          url: apiResponse.all.url
        };
      }

      const newState = {
        sections,
        heroData,
        loading: false,
        error: null,
        allDrama: allDramaState,
        loadingMore: false
      };

      homeDataCache = newState;
      setState(newState);
    } catch (error) {
      setState(prev => ({
        ...prev,
        sections: [],
        heroData: null,
        loading: false,
        error: error instanceof Error ? error : new Error('Failed to fetch drama data')
      }));
    }
  }, []);

  const loadMoreAllData = useCallback(() => {
    setState(prev => {
      if (!prev.allDrama.nextPage || prev.loadingMore || !prev.allDrama.url) return prev;
      
      const doFetch = async () => {
        try {
          const fetchUrl = `${API_BASE_URL}/api/loadmore?page=${prev.allDrama.page}&url=${encodeURIComponent(prev.allDrama.url)}`;
          const res = await fetch(fetchUrl);
          const data = await res.json();
          
          if (data.success && data.data) {
            setState(current => {
              const updated = {
                ...current,
                loadingMore: false,
                allDrama: {
                  ...current.allDrama,
                  items: [...current.allDrama.items, ...data.data.map((item: any) => ({
                    id: item.playId,
                    title: item.name,
                    tags: item.labelList ? item.labelList.replace(/ ⦁ /g, ' | ') : 'Drama',
                    imageUrl: item.thumbnail,
                  }))],
                  page: data.page,
                  nextPage: data.nextPage
                }
              };
              homeDataCache = updated;
              return updated;
            });
          } else {
             setState(current => ({ ...current, loadingMore: false }));
          }
        } catch (e) {
          console.error('Failed to load more', e);
          setState(current => ({ ...current, loadingMore: false }));
        }
      };
      
      doFetch();
      return { ...prev, loadingMore: true };
    });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
    loadMoreAllData
  };
}

/**
 * Transform API theaters response to SectionData array for components
 */
function transformTheatersToSections(theaters: TheatersResponse): SectionData[] {
  const layoutMap: Record<string, 'scroll' | 'grid'> = {
    'premium_drama': 'scroll',
    'top_short_dramas': 'scroll',
    'dubbed': 'scroll',
    'coming_soon': 'scroll',
    'rankings': 'grid',
  };

  return theaters.map(section => {
    const layout = layoutMap[section.contentRemark] || 'grid';
    return transformSectionToSectionData(section, layout);
  });
}

/**
 * Extract hero data from theaters response
 */
function extractHeroData(theaters: TheatersResponse): HeroData | null {
  if (!theaters.length || !theaters[0].contentInfos.length) {
    return null;
  }

  const firstSection = theaters[0];
  const topDrama = firstSection.contentInfos.reduce((max, item) =>
    item.heatScore > max.heatScore ? item : max
  );

  const name = topDrama.shortPlayName;
  let title = name;
  let subtitle = '';

  const splitPatterns = [' Cho ', ' Và ', ' hoặc ', ' ở '];
  for (const pattern of splitPatterns) {
    if (name.includes(pattern)) {
      const parts = name.split(pattern);
      title = parts[0];
      subtitle = pattern.trim() + ' ' + parts.slice(1).join(pattern);
      break;
    }
  }

  if (!subtitle && name.split(' ').length > 3) {
    const words = name.split(' ');
    title = words.slice(0, Math.ceil(words.length / 2)).join(' ');
    subtitle = words.slice(Math.ceil(words.length / 2)).join(' ');
  }

  const labels = topDrama.labelArray;
  let description = '';
  if (labels.length > 0) {
    description = `Một câu chuyện ${labels[0]?.toLowerCase() || 'sôi động'} đầy ${labels[1]?.toLowerCase() || 'cảm xúc'} và ${labels[2]?.toLowerCase() || 'bất ngờ'}. Xem ngay để tận hưởng trải nghiệm khó quên!`;
  } else {
    description = `Phim nổi bật với lượt xem khủng. Xem ngay để khám phá câu chuyện cuốn hút này!`;
  }

  return {
    title,
    subtitle,
    description,
    bgImage: topDrama.highImage || topDrama.shortPlayCover || topDrama.groupShortPlayCover,
    badge: topDrama.scriptName === 'Baru' ? 'NEW' : 'HOT',
  };
}

export default useDramaData;
