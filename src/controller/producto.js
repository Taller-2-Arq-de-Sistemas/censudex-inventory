import { ProductosModel } from "../model/productos.js";
export class ProductosController {
    static async getAllProductos(req, res) {
        try{
            const {data,status,message} = await ProductosModel.getAllProductos();
            if(status !== 200){
                return res.status(status).json({ error: message });
            }
            return res.status(status).json({ message: message, data: data });
        }
        catch(error){
            return res.status(500).json({ error: error.message });
        }
    }
    static async getStockProductId(req, res) {
        const { id } = req.params;
        try{
            const {data,status,message} = await ProductosModel.getStockProductId(id);
            if(status !== 200){
                return res.status(status).json({ error: message });
            }
            return res.status(status).json({ message: message, data: data });
        }
        catch(error){
            return res.status(500).json({ error: error.message });
        }
    }
    static async updateStockProductId(req, res) {
        const { id } = req.params;
        const { newStock } = req.body;
        try{
            const {data,status,message} = await ProductosModel.updateStockProductId(id, newStock);
            if(status !== 200){
                return res.status(status).json({ error: message });
            }
            return res.status(status).json({ message: message, data: data });
        }catch(error){
            return res.status(500).json({ error: error.message });
        } 
    }   

}