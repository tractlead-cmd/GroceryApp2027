/* =========================================================
   SRI RAGHAVENDRA GROCERY
   BILLING & INVENTORY SYSTEM
   Application JavaScript (Complete Engine with Keyboard Support)
========================================================= */

/* Default Product Database */
let products = [
    { id: 1, name: "Aashirvaad Atta 5kg", mrp: 320, salePrice: 300, unit: "piece", category: "Atta" },
    { id: 2, name: "India Gate Basmati Rice 5kg", mrp: 650, salePrice: 610, unit: "piece", category: "Rice" },
    { id: 3, name: "Sugar", mrp: 52, salePrice: 48, unit: "kg", category: "Grocery" },
    { id: 4, name: "Toor Dal 1kg", mrp: 180, salePrice: 165, unit: "piece", category: "Dal" },
    { id: 5, name: "Tata Salt 1kg", mrp: 30, salePrice: 28, unit: "piece", category: "Grocery" },
    { id: 6, name: "Fortune Sunflower Oil 1L", mrp: 145, salePrice: 132, unit: "piece", category: "Oil" },
    { id: 7, name: "Bru Coffee 100g", mrp: 110, salePrice: 102, unit: "piece", category: "Beverages" },
    { id: 8, name: "Parle-G Biscuits", mrp: 20, salePrice: 18, unit: "piece", category: "Biscuits" }
];

let currentBill = [];
let selectedSearchIndex = -1; // Track highlighted item in dropdown

/* DOM Element References */
let productSearch, searchResults, billedItemsSearch, billItems;
let itemCount, totalMrp, totalSavings, grandTotal;
let invoiceNumber, invoiceDate, customerPhone, customerName, paymentMethod;
let todaySales, todayBills, todayItems, totalProducts, lowStock, outOfStock;

/* Initialize Application */
document.addEventListener("DOMContentLoaded", () => {
    initElements();
    loadProducts();
    setInvoiceNumber();
    setInvoiceDate();
    updateInventoryStats();
    updateSalesDashboard();
    renderBill();
    setupEventListeners();
    setupGlobalKeyboardShortcuts();
});

/* Bind DOM Elements safely */
function initElements() {
    productSearch = document.getElementById("productSearch");
    searchResults = document.getElementById("searchResults");
    billedItemsSearch = document.getElementById("billedItemsSearch");
    billItems = document.getElementById("billItems");
    
    itemCount = document.getElementById("itemCount");
    totalMrp = document.getElementById("totalMrp");
    totalSavings = document.getElementById("totalSavings");
    grandTotal = document.getElementById("grandTotal");
    
    invoiceNumber = document.getElementById("invoiceNumber");
    invoiceDate = document.getElementById("invoiceDate");
    customerPhone = document.getElementById("customerPhone");
    customerName = document.getElementById("customerName");
    paymentMethod = document.getElementById("paymentMethod");
    
    todaySales = document.getElementById("todaySales");
    todayBills = document.getElementById("todayBills");
    todayItems = document.getElementById("todayItems");
    totalProducts = document.getElementById("totalProducts");
    lowStock = document.getElementById("lowStock");
    outOfStock = document.getElementById("outOfStock");
}

/* Global Keyboard Shortcuts (Ctrl+S, Ctrl+Q, Ctrl+P) */
function setupGlobalKeyboardShortcuts() {
    document.addEventListener("keydown", (event) => {
        // Check for Ctrl key (or Cmd key on Mac)
        const isControl = event.ctrlKey || event.metaKey;

        if (isControl) {
            const key = event.key.toLowerCase();

            if (key === 's') {
                event.preventDefault(); // Prevent browser default "Save Page"
                saveBill();
            } else if (key === 'q') {
                event.preventDefault();
                clearBill();
            } else if (key === 'p') {
                event.preventDefault(); // Prevent default print dialog to ensure bill print fires safely
                printBill();
            }
        }
    });
}

