const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 3000;

app.use(express.json());

// Force HTML content type and disable caching for HTML files
app.use(express.static("public", {
  setHeaders: (res, path) => {
    if (path.endsWith(".html")) {
      res.setHeader("Content-Type", "text/html; charset=UTF-8");
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private"); // Disable caching
      console.log("Serving HTML file with Content-Type: text/html; charset=UTF-8, no caching");
    }
  }
}));

// Serve index.html explicitly at the root URL with no caching
app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=UTF-8");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private"); // Disable caching
  res.sendFile(path.join(__dirname, "public", "index.html"), (err) => {
    if (err) {
      console.error("Error serving index.html:", err);
      res.status(500).send("Server error: " + err.message);
    }
  });
});

const pricingFile = "pricing.json";
const defaultPricing = {
  tiles: { asphalt: 2, metal: 5, tile: 7 },
  gutter: { none: 0, basic: 10 },
  trim: { none: 0, standard: 5 }
};

if (!fs.existsSync(pricingFile)) {
  fs.writeFileSync(pricingFile, JSON.stringify({ "default": defaultPricing }, null, 2));
}

app.get("/pricing/:companyId", (req, res) => {
  const data = JSON.parse(fs.readFileSync(pricingFile));
  const companyId = req.params.companyId;
  res.json(data[companyId] || data["default"]);
});

app.post("/pricing/:companyId", (req, res) => {
  const data = JSON.parse(fs.readFileSync(pricingFile));
  const companyId = req.params.companyId;
  data[companyId] = req.body;
  fs.writeFileSync(pricingFile, JSON.stringify(data, null, 2));
  res.send("Pricing updated");
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));