<?php
ob_start();

require 'db_connect.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    ob_clean();
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("
    SELECT s.skill_name,
           us.proficiency
    FROM user_skills us
    JOIN skills s ON us.skill_id = s.skill_id
    WHERE us.user_id = ?
");

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$skill_gap = [];

while ($row = $result->fetch_assoc()) {

    $pct = $row['proficiency'];

    $status = $pct >= 80 ? 'strong' : ($pct >= 50 ? 'average' : 'weak');

    $skill_gap[] = [
        "skill_name" => $row['skill_name'],
        "percentage" => $pct,
        "status" => $status
    ];
}

ob_clean();
    echo json_encode([
    "success" => true,
    "skill_gap" => $skill_gap
]);
?>