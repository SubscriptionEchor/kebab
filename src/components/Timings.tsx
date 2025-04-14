import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";


export default function TimingsComponent({ timings, daysOfWeek, handleToggleDay, handleTimeChange }) {
    const { t } = useTranslation();
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
                <div className="space-y-4">
                    {daysOfWeek.map((day) => (
                        <div
                            key={day}
                            className={`grid grid-cols-[200px_1fr] gap-6 p-4 rounded-lg ${timings[day]?.isOpen ? 'bg-white' : 'bg-gray-50'}`}
                        >
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`open-${day}`}
                                        checked={timings[day]?.isOpen}
                                        onChange={() => handleToggleDay(day)}
                                        className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                    />
                                    <label
                                        htmlFor={`open-${day}`}
                                        className="ml-2 block text-sm font-medium text-gray-900"
                                    >
                                        {t(`timings.${day?.toLowerCase()}`)}
                                    </label>
                                </div>
                            </div>

                            {timings[day]?.isOpen ? (
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="time"
                                            value={timings[day]?.startTime}
                                            onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                                            className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-shadow"
                                        />
                                    </div>
                                    <span className="text-gray-500">{t('timings.to')}</span>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="time"
                                            value={timings[day].endTime}
                                            onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                                            className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-shadow"
                                        />
                                    </div>
                                    <span className={`text-sm font-medium ${timings[day].isOpen ? 'text-green-600' : 'text-gray-500'}`}>
                                        {timings[day].isOpen ? t('timings.open') : t('timings.closed')}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-500">{t('timings.closed')}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}