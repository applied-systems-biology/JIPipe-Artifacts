// Search functionality
class PackageSearch {
    constructor() {
        this.searchInput = document.getElementById('package-search');
        this.searchClear = document.getElementById('search-clear');
        this.resultsInfo = document.getElementById('search-results-info');
        this.resultsCount = document.getElementById('results-count');
        this.packagesGrid = document.getElementById('packages-grid');
        this.noResults = document.getElementById('no-results');
        this.totalPackages = document.getElementById('total-packages');
        
        this.originalPackages = [];
        this.filteredPackages = [];
        this.debounceTimer = null;
        
        // Filter-related properties
        this.selectedFilter = null;
        this.packageNames = new Set();
        this.filterCounts = new Map();
        
        // Debounce timers for performance
        this.filterDebounceTimer = null;
        this.filterSearchDebounceTimer = null;
        
        this.init();
    }
    
    init() {
        // Store original packages
        this.originalPackages = Array.from(document.querySelectorAll('.package-card'));
        this.filteredPackages = [...this.originalPackages];
        
        // Extract unique package names and build filter data
        this.extractPackageNames();
        this.buildFilterCounts();
        
        // Set up event listeners
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.searchClear.addEventListener('click', () => this.clearSearch());
        
        // Initialize filter menu
        this.initializeFilterMenu();
        
        // Initial render
        this.renderPackages(this.filteredPackages);
    }
    
    handleSearch(searchTerm) {
        // Clear previous debounce timer
        clearTimeout(this.debounceTimer);
        
        // Set new debounce timer
        this.debounceTimer = setTimeout(() => {
            this.performSearch(searchTerm);
        }, 300);
        
        // Show/hide clear button
        this.searchClear.style.display = searchTerm ? 'block' : 'none';
    }
    
    performSearch(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredPackages = [...this.originalPackages];
        } else {
            this.filteredPackages = this.originalPackages.filter(packageCard => {
                const packageData = this.getPackageData(packageCard);
                return this.matchesSearch(packageData, searchTerm);
            });
            
        }
        
