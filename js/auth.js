function showMessage(element, text, type) {
  if (!element) return;
  element.innerText = text;
  element.className = type === "error" ? "error-msg" : "info-msg";
  element.style.display = "block";
  setTimeout(() => element.style.display = "none", 3000);
}

function showStudentLogin() {
  document.getElementById("student-login-form").style.display = "block";
  document.getElementById("student-signup-form").style.display = "none";
  document.getElementById("student-login-toggle").classList.add("active");
  document.getElementById("student-signup-toggle").classList.remove("active");
}

function showStudentSignup() {
  document.getElementById("student-login-form").style.display = "none";
  document.getElementById("student-signup-form").style.display = "block";
  document.getElementById("student-login-toggle").classList.remove("active");
  document.getElementById("student-signup-toggle").classList.add("active");
}

function showClinicLogin() {
  document.getElementById("clinic-login-form").style.display = "block";
  document.getElementById("clinic-signup-form").style.display = "none";
  document.getElementById("clinic-login-toggle").classList.add("active");
  document.getElementById("clinic-signup-toggle").classList.remove("active");
}

function showClinicSignup() {
  document.getElementById("clinic-login-form").style.display = "none";
  document.getElementById("clinic-signup-form").style.display = "block";
  document.getElementById("clinic-login-toggle").classList.remove("active");
  document.getElementById("clinic-signup-toggle").classList.add("active");
}

function loginUser(event) {
  event.preventDefault();
  
  const lrn = document.getElementById("student-lrn")?.value.trim();
  const password = document.getElementById("student-password")?.value;
  const errorMsg = document.getElementById("login-error");

  if (!lrn || !password) {
    showMessage(errorMsg, "Please enter LRN and password.", "error");
    return;
  }

  const users = JSON.parse(localStorage.getItem('students') || '[]');
  const user = users.find(u => u.lrn === lrn && u.password === password);

  if (user) {
    sessionStorage.setItem("currentUser", lrn);
    sessionStorage.setItem("userRole", "student");
    sessionStorage.setItem("userName", `${user.first_name} ${user.last_name}`);
    window.location.href = 'dashboard.html';
  } else {
    showMessage(errorMsg, "Invalid LRN or password.", "error");
  }
}

function loginClinicStaff(event) {
  event.preventDefault();
  
  const username = document.getElementById("clinic-username")?.value.trim();
  const password = document.getElementById("clinic-password")?.value;
  const errorMsg = document.getElementById("clinic-error");

  if (!username || !password) {
    showMessage(errorMsg, "Please enter username and password.", "error");
    return;
  }

  const staff = JSON.parse(localStorage.getItem('clinicStaff') || '[]');
  const user = staff.find(s => s.username === username && s.password === password);

  if (user) {
    sessionStorage.setItem("currentClinicStaff", username);
    sessionStorage.setItem("userRole", "clinic");
    sessionStorage.setItem("staffName", `${user.first_name} ${user.last_name}`);
    sessionStorage.setItem("staffPosition", user.position);
    window.location.href = 'clinic-dashboard.html';
  } else {
    showMessage(errorMsg, "Invalid username or password.", "error");
  }
}

function signupUser(event) {
  event.preventDefault();
  
  const firstName = document.getElementById("new-firstname")?.value.trim();
  const lastName = document.getElementById("new-lastname")?.value.trim();
  const middleName = document.getElementById("new-middlename")?.value.trim();
  const lrn = document.getElementById("new-lrn")?.value.trim();
  const schoolYear = document.getElementById("school-year")?.value;
  const strand = document.getElementById("strand")?.value;
  const countryCode = document.getElementById("parent-country-code")?.value;
  const parentPhone = document.getElementById("new-parentphone")?.value.trim();
  const parentEmail = document.getElementById("new-parentemail")?.value.trim();
  const password = document.getElementById("new-password")?.value;
  const msg = document.getElementById("signup-msg");

  if (!firstName || !lastName || !lrn || !schoolYear || !parentPhone || !parentEmail || !password) {
    showMessage(msg, "All fields are required.", "error");
    return;
  }

  if (lrn.length < 10 || lrn.length > 12 || !/^\d+$/.test(lrn)) {
    showMessage(msg, "LRN must be 10-12 digits only.", "error");
    return;
  }

  if (password.length < 6) {
    showMessage(msg, "Password must be at least 6 characters.", "error");
    return;
  }

  if (schoolYear === "Senior High School" && !strand) {
    showMessage(msg, "Please select a strand.", "error");
    return;
  }

  const cleanPhone = parentPhone.replace(/\D/g, '');
  if (cleanPhone.length < 7 || cleanPhone.length > 15) {
    showMessage(msg, "Please enter a valid phone number.", "error");
    return;
  }

  if (!parentEmail.includes('@') || !parentEmail.includes('.')) {
    showMessage(msg, "Please enter a valid email.", "error");
    return;
  }

  const users = JSON.parse(localStorage.getItem('students') || '[]');
  
  if (users.some(u => u.lrn === lrn)) {
    showMessage(msg, "LRN already exists.", "error");
    return;
  }

  const newUser = {
    lrn,
    first_name: firstName,
    last_name: lastName,
    middle_name: middleName || '',
    school_year: schoolYear,
    strand: schoolYear === "Senior High School" ? strand : '',
    parent_phone: countryCode + cleanPhone,
    parent_email: parentEmail,
    password
  };

  users.push(newUser);
  localStorage.setItem('students', JSON.stringify(users));
  
  showMessage(msg, "Account created! Redirecting to login...", "success");
  setTimeout(() => {
    showStudentLogin();
    document.getElementById("student-signup-form")?.reset();
  }, 2000);
}

