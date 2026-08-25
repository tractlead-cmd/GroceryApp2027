/* =========================================================
   SRI RAGHAVENDRA GROCERY
   BILLING & INVENTORY SYSTEM
   Application JavaScript
========================================================= */


/* =========================================================
   1. SAMPLE PRODUCT DATABASE
   ---------------------------------------------------------
   These are temporary products for testing.
   Later, we will replace/import these using Excel.
========================================================= */

let products = [
    {
        id: 1,
        name: "Aashirvaad Atta 5kg",
        mrp: 320,
        salePrice: 300,
        unit: "piece",
        category: "Atta"
    },

    {
        id: 2,
        name: "India Gate Basmati Rice 5kg",
        mrp: 650,
        salePrice: 610,
        unit: "piece",
        category: "Rice"
    },

    {
        id: 3,
        name: "Sugar",
        mrp: 52,
        salePrice: 48,
        unit: "kg",
        category: "Grocery"
    },

    {
        id: 4,
        name: "Toor Dal 1kg",
        mrp: 180,
        salePrice: 165,
        unit: "piece",
        category: "Dal"
    },

    {
        id: 5,
        name: "Tata Salt 1kg",
        mrp: 30,
        salePrice: 28,
        unit: "piece",
        category: "Grocery"
    },

    {
        id: 6,
        name: "Fortune Sunflower Oil 1L",
        mrp: 145,
        salePrice: 132,
        unit: "piece",
        category: "Oil"
    },

    {
        id: 7,
        name: "Bru Coffee 100g",
        mrp: 110,
        salePrice: 102,
        unit: "piece",
        category: "Beverages"
    },

    {
        id: 8,
        name: "Parle-G Biscuits",
        mrp: 20,
        salePrice: 18,
        unit: "piece",
        category: "Biscuits"
    }
];


/* =========================================================
   2. CURRENT BILL
========================================================= */

let currentBill = [];


/* =========================================================
   3. DOM ELEMENTS
========================================================= */

const productSearch =
    document.getElementById("productSearch");

const searchResults =
    document.getElementById("searchResults");

const billItems =
    document.getElementById("billItems");

const itemCount =
    document.getElementById("itemCount");

const totalMrp =
    document.getElementById("totalMrp");

const totalSavings =
    document.getElementById("totalSavings");

const grandTotal =
    document.getElementById("grandTotal");

const invoiceNumber =
    document.getElementById("invoiceNumber");

const invoiceDate =
    document.getElementById("invoiceDate");

const customerPhone =
    document.getElementById("customerPhone");

const customerName =
    document.getElementById("customerName");

const paymentMethod =
    document.getElementById("paymentMethod");

const todaySales =
    document.getElementById("todaySales");

const todayBills =
    document.getElementById("todayBills");

const todayItems =
    document.getElementById("todayItems");

const totalProducts =
    document.getElementById("totalProducts");

const lowStock =
    document.getElementById("lowStock");

const outOfStock =
    document.getElementById("outOfStock");


/* =========================================================
   4. APPLICATION START
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    setInvoiceNumber();

    setInvoiceDate();

    updateInventoryStats();

    renderBill();

    setupEventListeners();

});


/* =========================================================
   5. EVENT LISTENERS
========================================================= */

