let currentEditField = null;

document.addEventListener('DOMContentLoaded', function() {
  initializeDashboard();
  setInterval(updateDateTime, 60000);
  setInterval(checkNewAlerts, 5000);
});

function initializeDashboard() {
  const userLrn = sessionStorage.getItem('currentUser');
  if (!userLrn) {
    window.location.href = 'index.html';
    return;
  }

  loadStudentData(userLrn);
  loadRecentActivities();
  setupDarkMode();
  setupEventListeners();
  updateDateTime();
  generateQR('sms', true);
  loadClinicPhoneNumber();
}

function loadStudentData(lrn) {
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const user = students.find(u => u.lrn === lrn);
  
  if (user) {
    const fullName = `${user.first_name} ${user.last_name}`;
    sessionStorage.setItem('userName', fullName);
    
    document.getElementById('display-name').textContent = fullName;
    document.getElementById('welcome-name').textContent = user.first_name;
    document.getElementById('info-fullname').textContent = fullName;
    document.getElementById('info-lrn').textContent = user.lrn;
    document.getElementById('info-year').textContent = user.school_year || 'Not Set';
    document.getElementById('info-strand').textContent = (user.strand && user.strand !== 'N/A') ? user.strand : 'Not Applicable';
    document.getElementById('info-adviser').textContent = user.adviser || 'Not Set';
    document.getElementById('parent-name').textContent = user.guardian_name || 'Not Set';
    document.getElementById('parent-phone').textContent = user.parent_phone || '+639123456789';
    document.getElementById('parent-email').textContent = user.parent_email || 'parent@email.com';
    
    document.getElementById('last-login').textContent = 'Today';
  }
}

function loadClinicPhoneNumber() {
  // Get clinic phone from localStorage or use default
  let clinicPhone = localStorage.getItem('clinicPhone');
  
  // If no clinic phone in localStorage, check if user has clinic_phone in their data
  if (!clinicPhone) {
    const userLrn = sessionStorage.getItem('currentUser');
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const user = students.find(u => u.lrn === userLrn);
    
    if (user && user.clinic_phone) {
      clinicPhone = user.clinic_phone;
    } else {
      clinicPhone = '9123456789'; // Default
    }
    
    localStorage.setItem('clinicPhone', clinicPhone);
  }
  
  const formattedPhone = formatPhoneNumber(clinicPhone);
  document.getElementById('clinic-phone-display').textContent = formattedPhone;
}

