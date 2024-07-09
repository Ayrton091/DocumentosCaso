const express = require('express');
const amqp = require('amqplib/callback_api');
const axios = require('axios');

const app = express();
app.use(express.json());

const RABBITMQ_URL = 'amqp://send:send@localhost';
const QUEUE_SEND = 'send_queue';
const QUEUE_STATE = 'state_queue';

// Endpoint para enviar documento
app.post('/send', (req, res) => {
    const { Nombre, NombreU } = req.body;
    
    amqp.connect(RABBITMQ_URL, (err, conn) => {
        conn.createChannel((err, ch) => {
            ch.assertQueue(QUEUE_SEND, { durable: false });
            ch.sendToQueue(QUEUE_SEND, Buffer.from(JSON.stringify({ Nombre, NombreU })));
            res.send('Documento enviado');
        });
    });
});

// Endpoint para consultar estado
app.get('/status/:Nombre', (req, res) => {
    const { Nombre } = req.params;

    axios.get(`http://localhost:3002/status/${Nombre}`)
        .then(response => res.json(response.data))
        .catch(error => res.status(500).send(error.message));
});

app.listen(3000, () => {
    console.log('send_api escuchando en el puerto 3000');
});
