document.addEventListener('DOMContentLoaded', function () {
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

  init();

  function init() {
    cargarDatos();
    configurarEventosProductos();
    configurarEventListenersGlobales();
    configurarLogin();
    configurarMenuUsuario();
    configurarPerfil();
  }

  function configurarMenuUsuario() {
    const userIcon = document.getElementById('user-icon');
    const dropdown = document.getElementById('user-dropdown');
    const logoutBtn = document.getElementById('logout-btn');
    const currentUser = JSON.parse(localStorage.getItem('usuarioActual'));

    userIcon.addEventListener('click', function (e) {
      e.preventDefault();
      if (!currentUser || !currentUser.loggedIn) {
        window.location.href = 'registro.html';
      } else {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
      }
    });

    document.addEventListener('click', function (e) {
      if (!userIcon.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });

    if (currentUser && currentUser.loggedIn) {
      logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('usuarioActual');
        window.location.href = 'index.html';
      });
    } else {
      userIcon.href = 'login.html';
    }
  }

  function actualizarCarrito() {
    carritoLista.innerHTML = "";

    if (carritoItems.length === 0) {
      carritoLista.innerHTML = "<li>Carrito vacío</li>";
      totalElemento.textContent = "Total: S/ 0.00";
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

    configurarBotonesCantidad();
    configurarBotonesEliminar();

    const total = carritoItems.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    totalElemento.textContent = `Total: S/ ${total.toFixed(2)}`;
    // 🛡️ Evitar cierre al hacer clic en botones dentro del carrito
  carritoLista.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  });
}


  function configurarBotonesCantidad() {
    carritoLista.querySelectorAll(".cantidad-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const index = parseInt(this.dataset.index);
        const change = parseInt(this.dataset.change);
        cambiarCantidad(index, change);
      });
    });
  }

  function configurarBotonesEliminar() {
    carritoLista.querySelectorAll(".eliminar-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const index = parseInt(this.dataset.index);
        eliminarItem(index);
      });
    });
  }

  function actualizarFavoritos() {
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

    configurarBotonesFavoritos();
  favoritosLista.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  });
}

  function configurarBotonesFavoritos() {
    favoritosLista.querySelectorAll(".agregar-favorito-carrito").forEach(btn => {
      btn.addEventListener("click", function () {
        const index = parseInt(this.dataset.index);
        agregarFavoritoAlCarrito(index);
        mostrarToast(`${favoritos[index].nombre} agregado al carrito`);
      });
    });

    favoritosLista.querySelectorAll(".eliminar-favorito-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const index = parseInt(this.dataset.index);
        eliminarFavorito(index);
      });
    });
  }

  function cargarDatos() {
    try {
      const datosGuardados = localStorage.getItem("carrito");
      if (datosGuardados) {
        carritoItems = JSON.parse(datosGuardados);
        actualizarCarrito();
      }
    } catch (e) {
      carritoItems = [];
    }

    try {
      const datosFavoritos = localStorage.getItem("favoritos");
      if (datosFavoritos) {
        favoritos = JSON.parse(datosFavoritos);
        actualizarFavoritos();
        marcarFavoritosEnProductos();
      }
    } catch (e) {
      favoritos = [];
    }
  }

  function configurarEventosProductos() {
    document.querySelectorAll(".agregar-carrito").forEach(btn => {
      btn.addEventListener("click", agregarProductoAlCarrito);
    });

    document.querySelectorAll(".producto > button").forEach(btn => {
      if (!btn.classList.contains("agregar-carrito") && !btn.classList.contains("agregar-favorito")) {
        btn.addEventListener("click", agregarProductoAlCarrito);
      }
    });

    document.querySelectorAll(".agregar-favorito").forEach(btn => {
      btn.addEventListener("click", toggleFavorito);
    });
  }

  function agregarProductoAlCarrito(e) {
  const btn = e.currentTarget;
  const producto = btn.closest(".producto");

  // Prioriza el dataset del botón, luego el del contenedor
  const nombre = btn.dataset.nombre || producto.dataset.nombre || producto.querySelector("h4")?.textContent?.trim();
  const precio = parseFloat(btn.dataset.precio || producto.dataset.precio);
  const imagen = producto.querySelector("img")?.src || "";

  if (!nombre || isNaN(precio)) {
    console.warn("Producto inválido", { nombre, precio });
    return;
  }

  const existente = carritoItems.find(item => item.nombre === nombre);
  if (existente) {
    existente.cantidad++;
  } else {
    carritoItems.push({ nombre, precio, cantidad: 1, imagen });

  }

  guardarCarrito();
  actualizarCarrito();
  mostrarToast(`${nombre} agregado al carrito`);
  carrito?.classList.remove("oculto");
}


  function toggleFavorito(e) {
    const btn = e.currentTarget;
    const producto = btn.closest(".producto");

    const nombre = btn.dataset.nombre || producto.dataset.nombre || producto.querySelector("h4, p")?.textContent?.split("-")[0]?.trim();
    const precioText = btn.dataset.precio || producto.dataset.precio || producto.querySelector("p")?.textContent?.match(/\d+\.?\d*/);
    const precio = parseFloat(precioText?.[0]);

    if (!nombre || isNaN(precio)) return;

    const existente = favoritos.find(p => p.nombre === nombre);
    if (existente) {
      favoritos = favoritos.filter(p => p.nombre !== nombre);
      btn.classList.remove("favorito");
    } else {
      favoritos.push({ nombre, precio });
      btn.classList.add("favorito");
      mostrarToast(`${nombre} agregado a favoritos`);
      favoritosContenedor?.classList.remove("oculto");
    }

    guardarFavoritos();
    actualizarFavoritos();
  }

  function marcarFavoritosEnProductos() {
    document.querySelectorAll(".agregar-favorito").forEach(btn => {
      const producto = btn.closest(".producto");
      const nombre = btn.dataset.nombre || producto.dataset.nombre || producto.querySelector("h4, p")?.textContent?.split("-")[0]?.trim();
      if (!nombre) return;

      if (favoritos.some(fav => fav.nombre === nombre)) {
        btn.classList.add("favorito");
      } else {
        btn.classList.remove("favorito");
      }
    });
  }

  function configurarEventListenersGlobales() {
  botonCarrito?.addEventListener("click", e => {
    e.preventDefault();
    carrito?.classList.toggle("oculto");
  });

  cerrarCarrito?.addEventListener("click", () => carrito?.classList.add("oculto"));

  botonFavoritos?.addEventListener("click", e => {
    e.preventDefault();
    favoritosContenedor?.classList.toggle("oculto");
  });

  cerrarFavoritos?.addEventListener("click", () => favoritosContenedor?.classList.add("oculto"));

  buscador?.addEventListener("input", () => {
    const texto = buscador.value.toLowerCase();
    document.querySelectorAll(".producto").forEach(producto => {
      const nombre = producto.dataset.nombre?.toLowerCase() || producto.querySelector("h4, p")?.textContent?.toLowerCase() || "";
      producto.style.display = nombre.includes(texto) ? "" : "none";
    });
  });

  filtros.forEach(filtro => filtro.addEventListener("change", aplicarFiltros));

  document.addEventListener("click", function (e) {
    if (!carrito?.contains(e.target) && !botonCarrito?.contains(e.target)) {
      carrito?.classList.add("oculto");
    }
    if (!favoritosContenedor?.contains(e.target) && !botonFavoritos?.contains(e.target)) {
      favoritosContenedor?.classList.add("oculto");
    }
  });

  // 🟨 Cierra carrito cuando el mouse sale del recuadro
  carrito?.addEventListener("mouseleave", () => {
    carrito.classList.add("oculto");
  });

  // 🟨 Cierra favoritos cuando el mouse sale del recuadro
  favoritosContenedor?.addEventListener("mouseleave", () => {
    favoritosContenedor.classList.add("oculto");
  });
}


  function aplicarFiltros() {
    const marcas = [...document.querySelectorAll('input[name="marca"]:checked')].map(el => el.value);
    const precios = [...document.querySelectorAll('input[name="precio"]:checked')].map(el => el.value);

    document.querySelectorAll(".producto").forEach(producto => {
      const marca = producto.dataset.marca;
      const precioText = producto.dataset.precio || producto.querySelector("p")?.textContent?.match(/\d+\.?\d*/);
      const precio = parseFloat(precioText?.[0]) || 0;

      const pasaMarca = marcas.length === 0 || marcas.includes(marca);
      const pasaPrecio = precios.length === 0 ||
        (precios.includes("menor-20") && precio < 20) ||
        (precios.includes("mayor-20") && precio >= 20);

      producto.style.display = (pasaMarca && pasaPrecio) ? "" : "none";
    });
  }

  function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carritoItems));
  }

  function guardarFavoritos() {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
  }

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
    carrito?.classList.remove("oculto");
  }

  function eliminarFavorito(index) {
    favoritos.splice(index, 1);
    guardarFavoritos();
    actualizarFavoritos();
    marcarFavoritosEnProductos();
  }

  const botonComprar = document.querySelector('.comprar-ahora');
  if (botonComprar) {
    botonComprar.addEventListener("click", function () {
      if (carritoItems.length === 0) {
        mostrarToast("Tu carrito está vacío");
        return;
      }
      mostrarToast("Redirigiendo a la página de pago...");
      setTimeout(() => {
        window.location.href = "checkout.html";
      }, 1500);
    });
  }

  function configurarLogin() {
  const loginForm = document.getElementById("login-form");
  if (!loginForm) return;

  const administradores = [
    { email: "luciamoranaragon13@gmail.com", password: "Camila1311BB", pin: "1234" },
    { email: "zafiro.ramirez@unmsm.edu.pe", password: "RamirezA", pin: "1357" },
  ];

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const pinContainer = document.getElementById("pin-container");
    const pinInputs = document.querySelectorAll(".pin-digit");
    const pin = Array.from(pinInputs).map(input => input.value).join('');

    const admin = administradores.find(a => a.email === email && a.password === password);

    if (admin) {
      // Mostrar PIN si no se ha mostrado aún
      if (pinContainer.style.display !== "block") {
        pinContainer.style.display = "block";
        mostrarToast("Por favor ingrese el PIN de administrador");
        return;
      }

      // Validar PIN ingresado
      if (pin.length === 4) {
        if (pin === admin.pin) {
          localStorage.setItem("usuarioActual", JSON.stringify({ ...admin, loggedIn: true, admin: true }));
          mostrarToast("Bienvenido administrador");
          window.location.href = "admin.html";
        } else {
          mostrarToast("PIN incorrecto");
        }
      } else {
        mostrarToast("Por favor completa el PIN");
      }

      return; // 🛑 Finaliza aquí si es admin
    }

    // Si no es admin, verificar como usuario normal
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuario = usuarios.find(user => user.correo === email && user.contrasena === password);

    if (usuario) {
      localStorage.setItem("usuarioActual", JSON.stringify({ ...usuario, loggedIn: true }));
      mostrarToast("Inicio de sesión exitoso");
      window.location.href = "index.html";
    } else {
      mostrarToast("Correo o contraseña incorrectos");
    }
  });
}



  function mostrarToast(mensaje) {
    let toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
function configurarPerfil() {
  const form = document.getElementById("formPerfil");
  if (!form) return;

  const inputs = form.querySelectorAll("input, select");
  const botonGuardar = document.querySelector(".boton-guardar");

  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  let usuarioActual = JSON.parse(localStorage.getItem("usuarioActual")) || {};
  let usuario = usuarios.find(u => u.correo === usuarioActual.correo) || usuarioActual;

  function cargarDatosPerfil() {
    document.getElementById("nombre").value = usuario.nombre || "";
    document.getElementById("correo").value = usuario.correo || "";
    document.getElementById("fechaNacimiento").value = usuario.fechaNacimiento || "";
    document.getElementById("telefono").value = usuario.telefono || "";
    document.getElementById("direccion").value = usuario.direccion || "";
    document.getElementById("codigoPostal").value = usuario.codigoPostal || "";
    document.getElementById("pais").value = usuario.pais || "Perú";
    document.getElementById("distrito").value = usuario.distrito || "";
    document.getElementById("sexo").value = usuario.sexo || "";

    if (usuario.fotoPerfil) {
      document.getElementById("preview").src = usuario.fotoPerfil;
    }
  }

  cargarDatosPerfil();

  document.getElementById("imgInput").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = function () {
        document.getElementById("preview").src = reader.result;
        usuario.fotoPerfil = reader.result;
        guardarUsuarioActualizado(); // ✅ se usará la función insertada abajo
      };
      reader.readAsDataURL(file);
    }
  });

  window.habilitarEdicion = () => inputs.forEach(el => el.disabled = false);

  window.eliminarCuenta = function () {
    if (confirm("¿Seguro que deseas eliminar tu cuenta?")) {
      let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
      usuarios = usuarios.filter(u => u.correo !== usuario.correo);
      localStorage.setItem("usuarios", JSON.stringify(usuarios));
      localStorage.removeItem("usuarioActual");
      alert("Cuenta eliminada");
      window.location.href = "index.html";
    }
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    botonGuardar.disabled = true;
    botonGuardar.textContent = "Guardando... ⏳";

    const actualizado = {
      ...usuario,
      nombre: document.getElementById("nombre").value,
      correo: document.getElementById("correo").value,
      fechaNacimiento: document.getElementById("fechaNacimiento").value,
      telefono: document.getElementById("telefono").value,
      direccion: document.getElementById("direccion").value,
      codigoPostal: document.getElementById("codigoPostal").value,
      pais: document.getElementById("pais").value,
      distrito: document.getElementById("distrito").value,
      sexo: document.getElementById("sexo").value,
      fotoPerfil: usuario.fotoPerfil || ""
    };

    const index = usuarios.findIndex(u => u.correo === usuario.correo);
    if (index !== -1) usuarios[index] = actualizado;
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("usuarioActual", JSON.stringify(actualizado));

    mostrarToast("Cambios guardados correctamente");
    botonGuardar.textContent = "Guardado ✅";
    botonGuardar.disabled = false;
  });

  // 🔻 Funciones adicionales necesarias 🔻

  function guardarUsuarioActualizado() {
    const index = usuarios.findIndex(u => u.correo === usuario.correo);
    if (index !== -1) usuarios[index] = usuario;
    else usuarios.push(usuario);

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("usuarioActual", JSON.stringify(usuario));
  }

  function hayCambios() {
    return (
      document.getElementById("nombre").value !== (usuario.nombre || "") ||
      document.getElementById("correo").value !== (usuario.correo || "") ||
      document.getElementById("fechaNacimiento").value !== (usuario.fechaNacimiento || "") ||
      document.getElementById("telefono").value !== (usuario.telefono || "") ||
      document.getElementById("direccion").value !== (usuario.direccion || "") ||
      document.getElementById("codigoPostal").value !== (usuario.codigoPostal || "") ||
      document.getElementById("pais").value !== (usuario.pais || "Perú") ||
      document.getElementById("distrito").value !== (usuario.distrito || "") ||
      document.getElementById("sexo").value !== (usuario.sexo || "")
    );
  }

  function verificarCambios() {
    if (hayCambios()) {
      botonGuardar.disabled = false;
      botonGuardar.textContent = "💾 Guardar cambios";
    } else {
      botonGuardar.disabled = true;
      botonGuardar.textContent = "Guardar cambios";
    }
  }

  inputs.forEach(input => input.addEventListener("input", verificarCambios));
  verificarCambios(); // verificación inicial
}
});
