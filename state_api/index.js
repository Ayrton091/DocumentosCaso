// state_api.js
const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib/callback_api');

const app = express();
app.use(express.json());

const RABBITMQ_URL = 'amqp://state:state@localhost';
const QUEUE_STATE = 'state_queue';
const uri = 'mongodb+srv://ader0514:Ader0514@cluster0.wr9uiud.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
// Conectar a MongoDB
mongoose.connect(uri);

const documentoSchema = new mongoose.Schema({
    Nombre: String,
    NombreU: String,
    Estado: String,
});

const Documento = mongoose.model('Documento', documentoSchema);

// Conectar y consumir mensajes de state_queue
amqp.connect(RABBITMQ_URL, (err, conn) => {
    conn.createChannel((err, ch) => {
        ch.assertQueue(QUEUE_STATE, { durable: false });
        ch.consume(QUEUE_STATE, async (msg) => {
            const { Nombre, NombreU, Estado } = JSON.parse(msg.content.toString());
            
            if (Estado) {
                // Actualizar estado del documento
                await Documento.findOneAndUpdate({ Nombre }, { Estado });
            } else {
                // Crear documento en revisión
                const documento = new Documento({ Nombre, NombreU, Estado: 'en revisión' });
                await documento.save();
            }
        }, { noAck: true });
    });
});

// Endpoint para obtener el estado de un documento
app.get('/status/:Nombre', async (req, res) => {
    const { Nombre } = req.params;
    const documento = await Documento.findOne({ Nombre });
    if (documento) {
        res.json({ Nombre: documento.Nombre, NombreU: documento.NombreU, Estado: documento.Estado });
    } else {
        res.status(404).send('Documento no encontrado');
    }
});

app.listen(3002, () => {
    console.log('state_api escuchando en el puerto 3002');
});
