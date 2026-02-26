let currentCommunicationMethod = 'sms';

document.addEventListener('DOMContentLoaded', function() {
  initializeClinicDashboard();
  setInterval(updateDateTime, 60000);
  setInterval(loadRecentPatients, 3000);
});

function initializeClinicDashboard() {
  if (!sessionStorage.getItem('currentClinicStaff')) {
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('clinic-staff-name').textContent = sessionStorage.getItem('clinicStaffName') || 'Clinic Staff';
  loadRecentPatients();
  loadStudentDropdown();
  loadAlertCount();
  setupDarkMode();
  setupMenuToggle();
  updateDateTime();
  setupEventListeners();
}

function loadRecentPatients() {
  const list = document.getElementById('recent-patients-list');
  if (!list) return;
  
  const alerts = JSON.parse(localStorage.getItem('clinicAlerts') || '[]');
  
  if (alerts.length > 0) {
    list.innerHTML = alerts.slice(0, 5).map(alert => {
      const time = new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `
        <div class="contact-item" onclick="viewAlertDetails('${alert.id}')" style="${!alert.read ? 'background:rgba(204,0,16,0.1);' : ''}">
          <i class="fas fa-user-injured"></i>
          <div style="flex:1;">
            <strong>${alert.studentName}</strong>
            <div style="font-size:0.8rem;">${alert.type} • ${time}</div>
            <div style="font-size:0.75rem;">${alert.message.substring(0,30)}...</div>
          </div>
          ${!alert.read ? '<span style="background:#CC0010;color:#F8ECAC;padding:2px 8px;border-radius:12px;font-size:0.7rem;">New</span>' : ''}
        </div>
      `;
    }).join('');
  } else {
    list.innerHTML = '<div style="text-align:center;padding:20px;">No alerts yet</div>';
  }
  
  updateStats(alerts);
}

function updateStats(alerts) {
  const today = new Date().toDateString();
  const todayAlerts = alerts.filter(a => new Date(a.timestamp).toDateString() === today);
  
  document.getElementById('patients-today').textContent = todayAlerts.length;
  document.getElementById('emergencies-today').textContent = todayAlerts.filter(a => a.type === 'emergency').length;
  document.getElementById('alert-history-count').textContent = alerts.length;
}

function loadStudentDropdown() {
  const select = document.getElementById('alert-student-select');
  if (!select) return;
  
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  select.innerHTML = '<option value="">Select Student</option>' + 
    students.map(s => `<option value="${s.lrn}">${s.first_name} ${s.last_name} - ${s.school_year}</option>`).join('');
}

function loadAlertCount() {
  document.getElementById('alert-history-count').textContent = 
    JSON.parse(localStorage.getItem('clinicAlerts') || '[]').length;
}

function setupEventListeners() {
  document.getElementById('dark-mode-toggle')?.addEventListener('change', function() {
    toggleDarkMode(this.checked);
  });
  
  document.getElementById('clinic-message')?.addEventListener('input', function() {
    document.getElementById('clinic-char-count').textContent = this.value.length;
  });
}

function setCommunicationMethod(method) {
  currentCommunicationMethod = method;
}

function sendClinicAlert() {
  const studentId = document.getElementById('alert-student-select').value;
  const alertType = document.getElementById('alert-type-select').value;
  const message = document.getElementById('clinic-message').value;
  
  if (!studentId || !alertType || !message) {
    alert('Please select a student, alert type, and enter a message');
    return;
  }
  
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const student = students.find(s => s.lrn === studentId);
  
  if (!student) {
    alert('Student not found');
    return;
  }

  const parentPhone = student.parent_phone.replace(/[^0-9]/g, '');
  const parentMessage = `CLINIC ALERT: ${student.first_name} ${student.last_name} (${alertType}) - ${message}`;
  
  if (confirm('Call parent? OK for call, Cancel for SMS')) {
    window.open(`tel:${parentPhone}`, '_blank');
  } else {
    window.open(`sms:${parentPhone}?body=${encodeURIComponent(parentMessage)}`, '_blank');
  }
  
  const alerts = JSON.parse(localStorage.getItem('clinicAlerts') || '[]');
  alerts.unshift({
    id: Date.now(),
    studentId,
    studentName: `${student.first_name} ${student.last_name}`,
    guardianName: student.guardian_name,
    parentPhone: student.parent_phone,
    type: alertType,
    message,
    timestamp: new Date().toISOString(),
    read: true,
    fromClinic: true
  });
  
  localStorage.setItem('clinicAlerts', JSON.stringify(alerts.slice(0, 50)));
  document.getElementById('alert-history-count').textContent = alerts.length;
  alert('✓ Alert sent to parent!');
  
  document.getElementById('alert-student-select').value = '';
  document.getElementById('alert-type-select').value = '';
  document.getElementById('clinic-message').value = '';
  document.getElementById('clinic-char-count').textContent = '0';
  
  loadRecentPatients();
}

function viewAlertDetails(alertId) {
  const alerts = JSON.parse(localStorage.getItem('clinicAlerts') || '[]');
  const alert = alerts.find(a => a.id == alertId);
  
  if (alert) {
    alert.read = true;
    localStorage.setItem('clinicAlerts', JSON.stringify(alerts));
    
    alert(`Alert from ${alert.studentName}\nTime: ${new Date(alert.timestamp).toLocaleString()}\nType: ${alert.type}\nMessage: ${alert.message}\nGuardian: ${alert.guardianName || 'Not specified'}\nContact: ${alert.parentPhone || 'Not available'}`);
    loadRecentPatients();
  }
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

function setupMenuToggle() {
  document.getElementById('menu-toggle')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('active');
  });
}

function updateDateTime() {
  const now = new Date();
  document.getElementById('current-time').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.getElementById('current-date').textContent = now.toLocaleDateString('en-GB');
}

function clinicLogout() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}