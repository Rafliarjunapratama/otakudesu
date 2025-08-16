import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.redirect("/api/anime");
});

// API terbaru update
app.get("/api/anime", async (req, res) => {
  try {
    const data = [];
    const totalPages = 5; // jumlah halaman On-Going

    for (let page = 1; page <= totalPages; page++) {
      const url = `https://otakudesu.best/ongoing-anime/page/${page}/`;
      const html = await fetch(url).then(r => r.text());
      const $ = cheerio.load(html);

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
    }

    console.log(`Total anime scraped: ${data.length}`);
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

// API jadwal anime// API Jadwal Anime
app.get("/api/anime/jadwal", async (req, res) => {
  try {
    const data = [];
    const totalPages = 5; // jumlah halaman On-Going

    for (let page = 1; page <= totalPages; page++) {
      const url = `https://otakudesu.best/ongoing-anime/page/${page}/`;
      const html = await fetch(url).then(r => r.text());
      const $ = cheerio.load(html);

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
    }

    console.log(`Total anime scraped: ${data.length}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Gagal scraping", detail: err.message });
  }
});


  app.get("/api/anime/complete/page/:page", async (req, res) => {
  try {
    const page = req.params.page; // ambil nomor halaman
    const url = `https://otakudesu.best/complete-anime/page/${page}/`;
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

app.post("/api/anime/info", async (req, res) => {
  try {
    const { link } = req.body;
    if (!link) return res.status(400).json({ error: "Missing link" });

    // Ambil HTML dari link
    const html = await fetch(link).then(r => r.text());
    const $ = cheerio.load(html);

    // Ambil data detail anime
    const judul = $(".jdlrx h1").text().trim();
    const thumbnail = $(".fotoanime img").attr("src");
    const sinopsis = $(".sinopc").text().trim();

    const episode = [];
    $(".episodelist li").each((i, el) => {
      episode.push({
        title: $(el).find("a").text().trim(),
        link: $(el).find("a").attr("href")
      });
    });

    res.json({ judul, thumbnail, sinopsis, episode });
  } catch (err) {
    res.status(500).json({ error: "Gagal scraping info anime", detail: err.message });
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));
