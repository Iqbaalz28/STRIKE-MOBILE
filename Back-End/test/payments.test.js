// Back-End/test/payments.test.js
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { fastify } from '../server.js';

const mockDbExecute = vi.fn();
fastify.db = { 
    execute: mockDbExecute, 
    query: vi.fn(), 
    getConnection: vi.fn() 
};

describe('Payments Route — GET /payment-methods', () => {

    beforeAll(async () => { await fastify.ready(); });
    afterAll(async () => { await fastify.close(); });

    it('Seharusnya mengembalikan daftar metode pembayaran', async () => {

        mockDbExecute.mockResolvedValueOnce([
            [
                { id: 1, name: 'QRIS' },
                { id: 2, name: 'Bank Transfer' }
            ],
            [] // <--- fields (dummy)
        ]);

        const res = await request(fastify.server).get('/payment-methods');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].name).toBe('QRIS');
    });
});
