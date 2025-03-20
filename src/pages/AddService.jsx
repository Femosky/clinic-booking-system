import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, push } from 'firebase/database';
import { loginPath, servicesPath } from '../global/global_variables';
import { Button } from '../components/Button';
import { auth } from '../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useUserData } from '../hooks/useUserData';

export function AddService() {
    const navigate = useNavigate();
    const [user] = useAuthState(auth);
    const { userData } = useUserData();

    const [serviceName, setServiceName] = useState('');
    const [description, setDescription] = useState('');
    const [doctor, setDoctor] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [slots, setSlots] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const db = getDatabase();

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

    // Submit new service
    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setSuccess('');

        // Basic validation
        if (!serviceName || !description || !doctor || !price || !duration) {
            setError('Please fill all required fields.');
            return;
        }

        // Grab clinic name
        if (!userData) {
            setError('Could not get clinic name: userData is null');
            return;
        }

        // Build the service data object
        const serviceData = {
            name: serviceName,
            clinicName: userData.name,
            description,
            doctor,
            price: parseFloat(price),
            duration: parseInt(duration, 10),
            slots: {},
        };

        slots.forEach((slot, index) => {
            serviceData.slots[`slot_${index}`] = {
                date: slot.date,
                time: slot.time,
                available: true,
            };
        });

        try {
            const servicesRef = ref(db, `services/${user.uid}`);
            await push(servicesRef, serviceData);
            setSuccess('Service added successfully!');
            navigate(servicesPath);
        } catch (err) {
            console.error('Error adding service:', err);
            setError('Error adding service, please try again.');
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <Button onClick={goToServicesPage} variant="hot">
                Cancel
            </Button>

            <h2 className="text-3xl font-bold mb-4">Add New Service</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {success && <p className="text-green-500 mb-4">{success}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-lg font-medium">Service Name</label>
                    <input
                        type="text"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        className="mt-1 block w-full border p-2 rounded"
                        placeholder="Enter service name"
                        required
                    />
                </div>

                <div>
                    <label className="block text-lg font-medium">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full border p-2 rounded"
                        placeholder="Enter service description"
                        required
                    />
                </div>

                <div>
                    <label className="block text-lg font-medium">Doctor</label>
                    <input
                        type="text"
                        value={doctor}
                        onChange={(e) => setDoctor(e.target.value)}
                        className="mt-1 block w-full border p-2 rounded"
                        placeholder="Enter doctor's name"
                        required
                    />
                </div>

                <div>
                    <label className="block text-lg font-medium">Price</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="mt-1 block w-full border p-2 rounded"
                        placeholder="Enter price"
                        required
                    />
                </div>

                <div>
                    <label className="block text-lg font-medium">Duration (minutes)</label>
                    <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="mt-1 block w-full border p-2 rounded"
                        placeholder="Enter duration in minutes"
                        required
                    />
                </div>

                <div>
                    <h3 className="text-xl font-semibold">Booking Slots</h3>
                    {slots.map((slot, index) => (
                        <div key={index} className="flex gap-4 items-center mt-2">
                            <input
                                type="date"
                                value={slot.date}
                                onChange={(e) => updateSlot(index, 'date', e.target.value)}
                                className="border p-2 rounded"
                                required
                            />
                            <input
                                type="time"
                                value={slot.time}
                                onChange={(e) => updateSlot(index, 'time', e.target.value)}
                                className="border p-2 rounded"
                                required
                            />
                            <button type="button" onClick={() => removeSlot(index)} className="text-red-500">
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addSlotField}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Add Slot
                    </button>
                </div>

                <button
                    type="submit"
                    className="mt-4 w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                    Add Service
                </button>
            </form>
        </div>
    );
}

export default AddService;
