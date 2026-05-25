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

  let html = '';

  let subtotal = 0;

  const ids = Object.keys(cart);

  // EMPTY
  if (ids.length === 0) {

    container.innerHTML = `

      <div class="cart-empty" id="cartEmpty">

        <i class="bi bi-cart-x"></i>

        <p>No items yet</p>

        <small>Click + on a product to add</small>

      </div>

    `;

    document.getElementById('subtotal').textContent = '₱0.00';
    document.getElementById('vatAmount').textContent = '₱0.00';
    document.getElementById('total').textContent = '₱0.00';
    document.getElementById('cartCount').textContent = '0';

    return;
  }

  // PRODUCTS
  ids.forEach(id => {

    const item = cart[id];

    subtotal += item.price * item.qty;

    html += `

      <div class="cart-item"
           style="
             display:flex;
             align-items:center;
             gap:10px;
             margin-bottom:15px;
             border-bottom:1px solid #eee;
             padding-bottom:10px;
           ">

          <!-- IMAGE -->
          <img src="${item.image}"

               width="55"
               height="55"

               style="
                 object-fit:cover;
                 border-radius:8px;
               ">

          <!-- INFO -->
          <div style="flex:1">

              <div class="ci-name">

                ${escHtml(item.name)}

              </div>

              <div class="ci-price">

                ₱${fmt(item.price)}
                ×
                ${item.qty}

                =
                ₱${fmt(item.price * item.qty)}

              </div>

          </div>

          <!-- QUANTITY -->
          <div class="qty-controls"
               style="
                 display:flex;
                 align-items:center;
                 gap:5px;
               ">

              <button class="remove-btn"
        onclick="removeItem('${id}')">

   ×

</button>

              <span class="qty-val">

                ${item.qty}

              </span>

              <button class="qty-btn"

                      onclick="changeQty('${id}','plus')"

                      ${item.qty >= item.stock ? 'disabled' : ''}>

                  +

              </button>

          </div>

          <!-- REMOVE -->
          <button onclick="removeItem('${id}')"

                  style="
                    background:red;
                    color:white;
                    border:none;
                    width:28px;
                    height:28px;
                    border-radius:6px;
                    cursor:pointer;
                  ">

            ×

          </button>

      </div>

    `;
  });

  container.innerHTML = html;

  /* ================= VAT ================= */

  const vatEnabled =
    document.getElementById('vatToggle')?.checked;

  const vat =
    vatEnabled ? subtotal * 0.12 : 0;

  const total =
    subtotal + vat;

  /* ================= UPDATE UI ================= */

  document.getElementById('subtotal').textContent =
    '₱' + fmt(subtotal);

  document.getElementById('vatAmount').textContent =
    '₱' + fmt(vat);

  document.getElementById('total').textContent =
    '₱' + fmt(total);

  /* ================= CART COUNT ================= */

  const totalQty =
    ids.reduce((sum, id) => {

      return sum + cart[id].qty;

    }, 0);

  document.getElementById('cartCount').textContent =
    totalQty;
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