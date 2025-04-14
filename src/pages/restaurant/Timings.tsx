import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_RESTAURANT, GET_RESTAURANT_TIMINGS } from '../../lib/graphql/queries/restaurants';
import { UPDATE_TIMINGS } from '../../lib/graphql/mutations/timings';
import { Clock, Save } from 'lucide-react';
import { toast } from 'sonner';
import LoadingState from '../../components/LoadingState';
import { useTranslation } from 'react-i18next';
import { GET_RESTAURANT_APPLICATIONS } from '../../lib/graphql/queries/onboarding';
import TimingsComponent from '../../components/Timings';

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

interface TimingState {
  isOpen: boolean;
  startTime: string;
  endTime: string;
}

type WeeklyTimings = Record<string, TimingState>;

export default function RestaurantTimings() {
  const { t } = useTranslation();
  const { restaurantId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateTimings] = useMutation(UPDATE_TIMINGS, {
    onCompleted: () => {
      // toast.success(t('timings.timingsupdated'));
    },
    onError: (error) => {
      toast.dismiss();
      console.error('Failed to update timings:', error);
      toast.error(t('timings.failedtoupdatetimings'));
    }
  });

  const [timings, setTimings] = useState<WeeklyTimings>(
    daysOfWeek.reduce((acc, day) => ({
      ...acc,
      [day]: {
        isOpen: true,
        startTime: '',
        endTime: ''
      }
    }), {})
  );

  // Helper function to convert array time to string format
  const formatTimeArray = (timeArray: string[] | undefined): string => {
    if (!timeArray || timeArray.length < 2) return '00:00';
    return `${timeArray[0].padStart(2, '0')}:${timeArray[1].padStart(2, '0')}`;
  };

  // Helper function to convert day abbreviation to full name
  const getDayName = (abbr: string): string => {
    const dayMap: Record<string, string> = {
      'MON': 'Monday',
      'TUE': 'Tuesday',
      'WED': 'Wednesday',
      'THU': 'Thursday',
      'FRI': 'Friday',
      'SAT': 'Saturday',
      'SUN': 'Sunday'
    };
    return dayMap[abbr] || abbr;
  };

  // Helper function to format time string
  const formatTimeString = (time: string) => {
    if (!time) return '09:00';
    if (time.includes(':')) return time;
    try {
      const hours = time.substring(0, 2);
      const minutes = time.substring(2, 4);
      return `${hours}:${minutes}`;
    } catch (e) {
      console.warn('Invalid time format:', time);
      return '09:00';
    }
  };

  const { data, loading, error } = useQuery(GET_RESTAURANT_TIMINGS, {
    variables: { id: restaurantId },
    fetchPolicy: 'cache-and-network',
    onError: (error) => {
      console.error('Failed to fetch restaurant timings:', error);
      toast.error(t('timings.failedtoloadtimings'));
    },

  });

  useEffect(() => {
    if (data?.restaurant?.openingTimes) {
      try {
        const daysObj = {
          MON: 'Monday',
          TUE: 'Tuesday',
          WED: 'Wednesday',
          THU: 'Thursday',
          FRI: 'Friday',
          SAT: 'Saturday',
          SUN: 'Sunday'
        };
        let res = Object.keys(daysObj).reduce((acc, key) => {
          acc[daysObj[key]] = { isOpen: false, startTime: '', endTime: '' };
          return acc;
        }, {} as WeeklyTimings);


        const formattedOpeningTimes = data?.restaurant?.openingTimes?.length > 0
          ? [...data.restaurant.openingTimes, ...Array(7).fill(null)].slice(0, 7)
          : [];

        formattedOpeningTimes.forEach(item => {
          if (item) {
            let times = {} as TimingState;
            if (item?.times && item?.times.length > 0) {
              item?.times.forEach((time) => {
                let isTrue = time?.startTime?.length === 1;
                if (isTrue) {
                  times = { startTime: `${time?.startTime[0]}`, endTime: `${time?.endTime[0]}`, isOpen: item?.isOpen };
                } else if (time?.startTime?.length === 2) {
                  times = { startTime: `${time?.startTime[0]}:${time?.startTime[1]}`, endTime: `${time?.endTime[0]}:${time?.endTime[1]}`, isOpen: item?.isOpen };
                } else {
                  times = { isOpen: false, startTime: '', endTime: '' };
                }
              });
            } else {
              times = { isOpen: false, startTime: '', endTime: '' };
            }
            res[daysObj[item?.day]] = times;
          }
        });

        setTimings(res);
      } catch (error) {
        console.error('Error parsing opening times:', error);
        toast.error(t('timings.errorloadingopeningtimes'));
      }
    }
  }, [data, t]);

  const validateTimeRange = (startTime: string, endTime: string): boolean => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const today = new Date();
    const startDate = new Date(today.setHours(startHours, startMinutes, 0));
    const endDate = new Date(today.setHours(endHours, endMinutes, 0));

    return startDate < endDate;
  };

  const handleTimeChange = (day: string, field: 'startTime' | 'endTime', value: string) => {
    setTimings(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleToggleDay = (day: string) => {
    setTimings(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen
      }
    }));
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    for (const day of daysOfWeek) {
      const { isOpen, startTime, endTime } = timings[day];
      if (isOpen) {
        if (!startTime || !endTime) {
          toast.dismiss();
          toast.error(t('timings.setbothstartandend', { day }));
          setIsSubmitting(false);
          return;
        }
        const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
        const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
        if (startMinutes >= endMinutes) {
          toast.dismiss();
          toast.error(t('timings.endtimeafterstart', { day }));
          setIsSubmitting(false);
          return;
        }
      }
    }
    try {
      const formattedTimings = Object.entries(timings).map(([day, timing]) => ({
        day: day.substring(0, 3).toUpperCase(),
        isOpen: timing.isOpen,
        times: timing.isOpen ? [{
          startTime: timing.startTime.split(':'),
          endTime: timing.endTime.split(':')
        }] : []
      }));

      await updateTimings({
        variables: {
          id: restaurantId,
          openingTimes: formattedTimings
        }
      });

      toast.success(t('timings.timingsupdated'));
    } catch (error) {
      console.error('Failed to update timings:', error);
      toast.error(t('timings.failedtoupdatetimings'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{t('timings.title')}</h1>
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? t('timings.saving') : t('timings.savechanges')}
        </button>
      </div>

      {error ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 text-center">
            <p className="text-red-500 font-medium">{t('timings.failedtoloadtimings')}</p>
            <p className="text-gray-600 text-sm mt-2">
              {t('timings.errorloadingtimings')}
            </p>
          </div>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <LoadingState rows={7} />
          </div>
        </div>
      ) : (
        <TimingsComponent timings={timings} daysOfWeek={daysOfWeek} handleTimeChange={handleTimeChange} handleToggleDay={handleToggleDay} />
      )}
    </div>
  );
}
