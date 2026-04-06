// Types for NetShort API Response

// Individual drama/short play item
export interface DramaItem {
  id: string | null;
  shortPlayId: string;
  shortPlayLibraryId: string;
  shortPlayName: string;
  shortPlayLabels: string;
  labelArray: string[];
  isNewLabel: boolean;
  labelLanguageIds: string[];
  shortPlayCover: string;
  groupShortPlayCover: string;
  contentModel: number | null;
  isChase: boolean;
  script: number;
  scriptName: string | null;
  scriptType: number;
  heatScore: number;
  heatScoreShow: string | null;
  totalReserveNum: string;
  isReserve: number;
  publishTime: number;
  expGroup: string | null;
  expName: string | null;
  sceneId: string | null;
  highImage: string | null;
  isNeedHighImage: boolean;
  isForceShortPlay: boolean;
}

// Theater section/category
export interface TheaterSection {
  contentType: number;
  groupId: string;
  contentName: string;
  contentModel: number;
  contentInfos: DramaItem[];
  heatShowSwitch: number;
  freeEndTime: number;
  hiddenName: number;
  highShowCount: number | null;
  contentRemark: string;
}

// ForYou API Response (with pagination)
export interface ForYouResponse {
  contentType: number;
  groupId: string;
  contentName: string;
  contentModel: number;
  contentInfos: DramaItem[];
  maxOffset: number;
  heatShowSwitch: number;
  freeEndTime: number;
  freeConfigId: string | null;
  hiddenName: number;
  highShowCount: number;
  contentRemark: string;
  completed: boolean;
}

// Search Result Item
export interface SearchResultItem {
  id: string | null;
  shortPlayId: string;
  shortPlayLibraryId: string;
  popularityValue: number | null;
  shortPlayName: string;
  shortPlayCover: string;
  shotIntroduce: string | null;
  type: string | null;
  labelNames: string;
  labelNameList: string[];
  script: number;
  scriptName: string | null;
  scriptType: number;
  sortNumber: number | null;
  heatScore: number;
  scoreShow: string | null;
  e_bm25_score: string;
  starMessage: string | null;
  actorList: string[] | null;
  formatHeatScore: string;
}

// Search API Response
export interface SearchResponse {
  language: string;
  searchCode: string[];
  shadedWordSearchResult: SearchResultItem[];
  searchCodeSearchResult: SearchResultItem[];
  noResult: string[];
  total: number;
  abValue: number;
  isNewLabel: boolean;
  e_request_sequence_id: string;
  abtestHitNewBO: string | null;
}

// Episode Item
export interface Episode {
  shortPlayId: string;
  shortPlayLibraryId: string;
  episodeId: string;
  episodeNo: number;
  episodeType: number;
  episodeCover: string;
  likeNums: string;
  chaseNums: string;
  isLike: boolean;
  isChase: boolean;
  playVoucher: string;
  playClarity: string;
  sdkVid: string;
  isLock: boolean;
  isVip: boolean;
  isAd: boolean;
  episodeGoldCoinPrice: number;
  subtitleList: string[];
  pressType: number;
}

// Drama Detail Response (All Episodes)
export interface DramaDetailResponse {
  shortPlayId: string;
  shortPlayLibraryId: string;
  shortPlayName: string;
  shortPlayCover: string;
  shortPlayLabels: string[];
  isNewLabel: boolean;
  shotIntroduce: string;
  payPoint: number;
  totalEpisode: number;
  goldCoinPrice: number;
  isFinish: number;
  isChase: boolean;
  defaultLikeNums: number;
  defaultChaseNums: number;
  onlineState: number;
  shortPlayEpisodeInfos: Episode[];
  recordHistory: number;
  language: string;
  shortPlayType: number;
  script: number;
  scriptName: string;
  scriptType: number;
  videoPriceTemplateId: string;
}

// API Response - array of theater sections
export type TheatersResponse = TheaterSection[];

// Legacy types for backward compatibility with existing components
export interface Movie {
  id: string;
  title: string;
  tags: string;
  imageUrl: string;
  badge?: string;
  badgeColor?: 'primary' | 'red' | 'orange' | 'blue';
  heatScore?: string;
}

export interface SectionData {
  title: string;
  items: Movie[];
  layout: 'scroll' | 'grid';
  showViewAll?: boolean;
}

// Hero data interface
export interface HeroData {
  title: string;
  subtitle: string;
  description: string;
  bgImage: string;
  badge: string;
}

// Utility function to transform API data to component format
export function transformDramaToMovie(drama: DramaItem): Movie {
  // Determine badge based on scriptName or isNewLabel
  let badge: string | undefined;
  let badgeColor: Movie['badgeColor'] | undefined;

  if (drama.scriptName === 'Baru' || drama.isNewLabel) {
    badge = 'NEW';
    badgeColor = 'red';
  } else if (drama.scriptName === 'Populer') {
    badge = 'HOT';
    badgeColor = 'orange';
  } else if (drama.heatScore && drama.heatScore > 1000000) {
    badge = 'TOP';
    badgeColor = 'primary';
  }

  return {
    id: drama.shortPlayId,
    title: drama.shortPlayName,
    tags: drama.labelArray.slice(0, 2).join(' | ') || 'Drama',
    imageUrl: drama.shortPlayCover || drama.groupShortPlayCover,
    badge,
    badgeColor,
    heatScore: drama.heatScoreShow || undefined,
  };
}

export function transformSectionToSectionData(
  section: TheaterSection,
  layout: 'scroll' | 'grid' = 'scroll'
): SectionData {
  return {
    title: section.contentName.replace(/[🔥👍🎤⏰]/g, '').trim(),
    items: section.contentInfos.map(transformDramaToMovie),
    layout,
    showViewAll: section.contentInfos.length > 5,
  };
}

// Transform search result to Movie format
export function transformSearchResultToMovie(result: SearchResultItem): Movie {
  // Fix lỗi nếu shortPlayName bị null
  const name = result.shortPlayName || "";
  const cleanTitle = name.replace(/<\/?em>/g, '');
const cleanText = (text: string | null | undefined): string => {
  if (!text) return "";
  return text
    .replace(/<\/?[^>]+(>|$)/g, "") // Xóa thẻ HTML (em, span, div...)
    .trim();
};
  // FIX LỖI Ở ĐÂY: Thêm (result.labelNameList || []) để chặn lỗi slice
  const safeLabelList = (result.labelNameList || [])
    .map(tag => cleanText(tag)) // Chạy hàm xóa thẻ em cho từng tag
    .filter(tag => tag !== ""); // Loại bỏ tag rỗng nếu có

  return {
    id: result.shortPlayId,
    title: cleanTitle || "Phim không tên",
    tags: safeLabelList.slice(0, 2).join(' | ') || 'Drama',
    imageUrl: result.shortPlayCover || "",
    heatScore: result.formatHeatScore || "0",
  };
}