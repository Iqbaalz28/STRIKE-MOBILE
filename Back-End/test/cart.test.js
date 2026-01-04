// Test ini memastikan user dapat melihat isi keranjang tanpa butuh login sungguhan

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { fastify } from '../server.js';

const mockDbQuery = vi.fn();
fastify.db = { query: mockDbQuery, execute: vi.fn(), getConnection: vi.fn() };

// Mock middleware JWT agar tidak memblokir request akibat login
// mock JWT untuk mengisi request.user.id
fastify.authenticate = vi.fn((req, reply, done) => {
    req.user = { id: 1 }; // backend butuh id_user
    done();
});


describe('Cart Route — GET /cart', () => {

    beforeAll(async () => { await fastify.ready(); });
    afterAll(async () => { await fastify.close(); });

    it('Seharusnya mengembalikan daftar item keranjang user', async () => {

        // Mock query DB untuk isi keranjang
        mockDbQuery.mockImplementationOnce(() => Promise.resolve([
            [
                { id_product: 55, name: 'Reel Daiwa BG', quantity: 2, price: 450000 }
            ]
        ]));

        const res = await request(fastify.server)
            .get('/cart')
            .set('Authorization', 'Bearer dummy'); // token palsu

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].name).toBe('Reel Daiwa BG');
    });
});
