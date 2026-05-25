<?php
ob_start();

require 'db_connect.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    ob_clean();
    echo json_encode([
        "success" => false,
        "message" => "Unauthorized"
    ]);
    exit();
}

$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;

$query = "
    SELECT question_id, question_text, option_a, option_b, option_c, option_d
    FROM questions
    ORDER BY RAND()
    LIMIT ?
";

$stmt = $conn->prepare($query);

if (!$stmt) {
    ob_clean();
    echo json_encode([
        "success" => false,
        "message" => "Query failed"
    ]);
    exit();
}

$stmt->bind_param("i", $limit);
$stmt->execute();

$result = $stmt->get_result();

$questions = [];

while ($row = $result->fetch_assoc()) {
    $questions[] = $row;
}

ob_clean();
    echo json_encode([
    "success" => true,
    "questions" => $questions
]);
?>