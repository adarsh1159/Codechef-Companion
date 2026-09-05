const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ============================================
// DATA FILES
// ============================================

const startersFile = path.join(
    __dirname,
    "data",
    "starters.json"
);

const mondayMunchFile = path.join(
    __dirname,
    "data",
    "monday-munch.json"
);

// ============================================
// LOAD STARTERS DATA
// ============================================

function loadStarters() {
    try {
        const file = fs.readFileSync(
            startersFile,
            "utf8"
        );

        return JSON.parse(file);
    } catch (error) {
        console.error(
            "Failed to read starters.json:",
            error.message
        );

        return null;
    }
}

// ============================================
// LOAD MONDAY MUNCH DATA
// ============================================

function loadMondayMunch() {
    try {
        const file = fs.readFileSync(
            mondayMunchFile,
            "utf8"
        );

        return JSON.parse(file);
    } catch (error) {
        console.error(
            "Failed to read monday-munch.json:",
            error.message
        );

        return null;
    }
}

// ============================================
// GET ALL STARTER CONTESTS
// ============================================

app.get("/api/contests", (req, res) => {
    const data = loadStarters();

    if (!data) {
        return res.status(500).json({
            success: false,
            message: "Could not load starters data"
        });
    }

    const contests = Object.values(
        data.contests || {}
    );

    res.json({
        success: true,
        count: contests.length,
        contests
    });
});

// ============================================
// GET ONE STARTER CONTEST
// ============================================

app.get(
    "/api/contests/:contestCode",
    (req, res) => {
        const contestCode =
            req.params.contestCode.toUpperCase();

        const data = loadStarters();

        if (!data) {
            return res.status(500).json({
                success: false,
                message: "Could not load starters data"
            });
        }

        const contest =
            data.contests?.[contestCode];

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: "Contest not found"
            });
        }

        const divisions = Object.entries(
            contest.divisions || {}
        ).map(([id, division]) => {
            return {
                id,
                name: division.division,
                code: division.contestTag
            };
        });

        res.json({
            success: true,
            contestCode,
            count: divisions.length,
            divisions
        });
    }
);

// ============================================
// GET PROBLEMS OF A DIVISION
// ============================================

app.get(
    "/api/contests/:contestCode/:division/problems",
    (req, res) => {
        const contestCode =
            req.params.contestCode.toUpperCase();

        const division =
            req.params.division;

        const data = loadStarters();

        if (!data) {
            return res.status(500).json({
                success: false,
                message: "Could not load starters data"
            });
        }

        const contest =
            data.contests?.[contestCode];

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: "Contest not found"
            });
        }

        const divisionData =
            contest.divisions?.[division];

        if (!divisionData) {
            return res.status(404).json({
                success: false,
                message: "Division not found"
            });
        }

        const problems =
            divisionData.problems || [];

        res.json({
            success: true,
            contestCode,
            division,
            contestTag:
                divisionData.contestTag,
            count: problems.length,
            problems
        });
    }
);

// ============================================
// GET MONDAY MUNCH
// ============================================

app.get(
    "/api/monday-munch",
    (req, res) => {
        const data = loadMondayMunch();

        if (!data) {
            return res.status(500).json({
                success: false,
                message:
                    "Could not load Monday Munch data"
            });
        }

        res.json({
            success: true,
            count: data.count || 0,
            challenges:
                data.challenges || []
        });
    }
);

// ============================================
// ROOT ROUTE
// ============================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message:
            "CodeChef Companion backend is running"
    });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log("");
    console.log(
        "===================================="
    );
    console.log(
        "CodeChef Companion Backend"
    );
    console.log(
        `Server running on port ${PORT}`
    );
    console.log(
        "Using local JSON data"
    );
    console.log(
        "===================================="
    );
    console.log("");
});