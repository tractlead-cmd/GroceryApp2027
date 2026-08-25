/* =========================================================
   SRI RAGHAVENDRA GROCERY
   BILLING & INVENTORY SYSTEM
   Application JavaScript (Complete & Fully Integrated)
========================================================= */

/* =========================================================
   1. SAMPLE PRODUCT DATABASE
========================================================= */
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
let selectedSearchIndex = -1;

/* =========================================================
   2. DOM ELEMENTS
========================================================= */
const productSearch = document.getElementById("productSearch");
const searchResults = document.getElementById("searchResults");
const billItems = document.getElementById("billItems");
const itemCount = document.getElementById("itemCount");
const totalMrp = document.getElementById("totalMrp");
const totalSavings = document.getElementById("totalSavings");
const grandTotal = document.getElementById("grandTotal");
const invoiceNumber = document.getElementById("invoiceNumber");
const invoiceDate = document.getElementById("invoiceDate");
const customerPhone = document.getElementById("customerPhone");
const customerName = document.getElementById("customerName");
const paymentMethod = document.getElementById("paymentMethod");
const todaySales = document.getElementById("todaySales");
const todayBills = document.getElementById("todayBills");
const todayItems = document.getElementById("todayItems");
const totalProducts = document.getElementById("totalProducts");
const lowStock = document.getElementById("lowStock");
const outOfStock = document.getElementById("outOfStock");

/* =========================================================
   3. APPLICATION INITIALIZATION
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    setInvoiceNumber();
    setInvoiceDate();
    updateInventoryStats();
    updateSalesDashboard();
    renderBill();
    setupEventListeners();
    setupKeyboardShortcuts();
});

/* =========================================================
   4. GLOBAL KEYBOARD SHORTCUTS (Ctrl+S, Q, P, N)
========================================================= */
function setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
        const isCtrl = e.ctrlKey || e.metaKey;
        if (!isCtrl) return;

        const key = e.key.toLowerCase();
        if (key === 's') { e.preventDefault(); saveBill(); }
        else if (key === 'q') { e.preventDefault(); clearBill(); }
        else if (key === 'p') { e.preventDefault(); printBill(); }
        else if (key === 'n') { e.preventDefault(); newBill(); }
    });
}

/* =========================================================
   5. EVENT LISTENERS & DELEGATION
========================================================= */
function setupEventListeners() {
    /* Product Search Input (Master Search + In-Bill Real-time Filter) */
    if (productSearch) {
        productSearch.addEventListener("input", (e) => {
            handleProductSearch();
            filterTableRows(e.target.value.trim().toLowerCase());
        });
        productSearch.addEventListener("keydown", handleSearchKeyDown);
    }

    /* Close Dropdown on Outside Click */
    document.addEventListener("click", (event) => {
        if (productSearch && !event.target.closest(".product-search-section") && !event.target.closest("#searchResults")) {
            hideSearchResults();
        }
    });

    /* Direct delegation for + / - / x buttons in table */
    if (billItems) {
        billItems.addEventListener("click", (e) => {
            const btn = e.target.closest("button");
            if (!btn) return;

            e.stopPropagation();

            const id = Number(btn.getAttribute("data-id"));
            const action = btn.getAttribute("data-action");

            if (action === "increase") changeQuantity(id, 1);
            else if (action === "decrease") changeQuantity(id, -1);
            else if (action === "remove") removeProduct(id);
        });
    }

    /* Helper for Quick Element Click Bindings */
    const bindClick = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("click", fn);
    };

    bindClick("clearBillBtn", clearBill);
    bindClick("printBillBtn", printBill);
    bindClick("saveBillBtn", saveBill);
    bindClick("newBillBtn", newBill);
    bindClick("scanBtn", () => alert("Barcode scanner functionality will be added later."));
    bindClick("addProductBtn", openProductModal);
    bindClick("productsBtn", openProductModal);
    bindClick("closeProductModal", closeProductModal);
    bindClick("cancelProductBtn", closeProductModal);

    const productForm = document.getElementById("productForm");
    if (productForm) productForm.addEventListener("submit", addNewProduct);

    bindClick("importExcelBtn", importExcel);
    bindClick("viewSalesBtn", () => alert("Sales history will be added in the next stage."));
    bindClick("salesBtn", () => alert("Sales history will be added in the next stage."));
    bindClick("settingsBtn", () => alert("Settings will be added later."));
}

