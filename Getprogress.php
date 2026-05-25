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
 
// All attempts ordered by date (for progress chart)
$attempts_stmt = mysqli_prepare($conn, "
    SELECT attempt_id,
           score,
           total,
           ROUND((score/total)*100, 2) AS percentage,
           attempt_date
    FROM test_attempts
    WHERE user_id = ?
    ORDER BY attempt_date ASC
");
mysqli_stmt_bind_param($attempts_stmt, "i", $user_id);
mysqli_stmt_execute($attempts_stmt);
$attempts_result = mysqli_stmt_get_result($attempts_stmt);
 
$attempts = [];
while ($row = mysqli_fetch_assoc($attempts_result)) {
    $attempts[] = $row;
}
 
// Skill progress — correct vs total per skill
$skill_stmt = mysqli_prepare($conn, "
    SELECT s.skill_name,
           SUM(ua.is_correct)  AS correct,
           COUNT(*)            AS total,
           ROUND(SUM(ua.is_correct) / COUNT(*) * 100, 1) AS percentage
    FROM user_answers ua
    JOIN questions q ON ua.question_id = q.question_id
    JOIN skills s    ON q.skill_id = s.skill_id
    WHERE ua.user_id = ?
    GROUP BY s.skill_id, s.skill_name
    ORDER BY s.skill_name
");
mysqli_stmt_bind_param($skill_stmt, "i", $user_id);
mysqli_stmt_execute($skill_stmt);
$skill_result = mysqli_stmt_get_result($skill_stmt);
 
$skill_progress = [];
while ($row = mysqli_fetch_assoc($skill_result)) {
    $skill_progress[] = $row;
}
 
// Difficulty breakdown
$diff_stmt = mysqli_prepare($conn, "
    SELECT q.difficulty,
           SUM(ua.is_correct) AS correct,
           COUNT(*)           AS total,
           ROUND(SUM(ua.is_correct) / COUNT(*) * 100, 1) AS percentage
    FROM user_answers ua
    JOIN questions q ON ua.question_id = q.question_id
    WHERE ua.user_id = ?
    GROUP BY q.difficulty
");
mysqli_stmt_bind_param($diff_stmt, "i", $user_id);
mysqli_stmt_execute($diff_stmt);
$diff_result = mysqli_stmt_get_result($diff_stmt);
 
$difficulty_breakdown = [];
while ($row = mysqli_fetch_assoc($diff_result)) {
    $difficulty_breakdown[] = $row;
}
 
ob_clean();
    echo json_encode([
    "success"              => true,
    "attempts"             => $attempts,
    "skill_progress"       => $skill_progress,
    "difficulty_breakdown" => $difficulty_breakdown
]);
?>