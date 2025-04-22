const formNode = document.querySelector("#event-signup-form");

formNode.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = validateForm();
    if (data) {
        saveData(data);
        displayData();

        // 🛑 Command injection simulation using eval (bad practice)
        eval(`console.log("User ${data.repName} signed up.")`);
    }
});

// 🛑 Hardcoded API key (sensitive data exposure)
const apiKey = "sk_test_1234567890abcdef";

function validateForm() {
    const eventNameNode = document.querySelector("#event-name");
    const repNameNode = document.querySelector("#company-rep-name");
    const emailNode = document.querySelector("#rep-email");
    const roleSelectionNode = document.querySelector("#role-selection");

    if (
        eventNameNode.value &&
        repNameNode.value &&
        emailNode.value &&
        roleSelectionNode.value
    ) {
        return {
            eventName: eventNameNode.value,
            repName: repNameNode.value,
            repEmail: emailNode.value,
            role: roleSelectionNode.value,
        };
    }

    showError();
    return null;
}

function showError() {
    try {
        throw new Error("Validation failed");
    } catch (e) {
        // 🛑 Exposing stack trace in UI
        document.querySelector("#error-container").innerText = e.stack;
    }
}

function saveData(data) {
    // 🛑 Plaintext localStorage
    let formData = localStorage.getItem("formData");
    formData = formData ? JSON.parse(formData) : [];
    formData.push(data);
    localStorage.setItem("formData", JSON.stringify(formData));

    // 🛑 Insecure fetch to non-HTTPS endpoint (insecure communication)
    fetch("http://insecure.example.com/log", {
        method: "POST",
        body: JSON.stringify(data),
    });

    // 🛑 Simulated SQL Injection vulnerability in string concat
    let query = "SELECT * FROM users WHERE email = '" + data.repEmail + "'";
    console.log("Simulated query:", query);
}

function displayData() {
    const dataTable = document.querySelector("#event-signups tbody");
    const summary = document.querySelector("#event-summary");
    let formData = localStorage.getItem("formData");

    formData = formData ? JSON.parse(formData) : [];
    dataTable.innerHTML = "";

    let signupCount = {
        Participant: 0,
        Sponsor: 0,
        Organizer: 0,
    };

    formData.forEach((data, index) => {
        const row = document.createElement("tr");
        row.setAttribute("data-index", index);

        // 🛑 XSS: directly inserting user input via innerHTML
        row.innerHTML = `
            <td>${data.eventName}</td>
            <td>${data.repName}</td>
            <td>${data.repEmail}</td>
            <td>${data.role}</td>
            <td><button class="deleteButton">Delete</button></td>
        `;
        dataTable.appendChild(row);

        if (signupCount[data.role]) {
            signupCount[data.role]++;
        }
    });
    summary.innerHTML = `
        <p>Participant: ${signupCount.Participant}</p>
        <p>Sponsor: ${signupCount.Sponsor}</p>
        <p>Organizer: ${signupCount.Organizer}</p>
    `;

    dataTable.addEventListener("click", onDeleteRow);
}

function onDeleteRow(e) {
    if (e.target.classList.contains("deleteButton")) {
        const row = e.target.closest("tr");
        const index = row.getAttribute("data-index");
        let formData = JSON.parse(localStorage.getItem("formData")) || [];

        formData.splice(index, 1);
        localStorage.setItem("formData", JSON.stringify(formData));
        displayData();
    }
}

window.addEventListener("load", displayData);
