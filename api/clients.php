<?php
require_once 'db_config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $id = intval($_GET['id']);
            $sql = "SELECT * FROM clients WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $client = $result->fetch_assoc();
            echo json_encode($client);
        } else {
            $sql = "SELECT * FROM clients ORDER BY name";
            $result = $conn->query($sql);
            $clients = [];
            while ($row = $result->fetch_assoc()) {
                $clients[] = $row;
            }
            echo json_encode($clients);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $sql = "INSERT INTO clients (name, email, phone, company, address) VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssss", 
            $data['name'],
            $data['email'] ?? '',
            $data['phone'] ?? '',
            $data['company'] ?? '',
            $data['address'] ?? ''
        );
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'id' => $conn->insert_id]);
        } else {
            echo json_encode(['error' => $conn->error]);
        }
        break;

    case 'PUT':
        $id = intval($_GET['id']);
        $data = json_decode(file_get_contents('php://input'), true);
        
        $sql = "UPDATE clients SET name = ?, email = ?, phone = ?, company = ?, address = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssssi", 
            $data['name'],
            $data['email'] ?? '',
            $data['phone'] ?? '',
            $data['company'] ?? '',
            $data['address'] ?? '',
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
        $sql = "DELETE FROM clients WHERE id = ?";
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