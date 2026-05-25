<?php
// Start output buffering to catch any unexpected PHP warnings or echo statements
ob_start();
session_start();

require 'db_connect.php';

// Clear any buffered output so far
ob_clean();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method"
    ]);
    exit();
}

$email    = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

if (!$email || !$password) {
    echo json_encode([
        "success" => false,
        "message" => "Email and password required"
    ]);
    exit();
}

$stmt = $conn->prepare("SELECT user_id, name, password FROM users WHERE email=?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "User not found"
    ]);
    exit();
}

$user = $result->fetch_assoc();

if (!password_verify($password, $user['password'])) {
    echo json_encode([
        "success" => false,
        "message" => "Incorrect password"
    ]);
    exit();
}

// SUCCESS LOGIN
$_SESSION['user_id'] = $user['user_id'];
$_SESSION['name'] = $user['name'];

echo json_encode([
    "success" => true,
    "message" => "Login successful",
    "redirect" => "dashboard.html"
]);
?>