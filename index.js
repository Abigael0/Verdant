const basketCount = document.getElementById("basket-count");
const basketButton = document.getElementById("basket-button");

const basketPanel = document.getElementById("basket-panel");
const basketOverlay = document.getElementById("basket-overlay");
const closeBasketButton = document.getElementById("close-basket");

const basketItemsContainer = document.getElementById("basket-items");
const basketSubtotal = document.getElementById("basket-subtotal");
const checkoutButton = document.getElementById("checkout-button");

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

function formatPrice(amount) {
    return "$" + amount.toFixed(2);
}

function openBasket() {
    basketPanel.classList.add("open");
    basketOverlay.classList.add("show");

    document.body.classList.add("basket-open");

    basketPanel.setAttribute("aria-hidden", "false");
}

function closeBasket() {
    basketPanel.classList.remove("open");
    basketOverlay.classList.remove("show");

    document.body.classList.remove("basket-open");

    basketPanel.setAttribute("aria-hidden", "true");
}

function updateBasketCount() {
    const totalItems = basket.reduce(
        (total, item) => total + item.quantity,
        0
    );

    basketCount.textContent = totalItems;
}

function renderBasket() {
    basketItemsContainer.innerHTML = "";

    if (basket.length === 0) {
        basketItemsContainer.innerHTML = `
            <p class="empty-basket">Your basket is empty.</p>
        `;
    }

    basket.forEach(function (item) {
        const itemElement = document.createElement("div");

        itemElement.className = "basket-item";

        const itemInfo = document.createElement("div");
        itemInfo.className = "basket-item-info";

        const itemName = document.createElement("h3");
        itemName.textContent = item.name;

        const itemPrice = document.createElement("p");
        itemPrice.textContent = `${formatPrice(item.price)} each`;

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "remove-item";
        removeButton.dataset.action = "remove";
        removeButton.dataset.name = item.name;
        removeButton.textContent = "Remove";

        itemInfo.append(itemName, itemPrice, removeButton);

        const actions = document.createElement("div");
        actions.className = "basket-item-actions";

        const decreaseButton = document.createElement("button");
        decreaseButton.type = "button";
        decreaseButton.className = "quantity-button";
        decreaseButton.dataset.action = "decrease";
        decreaseButton.dataset.name = item.name;
        decreaseButton.setAttribute(
            "aria-label",
            `Decrease ${item.name} quantity`
        );
        decreaseButton.textContent = "−";

        const quantity = document.createElement("span");
        quantity.className = "quantity-number";
        quantity.textContent = item.quantity;

        const increaseButton = document.createElement("button");
        increaseButton.type = "button";
        increaseButton.className = "quantity-button";
        increaseButton.dataset.action = "increase";
        increaseButton.dataset.name = item.name;
        increaseButton.setAttribute(
            "aria-label",
            `Increase ${item.name} quantity`
        );
        increaseButton.textContent = "+";

        actions.append(
            decreaseButton,
            quantity,
            increaseButton
        );

        itemElement.append(itemInfo, actions);

        basketItemsContainer.appendChild(itemElement);
    });

    const subtotal = basket.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    basketSubtotal.textContent = formatPrice(subtotal);

    updateBasketCount();
    
    localStorage.setItem(
        "verdantBasket",
        JSON.stringify(basket)
    );
}

document.querySelectorAll(".add-to-cart").forEach(function (button) {
    button.addEventListener("click", function () {
        const name = this.dataset.name;
        const price = Number(this.dataset.price);

        if (!name || !Number.isFinite(price) || price < 0) {
            console.error("This product has an invalid name or price.");
            return;
        }

        const existingProduct = basket.find(
            item => item.name === name
        );

        if (existingProduct) {
            existingProduct.quantity++;
        } else {
            basket.push({
                name: name,
                price: price,
                quantity: 1
            });
        }

        renderBasket();
    });
});

basketItemsContainer.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const name = button.dataset.name;
    const action = button.dataset.action;

    const item = basket.find(product => product.name === name);

    if (!item) return;

    if (action === "increase") {
        item.quantity++;
    } else if (action === "decrease") {
        item.quantity--;

        if (item.quantity <= 0) {
            basket = basket.filter(
                product => product.name !== name
            );
        }
    } else if (action === "remove") {
        basket = basket.filter(
            product => product.name !== name
        );
    }

    renderBasket();
});

basketButton.addEventListener("click", openBasket);

closeBasketButton.addEventListener("click", closeBasket);

basketOverlay.addEventListener("click", closeBasket);

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeBasket();
    }
});

checkoutButton.addEventListener("click", function() {
    if (basket.length === 0) {
        alert("Your basket is empty. Add some products first!");
        return;
    }

    localStorage.setItem(
        "verdantBasket",
        JSON.stringify(basket)
    );

    window.location.href = "checkout.html";
});

const searchInput = document.getElementById("product-search");

const productCards = document.querySelectorAll(".cart-card");

searchInput.addEventListener("input", function () {

    const searchTerm = this.value.toLowerCase().trim();

    productCards.forEach(card => {

        const productName = card
            .querySelector(".card-name")
            .textContent
            .toLowerCase();

        const category = card.dataset.category || "";

        const matchesSearch =
            productName.includes(searchTerm) ||
            category.includes(searchTerm);

        const activeFilter = document.querySelector(
            ".cart-links-items.active"
        );

        const selectedCategory = activeFilter
            ? activeFilter.dataset.filter
            : "all";

        const matchesCategory =
            selectedCategory === "all" ||
            category === selectedCategory;

        card.style.display =
            matchesSearch && matchesCategory ? "" : "none";

    });

});

const filterButtons = document.querySelectorAll(
    ".cart-links-items"
);

filterButtons.forEach(button => {

    button.addEventListener("click", function () {

        filterButtons.forEach(item => {
            item.classList.remove("active");
        });

        this.classList.add("active");

        const selectedCategory = this.dataset.filter;

        productCards.forEach(card => {

            const category = card.dataset.category;

            const matchesCategory =
                selectedCategory === "all" ||
                category === selectedCategory;

            const searchTerm = searchInput.value
                .toLowerCase()
                .trim();

            const productName = card
                .querySelector(".card-name")
                .textContent
                .toLowerCase();

            const matchesSearch =
                productName.includes(searchTerm) ||
                category.includes(searchTerm);

            card.style.display =
                matchesCategory && matchesSearch ? "" : "none";

        });

    });

});

const zipInput = document.getElementById("zip-code");
const shopFreshButton = document.getElementById("shop-fresh");
const deliveryMessage = document.getElementById("delivery-message");

shopFreshButton.addEventListener("click", function () {

    const zipCode = zipInput.value.trim();

    if (zipCode === "") {

        deliveryMessage.textContent =
            "Please enter your ZIP code.";

        return;
    }

    if (!/^\d{5}$/.test(zipCode)) {

        deliveryMessage.textContent =
            "Please enter a valid 5-digit US ZIP code.";

        return;
    }

    deliveryMessage.textContent =
        "ZIP code accepted! Delivery availability will be confirmed soon.";

});