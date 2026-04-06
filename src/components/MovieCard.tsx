import React from 'react';
import { Link } from 'react-router-dom';
import { Movie } from '@/src/types';
import Icon from './Icon';

interface MovieCardProps {
  movie: Movie;
  className?: string;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, className = '' }) => {
  const badgeColors = {
    primary: 'bg-primary',
    red: 'bg-red-600',
    orange: 'bg-orange-500',
    blue: 'bg-blue-600',
  };

  return (
    <Link to={`/drama/${movie.id}`} className={`group/card cursor-pointer block ${className}`}>
      <div className="relative aspect-poster rounded-lg overflow-hidden shadow-lg mb-3 bg-gray-200 dark:bg-gray-800">
        <img
          src={movie.imageUrl}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover transform group-hover/card:scale-110 transition-transform duration-500"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
          <Icon name="play_circle" className="text-white drop-shadow-lg" size="5xl" />
        </div>

        {/* Badge */}
        {movie.badge && (
          <div className={`absolute top-0 left-0 px-2 py-1 z-10 rounded-br-lg shadow-md ${movie.badgeColor ? badgeColors[movie.badgeColor] : 'bg-primary'}`}>
            <span className="text-white text-[10px] font-bold flex items-center gap-1 uppercase">
              {movie.badge === 'TOP' && <Icon name="star" size="[12px]" />}
              {movie.badge}
            </span>
          </div>
        )}
      </div>
      <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-1 group-hover/card:text-primary transition-colors">
        {movie.title}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
        {movie.tags}
      </p>
    </Link>
  );
};

export default MovieCard;