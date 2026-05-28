/* =========================================================
   CART SYSTEM
========================================================= */

let cart = {};

/* =========================================================
   ADD TO CART
========================================================= */

/* ── Add to Cart ───────────────────────── */
function addToCart(btn) {

  const card = btn.closest('.product-card');

  const id    = card.dataset.id;
  const name  = card.dataset.name;
  const price = parseFloat(card.dataset.price);
  const stock = parseInt(card.dataset.stock);
  const image = card.dataset.image;

  if (!cart[id]) {

    cart[id] = {
      id,
      name,
      price,
      qty: 1,
      stock,
      image
    };

  } else {

    if (cart[id].qty < stock) {

      cart[id].qty++;

    } else {

      showToast("Not enough stock!", "warning");
      return;

    }

  }

  renderCart();
}
/* =========================================================
   CHANGE QUANTITY
========================================================= */

/* ── Change Quantity ───────────────────── */
function changeQty(id, delta) {

  if (!cart[id]) return;

  cart[id].qty += delta;

  // limit to stock
  if (cart[id].qty > cart[id].stock) {
    cart[id].qty = cart[id].stock;
  }

  // remove item if quantity is 0
  if (cart[id].qty <= 0) {
    delete cart[id];
  }

  renderCart();
}

/* =========================================================
   REMOVE ITEM
========================================================= */

function removeItem(id) {

  delete cart[id];

  renderCart();

}

/* =========================================================
   CLEAR CART
========================================================= */

function clearCart() {

  cart = {};

  renderCart();
}

/* =========================================================
   RENDER CART
========================================================= */

function renderCart() {

  const container = document.getElementById('orderItems');

  if (!container) return;

  const ids = Object.keys(cart);

  // EMPTY CART
  if (ids.length === 0) {

    container.innerHTML = `
      <div class="cart-empty">
        <i class="bi bi-cart-x"></i>
        <p>No items yet</p>
        <small>Click + on a product to add</small>
      </div>
    `;

    document.getElementById('cartCount').textContent = '0';

    document.getElementById('subtotal').textContent = '₱0.00';
    document.getElementById('vat').textContent = '₱0.00';
    document.getElementById('total').textContent = '₱0.00';

    document.getElementById('payBtn').disabled = true;

    return;
  }

  let html = '';

  let subtotal = 0;

  ids.forEach(id => {

    const item = cart[id];

    const itemTotal = item.price * item.qty;

    subtotal += itemTotal;

    html += `
      <div class="cart-item">

        <div style="display:flex; gap:10px; align-items:center; flex:1;">

          <img src="${item.image}"
               width="50"
               height="50"
               style="object-fit:cover; border-radius:8px;">

          <div>

            <div class="ci-name">
              ${item.name}
            </div>

            <div class="ci-price">
              ₱${fmt(item.price)} × ${item.qty}
            </div>

            <div style="font-weight:700; color:#2563eb;">
              ₱${fmt(itemTotal)}
            </div>

          </div>

        </div>

        <div class="qty-controls">

          <button class="qty-btn"
                  onclick="changeQty('${id}', -1)">
            −
          </button>

          <span class="qty-val">${item.qty}</span>

          <button class="qty-btn"
                  onclick="changeQty('${id}', 1)"
                  ${item.qty >= item.stock ? 'disabled' : ''}>
            +
          </button>

          <!-- DELETE BUTTON -->
          <button class="qty-btn"
                  onclick="removeItem('${id}')"
                  style="background:#ef4444; color:white;">
            🗑
          </button>

        </div>

      </div>
    `;
  });

  container.innerHTML = html;

  // CART COUNT
  const totalItems = ids.reduce((sum, id) => {
    return sum + cart[id].qty;
  }, 0);

  document.getElementById('cartCount').textContent = totalItems;

  // VAT
  const vatIncluded =
    document.getElementById('vatToggle')?.checked;

  let vat = 0;
  let total = subtotal;

  if (vatIncluded) {

    vat = subtotal * 0.12;
    total = subtotal + vat;

  }

  // UPDATE TOTALS
  document.getElementById('subtotal').textContent =
    '₱' + fmt(subtotal);

  document.getElementById('vat').textContent =
    '₱' + fmt(vat);

  document.getElementById('total').textContent =
    '₱' + fmt(total);

  // ENABLE PAYMENT BUTTON
  document.getElementById('payBtn').disabled = false;
}
/* =========================================================
   PAYMENT
========================================================= */

function proceedPayment() {

  const totalText =
    document.getElementById('total').textContent;

  document.getElementById('payTotalDisplay').textContent =
    totalText;

  document.getElementById('cashInput').value = '';

  document.getElementById('changeDisplay').style.display =
    'none';

  document.getElementById('confirmPayBtn').disabled =
    true;

  new bootstrap.Modal(
    document.getElementById('payModal')
  ).show();
}

/* =========================================================
   CHANGE
========================================================= */

function calcChange() {

  const cash =
    parseFloat(
      document.getElementById('cashInput').value
    ) || 0;

  const total =
    parseFloat(
      document.getElementById('total')
      .textContent
      .replace(/[₱,]/g, '')
    ) || 0;

  const change = cash - total;

  const disp =
    document.getElementById('changeDisplay');

  const btn =
    document.getElementById('confirmPayBtn');

  if (cash >= total && total > 0) {

    disp.style.display = 'flex';

    document.getElementById('changeAmt').textContent =
      '₱' + fmt(change);

    btn.disabled = false;

  } else {

    disp.style.display = 'none';

    btn.disabled = true;

  }
}

/* =========================================================
   CONFIRM PAYMENT
========================================================= */

function confirmPayment() {

  if (Object.keys(cart).length === 0) return;

  fetch("process_order.php", {

    method: "POST",

    headers: {
      "Content-Type":
      "application/x-www-form-urlencoded"
    },

    body:
      "cart=" +
      encodeURIComponent(JSON.stringify(cart))

  })

  .then(res => res.json())

  .then(data => {

    if (data.status === "success") {

      const payModal =
        bootstrap.Modal.getInstance(
          document.getElementById('payModal')
        );

      if (payModal) payModal.hide();

      new bootstrap.Modal(
        document.getElementById('successModal')
      ).show();

      clearCart();

      setTimeout(() => {

        location.reload();

      }, 1000);

    } else {

      showToast(
        "Error processing order",
        "warning"
      );

    }

  });
}

/* =========================================================
   HELPERS
========================================================= */

function fmt(n) {

  return Number(n).toLocaleString('en-PH', {

    minimumFractionDigits: 2,
    maximumFractionDigits: 2

  });

}

function escHtml(str) {

  return String(str)

    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');

}

function showToast(msg, type='info') {

  const t = document.createElement('div');

  t.textContent = msg;

  t.style.cssText = `

    position:fixed;
    bottom:20px;
    left:50%;
    transform:translateX(-50%);

    background:${
      type==='warning'
      ? '#d97706'
      : '#2563eb'
    };

    color:#fff;

    padding:10px 20px;

    border-radius:8px;

    font-size:13px;

    z-index:9999;

  `;

  document.body.appendChild(t);

  setTimeout(() => t.remove(), 2000);
}
// INITIAL LOAD
renderCart();