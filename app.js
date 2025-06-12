const contenedorProductos = document.getElementById("productos");
const contenedorCategorias = document.getElementById("categorias");
const inputBuscar = document.getElementById("busqueda");
let productos = [];
let categoriaSeleccionada = "all";
let categoriasMap = {};

async function cargarProductos() {
    try {
        mostrarMensajeCargando();

        const respuesta = await fetch("http://127.0.0.1:8000/api/productos");
        if (!respuesta.ok) {
            throw new Error("Error en la respuesta de la API");
        }
        productos = await respuesta.json();
        if (productos.length === 0) {
            throw new Error("No se encontraron productos en la API");
            console.log("No se encontraron productos en la API");
        } else {

            mostrarProductos(productos);
        }
    } catch (error) {
        console.error("Error al cargar los productos: ", error);
        mostrarMensajeError();
    }
}

function filtrarProductos() {
    let filtrados = productos;
    const textoBusqueda = inputBuscar.value.toLowerCase();
    if (textoBusqueda.trim() !== "") {
        filtrados = filtrados.filter((p) =>
            (p.titulo && p.titulo.toLowerCase().includes(textoBusqueda)) ||
            (p.descripcion && p.descripcion.toLowerCase().includes(textoBusqueda))
        );
    }
    if (categoriaSeleccionada !== "all") {
        const categoriaId = categoriasMap[categoriaSeleccionada];
        filtrados = filtrados.filter((p) => {
            // Si el producto tiene un array de categorias relacionadas
            if (Array.isArray(p.categorias)) {
                return p.categorias.some(cat => String(cat.id) === String(categoriaId));
            }
            return false;
        });
    }
    mostrarProductos(filtrados);
}

async function cargarCategorias() {
    try {
        const respuesta = await fetch("http://127.0.0.1:8000/api/categorias");
        if (!respuesta.ok) {
            throw new Error("Error en la respuesta de la API");
        }
        const categorias = await respuesta.json();
        categoriasMap = {};
        categorias.forEach(cat => {
            categoriasMap[cat.nombre] = cat.id;
        });
        const nombresCategorias = categorias.map(cat => cat.nombre);
        mostrarCategorias(["all", ...nombresCategorias]);
    } catch (error) {
        console.error("Error al cargar las categorias: ", error);
    }
}

// --- POPUP DE CANTIDAD ---
function mostrarPopupCantidad(producto) {
    // Verifica si está logueado antes de mostrar el popup de cantidad
    const token = localStorage.getItem('token');
    if (!token) {
        mostrarMensajeFlotanteLogin();
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
        return;
    }

    const popupExistente = document.getElementById('popupCantidad');
    if (popupExistente) popupExistente.remove();

    const fondo = document.createElement('div');
    fondo.id = 'popupCantidad';
    fondo.className = 'fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50';
    fondo.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center w-80">
            <h3 class="text-xl font-bold mb-4">¿Cuántas unidades deseas agregar?</h3>
            <input type="number" id="inputCantidadPopup" min="1" value="1" class="border rounded px-3 py-2 w-24 text-center mb-4" />
            <div class="flex gap-4">
                <button id="btnAgregarPopup" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">Agregar</button>
                <button id="btnCancelarPopup" class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors">Cancelar</button>
            </div>
        </div>
    `;
    document.body.appendChild(fondo);
    document.getElementById('inputCantidadPopup').focus();
    document.getElementById('btnAgregarPopup').onclick = async () => {
        let cantidad = parseInt(document.getElementById('inputCantidadPopup').value);
        const carrito_id = localStorage.getItem('carrito_id');
        const token = localStorage.getItem('token');
        // Usar el producto recibido por la función mostrarPopupCantidad
        if (isNaN(cantidad) || cantidad < 1) cantidad = 1;
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/carrito`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    carrito_id: carrito_id,
                    cantidad: cantidad,
                    producto_id: producto.id
                })
            });
            if (res.ok) {
                await sincronizarCarritoDesdeBackend();
                mostrarPopupExito();
            } else {
                const data = await res.json();
                alert(data.message || 'No se pudo agregar el producto al carrito');
            }
        } catch (err) {
            alert('Error al agregar el producto al carrito: ' + err.message);
        }
        fondo.remove();
    };
    document.getElementById('btnCancelarPopup').onclick = () => fondo.remove();
    // Cerrar con Escape
    fondo.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') fondo.remove();
    });
    // Permitir Enter para agregar
    document.getElementById('inputCantidadPopup').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') document.getElementById('btnAgregarPopup').click();
    });
}


