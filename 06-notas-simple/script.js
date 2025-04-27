document.addEventListener('DOMContentLoaded', function() {
  const notaForm = document.getElementById('notaForm');
  const listaNotas = document.getElementById('listaNotas');
  
  let modoEdicion = false;
  let idNotaEditando = null;

  // Cargar notas al inicio
  cargarNotas();

  // Manejar formulario
  notaForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const titulo = document.getElementById('titulo').value.trim();
    const contenido = document.getElementById('contenido').value.trim();

    if (titulo === '' || contenido === '') return;

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('contenido', contenido);

    if (modoEdicion) {
      formData.append('accion', 'editar');
      formData.append('id', idNotaEditando);
    } else {
      formData.append('accion', 'agregar');
    }

    fetch('notas.php', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.exito) {
        notaForm.reset();
        modoEdicion = false;
        idNotaEditando = null;
        cargarNotas();
      }
    });
  });

  // Cargar notas desde el servidor
  function cargarNotas() {
    fetch('notas.php?accion=listar')
      .then(response => response.json())
      .then(data => {
        listaNotas.innerHTML = '';

        data.notas.forEach(nota => {
          const notaDiv = document.createElement('div');
          notaDiv.className = 'nota';
          notaDiv.dataset.id = nota.id;

          const titulo = document.createElement('h3');
          titulo.textContent = nota.titulo;

          const contenido = document.createElement('p');
          contenido.textContent = nota.contenido;

          const btnEliminar = document.createElement('button');
          btnEliminar.textContent = 'Eliminar';
          btnEliminar.className = 'eliminar';
          btnEliminar.addEventListener('click', function() {
            eliminarNota(nota.id);
          });

          const btnEditar = document.createElement('button');
          btnEditar.textContent = 'Editar';
          btnEditar.className = 'editar';
          btnEditar.addEventListener('click', function() {
            prepararEdicion(nota);
          });

          notaDiv.appendChild(titulo);
          notaDiv.appendChild(contenido);
          notaDiv.appendChild(btnEliminar);
          notaDiv.appendChild(btnEditar);
          listaNotas.appendChild(notaDiv);
        });
      });
  }

  // Eliminar nota
  function eliminarNota(id) {
    const formData = new FormData();
    formData.append('accion', 'eliminar');
    formData.append('id', id);

    fetch('notas.php', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.exito) {
        cargarNotas();
      }
    });
  }

  // Preparar edición de nota
  function prepararEdicion(nota) {
    document.getElementById('titulo').value = nota.titulo;
    document.getElementById('contenido').value = nota.contenido;
    modoEdicion = true;
    idNotaEditando = nota.id;
  }
});