/* =========================================================
   6. REAL-TIME TABLE FILTERING (FILTER ADDED ITEMS)
========================================================= */
function filterTableRows(query) {
    if (!billItems) return;
    const rows = billItems.querySelectorAll("tr");

    rows.forEach(row => {
        if (row.classList.contains("empty-bill")) return;

        const productNameCell = row.querySelector("td:first-child");
        if (productNameCell) {
            const text = productNameCell.textContent.toLowerCase();
            if (text.includes(query)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        }
    });
}

/* =========================================================
   7. QUANTITY MODIFIERS & REMOVE
========================================================= */
function changeQuantity(id, delta) {
    const item = currentBill.find(p => Number(p.id) === Number(id));
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        removeProduct(id);
    } else {
        renderBill();
    }
}

function removeProduct(id) {
    currentBill = currentBill.filter(item => Number(item.id) !== Number(id));
    renderBill();
}

/* =========================================================
   8. PRODUCT CATALOG SEARCH & ARROW KEY NAVIGATION
========================================================= */
function handleProductSearch() {
    const searchTerm = productSearch.value.trim().toLowerCase();
    selectedSearchIndex = -1;

    if (!searchTerm) {
        hideSearchResults();
        return;
    }

    const matches = products.filter(product =>
        product && product.name && String(product.name).toLowerCase().includes(searchTerm)
    );

    displaySearchResults(matches);
}

function handleSearchKeyDown(e) {
    if (!searchResults || searchResults.style.display === "none") return;

    const results = searchResults.querySelectorAll(".search-result-item");
    if (results.length === 0) return;

    if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedSearchIndex = (selectedSearchIndex + 1) % results.length;
        updateSearchHighlight(results);
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedSearchIndex = (selectedSearchIndex - 1 + results.length) % results.length;
        updateSearchHighlight(results);
    } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedSearchIndex > -1 && results[selectedSearchIndex]) {
            results[selectedSearchIndex].click();
        } else if (results.length > 0) {
            results[0].click();
        }
    } else if (e.key === "Escape") {
        hideSearchResults();
    }
}

function displaySearchResults(matches) {
    if (!searchResults) return;
    searchResults.innerHTML = "";

    if (matches.length === 0) {
        searchResults.innerHTML = `
            <div style="padding:12px; text-align:center; color:#929b99; font-size:12px;">
                No products found
            </div>
        `;
        searchResults.style.display = "block";
        return;
    }

    matches.forEach((product) => {
        const result = document.createElement("div");
        result.className = "search-result-item";
        result.style.cssText = `
            width:100%; padding:10px 14px; border-bottom:1px solid #eef1f0;
            background:#fff; display:flex; align-items:center; justify-content:space-between;
            gap:15px; text-align:left; cursor:pointer; color:#1b2422;
        `;

        result.innerHTML = `
            <div>
                <strong style="display:block; font-size:12px; color:#1b2422; margin-bottom:2px;">
                    ${escapeHTML(product.name)}
                </strong>
                <span style="font-size:10px; color:#929b99;">
                    ${escapeHTML(product.category || 'General')} · ${escapeHTML(product.unit || 'piece')}
                </span>
            </div>
            <div style="text-align:right; white-space:nowrap;">
                <strong style="display:block; font-size:12px; color:#176b5b;">
                    ₹${formatMoney(product.salePrice)}
                </strong>
                <span style="font-size:10px; color:#929b99; text-decoration:line-through;">
                    ₹${formatMoney(product.mrp)}
                </span>
            </div>
        `;

        result.addEventListener("click", () => { addProductToBill(product); });
        searchResults.appendChild(result);
    });

    searchResults.style.display = "block";
}