/* Event Listeners Setup */
function setupEventListeners() {
    if (productSearch) {
        productSearch.addEventListener("input", handleProductSearch);
        productSearch.addEventListener("keydown", handleSearchKeyboardNavigation);
    }
    
    if (billedItemsSearch) billedItemsSearch.addEventListener("input", renderBill);

    // Close search dropdown when clicking outside
    document.addEventListener("click", (event) => {
        if (!event.target.closest(".product-search-section")) {
            hideSearchResults();
        }
    });

    // Action Buttons
    bindClick("clearBillBtn", clearBill);
    bindClick("printBillBtn", printBill);
    bindClick("saveBillBtn", saveBill);
    bindClick("newBillBtn", newBill);
    bindClick("scanBtn", () => alert("Barcode scanner functionality will be integrated with camera/scanner input."));

    // Table Actions (Quantity & Remove)
    if (billItems) billItems.addEventListener("click", handleBillItemClick);

    // Modal Events
    bindClick("addProductBtn", openProductModal);
    bindClick("productsBtn", openProductModal);
    bindClick("closeProductModal", closeProductModal);
    bindClick("cancelProductBtn", closeProductModal);
    
    const productForm = document.getElementById("productForm");
    if (productForm) productForm.addEventListener("submit", addNewProduct);

    bindClick("importExcelBtn", importExcel);

    // Navigation placeholders
    const notImplemented = () => alert("This module will be available in the next release.");
    bindClick("viewSalesBtn", notImplemented);
    bindClick("salesBtn", notImplemented);
    bindClick("settingsBtn", notImplemented);
}

function bindClick(id, handler) {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", handler);
}

/* Header Invoice Meta */
function setInvoiceNumber() {
    if (!invoiceNumber) return;
    let savedNumber = Number(localStorage.getItem("groceryInvoiceNumber")) || 1;
    invoiceNumber.textContent = "#" + String(savedNumber).padStart(6, "0");
}

function setInvoiceDate() {
    if (!invoiceDate) return;
    const now = new Date();
    invoiceDate.textContent = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/* Product Search Dropdown & Key Navigation */
function handleProductSearch() {
    const searchTerm = productSearch.value.trim().toLowerCase();
    if (!searchTerm) {
        hideSearchResults();
        return;
    }
    const matches = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        product.category.toLowerCase().includes(searchTerm)
    );
    displaySearchResults(matches);
}

function displaySearchResults(matches) {
    if (!searchResults) return;
    searchResults.innerHTML = "";
    selectedSearchIndex = -1; // Reset selection index on search update

    if (matches.length === 0) {
        searchResults.innerHTML = `<div style="padding:14px;text-align:center;color:#929b99;font-size:12px;">No products found</div>`;
        searchResults.style.display = "block";
        return;
    }

    matches.forEach((product, index) => {
        const result = document.createElement("button");
        result.type = "button";
        result.className = "search-result-item";
        result.dataset.index = index;
        result.style.cssText = "width:100%;padding:10px 14px;border:0;border-bottom:1px solid #eef1f0;background:#fff;display:flex;align-items:center;justify-content:space-between;text-align:left;cursor:pointer;";
        result.innerHTML = `
            <div>
                <strong style="display:block;font-size:12px;color:#1b2422;">${escapeHTML(product.name)}</strong>
                <span style="font-size:10px;color:#929b99;">${escapeHTML(product.category)} · ${escapeHTML(product.unit)}</span>
            </div>
            <div style="text-align:right;">
                <strong style="display:block;font-size:12px;color:#176b5b;">₹${formatMoney(product.salePrice)}</strong>
                <span style="font-size:10px;color:#929b99;text-decoration:line-through;">₹${formatMoney(product.mrp)}</span>
            </div>
        `;
        result.addEventListener("click", () => addProductToBill(product));
        searchResults.appendChild(result);
    });

    searchResults.style.display = "block";
}

/* Handles Keyboard Up/Down/Enter in Search Box */
function handleSearchKeyboardNavigation(event) {
    const items = searchResults.querySelectorAll(".search-result-item");
    if (!items.length || searchResults.style.display === "none") return;

    if (event.key === "ArrowDown") {
        event.preventDefault();
        selectedSearchIndex = (selectedSearchIndex + 1) % items.length;
        updateSearchHighlight(items);
    } else if (event.key === "ArrowUp") {
        event.preventDefault();
        selectedSearchIndex = (selectedSearchIndex - 1 + items.length) % items.length;
        updateSearchHighlight(items);
    } else if (event.key === "Enter") {
        event.preventDefault();
        if (selectedSearchIndex >= 0 && selectedSearchIndex < items.length) {
            items[selectedSearchIndex].click();
        } else if (items.length > 0) {
            items[0].click(); // Default to first item if enter pressed directly
        }
    } else if (event.key === "Escape") {
        hideSearchResults();
    }
}

