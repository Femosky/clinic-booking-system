import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserData } from '../hooks/useUserData';
import { LogoLoadingScreen } from '../components/LogoLoadingScreen';
import { BackButton } from '../components/BackButton';
import { Title2 } from '../components/Title2';
import { PageTitle } from '../components/PageTitle';
import { Button } from '../components/Button';
import { addServicePath, bookingPath, loginPath, userType1, userType2 } from '../global/global_variables';
import { getDatabase, ref, remove } from 'firebase/database';
import { convertKeysToCamelCase, convertMinutesToHours, parsePrice } from '../global/global_methods';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import loadingImage from '../assets/placeholder-image.png';
import { BasicModal } from '../components/BasicModal';

export function ServiceDetails() {
    const location = useLocation();
    const navigate = useNavigate();

    const { selectedService } = location.state || {};
    const { userData } = useUserData();

    const [removeModal, setRemoveModal] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const db = getDatabase();

    function handleBookNow() {
        navigate(bookingPath, { state: { selectedService } });
    }

    function navigateToLogin() {
        navigate(loginPath);
    }

    function editService() {
        // EDIT SERVICE
        navigate(addServicePath, { state: { selectedService: convertKeysToCamelCase(selectedService) } });
    }

    async function removeService() {
        const clinicId = userData.userId;
        const serviceId = selectedService.id;

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
        if (!selectedService) {
            // Navigate back to the previous page
            // navigate(-1);
        }
    }, [navigate, selectedService]);

    if (!selectedService) {
        return <LogoLoadingScreen />;
    }

    return (
        <div className="w-full flex flex-col gap-5">
            <BackButton />

            <PageTitle pageTitle="Service Details" />

            <div className="w-full flex flex-col gap-20 text-sm sm:text-base lg:text-lg">
                <main className="w-full flex flex-col md:flex-row gap-5">
                    <section className="w-[10rem] md:w-[15rem] h-[10rem] md:h-[15rem] place-self-center md:place-self-start">
                        <LazyLoadImage
                            className="w-full h-full object-cover"
                            src={selectedService?.imageUrl}
                            alt="service image"
                            width={'100%'}
                            height={'100%'}
                            placeholderSrc={loadingImage}
                        />
                    </section>
                    <section className="w-1/2">
                        <div className="w-full py-5">
                            <div className="w-full flex gap-10 justify-between">
                                <p className="w-full min-w-[7rem] font-medium">Clinic:</p>
                                <p className="w-full">{selectedService.clinicName}</p>
                            </div>
                            <div className="w-full flex gap-10 justify-between">
                                <p className="w-full min-w-[7rem] font-medium">Service name:</p>
                                <p className="w-full">{selectedService.name}</p>
                            </div>
                            <div className="w-full flex gap-10 justify-between">
                                <p className="w-full min-w-[7rem] font-medium">Doctor:</p>
                                <p className="w-full">{selectedService.doctor}</p>
                            </div>
                            <div className="w-full flex gap-10 justify-between">
                                <p className="w-full min-w-[7rem] font-medium">Duration (approximate):</p>
                                <p className="w-full">
                                    {convertMinutesToHours(selectedService.duration)}{' '}
                                    {convertMinutesToHours(selectedService.duration) >= 2 ? 'hours' : 'hour'}
                                </p>
                            </div>

                            <div className="w-full flex gap-10 justify-between">
                                <p className="w-full min-w-[7rem] font-medium">Price:</p>
                                <p className="w-full">${parsePrice(selectedService.price)}</p>
                            </div>

                            <div className="w-full flex flex-col mt-10 justify-between">
                                <p className="w-full min-w-[7rem] font-medium">Description:</p>
                                <p className="w-full">{selectedService.description}</p>
                            </div>
                        </div>
                    </section>
                </main>

                <section className="flex place-self-center md:place-self-end gap-2">
                    {userData === null && (
                        <Button onClick={navigateToLogin} className="text-sm sm:text-base" variant="dark">
                            LOGIN TO BOOK
                        </Button>
                    )}

                    {userData?.userType == userType1 && (
                        <Button onClick={editService} className="w-full" variant="dark">
                            Edit
                        </Button>
                    )}

                    {userData?.userType == userType1 && (
                        <BasicModal
                            reason="remove"
                            customFunction={removeService}
                            open={removeModal}
                            setOpen={setRemoveModal}
                        />
                    )}

                    {userData?.userType == userType2 && (
                        <Button onClick={handleBookNow} className="text-sm sm:text-base" variant="dark">
                            Book Now
                        </Button>
                    )}
                </section>
            </div>
        </div>
    );
}
