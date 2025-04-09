import { twMerge } from 'tailwind-merge';
import clinic1 from '../assets/image 4.png';
import loadingImage from '../assets/placeholder-image.png';
import { PropTypes } from 'prop-types';
import { Button } from '../components/Button';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useServices } from '../hooks/useServices';
import { useUserId } from '../hooks/useUserId';
import { useUserData } from '../hooks/useUserData';
import {
    addServicePath,
    bookingPath,
    clinicTypes,
    serviceDetailsPath,
    userType1,
    userType2,
} from '../global/global_variables';
import { useNavigate } from 'react-router-dom';
import { useAllServices } from '../hooks/useAllServices';
import { getDatabase, ref, remove } from 'firebase/database';
import { useEffect, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { convertKeysToCamelCase, convertMinutesToHours, parsePrice } from '../global/global_methods';
import { PageTitle } from '../components/PageTitle';
import { BasicModal } from '../components/BasicModal';

export function ServicesPage() {
    const { userData } = useUserData();
    const { uid } = useUserId();

    const { services, loading: clinicServicesLoading, error: clinicError } = useServices(uid);
    const { clinics, loading: patientServicesLoading, error: patientError } = useAllServices();

    return (
        <div className="w-full">
            {userData?.userType === userType1 ? (
                <ClinicServicesView
                    services={services}
                    userData={userData}
                    loading={clinicServicesLoading}
                    error={clinicError}
                />
            ) : (
                <PatientServicesView
                    userData={userData}
                    baseClinics={clinics}
                    loading={patientServicesLoading}
                    error={patientError}
                />
            )}
        </div>
    );
}

function ClinicServicesView({ services, userData, loading, error }) {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);

    function goToAddServicePage() {
        navigate(addServicePath);
    }

    function toggleEditingMode() {
        setIsEditing(!isEditing);
    }

    return (
        <>
            <section className="flex justify-between items-center py-4">
                <p className="text-2xl">Services</p>
                <div className="flex gap-2">
                    <Button
                        onClick={toggleEditingMode}
                        variant={isEditing ? 'dark' : 'default'}
                        className="flex text-base"
                    >
                        {isEditing ? 'Done' : 'Edit'}
                    </Button>
                    <Button onClick={goToAddServicePage} className="flex text-base">
                        <Plus /> <span className="hidden md:flex">Add Service</span>
                    </Button>
                </div>
            </section>

            <section className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 place-items-stretch">
                {loading ? (
                    <p className="text-center">Loading services...</p>
                ) : error ? (
                    <p className="text-center text-red-500">Error: {error.message}</p>
                ) : services.length === 0 ? (
                    <p>No services available at this time.</p>
                ) : (
                    services.map((service, index) => (
                        <ServiceCard
                            key={service.id}
                            index={index}
                            isEditing={isEditing}
                            userData={userData}
                            service={service}
                        />
                    ))
                )}
            </section>
        </>
    );
}

ClinicServicesView.propTypes = {
    services: PropTypes.array.isRequired,
    userData: PropTypes.object,
    loading: PropTypes.bool.isRequired,
    error: PropTypes.object,
};

