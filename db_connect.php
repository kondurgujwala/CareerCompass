<?php
error_reporting(0); // Suppress warnings that break JSON
ini_set('display_errors', 0);

$host = "localhost";
$user = "root";
$password = "";
$database = "careercompass";
$port = 3307;

$conn = mysqli_connect($host, $user, $password, $database, $port);

if (!$conn) {
    die(json_encode([
        "success" => false,
        "error" => "Database connection failed"
    ]));
}

// Fixed CORS headers
header("Access-Control-Allow-Origin: http://localhost");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");
?>