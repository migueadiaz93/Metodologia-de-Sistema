document.addEventListener('DOMContentLoaded', function () {
    const notaForm = document.getElementById('notaForm');
    const listaNotas = document.getElementById('listaNotas');
    let modoEdicion = false;
    let idNotaEditando = null;

    // Cargar notas al inicio
    cargarNotas();

    // Manejar el formulario de notas
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

    // Cargar Notas --
    function cargarNotas() {
        fetch('notas.php?accion=listar')
            .then(response => response.json())
            .then(data => {
                listaNotas.innerHTML = '';
    
                // Ordenar por relevancia: Muy importante > Importante > Poco importante
                const prioridad = {
                    "Muy importante": 3,
                    "Importante": 2,
                    "Poco importante": 1
                };
    
                const notasOrdenadas = data.notas.sort((a, b) => {
                    return prioridad[b.relevancia] - prioridad[a.relevancia];
                });
    
                notasOrdenadas.forEach(nota => {
                    const notaDiv = document.createElement('div');
                    notaDiv.className = `nota ${nota.color || 'gris'}`;
                    notaDiv.dataset.id = nota.id;
    
                    const titulo = document.createElement('h3');
                    titulo.textContent = `${nota.titulo} (${nota.relevancia})`;
    
                    const contenido = document.createElement('p');
                    contenido.textContent = nota.contenido;
    
                    const btnEliminar = document.createElement('button');
                    btnEliminar.textContent = 'Eliminar';
                    btnEliminar.className = 'eliminar';
                    btnEliminar.addEventListener('click', function () {
                        eliminarNota(nota.id);
                    });
    
                    const btnEditar = document.createElement('button');
                    btnEditar.textContent = 'Editar';
                    btnEditar.className = 'editar';
                    btnEditar.addEventListener('click', function () {
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
        document.getElementById('relevancia').value = nota.relevancia;
        modoEdicion = true;
        idNotaEditando = nota.id;
    }
});





