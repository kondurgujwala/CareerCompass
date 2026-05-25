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

$statsQuery = "
SELECT 
    COUNT(*) AS total_attempts,
    IFNULL(ROUND(AVG(percentage),2),0) AS avg_score
FROM test_attempts
WHERE user_id = ?
";

$stmt = mysqli_prepare($conn, $statsQuery);
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$stats = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

$recentQuery = "
SELECT 
    attempt_id,
    IFNULL(percentage,0) AS percentage,
    created_at
FROM test_attempts
WHERE user_id = ?
ORDER BY created_at DESC
LIMIT 5
";

$stmt = mysqli_prepare($conn, $recentQuery);
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$res = mysqli_stmt_get_result($stmt);

$recent_attempts = [];

while ($row = mysqli_fetch_assoc($res)) {
    $recent_attempts[] = $row;
}

mysqli_stmt_close($stmt);

ob_clean();
    echo json_encode([
    "stats" => $stats,
    "recent_attempts" => $recent_attempts
]);
?>