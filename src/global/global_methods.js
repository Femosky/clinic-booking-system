import emailjs from '@emailjs/browser';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { klinicWebsite } from './global_variables';

// SERVICE FUNCTIONS

export function sendEmailNotificationUpdate(fromEmail, toEmail, fromName, toName, doctorEmail, doctorName, message) {
    const serviceId = 'service_nxb45ly';
    const templateId = 'template_6lbj8co';
    const publicKey = 'ROBH3YORy8z8WXHAy';

    const templateParams = {
        from_email: fromEmail,
        email: toEmail,
        from_name: fromName,
        to_name: toName,
        doctor_email: doctorEmail,
        doctor_name: doctorName,
        message: message,
    };

    console.log('TEMPLATE PARAMS: ', templateParams);

    emailjs
        .send(serviceId, templateId, templateParams, publicKey)
        .then((response) => {
            console.log('Email sent successfully!', response);
            return null, response;
        })
        .catch((error) => {
            console.log('Failed to send email:', error);
            return error, null;
        });
}

// EMAILS

export function getCanceledEmailByPatient(serviceName, doctorName, duration, appointmentTime) {
    return `
    You have canceled your ${convertMinutesToHours(duration)} hour${
        convertMinutesToHours(duration) > 2 ? 's' : ' '
    } ${serviceName} appointment with ${doctorName}.

    Time: ${formatToTime(appointmentTime)}
    Date: ${formatToDayDateMonthYear(appointmentTime)}
    
    Please log in to view
    Link: ${klinicWebsite}
    `;
}

export function getCanceledEmailFromPatient(serviceName, patientName, doctorName, duration, appointmentTime) {
    return `
    ${patientName} has canceled their ${convertMinutesToHours(duration)} hour${
        convertMinutesToHours(duration) > 2 ? 's' : ' '
    } ${serviceName} appointment with ${doctorName}.

    Time: ${formatToTime(appointmentTime)}
    Date: ${formatToDayDateMonthYear(appointmentTime)}
    
    Please log in to view
    Link: ${klinicWebsite}
    `;
}

export function getCanceledEmailFromClinicForPatient(serviceName, doctorName, clinicName, duration, appointmentTime) {
    return `
    ${clinicName} has canceled your ${convertMinutesToHours(duration)} hour${
        convertMinutesToHours(duration) > 2 ? 's' : ' '
    } ${serviceName} appointment with ${doctorName}.

    Time: ${formatToTime(appointmentTime)}
    Date: ${formatToDayDateMonthYear(appointmentTime)}

    We are sorry for all inconveniences caused.
    
    Please log in to reschedule another appointment.
    Link: ${klinicWebsite}
    `;
}

export function getReservedEmailForPatient(serviceName, doctorName, clinicName, duration, appointmentTime) {
    return `
    Your ${convertMinutesToHours(duration)} hour${
        convertMinutesToHours(duration) > 2 ? 's' : ' '
    } ${serviceName} appointment with ${doctorName} has been reserved.

    Time: ${formatToTime(appointmentTime)}
    Date: ${formatToDayDateMonthYear(appointmentTime)}
    
    Please wait for ${clinicName} to approve the appointment and you will receive an email for it.

    `;
}

export function getConfirmationEmailForPatient(serviceName, doctorName, clinicName, duration, appointmentTime) {
    return `
    Your ${duration} hour${
        (parseFloat(duration) / 60).toFixed(0) > 2 ? 's' : ' '
    } ${serviceName} appointment with ${doctorName} has been confirmed by ${clinicName}.
    
    Your appointment time: ${formatToTime(appointmentTime)}
    Date: ${formatToDayDateMonthYear(appointmentTime)}

    `;
}

export function getCanceledEmailFromClinicForDoctor(serviceName, patientName, clinicName, duration, appointmentTime) {
    return `
    ${clinicName} has canceled your ${convertMinutesToHours(duration)} hour${
        convertMinutesToHours(duration) > 2 ? 's' : ' '
    } ${serviceName} appointment with the patient ${patientName}.

    Time: ${formatToTime(appointmentTime)}
    Date: ${formatToDayDateMonthYear(appointmentTime)}

    We are sorry for all inconveniences caused.
    
    Please log in to reschedule another appointment.
    Link: ${klinicWebsite}
    `;
}

