<?php
$archivo = 'notas.json';

if (!file_exists($archivo)) {
    file_put_contents($archivo, json_encode([]));
}

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

switch ($accion) {
    case 'agregar':
        $id = uniqid();
        $titulo = $_POST['titulo'];
        $contenido = $_POST['contenido'];
        $relevancia = $_POST['relevancia'];
        $color = $_POST['color'];

        $nuevaNota = [
            'id' => $id,
            'titulo' => $titulo,
            'contenido' => $contenido,
            'relevancia' => $relevancia,
            'color' => $color
        ];

        $notas = json_decode(file_get_contents($archivo), true);
        $notas[] = $nuevaNota;
        file_put_contents($archivo, json_encode($notas, JSON_PRETTY_PRINT));

        echo json_encode(['exito' => true]);
        break;

    case 'listar':
        $notas = json_decode(file_get_contents($archivo), true);
        echo json_encode(['notas' => $notas]);
        break;

    case 'eliminar':
        $id = $_POST['id'];
        $notas = json_decode(file_get_contents($archivo), true);
        $notas = array_filter($notas, function ($nota) use ($id) {
            return $nota['id'] !== $id;
        });
        file_put_contents($archivo, json_encode(array_values($notas), JSON_PRETTY_PRINT));
        echo json_encode(['exito' => true]);
        break;

    case 'editar':
        $id = $_POST['id'];
        $titulo = $_POST['titulo'];
        $contenido = $_POST['contenido'];
        $relevancia = $_POST['relevancia'];
        $color = $_POST['color'];

        $notas = json_decode(file_get_contents($archivo), true);
        foreach ($notas as &$nota) {
            if ($nota['id'] === $id) {
                $nota['titulo'] = $titulo;
                $nota['contenido'] = $contenido;
                $nota['relevancia'] = $relevancia;
                $nota['color'] = $color;
                break;
            }
        }
        file_put_contents($archivo, json_encode($notas, JSON_PRETTY_PRINT));
        echo json_encode(['exito' => true]);
        break;

    default:
        echo json_encode(['exito' => false, 'mensaje' => 'Acción no válida']);
}





