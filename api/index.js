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

// API Complete by Page
app.get("/api/anime/complete/page/:page", async (req, res) => {
  try {
    const page = req.params.page;
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
    res.status(500).json({ error: "Gagal scraping complete anime", detail: err.message });
  }
});

// API Detail Anime
app.post("/api/anime/detail", async (req, res) => {
  try {
    const { link } = req.body;
    if (!link) {
      return res.status(400).json({ error: "Missing link" });
    }

    const html = await fetch(link).then(r => r.text());
    const $ = cheerio.load(html);

    // Thumbnail
    const thumbnail = $(".fotoanime img").attr("src");

    // Info (Judul, Japanese, Produser, dll)
    const info = {};
    $(".infozin .infozingle p").each((_, el) => {
      const label = $(el).find("b").text().replace(":", "").trim();
      const value = $(el).text().replace(label + ":", "").trim();
      if (label) info[label] = value;
    });

    // Genre (khusus karena ada <a>)
    info["Genre"] = [];
    $(".infozin .infozingle p").find("a").each((_, el) => {
      info["Genre"].push($(el).text().trim());
    });

    // Sinopsis
    let sinopsis = "";
    $(".sinopc p").each((_, el) => {
      sinopsis += $(el).text().trim() + "\n";
    });
    sinopsis = sinopsis.trim();

    // Episode List
    const episodes = [];
    $(".episodelist ul li").each((_, el) => {
      const title = $(el).find("a").text().trim();
      const linkEp = $(el).find("a").attr("href");
      const tanggal = $(el).find(".zeebr").text().trim();
      episodes.push({ title, link: linkEp, tanggal });
    });

    res.json({
      thumbnail,
      info,
      sinopsis,
      episodes
    });

  } catch (err) {
    res.status(500).json({ error: "Gagal scraping detail anime", detail: err.message });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));
