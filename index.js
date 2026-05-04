const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";

const systemInstruction = `
Sen "Akıllı İstatistik" web sitesinin uzman asistanısın. 
Görevin: Kullanıcıların araştırma problemlerine göre en uygun istatistiksel testleri önermek.

TEST LİSTESİ:
- Farklar için: t-testi, ANOVA, Kruskal-Wallis, Mann-Whitney U.
- İlişkiler için: Pearson, Spearman, Ki-Kare.
- Varsayım testleri: Levene Testi (varyans homojenliği), Shapiro-Wilk (normallik).
- Zaman Serisi: ARIMA, ADF Durağanlık.
- Ölçek: Cronbach Alpha, AFA, DFA, YEM.

KURALLAR:
1. Sadece istatistik ve veri bilimi sorularına cevap ver.
2. Alakasız sorularda: "Üzgünüm, ben sadece istatistiksel test seçiminde yardımcı olan bir yapay zekayım."
3. ANOVA önerirsen yanına mutlaka Levene Testi'ni de ekle.
4. Önce normallik varsayımını kontrol et.

FORMAT:
Analiz: [Kullanıcının durumunu kısaca özetle]
Önerilen Testler: [Test isimlerini ve nedenlerini listele]
Sepete Ekle: [Bu testleri sipariş etmesi için yönlendir]
`;

app.post('/soru-sor', async (req, res) => {
    const { soru } = req.body;

    if (!soru) {
        return res.status(400).json({ hata: "Soru boş olamaz." });
    }

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ hata: "API key tanımlı değil." });
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

        const body = {
            contents: [
                {
                    role: "user",
                    parts: [{ text: systemInstruction + "\n\nKullanıcı Sorusu: " + soru }]
                }
            ],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 1024
            }
        };

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini Hata:", JSON.stringify(data));
            return res.status(500).json({ hata: "Gemini API hatası: " + (data.error?.message || "Bilinmeyen hata") });
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Cevap alınamadı.";
        res.json({ cevap: text });

    } catch (error) {
        console.error("Hata:", error);
        res.status(500).json({ hata: "Sunucu hatası: " + error.message });
    }
});

app.get('/', (req, res) => {
    res.send("Akıllı İstatistik AI Sunucusu Aktif!");
});

app.listen(port, () => {
    console.log(`Sunucu ${port} portunda çalışıyor.`);
});
