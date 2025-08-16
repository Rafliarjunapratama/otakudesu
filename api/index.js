import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.redirect("/api/anime");
});

// API terbaru update
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
    res.status(500).json({ error: "Gagal scraping", detail: err.message });
  }
});

// API anime complete
app.get("/api/anime/complete", async (req, res) => {
  try {
    const url = "https://otakudesu.best/complete-anime/";
    const html = await fetch(url).then(r => r.text());
    const $ = cheerio.load(html);

    const data = [];

    $("li .detpost").each((i, el) => {
      data.push({
        episode: $(el).find(".epz").text().trim(),
        rating: $(el).find(".epztipe").text().trim(),
        tanggal: $(el).find(".newnime").text().trim(),
        link: $(el).find(".thumb a").attr("href"),
        thumbnail: $(el).find(".thumb img").attr("src"),
        judul: $(el).find(".thumb h2.jdlflm").text().trim(),
      });
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Gagal scraping complete anime", detail: err.message });
  }
});

// API jadwal anime
app.get("/api/anime/jadwal", async (req, res) => {
  try {
    const url = "https://otakudesu.best/jadwal-rilis/";
    const html = await fetch(url).then(r => r.text());
    const $ = cheerio.load(html);

    const jadwal = {};

    $(".kgjdwl318").each((i, el) => {
      const hari = $(el).find("h2").text().trim();
      const listAnime = [];

      $(el).find("li").each((j, item) => {
        listAnime.push({
          judul: $(item).find("a").text().trim(),
          link: $(item).find("a").attr("href"),
        });
      });

      jadwal[hari] = listAnime;
    });

    res.json(jadwal);
  } catch (err) {
    res.status(500).json({ error: "Gagal scraping jadwal anime", detail: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));
