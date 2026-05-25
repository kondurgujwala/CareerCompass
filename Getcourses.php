<?php
ob_start();

require 'db_connect.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    ob_clean();
    echo json_encode(["error" => "Unauthorized. Please login."]);
    exit();
}

// Check if a courses table exists
$tableCheck = mysqli_query($conn, "SHOW TABLES LIKE 'courses'");
if ($tableCheck && mysqli_num_rows($tableCheck) > 0) {
    $stmt = mysqli_prepare($conn, "SELECT course_id, title, provider, category, description, url FROM courses ORDER BY title ASC LIMIT 50");
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $courses = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $courses[] = $row;
    }

    ob_clean();
    echo json_encode(["success" => true, "courses" => $courses]);
    exit();
}

// Static fallback when course data is not available in the database.
$courses = [
    [
        "course_id"   => 1,
        "title"       => "Career Strategy Fundamentals",
        "provider"    => "CareerCompass Academy",
        "category"    => "Career Planning",
        "description" => "Build a strong career roadmap and identify your next growth steps.",
        "url"         => "https://example.com/career-strategy"
    ],
    [
        "course_id"   => 2,
        "title"       => "Data Skills for Future Jobs",
        "provider"    => "Skills Lab",
        "category"    => "Data Analysis",
        "description" => "Gain the essential data analysis skills employers are looking for.",
        "url"         => "https://example.com/data-skills"
    ],
    [
        "course_id"   => 3,
        "title"       => "Interview and Resume Toolbox",
        "provider"    => "CareerCompass",
        "category"    => "Career Success",
        "description" => "Prepare for interviews and build a resume that stands out.",
        "url"         => "https://example.com/interview-tools"
    ]
];

ob_clean();
    echo json_encode(["success" => true, "courses" => $courses]);
