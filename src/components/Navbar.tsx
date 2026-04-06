import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from './Icon';

interface NavItem {
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  // { label: 'Beranda', path: '/' },
  // { label: 'Serial Drama', path: '/serial-drama' },
];

const Navbar: React.FC = () => {
  return (
    <nav className="absolute top-0 left-0 w-full z-50 px-5 pt-3 pb-4 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none">
      <div className="flex items-center justify-between pointer-events-auto h-10 w-full">
        <Link to="/" className="flex items-center gap-2 active:scale-95 transition-transform">
          <Icon name="play_circle_filled" className="text-red-500 drop-shadow-[0_0_12px_rgba(220,38,38,0.8)]" size="3xl" />
          <span className="font-black text-2xl tracking-tighter text-white drop-shadow-md font-sans">
            XEM<span className="text-red-500">SHORT</span>
          </span>
        </Link>
        
        {/* <div className="flex items-center gap-3">
          <button className="text-white/90 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition-colors active:scale-95">
            <Icon name="notifications" size="sm" />
          </button>
          <button className="text-white/90 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition-colors active:scale-95">
            <div className="w-5 h-5 rounded-full overflow-hidden bg-white/20 flex justify-center items-center">
              <Icon name="person" size="sm" />
            </div>
          </button>
        </div> */}
      </div>
    </nav>
  );
};

export default Navbar;