# 📦 Inventory Service - Censudex

Microservicio de gestión de inventario para el sistema de e-commerce Censudex. Implementa comunicación gRPC para operaciones síncronas y RabbitMQ para procesamiento asíncrono de órdenes.

---
## 🚀 Inicio Rápido

### **Prerrequisitos**

- Node.js 20+
- Docker y Docker Compose
- Git
- Cuenta de Supabase (para base de datos)

### **Instalación**

1. **Clonar el repositorio**

git clone https://github.com/Taller-2-Arq-de-Sistemas/censudex-inventory.git
cd censudex-inventory

2. **Configurar variables de entorno**

cp .env.example .env

Editar `.env` con tus credenciales:

SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-supabase-anon-key
RABBITMQ_URL=amqp://rabbitmq:5672
GRPC_PORT=5005

3. **Instalar dependencias**

npm install

### **Ejecución**

#### **Opción 1: Desarrollo Local**

# Iniciar servicio
npm run dev

# El servidor gRPC estará disponible en localhost:5005

**Nota:** Asegúrate de tener RabbitMQ corriendo localmente o ajusta `RABBITMQ_URL` para apuntar a una instancia remota.

#### **Opción 2: Con Docker (Recomendado)**

# Build de la imagen
docker build -t inventory-service .

# Ejecutar contenedor
docker run -d \
  --name inventory-service-1 \
  -p 5005:5005 \
  --env-file .env \
  inventory-service

# Ver logs
docker logs -f inventory-service-1

#### **Opción 3: Con API Gateway completo**

Este servicio está diseñado para ejecutarse como parte del ecosistema Censudex API Gateway:

# Clonar el API Gateway
git clone https://github.com/Taller-2-Arq-de-Sistemas/censudex-api-gateway.git
cd censudex-api-gateway

# Setup completo (clona todos los servicios, configura env y ejecuta)
make setup

# O manualmente
make clone          # Clona repositorios
make propagate-env  # Propaga variables de entorno
make up             # Levanta todos los servicios

Esto iniciará:
- 5 instancias de Inventory Service
- NGINX Gateway (puerto 5001)
- Translator (HTTP ↔ gRPC)
- RabbitMQ (puertos 5672, 15672)
- Otros microservicios del sistema

### **Verificar que funciona**

# Opción 1: Con grpcurl (desarrollo local)
grpcurl -plaintext localhost:5005 inventory.InventoryService/GetAllProducts

# Opción 2: A través del API Gateway
curl http://localhost:5001/inventory-api/inventory

# Opción 3: Ver RabbitMQ Management
Abrir en navegador: http://localhost:15672
Usuario: guest
Password: guest

---

## 🏗️ Arquitectura y Patrones de Diseño

### **Patrón: Microservices Architecture**

El servicio forma parte de una arquitectura de microservicios distribuida, comunicándose con otros servicios a través de:
- **gRPC** para operaciones síncronas (consultas, actualizaciones)
- **RabbitMQ** para eventos asíncronos (procesamiento de órdenes, alertas)
────┘  └──────────┘


---

### **Patrón: Service Layer Pattern**

Separa la lógica de negocio de la capa de acceso a datos, facilitando el testing y mantenimiento.

**Implementación:**
```javascript
// services/productoServices.js
export class ProductoServices {
    // Lógica de negocio: procesar órdenes
    static async processOrdenStock(orderData) {
        // 1. Validar disponibilidad
        // 2. Descontar stock
        // 3. Publicar eventos (stock.low, order.failed)
    }
    
    // Lógica de negocio: actualización manual
    static async updateStockProductIdManually(productId, newStock) {
        // 1. Validar producto existe
        // 2. Validar stock >= 0
        // 3. Actualizar BD
        // 4. Publicar alerta si necesario
    }
}
```

**Beneficios:**
- ✅ Lógica de negocio centralizada
- ✅ Fácil de testear (mock del repository)
- ✅ Reutilizable desde gRPC y consumers

---

### **Patrón: Repository Pattern**

Abstrae el acceso a datos, permitiendo cambiar la fuente de datos sin afectar la lógica de negocio.

**Implementación:**
```javascript
// model/producto.js
export class ProductosModel {
    static async getAllProductos() {
        const { data, error } = await supabase
            .from('productos')
            .select('*');
        
        return { status: 200, data, message: "Success" };
    }
    
    static async updateStockProductId(id, newStock) {
        const { data, error } = await supabase
            .from('productos')
            .update({ stock_actual: newStock })
            .eq('id', id);
        
        return { status: 200, data };
    }
}
```

**Beneficios:**
- ✅ Cambiar de Supabase a otra BD sin tocar Services
- ✅ Queries centralizadas
- ✅ Testeable con mocks

---

### **Patrón: Event-Driven Architecture (Publisher-Subscriber)**

Comunicación asíncrona mediante eventos para desacoplar servicios.

**Eventos publicados:**
```javascript
// Cuando stock cae bajo el mínimo
publicMsg('inventory.events', 'stock.low', {
    productId, productName, stockActual, stockMinimo
});

// Cuando orden falla por falta de stock
publicMsg('inventory.events', 'order.failed.stock', {
    orderId, productId, reason, requested, available
});
```

**Eventos consumidos:**
```javascript
// Escucha órdenes nuevas
queue: 'order.created'
exchange: 'order.events'
routingKey: 'order.created'
```

**Beneficios:**
- ✅ Desacoplamiento entre servicios
- ✅ Escalabilidad (múltiples consumers)
- ✅ Resiliencia (retry automático)

