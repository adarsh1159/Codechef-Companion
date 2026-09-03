const API_URL = "http://localhost:5000";

let allContests = [];
let currentDivision = "div_1";


// ============================================
// DOM ELEMENTS
// ============================================

const startersTab =
    document.getElementById("startersTab");

const mondayMunchTab =
    document.getElementById("mondayMunchTab");

const startersSection =
    document.getElementById("startersSection");

const mondayMunchSection =
    document.getElementById("mondayMunchSection");

const contestList =
    document.getElementById("contestList");

const mondayMunchList =
    document.getElementById("mondayMunchList");

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");

const divisionButtons =
    document.querySelectorAll(".division-btn");

const searchInput =
    document.getElementById("searchInput");

const difficultyFrom =
    document.getElementById("difficultyFrom");

const difficultyTo =
    document.getElementById("difficultyTo");

const clearFilters =
    document.getElementById("clearFilters");


// ============================================
// INITIAL LOAD
// ============================================

loadStarters();


// ============================================
// LOAD STARTERS
// ============================================

async function loadStarters() {

    showLoading();

    try {

        const response =
            await fetch(
                `${API_URL}/api/contests`
            );

        const data =
            await response.json();

        if (!data.success) {

            throw new Error(
                "Failed to load contests"
            );

        }

        allContests =
            data.contests || [];


        // =====================================
        // SORT STARTERS DESCENDING
        // =====================================

        allContests.sort(
            (a, b) => {

                const numA =
                    Number(
                        String(
                            a.contestCode || ""
                        ).replace(
                            "START",
                            ""
                        )
                    );

                const numB =
                    Number(
                        String(
                            b.contestCode || ""
                        ).replace(
                            "START",
                            ""
                        )
                    );

                return numB - numA;

            }
        );


        renderStarters();

        hideLoading();

    } catch (error) {

        console.error(error);

        hideLoading();

        showError(
            "Could not load Starter contests."
        );

    }

}


// ============================================
// GET FILTERED CONTESTS
// ============================================

function getFilteredContests() {

    const searchValue =
        searchInput.value
            .trim()
            .toLowerCase();

    const fromValue =
        difficultyFrom.value;

    const toValue =
        difficultyTo.value;

    const from =
        fromValue === ""
            ? null
            : Number(fromValue);

    const to =
        toValue === ""
            ? null
            : Number(toValue);


    return allContests.filter(
        (contest) => {

            const contestNumber =
                String(
                    contest.contestCode || ""
                )
                    .replace("START", "")
                    .toLowerCase();


            const matchesSearch =
                contestNumber.includes(
                    searchValue
                );


            if (!matchesSearch) {

                return false;

            }


            const division =
                contest.divisions?.[
                    currentDivision
                ];


            if (!division) {

                return false;

            }


            const problems =
                division.problems || [];


            if (
                from === null &&
                to === null
            ) {

                return true;

            }


            return problems.some(
                (problem) => {

                    const rating =
                        Number(
                            problem.difficulty
                        );

                    if (
                        !rating ||
                        Number.isNaN(rating)
                    ) {

                        return false;

                    }


                    if (
                        from !== null &&
                        rating < from
                    ) {

                        return false;

                    }


                    if (
                        to !== null &&
                        rating > to
                    ) {

                        return false;

                    }


                    return true;

                }
            );

        }
    );

}


// ============================================
// RENDER STARTERS
// ============================================

function renderStarters() {

    contestList.innerHTML = "";


    const filteredContests =
        getFilteredContests();


    if (
        filteredContests.length === 0
    ) {

        contestList.innerHTML =
            `
            <p class="empty-message">
                No contests found.
            </p>
            `;

        return;

    }


    filteredContests.forEach(
        (contest) => {

            const division =
                contest.divisions?.[
                    currentDivision
                ];


            if (!division) {

                return;

            }


            const fromValue =
                difficultyFrom.value;

            const toValue =
                difficultyTo.value;

            const from =
                fromValue === ""
                    ? null
                    : Number(fromValue);

            const to =
                toValue === ""
                    ? null
                    : Number(toValue);


            let problems =
                division.problems || [];


            if (
                from !== null ||
                to !== null
            ) {

                problems =
                    problems.filter(
                        (problem) => {

                            const rating =
                                Number(
                                    problem.difficulty
                                );

                            if (
                                !rating ||
                                Number.isNaN(rating)
                            ) {

                                return false;

                            }


                            if (
                                from !== null &&
                                rating < from
                            ) {

                                return false;

                            }


                            if (
                                to !== null &&
                                rating > to
                            ) {

                                return false;

                            }


                            return true;

                        }
                    );

            }


            const card =
                createContestCard(
                    contest,
                    division,
                    problems
                );


            contestList.appendChild(card);

        }
    );

}


