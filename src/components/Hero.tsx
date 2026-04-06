import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';

interface HeroProps {
  heroData: any; 
  loading?: boolean;
}

const Hero: React.FC<HeroProps> = ({ heroData, loading }) => {
  const navigate = useNavigate();
  
  const dataList: any[] = Array.isArray(heroData) ? heroData : (heroData ? [heroData] : []);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    if (dataList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % dataList.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [dataList.length]);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev + 1) % dataList.length);
    } else if (isRightSwipe) {
      setCurrentIndex((prev) => (prev - 1 + dataList.length) % dataList.length);
    }
  };

  if (loading) {
    return (
      <header className="relative pt-16 min-h-[550px] sm:min-h-[550px] flex items-center overflow-hidden w-full bg-[#111]">
        <div className="absolute inset-0 animate-pulse bg-white/5"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent z-0"></div>
        <div className="relative z-10 w-full px-4 py-8 pb-16 mt-auto flex flex-col gap-3">
          <div className="h-4 w-16 bg-white/20 rounded animate-pulse"></div>
          <div className="h-8 w-2/3 bg-white/20 rounded mt-1 animate-pulse"></div>
          <div className="h-12 w-full bg-white/20 rounded mt-2 animate-pulse"></div>
          <div className="flex items-center gap-3 mt-4">
            <div className="h-10 w-32 bg-white/20 rounded-full animate-pulse"></div>
            <div className="h-10 w-10 bg-white/20 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  if (dataList.length === 0) return null;

  const current = dataList[currentIndex];
  return (
    <header 
      className="relative pt-16 min-h-[550px] sm:min-h-[550px] flex items-center overflow-hidden w-full select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Slider Backgrounds */}
      {dataList.map((item, idx) => (
        <div 
          key={idx}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === currentIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'}`}
        >
          <img
            src={item.bgImage}
            alt="Hero Background"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent"></div>
        </div>
      ))}

      {/* Content Layer */}
      <div className="relative z-10 w-full px-4 py-8 pb-16 mt-auto">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider mb-2">
            ĐỘC QUYỀN
          </div>
          <h1 className="text-3xl font-black text-white leading-tight mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {current.title}
          </h1>
          <p className="text-gray-200 text-xs mb-6 max-w-[95%] drop-shadow-md line-clamp-3 leading-relaxed">
            {current.description}
          </p>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/drama/' + current.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-1 transition-transform transform active:scale-95 shadow-lg shadow-red-500/30 text-sm">
              <Icon name="play_arrow" />
              Xem Ngay
            </button>
            {/* <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-2.5 rounded-full flex items-center justify-center transition-colors border border-white/20">
              <Icon name="add" />
            </button> */}
          </div>
        </div>
      </div>

      {/* Carousel Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {dataList.map((_, idx) => (
          <div 
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-4 bg-red-500 opacity-100' : 'w-1.5 bg-gray-400 opacity-50'}`}
          ></div>
        ))}
      </div>
    </header>
  );
};

export default Hero;