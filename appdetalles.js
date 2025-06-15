const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const contenedor = document.getElementById('detalle-producto');

// --- Mostrar detalles y botón agregar al carrito ---
if (id) {
    fetch(`http://127.0.0.1:8000/api/productos/${id}`)
        .then(res => res.json())
        .then(producto => {
            let nombresCategorias = '';
            if (Array.isArray(producto.categorias)) {
                nombresCategorias = producto.categorias.map(cat => cat.nombre).join(', ');
            } else if (producto.categorias && producto.categorias.nombre) {
                nombresCategorias = producto.categorias.nombre;
            } else {
                nombresCategorias = 'Sin categoría';
            }
            contenedor.innerHTML = `
                <div class="flex flex-col items-center">
                    <img src="${producto.imagen}" alt="${producto.titulo}" class="w-48 h-48 object-contain mb-6">
                    <h1 class="text-2xl font-bold mb-2 text-center">${producto.titulo}</h1>
                    <div class="text-xs text-gray-500 mb-2">Stock: ${typeof producto.stock !== 'undefined' ? producto.stock : 'N/D'}</div>
                    <p class="text-xl text-blue-700 font-semibold mb-2">$${producto.precio}</p>
                    <p class="text-gray-700 mb-4 text-center">${producto.descripcion}</p>
                    <p class="text-sm text-gray-500 mb-6">Categorías: <span class="capitalize">${nombresCategorias}</span></p>
                    <button id="btnAgregarCarrito" class="mb-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Agregar al carrito</button>
                    <a href="index.html" class="mb-4 px-6 py-2 bg-gray-300 text-gray-900 rounded hover:bg-blue-600 transition-colors text-center hover:text-white">Volver</a>
                </div>
            `;
            // Lógica botón agregar al carrito
            const btnAgregar = document.getElementById('btnAgregarCarrito');
            if (btnAgregar) {
                btnAgregar.onclick = () => mostrarPopupCantidad(producto);
            }
            // Ocultar botón si es admin
            ocultarCarritoSiAdmin();
        })
        .catch(() => {
            contenedor.innerHTML = `<p class="text-red-500 text-center">No se pudo cargar el producto.</p>
            <a href="index.html" class="block mb-4 px-6 py-2 bg-gray-300 text-gray-900 rounded hover:bg-blue-600 transition-colors text-center hover:text-white">Volver</a>`;
        });
} else {
    contenedor.innerHTML = `<p class="text-red-500 text-center">No se especificó ningún producto.</p>
    <a href="index.html" class="block mb-4 px-6 py-2 bg-gray-300 text-gray-900 rounded hover:bg-blue-600 transition-colors text-center hover:text-white">Volver</a>`;
}

// --- Popup cantidad (idéntico a app.js) ---
async function mostrarPopupCantidad(producto) {
    const token = localStorage.getItem('token');
    if (!token) {
        mostrarMensajeFlotanteLogin();
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
        return;
    }
    // Obtener stock actualizado del backend
    let productoActual = producto;
    try {
        const res = await fetch(`http://127.0.0.1:8000/api/productos/${producto.id}`);
        if (res.ok) {
            productoActual = await res.json();
        }
    } catch {}
    // El stock puede venir como string, asegúrate de convertirlo a número
    let stockDisponible = 0;
    if (typeof productoActual.stock === 'number') {
        stockDisponible = productoActual.stock;
    } else if (typeof productoActual.stock === 'string') {
        stockDisponible = parseInt(productoActual.stock, 10);
    }
    // Obtener cantidad ya en carrito
    let carrito = JSON.parse(localStorage.getItem('carrito_backend') || '{}');
    let cantidadEnCarrito = 0;
    if (carrito && Array.isArray(carrito.productos)) {
        const item = carrito.productos.find(p => String(p.producto.id) === String(producto.id));
        if (item) cantidadEnCarrito = item.cantidad;
    }
    const maxCantidad = Math.max(stockDisponible - cantidadEnCarrito, 0);
    if (maxCantidad <= 0) {
        const popup = document.createElement('div');
        popup.className = 'fixed top-8 right-8 bg-red-600 text-white px-6 py-3 rounded shadow-lg z-50';
        popup.textContent = 'No hay suficiente stock disponible.';
        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 2000);
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
            <input type="number" id="inputCantidadPopup" min="1" max="${maxCantidad}" value="1" class="border rounded px-3 py-2 w-24 text-center mb-4" />
            <div class="text-xs text-gray-500 mb-2">Stock disponible: ${maxCantidad}</div>
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
        if (isNaN(cantidad) || cantidad < 1) cantidad = 1;
        if (cantidad > maxCantidad) {
            alert('No puedes agregar más de la cantidad disponible en stock.');
            return;
        }
        const carrito_id = localStorage.getItem('carrito_id');
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
    fondo.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') fondo.remove();
    });
    document.getElementById('inputCantidadPopup').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') document.getElementById('btnAgregarPopup').click();
    });
}

