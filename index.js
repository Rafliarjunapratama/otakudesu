import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();

// Redirect dari / ke /api/anime
app.get("/", (req, res) => {
  res.redirect("/api/anime");
});

app.get("/api/anime", async (req, res) => {
  try {
    const url = "https://otakudesu.best/";
    const html = await fetch(url).then(r => r.text());
    const $ = cheerio.load(html);

    const data = [];

    $("li .detpost").each((i, el) => {
      data.push({
        episode: $(el).find(".epz").text().trim(),
        hari: $(el).find(".epztipe").text().trim(),
        tanggal: $(el).find(".newnime").text().trim(),
        link: $(el).find(".thumb a").attr("href"),
        thumbnail: $(el).find(".thumb img").attr("src"),
        judul: $(el).find(".thumb h2.jdlflm").text().trim(),
      });
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server jalan di http://localhost:3000"));
