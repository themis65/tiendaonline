const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const contenedor = document.getElementById('detalle-producto');
       
       if (id) {
            fetch(`http://127.0.0.1:8000/api/productos/${id}`)
                .then(res => res.json())
                .then(producto => {
                    // Verificar si el producto tiene categorías y formatear los nombres
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
                            <p class="text-xl text-blue-700 font-semibold mb-2">$${producto.precio}</p>
                            <p class="text-gray-700 mb-4 text-center">${producto.descripcion}</p>
                            <p class="text-sm text-gray-500 mb-6">Categorías: <span class="capitalize">${nombresCategorias}</span></p>
                            <a href="index.html" class="mb-4 px-6 py-2 bg-gray-300 text-gray-900 rounded hover:bg-blue-600 transition-colors text-center hover:text-white">Volver</a>
                        </div>
                    `;
                })
                .catch(() => {
                    contenedor.innerHTML = `<p class="text-red-500 text-center">No se pudo cargar el producto.</p>
                    <a href="index.html" class="block mb-4 px-6 py-2 bg-gray-300 text-gray-900 rounded hover:bg-blue-600 transition-colors text-center hover:text-white">Volver</a>`;
                });
        } else {
            contenedor.innerHTML = `<p class="text-red-500 text-center">No se especificó ningún producto.</p>
            <a href="index.html" class="block mb-4 px-6 py-2 bg-gray-300 text-gray-900 rounded hover:bg-blue-600 transition-colors text-center hover:text-white">Volver</a>`;
        }