function setupEventListeners() {

    /* Product search */

    productSearch.addEventListener(
        "input",
        handleProductSearch
    );


    /* Clear search when clicking outside */

    document.addEventListener("click", (event) => {

        if (
            !event.target.closest(".product-search-section")
        ) {

            hideSearchResults();

        }

    });


    /* Clear Bill */

    document
        .getElementById("clearBillBtn")
        .addEventListener("click", clearBill);

   /* Bill quantity and remove buttons */

    billItems.addEventListener("click", handleBillItemClick);


    /* Print Bill */

    document
        .getElementById("printBillBtn")
        .addEventListener("click", printBill);


    /* Save Bill */

    document
        .getElementById("saveBillBtn")
        .addEventListener("click", saveBill);


    /* New Bill */

    document
        .getElementById("newBillBtn")
        .addEventListener("click", newBill);


    /* Scan */

    document
        .getElementById("scanBtn")
        .addEventListener("click", () => {

            alert(
                "Barcode scanner functionality will be added later."
            );

        });


    /* Add Product */

    document
        .getElementById("addProductBtn")
        .addEventListener(
            "click",
            openProductModal
        );


    /* Products header */

    document
        .getElementById("productsBtn")
        .addEventListener("click", () => {

            openProductModal();

        });


    /* Close product modal */

    document
        .getElementById("closeProductModal")
        .addEventListener(
            "click",
            closeProductModal
        );


    /* Cancel product */

    document
        .getElementById("cancelProductBtn")
        .addEventListener(
            "click",
            closeProductModal
        );


    /* Product form */

    document
        .getElementById("productForm")
        .addEventListener(
            "submit",
            addNewProduct
        );


    /* Import Excel */

    document
        .getElementById("importExcelBtn")
        .addEventListener(
            "click",
            importExcel
        );


    /* View Sales */

    document
        .getElementById("viewSalesBtn")
        .addEventListener(
            "click",
            () => {

                alert(
                    "Sales history will be added in the next stage."
                );

            }
        );


    /* Sales header */

    document
        .getElementById("salesBtn")
        .addEventListener(
            "click",
            () => {

                alert(
                    "Sales history will be added in the next stage."
                );

            }
        );


    /* Settings */

    document
        .getElementById("settingsBtn")
        .addEventListener(
            "click",
            () => {

                alert(
                    "Settings will be added later."
                );

            }
        );

}

/* =========================================================
   BILL ITEM BUTTON HANDLER
========================================================= */

function handleBillItemClick(event) {

    const button =
        event.target.closest("button");

    if (!button) return;


    /* Increase / decrease quantity */

    if (
        button.classList.contains("quantity-btn")
    ) {

        const id =
            Number(button.dataset.id);

        const action =
            button.dataset.action;

        const item =
            currentBill.find(
                product => product.id === id
            );

        if (!item) return;


        if (action === "increase") {

            item.quantity += 1;

        }


        if (action === "decrease") {

            item.quantity -= 1;


            if (item.quantity <= 0) {

                removeProduct(id);

                return;

            }

        }


        renderBill();

        return;

    }


    /* Remove product */

    if (
        button.classList.contains("remove-item")
    ) {

        const id =
            Number(button.dataset.id);

        removeProduct(id);

    }

}
/* =========================================================
   6. INVOICE NUMBER
========================================================= */

function setInvoiceNumber() {

    let savedNumber =
        Number(
            localStorage.getItem(
                "groceryInvoiceNumber"
            )
        ) || 1;


    invoiceNumber.textContent =
        "#" +
        String(savedNumber).padStart(6, "0");

}


/* =========================================================
   7. INVOICE DATE
========================================================= */

function setInvoiceDate() {

    const now = new Date();

    const date =
        now.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );


    invoiceDate.textContent = date;

}


/* =========================================================
   8. PRODUCT SEARCH
========================================================= */

function handleProductSearch() {

    const searchTerm =
        productSearch.value
            .trim()
            .toLowerCase();


    if (!searchTerm) {

        hideSearchResults();

        return;

    }


    const matches =
        products.filter(product =>

            product.name
                .toLowerCase()
                .includes(searchTerm)

        );


    displaySearchResults(matches);

}


/* =========================================================
   9. DISPLAY SEARCH RESULTS
========================================================= */

function displaySearchResults(matches) {

    searchResults.innerHTML = "";


    if (matches.length === 0) {

        searchResults.innerHTML = `

            <div style="
                padding:16px;
                text-align:center;
                color:#929b99;
                font-size:12px;
            ">

                No products found

            </div>

        `;

        searchResults.style.display = "block";

        return;

    }


    matches.forEach(product => {

        const result =
            document.createElement("button");


        result.type = "button";

        result.style.cssText = `
            width:100%;
            padding:12px 14px;
            border:0;
            border-bottom:1px solid #eef1f0;
            background:#fff;
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:15px;
            text-align:left;
            cursor:pointer;
        `;


        result.innerHTML = `

            <div>

                <strong style="
                    display:block;
                    font-size:12px;
                    color:#1b2422;
                    margin-bottom:2px;
                ">
                    ${escapeHTML(product.name)}
                </strong>

                <span style="
                    font-size:10px;
                    color:#929b99;
                ">
                    ${escapeHTML(product.category)}
                    ·
                    ${escapeHTML(product.unit)}
                </span>

            </div>


            <div style="
                text-align:right;
                white-space:nowrap;
            ">

                <strong style="
                    display:block;
                    font-size:12px;
                    color:#176b5b;
                ">
                    ₹${formatMoney(product.salePrice)}
                </strong>

                <span style="
                    font-size:10px;
                    color:#929b99;
                    text-decoration:line-through;
                ">
                    ₹${formatMoney(product.mrp)}
                </span>

            </div>

        `;


        result.addEventListener(
            "mouseenter",
            () => {

                result.style.background =
                    "#f4faf8";

            }
        );


        result.addEventListener(
            "mouseleave",
            () => {

                result.style.background =
                    "#fff";

            }
        );


        result.addEventListener(
            "click",
            () => {

                addProductToBill(product);

            }
        );


        searchResults.appendChild(result);

    });


    searchResults.style.display = "block";

}


