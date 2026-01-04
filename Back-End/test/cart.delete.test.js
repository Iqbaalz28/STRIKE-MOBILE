// Back-End/test/cart.delete.test.js
// Test ini memastikan user dapat menghapus item dari keranjang (DELETE /cart/:id)

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { fastify } from '../server.js';

// Mock DB
const mockDbQuery = vi.fn();
fastify.db = { query: mockDbQuery, execute: vi.fn(), getConnection: vi.fn() };

// Bypass JWT (req.user harus ada agar backend tidak 500)
fastify.authenticate = (req, reply, done) => {
    req.user = { id: 1 }; // user dummy
    done();
};

describe('Cart Route — DELETE /cart/:id', () => {

    beforeAll(async () => { await fastify.ready(); });
    afterAll(async () => { await fastify.close(); });

    it('Seharusnya menghapus item dari keranjang (status 200)', async () => {
        // Mock query delete
        mockDbQuery.mockImplementationOnce(() =>
            Promise.resolve([{ affectedRows: 1 }])
        );

        const res = await request(fastify.server)
            .delete('/cart/5')
            .set('Authorization', 'Bearer token');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toBe('Item dihapus');
    });
});
