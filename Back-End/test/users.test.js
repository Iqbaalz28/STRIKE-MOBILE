// Back-End/test/users.test.js
// Unit test untuk route users

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import { fastify } from "../server.js";

// Mock database
const mockDbExecute = vi.fn();
const mockDbQuery = vi.fn();
fastify.db = {
    execute: mockDbExecute,
    query: mockDbQuery,
    getConnection: vi.fn(),
};

// Mock authenticate middleware
fastify.authenticate = vi.fn((req, reply, done) => {
    req.user = { id: 1 };
    done();
});

describe("Users Route", () => {
    beforeAll(async () => {
        await fastify.ready();
    });
    afterAll(async () => {
        await fastify.close();
    });

    describe("GET /users", () => {
        it("Seharusnya mengembalikan daftar semua user", async () => {
            mockDbExecute.mockResolvedValueOnce([
                [
                    { id: 1, name: "John Doe", email: "john@example.com", bio: "Pemancing hobi", avatar_img: null },
                    { id: 2, name: "Jane Doe", email: "jane@example.com", bio: "Pecinta alam", avatar_img: null },
                ],
                [],
            ]);

            const res = await request(fastify.server).get("/users");

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(2);
            expect(res.body[0].name).toBe("John Doe");
            expect(res.body[1].email).toBe("jane@example.com");
        });

        it("Seharusnya mengembalikan array kosong jika tidak ada user", async () => {
            mockDbExecute.mockResolvedValueOnce([[], []]);

            const res = await request(fastify.server).get("/users");

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(0);
        });
    });

    describe("GET /users/:id", () => {
        it("Seharusnya mengembalikan detail user berdasarkan ID", async () => {
            mockDbExecute.mockResolvedValueOnce([
                [{ id: 1, name: "John Doe", email: "john@example.com", bio: "Pemancing hobi", avatar_img: null }],
                [],
            ]);

            const res = await request(fastify.server).get("/users/1");

            expect(res.statusCode).toBe(200);
            expect(res.body.id).toBe(1);
            expect(res.body.name).toBe("John Doe");
        });

        it("Seharusnya return 404 jika user tidak ditemukan", async () => {
            mockDbExecute.mockResolvedValueOnce([[], []]);

            const res = await request(fastify.server).get("/users/999");

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe("User not found");
        });
    });
});
