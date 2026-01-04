// Test ini memastikan endpoint GET /locations bekerja sesuai fungsinya

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { fastify } from '../server.js';

// Mock database agar test tidak memakai MySQL asli
const mockDbQuery = vi.fn();
fastify.db = { query: mockDbQuery, execute: vi.fn(), getConnection: vi.fn() };

describe('Locations Route — GET /locations', () => {

    // Menunggu Fastify siap sebelum test dijalankan
    beforeAll(async () => { await fastify.ready(); });

    // Tutup server setelah semua test selesai
    afterAll(async () => { await fastify.close(); });

    it('Seharusnya mengembalikan daftar lokasi (status 200)', async () => {

        // Data palsu untuk menggantikan hasil query database
        mockDbQuery.mockImplementationOnce(() =>
            Promise.resolve([
                [
                    {
                        id: 1,
                        name: 'Kolam Pancing Test',
                        city: 'Jakarta',
                        price_per_hour: 50000,
                        img: 'test.jpg'
                    }
                ]
            ])
        );

        // Request HTTP ke route yang diuji
        const response = await request(fastify.server).get('/locations');

        // Validasi response sukses
        expect(response.statusCode).toBe(200);

        // Response harus berupa array
        expect(Array.isArray(response.body)).toBe(true);

        // Minimal ada 1 lokasi dikembalikan
        expect(response.body.length).toBeGreaterThan(0);

        // Validasi bahwa field nama sesuai
        expect(response.body[0].name).toBe('Kolam Pancing Test');
    });
});
