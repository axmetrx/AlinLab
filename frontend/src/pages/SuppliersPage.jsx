import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Truck, Sparkles, UserCheck, MessageSquare, PhoneCall } from 'lucide-react';

export const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('supplier'); // 'supplier' or 'illiquid'

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

  const filteredSuppliers = suppliers.filter(s => s.category === activeSubTab);

  return (
    <div className="max-w-lg mx-auto bg-white min-h-[calc(100vh-64px)] animate-fade-in pb-28 md:pb-8 flex flex-col">
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
              className="bg-white border border-cream-border rounded-2xl p-4 shadow-soft space-y-4 hover:shadow-md transition-shadow"
            >
              {/* Card Header (Photo + Name) */}
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-cream-dark flex-shrink-0">
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
                <div className="min-w-0">
                  <h3 className="text-[14px] font-bold text-deep leading-tight truncate">
                    {supplier.name}
                  </h3>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="text-[10px] font-semibold text-rose-dark bg-rose-light px-2.5 py-0.5 rounded-full">
                      {supplier.category === 'supplier' ? 'Поставщик' : 'Неликвид'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {supplier.description && (
                <p className="text-xs text-deep-muted leading-relaxed whitespace-pre-line bg-cream p-3 rounded-xl border border-cream-border/40">
                  {supplier.description}
                </p>
              )}

              {/* Contacts section */}
              {supplier.contacts && (
                <div className="pt-1.5 border-t border-cream-border/60">
                  <p className="text-[10px] uppercase font-bold text-deep-light tracking-wider mb-2">Контакты для связи</p>
                  <div className="flex flex-wrap gap-2">
                    {supplier.contacts.includes('http') ? (
                      <a
                        href={supplier.contacts}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-[#00A1FC] to-[#00DECC] text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow-md transition-shadow"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Написать сообщение</span>
                      </a>
                    ) : (
                      <div className="inline-flex items-center space-x-1.5 px-3 py-2 bg-cream-dark text-deep rounded-xl text-xs font-semibold">
                        <PhoneCall className="w-3.5 h-3.5 text-deep-light" />
                        <span>{supplier.contacts}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
