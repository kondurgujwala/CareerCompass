<?php
ob_start();

session_start();
 
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
 
session_unset();
session_destroy();
 
ob_clean();
    echo json_encode([
    "success" => true,
    "message" => "Logged out successfully"
]);
?>