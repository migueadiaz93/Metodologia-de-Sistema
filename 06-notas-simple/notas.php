<?php
session_start();

if (!isset($_SESSION['notas'])) {
    $_SESSION['notas'] = [];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $accion = $_POST['accion'];

    if ($accion === 'agregar') {
        $nuevaNota = [
            'id' => uniqid(),
            'titulo' => $_POST['titulo'],
            'contenido' => $_POST['contenido']
        ];
        $_SESSION['notas'][] = $nuevaNota;
        echo json_encode(['exito' => true]);
    }

    if ($accion === 'eliminar') {
        $id = $_POST['id'];
        $_SESSION['notas'] = array_filter($_SESSION['notas'], function($nota) use ($id) {
            return $nota['id'] !== $id;
        });
        echo json_encode(['exito' => true]);
    }

    if ($accion === 'editar') {
        $id = $_POST['id'];
        $titulo = $_POST['titulo'];
        $contenido = $_POST['contenido'];

        foreach ($_SESSION['notas'] as &$nota) {
            if ($nota['id'] === $id) {
                $nota['titulo'] = $titulo;
                $nota['contenido'] = $contenido;
                break;
            }
        }
        echo json_encode(['exito' => true]);
    }

    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($_GET['accion'] === 'listar') {
        echo json_encode(['notas' => array_values($_SESSION['notas'])]);
    }
}
?>
