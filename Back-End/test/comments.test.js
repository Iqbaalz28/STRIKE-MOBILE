// Back-End/test/comments.test.js
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import { fastify } from "../server.js";

const mockDbQuery = vi.fn();
fastify.db = { query: mockDbQuery, execute: vi.fn(), getConnection: vi.fn() };

describe("Community Route — GET /community/posts/:id/comments", () => {
    beforeAll(async () => { await fastify.ready(); });
    afterAll(async () => { await fastify.close(); });

    it("Seharusnya mengembalikan daftar komentar post", async () => {
        mockDbQuery.mockResolvedValueOnce([
        [
            { id: 1, comment: "Mantap", parent_id: null },
            { id: 2, comment: "Setuju", parent_id: 1 }
        ],
        []
        ]);

        const res = await request(fastify.server).get("/community/posts/1/comments");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);
        expect(res.body[0].comment).toBe("Mantap");
        expect(res.body[1].comment).toBe("Setuju");
    });
});
