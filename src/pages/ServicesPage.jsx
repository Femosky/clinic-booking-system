import { twMerge } from 'tailwind-merge';
import clinic1 from '../assets/image 4.png';
import { PropTypes } from 'prop-types';
import { Button } from '../components/Button';
import { Plus } from 'lucide-react';
import { useServices } from '../hooks/useServices';
import { useUserId } from '../hooks/useUserId';
import { useUserData } from '../hooks/useUserData';
import { addServicePath, userType1, userType2 } from '../global/global_variables';
import { useNavigate } from 'react-router-dom';
import { useAllServices } from '../hooks/useAllServices';

export function ServicesPage() {
    const navigate = useNavigate();
    const { userData, loading: userLoading } = useUserData();
    const { uid } = useUserId();

    const { services } = useServices(uid);
    const { clinics, loading, error } = useAllServices();

    if (userLoading || loading) return <div>Loading...</div>;

    function goToAddServicePage() {
        navigate(addServicePath);
    }

    return (
        <div className="w-full">
            <section className="flex justify-between items-center py-4">
                <p className="text-2xl">Services</p>
                {userData?.userType === userType1 ? (
                    <Button onClick={goToAddServicePage} className="flex text-base">
                        <Plus /> <span className="hidden md:flex">Add Service</span>
                    </Button>
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
                <ClinicServicesView services={services} />
            ) : (
                <PatientServicesView userData={userData} clinics={clinics} loading={loading} error={error} />
            )}
        </div>
    );
}

function ClinicServicesView({ services }) {
    return (
        <section className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 place-items-stretch">
            {services.length === 0 ? (
                <p>No services available at this time.</p>
            ) : (
                services.map((service) => <ServiceCard key={service.id} service={service} />)
            )}
        </section>
    );
}

ClinicServicesView.propTypes = {
    services: PropTypes.array.isRequired,
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

function ServiceCard({ userData, service, className, ...props }) {
    const navigate = useNavigate();

    function handleBookNow() {
        navigate('/booking', { state: { selectedService: service } });
    }

    return (
        <div {...props} className={twMerge('', className)}>
            <div className="w-full flex items-end bg-normal h-[18rem]">
                <div className="w-full h-[16rem] overflow-hidden">
                    <img className="w-full h-full object-cover" src={clinic1} alt="service image" />
                </div>
            </div>
            <p className="p-2 bg-normal">{service?.name}</p>

            <div className="text-center py-4">
                <p>By {service?.doctor}</p>
                <p>
                    ${parseFloat(service?.price).toFixed(2)} | {(parseInt(service?.duration) / 60).toFixed(2)}hrs
                </p>
                <p>*****</p>
            </div>

            {userData?.userType == userType2 && (
                <Button onClick={handleBookNow} className="w-full" variant="dark">
                    Book Now
                </Button>
            )}
        </div>
    );
}

ServiceCard.propTypes = {
    userData: PropTypes.object,
    service: PropTypes.shape({
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        doctor: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        duration: PropTypes.number.isRequired,
        slots: PropTypes.object.isRequired,
    }).isRequired,
    className: PropTypes.string,
};
