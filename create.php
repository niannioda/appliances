<?php
require_once 'config.php';

$s = $conn->prepare("
    INSERT INTO products (product_name,price,stock,categories,image)
    VALUES (?,?,?,?,?)
    ON DUPLICATE KEY UPDATE
        price = VALUES(price),
        stock = stock + VALUES(stock),
        categories = VALUES(categories),
        image = VALUES(image)
");
$s->bind_param('sdiss', $name,$price,$stock,$cat,$imagePath);
$ok = $s->execute();
?>

<!DOCTYPE html>
<html>
<head>
  <title>Add Product</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
</head>
<body class="container mt-5">

<h3>Add Product</h3>

<form method="POST">
  <input type="text" name="product_name" class="form-control mb-2" placeholder="Product Name" required>

  <input type="number" step="0.01" name="price" class="form-control mb-2" placeholder="Price" required>

  <input type="number" name="stock" class="form-control mb-2" placeholder="Stock" required>

  <select name="categories" class="form-control mb-3">
    <option>Air Conditioner</option>
    <option>Dishwasher</option>
    <option>Microwave</option>
    <option>Oven</option>
    <option>Refrigerator</option>
    <option>Washer</option>
  </select>

  <button type="submit" name="submit" class="btn btn-success">Add Product</button>
  <a href="index.php" class="btn btn-secondary">Back</a>
</form>

</body>
</html>