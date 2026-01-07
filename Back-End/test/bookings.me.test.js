// Back-End/test/bookings.me.test.js
// Unit test untuk route GET /bookings/my-bookings

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import { fastify } from "../server.js";

// Mock database
const mockDbQuery = vi.fn();
fastify.db = {
    query: mockDbQuery,
    execute: vi.fn(),
    getConnection: vi.fn(),
};

// Mock authenticate middleware
fastify.authenticate = vi.fn((req, reply, done) => {
    req.user = { id: 1 }; // Simulasi user login
    done();
});

describe("Bookings Route — GET /bookings/my-bookings", () => {
    beforeAll(async () => {
        await fastify.ready();
    });
    afterAll(async () => {
        await fastify.close();
    });

    it("Seharusnya mengembalikan daftar booking milik user", async () => {
        mockDbQuery.mockResolvedValueOnce([
            [
                {
                    id: 101,
                    id_location: 1,
                    booking_start: "2025-01-10 09:00:00",
                    booking_end: "2025-01-10 12:00:00",
                    total_price: 150000,
                    status: "confirmed",
                    payment_status: "paid",
                    spot_number: 5,
                    location_name: "Kolam Mancing Bahagia",
                    city: "Jakarta",
                    location_img: "kolam1.jpg",
                    is_reviewed: 0,
                },
                {
                    id: 102,
                    id_location: 2,
                    booking_start: "2025-01-15 14:00:00",
                    booking_end: "2025-01-15 17:00:00",
                    total_price: 200000,
                    status: "pending",
                    payment_status: "unpaid",
                    spot_number: 3,
                    location_name: "Pemancingan Jaya",
                    city: "Bandung",
                    location_img: "kolam2.jpg",
                    is_reviewed: 0,
                },
            ],
            [],
        ]);

        const res = await request(fastify.server)
            .get("/bookings/my-bookings")
            .set("Authorization", "Bearer dummy-token");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);
        expect(res.body[0].location_name).toBe("Kolam Mancing Bahagia");
        expect(res.body[1].status).toBe("pending");
    });

    it("Seharusnya mengembalikan array kosong jika user belum punya booking", async () => {
        mockDbQuery.mockResolvedValueOnce([[], []]);

        const res = await request(fastify.server)
            .get("/bookings/my-bookings")
            .set("Authorization", "Bearer dummy-token");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
    });

    it("Seharusnya mengandung field is_reviewed untuk tracking review", async () => {
        mockDbQuery.mockResolvedValueOnce([
            [
                {
                    id: 103,
                    id_location: 1,
                    booking_start: "2025-01-20 10:00:00",
                    booking_end: "2025-01-20 13:00:00",
                    total_price: 180000,
                    status: "completed",
                    payment_status: "paid",
                    spot_number: 2,
                    location_name: "Kolam Mancing Bahagia",
                    city: "Jakarta",
                    location_img: "kolam1.jpg",
                    is_reviewed: 1, // User sudah memberikan review
                },
            ],
            [],
        ]);

        const res = await request(fastify.server)
            .get("/bookings/my-bookings")
            .set("Authorization", "Bearer dummy-token");

        expect(res.statusCode).toBe(200);
        expect(res.body[0].is_reviewed).toBe(1);
    });
});
