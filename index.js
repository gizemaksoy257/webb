const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors'); // Farklı sunuculardan erişim için gerekli

const app = express();

// Render, portu kendi belirler. Eğer Render'da değilsek 3000 portunu kullanır.
const port = process.env.PORT || 3000;

// 1. CORS Ayarı: Turhost'taki sitenin bu sunucuya bağlanmasına izin verir
app.use(cors());
app.use(express.json());

// 2. API Yapılandırması
// GÜVENLİK NOTU: API anahtarını kodun içine yazmak yerine 
// Render panelinden "Environment Variable" olarak ekleyeceğiz.
const apiKey = process.env.GEMINI_API_KEY || "AIzaSyBgBNofbl2Ko_WKkDlEsKrMgMAaFOX_hVM";
const genAI = new GoogleGenerativeAI(apiKey);

const systemInstruction = `
Sen "Akıllı İstatistik" web sitesinin uzman asistanısın. 
Görevin: Kullanıcıların araştırma problemlerine göre aşağıdaki test listesinden en uygun önerileri yapmak.

TEST LİSTESİ HATIRLATICI:
- Farklar için: t-testi, ANOVA, Kruskal-Wallis, Mann-Whitney U.
- İlişkiler için: Pearson, Spearman, Ki-Kare.
- Varsayımlar: Levene Testi (Varyanslar için), Shapiro-Wilk (Normallik için).
- Zaman Serisi: ARIMA, ADF Durağanlık.

KISITLAMALAR:
- Sadece istatistik ve veri bilimi sorularına cevap ver.
- Yemek, siyaset, hava durumu gibi konularda şu cevabı ver: "Üzgünüm, ben sadece istatistiksel test seçiminde size yardımcı olan bir yapay zekayım. Lütfen araştırmanızla veya verilerinizle ilgili bir soru sorun."
- ANOVA öneriyorsan yanına mutlaka Levene Testi'ni de sepete eklemesini söyle.

FORMAT:
Analiz: [Kullanıcının durumunu kısaca özetle]
Önerilen Testler: [Test isimlerini ve nedenlerini listele]
Sepete Ekle: [Kullanıcıya bu testleri satın alması için çağrıda bulun]
`;

const model = genAI.getGenerativeModel({ 
    model: "gemini-3-flash-preview",
    systemInstruction: systemInstruction,
    generationConfig: {
        temperature: 0.3,
    }
});

// API Endpoint
app.post('/soru-sor', async (req, res) => {
    const { soru } = req.body;
    try {
        const result = await model.generateContent(soru);
        const response = await result.response;
        res.json({ cevap: response.text() });
    } catch (error) {
        console.error("Hata:", error);
        res.status(500).json({ hata: "Yapay zeka şu an cevap veremiyor." });
    }
});

// Basit bir ana sayfa mesajı (Sunucun çalışıp çalışmadığını anlamak için)
app.get('/', (req, res) => {
    res.send("Akıllı İstatistik AI Sunucusu Çalışıyor!");
});

app.listen(port, () => {
    console.log(`Sunucu ${port} portunda aktif.`);
});