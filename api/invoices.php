<?php
require_once 'db_config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $id = intval($_GET['id']);
            $sql = "SELECT i.*, p.project_name, c.name as client_name 
                    FROM invoices i
                    JOIN projects p ON i.project_id = p.id
                    LEFT JOIN clients c ON p.client_id = c.id
                    WHERE i.id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $invoice = $result->fetch_assoc();
            
            // Get invoice items
            if ($invoice) {
                $items_sql = "SELECT * FROM invoice_items WHERE invoice_id = ?";
                $items_stmt = $conn->prepare($items_sql);
                $items_stmt->bind_param("i", $id);
                $items_stmt->execute();
                $items_result = $items_stmt->get_result();
                $items = [];
                while ($row = $items_result->fetch_assoc()) {
                    $items[] = $row;
                }
                $invoice['items'] = $items;
            }
            
            echo json_encode($invoice);
        } else if (isset($_GET['project_id'])) {
            $project_id = intval($_GET['project_id']);
            $sql = "SELECT * FROM invoices WHERE project_id = ? ORDER BY issued_date DESC";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $project_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $invoices = [];
            while ($row = $result->fetch_assoc()) {
                $invoices[] = $row;
            }
            echo json_encode($invoices);
        } else {
            $sql = "SELECT i.*, p.project_name, c.name as client_name 
                    FROM invoices i
                    JOIN projects p ON i.project_id = p.id
                    LEFT JOIN clients c ON p.client_id = c.id
                    ORDER BY i.issued_date DESC";
            $result = $conn->query($sql);
            $invoices = [];
            while ($row = $result->fetch_assoc()) {
                $invoices[] = $row;
            }
            echo json_encode($invoices);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Start transaction
        $conn->begin_transaction();
        
        try {
            // Insert invoice
            $sql = "INSERT INTO invoices (project_id, invoice_number, amount, issued_date, due_date, notes) 
                    VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("isdsss", 
                $data['project_id'],
                $data['invoice_number'],
                $data['amount'],
                $data['issued_date'],
                $data['due_date'],
                $data['notes'] ?? ''
            );
            $stmt->execute();
            $invoice_id = $conn->insert_id;
            
            // Insert invoice items
            if (isset($data['items']) && is_array($data['items'])) {
                $items_sql = "INSERT INTO invoice_items (invoice_id, description, quantity, unit_price) VALUES (?, ?, ?, ?)";
                $items_stmt = $conn->prepare($items_sql);
                foreach ($data['items'] as $item) {
                    $items_stmt->bind_param("isdd", 
                        $invoice_id,
                        $item['description'],
                        $item['quantity'] ?? 1,
                        $item['unit_price']
                    );
                    $items_stmt->execute();
                }
            }
            
            $conn->commit();
            echo json_encode(['success' => true, 'id' => $invoice_id]);
            
        } catch (Exception $e) {
            $conn->rollback();
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $id = intval($_GET['id']);
        $data = json_decode(file_get_contents('php://input'), true);
        
        $sql = "UPDATE invoices SET 
                invoice_number = ?,
                amount = ?,
                issued_date = ?,
                due_date = ?,
                paid = ?,
                paid_date = ?,
                notes = ?
                WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sdssisss", 
            $data['invoice_number'],
            $data['amount'],
            $data['issued_date'],
            $data['due_date'],
            $data['paid'] ? 1 : 0,
            $data['paid_date'] ?? null,
            $data['notes'] ?? '',
            $id
        );
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => $conn->error]);
        }
        break;

    case 'DELETE':
        $id = intval($_GET['id']);
        $sql = "DELETE FROM invoices WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => $conn->error]);
        }
        break;
}

$conn->close();
?>