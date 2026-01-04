export default async function (fastify, options) {
  // 1. PINTU MASUK
  // Mobile App memanggil ini dengan: API_URL/auth/login?return_to=exp://...
  // Expo Web memanggil ini dengan: API_URL/auth/login?return_to=http://localhost:8081/...
  fastify.get("/auth/login", async (request, reply) => {
    const returnTo = request.query.return_to;

    if (returnTo) {
      // Simpan alamat "pulang" di cookie
      reply.setCookie("auth_return_to", returnTo, {
        path: "/",
        httpOnly: true,
        maxAge: 300, // 5 menit
      });
    }

    // Redirect ke Google
    return reply.redirect("/auth/google");
  });

  // 2. CALLBACK DARI GOOGLE
  fastify.get("/auth/google/callback", async function (request, reply) {
    try {
      // A. Tukar Code -> Token
      const { token } =
        await this.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
          request
        );

      // B. Ambil Profil User
      const userRes = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: { Authorization: `Bearer ${token.access_token}` },
        }
      );
      const userData = await userRes.json();

      // C. Cek/Buat User di Database
      const [users] = await fastify.db.execute(
        "SELECT * FROM users WHERE email = ?",
        [userData.email]
      );
      let user = users[0];

      if (!user) {
        // User Baru
        const [result] = await fastify.db.execute(
          "INSERT INTO users (name, email, google_id, id_membership) VALUES (?, ?, ?, ?)",
          [userData.name, userData.email, userData.id, 2] // Default id_membership = 2
        );
        const [newUser] = await fastify.db.execute(
          "SELECT * FROM users WHERE id = ?",
          [result.insertId]
        );
        user = newUser[0];
      } else {
        // User Lama, update Google ID jika belum ada
        if (!user.google_id) {
          await fastify.db.execute(
            "UPDATE users SET google_id = ? WHERE id = ?",
            [userData.id, user.id]
          );
        }
      }

      // D. Buat Token Aplikasi (JWT)
      const appToken = fastify.jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        { expiresIn: "7d" }
      );

      // E. REDIRECT KEMBALI
      const returnTo = request.cookies.auth_return_to;
      reply.clearCookie("auth_return_to");

      // Siapkan Data User
      const userString = encodeURIComponent(
        JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar_img,
        })
      );

      if (returnTo) {
        // JIKA ADA ALAMAT PULANG (Baik dari HP maupun Web Laptop)
        // Deteksi apakah URL sudah punya query param (?) atau belum
        const separator = returnTo.includes("?") ? "&" : "?";
        const redirectUrl = `${returnTo}${separator}token=${appToken}&user=${userString}`;

        return reply.redirect(redirectUrl);
      } else {
        // JIKA TIDAK ADA (Misal: User iseng buka link di browser tanpa lewat app)
        // Tampilkan pesan JSON sederhana
        return reply.send({
          status: "success",
          message: "Login Google Berhasil. Silakan kembali ke aplikasi Anda.",
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
