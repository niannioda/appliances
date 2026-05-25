let cart = {};

/* ───────────────── ADD TO CART ───────────────── */
function addToCart(btn) {

  const card = btn.closest('.product-card');

  const id    = card.dataset.id;
  const name  = card.dataset.name;
  const price = parseFloat(card.dataset.price);
  const stock = parseInt(card.dataset.stock);
  const image = card.dataset.image;

  // If product already exists → increase qty
  if (cart[id]) {

    if (cart[id].qty < stock) {
      cart[id].qty++;
    } else {
      showToast("Stock limit reached!", "warning");
      return;
    }

  } else {

    // Add new product
    cart[id] = {
      id,
      name,
      price,
      stock,
      image,
      qty: 1
    };

  }

  renderCart();
}

/* ───────────────── CHANGE QTY ───────────────── */
function changeQty(id, action) {

  if (!cart[id]) return;

  if (action === 'plus') {

    if (cart[id].qty < cart[id].stock) {
      cart[id].qty++;
    } else {
      showToast("No more stock available!", "warning");
      return;
    }

  }

  if (action === 'minus') {

    cart[id].qty--;

    // remove item if qty = 0
    if (cart[id].qty <= 0) {
      delete cart[id];
    }

  }

  renderCart();
}

/* ───────────────── REMOVE ITEM ───────────────── */
function removeItem(id) {

  delete cart[id];

  renderCart();
}

/* ───────────────── CLEAR CART ───────────────── */
function clearCart() {

  cart = {};

  renderCart();
}

/* ───────────────── RENDER CART ───────────────── */
function renderCart() {

  const orderItems = document.getElementById('orderItems');

  let html = '';

  let subtotal = 0;

  const ids = Object.keys(cart);

  // Empty cart
  if (ids.length === 0) {

    orderItems.innerHTML = `
      <div id="cartEmpty" style="padding:20px; text-align:center; color:#777;">
        No items yet
      </div>
    `;

    document.getElementById('subtotal').textContent = '₱0.00';
    document.getElementById('total').textContent = '₱0.00';
    document.getElementById('cartCount').textContent = '0';

    return;
  }

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

        <!-- PRODUCT IMAGE -->
        <img src="${item.image}"
          width="55"
          height="55"
          style="
            object-fit:cover;
            border-radius:8px;
          ">

        <!-- PRODUCT INFO -->
        <div style="flex:1; min-width:0;">

          <div style="
            font-weight:600;
            font-size:14px;
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
          ">
            ${item.name}
          </div>

          <div style="
            font-size:13px;
            color:#666;
          ">
            ₱${fmt(item.price)} × ${item.qty}
            =
            ₱${fmt(item.price * item.qty)}
          </div>

        </div>

        <!-- QTY CONTROLS -->
        <div style="
          display:flex;
          align-items:center;
          gap:5px;
        ">

          <button onclick="changeQty('${id}','minus')"
            style="
              width:28px;
              height:28px;
              border:none;
              border-radius:6px;
              cursor:pointer;
            ">
            −
          </button>

          <span>${item.qty}</span>

          <button onclick="changeQty('${id}','plus')"
            style="
              width:28px;
              height:28px;
              border:none;
              border-radius:6px;
              cursor:pointer;
            ">
            +
          </button>

        </div>

        <!-- REMOVE BUTTON -->
        <button onclick="removeItem('${id}')"
          style="
            border:none;
            background:red;
            color:white;
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

  orderItems.innerHTML = html;

  // VAT
  const vatEnabled = document.getElementById('vatToggle')?.checked;

  const vat = vatEnabled ? subtotal * 0.12 : 0;

  const total = subtotal + vat;

  // UPDATE UI
  document.getElementById('subtotal').textContent =
    '₱' + fmt(subtotal);

  document.getElementById('vatAmount').textContent =
    '₱' + fmt(vat);

  document.getElementById('total').textContent =
    '₱' + fmt(total);

  // CART COUNT
  const totalQty = ids.reduce((sum, id) => {
    return sum + cart[id].qty;
  }, 0);

  document.getElementById('cartCount').textContent =
    totalQty;
}

/* ───────────────── HELPERS ───────────────── */
function fmt(n) {

  return Number(n).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

}

function showToast(msg, type='info') {

  const t = document.createElement('div');

  t.textContent = msg;

  t.style.cssText = `
    position:fixed;
    bottom:20px;
    left:50%;
    transform:translateX(-50%);
    background:${type==='warning' ? '#d97706' : '#2563eb'};
    color:#fff;
    padding:10px 20px;
    border-radius:8px;
    z-index:9999;
    font-size:13px;
  `;

  document.body.appendChild(t);

  setTimeout(() => t.remove(), 2000);
}