// Back-End/test/locations.spots.test.js
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { fastify } from '../server.js';

const mockDbQuery = vi.fn();
fastify.db = {
    query: mockDbQuery,
    execute: vi.fn(),
    getConnection: vi.fn()
};

describe('Locations — Spot Availability', () => {

    beforeAll(async () => {
        await fastify.ready();
    });

    afterAll(async () => {
        await fastify.close();
    });

    it('GET /locations/:id/availability harus bekerja tanpa error', async () => {
        const locationId = 1;
        const date = '2025-11-25';

        mockDbQuery.mockImplementationOnce(() => Promise.resolve([
        [
            { spot_name: 'T1' }, { spot_name: 'T2' }, { spot_name: 'T3' },
            { spot_name: 'B1' }, { spot_name: 'B2' }
        ]
        ]));

        mockDbQuery.mockImplementationOnce(() => Promise.resolve([
        [
            { spot_number: 'T1' },
            { spot_number: 'B2' }
        ]
        ]));

        const res = await request(fastify.server)
        .get(`/locations/${locationId}/availability?date=${date}`);

        console.log("DEBUG RESPONSE:", res.body);

        expect(res.statusCode).toBe(200);
        expect(res.body).toBeDefined();
    });
});
