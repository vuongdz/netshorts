import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from '@/src/components/Navbar';
import BottomNav from '@/src/components/BottomNav';
import HomePage from '@/src/pages/HomePage';
import SearchPage from '@/src/pages/SearchPage';
import DramaDetailPage from '@/src/pages/DramaDetailPage';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const isDrama = location.pathname.startsWith('/drama/');

  return (
    <div className="min-h-screen flex justify-center w-full bg-zinc-950 font-sans">
      <div className="w-full max-w-[430px] min-h-[100dvh] relative bg-background-dark shadow-2xl sm:border-x sm:border-white/10 flex flex-col overflow-x-hidden">
        {!isDrama && <Navbar />}

        <div className={`flex-1 w-full relative overflow-y-auto scrollbar-hide ${isDrama ? '' : 'pb-24'}`}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/drama/:id" element={<DramaDetailPage />} />
          </Routes>
        </div>

        <BottomNav />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
};

export default App;