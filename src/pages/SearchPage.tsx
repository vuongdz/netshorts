import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MovieCard from '@/src/components/MovieCard';
import { dramaApi } from '@/src/api/dramaApi';
import { Movie, transformSearchResultToMovie } from '@/src/types';
import { Search } from 'lucide-react';

const searchCache: Record<string, Movie[]> = {};

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);

  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Sync input với URL
  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  // Submit search (giống Navbar)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  // Fetch search results
  const fetchResults = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Kiểm tra bộ nhớ tạm (Cache) để trả về ngay nếu đã từng tìm
    if (searchCache[query]) {
      setResults(searchCache[query]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await dramaApi.search(query);
      const movies = response.searchCodeSearchResult.map(transformSearchResultToMovie);
      searchCache[query] = movies; // Lưu vào dòng bộ nhớ
      setResults(movies);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Lỗi tìm kiếm phim'));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return (
    <main className="relative z-10 pt-20 pb-20 bg-[#0a0a0a] transition-colors duration-300 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 🔍 SEARCH INPUT */}
        <form onSubmit={handleSearch} className="mb-8 sticky top-[72px] z-20">
          <div className="relative w-full flex items-center shadow-[0_8px_30px_rgba(220,38,38,0.15)] group">
            <Search className="absolute left-4 text-white/50 group-focus-within:text-red-500 transition-colors" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tên phim bạn muốn tìm..."
              className="w-full bg-[#111]/80 backdrop-blur-xl text-white border border-white/10 rounded-full pl-12 pr-28 py-3.5 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-medium text-sm"
            />
            <button
              type="submit"
              className="absolute right-1.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-full px-5 py-2 font-bold text-sm shadow-[0_0_15px_rgba(220,38,38,0.4)] active:scale-95 transition-transform"
            >
              Tìm kiếm
            </button>
          </div>
        </form>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-black text-white mb-1 tracking-tight border-l-4 border-red-500 pl-2">
            Kết quả tìm kiếm
          </h1>
          {query && (
            <p className="text-white/50 text-xs ml-3">
              {loading ? 'Đang tìm kiếm...' : `Hiển thị ${results.length} kết quả cho "${query}"`}
            </p>
          )}
        </div>

        {/* No Query State */}
        {!query && (
          <div className="text-center py-20 opacity-50">
            <div className="text-6xl mb-4 grayscale filter drop-shadow-xl">🍿</div>
            <p className="text-white text-sm font-medium">
              Nhập từ khóa để tìm kiếm phim mà bạn thích
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-4 text-gray-600 dark:text-gray-400">Đang tìm kiếm</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            <p className="font-medium">Không thể tìm kiếm</p>
            <p className="text-sm">{error.message}</p>
          </div>
        )}

        {/* No Results */}
        {!loading && query && results.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😢</div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Không tìm thấy phim nào với từ khóa "{query}"
            </p>
          </div>
        )}

        {/* Results Grid - 3 items per row */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {results.map((movie, index) => (
              <div key={`${movie.id}-${index}`} className="flex flex-col gap-2 rounded-lg cursor-pointer transition active:scale-[0.98]" onClick={() => navigate(`/drama/${movie.id}`)}>
                <div className="aspect-[3/4] rounded-lg overflow-hidden relative shadow-[0_4px_10px_rgba(0,0,0,0.5)] border border-white/5 bg-gray-900">
                  <img src={movie.imageUrl} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" loading="lazy" alt={movie.title} />
                  {movie.heatScore && (
                     <div className="absolute top-1 right-1">
                        <span className="bg-black/80 backdrop-blur-md text-[#FFD700] text-[9px] font-black px-1.5 py-0.5 rounded border border-white/10 shadow-[0_0_10px_rgba(255,215,0,0.2)]">
                           🔥 {movie.heatScore}
                        </span>
                     </div>
                  )}
                </div>
                <h3 className="text-white/90 text-[11px] font-bold line-clamp-2 leading-tight px-1 font-sans">{movie.title}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default SearchPage;