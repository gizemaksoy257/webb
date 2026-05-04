const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Yapılandırması
// ÖNEMLİ: Render panelinde GEMINI_API_KEY değişkeninin tanımlı olduğundan emin ol.
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const systemInstructionText = `
Sen "Akıllı İstatistik" web sitesinin uzman asistanısın. 
Görevin: Kullanıcıların araştırma problemlerine göre aşağıdaki listeden en uygun testleri önermek.

TEST LİSTESİ:
- Farklar: t-testi, ANOVA, Kruskal-Wallis, Mann-Whitney U.
- İlişkiler: Pearson, Spearman, Ki-Kare.
- Varsayımlar: Levene Testi, Shapiro-Wilk.

KURALLAR:
1. Sadece istatistik sorularına cevap ver.
2. ANOVA önerirsen yanına Levene Testi'ni de ekle.
3. Yanıtlarını Analiz, Önerilen Testler ve Sepete Ekle bölümleriyle formatla.
`;

// Model ismini v1beta uyumluluğu için en sade haliyle tanımlıyoruz
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash-preview-04-17" 
});

// API Endpoint
app.post('/soru-sor', async (req, res) => {
    const { soru } = req.body;
    
    if (!soru) {
        return res.status(400).json({ hata: "Soru boş olamaz." });
    }

    try {
        // System instruction'ı doğrudan prompt'a ekleyerek 404 hatalarını bypass ediyoruz
        const prompt = `${systemInstructionText}\n\nKullanıcı Sorusu: ${soru}`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        res.json({ cevap: text });
    } catch (error) {
        console.error("Hata Detayı:", error);
        res.status(500).json({ hata: "Yapay zeka şu an cevap veremiyor. Logları kontrol edin." });
    }
});

app.get('/', (req, res) => {
    res.send("Akıllı İstatistik AI Sunucusu Aktif!");
});

app.listen(port, () => {
    console.log(`Sunucu ${port} portunda çalışıyor.`);
});
