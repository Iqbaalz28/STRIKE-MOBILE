/**
 * Unit tests for AddPaymentMethodScreen utility functions
 * Tests card number formatting, masking, and validation logic
 */

import { describe, it, expect } from 'vitest';

// Utility functions (copied from AddPaymentMethodScreen for testing)

/**
 * Format card number with spaces every 4 digits
 * "1234567890123456" -> "1234 5678 9012 3456"
 */
const formatCardNumber = (text: string): string => {
    const cleaned = text.replace(/\s/g, '').replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
};

/**
 * Format expiry date as MM/YY
 * "1225" -> "12/25"
 */
const formatExpiryDate = (text: string): string => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
        return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
};

/**
 * Mask card number for display
 * "1234567890123456" -> "•••• •••• •••• 3456"
 */
const maskCardNumber = (cardNum: string): string => {
    const cleaned = cardNum.replace(/\s/g, '');
    if (cleaned.length < 4) return cleaned;
    return `•••• •••• •••• ${cleaned.slice(-4)}`;
};

/**
 * Validate phone number (Indonesian format)
 */
const isValidPhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 13;
};

/**
 * Validate card number (basic Luhn algorithm check disabled for simulation)
 */
const isValidCardNumber = (cardNum: string): boolean => {
    const cleaned = cardNum.replace(/\s/g, '');
    return cleaned.length === 16 && /^\d+$/.test(cleaned);
};

/**
 * Validate expiry date
 */
const isValidExpiryDate = (expiry: string): boolean => {
    const match = expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;

    const month = parseInt(match[1], 10);
    const year = parseInt(match[2], 10);

    return month >= 1 && month <= 12 && year >= 0 && year <= 99;
};

describe('AddPaymentMethodScreen Utility Functions', () => {
    describe('formatCardNumber', () => {
        it('should format card number with spaces every 4 digits', () => {
            expect(formatCardNumber('1234567890123456')).toBe('1234 5678 9012 3456');
        });

        it('should handle partial card numbers', () => {
            expect(formatCardNumber('1234')).toBe('1234');
            expect(formatCardNumber('12345678')).toBe('1234 5678');
            expect(formatCardNumber('123456789012')).toBe('1234 5678 9012');
        });

        it('should remove non-numeric characters', () => {
            expect(formatCardNumber('1234-5678-9012-3456')).toBe('1234 5678 9012 3456');
            expect(formatCardNumber('1234 abcd 5678')).toBe('1234 5678');
        });

        it('should handle empty string', () => {
            expect(formatCardNumber('')).toBe('');
        });

        it('should limit to 19 characters (16 digits + 3 spaces)', () => {
            expect(formatCardNumber('12345678901234567890')).toBe('1234 5678 9012 3456');
        });

        it('should handle already formatted input', () => {
            expect(formatCardNumber('1234 5678 9012 3456')).toBe('1234 5678 9012 3456');
        });
    });

    describe('formatExpiryDate', () => {
        it('should format expiry date as MM/YY', () => {
            expect(formatExpiryDate('1225')).toBe('12/25');
        });

        it('should handle partial input', () => {
            expect(formatExpiryDate('1')).toBe('1');
            expect(formatExpiryDate('12')).toBe('12/');
            expect(formatExpiryDate('123')).toBe('12/3');
        });

        it('should remove non-numeric characters', () => {
            expect(formatExpiryDate('12/25')).toBe('12/25');
            expect(formatExpiryDate('12-25')).toBe('12/25');
        });

        it('should handle empty string', () => {
            expect(formatExpiryDate('')).toBe('');
        });
    });

    describe('maskCardNumber', () => {
        it('should mask card number showing only last 4 digits', () => {
            expect(maskCardNumber('1234567890123456')).toBe('•••• •••• •••• 3456');
        });

        it('should handle formatted card numbers', () => {
            expect(maskCardNumber('1234 5678 9012 3456')).toBe('•••• •••• •••• 3456');
        });

        it('should handle short card numbers', () => {
            expect(maskCardNumber('123')).toBe('123');
            expect(maskCardNumber('1234')).toBe('•••• •••• •••• 1234');
        });

        it('should handle empty string', () => {
            expect(maskCardNumber('')).toBe('');
        });
    });

    describe('isValidPhoneNumber', () => {
        it('should validate correct Indonesian phone numbers', () => {
            expect(isValidPhoneNumber('08123456789')).toBe(true);
            expect(isValidPhoneNumber('081234567890')).toBe(true);
            expect(isValidPhoneNumber('0812345678901')).toBe(true);
        });

        it('should reject short phone numbers', () => {
            expect(isValidPhoneNumber('081234567')).toBe(false); // 9 digits
        });

        it('should reject too long phone numbers', () => {
            expect(isValidPhoneNumber('08123456789012')).toBe(false); // 14 digits
        });

        it('should ignore non-numeric characters for validation', () => {
            expect(isValidPhoneNumber('0812-345-6789')).toBe(true);
        });
    });

    describe('isValidCardNumber', () => {
        it('should validate 16-digit card numbers', () => {
            expect(isValidCardNumber('1234567890123456')).toBe(true);
        });

        it('should validate card numbers with spaces', () => {
            expect(isValidCardNumber('1234 5678 9012 3456')).toBe(true);
        });

        it('should reject short card numbers', () => {
            expect(isValidCardNumber('123456789012345')).toBe(false); // 15 digits
        });

        it('should reject too long card numbers', () => {
            expect(isValidCardNumber('12345678901234567')).toBe(false); // 17 digits
        });

        it('should reject card numbers with letters', () => {
            expect(isValidCardNumber('1234abcd90123456')).toBe(false);
        });
    });

    describe('isValidExpiryDate', () => {
        it('should validate correct expiry dates', () => {
            expect(isValidExpiryDate('01/25')).toBe(true);
            expect(isValidExpiryDate('12/30')).toBe(true);
        });

        it('should reject invalid months', () => {
            expect(isValidExpiryDate('00/25')).toBe(false);
            expect(isValidExpiryDate('13/25')).toBe(false);
        });

        it('should reject incorrectly formatted dates', () => {
            expect(isValidExpiryDate('1225')).toBe(false);
            expect(isValidExpiryDate('12-25')).toBe(false);
        });

        it('should handle edge cases', () => {
            expect(isValidExpiryDate('01/00')).toBe(true); // Valid format
            expect(isValidExpiryDate('12/99')).toBe(true);
        });
    });
});