// ============================================
// CREATE CONTEST CARD
// ============================================

function createContestCard(
    contest,
    division,
    problems
) {

    const card =
        document.createElement("div");

    card.className =
        "contest-card";


    const contestNumber =
        String(
            contest.contestCode || ""
        ).replace("START", "");


    // =========================================
    // HEADER
    // =========================================

    const header =
        document.createElement("div");

    header.className =
        "contest-header";


    // ONLY SHOW: Starters + Number

    header.innerHTML = `

        <div>

            <h3>
                Starters ${contestNumber}
            </h3>

        </div>

    `;


    card.appendChild(header);


    // =========================================
    // PROBLEM TABLE
    // =========================================

    const table =
        document.createElement("div");

    table.className =
        "problem-table";


    table.innerHTML = `

        <div class="problem-row problem-heading">

            <div>#</div>

            <div>Problem</div>

            <div>Difficulty</div>

            <div>Problem</div>

            <div>Editorial</div>

        </div>

    `;


    problems.forEach(
        (problem, index) => {

            const row =
                createStarterProblemRow(
                    problem,
                    index
                );

            table.appendChild(row);

        }
    );


    card.appendChild(table);


    return card;

}


// ============================================
// STARTER PROBLEM ROW
// ============================================

function createStarterProblemRow(
    problem,
    index
) {

    const row =
        document.createElement("div");

    row.className =
        "problem-row";


    const difficulty =
        problem.difficulty;


    const difficultyClass =
        getDifficultyClass(
            difficulty
        );


    const difficultyText =
        difficulty !== null &&
        difficulty !== undefined
            ? difficulty
            : "—";


    const editorialUrl =
        problem.editorialUrl || "#";


    row.innerHTML = `

        <div>
            ${String.fromCharCode(65 + index)}
        </div>

        <div class="problem-name">
            ${problem.name || problem.code}
        </div>

        <div>

            <span class="difficulty ${difficultyClass}">
                ${difficultyText}
            </span>

        </div>

        <div>

            <a
                href="${problem.problemUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="solve-btn"
            >
                Solve
            </a>

        </div>

        <div>

            ${
                editorialUrl !== "#"

                    ? `

                    <a
                        href="${editorialUrl}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="editorial-btn"
                    >
                        Editorial
                    </a>

                    `

                    : "—"
            }

        </div>

    `;


    return row;

}


// ============================================
// LOAD MONDAY MUNCH
// ============================================

async function loadMondayMunch() {

    mondayMunchList.innerHTML =
        `
        <div class="loading">
            Loading Monday Munch...
        </div>
        `;


    try {

        const response =
            await fetch(
                `${API_URL}/api/monday-munch`
            );


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                "Failed to load Monday Munch"
            );

        }


        renderMondayMunch(
            data.challenges || []
        );

    } catch (error) {

        console.error(error);


        mondayMunchList.innerHTML =
            `
            <p class="empty-message">
                Could not load Monday Munch.
            </p>
            `;

    }

}


// ============================================
// RENDER MONDAY MUNCH
// ============================================

