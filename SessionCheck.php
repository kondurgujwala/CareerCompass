<?php
ob_start();

require 'db_connect.php';
session_start();
 
if (!isset($_SESSION['user_id'])) {
    ob_clean();
    echo json_encode(["logged_in" => false, "message" => "Not logged in"]);
    exit();
}
 
$user_id = $_SESSION['user_id'];
 
$stmt = mysqli_prepare($conn, "SELECT user_id, name, email, cgpa FROM users WHERE user_id = ?");
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$user   = mysqli_fetch_assoc($result);
 
if (!$user) {
    ob_clean();
    echo json_encode(["logged_in" => false, "message" => "User not found"]);
    exit();
}
 
ob_clean();
    echo json_encode([
    "logged_in" => true,
    "user" => $user
]);
?>