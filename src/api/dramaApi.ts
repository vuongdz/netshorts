// API Service for fetching drama data from NetShort
import { TheatersResponse, TheaterSection, DramaItem, ForYouResponse, SearchResponse, DramaDetailResponse } from '@/src/types';

// Base URL for NetShort API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Generic fetch wrapper with error handling
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Accept': '*/*',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Drama API Functions
export const dramaApi = {


  /**
   * Search dramas by query
   * @param query - Search query
   * @param page - Page number (default: 1)
   */
  search: (query: string, page: number = 1): Promise<SearchResponse> =>
    fetchApi(`/search?query=${encodeURIComponent(query)}&page=${page}`),

  /**
   * Get all episodes for a drama
   * @param shortPlayId - Drama ID
   */
  getAllEpisodes: (shortPlayId: string): Promise<DramaDetailResponse> =>
    fetchApi(`/allepisode?shortPlayId=${shortPlayId}`),

};

export default dramaApi;


