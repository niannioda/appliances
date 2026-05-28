<?php
define('DB_HOST', 'sql306.infinityfree.com');
define('DB_USER', 'if0_42036489_XXX');
define('DB_PASS', 'sethborres18');
define('DB_NAME', 'if0_42036489_appliances_inventory');

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}
$conn->set_charset('utf8mb4');
