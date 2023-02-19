const baseUrl = "http://localhost:4000";

const targetDiv = document.querySelector(".target");
const dropdownTarget = document.querySelector(".dropdown-target");
let tableBody = document.getElementById("table-body");

getCustomers();

dropdownTarget.addEventListener("change", (e) => {
    const selectedOption = e.target.value;
    if (selectedOption === "0") {
        getCustomers();
    } else {
        getCustomersByCountry(selectedOption);
    }
});

function getCustomers() {
    const result = fetch(`${baseUrl}/customers`, {
        method: 'GET',
    })
        .then(res => res.json())
        .then(customers => customers);

    result.then(customers => {
        if(customers) {
            displayCustomerTable(customers);
            const countries = getDistinctCountries(customers);
            renderOptions(countries);
        } else {    
            console.log("Ooops! something went wrong!");
        }
    });
};

function getCustomersByCountry(country) {
    const result = fetch(`${baseUrl}/customers/${country}`, {
        method: 'GET'
    })
        .then(res => res.json());

    result.then(customers => {
        if (customers.length > 0) {
            tableBody.innerHTML = "";
            displayCustomerTable(customers);
        }
        else {
            console.log("No customers found for the selected country");
        }
    });
}

const getDistinctCountries = (customers) => {
    return [...new Set(customers.map(c => c.Customer.Country))];
};

const renderOptions = (countries) => {
    countries.forEach(country => {

        const option = document.createElement("option");

        option.innerHTML = createDropdownTemplate(country);
        dropdownTarget.appendChild(option);
    });
};

const createDropdownTemplate = (country) => {
    return `
        ${country}
    `;
}

function displayCustomerTable(customers) {
    customers.forEach((customer) => {
        tableBody.innerHTML += createTableRowTemplate(customer);
    });
}

const createTableRowTemplate = (customer) => {
    return `
              <tr>
                  <td>${customer.Customer.FirstName} ${customer.Customer.LastName}</td>
                  <td>${customer.Customer.Address}</td>
                  <td>${customer.Customer.City}</td>
                  <td>${customer.Customer.Country}</td>
                  <td>${customer.Customer.PostalCode || "N/A"}</td>
                  <td>${customer.Customer.Phone}</td>
                  <td>${customer.Customer.Email}</td>
                  <td>${customer.Employee.FirstName} ${customer.Employee.LastName}</td>
              </tr>
      `;
}
