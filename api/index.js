import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import cors from "cors";
import { gotScraping } from "got-scraping";
import puppeteer from "puppeteer";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.redirect("/api/anime");
});

// API On-Going
app.get("/api/anime", async (req, res) => {
  try {
    const data = [];
    const totalPages = 5;
    for (let page = 1; page <= totalPages; page++) {
      const url = `https://otakudesu.best/ongoing-anime/page/${page}/`;
      const html = await fetch(url).then(r => r.text());
      const $ = cheerio.load(html);

      $("li .detpost").each((i, el) => {
        const rawJudul = $(el).find(".thumb h2.jdlflm").text().trim();
        data.push({
          episode: $(el).find(".epz").text().trim(),
          hari: $(el).find(".epztipe").text().trim(),
          tanggal: $(el).find(".newnime").text().trim(),
          link: $(el).find(".thumb a").attr("href"),
          thumbnail: $(el).find(".thumb img").attr("src"),
          judul: rawJudul
          .replace(/[^a-zA-Z0-9\s]/g, "")
          .replace(/\s+/g, " "),
        });
      });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Gagal scraping", detail: err.message });
  }
});

// API Complete
app.get("/api/anime/complete", async (req, res) => {
  try {
    const url = "https://otakudesu.best/complete-anime/";
    const html = await fetch(url).then(r => r.text());
    const $ = cheerio.load(html);

    const data = [];
    $("li .detpost").each((i, el) => {
      const rawJudul = $(el).find(".thumb h2.jdlflm").text().trim();
      data.push({
        episode: $(el).find(".epz").text().trim(),
        rating: $(el).find(".epztipe").text().trim(),
        tanggal: $(el).find(".newnime").text().trim(),
        link: $(el).find(".thumb a").attr("href"),
        thumbnail: $(el).find(".thumb img").attr("src"),
        judul: rawJudul
          .replace(/[^a-zA-Z0-9\s]/g, "")
          .replace(/\s+/g, " "),
      });
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Gagal scraping complete anime", detail: err.message });
  }
});


// API Complete by Page
app.get("/api/anime/complete/page/:page", async (req, res) => {
  try {
    const page = req.params.page;
    const url = `https://otakudesu.best/complete-anime/page/${page}/`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
      },
    });
    if (!response.ok) throw new Error(`Fetch gagal, status ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);

    const data = [];
    $("li .detpost").each((i, el) => {
      const rawTitle = $(el).find(".thumb h2.jdlflm").text().trim();
      data.push({
        episode: $(el).find(".epz").text().trim(),
        hari: $(el).find(".epztipe").text().trim(),
        tanggal: $(el).find(".newnime").text().trim(),
        link: $(el).find(".thumb a").attr("href"),
        thumbnail: $(el).find(".thumb img").attr("src"),
        judul: rawTitle
          .replace(/[^a-zA-Z0-9\s]/g, "")
          .replace(/\s+/g, " "),
      });
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: "Gagal scraping complete anime",
      detail: err.message,
    });
  }
});

app.get("/api/anime/detail", async (req, res) => {
  try {
    const { link } = req.query;
    if (!link) {
      return res.status(400).json({ error: "Missing link" });
    }

    const response = await fetch(link);
    const body = await response.text();
    const $ = cheerio.load(body);

    // Judul
    const judul = $(".jdlrx").text().trim();

    // Thumbnail (cek beberapa kemungkinan selector)
    let thumbnail =
      $(".fotoanime img").attr("src") ||
      $(".fotoanime img").attr("data-src") ||
      $(".thumb img").attr("src") ||
      $(".thumb img").attr("data-src");

    if (thumbnail) {
      // hapus suffix -WxH hanya jika ada
      thumbnail = thumbnail.replace(/-\d+x\d+(?=\.(jpg|jpeg|png))/i, "");
    }

    // Sinopsis
    const sinopsis = $(".sinopc").text().trim();

    // Info tambahan
    const episode = $(".infozingle p:contains('Episode')")
      .text()
      .replace("Episode:", "")
      .trim();
    const hari = $(".infozingle p:contains('Hari')")
      .text()
      .replace("Hari:", "")
      .trim();
    const tanggal = $(".infozingle p:contains('Tanggal')")
      .text()
      .replace("Tanggal:", "")
      .trim();

    // Daftar episode
    const episodeList = [];
    $(".episodelist ul li").each((i, el) => {
      const title = $(el).find("a").text().trim();
      const tanggal = $(el).find(".zeebr").text().trim();
      const linkEp = $(el).find("a").attr("href");
      episodeList.push({ title, tanggal, link: linkEp });
    });

    res.json({
      judul,
      thumbnail,
      sinopsis,
      episode: episodeList,
      info: { episode, hari, tanggal, link },
    });
  } catch (err) {
    console.error("Scraping error:", err);
    res.status(500).json({ error: "Gagal mengambil data anime" });
  }
});


//api zeochan web
//api zeochan web
app.get("/api/zerochan/search", async (req, res) => {
  const query = req.query.q || "anime";
  const url = `https://www.zerochan.net/search?q=${encodeURIComponent(query)}`;

  try {
    // ⬇️ Ubah bagian ini
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"] // << tambah ini
    });






const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));