function mostrarPopupExito() {
    // Si ya existe, elimínalo
    const popupExistente = document.getElementById('popupExitoCarrito');
    if (popupExistente) popupExistente.remove();
    const popup = document.createElement('div');
    popup.id = 'popupExitoCarrito';
    popup.className = 'fixed top-8 right-8 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50';
    popup.textContent = 'Producto agregado al carrito';
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 1800);
}

function mostrarMensajeFlotanteLogin() {
    const existente = document.getElementById('msgFlotanteLogin');
    if (existente) existente.remove();
    const div = document.createElement('div');
    div.id = 'msgFlotanteLogin';
    div.className = 'fixed inset-0 flex items-center justify-center z-50';
    div.innerHTML = `
        <div class="bg-gray-500 text-white px-8 py-5 rounded shadow-lg text-xl font-semibold">
            Se requiere iniciar sesión
        </div>
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

function mostrarProductos(productos) {
    contenedorProductos.innerHTML = "";
    if (productos.length === 0) {
        contenedorProductos.innerHTML =
            "<p class='text-2xl font-bold text-center text-gray-800 col-span-full m-4'>No se encontraron productos.</p>";
    } else {
        productos.forEach((producto) => {
            const productoDiv = document.createElement("div");
            productoDiv.className =
                "bg-white rounded-lg shadow-md p-4 flex flex-col items-center hover:shadow-lg transition-shadow duration-300";

            productoDiv.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.titulo}" class="w-32 h-32 object-contain m-4">
                <h2 class="text-lg font-bold mb-2">${producto.titulo}</h2>
                <p class="text-gray-700 mb-2">$${producto.precio}</p>
                <a href="detalles.html?id=${producto.id}" class="mb-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-300">Detalles</a>
                <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300">Agregar al carrito</button>
            `;
            // Botón agregar al carrito
            const btnCarrito = productoDiv.querySelector('button');
            btnCarrito.onclick = () => mostrarPopupCantidad(producto);
            contenedorProductos.appendChild(productoDiv);
        });
    }
}

function mostrarCategorias(categorias) {
    contenedorCategorias.innerHTML = "";
    categorias.forEach((categoria) => {
        const categoriaButton = document.createElement("button");
        categoriaButton.className = `
            px-8 py-2 rounded-full ${categoriaSeleccionada === categoria ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"} 
            font-bold hover:bg-blue-500 hover:text-white transition-colors duration-300 m-1`;
        categoriaButton.textContent = categoria === "all" ? "All" : categoria.charAt(0).toUpperCase() + categoria.slice(1);
        categoriaButton.addEventListener("click", () => {
            categoriaSeleccionada = categoria;
            mostrarCategorias(categorias);
            filtrarProductos();
        });
        contenedorCategorias.appendChild(categoriaButton);
    });
}

function mostrarMensajeCargando() {
    contenedorProductos.innerHTML =
        "<p class='text-2xl font-bold text-center text-gray-800 col-span-full m-4'>Cargando productos...</p>";
}

function mostrarMensajeError() {
    contenedorProductos.innerHTML =
        "<p class='text-2xl font-bold text-center text-gray-800 col-span-full m-4'>Error al cargar los productos. Por favor, inténtalo de nuevo más tarde.</p>";
}

inputBuscar.addEventListener("input", filtrarProductos);

document.addEventListener("DOMContentLoaded", () => {
    cargarCategorias();
    cargarProductos();
    // Sincronizar carrito local con backend al iniciar sesión
    const token = localStorage.getItem('token');
    if (token) {
        fetch('http://127.0.0.1:8000/api/carrito', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'content-type': 'application/json'
            }
        })
            .then(res => {
                if (!res.ok) {
                    console.error('Error al obtener el carrito del backend:', res.status, res.statusText);
                    return [];
                }
                return res.json();
            })
            .then(carritoBackend => {
                // Si la respuesta es un objeto con productos, usar ese array
                let productosCarrito = [];
                if (carritoBackend && Array.isArray(carritoBackend.productos)) {
                    // Guardar el id del carrito en localStorage
                    if (carritoBackend.id) {
                        localStorage.setItem('carrito_backend', JSON.stringify(carritoBackend));
                        localStorage.setItem('carrito_id', carritoBackend.id);
                    }
                    if (typeof window.actualizarContadorCarrito === 'function') window.actualizarContadorCarrito();
                }
            })
            .catch(err => {
                console.error('No se pudo sincronizar el carrito con el backend:', err);
            });
    }
});

