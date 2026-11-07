# Erzurum Sofrası – GitHub Pages'e hazır 9 sayfa

Bu paket **kurulum gerektirmez**. Python, BAT ve PowerShell dosyası yoktur.

## Bilgisayarda kontrol (en kolay)

1. ZIP içeriğini bir klasöre çıkarın.
2. `index.html` dosyasına çift tıklayın. Menü Chrome'da açılır.
3. Yukarı kaydırın; ürün adına dokununca bilgi ekranı açılır.
4. `admin.html` dosyasına çift tıklayın. Bu aşamada **yalnızca demo** fiyat paneli açılır.

## GitHub Pages'e yükleme

1. GitHub'da yeni **public** repository açın (ör. `erzurum-sofrasi-menu`).
2. Repository ana sayfasında **Add file > Upload files** menüsünü açın.
3. ZIP dosyasını **DEĞİL**, ZIP'ten çıkardığınız dosyaları (index.html, admin.html, data.js, assets klasörü ve diğerleri) depo **köküne** yükleyin. `index.html` doğrudan ana dizinde olmalı.
4. **Commit changes** ile yüklemeyi kaydedin.
5. Settings > Pages > Build and deployment: **Deploy from a branch**, branch **main**, folder **/(root)**, Save.
6. Yayın URL'si genelde `https://KULLANICI.github.io/DEPO/` biçimindedir. Gerçek URL'yi GitHub Pages ekranından alın.

ÖNEMLİ: GitHub Pages'te **görünen menü** ilk test için açılır, ama Firebase yapılandırılmadıysa fiyat panelindeki değişiklikler yalnızca kullandığınız tarayıcıda görünür. Başka telefonlarda görünmez. Müşteriye teslim için Firebase kurulumu gerekir.

## İşletme sahibinin canlı fiyat yönetimi (ikinci aşama)

1. Firebase projenizin web ayarlarını `firebase-config.js` dosyasına girin.
2. Firebase Authentication > E-posta/Şifre açın, işletme sahibi kullanıcı hesabını oluşturun ve e-postasını doğrulayın.
3. Firestore açın. `firestore.rules` içindeki `OWNER_EMAIL_BURAYA` alanını aynı doğrulanmış işletme sahibi e-postası ile değiştirip kuralları yayınlayın.
4. GitHub Pages URL'nizi Firebase Authentication Authorized domains'e ekleyin.
5. Değişen `firebase-config.js` dosyasını GitHub'da güncelleyin.
6. `admin.html` şifreli giriş, `index.html` müşteri menüsü olacaktır.

## İçerik ve güvenlik

- Dokuz onaylı sayfa ve 43 ürün içeriği korunur; 79 fiyat kutusundaki rakamlar canlı metindir.
- Besin ve alerjen verileri **standart tariflere dayanan, doğrulanmamış araştırma taslaklarıdır**. Henüz işletmenin gerçek reçeteleriyle eşleşmemiştir. Alerjenler kesin beyan olarak yayınlanmaz.
- Taslak alerjenleri yalnızca kontrol için `index.html?taslak=1` adresinde görüntüleyin.
- İletişim sayfası arama bağlantısı: **0531 586 07 98**. Adres, onaylı görselde yer almadığından bu pakete yeni bir tasarım unsuru eklenmedi; daha sonra eklenebilir.
- Bu paket GitHub/Firebase hesabınızda henüz yayımlanmamıştır. Yayımlama işini bir sonraki aşamada yapacağız.
