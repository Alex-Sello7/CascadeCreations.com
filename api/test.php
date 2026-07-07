<?php
require_once 'db_config.php';

// If we got here, connection was successful
echo json_encode([
    'success' => true,
    'message' => 'Database connection successful!',
    'database' => $db_name,
    'host' => $db_host
]);
?>