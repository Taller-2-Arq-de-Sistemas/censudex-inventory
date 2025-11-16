import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProductoServices } from '../services/productoServices.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, '../protos/inventory.proto')

const packageDefinition = protoLoader.loadSync(PROTO_PATH,{
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
})


const inventoryProto = grpc.loadPackageDefinition(packageDefinition).inventory;

const inventoryServices ={
    GetAllProducts: async (call, callback) =>{
        try{
            const {message,status,data} = await ProductoServices.getAllProducts();
            if(status === 200 ){
                return callback(null, {
                    success: true,
                    message: message,
                    data: data
                })
            }
            else{
                return callback({
                    code: grpc.status.INTERNAL,
                    message: message
                });
            }
            

        }catch(error){
            callback({
                code: grpc.status.INTERNAL,
                message: error.message
            });
        }
    },
    GetProductById:async (call,callback)=>{
        try{
            const {id} = call.request;
             
            const result = await ProductoServices.getProductById(id);
            if (result.status === 200) {
                callback(null, {
                success: true,
                message: result.message,
                data: result.data
                });
            } else if (result.status === 404) {
                callback({
                code: grpc.status.NOT_FOUND,
                message: result.message
                });
            } else {
                callback({
                code: grpc.status.INTERNAL,
                message: result.message
                });
            }

        }
        catch (error) {
            callback({
                code: grpc.status.INTERNAL,
                message: error.message
            });
        }
    },
    UpdateStock: async(call,callback) =>{
        try{
            const {id, newStock} =call.request;
            

            if(newStock < 0){
                return callback({
                    code: grpc.status.INVALID_ARGUMENT,
                    message:'El stock no puede ser negativo'
                })
            }
            const result = await ProductoServices.updateStockProductIdManually(id,newStock);
             if (result.status ===200) {
                callback(null, {
                success: true,
                message: result.message,
                data: result.data
                });
            } else {
                callback({
                code: grpc.status.INTERNAL,
                message: result.message
                });
            }
        }catch(error){
            callback({
                code: grpc.status.INTERNAL,
                message: error.message
            });
        }
    }
    

}
export function startGrpcServer(port = 50051) {
  const server = new grpc.Server();

  server.addService(inventoryProto.InventoryService.service, inventoryServices);
    

  
  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('Error iniciando servidor gRPC:', error);
        return;
      }
      console.log(`Servidor gRPC corriendo en puerto ${port}`);
      
    }
  );
  
  return server;
}