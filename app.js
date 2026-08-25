document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // INITIALIZATION & DUMMY DATA
    // ==========================================
    let products = JSON.parse(localStorage.getItem('products')) || [
        { id: 1, name: 'Tata Salt', mrp: 30.00, salePrice: 28.00, category: 'Salt', unit: '1 kg' },
        { id: 2, name: 'Tata Tea', mrp: 140.00, salePrice: 132.00, category: 'Beverages', unit: '250 g' },
        { id: 3, name: 'Tata Glucose Biscuits', mrp: 10.00, salePrice: 10.00, category: 'Biscuits', unit: '100 g' },
        { id: 4, name: 'Fortune Sunflower Oil', mrp: 160.00, salePrice: 150.00, category: 'Oil', unit: '1 L' },
        { id: 5, name: 'Ruchi Gold Palm Oil', mrp: 145.00, salePrice: 138.00, category: 'Oil', unit: '1 L' },
        { id: 6, name: 'Harpic Toilet Cleaner', mrp: 105.00, salePrice: 98.00, category: 'Cleaning', unit: '500 ml' },
        { id: 7, name: 'Parachute Coconut Oil', mrp: 85.00, salePrice: 80.00, category: 'Personal Care', unit: '200 ml' }
    ];

    let currentBill = [];
    let selectedIndex = -1; // Index for search navigation

    // DOM Elements
    const productSearchInput = document.getElementById('productSearch');
    const searchResults = document.getElementById('searchResults');
    const billItemsContainer = document.getElementById('billItems');
    const totalMrpEl = document.getElementById('totalMrp');
    const totalSavingsEl = document.getElementById('totalSavings');
    const grandTotalEl = document.getElementById('grandTotal');
    const itemCountEl = document.getElementById('itemCount');
    const invoiceDateEl = document.getElementById('invoiceDate');
    const themeToggleBtn = document.getElementById('themeToggleBtn');

    // Action Buttons
    const addProductBtn = document.getElementById('addProductBtn');
    const clearBillBtn = document.getElementById('clearBillBtn');
    const printBillBtn = document.getElementById('printBillBtn');
    const saveBillBtn = document.getElementById('saveBillBtn'); // Optional Save Button element
    const importExcelBtn = document.getElementById('importExcelBtn');
    const excelFileInput = document.getElementById('excelFileInput');

    // Modal Elements
    const productModal = document.getElementById('productModal');
    const closeProductModal = document.getElementById('closeProductModal');
    const cancelProductBtn = document.getElementById('cancelProductBtn');
    const productForm = document.getElementById('productForm');
    const modalProductList = document.getElementById('modalProductList');

    // Display Current Date
    if (invoiceDateEl) {
        const today = new Date();
        invoiceDateEl.textContent = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    // ==========================================
    // 1. GLOBAL KEYBOARD SHORTCUTS
    // ==========================================
    document.addEventListener('keydown', (e) => {
        // Detect Ctrl key (or Cmd key on Mac)
        const isCtrl = e.ctrlKey || e.metaKey;

        if (isCtrl) {
            const key = e.key.toLowerCase();

            // Ctrl + S : Save / Checkout Bill
            if (key === 's') {
                e.preventDefault();
                saveBillAction();
            }
            // Ctrl + Q : Clear Current Bill
            else if (key === 'q') {
                e.preventDefault();
                clearBillAction();
            }
            // Ctrl + P : Print Bill
            else if (key === 'p') {
                e.preventDefault();
                printBillAction();
            }
            // Ctrl + N : New Bill
            else if (key === 'n') {
                e.preventDefault();
                newBillAction();
            }
        }
    });

    // Helper Action Functions for Shortcuts & Buttons
    function saveBillAction() {
        if (currentBill.length === 0) {
            alert('Cannot save an empty bill. Add products first!');
            return;
        }
        alert('Bill saved successfully!');
        // Additional save logic (e.g., API call or storing sales history) can go here
    }

    function clearBillAction() {
        if (currentBill.length > 0) {
            if (confirm('Are you sure you want to clear the current bill? (Ctrl+Q)')) {
                currentBill = [];
                renderBill();
            }
        }
    }

    function printBillAction() {
        if (currentBill.length === 0) {
            alert('Add products to the bill before printing.');
            return;
        }
        window.print();
    }

    function newBillAction() {
        if (currentBill.length > 0) {
            if (!confirm('Start a new bill? Current unsaved items will be cleared.')) {
                return;
            }
        }
        currentBill = [];
        renderBill();
        if (productSearchInput) {
            productSearchInput.focus();
        }
    }

    // Connect Action Buttons to Functions
    if (clearBillBtn) clearBillBtn.addEventListener('click', clearBillAction);
    if (printBillBtn) printBillBtn.addEventListener('click', printBillAction);
    if (saveBillBtn) saveBillBtn.addEventListener('click', saveBillAction);

    // ==========================================
    // 2. THEME TOGGLE (DARK / LIGHT MODE)
    // ==========================================
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'light' || (!savedTheme && !systemPrefersDark)) {
        setTheme('light');
    } else {
        setTheme('dark');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            setTheme(currentTheme === 'light' ? 'dark' : 'light');
        });
    }

    function setTheme(theme) {
        const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('.theme-icon') : null;
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            if (themeIcon) themeIcon.textContent = '☀️';
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
            if (themeIcon) themeIcon.textContent = '🌙';
            localStorage.setItem('theme', 'dark');
        }
    }

    // ==========================================
    // 3. SEARCH & ARROW KEY NAVIGATION
    // ==========================================
    if (productSearchInput && searchResults) {
        productSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            selectedIndex = -1;

            if (!query) {
                searchResults.classList.remove('active');
                searchResults.innerHTML = '';
                return;
            }

            const matches = products.filter(p => p.name.toLowerCase().includes(query));
            renderSearchResults(matches);
        });

        productSearchInput.addEventListener('keydown', (e) => {
            const items = searchResults.querySelectorAll('.search-result-item');
            if (!items.length || !searchResults.classList.contains('active')) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = (selectedIndex + 1) % items.length;
                updateSelection(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                updateSelection(items);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedIndex > -1 && items[selectedIndex]) {
                    items[selectedIndex].click();
                }
            } else if (e.key === 'Escape') {
                closeSearchResults();
            }
        });
    }

    function renderSearchResults(matches) {
        searchResults.innerHTML = '';
        
        if (matches.length === 0) {
            searchResults.innerHTML = `<div class="search-result-item" style="cursor: default;"><span class="item-name">No products found</span></div>`;
            searchResults.classList.add('active');
            return;
        }

        matches.forEach((product) => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.innerHTML = `
                <div class="item-details">
                    <span class="item-name">${product.name}</span>
                    <span class="item-meta">${product.category} · ${product.unit}</span>
                </div>
                <div class="item-price-block">
                    <span class="item-price">₹${Number(product.salePrice).toFixed(2)}</span>
                    <span class="item-mrp">₹${Number(product.mrp).toFixed(2)}</span>
                </div>
            `;

            item.addEventListener('click', () => {
                addToBill(product);
                closeSearchResults();
            });

            searchResults.appendChild(item);
        });

        searchResults.classList.add('active');
    }

    function updateSelection(items) {
        items.forEach((item, idx) => {
            if (idx === selectedIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    }

    function closeSearchResults() {
        if (!searchResults || !productSearchInput) return;
        searchResults.classList.remove('active');
        searchResults.innerHTML = '';
        productSearchInput.value = '';
        selectedIndex = -1;
    }

    document.addEventListener('click', (e) => {
        if (searchResults && productSearchInput) {
            if (!searchResults.contains(e.target) && e.target !== productSearchInput) {
                closeSearchResults();
            }
        }
    });

    // ==========================================
    // 4. BILL MANAGEMENT
    // ==========================================
    function addToBill(product) {
        const existingItem = currentBill.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.qty += 1;
        } else {
            currentBill.push({ ...product, qty: 1 });
        }

        renderBill();
    }

    function renderBill() {
        if (!billItemsContainer) return;
        billItemsContainer.innerHTML = '';

        if (currentBill.length === 0) {
            billItemsContainer.innerHTML = `
                <tr class="empty-bill">
                    <td colspan="7">
                        <div class="empty-state">
                            <div class="empty-icon">🛒</div>
                            <h4>No products added</h4>
                            <p>Search for a product above to start the bill.</p>
                        </div>
                    </td>
                </tr>
            `;
            updateSummary();
            return;
        }

        currentBill.forEach((item, index) => {
            const discount = (item.mrp - item.salePrice) * item.qty;
            const amount = item.salePrice * item.qty;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${item.name}</strong><br><small style="color:var(--text-muted);">${item.unit}</small></td>
                <td>
                    <input type="number" class="qty-input" min="1" value="${item.qty}" data-index="${index}">
                </td>
                <td>₹${Number(item.mrp).toFixed(2)}</td>
                <td>₹${Number(item.salePrice).toFixed(2)}</td>
                <td style="color:var(--primary-color);">₹${discount.toFixed(2)}</td>
                <td><strong>₹${amount.toFixed(2)}</strong></td>
                <td><button type="button" class="btn-remove" data-index="${index}">×</button></td>
            `;
            billItemsContainer.appendChild(tr);
        });

        updateSummary();
    }

    if (billItemsContainer) {
        billItemsContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('qty-input')) {
                const index = e.target.dataset.index;
                const newQty = parseInt(e.target.value, 10);
                if (newQty > 0) {
                    currentBill[index].qty = newQty;
                    renderBill();
                }
            }
        });

        billItemsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-remove')) {
                const index = e.target.dataset.index;
                currentBill.splice(index, 1);
                renderBill();
            }
        });
    }

    function updateSummary() {
        let totalMrp = 0;
        let grandTotal = 0;
        let totalItems = 0;

        currentBill.forEach(item => {
            totalMrp += item.mrp * item.qty;
            grandTotal += item.salePrice * item.qty;
            totalItems += item.qty;
        });

        const totalSavings = totalMrp - grandTotal;

        if (totalMrpEl) totalMrpEl.textContent = `₹${totalMrp.toFixed(2)}`;
        if (totalSavingsEl) totalSavingsEl.textContent = `₹${totalSavings.toFixed(2)}`;
        if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal.toFixed(2)}`;
        if (itemCountEl) itemCountEl.textContent = `${totalItems} Items`;
    }

    // ==========================================
    // 5. IMPORT EXCEL / CSV HANDLING
    // ==========================================
    if (importExcelBtn) {
        importExcelBtn.addEventListener('click', () => {
            if (excelFileInput) {
                excelFileInput.click();
            } else {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '.csv, .json';
                fileInput.onchange = (e) => handleFileUpload(e.target.files[0]);
                fileInput.click();
            }
        });
    }

    if (excelFileInput) {
        excelFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
            }
        });
    }

    function handleFileUpload(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const content = e.target.result;
                let importedData = [];

                if (file.name.endsWith('.json')) {
                    importedData = JSON.parse(content);
                } else {
                    const lines = content.split('\n');
                    lines.forEach((line, i) => {
                        if (i === 0 || !line.trim()) return;
                        const cols = line.split(',');
                        if (cols.length >= 3) {
                            importedData.push({
                                id: Date.now() + i,
                                name: cols[0].trim(),
                                mrp: parseFloat(cols[1]) || 0,
                                salePrice: parseFloat(cols[2]) || 0,
                                category: cols[3] ? cols[3].trim() : 'General',
                                unit: cols[4] ? cols[4].trim() : '1 Pcs'
                            });
                        }
                    });
                }

                if (importedData.length > 0) {
                    products = [...products, ...importedData];
                    localStorage.setItem('products', JSON.stringify(products));
                    alert(`Successfully imported ${importedData.length} products!`);
                    renderModalProductList();
                } else {
                    alert('Could not find valid product data in file.');
                }
            } catch (err) {
                alert('Error parsing file: ' + err.message);
            }
        };

        reader.readAsText(file);
    }

    // ==========================================
    // 6. ADD PRODUCT MODAL HANDLERS
    // ==========================================
    function renderModalProductList() {
        if (!modalProductList) return;
        modalProductList.innerHTML = products.map((p) => `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
                <div>
                    <strong>${p.name}</strong> <small>(${p.unit})</small>
                </div>
                <div>
                    <span style="color: var(--primary-color); font-weight: bold;">₹${Number(p.salePrice).toFixed(2)}</span>
                    <small style="text-decoration: line-through; color: var(--text-muted);">₹${Number(p.mrp).toFixed(2)}</small>
                </div>
            </div>
        `).join('');
    }

    if (addProductBtn && productModal) {
        addProductBtn.addEventListener('click', () => {
            renderModalProductList();
            productModal.removeAttribute('hidden');
            productModal.style.display = 'flex';
        });
    }

    const closeModal = () => {
        if (productModal) {
            productModal.setAttribute('hidden', 'true');
            productModal.style.display = 'none';
        }
    };

    if (closeProductModal) closeProductModal.addEventListener('click', closeModal);
    if (cancelProductBtn) cancelProductBtn.addEventListener('click', closeModal);

    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newProduct = {
                id: Date.now(),
                name: document.getElementById('productName').value,
                mrp: parseFloat(document.getElementById('productMrp').value),
                salePrice: parseFloat(document.getElementById('productSalePrice').value),
                unit: document.getElementById('productUnit').value || '1 Unit',
                category: document.getElementById('productCategory') ? document.getElementById('productCategory').value : 'General'
            };

            products.push(newProduct);
            localStorage.setItem('products', JSON.stringify(products));
            alert('Product added successfully!');
            productForm.reset();
            renderModalProductList();
            closeModal();
        });
    }
});