---

## 🚀 Tecnologías

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 20 | Runtime |
| **gRPC** | @grpc/grpc-js | Comunicación síncrona |
| **RabbitMQ** | 3-management-alpine | Mensajería asíncrona |
| **PostgreSQL** | - (Supabase) | Base de datos |
| **Zod** | ^3.x | Validación de datos |
| **Docker** | - | Containerización |


---

## 📁 Estructura del Proyecto
```
censudex-inventory/
├── src/
│   ├── config/
│   │   └── rabbitmq.js           # Configuración RabbitMQ
│   ├── consumers/
│   │   └── orderConsumer.js      # Consumer de order.created
│   ├── database/
│   │   └── supabase.js           # Cliente Supabase
│   ├── grpc/
│   │   └── server.js             # Servidor gRPC
│   ├── model/
│   │   └── producto.js           # Repository Pattern
│   ├── protos/
│   │   └── inventory.proto       # Definición gRPC
│   ├── schema/
│   │   └── validatorProducto.js  # Validaciones Zod
│   ├── services/
│   │   └── productoServices.js   # Service Layer
│   └── app.js                    # Entry point
├── Dockerfile                     # Multi-stage build
├── .dockerignore
├── .env.example
├── package.json
└── README.md
```

---

## 📡 Endpoints gRPC

### **1. GetAllProducts**

Obtiene todos los productos con su información de stock.
```protobuf
rpc GetAllProducts (Empty) returns (ProductListResponse);
```

**Request:** Vacío

**Response:**
```json
{
  "success": true,
  "message": "Productos obtenidos exitosamente",
  "data": [
    {
      "id": 1,
      "nombre": "Laptop HP",
      "categoria": "Electrónica",
      "stock_actual": 45,
      "stock_minimo": 10,
      "estado": "activo"
    }
  ]
}
```

---

### **2. GetProductById**

Consulta stock de un producto específico.
```protobuf
rpc GetProductById (ProductIdRequest) returns (ProductResponse);
```

**Request:**
```json
{
  "id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Producto encontrado",
  "data": {
    "id": 1,
    "nombre": "Laptop HP",
    "stock_actual": 45,
    "stock_minimo": 10
  }
}
```

---

### **3. UpdateStock**

Actualiza el stock de un producto (uso manual/administrativo).
```protobuf
rpc UpdateStock (UpdateStockRequest) returns (ProductResponse);
```

**Request:**
```json
{
  "id": 1,
  "newStock": 100
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stock actualizado con éxito",
  "data": {
    "id": 1,
    "stock_actual": 100
  }
}
```

---

## 🔄 Eventos RabbitMQ

### **Consume**

| Evento | Exchange | Queue | Descripción |
|--------|----------|-------|-------------|
| `order.created` | `order.events` | `order.created` | Nueva orden creada por Orders Service |

**Mensaje esperado:**
```json
{
  "orderId": "uuid-v4",
  "items": [
    {
      "productId": 1,
      "quantity": 5
    }
  ]
}
```

---

### **Publica**

| Evento | Exchange | Routing Key | Cuándo se publica |
|--------|----------|-------------|-------------------|
| `stock.low` | `inventory.events` | `stock.low` | Stock cae bajo el mínimo |
| `order.failed.stock` | `inventory.events` | `order.failed.stock` | Orden falla por falta de stock |

**Mensaje `stock.low`:**
```json
{
  "productId": 2,
  "productName": "Mouse Logitech",
  "stockActual": 5,
  "stockMinimo": 20
}
```

**Mensaje `order.failed.stock`:**
```json
{
  "orderId": "uuid-v4",
  "productId": 1,
  "productName": "Laptop HP",
  "reason": "Stock insuficiente"
}
```

---

## ⚙️ Variables de Entorno

Crear archivo `.env` basado en `.env.example`:
```env
# Database
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-supabase-key

# Messaging
RABBITMQ_URL=amqp://rabbitmq:5672

# Server
INVENTORY_SERVICE_PORT=5005
```

---

## 🐳 Docker

### **Desarrollo Local**
```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm start
```

### **Con Docker Compose**
```bash
# Build y ejecutar
docker-compose up -d

# Ver logs
docker logs inventory-service-1

# Detener
docker-compose down
```

### **Dockerfile (Multi-stage Build)**
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Stage 2: Runtime
FROM node:20-alpine AS runtime
WORKDIR /src/app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=build /app/src ./src

EXPOSE 5005
CMD ["node", "src/app.js"]
```


## 🗄️ Base de Datos

### **Tabla: productos**
```sql
CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  stock_actual INTEGER NOT NULL CHECK (stock_actual >= 0),
  stock_minimo INTEGER NOT NULL CHECK (stock_minimo >= 0),
  estado VARCHAR(20) NOT NULL CHECK (estado IN ('activo', 'inactivo'))
);
```

### **Validaciones con Zod**
```javascript
export const validatorProducto = z.object({
  id: z.number().int().positive(),
  nombre: z.string().min(1).max(100),
  categoria: z.string().min(1).max(50),
  stock_actual: z.number().int().nonnegative(),
  stock_minimo: z.number().int().nonnegative(),
  estado: z.enum(['activo', 'inactivo'])
}).strict();
```


## 👥 Autor

**Francisco** - Inventory Service  
Taller de Arquitectura de Sistemas - 2025

---

## 📄 Licencia

Este proyecto es parte del Taller 2 de Arquitectura de Sistemas.
