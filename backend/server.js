const express = require("express");
const axios = require("axios");

const app = express();

const PORT = 5000;

app.use(express.json());


// --------------------------------------------------
// Health Check
// --------------------------------------------------

app.get("/", (req, res) => {
    res.json({
        message: "CodeChef Tracker Backend is running"
    });
});


// --------------------------------------------------
// Get Starters + DSA Monday Munch contests
// --------------------------------------------------

app.get("/api/contests", async (req, res) => {

    try {

        const response = await axios.get(
            "https://www.codechef.com/api/list/contests/all"
        );

        const data = response.data;

        let allContests = [];

        if (data.present_contests) {
            allContests.push(...data.present_contests);
        }

        if (data.future_contests) {
            allContests.push(...data.future_contests);
        }

        if (data.past_contests) {
            allContests.push(...data.past_contests);
        }


        const contests = allContests
            .filter((contest) => {

                const name =
                    contest.contest_name ||
                    contest.contestname ||
                    "";

                const code =
                    contest.contest_code ||
                    contest.contestCode ||
                    "";

                return (
                    name.toLowerCase().includes("starters") ||
                    name.toLowerCase().includes("monday munch") ||
                    code.startsWith("START") ||
                    code.startsWith("DSAMONDAY")
                );

            })
            .map((contest) => {

                const code =
                    contest.contest_code ||
                    contest.contestCode;

                const name =
                    contest.contest_name ||
                    contest.contestname;

                const startDate =
                    contest.contest_start_date_iso ||
                    contest.conteststartdate_iso ||
                    null;

                const endDate =
                    contest.contest_end_date_iso ||
                    contest.contestenddate_iso ||
                    null;

                let type = "Other";

                if (
                    name &&
                    name.toLowerCase().includes("starters")
                ) {
                    type = "Starters";
                }

                if (
                    name &&
                    name.toLowerCase().includes("monday munch")
                ) {
                    type = "DSA Monday Munch";
                }

                return {
                    code,
                    name,
                    type,
                    startDate,
                    endDate
                };

            });


        const uniqueContests = Array.from(
            new Map(
                contests.map((contest) => [
                    contest.code,
                    contest
                ])
            ).values()
        );


        uniqueContests.sort(
            (a, b) =>
                new Date(b.startDate || 0) -
                new Date(a.startDate || 0)
        );


        res.json({
            success: true,
            count: uniqueContests.length,
            contests: uniqueContests
        });

    } catch (error) {

        console.error(
            "Error fetching contests:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch CodeChef contests"
        });

    }

});


// --------------------------------------------------
// Get divisions of a contest
// --------------------------------------------------

app.get("/api/contests/:contestCode", async (req, res) => {

    const { contestCode } = req.params;


    if (!/^[A-Za-z0-9_-]+$/.test(contestCode)) {

        return res.status(400).json({
            success: false,
            message: "Invalid contest code"
        });

    }


    try {

        const response = await axios.get(
            `https://www.codechef.com/api/contests/${contestCode}`
        );

        const data = response.data;


        // --------------------------------------------------
        // Multi-division contest
        // --------------------------------------------------

        if (
            data.child_contests &&
            Object.keys(data.child_contests).length > 0
        ) {

            const divisions = Object.keys(
                data.child_contests
            ).map((division) => {

                const divisionNumber =
                    division.split("_")[1];

                const suffix =
                    String.fromCharCode(
                        64 + Number(divisionNumber)
                    );

                return {

                    id: division,

                    name:
                        `Division ${divisionNumber}`,

                    code:
                        `${contestCode}${suffix}`

                };

            });


            return res.json({

                success: true,

                contestCode,

                type: "multi-division",

                count: divisions.length,

                divisions

            });

        }


        // --------------------------------------------------
        // Single contest
        // --------------------------------------------------

        return res.json({

            success: true,

            contestCode,

            type: "single-division",

            divisions: []

        });

    } catch (error) {

        console.error(
            `Error fetching contest ${contestCode}:`,
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                `Failed to fetch contest ${contestCode}`

        });

    }

});


// --------------------------------------------------
// Get problems for a specific division
// --------------------------------------------------

app.get(
    "/api/contests/:contestCode/:division/problems",
    async (req, res) => {

        const {
            contestCode,
            division
        } = req.params;


        if (
            !/^[A-Za-z0-9_-]+$/.test(contestCode) ||
            !/^div_[1-4]$/.test(division)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid contest code or division"

            });

        }


        try {

            // ----------------------------------------------
            // Convert div_1 → A
            // div_2 → B
            // div_3 → C
            // div_4 → D
            // ----------------------------------------------

            const divisionNumber =
                Number(
                    division.split("_")[1]
                );

            const suffix =
                String.fromCharCode(
                    64 + divisionNumber
                );

            const actualContestCode =
                `${contestCode}${suffix}`;


            console.log(
                `Fetching problems for ${actualContestCode}`
            );


            const response = await axios.get(
                `https://www.codechef.com/api/contests/${actualContestCode}`
            );

            const data = response.data;


            if (!data.problems) {

                return res.json({

                    success: true,

                    contestCode,

                    division,

                    actualContestCode,

                    count: 0,

                    problems: []

                });

            }


            const problems =
                Object.values(data.problems)

                    .filter((problem) => {

                        return (
                            problem.category_name ===
                            "main"
                        );

                    })

                    .map((problem) => {

                        return {

                            code:
                                problem.code,

                            name:
                                problem.name,

                            successfulSubmissions:
                                problem.successful_submissions,

                            accuracy:
                                problem.accuracy,

                            problemUrl:
                                problem.problem_url

                        };

                    });


            res.json({

                success: true,

                contestCode,

                division,

                actualContestCode,

                count: problems.length,

                problems

            });

        } catch (error) {

            console.error(

                `Error fetching problems for ${contestCode} ${division}:`,

                error.message

            );


            res.status(500).json({

                success: false,

                message:
                    `Failed to fetch problems`

            });

        }

    }
);


// --------------------------------------------------
// Start Server
// --------------------------------------------------

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});