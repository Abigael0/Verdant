const checkoutItems = document.getElementById("checkout-items");
const checkoutSubtotal = document.getElementById("checkout-subtotal");
const checkoutForm = document.getElementById("checkout-form");
const checkoutMessage = document.getElementById("checkout-message");

let basket = [];

try {
    const savedBasket = JSON.parse(
        localStorage.getItem("verdantBasket")
    );

    if (Array.isArray(savedBasket)) {
        basket = savedBasket.filter(item =>
            typeof item.name === "string" &&
            typeof item.price === "number" &&
            Number.isFinite(item.price) &&
            item.price >= 0 &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0
        );
    }
} catch (error) {
    basket = [];
}

function displayCheckout() {
    checkoutItems.replaceChildren();

    if (basket.length === 0) {
        checkoutItems.textContent = "Your basket is empty.";

        checkoutSubtotal.textContent = "$0.00";

        const placeOrderButton =
            document.getElementById("place-order-button");

        placeOrderButton.disabled = true;

        return;
    }

    let subtotal = 0;

    basket.forEach(function(item) {
        const row = document.createElement("div");
        row.className = "checkout-item";

        const name = document.createElement("span");

        name.textContent =
            `${item.name} × ${item.quantity}`;

        const price = document.createElement("strong");

        const itemTotal = item.price * item.quantity;

        price.textContent = `$${itemTotal.toFixed(2)}`;

        row.append(name, price);

        checkoutItems.appendChild(row);

        subtotal += itemTotal;
    });

    checkoutSubtotal.textContent = `$${subtotal.toFixed(2)}`;
}

displayCheckout();

checkoutForm.addEventListener("submit", function(event) {
    event.preventDefault();

    if (basket.length === 0) {
        checkoutMessage.textContent =
            "Your basket is empty. Please return to the shop.";

        return;
    }

    if (!checkoutForm.reportValidity()) {
        return;
    }

    checkoutMessage.textContent =
        "Your details have been entered successfully. " 
});