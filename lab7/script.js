const queryInput = document.getElementById("query");
const statusElement = document.getElementById("status");
const methodLabel = document.getElementById("methodLabel");
const gallery = document.getElementById("gallery");
const defaultAccessKey = "1BQhQjtNhPowKMrqor8eO2LJrnG0EpCsfDbe1IAH67I";
const defaultPhotoCount = 8;
let lastSearchMethod = searchWithAsyncAwait;

document.getElementById("xhrBtn").addEventListener("click", searchWithXHR);
document.getElementById("fetchBtn").addEventListener("click", searchWithFetchPromises);
document.getElementById("asyncBtn").addEventListener("click", searchWithAsyncAwait);
queryInput.addEventListener("keydown", handleQueryKeydown);

function getFormData() {
    const accessKey = defaultAccessKey;
    const query = queryInput.value.trim();
    const perPage = defaultPhotoCount;

    if (!accessKey || !query || Number.isNaN(perPage) || perPage < 1) {
        updateStatus("Please provide a valid search keyword.");
        return null;
    }

    return {
        accessKey,
        query,
        perPage: Math.min(perPage, 12)
    };
}

function buildUrl(query, perPage) {
    const params = new URLSearchParams({
        query,
        per_page: String(perPage)
    });

    return `https://api.unsplash.com/search/photos?${params.toString()}`;
}

function updateStatus(message) {
    statusElement.textContent = message;
}

function setMethodLabel(label) {
    methodLabel.textContent = label;
}

function renderImages(images) {
    gallery.replaceChildren();

    if (!images.length) {
        const emptyState = document.createElement("div");
        emptyState.className = "empty-state";
        emptyState.textContent = "No images were found for this search.";
        gallery.appendChild(emptyState);
        return;
    }

    images.forEach((image) => {
        const altText = image.alt_description || image.description || "Unsplash image";
        const card = document.createElement("article");
        const imageElement = document.createElement("img");

        card.className = "card";
        imageElement.src = image.urls.small;
        imageElement.alt = altText;
        imageElement.loading = "lazy";

        card.appendChild(imageElement);
        gallery.appendChild(card);
    });
}

function handleSuccess(data, methodName) {
    renderImages(data.results || []);
    setMethodLabel(`Loaded with ${methodName}`);
    updateStatus(`Found ${data.total} matching image(s). Showing up to ${data.results.length}.`);
}

function handleError(errorMessage, methodName) {
    gallery.replaceChildren();

    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = "The request failed. Check your Access Key and try again.";
    gallery.appendChild(emptyState);

    setMethodLabel(`${methodName} failed`);
    updateStatus(errorMessage);
}

function searchWithXHR() {
    lastSearchMethod = searchWithXHR;
    const formData = getFormData();
    if (!formData) {
        return;
    }

    updateStatus("Sending request with XMLHttpRequest...");
    const request = new XMLHttpRequest();
    request.open("GET", buildUrl(formData.query, formData.perPage));
    request.setRequestHeader("Authorization", `Client-ID ${formData.accessKey}`);

    request.onload = function () {
        if (request.status >= 200 && request.status < 300) {
            const data = JSON.parse(request.responseText);
            handleSuccess(data, "XMLHttpRequest");
            return;
        }

        handleError(`XHR request failed with status ${request.status}.`, "XMLHttpRequest");
    };

    request.onerror = function () {
        handleError("XHR request failed because of a network error.", "XMLHttpRequest");
    };

    request.send();
}

function searchWithFetchPromises() {
    lastSearchMethod = searchWithFetchPromises;
    const formData = getFormData();
    if (!formData) {
        return;
    }

    updateStatus("Sending request with fetch().then()...");

    fetch(buildUrl(formData.query, formData.perPage), {
        headers: {
            Authorization: `Client-ID ${formData.accessKey}`
        }
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Fetch request failed with status ${response.status}.`);
            }

            return response.json();
        })
        .then((data) => {
            handleSuccess(data, "fetch with promises");
        })
        .catch((error) => {
            handleError(error.message, "fetch with promises");
        });
}

async function searchWithAsyncAwait() {
    lastSearchMethod = searchWithAsyncAwait;
    const formData = getFormData();
    if (!formData) {
        return;
    }

    updateStatus("Sending request with async/await...");

    try {
        const response = await fetch(buildUrl(formData.query, formData.perPage), {
            headers: {
                Authorization: `Client-ID ${formData.accessKey}`
            }
        });

        if (!response.ok) {
            throw new Error(`Async request failed with status ${response.status}.`);
        }

        const data = await response.json();
        handleSuccess(data, "async/await");
    } catch (error) {
        handleError(error.message, "async/await");
    }
}

function handleQueryKeydown(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        lastSearchMethod();
    }
}