/* =========================================================
   10. ADD PRODUCT TO BILL
========================================================= */

function addProductToBill(product) {

    const existing =
        currentBill.find(
            item => item.id === product.id
        );


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


    productSearch.value = "";

    hideSearchResults();

    renderBill();

}


/* =========================================================
   11. RENDER BILL
========================================================= */

function renderBill() {

    billItems.innerHTML = "";


    if (currentBill.length === 0) {

        billItems.innerHTML = `

            <tr class="empty-bill">

                <td colspan="7">

                    <div class="empty-state">

                        <div class="empty-icon">
                            🛒
                        </div>

                        <h4>No products added</h4>

                        <p>
                            Search for a product above
                            to start the bill.
                        </p>

                    </div>

                </td>

            </tr>

        `;

        updateTotals();

        return;

    }


    currentBill.forEach(item => {

        const row =
            document.createElement("tr");


        const itemDiscount =
            (
                item.mrp -
                item.salePrice
            ) * item.quantity;


        const itemAmount =
            item.salePrice *
            item.quantity;


        row.innerHTML = `

            <td>

                <div style="
                    font-weight:700;
                    font-size:12px;
                ">
                    ${escapeHTML(item.name)}
                </div>

                <div style="
                    font-size:9px;
                    color:#929b99;
                    margin-top:2px;
                ">
                    ${escapeHTML(item.unit)}
                </div>

            </td>


            <td>

                <div style="
                    display:flex;
                    align-items:center;
                    gap:5px;
                ">

                    <button
                        type="button"
                        class="quantity-btn"
                        data-action="decrease"
                        data-id="${item.id}"
                        style="
                            width:25px;
                            height:25px;
                            border:1px solid #e4e9e7;
                            border-radius:6px;
                            background:#fff;
                            cursor:pointer;
                        "
                    >
                        −
                    </button>


                    <strong style="
                        min-width:20px;
                        text-align:center;
                    ">
                        ${item.quantity}
                    </strong>


                    <button
                        type="button"
                        class="quantity-btn"
                        data-action="increase"
                        data-id="${item.id}"
                        style="
                            width:25px;
                            height:25px;
                            border:1px solid #e4e9e7;
                            border-radius:6px;
                            background:#fff;
                            cursor:pointer;
                        "
                    >
                        +
                    </button>

                </div>

            </td>


            <td>
                ₹${formatMoney(item.mrp)}
            </td>


            <td>

                <strong>
                    ₹${formatMoney(item.salePrice)}
                </strong>

            </td>


            <td>

                <span style="
                    color:#16855f;
                    font-weight:700;
                ">
                    ₹${formatMoney(itemDiscount)}
                </span>

            </td>


            <td>

                <strong>
                    ₹${formatMoney(itemAmount)}
                </strong>

            </td>


            <td>

                <button
                    type="button"
                    class="remove-item"
                    data-id="${item.id}"
                    style="
                        width:28px;
                        height:28px;
                        border:0;
                        border-radius:7px;
                        background:#fff0ef;
                        color:#d9534f;
                        font-size:15px;
                        cursor:pointer;
                    "
                    title="Remove"
                >
                    ×
                </button>

            </td>

        `;


        billItems.appendChild(row);

    });


    /* Quantity buttons */

    document
        .querySelectorAll(".quantity-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                handleQuantityChange
            );

        });


    /* Remove buttons */

    document
        .querySelectorAll(".remove-item")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    removeProduct(
                        Number(button.dataset.id)
                    );

                }
            );

        });


    updateTotals();

}


