/**
 * Unit tests for PaymentMethodsScreen helper functions
 * Tests storage operations for payment methods using AsyncStorage mock
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock AsyncStorage
const mockStorage: Record<string, string> = {};
const mockAsyncStorage = {
    getItem: vi.fn((key: string) => Promise.resolve(mockStorage[key] || null)),
    setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
        return Promise.resolve();
    }),
    removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
        return Promise.resolve();
    }),
    clear: vi.fn(() => {
        Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
        return Promise.resolve();
    }),
};

vi.mock('@react-native-async-storage/async-storage', () => ({
    default: mockAsyncStorage,
}));

// Types
interface SavedPaymentMethod {
    id: string;
    type: 'card' | 'ewallet' | 'bank';
    name: string;
    details: string;
    icon?: string;
    isDefault: boolean;
}

const PAYMENT_METHODS_STORAGE_KEY = '@saved_payment_methods';

// Helper functions (copied from PaymentMethodsScreen for testing)
const getPaymentMethods = async (): Promise<SavedPaymentMethod[]> => {
    try {
        const data = await mockAsyncStorage.getItem(PAYMENT_METHODS_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting payment methods:', error);
        return [];
    }
};

const savePaymentMethods = async (methods: SavedPaymentMethod[]): Promise<void> => {
    try {
        await mockAsyncStorage.setItem(PAYMENT_METHODS_STORAGE_KEY, JSON.stringify(methods));
    } catch (error) {
        console.error('Error saving payment methods:', error);
    }
};

describe('PaymentMethodsScreen Helper Functions', () => {
    beforeEach(() => {
        // Clear mock storage before each test
        Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
        vi.clearAllMocks();
    });

    describe('getPaymentMethods', () => {
        it('should return empty array when no data exists', async () => {
            const result = await getPaymentMethods();

            expect(result).toEqual([]);
            expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(PAYMENT_METHODS_STORAGE_KEY);
        });

        it('should return saved payment methods', async () => {
            const mockMethods: SavedPaymentMethod[] = [
                {
                    id: '1',
                    type: 'card',
                    name: 'John Doe',
                    details: '•••• •••• •••• 1234',
                    isDefault: true,
                },
                {
                    id: '2',
                    type: 'ewallet',
                    name: 'GoPay',
                    details: '08123456789',
                    isDefault: false,
                },
            ];

            mockStorage[PAYMENT_METHODS_STORAGE_KEY] = JSON.stringify(mockMethods);

            const result = await getPaymentMethods();

            expect(result).toEqual(mockMethods);
            expect(result.length).toBe(2);
            expect(result[0].name).toBe('John Doe');
            expect(result[1].type).toBe('ewallet');
        });

        it('should return empty array on parse error', async () => {
            mockStorage[PAYMENT_METHODS_STORAGE_KEY] = 'invalid json';

            // Mock console.error to avoid noise in test output
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            const result = await getPaymentMethods();

            expect(result).toEqual([]);
            consoleSpy.mockRestore();
        });
    });

    describe('savePaymentMethods', () => {
        it('should persist payment methods to storage', async () => {
            const methodsToSave: SavedPaymentMethod[] = [
                {
                    id: '123',
                    type: 'bank',
                    name: 'BCA - John Doe',
                    details: '•••• 5678',
                    isDefault: true,
                },
            ];

            await savePaymentMethods(methodsToSave);

            expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
                PAYMENT_METHODS_STORAGE_KEY,
                JSON.stringify(methodsToSave)
            );
            expect(mockStorage[PAYMENT_METHODS_STORAGE_KEY]).toBe(JSON.stringify(methodsToSave));
        });

        it('should overwrite existing data', async () => {
            // Set initial data
            const initialMethods: SavedPaymentMethod[] = [
                { id: '1', type: 'card', name: 'Initial', details: '1234', isDefault: true },
            ];
            mockStorage[PAYMENT_METHODS_STORAGE_KEY] = JSON.stringify(initialMethods);

            // Save new data
            const newMethods: SavedPaymentMethod[] = [
                { id: '2', type: 'ewallet', name: 'Updated', details: '5678', isDefault: true },
            ];
            await savePaymentMethods(newMethods);

            const savedData = JSON.parse(mockStorage[PAYMENT_METHODS_STORAGE_KEY]);
            expect(savedData.length).toBe(1);
            expect(savedData[0].name).toBe('Updated');
        });

        it('should handle empty array', async () => {
            await savePaymentMethods([]);

            expect(mockStorage[PAYMENT_METHODS_STORAGE_KEY]).toBe('[]');
        });
    });

    describe('Payment Method Data Structure', () => {
        it('should support card type payment method', async () => {
            const cardMethod: SavedPaymentMethod = {
                id: 'card-1',
                type: 'card',
                name: 'JOHN DOE',
                details: '•••• •••• •••• 4567',
                isDefault: true,
            };

            await savePaymentMethods([cardMethod]);
            const result = await getPaymentMethods();

            expect(result[0].type).toBe('card');
            expect(result[0].details).toContain('••••');
        });

        it('should support ewallet type payment method', async () => {
            const ewalletMethod: SavedPaymentMethod = {
                id: 'ewallet-1',
                type: 'ewallet',
                name: 'GoPay',
                details: '08123456789',
                isDefault: false,
            };

            await savePaymentMethods([ewalletMethod]);
            const result = await getPaymentMethods();

            expect(result[0].type).toBe('ewallet');
            expect(result[0].details).toBe('08123456789');
        });

        it('should support bank type payment method', async () => {
            const bankMethod: SavedPaymentMethod = {
                id: 'bank-1',
                type: 'bank',
                name: 'BCA - JOHN DOE',
                details: '•••• 7890',
                isDefault: false,
            };

            await savePaymentMethods([bankMethod]);
            const result = await getPaymentMethods();

            expect(result[0].type).toBe('bank');
            expect(result[0].name).toContain('BCA');
        });
    });
});
