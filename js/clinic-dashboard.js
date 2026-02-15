let currentCommunicationMethod = 'sms';

document.addEventListener('DOMContentLoaded', function() {
  initializeClinicDashboard();
  setInterval(updateDateTime, 60000);
});

function initializeClinicDashboard() {
  const staffId = sessionStorage.getItem('currentClinicStaff');
  if (!staffId) {
    window.location.href = 'index.html';
    return;
  }

  loadRecentPatients();
  loadStudentDropdown();
  loadSuppliesData();
  loadAlertCount();
  setupDarkMode();
  setupMenuToggle();
  updateDateTime();
  setupEventListeners();
}

function loadRecentPatients() {
  const list = document.getElementById('recent-patients-list');
  if (!list) return;
  
  const patients = JSON.parse(localStorage.getItem('clinicPatients') || '[]');
  
  if (patients.length > 0) {
    list.innerHTML = patients.slice(0, 3).map(patient => `
      <div class="contact-item" onclick="viewPatientDetails('${patient.lrn}')">
        <i class="fas fa-user-injured" style="color: #ef4444;"></i>
        <div style="flex:1;">
          <strong>${patient.name}</strong>
          <div style="font-size:0.85rem;color:var(--gray);">${patient.condition} • ${patient.time}</div>
        </div>
        <span style="font-size:0.85rem;padding:4px 8px;border-radius:12px;background:${getStatusColor(patient.status)};color:white;">${patient.status}</span>
      </div>
    `).join('');
  } else {
    list.innerHTML = `
      <div class="contact-item">
        <i class="fas fa-user-injured" style="color:#ef4444;"></i>
        <div style="flex:1;">
          <strong>Juan Cruz</strong>
          <div style="font-size:0.85rem;color:var(--gray);">Fever • 10:30 AM</div>
        </div>
        <span style="font-size:0.85rem;padding:4px 8px;border-radius:12px;background:#f59e0b;color:white;">Monitoring</span>
      </div>
      <div class="contact-item">
        <i class="fas fa-user-injured" style="color:#ef4444;"></i>
        <div style="flex:1;">
          <strong>Maria Santos</strong>
          <div style="font-size:0.85rem;color:var(--gray);">Headache • 09:15 AM</div>
        </div>
        <span style="font-size:0.85rem;padding:4px 8px;border-radius:12px;background:#10b981;color:white;">Released</span>
      </div>
    `;
  }
}

function getStatusColor(status) {
  const colors = {
    'Monitoring': '#f59e0b',
    'Released': '#10b981',
    'Emergency': '#ef4444',
    'Pickup': '#e6b87e'
  };
  return colors[status] || '#6b7280';
}

function loadStudentDropdown() {
  const select = document.getElementById('alert-student-select');
  if (!select) return;
  
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  
  let options = '<option value="">Select Student</option>';
  students.forEach(s => {
    options += `<option value="${s.lrn}">${s.first_name} ${s.last_name} (${s.school_year})</option>`;
  });
  
  if (students.length === 0) {
    options += `
      <option value="1">Juan Cruz (Grade 10)</option>
      <option value="2">Maria Santos (Grade 11)</option>
    `;
  }
  
  select.innerHTML = options;
}

function loadSuppliesData() {
  const supplies = JSON.parse(localStorage.getItem('medicalSupplies') || '{}');
  
  document.getElementById('bandages-count').textContent = supplies.bandages || '50';
  document.getElementById('thermometers-count').textContent = supplies.thermometers || '5';
  document.getElementById('kits-count').textContent = supplies.first_aid_kits || '10';
  document.getElementById('meds-count').textContent = supplies.medications || '25';
}

function loadAlertCount() {
  const alerts = JSON.parse(localStorage.getItem('clinicAlerts') || '[]');
  document.getElementById('alert-history-count').textContent = alerts.length;
}

function setupEventListeners() {
  document.getElementById('dark-mode-toggle')?.addEventListener('change', function() {
    toggleDarkMode(this.checked);
  });
  
  document.getElementById('clinic-message')?.addEventListener('input', function() {
    const count = document.getElementById('clinic-char-count');
    if (count) count.textContent = this.value.length;
  });
  
  document.getElementById('search-student')?.addEventListener('input', function() {
    searchStudent(this.value);
  });
  
  document.getElementById('find-student')?.addEventListener('input', function() {
    searchStudentForModal(this.value);
  });
}

function searchStudent(query) {
  console.log('Searching for:', query);
}

function searchStudentForModal(query) {
  const resultsDiv = document.getElementById('student-search-results');
  const patientForm = document.getElementById('patient-form');
  const saveBtn = document.getElementById('save-patient-btn');
  
  if (!query || query.length < 2) {
    resultsDiv.innerHTML = '';
    patientForm.style.display = 'none';
    saveBtn.disabled = true;
    return;
  }
  
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const results = students.filter(s => 
    s.lrn.includes(query) || 
    s.first_name.toLowerCase().includes(query.toLowerCase()) ||
    s.last_name.toLowerCase().includes(query.toLowerCase())
  );
  
  if (results.length > 0) {
    resultsDiv.innerHTML = results.map(s => `
      <div class="contact-item" onclick="selectStudent('${s.lrn}')">
        <i class="fas fa-user-graduate"></i>
        <div>
          <strong>${s.first_name} ${s.last_name}</strong>
          <div style="font-size:0.85rem;color:var(--gray);">LRN: ${s.lrn} • ${s.school_year}</div>
        </div>
      </div>
    `).join('');
  } else {
    resultsDiv.innerHTML = '<div style="text-align:center;padding:20px;color:var(--gray);">No students found</div>';
  }
}

