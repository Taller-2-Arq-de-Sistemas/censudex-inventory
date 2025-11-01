import z from "zod";
export const validatorProducto = z.object({
  id: z.number().int().positive(),
  nombre: z.string().min(1).max(100),
  categoria: z.string().min(1).max(50),
  stock_actual: z.number().int().nonnegative(),
  stock_minimo: z.number().int().nonnegative(),
  estado: z.enum(['activo', 'inactivo'])
}).refine(data => data.stock_actual >= data.stock_minimo, {
  message: 'El stock actual no puede ser menor al mínimo',
  path: ['stock_actual']
}).strict();

export const validatorProductoId= z.object({
    id: z.number().int().positive()
}).strict();
export const validatorStockProductoId= z.object({
    id: z.number().int().positive()
}).strict();
export const validatorNewProducto = validatorProducto.omit({ id: true });

export const validatorUpdateProducto= z.object({
    id: z.number().int().positive(),
    nombre: z.string().min(1).max(100).optional(),
    categoria: z.string().min(1).max(50).optional(),
    stock_actual: z.number().int().nonnegative().optional(),
    stock_minimo: z.number().int().nonnegative().optional(),
    estado: z.enum(['activo', 'inactivo']).optional()
}).strict();
export const validatorUpdateStockProducto= z.object({
    id: z.number().int().positive(),
    stock_actual: z.number().int().nonnegative()
}).strict();
