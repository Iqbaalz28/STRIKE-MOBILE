// Test ini memastikan daftar produk untuk halaman shop dapat diambil

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { fastify } from '../server.js';

const mockDbQuery = vi.fn();
fastify.db = { query: mockDbQuery, execute: vi.fn(), getConnection: vi.fn() };

describe('Products Route — GET /products', () => {

    beforeAll(async () => { await fastify.ready(); });
    afterAll(async () => { await fastify.close(); });

    it('Seharusnya mengembalikan daftar produk (status 200)', async () => {

        // Mock hasil query DB untuk produk
        mockDbQuery.mockImplementationOnce(() => Promise.resolve([
            [ { id: 1, name: 'Joran Shimano FX', price_sale: 489000 } ]
        ]));

        const res = await request(fastify.server).get('/products');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].name).toBe('Joran Shimano FX');
    });
});
