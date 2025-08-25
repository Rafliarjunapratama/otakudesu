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

    // Thumbnail (cek beberapa kemungkinan selector)
    let thumbnail =
      $(".fotoanime img").attr("src") ||
      $(".fotoanime img").attr("data-src") ||
      $(".thumb img").attr("src") ||
      $(".thumb img").attr("data-src");

    if (thumbnail) {
      thumbnail = thumbnail.replace(/-\d+x\d+(?=\.(jpg|jpeg|png))/i, "");
    }

    // Sinopsis
    const sinopsis = $(".sinopc").text().trim();

    // Info tambahan
    const infoEpisode = $(".infozingle p:contains('Episode')")
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
      let title = $(el).find("a").text().trim();
      const tglEp = $(el).find(".zeebr").text().trim();
      const linkEp = $(el).find("a").attr("href");

      // skip batch
      if (linkEp && linkEp.includes("/batch/")) return;

      // bersihkan judul
      if (judul) {
        const regex = new RegExp(judul, "gi");
        title = title.replace(regex, "").trim();
      }
      title = title.replace(/Subtitle Indonesia/gi, "").trim();

      // kalau ada "Episode X" pakai itu aja
      const epMatch = title.match(/Episode\s*\d+/i);
      if (epMatch) {
        title = epMatch[0];
      }

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

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});


//api zerochan web
app.get("/api/zerochan/search", async (req, res) => {
  const query = req.query.q || "anime";
  const url = `https://www.zerochan.net/search?q=${encodeURIComponent(query)}`;

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    );
    await page.goto(url, { waitUntil: "networkidle2" });

    const data = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("#thumbs2 li")).map((el) => {
        const titleEl = el.querySelector("p a");
        const imgEl = el.querySelector(".thumb img");
        const favEl = el.querySelector(".fav b");

        const title = titleEl?.innerText.trim() || "";
        const link = titleEl ? "https://www.zerochan.net" + titleEl.getAttribute("href") : "";
        const thumbnail = imgEl?.getAttribute("data-src") || imgEl?.src || "";
        const fav = favEl ? parseInt(favEl.innerText.trim(), 10) : 0;

        // Hapus simbol di judul
        const cleanTitle = title.replace(/[:\-|"]/g, "").replace(/\s+/g, " ");

        return { title: cleanTitle, link, thumbnail, fav };
      });
    });

    await browser.close();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Gagal scraping Zerochan", detail: err.message });
  }
});







const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));
