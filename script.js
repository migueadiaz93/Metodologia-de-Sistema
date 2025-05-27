document.addEventListener('DOMContentLoaded', function () {
    const notaForm = document.getElementById('notaForm');
    const listaNotas = document.getElementById('listaNotas');
    const btnOrdenar = document.getElementById('ordenar');
    const cambiarVistaBtn = document.getElementById('cambiarVista');

    let modoEdicion = false;
    let idNotaEditando = null;
    let ordenAscendente = true;
    let notasData = [];

    // Iniciar con vista de lista
    listaNotas.classList.add("list-view");

    // Botón para cambiar vista
    cambiarVistaBtn.addEventListener("click", function () {
        if (listaNotas.classList.contains("list-view")) {
            listaNotas.classList.remove("list-view");
            listaNotas.classList.add("grid-view");
        } else {
            listaNotas.classList.remove("grid-view");
            listaNotas.classList.add("list-view");
        }
    });

    // Mostrar notas
    function mostrarNotas() {
        listaNotas.innerHTML = '';
        notasData.forEach(nota => {
            // Asignar color según relevancia si no está definido
            let colorClase = nota.color;
            if (!colorClase) {
                if (nota.relevancia === 'Muy importante') colorClase = 'rojo';
                else if (nota.relevancia === 'Importante') colorClase = 'amarillo';
                else if (nota.relevancia === 'Poco importante') colorClase = 'verde';
                else colorClase = 'gris'; // color por defecto
            }

            const notaDiv = document.createElement('div');
            notaDiv.className = `nota ${colorClase}`;
            notaDiv.dataset.id = nota.id;
            notaDiv.dataset.relevancia = nota.relevancia;

            const titulo = document.createElement('h3');
            titulo.textContent = `${nota.titulo} (${nota.relevancia})`;

            const contenido = document.createElement('p');
            contenido.textContent = nota.contenido;

            const btnEliminar = document.createElement('button');
            btnEliminar.textContent = 'Borrar';
            btnEliminar.className = 'eliminar';
            btnEliminar.addEventListener('click', () => {
                if (confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
                    // Efecto fade out
                    notaDiv.style.transition = 'transform 0.5s, opacity 0.5s';
                    notaDiv.style.transform = 'scale(0)';
                    notaDiv.style.opacity = '0';


                    setTimeout(() => {
                        eliminarNota(nota.id);
                    }, 500);
                }
            });

            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.className = 'editar';
            btnEditar.addEventListener('click', () => {
                prepararEdicion(nota);

                const inputTitulo = document.getElementById('titulo');
                inputTitulo.scrollIntoView({ behavior: 'smooth' });
                inputTitulo.focus();
            });

            notaDiv.appendChild(titulo);
            notaDiv.appendChild(contenido);
            notaDiv.appendChild(btnEliminar);
            notaDiv.appendChild(btnEditar);
            listaNotas.appendChild(notaDiv);
        });
    }

    function cargarNotas() {
        fetch('notas.php?accion=listar')
            .then(response => response.json())
            .then(data => {
                notasData = data.notas || [];
                mostrarNotas();
            });
    }

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

    function prepararEdicion(nota) {
        document.getElementById('titulo').value = nota.titulo;
        document.getElementById('contenido').value = nota.contenido;
        document.getElementById('relevancia').value = nota.relevancia;
        modoEdicion = true;
        idNotaEditando = nota.id;
    }

    btnOrdenar.addEventListener('click', function () {
        const prioridad = { "Muy importante": 1, "Importante": 2, "Poco importante": 3 };
        notasData.sort((a, b) => {
            const prioridadA = prioridad[a.relevancia];
            const prioridadB = prioridad[b.relevancia];
            return ordenAscendente ? prioridadA - prioridadB : prioridadB - prioridadA;
        });
        ordenAscendente = !ordenAscendente;
        mostrarNotas();
    });

    cargarNotas();

    notaForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const titulo = document.getElementById('titulo').value.trim();
        const contenido = document.getElementById('contenido').value.trim();
        const relevancia = document.getElementById('relevancia').value.trim();
        let color = '';

        if (relevancia === 'Muy importante') color = 'rojo';
        else if (relevancia === 'Importante') color = 'amarillo';
        else if (relevancia === 'Poco importante') color = 'verde';

        if (titulo === '' || contenido === '' || relevancia === '') return;

        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('contenido', contenido);
        formData.append('relevancia', relevancia);
        formData.append('color', color);

        const notaScrollId = idNotaEditando;

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

                    setTimeout(() => {
                        const notaElement = document.querySelector(`[data-id="${notaScrollId}"]`);
                        if (notaElement) {
                            notaElement.scrollIntoView({ behavior: 'smooth' });
                            notaElement.classList.add('resaltado');

                            setTimeout(() => {
                                notaElement.classList.remove('resaltado');
                            }, 2000);
                        }
                    }, 300);
                }
            });
    });
});
