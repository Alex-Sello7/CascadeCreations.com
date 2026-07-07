<?php
require_once 'db_config.php';

// Get main stats
$sql = "SELECT 
    (SELECT COUNT(*) FROM projects) AS total_projects,
    (SELECT COUNT(*) FROM projects WHERE status = 'in-progress') AS in_progress,
    (SELECT COUNT(*) FROM projects WHERE status = 'new') AS new_projects,
    (SELECT COUNT(*) FROM projects WHERE status = 'completed') AS completed,
    (SELECT COUNT(*) FROM projects WHERE deposit_paid = 1) AS deposits_paid,
    (SELECT COUNT(*) FROM projects WHERE deposit_paid = 0) AS deposits_pending,
    (SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE paid = 0) AS outstanding_invoices,
    (SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE paid = 1) AS paid_invoices";

$result = $conn->query($sql);
$stats = $result->fetch_assoc();

// Get status breakdown
$status_sql = "SELECT status, COUNT(*) as count FROM projects GROUP BY status";
$status_result = $conn->query($status_sql);
$status_counts = [];
while ($row = $status_result->fetch_assoc()) {
    $status_counts[] = $row;
}
$stats['status_breakdown'] = $status_counts;

// Get project type breakdown
$type_sql = "SELECT project_type, COUNT(*) as count FROM projects GROUP BY project_type";
$type_result = $conn->query($type_sql);
$type_counts = [];
while ($row = $type_result->fetch_assoc()) {
    $type_counts[] = $row;
}
$stats['type_breakdown'] = $type_counts;

// Get recent projects (last 7 days)
$recent_sql = "SELECT COUNT(*) as count FROM projects WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
$recent_result = $conn->query($recent_sql);
$recent = $recent_result->fetch_assoc();
$stats['recent'] = $recent['count'];

// Get projects with estimates
$estimates_sql = "SELECT COUNT(*) as count FROM projects WHERE estimated_completion IS NOT NULL";
$estimates_result = $conn->query($estimates_sql);
$estimates = $estimates_result->fetch_assoc();
$stats['with_estimates'] = $estimates['count'];

echo json_encode($stats);
$conn->close();
?>