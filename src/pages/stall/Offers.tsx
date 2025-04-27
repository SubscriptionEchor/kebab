import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, X, Save, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

interface Offer {
  id: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  code: string;
}

export default function StallOffers() {
  const { t } = useTranslation();
  const { stallId } = useParams();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderValue: '',
    startDate: dayjs(),
    endDate: dayjs().add(7, 'day'),
    code: ''
  });

  useEffect(() => {
    // In a real app, fetch offers from API
    // For now, using mock data
    const mockOffers: Offer[] = [
      {
        id: '1',
        title: 'Summer Special',
        description: '20% off on all items',
        discountType: 'percentage',
        discountValue: 20,
        minOrderValue: 30,
        startDate: '2024-06-01T00:00:00Z',
        endDate: '2024-08-31T23:59:59Z',
        isActive: true,
        code: 'SUMMER20'
      },
      {
        id: '2',
        title: 'Welcome Discount',
        description: '€5 off on your first order',
        discountType: 'fixed',
        discountValue: 5,
        minOrderValue: 20,
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
        isActive: true,
        code: 'WELCOME5'
      }
    ];
    setOffers(mockOffers);
    setIsLoading(false);
  }, [stallId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: dayjs.Dayjs | null) => {
    if (value) {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAddOffer = async () => {
    try {
      // In a real app, make API call to add offer
      const newOffer: Offer = {
        id: Math.random().toString(),
        title: formData.title,
        description: formData.description,
        discountType: formData.discountType as 'percentage' | 'fixed',
        discountValue: parseFloat(formData.discountValue),
        minOrderValue: parseFloat(formData.minOrderValue),
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        isActive: true,
        code: formData.code
      };
      setOffers(prev => [...prev, newOffer]);
      setShowAddModal(false);
      resetForm();
      toast.success(t('offers.added'));
    } catch (error) {
      toast.error(t('offers.addfailed'));
    }
  };

  const handleEditOffer = async () => {
    if (!editingOffer) return;
    try {
      // In a real app, make API call to update offer
      setOffers(prev =>
        prev.map(offer =>
          offer.id === editingOffer.id
            ? {
                ...offer,
                title: formData.title,
                description: formData.description,
                discountType: formData.discountType as 'percentage' | 'fixed',
                discountValue: parseFloat(formData.discountValue),
                minOrderValue: parseFloat(formData.minOrderValue),
                startDate: formData.startDate.toISOString(),
                endDate: formData.endDate.toISOString(),
                code: formData.code
              }
            : offer
        )
      );
      setEditingOffer(null);
      setShowAddModal(false);
      resetForm();
      toast.success(t('offers.updated'));
    } catch (error) {
      toast.error(t('offers.updatefailed'));
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm(t('offers.deleteconfirm'))) return;
    try {
      // In a real app, make API call to delete offer
      setOffers(prev => prev.filter(offer => offer.id !== offerId));
      toast.success(t('offers.deleted'));
    } catch (error) {
      toast.error(t('offers.deletefailed'));
    }
  };

  const handleToggleStatus = async (offerId: string) => {
    try {
      // In a real app, make API call to toggle status
      setOffers(prev =>
        prev.map(offer =>
          offer.id === offerId
            ? { ...offer, isActive: !offer.isActive }
            : offer
        )
      );
      toast.success(t('offers.statusupdated'));
    } catch (error) {
      toast.error(t('offers.statusupdatefailed'));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderValue: '',
      startDate: dayjs(),
      endDate: dayjs().add(7, 'day'),
      code: ''
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return null;
} 