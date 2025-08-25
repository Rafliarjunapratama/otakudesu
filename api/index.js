import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import cors from "cors";
import puppeteer from "puppeteer";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.redirect("/api/anime");
});

// ==========================
// API On-Going Anime
// ==========================
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

// ==========================
// API Complete Anime
// ==========================
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

// ==========================
// API Anime Detail
// ==========================
app.get("/api/anime/detail", async (req, res) => {
  try {
    const { link } = req.query;
    if (!link) {
      return res.status(400).json({ error: "Missing link" });
    }

    const response = await fetch(link);
    const body = await response.text();
    const $ = cheerio.load(body);

    const judul = $(".jdlrx").text().trim();
    let thumbnail = $(".fotoanime img").attr("src") || $(".thumb img").attr("src");
    if (thumbnail) {
      thumbnail = thumbnail.replace(/-\d+x\d+(?=\.(jpg|jpeg|png))/i, "");
    }
    const sinopsis = $(".sinopc").text().trim();

    const episodeList = [];
    $(".episodelist ul li").each((i, el) => {
      let title = $(el).find("a").text().trim();
      const tanggal = $(el).find(".zeebr").text().trim();
      const linkEp = $(el).find("a").attr("href");

      if (linkEp && linkEp.includes("/batch/")) return;
      if (judul) {
        const regex = new RegExp(judul, "gi");
        title = title.replace(regex, "").trim();
      }
      title = title.replace(/Subtitle Indonesia/gi, "").trim();

      const epMatch = title.match(/Episode\s*\d+/i);
      if (epMatch) title = epMatch[0];

      episodeList.push({ title, tanggal, link: linkEp });
    });

    res.json({ judul, thumbnail, sinopsis, episode: episodeList, info: { link } });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data anime", detail: err.message });
  }
});

// ==========================
// API Detail Video
// ==========================
app.get("/api/anime/detail/video", async (req, res) => {
  try {
    const { link } = req.query;
    if (!link) return res.status(400).json({ error: "Missing link" });

    const response = await fetch(link);
    const body = await response.text();
    const $ = cheerio.load(body);

    const iframeSrc = $("#embed_holder iframe").attr("src");
    if (!iframeSrc) return res.status(404).json({ error: "Video tidak ditemukan" });

    res.json({ video: iframeSrc });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil link video", detail: err.message });
  }
});

// ==========================
// API Zerochan Search
// ==========================
app.get("/api/zerochan/search", async (req, res) => {
  const query = req.query.q || "anime";
  const searchUrl = `https://www.zerochan.net/search?q=${encodeURIComponent(query)}`;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu"
      ]
    });

    const page = await browser.newPage();
    await page.goto(searchUrl, { waitUntil: "domcontentloaded" });

    const currentUrl = page.url();
    let data = [];

    if (!currentUrl.includes("/search")) {
      data = await page.evaluate(() =>
        Array.from(document.querySelectorAll(".thumb img")).map((img) => {
          const thumbnail = img.getAttribute("data-src") || img.src || "";
          const link = img.parentElement?.getAttribute("href")
            ? "https://www.zerochan.net" + img.parentElement.getAttribute("href")
            : "";
          const title = img.alt || "";
          return { title, link, thumbnail, fav: 0 };
        })
      );
    } else {
      data = await page.evaluate(() =>
        Array.from(document.querySelectorAll("#thumbs2 li")).map((el) => {
          const titleEl = el.querySelector("p a");
          const imgEl = el.querySelector(".thumb img");
          const favEl = el.querySelector(".fav b");

          const title = titleEl?.innerText.trim() || "";
          const link = titleEl ? "https://www.zerochan.net" + titleEl.getAttribute("href") : "";
          const thumbnail = imgEl?.getAttribute("data-src") || imgEl?.src || "";
          const fav = favEl ? parseInt(favEl.innerText.trim(), 10) : 0;

          return { title, link, thumbnail, fav };
        })
      );
    }

    await browser.close();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Gagal scraping Zerochan", detail: err.message });
  }
});

// ==========================
// START SERVER (1x saja!)
// ==========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server jalan di http://localhost:${PORT}`));
