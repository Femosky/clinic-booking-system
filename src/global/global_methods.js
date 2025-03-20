export function capitalize(word) {
    const firstLetter = word.charAt(0);

    const firstLetterCap = firstLetter.toUpperCase();

    const remainingLetters = word.slice(1);

    return firstLetterCap + remainingLetters;
}

export const toCamelCase = (s) => {
    return s.replace(/([-_][a-z])/gi, ($1) => {
        return $1.toUpperCase().replace('-', '').replace('_', '');
    });
};

export function convertKeysToCamelCase(obj) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
        const newKey = toCamelCase(key);
        acc[newKey] = value;
        return acc;
    }, {});
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
