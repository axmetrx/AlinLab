import React from 'react';
import { X, Play, Sparkles } from 'lucide-react';

export const VideoModal = ({ lesson, onClose }) => {
  if (!lesson) return null;

  const getEmbedUrl = (url) => {
    if (!url) return '';
    
    // YouTube
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    // Direct MP4 or iframe
    return url;
  };

  const embedUrl = getEmbedUrl(lesson.video_url);
  const isDirectVideo = lesson.video_url?.endsWith('.mp4') || lesson.video_url?.endsWith('.webm');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-cream rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-cream-border flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 bg-cream-card flex items-center justify-between border-b border-cream-border">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-rose-light text-rose-dark flex items-center justify-center">
              <Play className="w-4 h-4 fill-rose-dark" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-deep leading-tight truncate max-w-md">
                {lesson.title}
              </h3>
              <p className="text-xs text-deep-muted">Просмотр видеоурока</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-deep-muted hover:text-deep hover:bg-cream-border/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Container */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          {isDirectVideo ? (
            <video
              src={lesson.video_url}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          ) : (
            <iframe
              src={embedUrl}
              title={lesson.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>

        {/* Modal Description */}
        <div className="p-6 overflow-y-auto max-h-[200px] bg-cream">
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-dark mb-2 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Описание материала</span>
          </h4>
          <p className="text-sm text-deep leading-relaxed whitespace-pre-line">
            {lesson.description || 'Описание к данному уроку пока не добавлено.'}
          </p>
        </div>

      </div>
    </div>
  );
};
