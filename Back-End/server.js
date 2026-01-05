import Fastify from "fastify";
import dotenv from "dotenv";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import db from "./src/config/db.js";
import oauthPlugin from "@fastify/oauth2";
import fastifyRoutes from "@fastify/routes";
import cookie from "@fastify/cookie";

//setup __dirname untuk ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const fastify = Fastify({ logger: true });

// Register Cookie (Letakkan sebelum routes/auth)
fastify.register(cookie, {
  secret: process.env.JWT_SECRET || "rahasia-cookie-sementara",
  parseOptions: {},
});

fastify.register(oauthPlugin, {
  name: "googleOAuth2",
  scope: ["profile", "email"],
  credentials: {
    client: {
      id: process.env.GOOGLE_CLIENT_ID,
      secret: process.env.GOOGLE_CLIENT_SECRET,
    },
    auth: oauthPlugin.GOOGLE_CONFIGURATION,
  },
  startRedirectPath: "/auth/google",
  //callbackUri: "http://localhost:3000/auth",
  callbackUri:
    "https://michael-tressier-glory.ngrok-free.dev/auth/google/callback", // HARUS DIGANTI SETIAP MEMBUKA NGROK
});
// cek dir uploads
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("Folder 'uploads' berhasil dibuat otomatis.");
}

// --- 2. REGISTER PLUGINS ---
await fastify.register(multipart);

await fastify.register(fastifyStatic, {
  root: uploadDir,
  prefix: "/uploads/",
});

// Setup CORS (Wajib ada PUT dan izinkan React Native)
await fastify.register(cors, {
  origin: [
    "http://localhost:8081",
    "http://10.0.2.2:8081",
    "http://localhost:19000",
    "http://localhost:19001",
    "http://localhost:19002",
    true,
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

// --- 3. SETUP DATABASE & AUTH ---
fastify.decorate("db", db);

fastify.register(jwt, {
  secret: process.env.JWT_SECRET,
});

fastify.decorate("authenticate", async function (request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});
await fastify.register(fastifyRoutes);
// --- 4. REGISTER ROUTES ---
import usersRoutes from "./src/routes/users.js";
import productsRoutes from "./src/routes/products.js";
import locationsRoutes from "./src/routes/locations.js";
import bookingsRoutes from "./src/routes/bookings.js";
import ordersRoutes from "./src/routes/orders.js";
import referencesRoutes from "./src/routes/references.js";
import communityRoutes from "./src/routes/community.js";
import reviewsRoutes from "./src/routes/reviews.js";
import cartRoutes from "./src/routes/cart.js";
import paymentsRoutes from "./src/routes/payments.js";
import uploadRoutes from "./src/routes/upload.js";
import eventsRoutes from "./src/routes/events.js";
import authRoutes from "./src/routes/auth.js";

fastify.register(usersRoutes);
fastify.register(productsRoutes, { prefix: "/products" });
fastify.register(locationsRoutes, { prefix: "/locations" });
fastify.register(bookingsRoutes, { prefix: "/bookings" });
fastify.register(ordersRoutes, { prefix: "/orders" });
fastify.register(referencesRoutes, { prefix: "/references" });
fastify.register(communityRoutes, { prefix: "/community" });
fastify.register(reviewsRoutes, { prefix: "/reviews" });
fastify.register(cartRoutes, { prefix: "/cart" });
fastify.register(paymentsRoutes, { prefix: "/payments" });
fastify.register(uploadRoutes);
fastify.register(eventsRoutes);
fastify.register(authRoutes);

// --- 5. START SERVER ---
export { fastify };

// Jalankan server HANYA jika file ini dieksekusi langsung
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const start = async () => {
    try {
      await fastify.ready();
      console.log(fastify.printRoutes());
      await fastify.listen({ port: process.env.PORT || 3000, host: "0.0.0.0" });
      console.log(`Server running on port ${process.env.PORT || 3000}`);

      // Check DB connection
      try {
        const conn = await db.getConnection();
        console.log("✅ Database terhubung sukses!");
        conn.release();
      } catch (dbErr) {
        console.error("❌ Gagal connect database:", dbErr.message);
      }
    } catch (err) {
      console.error("❌ SERVER STARTUP ERROR:", err);
      fastify.log.error(err);
      process.exit(1);
    }
  };
  start();
}
