<?php
// api/submit_project.php
require_once 'db_config.php';

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Access-Control-Max-Age: 3600");
header("Content-Type: application/json");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Fallback to POST if JSON fails
if ($data === null) {
    $data = $_POST;
}

// Extract data
$name = $data['name'] ?? '';
$email = $data['email'] ?? '';
$phone = $data['phone'] ?? '';
$projectName = $data['projectName'] ?? '';
$projectType = $data['projectType'] ?? '';
$description = $data['description'] ?? '';
$budget = $data['budget'] ?? '';
$timeline = $data['timeline'] ?? '';
$status = $data['status'] ?? 'new';

// Validate
if (empty($name) || empty($email) || empty($projectName) || empty($projectType) || empty($description)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Please fill in all required fields'
    ]);
    exit();
}

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Please enter a valid email address'
    ]);
    exit();
}

$conn->begin_transaction();

try {
    // 1. Check if client exists
    $check_sql = "SELECT id FROM clients WHERE email = ?";
    $check_stmt = $conn->prepare($check_sql);
    if (!$check_stmt) throw new Exception("Prepare failed: " . $conn->error);
    $check_stmt->bind_param("s", $email);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    
    if ($result->num_rows > 0) {
        $client = $result->fetch_assoc();
        $client_id = $client['id'];
    } else {
        $client_sql = "INSERT INTO clients (name, email, phone, company) VALUES (?, ?, ?, ?)";
        $client_stmt = $conn->prepare($client_sql);
        if (!$client_stmt) throw new Exception("Prepare failed: " . $conn->error);
        $company = '';
        $client_stmt->bind_param("ssss", $name, $email, $phone, $company);
        if (!$client_stmt->execute()) throw new Exception("Client insert failed: " . $client_stmt->error);
        $client_id = $conn->insert_id;
    }
    
    // 2. Create project
    $project_sql = "INSERT INTO projects (
        client_id, project_name, description, project_type, budget, timeline, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
    
    $project_stmt = $conn->prepare($project_sql);
    if (!$project_stmt) throw new Exception("Prepare failed: " . $conn->error);
    $project_stmt->bind_param("issssss", $client_id, $projectName, $description, $projectType, $budget, $timeline, $status);
    if (!$project_stmt->execute()) throw new Exception("Project insert failed: " . $project_stmt->error);
    $project_id = $conn->insert_id;
    
    // 3. Log submission
    try {
        $log_sql = "INSERT INTO project_logs (project_id, action, details) VALUES (?, 'submitted', ?)";
        $log_stmt = $conn->prepare($log_sql);
        if ($log_stmt) {
            $details = "Project submitted via website by $name ($email)";
            $log_stmt->bind_param("is", $project_id, $details);
            $log_stmt->execute();
        }
    } catch (Exception $e) {
        // Log table might not exist
    }
    
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Project submitted successfully!',
        'project_id' => $project_id,
        'client_id' => $client_id
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>