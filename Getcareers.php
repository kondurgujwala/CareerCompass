<?php
ob_start();

header('Content-Type: application/json');

require 'db_connect.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    ob_clean();
    echo json_encode(["error"=>"Unauthorized"]);
    exit();
}

$user_id = $_SESSION['user_id'];

$query = "
SELECT 
    c.career_id,
    c.career_name,
    c.description,
    c.required_skills
FROM careers c
ORDER BY c.career_id DESC
";

$result = mysqli_query($conn, $query);

$careers = [];

while ($row = mysqli_fetch_assoc($result)) {
    $careers[] = $row;
}

ob_clean();
    echo json_encode([
    "success" => true,
    "careers" => $careers
]);
?>