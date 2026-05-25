<?php
ob_start();

require 'db_connect.php';
session_start();
 
if (!isset($_SESSION['user_id'])) {
    ob_clean();
    echo json_encode(["error" => "Unauthorized. Please login."]);
    exit();
}
 
$user_id    = $_SESSION['user_id'];
$attempt_id = isset($_GET['attempt_id']) ? intval($_GET['attempt_id']) : null;
 
if (!$attempt_id) {
    ob_clean();
    echo json_encode(["error" => "attempt_id is required"]);
    exit();
}
 
// Verify attempt belongs to this user
$check = mysqli_prepare($conn, "
    SELECT * FROM test_attempts WHERE attempt_id = ? AND user_id = ?
");
mysqli_stmt_bind_param($check, "ii", $attempt_id, $user_id);
mysqli_stmt_execute($check);
$attempt = mysqli_fetch_assoc(mysqli_stmt_get_result($check));
 
if (!$attempt) {
    ob_clean();
    echo json_encode(["error" => "Attempt not found"]);
    exit();
}
 
// Get detailed answers with question info
$detail_stmt = mysqli_prepare($conn, "
    SELECT ua.question_id,
           q.question_text,
           q.option_a, q.option_b, q.option_c, q.option_d,
           ua.selected_option,
           q.correct_answer,
           ua.is_correct,
           q.difficulty,
           s.skill_name
    FROM user_answers ua
    JOIN questions q ON ua.question_id = q.question_id
    JOIN skills s    ON q.skill_id = s.skill_id
    WHERE ua.attempt_id = ? AND ua.user_id = ?
");
mysqli_stmt_bind_param($detail_stmt, "ii", $attempt_id, $user_id);
mysqli_stmt_execute($detail_stmt);
$detail_result = mysqli_stmt_get_result($detail_stmt);
 
$details = [];
while ($row = mysqli_fetch_assoc($detail_result)) {
    $details[] = $row;
}
 
$percentage = round(($attempt['score'] / $attempt['total']) * 100, 2);
 
ob_clean();
    echo json_encode([
    "success"    => true,
    "attempt"    => $attempt,
    "percentage" => $percentage,
    "details"    => $details
]);
?>