// Back-End/test/orders.me.test.js
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import { fastify } from "../server.js";

const mockDbQuery = vi.fn();

fastify.db = {
    query: mockDbQuery,
    getConnection: vi.fn()
};

// Override authenticate (bukan decorate)
fastify.authenticate = async (request, reply) => {
  request.user = { id: 1 }; // user dianggap login
};

describe("Orders Route — GET /orders/me", () => {
    beforeAll(async () => { await fastify.ready(); });
    afterAll(async () => { await fastify.close(); });

    it("Seharusnya mengembalikan daftar pesanan user login", async () => {
        mockDbQuery.mockResolvedValueOnce([
        [
            {
            id: 1,
            order_number: "ORD-123",
            total_amount: 100000,
            payment_method_name: "QRIS",
            first_product_name: "Joran Pancing",
            review_count: 0
            }
        ]
        ]);

        const res = await request(fastify.server)
        .get("/orders/my-orders")
        .set("Authorization", "Bearer dummy");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].order_number).toBe("ORD-123");
    });
});
