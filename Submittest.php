<?php
ob_start();

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

require 'db_connect.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    ob_clean();
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['answers']) || !isset($data['questions'])) {
    ob_clean();
    echo json_encode(["success" => false, "message" => "Invalid data"]);
    exit();
}

$answers   = $data['answers'];
$questions = $data['questions'];
$user_id   = $_SESSION['user_id'];

$score = 0;
$total = count($questions);
$results = [];

foreach ($questions as $index => $q) {

    $qid      = intval($q['question_id']);
    $selected = $answers[$index] ?? null;

    $stmt = $conn->prepare("SELECT correct_answer, skill_id FROM questions WHERE question_id = ?");
    $stmt->bind_param("i", $qid);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$row) continue;

    $correct   = $row['correct_answer'];
    $skill_id  = $row['skill_id'];
    $is_correct = ($selected === $correct) ? 1 : 0;

    if ($is_correct) $score++;

    $results[] = [
        "qid" => $qid,
        "selected" => $selected,
        "correct" => $correct,
        "is_correct" => $is_correct,
        "skill_id" => $skill_id
    ];
}

$percentage = $total > 0 ? round(($score / $total) * 100, 2) : 0;

$attempt_stmt = $conn->prepare("
    INSERT INTO test_attempts (user_id, score, total, percentage)
    VALUES (?, ?, ?, ?)
");

$attempt_stmt->bind_param("iiid", $user_id, $score, $total, $percentage);
$attempt_stmt->execute();
$attempt_id = $conn->insert_id;
$attempt_stmt->close();

$insert_stmt = $conn->prepare("
    INSERT INTO user_answers (attempt_id, user_id, question_id, selected_option, correct_answer, is_correct)
    VALUES (?, ?, ?, ?, ?, ?)
");

foreach ($results as $r) {

    $insert_stmt->bind_param(
        "iiissi",
        $attempt_id,
        $user_id,
        $r['qid'],
        $r['selected'],
        $r['correct'],
        $r['is_correct']
    );

    $insert_stmt->execute();
}

$insert_stmt->close();

$skill_stmt = $conn->prepare("
    SELECT q.skill_id,
           SUM(ua.is_correct) AS correct,
           COUNT(*) AS total,
           ROUND(SUM(ua.is_correct)/COUNT(*) * 100, 2) AS percentage
    FROM user_answers ua
    JOIN questions q ON ua.question_id = q.question_id
    WHERE ua.attempt_id = ?
    GROUP BY q.skill_id
");

$skill_stmt->bind_param("i", $attempt_id);
$skill_stmt->execute();
$result = $skill_stmt->get_result();

while ($row = $result->fetch_assoc()) {

    $skill_id   = $row['skill_id'];
    $skill_perc = $row['percentage'];

    $update = $conn->prepare("
        INSERT INTO user_skills (user_id, skill_id, proficiency)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
        proficiency = (proficiency + VALUES(proficiency)) / 2
    ");

    $update->bind_param("iid", $user_id, $skill_id, $skill_perc);
    $update->execute();
}

ob_clean();
    echo json_encode([
    "success" => true,
    "attempt_id" => $attempt_id,
    "score" => $score,
    "total" => $total,
    "percentage" => $percentage
]);
?>