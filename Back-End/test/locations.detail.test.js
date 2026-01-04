import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { fastify } from '../server.js';

const mockDbQuery = vi.fn();
fastify.db = { query: mockDbQuery, execute: vi.fn(), getConnection: vi.fn() };

describe('Locations Route — GET /locations/:id', () => {
    beforeAll(async () => { await fastify.ready(); });
    afterAll(async () => { await fastify.close(); });

    it('Seharusnya mengembalikan detail lokasi', async () => {
        mockDbQuery
        // mock query pertama → detail lokasi
        .mockImplementationOnce(() => Promise.resolve([
            [ { id: 1, name: 'Situ Rawa Indah', city: 'Jakarta' } ]
        ]))
        // mock query kedua → gallery/images atau reviews (apa pun aman)
        .mockImplementationOnce(() => Promise.resolve([ [] ]));
    

        const res = await request(fastify.server).get('/locations/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('name');
        expect(res.body.name).toBe('Situ Rawa Indah');
    });
});
