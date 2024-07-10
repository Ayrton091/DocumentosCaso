// receptor_api.js
const express = require('express');
const amqp = require('amqplib/callback_api');

const app = express();
app.use(express.json());

const RABBITMQ_URL = 'amqp://localhost';
const QUEUE_SEND = 'send_queue';
const QUEUE_STATE = 'state_queue';

// Conectar y consumir mensajes de send_queue
amqp.connect(RABBITMQ_URL, (err, conn) => {
    conn.createChannel((err, ch) => {
        ch.assertQueue(QUEUE_SEND, { durable: false });
        ch.consume(QUEUE_SEND, (msg) => {
            const { Nombre, NombreU } = JSON.parse(msg.content.toString());
            const estado = 'en revisión';

            // Mostrar mensaje en consola
            console.log(`Documento recibido: Nombre=${Nombre}, NombreU=${NombreU}`);

            // Enviar a state_queue
            ch.assertQueue(QUEUE_STATE, { durable: false });
            ch.sendToQueue(QUEUE_STATE, Buffer.from(JSON.stringify({ Nombre, NombreU, Estado: estado })));
        }, { noAck: true });
    });
});

// Endpoint para actualizar estado del documento
app.post('/update', (req, res) => {
    const { Nombre, Estado } = req.body;

    amqp.connect(RABBITMQ_URL, (err, conn) => {
        conn.createChannel((err, ch) => {
            ch.assertQueue(QUEUE_STATE, { durable: false });
            ch.sendToQueue(QUEUE_STATE, Buffer.from(JSON.stringify({ Nombre, Estado })));
            res.send('Estado actualizado');
        });
    });
});

app.listen(3001, () => {
    console.log('receptor_api escuchando en el puerto 3001');
});