function mostrarPopupExito() {
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

// --- Carrito flotante: lógica similar a app.js ---
async function sincronizarCarritoDesdeBackend() {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        const res = await fetch('http://127.0.0.1:8000/api/carrito', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'content-type': 'application/json'
            }
        });
        if (!res.ok) return;
        const carritoBackend = await res.json();
        if (carritoBackend && carritoBackend.id) {
            localStorage.setItem('carrito_backend', JSON.stringify(carritoBackend));
            localStorage.setItem('carrito_id', carritoBackend.id);
        }
        actualizarFloatingCart();
    } catch (err) {
        // Error silencioso
    }
}

function actualizarFloatingCart() {
    const carrito = JSON.parse(localStorage.getItem('carrito_backend') || '{}');
    const productos = carrito.productos || [];
    let totalCantidad = 0;
    floatingCartProducts.innerHTML = '';
    if (productos.length === 0) {
        floatingCartProducts.innerHTML = '<p class="text-gray-500 text-center">El carrito está vacío.</p>';
    } else {
        productos.forEach(item => {
            totalCantidad += item.cantidad;
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between mb-2 border-b pb-2';
            div.innerHTML = `
                <div>
                    <div class="font-semibold">${item.producto.titulo}</div>
                    <div class="text-xs text-gray-500">Stock: ${typeof item.producto.stock !== 'undefined' ? item.producto.stock : 'N/D'}</div>
                    <div class="text-xs">$${item.producto.precio}</div>
                </div>
                <div class="flex items-center gap-2">
                    <button class="bg-gray-200 px-2 rounded text-lg font-bold" data-action="restar" data-id="${item.producto.id}">-</button>
                    <span class="w-6 text-center">${item.cantidad}</span>
                    <button class="bg-gray-200 px-2 rounded text-lg font-bold" data-action="sumar" data-id="${item.producto.id}">+</button>
                    <button class="ml-2 text-red-500 hover:text-red-700" data-action="eliminar" data-id="${item.producto.id}">&times;</button>
                </div>
            `;
            floatingCartProducts.appendChild(div);
        });
    }
    floatingCartCount.textContent = totalCantidad;
    floatingCartCount.style.display = totalCantidad > 0 ? 'block' : 'none';
}

// --- Direcciones y confirmar pedido ---
async function cargarDirecciones() {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        const res = await fetch('http://127.0.0.1:8000/api/direcciones', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return;
        const direcciones = await res.json();
        floatingDireccionEnvio.innerHTML = '';
        direcciones.forEach(dir => {
            // Mostrar igual que en pedidos.html
            const opt = document.createElement('option');
            opt.value = dir.id;
            opt.textContent = `${dir.direccion ? dir.direccion : ''}${dir.ciudad ? ', ' + dir.ciudad : ''}${dir.provincia ? ', ' + dir.provincia : ''}${dir.telefono ? ' (' + dir.telefono + ')' : ''}`;
            floatingDireccionEnvio.appendChild(opt);
        });
    } catch {}
}
floatingConfirmarPedidoBtn.onclick = async () => {
    const token = localStorage.getItem('token');
    const carrito_id = localStorage.getItem('carrito_id');
    const direccion_id = floatingDireccionEnvio.value;
    if (!direccion_id) return alert('Selecciona una dirección');
    try {
        const res = await fetch('http://127.0.0.1:8000/api/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                carrito_id,
                direccion_id
            })
        });
        if (res.ok) {
            await sincronizarCarritoDesdeBackend();
            floatingCartMenu.classList.add('hidden');
            mostrarPopupExito();
            setTimeout(() => window.location.reload(), 1200);
        } else {
            alert('No se pudo confirmar el pedido');
        }
    } catch {
        alert('Error al confirmar el pedido');
    }
};

