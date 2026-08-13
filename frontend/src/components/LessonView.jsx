import React, { useState, useEffect } from 'react';
import { ChevronLeft, Play, FileText, Images, ChevronRight, Download, ExternalLink, Sparkles } from 'lucide-react';

export const LessonView = ({ lesson, onBack }) => {
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

  // Scroll to top when lesson opens
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full bg-cream min-h-[calc(100vh-64px)] animate-fade-in flex flex-col pb-24 md:pb-12">
      
      {/* Top Header with Back Button */}
      <div className="sticky top-0 z-20 bg-cream/90 backdrop-blur-md border-b border-cream-border px-4 py-3 flex items-center shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center text-deep-muted hover:text-deep transition-colors mr-3 bg-white/50 p-1.5 rounded-xl border border-cream-border"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-lg font-bold text-deep truncate leading-tight">
            {lesson.title}
          </h2>
          <p className="text-[11px] text-deep-muted">
            {type === 'video' && 'Видеоурок'}
            {type === 'file' && 'Материал для скачивания'}
            {type === 'gallery' && `Галерея (${galleryList.length} фото)`}
          </p>
        </div>
      </div>

      {/* Media Viewer Area */}
      <div className="w-full bg-black flex flex-col items-center justify-center relative shadow-inner"
           style={{ minHeight: type !== 'video' ? '300px' : 'auto' }}
      >
        {/* TYPE 1: VIDEO */}
        {type === 'video' && (
          <div className="w-full w-full max-w-5xl mx-auto aspect-video relative flex items-center justify-center">
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
              <div className="text-white text-center p-8">
                <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Видео недоступно</p>
                {lesson.video_url && (
                  <a href={lesson.video_url} target="_blank" rel="noreferrer" className="text-rose-light underline text-sm mt-2 inline-block">
                    Открыть ссылку
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* TYPE 2: FILE */}
        {type === 'file' && (
          <div className="w-full h-full bg-cream-card/10 flex flex-col items-center justify-center py-16 px-4 text-center space-y-4 text-white">
            <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center shadow-inner">
              <FileText className="w-10 h-10" />
            </div>
            <div>
              <h4 className="font-serif text-xl sm:text-2xl font-bold mb-1 px-4">{lesson.title}</h4>
              <p className="text-xs text-white/60 max-w-md mx-auto">Вложенный документ / учебный файл</p>
            </div>
            {lesson.video_url && (
              <a
                href={lesson.video_url}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose to-rose-hover text-white font-semibold text-sm shadow-rose hover:shadow-lg transition-all flex items-center space-x-2 mt-4"
              >
                <Download className="w-4 h-4" />
                <span>Открыть / Скачать файл</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            )}
          </div>
        )}

        {/* TYPE 3: GALLERY */}
        {type === 'gallery' && (
          galleryList.length > 0 ? (
            <div className="relative w-full max-w-5xl mx-auto h-[40vh] sm:h-[60vh] flex items-center justify-center bg-black overflow-hidden">
              <img
                src={galleryList[currentSlide]}
                alt={`Slide ${currentSlide + 1}`}
                className="w-full h-full object-contain transition-all duration-300"
              />
              
              {/* Carousel Controls */}
              {galleryList.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentSlide(prev => prev === 0 ? galleryList.length - 1 : prev - 1)}
                    className="absolute left-2 sm:left-4 p-2 sm:p-3 rounded-full bg-deep/50 hover:bg-deep text-white backdrop-blur-md transition-all z-10"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={() => setCurrentSlide(prev => prev === galleryList.length - 1 ? 0 : prev + 1)}
                    className="absolute right-2 sm:right-4 p-2 sm:p-3 rounded-full bg-deep/50 hover:bg-deep text-white backdrop-blur-md transition-all z-10"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <div className="absolute bottom-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                    {currentSlide + 1} / {galleryList.length}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-white text-sm text-center py-16">
              <Images className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>В галерею пока не добавлены фотографии.</p>
            </div>
          )
        )}
      </div>

      {/* Description Area */}
      <div className="flex-1 bg-cream px-4 sm:px-6 md:px-8 py-6 max-w-5xl w-full mx-auto">
        <h4 className="text-xs font-bold uppercase tracking-wider text-rose-dark mb-3 flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4" />
          <span>Описание материала</span>
        </h4>
        <div className="bg-white border border-cream-border p-5 rounded-2xl sm:rounded-3xl shadow-sm">
          <p className="text-[13px] sm:text-sm text-deep leading-relaxed whitespace-pre-line">
            {lesson.description || 'Описание к данному материалу не добавлено администратором.'}
          </p>
        </div>
      </div>
      
    </div>
  );
};
