const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
const VOTE_COOKIE_KEY = "lab6_voteChoice";
const COMMENTS_COOKIE_KEY = "lab6_comments";

let likeCount = 0;
let dislikeCount = 0;
let comments = [];

const likeButton = document.getElementById("like-button");
const dislikeButton = document.getElementById("dislike-button");
const likeCountElement = document.getElementById("like-count");
const dislikeCountElement = document.getElementById("dislike-count");
const commentForm = document.getElementById("comment-form");
const commentInput = document.getElementById("comment-input");
const commentsList = document.getElementById("comments-list");
const resetButton = document.getElementById("reset-button");
const statusMessage = document.getElementById("status-message");

function setCookie(name, value, maxAgeSeconds = COOKIE_MAX_AGE) {
    document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/; SameSite=Lax`;
}

function getCookie(name) {
    const prefix = `${name}=`;
    const cookie = document.cookie
        .split("; ")
        .find((entry) => entry.startsWith(prefix));

    return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

function deleteCookie(name) {
    document.cookie = `${name}=; max-age=0; path=/; SameSite=Lax`;
}

function loadStateFromCookies() {
    const storedVote = getCookie(VOTE_COOKIE_KEY);
    const storedComments = getCookie(COMMENTS_COOKIE_KEY);

    if (storedVote === "like") {
        likeCount = 1;
    } else if (storedVote === "dislike") {
        dislikeCount = 1;
    }

    if (storedComments) {
        try {
            const parsedComments = JSON.parse(storedComments);
            if (Array.isArray(parsedComments)) {
                comments = parsedComments;
            }
        } catch (error) {
            comments = [];
        }
    }
}

function renderCounts() {
    likeCountElement.textContent = String(likeCount);
    dislikeCountElement.textContent = String(dislikeCount);
}

function renderVoteState() {
    const storedVote = getCookie(VOTE_COOKIE_KEY);
    const hasVote = Boolean(storedVote);

    likeButton.disabled = hasVote;
    dislikeButton.disabled = hasVote;
    likeButton.classList.toggle("is-selected", storedVote === "like");
    dislikeButton.classList.toggle("is-selected", storedVote === "dislike");
}

function renderComments() {
    commentsList.innerHTML = "";

    if (comments.length === 0) {
        const emptyState = document.createElement("li");
        emptyState.className = "empty-state";
        emptyState.textContent = "No comments yet.";
        commentsList.appendChild(emptyState);
        return;
    }

    comments.forEach((comment) => {
        const listItem = document.createElement("li");
        listItem.textContent = comment;
        commentsList.appendChild(listItem);
    });
}

function showStatus(message, isSuccess = true) {
    statusMessage.textContent = message;
    statusMessage.style.color = isSuccess ? "#0b6e4f" : "#b42318";
}

function handleVote(choice) {
    if (getCookie(VOTE_COOKIE_KEY)) {
        showStatus("You have already voted on this page.", false);
        return;
    }

    if (choice === "like") {
        likeCount += 1;
    } else {
        dislikeCount += 1;
    }

    setCookie(VOTE_COOKIE_KEY, choice);
    renderCounts();
    renderVoteState();
    showStatus(`Your ${choice} was saved.`);
}

function handleCommentSubmit(event) {
    event.preventDefault();

    const comment = commentInput.value.trim();
    if (!comment) {
        showStatus("Enter a comment before submitting.", false);
        return;
    }

    if (comments.includes(comment)) {
        showStatus("That comment is already stored.", false);
        return;
    }

    comments.push(comment);
    setCookie(COMMENTS_COOKIE_KEY, JSON.stringify(comments));
    renderComments();
    commentInput.value = "";
    showStatus("Comment submitted.");
}

function handleReset() {
    deleteCookie(VOTE_COOKIE_KEY);
    deleteCookie(COMMENTS_COOKIE_KEY);

    likeCount = 0;
    dislikeCount = 0;
    comments = [];

    renderCounts();
    renderVoteState();
    renderComments();
    showStatus("Choices and comments were reset.");
}

function init() {
    loadStateFromCookies();
    renderCounts();
    renderVoteState();
    renderComments();

    likeButton.addEventListener("click", () => handleVote("like"));
    dislikeButton.addEventListener("click", () => handleVote("dislike"));
    commentForm.addEventListener("submit", handleCommentSubmit);
    resetButton.addEventListener("click", handleReset);
}

init();
