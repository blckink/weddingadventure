<?php
header('Content-Type: text/plain');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    if (
        isset($data['collisions']) &&
        isset($data['gems']) &&
        isset($data['enemies']) &&
        isset($data['blockers']) &&
        isset($data['deaths']) &&
        isset($data['illusions'])
    ) {
        $levelDir = __DIR__ . '/../level';
        if (!is_dir($levelDir)) {
            mkdir($levelDir, 0755, true);
        }
        $saved = file_put_contents(
            $levelDir . '/level.json',
            json_encode($data)
        );
        if ($saved === false) {
            http_response_code(500);
            echo 'Save failed';
        } else {
            echo 'Saved';
        }
    } else {
        http_response_code(400);
        echo 'Invalid data';
    }
} else {
    http_response_code(405);
    echo 'Method not allowed';
}
?>