function updateSearchHighlight(results) {
    results.forEach((item, index) => {
        if (index === selectedSearchIndex) {
            item.style.background = "#eef7f5";
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

/* =========================================================
   9. ADD PRODUCT TO BILL
========================================================= */
function addProductToBill(product) {
    const existing = currentBill.find(item => Number(item.id) === Number(product.id));

    if (existing) {
        existing.quantity += 1;
    } else {
        currentBill.push({
            id: product.id,
            name: String(product.name),
            mrp: Number(product.mrp) || 0,
            salePrice: Number(product.salePrice) || 0,
            unit: String(product.unit || 'piece'),
            category: String(product.category || 'General'),
            quantity: 1
        });
    }

    productSearch.value = "";
    hideSearchResults();
    renderBill();
    productSearch.focus();
}

/* =========================================================
   10. RENDER BILL & TOTALS
========================================================= */
function renderBill() {
    if (!billItems) return;
    billItems.innerHTML = "";

    if (currentBill.length === 0) {
        billItems.innerHTML = `
            <tr class="empty-bill">
                <td colspan="7" style="text-align:center; padding:30px; color:#888;">
                    <h4>No products added</h4>
                    <p style="font-size:12px;">Search for a product above to start the bill.</p>
                </td>
            </tr>
        `;
        updateTotals();
        return;
    }

    currentBill.forEach(item => {
        const row = document.createElement("tr");
        const itemDiscount = (item.mrp - item.salePrice) * item.quantity;
        const itemAmount = item.salePrice * item.quantity;

        row.innerHTML = `
            <td>
                <div style="font-weight:700; font-size:12px;">${escapeHTML(item.name)}</div>
                <div style="font-size:10px; color:#888; margin-top:2px;">${escapeHTML(item.unit)}</div>
            </td>
            <td>
                <div style="display:inline-flex; align-items:center; gap:6px;">
                    <button type="button" data-action="decrease" data-id="${item.id}"
                        style="width:26px; height:26px; border:1px solid #ccc; border-radius:4px; background:#fff; cursor:pointer; font-weight:bold;">−</button>
                    <span style="min-width:20px; text-align:center; font-weight:bold;">${item.quantity}</span>
                    <button type="button" data-action="increase" data-id="${item.id}"
                        style="width:26px; height:26px; border:1px solid #ccc; border-radius:4px; background:#fff; cursor:pointer; font-weight:bold;">+</button>
                </div>
            </td>
            <td>₹${formatMoney(item.mrp)}</td>
            <td><strong>₹${formatMoney(item.salePrice)}</strong></td>
            <td><span style="color:#28a745; font-weight:bold;">₹${formatMoney(itemDiscount)}</span></td>
            <td><strong>₹${formatMoney(itemAmount)}</strong></td>
            <td>
                <button type="button" data-action="remove" data-id="${item.id}"
                    style="width:26px; height:26px; border:0; border-radius:4px; background:#f8d7da; color:#721c24; font-weight:bold; cursor:pointer;" title="Remove">×</button>
            </td>
        `;
        billItems.appendChild(row);
    });

    /* Apply active filter text if user has search query typed */
    if (productSearch && productSearch.value.trim()) {
        filterTableRows(productSearch.value.trim().toLowerCase());
    }

    updateTotals();
}

function updateTotals() {
    let mrpTotal = 0, saleTotal = 0, totalItems = 0;

    currentBill.forEach(item => {
        mrpTotal += item.mrp * item.quantity;
        saleTotal += item.salePrice * item.quantity;
        totalItems += item.quantity;
    });

    const savings = mrpTotal - saleTotal;

    if (totalMrp) totalMrp.textContent = "₹" + formatMoney(mrpTotal);
    if (totalSavings) totalSavings.textContent = "₹" + formatMoney(savings);
    if (grandTotal) grandTotal.textContent = "₹" + formatMoney(saleTotal);
    if (itemCount) itemCount.textContent = totalItems + (totalItems === 1 ? " Item" : " Items");
}

/* =========================================================
   11. BILL MANAGEMENT (CLEAR, NEW, SAVE, PRINT)
========================================================= */
function clearBill() {
    if (currentBill.length === 0) return;
    if (!confirm("Are you sure you want to clear this bill?")) return;

    currentBill = [];
    if (customerPhone) customerPhone.value = "";
    if (customerName) customerName.value = "";
    if (paymentMethod) paymentMethod.value = "cash";
    if (productSearch) productSearch.value = "";
    hideSearchResults();
    renderBill();
}

function newBill() {
    if (currentBill.length > 0 && !confirm("Start a new bill? The current bill will be cleared.")) return;

    currentBill = [];
    if (customerPhone) customerPhone.value = "";
    if (customerName) customerName.value = "";
    if (paymentMethod) paymentMethod.value = "cash";
    if (productSearch) productSearch.value = "";
    hideSearchResults();
    setInvoiceNumber();
    setInvoiceDate();
    renderBill();
    if (productSearch) productSearch.focus();
}

function saveBill() {
    if (currentBill.length === 0) {
        alert("Please add at least one product before saving.");
        return;
    }

    const bill = {
        invoiceNumber: invoiceNumber ? invoiceNumber.textContent : '#000000',
        date: new Date().toISOString(),
        customerPhone: customerPhone ? customerPhone.value.trim() : '',
        customerName: customerName ? customerName.value.trim() : '',
        paymentMethod: paymentMethod ? paymentMethod.value : 'cash',
        items: [...currentBill],
        totalMrp: calculateMrpTotal(),
        savings: calculateSavings(),
        grandTotal: calculateGrandTotal()
    };

    let savedBills = JSON.parse(localStorage.getItem("groceryBills")) || [];
    savedBills.push(bill);
    localStorage.setItem("groceryBills", JSON.stringify(savedBills));

    const currentNumber = Number(localStorage.getItem("groceryInvoiceNumber")) || 1;
    localStorage.setItem("groceryInvoiceNumber", currentNumber + 1);

    alert("Bill saved successfully!");
    updateSalesDashboard();
}

function calculateMrpTotal() {
    return currentBill.reduce((t, item) => t + item.mrp * item.quantity, 0);
}

function calculateGrandTotal() {
    return currentBill.reduce((t, item) => t + item.salePrice * item.quantity, 0);
}

function calculateSavings() {
    return calculateMrpTotal() - calculateGrandTotal();
}

function printBill() {
    if (currentBill.length === 0) {
        alert("Please add products before printing.");
        return;
    }
    window.print();
}

/* =========================================================
   12. DASHBOARD & INVENTORY HELPERS
========================================================= */
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

function openProductModal() {
    const modal = document.getElementById("productModal");
    if (modal) {
        modal.hidden = false;
        setTimeout(() => {
            const pName = document.getElementById("productName");
            if (pName) pName.focus();
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
    const category = document.getElementById("productCategory") ? document.getElementById("productCategory").value.trim() : "General";

    if (!name) { alert("Please enter the product name."); return; }
    if (salePrice > mrp) { alert("Sale price cannot be higher than MRP."); return; }

    const newProduct = {
        id: Date.now(),
        name: name,
        mrp: mrp,
        salePrice: salePrice,
        unit: unit,
        category: category || "General"
    };

    products.push(newProduct);
    saveProducts();
    updateInventoryStats();
    closeProductModal();
    alert(`${name} added successfully!`);
}

function saveProducts() {
    localStorage.setItem("groceryProducts", JSON.stringify(products));
}

function loadProducts() {
    const savedProducts = localStorage.getItem("groceryProducts");
    if (savedProducts) {
        try { products = JSON.parse(savedProducts); } 
        catch (e) { console.error("Load error:", e); }
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
        sales += Number(bill.grandTotal || 0);
        if (bill.items) {
            bill.items.forEach(item => { items += Number(item.quantity || 0); });
        }
    });

    if (todaySales) todaySales.textContent = "₹" + formatMoney(sales);
    if (todayBills) todayBills.textContent = todayBillsList.length;
    if (todayItems) todayItems.textContent = items;
}

/* =========================================================
   13. EXCEL & CSV IMPORTER
========================================================= */
function importExcel() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".xlsx, .xls, .csv";
    fileInput.style.display = "none";

    fileInput.addEventListener("change", handleExcelFile);
    document.body.appendChild(fileInput);
    fileInput.click();

    setTimeout(() => { fileInput.remove(); }, 1000);
}

function handleExcelFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    const isCsv = file.name.toLowerCase().endsWith('.csv');

    if (isCsv) {
        reader.onload = function (e) {
            try {
                const text = e.target.result;
                const lines = text.split(/\r\n|\n/);
                const importedProducts = [];

                lines.forEach((line, index) => {
                    if (index === 0 || !line.trim()) return;
                    const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                    if (cols.length >= 3) {
                        const name = cols[0] ? cols[0].replace(/^"|"$/g, '').trim() : '';
                        const mrp = parseFloat(cols[1] ? cols[1].replace(/[^0-9.]/g, '') : 0) || 0;
                        const salePrice = parseFloat(cols[2] ? cols[2].replace(/[^0-9.]/g, '') : mrp) || mrp;
                        const category = cols[3] ? cols[3].replace(/^"|"$/g, '').trim() : 'General';
                        const unit = cols[4] ? cols[4].replace(/^"|"$/g, '').trim() : 'piece';

                        if (name) {
                            importedProducts.push({
                                id: Date.now() + index,
                                name: name,
                                mrp: mrp,
                                salePrice: salePrice,
                                category: category,
                                unit: unit
                            });
                        }
                    }
                });

                if (importedProducts.length > 0) {
                    products = importedProducts;
                    saveProducts();
                    updateInventoryStats();
                    alert(`Successfully imported ${importedProducts.length} products!`);
                } else {
                    alert("No valid products found in CSV.");
                }
            } catch (err) {
                alert("Error parsing CSV file: " + err.message);
            }
        };
        reader.readAsText(file);
    } else {
        if (typeof XLSX === "undefined") {
            alert("Excel import library (SheetJS) is not loaded. Add <script src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'></script> to your HTML.");
            return;
        }

        reader.onload = function (excelEvent) {
            try {
                const data = new Uint8Array(excelEvent.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                const importedProducts = [];
                rows.forEach((row, index) => {
                    const name = String(row["Item Name"] || row["Name"] || "").trim();
                    const mrp = Number(row["MRP"] || 0);
                    const salePrice = Number(row["Sale Price"] || row["Price"] || mrp);
                    const category = String(row["Category"] || "General").trim();
                    const unit = String(row["Unit"] || "piece").trim();
                    const id = row["Item Code"] ? String(row["Item Code"]).trim() : (Date.now() + index);

                    if (name && !isNaN(mrp)) {
                        importedProducts.push({ id, name, mrp, salePrice, unit, category });
                    }
                });

                if (importedProducts.length > 0) {
                    products = importedProducts;
                    saveProducts();
                    updateInventoryStats();
                    alert(`Successfully imported ${importedProducts.length} products!`);
                } else {
                    alert("No valid products found in Excel file.");
                }
            } catch (error) {
                alert("Unable to read Excel file: " + error.message);
            }
        };
        reader.readAsArrayBuffer(file);
    }
}

/* =========================================================
   14. FORMATTING UTILITIES
========================================================= */
function formatMoney(amount) {
    return Number(amount || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function escapeHTML(value) {
    return String(value || "").replace(/[&<>"']/g, character => {
        const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
        return entities[character];
    });
}
