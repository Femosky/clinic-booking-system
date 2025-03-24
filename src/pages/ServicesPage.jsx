import { twMerge } from 'tailwind-merge';
import clinic1 from '../assets/image 4.png';
import { PropTypes } from 'prop-types';
import { Button } from '../components/Button';
import { Plus } from 'lucide-react';
import { useServices } from '../hooks/useServices';
import { useUserId } from '../hooks/useUserId';
import { useUserData } from '../hooks/useUserData';
import { addServicePath, bookingPath, userType1, userType2 } from '../global/global_variables';
import { useNavigate } from 'react-router-dom';
import { useAllServices } from '../hooks/useAllServices';
import { getDatabase, ref, remove } from 'firebase/database';
import { useState } from 'react';

export function ServicesPage() {
    const navigate = useNavigate();
    const { userData } = useUserData();
    const { uid } = useUserId();

    const { services } = useServices(uid);
    const { clinics, loading, error } = useAllServices();

    const [isEditing, setIsEditing] = useState(false);

    function goToAddServicePage() {
        navigate(addServicePath);
    }

    function toggleEditingMode() {
        setIsEditing(!isEditing);
    }

    return (
        <div className="w-full">
            <section className="flex justify-between items-center py-4">
                <p className="text-2xl">Services</p>
                {userData !== null && userData.userType === userType1 ? (
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
                ) : (
                    <select
                        name=""
                        id=""
                        defaultValue="DEFAULT"
                        className="p-2 min-w-[20rem] border border-dark rounded-2xl text-lg"
                    >
                        <option value="DEFAULT" disabled>
                            Filter by Clinic
                        </option>
                    </select>
                )}
            </section>
            {userData?.userType === userType1 ? (
                <ClinicServicesView services={services} userData={userData} isEditing={isEditing} />
            ) : (
                <PatientServicesView userData={userData} clinics={clinics} loading={loading} error={error} />
            )}
        </div>
    );
}

function ClinicServicesView({ services, userData, isEditing }) {
    return (
        <section className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 place-items-stretch">
            {services.length === 0 ? (
                <p>No services available at this time.</p>
            ) : (
                services.map((service) => (
                    <ServiceCard key={service.id} isEditing={isEditing} userData={userData} service={service} />
                ))
            )}
        </section>
    );
}

ClinicServicesView.propTypes = {
    services: PropTypes.array.isRequired,
    userData: PropTypes.object,
    isEditing: PropTypes.bool.isRequired,
};

function PatientServicesView({ userData, clinics, loading, error }) {
    return (
        <section>
            {loading ? (
                <p className="text-center">Loading services...</p>
            ) : error ? (
                <p className="text-center text-red-500">Error: {error.message}</p>
            ) : Object.keys(clinics).length === 0 ? (
                <p>No services available at this time.</p>
            ) : (
                clinics.map((clinic) => (
                    <div key={clinic[0].clinicId} className="mb-8">
                        <ClinicTitleView key={clinic[0].clinicId} clinicName={clinic[0].clinic_name} />
                        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 place-items-stretch">
                            {clinic.map((service) => (
                                <ServiceCard key={service.id} userData={userData} service={service} />
                            ))}
                        </div>
                    </div>
                ))
            )}
        </section>
    );
}

PatientServicesView.propTypes = {
    userData: PropTypes.object,
    clinics: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    error: PropTypes.object,
};

function ClinicTitleView({ clinicName }) {
    return <h3 className="text-xl font-bold mb-4">Clinic: {clinicName}</h3>;
}

ClinicTitleView.propTypes = {
    clinicName: PropTypes.string.isRequired,
};

function ServiceCard({ isEditing, userData, service, className, ...props }) {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const db = getDatabase();

    function handleBookNow() {
        navigate(bookingPath, { state: { selectedService: service } });
    }

    async function removeService() {
        const clinicId = userData.userId;
        const serviceId = service.id;

        if (clinicId === null || serviceId === null) {
            setError('Clinic or Service ID missing.');
            console.log('Clinic or Service ID missing.');
            return;
        }

        setLoading(true);

        try {
            const serviceRef = ref(db, `services/${clinicId}/${serviceId}`);
            await remove(serviceRef);
        } catch (err) {
            setError(err.message);
            console.log(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div {...props} className={twMerge('', className)}>
            <div className="w-full flex items-end bg-normal h-[18rem]">
                <div className="w-full h-[16rem] overflow-hidden">
                    <img className="w-full h-full object-cover" src={clinic1} alt="service image" />
                </div>
            </div>
            <p className="p-2 bg-normal">{service?.name}</p>

            <div
                className={`text-center ${
                    !isEditing && userData !== null && userData.userType ? 'border-[1.2px] border-dark mt-3' : 'py-2'
                }`}
            >
                <p>By {service?.doctor}</p>
                <p>
                    ${parseFloat(service?.price).toFixed(2)} | {(parseInt(service?.duration) / 60).toFixed(2)}hrs
                </p>
                <p>*****</p>
            </div>

            {isEditing && userData?.userType == userType1 && (
                <Button onClick={removeService} className="w-full" variant="hot">
                    Remove
                </Button>
            )}

            {userData?.userType == userType2 && (
                <Button onClick={handleBookNow} className="w-full" variant="dark">
                    Book Now
                </Button>
            )}
        </div>
    );
}

ServiceCard.propTypes = {
    isEditing: PropTypes.bool,
    userData: PropTypes.object,
    service: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        doctor: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        duration: PropTypes.number.isRequired,
        slots: PropTypes.object.isRequired,
    }).isRequired,
    className: PropTypes.string,
};
