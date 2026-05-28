<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

define('DB_HOST', 'sql306.infinityfree.com');
define('DB_USER', 'if0_42036489_XXX');
define('DB_PASS', 'your_password');
define('DB_NAME', 'if0_42036489_appliances_inventory');

try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    $conn->set_charset('utf8mb4');

    echo "Connected successfully";

} catch (mysqli_sql_exception $e) {
    die("Connection failed: " . $e->getMessage());
}