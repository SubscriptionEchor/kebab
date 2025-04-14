import { useState } from 'react';
import { Clock, Save } from 'lucide-react';
import { toast } from 'sonner';

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

interface TimingState {
  isOpen: boolean;
  startTime: string;
  endTime: string;
}

type WeeklyTimings = Record<string, TimingState>;

export default function VendorTimings() {
  const [timings, setTimings] = useState<WeeklyTimings>(
    daysOfWeek.reduce((acc, day) => ({
      ...acc,
      [day]: {
        isOpen: true,
        startTime: '09:00',
        endTime: '22:00',
      },
    }), {})
  );

  const handleTimeChange = (day: string, field: 'startTime' | 'endTime', value: string) => {
    setTimings(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleToggleDay = (day: string) => {
    setTimings(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen,
      },
    }));
  };

  const handleSave = () => {
    // Validate timings
    for (const day of daysOfWeek) {
      const { isOpen, startTime, endTime } = timings[day];
      if (isOpen) {
        if (!startTime || !endTime) {
          toast.error(`Please set both start and end time for ${day}`);
          return;
        }
        if (startTime >= endTime) {
          toast.error(`End time must be after start time for ${day}`);
          return;
        }
      }
    }

    toast.success('Restaurant timings updated successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Restaurant Timings</h1>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="space-y-4">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className={`grid grid-cols-[200px_1fr] gap-6 p-4 rounded-lg ${
                  timings[day].isOpen ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`open-${day}`}
                      checked={timings[day].isOpen}
                      onChange={() => handleToggleDay(day)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                    />
                    <label
                      htmlFor={`open-${day}`}
                      className="ml-2 block text-sm font-medium text-gray-900"
                    >
                      {day}
                    </label>
                  </div>
                </div>

                {timings[day].isOpen ? (
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="time"
                        value={timings[day].startTime}
                        onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                        className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-shadow"
                      />
                    </div>
                    <span className="text-gray-500">to</span>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="time"
                        value={timings[day].endTime}
                        onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                        className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-shadow"
                      />
                    </div>
                    <span className={`text-sm font-medium ${
                      timings[day].isOpen ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {timings[day].isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500">Closed</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}