describe('Payment Type Validation', () => {
    describe('Card Payment Validation', () => {
        it('should validate complete card payment data', () => {
            const cardData = {
                cardNumber: '1234 5678 9012 3456',
                cardHolder: 'JOHN DOE',
                expiryDate: '12/25',
                cvv: '123',
            };

            const isValid =
                isValidCardNumber(cardData.cardNumber) &&
                cardData.cardHolder.length > 0 &&
                isValidExpiryDate(cardData.expiryDate) &&
                cardData.cvv.length >= 3;

            expect(isValid).toBe(true);
        });

        it('should reject incomplete card data', () => {
            const cardData = {
                cardNumber: '1234 5678 9012 345', // 15 digits
                cardHolder: 'JOHN DOE',
                expiryDate: '12/25',
                cvv: '123',
            };

            const isValid = isValidCardNumber(cardData.cardNumber);
            expect(isValid).toBe(false);
        });
    });

    describe('E-Wallet Payment Validation', () => {
        it('should validate e-wallet payment data', () => {
            const ewalletData = {
                selectedEwallet: 'gopay',
                phoneNumber: '08123456789',
            };

            const isValid =
                ewalletData.selectedEwallet.length > 0 &&
                isValidPhoneNumber(ewalletData.phoneNumber);

            expect(isValid).toBe(true);
        });
    });

    describe('Bank Transfer Validation', () => {
        it('should validate bank transfer data', () => {
            const bankData = {
                selectedBank: 'bca',
                accountNumber: '1234567890',
                accountName: 'JOHN DOE',
            };

            const isValid =
                bankData.selectedBank.length > 0 &&
                bankData.accountNumber.length > 0 &&
                bankData.accountName.length > 0;

            expect(isValid).toBe(true);
        });
    });
});
