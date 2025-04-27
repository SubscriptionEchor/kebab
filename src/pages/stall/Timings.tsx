import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_STALL } from '../../lib/graphql/queries/stalls';
import { UPDATE_STALL_TIMINGS } from '../../lib/graphql/mutations/stalls';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import LoadingState from '../../components/LoadingState';
import { Clock } from 'lucide-react';

interface OpeningTime {
  day: string;
  open: string;
  close: string;
  isOpen: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Timings() {
  const { t } = useTranslation();
  const { stallId } = useParams();
  const [openingTimes, setOpeningTimes] = useState<OpeningTime[]>([]);

  const { loading } = useQuery(GET_STALL, {
    variables: { id: stallId },
    onCompleted: (data) => {
      if (data?.stall?.openingTimes) {
        setOpeningTimes(data.stall.openingTimes);
      } else {
        // Initialize with default times if none exist
        setOpeningTimes(
          DAYS.map((day) => ({
            day,
            open: '09:00',
            close: '17:00',
            isOpen: true,
          }))
        );
      }
    },
  });

  const [updateTimings] = useMutation(UPDATE_STALL_TIMINGS, {
    onCompleted: () => {
      toast.success(t('timings.timingsupdated'));
    },
    onError: (error) => {
      console.error('Failed to update timings:', error);
      toast.error(t('timings.failedtoupdatetimings'));
    },
  });

  const handleTimeChange = (index: number, field: 'open' | 'close', value: string) => {
    const newTimes = [...openingTimes];
    newTimes[index] = { ...newTimes[index], [field]: value };
    setOpeningTimes(newTimes);
  };

  const handleIsOpenChange = (index: number) => {
    const newTimes = [...openingTimes];
    newTimes[index] = { ...newTimes[index], isOpen: !newTimes[index].isOpen };
    setOpeningTimes(newTimes);
  };

  const handleSave = async () => {
    try {
      await updateTimings({
        variables: {
          stallId,
          openingTimes,
        },
      });
    } catch (error) {
      console.error('Error updating timings:', error);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{t('timings.openinghours')}</h1>
        <button
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
        >
          <Clock className="h-4 w-4 mr-2" />
          {t('common.save')}
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('timings.day')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('timings.open')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('timings.close')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('timings.status')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {openingTimes.map((time, index) => (
              <tr key={time.day}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {t(`timings.${time.day.toLowerCase()}`)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <input
                    type="time"
                    value={time.open}
                    onChange={(e) => handleTimeChange(index, 'open', e.target.value)}
                    disabled={!time.isOpen}
                    className="rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm disabled:bg-gray-100"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <input
                    type="time"
                    value={time.close}
                    onChange={(e) => handleTimeChange(index, 'close', e.target.value)}
                    disabled={!time.isOpen}
                    className="rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm disabled:bg-gray-100"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <button
                      onClick={() => handleIsOpenChange(index)}
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 ${
                        time.isOpen ? 'bg-brand-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                          time.isOpen ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="ml-3">
                      {time.isOpen ? t('timings.open') : t('timings.closed')}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 