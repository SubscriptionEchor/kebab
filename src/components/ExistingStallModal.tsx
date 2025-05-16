import { useState, useEffect, useMemo } from 'react';
import { X, Search, Edit, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Stall {
  id: string;
  name: string;
  cuisine: string;
  profilePhoto: string;
  timings: {
    [key: string]: {
      startTime: string;
      endTime: string;
      isOpen: boolean;
    };
  };
}

interface ExistingStallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (stall: Stall) => void;
  onEdit: (stall: Stall) => void;
}

export default function ExistingStallModal({
  isOpen,
  onClose,
  onAdd,
  onEdit
}: ExistingStallModalProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const dayAbbreviations: { [key: string]: string } = {
    monday: t('days.mon'),
    tuesday: t('days.tue'),
    wednesday: t('days.wed'),
    thursday: t('days.thu'),
    friday: t('days.fri'),
    saturday: t('days.sat'),
    sunday: t('days.sun'),
  };

  // Mock data - replace with actual API call
  const [allStalls] = useState<Stall[]>([
    {
      id: '1',
      name: 'Taco Stand',
      cuisine: 'Mexican',
      profilePhoto: '/images/default-stall.png',
      timings: {
        monday: { startTime: '10:00', endTime: '18:00', isOpen: true },
        tuesday: { startTime: '10:00', endTime: '18:00', isOpen: true },
        wednesday: { startTime: '10:00', endTime: '18:00', isOpen: true },
        thursday: { startTime: '10:00', endTime: '18:00', isOpen: true },
        friday: { startTime: '10:00', endTime: '18:00', isOpen: true },
        saturday: { startTime: '10:00', endTime: '18:00', isOpen: true },
        sunday: { startTime: '10:00', endTime: '18:00', isOpen: true }
      }
    }
  ]);

  const filteredStalls = useMemo(() => {
    const terms = debouncedSearchQuery.toLowerCase().trim().split(/\s+/);
    return allStalls.filter(s => {
      if (!terms[0]) return true;
      const data = `${s.name} ${s.cuisine} ${Object.entries(s.timings)
        .filter(([,tim]) => tim.isOpen)
        .map(([d,t]) => `${d} ${t.startTime} ${t.endTime}`)
        .join(' ')}`.toLowerCase();
      return terms.every(term => data.includes(term));
    });
  }, [debouncedSearchQuery, allStalls]);

  const handleStallSelect = (stall: Stall) => {
    setSelectedStall(prev => prev?.id === stall.id ? null : stall);
  };

  const handleAdd = () => {
    if (selectedStall) {
      onAdd(selectedStall);
      setSelectedStall(null);
      setSearchQuery('');
      onClose();
    }
  };

  const handleEdit = () => {
    if (selectedStall) {
      onEdit(selectedStall);
      setSelectedStall(null);
      setSearchQuery('');
      onClose();
    }
  };

  const formatTimings = (timings: Stall['timings']) => {
    const groups: Record<string, string[]> = {};
    Object.entries(timings).forEach(([day,t]) => {
      if (!t.isOpen) return;
      const key = `${t.startTime}-${t.endTime}`;
      (groups[key] ||= []).push(day);
    });
    return Object.entries(groups).map(([time, days]) => {
      const [start,end] = time.split('-');
      const ranges: string[] = [];
      const order = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
      let startDay = days[0], prev = days[0];
      days.sort((a,b)=>order.indexOf(a)-order.indexOf(b));
      for (let i=1;i<=days.length;i++){
        const curr = days[i];
        if (i===days.length || order.indexOf(curr)!==order.indexOf(prev)+1) {
          ranges.push(
            prev===startDay
              ? dayAbbreviations[startDay]
              : `${dayAbbreviations[startDay]} - ${dayAbbreviations[prev]}`
          );
          startDay = curr;
        }
        prev = curr;
      }
      return { days: ranges, time: `${start} - ${end}` };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
      <div className="min-h-screen w-full py-8 px-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full relative flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('existingStallModal.title')}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>
          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              {/* Search */}
              <div className="sticky top-0 bg-white pb-4 z-10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder={t('existingStallModal.searchPlaceholder')}
                    value={searchQuery}
                    onChange={e=>setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>
              {/* Stalls List */}
              {filteredStalls.length > 0 ? (
                <div className="space-y-2">
                  {filteredStalls.map(stall=>(
                    <div
                      key={stall.id}
                      onClick={()=>handleStallSelect(stall)}
                      className={`p-4 rounded-lg border cursor-pointer transition ${
                        selectedStall?.id===stall.id
                          ? 'border-brand-primary bg-brand-primary/5'
                          : 'border-gray-200 hover:border-brand-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img src={stall.profilePhoto} alt={stall.name}
                               className="h-12 w-12 rounded-full object-cover" />
                          <div>
                            <h3 className="font-medium text-gray-900">{stall.name}</h3>
                            <p className="text-sm text-gray-500">{stall.cuisine}</p>
                          </div>
                        </div>
                        {selectedStall?.id===stall.id && (
                          <div className="flex items-center text-brand-primary text-sm">
                            <span className="mr-2">{t('existingStallModal.selected')}</span>
                            <div className="h-2 w-2 rounded-full bg-brand-primary" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {t('existingStallModal.noResults')}
                </div>
              )}
              {/* Details */}
              {selectedStall && (
                <div className="bg-gray-50 rounded-lg p-6 mt-6">
                  <h3 className="font-medium text-gray-900 text-lg mb-6">
                    {t('existingStallModal.detailsTitle')}
                  </h3>
                  <div className="space-y-8">
                    <div className="flex bg-white p-6 rounded-lg border border-gray-200 gap-8">
                      <div className="flex-shrink-0">
                        <img
                          src={selectedStall.profilePhoto} alt=""
                          className="h-32 w-32 rounded-lg object-cover border shadow-sm"
                        />
                        <p className="text-xs text-gray-500 text-center mt-2">
                          {t('existingStallModal.profilePhoto')}
                        </p>
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-gray-700 border-b pb-2 mb-4">
                          {t('existingStallModal.basicDetails')}
                        </h4>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <p className="text-sm text-gray-500">{t('existingStallModal.stallName')}</p>
                            <p className="font-medium">{selectedStall.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t('existingStallModal.cuisine')}</p>
                            <p className="font-medium">{selectedStall.cuisine}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t('existingStallModal.stallId')}</p>
                            <p className="font-medium">{selectedStall.id}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-700 border-b pb-2 mb-4">
                        {t('existingStallModal.operatingHours')}
                      </h4>
                      <div className="space-y-3">
                        {formatTimings(selectedStall.timings).map((grp, i)=>(
                          <div key={i} className="flex items-center gap-4">
                            <div className="w-[180px]"><span className="font-medium">{grp.days.join(', ')}</span></div>
                            <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">{grp.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t bg-white">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              {t('common.cancel')}
            </button>
            {selectedStall && (
              <>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" /> {t('existingStallModal.editAdd')}
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> {t('existingStallModal.addEvent')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
