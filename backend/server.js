const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = 5000;

app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.send("CodeChef Tracker Backend is running!");
});

// Test route
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
            `https://www.codechef.com/users/${username}`,
            {
                headers: {
                    "User-Agent": "Mozilla/5.0"
                }
            }
        );

        const $ = cheerio.load(response.data);

        // Rating
        const rating = $(".rating-number").first().text().trim();

        // Stars
        const stars = $(".rating-star").first().text().trim();

        // Rank
        const ranks = [];

        $(".rating-ranks a").each((index, element) => {
            const rank = $(element).text().trim();

            if (rank) {
                ranks.push(rank);
            }
        });

        const globalRank = ranks.length > 0 ? ranks[0] : "";
        const countryRank = ranks.length > 1 ? ranks[1] : "";

        res.json({
            success: true,
            username: username,
            rating: rating,
            stars: stars,
            globalRank: globalRank,
            countryRank: countryRank
        });

    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            success: false,
            message: "Unable to fetch CodeChef profile"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});