import React, { useState } from 'react';
import { X, Play, FileText, Images, ChevronLeft, ChevronRight, Download, ExternalLink, Sparkles } from 'lucide-react';

export const VideoModal = ({ lesson, onClose }) => {
  if (!lesson) return null;

  const type = lesson.lesson_type || 'video';
  const [currentSlide, setCurrentSlide] = useState(0);

  // Parse gallery URLs (split by newline or comma)
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

  const getYouTubeId = (url) => {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return ytMatch ? ytMatch[1] : null;
  };

  const embedUrl = getEmbedUrl(lesson.video_url);
  const youtubeId = getYouTubeId(lesson.video_url);
  const isDirectVideo = lesson.video_url?.match(/\.(mp4|webm|mov|m4v)(\?|$)/i);
  const isDataUrl = lesson.video_url?.startsWith('data:');

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-deep/60 backdrop-blur-md animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-cream rounded-t-3xl sm:rounded-3xl w-full sm:max-w-4xl overflow-hidden shadow-2xl border border-cream-border flex flex-col max-h-[95vh] sm:max-h-[90vh] sm:mx-4">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-cream-card flex items-center justify-between border-b border-cream-border flex-shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-rose-light text-rose-dark flex items-center justify-center flex-shrink-0">
              {type === 'video' && <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-rose-dark" />}
              {type === 'file' && <FileText className="w-4 h-4 sm:w-5 sm:h-5" />}
              {type === 'gallery' && <Images className="w-4 h-4 sm:w-5 sm:h-5" />}
            </div>
            <div className="min-w-0">
              <h3 className="font-serif text-base sm:text-xl font-bold text-deep leading-tight truncate">
                {lesson.title}
              </h3>
              <p className="text-[11px] text-deep-muted">
                {type === 'video' && 'Видеоурок'}
                {type === 'file' && 'Материал для скачивания'}
                {type === 'gallery' && `Галерея (${galleryList.length} фото)`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-deep-muted hover:text-deep hover:bg-cream-border/50 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Viewer Body */}
        <div className="relative w-full flex-1 min-h-0 bg-black flex items-center justify-center overflow-hidden"
             style={{ aspectRatio: type === 'video' ? '16/9' : undefined, minHeight: type !== 'video' ? '300px' : undefined }}
        >
          
          {/* TYPE 1: VIDEO */}
          {type === 'video' && (
            <>
              {isDirectVideo || isDataUrl ? (
                <video 
                  src={lesson.video_url} 
                  controls 
                  autoPlay 
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-contain" 
                  style={{ maxHeight: '70vh' }}
                />
              ) : embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={lesson.title}
                  className="w-full h-full border-0"
                  style={{ minHeight: '250px' }}
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
            </>
          )}

          {/* TYPE 2: FILE */}
          {type === 'file' && (
            <div className="w-full h-full bg-cream-card flex flex-col items-center justify-center p-6 sm:p-8 text-center space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-rose-light text-rose-dark flex items-center justify-center shadow-inner">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div>
                <h4 className="font-serif text-xl sm:text-2xl font-bold text-deep mb-1">{lesson.title}</h4>
                <p className="text-xs text-deep-muted max-w-md">Вложенный документ / учебный файл</p>
              </div>
              {lesson.video_url && (
                <a
                  href={lesson.video_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose to-rose-hover text-white font-semibold text-sm shadow-rose hover:shadow-lg transition-all flex items-center space-x-2"
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
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <img
                  src={galleryList[currentSlide]}
                  alt={`Slide ${currentSlide + 1}`}
                  className="max-h-full max-w-full object-contain transition-all duration-300"
                />
                
                {/* Carousel Controls */}
                {galleryList.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentSlide(prev => prev === 0 ? galleryList.length - 1 : prev - 1)}
                      className="absolute left-2 sm:left-4 p-2 sm:p-3 rounded-full bg-deep/50 hover:bg-deep text-white backdrop-blur-md transition-all"
                    >
                      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <button
                      onClick={() => setCurrentSlide(prev => prev === galleryList.length - 1 ? 0 : prev + 1)}
                      className="absolute right-2 sm:right-4 p-2 sm:p-3 rounded-full bg-deep/50 hover:bg-deep text-white backdrop-blur-md transition-all"
                    >
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <div className="absolute bottom-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-semibold">
                      {currentSlide + 1} / {galleryList.length}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-white text-sm text-center p-8">
                <Images className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>В галерею пока не добавлены фотографии.</p>
              </div>
            )
          )}

        </div>

        {/* Modal Description */}
        {lesson.description && (
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[150px] sm:max-h-[200px] bg-cream flex-shrink-0">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-dark mb-2 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Описание материала</span>
            </h4>
            <p className="text-sm text-deep leading-relaxed whitespace-pre-line">
              {lesson.description}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
