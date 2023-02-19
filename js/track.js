const baseUrl = "http://localhost:4000";

const triggerBtn = document.getElementById("modal-trigger-btn");
const modalTarget = document.getElementById("modal-target");

const targetDiv = document.querySelector(".target");
let tableBody = document.getElementById("table-body");
const inputs = document.querySelectorAll("#input-trackName, #input-composer, #input-unitPrice");
const validationtargets = document.querySelectorAll("#trackName-target, #composer-target, #unitPrice-target");
const trackNameInput = document.querySelector("#input-trackName");
const composerInput = document.querySelector("#input-composer");
const unitPriceInput = document.querySelector("#input-unitPrice");
const trackNameTarget = document.querySelector("#trackName-target");
const composerTarget = document.querySelector("#composer-target");
const unitPriceTarget = document.querySelector("#unitPrice-target");
const formBtn = document.querySelector("#btn-edit-form");
const editBtn = document.querySelector("#btn-edit");
const notification = document.querySelector(".notification");
let trackId;

getTracks();

function getTracks() {
    const result = fetch(`${baseUrl}/tracks`, {
        method: 'GET',
    })
        .then(res => res.json());

    result.then(tracks => {
        if (tracks) displayTracksTable(tracks);
        else console.log("Ooops! something went wrong!");
    });
};

function editTrack(trackId) {
    const editForm = document.querySelector("#edit-form");
    const formData = new FormData(editForm);
    for (const data of formData.entries()) {
        console.log(data);
    }
    fetch(`${baseUrl}/tracks/${trackId}`, {
        method: 'PUT',
        body: formData
    })
        .then(res => res.text())
        .then(res => {
            console.log("Edit Success!!", res);
            getTracks();
        })
        .catch(e => {
            console.log(e);
            notification.classList.add("is-warning");
            notification.innerHTML = "<p>Oops! Track Update Failed!</p>";
            notification.hidden = false;
        }).finally(() => {
            notification.classList.add("is-success");
            notification.innerHTML = "<p>Track updated usccessfully!</p>";
            notification.hidden = false;
        });
}

function displayTracksTable(tracks) {
    tracks.forEach((track) => {
        tableBody.innerHTML += createTableRowTemplate(track);
        createEditModal(track);
    });
}

function createEditModal() {

    let track;
    let allEditBtns = document.querySelectorAll(`#btn-edit`);

    if (allEditBtns.length > 0) {
        allEditBtns.forEach(btnEdit => {
            btnEdit.addEventListener("click", (e) => {
                resetFormvalidations();
                const row = e.currentTarget.value;
                if (row) {
                    track = row.split(",");
                }
                trackId = parseInt(track[0]);
                trackNameInput.value = track[1];
                composerInput.value = track[2];
                unitPriceInput.value = parseFloat(track[3]);
                formBtn.value = trackId;
                triggerBtn.click();
            });
        });
    }
}

formBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const trackId = e.target.value;
    editTrack(parseInt(trackId));
});

const createTableRowTemplate = (track) => {
    return `
              <tr>
                  <td>${track.Name}</td>
                  <td>${track.Composer || "N/A"}</td>
                  <td>${track.Milliseconds || "N/A"}</td>
                  <td>${track.Bytes || "N/A"}</td>
                  <td>$${track.UnitPrice || "N/A"}</td>
                  <td>
                    <button value="${[track.TrackId, track.Name, track.Composer, track.UnitPrice]}" class="button is-dark" id="btn-edit">
                        <i class="fas fa-user-edit"></i>
                    </button>
                </td>
              </tr>
      `;
}

function resetFormvalidations() {
    inputValidator.trackName = true;
    inputValidator.composer = true;
    inputValidator.unitPrice = true;
    toggleEditBtns();
    validationtargets.forEach(target => {
        target.innerHTML = '';
    });
    inputs.forEach(input => input.classList.remove('is-danger'));
}

let inputValidator = {
    "trackName": false,
    "composer": false,
    "unitPrice": false
};

inputs.forEach((input) => {
    input.addEventListener("input", (e) => {
        let controlName = e.target.getAttribute("name");
        if (controlName === "trackName") {
            const message = "Please enter valid Track Name";
            validateForm(e.target.value, input, controlName, trackNameTarget, message, "text");
        } else if (controlName === "composer") {
            const message = "Please enter valid Composer Name";
            validateForm(e.target.value, input, controlName, composerTarget, message, "text");
        } else {
            const message = "Please enter valid Unit Price";
            validateForm(e.target.value, input, controlName, unitPriceTarget, message, "number");
        }
        toggleEditBtns();
    })
});


function toggleEditBtns() {
    let allTrue = Object.keys(inputValidator).every((item) => {
        return inputValidator[item] === true;
    });

    if (allTrue) {
        formBtn.disabled = false;
    } else {
        formBtn.disabled = true;
    }
}

function validateForm(enteredValue, input, controlName, target, message, type) {
    let p;
    let validate;

    if (type === "number") {
        validate = validateNumber(enteredValue);
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

function validateText(text) {
    if ((text === "" || text === "undefined" || text === "null")) return false;
    const regex = /([A-Za-z0-9])\w+/;
    return regex.test(text);
}

function validateNumber(price) {
    if (!price) return false;
    const regex = /[+-]?([0-9]*[.])?[0-9]+/;
    return regex.test(price);
}


// notification JS Code

document.addEventListener('DOMContentLoaded', () => {
    (document.querySelectorAll('.notification .delete') || []).forEach(($delete) => {
        const $notification = $delete.parentNode;

        $delete.addEventListener('click', () => {
            $notification.parentNode.removeChild($notification);
        });
    });
});