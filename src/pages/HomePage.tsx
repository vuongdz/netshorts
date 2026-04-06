import React from 'react';
import Hero from '@/src/components/Hero';
import Section from '@/src/components/Section';
import { useNavigate } from 'react-router-dom';
import { useDramaData } from '@/src/hooks/useDramaData';
import { HeroData } from '@/src/types';


const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { sections, heroData, loading, error, allDrama, loadMoreAllData, loadingMore } = useDramaData();

  const observerRef = React.useRef<IntersectionObserver | null>(null);
  const endRef = React.useCallback((node: HTMLDivElement) => {
    if (loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && allDrama?.nextPage) {
        loadMoreAllData();
      }
    });
    if (node) observerRef.current.observe(node);
  }, [loadingMore, allDrama?.nextPage, loadMoreAllData]);

  return (
    <>
      <Hero heroData={heroData} loading={loading} />

      <main className="relative z-10 pb-20 space-y-12 bg-[#0a0a0a] transition-colors duration-300">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-4 text-gray-600 dark:text-gray-400">Đang tải phim...</span>
          </div>
        )}

        {error && !loading && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              <p className="font-medium">Lỗi tải dữ liệu</p>
              <p className="text-sm">{error.message}</p>
            </div>
          </div>
        )}

        {/* {!loading && sections.map((section, index) => (
          <Section key={`section-${index}`} {...section} />
        ))} */}

        {/* Khối ALL MOVIES */}
        {!loading && allDrama?.items?.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pb-12">
            <h2 className="text-white font-bold text-xl mb-4 ml-2 border-l-4 border-red-500 pl-2">Tất Cả Phim</h2>
            <div className="grid grid-cols-3 gap-3">
              {allDrama.items.map((item: any, idx: number) => (
                <div key={`all-${item.id}-${idx}`} className="flex flex-col gap-2 rounded-lg cursor-pointer transition active:scale-[0.98]" onClick={() => navigate(`/drama/${item.id}`)}>
                  <div className="aspect-[3/4] rounded-lg overflow-hidden relative shadow-[0_4px_10px_rgba(0,0,0,0.5)] border border-white/5 bg-gray-900">
                    <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" loading="lazy" alt={item.title} />
                  </div>
                  <h3 className="text-white/90 text-[11px] font-bold line-clamp-2 leading-tight px-1 font-sans">{item.title}</h3>
                </div>
              ))}
            </div>
            
            {/* Observer Element for Infinite Scroll */}
            <div ref={endRef} className="h-10 flex justify-center items-center mt-6">
               {loadingMore && <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-500"></div>}
               {!loadingMore && !allDrama.nextPage && <span className="text-gray-500 text-xs">Bạn đã xem hết phim</span>}
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default HomePage;
