import { useTranslation } from "react-i18next";


export default function RatingsComponent({ isEditing, formData, setFormData }) {
    const { t } = useTranslation();
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('ratings.averagerating')}</h3>
                        {isEditing ? (
                            <input
                                type="number"
                                min="0"
                                max="5"
                                step="0.1"
                                value={formData.reviewAverage}
                                placeholder="Ratings"
                                onChange={(e) => setFormData(prev => ({ ...prev, reviewAverage: parseFloat(e.target.value) }))}
                                className="w-24 px-3 py-2 text-center text-sm  text-brand-primary border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                            />
                        ) : (
                            <p className="text-3xl font-bold text-brand-primary">
                                {formData.reviewAverage?.toFixed(1) || '0.0'}
                            </p>
                        )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('ratings.totalreviews')}</h3>
                        {isEditing ? (
                            <input
                                type="number"
                                min="0"
                                value={formData.reviewCount}
                                placeholder="Reviews"
                                onChange={(e) => setFormData(prev => ({ ...prev, reviewCount: parseInt(e.target.value) }))}
                                className="w-24 px-3 py-2 text-center text-sm  font-bold text-brand-primary border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                            />
                        ) : (
                            <p className="text-3xl font-bold text-brand-primary">
                                {formData.reviewCount?.toLocaleString() || '0'}
                            </p>
                        )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('ratings.googlemapslink')}</h3>
                        {isEditing ? (
                            <input
                                type="url"
                                value={formData.googleMapLink}
                                onChange={(e) => setFormData(prev => ({ ...prev, googleMapLink: e.target.value }))}
                                placeholder={t('ratings.entergooglemapslink')}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                            />
                        ) : (
                            <a
                                href={formData.googleMapLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-primary hover:text-brand-primary/80 text-sm break-all"
                            >
                                {formData.googleMapLink || t('ratings.notset')}
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}