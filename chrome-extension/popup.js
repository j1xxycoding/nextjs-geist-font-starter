// Card generation utilities
function generateCard(bin) {
  // Ensure bin is a string
  bin = bin.toString();
  
  // Generate remaining card numbers
  const length = 16 - bin.length;
  let cardNumber = bin;
  
  // Fill remaining digits with random numbers
  for (let i = 0; i < length - 1; i++) {
    cardNumber += Math.floor(Math.random() * 10);
  }
  
  // Calculate and append Luhn check digit
  cardNumber += generateLuhnDigit(cardNumber);
  
  // Generate expiry (current year + 2-5 years)
  const currentYear = new Date().getFullYear() % 100;
  const month = Math.floor(Math.random() * 12) + 1;
  const year = currentYear + Math.floor(Math.random() * 4) + 2;
  
  // Generate CVV
  const cvv = Math.floor(Math.random() * 900) + 100;
  
  return {
    number: cardNumber,
    expiry: `${month.toString().padStart(2, '0')}/${year}`,
    cvv: cvv.toString()
  };
}

// Luhn algorithm check digit generator
function generateLuhnDigit(partialNumber) {
  let sum = 0;
  let isEven = false;
  
  // Calculate sum
  for (let i = partialNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(partialNumber[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  // Calculate check digit
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit.toString();
}

// DOM Elements
const binInput = document.getElementById('bin');
const countInput = document.getElementById('count');
const saveButton = document.getElementById('saveBtn');
const statusDiv = document.getElementById('status');
const generatedCardDiv = document.getElementById('generatedCard');
const cardNumberSpan = document.getElementById('cardNumber');
const expirySpan = document.getElementById('expiry');
const cvvSpan = document.getElementById('cvv');

// Load saved settings
chrome.storage.local.get(['bin', 'count'], (result) => {
  if (result.bin) binInput.value = result.bin;
  if (result.count) countInput.value = result.count;
});

// Save settings and generate sample card
saveButton.addEventListener('click', () => {
  const bin = binInput.value.trim();
  const count = parseInt(countInput.value);
  
  // Validate input
  if (!/^\d{6,8}$/.test(bin)) {
    showStatus('Please enter a valid BIN (6-8 digits)', 'error');
    return;
  }
  
  if (count < 1 || count > 10) {
    showStatus('Please enter a valid count (1-10)', 'error');
    return;
  }
  
  // Save settings
  chrome.storage.local.set({
    bin: bin,
    count: count
  }, () => {
    // Generate and display sample card
    const card = generateCard(bin);
    cardNumberSpan.textContent = card.number;
    expirySpan.textContent = card.expiry;
    cvvSpan.textContent = card.cvv;
    generatedCardDiv.classList.add('visible');
    
    showStatus('Settings saved! Sample card generated.', 'success');
    
    // Send settings to content script
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'UPDATE_SETTINGS',
        settings: { bin, count }
      });
    });
  });
});

function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = 'status ' + type;
  setTimeout(() => {
    statusDiv.className = 'status';
  }, 3000);
}
