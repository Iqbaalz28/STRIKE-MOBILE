// src/routes/auth.js
import bcrypt from "bcrypt";

export default async function (fastify, options) {
  // ==========================================
  // 1. REGISTER MANUAL (Email & Password)
  // ==========================================
  fastify.post("/register", async (request, reply) => {
    const { name, email, password } = request.body;

    // Validasi sederhana
    if (!name || !email || !password) {
      return reply
        .code(400)
        .send({ message: "Nama, Email, dan Password wajib diisi" });
    }

    try {
      // Cek Email Duplikat
      const [existingUsers] = await fastify.db.execute(
        "SELECT * FROM users WHERE email = ?",
        [email],
      );

      if (existingUsers.length > 0) {
        return reply.code(400).send({ message: "Email sudah terdaftar" });
      }

      // Hash Password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Simpan ke DB (Default id_membership = 2 / Free)
      await fastify.db.execute(
        "INSERT INTO users (name, email, password, id_membership) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, 2],
      );

      return reply
        .code(201)
        .send({ message: "Registrasi berhasil, silakan login." });
    } catch (err) {
      fastify.log.error(err);
      return reply
        .code(500)
        .send({ message: "Gagal Register", error: err.message });
    }
  });

  // ==========================================
  // 2. LOGIN MANUAL (Email & Password) - PERBAIKAN BUG 500
  // ==========================================
  fastify.post("/login", async (request, reply) => {
    const { email, password } = request.body;

    try {
      // Ambil user dari DB
      const [users] = await fastify.db.execute(
        "SELECT * FROM users WHERE email = ?",
        [email],
      );
      const user = users[0];

      // --- PERBAIKAN PENTING ---
      // Cek 1: Apakah user ditemukan?
      if (!user) {
        // Jangan lanjut ke bcrypt, langsung tolak. Ini mencegah error "data and hash required"
        return reply.code(401).send({ message: "Email tidak terdaftar" });
      }

      // Cek 2: Apakah user punya password? (Jika dia daftar lewat Google, password null)
      if (!user.password) {
        return reply.code(400).send({
          message:
            "Akun ini terdaftar via Google. Silakan login dengan Google.",
        });
      }
      // -------------------------

      // Cek Password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return reply.code(401).send({ message: "Password salah" });
      }

      // Buat Token
      const token = fastify.jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        { expiresIn: "7d" },
      );

      return reply.send({
        status: "success",
        message: "Login Berhasil",
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar_img: user.avatar_img,
          membership: user.id_membership, // Opsional
        },
      });
    } catch (err) {
      fastify.log.error(err);
      return reply
        .code(500)
        .send({ message: "Terjadi kesalahan server", error: err.message });
    }
  });

  // ==========================================
  // 3. LOGIN GOOGLE (PINTU MASUK)
  // ==========================================
  fastify.get("/auth/login", async (request, reply) => {
    const returnTo = request.query.return_to;

    if (returnTo) {
      reply.setCookie("auth_return_to", returnTo, {
        path: "/",
        httpOnly: true,
        maxAge: 300,
      });
    }

    return reply.redirect("/auth/google");
  });

  // ==========================================
  // 4. CALLBACK DARI GOOGLE
  // ==========================================
  fastify.get("/auth/google/callback", async function (request, reply) {
    try {
      const { token } =
        await this.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
          request,
        );

      const userRes = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: { Authorization: `Bearer ${token.access_token}` },
        },
      );
      const userData = await userRes.json();

      const [users] = await fastify.db.execute(
        "SELECT * FROM users WHERE email = ?",
        [userData.email],
      );
      let user = users[0];

      if (!user) {
        const [result] = await fastify.db.execute(
          "INSERT INTO users (name, email, google_id, id_membership) VALUES (?, ?, ?, ?)",
          [userData.name, userData.email, userData.id, 2],
        );
        const [newUser] = await fastify.db.execute(
          "SELECT * FROM users WHERE id = ?",
          [result.insertId],
        );
        user = newUser[0];
      } else {
        if (!user.google_id) {
          await fastify.db.execute(
            "UPDATE users SET google_id = ? WHERE id = ?",
            [userData.id, user.id],
          );
        }
      }

      const appToken = fastify.jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        { expiresIn: "7d" },
      );

      const returnTo = request.cookies.auth_return_to;
      reply.clearCookie("auth_return_to");

      const userString = encodeURIComponent(
        JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar_img,
        }),
      );

      if (returnTo) {
        const separator = returnTo.includes("?") ? "&" : "?";
        const redirectUrl = `${returnTo}${separator}token=${appToken}&user=${userString}`;
        return reply.redirect(redirectUrl);
      } else {
        return reply.send({
          status: "success",
          message: "Login Google Berhasil.",
          token: appToken,
          user: user,
        });
      }
    } catch (err) {
      fastify.log.error(err);
      return reply.send({ message: "Login Gagal", error: err.message });
    }
  });
}