function signupClinicStaff(event) {
  event.preventDefault();
  
  const firstName = document.getElementById("clinic-firstname")?.value.trim();
  const lastName = document.getElementById("clinic-lastname")?.value.trim();
  const position = document.getElementById("clinic-position")?.value;
  const username = document.getElementById("clinic-staff-username")?.value.trim();
  const countryCode = document.getElementById("clinic-country-code")?.value;
  const phone = document.getElementById("clinic-phone")?.value.trim();
  const email = document.getElementById("clinic-email")?.value.trim();
  const password = document.getElementById("clinic-staff-password")?.value;
  const msg = document.getElementById("clinic-signup-msg");

  if (!firstName || !lastName || !position || !username || !phone || !email || !password) {
    showMessage(msg, "All fields are required.", "error");
    return;
  }

  if (password.length < 6) {
    showMessage(msg, "Password must be at least 6 characters.", "error");
    return;
  }

  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length < 7 || cleanPhone.length > 15) {
    showMessage(msg, "Please enter a valid phone number.", "error");
    return;
  }

  if (!email.includes('@') || !email.includes('.')) {
    showMessage(msg, "Please enter a valid email.", "error");
    return;
  }

  const staff = JSON.parse(localStorage.getItem('clinicStaff') || '[]');
  
  if (staff.some(s => s.username === username)) {
    showMessage(msg, "Username already exists.", "error");
    return;
  }

  const newStaff = {
    username,
    first_name: firstName,
    last_name: lastName,
    position,
    phone: countryCode + cleanPhone,
    email,
    password
  };

  staff.push(newStaff);
  localStorage.setItem('clinicStaff', JSON.stringify(staff));
  
  showMessage(msg, "Account created! Redirecting to login...", "success");
  setTimeout(() => {
    showClinicLogin();
    document.getElementById("clinic-signup-form")?.reset();
  }, 2000);
}

// Initialize demo data on first load
document.addEventListener('DOMContentLoaded', function() {
  showStudentLogin();
  showClinicLogin();
  
  document.getElementById("school-year")?.addEventListener("change", function() {
    const strandGroup = document.getElementById("strand-group");
    if (strandGroup) strandGroup.style.display = this.value === "Senior High School" ? "block" : "none";
  });

  document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', function() {
      this.value = this.value.replace(/[^0-9]/g, '');
    });
  });

  // Initialize demo data if not exists
  if (!localStorage.getItem('students')) {
    const demoStudent = {
      lrn: '1234567890',
      first_name: 'Juan',
      last_name: 'Cruz',
      middle_name: 'Dela',
      school_year: 'Grade 10',
      strand: '',
      parent_phone: '+639123456789',
      parent_email: 'parent@email.com',
      password: 'student123'
    };
    localStorage.setItem('students', JSON.stringify([demoStudent]));
  }

  if (!localStorage.getItem('clinicStaff')) {
    const demoStaff = {
      username: 'nurse.juan',
      first_name: 'Juan',
      last_name: 'Dela Cruz',
      position: 'School Nurse',
      phone: '+639876543210',
      email: 'nurse@school.edu.ph',
      password: 'nurse123'
    };
    localStorage.setItem('clinicStaff', JSON.stringify([demoStaff]));
  }

  if (!localStorage.getItem('medicalSupplies')) {
    const supplies = {
      bandages: 50,
      thermometers: 5,
      first_aid_kits: 10,
      medications: 25
    };
    localStorage.setItem('medicalSupplies', JSON.stringify(supplies));
  }

  if (!localStorage.getItem('clinicPatients')) {
    const patients = [
      {
        lrn: '1234567890',
        name: 'Juan Cruz',
        condition: 'Fever',
        time: '10:30 AM',
        status: 'Monitoring'
      },
      {
        lrn: '0987654321',
        name: 'Maria Santos',
        condition: 'Headache',
        time: '09:15 AM',
        status: 'Released'
      }
    ];
    localStorage.setItem('clinicPatients', JSON.stringify(patients));
  }

  if (!localStorage.getItem('clinicAlerts')) {
    localStorage.setItem('clinicAlerts', JSON.stringify([]));
  }

  if (!localStorage.getItem('activities')) {
    const activities = [
      {
        icon: 'fa-sign-in-alt',
        text: 'Logged in to dashboard',
        time: 'Just now'
      },
      {
        icon: 'fa-qrcode',
        text: 'Generated emergency QR code',
        time: '5 minutes ago'
      }
    ];
    localStorage.setItem('activities', JSON.stringify(activities));
  }
});