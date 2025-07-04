// Carrito funcional mejorado para ambas páginas
document.addEventListener('DOMContentLoaded', function() {
    // Selectores comunes
    const carritoLista = document.getElementById("carrito-lista");
    const totalElemento = document.getElementById("total");
    const carrito = document.getElementById("carrito");
    const cerrarCarrito = document.getElementById("cerrar-carrito");
    const botonCarrito = document.querySelector('.icons a[title="Carrito"], .icons a[title="Carrito de compras"]');
    const botonFavoritos = document.querySelector('.icons a[title="Favoritos"]');
    const favoritosContenedor = document.getElementById("favoritos");
    const cerrarFavoritos = document.getElementById("cerrar-favoritos");
    const favoritosLista = document.getElementById("favoritos-lista");
    const buscador = document.getElementById("buscador");
    const filtros = document.querySelectorAll('.filtros input[type="checkbox"]');

    let carritoItems = [];
    let favoritos = [];

    // Inicialización
    init();

    function init() {
        cargarDatos();
        configurarEventosProductos();
        configurarEventListenersGlobales();
        configurarLogin(); // Llama a la función de configuración de inicio de sesión
    }

    function cargarDatos() {
        const datosGuardados = localStorage.getItem("carrito");
        if (datosGuardados) {
            carritoItems = JSON.parse(datosGuardados);
            actualizarCarrito();
        }

        const datosFavoritos = localStorage.getItem("favoritos");
        if (datosFavoritos) {
            favoritos = JSON.parse(datosFavoritos);
            actualizarFavoritos();
            marcarFavoritosEnProductos();
        }
    }

    function configurarEventosProductos() {
        // Para productos en cabello.html (con clase agregar-carrito)
        document.querySelectorAll(".agregar-carrito").forEach(btn => {
            btn.addEventListener("click", agregarProductoAlCarrito);
        });

        // Para productos en index.html (button directo)
        document.querySelectorAll(".producto > button").forEach(btn => {
            if (!btn.classList.contains("agregar-carrito") && 
                !btn.classList.contains("agregar-favorito")) {
                btn.addEventListener("click", agregarProductoAlCarrito);
            }
        });

        // Eventos para favoritos
        document.querySelectorAll(".agregar-favorito").forEach(btn => {
            btn.addEventListener("click", toggleFavorito);
        });
    }

    function agregarProductoAlCarrito(e) {
        const btn = e.currentTarget;
        const producto = btn.closest(".producto");
        
        const nombre = btn.dataset.nombre || 
                      producto.dataset.nombre || 
                      producto.querySelector("h4, p")?.textContent?.split("-")[0]?.trim();
        
        const precioText = btn.dataset.precio || 
                         producto.dataset.precio || 
                         producto.querySelector("p")?.textContent?.match(/\d+\.?\d*/);
        
        const precio = parseFloat(precioText);

        if (!nombre || isNaN(precio)) {
            console.error("No se pudo identificar el producto:", {nombre, precio});
            return;
        }

        const existente = carritoItems.find(item => item.nombre === nombre);
        if (existente) {
            existente.cantidad++;
        } else {
            carritoItems.push({ nombre, precio, cantidad: 1 });
        }

        guardarCarrito();
        actualizarCarrito();
        mostrarNotificacion('cart-notification'); // Mostrar notificación de carrito
        if (carrito) carrito.classList.remove("oculto");
    }

    function toggleFavorito(e) {
        const btn = e.currentTarget;
        const producto = btn.closest(".producto");
        
        const nombre = btn.dataset.nombre || 
                      producto.dataset.nombre || 
                      producto.querySelector("h4, p")?.textContent?.split("-")[0]?.trim();
        
        const precioText = btn.dataset.precio || 
                         producto.dataset.precio || 
                         producto.querySelector("p")?.textContent?.match(/\d+\.?\d*/);
        
        const precio = parseFloat(precioText);

        if (!nombre || isNaN(precio)) {
            console.error("Datos incompletos para favorito:", {nombre, precio});
            return;
        }

        const existente = favoritos.find(p => p.nombre === nombre);
        if (existente) {
            favoritos = favoritos.filter(p => p.nombre !== nombre);
            btn.classList.remove("favorito");
        } else {
            favoritos.push({ nombre, precio });
            btn.classList.add("favorito");
            mostrarNotificacion('fav-notification'); // Mostrar notificación de favorito
        }

        guardarFavoritos();
        actualizarFavoritos();
    }

    function marcarFavoritosEnProductos() {
        document.querySelectorAll(".agregar-favorito").forEach(btn => {
            const producto = btn.closest(".producto");
            if (!producto) return;
            
            const nombre = btn.dataset.nombre || 
                          producto.dataset.nombre || 
                          producto.querySelector("h4, p")?.textContent?.split("-")[0]?.trim();
            
            if (!nombre) return;

            if (favoritos.some(fav => fav.nombre === nombre)) {
                btn.classList.add("favorito");
            } else {
                btn.classList.remove("favorito");
            }
        });
    }

    function configurarEventListenersGlobales() {
        // Carrito
        if (botonCarrito) {
            botonCarrito.addEventListener("click", (e) => {
                e.preventDefault();
                if (carrito) carrito.classList.toggle("oculto");
            });
        }

        if (cerrarCarrito) {
            cerrarCarrito.addEventListener("click", () => {
                if (carrito) carrito.classList.add("oculto");
            });
        }

        // Favoritos
        if (botonFavoritos) {
            botonFavoritos.addEventListener("click", (e) => {
                e.preventDefault();
                if (favoritosContenedor) favoritosContenedor.classList.toggle("oculto");
            });
        }

        if (cerrarFavoritos) {
            cerrarFavoritos.addEventListener("click", () => {
                if (favoritosContenedor) favoritosContenedor.classList.add("oculto");
            });
        }

        // Buscador
        if (buscador) {
            buscador.addEventListener("input", () => {
                const texto = buscador.value.toLowerCase();
                document.querySelectorAll(".producto").forEach(producto => {
                    const nombre = producto.dataset.nombre?.toLowerCase() || 
                                 producto.querySelector("h4, p")?.textContent?.toLowerCase() || "";
                    producto.style.display = nombre.includes(texto) ? "" : "none";
                });
            });
        }

        // Filtros
        if (filtros.length > 0) {
            filtros.forEach(filtro => {
                filtro.addEventListener("change", aplicarFiltros);
            });
        }
    }

    function aplicarFiltros() {
        const marcasSeleccionadas = [...document.querySelectorAll('input[name="marca"]:checked')].map(el => el.value);
        const preciosSeleccionados = [...document.querySelectorAll('input[name="precio"]:checked')].map(el => el.value);

        document.querySelectorAll(".producto").forEach(producto => {
            const marca = producto.dataset.marca;
            const precioText = producto.dataset.precio || 
                             producto.querySelector("p")?.textContent?.match(/\d+\.?\d*/);
            const precio = parseFloat(precioText);

            const pasaMarca = marcasSeleccionadas.length === 0 || marcasSeleccionadas.includes(marca);
            const pasaPrecio = preciosSeleccionados.length === 0 ||
                (preciosSeleccionados.includes("menor-20") && precio < 20) ||
                (preciosSeleccionados.includes("mayor-20") && precio >= 20);

            producto.style.display = (pasaMarca && pasaPrecio) ? "" : "none";
        });
    }

    // Funciones de actualización
    function actualizarCarrito() {
        if (!carritoLista) return;

        carritoLista.innerHTML = "";

        if (carritoItems.length === 0) {
            carritoLista.innerHTML = "<li>Carrito vacío</li>";
            if (totalElemento) totalElemento.textContent = "Total: $0.00";
            return;
        }

        carritoItems.forEach((item, index) => {
            const li = document.createElement("li");
            li.innerHTML = `
                ${item.nombre} - S/ ${item.precio.toFixed(2)} 
                <button class="cantidad-btn" data-index="${index}" data-change="-1">-</button>
                ${item.cantidad}
                <button class="cantidad-btn" data-index="${index}" data-change="1">+</button>
                <button class="eliminar-btn" data-index="${index}">✕</button>
            `;
            carritoLista.appendChild(li);
        });

        // Agregar eventos a los nuevos botones
        carritoLista.querySelectorAll(".cantidad-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                const index = parseInt(this.dataset.index);
                const change = parseInt(this.dataset.change);
                cambiarCantidad(index, change);
            });
        });

        carritoLista.querySelectorAll(".eliminar-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                const index = parseInt(this.dataset.index);
                eliminarItem(index);
            });
        });

        const total = carritoItems.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
        if (totalElemento) totalElemento.textContent = `Total: S/ ${total.toFixed(2)}`;
    }

    function actualizarFavoritos() {
        if (!favoritosLista) return;

        favoritosLista.innerHTML = "";
        if (favoritos.length === 0) {
            favoritosLista.innerHTML = "<li>No tienes productos favoritos.</li>";
            return;
        }

        favoritos.forEach((item, index) => {
            const li = document.createElement("li");
            li.innerHTML = `
                ${item.nombre} - S/ ${item.precio.toFixed(2)}
                <button class="agregar-favorito-carrito" data-index="${index}">🛒</button>
                <button class="eliminar-favorito-btn" data-index="${index}">✕</button>
            `;
            favoritosLista.appendChild(li);
        });

        // Agregar eventos a los nuevos botones
        favoritosLista.querySelectorAll(".agregar-favorito-carrito").forEach(btn => {
            btn.addEventListener("click", function() {
                const index = parseInt(this.dataset.index);
                agregarFavoritoAlCarrito(index);
            });
        });

        favoritosLista.querySelectorAll(".eliminar-favorito-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                const index = parseInt(this.dataset.index);
                eliminarFavorito(index);
            });
        });
    }

    // Funciones de guardado
    function guardarCarrito() {
        localStorage.setItem("carrito", JSON.stringify(carritoItems));
    }

    function guardarFavoritos() {
        localStorage.setItem("favoritos", JSON.stringify(favoritos));
    }

    // Funciones de manipulación
    function cambiarCantidad(index, cambio) {
        carritoItems[index].cantidad += cambio;
        if (carritoItems[index].cantidad <= 0) {
            carritoItems.splice(index, 1);
        }
        guardarCarrito();
        actualizarCarrito();
    }

    function eliminarItem(index) {
        carritoItems.splice(index, 1);
        guardarCarrito();
        actualizarCarrito();
    }

    function agregarFavoritoAlCarrito(index) {
        const item = favoritos[index];
        const existente = carritoItems.find(p => p.nombre === item.nombre);
        if (existente) {
            existente.cantidad++;
        } else {
            carritoItems.push({ ...item, cantidad: 1 });
        }
        guardarCarrito();
        actualizarCarrito();
        if (carrito) carrito.classList.remove("oculto");
    }

    function eliminarFavorito(index) {
        favoritos.splice(index, 1);
        guardarFavoritos();
        actualizarFavoritos();
        marcarFavoritosEnProductos();
    }

    // Función para mostrar notificaciones
    function mostrarNotificacion(id) {
        const notification = document.getElementById(id);
        if (notification) {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000); // Desaparece después de 3 segundos
        }
    }

