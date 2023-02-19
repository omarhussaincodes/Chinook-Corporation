const baseUrl = "http://localhost:4000";
const targetDiv = document.querySelector(".target");
const formBtn = document.querySelector("#btn-form");
const inputs = document.querySelectorAll("#input-firstName, #input-lastName, #input-email");
const emailTarget = document.querySelector("#email-target");
const firstNameTarget = document.querySelector("#firstName-target");
const lastNameTarget = document.querySelector("#lastName-target");
const dropdown = document.querySelector(".dropdown");
const dropdownTarget = document.querySelector(".dropdown-target");
const footer = document.querySelector("#footer");
const notification = document.querySelector(".notification");
let tableBody;

getEmployees();

function getEmployees() {
  const result = fetch(`${baseUrl}/employees`, {
    method: 'GET',
  })
    .then(res => res.json())
    .then(employees => employees);

  result.then(employees => {
    if (employees) {
      displayEmployeeTable(employees);
      const jobTitles = getDistinctJobTitles(employees);
      renderOptions(jobTitles);
      handleDelete();
    }
    else {
      console.log("Ooops! something went wrong!");
    }
  });
};

function deleteEmployee(employeeId) {
  fetch(`${baseUrl}/employees/${employeeId}`, {
    method: 'DELETE',
  })
    .then(res => res.text())
    .then(res => res)
    .catch(e => console.error(e, "Deletion Failed!!"));
}

function handleDelete() {

  let allDeleteBtns = document.querySelectorAll(`#btn-delete`);

  if (allDeleteBtns.length > 0) {
    allDeleteBtns.forEach(btnDelete => {
      btnDelete.addEventListener("click", (e) => {
        const employeeId = e.currentTarget.value;
        deleteEmployee(employeeId);
      });
    });
  }
}

const displayEmployeeTable = (employees) => {

  employees.forEach((employee, idx) => {
    tableBody = document.getElementById("table-body");
    tableBody.innerHTML += createTableRowTemplate(employee, idx);
  });

};

const getDistinctJobTitles = (employees) => {
  return [...new Set(employees.map(e => e.Title))];
};

const renderOptions = (jobTitles) => {
  jobTitles.forEach((title) => {

    const option = document.createElement("option");

    option.innerHTML = createDropdownTemplate(title);
    dropdownTarget.appendChild(option);
  });
};

const createTableRowTemplate = (employee, idx) => {
  return `
              <tr>
                <td>${idx + 1}</td>
                <td>${employee.FirstName} ${employee.LastName}</td>
                <td>${employee.Email}</td>
                <td>${employee.Title}</td>
                <td>
                  <button value="${employee.EmployeeId}" class="button is-dark" id="btn-delete">
                    <i class="fas fa-user-times"></i>
                  </button>
                </td>
              </tr>
    `;
}

const createDropdownTemplate = (title) => {
  return `
      ${title}
  `;
}

let inputValidator = {
  "firstName": false,
  "lastName": false,
  "email": false
};

inputs.forEach((input) => {
  input.addEventListener("input", (e) => {
    let controlName = e.target.getAttribute("name");
    if (controlName === "email") {
      const message = "Please enter valid Email";
      formValidation(e.target.value, input, controlName, emailTarget, message, "email");
    } else if (controlName === "lastName") {
      const message = "Please enter valid Last Name";
      formValidation(e.target.value, input, controlName, lastNameTarget, message, "text");
    } else {
      const message = "Please enter valid First Name";
      formValidation(e.target.value, input, controlName, firstNameTarget, message, "text");
    }

    let allTrue = Object.keys(inputValidator).every((item) => {
      return inputValidator[item] === true;
    });

    if (allTrue) {
      formBtn.disabled = false;
    } else {
      formBtn.disabled = true;
    }
  })
});

function formValidation(enteredValue, input, controlName, target, message, type) {
  let p;
  let validate;

  if (type === "email") {
    validate = validateEmail(enteredValue);
  } else {
    validate = validateText(enteredValue);
  }
  if (!validate) {
    input.classList.add("is-danger");
    inputValidator[controlName] = false;
    if (target.children.length === 0) {
      p = document.createElement('p');
      p.innerHTML = `<p class="help is-danger">${message}</p>`;
      target.appendChild(p);
    }
  } else {
    target.innerHTML = '';
    input.classList.remove('is-danger');
    inputValidator[controlName] = true;
  }
}

function validateEmail(email) {
  const regex = /\S+@\S+\.\S+/;
  return regex.test(email);
}

function validateText(text) {
  const regex = /^[A-Za-z ]+$/;
  return regex.test(text);
}

formBtn.addEventListener("click", (e) => {
  e.preventDefault();
  addEmployee();
});

async function addEmployee() {
  const employeeForm = document.querySelector("form");
  const formData = new FormData(employeeForm);
  await fetch(`${baseUrl}/addEmployee`, {
    method: "POST",
    body: formData
  })
    .then(res => console.log(res.json()))
    .then(res => getEmployees())
    .catch((e) => {
      console.log("Failed to add employee", e.message)
    });
  ;
  inputs.forEach((input) => input.value = "");
}
