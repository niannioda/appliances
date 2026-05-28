/* =========================================================
   CART SYSTEM
========================================================= */

let cart = [];

/* =========================
   ADD TO CART
========================= */
function addToCart(btn) {

    const card = btn.closest(".product-card");

    const id = card.dataset.id;
    const name = card.dataset.name;
    const price = parseFloat(card.dataset.price);
    const image = card.dataset.image;
    const stock = parseInt(card.dataset.stock);

    let existing = cart.find(item => item.id === id);

    if (existing) {

        if (existing.qty >= stock) {
            alert("Not enough stock.");
            return;
        }

        existing.qty++;

    } else {

        cart.push({
            id,
            name,
            price,
            image,
            stock,
            qty: 1
        });

    }

    renderCart();
}

/* =========================
   RENDER CART
========================= */
function renderCart() {

    const orderItems = document.getElementById("orderItems");
    const cartEmpty = document.getElementById("cartEmpty");

    orderItems.innerHTML = "";

    if (cart.length === 0) {

        orderItems.appendChild(cartEmpty);

        document.getElementById("subtotal").innerText = "₱0.00";
        document.getElementById("vat").innerText = "₱0.00";
        document.getElementById("total").innerText = "₱0.00";

        document.getElementById("cartCount").innerText = "0";

        document.getElementById("payBtn").disabled = true;

        return;
    }

    let subtotal = 0;
    let totalQty = 0;

    cart.forEach((item, index) => {

        subtotal += item.price * item.qty;
        totalQty += item.qty;

        const div = document.createElement("div");

        div.className = "cart-item mb-3";

        div.innerHTML = `
            <div class="d-flex align-items-center gap-2">

                <img src="${item.image}"
                     width="60"
                     height="60"
                     style="object-fit:cover;border-radius:10px;">

                <div class="flex-grow-1">

                    <div class="fw-semibold">${item.name}</div>

                    <small>
                        ₱${item.price.toLocaleString()} × ${item.qty}
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

        orderItems.appendChild(div);

    });

    const vatEnabled =
        document.getElementById("vatToggle").checked;

    const vat = vatEnabled ? subtotal * 0.12 : 0;

    const total = subtotal + vat;

    document.getElementById("subtotal").innerText =
        "₱" + subtotal.toLocaleString(undefined, {
            minimumFractionDigits: 2
        });

    document.getElementById("vat").innerText =
        "₱" + vat.toLocaleString(undefined, {
            minimumFractionDigits: 2
        });

    document.getElementById("total").innerText =
        "₱" + total.toLocaleString(undefined, {
            minimumFractionDigits: 2
        });

    document.getElementById("cartCount").innerText =
        totalQty;

    document.getElementById("payBtn").disabled = false;
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
   PAYMENT MODAL
========================= */
function proceedPayment() {

    const totalText =
        document.getElementById("total").innerText;

    document.getElementById("payTotalDisplay").innerText =
        totalText;

    document.getElementById("cashInput").value = "";

    document.getElementById("changeDisplay").style.display =
        "none";

    document.getElementById("confirmPayBtn").disabled = true;

    const modal =
        new bootstrap.Modal(document.getElementById("payModal"));

    modal.show();
}

/* =========================
   CALCULATE CHANGE
========================= */
function calcChange() {

    const total =
        parseFloat(
            document.getElementById("total")
                .innerText
                .replace(/[₱,]/g, "")
        );

    const cash =
        parseFloat(
            document.getElementById("cashInput").value
        ) || 0;

    const change = cash - total;

    if (cash >= total) {

        document.getElementById("changeDisplay").style.display =
            "flex";

        document.getElementById("changeAmt").innerText =
            "₱" + change.toLocaleString(undefined, {
                minimumFractionDigits: 2
            });

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

    bootstrap.Modal.getInstance(
        document.getElementById("payModal")
    ).hide();

    const successModal =
        new bootstrap.Modal(
            document.getElementById("successModal")
        );

    successModal.show();
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