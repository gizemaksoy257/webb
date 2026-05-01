const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API KEY - Render Environment Variables ile aynı olmalı
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const systemInstructionText = `
Sen "Akıllı İstatistik" web sitesinin uzman asistanısın. 
Görevin: Kullanıcıların araştırma problemlerine göre uygun istatistiksel testleri önermek.

TEST LİSTESİ:
- Farklar: t-testi, ANOVA, Kruskal-Wallis, Mann-Whitney U.
- İlişkiler: Pearson, Spearman, Ki-Kare.
- Varsayımlar: Levene Testi, Shapiro-Wilk.

KISITLAMALAR:
- Sadece istatistik ve veri bilimi sorularına cevap ver. Diğer konularda reddet.
- ANOVA öneriyorsan Levene Testi'ni de ekle.
`;

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash"
});

// API Endpoint
app.post("/soru-sor", async (req, res) => {
  const { soru } = req.body;

  try {
    const prompt = `${systemInstructionText}\n\nKullanıcı Sorusu: ${soru}`;

    // YENİ SDK'ya göre doğru kullanım
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    });

    res.json({ cevap: result.response.text() });

  } catch (error) {
    console.error("Hata Detayı:", error);
    res.status(500).json({
      hata: "Yapay zeka şu an cevap veremiyor."
    });
  }
});

app.get("/", (req, res) => {
  res.send("Akıllı İstatistik AI Sunucusu Çalışıyor!");
});

app.listen(port, () => {
  console.log(`Sunucu ${port} portunda aktif.`);
});
