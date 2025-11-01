
import { supabase } from "../database/supabase.js";
/*
Model class for Productos
** Methods:
- getAllProductos: Fetches all products from the database.
- getStockProductId: Fetches stock information for a specific product by ID.
- updateStockProductId: Updates the stock of a specific product by ID.
*/
export class ProductosModel {
    /*
    Fetches all products from the database.
    Returns an object containing message, data, and status.
    */
    static async getAllProductos() {
        try{
            const { data, error } = await supabase
            .from('productos')
            .select('nombre,categoria, stock_actual,stock_minimo, estado');
            if (error) {
                return {
                    message: error.message,
                    data: null,
                    status: 500
                }
            }
            return {
                message: 'Productos retrieved successfully',
                data: data,
                status: 200
            };
        }catch(error){
            return { 
                message: error.message,
                data: null,
                status:500   
            };
        }
    }
    /*
    Fetch stock for product from the database.
    ** params:
    - id: Product ID
    Returns an object containing message, data, and status.
    */
    static async getStockProductId(id) {
        try{
            let { data, error } = await supabase
            .from('productos')
            .select('stock_actual, stock_minimo, nombre')
            .eq('id', id);
            if (error) {
                return {
                    message: error.message,
                    data: null,
                    status: 500
                }
            }
            if(data.length === 0){
                return {
                    message: 'Producto not found',
                    data: null,
                    status: 404
                }
            }
            return{
                message: 'Stock and name retrieved successfully',
                data: data[0],
                status: 200
            }
            
        }
        catch(error){
            return {
                message: error.message,
                data: null,
                status: 500
            };
        }
    }
    /*
    Update stock for product in the database.
    ** params:
    - id: Product ID
    - newStock: New stock value
    Returns an object containing message, data, and status.
    */
    static async updateStockProductId(id, newStock) {
        try{
            let { data, error } = await supabase
            .from('productos')
            .select('stock_actual,stock_minimo')
            .eq('id', id);
            if (error) {
                return {
                    message: error.message,
                    data: null,
                    status: 500
                }
            }
            if(data.length === 0 ){
                return {
                    message: 'Producto not found',
                    data: null,
                    status: 404
                }
            }
            let messageAlert = '';
            if(newStock < data[0].stock_minimo && newStock >=0){
                messageAlert = 'Warning: Stock is below minimum level.';
            }
            if(newStock === data[0].stock_actual){
                return {
                    message: 'New stock is the same as current stock',
                    data: null,
                    status: 400
                }
            }
            const { data: updateData, error: updateError } = await supabase
            .from('productos')
            .update({ stock_actual: newStock })
            .eq('id', id);
            if (updateError) {
                return {
                    message: updateError.message,
                    data: null,
                    status: 500
                }
            }
            else{
                if(messageAlert !== ''){
                    return {
                        message: 'Stock updated successfully. ' + messageAlert,
                        data: updateData[0],
                        status: 200
                    }
                }
                return {
                    message: 'Stock updated successfully',
                    data: updateData[0],
                    status: 200
                }
            }
        }
        catch(error){
            return {
                message: error.message,
                data: null,
                status: 500
            };
        }
    }

}