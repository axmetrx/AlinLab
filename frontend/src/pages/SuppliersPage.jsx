import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Truck, Sparkles, MessageSquare, PhoneCall, ChevronLeft, ChevronRight, X, ExternalLink } from 'lucide-react';

export const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('supplier'); // 'supplier' or 'illiquid'
  const [selectedSupplier, setSelectedSupplier] = useState(null); // Detail page view
  const [zoomPhotoUrl, setZoomPhotoUrl] = useState(null); // Fullscreen photo viewer state

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/student/suppliers');
      setSuppliers(res.data);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-3 border-rose-light border-t-rose animate-spin" />
        <p className="text-sm text-deep-muted font-medium">Загрузка...</p>
      </div>
    );
  }

  // SCREEN 3: Fullscreen Zoom Photo Viewer Modal
  const renderPhotoModal = () => {
    if (!zoomPhotoUrl) return null;
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in"
        onClick={() => setZoomPhotoUrl(null)}
      >
        <button 
          onClick={() => setZoomPhotoUrl(null)} 
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <img 
          src={zoomPhotoUrl} 
          alt="Supplier Full Size" 
          className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    );
  };

  // SCREEN 2: Detailed Supplier View
  if (selectedSupplier) {
    return (
      <div className="max-w-lg mx-auto bg-white min-h-[calc(100vh-64px)] animate-fade-in pb-24 md:pb-8 flex flex-col relative">
        {renderPhotoModal()}

        {/* Cover Banner */}
        <div className="w-full aspect-[16/9] bg-gradient-to-tr from-[#00DECC] to-[#00A1FC] relative">
          <button
            onClick={() => setSelectedSupplier(null)}
            className="absolute top-4 left-4 p-2 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md rounded-full transition-colors z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Supplier Photo Overlapping the Banner */}
          <div className="absolute -bottom-12 left-6 z-10 flex items-end space-x-4">
            <div 
              onClick={() => selectedSupplier.photo_url && setZoomPhotoUrl(selectedSupplier.photo_url)}
              className={`w-24 h-24 rounded-2xl border-4 border-white overflow-hidden shadow-lg bg-white flex-shrink-0 ${
                selectedSupplier.photo_url ? 'cursor-zoom-in' : ''
              }`}
            >
              {selectedSupplier.photo_url ? (
                <img 
                  src={selectedSupplier.photo_url} 
                  alt={selectedSupplier.name} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-2xl bg-gradient-to-tr from-[#00DECC] to-[#00A1FC] text-white">
                  {selectedSupplier.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Supplier Header Info */}
        <div className="mt-14 px-6 space-y-2">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-deep">{selectedSupplier.name}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-semibold text-rose-dark bg-rose-light px-3 py-1 rounded-full">
              {selectedSupplier.category === 'supplier' ? 'Поставщик' : 'Неликвидчик'}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              Проверен
            </span>
          </div>
        </div>

        {/* Details and Description */}
        <div className="px-6 mt-6 space-y-6 flex-1">
          <div className="space-y-2.5">
            <h3 className="text-xs uppercase font-bold text-deep-light tracking-wider">Описание и Условия работы</h3>
            <div className="bg-cream border border-cream-border p-5 rounded-2xl shadow-sm">
              <p className="text-[13px] text-deep leading-relaxed whitespace-pre-line">
                {selectedSupplier.description || 'Описание отсутствует.'}
              </p>
            </div>
          </div>

          {/* Supplier Contacts List */}
          {selectedSupplier.contacts && (
            <div className="space-y-3 pt-4 border-t border-cream-border/60">
              <h3 className="text-xs uppercase font-bold text-deep-light tracking-wider">Контакты для связи</h3>
              
              <div className="space-y-2">
                {selectedSupplier.contacts.includes('http') ? (
                  <a
                    href={selectedSupplier.contacts}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-[#00A1FC] to-[#00DECC] text-white rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="w-5 h-5" />
                      <span className="text-sm font-semibold">Написать напрямую</span>
                    </div>
                    <ExternalLink className="w-4 h-4 opacity-95" />
                  </a>
                ) : (
                  <div className="w-full flex items-center justify-between p-4 bg-cream rounded-2xl border border-cream-border text-deep">
                    <div className="flex items-center space-x-3">
                      <PhoneCall className="w-5 h-5 text-deep-light" />
                      <span className="text-sm font-semibold">{selectedSupplier.contacts}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center py-6 text-[10px] text-deep-light">
          Добавлено {new Date(selectedSupplier.created_at).toLocaleDateString('ru-RU')}
        </div>
      </div>
    );
  }

  // SCREEN 1: Suppliers Flat List
  const filteredSuppliers = suppliers.filter(s => s.category === activeSubTab);

  return (
    <div className="max-w-lg mx-auto bg-white min-h-[calc(100vh-64px)] animate-fade-in pb-28 md:pb-8 flex flex-col">
      {renderPhotoModal()}

      {/* Page Title */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold text-deep">Партнёры</h1>
        <p className="text-[13px] text-deep-muted mt-1 leading-snug">
          Полезные контакты и проверенные поставщики
        </p>
      </div>

      {/* Selector Tabs (Поставщики / Неликвидчики) */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-2 gap-2 bg-cream-dark p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('supplier')}
            className={`py-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === 'supplier'
                ? 'bg-white text-deep shadow-sm'
                : 'text-deep-muted hover:text-deep'
            }`}
          >
            Поставщики
          </button>
          <button
            onClick={() => setActiveSubTab('illiquid')}
            className={`py-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === 'illiquid'
                ? 'bg-white text-deep shadow-sm'
                : 'text-deep-muted hover:text-deep'
            }`}
          >
            Неликвидчики
          </button>
        </div>
      </div>

      {/* Supplier List */}
      <div className="px-5 flex-1 space-y-4">
        {filteredSuppliers.length === 0 ? (
          <div className="text-center py-16 bg-cream rounded-2xl border border-cream-border">
            <Truck className="w-10 h-10 text-deep-light mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-deep">Список пока пуст</p>
            <p className="text-xs text-deep-muted mt-1">Скоро администратор добавит новые контакты.</p>
          </div>
        ) : (
          filteredSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              onClick={() => setSelectedSupplier(supplier)}
              className="bg-white border border-cream-border rounded-3xl p-4 shadow-soft space-y-3.5 hover:shadow-md transition-shadow active:scale-[0.99] cursor-pointer flex flex-col"
            >
              {/* Card Header (Photo + Name) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3.5 min-w-0">
                  {/* Photo Thumbnail */}
                  <div 
                    onClick={(e) => {
                      if (supplier.photo_url) {
                        e.stopPropagation(); // Prevent opening detail view on thumbnail click
                        setZoomPhotoUrl(supplier.photo_url);
                      }
                    }}
                    className={`w-12 h-12 rounded-xl overflow-hidden bg-cream-dark flex-shrink-0 shadow-sm border border-cream-border/60 ${
                      supplier.photo_url ? 'cursor-zoom-in' : ''
                    }`}
                  >
                    {supplier.photo_url ? (
                      <img 
                        src={supplier.photo_url} 
                        alt={supplier.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-deep-light font-bold text-sm bg-gradient-to-tr from-[#00DECC] to-[#00A1FC] text-white">
                        {supplier.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  {/* Supplier Details */}
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-bold text-deep leading-tight truncate">
                      {supplier.name}
                    </h3>
                    <p className="text-[10px] text-deep-muted mt-0.5 font-medium">Поставщик и партнёр</p>
                  </div>
                </div>
                
                {/* Arrow indicator */}
                <ChevronRight className="w-4.5 h-4.5 text-deep-light flex-shrink-0" />
              </div>

              {/* Description preview */}
              {supplier.description && (
                <p className="text-xs text-deep-muted line-clamp-2 leading-relaxed bg-cream p-3 rounded-2xl border border-cream-border/40">
                  {supplier.description}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
