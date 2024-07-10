const express = require('express');
const amqp = require('amqplib/callback_api');

const app = express();
app.use(express.json());

const RABBITMQ_URL = 'amqp://state:state@localhost';
const QUEUE_STATE = 'state_queue';

// Almacenamiento en memoria para los documentos
const documentos = new Map();

// Conectar y consumir mensajes de state_queue
amqp.connect(RABBITMQ_URL, (err, conn) => {
    if (err) {
        console.error('Error connecting to RabbitMQ', err);
        process.exit(1);
    }

    conn.createChannel((err, ch) => {
        if (err) {
            console.error('Error creating channel', err);
            process.exit(1);
        }

        ch.assertQueue(QUEUE_STATE, { durable: false });
        ch.consume(QUEUE_STATE, (msg) => {
            const { Nombre, NombreU, Estado } = JSON.parse(msg.content.toString());
            
            if (Estado) {
                // Actualizar estado del documento
                documentos.set(Nombre, { Nombre, NombreU, Estado });
                console.log(`Estado del documento '${Nombre}' actualizado a '${Estado}'`);
            } else {
                // Crear documento en revisión
                documentos.set(Nombre, { Nombre, NombreU, Estado: 'en revisión' });
                console.log(`Documento '${Nombre}' recibido y creado en estado 'en revisión'`);
            }
        }, { noAck: true });
    });
});

// Endpoint para obtener el estado de un documento
app.get('/status/:Nombre', (req, res) => {
    const { Nombre } = req.params;
    const documento = documentos.get(Nombre);

    if (documento) {
        res.json({ Nombre: documento.Nombre, NombreU: documento.NombreU, Estado: documento.Estado });
    } else {
        res.status(404).send('Documento no encontrado');
    }
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`state_api escuchando en el puerto ${PORT}`);
});
