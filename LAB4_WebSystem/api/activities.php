<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$jsonFile = __DIR__ . '/data.json';

if (file_exists($jsonFile)) {
    echo file_get_contents($jsonFile);
} else {
    http_response_code(404);
    echo json_encode(["error" => "data.json missing"]);
}
?>