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
    let selectedIndex = -1; // Index for keyboard navigation

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
    
    // Modal Elements
    const productModal = document.getElementById('productModal');
    const addProductBtn = document.getElementById('addProductBtn');
    const closeProductModal = document.getElementById('closeProductModal');
    const cancelProductBtn = document.getElementById('cancelProductBtn');
    const productForm = document.getElementById('productForm');

    // Display Current Date
    if (invoiceDateEl) {
        const today = new Date();
        invoiceDateEl.textContent = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    // ==========================================
    // 1. THEME TOGGLE (DARK / LIGHT MODE)
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
    // 2. SEARCH & ARROW KEY NAVIGATION
    // ==========================================
    productSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        selectedIndex = -1; // Reset selection index

        if (!query) {
            searchResults.classList.remove('active');
            searchResults.innerHTML = '';
            return;
        }

        const matches = products.filter(p => p.name.toLowerCase().includes(query));
        renderSearchResults(matches);
    });

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
                    <span class="item-price">₹${product.salePrice.toFixed(2)}</span>
                    <span class="item-mrp">₹${product.mrp.toFixed(2)}</span>
                </div>
            `;

            // Mouse Click Event
            item.addEventListener('click', () => {
                addToBill(product);
                closeSearchResults();
            });

            searchResults.appendChild(item);
        });

        searchResults.classList.add('active');
    }

    // Keyboard Arrow Keys Navigation Logic
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
        searchResults.classList.remove('active');
        searchResults.innerHTML = '';
        productSearchInput.value = '';
        selectedIndex = -1;
    }

    // Hide search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchResults.contains(e.target) && e.target !== productSearchInput) {
            closeSearchResults();
        }
    });

    // ==========================================
    // 3. BILL MANAGEMENT
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
                <td>₹${item.mrp.toFixed(2)}</td>
                <td>₹${item.salePrice.toFixed(2)}</td>
                <td style="color:var(--primary-color);">₹${discount.toFixed(2)}</td>
                <td><strong>₹${amount.toFixed(2)}</strong></td>
                <td><button type="button" class="btn-remove" data-index="${index}">×</button></td>
            `;
            billItemsContainer.appendChild(tr);
        });

        updateSummary();
    }

    // Update Quantity & Delete Handlers
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

        totalMrpEl.textContent = `₹${totalMrp.toFixed(2)}`;
        totalSavingsEl.textContent = `₹${totalSavings.toFixed(2)}`;
        grandTotalEl.textContent = `₹${grandTotal.toFixed(2)}`;
        itemCountEl.textContent = `${totalItems} Items`;
    }

    // Clear Bill Action
    document.getElementById('clearBillBtn').addEventListener('click', () => {
        if (currentBill.length > 0 && confirm('Are you sure you want to clear the current bill?')) {
            currentBill = [];
            renderBill();
        }
    });

    // ==========================================
    // 4. ADD PRODUCT MODAL HANDLERS
    // ==========================================
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            productModal.removeAttribute('hidden');
        });
    }

    const closeModal = () => productModal.setAttribute('hidden', 'true');
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
                unit: document.getElementById('productUnit').value,
                category: document.getElementById('productCategory').value || 'General'
            };

            products.push(newProduct);
            localStorage.setItem('products', JSON.stringify(products));
            alert('Product added successfully!');
            productForm.reset();
            closeModal();
        });
    }
});
