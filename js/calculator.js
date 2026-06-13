const calculatorConfig = {
    projectTypes: {
        landingpage: { name: "Premium Landing Page", basePriceUSD: 400, baseWeeks: 1 },
        webapp: { name: "Custom Web Application", basePriceUSD: 1200, baseWeeks: 3 },
        android: { name: "Native Android App", basePriceUSD: 1500, baseWeeks: 4 },
        automation: { name: "Automation & Scraper Bot", basePriceUSD: 500, baseWeeks: 2 },
        saas: { name: "SaaS Platform & Dashboard", basePriceUSD: 2000, baseWeeks: 6 }
    },
    features: {
        auth: { name: "User Authentication & Roles", priceUSD: 250, weeks: 0.5 },
        payment: { name: "Payment Gateway Integration", priceUSD: 300, weeks: 0.5 },
        database: { name: "Complex DB & Cloud Storage", priceUSD: 400, weeks: 1 },
        api: { name: "Third-party API Integrations", priceUSD: 200, weeks: 0.5 },
        realtime: { name: "Real-time Chat / WebSockets", priceUSD: 350, weeks: 1 },
        admin: { name: "Admin Dashboard Panel", priceUSD: 500, weeks: 1.5 }
    },
    usdToIdrRate: 16000 // Fixed rate for presentation
};

function initCalculator() {
    const projectTypeSelect = document.getElementById('calc-project-type');
    const featuresContainer = document.getElementById('calc-features-list');
    const costDisplay = document.getElementById('calc-cost-range');
    const timelineDisplay = document.getElementById('calc-timeline');
    const usdIdrToggle = document.getElementById('currency-toggle');
    const bookBtn = document.getElementById('calc-book-btn');
    const contactMessage = document.getElementById('contact-message');

    if (!projectTypeSelect || !featuresContainer || !costDisplay || !timelineDisplay) return;

    let currency = 'USD'; // 'USD' or 'IDR'

    // Populate project types dropdown
    projectTypeSelect.innerHTML = '';
    Object.keys(calculatorConfig.projectTypes).forEach(key => {
        const type = calculatorConfig.projectTypes[key];
        const option = document.createElement('option');
        option.value = key;
        option.textContent = type.name;
        projectTypeSelect.appendChild(option);
    });

    // Populate features checkboxes
    featuresContainer.innerHTML = '';
    Object.keys(calculatorConfig.features).forEach(key => {
        const feat = calculatorConfig.features[key];
        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = 'feature-checkbox-card';
        checkboxWrapper.innerHTML = `
            <input type="checkbox" id="feat-${key}" value="${key}" class="calc-feature-checkbox">
            <label for="feat-${key}">
                <div class="checkbox-indicator"></div>
                <div class="feature-info">
                    <span class="feature-name">${feat.name}</span>
                    <span class="feature-price" data-usd="${feat.priceUSD}">+$${feat.priceUSD}</span>
                </div>
            </label>
        `;
        featuresContainer.appendChild(checkboxWrapper);
    });

    // Format currency
    function formatCurrency(amountUSD) {
        if (currency === 'IDR') {
            const amountIDR = amountUSD * calculatorConfig.usdToIdrRate;
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0
            }).format(amountIDR);
        } else {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0
            }).format(amountUSD);
        }
    }

    // Main recalculation logic
    function calculate() {
        const selectedTypeKey = projectTypeSelect.value;
        const selectedType = calculatorConfig.projectTypes[selectedTypeKey];
        if (!selectedType) return;

        let totalUSD = selectedType.basePriceUSD;
        let totalWeeks = selectedType.baseWeeks;

        // Collect checked features
        const checkedCheckboxes = document.querySelectorAll('.calc-feature-checkbox:checked');
        const selectedFeaturesList = [];

        checkedCheckboxes.forEach(cb => {
            const featKey = cb.value;
            const feat = calculatorConfig.features[featKey];
            if (feat) {
                totalUSD += feat.priceUSD;
                totalWeeks += feat.weeks;
                selectedFeaturesList.push(feat.name);
            }
        });

        // Add pricing range margin (e.g. ±15%)
        const minCost = Math.round(totalUSD * 0.9);
        const maxCost = Math.round(totalUSD * 1.15);

        // Display results
        costDisplay.innerHTML = `${formatCurrency(minCost)} - ${formatCurrency(maxCost)}`;
        timelineDisplay.textContent = `Est. Timeline: ${Math.ceil(totalWeeks)} - ${Math.ceil(totalWeeks + 1.5)} Weeks`;

        // Update button action data
        bookBtn.onclick = function() {
            // Build text message for contact form
            let message = `Hi Ardyan, I configured a custom project estimate on your portfolio:\n\n`;
            message += `• Project Type: ${selectedType.name}\n`;
            if (selectedFeaturesList.length > 0) {
                message += `• Selected Features:\n  - ` + selectedFeaturesList.join('\n  - ') + `\n`;
            } else {
                message += `• Features: Standard baseline\n`;
            }
            message += `• Est. Budget Range: ${formatCurrency(minCost)} - ${formatCurrency(maxCost)} (${currency})\n`;
            message += `• Est. Timeline: ${Math.ceil(totalWeeks)}-${Math.ceil(totalWeeks + 1.5)} weeks\n\n`;
            message += `I would love to discuss starting this project with you.`;

            if (contactMessage) {
                contactMessage.value = message;
                // Highlight input for visual focus
                contactMessage.focus();
                // Smooth scroll to contact section
                document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
                
                // Add highlight visual feedback
                contactMessage.classList.add('glow-highlight');
                setTimeout(() => {
                    contactMessage.classList.remove('glow-highlight');
                }, 1500);
            }
        };
    }

    // Add listeners
    projectTypeSelect.addEventListener('change', calculate);
    featuresContainer.addEventListener('change', '.calc-feature-checkbox', calculate);
    // Bind change event to checkboxes inside container
    featuresContainer.addEventListener('change', (e) => {
        if (e.target && e.target.classList.contains('calc-feature-checkbox')) {
            calculate();
        }
    });

    if (usdIdrToggle) {
        usdIdrToggle.addEventListener('click', () => {
            currency = currency === 'USD' ? 'IDR' : 'USD';
            usdIdrToggle.textContent = currency === 'USD' ? 'Switch to IDR (Rp)' : 'Switch to USD ($)';
            
            // Update prices listed inside features checkboxes
            const prices = featuresContainer.querySelectorAll('.feature-price');
            prices.forEach(priceSpan => {
                const usdVal = parseFloat(priceSpan.getAttribute('data-usd'));
                if (currency === 'IDR') {
                    const idrVal = usdVal * calculatorConfig.usdToIdrRate;
                    priceSpan.textContent = `+Rp ${idrVal.toLocaleString('id-ID')}`;
                } else {
                    priceSpan.textContent = `+$${usdVal}`;
                }
            });

            calculate();
        });
    }

    // Initial calculation run
    calculate();
}

// Initialise on load
document.addEventListener('DOMContentLoaded', initCalculator);
