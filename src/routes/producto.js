import { ProductosController } from "../controller/producto.js";
import express from "express";

const productoRouter = express.Router();

productoRouter.get("/", ProductosController.getAllProductos);
productoRouter.get("/:id", ProductosController.getStockProductId);
productoRouter.patch("/:id", ProductosController.updateStockProductId);
export { productoRouter };