# Tienda Online

Tienda Online es una aplicación web desarrollada con **HTML**, **JavaScript**, **Tailwind CSS** y **Firebase**. Permite a los usuarios explorar un catálogo de productos, filtrar por categorías, ver detalles, iniciar/cerrar sesión y visualizar imágenes almacenadas en Firebase Storage. Incluye integración con Google Maps para mostrar la ubicación de la tienda.

## Características

- **Autenticación:** Inicio y cierre de sesión con validación y almacenamiento de token.
- **Catálogo de productos:** Visualización, búsqueda y filtrado por categorías.
- **Detalles de producto:** Página individual con información y categorías asociadas.
- **Gestión de categorías:** Filtrado dinámico usando datos de una API propia.
- **Imágenes en Firebase Storage:** Recuperación y visualización segura de imágenes.
- **Google Maps:** Mapa con marcador de la tienda en la página de contacto.
- **Protección de rutas:** Redirección automática si el usuario no está autenticado.
- **Estilos modernos:** Interfaz responsiva con Tailwind CSS.

## Tecnologías utilizadas

- **Frontend:** HTML5, JavaScript, Tailwind CSS
- **Backend/API:** Laravel (o cualquier API REST propia)
- **Autenticación:** LocalStorage y validación con API
- **Almacenamiento de imágenes:** Firebase Storage
- **Google Maps API:** Para mostrar la ubicación de la tienda

## Estructura del proyecto

```
├── app.js                # Lógica principal del catálogo y filtrado
├── appdetalles.js        # Lógica de la página de detalles de producto
├── contacto.html         # Página de contacto con Google Maps
├── detalles.html         # Página de detalles de producto
├── firebase-conf.js      # Configuración de Firebase (no usado en frontend, solo referencia)
├── index.html            # Página principal
├── login.html            # Página de inicio de sesión
├── package.json          # Dependencias (solo para referencia)
└── firebase-storage/
    ├── cors.json         # Configuración CORS para Firebase Storage
    ├── firebase.json     # Configuración de reglas de Firebase
    └── storage.rules     # Reglas de seguridad de Firebase Storage
```

## Configuración y despliegue

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/themis65/tiendaonline.git
   cd tu-repo
   ```

2. **Configura Firebase:**
   - Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
   - Habilita Firebase Storage y copia la configuración en el bloque de inicialización de `index.html`.
   - Sube tus imágenes a Firebase Storage.

3. **Configura CORS en Firebase Storage:**
   - Edita `firebase-storage/cors.json` según tus necesidades.
   - Aplica la configuración con:
     ```bash
     gsutil cors set firebase-storage/cors.json gs://<tu-bucket>
     ```

4. **Configura reglas de seguridad:**
   - Edita `firebase-storage/storage.rules` para el acceso adecuado.
   - Despliega las reglas con:
     ```bash
     firebase deploy --only storage
     ```

5. **Ejecuta el proyecto:**
   - Usa Live Server de VS Code o cualquier servidor local para abrir `index.html`.

## Notas

- Asegúrate de que las URLs de la API y Firebase sean correctas y estén activas.
- Para producción, endurece las reglas de seguridad de Firebase Storage.
- El proyecto está pensado para fines educativos y puede ser extendido fácilmente.