/* =========================================================
   12. QUANTITY CHANGE
========================================================= */

function handleQuantityChange(event) {

    const id =
        Number(
            event.currentTarget.dataset.id
        );


    const action =
        event.currentTarget.dataset.action;


    const item =
        currentBill.find(
            product => product.id === id
        );


    if (!item) return;


    if (action === "increase") {

        item.quantity += 1;

    }


    if (action === "decrease") {

        item.quantity -= 1;


        if (item.quantity <= 0) {

            removeProduct(id);

            return;

        }

    }


    renderBill();

}


/* =========================================================
   13. REMOVE PRODUCT
========================================================= */

function removeProduct(id) {

    currentBill =
        currentBill.filter(
            item => item.id !== id
        );


    renderBill();

}


/* =========================================================
   14. CALCULATE TOTALS
========================================================= */

function updateTotals() {

    let mrpTotal = 0;

    let saleTotal = 0;

    let totalItems = 0;


    currentBill.forEach(item => {

        mrpTotal +=
            item.mrp *
            item.quantity;


        saleTotal +=
            item.salePrice *
            item.quantity;


        totalItems +=
            item.quantity;

    });


    const savings =
        mrpTotal -
        saleTotal;


    totalMrp.textContent =
        "₹" + formatMoney(mrpTotal);


    totalSavings.textContent =
        "₹" + formatMoney(savings);


    grandTotal.textContent =
        "₹" + formatMoney(saleTotal);


    itemCount.textContent =
        totalItems +
        (totalItems === 1 ? " Item" : " Items");

}


/* =========================================================
   15. CLEAR BILL
========================================================= */

function clearBill() {

    if (currentBill.length === 0) {

        return;

    }


    const confirmed =
        confirm(
            "Are you sure you want to clear this bill?"
        );


    if (!confirmed) return;


    currentBill = [];

    customerPhone.value = "";

    customerName.value = "";

    paymentMethod.value = "cash";

    productSearch.value = "";

    hideSearchResults();

    renderBill();

}


/* =========================================================
   16. NEW BILL
========================================================= */

function newBill() {

    if (currentBill.length > 0) {

        const confirmed =
            confirm(
                "Start a new bill? The current bill will be cleared."
            );


        if (!confirmed) return;

    }


    currentBill = [];

    customerPhone.value = "";

    customerName.value = "";

    paymentMethod.value = "cash";

    productSearch.value = "";

    hideSearchResults();

    setInvoiceNumber();

    setInvoiceDate();

    renderBill();

}


/* =========================================================
   17. SAVE BILL
========================================================= */

function saveBill() {

    if (currentBill.length === 0) {

        alert(
            "Please add at least one product before saving the bill."
        );

        return;

    }


    const bill = {

        invoiceNumber:
            invoiceNumber.textContent,

        date:
            new Date().toISOString(),

        customerPhone:
            customerPhone.value.trim(),

        customerName:
            customerName.value.trim(),

        paymentMethod:
            paymentMethod.value,

        items:
            currentBill.map(item => ({
                ...item
            })),

        totalMrp:
            calculateMrpTotal(),

        savings:
            calculateSavings(),

        grandTotal:
            calculateGrandTotal()

    };


    let savedBills =
        JSON.parse(
            localStorage.getItem(
                "groceryBills"
            )
        ) || [];


    savedBills.push(bill);


    localStorage.setItem(
        "groceryBills",
        JSON.stringify(savedBills)
    );


    /* Increase invoice number */

    const currentNumber =
        Number(
            localStorage.getItem(
                "groceryInvoiceNumber"
            )
        ) || 1;


    localStorage.setItem(
        "groceryInvoiceNumber",
        currentNumber + 1
    );


    alert(
        "Bill saved successfully!"
    );


    updateSalesDashboard();

}


/* =========================================================
   18. CALCULATE MRP TOTAL
========================================================= */

function calculateMrpTotal() {

    return currentBill.reduce(
        (total, item) => {

            return total +
                item.mrp *
                item.quantity;

        },
        0
    );

}


/* =========================================================
   19. CALCULATE GRAND TOTAL
========================================================= */

function calculateGrandTotal() {

    return currentBill.reduce(
        (total, item) => {

            return total +
                item.salePrice *
                item.quantity;

        },
        0
    );

}


/* =========================================================
   20. CALCULATE SAVINGS
========================================================= */

