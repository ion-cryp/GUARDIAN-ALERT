function showStudentLogin() {
  document.getElementById('student-login-form').classList.add('active-form');
  document.getElementById('student-login-form').style.display = 'block';
  document.getElementById('student-signup-form').classList.remove('active-form');
  document.getElementById('student-signup-form').style.display = 'none';
  document.getElementById('student-login-toggle').classList.add('active');
  document.getElementById('student-signup-toggle').classList.remove('active');
  
  document.getElementById('login-error').style.display = 'none';
  document.getElementById('signup-msg').style.display = 'none';
}

function showStudentSignup() {
  document.getElementById('student-signup-form').classList.add('active-form');
  document.getElementById('student-signup-form').style.display = 'block';
  document.getElementById('student-login-form').classList.remove('active-form');
  document.getElementById('student-login-form').style.display = 'none';
  document.getElementById('student-signup-toggle').classList.add('active');
  document.getElementById('student-login-toggle').classList.remove('active');
  
  document.getElementById('login-error').style.display = 'none';
  document.getElementById('signup-msg').style.display = 'none';
}

function togglePassword(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
  // Keep focus on input field
  input.focus();
}

function loginUser(event) {
  event.preventDefault();
  const lrn = document.getElementById('student-lrn').value.trim();
  const password = document.getElementById('student-password').value;
  const errorMsg = document.getElementById('login-error');

  if (!lrn || !password) {
    errorMsg.textContent = 'Please enter both LRN and password';
    errorMsg.style.display = 'block';
    return false;
  }

  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const user = students.find(s => s.lrn === lrn && s.password === password);

  if (user) {
    sessionStorage.setItem('currentUser', lrn);
    sessionStorage.setItem('userName', `${user.first_name} ${user.last_name}`);
    window.location.href = 'dashboard.html';
  } else {
    errorMsg.textContent = 'Invalid LRN or password';
    errorMsg.style.display = 'block';
  }
  return false;
}

function signupUser(event) {
  event.preventDefault();
  const firstName = document.getElementById('new-firstname').value.trim();
  const middleName = document.getElementById('new-middlename').value.trim();
  const lastName = document.getElementById('new-lastname').value.trim();
  const lrn = document.getElementById('new-lrn').value.trim();
  const schoolYear = document.getElementById('school-year').value;
  const strand = document.getElementById('strand').value;
  const adviser = document.getElementById('new-adviser').value.trim();
  const guardianName = document.getElementById('new-guardian-name').value.trim();
  const parentPhone = document.getElementById('new-parentphone').value.trim();
  const parentEmail = document.getElementById('new-parentemail').value.trim();
  const password = document.getElementById('new-password').value;
  const msgElement = document.getElementById('signup-msg');

  if (!firstName || !lastName || !lrn || !schoolYear || !adviser || !guardianName || !parentPhone || !parentEmail || !password) {
    msgElement.textContent = 'Please fill in all required fields';
    msgElement.style.display = 'block';
    return false;
  }

  if (schoolYear === 'Senior High' && !strand) {
    msgElement.textContent = 'Please select your strand for Senior High School';
    msgElement.style.display = 'block';
    return false;
  }

  if (lrn.length < 10 || lrn.length > 12) {
    msgElement.textContent = 'LRN must be 10-12 digits';
    msgElement.style.display = 'block';
    return false;
  }

  if (password.length < 6) {
    msgElement.textContent = 'Password must be at least 6 characters';
    msgElement.style.display = 'block';
    return false;
  }

  const students = JSON.parse(localStorage.getItem('students') || '[]');
  if (students.find(s => s.lrn === lrn)) {
    msgElement.textContent = 'LRN already registered';
    msgElement.style.display = 'block';
    return false;
  }

  const newStudent = {
    lrn: lrn,
    first_name: firstName,
    middle_name: middleName,
    last_name: lastName,
    full_name: `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`,
    school_year: schoolYear,
    strand: strand || 'N/A',
    adviser: adviser,
    guardian_name: guardianName,
    parent_phone: '+63' + parentPhone,
    parent_email: parentEmail,
    password: password,
    created_at: new Date().toISOString()
  };

  students.push(newStudent);
  localStorage.setItem('students', JSON.stringify(students));

  msgElement.textContent = 'Account created successfully! You can now login.';
  msgElement.style.display = 'block';
  
  setTimeout(() => {
    showStudentLogin();
    document.getElementById('student-lrn').value = lrn;
    document.getElementById('student-password').value = password;
    msgElement.style.display = 'none';
  }, 2000);

  return false;
}

document.addEventListener('DOMContentLoaded', function() {
  const schoolYearSelect = document.getElementById('school-year');
  const strandGroup = document.getElementById('strand-group');
  const strandSelect = document.getElementById('strand');
  
  if (schoolYearSelect) {
    schoolYearSelect.addEventListener('change', function() {
      if (this.value === 'Senior High') {
        strandGroup.style.display = 'block';
        strandSelect.required = true;
      } else {
        strandGroup.style.display = 'none';
        strandSelect.required = false;
        strandSelect.value = '';
      }
    });
  }

  // Create demo account if no students exist
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  if (students.length === 0) {
    const demoStudent = {
      lrn: '1234567890',
      first_name: 'Juan',
      middle_name: 'Dela',
      last_name: 'Cruz',
      full_name: 'Juan Dela Cruz',
      school_year: 'Senior High',
      strand: 'STEM',
      adviser: 'Ms. Reyes',
      guardian_name: 'Maria Cruz',
      parent_phone: '+639123456789',
      parent_email: 'maria.cruz@email.com',
      password: 'password',
      created_at: new Date().toISOString()
    };
    students.push(demoStudent);
    localStorage.setItem('students', JSON.stringify(students));
  }
});

window.showStudentLogin = showStudentLogin;
window.showStudentSignup = showStudentSignup;
window.loginUser = loginUser;
window.signupUser = signupUser;
window.togglePassword = togglePassword;