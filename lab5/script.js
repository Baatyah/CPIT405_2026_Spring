const dashboardPlayers = [
    {
        name: "Joel Embiid",
        team: "PHI",
        points: 33,
        rebounds: 10.8,
        assists: 5.7
    },
    {
        name: "Jalen Brunson",
        team: "NYK",
        points: 32.4,
        rebounds: 3.3,
        assists: 7.5
    },
    {
        name: "Shai Gilgeous-Alexander",
        team: "OKC",
        points: 30.2,
        rebounds: 7.2,
        assists: 6.4
    },
    {
        name: "Tyrese Maxey",
        team: "PHI",
        points: 29.8,
        rebounds: 5.2,
        assists: 6.8
    },
    {
        name: "Donovan Mitchell",
        team: "CLE",
        points: 29.6,
        rebounds: 5.4,
        assists: 4.7
    }
];

const playerRows = document.getElementById("player-rows");
const searchInput = document.getElementById("search");
const teamFilter = document.getElementById("team-filter");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const tableHeaders = document.querySelectorAll("#player-stats thead th");

const sortableColumns = ["name", "team", "points", "rebounds", "assists"];
const sortState = {
    key: null,
    direction: "asc"
};

function populateTeamFilter() {
    const teams = [...new Set(dashboardPlayers.map((player) => player.team))].sort((a, b) => a.localeCompare(b));

    teams.forEach((team) => {
        const option = document.createElement("option");
        option.value = team;
        option.textContent = team;
        teamFilter.appendChild(option);
    });
}

function renderRows(players) {
    playerRows.innerHTML = "";

    players.forEach((player) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${player.name}</td>
            <td>${player.team}</td>
            <td>${player.points}</td>
            <td>${player.rebounds}</td>
            <td>${player.assists}</td>
        `;
        playerRows.appendChild(row);
    });
}

function applySort(players) {
    if (!sortState.key) return players;

    const directionMultiplier = sortState.direction === "asc" ? 1 : -1;

    return [...players].sort((a, b) => {
        const valueA = a[sortState.key];
        const valueB = b[sortState.key];

        if (typeof valueA === "string" && typeof valueB === "string") {
            return valueA.localeCompare(valueB) * directionMultiplier;
        }

        return (valueA - valueB) * directionMultiplier;
    });
}

function applySearchAndFilter() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedTeam = teamFilter.value;

    const filteredPlayers = dashboardPlayers.filter((player) => {
        const matchesSearch =
            player.name.toLowerCase().includes(searchTerm) ||
            player.team.toLowerCase().includes(searchTerm);
        const matchesTeam = selectedTeam === "all" || player.team === selectedTeam;

        return matchesSearch && matchesTeam;
    });

    const sortedPlayers = applySort(filteredPlayers);
    renderRows(sortedPlayers);
}

function handleHeaderSort(event, columnIndex) {
    if (!event.currentTarget || !sortableColumns[columnIndex]) return;

    const selectedKey = sortableColumns[columnIndex];
    if (sortState.key === selectedKey) {
        sortState.direction = sortState.direction === "asc" ? "desc" : "asc";
    } else {
        sortState.key = selectedKey;
        sortState.direction = "asc";
    }

    applySearchAndFilter();
}

function init() {
    populateTeamFilter();
    applySearchAndFilter();

    searchInput.addEventListener("input", applySearchAndFilter);
    teamFilter.addEventListener("change", applySearchAndFilter);

    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });

    tableHeaders.forEach((header, index) => {
        header.addEventListener("click", (event) => handleHeaderSort(event, index));
    });
}

init();
