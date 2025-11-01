import { formatError } from "zod";
import { ProductosModel } from "../model/productos.js";
import { validatorProductoId, validatorUpdateStockProducto } from "../schema/validatorProducto.js";
export class ProductosController {
    static async getAllProductos(req, res) {
        try{
            const {data,status,message} = await ProductosModel.getAllProductos();
            
            return res.status(status).json(status !== 200? {error: message}:{ message: message, data: data });
        }
        catch(error){
            return res.status(500).json({ error: error.message });
        }
    }
    static async getStockProductId(req, res) {
        const parsed = validatorProductoId.safeParse({ id: Number(req.params.id) });
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.errors });
        }
        const { id } = parsed.data;
        try{
            const {data,status,message} = await ProductosModel.getStockProductId(id);
            
            return res.status(status).json(status !== 200? {error: message}:{ message: message, data: data });
        }
        catch(error){
            return res.status(500).json({ error: error.message });
        }
    }
    static async updateStockProductId(req, res) {

        const parsedParams = validatorProductoId.safeParse({ id: Number(req.params.id) });
        const parsedBody = validatorUpdateStockProducto.safeParse({ ...req.body });
        if (!parsedParams.success || !parsedBody.success) {
            return res.status(400).json({
                error: {
                    params: parsedParams.error?.format(),
                    body: parsedBody.error?.format()
                }
            });
        }
    
        const { id } = parsedParams.data;
        const { newStock } = parsedBody.data;

        try{
            const {data,status,message} = await ProductosModel.updateStockProductId(id, newStock);
            return res.status(status).json(status !== 200? {error: message}:{ message: message, data: data });
        }catch(error){
            return res.status(500).json({ error: error.message });
        } 
    }   

}