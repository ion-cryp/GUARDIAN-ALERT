document.addEventListener('DOMContentLoaded', function() {
  initializeDashboard();
  setInterval(updateDateTime, 60000);
});

function initializeDashboard() {
  const userLrn = sessionStorage.getItem('currentUser');
  if (!userLrn) {
    window.location.href = 'index.html';
    return;
  }

  const userName = sessionStorage.getItem('userName') || 'Juan Cruz';
  
  document.getElementById('display-name').textContent = userName;
  document.getElementById('welcome-name').textContent = userName.split(' ')[0];
  document.getElementById('info-fullname').textContent = userName;
  document.getElementById('info-lrn').textContent = userLrn;
  
  loadStudentData(userLrn);
  loadRecentActivities();
  setupDarkMode();
  setupEventListeners();
  updateDateTime();
  setTimeout(() => generateQR('sms', true), 500);
}

function loadStudentData(lrn) {
  const users = JSON.parse(localStorage.getItem('students') || '[]');
  const user = users.find(u => u.lrn === lrn);
  
  if (user) {
    document.getElementById('info-strand').textContent = user.strand || 'Grade 10';
    document.getElementById('info-year').textContent = user.school_year || 'Grade 10';
    document.getElementById('parent-phone').textContent = user.parent_phone || '+639123456789';
    document.getElementById('parent-email').textContent = user.parent_email || 'parent@email.com';
  }
  
  document.getElementById('last-login').textContent = 'Today';
  document.getElementById('last-contact').textContent = 'Never';
}

function loadRecentActivities() {
  const activities = JSON.parse(localStorage.getItem('activities') || '[]');
  const activityList = document.getElementById('activity-list');
  
  if (activities.length > 0) {
    activityList.innerHTML = activities.slice(0, 3).map(activity => `
      <div class="activity-item">
        <i class="fas ${activity.icon || 'fa-bell'}"></i>
        <div>
          <span>${activity.text}</span>
          <div>${activity.time}</div>
        </div>
      </div>
    `).join('');
  } else {
    activityList.innerHTML = `
      <div class="activity-item"><i class="fas fa-sign-in-alt"></i><div><span>Logged in to dashboard</span><div>Just now</div></div></div>
      <div class="activity-item"><i class="fas fa-qrcode"></i><div><span>Generated emergency QR code</span><div>5 minutes ago</div></div></div>
    `;
  }
}

function setupEventListeners() {
  document.getElementById('menu-toggle')?.addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('sidebar')?.classList.toggle('active');
  });
  
  document.getElementById('dark-mode-toggle')?.addEventListener('change', function() {
    toggleDarkMode(this.checked);
  });
  
  document.getElementById('clinic-alert-type')?.addEventListener('change', function() {
    const message = document.getElementById('clinic-message');
    if (!message) return;
    const templates = {
      'injury': 'I have sustained an injury at school.',
      'illness': 'I am feeling unwell and need medical attention.',
      'fever': 'I have a fever and need to see the clinic staff.',
      'emergency': 'EMERGENCY: I need immediate medical attention.'
    };
    if (this.value in templates && message.value === '') {
      message.value = templates[this.value];
    }
  });
}

function generateQR(type = 'sms', silent = false) {
  const userLrn = sessionStorage.getItem('currentUser');
  const parentNumber = document.getElementById('parent-phone')?.textContent?.replace(/[^0-9]/g, '') || '639123456789';
  const fullName = document.getElementById('info-fullname')?.textContent || 'Juan Cruz';
  const defaultMessage = `URGENT: ${fullName} (LRN: ${userLrn}) needs assistance at school. Please contact immediately.`;
  
  let uri = '';
  switch(type) {
    case 'sms': uri = `sms:${parentNumber}?body=${encodeURIComponent(defaultMessage)}`; break;
    case 'call': uri = `tel:${parentNumber}`; break;
    case 'email': uri = `mailto:${document.getElementById('parent-email')?.textContent || 'parent@email.com'}?subject=${encodeURIComponent('Emergency Alert')}&body=${encodeURIComponent(defaultMessage)}`; break;
    case 'whatsapp': uri = `https://wa.me/${parentNumber}?text=${encodeURIComponent(defaultMessage)}`; break;
    default: return;
  }
  
  if (typeof QRCode === 'undefined') {
    if (!silent) alert('QR Code library not loaded');
    return;
  }
  
  QRCode.toDataURL(uri, { width: 180, margin: 2 }, function(err, url) {
    if (err) {
      if (!silent) alert('Failed to generate QR code');
      return;
    }
    const qrImage = document.getElementById('qrcode');
    if (qrImage) qrImage.src = url;
  });
}

