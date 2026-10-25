# QA Kitabı — offline tətbiq

Bu qovluq interaktiv QA kitabının **offline tətbiq (PWA)** versiyasıdır. Bir dəfə internetlə açandan sonra
kitab, testlər, fleş kartlar, tapşırıqlar, qeydlər və irəliləyiş **internetsiz** işləyir. Telefonda ana ekrana
adi tətbiq kimi quraşdırılır.

Claude (müəllim, rol oyunları, “Claude ilə” düymələri) yalnız internet olanda işləyir — iki yolla:

1. **claude.ai versiyasında** — https://claude.ai/artifact/ARfQ7Q2V6TsZ3nBnJdQzLq (açar lazım deyil, Claude öz claude.ai hesabınla işləyir).
   Açar yoxdursa, tətbiqdəki Claude düymələri bu versiyanı eyni bölmədə açır və eyni əməliyyatı başladır.
2. **Öz Anthropic API açarınla** (istəyə görə) — cavablar birbaşa tətbiqin içində gəlir.

Versiya: `2026.10.25-78a338f` · cihazda tutduğu yer: təxminən 2,0 MB.

## 1. Saytda yerləşdir (bir dəfə)

Offline rejim və quraşdırma üçün tətbiq **HTTPS** ünvanında açılmalıdır. `index.html`-i kompüterdə birbaşa
fayl kimi açanda kitab işləyir, amma offline yaddaş və quraşdırma işləmir.

**A) Netlify Drop — ən asan yol**
1. https://app.netlify.com/drop səhifəsini aç.
2. ZIP faylını (və ya ZIP-dən çıxan qovluğu) səhifəyə at.
3. Verilən `https://….netlify.app` ünvanını telefonda aç.

Hesabsız yüklənən sayt müvəqqəti qalır — saxlamaq üçün pulsuz hesab açıb saytı öz hesabına götür (“claim”).

**B) Cloudflare Pages**
1. Pulsuz Cloudflare hesabı → Workers & Pages → Create application → “Drag and drop your files”.
2. Layihəyə ad ver, ZIP faylını yüklə → Deploy site.
3. Ünvan: `https://<ad>.pages.dev`.

**C) GitHub Pages**
1. Yeni **public** repo yarat və ZIP-dən çıxan bütün faylları qovluqları ilə birlikdə repo-nun kökünə yüklə.
2. Settings → Pages → Source: “Deploy from a branch” → Branch: `main`, folder: `/ (root)` → Save.
3. Ünvan: `https://<istifadəçi>.github.io/<repo>/`.

## 2. Telefona quraşdır

- **Android (Chrome):** saytı aç → ana səhifədəki “Quraşdır” düyməsi və ya menyu (⋮) → “Tətbiqi quraşdır” (Install app) / “Ana ekrana əlavə et” (Add to Home screen).
- **iPhone, iPad (Safari):** saytı aç → Paylaş düyməsi → “Ana ekrana əlavə et” (Add to Home Screen).

İlk açılışda bütün kitab cihazda saxlanılır. Ayarlar → Tətbiq bölməsində “Offline hazırdır” yazısı görünəndən
sonra tətbiqi internetsiz də aça bilərsən.

## 3. Claude

Heç nə qurmaq lazım deyil: açar yoxdursa, Claude düymələri claude.ai versiyasını açır və Claude orada öz
claude.ai hesabınla (məsələn, Pro abunəliyinlə) işləyir. Yazdığın cavab və ya sual buferə kopyalanır — orada yapışdır.

Cavabların tətbiqin özündə gəlməsini istəsən, öz API açarını əlavə et:

1. Anthropic Console-da açar yarat: https://platform.claude.com/settings/keys (açar `sk-ant-` ilə başlayır).
2. Tətbiqdə Ayarlar → Claude → “Əlavə: öz API açarınla bu tətbiqin içində” → açarı yapışdır → “Yoxla və saxla”.
3. Model və düşünmə dərinliyini seç. Standart: Opus 5.5, “Yüksək”.

Bilməli olduqların:
- API ödənişi claude.ai abunəliyindən **ayrıdır**: Console-da balans artırılır, hər sorğu token sayına görə ödənilir.
  Console-da xərc limiti qoymaq məsləhətdir. Tətbiq bu cihazdakı sorğu və token sayını Ayarlarda göstərir.
- Açar yalnız bu cihazın brauzerində saxlanılır və yalnız `api.anthropic.com`-a göndərilir. Paylaşılan cihazda
  açar saxlama; açar başqasının əlinə keçsə, Console-da onu ləğv et.
- Açarı silsən, Claude düymələri yenə claude.ai versiyasını açacaq.

## 4. Məlumatların

- İrəliləyiş, qeydlər, tapşırıq cavabları və söhbətlər yalnız bu cihazda saxlanılır və claude.ai versiyasındakından ayrıdır.
- Ehtiyat nüsxə: Ayarlar → Məlumatlar → “İxrac et” (.json fayl). Yeni cihazda “İdxal et”.
- Brauzerin sayt məlumatlarını silsən, irəliləyiş də silinir — əvvəlcə ixrac et.

## 5. Yeniləmə

Yeni versiyanı eyni sayta yenidən yüklə (Netlify: saytın Deploys bölməsinə yeni ZIP-i at; Cloudflare: Create new
deployment; GitHub: faylları əvəz et). Tətbiq növbəti açılışda yeni versiyanı yükləyir və “Yenilə” düyməsini
göstərir. Məlumatların itmir.

## Fayllar

- `index.html` — tətbiqin qabığı
- `app.js`, `app.css` — interfeys
- `book.js` — kitabın bütün mətni, testlər və lüğət
- `pwa.js` — offline rejim, quraşdırma, Claude API, ixrac və idxal
- `sw.js` — service worker (offline yaddaş)
- `manifest.webmanifest`, `icons/` — tətbiqin adı və ikonları
- `fonts/` — IBM Plex Sans, IBM Plex Mono, Literata (SIL Open Font License 1.1)
- `libs/` — marked (MIT), DOMPurify (Apache-2.0 və ya MPL-2.0)
