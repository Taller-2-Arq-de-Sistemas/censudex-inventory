import { check } from "zod";
import { getChannel,queue } from "../config/rabbitmq.js";
import { ProductoServices } from "../services/productoServices.js";

export const startOrdenConsumer= async() =>{
    try{
        const channel = getChannel();
        await channel.consume(
            queue.ORDER_CREATER,
            async (msg) =>{
                if(msg !== null){
                    try{
                        const orderData =JSON.parse(msg.content.toString());

                        const result =await ProductoServices.processOrdenStock(orderData);

                        if(result.success){
                            check.ack(msg);
                        }
                        else{
                            channel.nack(msg,false,false)
                        }

                    }catch(error){
                        channel.nack(msg,false,false)
                    }
                }
                
            },
            {noAc:false}
        )
    }
    catch(error){
        throw error;
    }
    
}