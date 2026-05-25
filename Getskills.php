<?php
ob_start();

require 'db_connect.php';
session_start();
 
if (!isset($_SESSION['user_id'])) {
    ob_clean();
    echo json_encode(["error" => "Unauthorized. Please login."]);
    exit();
}
 
$stmt = mysqli_prepare($conn, "SELECT skill_id, skill_name FROM skills ORDER BY skill_name");
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
 
$skills = [];
while ($row = mysqli_fetch_assoc($result)) {
    $skills[] = $row;
}
 
ob_clean();
    echo json_encode([
    "success" => true,
    "skills"  => $skills
]);
?>