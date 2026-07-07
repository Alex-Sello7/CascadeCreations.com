<?php
// api/projects.php
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

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $sql = "SELECT p.*, c.name as client_name, c.email, c.phone 
                FROM projects p 
                LEFT JOIN clients c ON p.client_id = c.id 
                ORDER BY p.created_at DESC";
        $result = $conn->query($sql);
        $projects = [];
        while ($row = $result->fetch_assoc()) {
            $projects[] = $row;
        }
        echo json_encode(['success' => true, 'data' => $projects]);
        break;
        
    case 'POST':
        // For new projects from dashboard
        // (reuse submit_project logic if needed)
        break;
        
    case 'PUT':
        // Update project - can use update_project.php or handle here
        break;
        
    case 'DELETE':
        // Delete project
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        if ($id > 0) {
            $sql = "DELETE FROM projects WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Project deleted']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Delete failed']);
            }
        }
        break;
}

$conn->close();
?>