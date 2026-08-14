import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, FileText, Images, Download, ExternalLink, CheckCircle2 } from 'lucide-react';

export const LessonView = ({ lesson, onBack, onComplete }) => {
  const type = lesson.lesson_type || 'video';
  const [currentSlide, setCurrentSlide] = useState(0);

  // Parse gallery URLs
  const galleryList = (lesson.gallery_urls || '')
    .split(/[\n,]/)
    .map(url => url.trim())
    .filter(url => url.length > 0);

  const getEmbedUrl = (url) => {
    if (!url) return '';
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&playsinline=1&rel=0`;
    }
    const vimeoMatch = url.match(/vimeo\.com\/(?:.*\/)?(\\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }
    return url;
  };

  const embedUrl = getEmbedUrl(lesson.video_url);
  const isDirectVideo = lesson.video_url?.match(/\.(mp4|webm|mov|m4v)(\?|$)/i);
  const isDataUrl = lesson.video_url?.startsWith('data:');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-lg mx-auto bg-white min-h-[calc(100vh-64px)] animate-fade-in pb-28 md:pb-8">

      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-cream-border px-4 py-3 flex items-center">
        <button
          onClick={onBack}
          className="p-1.5 rounded-xl hover:bg-cream transition-colors mr-3"
        >
          <ChevronLeft className="w-5 h-5 text-deep" />
        </button>
        <h2 className="text-[15px] font-bold text-deep truncate flex-1 text-center pr-8">
          {lesson.title}
        </h2>
      </div>

      {/* Video / Media Area */}
      <div className="w-full bg-black">
        {type === 'video' && (
          <div className="w-full aspect-video relative">
            {isDirectVideo || isDataUrl ? (
              <video 
                src={lesson.video_url} 
                controls 
                autoPlay 
                playsInline
                preload="metadata"
                className="w-full h-full absolute inset-0 object-contain" 
              />
            ) : embedUrl ? (
              <iframe
                src={embedUrl}
                title={lesson.title}
                className="w-full h-full absolute inset-0 border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <Play className="w-10 h-10 opacity-40 mb-2" />
                <p className="text-sm opacity-60">Видео недоступно</p>
                {lesson.video_url && (
                  <a href={lesson.video_url} target="_blank" rel="noreferrer" className="text-rose-light underline text-sm mt-2">
                    Открыть ссылку
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {type === 'gallery' && (
          galleryList.length > 0 ? (
            <div className="relative w-full aspect-square flex items-center justify-center overflow-hidden">
              <img
                src={galleryList[currentSlide]}
                alt={`Slide ${currentSlide + 1}`}
                className="w-full h-full object-contain transition-all duration-300"
              />
              {galleryList.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentSlide(prev => prev === 0 ? galleryList.length - 1 : prev - 1)}
                    className="absolute left-2 p-2 rounded-full bg-black/40 text-white backdrop-blur-sm"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentSlide(prev => prev === galleryList.length - 1 ? 0 : prev + 1)}
                    className="absolute right-2 p-2 rounded-full bg-black/40 text-white backdrop-blur-sm"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                    {currentSlide + 1} / {galleryList.length}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="w-full py-16 flex flex-col items-center justify-center text-white">
              <Images className="w-10 h-10 opacity-40 mb-2" />
              <p className="text-sm opacity-60">Нет фотографий</p>
            </div>
          )
        )}
      </div>

      {/* File download card */}
      {type === 'file' && lesson.video_url && (
        <div className="mx-5 mt-5">
          <a
            href={lesson.video_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center p-4 bg-cream rounded-2xl border border-cream-border hover:bg-cream-dark transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-light flex items-center justify-center flex-shrink-0 mr-3">
              <FileText className="w-5 h-5 text-rose-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-deep truncate">{lesson.title}</p>
              <p className="text-[11px] text-deep-muted">Нажмите для скачивания</p>
            </div>
            <Download className="w-4 h-4 text-deep-muted group-hover:text-rose transition-colors flex-shrink-0" />
          </a>
        </div>
      )}

      {/* Description */}
      <div className="px-5 pt-5 pb-4">
        <h3 className="text-[15px] font-bold text-deep mb-2">{lesson.title}</h3>
        <p className="text-[13px] text-deep-muted leading-relaxed whitespace-pre-line">
          {lesson.description || 'Описание не добавлено.'}
        </p>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-20 md:bottom-6 left-0 right-0 px-5 z-30 max-w-lg mx-auto">
        <button
          onClick={onComplete || onBack}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00A1FC] to-[#00DECC] text-white font-semibold text-[15px] shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Завершить урок</span>
        </button>
      </div>

    </div>
  );
};
