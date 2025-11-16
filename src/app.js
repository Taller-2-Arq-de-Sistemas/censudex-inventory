import dotenv from 'dotenv';
import { connectionRabbitMQ, closeConnection } from './config/rabbitmq.js';
import { startOrdenConsumer } from './consumers/orderConsumer.js';
import { startGrpcServer } from './grpc/server.js';

dotenv.config();

const GRPC_PORT =process.env.GRPC_PORT || 5005;





const iniciarServer = async ()=>{
    try{
        
        await connectionRabbitMQ();

        await startOrdenConsumer();
        startGrpcServer(GRPC_PORT)
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
