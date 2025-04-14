import { useEffect, useRef, useState } from "react";

import RestaurantProfileView from "./profile/RestaurantProfileView";
import { useMutation, useQuery } from "@apollo/client";
import { GET_CUISINES } from "../lib/graphql/queries/cuisines";
import CuisineModal from "./profile/CuisineModal";
import { PlusIcon, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import MapsComponent from "./Maps";
import RatingsComponent from "./Ratings";
import TimingsComponent from "./Timings";
import { CREATE_RESTAURANT } from "../lib/graphql/queries/restaurants";
import { uploadImage } from "../lib/api/upload";
import { toast } from "sonner";
import { useZones } from "../contexts/ZonesContext";


export default function AddNewRestaurant({ setRestaurantsList, isOpen, setIsOpen, newRestaurant }) {
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
    interface FileWithPreview extends File {
        preview?: string;
    }
    interface ErrorsMap {
        [key: string]: string;
    }
    const [formData, setFormData] = useState({
        // email: '',
        // phone: '',
        name: '',
        address: '',
        cuisines: [] as string[],

    });

    const [restaurantImage, setRestaurantImage] = useState<FileWithPreview | null>(null);
    const [restaurantLogo, setRestaurantLogo] = useState<FileWithPreview | null>(null);
    const [showCuisineModal, setShowCuisineModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidZone, setIsValidZone] = useState(false);
    const [position, setPosition] = useState<[number, number]>([52.5200, 13.4050]);
    const [errors, setErrors] = useState<ErrorsMap>({});
    const { operationalZones } = useZones()
    const [timings, setTimings] = useState<WeeklyTimings>(
        daysOfWeek.reduce((acc, day) => ({
            ...acc,
            [day]: {
                isOpen: false,
                startTime: '',
                endTime: ''
            }
        }), {})
    );
    const { t } = useTranslation();
    const modalRef = useRef(null);

    const [CREATE_NEW_RESTAURANT] = useMutation(CREATE_RESTAURANT)


    useEffect(() => {
        if (operationalZones?.length) {
            setPosition([
                operationalZones[0]?.fallBackCoordinates?.latitude,
                operationalZones[0]?.fallBackCoordinates?.longitude
            ])
        }

    }, [operationalZones])
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClickClear()
                setIsOpen(false); // Close the modal
            }
        };

        // Attach event listener
        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup event listener on component unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const { data: cuisinesData, loading: cuisinesLoading, error: cuisinesError } = useQuery(GET_CUISINES);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleImageChange = (type: 'image' | 'logo', file: any) => {
        if (type === 'image') {
            setRestaurantImage(file);
        } else {
            setRestaurantLogo(file);
        }
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
    const onClickClear = () => {
        setFormData({
            // phone: '',
            name: '',
            address: '',
            cuisines: [] as string[]

        });
        setRestaurantImage(null);
        setRestaurantLogo(null);
        setShowCuisineModal(false);
        setIsSubmitting(false);
        setIsValidZone(false);
        setPosition([52.5200, 13.4050]);
        setTimings(
            daysOfWeek.reduce((acc, day) => ({
                ...acc,
                [day]: {
                    isOpen: false,
                    startTime: '',
                    endTime: ''
                }
            }), {})
        )
        setErrors({})
        setIsOpen(false)
    }
    const validations = () => {
        const errors = {};
        const { name, address, cuisines } = formData;

        // Validate required text fields
        const requiredFields = { name, address };
        Object.entries(requiredFields).forEach(([key, value]) => {
            if (!value || value.trim() === '') {
                errors[key] = `Please fill the field ${key}`;
            }
        });

        // Validate required array field (cuisines)
        if (!Array.isArray(cuisines) || cuisines.length === 0) {
            errors['cuisines'] = "Please fill the field cuisines";
        }

        // // Validate email format
        // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // if (email && !emailRegex.test(email)) {
        //     errors.email = "Please enter a valid email address.";
        // }

        // Validate phone number: must start with +49 or +91 and be at least 13 characters long
        // if (phone) {
        //     if (!phone.startsWith('+49') && !phone.startsWith('+91')) {
        //         errors['phone'] = "Phone number should start with either +49 or +91.";
        //     } else if (phone.length < 13) {
        //         errors['phone'] = "Phone number should be at least 13 characters long.";
        //     }
        // }

        // Validate name length (at least 3 characters)
        if (name && name.trim().length < 3) {
            errors['name'] = "Name should be at least 3 characters long.";
        }

        // Validate map position
        if (!position[0] || !position[1]) {
            errors['position'] = "Please select the position on the map";
        }

        // Validate timings for each day in the week
        let isAnyDayOpen = false;
        daysOfWeek.forEach(day => {
            const { isOpen, startTime, endTime } = timings[day];
            if (isOpen) {
                isAnyDayOpen = true;
                if (!startTime || !endTime) {
                    errors['timings'] = t('timings.setbothstartandend', { day });
                } else {
                    const [startHour, startMin] = startTime.split(':').map(Number);
                    const [endHour, endMin] = endTime.split(':').map(Number);
                    const startMinutes = startHour * 60 + startMin;
                    const endMinutes = endHour * 60 + endMin;
                    if (startMinutes >= endMinutes) {
                        errors['timings'] = t('timings.endtimeafterstart', { day });
                    }
                }
            }
        });
        if (!isAnyDayOpen) {
            errors['timings'] = "Restaurant should be open least for one day in a week";
        }

        // Set errors if any exist and return validation result
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        try {
            if (validations()) {
                let payload = {
                    "location": {
                        "coordinates": [position[1], position[0]],
                        "type": "Point"
                    },
                }
                const formattedTimings = Object.entries(timings).map(([day, timing]) => ({
                    day: day.substring(0, 3).toUpperCase(),
                    isOpen: timing.isOpen,
                    times: timing.isOpen ? [{
                        startTime: timing.startTime.split(':'),
                        endTime: timing.endTime.split(':')
                    }] : []
                }));
                payload["openingTimes"] = formattedTimings;
                Object.keys(formData).forEach(key => {
                    payload[key] = formData[key]
                })
                if (restaurantImage) {
                    const formData = new FormData();
                    formData.append('file', restaurantImage);
                    const uploadResult = await uploadImage(formData);
                    if (uploadResult.success && uploadResult.url) {
                        payload["image"] = uploadResult.url;
                    } else {
                        throw new Error(t('restaurantprofile.failedtouploadrestaurantimage'));
                    }
                }

                // Upload new logo if changed
                if (restaurantLogo) {
                    const formData = new FormData();
                    formData.append('file', restaurantLogo);
                    const uploadResult = await uploadImage(formData);
                    if (uploadResult.success && uploadResult.url) {
                        payload["logo"] = uploadResult.url;
                    } else {
                        throw new Error(t('restaurantprofile.failedtouploadrestaurantlogo'));
                    }
                }
                delete payload["email"]
                setIsSubmitting(true)
                // return
                let { data, errors } = await CREATE_NEW_RESTAURANT({
                    variables: {
                        "restaurant": payload
                    }
                })
                setIsSubmitting(true)
                if (data?.createRestaurant) {
                    toast.success("Restaurant created successfully")
                    setRestaurantsList(prev => ([...prev, data.createRestaurant]))
                    onClickClear()
                    setIsOpen(false)
                }
            }
        }
        catch (e) {
            toast.error("Failed to create restaurant")
            console.log(e)
        }


    }



    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-white rounded-lg p-10 shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col ">
                <p className="text-lg mb-4 font-medium text-gray-700 mb-1">{t('newrestaurant.addnew')}</p>
                <div className="overflow-y-auto">
                    <p className="text-lg mb-4 font-medium text-gray-700 mb-1">{t('newrestaurant.details')}</p>
                    <RestaurantProfileView
                        formData={formData}
                        restaurantImage={restaurantImage}
                        restaurantLogo={restaurantLogo}
                        onInputChange={handleInputChange}
                        onImageChange={handleImageChange}
                        onShowCuisineModal={() => setShowCuisineModal(true)}
                        cuisinesLoading={cuisinesLoading}
                        cuisinesError={cuisinesError}
                        newRestaurant={newRestaurant} />
                    <div className="mt-4">
                        <p className="text-lg mb-4 font-medium text-gray-700 mb-1">{t('newrestaurant.timings')}</p>
                        <TimingsComponent timings={timings} daysOfWeek={daysOfWeek} handleToggleDay={handleToggleDay} handleTimeChange={handleTimeChange} />
                    </div>
                    <div className="mt-4">
                        <p className="text-lg mb-4 font-medium text-gray-700 mb-1">{t('newrestaurant.maps')}</p>
                        <MapsComponent position={position} setIsValidZone={setIsValidZone} setPosition={setPosition} />
                    </div>
                    <div className="mt-4">
                        <p className="text-lg mb-4 font-medium text-gray-700 mb-1">{t('newrestaurant.ratings')}</p>
                        <RatingsComponent isEditing={true} formData={formData} setFormData={setFormData} />
                    </div>
                    {showCuisineModal && (
                        <CuisineModal
                            isOpen={showCuisineModal}
                            onClose={() => setShowCuisineModal(false)}
                            selectedCuisines={formData.cuisines}
                            onCuisinesChange={(cuisines) => setFormData(prev => ({ ...prev, cuisines }))}
                            cuisines={cuisinesData?.cuisines || []}
                        />
                    )}
                </div>
                <div className="flex justify-between items-end pt-5">
                    {Object.keys(errors).length > 0 ? (
                        <div className=" border border-red-400 text-red-700 px-4 py-2 rounded-lg mb-4">
                            {Object.values(errors).map((error, idx) => (
                                <p key={idx}>* {error}</p>
                            ))}
                        </div>
                    ) : <div></div>}
                    <div className="flex justify-end gap-4 mt-4 " style={{ height: 40 }}>
                        <button
                            onClick={handleSave}
                            disabled={isSubmitting}

                            className=" px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors flex items-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                                    {t('restaurantprofile.saving')}
                                </>
                            ) : (
                                <>

                                    <Save className="h-4 w-4 mr-2" />

                                    {t('restaurantprofile.savechanges')}
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => onClickClear()}
                            className='text-gray-500 '
                            style={{
                                padding: '6px 10px',
                                cursor: 'pointer',
                                border: '1px solid #ccc', // Added border
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px', // adds space between label & arrow

                            }}
                        >
                            {t('newrestaurant.clear')}
                        </button>
                    </div>
                </div>
                {/* <RestaurantTimings  newRestaurant={newRestaurant}/>
                <Ratings newRestaurant={newRestaurant}/> */}
            </div>
        </div >
    )
}