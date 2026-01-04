import fs from 'fs';
import util from 'util';
import { pipeline } from 'stream';
import path from 'path';

// Mengubah pipeline menjadi Promise agar bisa di-await
const pump = util.promisify(pipeline);

export default async function (fastify, options) {
    
    // Endpoint Upload: POST /upload
    // Menerima form-data dengan key 'file'
    fastify.post('/upload', async (req, reply) => {
        // 1. Ambil data file dari request
        const data = await req.file();
        
        // Validasi jika tidak ada file
        if (!data) {
            return reply.code(400).send({ message: 'No file uploaded' });
        }

        // 2. Generate nama file unik
        // Menggunakan timestamp agar nama file tidak bentrok
        const timestamp = Date.now();
        const ext = path.extname(data.filename); // ambil ekstensi .jpg/.png
        // Contoh nama file: avatar-1715332211.jpg
        const newFilename = `avatar-${timestamp}${ext}`;
        
        // 3. Tentukan lokasi simpan (folder uploads di root project)
        const savePath = path.join(process.cwd(), 'uploads', newFilename);
        
        // 4. Simpan file (Streaming)
        // Kita gunakan stream agar memori server tidak penuh saat upload file besar
        await pump(data.file, fs.createWriteStream(savePath));

        // 5. Buat URL publik untuk file tersebut
        // URL ini yang akan disimpan di database dan dipakai frontend
        // Contoh: http://localhost:3000/uploads/avatar-1715332211.jpg
        
        // Cek apakah berjalan di localhost atau production (opsional)
        const protocol = req.protocol; 
        const host = req.headers.host;
        const fileUrl = `${protocol}://${host}/uploads/${newFilename}`;

        return { 
            message: 'File uploaded successfully',
            url: fileUrl 
        };
    });
}
