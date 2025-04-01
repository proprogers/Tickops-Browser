(function () {
    const platforms = [
        { name: "Ticketmaster", url: "https://www.ticketmaster.com", handler: handlePlatform },
        { name: "Evenue", url: "https://www.evenue.net", handler: handlePlatform },
        { name: "Tixr", url: "https://www.tixr.com", handler: handlePlatform },
        { name: "AXS", url: "https://www.axs.com", handler: handlePlatform }
    ];

    async function handlePlatform(platform, query) {
        return await fetchTickets(platform.url, query);
    }

    async function fetchTickets(baseUrl, query) {
        const url = `${baseUrl}/search?q=${encodeURIComponent(query)}`;
            try {
            let response = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6723.152 Safari/537.36",
                    "Accept": "application/json",
                    "Referer": baseUrl
                }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch`);

            let data = await response.json();
            return data.results || [];
        } catch (error) {
            return [];
        }
    }

    function detectPlatform(url) {
        return platforms.find(platform => url.includes(platform.url))?.handler || null;
    }

        async function searchTickets(query) {

            let searchPromises = platforms.map(platform => platform.handler(platform, query));

            try {
                let resultsArray = await Promise.all(searchPromises);
                return resultsArray.flat();
            } catch (error) {
                return [];
            }
        }

    function debounce(func, delay) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    }

    document.addEventListener("DOMContentLoaded", function () {
        const searchButton = document.getElementById("searchButton");
        const searchInput = document.getElementById("searchInput");
        const resultsContainer = document.getElementById("resultsContainer");

        if (searchButton && searchInput && resultsContainer) {
            searchButton.addEventListener("click", async function () {
                let query = searchInput.value.trim();
                if (!query) return;
                let results = await searchTickets(query);
                displayResults(results, resultsContainer);
            });

            searchInput.addEventListener("input", debounce(async function () {
                let query = searchInput.value.trim();
                if (!query) return;
                let results = await searchTickets(query);
                displayResults(results, resultsContainer);
            }, 500));
        }
    });

    function displayResults(results, container) {
        container.innerHTML = "";
        if (results.length === 0) {
            container.innerHTML = "<p>No tickets found.</p>";
            return;
        }

        let list = document.createElement("ul");
        results.forEach(ticket => {
            let item = document.createElement("li");
            item.innerHTML = `<a href="${ticket.link}" target="_blank">${ticket.event} - ${ticket.price}</a>`;
            list.appendChild(item);
        });
        container.appendChild(list);
    }

})();
