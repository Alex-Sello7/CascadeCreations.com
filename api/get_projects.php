<?php
// api/get_project.php
require_once 'db_config.php';

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Content-Type: application/json");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$project_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($project_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Project ID required']);
    exit();
}

$sql = "SELECT p.*, c.name as client_name, c.email, c.phone 
        FROM projects p 
        LEFT JOIN clients c ON p.client_id = c.id 
        WHERE p.id = ?";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit();
}

$stmt->bind_param("i", $project_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Project not found']);
    exit();
}

$project = $result->fetch_assoc();

// Format data for dashboard
echo json_encode([
    'success' => true,
    'data' => [
        'id' => $project['id'],
        'client_id' => $project['client_id'],
        'client_name' => $project['client_name'],
        'email' => $project['email'],
        'phone' => $project['phone'],
        'project_name' => $project['project_name'],
        'description' => $project['description'],
        'project_type' => $project['project_type'],
        'budget' => $project['budget'],
        'timeline' => $project['timeline'],
        'status' => $project['status'],
        'deposit_paid' => (bool)$project['deposit_paid'],
        'deposit_amount' => $project['deposit_amount'],
        'deposit_date' => $project['deposit_date'],
        'project_start_date' => $project['project_start_date'],
        'project_end_date' => $project['project_end_date'],
        'notes' => $project['notes'],
        'created_at' => $project['created_at'],
        'updated_at' => $project['updated_at']
    ]
]);

$conn->close();
?>