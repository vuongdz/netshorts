import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dramaApi } from '@/src/api/dramaApi';
import { DramaDetailResponse, Episode } from '@/src/types';
import { Play, Pause, Volume2, VolumeX, Heart, MessageCircle, ChevronRight, X, List } from 'lucide-react';

const ProgressBar = ({ videoRefs, episodeId }: { videoRefs: React.MutableRefObject<Map<string | number, HTMLVideoElement>>, episodeId: string | number }) => {
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let animationFrameId: number;
    const updateProgress = () => {
      const video = videoRefs.current.get(episodeId);
      if (video && !isDragging && video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
      animationFrameId = requestAnimationFrame(updateProgress);
    };
    animationFrameId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animationFrameId);
  }, [episodeId, isDragging, videoRefs]);

  const handleSeekStart = () => setIsDragging(true);

  const handleSeekMove = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setProgress(val);
    const video = videoRefs.current.get(episodeId);
    if (video && video.duration) {
      video.currentTime = (val / 100) * video.duration;
    }
  };

  const handleSeekEnd = () => setIsDragging(false);

  return (
    <div 
      className="relative w-full h-6 flex items-center px-0 group cursor-pointer touch-none" 
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()} 
    >
      <input
        type="range" 
        min="0" 
        max="100" 
        value={progress || 0}
        step="0.1"
        onChange={handleSeekMove}
        onPointerDown={handleSeekStart}
        onPointerUp={handleSeekEnd}
        onPointerCancel={handleSeekEnd}
        onTouchStart={handleSeekStart}
        onTouchEnd={handleSeekEnd}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50 touch-none"
      />
      <div className="w-full h-1 bg-white/30 relative overflow-visible transition-all duration-300 group-hover:h-1.5 backdrop-blur-sm">
        <div 
          className="h-full bg-red-600 relative will-change-[width]" 
          style={{ width: `${progress}%` }}
        >
          <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-all duration-200 ${isDragging ? 'scale-125' : 'scale-0 group-hover:scale-100'}`}></div>
        </div>
      </div>
    </div>
  );
};

const DramaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [drama, setDrama] = useState<DramaDetailResponse | null>(null);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | number | null>(null);
  const [subtitleUrl, setSubtitleUrl] = useState('');
  const [playing, setPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false); 

  const videoRefs = useRef<Map<string | number, HTMLVideoElement>>(new Map());
  const mainRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Dữ liệu
  const fetchDrama = useCallback(async () => {
    if (!id) return;
    try {
      const res = await dramaApi.getAllEpisodes(id);
      setDrama(res);
      if (res.shortPlayEpisodeInfos.length > 0) {
        setSelectedEpisodeId(res.shortPlayEpisodeInfos[0].episodeId);
      }
    } catch (err) { console.error(err); }
  }, [id]);

  useEffect(() => { fetchDrama(); }, [fetchDrama]);

  const enableFullScreen = () => {
    if (!document.fullscreenElement && mainRef.current) {
      mainRef.current.requestFullscreen?.().catch(() => {});
    }
  };

  // 2. Nhận diện tập đang cuộn tới
  useEffect(() => {
    const options = { threshold: 0.6 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const epId = entry.target.getAttribute('data-id');
          if (epId) setSelectedEpisodeId(epId);
        }
      });
    }, options);
    document.querySelectorAll('.video-item').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [drama]);

  // 3. Điều khiển Play/Pause & Âm thanh
  useEffect(() => {
    if (!selectedEpisodeId) return;
    videoRefs.current.forEach((video, id) => {
      if (id.toString() === selectedEpisodeId.toString()) {
        video.muted = isMuted;
        video.play().catch(() => {
          video.muted = true;
          video.play();
        });
        setPlaying(true);
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [selectedEpisodeId, isMuted]);

  // 4. Subtitles
  useEffect(() => {
    const currentEp = drama?.shortPlayEpisodeInfos.find(e => e.episodeId.toString() === selectedEpisodeId?.toString());
    if (!currentEp?.subtitleList?.[0]?.url) return;

    let url = '';
    const loadSub = async () => {
      try {
        const res = await fetch(currentEp.subtitleList[0].url);
        let text = await res.text();
        if (!text.startsWith('WEBVTT')) text = 'WEBVTT\n\n' + text;

        const positionedText = text.replace(
          /(\d{2}:\d{2}:\d{2}\.\d{3}\s+-->\s+\d{2}:\d{2}:\d{2}\.\d{3})/g,
          '$1 line:70% position:50% align:center'
        );

        const blob = new Blob([positionedText], { type: 'text/vtt' });
        url = URL.createObjectURL(blob);
        setSubtitleUrl(url);
      } catch (err) { console.error(err); }
    };

    loadSub();
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [selectedEpisodeId, drama]);

  const handleVideoEnded = (currentNo: number) => {
    const nextEp = drama?.shortPlayEpisodeInfos.find(e => e.episodeNo === currentNo + 1);
    if (nextEp) {
      const element = document.querySelector(`[data-id="${nextEp.episodeId}"]`);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const goToEpisode = (epId: string | number) => {
    const element = document.querySelector(`[data-id="${epId}"]`);
    element?.scrollIntoView({ behavior: 'auto' });
    setShowPlaylist(false);
  };

  if (!drama) return <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-4 text-gray-600 dark:text-gray-400">Đang tải...</span>
          </div>;

  return (
    <main 
      ref={mainRef}
      className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory bg-black scrollbar-hide relative font-sans"
    >
      {/* Nút Back Absolute */}
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-5 left-5 z-[500] p-2 bg-black/40 backdrop-blur-md rounded-full text-white active:scale-95 transition-transform"
      >
        <ChevronRight className="rotate-180" size={24} />
      </button>

      {drama.shortPlayEpisodeInfos.map((episode) => {
        const isActive = selectedEpisodeId?.toString() === episode.episodeId.toString();
        return (
          <div
            key={episode.episodeId}
            data-id={episode.episodeId}
            className="video-item h-[100dvh] w-full snap-start relative flex items-center justify-center overflow-hidden"
            onClick={() => {
                // Chỉ xử lý Play/Pause khi click vào vùng video chính
                // enableFullScreen();
                if (isMuted) setIsMuted(false);
                
                const video = videoRefs.current.get(episode.episodeId);
                if (video?.paused) { video.play(); setPlaying(true); } 
                else { video?.pause(); setPlaying(false); }
                
                setShowControls(true);
                setTimeout(() => setShowControls(false), 500);
            }}
          >
            <video
              ref={(el) => { if (el) videoRefs.current.set(episode.episodeId, el); }}
              src={episode.playVoucher}
              className="h-full w-full object-contain"
              playsInline 
              muted={isMuted}
              onEnded={() => handleVideoEnded(episode.episodeNo)}
            >
              {isActive && subtitleUrl && <track key={subtitleUrl} kind="subtitles" src={subtitleUrl} default />}
            </video>

            {/* Play/Pause UI Overlay */}
            {showControls && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                 <div className="bg-black/40 p-5 rounded-full animate-ping-once scale-150">
                    <span className="text-white text-4xl">{playing ? <Pause size={48} className="text-white fill-white" /> : <Play size={48} className="text-white fill-white" />}</span>
                 </div>
              </div>
            )}

            {/* Video Info */}
            <div className="absolute bottom-20 left-4 right-16 text-white z-20 pointer-events-none">
              <h2 className="font-bold text-lg drop-shadow-md">@{drama.shortPlayName}</h2>
            </div>

            {/* Sidebar Actions */}
            <div className="absolute right-3 bottom-15 flex flex-col gap-6 items-center z-20">
               <div 
                  className="flex flex-col items-center drop-shadow-lg cursor-pointer  p-2 rounded-full active:scale-90 transition-transform"
                  onClick={(e) => { 
                    e.stopPropagation(); // Ngăn chặn sự kiện click vào video
                    setIsMuted(!isMuted); 
                  }}
               >
                  <div className="text-2xl">{isMuted ? <VolumeX size={20} className="text-white fill-white" /> :<Volume2 size={20} className="text-white fill-white" />}</div>
                  <span className="text-[10px] text-white font-bold p-1">{isMuted ? 'Âm thanh' : 'Âm thanh'}</span>
               </div>
               
            </div>

            {/* BOTTOM CONTROLS: CHỨA THANH TUA VÀ DANH SÁCH TẬP */}
            {isActive && (
              <div 
                className="absolute bottom-0 left-0 w-full z-40 flex flex-col"
                onClick={(e) => e.stopPropagation()} // QUAN TRỌNG: Chạm vào vùng này không bị Play/Pause
              >
                {/* 1. THANH TUA (SEEK BAR) */}
                <ProgressBar videoRefs={videoRefs} episodeId={episode.episodeId} />

                {/* 2. THANH DANH SÁCH TẬP */}
                <div 
                    className="w-full bg-black/90 backdrop-blur-md py-4 px-5 flex justify-between items-center border-t border-white/10 active:bg-white/20"
                    onClick={() => setShowPlaylist(true)}
                >
                    <div className="flex items-center gap-3">
                        <span className="flex space-x-1">
                           <span className="w-1 h-3 bg-red-500 animate-pulse"></span>
                           <span className="w-1 h-3 bg-red-500 animate-pulse delay-75"></span>
                        </span>
                        <span className="text-white font-bold text-sm tracking-wider uppercase">
                            Tập ({episode.episodeNo}/{drama.shortPlayEpisodeInfos.length})
                        </span>
                    </div>
                    <div className="text-white/80 text-xs font-bold uppercase tracking-widest">
                        <List size={20} className="text-white fill-white" />
                    </div>
                </div>
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none"></div>
          </div>
        );
      })}

        {/* Playlist Sheet */}
        {showPlaylist && (
          <div className="fixed inset-0 z-[1000] flex justify-center pointer-events-none" onClick={(e) => e.stopPropagation()}>
            <div className="w-full max-w-[430px] relative flex flex-col justify-end pointer-events-auto h-[100dvh]">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowPlaylist(false)}></div>
              <div className="relative bg-[#111] rounded-t-[2.5rem] max-h-[75vh] p-6 pb-12 overflow-y-auto animate-slide-up border-t border-white/10 shadow-2xl">
                <div className="w-16 h-1.5 bg-white/10 rounded-full mx-auto mb-8"></div>
                <div className="flex justify-between items-center mb-8 px-2">
                  <h3 className="text-white font-black text-2xl uppercase tracking-tighter">Chọn tập</h3>
                  <button onClick={() => setShowPlaylist(false)} className="bg-white/10 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold active:scale-90">✕</button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                  {drama.shortPlayEpisodeInfos.map((ep) => (
                    <button
                      key={ep.episodeId}
                      onClick={(e) => { e.stopPropagation(); goToEpisode(ep.episodeId); }}
                      className={`aspect-square rounded-2xl flex items-center justify-center font-black text-xl transition-all ${
                        selectedEpisodeId?.toString() === ep.episodeId.toString() 
                        ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] scale-110 border-2 border-white/20' 
                        : 'bg-white/5 text-gray-400 border border-white/5 active:scale-95'
                      }`}
                    >
                      {ep.episodeNo}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fade-in { animation: fadeIn 0.3s ease; }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ping-once { 0% { opacity: 1; transform: scale(0.5); } 100% { opacity: 0; transform: scale(1.5); } }
        .animate-ping-once { animation: ping-once 0.5s ease-out forwards; }
        
        video::cue {
          background: transparent !important;
          background-color: transparent !important;
          color: #ffffff !important;
          font-family: 'Inter', -apple-system, sans-serif !important;
          font-size: 20px !important;
          font-weight: 800 !important;
          text-shadow: 
            -1px -1px 0 #000,  
             1px -1px 0 #000,
            -1px  1px 0 #000,
             1px  1px 0 #000,
             0 2px 5px rgba(0,0,0,0.9) !important;
        }

        /* Đảm bảo thanh tua dễ kéo trên mobile */
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 25px;
          height: 25px;
          background: transparent;
          cursor: pointer;
        }

        :fullscreen .video-item { height: 100vh; }
      `}</style>
    </main>
  );
};

export default DramaDetailPage;