export function getReservedEmailForDoctor(serviceName, patientName, clinicName, duration, appointmentTime) {
    return `A reservation has been requested from ${clinicName}.
    
    Service name: ${serviceName}
    Patient name: ${patientName}
    Duration: ${(parseFloat(duration) / 60).toFixed(0) > 2 && 's'}
    Date: ${formatToDayDateMonthYear(appointmentTime)}
    Time: ${formatToTime(appointmentTime)}

    Please review and confirm with your clinic via Klinic.
    Link: ${klinicWebsite}/services
    `;
}

export function getConfirmationEmailForDoctor(serviceName, patientName, clinicName, duration, appointmentTime) {
    return `An appointment has been confirmed with ${clinicName}.
    
    Service name: ${serviceName}
    Patient name: ${patientName}
    Duration: ${(parseFloat(duration) / 60).toFixed(0) > 2 && 's'}
    Date: ${formatToDayDateMonthYear(appointmentTime)}
    Time: ${formatToTime(appointmentTime)}
    `;
}

// UTILITY FUNCTIONS

export function isUndefined(value) {
    return value === undefined || value === null;
}

export function convertUnixToDateObject(unixTime) {
    const date = new Date(Number(unixTime));
    return date;
}

export function convertISOStringToUnix(isoString) {
    const timestamp = new Date(isoString).getTime();
    return timestamp;
}

export function formatToTime(unixTime) {
    const date = convertUnixToDateObject(unixTime); // Convert Unix timestamp to milliseconds
    return format(date, 'hh:mm a'); // Format as HH:MM AM/PM
}

export function formatToDayDateMonthYear(unixTime) {
    const date = convertUnixToDateObject(unixTime);
    return format(date, 'EEEE, do MMMM yyyy');
}

export function daysUntilAppointment(unixTime) {
    const appointmentDate = convertUnixToDateObject(unixTime);
    const today = new Date();

    // Set both dates to midnight to avoid issues with time differences
    appointmentDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // Calculate the difference in milliseconds and convert to days
    const diffTime = appointmentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return `You have ${diffDays} more day${diffDays >= 2 ? 's' : ''} to your appointment`;
}

export function convertMinutesToHours(minutes) {
    return (parseFloat(minutes) / 60).toFixed(2);
}

export function parsePrice(price) {
    return parseFloat(price).toFixed(2);
}

export function capitalize(word) {
    const firstLetter = word.charAt(0);

    const firstLetterCap = firstLetter.toUpperCase();

    const remainingLetters = word.slice(1);

    return firstLetterCap + remainingLetters;
}

export function toSnakeCase(str) {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

export const toCamelCase = (str) => {
    return str.replace(/([-_][a-z])/gi, ($1) => {
        return $1.toUpperCase().replace('-', '').replace('_', '');
    });
};

export function convertKeysToSnakeCase(obj) {
    if (Array.isArray(obj)) {
        return obj.map((item) => convertKeysToSnakeCase(item));
    } else if (obj !== null && typeof obj === 'object') {
        return Object.entries(obj).reduce((acc, [key, value]) => {
            const newKey = toSnakeCase(key);
            acc[newKey] = convertKeysToSnakeCase(value); // Recursively process nested objects/arrays
            return acc;
        }, {});
    }
    return obj; // Return primitive values as-is
}

export function convertKeysToCamelCase(obj) {
    if (Array.isArray(obj)) {
        return obj.map((item) => convertKeysToCamelCase(item));
    } else if (obj !== null && typeof obj === 'object') {
        return Object.entries(obj).reduce((acc, [key, value]) => {
            const newKey = toCamelCase(key);
            acc[newKey] = convertKeysToCamelCase(value); // Recursively process nested objects/arrays
            return acc;
        }, {});
    }
    return obj; // Return primitive values as-is
}

// REGEX

export function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

export function isValidCardNumber(number) {
    const cardRegex = /^(?:\d{4}[- ]?){3}\d{4}$/;
    return cardRegex.test(number);
}

export function isValidCardExpiryDate(expiry) {
    // Regex to match the format MM/YY
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;

    // Check if the format is correct
    if (!expiryRegex.test(expiry)) return false;

    // Extract month and year
    const [month, year] = expiry.split('/').map(Number);

    // Get current month and year
    const currentYear = new Date().getFullYear() % 100; // Last two digits of the year
    const currentMonth = new Date().getMonth() + 1; // Month is zero-based

    // Expiry logic: Year must be the current year or later,
    // and if it's the current year, the month must be this month or later
    if (year > currentYear || (year === currentYear && month >= currentMonth)) {
        return true;
    }

    return false;
}
