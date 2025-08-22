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
        $collisions = 'const collisions = ' . json_encode($data['collisions']) . ';';
        $gems = 'const l_Gems = ' . json_encode($data['gems']) . ';';
        $enemies = 'const l_Enemies = ' . json_encode($data['enemies']) . ';';
        $blockers = 'const l_Blockers = ' . json_encode($data['blockers']) . ';';
        $deaths = 'const l_Deaths = ' . json_encode($data['deaths']) . ';';
        $illusions = 'const l_Illusions = ' . json_encode($data['illusions']) . ';';
        file_put_contents(__DIR__ . '/data/collisions.js', $collisions);
        file_put_contents(__DIR__ . '/data/l_Gems.js', $gems);
        file_put_contents(__DIR__ . '/data/l_Enemies.js', $enemies);
        file_put_contents(__DIR__ . '/data/l_Blockers.js', $blockers);
        file_put_contents(__DIR__ . '/data/l_Deaths.js', $deaths);
        file_put_contents(__DIR__ . '/data/l_Illusions.js', $illusions);
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
