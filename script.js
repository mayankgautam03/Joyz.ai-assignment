
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", mobileMenu);

function mobileMenu() {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
}


const navLink = document.querySelectorAll(".nav-link");

navLink.forEach(n => n.addEventListener("click", closeMenu));

function closeMenu() {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
}


document.getElementById('fileInput').addEventListener('change', handleFile);

function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    const data = parseCSV(text);
    const errors = validateHierarchy(data);
    displayErrors(errors);
  };
  reader.readAsText(file);
}

function parseCSV(text) {
  const rows = text.trim().split('\n');
  const headers = rows.shift().split(',');

  return rows.map(row => {
    const values = row.split(',');
    const obj = {};
    headers.forEach((header, index) => {
      obj[header.trim()] = values[index].trim();
    });
    return obj;
  });
}

function validateHierarchy(data) {
  const errors = [];
  const parentMap = {};
  const roleMap = {};

 
  data.forEach(entry => {
    const { Email, Role, Parent } = entry;
    roleMap[Email] = Role;
    parentMap[Email] = Parent;
  });

  
  data.forEach(entry => {
    const { Email, Role, Parent } = entry;

    if (Role === 'Admin' && Parent !== 'Root') {
      errors.push(`Admin ${Email} must report only to Root.`);
    }
    if (Role === 'Manager' && Parent && roleMap[Parent] !== 'Admin' && roleMap[Parent] !== 'Manager') {
      errors.push(`Manager ${Email} cannot report to ${Parent}.`);
    }
    if (Role === 'Caller' && Parent && roleMap[Parent] !== 'Manager') {
      errors.push(`Caller ${Email} must report to a Manager.`);
    }
  });

  
  if (detectCycles(parentMap)) {
    errors.push('Cycle detected in the organization hierarchy.');
  }

  return errors;
}

function detectCycles(parentMap) {
  const visited = new Set();
  const stack = new Set();

  const hasCycle = user => {
    if (stack.has(user)) return true;
    if (visited.has(user)) return false;

    visited.add(user);
    stack.add(user);

    const parent = parentMap[user];
    if (parent && hasCycle(parent)) return true;

    stack.delete(user);
    return false;
  };

  return Object.keys(parentMap).some(user => hasCycle(user));
}

function displayErrors(errors) {
  const errorList = document.getElementById('error-list');
  errorList.innerHTML = '';

  if (errors.length === 0) {
    errorList.innerHTML = '<li>No errors found. The hierarchy is valid!</li>';
  } else {
    errors.forEach(error => {
      const li = document.createElement('li');
      li.textContent = error;
      errorList.appendChild(li);
    });
  }
}