function renderMondayMunch(
    challenges
) {

    mondayMunchList.innerHTML = "";


    if (
        challenges.length === 0
    ) {

        mondayMunchList.innerHTML =
            `
            <p class="empty-message">
                No Monday Munch challenges available.
            </p>
            `;

        return;

    }


    challenges.forEach(
        (challenge) => {

            const card =
                document.createElement("div");

            card.className =
                "contest-card";


            const header =
                document.createElement("div");

            header.className =
                "contest-header";


            header.innerHTML = `

                <div>

                    <h3>
                        ${challenge.name}
                    </h3>

                </div>

                <span class="contest-tag">

                    ${challenge.totalProblems || 0}
                    Problems

                </span>

            `;


            card.appendChild(header);


            const table =
                document.createElement("div");

            table.className =
                "problem-table";


            table.innerHTML = `

                <div
                    class="
                        problem-row
                        problem-heading
                        monday-heading
                    "
                >

                    <div>#</div>

                    <div>Problem</div>

                    <div>Difficulty</div>

                    <div>Solve</div>

                </div>

            `;


            const problems =
                challenge.problems || [];


            problems.forEach(
                (problem, index) => {

                    const row =
                        document.createElement(
                            "div"
                        );


                    row.className =
                        "problem-row monday-problem-row";


                    const difficulty =
                        problem.difficulty;


                    const difficultyClass =
                        getDifficultyClass(
                            difficulty
                        );


                    const difficultyText =
                        difficulty !== null &&
                        difficulty !== undefined
                            ? difficulty
                            : "—";


                    row.innerHTML = `

                        <div>
                            ${index + 1}
                        </div>

                        <div class="problem-name">
                            ${problem.name || problem.code}
                        </div>

                        <div>

                            <span
                                class="
                                    difficulty
                                    ${difficultyClass}
                                "
                            >
                                ${difficultyText}
                            </span>

                        </div>

                        <div>

                            <a
                                href="${problem.problemUrl}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="solve-btn"
                            >
                                Solve
                            </a>

                        </div>

                    `;


                    table.appendChild(row);

                }
            );


            card.appendChild(table);

            mondayMunchList.appendChild(
                card
            );

        }
    );

}


// ============================================
// TAB SWITCHING
// ============================================

startersTab.addEventListener(
    "click",
    () => {

        startersTab.classList.add("active");

        mondayMunchTab.classList.remove("active");


        startersSection.style.display =
            "block";

        mondayMunchSection.style.display =
            "none";

    }
);


mondayMunchTab.addEventListener(
    "click",
    () => {

        mondayMunchTab.classList.add("active");

        startersTab.classList.remove("active");


        startersSection.style.display =
            "none";

        mondayMunchSection.style.display =
            "block";


        loadMondayMunch();

    }
);


// ============================================
// DIVISION SWITCHING
// ============================================

divisionButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                divisionButtons.forEach(
                    (btn) => {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add("active");


                currentDivision =
                    button.dataset.division;


                renderStarters();

            }
        );

    }
);


// ============================================
// SEARCH FILTER
// ============================================

searchInput.addEventListener(
    "input",
    () => {

        renderStarters();

    }
);


// ============================================
// DIFFICULTY FILTERS
// ============================================

difficultyFrom.addEventListener(
    "input",
    () => {

        renderStarters();

    }
);


difficultyTo.addEventListener(
    "input",
    () => {

        renderStarters();

    }
);


// ============================================
// CLEAR FILTERS
// ============================================

clearFilters.addEventListener(
    "click",
    () => {

        searchInput.value = "";

        difficultyFrom.value = "";

        difficultyTo.value = "";

        renderStarters();

    }
);


// ============================================
// DIFFICULTY COLOR
// ============================================

function getDifficultyClass(
    difficulty
) {

    if (
        difficulty === null ||
        difficulty === undefined
    ) {

        return "difficulty-unknown";

    }


    if (difficulty < 1200) {

        return "difficulty-easy";

    }


    if (difficulty < 1600) {

        return "difficulty-medium";

    }


    if (difficulty < 2000) {

        return "difficulty-hard";

    }


    return "difficulty-very-hard";

}


// ============================================
// LOADING / ERROR
// ============================================

function showLoading() {

    loading.style.display =
        "block";

    errorMessage.style.display =
        "none";

}


function hideLoading() {

    loading.style.display =
        "none";

}


function showError(
    message
) {

    errorMessage.textContent =
        message;

    errorMessage.style.display =
        "block";

}