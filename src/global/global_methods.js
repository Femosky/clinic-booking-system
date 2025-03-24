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