        this.showResultsInfo(this.filteredPackages.length);
        this.renderPackages(this.filteredPackages);
    }
    
    // Filter-related methods
    extractPackageNames() {
        this.packageNames.clear();
        this.originalPackages.forEach(packageCard => {
            const packageName = packageCard.querySelector('.package-name')?.textContent?.trim() || '';
            if (packageName) {
                this.packageNames.add(packageName);
            }
        });
    }
    
    buildFilterCounts() {
        this.filterCounts.clear();
        this.originalPackages.forEach(packageCard => {
            const packageName = packageCard.querySelector('.package-name')?.textContent?.trim() || '';
            if (packageName) {
                this.filterCounts.set(packageName, (this.filterCounts.get(packageName) || 0) + 1);
            }
        });
    }
    
    initializeFilterMenu() {
        try {
            // Check if filter menu already exists
            let filterMenu = document.getElementById('filter-menu');
            if (!filterMenu) {
                // Create filter menu element
                filterMenu = document.createElement('div');
                filterMenu.id = 'filter-menu';
                filterMenu.className = 'filter-menu';
                filterMenu.setAttribute('role', 'radiogroup');
                filterMenu.setAttribute('aria-label', 'Filter packages');
                
                // Add filter menu to the filter menu container
                const filterMenuContainer = document.getElementById('filter-menu-container');
                if (filterMenuContainer) {
                    filterMenuContainer.appendChild(filterMenu);
                } else {
                    // Fallback to search container if container doesn't exist
                    const searchContainer = document.querySelector('.search-container');
                    if (searchContainer) {
                        searchContainer.appendChild(filterMenu);
                    } else {
                        console.error('Filter menu container not found for filter menu');
                        return;
                    }
                }
                
                this.createFilterMenuContent(filterMenu);
            }
            
            // Initialize filter menu functionality
            this.setupFilterMenuEventListeners();
            
            // Initial render of filter options
            this.updateFilterOptions();
        } catch (error) {
            console.error('Error initializing filter menu:', error);
            // Don't break the entire page if filter menu fails
        }
    }
    
    createFilterMenuContent(container) {
        container.innerHTML = `
            <div class="filter-header">
                <h3 class="filter-title">Filter by Package</h3>
                <button class="filter-clear" id="filter-clear" aria-label="Clear filter" style="display: none;">
                    <i class="fas fa-times" aria-hidden="true"></i>
                    <span>Clear</span>
                </button>
            </div>
            <div class="filter-content" id="filter-content">
                <div class="filter-search">
                    <i class="fas fa-search" aria-hidden="true"></i>
                    <input
                        type="text"
                        id="filter-search"
                        placeholder="Search filters..."
                        aria-label="Search filter options"
                        autocomplete="off"
                    >
                </div>
                <div class="filter-options" id="filter-options" role="radiogroup">
                    <!-- Filter options will be populated dynamically -->
                </div>
            </div>
        `;
    }
    
    setupFilterMenuEventListeners() {
        const filterClear = document.getElementById('filter-clear');
        const filterSearch = document.getElementById('filter-search');
        const filterMenu = document.getElementById('filter-menu');
        
        if (!filterMenu) {
            console.warn('Filter menu not found');
            return;
        }
        
        // Clear filters
        if (filterClear) {
            filterClear.addEventListener('click', () => {
                this.clearFilters();
            });
        }
        
        // Filter search
        if (filterSearch) {
            filterSearch.addEventListener('input', (e) => {
                this.handleFilterSearch(e.target.value);
            });
        }
        
        // Handle keyboard navigation for filter search
        if (filterSearch) {
            filterSearch.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    filterSearch.value = '';
                    this.handleFilterSearch('');
                    filterSearch.blur();
                }
            });
        }
    }
    
    updateFilterOptions() {
        try {
            const filterOptions = document.getElementById('filter-options');
            if (!filterOptions) {
                console.warn('Filter options container not found');
                return;
            }
            
            // Sort package names alphabetically
            const sortedPackageNames = Array.from(this.packageNames).sort();
            
            // Create filter option elements
            filterOptions.innerHTML = '';
            
            // Add "All" option with total package count
            const totalPackageCount = this.originalPackages.length;
            const allFilterOption = this.createFilterOption('All', totalPackageCount, this.selectedFilter === null || this.selectedFilter === "");
            filterOptions.appendChild(allFilterOption);
            
            // Add package filter options
            sortedPackageNames.forEach(packageName => {
                try {
                    const count = this.filterCounts.get(packageName) || 0;
                    const isSelected = this.selectedFilter === packageName;
                    const filterOption = this.createFilterOption(packageName, count, isSelected);
                    filterOptions.appendChild(filterOption);
                } catch (optionError) {
                    console.error('Error creating filter option for package:', packageName, optionError);
                }
            });
            
            // Add event listeners to radio buttons
            const radioButtons = filterOptions.querySelectorAll('.filter-radio');
            radioButtons.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    this.handleFilterChange(e.target.value, e.target.checked);
                });
                
                // Add keyboard support for radio buttons
                radio.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        radio.checked = true;
                        this.handleFilterChange(radio.value, true);
                    }
                });
            });
            
            this.updateFilterCount();
        } catch (error) {
            console.error('Error updating filter options:', error);
        }
    }
    
    createFilterOption(text, count, isSelected) {
        const filterOption = document.createElement('div');
        filterOption.className = `filter-option ${isSelected ? 'selected' : ''}`;
        
        const filterLabel = document.createElement('label');
        filterLabel.className = 'filter-label';
        
        const filterRadio = document.createElement('input');
        filterRadio.type = 'radio';
        filterRadio.className = 'filter-radio';
        filterRadio.name = 'package-filter';
        
        // Handle "All" filter specially - display "All" but use null as value
        if (text === 'All') {
            filterRadio.value = null; // No filter when "All" is selected
            filterRadio.setAttribute('data-filter-label', 'All'); // Store display label
        } else {
            filterRadio.value = text;
            filterRadio.setAttribute('data-filter-label', text);
        }
        
        filterRadio.checked = isSelected;
        filterRadio.setAttribute('aria-label', text);
        
        const filterText = document.createElement('span');
        filterText.className = 'filter-text';
        filterText.textContent = text;
        
        const filterCountBadge = document.createElement('span');
        filterCountBadge.className = 'filter-count-badge';
        filterCountBadge.textContent = count;
        
        filterLabel.appendChild(filterRadio);
        filterLabel.appendChild(filterText);
        filterLabel.appendChild(filterCountBadge);
        filterOption.appendChild(filterLabel);
        
        return filterOption;
    }
    
    handleFilterChange(packageName, isChecked) {
        try {
            // For radio buttons, isChecked will always be true when selected
            // Handle "All" filter specially - null value means no filter
            this.selectedFilter = packageName;
            
            this.updateFilterCount();
            this.updateFilterOptions(); // This will update the visual state
            
            // Debounce filter application for better performance
            clearTimeout(this.filterDebounceTimer);
            this.filterDebounceTimer = setTimeout(() => {
                this.applyFilters();
            }, 150);
        } catch (error) {
            console.error('Error handling filter change:', error);
        }
    }
    
    
    handleFilterSearch(searchTerm) {
        try {
            const filterOptions = document.getElementById('filter-options');
            if (!filterOptions) {
                console.warn('Filter options container not found');
                return;
            }
            
            // Debounce filter search for better performance
            clearTimeout(this.filterSearchDebounceTimer);
            this.filterSearchDebounceTimer = setTimeout(() => {
                try {
                    const options = filterOptions.querySelectorAll('.filter-option');
                    const term = searchTerm.toLowerCase();
                    
                    options.forEach(option => {
                        try {
                            const text = option.querySelector('.filter-text')?.textContent?.toLowerCase() || '';
                            option.style.display = text.includes(term) ? 'block' : 'none';
                        } catch (optionError) {
                            console.error('Error processing filter option:', optionError);
                            option.style.display = 'block'; // Show option if there's an error
                        }
                    });
                } catch (searchError) {
                    console.error('Error during filter search:', searchError);
                }
            }, 200);
        } catch (error) {
            console.error('Error in filter search handler:', error);
        }
    }
    
    updateFilterCount() {
        const filterClear = document.getElementById('filter-clear');
        
        if (filterClear) {
            // Show clear button when a specific filter is selected (not "All")
            filterClear.style.display = this.selectedFilter !== null && this.selectedFilter !== 'All' ? 'flex' : 'none';
        }
    }
    
    clearFilters() {
        try {
            this.selectedFilter = null; // This represents the "All" filter
            this.updateFilterCount();
            this.updateFilterOptions();
            
            // Debounce filter application for better performance
            clearTimeout(this.filterDebounceTimer);
            this.filterDebounceTimer = setTimeout(() => {
                this.applyFilters();
            }, 150);
        } catch (error) {
            console.error('Error clearing filters:', error);
        }
    }
    
    applyFilters() {
        try {
            if (this.selectedFilter === null || this.selectedFilter === "") {
                // "All" filter selected - show all packages (no filtering applied)
                this.filteredPackages = [...this.originalPackages];
            } else {
                // Apply specific filter to original packages
                this.filteredPackages = this.originalPackages.filter(packageCard => {
                    try {
                        const packageName = packageCard.querySelector('.package-name')?.textContent?.trim() || '';
                        return packageName === this.selectedFilter;
                    } catch (filterError) {
                        console.error('Error filtering package card:', filterError);
                        return false; // Exclude package if there's an error
                    }
                });
            }
            
            // Apply search if there's a search term
            const searchTerm = this.searchInput.value.trim();
            if (searchTerm) {
                this.filteredPackages = this.filteredPackages.filter(packageCard => {
                    try {
                        const packageData = this.getPackageData(packageCard);
                        return this.matchesSearch(packageData, searchTerm);
                    } catch (searchError) {
                        console.error('Error searching package card:', searchError);
                        return false; // Exclude package if there's an error
                    }
                });
            }
            
            this.renderPackages(this.filteredPackages);
            this.updateResultsInfo();
            
            // Update filter search results if it's active
            const filterSearch = document.getElementById('filter-search');
            if (filterSearch && filterSearch.value.trim()) {
                this.handleFilterSearch(filterSearch.value.trim());
            }
        } catch (error) {
            console.error('Error applying filters:', error);
            // Fallback to showing all packages
            this.filteredPackages = [...this.originalPackages];
            this.renderPackages(this.filteredPackages);
            this.updateResultsInfo();
        }
    }
    
    updateResultsInfo() {
        try {
            const hasSearchTerm = this.searchInput.value.trim();
            const hasFilter = this.selectedFilter !== null;
            
            if (hasSearchTerm || hasFilter) {
                this.showResultsInfo(this.filteredPackages.length);
                
                // Update results info to include filter information
                const resultsCount = document.getElementById('results-count');
                if (resultsCount) {
                    let resultText = '';
                    if (hasSearchTerm && hasFilter) {
                        if (this.selectedFilter === null) {
                            resultText = `${this.filteredPackages.length} packages found with search and "All" filter`;
                        } else {
                            resultText = `${this.filteredPackages.length} packages found with search and filter`;
                        }
                    } else if (hasSearchTerm) {
                        resultText = `${this.filteredPackages.length} packages found with search`;
                    } else if (hasFilter) {
                        if (this.selectedFilter === null) {
                            resultText = `${this.filteredPackages.length} packages found with "All" filter`;
                        } else {
                            resultText = `${this.filteredPackages.length} packages found with filter`;
                        }
                    }
                    resultsCount.textContent = resultText;
                }
            }
        } catch (error) {
            console.error('Error updating results info:', error);
        }

        this.showResultsInfo(this.filteredPackages.length);
    }
    
    getPackageData(packageCard) {
        return {
            name: packageCard.querySelector('.package-name')?.textContent?.trim() || '',
            description: packageCard.querySelector('.package-description')?.textContent?.trim() || '',
            version: packageCard.querySelector('.package-version')?.textContent?.trim() || '',
            maintainerName: packageCard.querySelector('.meta-item:nth-child(1) span')?.textContent?.trim() || '',
            maintainerEmail: packageCard.querySelector('.meta-item:nth-child(2) span')?.textContent?.trim() || '',
            query: packageCard.querySelector('.package-query pre')?.textContent?.trim() || '',
            tags: Array.from(packageCard.querySelectorAll('.tag')).map(tag => tag.textContent?.trim() || '').join(' '),
            license: packageCard.querySelector('.meta-item:nth-child(3) span')?.textContent?.trim() || ''
        };
    }
    
    matchesSearch(packageData, searchTerm) {
        const term = searchTerm.toLowerCase();
        return Object.values(packageData).some(field => {
            return field && field.toString().toLowerCase().includes(term);
        });
    }
    
    renderPackages(packages) {
        // Hide/show no results message
        this.noResults.style.display = packages.length === 0 ? 'block' : 'none';
        
        // Clear current packages
        this.packagesGrid.innerHTML = '';
        
        // Add filtered packages
        packages.forEach(packageCard => {
            this.packagesGrid.appendChild(packageCard.cloneNode(true));
        });
        
        // Re-initialize copy functionality for new elements
        this.initializeCopyButtons();
    }
    
    showResultsInfo(count) {
        this.resultsCount.textContent = count;
        this.resultsInfo.style.display = 'block';
    }
    
    clearSearch() {
        this.searchInput.value = '';
        this.searchClear.style.display = 'none';
        this.performSearch('');
        this.searchInput.focus();
    }
    
    initializeCopyButtons() {
        // Re-initialize copy functionality for dynamically added elements
        const copyButtons = document.querySelectorAll('.copy-query, .copy-oras');
        
        copyButtons.forEach(button => {
            button.addEventListener('click', function() {
                const query = this.getAttribute('data-query');
                copyToClipboard(query, this);
            });
        });
    }
}

