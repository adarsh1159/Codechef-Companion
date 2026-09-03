const axios = require("axios");
const fs = require("fs");
const path = require("path");

const outputFile = path.join(
    __dirname,
    "data",
    "monday-munch.json"
);

const url =
    "https://www.codechef.com/api/practice/syllabus/dsa-challenges?roadmapSlug=";

const axiosConfig = {
    headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
    },
    timeout: 15000
};

async function scrapeMondayMunch() {

    console.log("");
    console.log("==============================================");
    console.log("       CODECHEF MONDAY MUNCH SCRAPER");
    console.log("==============================================");

    try {

        console.log("Fetching Monday Munch data...");

        const response =
            await axios.get(
                url,
                axiosConfig
            );

        const data =
            response.data;

        const modules =
            data.modules || [];

        const challenges = [];

        for (const module of modules) {

            const submodules =
                module.submodules || [];

            for (
                const submodule of submodules
            ) {

                const problems =
                    submodule.problems_with_status || [];

                const formattedProblems =
                    problems.map(
                        (problem) => {

                            return {
                                code:
                                    problem.code,

                                name:
                                    problem.name,

                                difficulty:
                                    problem.difficulty_rating
                                        ? Number(
                                            problem.difficulty_rating
                                        )
                                        : null,

                                problemUrl:
                                    `https://www.codechef.com/problems/${problem.code}`
                            };
                        }
                    );

                challenges.push({

                    name:
                        submodule.name || "",

                    contestCode:
                        submodule.contest_code || "",

                    startDate:
                        submodule.start_date || "",

                    totalProblems:
                        submodule.total_problems || 0,

                    problems:
                        formattedProblems
                });
            }
        }

        const output = {

            updatedAt:
                new Date().toISOString(),

            count:
                challenges.length,

            challenges
        };

        fs.writeFileSync(
            outputFile,
            JSON.stringify(
                output,
                null,
                4
            ),
            "utf8"
        );

        console.log("");
        console.log(
            `✓ ${challenges.length} Monday Munch challenges found`
        );

        console.log(
            `✓ Saved to: ${outputFile}`
        );

        console.log("");
        console.log("==============================================");
        console.log("SCRAPING FINISHED");
        console.log("==============================================");

    } catch (error) {

        console.log("");
        console.log(
            "✗ Failed to fetch Monday Munch data"
        );

        if (error.response) {

            console.log(
                `Status: ${error.response.status}`
            );
        }

        console.log(
            `Error: ${error.message}`
        );
    }
}

scrapeMondayMunch();