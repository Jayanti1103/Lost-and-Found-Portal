<?php


$db_host = 'sql207.infinityfree.com'; 
$db_name = 'if0_40793573_portal';    
$db_user = 'if0_40793573';         
$db_pass = 'Jayantijha1103';         


$dsn = "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, 
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       
    PDO::ATTR_EMULATE_PREPARES   => false,                  
];

try {
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit; 
}

function json_response($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}
?>