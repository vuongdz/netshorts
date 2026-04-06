import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Layers } from 'lucide-react';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const isDetail = location.pathname.startsWith('/drama/');
  
  if (isDetail) return null; // Ẩn điều hướng khi đang xem phim

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 pointer-events-none flex justify-center pb-4 px-2">
      <div className="w-full max-w-[430px] h-[72px] bg-[#222]/40 dark:bg-black/30 backdrop-blur-2xl backdrop-saturate-[180%] rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-white/20 pointer-events-auto flex items-center justify-between px-12 relative">
        <NavLink 
          to="/home" 
          className={({isActive}) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-red-500' : 'text-white/60'} w-14`}
        >
          <Home size={22} className={location.pathname === '/home' || location.pathname === '/' ? 'fill-current text-red-500' : ''} />
          <span className="text-[10px] items-center font-bold">Trang chủ</span>
        </NavLink>

        {/* Nút giữa (Shorts/Lướt) lồi lên */}
        <div className="absolute left-1/2 -top-5 -translate-x-1/2 flex flex-col items-center cursor-pointer pointer-events-auto" onClick={() =>alert('XemShort là dự án được tạo ra để giải trí')}>
          <div className="w-[60px] h-[60px] bg-gradient-to-tr from-[#ff3b5c] to-[#ff6b81] rounded-full flex items-center justify-center border-4 border-[#121212] shadow-[0_8px_16px_rgba(255,59,92,0.4)] transform active:scale-95 transition-transform">
            <Layers size={28} className="text-white fill-white" />
          </div>
        </div>

        <NavLink 
          to="/search" 
          className={({isActive}) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-red-500' : 'text-white/60'} w-14`}
        >
          <Search size={22} className={location.pathname === '/search' ? 'text-red-500' : ''} />
          <span className="text-[10px] font-bold">Duyệt tìm</span>
        </NavLink>
      </div>
    </div>
  );
};

export default BottomNav;