function updateSearchHighlight(items) {
    items.forEach((item, index) => {
        if (index === selectedSearchIndex) {
            item.style.background = "#176b5b"; // Active highlight color
            item.scrollIntoView({ block: "nearest" });
        } else {
            item.style.background = "#fff";
        }
    });
}

function hideSearchResults() {
    if (searchResults) searchResults.style.display = "none";
    selectedSearchIndex = -1;
}

/* Add Item to Active Bill */
function addProductToBill(product) {
    const existing = currentBill.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        currentBill.push({
            id: product.id,
            name: product.name,
            mrp: Number(product.mrp),
            salePrice: Number(product.salePrice),
            unit: product.unit,
            category: product.category,
            quantity: 1
        });
    }
    if (productSearch) productSearch.value = "";
    hideSearchResults();
    renderBill();
}

/* Bill Item Actions (Delegated) */
function handleBillItemClick(event) {
    const button = event.target.closest("button");
    if (!button) return;

    const id = Number(button.dataset.id);
    const item = currentBill.find(product => product.id === id);

    if (button.classList.contains("quantity-btn")) {
        const action = button.dataset.action;
        if (!item) return;

        if (action === "increase") item.quantity += 1;
        if (action === "decrease") {
            item.quantity -= 1;
            if (item.quantity <= 0) {
                removeProduct(id);
                return;
            }
        }
        renderBill();
    }

    if (button.classList.contains("remove-item")) {
        removeProduct(id);
    }
}

function removeProduct(id) {
    currentBill = currentBill.filter(item => item.id !== id);
    renderBill();
}

/* Render Bill Table & Filter */
function renderBill() {
    if (!billItems) return;
    billItems.innerHTML = "";

    const filterTerm = billedItemsSearch ? billedItemsSearch.value.trim().toLowerCase() : "";
    const visibleItems = currentBill.filter(item => item.name.toLowerCase().includes(filterTerm));

    if (visibleItems.length === 0) {
        billItems.innerHTML = `
            <tr class="empty-bill">
                <td colspan="7">
                    <div class="empty-state">
                        <div class="empty-icon">🛒</div>
                        <h4 style="font-size:14px;color:#1b2422;">${currentBill.length === 0 ? 'No products added yet' : 'No matching item found'}</h4>
                        <p style="font-size:11px;color:#929b99;margin-top:4px;">${currentBill.length === 0 ? 'Search for a product above to start billing.' : 'Try a different search term.'}</p>
                    </div>
                </td>
            </tr>
        `;
        updateTotals();
        return;
    }

    visibleItems.forEach(item => {
        const row = document.createElement("tr");
        const itemDiscount = (item.mrp - item.salePrice) * item.quantity;
        const itemAmount = item.salePrice * item.quantity;

        row.innerHTML = `
            <td>
                <div style="font-weight:700;font-size:12px;">${escapeHTML(item.name)}</div>
                <div style="font-size:9px;color:#929b99;">${escapeHTML(item.unit)}</div>
            </td>
            <td>
                <div style="display:flex;align-items:center;gap:5px;">
                    <button type="button" class="quantity-btn" data-action="decrease" data-id="${item.id}" style="width:24px;height:24px;border:1px solid #e4e9e7;border-radius:4px;background:#fff;cursor:pointer;">−</button>
                    <strong style="min-width:18px;text-align:center;">${item.quantity}</strong>
                    <button type="button" class="quantity-btn" data-action="increase" data-id="${item.id}" style="width:24px;height:24px;border:1px solid #e4e9e7;border-radius:4px;background:#fff;cursor:pointer;">+</button>
                </div>
            </td>
            <td>₹${formatMoney(item.mrp)}</td>
            <td><strong>₹${formatMoney(item.salePrice)}</strong></td>
            <td><span style="color:#16855f;font-weight:700;">₹${formatMoney(itemDiscount)}</span></td>
            <td><strong>₹${formatMoney(itemAmount)}</strong></td>
            <td>
                <button type="button" class="remove-item" data-id="${item.id}" style="width:26px;height:26px;border:0;border-radius:6px;background:#fff0ef;color:#d9534f;font-size:14px;cursor:pointer;">×</button>
            </td>
        `;
        billItems.appendChild(row);
    });

    updateTotals();
}

