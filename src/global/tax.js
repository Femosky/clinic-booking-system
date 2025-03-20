export const provinceTotalTaxPercentage = {
    AB: 5.0,
    BC: 12.0,
    MB: 12.0,
    NB: 15.0,
    NL: 15.0,
    NT: 5.0,
    NS: 15.0,
    NU: 5.0,
    ON: 13.0,
    PE: 15.0,
    QC: 14.975,
    SK: 11.0,
    YT: 5.0,
};

export function calculateTax(province, total) {
    const tax = provinceTotalTaxPercentage[province.toUpperCase()] / 100;
    return total * tax;
}
