<?php
header('Content-Type: text/plain');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    if (isset($data['collisions']) && isset($data['gems'])) {
        $collisions = 'const collisions = ' . json_encode($data['collisions']) . ';';
        $gems = 'const l_Gems = ' . json_encode($data['gems']) . ';';
        file_put_contents(__DIR__ . '/data/collisions.js', $collisions);
        file_put_contents(__DIR__ . '/data/l_Gems.js', $gems);
        echo 'Saved';
    } else {
        http_response_code(400);
        echo 'Invalid data';
    }
} else {
    http_response_code(405);
    echo 'Method not allowed';
}
?>