/* Calculate Totals and Update Savings Banner */
function updateTotals() {
    let mrpTotal = 0;
    let saleTotal = 0;
    let totalQty = 0;

    currentBill.forEach(item => {
        mrpTotal += item.mrp * item.quantity;
        saleTotal += item.salePrice * item.quantity;
        totalQty += item.quantity;
    });

    const savings = mrpTotal - saleTotal;

    if (totalMrp) totalMrp.textContent = "₹" + formatMoney(mrpTotal);
    if (totalSavings) totalSavings.textContent = "₹" + formatMoney(savings);
    if (grandTotal) grandTotal.textContent = "₹" + formatMoney(saleTotal);
    if (itemCount) itemCount.textContent = totalQty + (totalQty === 1 ? " Item" : " Items");

    const thankYouBanner = document.getElementById("billThankYouBanner");
    const bannerSavingsAmount = document.getElementById("bannerSavingsAmount");

    if (thankYouBanner && bannerSavingsAmount) {
        if (currentBill.length > 0) {
            bannerSavingsAmount.textContent = "₹" + formatMoney(savings);
            thankYouBanner.style.display = "block";
        } else {
            thankYouBanner.style.display = "none";
        }
    }
}

/* Clear, Save, and New Bill Actions */
function clearBill() {
    if (currentBill.length === 0) return;
    if (!confirm("Are you sure you want to clear the current bill?")) return;

    resetBillState();
}

function newBill() {
    if (currentBill.length > 0 && !confirm("Start a new bill? The current unsaved bill will be cleared.")) return;

    resetBillState();
    setInvoiceNumber();
    setInvoiceDate();
}

function resetBillState() {
    currentBill = [];
    if (customerPhone) customerPhone.value = "";
    if (customerName) customerName.value = "";
    if (paymentMethod) paymentMethod.value = "cash";
    if (productSearch) productSearch.value = "";
    if (billedItemsSearch) billedItemsSearch.value = "";
    hideSearchResults();
    renderBill();
}

function saveBill() {
    if (currentBill.length === 0) {
        alert("Please add at least one product before saving.");
        return;
    }

    const bill = {
        invoiceNumber: invoiceNumber ? invoiceNumber.textContent : "#000001",
        date: new Date().toISOString(),
        customerPhone: customerPhone ? customerPhone.value.trim() : "",
        customerName: customerName ? customerName.value.trim() : "",
        paymentMethod: paymentMethod ? paymentMethod.value : "cash",
        items: [...currentBill],
        totalMrp: currentBill.reduce((s, i) => s + i.mrp * i.quantity, 0),
        savings: currentBill.reduce((s, i) => s + (i.mrp - i.salePrice) * i.quantity, 0),
        grandTotal: currentBill.reduce((s, i) => s + i.salePrice * i.quantity, 0)
    };

    let savedBills = JSON.parse(localStorage.getItem("groceryBills")) || [];
    savedBills.push(bill);
    localStorage.setItem("groceryBills", JSON.stringify(savedBills));

    const currentNum = Number(localStorage.getItem("groceryInvoiceNumber")) || 1;
    localStorage.setItem("groceryInvoiceNumber", currentNum + 1);

    alert("Bill saved successfully!");
    updateSalesDashboard();
}

function printBill() {
    if (currentBill.length === 0) {
        alert("Please add products to the bill before printing.");
        return;
    }
    window.print();
}

/* Modal and Product Management */
function openProductModal() {
    const modal = document.getElementById("productModal");
    if (modal) {
        modal.hidden = false;
        setTimeout(() => {
            const nameInput = document.getElementById("productName");
            if (nameInput) nameInput.focus();
        }, 100);
    }
}

