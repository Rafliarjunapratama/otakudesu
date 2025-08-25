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

    const response = await fetch(link, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
      },
    });
    if (!response.ok) throw new Error(`Fetch gagal ${response.status}`);

    const body = await response.text();
    const $ = cheerio.load(body);

    // Judul
    const judul = $(".jdlrx").text().trim();

    // Thumbnail
    let thumbnail =
      $(".fotoanime img").attr("src") ||
      $(".fotoanime img").attr("data-src") ||
      $(".thumb img").attr("src") ||
      $(".thumb img").attr("data-src") ||
      "";
    if (thumbnail) thumbnail = thumbnail.replace(/-\d+x\d+(?=\.(jpg|jpeg|png))/i, "");

    // Sinopsis
    const sinopsis = $(".sinopc").text().trim();

    // Info tambahan
    const infoEpisode = $(".infozingle p:contains('Episode')").text().replace("Episode:", "").trim();
    const hari = $(".infozingle p:contains('Hari')").text().replace("Hari:", "").trim();
    const tanggal = $(".infozingle p:contains('Tanggal')").text().replace("Tanggal:", "").trim();

    // Daftar episode
    const episodeList = [];
    $(".episodelist ul li").each((i, el) => {
      const aTag = $(el).find("a");
      if (!aTag.length) return;

      const linkEp = aTag.attr("href");
      // Skip batch dan episode lengkap
      if (!linkEp || linkEp.includes("/batch/") || linkEp.includes("/lengkap/")) return;

      let title = aTag.text().trim();
      const tglEp = $(el).find(".zeebr").text().trim();

      // Bersihkan judul anime dari episode
      if (judul) title = title.replace(new RegExp(judul, "gi"), "").trim();
      title = title.replace(/Subtitle Indonesia/gi, "").trim();

      // Ambil "Episode X" saja kalau ada
      const epMatch = title.match(/Episode\s*\d+/i);
      if (epMatch) title = epMatch[0];

      episodeList.push({ title, tanggal: tglEp, link: linkEp });
    });

    res.json({
      judul,
      thumbnail,
      sinopsis,
      episode: episodeList,
      info: { episode: infoEpisode, hari, tanggal, link },
    });
  } catch (err) {
    console.error("Scraping error:", err);
    res.status(500).json({ error: "Gagal mengambil data anime", detail: err.message });
  }
});


app.get("/api/anime/detail/video", async (req, res) => {
  try {
    const { link } = req.query;
    if (!link) return res.status(400).json({ error: "Missing link" });

    const response = await fetch(link);
    const body = await response.text();
    const $ = cheerio.load(body);

    // Ambil src dari iframe
    const iframeSrc = $("iframe").attr("src");

    if (!iframeSrc) {
      return res.status(404).json({ error: "Video iframe not found" });
    }

    res.json({ video: iframeSrc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});




//api zerochan web
app.get("/api/zerochan/search", async (req, res) => {
  const query = req.query.q || "anime";
  const url = `https://www.zerochan.net/search?q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 15000 // timeout 15 detik
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    const data = $("#thumbs2 li").map((i, el) => {
      const titleEl = $(el).find("p a");
      const imgEl = $(el).find(".thumb img");
      const favEl = $(el).find(".fav b");

      const title = titleEl.text().trim();
      const link = "https://www.zerochan.net" + titleEl.attr("href");
      const thumbnail = imgEl.attr("data-src") || imgEl.attr("src");
      const fav = parseInt(favEl.text().trim(), 10) || 0;

      return { title, link, thumbnail, fav };
    }).get();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Gagal scraping Zerochan", detail: err.message });
  }
});





app.get("/api/zerochan/characters", async (req, res) => {
  const query = req.query.q || "Kijin Gentoushou";
  const url = `https://www.zerochan.net/${encodeURIComponent(query)}`;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    );
    await page.goto(url, { waitUntil: "networkidle2" });

    const data = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".carousel.thumbs li")).map((el) => {
        const aEl = el.querySelector("a");
        const imgEl = el.querySelector(".thumb");
        const nameEl = el.querySelector("p.character");
        const countEl = el.querySelector("i");

        const link = aEl ? "https://www.zerochan.net" + aEl.getAttribute("href") : "";
        const name = nameEl ? nameEl.innerText.trim() : "";
        let thumbnail = "";
        if (imgEl) {
          thumbnail = imgEl.getAttribute("data-src") 
            || imgEl.style.backgroundImage.replace(/url\(["']?(.*?)["']?\)/, "$1");
        }
        const entries = countEl ? parseInt(countEl.innerText.trim(), 10) : 0;

        return { name, link, thumbnail, entries };
      });
    });

    await browser.close();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Gagal scraping characters", detail: err.message });
  }
});





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));
