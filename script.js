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
      if (currentUser && currentUser.loggedIn) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
      } else {
        window.location.href = 'registro.html';
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

    const nombre = btn.dataset.nombre || producto.dataset.nombre || producto.querySelector("h4, p")?.textContent?.split("-")[0]?.trim();
    const precioText = btn.dataset.precio || producto.dataset.precio || producto.querySelector("p")?.textContent?.match(/\d+\.?\d*/);
    const precio = parseFloat(precioText);

    if (!nombre || isNaN(precio)) return;

    const existente = carritoItems.find(item => item.nombre === nombre);
    if (existente) {
      existente.cantidad++;
    } else {
      carritoItems.push({ nombre, precio, cantidad: 1 });
    }

    guardarCarrito();
    actualizarCarrito();
    mostrarToast(`${nombre} agregado al carrito`);
    if (carrito) carrito.classList.remove("oculto");
  }

  function toggleFavorito(e) {
    const btn = e.currentTarget;
    const producto = btn.closest(".producto");

    const nombre = btn.dataset.nombre || producto.dataset.nombre || producto.querySelector("h4, p")?.textContent?.split("-")[0]?.trim();
    const precioText = btn.dataset.precio || producto.dataset.precio || producto.querySelector("p")?.textContent?.match(/\d+\.?\d*/);
    const precio = parseFloat(precioText);

    if (!nombre || isNaN(precio)) return;

    const existente = favoritos.find(p => p.nombre === nombre);
    if (existente) {
      favoritos = favoritos.filter(p => p.nombre !== nombre);
      btn.classList.remove("favorito");
    } else {
      favoritos.push({ nombre, precio });
      btn.classList.add("favorito");
      mostrarToast(`${nombre} agregado a favoritos`);
      if (favoritosContenedor) favoritosContenedor.classList.remove("oculto");
    }

    guardarFavoritos();
    actualizarFavoritos();
  }

  function marcarFavoritosEnProductos() {
    document.querySelectorAll(".agregar-favorito").forEach(btn => {
      const producto = btn.closest(".producto");
      if (!producto) return;
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
    if (botonCarrito) {
      botonCarrito.addEventListener("click", e => {
        e.preventDefault();
        if (carrito) carrito.classList.toggle("oculto");
      });
    }

    if (cerrarCarrito) {
      cerrarCarrito.addEventListener("click", () => {
        if (carrito) carrito.classList.add("oculto");
      });
    }

    if (botonFavoritos) {
      botonFavoritos.addEventListener("click", e => {
        e.preventDefault();
        if (favoritosContenedor) favoritosContenedor.classList.toggle("oculto");
      });
    }

    if (cerrarFavoritos) {
      cerrarFavoritos.addEventListener("click", () => {
        if (favoritosContenedor) favoritosContenedor.classList.add("oculto");
      });
    }

    if (buscador) {
      buscador.addEventListener("input", () => {
        const texto = buscador.value.toLowerCase();
        document.querySelectorAll(".producto").forEach(producto => {
          const nombre = producto.dataset.nombre?.toLowerCase() || producto.querySelector("h4, p")?.textContent?.toLowerCase() || "";
          producto.style.display = nombre.includes(texto) ? "" : "none";
        });
      });
    }

    if (filtros.length > 0) {
      filtros.forEach(filtro => {
        filtro.addEventListener("change", aplicarFiltros);
      });
    }

    document.addEventListener("click", function (e) {
      if (!carrito?.contains(e.target) && !botonCarrito?.contains(e.target)) {
        carrito?.classList.add("oculto");
      }
      if (!favoritosContenedor?.contains(e.target) && !botonFavoritos?.contains(e.target)) {
        favoritosContenedor?.classList.add("oculto");
      }
    });
  }

  function aplicarFiltros() {
    const marcas = [...document.querySelectorAll('input[name="marca"]:checked')].map(el => el.value);
    const precios = [...document.querySelectorAll('input[name="precio"]:checked')].map(el => el.value);

    document.querySelectorAll(".producto").forEach(producto => {
      const marca = producto.dataset.marca;
      const precioText = producto.dataset.precio || producto.querySelector("p")?.textContent?.match(/\d+\.?\d*/);
      const precio = parseFloat(precioText);

      const pasaMarca = marcas.length === 0 || marcas.includes(marca);
      const pasaPrecio = precios.length === 0 ||
        (precios.includes("menor-20") && precio < 20) ||
        (precios.includes("mayor-20") && precio >= 20);

      producto.style.display = (pasaMarca && pasaPrecio) ? "" : "none";
    });
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

    carritoLista.querySelectorAll(".cantidad-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const index = parseInt(this.dataset.index);
        const change = parseInt(this.dataset.change);
        cambiarCantidad(index, change);
      });
    });

    carritoLista.querySelectorAll(".eliminar-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const index = parseInt(this.dataset.index);
        eliminarItem(index);
      });
    });

    const total = carritoItems.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    totalElemento.textContent = `Total: S/ ${total.toFixed(2)}`;
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

    favoritosLista.querySelectorAll(".agregar-favorito-carrito").forEach(btn => {
      btn.addEventListener("click", function () {
        const index = parseInt(this.dataset.index);
        agregarFavoritoAlCarrito(index);
      });
    });

    favoritosLista.querySelectorAll(".eliminar-favorito-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const index = parseInt(this.dataset.index);
        eliminarFavorito(index);
      });
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
    if (carrito) carrito.classList.remove("oculto");
  }

  function eliminarFavorito(index) {
    favoritos.splice(index, 1);
    guardarFavoritos();
    actualizarFavoritos();
    marcarFavoritosEnProductos();
  }

  function configurarLogin() {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const pinContainer = document.getElementById("pin-container");
        const pinInputs = document.querySelectorAll(".pin-digit");
        const pin = Array.from(pinInputs).map(input => input.value).join('');

        if (email === "luciamoranaragon@gmail.com" && password === "Camila1311BB") {
          pinContainer.style.display = "block";
          mostrarToast("Por favor ingrese el PIN de administrador");
          return;
        }

        const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        const usuario = usuarios.find(user => user.email === email && user.password === password);

        if (usuario) {
          localStorage.setItem("usuarioActual", JSON.stringify({ ...usuario, loggedIn: true }));
          mostrarToast("Inicio de sesión exitoso");
          window.location.href = "index.html";
        } else {
          mostrarToast("Correo o contraseña incorrectos");
        }

        if (pin === "1234") {
          window.location.href = "admin.html";
        } else if (pin.length === 4) {
          mostrarToast("PIN incorrecto");
        }
      });
    }
  }

  // 🍩 NOTIFICACIÓN TOAST
  function mostrarToast(mensaje) {
    let toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("show");
    }, 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function configurarPerfil() {
  const form = document.getElementById("formPerfil");
  if (!form) return; // ⛔ Salir si no es la página de perfil

  const inputs = form.querySelectorAll("input, select");
  const botonGuardar = document.querySelector(".boton-guardar");

  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  let usuarioActual = JSON.parse(localStorage.getItem("usuarioActual")) || {};
  let usuario = usuarios.find(u => u.correo === usuarioActual.correo) || usuarioActual;

  function cargarDatos() {
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

  cargarDatos();

  document.getElementById("imgInput").addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = function() {
        document.getElementById("preview").src = reader.result;
        usuario.fotoPerfil = reader.result;
        guardarUsuarioActualizado();
      };
      reader.readAsDataURL(file);
    }
  });

  function habilitarEdicion() {
    inputs.forEach(el => el.disabled = false);
  }

  window.habilitarEdicion = habilitarEdicion;

  window.eliminarCuenta = function() {
    if (confirm("¿Seguro que deseas eliminar tu cuenta?")) {
      let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
      usuarios = usuarios.filter(u => u.correo !== usuario.correo);
      localStorage.setItem("usuarios", JSON.stringify(usuarios));
      localStorage.removeItem("usuarioActual");
      alert("Cuenta eliminada");
      window.location.href = "index.html";
    }
  };

  form.addEventListener("submit", function(e) {
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
      loggedIn: true
    };

    const index = usuarios.findIndex(u => u.correo === usuario.correo);
    if (index !== -1) usuarios[index] = actualizado;
    else usuarios.push(actualizado);

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("usuarioActual", JSON.stringify(actualizado));

    mostrarToast("✅ Cambios guardados correctamente.");
    inputs.forEach(el => el.disabled = true);
    verificarCambios();

    botonGuardar.textContent = "Guardado ✅";
    setTimeout(() => {
      botonGuardar.textContent = "Guardar cambios";
    }, 2000);
  });

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
     

function guardarUsuarioActualizado() {
  const index = usuarios.findIndex(u => u.correo === usuario.correo);
  if (index !== -1) usuarios[index] = usuario;
  else usuarios.push(usuario);

  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  localStorage.setItem("usuarioActual", JSON.stringify(usuario));
}

    inputs.forEach(input => {
    input.addEventListener("input", verificarCambios);
  });

    verificarCambios();
  }

}

function procederAlPago() {
    guardarCarrito(); // Asegúrate de que el carrito esté guardado
    window.location.href = 'pago.html'; // Redirigir a la página de pago
});
