const axios = require("axios");
const fs = require("fs");
const path = require("path");

const STARTER_FROM = 1;
const STARTER_TO = 254;

const DIVISIONS = [
    { id: "div_1", letter: "A", name: "Division 1" },
    { id: "div_2", letter: "B", name: "Division 2" },
    { id: "div_3", letter: "C", name: "Division 3" },
    { id: "div_4", letter: "D", name: "Division 4" }
];

const dataDirectory =
    path.join(__dirname, "data");

const outputFile =
    path.join(
        dataDirectory,
        "starters.json"
    );

if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(
        dataDirectory,
        { recursive: true }
    );
}

const axiosConfig = {
    headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
    },
    timeout: 15000
};

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function loadExistingData() {

    if (!fs.existsSync(outputFile)) {
        return {
            updatedAt: null,
            count: 0,
            contests: {}
        };
    }

    try {

        const file =
            fs.readFileSync(
                outputFile,
                "utf8"
            );

        return JSON.parse(file);

    } catch (error) {

        console.log(
            "Could not read starters.json."
        );

        return {
            updatedAt: null,
            count: 0,
            contests: {}
        };
    }
}

function saveData(data) {

    data.updatedAt =
        new Date().toISOString();

    data.count =
        Object.keys(
            data.contests || {}
        ).length;

    fs.writeFileSync(
        outputFile,
        JSON.stringify(
            data,
            null,
            4
        ),
        "utf8"
    );
}


/*
    Fetch difficulty rating for one problem.

    Correct CodeChef endpoint:

    /api/contests/PRACTICE/problems/{PROBLEM_CODE}
*/
async function fetchDifficulty(problemCode) {

    const url =
        `https://www.codechef.com/api/contests/PRACTICE/problems/${problemCode}`;

    try {

        const response =
            await axios.get(
                url,
                axiosConfig
            );

        const data =
            response.data;

        if (
            data &&
            data.difficulty_rating !== undefined &&
            data.difficulty_rating !== null
        ) {

            return {
                success: true,

                difficulty:
                    Number(
                        data.difficulty_rating
                    )
            };
        }

        return {
            success: false,
            difficulty: null
        };

    } catch (error) {

        console.log(
            `  ✗ Failed to fetch rating for ${problemCode}`
        );

        return {
            success: false,
            difficulty: null
        };
    }
}


/*
    Fetch one division.

    category_name is used ONLY to identify
    the main/scored problems.

    It is NOT stored in starters.json.
*/
async function fetchDivision(
    contestCode,
    division
) {

    const contestTag =
        `${contestCode}${division.letter}`;

    const url =
        `https://www.codechef.com/api/contests/${contestTag}`;

    try {

        const response =
            await axios.get(
                url,
                axiosConfig
            );

        const data =
            response.data;

        const problemsObject =
            data.problems || {};

        const problems =
            Object.values(
                problemsObject
            )
            .filter(
                (problem) =>
                    problem.category_name === "main"
            )
            .map(
                (problem) => {

                    return {

                        code:
                            problem.code,

                        name:
                            problem.name,

                        problemUrl:
                            `https://www.codechef.com/problems/${problem.code}`,

                        difficulty:
                            null,

                        editorialUrl:
                            `https://discuss.codechef.com/t/${problem.code.toLowerCase()}-editorial/`
                    };
                }
            );

        return {

            success: true,

            contestTag,

            name:
                data.name || "",

            division:
                data.division ||
                division.name,

            problems
        };

    } catch (error) {

        return {

            success: false,

            contestTag,

            error:
                error.message
        };
    }
}


