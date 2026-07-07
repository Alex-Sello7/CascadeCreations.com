<?php
// api/update_project.php
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

// Get project ID from URL
$project_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($project_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Project ID required']);
    exit();
}

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if ($data === null) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit();
}

// Build update query dynamically
$allowed_fields = [
    'project_name', 'description', 'project_type', 'budget', 'timeline', 
    'status', 'deposit_paid', 'deposit_amount', 'deposit_date', 
    'project_start_date', 'project_end_date', 'notes'
];

$updates = [];
$types = "";
$values = [];

foreach ($data as $key => $value) {
    if (in_array($key, $allowed_fields)) {
        // Convert boolean to int
        if ($key === 'deposit_paid') {
            $value = $value ? 1 : 0;
        }
        // Handle empty dates
        if (($key === 'deposit_date' || $key === 'project_start_date' || $key === 'project_end_date') && empty($value)) {
            $value = null;
        }
        $updates[] = "$key = ?";
        $values[] = $value;
        $types .= "s";
    }
}

if (empty($updates)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No valid fields to update']);
    exit();
}

// Add updated_at timestamp
$updates[] = "updated_at = NOW()";

$values[] = $project_id;
$types .= "i";

$sql = "UPDATE projects SET " . implode(', ', $updates) . " WHERE id = ?";

try {
    $stmt = $conn->prepare($sql);
    if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);
    
    $stmt->bind_param($types, ...$values);
    
    if (!$stmt->execute()) throw new Exception("Update failed: " . $stmt->error);
    
    // Log the update
    try {
        $log_sql = "INSERT INTO project_logs (project_id, action, details) VALUES (?, 'updated', ?)";
        $log_stmt = $conn->prepare($log_sql);
        if ($log_stmt) {
            $details = "Project updated: " . json_encode($data);
            $log_stmt->bind_param("is", $project_id, $details);
            $log_stmt->execute();
        }
    } catch (Exception $e) {
        // Ignore log errors
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Project updated successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>