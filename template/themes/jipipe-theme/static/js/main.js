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
        
        this.init();
    }
    
    init() {
        // Store original packages
        this.originalPackages = Array.from(document.querySelectorAll('.package-card'));
        this.filteredPackages = [...this.originalPackages];
        
        // Set up event listeners
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.searchClear.addEventListener('click', () => this.clearSearch());
        
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
            this.hideResultsInfo();
        } else {
            this.filteredPackages = this.originalPackages.filter(packageCard => {
                const packageData = this.getPackageData(packageCard);
                return this.matchesSearch(packageData, searchTerm);
            });
            this.showResultsInfo(this.filteredPackages.length);
        }
        
        this.renderPackages(this.filteredPackages);
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
        this.totalPackages.style.display = 'none';
    }
    
    hideResultsInfo() {
        this.resultsInfo.style.display = 'none';
        this.totalPackages.style.display = 'block';
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
    new PackageSearch();
    
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