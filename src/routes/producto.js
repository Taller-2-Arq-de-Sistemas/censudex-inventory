import { ProductosController } from "../controller/producto.js";
import express from "express";

const productoRouter = express.Router();

productoRouter.get("/", ProductosController.getAllProductos);
productoRouter.get("/stock/:id", ProductosController.getStockProductId);
export { productoRouter };