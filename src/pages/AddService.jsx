import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDatabase, ref, push, set, update } from 'firebase/database';
import { loginPath, servicesPath, userType1, userType2 } from '../global/global_variables';
import { Button } from '../components/Button';
import { auth } from '../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useUserData } from '../hooks/useUserData';
import { convertUnixToDateObject, isUndefined, isValidEmail } from '../global/global_methods';
import { Input } from '../components/Input';
import { TextArea } from '../components/TextArea';
import { Title2 } from '../components/Title2';
import { BackButton } from '../components/BackButton';
import { PageTitle } from '../components/PageTitle';
import { ErrorMessageView } from '../components/ErrorMessageView';
import { format } from 'date-fns';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { CompulsoryAsterisk } from '../components/CompulsoryAsterisk';
import { X } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import loadingImage from '../assets/placeholder-image.png';
import { LogoLoadingScreen } from '../components/LogoLoadingScreen';

export function AddService() {
    const navigate = useNavigate();
    const location = useLocation();

    const [user] = useAuthState(auth);
    const { userData } = useUserData();

    const [serviceName, setServiceName] = useState('');
    const [description, setDescription] = useState('');
    const [doctor, setDoctor] = useState('');
    const [doctorEmail, setDoctorEmail] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [slots, setSlots] = useState([]);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isEditingService, setIsEditingService] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const db = getDatabase();
    const storage = getStorage();

    const { selectedService } = location.state || {};

    // CHECK IF USER CLICKED EDIT SERVICE
    useEffect(() => {
        if (!isUndefined(selectedService)) {
            setIsEditingService(true);

            // LOAD SERVICE DETAILS
            setServiceName(selectedService.name);
            setDescription(selectedService.description);
            setDoctor(selectedService.doctor);
            setDoctorEmail(selectedService.doctorEmail);
            setPrice(selectedService.price);
            setDuration(selectedService.duration);

            let newSlots = [];

            console.log(selectedService);

            if (selectedService.slots) {
                Object.keys(selectedService.slots).forEach((slotId) => {
                    const slot = selectedService.slots[slotId];
                    const slotDateTime = convertUnixToDateObject(slot.timestamp);
                    const slotDate = slotDateTime.toISOString().split('T')[0];
                    const slotTime = slotDateTime.toISOString().split('T')[1].slice(0, 5);

                    const newSlot = {
                        slotId,
                        date: slotDate,
                        time: slotTime,
                        available: slot.available,
                    };

                    newSlots.push(newSlot);
                });
            }

            setSlots(newSlots);
        }
    }, [selectedService]);

    useEffect(() => {
        if (!isUndefined(userData) && userData.userType === userType2) {
            // Navigate back to the previous page
            navigate(-1);
        }
    }, [userData, navigate]);

    if (isUndefined(userData)) {
        return <LogoLoadingScreen />;
    }

    if (userData.userType === userType2) {
        return <LogoLoadingScreen />;
    }

    function handleImageChange(event) {
        const file = event.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    }

    function removeImage() {
        setImage(null);
        setPreview(null);
    }

    async function uploadImage(file) {
        const imageRef = storageRef(storage, `services/${user.uid}/${file.name}`);
        await uploadBytes(imageRef, file);
        return getDownloadURL(imageRef);
    }

    function goToServicesPage() {
        navigate(servicesPath);
    }

    // Redirect to login if not authenticated
    if (!user) {
        navigate(loginPath);
        return null;
    }

    // Add a new empty slot field
    function addSlotField() {
        setSlots([...slots, { date: '', time: '' }]);
    }

    // Update a specific slot field (date or time)
    function updateSlot(index, key, value) {
        const newSlots = [...slots];
        newSlots[index][key] = value;
        setSlots(newSlots);
    }

    // Remove a slot from the list
    function removeSlot(index) {
        const newSlots = slots.filter((_, i) => i !== index);
        setSlots(newSlots);
    }

    function areInputsValid() {
        if (serviceName.length === 0) {
            setError('Please enter the servicce name.');
            return false;
        } else if (serviceName.length < 2) {
            setError('Please enter a valid service name.');
            return false;
        }

        if (description.length === 0) {
            setError('Please enter the description.');
            return false;
        } else if (description.length < 5) {
            setError('Please enter a valid description.');
            return false;
        }

        if (doctor.length === 0) {
            setError("Please enter the doctor's name.");
            return false;
        } else if (doctor.length < 5) {
            setError('Please enter a valid name for the doctor.');
            return false;
        }

        if (!isValidEmail(doctorEmail)) {
            setError('Please enter a valid email address.');
            return false;
        }

        if (price.length === 0) {
            setError('Please enter a price.');
            return false;
        }

        if (duration.length === 0) {
            setError('Please enter a duration.');
            return false;
        }

        if (slots.length < 1) {
            setError('Please enter at least one slot.');
            return false;
        } else if (!areSlotsValid(slots)) {
            setError('Please make sure all slots are valid.');
            return false;
        }

        setError('');
        return true;
    }

    function areSlotsValid(slots) {
        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];
            console.log(slot);
            if (slot.date.length < 1 || slot.time.length < 1) {
                return false;
            }
        }

        return true;
    }

    function stitchDateTimeToUnixTime(slot) {
        const slotDateTime = new Date(`${slot.date}T${slot.time}`);
        const isoString = slotDateTime.toISOString();
        return new Date(isoString).getTime();
    }

    async function handleSaveServiceEdit(event) {
        event.preventDefault();

        setError('');
        setSuccess('');

        // VALIDATIONS
        if (!areInputsValid()) {
            return;
        }

        // Grab clinic name
        if (!userData) {
            setError('Could not get clinic name: userData is null');
            return;
        }

        let imageUrl = '';
        if (isEditingService) {
            if (image === null) {
                imageUrl = selectedService.imageUrl ? selectedService.imageUrl : '';
            } else {
                try {
                    imageUrl = await uploadImage(image);
                } catch (err) {
                    setError('Image upload failed, please try again: ', err.message);
                    return;
                }
            }
        } else {
            if (image) {
                try {
                    imageUrl = await uploadImage(image);
                } catch (err) {
                    setError('Image upload failed, please try again: ', err.message);
                    return;
                }
            }
        }

        // Build the service data object
        const serviceData = {
            name: serviceName,
            clinic_name: userData.name,
            clinic_address: userData.clinicAddress,
            clinic_email: userData.email,
            clinic_province: userData.province,
            clinic_category: userData.category,
            description,
            doctor,
            doctor_email: doctorEmail,
            price: parseFloat(price),
            duration: parseInt(duration, 10),
            image_url: imageUrl,
            slots: {},
        };

        let slotNumbers = new Set();
        let tempSlots = slots;
        tempSlots = tempSlots.map((slot) => {
            if (slot.available !== null && slot.available === false) {
                const slotId = slot.slotId;
                const slotNumber = Number(slotId.split('_')[1]);
                slotNumbers.add(slotNumber);

                const unixTimestamp = stitchDateTimeToUnixTime(slot);

                serviceData.slots[slot.slotId] = {
                    available: false,
                    timestamp: unixTimestamp,
                };

                return null;
            } else {
                return slot;
            }
        });

        tempSlots = tempSlots.filter((slot) => slot !== null);
        let count = 0;

        if (slotNumbers.size > 0) {
            count = Math.max(...slotNumbers);
        }

        tempSlots.forEach((slot) => {
            const unixTimestamp = stitchDateTimeToUnixTime(slot);

            while (slotNumbers.has(count)) {
                count += 1;
            }

            serviceData.slots[`slot_${count}`] = {
                available: true,
                timestamp: unixTimestamp,
            };

            count += 1;
        });

        try {
            const servicesRef = ref(db, `services/${userData.userId}/${selectedService.id}`);
            await update(servicesRef, serviceData);

            setSuccess('Service changed successfully!');
            goToServicesPage();
        } catch (err) {
            console.error('Error changing service:', err);
            setError('Error changing service, please try again.');
        }
    }

    // Submit new service
    async function handleSubmit(event) {
        event.preventDefault();

        setError('');
        setSuccess('');

        // VALIDATIONS
        if (!areInputsValid()) {
            return;
        }

        // Grab clinic name
        if (!userData) {
            setError('Could not get clinic name: userData is null');
            return;
        }

        let imageUrl = '';
        if (image) {
            try {
                imageUrl = await uploadImage(image);
            } catch (err) {
                setError('Image upload failed, please try again: ', err.message);
                return;
            }
        }

        // Build the service data object
        const serviceData = {
            name: serviceName,
            clinic_name: userData.name,
            clinic_address: userData.clinicAddress,
            clinic_email: userData.email,
            clinic_province: userData.province,
            clinic_category: userData.category,
            description,
            doctor,
            doctor_email: doctorEmail,
            price: parseFloat(price),
            duration: parseInt(duration, 10),
            image_url: imageUrl,
            slots: {},
        };

        slots.forEach((slot, index) => {
            const slotDateTime = new Date(`${slot.date}T${slot.time}`); // Convert date/time to JS Date object
            const isoString = slotDateTime.toISOString();
            const unixTimestamp = new Date(isoString).getTime();

            serviceData.slots[`slot_${index}`] = {
                available: true,
                timestamp: unixTimestamp,
            };
        });

        try {
            const servicesRef = ref(db, `services/${userData.userId}`);
            await push(servicesRef, serviceData);

            setSuccess('Service saved successfully!');
            goToServicesPage();
        } catch (err) {
            console.error('Error adding service:', err);
            setError('Error adding service, please try again.');
        }
    }

    return (
        <div className="w-full flex flex-col gap-5">
            <BackButton buttonText="Cancel" />

            <PageTitle pageTitle={`${isEditingService ? 'Edit' : 'Add new'} service`} />

            <form onSubmit={handleSubmit} className="w-full sm:w-2/3 flex flex-col gap-5">
                <div>
                    <h3 className="text-xl text-dark">
                        Service name <CompulsoryAsterisk />
                    </h3>
                    <Input
                        type="text"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        name="service-name"
                        id="service-name"
                        placeholder="Enter service name"
                    />
                </div>

                <div>
                    <h3 className="text-xl text-dark">
                        Description <CompulsoryAsterisk />
                    </h3>
                    <TextArea
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        name="description"
                        id="description"
                        placeholder="Enter the description"
                    />
                </div>

                <div>
                    <h3 className="text-xl text-dark">
                        Doctor name <CompulsoryAsterisk />
                    </h3>
                    <Input
                        type="text"
                        value={doctor}
                        onChange={(e) => setDoctor(e.target.value)}
                        name="doctor-name"
                        id="doctor"
                        placeholder="Enter the doctor's name"
                    />
                </div>

                <div>
                    <h3 className="text-xl text-dark">
                        Doctor email <CompulsoryAsterisk />
                    </h3>
                    <Input
                        type="text"
                        value={doctorEmail}
                        onChange={(e) => setDoctorEmail(e.target.value)}
                        name="doctor-email"
                        id="doctor-email"
                        placeholder="Enter the doctor's email"
                    />
                </div>

                <div>
                    <h3 className="text-xl text-dark">
                        Price (digits only) <CompulsoryAsterisk />
                    </h3>
                    <Input
                        type="text"
                        value={price}
                        onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))}
                        name="price"
                        id="price"
                        placeholder="Enter the price"
                    />
                </div>

                <div>
                    <h3 className="text-xl text-dark">
                        Duration (in minutes) <CompulsoryAsterisk />
                    </h3>
                    <Input
                        type="text"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value.replace(/\D/g, ''))}
                        name="duration"
                        id="duration"
                        placeholder="Enter the duration"
                    />
                </div>

                <div>
                    <h3 className="text-xl text-dark">Upload Service Image</h3>
                    <Input className="w-[20rem]" type="file" accept="image/*" onChange={handleImageChange} />

                    {preview && (
                        <div className="mt-4 flex">
                            <div>
                                <p className="text-gray-600">Preview:</p>
                                <img src={preview} alt="Selected" className="size-32 object-cover rounded-md" />
                            </div>
                            <div>
                                <Button onClick={removeImage} className="w-10" variant="hot" size="round">
                                    <X />
                                </Button>
                            </div>
                        </div>
                    )}

                    {!isUndefined(selectedService) &&
                        !isUndefined(selectedService.imageUrl) &&
                        isUndefined(preview) && (
                            <div className="mt-4 flex">
                                <div>
                                    <p className="text-gray-600">Preview:</p>
                                    <div className="size-32 md:size-20 flex items-center">
                                        <LazyLoadImage
                                            className="size-full object-cover"
                                            src={selectedService?.imageUrl}
                                            alt="cart item image"
                                            width={'100%'}
                                            height={'100%'}
                                            placeholderSrc={loadingImage}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Button onClick={removeImage} className="w-10" variant="hot" size="round">
                                        <X />
                                    </Button>
                                </div>
                            </div>
                        )}
                </div>

                <div className="pt-5 flex flex-col gap-5">
                    <h3 className="text-xl text-dark">
                        Booking slots <CompulsoryAsterisk />
                    </h3>

                    {slots.length === 0 && <p className="w-full">No slots added</p>}
                    {slots.map((slot, index) => (
                        <div key={index} className="relative">
                            {slot.available !== null && slot.available === false && (
                                <div className="absolute inset-0 z-50 flex flex-col">
                                    <div className="absolute inset-0 bg-black opacity-50" />

                                    <div className="relative z-10 mt-8 flex items-center justify-center flex-1 text-xs md:text-sm text-red-400 text-center p-4">
                                        To change or delete this slot, you must first go into your dashboard to cancel
                                        this appointment.
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-4 items-center mt-2">
                                <Input
                                    type="date"
                                    value={slot.date}
                                    onChange={(e) => updateSlot(index, 'date', e.target.value)}
                                    name="text"
                                    id={`slot-date-${index}`}
                                />

                                <Input
                                    type="time"
                                    value={slot.time}
                                    onChange={(e) => updateSlot(index, 'time', e.target.value)}
                                    id={`slot-time-${index}`}
                                />
                                <Button onClick={() => removeSlot(index)} className="hidden sm:flex" variant="hot">
                                    Remove
                                </Button>

                                <Button onClick={() => removeSlot(index)} className="flex sm:hidden" variant="hot">
                                    -
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </form>

            <Button onClick={addSlotField} className="place-self-start" variant="dark">
                Add Slot
            </Button>

            <ErrorMessageView error={error} />
            {success && <p className="text-green-500 mb-4">{success}</p>}

            {isEditingService ? (
                <Button onClick={handleSaveServiceEdit} className="place-self-end">
                    Save Changes
                </Button>
            ) : (
                <Button onClick={handleSubmit} className="place-self-end">
                    Add Service
                </Button>
            )}
        </div>
    );
}

export default AddService;
