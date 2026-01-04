// Back-End/test/cart.add.test.js
// Test ini memastikan user dapat menambahkan item ke keranjang (POST /cart)

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { fastify } from '../server.js';

// Mock DB agar tidak menggunakan MySQL asli
const mockDbQuery = vi.fn();
fastify.db = { query: mockDbQuery, execute: vi.fn(), getConnection: vi.fn() };

// Mock middleware JWT agar route bisa dilewati saat testing
fastify.authenticate = (req, reply, done) => {
    req.user = { id: 1 }; // user dummy untuk test
    done();
};

describe('Cart Route — POST /cart', () => {

    beforeAll(async () => { await fastify.ready(); });
    afterAll(async () => { await fastify.close(); });

    it('Seharusnya menambahkan item ke keranjang (status 200)', async () => {
        // 1) Mock cek produk sudah ada di cart → return kosong (belum ada)
        mockDbQuery.mockImplementationOnce(() =>
            Promise.resolve([ [] ])
        );

        // 2) Mock insert ke cart (tidak perlu return apapun)
        mockDbQuery.mockImplementationOnce(() =>
            Promise.resolve([ { affectedRows: 1 } ])
        );

        const res = await request(fastify.server)
            .post('/cart')
            .send({ id_product: 10, quantity: 1 })
            .set('Authorization', 'Bearer token'); // tidak dicek selama authenticate dimock

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toBe('Produk masuk keranjang');
    });
});
