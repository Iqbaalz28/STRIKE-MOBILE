export default async function (fastify, options) {
    
    fastify.get('/events', async (request, reply) => {
        try {
            const [rows] = await fastify.db.query(
                'SELECT id, name, img, link_url FROM events'
            );
            return rows;
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ message: 'Gagal mengambil data event' });
        }
    });

}
