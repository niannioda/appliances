<?php
require_once 'config.php';

$category = trim($_GET['category'] ?? '');
$search   = trim($_GET['search']   ?? '');
$flash    = $_GET['flash'] ?? '';
$flashMsg = urldecode($_GET['msg'] ?? '');

$where = []; $params = []; $types = '';
if ($search !== '') {
    $where[] = 'product_name LIKE ?'; $params[] = "%$search%"; $types .= 's';
}
$sql = 'SELECT * FROM products' . ($where ? ' WHERE ' . implode(' AND ', $where) : '') . ' ORDER BY product_name ASC';
$stmt = $conn->prepare($sql);
if ($params) $stmt->bind_param($types, ...$params);
$stmt->execute();
$products = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

$cats = ['All Items','Air Conditioner','Dishwasher','Microwave','Oven','Refrigerator','Washer'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Appliances Inventory — POS</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

<!-- ── TOP NAVBAR ── -->
 <a href="create.php" class="btn btn-primary btn-sm">
  <i class="bi bi-plus-lg"></i> Add Product
</a>
<nav class="top-navbar">
  <div class="navbar-brand-area">
    <div class="brand-icon"><i class="bi bi-plug-fill"></i></div>
    <div class="brand-text">
      <span class="brand-name">Appliances Inventory</span>
      <span class="brand-sub">Inventory POS</span>
    </div>
  </div>

  <!-- ================= SEARCH BAR ================= -->

<div class="navbar-search">

    <div class="search-box">

        <!-- SEARCH ICON -->
        <i class="bi bi-search search-icon"></i>

        <!-- SEARCH INPUT -->
        <input
            type="text"
            id="searchInput"
            class="search-input"
            placeholder="Search appliances..."
            autocomplete="off"
        >

    </div>

</div>

<!-- ================= SEARCH FUNCTION ================= -->

<script>

 const searchInput = document.getElementById("searchInput");

 searchInput.addEventListener("keyup", function () {

    let searchValue = this.value.toLowerCase();

    let products = document.querySelectorAll(".product-card");

    products.forEach(product => {

        let productName = product.dataset.name.toLowerCase();

        if (productName.includes(searchValue)) {

            product.style.display = "block";

        } else {

            product.style.display = "none";

        }

    });

});

</script>

  <div class="navbar-actions">
    <a href="products.php" class="btn btn-outline-light btn-sm">
      <i class="bi bi-grid-3x3-gap"></i> Manage Products
    </a>
    <div class="cart-badge-wrap">
      <i class="bi bi-cart3 cart-icon"></i>
      <span class="cart-count" id="cartCount">0</span>
    </div>
  </div>
</nav>

<!-- ── CATEGORY PILLS ── -->
<div class="cat-bar">
  <?php foreach ($cats as $c): 
    $slug = $c === 'All Items' ? 'All' : $c;
    $active = ($category === $slug || ($slug === 'All' && !$category)) ? 'active' : '';
  ?>
  <button class="cat-pill <?= $active ?>" data-cat="<?= $slug ?>"><?= $c ?></button>
  <?php endforeach; ?>
</div>

<?php if ($flash): ?>
<div class="alert alert-<?= $flash === 'success' ? 'success' : 'danger' ?> alert-dismissible mx-3 mt-2 mb-0 py-2" role="alert">
  <?= htmlspecialchars($flashMsg) ?>
  <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>
<?php endif; ?>

<!-- ───────────────── MAIN POS LAYOUT ───────────────── -->
<div class="pos-layout">

    <!-- ================= LEFT SIDE ================= -->
    <section class="products-area">

        <!-- TOP HEADER -->
        <div class="products-header">

            <div>
                <h4 class="mb-0 fw-bold">Available Appliances</h4>

                <small class="text-muted">
                    <span id="resultsLabel">
                        <?= count($products) ?>
                    </span>
                    product<?= count($products) !== 1 ? 's' : '' ?>
                </small>
            </div>

        </div>

        <!-- PRODUCTS GRID -->
        <div class="products-grid" id="productsGrid">

            <!-- EMPTY -->
            <?php if (empty($products)): ?>

                <div class="empty-state">

                    <i class="bi bi-box-seam"></i>

                    <h5>No Products Available</h5>

                    <p>Add your first appliance product.</p>

                    <a href="create.php"
                       class="btn btn-primary">

                        <i class="bi bi-plus-circle"></i>
                        Add Product

                    </a>

                </div>

            <?php endif; ?>

            <!-- PRODUCTS -->
            <?php foreach ($products as $p):

                $imgSrc = $p['image'] && file_exists($p['image'])
                    ? htmlspecialchars($p['image'])
                    : 'assets/img/no-image.png';

                $outOfStock = $p['stock'] <= 0;

            ?>

            <!-- PRODUCT CARD -->
            <div class="product-card <?= $outOfStock ? 'out-of-stock' : '' ?>"

                 data-id="<?= $p['id'] ?>"
                 data-name="<?= htmlspecialchars($p['product_name'], ENT_QUOTES) ?>"
                 data-price="<?= $p['price'] ?>"
                 data-stock="<?= $p['stock'] ?>"
                 data-image="<?= $imgSrc ?>"
                 data-cat="<?= htmlspecialchars($p['categories']) ?>">

                <!-- IMAGE -->
                <div class="card-img-wrap">

                    <img src="<?= $imgSrc ?>"
                         alt="<?= htmlspecialchars($p['product_name']) ?>">

                    <!-- STOCK BADGE -->
                    <div class="stock-badge
                        <?= $outOfStock
                            ? 'badge-out'
                            : ($p['stock'] <= 5
                                ? 'badge-low'
                                : 'badge-ok')
                        ?>">

                        <?= $outOfStock
                            ? 'Out of Stock'
                            : 'Stock: ' . $p['stock']
                        ?>

                    </div>

                </div>

                <!-- BODY -->
                <div class="card-body-custom">

                    <!-- CATEGORY -->
                    <div class="cat-tag">
                        <?= htmlspecialchars($p['categories']) ?>
                    </div>

                    <!-- NAME -->
                    <h5 class="product-name">
                        <?= htmlspecialchars($p['product_name']) ?>
                    </h5>

                    <!-- PRICE -->
                    <div class="price">
                        ₱<?= number_format($p['price'], 2) ?>
                    </div>

                    <!-- ACTION BUTTONS -->
                    <div class="product-actions">

                        <!-- EDIT -->
                        <a href="edit.php?id=<?= $p['id'] ?>"
                           class="btn btn-warning btn-sm">

                            <i class="bi bi-pencil"></i>

                        </a>

                        <!-- DELETE -->
                        <a href="delete.php?id=<?= $p['id'] ?>"
                           class="btn btn-danger btn-sm"
                           onclick="return confirm('Delete this appliance?')">

                            <i class="bi bi-trash"></i>

                        </a>

                        <!-- ADD TO CART -->
                        <button class="btn btn-primary btn-sm ms-auto"

                                <?= $outOfStock ? 'disabled' : '' ?>

                                onclick="addToCart(this)">

                            <i class="bi bi-cart-plus"></i>
                            Add

                        </button>

                    </div>

                </div>

            </div>

            <?php endforeach; ?>

        </div>

    </section>

    <!-- ================= RIGHT SIDE ================= -->
    <aside class="order-panel">

        <!-- ORDER HEADER -->
        <div class="order-header">

            <h5 class="mb-0">
                <i class="bi bi-receipt"></i>
                Order Summary
            </h5>

            <!-- CLEAR -->
            <button class="btn btn-outline-danger btn-sm"
                    onclick="clearCart()">

                <i class="bi bi-trash3"></i>

            </button>

        </div>

        <!-- CART ITEMS -->
        <div class="order-items" id="orderItems">

            <!-- EMPTY CART -->
            <div class="cart-empty" id="cartEmpty">

                <i class="bi bi-cart-x"></i>

                <h6>No appliances added</h6>

                <small>
                    Click the Add button to order appliances
                </small>

            </div>

        </div>

        <!-- FOOTER -->
<div class="order-footer">

    <!-- SUBTOTAL -->
    <div class="summary-row">
        <span>Subtotal</span>
        <strong id="subtotal">₱0.00</strong>
    </div>

    <!-- VAT -->
    <div class="summary-row">

        <span>
            VAT (12%)

            <label class="ms-2">
                <input type="checkbox"
                       id="vatToggle"
                       onchange="renderCart()">
                Include
            </label>

        </span>

        <strong id="vat">₱0.00</strong>

    </div>

    <!-- TOTAL -->
    <div class="summary-row total-row">

        <span>Total</span>

        <strong id="total">₱0.00</strong>

    </div>

    <!-- PAY BUTTON -->
    <button class="btn btn-success w-100 btn-lg"
            id="payBtn"
            onclick="proceedPayment()"
            disabled>

        <i class="bi bi-cash-stack"></i>
        Proceed to Payment

    </button>



</div>

    </aside>

</div>

<!-- Payment Modal -->
<div class="modal fade" id="payModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content pay-modal">
      <div class="modal-header border-0 pb-0">
        <h5 class="modal-title"><i class="bi bi-cash-coin text-success me-2"></i>Payment</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <div class="pay-total-display" id="payTotalDisplay">₱0.00</div>
        <label class="form-label fw-semibold">Cash Tendered</label>
        <input type="number" id="cashInput" class="form-control form-control-lg mb-3"
               placeholder="Enter amount" oninput="calcChange()">
        <div class="change-display" id="changeDisplay" style="display:none">
          <span>Change</span>
          <strong id="changeAmt">₱0.00</strong>
        </div>
      </div>
      <div class="modal-footer border-0 pt-0">
        <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button class="btn btn-success px-4" id="confirmPayBtn" onclick="confirmPayment()" disabled>
          <i class="bi bi-check-circle"></i> Confirm Payment
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Success Modal -->
<div class="modal fade" id="successModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content text-center p-4">
      
      <div class="mb-3">
        <i class="bi bi-check-circle-fill text-success" style="font-size: 3rem;"></i>
      </div>

      <h5 class="mb-2">Purchased Successfully!</h5>
      <p class="text-muted">Thank you for your purchase.</p>

      <button class="btn btn-success mt-3" data-bs-dismiss="modal" onclick="clearCart()">
        Done
      </button>

    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

<script>

let cart = [];

/* =========================
   ADD TO CART
========================= */
function addToCart(btn) {

    const card = btn.closest(".product-card");

    const product = {

        id: card.dataset.id,
        name: card.dataset.name,
        price: parseFloat(card.dataset.price),
        image: card.dataset.image,
        qty: 1

    };

    const existing =
        cart.find(item => item.id === product.id);

    if (existing) {

        existing.qty++;

    } else {

        cart.push(product);

    }

    renderCart();
}

/* =========================
   RENDER CART
========================= */
function renderCart() {

    const orderItems =
        document.getElementById("orderItems");

    const cartCount =
        document.getElementById("cartCount");

    const payBtn =
        document.getElementById("payBtn");

    orderItems.innerHTML = "";

    if (cart.length === 0) {

        orderItems.innerHTML = `

            <div class="cart-empty">

                <i class="bi bi-cart-x"></i>

                <h6>No appliances added</h6>

                <small>
                    Click the Add button to order appliances
                </small>

            </div>

        `;

        document.getElementById("subtotal").innerText =
            "₱0.00";

        document.getElementById("vat").innerText =
            "₱0.00";

        document.getElementById("total").innerText =
            "₱0.00";

        cartCount.innerText = "0";

        payBtn.disabled = true;

        return;
    }

    let subtotal = 0;
    let count = 0;

    cart.forEach((item, index) => {

        subtotal += item.price * item.qty;

        count += item.qty;

        orderItems.innerHTML += `

            <div class="d-flex align-items-center mb-3">

                <img src="${item.image}"
                     width="60"
                     height="60"
                     style="object-fit:cover;border-radius:10px">

                <div class="ms-3 flex-grow-1">

                    <div class="fw-semibold">
                        ${item.name}
                    </div>

                    <small>
                        ₱${item.price.toFixed(2)} × ${item.qty}
                    </small>

                </div>

                <div class="d-flex align-items-center gap-2">

                    <button class="btn btn-sm btn-outline-secondary"
                            onclick="changeQty(${index}, -1)">
                        -
                    </button>

                    <span>${item.qty}</span>

                    <button class="btn btn-sm btn-outline-secondary"
                            onclick="changeQty(${index}, 1)">
                        +
                    </button>

                </div>

            </div>

        `;
    });

    const vatChecked =
        document.getElementById("vatToggle").checked;

    const vat =
        vatChecked ? subtotal * 0.12 : 0;

    const total =
        subtotal + vat;

    document.getElementById("subtotal").innerText =
        "₱" + subtotal.toFixed(2);

    document.getElementById("vat").innerText =
        "₱" + vat.toFixed(2);

    document.getElementById("total").innerText =
        "₱" + total.toFixed(2);

    cartCount.innerText = count;

    payBtn.disabled = false;
}

/* =========================
   CHANGE QUANTITY
========================= */
function changeQty(index, change) {

    cart[index].qty += change;

    if (cart[index].qty <= 0) {

        cart.splice(index, 1);

    }

    renderCart();
}

/* =========================
   CLEAR CART
========================= */
function clearCart() {

    cart = [];

    renderCart();
}

/* =========================
   OPEN PAYMENT MODAL
========================= */
function proceedPayment() {

    const total =
        document.getElementById("total").innerText;

    document.getElementById("payTotalDisplay").innerText =
        total;

    document.getElementById("cashInput").value = "";

    document.getElementById("changeDisplay").style.display =
        "none";

    document.getElementById("confirmPayBtn").disabled =
        true;

    const modal =
        new bootstrap.Modal(
            document.getElementById("payModal")
        );

    modal.show();
}

/* =========================
   CALCULATE CHANGE
========================= */
function calcChange() {

    const total = parseFloat(
        document.getElementById("total")
            .innerText
            .replace("₱", "")
            .replace(",", "")
    );

    const cash = parseFloat(
        document.getElementById("cashInput").value
    ) || 0;

    const change = cash - total;

    if (cash >= total) {

        document.getElementById("changeDisplay").style.display =
            "flex";

        document.getElementById("changeAmt").innerText =
            "₱" + change.toFixed(2);

        document.getElementById("confirmPayBtn").disabled =
            false;

    } else {

        document.getElementById("changeDisplay").style.display =
            "none";

        document.getElementById("confirmPayBtn").disabled =
            true;
    }
}

/* =========================
   CONFIRM PAYMENT
========================= */
function confirmPayment() {

    const payModal =
        bootstrap.Modal.getInstance(
            document.getElementById("payModal")
        );

    payModal.hide();

    const successModal =
        new bootstrap.Modal(
            document.getElementById("successModal")
        );

    successModal.show();
}

/* =========================
   CATEGORY FILTER
========================= */
(function () {

  const pills = document.querySelectorAll('.cat-pill');

  const allCards = () =>
    document.querySelectorAll('#productsGrid .product-card');

  const resultsLabel =
    document.getElementById('resultsLabel');

  function applyCategory(selectedCat) {

    let visible = 0;

    allCards().forEach(card => {

      const match =
        selectedCat === 'All' ||
        card.dataset.cat === selectedCat;

      card.style.display = match ? '' : 'none';

      if (match) visible++;

    });

    if (resultsLabel) {

      resultsLabel.textContent =
        visible + ' product' + (visible !== 1 ? 's' : '');

    }

  }

  pills.forEach(pill => {

    pill.addEventListener('click', function () {

      pills.forEach(p =>
        p.classList.remove('active')
      );

      this.classList.add('active');

      applyCategory(this.dataset.cat);

    });

  });

  const activePill =
    document.querySelector('.cat-pill.active');

  if (activePill) {

    applyCategory(activePill.dataset.cat);

  }

})();

</script>

</body>
</html>