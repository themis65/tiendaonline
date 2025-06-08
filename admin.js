// admin.js
// Lógica básica para gestión de productos en el panel administrador
// Requiere que la API backend acepte los endpoints REST estándar

const API_URL = "http://127.0.0.1:8000/api";
const form = document.getElementById('formProducto');
const tablaProductos = document.getElementById('tablaProductos');
const selectCategorias = document.getElementById('categorias');
const cancelarEdicionBtn = document.getElementById('cancelarEdicion');

let productos = [];
let categorias = [];
let editando = false;

// Elementos para feedback visual
const mensajeOperacion = document.createElement('div');
mensajeOperacion.className = 'fixed top-4 right-4 z-50 px-4 py-2 rounded shadow text-white hidden';
document.body.appendChild(mensajeOperacion);
function mostrarMensaje(texto, tipo = 'success') {
    mensajeOperacion.textContent = texto;
    mensajeOperacion.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded shadow text-white ${tipo === 'success' ? 'bg-green-600' : 'bg-red-600'}`;
    mensajeOperacion.classList.remove('hidden');
    setTimeout(() => mensajeOperacion.classList.add('hidden'), 2500);
}

// Cargar categorías en el select
async function cargarCategorias() {
    const res = await fetch(`${API_URL}/categorias`);
    categorias = await res.json();
    selectCategorias.innerHTML = '';
    categorias.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.nombre;
        selectCategorias.appendChild(option);
    });
}

// Cargar productos en la tabla
async function cargarProductos() {
    const res = await fetch(`${API_URL}/productos`);
    productos = await res.json();
    renderizarProductos();
}

function renderizarProductos() {
    tablaProductos.innerHTML = '';
    productos.forEach(prod => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="py-2 px-4 border-b">${prod.id}</td>
            <td class="py-2 px-4 border-b">${prod.titulo}</td>
            <td class="py-2 px-4 border-b">${prod.descripcion || ''}</td>
            <td class="py-2 px-4 border-b">$${prod.precio}</td>
            <td class="py-2 px-4 border-b">${prod.stock}</td>
            <td class="py-2 px-4 border-b">${Array.isArray(prod.categorias) ? prod.categorias.map(c => c.nombre).join(', ') : ''}</td>
            <td class="py-2 px-4 border-b"><img src="${prod.imagen || ''}" alt="img" class="w-16 h-16 object-contain mx-auto"></td>
            <td class="py-2 px-4 border-b">
                <button class="bg-yellow-400 text-white px-2 py-1 rounded mr-2" onclick="editarProducto(${prod.id})">Editar</button>
                <button class="bg-red-500 text-white px-2 py-1 rounded" onclick="eliminarProducto(${prod.id})">Eliminar</button>
            </td>
        `;
        tablaProductos.appendChild(tr);
    });
}

// Subir imagen a Firebase Storage y obtener URL
async function subirImagen(file) {
    if (!file) return '';
    mostrarMensaje('Subiendo imagen...', 'success');
    try {
        const storageRef = firebase.storage().ref(Date.now() + '_' + file.name);
        await storageRef.put(file);
        const url = await storageRef.getDownloadURL();
        mostrarMensaje('Imagen subida correctamente', 'success');
        return url;
    } catch (e) {
        mostrarMensaje('Error al subir imagen', 'error');
        throw e;
    }
}

// Agregar o actualizar producto
form.onsubmit = async function(e) {
    e.preventDefault();
    const id = document.getElementById('productoId').value;
    const titulo = document.getElementById('titulo').value;
    const descripcion = document.getElementById('descripcion').value;
    const precio = document.getElementById('precio').value;
    const stock = document.getElementById('stock').value;
    const imagenInput = document.getElementById('imagen');
    const categoriasSeleccionadas = Array.from(selectCategorias.selectedOptions).map(opt => opt.value);
    let imagenUrl = '';
    try {
        if (imagenInput.files[0]) {
            imagenUrl = await subirImagen(imagenInput.files[0]);
        } else if (editando) {
            // Si estamos editando y no se selecciona nueva imagen, mantener la actual
            const prod = productos.find(p => p.id == id);
            imagenUrl = prod ? prod.imagen : '';
        }
        const data = {
            titulo,
            descripcion,
            precio,
            stock,
            imagen: imagenUrl,
            categorias: categoriasSeleccionadas
        };
        let respuesta;
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        if (editando) {
            respuesta = await fetch(`${API_URL}/productos/${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(data)
            });
        } else {
            respuesta = await fetch(`${API_URL}/productos`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data)
            });
        }
        if (respuesta.ok) {
            mostrarMensaje(editando ? 'Producto actualizado' : 'Producto creado', 'success');
        } else {
            mostrarMensaje('Error al guardar producto', 'error');
        }
    } catch (error) {
        mostrarMensaje('Error al guardar producto', 'error');
    }
    form.reset();
    cancelarEdicionBtn.classList.add('hidden');
    editando = false;
    await cargarProductos();
};

// Editar producto
window.editarProducto = function(id) {
    const prod = productos.find(p => p.id == id);
    if (!prod) return;
    document.getElementById('productoId').value = prod.id;
    document.getElementById('titulo').value = prod.titulo;
    document.getElementById('descripcion').value = prod.descripcion;
    document.getElementById('precio').value = prod.precio;
    document.getElementById('stock').value = prod.stock;
    // Seleccionar categorías
    Array.from(selectCategorias.options).forEach(opt => {
        opt.selected = prod.categorias && prod.categorias.some(c => String(c.id) === String(opt.value));
    });
    cancelarEdicionBtn.classList.remove('hidden');
    editando = true;
};

// Eliminar producto
window.eliminarProducto = async function(id) {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/productos/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    await cargarProductos();
};

// Cancelar edición
cancelarEdicionBtn.onclick = function() {
    form.reset();
    cancelarEdicionBtn.classList.add('hidden');
    editando = false;
};

// Inicialización
cargarCategorias();
cargarProductos();
