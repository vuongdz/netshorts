import React from 'react';
import { SectionData } from '@/src/types';
import MovieCard from './MovieCard';
import Icon from './Icon';

const Section: React.FC<SectionData> = ({ title, items, layout, showViewAll }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4 border-l-4 border-red-500 pl-2">
        <h2 className="text-xl font-bold text-white leading-none">{title}</h2>
        {showViewAll && (
          <a href="#" className="text-sm font-medium text-primary hover:text-rose-400 flex items-center group">
            Xem Tất Cả
            <Icon name="chevron_right" size="sm" className="ml-1 group-hover:translate-x-1 transition-transform" />
          </a>
        )}
      </div>

      {layout === 'scroll' ? (
        <div className="relative group">
          <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar scroll-smooth">
            {items.map((movie) => (
              <div key={movie.id} className="flex-none w-40 sm:w-48 md:w-56">
                <MovieCard movie={movie} />
              </div>
            ))}
            {/* Nav Button for Scroll (Visual only for now, functionality typically requires ref) */}
             <button className="absolute right-0 top-1/2 -translate-y-full z-10 bg-gray-900/80 dark:bg-white/10 hover:bg-primary text-white p-2 rounded-full shadow-lg hidden md:hidden group-hover:flex items-center justify-center backdrop-blur-sm transform translate-x-1/2 transition-colors">
              <Icon name="chevron_right" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
};

export default Section;