function selectStudent(lrn) {
  document.getElementById('patient-form').style.display = 'block';
  document.getElementById('save-patient-btn').disabled = false;
  document.getElementById('student-search-results').innerHTML = '';
  document.getElementById('find-student').value = `Selected student: ${lrn}`;
}

function savePatientRecord() {
  const condition = document.getElementById('condition-type').value;
  const details = document.getElementById('condition-details').value;
  const action = document.getElementById('action-needed').value;
  const time = document.getElementById('visit-time').value;
  
  if (!condition || !details || !action || !time) {
    alert('Please fill all fields');
    return;
  }
  
  alert('Patient record saved!');
  closePatientModal();
}

function setCommunicationMethod(method) {
  currentCommunicationMethod = method;
  
  document.querySelectorAll('.comm-toggle').forEach(btn => {
    if (btn.dataset.method === method) {
      btn.classList.add('active');
      btn.style.background = '#4f46e5';
      btn.style.color = 'white';
    } else {
      btn.classList.remove('active');
      btn.style.background = 'transparent';
      btn.style.color = 'var(--dark)';
    }
  });
  
  const info = document.getElementById('alert-method-info');
  const methods = {
    'sms': 'SMS',
    'email': 'Email',
    'call': 'Phone Call'
  };
  info.innerHTML = `Alert will be sent via <strong>${methods[method]}</strong> to the student's parent/guardian`;
}

function sendClinicAlert() {
  const studentId = document.getElementById('alert-student-select')?.value;
  const alertType = document.getElementById('alert-type-select')?.value;
  const message = document.getElementById('clinic-message')?.value;
  
  if (!studentId || !alertType || !message) {
    alert('Please select a student, alert type, and enter a message');
    return;
  }
  
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const student = students.find(s => s.lrn === studentId);
  
  const alerts = JSON.parse(localStorage.getItem('clinicAlerts') || '[]');
  alerts.unshift({
    id: Date.now(),
    studentId,
    studentName: student ? `${student.first_name} ${student.last_name}` : 'Unknown',
    type: alertType,
    message,
    method: currentCommunicationMethod,
    timestamp: new Date().toISOString(),
    status: 'sent'
  });
  localStorage.setItem('clinicAlerts', JSON.stringify(alerts.slice(0, 50)));
  
  document.getElementById('alert-history-count').textContent = alerts.length;
  alert('Alert sent successfully!');
  
  document.getElementById('alert-student-select').value = '';
  document.getElementById('alert-type-select').value = '';
  document.getElementById('clinic-message').value = '';
  document.getElementById('clinic-char-count').textContent = '0';
}

function sendClinicAlertToGuardian() {
  sendClinicAlert();
}

function manageSupplies() {
  const bandages = prompt('Enter bandages count:', document.getElementById('bandages-count').textContent);
  const thermometers = prompt('Enter thermometers count:', document.getElementById('thermometers-count').textContent);
  const kits = prompt('Enter first aid kits count:', document.getElementById('kits-count').textContent);
  const meds = prompt('Enter medications count:', document.getElementById('meds-count').textContent);
  
  const supplies = {};
  if (bandages) supplies.bandages = parseInt(bandages);
  if (thermometers) supplies.thermometers = parseInt(thermometers);
  if (kits) supplies.first_aid_kits = parseInt(kits);
  if (meds) supplies.medications = parseInt(meds);
  
  localStorage.setItem('medicalSupplies', JSON.stringify(supplies));
  loadSuppliesData();
  alert('Supplies updated!');
}

function toggleDarkMode(enable) {
  if (enable) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  localStorage.setItem('darkMode', enable);
}

function setupDarkMode() {
  const darkMode = localStorage.getItem('darkMode') === 'true';
  const toggle = document.getElementById('dark-mode-toggle');
  if (toggle) {
    toggle.checked = darkMode;
    toggleDarkMode(darkMode);
  }
}

function setupMenuToggle() {
  document.getElementById('menu-toggle')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('active');
  });
}

function updateDateTime() {
  const now = new Date();
  document.getElementById('current-time').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
  document.getElementById('current-date').textContent = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function openPatientModal() {
  document.getElementById('patient-modal')?.classList.add('active');
  document.getElementById('patient-form').style.display = 'none';
  document.getElementById('save-patient-btn').disabled = true;
  document.getElementById('find-student').value = '';
  document.getElementById('student-search-results').innerHTML = '';
}

function closePatientModal() {
  document.getElementById('patient-modal')?.classList.remove('active');
}

function viewAllPatients() {
  alert('View All Patients feature coming soon');
}

function viewEmergencyContacts() {
  alert('Emergency Contacts feature coming soon');
}

function viewMedicalHistory() {
  alert('Medical Records feature coming soon');
}

function viewAlertHistory() {
  alert('Alert History feature coming soon');
}

function viewPatientDetails(studentId) {
  alert(`Viewing details for student ID: ${studentId}`);
}

function clinicLogout() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}

window.openPatientModal = openPatientModal;
window.closePatientModal = closePatientModal;
window.selectStudent = selectStudent;
window.savePatientRecord = savePatientRecord;
window.setCommunicationMethod = setCommunicationMethod;
window.sendClinicAlert = sendClinicAlert;
window.sendClinicAlertToGuardian = sendClinicAlertToGuardian;
window.viewAlertHistory = viewAlertHistory;
window.viewAllPatients = viewAllPatients;
window.viewEmergencyContacts = viewEmergencyContacts;
window.viewMedicalHistory = viewMedicalHistory;
window.viewPatientDetails = viewPatientDetails;
window.manageSupplies = manageSupplies;
window.clinicLogout = clinicLogout;
window.toggleDarkMode = toggleDarkMode;