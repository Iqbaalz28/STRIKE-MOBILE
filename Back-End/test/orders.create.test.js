import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import { fastify } from "../server.js";

// Mock Auth
fastify.authenticate = async (req, reply) => {
    req.user = { id: 1 };
};

// Mock DB Transactions
const mockConn = {
    beginTransaction: vi.fn(),
    commit: vi.fn(),
    rollback: vi.fn(),
    release: vi.fn(),
    query: vi.fn(),
};

fastify.db = {
    getConnection: vi.fn().mockResolvedValue(mockConn)
};

describe("Orders Route — POST /orders", () => {
    beforeAll(async () => {
        await fastify.ready();
    });

    afterAll(async () => {
        await fastify.close();
        vi.restoreAllMocks();
    });

    it("Seharusnya berhasil membuat order baru (checkout)", async () => {
        // === Mock cart dari connection.query ===
        mockConn.query
        // SELECT cart
        .mockResolvedValueOnce([
            [
            {
                id: 10,
                id_product: 1,
                quantity: 2,
                price_sale: 50000,
                price_rent: null,
                transaction_type: "beli"
            }
            ]
        ])
        // INSERT orders
        .mockResolvedValueOnce([{ insertId: 999 }])
        // INSERT order_items
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        // DELETE shopping_cart
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

        const res = await request(fastify.server)
        .post("/orders")
        .set("Authorization", "Bearer dummy_token")
        .send({
            shipping_address: "Jl. Merdeka No. 10 Bandung",
            payment_method: 1,
            notes: "Tolong packing aman"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("order_number");
        expect(res.body.order_number).toContain("ORD");
    });
});
