import z from "zod";
export const validatorProducto = z.object({
  id: z.number().int().positive(),
  nombre: z.string().min(1).max(100),
  categoria: z.string().min(1).max(50),
  stock_actual: z.number().int().nonnegative(),
  stock_minimo: z.number().int().nonnegative(),
  estado: z.enum(['activo', 'inactivo'])
}).strict();

export const validatorProductoId= z.object({
    id: z.number().int().positive()
}).strict();

export const validatorUpdateStockProducto= z.object({
    newStock: z.number().int().nonnegative()
}).strict();
