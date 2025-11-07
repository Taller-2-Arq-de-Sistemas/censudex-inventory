import { ProductosModel } from "../model/productos.js";
import { publicMsg, exchanges } from "../config/rabbitmq.js";

export class ProductoServices {

    /**
     * Procesar orden y validar/descontar stock
     */
    static async processOrdenStock(orderData) {
        const { orderId, userId, items } = orderData;
        
        try {

            for (const item of items) {
                const { message, data, status } = await ProductosModel.getStockProductId(item.productId);
                
                if (status === 404) {
                    await this.publicOrdenFailed({
                        orderId,
                        userId,
                        productId: item.productId,
                        productName: null,
                        reason: `Producto ${item.productId} no encontrado`,
                        requested: 0,
                        available: 0,
                    });
                    return { success: false, reason: 'Producto no encontrado' };
                }
                
                if (status === 500) {
                    await this.publicOrdenFailed({
                        orderId,
                        userId,
                        productId: item.productId,
                        productName: null,
                        reason: 'Error al consultar el stock',
                        requested: 0,
                        available: 0,
                    });
                    return { success: false, reason: 'Error al consultar el stock' };
                }

                const producto = data;
                
                if (producto.stock_actual < item.quantity) {
                    await this.publicOrdenFailed({
                        orderId,
                        userId,
                        productId: item.productId,
                        productName: producto.nombre,
                        reason: 'Stock insuficiente',
                        requested: item.quantity,
                        available: producto.stock_actual,
                    });
                    return { success: false, reason: `Stock insuficiente para ${producto.nombre}` };
                }
            }

            for (const item of items) {
                const result = await ProductosModel.getStockProductId(item.productId);
                const producto = result.data;  // ✅ CORREGIDO
                
                const newStock = producto.stock_actual - item.quantity;

                if (newStock < 0) {
                    await this.publicOrdenFailed({
                        orderId,
                        userId,
                        productId: item.productId,
                        productName: producto.nombre,
                        reason: 'Stock resultante negativo',
                        requested: item.quantity,
                        available: producto.stock_actual,
                    });
                    return { success: false, reason: 'Error al calcular stock' };
                }

                const updateResult = await ProductosModel.updateStockProductId(item.productId, newStock);
                
                if (updateResult.status !== 200) {
                    await this.publicOrdenFailed({
                        orderId,
                        userId,
                        productId: item.productId,
                        productName: producto.nombre,
                        reason: 'Error al actualizar stock',
                        requested: 0,
                        available: 0,
                    });
                    return { success: false, reason: 'Error al actualizar stock' };
                }


                if (newStock < producto.stock_minimo) {
                    await this.publicMsgStockLow({
                        productId: item.productId,
                        productName: producto.nombre,
                        stockActual: newStock, 
                        stockMinimo: producto.stock_minimo
                    });
                }
            }

            return { success: true };
            
        } catch (error) {
            
            await publicMsg(exchanges.INVENTORY, 'order.failed.stock', {
                orderId,
                userId,
                reason: "Error interno del sistema de inventario",
                error: error.message,
                timestamp: new Date().toISOString()
            });
            
            return { success: false, reason: 'Error interno' };
        }
    }

    /**
     * Actualizar stock manualmente
     */
    static async updateStockProductIdManually(productId, newStock) {
        try {
            const { message, data, status } = await ProductosModel.getStockProductId(productId);
            
            if (status !== 200) {
                return {
                    success: false,
                    message: message,
                    status: status
                };
            }

            if (newStock < 0) {
                return {
                    success: false,
                    message: "El stock no puede ser negativo",
                    status: 400
                };
            }

            const updateResult = await ProductosModel.updateStockProductId(productId, newStock);
            
            if (updateResult.status !== 200) {
                return {
                    success: false,
                    message: "No se logró actualizar el producto",
                    status: updateResult.status
                };
            }

            if (newStock < data.stock_minimo) {
                await this.publicMsgStockLow({
                    productId: productId,
                    productName: data.nombre,
                    stockActual: newStock,
                    stockMinimo: data.stock_minimo
                });
            }

            return {
                success: true,
                message: updateResult.message,
                data: updateResult.data,
                status: 200
            };

        } catch (error) {
            return {
                success: false,
                message: error.message,
                status: 500
            };
        }
    }

    /**
     * Publicar mensaje de orden fallida
     */
    static async publicOrdenFailed(data) {
        await publicMsg(exchanges.INVENTORY, 'order.failed.stock', {
            ...data,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Publicar mensaje de stock bajo
     */
    static async publicMsgStockLow(data) {
        await publicMsg(exchanges.INVENTORY, 'stock.low', {
            ...data,
            timestamp: new Date().toISOString()
        });
    }

    
    static async getAllProducts() {
        try {
            return await ProductosModel.getAllProductos();
        } catch (error) {
            return {
                success: false,
                message: error.message,
                status: 500
            };
        }
    }
    static async getProductById(id){
        try{
            return await ProductosModel.getStockProductId(id)
        }
        catch(error){
            return{
                success: false,
                message: error.message,
                status: 500
            }
        }
    }
    
    static async getProductStock(productId) {
        try {
            return await ProductosModel.getStockProductId(productId);
        } catch (error) {
            return {
                success: false,
                message: error.message,
                status: 500
            };
        }
    }
}