function PatientServicesView({ userData, baseClinics, loading, error }) {
    const [category, setCategory] = useState('');

    const [clinics, setClinics] = useState([]);

    const [expandedClinics, setExpandedClinics] = useState({});

    // Function to toggle clinic visibility
    const toggleClinic = (clinicId) => {
        setExpandedClinics((prev) => ({
            ...prev,
            [clinicId]: !prev[clinicId],
        }));
    };

    useEffect(() => {
        if (clinics.length > 0) {
            const initialExpanded = clinics.reduce((acc, clinic) => {
                acc[clinic[0].clinicId] = true; // Open by default
                return acc;
            }, {});
            setExpandedClinics(initialExpanded);
        }
    }, [clinics]); // Runs only when `clinics` changes

    // Filter by Clinic Category
    useEffect(() => {
        let tempClinics = {};

        if (category === '') {
            tempClinics = baseClinics;
        } else {
            Object.keys(baseClinics).forEach((index) => {
                if (baseClinics[index][0].clinicCategory === category) {
                    tempClinics[index] = baseClinics[index];
                }
            });
        }

        setClinics(Object.values(tempClinics));
    }, [baseClinics, category]);

    return (
        <>
            <section className="w-full flex justify-between items-start sm:items-center py-4">
                {/* <p className="text-2xl">Services</p> */}
                <PageTitle className="w-fit" pageTitle="Services" />

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                    <p className="">Filter by clinic</p>
                    <select
                        name="clinic-type"
                        id="clinic-type"
                        // defaultValue="DEFAULT"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="px-2 py-2 text-xs sm:text-sm w-fit border border-dark"
                    >
                        <option key="default" value="">
                            All
                        </option>

                        {Object.keys(clinicTypes)
                            .sort((a, b) => clinicTypes[a].localeCompare(clinicTypes[b]))
                            .map((clinicType) => (
                                <option key={clinicType} value={clinicType}>
                                    {clinicTypes[clinicType]}
                                </option>
                            ))}
                    </select>
                </div>
            </section>
            <section>
                {loading ? (
                    <p className="text-center">Loading services...</p>
                ) : error ? (
                    <p className="text-center text-red-500">Error: {error.message}</p>
                ) : Object.keys(clinics).length === 0 ? (
                    <p>No services available at this time.</p>
                ) : (
                    clinics.map((clinic) => {
                        const clinicId = clinic[0].clinicId;
                        const clinicName = clinic[0].clinicName;

                        return (
                            <div key={clinicId} className="mb-8 bg-slate-50">
                                {/* Clickable Clinic Title */}
                                <div
                                    onClick={() => toggleClinic(clinicId)}
                                    className="cursor-pointer bg-normal flex px-4 py-2 justify-between items-center"
                                >
                                    <ClinicTitleView clinicName={clinicName} />
                                    <span className="text-dark">
                                        {expandedClinics[clinicId] ? <ChevronUp /> : <ChevronDown />}
                                    </span>
                                </div>
                                {/* Show services if clinic is expanded */}
                                {expandedClinics[clinicId] && (
                                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 place-items-stretch mt-4">
                                        {clinic.map((service, index) => (
                                            <ServiceCard
                                                key={service.id}
                                                index={index}
                                                userData={userData}
                                                service={service}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </section>
        </>
    );
}

PatientServicesView.propTypes = {
    userData: PropTypes.object,
    baseClinics: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    error: PropTypes.object,
};

function ClinicTitleView({ clinicName }) {
    return <h3 className="text-base sm:text-lg md:text-xl font-semibold">Clinic: {clinicName}</h3>;
}

ClinicTitleView.propTypes = {
    clinicName: PropTypes.string.isRequired,
};

function ServiceCard({ index, isEditing, userData, service, className, ...props }) {
    const navigate = useNavigate();

    const [isInValid, setIsInValid] = useState(false);

    const [removeModal, setRemoveModal] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const db = getDatabase();

    function handleBookNow() {
        navigate(bookingPath, { state: { selectedService: convertKeysToCamelCase(service) } });
    }

    function goToServiceDetails() {
        navigate(serviceDetailsPath, { state: { selectedService: convertKeysToCamelCase(service) } });
    }

    function editService() {
        // EDIT SERVICE
        navigate(addServicePath, { state: { selectedService: convertKeysToCamelCase(service) } });
    }

    async function removeService() {
        const clinicId = userData.userId;
        const serviceId = service.id;

        if (clinicId === null || serviceId === null) {
            setError('Clinic or Service ID missing.');
            console.log('Clinic or Service ID missing.');
            return [false, 'Clinic or Service ID missing.'];
        }

        setLoading(true);

        try {
            const serviceRef = ref(db, `services/${clinicId}/${serviceId}`);
            await remove(serviceRef);
            return [true, ''];
        } catch (err) {
            setError(err.message);
            console.log(err.message);
            return [false, err.message];
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let slots = Object.values(service.slots);
        let numberOfInvalid = 0;
        slots.forEach((slot) => {
            if (slot.available === false) {
                numberOfInvalid += 1;
            }
        });

        if (numberOfInvalid === slots.length) {
            setIsInValid(true);
        } else {
            setIsInValid(false);
        }
    }, [service, isInValid]);

    return (
        <div {...props} className={twMerge('', className)}>
            <main className="relative">
                {isInValid && (
                    <div className="absolute inset-0 z-50 flex flex-col">
                        <div className="absolute inset-0 bg-black opacity-50" />

                        <div className="relative z-10 flex items-center justify-center flex-1 text-white text-center p-4">
                            No valid slots available
                        </div>
                    </div>
                )}
                <section onClick={goToServiceDetails} className="cursor-pointer">
                    <div className="w-full flex items-end bg-normal h-[18rem]">
                        <div className="w-full h-[16rem] overflow-hidden">
                            <LazyLoadImage
                                className="w-full h-full object-cover"
                                src={convertKeysToCamelCase(service)?.imageUrl}
                                alt={`service-img-${index}`}
                                width={'100%'}
                                height={'100%'}
                                placeholderSrc={loadingImage}
                            />
                        </div>
                    </div>
                    <p className="p-2 bg-normal">{service?.name}</p>

                    <div className="text-center bg-white py-2 border-[0.1px] border-dark">
                        <p>By {service?.doctor}</p>
                        <p>
                            ${parsePrice(service?.price)} | {convertMinutesToHours(service?.duration)}hrs
                        </p>
                        {/* <p>*****</p> */}
                    </div>
                </section>

                {userData?.userType == userType2 && (
                    <Button onClick={handleBookNow} className="w-full" variant="dark">
                        Book Now
                    </Button>
                )}
            </main>

            {userData?.userType == userType1 && (
                <Button onClick={editService} className="w-full" variant="dark">
                    Edit
                </Button>
            )}

            {isEditing && userData?.userType == userType1 && (
                <BasicModal
                    reason="remove"
                    customFunction={removeService}
                    open={removeModal}
                    setOpen={setRemoveModal}
                />
            )}
        </div>
    );
}

ServiceCard.propTypes = {
    index: PropTypes.number.isRequired,
    isEditing: PropTypes.bool,
    userData: PropTypes.object,
    service: PropTypes.object.isRequired,
    className: PropTypes.string,
};
