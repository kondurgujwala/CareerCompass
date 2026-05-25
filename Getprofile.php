<?php
ob_start();

require 'db_connect.php';
session_start();
 
if (!isset($_SESSION['user_id'])) {
    ob_clean();
    echo json_encode(["error" => "Unauthorized. Please login."]);
    exit();
}
 
$user_id = $_SESSION['user_id'];
 
// Get user info
$stmt = mysqli_prepare($conn, "SELECT user_id, name, email, cgpa, created_at FROM users WHERE user_id = ?");
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$user   = mysqli_fetch_assoc($result);
 
if (!$user) {
    ob_clean();
    echo json_encode(["error" => "User not found"]);
    exit();
}
 
// Get total attempts and average score
$stats_stmt = mysqli_prepare($conn, "
    SELECT COUNT(*) AS total_attempts,
           MAX(ROUND((score/total)*100, 2)) AS best_score,
           ROUND(AVG((score/total)*100), 2) AS avg_score
    FROM test_attempts
    WHERE user_id = ?
");
mysqli_stmt_bind_param($stats_stmt, "i", $user_id);
mysqli_stmt_execute($stats_stmt);
$stats_result = mysqli_stmt_get_result($stats_stmt);
$stats        = mysqli_fetch_assoc($stats_result);
 
ob_clean();
    echo json_encode([
    "success" => true,
    "user"    => $user,
    "stats"   => $stats
]);
?>
 