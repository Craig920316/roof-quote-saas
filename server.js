const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 3000;

// Force JSON first, then static files
app.use(express.json());

// Serve static files with explicit HTML handling and no caching
app.use(express.static("public", {
  setHeaders: (res, path) => {
    console.log("Serving file:", path);
    if (path.endsWith(".html")) {
      res.setHeader("Content-Type", "text/html; charset=UTF-8");
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
      console.log("Set Content-Type: text/html; charset=UTF-8 for", path);
    } else {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    }
  }
}));

// Serve index.html explicitly at the root URL with no caching
app.get("/", (req, res) => {
  console.log("Root request received");
  res.setHeader("Content-Type", "text/html; charset=UTF-8");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.sendFile(path.join(__dirname, "public", "index.html"), (err) => {
    if (err) {
      console.error("Error serving index.html:", err);
      res.status(500).send("Server error: " + err.message);
    }
  });
});

const leadsFile = "leads.json";
if (!fs.existsSync(leadsFile)) {
  fs.writeFileSync(leadsFile, JSON.stringify([], null, 2));
}

app.post("/submit-lead", (req, res) => {
  const leads = JSON.parse(fs.readFileSync(leadsFile));
  leads.push(req.body);
  fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2));
  res.send("Lead saved");
});

app.get("/admin", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=UTF-8");
  res.sendFile(path.join(__dirname, "public", "admin.html"), (err) => {
    if (err) {
      console.error("Error serving admin.html:", err);
      res.status(500).send("Server error: " + err.message);
    }
  });
});

app.get("/leads", (req, res) => {
  const leads = JSON.parse(fs.readFileSync(leadsFile));
  res.json(leads);
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