function formatPhoneNumber(phone) {
  // Format: +63 912 345 6789 for display only
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('63')) {
    return `+63 ${cleaned.substring(2, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8)}`;
  } else if (cleaned.length === 10) {
    return `+63 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `+63 ${cleaned.substring(1, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`;
  }
  return phone;
}

function getCleanPhoneNumber(phone) {
  // Remove all non-numeric characters and ensure proper format for tel/sms
  let cleaned = phone.replace(/\D/g, '');
  
  // If it starts with 0, remove it and add +63
  if (cleaned.startsWith('0')) {
    cleaned = '63' + cleaned.substring(1);
  }
  // If it doesn't start with 63, add it
  else if (!cleaned.startsWith('63')) {
    cleaned = '63' + cleaned;
  }
  
  return cleaned;
}

function openClinicPhoneModal() {
  const modal = document.getElementById('clinic-phone-modal');
  const input = document.getElementById('edit-clinic-phone');
  const currentPhone = localStorage.getItem('clinicPhone') || '9123456789';
  
  // Remove +63 prefix for editing
  const cleanPhone = currentPhone.replace(/\D/g, '');
  if (cleanPhone.startsWith('63')) {
    input.value = cleanPhone.substring(2);
  } else {
    input.value = cleanPhone;
  }
  
  modal.classList.add('active');
}

function closeClinicPhoneModal() {
  document.getElementById('clinic-phone-modal').classList.remove('active');
}

function saveClinicPhone() {
  const input = document.getElementById('edit-clinic-phone');
  let phoneNumber = input.value.trim().replace(/\D/g, '');
  
  if (!phoneNumber) {
    alert('Please enter a phone number');
    return;
  }
  
  // Validate phone number length
  if (phoneNumber.length < 10 || phoneNumber.length > 12) {
    alert('Phone number must be 10-12 digits');
    return;
  }
  
  // Store without +63 prefix
  localStorage.setItem('clinicPhone', phoneNumber);
  
  // Update display
  const formattedPhone = formatPhoneNumber(phoneNumber);
  document.getElementById('clinic-phone-display').textContent = formattedPhone;
  
  // Add activity
  addActivity('fa-phone-alt', 'Updated clinic phone number');
  
  closeClinicPhoneModal();
  showNotification('Clinic phone number updated!');
}

function loadRecentActivities() {
  const userLrn = sessionStorage.getItem('currentUser');
  const activitiesKey = `activities_${userLrn}`;
  const activities = JSON.parse(localStorage.getItem(activitiesKey) || '[]');
  const activityList = document.getElementById('activity-list');
  
  if (activities.length > 0) {
    activityList.innerHTML = activities.slice(0, 5).map(activity => `
      <div class="activity-item">
        <i class="fas ${activity.icon}"></i>
        <div>
          <span>${activity.text}</span>
          <div>${activity.time}</div>
        </div>
      </div>
    `).join('');
  } else {
    activityList.innerHTML = '<div class="activity-item" style="text-align: center;">No recent activities</div>';
  }
  
  document.getElementById('alert-count').textContent = activities.filter(a => a.type === 'alert').length;
}

function addActivity(icon, text, type = 'activity') {
  const userLrn = sessionStorage.getItem('currentUser');
  const activitiesKey = `activities_${userLrn}`;
  const activities = JSON.parse(localStorage.getItem(activitiesKey) || '[]');
  
  activities.unshift({
    icon: icon,
    text: text,
    time: new Date().toLocaleString(),
    type: type
  });
  
  localStorage.setItem(activitiesKey, JSON.stringify(activities.slice(0, 50)));
  loadRecentActivities();
}

function clearActivityHistory() {
  if (confirm('Clear all activity history?')) {
    const userLrn = sessionStorage.getItem('currentUser');
    localStorage.removeItem(`activities_${userLrn}`);
    loadRecentActivities();
    addActivity('fa-trash', 'Cleared activity history');
    showNotification('History cleared');
  }
}

function exportActivityHistory() {
  const userLrn = sessionStorage.getItem('currentUser');
  const activities = JSON.parse(localStorage.getItem(`activities_${userLrn}`) || '[]');
  const dataStr = JSON.stringify(activities, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const link = document.createElement('a');
  link.setAttribute('href', dataUri);
  link.setAttribute('download', `activity_history_${new Date().toISOString().slice(0,10)}.json`);
  link.click();
  
  addActivity('fa-download', 'Exported activity history');
}

function checkNewAlerts() {
  const userLrn = sessionStorage.getItem('currentUser');
  const clinicAlerts = JSON.parse(localStorage.getItem('clinicAlerts') || '[]');
  const userAlerts = clinicAlerts.filter(a => a.studentId === userLrn && !a.read);
  
  if (userAlerts.length > 0) {
    userAlerts.forEach(alert => {
      alert.read = true;
      addActivity('fa-bell', `Clinic response: ${alert.message.substring(0, 30)}...`, 'alert');
      showNotification('New response from clinic!');
    });
    localStorage.setItem('clinicAlerts', JSON.stringify(clinicAlerts));
    loadRecentActivities();
  }
}

function setupEventListeners() {
  document.getElementById('menu-toggle')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('active');
  });
  
  document.getElementById('dark-mode-toggle')?.addEventListener('change', function() {
    toggleDarkMode(this.checked);
  });
}

function openEditModal(field) {
  currentEditField = field;
  const modal = document.getElementById('edit-modal');
  const title = document.getElementById('edit-modal-title');
  const formContent = document.getElementById('edit-form-content');
  
  let html = '';
  
  switch(field) {
    case 'name':
      title.innerHTML = '<i class="fas fa-user-edit"></i> Edit Full Name';
      html = `
        <div class="input-group"><input type="text" id="edit-firstname" placeholder="First Name" value="${getCurrentValue('first_name')}"></div>
        <div class="input-group"><input type="text" id="edit-middlename" placeholder="Middle Name" value="${getCurrentValue('middle_name')}"></div>
        <div class="input-group"><input type="text" id="edit-lastname" placeholder="Last Name" value="${getCurrentValue('last_name')}"></div>
      `;
      break;
      
    case 'lrn':
      title.innerHTML = '<i class="fas fa-id-card"></i> Update LRN';
      html = `<div class="input-group"><input type="text" id="edit-lrn" placeholder="New LRN" value="${getCurrentValue('lrn')}" maxlength="12"></div>`;
      break;
      
    case 'year':
      title.innerHTML = '<i class="fas fa-graduation-cap"></i> Edit Year Level';
      html = `
        <div class="input-group">
          <select id="edit-year">
            <option value="Grade 7">Grade 7</option>
            <option value="Grade 8">Grade 8</option>
            <option value="Grade 9">Grade 9</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12</option>
            <option value="Senior High">Senior High</option>
          </select>
        </div>
      `;
      break;
      
    case 'strand':
      title.innerHTML = '<i class="fas fa-code-branch"></i> Edit Strand';
      html = `
        <div class="input-group">
          <select id="edit-strand">
            <option value="N/A">Not Applicable</option>
            <option value="TVL HE">TVL HE</option>
            <option value="TVL Care Giving">TVL Care Giving</option>
            <option value="TVL ICT">TVL ICT</option>
            <option value="STEM">STEM</option>
            <option value="HUMSS">HUMSS</option>
            <option value="ABM">ABM</option>
          </select>
        </div>
      `;
      break;
      
    case 'adviser':
      title.innerHTML = '<i class="fas fa-chalkboard-teacher"></i> Edit Adviser';
      html = `<div class="input-group"><input type="text" id="edit-adviser" placeholder="Adviser's Name" value="${getCurrentValue('adviser')}"></div>`;
      break;
      
    case 'guardian-name':
      title.innerHTML = '<i class="fas fa-user-tie"></i> Edit Guardian Name';
      html = `<div class="input-group"><input type="text" id="edit-guardian-name" placeholder="Guardian's Name" value="${getCurrentValue('guardian_name')}"></div>`;
      break;
      
    case 'guardian-phone':
      title.innerHTML = '<i class="fas fa-phone"></i> Edit Phone Number';
      html = `
        <div class="input-group">
          <input type="tel" id="edit-phone" placeholder="Phone Number" value="${getCurrentValue('parent_phone').replace('+63', '')}">
        </div>
      `;
      break;
      
    case 'guardian-email':
      title.innerHTML = '<i class="fas fa-envelope"></i> Edit Email';
      html = `<div class="input-group"><input type="email" id="edit-email" placeholder="Email" value="${getCurrentValue('parent_email')}"></div>`;
      break;
  }
  
  formContent.innerHTML = html;
  modal.classList.add('active');
}

function getCurrentValue(field) {
  const userLrn = sessionStorage.getItem('currentUser');
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const user = students.find(u => u.lrn === userLrn);
  return user ? (user[field] || '') : '';
}

function saveEdit() {
  const userLrn = sessionStorage.getItem('currentUser');
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const userIndex = students.findIndex(u => u.lrn === userLrn);
  
  if (userIndex === -1) return;
  
  const user = students[userIndex];
  
  switch(currentEditField) {
    case 'name':
      user.first_name = document.getElementById('edit-firstname')?.value || user.first_name;
      user.middle_name = document.getElementById('edit-middlename')?.value || user.middle_name;
      user.last_name = document.getElementById('edit-lastname')?.value || user.last_name;
      user.full_name = `${user.first_name} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name}`;
      addActivity('fa-user-edit', 'Updated personal information');
      break;
      
    case 'lrn':
      const newLrn = document.getElementById('edit-lrn')?.value;
      if (newLrn && newLrn.length >= 10 && newLrn.length <= 12) {
        if (!students.some(s => s.lrn === newLrn && s.lrn !== userLrn)) {
          user.lrn = newLrn;
          sessionStorage.setItem('currentUser', newLrn);
          addActivity('fa-id-card', 'Updated LRN');
        } else {
          alert('LRN already exists');
          return;
        }
      }
      break;
      
    case 'year':
      user.school_year = document.getElementById('edit-year')?.value || user.school_year;
      addActivity('fa-graduation-cap', 'Updated year level');
      break;
      
    case 'strand':
      user.strand = document.getElementById('edit-strand')?.value || user.strand;
      addActivity('fa-code-branch', 'Updated strand');
      break;
      
    case 'adviser':
      user.adviser = document.getElementById('edit-adviser')?.value || user.adviser;
      addActivity('fa-chalkboard-teacher', 'Updated adviser');
      break;
      
    case 'guardian-name':
      user.guardian_name = document.getElementById('edit-guardian-name')?.value || user.guardian_name;
      addActivity('fa-user-tie', 'Updated guardian name');
      break;
      
    case 'guardian-phone':
      const phoneNumber = document.getElementById('edit-phone')?.value || '';
      user.parent_phone = '+63' + phoneNumber;
      addActivity('fa-phone', 'Updated contact number');
      break;
      
    case 'guardian-email':
      user.parent_email = document.getElementById('edit-email')?.value || user.parent_email;
      addActivity('fa-envelope', 'Updated email address');
      break;
  }
  
  students[userIndex] = user;
  localStorage.setItem('students', JSON.stringify(students));
  
  closeEditModal();
  loadStudentData(user.lrn);
  generateQR('sms', true);
  showNotification('Information updated successfully!');
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.remove('active');
}

function generateQR(type = 'sms', silent = false) {
  if (typeof QRCode === 'undefined') {
    console.error('QRCode library not loaded');
    return;
  }
  
  const userLrn = sessionStorage.getItem('currentUser');
  const userName = sessionStorage.getItem('userName');
  const parentPhone = document.getElementById('parent-phone').textContent;
  const cleanPhone = getCleanPhoneNumber(parentPhone);
  const message = `URGENT: ${userName} (LRN: ${userLrn}) needs assistance at school. Please contact immediately.`;
  
  let uri = '';
  switch(type) {
    case 'sms': uri = `sms:${cleanPhone}?body=${encodeURIComponent(message)}`; break;
    case 'call': uri = `tel:${cleanPhone}`; break;
    case 'email': 
      uri = `mailto:${document.getElementById('parent-email').textContent}?subject=Emergency Alert&body=${encodeURIComponent(message)}`; 
      break;
  }
  
  QRCode.toDataURL(uri, { width: 180 }, function(err, url) {
    if (!err) {
      document.getElementById('qrcode').src = url;
      if (!silent) {
        addActivity('fa-qrcode', 'Generated new QR code');
        showNotification('QR code generated!');
      }
    }
  });
}

function downloadQR() {
  const qrImage = document.getElementById('qrcode');
  if (qrImage.src.includes('placeholder')) {
    alert('Please generate a QR code first');
    return;
  }
  
  const link = document.createElement('a');
  link.download = `guardianalert-${sessionStorage.getItem('userName')}.png`;
  link.href = qrImage.src;
  link.click();
  addActivity('fa-download', 'Downloaded QR code');
  showNotification('QR code downloaded!');
}

function testContact(type) {
  const parentPhone = document.getElementById('parent-phone').textContent;
  const parentEmail = document.getElementById('parent-email').textContent;
  const userName = sessionStorage.getItem('userName');
  
  // Clean the phone number for tel/sms
  const cleanPhone = getCleanPhoneNumber(parentPhone);
  
  let url = '';
  switch(type) {
    case 'call':
      url = `tel:${cleanPhone}`;
      addActivity('fa-phone', 'Tested call function');
      break;
    case 'sms':
      url = `sms:${cleanPhone}?body=${encodeURIComponent('Test message from GuardianAlert')}`;
      addActivity('fa-sms', 'Tested SMS function');
      break;
    case 'email':
      url = `mailto:${parentEmail}?subject=Test from GuardianAlert&body=${encodeURIComponent(`Hello, this is a test message from ${userName}.`)}`;
      addActivity('fa-envelope', 'Tested email function');
      break;
  }
  
  // Use window.open for better compatibility
  window.open(url, '_blank');
  showNotification(`Opening ${type.toUpperCase()} app...`);
}

function sendToClinic(method) {
  const userLrn = sessionStorage.getItem('currentUser');
  const userName = sessionStorage.getItem('userName');
  const alertType = document.getElementById('clinic-alert-type').value;
  const message = document.getElementById('clinic-message').value.trim();
  
  if (!alertType || !message) {
    alert('Please select an alert type and enter a message');
    return;
  }
  
  // Get clinic phone from localStorage
  let clinicPhone = localStorage.getItem('clinicPhone') || '9123456789';
  
  // Clean the phone number for tel/sms
  const cleanPhone = getCleanPhoneNumber(clinicPhone);
  
  const clinicMessage = `STUDENT ALERT from ${userName} (${alertType}): ${message}`;
  
  let url = '';
  if (method === 'call') {
    url = `tel:${cleanPhone}`;
    addActivity('fa-phone', `Called clinic: ${alertType}`, 'alert');
  } else {
    url = `sms:${cleanPhone}?body=${encodeURIComponent(clinicMessage)}`;
    addActivity('fa-sms', `Sent SMS to clinic: ${alertType}`, 'alert');
  }
  
  // Use window.open for better compatibility
  window.open(url, '_blank');
  
  const alert = {
    id: Date.now(),
    studentId: userLrn,
    studentName: userName,
    type: alertType,
    message: message,
    timestamp: new Date().toISOString(),
    read: false
  };
  
  const clinicAlerts = JSON.parse(localStorage.getItem('clinicAlerts') || '[]');
  clinicAlerts.unshift(alert);
  localStorage.setItem('clinicAlerts', JSON.stringify(clinicAlerts.slice(0, 50)));
  
  clearClinicForm();
  showNotification(`${method.toUpperCase()} app opened for clinic!`);
}

function clearClinicForm() {
  document.getElementById('clinic-alert-type').value = '';
  document.getElementById('clinic-message').value = '';
}

function sendEmergencyMessage() {
  const parentPhone = document.getElementById('parent-phone').textContent;
  const userName = sessionStorage.getItem('userName');
  const cleanPhone = getCleanPhoneNumber(parentPhone);
  const message = `🚨 EMERGENCY: ${userName} needs immediate assistance!`;
  
  window.open(`sms:${cleanPhone}?body=${encodeURIComponent(message)}`, '_blank');
  addActivity('fa-exclamation-triangle', '🚨 Sent emergency message', 'alert');
  showNotification('Emergency message app opened!');
}

function resetAllData() {
  if (confirm('⚠️ This will delete ALL your data. Continue?')) {
    const userLrn = sessionStorage.getItem('currentUser');
    localStorage.removeItem(`activities_${userLrn}`);
    
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    localStorage.setItem('students', JSON.stringify(students.filter(s => s.lrn !== userLrn)));
    
    sessionStorage.clear();
    showNotification('All data cleared. Redirecting...');
    setTimeout(() => window.location.href = 'index.html', 2000);
  }
}

function exportData() {
  const userLrn = sessionStorage.getItem('currentUser');
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const user = students.find(s => s.lrn === userLrn);
  const activities = JSON.parse(localStorage.getItem(`activities_${userLrn}`) || '[]');
  
  const dataStr = JSON.stringify({ user, activities, exportDate: new Date().toISOString() }, null, 2);
  const link = document.createElement('a');
  link.setAttribute('href', 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr));
  link.setAttribute('download', `guardianalert_data_${new Date().toISOString().slice(0,10)}.json`);
  link.click();
  
  addActivity('fa-download', 'Exported personal data');
}

function viewActivityHistory() {
  const userLrn = sessionStorage.getItem('currentUser');
  const activities = JSON.parse(localStorage.getItem(`activities_${userLrn}`) || '[]');
  const list = document.getElementById('full-activity-list');
  
  list.innerHTML = activities.length > 0 
    ? activities.map(a => `
        <div class="activity-item">
          <i class="fas ${a.icon}"></i>
          <div><span>${a.text}</span><div>${a.time}</div></div>
        </div>
      `).join('')
    : '<div class="activity-item" style="text-align:center;">No activities yet</div>';
  
  document.getElementById('activity-modal').classList.add('active');
}

function closeActivityModal() {
  document.getElementById('activity-modal').classList.remove('active');
}

function showNotification(message) {
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.style.cssText = `
      position:fixed; top:20px; right:20px; background:linear-gradient(135deg,#1C0A0A,#550D08);
      color:#F8ECAC; padding:12px 20px; border-radius:10px; z-index:2000;
      border:2px solid #F8ECAC; animation:slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
  }
  notification.textContent = message;
  notification.style.display = 'block';
  setTimeout(() => notification.style.display = 'none', 3000);
}

function setupDarkMode() {
  const darkMode = localStorage.getItem('darkMode') === 'true';
  document.getElementById('dark-mode-toggle').checked = darkMode;
  toggleDarkMode(darkMode);
}

function toggleDarkMode(enable) {
  document.body.classList.toggle('dark-mode', enable);
  localStorage.setItem('darkMode', enable);
}

function updateDateTime() {
  const now = new Date();
  document.getElementById('current-time').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.getElementById('current-date').textContent = now.toLocaleDateString('en-GB');
}

function logout() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}

window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.saveEdit = saveEdit;
window.generateQR = generateQR;
window.downloadQR = downloadQR;
window.testContact = testContact;
window.sendToClinic = sendToClinic;
window.clearClinicForm = clearClinicForm;
window.sendEmergencyMessage = sendEmergencyMessage;
window.viewActivityHistory = viewActivityHistory;
window.closeActivityModal = closeActivityModal;
window.clearActivityHistory = clearActivityHistory;
window.exportActivityHistory = exportActivityHistory;
window.resetAllData = resetAllData;
window.exportData = exportData;
window.logout = logout;
window.toggleDarkMode = toggleDarkMode;
window.openClinicPhoneModal = openClinicPhoneModal;
window.closeClinicPhoneModal = closeClinicPhoneModal;
window.saveClinicPhone = saveClinicPhone;