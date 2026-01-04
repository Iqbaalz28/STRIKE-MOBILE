import bcrypt from 'bcrypt';

export default async function (fastify, options) {

    // --- 1. GET ALL USERS ---
    fastify.get('/users', async (req, reply) => {
        const [rows] = await fastify.db.execute(
            'SELECT id, name, email, bio, avatar_img FROM users'
        );
        return rows;
    });

    // --- 2. GET MY PROFILE (PROFILE DATA) ---
    // URL: GET /users/me
    // Penting: Taruh ini SEBELUM route /users/:id
    fastify.get('/users/me', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const userId = request.user.id;

            // Kita JOIN ke table memberships dan payment_methods 
            // agar frontend dapat nama paket & nama payment, bukan cuma ID-nya.
            const [rows] = await fastify.db.query(`
                SELECT 
                    u.id, 
                    u.name, 
                    u.email, 
                    u.bio, 
                    u.avatar_img, 
                    u.date_birth,
                    u.id_payment_method,
                    u.id_membership,
                    pm.name as payment_method_name,
                    m.name as membership_name, 
                    m.description as membership_desc,
                    m.benefits as membership_benefits
                FROM users u
                LEFT JOIN payment_methods pm ON u.id_payment_method = pm.id
                LEFT JOIN memberships m ON u.id_membership = m.id
                WHERE u.id = ?
            `, [userId]);

            if (rows.length === 0) {
                return reply.code(404).send({ message: 'User tidak ditemukan' });
            }

            return rows[0];
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ message: 'Gagal mengambil profil' });
        }
    });

    // --- 3. UPDATE PROFILE (PUT) ---
    // URL: PUT /users/me
    // Menangani update Nama, Bio, Tgl Lahir, Avatar, DAN Payment Method
    fastify.put('/users/me', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const userId = request.user.id;
            // Ambil semua kemungkinan field yang dikirim frontend
            const { name, bio, date_birth, avatar_img, id_payment_method } = request.body;

            // Validasi tanggal kosong jadi null (biar gak error di database)
            const validDate = date_birth === '' ? null : date_birth;

            // Gunakan COALESCE agar jika field tidak dikirim, data lama tetap tersimpan (tidak jadi NULL)
            await fastify.db.query(`
                UPDATE users 
                SET 
                    name = COALESCE(?, name), 
                    bio = COALESCE(?, bio), 
                    date_birth = COALESCE(?, date_birth),
                    avatar_img = COALESCE(?, avatar_img),
                    id_payment_method = COALESCE(?, id_payment_method)
                WHERE id = ?
            `, [name, bio, validDate, avatar_img, id_payment_method, userId]);

            return { message: 'Profil berhasil diperbarui' };

        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ error: err.message || 'Gagal update profil' });
        }
    });

    // --- 4. GET USER BY ID ---
    // URL: GET /users/:id
    fastify.get('/users/:id', async (req, reply) => {
        const [rows] = await fastify.db.execute(
            'SELECT id, name, email, bio, avatar_img FROM users WHERE id = ?',
            [req.params.id]
        );
        if (rows.length === 0) {
            return reply.code(404).send({ error: 'User not found' });
        }
        return rows[0];
    });

    // --- 5. REGISTER USER (POST) ---
    fastify.post('/users', async (req, reply) => {
        const { name, email, password } = req.body;

        // Cek email
        const [existing] = await fastify.db.execute(
            'SELECT id FROM users WHERE email = ?', [email]
        );
        if (existing.length > 0) {
            return reply.code(400).send({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const defaultMembershipId = 2; // Default ke 'Kawan Mancing' (ID 2)

        try {
            await fastify.db.execute(
                'INSERT INTO users (name, email, password, id_membership) VALUES (?, ?, ?, ?)',
                [name, email, hashedPassword, defaultMembershipId]
            );
            return reply.code(201).send({ message: 'User created successfully' });
        } catch (err) {
            return reply.code(500).send({ error: err.message });
        }
    });

    // --- 6. LOGIN USER (POST) ---
    fastify.post('/login', async (req, reply) => {
        const { email, password } = req.body;

        const [users] = await fastify.db.execute(
            'SELECT * FROM users WHERE email = ?', [email]
        );

        if (users.length === 0) {
            return reply.code(401).send({ message: 'Email atau password salah' });
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return reply.code(401).send({ message: 'Email atau password salah' });
        }
        const token = fastify.jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                name: user.name 
            },
            { expiresIn: '1h' } 
        );

        return { 
            token, 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email 
            } 
        };
    });
}
