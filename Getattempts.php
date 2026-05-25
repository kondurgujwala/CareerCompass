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
 
$stmt = mysqli_prepare($conn, "
    SELECT attempt_id, score, total,
           ROUND((score/total)*100, 2) AS percentage,
           attempt_date
    FROM test_attempts
    WHERE user_id = ?
    ORDER BY attempt_date DESC
");
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
 
$attempts = [];
while ($row = mysqli_fetch_assoc($result)) {
    $attempts[] = $row;
}
 
ob_clean();
    echo json_encode([
    "success"  => true,
    "total"    => count($attempts),
    "attempts" => $attempts
]);
?>