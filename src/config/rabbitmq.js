import amqp from 'amqplib';

let channel, connection = null

export const queue ={
    ORDER_CREATER: 'order.created',
    ORDER_FAILED_STOCK: 'order.failed.stock',
    STOCK_LOW: 'stock.low'
}
export const exchanges = {
    ORDER:'order_exchange',
    INVENTORY:'inventory_exchange'
}

export const connectionRabbitMQ = async () => {
    try {
        const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

        connection = await amqp.connect(RABBITMQ_URL)
        channel = await connection.createChannel()

        await channel.assertExchange(exchanges.ORDER, 'topic', { durable: true });
        await channel.assertExchange(exchanges.INVENTORY, 'topic', { durable: true });

        await channel.assertQueue(queue.ORDER_CREATER, { durable: true });
        await channel.assertQueue(queue.ORDER_FAILED_STOCK, { durable: true });
        await channel.assertQueue(queue.STOCK_LOW, { durable: true });

        await channel.bindQueue(queue.ORDER_CREATER, exchanges.ORDER, 'order.created');
        await channel.bindQueue(queue.ORDER_FAILED_STOCK, exchanges.INVENTORY, 'order.failed.stock');
        await channel.bindQueue(queue.STOCK_LOW, exchanges.INVENTORY, 'stock.low');

        connection.on('error',(err)=>{
            console.error('RabbitMQ connection error:', err);
        });
        connection.on('close',()=>{
            console.error('RabbitMQ connection closed, reconnecting...');
        });
        return channel;
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        throw error;
    }
};
export const getChannel= ()=>{
    if(!channel){
        throw new Error('RabbitMQ channel is not established. Call connectionRabbitMQ first.');
    }
    return channel;
}
export const publicMsg = async (exchanges, routingKey, msg) => {
    try{
        const channel = getChannel();
        const bufferMsg = Buffer.from(JSON.stringify(msg));
        channel.publish(exchanges,routingKey,bufferMsg,{
            persistent: true,
            contentType: 'application/json'
        })
        return true;
    }catch(error){
        console.error('Failed to publish message to RabbitMQ:', error);
        throw error;
    }
}

export const closeConnection = async () => {
    try {
        if (channel) await channel.close();
        if (connection) await connection.close();
    } catch (error) {
        console.error('Error closing RabbitMQ connection:', error);
    }
};