function calculateSavings() {

    return (
        calculateMrpTotal() -
        calculateGrandTotal()
    );

}


/* =========================================================
   21. PRINT BILL
========================================================= */

function printBill() {

    if (currentBill.length === 0) {

        alert(
            "Please add products before printing."
        );

        return;

    }


    window.print();

}


/* =========================================================
   22. PRODUCT MODAL
========================================================= */

function openProductModal() {

    const modal =
        document.getElementById(
            "productModal"
        );


    modal.hidden = false;


    setTimeout(() => {

        document
            .getElementById("productName")
            .focus();

    }, 100);

}


function closeProductModal() {

    const modal =
        document.getElementById(
            "productModal"
        );


    modal.hidden = true;


    document
        .getElementById("productForm")
        .reset();

}


/* =========================================================
   23. ADD NEW PRODUCT
========================================================= */

function addNewProduct(event) {

    event.preventDefault();


    const name =
        document
            .getElementById("productName")
            .value
            .trim();


    const mrp =
        Number(
            document
                .getElementById("productMrp")
                .value
        );


    const salePrice =
        Number(
            document
                .getElementById("productSalePrice")
                .value
        );


    const unit =
        document
            .getElementById("productUnit")
            .value;


    const category =
        document
            .getElementById("productCategory")
            .value
            .trim();


    if (!name) {

        alert(
            "Please enter the product name."
        );

        return;

    }


    if (salePrice > mrp) {

        alert(
            "Sale price cannot be higher than MRP."
        );

        return;

    }


    const newProduct = {

        id:
            Date.now(),

        name:
            name,

        mrp:
            mrp,

        salePrice:
            salePrice,

        unit:
            unit,

        category:
            category || "General"

    };


    products.push(
        newProduct
    );


    saveProducts();


    updateInventoryStats();


    closeProductModal();


    alert(
        `${name} added successfully!`
    );

}


/* =========================================================
   24. SAVE PRODUCTS
========================================================= */

function saveProducts() {

    localStorage.setItem(
        "groceryProducts",
        JSON.stringify(products)
    );

}


/* =========================================================
   25. LOAD PRODUCTS
========================================================= */

function loadProducts() {

    const savedProducts =
        localStorage.getItem(
            "groceryProducts"
        );


    if (savedProducts) {

        try {

            products =
                JSON.parse(
                    savedProducts
                );

        } catch (error) {

            console.error(
                "Could not load saved products:",
                error
            );

        }

    }

}


/* =========================================================
   26. INVENTORY STATISTICS
========================================================= */

function updateInventoryStats() {

    totalProducts.textContent =
        products.length;


    /*
       Stock management will be added later.
       For now these remain zero.
    */

    lowStock.textContent = "0";

    outOfStock.textContent = "0";

}


/* =========================================================
   27. SALES DASHBOARD
========================================================= */

function updateSalesDashboard() {

    const bills =
        JSON.parse(
            localStorage.getItem(
                "groceryBills"
            )
        ) || [];


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const todayBillsList =
        bills.filter(bill => {

            return bill.date
                .split("T")[0] === today;

        });


    let sales = 0;

    let items = 0;


    todayBillsList.forEach(bill => {

        sales +=
            Number(
                bill.grandTotal
            );


        bill.items.forEach(item => {

            items +=
                Number(
                    item.quantity
                );

        });

    });


    todaySales.textContent =
        "₹" + formatMoney(sales);


    todayBills.textContent =
        todayBillsList.length;


    todayItems.textContent =
        items;

}


/* =========================================================
   28. IMPORT EXCEL
   ---------------------------------------------------------
   Placeholder for now.
   We'll build the real Excel importer later.
========================================================= */

function importExcel() {

    /* Check whether Excel library is available */

    if (typeof XLSX === "undefined") {

        alert(
            "Excel import library could not be loaded. Please check your internet connection and reload the page."
        );

        return;

    }


    /* Create hidden file input */

    const fileInput =
        document.createElement("input");

    fileInput.type = "file";

    fileInput.accept =
        ".xlsx,.xls";

    fileInput.style.display = "none";


    /* When a file is selected */

    fileInput.addEventListener(
        "change",
        handleExcelFile
    );


    document.body.appendChild(fileInput);

    fileInput.click();


    /* Remove temporary input */

    setTimeout(() => {

        fileInput.remove();

    }, 1000);

}


