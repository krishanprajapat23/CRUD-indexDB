console.log("CRUD App with IndexDB");

const form = document.forms.detailsForm;
const inputName = form.elements;
const table = document.getElementById("tableWrap");
const tbody = document.querySelector("#table>tbody");
const updateFormBtn = document.getElementById("updateFormBtn");
const deleteAllDataBtn = document.getElementById("deleteAllData");
let dateObj = new Date().toLocaleString();
let updateKey;

table.style.display = "none";
updateFormBtn.style.display = "none";

function openDB() {
  return indexedDB.open("crud", 1);
}

function confirmText(text){
    return confirm(text);
}

// add data
function add(detailObj) {
  let idb = openDB();
  idb.onupgradeneeded = () => {
    let result = idb.result;
    result.createObjectStore("details", { autoIncrement: true });
  };

  idb.onsuccess = () => {
    let result = idb.result;
    let trans = result.transaction("details", "readwrite");
    let storeDetails = trans.objectStore("details");

    storeDetails.add(detailObj);
    alert("Data has been added");
    location.reload();
  };
}

// read data
function read() {
  let idb = openDB();
  idb.onsuccess = () => {
    let result = idb.result;
    let trans = result.transaction("details", "readonly");
    let storeDetails = trans.objectStore("details");
    let cursor = storeDetails.openCursor();
    cursor.onsuccess = () => {
      let curResult = cursor.result;
      if (curResult) {
        table.style.display = "block";
        tbody.innerHTML += `
                    <tr>
                        <td>${curResult.value.name}</td>
                        <td>${curResult.value.email}</td>
                        <td>${curResult.value.phone}</td>
                        <td>${curResult.value.location}</td>
                        <td>${curResult.value.created}</td>
                        <td>
                            <button onclick='update(${curResult.key})' type="button" class="btn btn-sm btn-sec">Update</button>
                            <button onclick='remove(${curResult.key})' type="button" class="btn btn-sm btn-danger">Delete</button>
                        </td>
                    </tr>
                `;
        curResult.continue();
      }
    };
  };
}

// remove data
function remove(key) {
  let idb = openDB();
  idb.onsuccess = () => {
    let result = idb.result;
    let trans = result.transaction("details", "readwrite");
    let storeDetails = trans.objectStore("details");
    
    if(confirmText('Are you sure to delete it?')){
        storeDetails.delete(key);
        alert("Data has been deleted");
        location.reload();
    } else{
        return false;
    }
  };
}

// update data
function update(key) {
  updateKey = key;
  updateFormBtn.style.display = "inline-block";
  let idb = openDB();
  idb.onsuccess = () => {
    let result = idb.result;
    let trans = result.transaction("details", "readonly");
    let storeDetails = trans.objectStore("details");
    let request = storeDetails.get(key);
    request.onsuccess = () => {
      let data = request.result;
      if (data) {
        inputName.name.value = data.name;
        inputName.email.value = data.email;
        inputName.tel.value = data.phone;
        inputName.location.value = data.location;
      }
    };
  };
}


// form submit
formBtn.onclick = () => {


  let detailObj = {
    name: inputName.name.value,
    email: inputName.email.value,
    phone: inputName.tel.value,
    location: inputName.location.value,
    created: dateObj,
  };
  add(detailObj);
};


// data update
updateFormBtn.onclick = () => {
  let idb = openDB();
  idb.onsuccess = () => {
    let result = idb.result;
    let trans = result.transaction("details", "readwrite");
    let storeDetails = trans.objectStore("details");
    storeDetails.put(
      {
        name: inputName.name.value,
        email: inputName.email.value,
        phone: inputName.tel.value,
        location: inputName.location.value,
        created: dateObj,
      },
      updateKey
    );
    alert("Data has been updated");
    location.reload();
  };
};


function deleteAllData() {
    let idb = openDB();
    idb.onsuccess = () => {
        let result = idb.result;
        let trans = result.transaction("details", "readwrite");
        let storeDetails = trans.objectStore("details");
        let clearRequest = storeDetails.clear();

        clearRequest.onsuccess = () => {
            console.log("All data deleted successfully");
            location.reload(); // You may reload the page or perform any other action after data deletion
        };

        clearRequest.onerror = () => {
            console.error("Error deleting data:", clearRequest.error);
        };
    };
}

deleteAllDataBtn.onclick = () => {
    deleteAllData()
}


read();




// Define input elements and their corresponding error messages
const inputFields = {
    email: {
        input: inputName.email,
        error: document.querySelector("#email + .invalid-feedback"),
        errorMessage: "Enter a valid email address."
    },
    name: {
        input: inputName.name,
        error: document.querySelector("#name + .invalid-feedback"),
        errorMessage: "Enter a name."
    },
    phone: {
        input: inputName.phone,
        error: document.querySelector("#phone + .invalid-feedback"),
        errorMessage: "Enter a valid phone number."
    },
    location: {
        input: inputName.location,
        error: document.querySelector("#location + .invalid-feedback"),
        errorMessage: "Enter a location."
    },
};

// Attach input event listeners to each input element
for (let field of Object.values(inputFields)) {
    console.log(field.input);
    field.input.addEventListener('input', (event) => {
        const input = field.input;
        const error = field.error;

        if (input.validity.valid) {
            error.textContent = "";
            error.classList.add("invalid-feedback");
        } else {
            showError(field.errorMessage, error);
        }
    });
}

// Attach submit event listener to the form

form.addEventListener('submit', (event) => {
    console.log('hey');
    let hasError = false;

    // Check validity for each input field
    for (let field of Object.values(inputFields)) {
        const input = field.input;
        const error = field.error;

        if (!input.validity.valid) {
            showError(field.errorMessage, error);
            hasError = true;
        }
    }

    // Prevent form submission if any field has error
    if (hasError) {
        event.preventDefault();
    }
});

function showError(errorMessage, error) {
    error.textContent = errorMessage;
    error.classList.add("active");
}