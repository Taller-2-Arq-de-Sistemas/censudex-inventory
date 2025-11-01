import express from 'express';
import { productoRouter } from './routes/producto.js';
const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());

app.use('/api/productos', productoRouter);

app.listen(PORT,()=>{
    console.log(`Server is running on port http://localhost:${PORT}`);
});