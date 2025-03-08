import React, { useState } from 'react';
import { getDatabase, ref, push, update } from 'firebase/database';
import { auth } from '../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export function Test() {
    const [user] = useAuthState(auth);

    // State variables to hold the form inputs
    const [clinicId, setClinicId] = useState('');
    const [serviceId, setServiceId] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [feedback, setFeedback] = useState('');

    // Handle form submission
    const handleBooking = async (event) => {
        event.preventDefault();

        // Get the current authenticated user (patient)
        if (!user) {
            setFeedback('You must be logged in to book an appointment.');
            return;
        }
        const patientId = user.uid;

        // Reference to the realtime database
        const db = getDatabase();

        try {
            // Create the appointment object
            const appointmentData = {
                clinicId,
                patientId,
                serviceId,
                date,
                time,
                status: 'pending',
            };

            // Push a new appointment to the /appointments node
            const appointmentRef = await push(ref(db, 'appointments'), appointmentData);
            const appointmentKey = appointmentRef.key;

            // Update the corresponding slot under the clinic's node to mark it as booked
            const slotRef = ref(db, `clinics/${clinicId}/slots/${date}/${time}`);
            await update(slotRef, {
                available: false,
                appointmentId: appointmentKey,
            });

            setFeedback('Appointment booked successfully!');
        } catch (error) {
            console.error('Error booking appointment:', error);
            setFeedback('Error booking appointment, please try again.');
        }
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Book Appointment</h2>
            <form onSubmit={handleBooking} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium">Clinic ID</label>
                    <input
                        type="text"
                        value={clinicId}
                        onChange={(e) => setClinicId(e.target.value)}
                        className="w-full border p-2 rounded"
                        placeholder="Enter Clinic ID"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Service ID</label>
                    <input
                        type="text"
                        value={serviceId}
                        onChange={(e) => setServiceId(e.target.value)}
                        className="w-full border p-2 rounded"
                        placeholder="Enter Service ID"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Time</label>
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                    Book Appointment
                </button>
            </form>
            {feedback && <p className="mt-4 text-center">{feedback}</p>}
        </div>
    );
}

export default Test;