/*
    Fetch only NEW contests.
*/
async function fetchNewContest(
    contestNumber
) {

    const contestCode =
        `START${contestNumber}`;

    console.log("");
    console.log(
        `========== ${contestCode} ==========`
    );

    const divisions = {};

    for (
        const division of DIVISIONS
    ) {

        console.log(
            `Fetching ${contestCode}${division.letter}...`
        );

        const result =
            await fetchDivision(
                contestCode,
                division
            );

        if (result.success) {

            divisions[
                division.id
            ] = {

                contestTag:
                    result.contestTag,

                name:
                    result.name,

                division:
                    result.division,

                problems:
                    result.problems
            };

            console.log(
                `  ✓ ${result.problems.length} main problems`
            );

        } else {

            console.log(
                `  ✗ ${result.contestTag} failed`
            );
        }

        await sleep(200);
    }

    if (
        Object.keys(divisions).length === 0
    ) {

        return null;
    }

    return {

        contestCode,

        divisions
    };
}


/*
    Update ONLY problems whose difficulty
    is missing.
*/
async function updateMissingDifficulties(
    data
) {

    console.log("");
    console.log(
        "=============================================="
    );
    console.log(
        "CHECKING MISSING DIFFICULTY RATINGS"
    );
    console.log(
        "=============================================="
    );

    let missingCount = 0;
    let updatedCount = 0;
    let failedCount = 0;

    for (
        const contest of Object.values(
            data.contests || {}
        )
    ) {

        for (
            const division of Object.values(
                contest.divisions || {}
            )
        ) {

            for (
                const problem of (
                    division.problems || []
                )
            ) {

                /*
                    Already has rating.
                    Do nothing.
                */
                if (
                    problem.difficulty !== null &&
                    problem.difficulty !== undefined
                ) {

                    continue;
                }

                missingCount++;

                console.log(
                    `Fetching rating: ${problem.code}`
                );

                const result =
                    await fetchDifficulty(
                        problem.code
                    );

                if (result.success) {

                    problem.difficulty =
                        result.difficulty;

                    updatedCount++;

                    console.log(
                        `  ✓ ${problem.code} = ${result.difficulty}`
                    );

                } else {

                    failedCount++;

                    console.log(
                        `  - ${problem.code} could not be rated`
                    );
                }

                /*
                    Save after every request.

                    This prevents losing progress
                    if the script stops.
                */
                saveData(data);

                await sleep(200);
            }
        }
    }

    console.log("");
    console.log(
        `Missing ratings found: ${missingCount}`
    );

    console.log(
        `Ratings added: ${updatedCount}`
    );

    console.log(
        `Ratings failed: ${failedCount}`
    );
}


/*
    Main function.
*/
async function scrapeAllStarters() {

    console.log("");
    console.log(
        "=============================================="
    );
    console.log(
        "      CODECHEF STARTERS DATA UPDATER"
    );
    console.log(
        "=============================================="
    );

    const data =
        loadExistingData();

    if (!data.contests) {
        data.contests = {};
    }

    let newContests = 0;
    let existingContests = 0;

    /*
        Find NEW contests.

        Existing contests are completely skipped.
    */
    for (
        let number = STARTER_FROM;
        number <= STARTER_TO;
        number++
    ) {

        const contestCode =
            `START${number}`;

        if (
            data.contests[contestCode]
        ) {

            existingContests++;

            continue;
        }

        console.log("");
        console.log(
            `NEW CONTEST FOUND: ${contestCode}`
        );

        const contest =
            await fetchNewContest(
                number
            );

        if (contest) {

            data.contests[
                contestCode
            ] = contest;

            newContests++;

            saveData(data);
        }
    }

    /*
        Now update missing ratings.
    */
    await updateMissingDifficulties(
        data
    );

    saveData(data);

    console.log("");
    console.log(
        "=============================================="
    );
    console.log(
        "UPDATE FINISHED"
    );
    console.log(
        "=============================================="
    );

    console.log(
        `Existing contests skipped: ${existingContests}`
    );

    console.log(
        `New contests added: ${newContests}`
    );

    console.log(
        `Total contests: ${
            Object.keys(data.contests).length
        }`
    );

    console.log(
        `Saved: ${outputFile}`
    );

    console.log(
        "=============================================="
    );
}

scrapeAllStarters();