// Enhanced clipboard copy function with comprehensive error handling
async function copyToClipboard(text, button) {
    try {
        // First try using the modern Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            showCopySuccess(button);
            return;
        }
        
        // If Clipboard API is not available or not in secure context, try to request permission
        if (navigator.clipboard && !window.isSecureContext) {
            try {
                // Try to request clipboard permission for non-secure contexts
                const permission = await navigator.permissions.query({ name: 'clipboard-write' });
                if (permission.state === 'granted' || permission.state === 'prompt') {
                    await navigator.clipboard.writeText(text);
                    showCopySuccess(button);
                    return;
                }
            } catch (permissionErr) {
                // Permission API not supported, continue with fallback
                console.warn('Clipboard permission API not supported, using fallback:', permissionErr);
            }
        }
        
        // Fallback to document.execCommand for older browsers
        await fallbackCopyText(text, button);
        
    } catch (error) {
        console.error('Clipboard operation failed:', error);
        
        // Provide user feedback about the failure
        showCopyError(button, error);
        
        // Try alternative fallback methods
        tryAlternativeCopyMethods(text, button);
    }
}

// Fallback copy function for browsers without clipboard API
function fallbackCopyText(text, button) {
    return new Promise((resolve, reject) => {
        try {
            // Create a temporary textarea element
            const textArea = document.createElement('textarea');
            textArea.value = text;
            
            // Style to make it invisible but focusable
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            textArea.style.width = '1px';
            textArea.style.height = '1px';
            textArea.style.padding = '0';
            textArea.style.border = 'none';
            textArea.style.outline = 'none';
            textArea.style.boxShadow = 'none';
            textArea.style.background = 'transparent';
            
            document.body.appendChild(textArea);
            
            // Focus and select the text
            textArea.focus();
            textArea.select();
            
            // Try to execute the copy command
            const successful = document.execCommand('copy');
            
            // Clean up
            document.body.removeChild(textArea);
            
            if (successful) {
                showCopySuccess(button);
                resolve(true);
            } else {
                reject(new Error('document.execCommand returned false'));
            }
            
        } catch (err) {
            // Clean up even if there was an error
            const textArea = document.querySelector('textarea[style*="position: fixed"]');
            if (textArea) {
                document.body.removeChild(textArea);
            }
            reject(err);
        }
    });
}

