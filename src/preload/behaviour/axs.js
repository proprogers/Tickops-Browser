const currentURL = window.location.href;

function searchEvent(eventName) {
    let searchInput = document.querySelector("input[placeholder='Search']");
    if (searchInput) {
        searchInput.value = eventName;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

        setTimeout(clickSearchButton, 3000);
    } else {
        console.log("not found");
    }
}

function clickSearchButton() {
    let searchButton = document.querySelector("button[type='submit']");
    if (searchButton) {
        searchButton.click();
        setTimeout(clickFirstFindTickets, 4000);
    } else {
        console.log("not found");
    }
}

function clickFirstFindTickets() {
    let ticketsButton = document.querySelector("a[data-testid='event-link']");
    if (ticketsButton) {
        ticketsButton.click();
        setTimeout(selectFirstTicket, 5000);
    } else {
        console.log("not found");
    }
}

function selectFirstTicket() {
    let ticketButton = document.querySelector("button[data-bdd='ticket-selection-button']");
    if (ticketButton) {
        ticketButton.click();
    
        setTimeout(() => {
            let nextButton = document.querySelector("button[data-bdd='checkout-button']");
            if (nextButton) {
                nextButton.click();
                
                setTimeout(loginToAXS, 4000);
            } else {
                console.log("not found");
            }
        }, 2000);
    } else {
        console.log("not found");
    }
}

function loginToAXS() {
    let emailField = document.querySelector("input[name='email']");
    let passwordField = document.querySelector("input[name='password']");
    let signInButton = document.querySelector("button[type='submit']");

    if (emailField && passwordField && signInButton) {
        emailField.value = "login";
        emailField.dispatchEvent(new Event('input', { bubbles: true }));

        passwordField.value = "password";
        passwordField.dispatchEvent(new Event('input', { bubbles: true }));

        setTimeout(() => {
            signInButton.click();
            setTimeout(() => {
                console.log("done");
            }, 4000);
        }, 3000);
    } else {
        console.log("not found");
    }
}

if (window.location.href == 'https://www.axs.com/') {
    searchEvent("eminem");
} else if (currentURL.includes("search")) {
    setTimeout(clickFirstFindTickets, 3000);
} else if (currentURL.includes("event")) {
    setTimeout(selectFirstTicket, 3000);
} else if (currentURL.includes("checkout") || currentURL.includes("login")) {
    setTimeout(loginToAXS, 3000);
}
