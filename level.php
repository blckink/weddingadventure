<?php
header('Content-Type: application/javascript');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');

$levelPath = __DIR__ . '/../level/level.json';
if (file_exists($levelPath)) {
    $json = json_decode(file_get_contents($levelPath), true);
    if ($json) {
        echo 'const collisions = ' . json_encode($json['collisions']) . ';';
        echo 'const l_Gems = ' . json_encode($json['gems']) . ';';
        echo 'const l_Enemies = ' . json_encode($json['enemies']) . ';';
        echo 'const l_Blockers = ' . json_encode($json['blockers']) . ';';
        echo 'const l_Deaths = ' . json_encode($json['deaths']) . ';';
        echo 'const l_Illusions = ' . json_encode($json['illusions']) . ';';
        exit;
    }
}

$base = __DIR__ . '/data/';
readfile($base . 'collisions.js');
readfile($base . 'l_Gems.js');
readfile($base . 'l_Enemies.js');
readfile($base . 'l_Blockers.js');
readfile($base . 'l_Deaths.js');
readfile($base . 'l_Illusions.js');
?>