/* =========================================================
   EXCEL FILE PROCESSING
========================================================= */

function handleExcelFile(event) {

    const file =
        event.target.files[0];


    if (!file) {

        return;

    }


    const reader =
        new FileReader();


    reader.onload = function (excelEvent) {

        try {

            const data =
                new Uint8Array(
                    excelEvent.target.result
                );


            const workbook =
                XLSX.read(
                    data,
                    {
                        type: "array"
                    }
                );


            /* Use the first worksheet */

            const firstSheetName =
                workbook.SheetNames[0];


            const worksheet =
                workbook.Sheets[
                    firstSheetName
                ];


            /* Convert Excel rows into objects */

            const rows =
                XLSX.utils.sheet_to_json(
                    worksheet,
                    {
                        defval: ""
                    }
                );


            if (rows.length === 0) {

                alert(
                    "The Excel file is empty."
                );

                return;

            }


            const importedProducts = [];

            const errors = [];


            rows.forEach(
                (row, index) => {

                    const rowNumber =
                        index + 2;


                    const id =
                        String(
                            row["Item Code"]
                        ).trim();


                    const name =
                        String(
                            row["Item Name"]
                        ).trim();


                    const category =
                        String(
                            row["Category"]
                        ).trim();


                    const unit =
                        String(
                            row["Unit"]
                        ).trim();


                    const mrp =
                        Number(
                            row["MRP"]
                        );


                    const salePrice =
                        Number(
                            row["Sale Price"]
                        );


                    /* Validate required fields */

                    if (
                        !id ||
                        !name ||
                        !unit ||
                        isNaN(mrp) ||
                        isNaN(salePrice)
                    ) {

                        errors.push(
                            `Row ${rowNumber}: Missing or invalid data`
                        );

                        return;

                    }


                    if (mrp < 0 || salePrice < 0) {

                        errors.push(
                            `Row ${rowNumber}: Price cannot be negative`
                        );

                        return;

                    }


                    if (salePrice > mrp) {

                        errors.push(
                            `Row ${rowNumber}: Sale Price cannot be higher than MRP`
                        );

                        return;

                    }


                    importedProducts.push({

                        id: id,

                        name: name,

                        mrp: mrp,

                        salePrice: salePrice,

                        unit: unit,

                        category:
                            category ||
                            "General"

                    });

                }
            );


            /* Stop if nothing valid was imported */

            if (
                importedProducts.length === 0
            ) {

                alert(
                    "No valid products were found in the Excel file."
                );

                return;

            }


            /* Ask before replacing existing products */

            const confirmed =
                confirm(
                    `Found ${importedProducts.length} valid products.\n\n` +
                    `Importing this Excel file will replace the current product list.\n\n` +
                    `Do you want to continue?`
                );


            if (!confirmed) {

                return;

            }


            /* Replace product database */

            products =
                importedProducts;


            /* Save imported products */

            saveProducts();


            /* Update dashboard */

            updateInventoryStats();


            /* Clear current search */

            productSearch.value = "";

            hideSearchResults();


            /* Show result */

            let message =
                `Successfully imported ${importedProducts.length} products.`;


            if (errors.length > 0) {

                message +=
                    `\n\n${errors.length} row(s) were skipped because of errors.`;

            }


            alert(message);


            console.log(
                "Imported products:",
                products
            );


        } catch (error) {

            console.error(
                "Excel import error:",
                error
            );


            alert(
                "Unable to read this Excel file. Please make sure you are using the correct Excel template."
            );

        }

    };


    reader.onerror = function () {

        alert(
            "Could not read the selected Excel file."
        );

    };


    reader.readAsArrayBuffer(file);

}


/* =========================================================
   29. HIDE SEARCH RESULTS
========================================================= */

function hideSearchResults() {

    searchResults.style.display =
        "none";

}


/* =========================================================
   30. FORMAT MONEY
========================================================= */

function formatMoney(amount) {

    return Number(amount)
        .toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


/* =========================================================
   31. ESCAPE HTML
   Prevents product names from injecting HTML.
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /[&<>"']/g,
            character => {

                const entities = {

                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"

                };

                return entities[character];

            }
        );

}


/* =========================================================
   32. LOAD SAVED DATA
========================================================= */

loadProducts();

updateSalesDashboard();
