import z from "zod";
export const validatorProducto = z.object({
  id: z.number().int().positive(),
  nombre: z.string().min(1).max(100),
  categoria: z.string().min(1).max(50),
  stock_actual: z.number().int().nonnegative("El stock no puede ser negativo"),
  stock_minimo: z.number().int().nonnegative("El stock minimo no puede ser negativo"),
  estado: z.enum(['activo', 'inactivo'])
}).strict();

export const validatorProductoId= z.object({
    id: z.number().int().positive()
}).strict();

export const validatorUpdateStockProducto= z.object({
    newStock: z.number().int().nonnegative("El stock no puede ser negativo")
}).strict();
