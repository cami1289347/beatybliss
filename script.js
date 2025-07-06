ucto").forEach(producto => {
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
  // Mostrar contenedor del PIN si aún no está visible
  if (pinContainer.style.display !== "block") {
    pinContainer.style.display = "block";
    mostrarToast("Por favor ingrese el PIN de administrador");
    return; // 👈 Salir para esperar que el usuario ingrese el PIN
  }

  // Validar PIN solo si ya se mostró el campo y el usuario lo ingresó
  if (pin === admin.pin) {
    localStorage.setItem("usuarioActual", JSON.stringify({ ...admin, loggedIn: true, admin: true }));
    window.location.href = "admin.html";
  } else if (pin.length === 4) {
    mostrarToast("PIN incorrecto");
  } else {
    mostrarToast("Por favor completa el PIN");
  }

  return; // 👈 Evitar que siga con validación de usuario común
}
if (pin === admin.pin) {
    localStorage.setItem("usuarioActual", JSON.stringify({ ...admin, loggedIn: true, admin: true }));
    mostrarToast("Bienvenido administrador");
    window.location.href = "admin.html";
  } else {
    mostrarToast("PIN incorrecto");
  }

  return;
}


    // Usuarios normales
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuario = usuarios.find(user => user.email === email && user.password === password);

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
          guardarUsuarioActualizado();
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
  }
});
