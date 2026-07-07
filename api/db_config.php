<?php
// ===========================================
// DATABASE CONFIGURATION
// ===========================================

// Your InfinityFree MySQL credentials
// Get these from your InfinityFree control panel
// Go to: MySQL Databases → Your database

$db_host = 'sql200.infinityfree.com';     // Your MySQL host (from InfinityFree)
$db_user = 'if0_42304687';                // Your database username
$db_pass = 'Ty95200102';          // Your database password
$db_name = 'if0_42304687_cascade_dashboard'; // Your database name

// ===========================================
// CREATE CONNECTION
// ===========================================

// Create connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection
if ($conn->connect_error) {
    // Return error as JSON so React can handle it
    die(json_encode([
        'error' => 'Database connection failed: ' . $conn->connect_error,
        'host' => $db_host,
        'database' => $db_name
    ]));
}

// Set charset to UTF-8
$conn->set_charset("utf8mb4");

// ===========================================
// CORS HEADERS (so React can access the API)
// ===========================================

// Allow from any origin (for development)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 3600");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

// Function to send JSON response
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

// Function to handle errors
function handleError($message, $statusCode = 500) {
    sendResponse(['error' => $message], $statusCode);
}

// Function to get JSON input
function getJsonInput() {
    $input = file_get_contents('php://input');
    return json_decode($input, true);
}

// Function to escape strings
function escapeString($str) {
    global $conn;
    return $conn->real_escape_string($str);
}

// ===========================================
// SESSION START (optional - for login later)
// ===========================================

// Uncomment this if you want to use sessions for login
// session_start();

// ===========================================
// DEBUGGING (remove in production)
// ===========================================

// Uncomment to log all queries (for debugging)
// function logQuery($sql) {
//     $log = date('Y-m-d H:i:s') . " - " . $sql . "\n";
//     file_put_contents('query_log.txt', $log, FILE_APPEND);
// }

?>