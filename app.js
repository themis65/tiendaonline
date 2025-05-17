const contenedorProductos = document.getElementById("productos");
const contenedorCategorias = document.getElementById("categorias");
const inputBuscar = document.getElementById("busqueda");
let productos = [];
let categoriaSeleccionada = "all";

async function cargarProductos() {
    try {
        mostrarMensajeCargando();
        const respuesta = await fetch("https://fakestoreapi.com/products");
        if (!respuesta.ok) {
            throw new Error("Error en la respuesta de la API");
        }
        productos = await respuesta.json();
        if(productos.length === 0) {
            throw new Error("No se encontraron productos en la API");
            console.log("No se encontraron productos en la API");
        }else{

            mostrarProductos(productos);
        }
    }catch (error) {
        console.error("Error al cargar los productos: ", error);
        mostrarMensajeError();
    }
}

function filtrarProductos() {
    let filtrados = productos;
    const textoBusqueda = inputBuscar.value.toLowerCase();
    if (textoBusqueda.trim() !== "") {
        filtrados = filtrados.filter((p) => 
            p.title.toLowerCase().includes(textoBusqueda) || p.description.toLowerCase().includes(textoBusqueda)
        );
    }

    if (categoriaSeleccionada !== "all") {
        filtrados = filtrados.filter((p) => p.category === categoriaSeleccionada);
    }
    mostrarProductos(filtrados);
}

async function cargarCategorias() {
    try {
        const respuesta = await fetch("https://fakestoreapi.com/products/categories");
        if (!respuesta.ok) {
            throw new Error("Error en la respuesta de la API");
        }
        const categorias = await respuesta.json();
        mostrarCategorias(["all",...categorias] );
    }catch (error) {
        console.error("Error al cargar las categorias: ", error);
    }
}

function mostrarProductos(productos) {
    contenedorProductos.innerHTML = "";
    if (productos.length === 0){
        contenedorProductos.innerHTML = 
        "<p class='text-2xl font-bold text-center text-gray-800 col-span-full m-4'>No se encontraron productos.</p>";
    }else{
        productos.forEach((productos) => {
            const productoDiv = document.createElement("div");
            productoDiv.className = 
            "bg-white rounded-lg shadow-md p-4 flex flex-col items-center hover:shadow-lg transition-shadow duration-300";
            productoDiv.innerHTML = `
                <img src="${productos.image}" alt="${productos.title}" class="w-32 h-32 object-contain m-4">
                <h2 class="text-lg font-bold mb-2">${productos.title}</h2>
                <p class="text-gray-700 mb-2">$${productos.price}</p>
                <a href="detalles.html?id=${productos.id}" class="mb-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-300">Detalles</a>
                <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300">Agregar al carrito</button>
            `;
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
        font-bold hover:bg-blue-500 hover:text-white transition-colors duration-300`;
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

document.addEventListener("DOMContentLoaded", ()=> {
    cargarCategorias();
    cargarProductos();
});