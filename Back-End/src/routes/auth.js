export default async function (fastify, options) {
    
    fastify.get('/auth/google/callback', async function (request, reply) {
        try {
            // 1. Tukar code dengan token dari Google
            const { token } = await this.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

            // 2. Ambil data user dari Google API
            const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${token.access_token}` }
            });
            const userData = await userRes.json();

            // 3. Cek apakah user sudah ada di database
            const [users] = await fastify.db.execute('SELECT * FROM users WHERE email = ?', [userData.email]);
            
            let user = users[0];

            if (!user) {
                // 4a. Jika belum ada, buat user baru (Tanpa password)
                // Default membership ID = 2 (Kawan Mancing)
                const [result] = await fastify.db.execute(
                    'INSERT INTO users (name, email, google_id, id_membership) VALUES (?, ?, ?, ?)',
                    [userData.name, userData.email, userData.id, 2]
                );
                // Ambil user yang baru dibuat
                const [newUser] = await fastify.db.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
                user = newUser[0];
            } else {
                // 4b. Jika sudah ada tapi belum punya google_id, update
                if (!user.google_id) {
                    await fastify.db.execute('UPDATE users SET google_id = ? WHERE id = ?', [userData.id, user.id]);
                }
            }

            // 5. Buat JWT Token aplikasi Anda
            const appToken = fastify.jwt.sign({ 
                id: user.id, 
                email: user.email, 
                name: user.name 
            }, { expiresIn: '1h' });

            // 6. Redirect kembali ke Frontend dengan token
            // Ganti port 5173 sesuai port frontend Vue Anda
            const frontendUrl = `http://localhost:5173/login?token=${appToken}&user=${encodeURIComponent(JSON.stringify({
                id: user.id,
                name: user.name,
                email: user.email
            }))}`;

            return reply.redirect(frontendUrl);

        } catch (err) {
            fastify.log.error(err);
            return reply.redirect('http://localhost:5173/login?error=auth_failed');
        }
    });
}
