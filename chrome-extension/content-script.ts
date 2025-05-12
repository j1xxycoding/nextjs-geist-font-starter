// Utility: Check for existing Stripe script element.
const isStripeLoaded = (): boolean => {
  try {
    return Boolean(
      document.querySelector('script[src*="js.stripe.com"]') ||
      document.querySelector('form[data-stripe-form]') ||
      document.querySelector('.stripe-element') ||
      document.querySelector('[data-stripe]')
    );
  } catch (error) {
    console.error('Error checking for Stripe script:', error);
    return false;
  }
};

// Function to create and show the popup.
const showStripePopup = () => {
  try {
    // Prevent multiple popups
    if (document.getElementById('stripe-popup-container')) return;

    // Create container element and attach a shadow DOM for style isolation.
    const container = document.createElement('div');
    container.id = 'stripe-popup-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '999999';
    
    // Create shadow root
    const shadow = container.attachShadow({ mode: 'open' });

    // Build the popup element
    const popup = document.createElement('div');
    popup.className = 'stripe-popup';
    popup.innerHTML = `
      <div class="popup-content">
        <div class="popup-icon">💳</div>
        <div class="popup-message">Stripe Payment Detected!</div>
        <button class="popup-close" title="Close">&times;</button>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .stripe-popup {
        background: rgba(255, 255, 255, 0.98);
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        padding: 16px;
        width: 280px;
        animation: slideIn 0.3s ease;
      }

      .popup-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .popup-icon {
        font-size: 24px;
      }

      .popup-message {
        color: #1a1a1a;
        font-size: 14px;
        font-weight: 500;
        flex: 1;
      }

      .popup-close {
        background: transparent;
        border: none;
        color: #666;
        cursor: pointer;
        font-size: 20px;
        height: 24px;
        line-height: 24px;
        padding: 0;
        width: 24px;
        transition: color 0.2s;
      }

      .popup-close:hover {
        color: #1a1a1a;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;

    shadow.appendChild(style);
    shadow.appendChild(popup);

    // Add close button functionality
    const closeButton = shadow.querySelector('.popup-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        container.remove();
      });
    }

    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (container && container.isConnected) {
        container.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => container.remove(), 300);
      }
    }, 5000);

    // Add to page
    document.body.appendChild(container);
  } catch (error) {
    console.error('Error displaying Stripe popup:', error);
  }
};

// Main detection logic
const initStripeDetector = () => {
  try {
    // Check immediately
    if (isStripeLoaded()) {
      showStripePopup();
      return;
    }

    // Set up observer for dynamic content
    const observer = new MutationObserver((mutations) => {
      if (isStripeLoaded()) {
        showStripePopup();
        observer.disconnect();
      }
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'class', 'data-stripe']
    });

  } catch (error) {
    console.error('Error initializing Stripe detector:', error);
  }
};

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStripeDetector);
} else {
  initStripeDetector();
}