// Try alternative copy methods when primary methods fail
function tryAlternativeCopyMethods(text, button) {
    // Method 1: Try using a more visible textarea approach
    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'absolute';
        textArea.style.left = '50%';
        textArea.style.top = '50%';
        textArea.style.transform = 'translate(-50%, -50%)';
        textArea.style.zIndex = '9999';
        textArea.style.background = 'white';
        textArea.style.padding = '10px';
        textArea.style.border = '1px solid #ccc';
        textArea.style.borderRadius = '4px';
        
        // Add a message to the user
        const message = document.createElement('div');
        message.textContent = 'Text selected for copying. Press Ctrl+C to copy.';
        message.style.position = 'absolute';
        message.style.left = '50%';
        message.style.top = 'calc(50% + 60px)';
        message.style.transform = 'translateX(-50%)';
        message.style.background = '#f0f0f0';
        message.style.padding = '5px 10px';
        message.style.borderRadius = '4px';
        message.style.fontSize = '12px';
        message.style.zIndex = '10000';
        
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '0';
        container.style.top = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.background = 'rgba(0,0,0,0.5)';
        container.style.zIndex = '9998';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        
        container.appendChild(textArea);
        container.appendChild(message);
        document.body.appendChild(container);
        
        textArea.focus();
        textArea.select();
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(container)) {
                document.body.removeChild(container);
            }
        }, 5000);
        
    } catch (altError) {
        console.error('Alternative copy method also failed:', altError);
        // Last resort: show the text in a modal or alert
        showTextInModal(text, button);
    }
}

