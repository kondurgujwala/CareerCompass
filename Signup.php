<?php
ob_start();

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

require 'db_connect.php';

$name     = $_POST['name'] ?? '';
$email    = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';
$cgpa     = $_POST['cgpa'] ?? 0;

if (!$name || !$email || !$password) {
    ob_clean();
    echo json_encode(["success" => false, "message" => "All fields required"]);
    exit();
}

$check = $conn->prepare("SELECT user_id FROM users WHERE email=?");
$check->bind_param("s", $email);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    ob_clean();
    echo json_encode(["success" => false, "message" => "Email already exists"]);
    exit();
}

$hashed = password_hash($password, PASSWORD_BCRYPT);

$stmt = $conn->prepare("INSERT INTO users (name, email, password, cgpa) VALUES (?, ?, ?, ?)");
$stmt->bind_param("sssd", $name, $email, $hashed, $cgpa);

if ($stmt->execute()) {
    ob_clean();
    echo json_encode([
        "success" => true,
        "message" => "Signup successful",
        "redirect" => "login.html"
    ]);
} else {
    ob_clean();
    echo json_encode([
        "success" => false,
        "message" => $stmt->error
    ]);
}
?>