function configurarLogin() {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", function(e) {
            e.preventDefault(); // Evita el envío del formulario

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const pinContainer = document.getElementById("pin-container");
            
            // Obtener los valores de los cuatro campos de PIN
            const pinInputs = document.querySelectorAll(".pin-digit");
            const pin = Array.from(pinInputs).map(input => input.value).join('');

            // Verificar credenciales de administrador
            if (email === "luciamoranaragon@gmail.com" && password === "Camila1311BB") {
                // Mostrar el contenedor del PIN
                pinContainer.style.display = "block"; 
                alert("Por favor, ingrese el PIN de administrador");
                return;
            }

            // Verificar si el usuario está registrado
            const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
            const usuario = usuarios.find(user => user.email === email && user.password === password);

            if (usuario) {
                // Lógica para el inicio de sesión de usuario regular
                alert("Inicio de sesión exitoso como usuario regular");
                localStorage.setItem("isLoggedIn", "true"); // Guardar estado de autenticación
                window.location.href = "index.html"; // Redirige a la página principal
            } else {
                alert("Correo o contraseña incorrectos");
            }

            // Verificar el PIN
            if (pin === "1234") {
                window.location.href = "admin.html"; // Redirige a la página del administrador
            } else {
                alert("PIN incorrecto");
            }
        });
    }
}

    // Hacer funciones accesibles globalmente
    window.cambiarCantidad = cambiarCantidad;
    window.eliminarItem = eliminarItem;
    window.agregarFavoritoAlCarrito = agregarFavoritoAlCarrito;
    window.eliminarFavorito = eliminarFavorito;
});