// Show text in a modal as last resort
function showTextInModal(text, button) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.background = 'rgba(0,0,0,0.8)';
    modal.style.zIndex = '10001';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    
    const content = document.createElement('div');
    content.style.background = 'white';
    content.style.padding = '20px';
    content.style.borderRadius = '8px';
    content.style.maxWidth = '80%';
    content.style.maxHeight = '80%';
    content.style.overflow = 'auto';
    
    const title = document.createElement('h3');
    title.textContent = 'Copy Failed';
    title.style.margin = '0 0 10px 0';
    
    const message = document.createElement('p');
    message.textContent = 'Unable to copy to clipboard automatically. Please copy the text below manually:';
    message.style.margin = '0 0 10px 0';
    
    const textContainer = document.createElement('pre');
    textContainer.textContent = text;
    textContainer.style.background = '#f5f5f5';
    textContainer.style.padding = '10px';
    textContainer.style.borderRadius = '4px';
    textContainer.style.whiteSpace = 'pre-wrap';
    textContainer.style.wordBreak = 'break-all';
    textContainer.style.margin = '0 0 10px 0';
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.padding = '8px 16px';
    closeButton.style.background = '#007bff';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    content.appendChild(title);
    content.appendChild(message);
    content.appendChild(textContainer);
    content.appendChild(closeButton);
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Auto-remove after 30 seconds
    setTimeout(() => {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
    }, 30000);
}

// Show copy success feedback
function showCopySuccess(button) {
    const originalHTML = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Copied!';
    button.classList.add('copied');
    
    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.classList.remove('copied');
    }, 2000);
}

// Show copy error feedback
function showCopyError(button, error) {
    const originalHTML = button.innerHTML;
    button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Copy Failed';
    button.classList.add('copy-error');
    
    // Add error details to console for debugging
    console.error('Clipboard error details:', {
        error: error.message,
        stack: error.stack,
        isSecureContext: window.isSecureContext,
        hasClipboardAPI: !!navigator.clipboard,
        userAgent: navigator.userAgent
    });
    
    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.classList.remove('copy-error');
    }, 3000);
}

// Copy to clipboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize search functionality
    const search = new PackageSearch();
    search.updateResultsInfo()
    
    // Handle existing copy-query buttons (tags) - use the unified function
    const copyButtons = document.querySelectorAll('.copy-query');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const query = this.getAttribute('data-query');
            copyToClipboard(query, this);
        });
    });

    // Handle ORAS source copy buttons - use the unified function
    const orasCopyButtons = document.querySelectorAll('.copy-oras');
    
    orasCopyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const query = this.getAttribute('data-query');
            copyToClipboard(query, this);
        });
    });
    
    
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add scroll effect to header
    const header = document.querySelector('.header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            return;
        }
        
        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            header.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            header.classList.remove('scroll-down');
        }
        
        lastScroll = currentScroll;
    });
});