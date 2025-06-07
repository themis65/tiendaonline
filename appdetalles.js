const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const contenedor = document.getElementById('detalle-producto');

        /*if (id) {
            fetch(`https://fakestoreapi.com/products/${id}`)
                .then(res => res.json())
                .then(producto => {
                    contenedor.innerHTML = `
                        <div class="flex flex-col items-center">
                            <img src="${producto.image}" alt="${producto.title}" class="w-48 h-48 object-contain mb-6">
                            <h1 class="text-2xl font-bold mb-2 text-center">${producto.title}</h1>
                            <p class="text-xl text-blue-700 font-semibold mb-2">$${producto.price}</p>
                            <p class="text-gray-700 mb-4 text-center">${producto.description}</p>
                            <p class="text-sm text-gray-500 mb-6">Categoría: <span class="capitalize">${producto.category}</span></p>
                            <a href="index.html" class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Volver</a>
                        </div>
                    `;
                })
                .catch(() => {
                    contenedor.innerHTML = `<p class="text-red-500 text-center">No se pudo cargar el producto.</p>
                    <a href="index.html" class="block mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-center">Volver</a>`;
                });
        } else {
            contenedor.innerHTML = `<p class="text-red-500 text-center">No se especificó ningún producto.</p>
            <a href="index.html" class="block mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-center">Volver</a>`;
        }*/
       if (id) {
            fetch(`http://127.0.0.1:8000/api/productos/${id}`)
                .then(res => res.json())
                .then(producto => {
                    let categorias = producto.categorias.nombre;
                    contenedor.innerHTML = `
                        <div class="flex flex-col items-center">
                            <img src="${producto.image}" alt="${producto.titulo}" class="w-48 h-48 object-contain mb-6">
                            <h1 class="text-2xl font-bold mb-2 text-center">${producto.titulo}</h1>
                            <p class="text-xl text-blue-700 font-semibold mb-2">$${producto.precio}</p>
                            <p class="text-gray-700 mb-4 text-center">${producto.descripcion}</p>
                            <p class="text-sm text-gray-500 mb-6">Categoría: <span class="capitalize">${categorias}</span></p>
                            <a href="index.html" class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Volver</a>
                        </div>
                    `;
                })
                .catch(() => {
                    contenedor.innerHTML = `<p class="text-red-500 text-center">No se pudo cargar el producto.</p>
                    <a href="index.html" class="block mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-center">Volver</a>`;
                });
        } else {
            contenedor.innerHTML = `<p class="text-red-500 text-center">No se especificó ningún producto.</p>
            <a href="index.html" class="block mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-center">Volver</a>`;
        }