function setupDarkMode() {
  const darkMode = localStorage.getItem('darkMode') === 'true';
  const toggle = document.getElementById('dark-mode-toggle');
  if (toggle) {
    toggle.checked = darkMode;
    toggleDarkMode(darkMode);
  }
}

function toggleDarkMode(enable) {
  if (enable) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  localStorage.setItem('darkMode', enable);
}

function downloadQR() {
  const qrImage = document.getElementById('qrcode');
  if (!qrImage || qrImage.src.includes('placeholder')) {
    alert('Please generate a QR code first');
    return;
  }
  const link = document.createElement('a');
  link.download = 'guardianalert-qrcode.png';
  link.href = qrImage.src;
  link.click();
  alert('QR code downloaded');
}

function testContact(type) {
  const parentNumber = document.getElementById('parent-phone')?.textContent?.replace(/[^0-9]/g, '') || '639123456789';
  if (type === 'call') {
    window.open(`tel:${parentNumber}`, '_blank');
    alert('Initiating test call...');
  } else if (type === 'sms') {
    window.open(`sms:${parentNumber}?body=${encodeURIComponent('Test message from GuardianAlert.')}`, '_blank');
    alert('Opening SMS app...');
  }
}

function sendToClinic() {
  const alertType = document.getElementById('clinic-alert-type')?.value;
  const message = document.getElementById('clinic-message')?.value;
  
  if (!alertType || !message?.trim()) {
    alert('Please select an alert type and enter a message');
    return;
  }
  
  const activities = JSON.parse(localStorage.getItem('activities') || '[]');
  activities.unshift({
    icon: 'fa-clinic-medical',
    text: `Clinic alert sent: ${alertType}`,
    time: 'Just now'
  });
  localStorage.setItem('activities', JSON.stringify(activities.slice(0, 10)));
  
  alert('Clinic has been notified!');
  document.getElementById('clinic-alert-type').value = '';
  document.getElementById('clinic-message').value = '';
  loadRecentActivities();
}

function viewActivityHistory() {
  const activities = JSON.parse(localStorage.getItem('activities') || '[]');
  const list = document.getElementById('full-activity-list');
  
  if (activities.length > 0) {
    list.innerHTML = activities.map(activity => `
      <div class="activity-item">
        <i class="fas ${activity.icon || 'fa-bell'}"></i>
        <div>
          <span>${activity.text}</span>
          <div>${activity.time}</div>
        </div>
      </div>
    `).join('');
  } else {
    list.innerHTML = `
      <div class="activity-item"><i class="fas fa-sign-in-alt"></i><div><span>Logged in to dashboard</span><div>Today at 10:30 AM</div></div></div>
      <div class="activity-item"><i class="fas fa-qrcode"></i><div><span>Generated emergency QR code</span><div>Today at 10:25 AM</div></div></div>
    `;
  }
  document.getElementById('activity-modal')?.classList.add('active');
}

function closeActivityModal() {
  document.getElementById('activity-modal')?.classList.remove('active');
}

function sendMessageNow() {
  const parentNumber = document.getElementById('parent-phone')?.textContent?.replace(/[^0-9]/g, '') || '639123456789';
  const fullName = document.getElementById('info-fullname')?.textContent || 'Juan Cruz';
  const message = `URGENT: ${fullName} needs assistance at school. Please contact immediately.`;
  
  window.open(`sms:${parentNumber}?body=${encodeURIComponent(message)}`, '_blank');
  
  const activities = JSON.parse(localStorage.getItem('activities') || '[]');
  activities.unshift({
    icon: 'fa-paper-plane',
    text: 'Emergency message sent to parent',
    time: 'Just now'
  });
  localStorage.setItem('activities', JSON.stringify(activities.slice(0, 10)));
  
  alert('Emergency message initiated!');
  loadRecentActivities();
}

function saveMessageTemplate() {
  const template = prompt("Enter your custom emergency message template:", 
    "Hello, this is a notification from GuardianAlert. Your child needs your attention.");
  if (template) {
    localStorage.setItem('messageTemplate', template);
    alert('Message template saved!');
  }
}

function openSettings(type) {
  const newValue = prompt(`Enter new ${type}:`, '');
  if (newValue) {
    alert(`${type} updated!`);
  }
}

function logout() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}

function updateDateTime() {
  const now = new Date();
  document.getElementById('current-time').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

window.generateQR = generateQR;
window.openSettings = openSettings;
window.downloadQR = downloadQR;
window.testContact = testContact;
window.sendToClinic = sendToClinic;
window.viewActivityHistory = viewActivityHistory;
window.closeActivityModal = closeActivityModal;
window.sendMessageNow = sendMessageNow;
window.saveMessageTemplate = saveMessageTemplate;
window.logout = logout;
window.toggleDarkMode = toggleDarkMode;