function closeProductModal() {
    const modal = document.getElementById("productModal");
    if (modal) modal.hidden = true;
    const form = document.getElementById("productForm");
    if (form) form.reset();
}

function addNewProduct(event) {
    event.preventDefault();
    const name = document.getElementById("productName").value.trim();
    const mrp = Number(document.getElementById("productMrp").value);
    const salePrice = Number(document.getElementById("productSalePrice").value);
    const unit = document.getElementById("productUnit").value;
    const category = document.getElementById("productCategory").value.trim();

    if (!name || isNaN(mrp) || isNaN(salePrice) || salePrice > mrp) {
        alert("Please enter valid product details. Sale Price cannot exceed MRP.");
        return;
    }

    products.push({
        id: Date.now(),
        name,
        mrp,
        salePrice,
        unit: unit || "piece",
        category: category || "General"
    });

    saveProducts();
    updateInventoryStats();
    closeProductModal();
    alert(`"${name}" added successfully to inventory!`);
}

function saveProducts() {
    localStorage.setItem("groceryProducts", JSON.stringify(products));
}

function loadProducts() {
    const saved = localStorage.getItem("groceryProducts");
    if (saved) {
        try { products = JSON.parse(saved); } catch (e) { console.error("Could not load products", e); }
    }
}

function updateInventoryStats() {
    if (totalProducts) totalProducts.textContent = products.length;
    if (lowStock) lowStock.textContent = "0";
    if (outOfStock) outOfStock.textContent = "0";
}

function updateSalesDashboard() {
    const bills = JSON.parse(localStorage.getItem("groceryBills")) || [];
    const today = new Date().toISOString().split("T")[0];
    const todayBillsList = bills.filter(bill => bill.date && bill.date.split("T")[0] === today);

    let sales = 0, items = 0;
    todayBillsList.forEach(bill => {
        sales += Number(bill.grandTotal) || 0;
        if (Array.isArray(bill.items)) {
            bill.items.forEach(item => items += Number(item.quantity) || 0);
        }
    });

    if (todaySales) todaySales.textContent = "₹" + formatMoney(sales);
    if (todayBills) todayBills.textContent = todayBillsList.length;
    if (todayItems) todayItems.textContent = items;
}

/* Excel Import Functionality */
function importExcel() {
    if (typeof XLSX === "undefined") {
        alert("SheetJS library missing. Please include xlsx.full.min.js to import Excel files.");
        return;
    }

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".xlsx,.xls";
    fileInput.addEventListener("change", handleExcelFile);
    document.body.appendChild(fileInput);
    fileInput.click();
    setTimeout(() => fileInput.remove(), 1000);
}

function handleExcelFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (excelEvent) {
        try {
            const data = new Uint8Array(excelEvent.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

            if (rows.length === 0) {
                alert("The selected Excel file is empty.");
                return;
            }

            const importedProducts = [];
            rows.forEach((row, index) => {
                const name = String(row["Item Name"] || row["Name"] || "").trim();
                const mrp = Number(row["MRP"]);
                const salePrice = Number(row["Sale Price"] || row["Price"]);

                if (name && !isNaN(mrp) && !isNaN(salePrice) && salePrice <= mrp) {
                    importedProducts.push({
                        id: String(row["Item Code"] || Date.now() + index),
                        name,
                        mrp,
                        salePrice,
                        unit: String(row["Unit"] || "piece").trim(),
                        category: String(row["Category"] || "General").trim()
                    });
                }
            });

            if (importedProducts.length > 0 && confirm(`Found ${importedProducts.length} valid items. Do you want to replace your existing product catalog?`)) {
                products = importedProducts;
                saveProducts();
                updateInventoryStats();
                alert(`Successfully imported ${importedProducts.length} products!`);
            } else if (importedProducts.length === 0) {
                alert("No valid product data found. Please check column headers (Item Name, MRP, Sale Price).");
            }
        } catch (err) {
            alert("Error parsing Excel file. Please ensure it is a valid .xlsx or .xls file.");
        }
    };
    reader.readAsArrayBuffer(file);
}

/* Helper Utilities */
function formatMoney(amount) {
    return Number(amount || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function escapeHTML(str) {
    return String(str || "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[c]));
}
