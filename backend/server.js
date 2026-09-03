const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 5000;

app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.send("CodeChef Tracker Backend is running!");
});

// API test route
app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "API is working!"
    });
});

// CodeChef user profile route
app.get("/api/codechef/:username", async (req, res) => {
    try {
        const username = req.params.username;

        const response = await axios.get(
            `https://codechef.com/users/${username}`
        );

        res.json({
            success: true,
            username: username,
            message: "CodeChef profile fetched successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to fetch CodeChef profile"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});