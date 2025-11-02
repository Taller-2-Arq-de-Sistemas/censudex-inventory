import express from 'express';
import { productoRouter } from './routes/producto.js';
import dotenv from 'dotenv';
import { connectionRabbitMQ, closeConnection } from './config/rabbitmq.js';
import { startOrdenConsumer } from './consumers/orderConsumer.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5005;


app.use(express.json());

app.use('/inventory', productoRouter);


const iniciarServer = async ()=>{
    try{
        await connectionRabbitMQ();

        await startOrdenConsumer();
        app.listen(PORT,()=>{
            console.log(`Server is running on port http://localhost:${PORT}`);
        });
    }
    catch(error){
        process.exit(1);
    }
}

process.on('SIGTERM',async ()=>{
    await closeConnection()
    process.exit(0)
})
iniciarServer();