// --- Ocultar carrito y botón para admin ---
function ocultarCarritoSiAdmin() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const floatingCartBtn = document.getElementById('floatingCartBtn');
    const floatingCartMenu = document.getElementById('floatingCartMenu');
    if (usuario && usuario.rol === 'admin') {
        if (floatingCartBtn) floatingCartBtn.style.display = 'none';
        if (floatingCartMenu) floatingCartMenu.style.display = 'none';
        const btnAgregar = document.getElementById('btnAgregarCarrito');
        if (btnAgregar) btnAgregar.style.display = 'none';
    }
}

// --- Inicialización segura de listeners y referencias ---
document.addEventListener('DOMContentLoaded', () => {
    sincronizarCarritoDesdeBackend();
    // Referencias DOM dentro del evento para asegurar que existen
    const floatingCartBtn = document.getElementById('floatingCartBtn');
    const floatingCartMenu = document.getElementById('floatingCartMenu');
    const floatingCartCount = document.getElementById('floatingCartCount');
    const floatingCartProducts = document.getElementById('floatingCartProducts');
    const floatingDireccionEnvio = document.getElementById('floatingDireccionEnvio');
    const floatingConfirmarPedidoBtn = document.getElementById('floatingConfirmarPedidoBtn');

    // Listeners del carrito flotante
    if (floatingCartBtn && floatingCartMenu) {
        floatingCartBtn.onclick = () => {
            floatingCartMenu.classList.toggle('hidden');
            if (!floatingCartMenu.classList.contains('hidden')) {
                sincronizarCarritoDesdeBackend();
                cargarDirecciones();
            }
        };
        document.addEventListener('click', (e) => {
            if (!floatingCartMenu.contains(e.target) && e.target !== floatingCartBtn) {
                floatingCartMenu.classList.add('hidden');
            }
        });
    }
    if (floatingCartProducts) {
        floatingCartProducts.onclick = async (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const action = btn.getAttribute('data-action');
            const prodId = btn.getAttribute('data-id');
            const carrito_id = localStorage.getItem('carrito_id');
            const token = localStorage.getItem('token');
            if (action === 'sumar' || action === 'restar') {
                let carrito = JSON.parse(localStorage.getItem('carrito_backend') || '{}');
                let item = (carrito.productos || []).find(p => String(p.producto.id) === String(prodId));
                if (!item) return;
                let nuevaCantidad = item.cantidad + (action === 'sumar' ? 1 : -1);
                if (nuevaCantidad < 1) return;
                await fetch('http://127.0.0.1:8000/api/carrito', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        carrito_id,
                        producto_id: prodId,
                        cantidad: nuevaCantidad
                    })
                });
                await sincronizarCarritoDesdeBackend();
            } else if (action === 'eliminar') {
                await fetch('http://127.0.0.1:8000/api/carrito', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        carrito_id,
                        producto_id: prodId
                    })
                });
                await sincronizarCarritoDesdeBackend();
            }
        };
    }
    if (floatingConfirmarPedidoBtn && floatingDireccionEnvio) {
        floatingConfirmarPedidoBtn.onclick = async () => {
            const token = localStorage.getItem('token');
            const carrito_id = localStorage.getItem('carrito_id');
            const direccion_id = floatingDireccionEnvio.value;
            if (!direccion_id) return alert('Selecciona una dirección');
            try {
                const res = await fetch('http://127.0.0.1:8000/api/pedidos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        carrito_id,
                        direccion_id
                    })
                });
                if (res.ok) {
                    await sincronizarCarritoDesdeBackend();
                    floatingCartMenu.classList.add('hidden');
                    mostrarPopupExito();
                    setTimeout(() => window.location.reload(), 1200);
                } else {
                    alert('No se pudo confirmar el pedido');
                }
            } catch {
                alert('Error al confirmar el pedido');
            }
        };
    }
    ocultarCarritoSiAdmin();
});