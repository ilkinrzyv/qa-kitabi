# QA Kitabı: Sıfırdan Peşəkar Testerə

Oct 24, 2026 · @İlkin Rzayev

## Bu kitabı necə oxumalı

Bu kitab QA-nı sıfırdan öyrənən biri üçündür: hər mövzu sadə dildən başlayır, misallarla açılır və praktik tapşırıqla bitir. Proqramlaşdırma bilgisi tələb olunmur — texniki fəsillərdə lazım olan hər şey əvvəldən izah edilir.

Kitab kursunu əvəz etmir, onu tamamlayır. Kursda bir mövzunu keçəndə həmin fəsli burada da oxu: eyni mövzunu başqa misallarla görmək onu möhkəm yadda saxlamağa kömək edir.

### Hər fəslin quruluşu

| Bölmə | Nə var | Nəyə lazımdır |
| --- | --- | --- |
| İzah | Mövzu sadə dillə, gündəlik həyatdan misallarla | Anlayışı başa düşmək |
| Diqqət | Yeni başlayanların tez-tez etdiyi səhvlər | Səhvi əvvəlcədən tanımaq |
| Həll olunmuş nümunə | Bir tapşırığın addım-addım həlli | Necə düşünməli olduğunu görmək |
| Sənin növbən | Oxşar tapşırıqlar; nümunə cavab əvvəlcə bağlıdır | Öyrəndiyini özün tətbiq etmək |
| Özünü yoxla | Fəsil üzrə qısa suallar | Boşluqları tapmaq |

Bütün tapşırıqların nümunə cavabı kitabdadır, amma əvvəlcə bağlıdır, çünki öyrənmək özün yazanda baş verir. Cavabını tapşırığın altındakı sahəyə yaz, sonra “Cavabı göstər” düyməsi ilə nümunəni aç və özünü meyarlarla yoxla. İlişib qalsan, “İpucu” həlli açmadan istiqamət göstərəcək. Claude qoşulubsa, “Yoxla” düyməsi cavabına ayrıca rəy də verir.

### Terminlər haqqında

QA-da ingiliscə terminlər geniş işlənir: bug, test case, regression. İş elanları, komanda söhbətləri və müsahibələr də əsasən bu terminlərlə aparılır.

Ona görə hər termin ilk dəfə çıxanda həm ingiliscə adı, həm azərbaycanca izahı verilir. Bütün terminlər Əlavə A-da lüğət kimi toplanıb.

### Oxu sırası

1. **I–IV hissələr** — manual testin təməli. Ardıcıl oxu: hər fəsil əvvəlkinin üzərində qurulur.
2. **V hissə** — veb, API, SQL, mobil. Tester-in texniki alətləri.
3. **VI hissə** — JavaScript, Playwright, Git. Avtomatlaşdırmaya ilk addımlar.
4. **VII hissə və Əlavələr** — karyera, lüğət, hazır şablonlar. İstənilən vaxt qayıdıb baxmaq üçün.

### Daha yaxşı mənimsəmək üçün

- Fəsli bir oturuşda bitirməyə tələsmə. Bir bölmə oxu, sonra onu real saytda sına.
- Tapşırıqları yazılı həll et. “Başa düşdüm” hissi ilə “edə bilirəm” arasında böyük fərq var.
- Hər gün istifadə etdiyin tətbiqlərə tester gözü ilə bax: “Burada nə səhv gedə bilərdi?”
- Çətin gələn yeri sənəddə seçib şərh (comment) yaz və ya çatda soruş. Həmin hissəni daha geniş, əlavə misallarla izah edəcəyəm.

# I hissə — Əsaslar

## Fəsil 1. QA nədir və tester nə iş görür

QA (Quality Assurance — keyfiyyətin təminatı) prosesi elə qurmaqdır ki, məhsul keyfiyyətli çıxsın. Test (testing) isə işi yoxlayıb problemləri tapmaqdır. İkisi eyni şey deyil: fərqi 1.2-də görəcəksən.

### 1.1. Test nədir

Test — proqramın gözlənildiyi kimi işləyib-işləmədiyini yoxlamaq və problemləri tapmaq prosesidir. Avtomobil zavodunu düşün: hər maşın satışa çıxmazdan əvvəl yoxlanılır — əyləc, işıqlar, mühərrik. Proqram da istifadəçiyə çatmazdan əvvəl yoxlanılır.

Test yalnız proqramı işə salmaq deyil. Planlaşdırma, tələbləri oxumaq, test case yazmaq, sənədləri nəzərdən keçirmək və nəticələri hesabata çevirmək də testin hissəsidir.

**Testin məqsədləri.** ISTQB bunları sadalayır:

- Tələbləri, user story-ləri, dizaynı və kodu qiymətləndirmək.
- Nasazlıqları üzə çıxarıb defektləri tapmaq.
- Lazımi əhatəni (coverage) təmin etmək.
- Keyfiyyətin yetərsiz olması riskini azaltmaq.
- Tələblərin ödəndiyini yoxlamaq.
- Müqavilə, qanun və standartlara uyğunluğu yoxlamaq.
- Maraqlı tərəflərə (stakeholders) qərar üçün məlumat vermək.
- Məhsulun keyfiyyətinə inam yaratmaq.
- Məhsulun tam olduğunu və gözlənildiyi kimi işlədiyini təsdiqləmək.

Məqsədlər konteksdən asılıdır: yoxlanan işdən, test səviyyəsindən, risklərdən və SDLC-dən. Məsələn, unit testdə əsas məqsəd defekt tapmaq, qəbul testində isə məhsulun hazır olduğuna inam yaratmaq ola bilər.

Testin iki əsas sualı var:

- **Verification (yoxlama):** “Məhsulu düzgün qururuqmu?” Yəni məhsul sənəddəki tələblərə uyğundurmu?
- **Validation (təsdiqləmə):** “Düzgün məhsulu qururuqmu?” Yəni məhsul istifadəçinin real ehtiyacını ödəyirmi?

**Misal.** Tələbdə yazılıb: “Sifariş düyməsi qırmızı olsun.” Proqramçı düyməni qırmızı edib — verification keçdi. Amma istifadəçilər qırmızı düyməni xəbərdarlıq kimi qəbul edib onu basmaqdan çəkinirlər — validation uğursuz oldu.

### 1.2. QA, QC və Testing: fərq nədir

Bu üç söz tez-tez bir-birinin yerinə işlədilir, amma mənaları fərqlidir.

| Anlayış | Əsas sual | Fokus | Misal |
| --- | --- | --- | --- |
| QA — Quality Assurance (keyfiyyətin təminatı) | Prosesimiz keyfiyyətli nəticə verəcəkmi? | Proses; problemlərin qarşısını almaq | Kod yazılmazdan əvvəl tələblərin nəzərdən keçirilməsi qaydası |
| QC — Quality Control (keyfiyyətə nəzarət) | Hazır məhsul standarta cavab verirmi? | Məhsul; problemi aşkar etmək | Reliz öncəsi məhsulun yoxlanması |
| Testing (test) | Burada hansı problem var? | Konkret yoxlama hərəkətləri | Login formasına yanlış şifrə yazıb nəticəyə baxmaq |

Restoran misalı ilə: **QA** — mətbəxdəki gigiyena qaydaları, resept standartları, aşpazların təlimi. **QC** — yemək zala çıxmazdan əvvəl baş aşpazın onu yoxlaması. **Testing** — baş aşpazın şorbanın dadına baxması, yəni konkret yoxlama hərəkəti.

Testing QC-nin əsas formasıdır. QA və QC isə iki ayrı yanaşmadır: QC məhsula baxır və tapılanı düzəltdirir, QA prosesə baxır və səhvin qarşısını almağa çalışır. Test nəticələri ikisinə də lazımdır: QC-də defektləri düzəltmək üçün, QA-da isə inkişaf və test proseslərinin nə qədər yaxşı işlədiyini görmək üçün. QA yalnız tester-in işi deyil: layihədəki hər kəs ona cavabdehdir.

Praktikada “QA engineer” deyəndə çox vaxt tester nəzərdə tutulur, amma yaxşı QA mütəxəssisi yalnız baq tapmır — prosesin özünü də yaxşılaşdırır.

### 1.3. Səhv, defekt və nasazlıq

Bu üç anlayış bir zəncirin halqalarıdır:

1. **Error / Mistake (səhv)** — insanın etdiyi yanlışlıq. Proqramçı düsturu səhv yazır, analitik tələbi yanlış başa düşür.
2. **Defect / Bug / Fault (defekt, baq)** — həmin səhvin kodda və ya sənəddə qoyduğu iz.
3. **Failure (nasazlıq)** — defektli hissə işə düşəndə istifadəçinin gördüyü yanlış davranış.

**Misal.** Proqramçı 10% endirim üçün `price * 0.1` yazmalı idi, amma `price * 0.01` yazdı — bu, səhvdir. Kodda defekt yarandı. Müştəri 100 manatlıq mala 10 yox, 1 manat endirim gördü — bu, nasazlıqdır.

**Diqqət.** Hər defekt nasazlığa çevrilmir. Defektli kod heç vaxt işə düşmürsə (məsələn, heç kimin açmadığı köhnə funksiyada), istifadəçi heç nə görmür. Əksinə, nasazlığı defektdən başqa şeylər də yarada bilər: serverin yaddaşı dolub, internet kəsilib.

### 1.4. Test niyə lazımdır

- **Pul.** Defekt nə qədər gec tapılsa, düzəlişi o qədər baha başa gəlir. Tələbdə bir cümləni düzəltmək bir neçə dəqiqədir. Eyni səhv canlı sistemdə (production) tapılanda — təcili düzəliş, itirilmiş müştərilər, pul itkisi.
- **Reputasiya.** Ödəniş zamanı çökən tətbiqdən istifadəçi bir daha alış etmir.
- **Təhlükəsizlik və həyat.** Tibbi avadanlıq, aviasiya, avtomobil proqramlarında defekt insan həyatına təsir edə bilər.

Test layihəyə daha dörd şey verir: defektləri sərfəli yolla üzə çıxarır ki, debugging onları aradan qaldıra bilsin; keyfiyyəti qiymətləndirib reliz kimi qərarlara məlumat verir; layihədə istifadəçinin ehtiyaclarını təmsil edir, çünki real istifadəçiləri hər addıma cəlb etmək baha başa gəlir; müqavilə, qanun və ya standart tələb edəndə bu öhdəliyi yerinə yetirir.

Real misallar:

- **Knight Capital (2012).** Birja ticarəti şirkəti yeni kodu serverlərə yerləşdirəndə köhnə, istifadə olunmayan funksiya təsadüfən aktivləşdi. Təxminən 45 dəqiqədə şirkət 440 milyon dollar itirdi.
- **Ariane 5 (1996).** Avropa raketi buraxılışdan təxminən 37 saniyə sonra partladı. Səbəb: əvvəlki raketdən götürülmüş kodda böyük ədəd daha kiçik tipə çevriləndə daşma (overflow) baş verdi.

### 1.5. Tester kimdir və nə iş görür

Tester-in gündəlik işi təkcə “düymə basmaq” deyil:

- Tələbləri oxuyub sual vermək və qeyri-müəyyən yerləri tapmaq.
- Test case və checklist yazmaq.
- Testləri icra etmək — manual və ya avtomatik.
- Tapdığı defektləri bug report kimi qeyd etmək.
- Düzəldilmiş defektləri yenidən yoxlamaq.
- Komanda görüşlərində iştirak etmək və keyfiyyət riskləri barədə danışmaq.

Tipik bir iş günü belə ola bilər:

| Vaxt | İş |
| --- | --- |
| 10:00 | Daily standup: düən nə etdim, bu gün nə edəcəyəm, nə mane olur |
| 10:15 | Jira-da yeni tapşırıqlara baxış |
| 11:00 | Yeni funksiyanın testi |
| 14:00 | Tapılan defektlər üçün bug report yazmaq |
| 16:00 | Düzəldilmiş baqların təkrar yoxlanması |
| 17:00 | Test case-lərin yenilənməsi |

**Tester-in düşüncə tərzi.** Proqramçı “bu necə işləyəcək?” sualını verir, tester isə “bu necə sınacağ?” sualını. Lifti düşün: tester soruşur — içəridə heç kim olmasa nə olar? Maksimum çəki aşılsa? İki mərtəbənin düyməsi eyni anda basılsa? Qapı bağlanarkən kimsə əlini qoysa?

Yaxşı tester-in keyfiyyətləri: test, texniki və sahə bilikləri (məsələn, bank və ya e-ticarət), diqqət, maraq, məntiq, tənqidi və yaradıcı düşüncə, səbr, istifadəçi kimi düşünmək, komandada işləmək, dinləmək və ünsiyyət — defekti kimisə incitmədən, faktlarla izah etmək bacarığı.

**Təsdiq meyli (confirmation bias).** İnsan öz işinin düzgün olduğuna inanmağa meyillidir, ona görə pis xəbəri çətin qəbul edir. Proqramçı bug report-u şəxsi tənqid kimi oxuya bilər. Bu, adi insan reaksiyasıdır. Ona görə report faktlarla yazılır və söhbətin məqsədi ortaq olur: daha yaxşı məhsul.

### 1.6. Test və debugging, kök səbəb, testware {#c1x1}

Test və debugging (sazlama) fərqli işlərdir:

- **Test** nasazlığı (failure) və ya defekti tapır və göstərir. Bunu tester edir.
- **Debugging** defektin kodda harada olduğunu tapır, onu düzəldir və düzəlişi yoxlayır. Bunu adətən proqramçı edir.

Ardıcıllıq belədir: tester nasazlığı tapır və bug report yazır → proqramçı debugging edir və düzəldir → tester düzəlişi yoxlayır (retest) və regression aparır.

| İş | Hansı suala cavab verir | Kim edir |
| --- | --- | --- |
| Test | Problem varmı, harada və hansı şərtdə görünür? | Tester |
| Debugging | Kodda səbəb haradadır, necə düzəlir? | Proqramçı |
| Kök səbəb analizi | Niyə ümumiyyətlə baş verdi, necə təkrarlanmasın? | Komanda |

**Kök səbəb (root cause)** — səhvin (error) baş verməsinin əsas səbəbidir. 1.3-dəki endirim misalında defekt kodda “0.1 yerinə 0.01” yazılmasıdır. Kök səbəb isə dərində ola bilər: tələbdə faizin necə yazılacağı göstərilməyib, kod review aparılmayıb. Kök səbəbi aradan qaldıranda eyni tip defektlər bir daha yaranmır: tələb şablonu dəyişir, review məcburi olur. Bu, artıq QA işidir (1.2).

**Testware** — test prosesində yaranan bütün iş məhsullarıdır: test planı, test ssenariləri, test case-lər və checklist-lər, test data, avtomatik test skriptləri, bug report-lar, test hesabatları. Testware növbəti relizlərdə təkrar işlədilir, ona görə səliqə ilə saxlanılır və versiyalanır (4.6).

**İzlənə bilmə (traceability)** — tələb, test case, test nəticəsi və defekt arasındakı əlaqədir. RTM cədvəli (11-ci fəsil) göstərir ki, hansı tələb hansı testlərlə yoxlanıb və harada defekt var. Tələb dəyişəndə hansı testləri yeniləmək lazım olduğu da məhz izlənə bilmə sayəsində görünür.

### 1.7. Bütün komanda yanaşması və testin müstəqilliyi {#c1x2}

**Bütün komanda yanaşması (whole team approach).** Keyfiyyət yalnız tester-in deyil, bütün komandanın məsuliyyətidir. Tester komandanın bərabərhüquqlu üzvüdür: Product Owner ilə qəbul meyarlarını yazır, proqramçı ilə unit testləri və avtomatlaşdırmanı müzakirə edir, analitiklə tələbləri nəzərdən keçirir. Komandanın hər üzvü test işinə qoşula bilər, amma hər kəs öz güclü tərəfini gətirir.

**Testin müstəqilliyi (independence of testing).** Müəllif öz işindəki səhvləri çətin görür: nə yazmaq istədiyini bilir və gözü “düzgün”ü oxuyur. Ona görə testi başqa birinin etməsi daha çox defekt tapır.

| Müstəqillik | Kim test edir |
| --- | --- |
| Yoxdur | Müəllifin özü: proqramçı öz kodunu yoxlayır |
| Aşağı | Eyni komandadan həmkar |
| Orta | Komandadakı tester |
| Yüksək | Ayrıca test komandası və ya xarici şirkət |

- **Üstünlükləri:** fərqli baxış başqa növ nasazlıqları tapır; tester müəllifin və maraqlı tərəflərin fərziyyələrini yoxlayır.
- **Riskləri:** tester komandadan təcrid olunur, ünsiyyət zəifləyir; proqramçılar keyfiyyəti “tester-in işi” sanır; tester gecikmələrin günahkarı və ya darboğaz kimi görünür.

Praktikada hər ikisi birlikdə olur: unit testləri proqramçı yazır (müstəqillik yoxdur, amma sürətlidir), sistem testini komandadakı tester aparır, qəbul testini isə istifadəçilər. Hər səviyyədə fərqli müstəqillik doğru seçimdir.

### Diqqət: tez-tez edilən səhvlər

- **“Test proqramın səhvsiz olduğunu sübut edir.”** Xeyr — test yalnız defektlərin varlığını göstərir (Fəsil 2).
- **“Tester-in işi düymə basmaqdır.”** Xeyr — ən dəyərli iş çox vaxt test başlamazdan əvvəl, tələblər təhlil olunanda görülür.
- **“Baq tapmaq proqramçıya qarşı çıxmaqdır.”** Xeyr — tester də, proqramçı da eyni məqsəd üçün çalışır: yaxşı məhsul.

### Həll olunmuş nümunə

**Tapşırıq.** Bank tətbiqində analitik tələb sənədində pul köçürməsinin gündəlik limitini 5000 AZN əvəzinə 500 AZN yazıb. Proqramçı sənədə uyğun kod yazıb. Müştəri 1000 AZN köçürmək istəyəndə “Limit aşılıb” xətası alır. Error, defect və failure-ı tap.

**Həll.**

1. **Error (səhv):** analitik limiti yanlış yazıb. Diqqət et: səhv proqramçının deyil, analitikindir — proqramçı sənədə düzgün əməl edib.
2. **Defect:** iki yerdədir — tələb sənədindəki “500” rəqəmində və həmin rəqəmlə yazılmış kodda. Deməli, defekt sənəddə də ola bilər.
3. **Failure:** müştərinin 1000 AZN köçürə bilməməsi.
4. **Nəticə:** bu defekti ən ucuz yolla tələb mərhələsində tutmaq olardı. Tester sənədi oxuyarkən soruşa bilərdi: “Limit niyə 500-dür? Bankın qaydalarında 5000 deyil?”

### Sənin növbən

1. Error, defect və failure-ı müəyyən et: hava proqnozu tətbiqində proqramçı Selsini Farenheytə çevirən düsturu səhv yazıb. Bakıda +20 °C olanda tətbiq +36 °F göstərir.
2. QA, QC və Testing üçün öz həyatından analogiya qur: məsələn, maşın təmiri, tikiş və ya kitab nəşri.
3. Hər gün istifadə etdiyin bir tətbiqdə qarşılaşdığın problemi təsvir et. Bu, failure idi? Arxasında hansı defekt ola bilərdi?
4. Verification və validation fərqini göstərən öz misalını yaz.

### Özünü yoxla

- Testing, QC və QA bir-biri ilə necə əlaqəlidir?
- Niyə hər defekt nasazlığa çevrilmir?
- Defekt yalnız kodda olur? Başqa harada ola bilər?
- Proqramçı ilə tester-in düşüncə tərzindəki əsas fərq nədir?

## Fəsil 2. Testin 7 prinsipi

Testin 7 prinsipi onilliklərin təcrübəsindən çıxan qaydalardır və hər test qərarının arxasında dayanır. Onları ISTQB (tester-lər üçün beynəlxalq sertifikat təşkilatı) formalaşdırıb; müsahibələrdə ən çox soruşulan mövzulardandır.

| # | İngiliscə | Azərbaycanca |
| --- | --- | --- |
| 1 | Testing shows the presence of defects, not their absence | Test defektlərin varlığını göstərir, yoxluğunu yox |
| 2 | Exhaustive testing is impossible | Tam test mümkün deyil |
| 3 | Early testing saves time and money | Erkən test vaxt və pula qənaət edir |
| 4 | Defects cluster together | Defektlər qruplaşır |
| 5 | Tests wear out (pesticide paradox) | Testlər köhnəlir (pestisid paradoksu) |
| 6 | Testing is context dependent | Test kontekstdən asılıdır |
| 7 | Absence-of-defects fallacy | Defektsizlik yanılması |

### Prinsip 1. Test defektlərin varlığını göstərir, yoxluğunu yox

Test yalnız “burada defekt var” deyə bilər. “Burada heç bir defekt yoxdur” demək isə mümkün deyil.

**Misal.** 100 test keçdi. Bu o deməkdir ki, bu 100 yoxlamada problem çıxmadı — 101-ci yoxlamada çıxa bilər. Həkim müayinəsi kimi: analizlər yaxşı çıxıb, amma bu, insanın tamamilə sağlam olduğuna 100% zəmanət deyil.

**Praktikada.** Hesabatda “məhsulda defekt yoxdur” yazma. Belə yaz: “Planlaşdırılmış testlər icra olundu, açıq kritik defekt yoxdur.”

### Prinsip 2. Tam test mümkün deyil

Bütün girişləri və kombinasiyaları yoxlamaq mümkün deyil.

**Misal.** 4 rəqəmli PIN kod — 10 000 kombinasiya. 8 simvollu şifrədə isə 62 simvol işlənə bilər (26 kiçik hərf, 26 böyük hərf, 10 rəqəm). Bu, 62⁸ ≈ 218 trilyon variant deməkdir: saniyədə bir test etsən, təxminən 7 milyon il çəkər.

**Praktikada.** Risklərə və prioritetlərə görə seçirik. Test dizayn texnikaları (Fəsil 8–9) az testlə çox defekt tapmağa kömək edir.

### Prinsip 3. Erkən test vaxt və pula qənaət edir

Tester layihəyə kod hazır olanda yox, tələblər yazılanda qoşulmalıdır. Buna “shift left” (sola sürüşdürmə) da deyirlər: test prosesin əvvəlinə keçir.

**Misal.** Tələbdə yazılıb: “İstifadəçi şifrəsini dəyişə bilər.” Köhnə şifrə soruşulacaqmı? Bunu tələb mərhələsində soruşmaq bir sual deməkdir. Kod yazılandan sonra tapmaq isə dizayn, kod və test işinin yenidən görülməsi deməkdir.

**Praktikada.** Tələbləri və dizayn maketlərini oxu, sual ver. Bu da testdir — statik test (Fəsil 7).

### Prinsip 4. Defektlər qruplaşır

Defektlərin çoxu az sayıda modulda cəmlənir. Bu, Pareto prinsipinə bənzəyir: problemlərin təxminən 80%-i sistemin 20%-indən çıxır.

**Misal.** Onlayn mağazada defektlərin çoxu ödəniş və endirim modullarındadır, çünki ən mürəkkəb məntiq oradadır.

**Praktikada.** Defekt çox tapılan yerə daha çox test ayır. Bu yerləri defekt statistikası (məsələn, Jira hesabatları) göstərir.

### Prinsip 5. Testlər köhnəlir (pestisid paradoksu)

Eyni testləri təkrar-təkrar icra etsən, onlar yeni defekt tapmağı dayandırır. Fermer həmişə eyni dərmanı işlətsə, zərərvericilər ona qarşı davamlı olur — adı da buradandır.

**Misal.** Komanda 2 ildir eyni 200 testi icra edir. Testlər hər dəfə keçir, amma istifadəçilər yeni baqlar tapır.

**Praktikada.** Testləri mütəmadi nəzərdən keçir, yeni ssenarilər və yeni test data əlavə et, exploratory test et. Qeyd: regression testlərinin təkrarı faydalıdır, çünki köhnə funksiyaların sınmadığını təsdiqləyir. Sadəcə yeni defekt tapmaq üçün yeni testlər lazımdır.

### Prinsip 6. Test kontekstdən asılıdır

Hər məhsul üçün ayrı yanaşma lazımdır.

| Məhsul | Ən vacib test sahələri |
| --- | --- |
| Bank tətbiqi | Təhlükəsizlik, hesablamaların dəqiqliyi, tranzaksiyaların etibarlılığı |
| Mobil oyun | Performans (FPS), istifadə rahatlığı, cihaz uyğunluğu, əyləncə |
| Tibbi avadanlıq proqramı | Etibarlılıq, standartlara uyğunluq, ciddi sənədləşmə |
| Xəbər saytı | Yüklənmə sürəti, müxtəlif brauzer və ekranlar, yüksək trafik |

**Praktikada.** “Universal test planı” yoxdur. Hər layihədə özündən soruş: burada ən böyük risk nədir?

### Prinsip 7. Defektsizlik yanılması

Defektsiz proqram hələ uğurlu proqram deyil. Məhsul istifadəçinin ehtiyacını ödəmirsə, defektlərin olmaması onu xilas etmir.

**Misal.** Bütün testlərdən keçmiş, amma istifadəsi o qədər çətin olan bank tətbiqi ki, müştərilər yenə filiala gedir. Ya da mükəmməl işləyən, amma heç kimin ehtiyac duymadığı funksiya.

**Praktikada.** Yalnız “tələbə uyğundurmu?” (verification) deyil, “istifadəçiyə lazımdırmı?” (validation) sualını da ver.

### Diqqət: tez-tez edilən səhvlər

- **Prinsip 1 ilə 7-ni qarışdırmaq.** Prinsip 1: test defektin yoxluğunu sübut edə bilməz. Prinsip 7: defekt olmasa belə, məhsul faydasız ola bilər.
- **Prinsip 5-dən “regression lazımsızdır” nəticəsi çıxarmaq.** Regression lazımdır; sadəcə yeni defekt tapmaq üçün testləri yeniləmək də lazımdır.
- **Prinsip 2-ni “test etməyə dəyməz” kimi başa düşmək.** Məqsəd hər şeyi yox, ən vacibini test etməkdir.

### Həll olunmuş nümunə

**Tapşırıq.** Komanda 2 ildir eyni 200 regression testini icra edir. Son 6 ayda testlər heç bir defekt tapmayıb. Menecer deyir: “Deməli məhsulumuz səhvsizdir, testləri azaldaq.” Bu fikirdə hansı prinsiplər pozulur və nə təklif edərdin?

**Həll.**

1. **Prinsip 1 pozulur:** testlərin defekt tapmaması defektin yoxluğunu sübut etmir.
2. **Prinsip 5 pozulur:** eyni testlər köhnəlib — tapa biləcəkləri defektləri artıq tapıblar.
3. **Təklif:** testləri yeniləmək (yeni ssenarilər, sərhəd dəyərləri, yeni data), son relizlərdə dəyişən modullara exploratory sessiyalar ayırmaq, istifadəçi şikayətlərini analiz etmək.
4. **Qeyd:** testləri azaltmaq qərarı risk analizi ilə verilməlidir, “defekt tapılmır” arqumenti ilə yox.

### Sənin növbən

1. Formada 3 sahə var: ad (1–50 hərf), yaş (1–120), şəhər (20 variantlı siyahı). Bütün kombinasiyaları test etmək niyə mümkün deyil? Heç olmasa yaş × şəhər üçün təxmini sayı hesabla.
2. Hansı prinsipdir? “Tester layihəyə kod yazılandan sonra yox, tələblər müzakirə olunanda qoşulur.”
3. Hansı prinsipdir? “Son 3 relizdə tapılan 40 defektin 30-u Səbət modulunda olub.”
4. Bir mobil oyun və bir onlayn bank üçün ən vacib 3 test sahəsini yaz. Fərqi hansı prinsiplə izah edərsən?
5. Prinsip 7-yə öz həyatından misal tap: qüsursuz işləyən, amma lazımsız və ya narahat bir məhsul.

### Özünü yoxla

- 7 prinsipi yaddan sadala.
- Pestisid paradoksunun həlli nədir?
- Prinsip 1 ilə Prinsip 7 arasında fərq nədir?
- Niyə erkən test daha ucuzdur?

## Fəsil 3. SDLC: proqram necə yaranır

SDLC (Software Development Life Cycle — proqram təminatının hazırlanma həyat dövrü) proqramın ideyadan istifadəyə və dəstəyə qədər keçdiyi mərhələlərdir. Tester bu dövrün harasında olduğunu bilməlidir, çünki işi buna görə dəyişir.

### 3.1. SDLC mərhələləri

| # | Mərhələ | Nə edilir | Ev tikintisində |
| --- | --- | --- | --- |
| 1 | Tələblərin toplanması və analizi (Requirements) | Müştərinin istədiyi aydınlaşdırılır və sənədləşdirilir | Sifarişçi ilə danışıq: neçə otaq, büdcə |
| 2 | Dizayn (Design) | Arxitektura, ekran dizaynları, verilənlər bazası | Memarın layihəsi |
| 3 | Kodlaşdırma (Development) | Proqramçılar kodu yazır | Tikinti |
| 4 | Test (Testing) | Məhsul yoxlanılır, defektlər düzəldilir | Qəbul komissiyasının yoxlaması |
| 5 | Yerləşdirmə (Deployment) | Məhsul istifadəçilərə çatdırılır | Ailənin evə köçməsi |
| 6 | Dəstək (Maintenance) | Düzəlişlər və yeniləmələr | Təmir, yeni mebel |

### 3.2. Komandada kim kimdir

- **Product Owner / Product Manager** — məhsulun nə olacağına qərar verir, prioritetləri müəyyən edir.
- **Business Analyst (biznes analitik)** — biznes ehtiyaclarını tələblərə çevirir.
- **UI/UX dizayner** — ekranları və istifadəçi təcrübəsini dizayn edir.
- **Developer (proqramçı)** — frontend (istifadəçinin gördüyü hissə) və backend (serverdəki məntiq) yazır.
- **QA engineer (tester)** — keyfiyyəti yoxlayır və riskləri göstərir.
- **DevOps engineer** — serverlər, yerləşdirmə və avtomatik proseslərlə məşğuldur.
- **Project Manager / Scrum Master** — prosesin rəvan getməsinə cavabdehdir.

### 3.3. Waterfall (şəlalə) modeli

Mərhələlər ardıcıl gedir: əvvəlki bitmədən sonrakı başlamır. Şəlalədən tökülən su kimi, proses geri qayıtmır.

- **Üstünlüklər:** aydın plan və ətraflı sənədlər. Tələbləri sabit layihələr üçün uyğundur.
- **Çatışmazlıqlar:** test sona qalır, ona görə defektlər gec və baha tapılır. Dəyişiklik etmək çətindir. Müştəri məhsulu yalnız sonda görür.

Tester üçün bu o deməkdir ki, işin çoxu layihənin sonunda gəlir. Vaxt çatmayanda ilk qurban adətən test olur.

### 3.4. V-model

V-model Waterfall-un təkmilləşmiş variantıdır: hər inkişaf mərhələsinin qarşısında ona uyğun test səviyyəsi dayanır. Test planlaşdırılması kod yazılmazdan çox əvvəl başlayır.

&#91;embedded content: V-model · 4 inkişaf mərhələsi və 4 test səviyyəsi\]

Sol qol yuxarıdan aşağı inkişaf mərhələləridir, sağ qol aşağıdan yuxarı test səviyyələri; kəsik xətlər hər cütü birləşdirir.

Məntiq sadədir: tələblər yazılan kimi tester qəbul testlərini hazırlamağa başlayır. Arxitektura hazır olanda inteqrasiya testləri planlaşdırılır. Bu, Prinsip 3-ün (erkən test) praktik tətbiqidir.

### 3.5. Agile (çevik) yanaşma

Agile — məhsulu qısa dövrlərdə, hissə-hissə qurmaq və hər addımda müştəridən rəy almaq fəlsəfəsidir. 2001-ci ildə yazılmış Agile Manifestinin 4 dəyəri:

1. İnsanlar və onların ünsüiyyəti proses və alətlərdən önəmlidir.
2. İşləyən məhsul ətraflı sənədlərdən önəmlidir.
3. Müştəri ilə əməkdaşlıq müqavilə danışıqlarından önəmlidir.
4. Dəyişikliyə reaksiya plana kor-koranə əməl etməkdən önəmlidir.

Qeyd: bu, ikinci tərəfdəkilərin lazımsız olduğu demək deyil. Proses də, sənəd də, plan da lazımdır — sadəcə birinci tərəf daha vacibdir.

### 3.6. Scrum

Scrum Agile-ın ən populyar çərçivəsidir (framework). İş sprintlərə bölünür: 1–4 həftəlik (çox vaxt 2 həftəlik) dövrlər. Hər sprintin sonunda istifadəyə hazır nəticə olur.

**Rollar:**

- **Product Owner** — Product Backlog-u (bütün işlərin prioritetləşdirilmiş siyahısını) idarə edir.
- **Scrum Master** — komandaya Scrum-u düzgün tətbiq etməyə kömək edir, maneələri aradan qaldırır.
- **Developers** — məhsulu quran komanda. Tester də bura daxildir.

**Artefaktlar:**

- **Product Backlog** — məhsul üçün bütün işlərin siyahısı.
- **Sprint Backlog** — bu sprintdə görüləcək işlər.
- **Increment** — sprintin sonunda hazır olan, işləyən nəticə.

**Görüşlər (events):**

| Görüş | Nə vaxt | Tester nə edir |
| --- | --- | --- |
| Sprint Planning | Sprintin əvvəlində | Həkayələri aydınlaşdırır, acceptance criteria-nı soruşur, test işini qiymətləndirir |
| Daily Scrum (standup) | Hər gün, 15 dəqiqə | Nəyi test etdiyini və nəyin mane olduğunu deyir (məsələn, bloklayıcı baq) |
| Sprint Review | Sprintin sonunda | Hazır funksiyaların maraqlı tərəflərə göstərilməsinə kömək edir |
| Sprint Retrospective | Review-dan sonra | Prosesi yaxşılaşdırmaq üçün təklif verir: “tapşırıqlar testə gec gəlir, vaxt qalmır” |

**Definition of Done (DoD — “hazır” anlayışı)** — tapşırığın bitmiş sayılması üçün komandanın razılaşdığı şərtlərdir. Misal: kod yazılıb, code review olunub, unit testlər keçir, QA test edib, açıq kritik baq yoxdur, sənəd yenilənib.

### 3.7. Kanban

Kanban lövhə ilə işin axınını göstərir: To Do → In Progress → Testing → Done. Sprint yoxdur, iş davamlı axır.

Kanban-ın əsas qaydası WIP limitidir (work in progress — eyni vaxtda görülən işlərin limiti). Məsələn, “Testing” sütununda eyni anda 3-dən çox tapşırıq olmamalıdır. Bu, tester-in üstünə iş yığılmasının qarşısını alır.

### 3.8. Modellərin müqayisəsi

|  | Waterfall | V-model | Agile / Scrum |
| --- | --- | --- | --- |
| Tester nə vaxt qoşulur | Kod hazır olandan sonra | Tələblər mərhələsindən | Əvvəldən, hər sprintdə |
| Dəyişikliyin qiyməti | Çox baha | Baha | Ucuz |
| Sənədləşmə | Çox | Çox | Lazım olduğu qədər |
| Müştəri nəticəni görür | Sonda | Sonda | Hər sprintdən sonra |
| Uyğundur | Sabit tələblər | Sabit tələblər, ciddi sahələr (tibb, aviasiya) | Tez dəyişən bazar, startaplar, rəqəmsal məhsullar |

**Ardıcıl, iterativ və inkremental.** Ardıcıl (sequential) modeldə mərhələlər bir dəfə, bir-birinin ardınca keçilir. İterativ (iterative) modeldə məhsul təkrarlanan dövrlərlə yaxşılaşdırılır. İnkremental (incremental) modeldə məhsul hissə-hissə böyüyür: hər dövrdə yeni hissə əlavə olunur. Scrum ikisini birləşdirir.

Model testə belə təsir edir:

- **Ardıcıl modeldə** layihənin əvvəlində yalnız statik test mümkündür, çünki kod hələ yoxdur. Dinamik test sonda olur.
- **İterativ və inkremental modellərdə** hər dövrdə həm statik, həm dinamik test aparılır, regression tez-tez təkrarlanır.
- **Agile-da** sənədlər yüngül olur, regression çox vaxt avtomatlaşdırılır, təcrübəyə əsaslanan texnikalar geniş işlədilir.

**İstənilən modeldə yaxşı test təcrübəsi (good testing practices):**

- Hər inkişaf fəaliyyətinin uyğun test fəaliyyəti var: tələbin review-u, kodun unit testi.
- Hər test səviyyəsinin öz məqsədi var, ona görə test həm tam olur, həm də təkrara düşmür.
- Hər səviyyənin test analizi və dizaynı uyğun inkişaf mərhələsində başlayır (Prinsip 3).
- Tester sənədlərin review-una qaralama hazır olan kimi qoşulur.

### 3.9. Test-first yanaşmalar: TDD, ATDD və BDD {#c3x1}

Bu yanaşmalarda test koddan **əvvəl** yazılır və inkişafı istiqamətləndirir: kod testi keçmək üçün yazılır.

| Yanaşma | Testi kim yazır | Səviyyə | Forma |
| --- | --- | --- | --- |
| TDD (Test-Driven Development) | Proqramçı | Unit | Kodla yazılan unit test |
| ATDD (Acceptance Test-Driven Development) | Komanda: biznes, proqramçı, tester | Sistem, qəbul | Qəbul meyarlarından çıxan testlər |
| BDD (Behavior-Driven Development) | Komanda | Davranış | Given–When–Then (Gherkin) |

**TDD dövrü — qırmızı, yaşıl, refaktor:**

1. Hələ olmayan funksiya üçün test yaz. Test düşür (qırmızı).
2. Testi keçirmək üçün minimum kod yaz. Test keçir (yaşıl).
3. Kodu səliqəyə sal (refactoring). Testlər yaşıl qalmalıdır.

Misal: əvvəl “`calculateDiscount(100, 10)` 90 qaytarır” testi yazılır, sonra funksiya.

**ATDD.** Sprint planlamasında Product Owner, proqramçı və tester (“üç amigo”) user story-ni birlikdə müzakirə edir və qəbul meyarlarını konkret misallarla yazır. Bu görüşə spesifikasiya emalatxanası (specification workshop) deyilir. Misallar qəbul testlərinə çevrilir: əvvəlcə pozitiv, sonra neqativ və qeyri-funksional hallar. Testlər maraqlı tərəflərin başa düşdüyü sadə dillə yazılır, story-dən kənara çıxmır, bir-birini təkrarlamır və EP, BVA kimi texnikalarla çıxarıla bilər. Avtomatlaşdırılanda icra olunan tələblərə (executable requirements) çevrilir. Kod bu testləri keçəndə story hazırdır.

**BDD.** Davranış təbii dilə yaxın formada yazılır (Gherkin, 10-cu fəsil):

```gherkin
Scenario: Promo kod məbləği azaldır
  Given istifadəçinin səbətində 100 AZN-lik məhsul var
  When o TEST10 promo kodunu tətbiq edir
  Then ümumi məbləğ 90 AZN olur
```

Cucumber kimi alətlər bu ssenariləri avtomatik testə çevirir: hər sətrin arxasında kod dayanır.

Tester üçün nəticə: bu yanaşmalarda tester-in ən dəyərli işi koddan əvvəl görülür — misallar, sərhəd halları və neqativ ssenarilər təklif etmək.

### 3.10. DevOps, shift-left və retrospektivlər {#c3x2}

**DevOps** — inkişaf (development) və istismar (operations) komandalarının birgə işləməsidir: kod tez-tez, kiçik hissələrlə və avtomatik olaraq canlıya çıxır. Bunun əsası CI/CD pipeline-dır (20-ci fəsil).

- **Tester üçün faydaları:** hər dəyişiklikdən sonra sürətli rəy, sabit test mühitləri, avtomatik regression, qeyri-funksional testlərin (performans, təhlükəsizlik) pipeline-a qoşulması.
- **Riskləri:** pipeline-ı qurmaq və saxlamaq vaxt tələb edir; zəif yazılmış avtomatik testlər yalançı təhlükəsizlik hissi yaradır. Manual və exploratory test yenə lazımdır.

**Shift-left (sola sürüşdürmə)** — testi SDLC-də mümkün qədər erkən başlatmaqdır (Prinsip 3). Praktikada:

- tələbləri və dizaynı nəzərdən keçirmək (review, 7.4);
- test case-ləri kod yazılmazdan əvvəl yazmaq (ATDD, 3.9);
- hər commit-də CI-də avtomatik testləri işə salmaq;
- dinamik testdən əvvəl statik analiz (məsələn, ESLint);
- qeyri-funksional testlərə imkan olan kimi, komponent səviyyəsində başlamaq.

Shift-left əvvəlcə əlavə iş və xərc tələb edir, amma sonradan defektlərin qiymətini azaldır. Bunu komanda və rəhbərlik birlikdə qəbul etməlidir.

**Retrospektivlər və prosesin yaxşılaşdırılması.** Hər sprintin və ya layihənin sonunda komanda üç suala cavab verir: nə yaxşı getdi, nə pis getdi, nəyi necə yaxşılaşdıracağıq? Tester buraya test prosesinə dair faktlar gətirir. Misal: “Bu sprintdə canlıda 3 baq tapıldı, üçü də yeni ödəniş üsulunda idi — növbəti sprintdə onun üçün API testləri yazaq.” Nəticə konkret tədbir olmalıdır və növbəti retrospektivdə yoxlanmalıdır.

### 3.11. Sprint boyu tester: refinement-dən retrospektivə {#c3x3}

3.6-da görüşlərin adını gördük. İndi iki həftəlik bir sprintə tester-in gözü ilə baxaq.

| Vaxt | Tester nə edir |
| --- | --- |
| Sprintdən əvvəl | Backlog refinement: story-ləri oxuyur, sual verir |
| 1-ci gün | Sprint Planning: test işini qiymətləndirir, story-ləri test tapşırıqlarına bölür |
| 1–3-cü gün | Test ideyaları, checklist, test case və test data hazırlayır |
| 3–8-ci gün | Hazır story-ləri test edir, baq yazır, düzəlişləri yenidən yoxlayır |
| 8–9-cu gün | Regression, qalan retest-lər, açıq baqların vəziyyəti |
| 10-cu gün | Sprint Review və Sprint Retrospective |

Bu, sabit cədvəl deyil: hər komandanın öz ritmi var. Amma məntiq budur: sual əvvəldə, yoxlama ortada, regression sonda.

**Backlog refinement (backlog-un dəqiqləşdirilməsi).** Komanda növbəti sprintlərin story-lərini oxuyur, aydınlaşdırır və qiymətləndirir. Bu, Scrum-un ayrıca rəsmi görüşü deyil, davamlı işdir, amma çox komanda onu görüş kimi keçirir. Tester üçün ən faydalı anlardan biridir: sual burada ən ucuzdur. Story-ni əvvəlcədən oxu və suallarını yaz:

- Qəbul meyarları yoxlanıla bilirmi? “Tez açılmalıdır” necə ölçülür?
- Neqativ hallarda nə olmalıdır?
- Test üçün nə lazımdır: data, hesab, xarici xidmət?

**Planlama.** ISTQB tester-in planlamaya töhfəsini iki səviyyədə göstərir. Reliz planlaması bütün iterasiyalara baxır və ayrıca aparılır, Sprint Planning isə iterasiya planlamasıdır:

- **Reliz planlaması (release planning):** yoxlanıla bilən story və qəbul meyarlarının yazılmasında iştirak, layihə və keyfiyyət risklərinin analizi, test işinin qiymətləndirilməsi, test yanaşmasının seçilməsi, relizin testinin planlanması.
- **İterasiya planlaması (iteration planning):** story-nin ətraflı risk analizi, onun test oluna bilməsinin yoxlanması, story-nin tapşırıqlara, xüsusən test tapşırıqlarına bölünməsi, bu işin qiymətləndirilməsi, funksional və qeyri-funksional tərəflərin dəqiqləşdirilməsi.

Qiymətə yalnız düymə basmağı yox, data hazırlığını, retest-i və regression-u da daxil et (11.9). İş sprintə sığmırsa, bunu planlamada de: son gündə demək gecdir.

**Daily Scrum (stand-up).** Hesabat deyil, komandanın bir-birinə kömək etməsi üçündür. Konkret danış: tiket, vəziyyət, kimdən nə lazımdır.

> Dünən SHOP-210-u bitirdim, iki baq yazdım. Bu gün SHOP-214-ə keçirəm. SHOP-198-in düzəlişi test mühitinə çatmayıb: Elvin, bu gün deploy olacaqmı?

**Sprint Review (demo).** Bir gün əvvəl build-i və test datasını hazırla, göstəriləcək ssenarini bir dəfə keç. Açıq baq varsa, gizlətmə: “Bu hal hələ işləmir, SHOP-230 açıqdır.” Deyilən rəyi itirmə, tiketə çevir.

**Sprint Retrospective.** Faktla gəl (3.10): “Bu sprintdə 6 story-nin 4-ü testə 9-cu gün gəlib, regression-a vaxt qalmayıb.”

**Növbəti işi necə seçmək.** Retest, yeni story və test case eyni anda gözləyəndə bu sıra kömək edir:

1. Komandanı saxlayan bloklayıcı baqlar və kritik retest-lər.
2. Ən yüksək riskli story.
3. Qalan story-lər.
4. Test case və sənədlərin yenilənməsi.

Şübhə varsa, QA lead-dən soruş. “Bunu bu gün çatdıra bilməyəcəyəm” cümləsi vaxtında deyiləndə problem deyil.

### 3.12. Definition of Ready və Definition of Done {#c3x4}

Agile-da giriş və çıxış meyarlarının (4.2) öz adları var.

|  | Definition of Ready (DoR) | Definition of Done (DoD) |
| --- | --- | --- |
| Sual | Bu işə başlamaq olarmı? | Bu iş bitibmi? |
| Meyar növü | Giriş meyarı | Çıxış meyarı |
| Nə vaxt baxılır | Refinement və planlamada | Story bağlananda |
| Misal | Qəbul meyarları yazılıb; dizayn hazırdır; asılılıqlar bəllidir; test datası məlumdur; komanda qiymətləndirib | Kod review olunub; unit testlər keçir; tester qəbul meyarlarını yoxlayıb; açıq Critical baq yoxdur; sənəd yenilənib |

DoD Scrum-un rəsmi hissəsidir. DoR isə komandanın öz razılaşmasıdır: Scrum Guide-da yoxdur və bəzi komandalar onu işlətmir. İki siyahını da komanda özü yazır və retrospektivlərdə yeniləyir.

**Hal 1: story qəbul meyarı olmadan gəlir.** Planlamada de: “Bu story-nin qəbul meyarları yoxdur, nəyi yoxlayacağımı bilmirəm. Product Owner ilə indi yazaq, ya da növbəti sprintə qalsın.” Qərarı komanda və Product Owner verir, sən faktı deyirsən.

**Hal 2: son gün “kod hazırdır”, amma test olunmayıb.** Bu story DoD-u ödəmir, yəni bitməyib. Yollar: növbəti sprintə keçirmək və ya story-ni kiçik hissələrə bölüb hazır olanı bağlamaq. “Testsiz bağlayaq” təklifi DoD-dan imtina deməkdir. Belə qərar verilirsə, riski yazılı de: nə yoxlanmayıb, nə ola bilər, kim qərar verib.

Yaxşı DoD ölçülə bilir. “Keyfiyyətlidir” yox, “açıq Critical baq yoxdur”.

### Diqqət: tez-tez edilən səhvlər

- **“Agile-da sənəd yoxdur.”** Yanlışdır. Sənəd var, sadəcə lazım olduğu qədər.
- **“Scrum-da tester ayrıca roldur.”** Scrum-da belə rol adı yoxdur: tester Developers komandasının üzvüdür, keyfiyyət isə bütün komandanın məsuliyyətidir.
- **Sprintin son günü testə başlamaq.** Bu, pis təcrübədir: test sprint boyu, hər tapşırıq hazır olduqca aparılır.

### Həll olunmuş nümunə

**Tapşırıq.** Dövlət üçün tibbi cihaz proqramı hazırlanır. Tələblər qanunla müəyyənləşib və dəyişmir, hər mərhələ sənədləşdirilməli və yoxlanmalıdır. Hansı model uyğundur və niyə?

**Həll.**

1. Tələblər sabitdir. Deməli, Agile-ın əsas üstünlüyü — dəyişikliyə tez uyğunlaşmaq — burada az lazımdır.
2. Ciddi sənədləşmə və yoxlama tələb olunur. V-model hər inkişaf mərhələsinə qarşı test səviyyəsi və sənəd verir.
3. Səhvin qiyməti çox yüksəkdir (insan sağlamlığı), ona görə testin erkən planlaşdırılması vacibdir.
4. **Cavab: V-model.** Müqayisə üçün: bazara tez çıxmalı olan, istifadəçi rəyinə görə tez-tez dəyişən mobil startap üçün Scrum daha uyğun olardı.

### Sənin növbən

1. Hansı model uyğundur və niyə: (a) hər ay yeni məzmun çıxan onlayn oyun; (b) bankın daxili hesabat sistemi, tələblər bir dəfə təsdiqlənir; (c) yeni sosial şəbəkə ideyası.
2. V-modeldə “arxitektura” mərhələsinə hansı test səviyyəsi uyğun gəlir? Tester bu mərhələdə nə edə bilər?
3. 2 həftəlik sprintdə tester-in hər Scrum görüşündə nə etdiyini öz sözlərinlə yaz.
4. Kağızda Kanban lövhəsi çək: kursundakı tapşırıqları To Do / In Progress / Done sütunlarına yerləşdir.
5. Öz komandan üçün 5 bəndlik Definition of Done yaz.

### Özünü yoxla

- SDLC-nin 6 mərhələsini sadala.
- Waterfall-ın test baxımından əsas zəif cəhəti nədir?
- Scrum-un 3 rolunu və 4 görüşünü sadala.
- DoD nədir və tester üçün niyə vacibdir?

## Fəsil 4. STLC: testin həyat dövrü

STLC (Software Testing Life Cycle — testin həyat dövrü) test işinin ardıcıl mərhələləridir: tələbləri təhlil etməkdən yekun hesabata qədər. SDLC bütün məhsulun yoludur, STLC isə onun içində test işinin yolu.

### 4.1. Altı mərhələ

1. **Tələblərin analizi (Requirement Analysis).** Nəyi test edəcəyik? Tələblər oxunur, qeyri-müəyyən yerlər tapılır, suallar verilir.
2. **Test planlaşdırması (Test Planning).** Necə, kim, nə vaxt və nə ilə test edəcəyik? Scope, yanaşma, resurslar, cədvəl, risklər müəyyənləşir. Nəticə test planıdır (Fəsil 11); adətən QA lead hazırlayır.
3. **Test dizaynı (Test Case Development).** Test case-lər, checklist-lər və test data hazırlanır.
4. **Test mühitinin hazırlanması (Test Environment Setup).** Server, test versiyası (build), brauzerlər, cihazlar, test hesabları hazır olur. Mühit smoke test ilə yoxlanılır.
5. **Testin icrası (Test Execution).** Test case-lər icra olunur, nəticə qeyd edilir, defektlər yazılır, düzəlişlər təkrar yoxlanılır.
6. **Testin bağlanması (Test Closure).** Yekun hesabat (test summary report), metriklər və alınan dərslər (lessons learned) hazırlanır.

| Mərhələ | Giriş meyarı (nə hazır olmalıdır) | Əsas işlər | Çıxış meyarı / nəticə |
| --- | --- | --- | --- |
| 1. Tələblərin analizi | Tələb sənədi və ya user story-lər | Oxumaq, sual vermək, risk tapmaq | Suallar siyahısı, test olunacaq tələblər |
| 2. Planlaşdırma | Təhlil olunmuş tələblər | Scope, yanaşma, cədvəl, risklər | Təsdiqlənmiş test planı |
| 3. Test dizaynı | Test planı, tələblər | Test case, checklist, test data | Nəzərdən keçirilmiş test case-lər |
| 4. Mühit | Test planı, build | Server, cihazlar, hesablar | Smoke testdən keçmiş mühit |
| 5. İcra | Hazır test case-lər, işlək mühit | İcra, bug report, retest, regression | Nəticələr, defekt hesabatları |
| 6. Bağlanış | İcra bitib, çıxış meyarları ödənib | Hesabat, metriklər, dərslər | Test summary report |

### 4.2. Giriş və çıxış meyarları (entry / exit criteria)

**Giriş meyarı** — mərhələyə başlamaq üçün nəyin hazır olması lazımdır. **Çıxış meyarı** — mərhələ nə vaxt bitmiş sayılır.

Təyyarə uçuşunu düşün. Giriş: yanacaq doldurulub, sərnişinlər oturub, qapılar bağlanıb. Çıxış: təyyarə dayanıb, mühərriklər söndürülüb.

Test icrası üçün çıxış meyarı misalı:

- Planlaşdırılmış test case-lərin 100%-i icra olunub.
- Test case-lərin ən azı 95%-i keçib.
- Açıq Blocker və Critical defekt yoxdur.
- Açıq Major defektlər üçün Product Owner-in razılığı var.

**Diqqət.** “Bütün baqlar düzəldilib” real çıxış meyarı deyil — Prinsip 1 və 2-ni xatırla. Meyarlar ölçülə bilən olmalıdır.

**Tipik giriş meyarları:** resurslar hazırdır (adam, alət, mühit, test data, vaxt); testware hazırdır (test əsası, yoxlanıla bilən tələblər, test case-lər); test olunan məhsulun ilkin keyfiyyəti yetərlidir (məsələn, smoke test keçib).

**Tipik çıxış meyarları:** tamlıq ölçüləri (əhatə səviyyəsi, açıq defektlərin sayı, defekt sıxlığı, düşən test case-lərin sayı) və tamamlanma şərtləri (planlaşdırılmış testlər icra olunub, statik test aparılıb, tapılan defektlər qeydə alınıb, regression testlər avtomatlaşdırılıb).

Vaxtın və ya büdcənin bitməsi də çıxış səbəbi ola bilər, amma yalnız maraqlı tərəflər riski görüb qəbul edəndə.

Agile-da çıxış meyarına çox vaxt **Definition of Done**, story-nin giriş meyarına isə **Definition of Ready** deyilir (3.12).

### 4.3. Test statusları

| Status | Mənası | Misal |
| --- | --- | --- |
| Passed (keçdi) | Faktiki nəticə gözlənilənə uyğundur | Düzgün şifrə ilə daxil olmaq mümkündür |
| Failed (düşdü) | Faktiki nəticə gözləniləndən fərqlidir — defekt var | Düzgün şifrə ilə xəta çıxır |
| Blocked (bloklanıb) | Testi icra etmək mümkün deyil, başqa problem mane olur | Login işləmədiyi üçün profil testlərinə keçmək mümkün deyil |
| Skipped / Not run (icra olunmayıb) | Qəsdən buraxılıb və ya hələ növbəsi çatmayıb | Funksiya bu relizdən çıxarılıb |

### 4.4. Metriklər: keyfiyyət rəqəmlərlə

Yekun hesabatda ən çox bu sadə metriklər işlənir:

- **İcra faizi** = icra olunan test case-lər / planlaşdırılanlar × 100
- **Keçid faizi (pass rate)** = keçənlər / icra olunanlar × 100
- **Defekt sayı** — ciddiliyə görə, açıq və bağlı olmaqla

**Misal.** 120 test case planlaşdırılıb, 114-ü icra olunub, 108-i keçib. İcra faizi: 114 / 120 = 95%. Pass rate: 108 / 114 ≈ 94,7%.

ISTQB metrikləri belə qruplaşdırır:

| Qrup | Misal |
| --- | --- |
| Layihənin gedişi | Bitmiş tapşırıqlar, sərf olunan iş |
| Testin gedişi | Hazır test case-lər, icra olunan, keçən və düşən testlər, icra vaxtı |
| Məhsulun keyfiyyəti | Xidmətin işlək olma faizi (availability), cavab müddəti, nasazlığa qədər orta vaxt (MTTF) |
| Defektlər | Tapılan və düzəldilən defektlərin sayı və prioriteti, defekt sıxlığı, defekt aşkarlama faizi (DDP) |
| Risk | Qalan riskin səviyyəsi |
| Əhatə | Tələb əhatəsi, kod əhatəsi |
| Xərc | Testin dəyəri, keyfiyyətin təşkilata dəyəri |

**Defekt sıxlığı (defect density)** ölçüyə düşən defektdir: 8 defekt / 4000 sətir kod, yəni hər 1000 sətrə 2 defekt. **Defekt aşkarlama faizi (defect detection percentage, DDP)** testin tapdığının bütün defektlərə nisbətidir: testdə 90, canlıda 10 defekt tapılıbsa, DDP = 90 / 100 = 90%.

### 4.5. Agile-da STLC

Scrum-da bu 6 mərhələ hər sprintdə kiçik miqyasda təkrarlanır. Sprint planning-də analiz və planlaşdırma, sprint boyu dizayn və icra, retrospektivdə bağlanış və dərslər olur. Mərhələlər qısadır və bir-birinə qarışır, amma məntiq eynidir.

### 4.6. Monitorinq, hesabatlar və konfiqurasiya idarəetməsi {#c4x1}

**Test monitorinqi** — planı faktiki vəziyyətlə müqayisə etmək: neçə test icra olunub, neçəsi keçib, neçə açıq defekt var (metriklər, 4.4). **Test nəzarəti (test control)** — fərq varsa, tədbir görmək: prioritetləri dəyişmək, riskli sahəyə əlavə test, relizi təxirə salmağı təklif etmək.

| Hesabat | Nə vaxt | Nə yazılır |
| --- | --- | --- |
| Gedişat hesabatı (test progress report) | Müntəzəm: gündəlik, həftəlik, sprint sonu | Gedişat, metriklər, maneələr, risklər, növbəti addımlar |
| Yekun hesabat (test completion report) | Mərhələnin və ya relizin sonunda | Nə test olundu, nəticələr, açıq defektlər, qalan risklər, çıxış meyarları, dərslər |

Hesabatı oxucuya uyğunlaşdır: komandaya detallar, rəhbərliyə qısa xülasə və risklər lazımdır. Agile komandada status çox vaxt Daily Scrum-da, lövhədə (board) və dashboard-larda (məsələn, burn-down qrafiki) görünür. Başqa yollar: e-poçt və çat, onlayn sənəd, rəsmi hesabat. Seçim komandadan asılıdır: paylanmış komanda və ya rəsmi tələb varsa, yazılı forma seçilir. Yekun hesabatın şablonu Əlavə B.4-dədir.

**Konfiqurasiya idarəetməsi (configuration management)** — testin bütün hissələrini versiyaları ilə izləmək: test olunan build, mühit, test case-lər, avtomatik skriptlər, test data. Məqsəd: hər nəticənin hansı versiyada alındığını bilmək və testi təkrarlaya bilmək.

- Hər bug report-da build nömrəsi və mühit yazılır (12.1).
- Test case-lər və avtomatik testlər versiya sistemində saxlanılır (Git, 20-ci fəsil).
- **Baseline** — razılaşdırılmış versiyadır; ondan sonra dəyişikliklər yalnız qaydaya uyğun edilir.
- **Konfiqurasiya elementi (configuration item)** — izlənən hər şey: test planı, test case, skript, test data, mühitin ayarı. Hər birinin unikal adı və versiyası var, bir-biri ilə əlaqəsi bəllidir, lazım olanda əvvəlki baseline-a qayıtmaq olur. DevOps-da bu iş çox vaxt pipeline-da avtomatik gedir.

“Login testi keçdi” cümləsinin dəyəri yoxdur, əgər hansı build-də və hansı mühitdə keçdiyi bəlli deyilsə.

### 4.7. ISTQB-nin yeddi test fəaliyyəti və iki rol {#c4x2}

4.1-dəki altı mərhələ iş elanlarında və müsahibələrdə çox işlədilir. ISTQB sillabusu isə test prosesini yeddi fəaliyyətlə təsvir edir. Məzmun eynidir, bölgü fərqlidir. Fəaliyyətlər ardıcıl görünsə də, çox vaxt bir-birinə qarışır və təkrarlanır.

| Fəaliyyət | Əsas sual | Nə olur | Nəticə (testware) |
| --- | --- | --- | --- |
| Test planlaşdırması | Məqsəd nədir, necə çatacağıq? | Məqsəd və yanaşma seçilir | Test planı, cədvəl, risk reyestri, giriş və çıxış meyarları |
| Monitorinq və nəzarət | Plana uyğun gedirikmi? | Plan və fakt müqayisə olunur, tədbir görülür | Gedişat hesabatı, qərarlar |
| Test analizi | Nəyi test edəcəyik? | Test əsası təhlil olunur, test şərtləri çıxarılır və prioritetləşdirilir | Test şərtləri, test əsasındakı defektlərin report-ları |
| Test dizaynı | Necə test edəcəyik? | Şərtlərdən test case, əhatə elementləri, data və mühit tələbləri çıxarılır | Test case, charter, əhatə elementləri |
| Test implementasiyası | İcra üçün hər şey hazırdırmı? | Prosedur, dəst, skript, data və mühit hazırlanır, icra cədvəli qurulur | Test prosedurları, test dəstləri, skriptlər, icra cədvəli, stub və driver-lər |
| Test icrası | Nəticə nədir? | Testlər işlədilir, nəticələr müqayisə olunur, anomaliyalar təhlil olunur | Test jurnalı (test log), bug report-lar |
| Testin tamamlanması | Nə öyrəndik? | Açıq defektlər üçün dəyişiklik sorğuları, testware-in arxivi, mühitin bağlanması, dərslər | Yekun hesabat, dərslər, dəyişiklik sorğuları |

Dörd terminə diqqət:

- **Test əsası (test basis)** — testin çıxarıldığı mənbə: tələblər, user story, dizayn, kod, risk analizi.
- **Test şərti (test condition)** — yoxlanılacaq şey: “Vaxtı keçmiş promo kod rədd olunur.” Test şərti “nə”, test case “necə”dir.
- **Əhatə elementi (coverage item)** — əhatənin sayıldığı vahid: sinif, sərhəd dəyəri, sütun, keçid, operator, budaq.
- **Test proseduru (test procedure)** — test case-lərin icra ardıcıllığı. Giriş testi səbət testindən əvvəl gəlir.

**Altı mərhələ ilə əlaqə.**

| STLC (4.1) | ISTQB fəaliyyəti |
| --- | --- |
| Tələblərin analizi | Test analizi |
| Test planlaşdırması | Test planlaşdırması |
| Test dizaynı | Test dizaynı, qismən implementasiya |
| Test mühitinin hazırlanması | Test implementasiyası |
| Testin icrası | Test icrası |
| Testin bağlanması | Testin tamamlanması |
| Bütün mərhələlər boyu | Monitorinq və nəzarət |

**Proses konteksdən asılıdır.** Hansı texnika, nə qədər sənəd, nə qədər avtomatlaşdırma seçiləcəyini bu amillər həll edir: maraqlı tərəflər, komandanın bacarığı və sayı, biznes sahəsi, texniki amillər, layihə məhdudiyyətləri (scope, vaxt, büdcə, resurs), təşkilat qaydaları, SDLC və alətlər. Startapa yüngül checklist kifayət edə bilər, bank isə izlənə bilən sənədlər tələb edir.

**İki rol.**

| Rol | Nəyə cavabdehdir | Əsas fəaliyyətlər |
| --- | --- | --- |
| Test idarəetmə rolu (test management) | Test prosesi, test komandası, rəhbərlik | Planlaşdırma, monitorinq və nəzarət, tamamlanma |
| Test rolu (testing) | Testin mühəndislik tərəfi | Analiz, dizayn, implementasiya, icra |

Rol vəzifə adı deyil. Test idarəetmə rolunu test meneceri, komanda rəhbəri və ya inkişaf meneceri daşıya bilər; Agile-da bu işlərin bir hissəsini komanda özü görür. Bir adam eyni vaxtda hər iki rolu da daşıya bilər.

### 4.8. Test mühitləri və build {#c4x3}

Eyni proqram bir neçə yerdə işləyir. Hər belə yer mühitdir (environment). Mühitlərin sayı və adı şirkətdən şirkətə dəyişir, tipik mənzərə belədir:

| Mühit | Kim işlədir | Data | Tester nə edir |
| --- | --- | --- | --- |
| Development (dev, local) | Proqramçı | Az, saxta | Adətən heç nə; bəzən düzəlişə birlikdə baxır |
| Test (QA) | Tester | Test datası, silinə bilər | Əsas iş yeri: story testi, retest |
| Staging (pre-prod) | Tester, Product Owner, bəzən müştəri | Canlıya bənzər, anonimləşdirilmiş | Reliz öncəsi regression, qəbul testi |
| Production (prod, canlı) | Real istifadəçilər | Real | Yalnız icazə ilə: reliz sonrası smoke, baqı təsdiqləmək |

**Build** — kodun müəyyən versiyasından yığılmış nəticədir. **Deploy** — build-in mühitə qoyulmasıdır. Test nəticəsinin dəyəri build-lə bağlıdır (4.6).

Build nömrəsini harada axtarmaq: səhifənin aşağısı və ya “Haqqında” bölməsi, API-nin versiya cavabı, mobil tətbiqin ayarları, CI hesabatı (Fəsil 20), komandanın deploy kanalı. Tapa bilmirsənsə, soruş və cavabı wiki-yə yaz (11.11).

**Retest-dən əvvəl üç sual.**

1. Düzəliş hansı build-dədir? Tiketdəki Fix Version-a və ya proqramçının qeydinə bax.
2. Bu build mənim mühitimdədirmi? Deploy bitibmi?
3. Brauzer köhnə faylları göstərmir ki? Keşi təmizlə və ya gizli pəncərədə aç (13.8).

Düzəliş mühitindəki build-dədirsə, deploy bitibsə, keş də təmizdirsə və baq yenə qalırsa, tiketi Reopened et.

**Bir mühitdə var, digərində yox.** Build-i, ayarları, datanı və xarici xidmətləri müqayisə et. Tiketə hər iki mühitin nəticəsini yaz: bu fərq proqramçı üçün ən yaxşı ipucudur.

**Canlı mühit qaydaları.**

- Yalnız icazə ilə və şirkətin test hesabı ilə işlə.
- Real sifariş, real ödəniş, real məktub yaratma.
- Müştəri datasına baxma, onu ekran şəklinə salma, heç yerə köçürmə.
- Şübhə varsa, əvvəl soruş.

### 4.9. Test edə bilmirsənsə: bloklanma {#c4x4}

Mühit düşüb, build gəlməyib, data yoxdur, suala cavab gəlmir. Junior-un əsas səhvi sakitcə gözləməkdir. Beş addım:

1. **Problemin səndə olmadığını yoxla.** Başqa brauzer, gizli pəncərə, başqa hesab. Test mühiti şirkət şəbəkəsindən açılırsa, VPN (şirkət şəbəkəsinə təhlükəsiz qoşulma) qoşuludurmu? Həmkarda işləyirmi?
2. **Sahibinə faktlarla yaz.** Mühit — DevOps və ya komandanın kanalı. Build — proqramçı. Tələb — Product Owner.
3. **Görünən et.** Tiketə qeyd yaz, testləri səbəbi ilə Blocked et (4.3), stand-up-da de.
4. **Mümkün olan işə keç.** Test dizaynı, başqa story-nin retest-i, başqa sahənin exploratory testi, test case-lərin yenilənməsi.
5. **Vaxt qoy və yüksəlt.** “Günortaya qədər cavab olmasa, QA lead-ə deyəcəyəm.” Sprintə təsirini de: “SHOP-220 bu sprintə çatmaya bilər.”

Yaxşı mesaj nümunəsi:

```text
Salam! Test mühiti bu gün 10:20-dən 502 qaytarır.
Chrome və Firefox-da, iki hesabla yoxladım, Anar-da da eynidir.
SHOP-214 və SHOP-220-nin testi dayanıb.
Kim baxa bilər? Ekran şəkli əlavədədir.
```

Pis mesaj: “Mühit işləmir.” Oxuyan nə baş verdiyini, nə vaxtdan olduğunu və nəyin dayandığını bilmir.

**Blocked və Failed fərqi.** Failed: test işlədi, nəticə gözləniləndən fərqlidir. Blocked: test işləyə bilmədi. Blocked testi Failed yazma, yoxsa hesabatda məhsul olduğundan pis görünür.

### 4.10. Reliz günü: go/no-go, hotfix, rollback {#c4x5}

Reliz (release) yeni versiyanın istifadəçilərə çatmasıdır. Tipik yol:

| Addım | Nə olur | Tester nə edir |
| --- | --- | --- |
| 1. Reliz namizədi (release candidate) | Relizə düşəcək versiya seçilir, staging-ə qoyulur (ayrıca staging yoxdursa, test mühitinə) | Smoke, retest, regression |
| 2. Go/No-Go görüşü | Buraxaq, ya yox? | Faktları deyir: nə yoxlanıb, açıq baqlar, qalan risklər |
| 3. Deploy | Versiya canlıya çıxır | Hazır gözləyir |
| 4. Reliz sonrası smoke | Canlıda əsas funksiyalar yoxlanır | Test hesabı ilə qısa yoxlama (4.8) |
| 5. Monitorinq | Xətalar, loglar, dəstək müraciətləri izlənir | Müraciətləri təkrarlamağa kömək edir |
| 6. Reliz qeydləri | Nə dəyişib, bilinən problemlər (known issues) | Açıq baqların siyahısına kömək edir |

**Qərarı kim verir?** Tester tövsiyə edir, biznes qərar verir (4.2). Go/No-Go görüşündə belə danış:

> Regression bitib: 120 testdən 116-sı keçib, 4-ü düşüb, hamısı SHOP-311-ə görədir. SHOP-311 Major-dur, müvəqqəti həlli var. Android 10 yoxlanmayıb, cihaz yox idi. Tövsiyəm: buraxmaq və SHOP-311-i bilinən problemlərə yazmaq.

**Hotfix (təcili düzəliş)** canlıdakı ciddi problem üçün tez buraxılan kiçik dəyişiklikdir. Test də qısa olur: düzəlişin retest-i, təsir analizi (5.6), ən vacib funksiyaların smoke testi, deploy-dan sonra canlıda yoxlama. Tam regression çox vaxt növbəti relizə qalır, ona görə nəyin yoxlanmadığını yaz. Bir sual da ver: düzəliş əsas koda da düşürmü? Yoxsa növbəti relizdə baq geri qayıdır.

**Rollback (geri qaytarma)** yeni versiyanı götürüb əvvəlkini qaytarmaqdır. Qərarı adətən reliz məsulu və ya texniki lider verir. Sonra tester smoke aparır: köhnə versiya işləyirmi, bu arada yaranan data pozulmayıb ki?

### Diqqət: tez-tez edilən səhvlər

- **Test dizaynını icraya saxlamaq.** “Test edərkən fikirləşərəm” yanaşmasında vacib hallar unudulur.
- **Blocked-u Failed kimi qeyd etmək.** Failed — yoxlanan funksiyada defekt var. Blocked — testi icra etmək mümkün olmadı.
- **Mühiti yoxlamadan testə başlamaq.** Saatlarla test edib sonra mühitin səhv qurulduğunu görmək vaxt itkisidir.

### Həll olunmuş nümunə

**Tapşırıq.** Mobil bank tətbiqinə “Kommunal ödəniş” funksiyası (işıq, su, qaz) əlavə olunur. STLC-nin hər mərhələsində görüləcək bir konkret işi yaz.

**Həll.**

1. **Analiz:** suallar — Hansı xidmətlər? Komissiya varmı? Minimum məbləğ nədir? Qəbz göndərilirmi? Ödəniş uğursuz olarsa, pul nə vaxt qayıdır?
2. **Planlaşdırma:** scope — 3 xidmət, Android və iOS; müddət 5 iş günü. Risk: test mühitində real ödəniş sistemi yoxdur, saxta (mock) servis lazımdır.
3. **Dizayn:** test case-lər — uğurlu ödəniş, balans kifayət etmir, yanlış abonent kodu, ödəniş zamanı internet kəsilir, təkrar ödəniş cəhdi.
4. **Mühit:** test serveri, test kartları, iki telefon (Android və iOS), test hesabları. Smoke test: tətbiq açılır, login olur, ödəniş bölməsi açılır.
5. **İcra:** 40 test case icra olundu, 3 defekt tapıldı. Biri düzəldildi və retest-dən keçdi, Minor olan ikisi növbəti relizə saxlanıldı.
6. **Bağlanış:** hesabat — 40 test case-dən 38-i keçdi, 2-si açıq Minor defektlərə görə Failed qaldı. Komanda relizi tövsiyə edir.

### Sənin növbən

1. Onlayn kitab mağazasında “İstək siyahısı” (wishlist) funksiyası üçün STLC-nin hər mərhələsində bir iş yaz.
2. Test icrası üçün 3 ölçülə bilən çıxış meyarı yaz.
3. “Blocked” və “Failed” fərqini öz misalınla izah et.
4. 80 test case planlaşdırılıb, 72-si icra olunub, 63-ü keçib. İcra faizini və pass rate-i hesabla.

### Özünü yoxla

- STLC-nin 6 mərhələsini sırası ilə sadala.
- Giriş və çıxış meyarı nədir? Hər birinə misal göstər.
- Niyə test mühitini smoke test ilə yoxlamaq lazımdır?
- STLC Agile-da necə dəyişir?

# II hissə — Test səviyyələri, növləri və yanaşmaları

## Fəsil 5. Test səviyyələri

Test səviyyələri sistemin hansı miqyasda yoxlandığını göstərir: ən kiçik kod parçasından tutmuş bütöv məhsulun müştəri tərəfindən qəbuluna qədər. Bu kitabda dörd səviyyədən danışırıq: unit, inteqrasiya, sistem və qəbul testi. ISTQB inteqrasiyanı ikiyə bölür, ona görə orada beş səviyyə var: komponent (unit), komponent inteqrasiyası, sistem, sistem inteqrasiyası və qəbul.

Avtomobil zavodunu yenə xatırla. Əvvəlcə hər detal ayrıca yoxlanılır (təkər, mühərrik) — bu, unit testdir. Sonra detalların birləşməsi (mühərrik və sürət qutusu) — inteqrasiya. Sonra bütün maşın yolda — sistem. Nəhayət müştərinin sınaq sürüşü — qəbul.

### 5.1. Unit test (modul testi)

- **Nə yoxlanılır:** kodun ən kiçik hissəsi — bir funksiya, bir metod, bir komponent ayrıca.
- **Kim edir:** adətən proqramçının özü.
- **Necə:** kodla yazılan avtomatik testlərlə. Alətlər: Jest, Vitest (JavaScript), JUnit (Java), pytest (Python).
- **Misal:** `calculateDiscount(100, 10)` funksiyası 90 qaytarmalıdır. Unit test bunu UI, server və baza olmadan yoxlayır.
- **Niyə vacibdir:** defekti ən ucuz və ən tez tapır. Proqramçı kodu dəyişəndə nəyisə sındırıb-sındırmadığını dərhal görür.

### 5.2. İnteqrasiya testi (integration testing)

- **Nə yoxlanılır:** modulların və ya sistemlərin bir-biri ilə əlaqəsi — məlumat düzgün ötürülürmü?
- **İki növü var:** komponent inteqrasiyası (bir sistemin daxilindəki modullar) və sistem inteqrasiyası (xarici xidmətlər: ödəniş sistemi, SMS servisi, xəritə).
- **Misal:** qeydiyyat modulu istifadəçini yaradır, e-poçt servisi təsdiq məktubu göndərir. Hər modul ayrıca işləyir. Amma qeydiyyat modulu emaili səhv formatda ötürürsə, məktub getmir — bu, inteqrasiya defektidir.

İnteqrasiyanın üç yanaşması var:

- **Big Bang** — bütün modullar birdən birləşdirilir. Defekt çıxanda onun yerini tapmaq çətindir.
- **Top-down (yuxarıdan aşağı)** — hazır olmayan aşağı modulların yerinə “stub” (saxta əvəzedici) qoyulur.
- **Bottom-up (aşağıdan yuxarı)** — hazır olmayan yuxarı modulların yerinə “driver” (çağırıcı proqram) işlədilir.

Tester üçün: API testləri (Fəsil 15) çox vaxt inteqrasiya səviyyəsində aparılır.

### 5.3. Sistem testi (system testing)

- **Nə yoxlanılır:** bütöv sistem, istifadəçi gözü ilə, uçdan-uca (end-to-end).
- **Kim edir:** tester-lər.
- **Harada:** istehsala (production) mümkün qədər yaxın test mühitində.
- **Nələr:** həm funksional (nə edir), həm qeyri-funksional tərəflər (necə edir: sürət, təhlükəsizlik).
- **Misal:** onlayn mağazada istifadəçi qeydiyyatdan keçir, məhsul axtarır, səbətə əlavə edir, ödəyir və təsdiq emaili alır.

Manual tester-in işinin əsas hissəsi bu səviyyədədir.

### 5.4. Qəbul testi (acceptance testing)

Qəbul testi bu suala cavab verir: məhsul biznes ehtiyaclarına və istifadəçi gözləntilərinə cavab verirmi, qəbul etməyə hazırdırmı? Növləri:

- **UAT (User Acceptance Testing — istifadəçi qəbul testi)** — real istifadəçilər və ya müştəri nümayəndələri real ssenarilərlə yoxlayır.
- **Alpha test** — şirkətin daxilində, proqramçılardan başqa əməkdaşlar tərəfindən.
- **Beta test** — real istifadəçilərin kiçik qrupu tərəfindən, real mühitdə (məsələn, “beta versiya” yükləyənlər).
- **Operational acceptance (əməliyyat qəbulu)** — ehtiyat nüsxə, bərpa, monitorinq kimi texniki hazırlıq.
- **Müqavilə və qanuni qəbul (contractual / regulatory)** — müqavilə şərtlərinə və qanunlara uyğunluq.

**Misal.** Bank yeni internet-bankçılığı 20 əməkdaşa və 200 seçilmiş müştəriyə bir ay işlətməyə verir. Əməkdaşların testi alpha, müştərilərinki isə beta testdir.

### 5.5. Müqayisə

| Səviyyə | Nə yoxlanılır | Kim edir | Onlayn mağaza misalı |
| --- | --- | --- | --- |
| Unit | Bir funksiya, komponent | Proqramçı | Endirim hesablayan funksiya düzgün nəticə verir |
| İnteqrasiya | Modullar arası əlaqə | Proqramçı, tester | Səbət modulu ödəniş servisinə düzgün məbləğ ötürür |
| Sistem | Bütöv sistem | Tester | Qeydiyyatdan ödənişə qədər tam alış ssenarisi |
| Qəbul | Biznes ehtiyacına uyğunluq | Müştəri, istifadəçilər | Mağaza sahibi real sifarişlərlə sistemi qəbul edir |

ISTQB səviyyələri bu xüsusiyyətlərlə fərqləndirir: test obyekti (nə yoxlanılır), məqsəd, test əsası (test nəyə əsasən yazılır), tipik defektlər və cavabdehlik.

| Səviyyə (ISTQB) | Test əsası | Tipik defektlər | Kim edir |
| --- | --- | --- | --- |
| Komponent (unit) | Komponentin dizaynı, kod | Səhv məntiq, səhv hesablama | Proqramçı |
| Komponent inteqrasiyası | Dizayn, modullar arası interfeyslər | Səhv data formatı, səhv çağırış ardıcıllığı | Adətən proqramçı |
| Sistem | Tələblər, user story, use case | Səhv biznes qaydası, uçdan-uca ssenarinin pozulması, qeyri-funksional problemlər | Tester |
| Sistem inteqrasiyası | Xarici sistemlərin interfeysləri, API sənədi | Xarici xidmətin cavabının səhv emalı | Adətən tester |
| Qəbul | Biznes tələbləri, qəbul meyarları, müqavilə | Məhsul biznes ehtiyacını ödəmir | Müştəri, istifadəçilər |

Unit testlər çox vaxt xüsusi dəstək tələb edir: unit test framework-ü və ya test harness (testi işlədən köməkçi kod). Sistem inteqrasiyası üçün isə canlıya mümkün qədər yaxın mühit lazımdır.

### 5.6. Baxım testi (maintenance testing) {#c5x1}

Məhsul canlıya çıxandan sonra da dəyişir və hər dəyişiklik test tələb edir. Buna baxım testi deyilir. Onun səbəbləri (triggers):

- **Dəyişiklik (modification):** yeni funksiya, defekt düzəlişi, təcili düzəliş (hotfix), əməliyyat sisteminin və ya kitabxananın yenilənməsi.
- **Köçürmə (migration):** sistemin yeni serverə, buluda və ya platformaya keçməsi; köhnə datanın yeni sistemə köçürülməsi.
- **İstismardan çıxarma (retirement):** sistem bağlananda datanın arxivlənməsi, saxlanma müddəti və bərpa imkanı yoxlanır.

| Hadisə | Nə test olunur |
| --- | --- |
| Ödəniş xidmətinin yeni versiyası | Ödəniş, geri qaytarma, xəta halları və regression |
| Bazanın yeni serverə köçürülməsi | Datanın tam və düzgün köçməsi, performans, ehtiyat nüsxə |
| Köhnə mobil tətbiqin bağlanması | Datanın arxivi, istifadəçilərə bildiriş, yeni tətbiqə yönləndirmə |

Baxım testinin iki hissəsi var: dəyişikliyin özünü yoxlamaq və dəyişməyən hissələrin sınmadığını yoxlamaq (regression). Nə qədər test lazım olduğunu **təsir analizi (impact analysis)** göstərir: dəyişiklik sistemin hansı hissələrinə toxuna bilər? Məsələn, endirim hesablaması dəyişibsə, səbət, sifariş, qəbz və hesabatlar yoxlanır, profil səhifəsi isə yox.

Təsir analizi çətinləşir, əgər tələblər və testlər köhnəlibsə, izlənə bilmə (1.6) yoxdursa, avtomatik regression testləri azdırsa və sistemi bilən adamlar komandadan gedibsə.

### Diqqət: tez-tez edilən səhvlər

- **Səviyyəni növlə qarışdırmaq.** Səviyyə “hansı miqyasda?” sualına cavab verir, növ isə “nəyi yoxlayırıq?” sualına. Sistem səviyyəsində həm funksional, həm performans testi ola bilər.
- **“Unit test tester-in işi deyil, bilmək lazım deyil.”** Bilmək lazımdır: proqramçı ilə danışanda nəyin artıq yoxlandığını başa düşməlisən.
- **UAT-ı tester-in işi saymaq.** UAT-da əsas söz istifadəçinindir. Tester ona kömək edə, ssenari hazırlaya bilər.

### Həll olunmuş nümunə

**Tapşırıq.** Taksi tətbiqi. Hər yoxlamanın səviyyəsini müəyyən et:

- (a) Qiyməti hesablayan funksiya 5 km üçün 5 × 0,80 + 1,50 = 5,50 AZN qaytarırmı?
- (b) Sərnişin sifariş verəndə sürücü tətbiqinə bildiriş gedirmi?
- (c) Sərnişin tətbiqi açır, taksi çağırır, gedir, ödəyir və sürücünü qiymətləndirir — tam ssenari.
- (d) 50 real sürücü və sərnişin yeni versiyanı bir həftə şəhərdə istifadə edir.

**Həll.**

1. **(a) Unit** — bir funksiya kod səviyyəsində yoxlanılır, UI və server lazım deyil.
2. **(b) İnteqrasiya** — sərnişin tətbiqi, server və sürücü tətbiqi arasında məlumatın ötürülməsi yoxlanılır.
3. **(c) Sistem** — bütöv sistem istifadəçi gözü ilə, uçdan-uca.
4. **(d) Qəbul (beta test)** — real istifadəçilər, real mühit.

### Sənin növbən

1. Yemək çatdırılması tətbiqi üçün hər səviyyəyə bir yoxlama yaz.
2. Niyə UAT-ı adətən tester yox, real istifadəçilər edir?
3. Bir inteqrasiya defekti misalı yaz: iki hissə ayrıca işləyir, birlikdə isə yox.
4. Alpha və beta testin fərqini cədvəl şəklində yaz.

### Özünü yoxla

- 4 test səviyyəsini və hər birinin məqsədini de.
- Stub və driver nədir?
- Test səviyyəsi ilə test növü arasında fərq nədir?
- Beta test kim tərəfindən və harada aparılır?

## Fəsil 6. Test növləri

Test növü “nəyi yoxlayırıq?” sualına cavab verir. Ən böyük bölgü funksional və qeyri-funksional testdir. Bundan başqa, dəyişikliklərlə bağlı dörd növ var: smoke, sanity, retest və regression.

ISTQB dörd test növü sayır: funksional, qeyri-funksional, black-box və white-box (son ikisi Fəsil 7-də). Dördü də bütün səviyyələrdə işlədilə bilər, sadəcə fokus dəyişir: unit səviyyəsində də performans ölçmək olar, qəbul testində də funksiyanı yoxlamaq.

Mobil telefonu düşün. Zəng edə bilirmi, mesaj göndərə bilirmi — bunlar funksionaldır. Batareya nə qədər davam edir, nə qədər tez açılır, düşəndə sınırmı — bunlar qeyri-funksionaldır.

### 6.1. Funksional test (functional testing)

Funksional test sistemin NƏ etdiyini yoxlayır: tələbdə yazılan davranış düzgün işləyirmi? Misallar: login, qeydiyyat, axtarış, səbətə əlavə, ödəniş, filtr, hesabat çıxarmaq.

### 6.2. Qeyri-funksional test (non-functional testing)

Qeyri-funksional test sistemin NECƏ işlədiyini yoxlayır: nə qədər sürətli, etibarlı, rahat və təhlükəsiz.

| Növ | Nəyi yoxlayır | Misal |
| --- | --- | --- |
| Performance (performans) | Sürət və cavab müddəti | Səhifə 2 saniyədən tez açılırmı? |
| Usability (istifadə rahatlığı) | İstifadə nə qədər asan və aydındır | Yeni istifadəçi qeydiyyatı köməksiz tamamlaya bilirmi? |
| Security (təhlükəsizlik) | Məlumatların qorunması | Başqasının sifarişlərini görmək mümkündürmü? |
| Compatibility (uyğunluq) | Müxtəlif brauzer, OS və cihazlarda işləmə | Sayt Safari-də də düzgün görünürmü? |
| Accessibility (əlçatanlıq) | Məhdudiyyətli insanların istifadə imkanı | Saytı yalnız klaviatura ilə idarə etmək olurmu? |
| Reliability (etibarlılıq) | Uzun müddət nasazlıqsız işləmə | Sistem bir həftə fasiləsiz işləyəndə yavaşlayırmı? |
| Localization (lokalizasiya) | Dil, tarix və valyuta formatları | Azərbaycan dilində mətnlər düymələrə sığırmı? |
| Maintainability (baxım rahatlığı) | Kodu dəyişmək və düzəltmək nə qədər asandır | Yeni ödəniş üsulu əlavə etmək neçə modula toxunur? |
| Portability (daşınma rahatlığı) | Başqa mühitə keçirmək və quraşdırmaq | Tətbiq yeni serverə problemsiz keçirmi? |

Bu xüsusiyyətlərin çoxu ISO/IEC 25010 keyfiyyət modelindən gəlir: performans, uyğunluq, istifadə rahatlığı, etibarlılıq, təhlükəsizlik, baxım rahatlığı, daşınma rahatlığı.

**Performans testinin alt növləri:**

- **Load testing (yük testi)** — gözlənilən yükdə yoxlama: məsələn, eyni anda 1000 istifadəçi.
- **Stress testing (stress testi)** — limitdən yuxarı yük: sistem nə vaxt və necə sınır, sonra bərpa olunurmu?
- **Spike testing (sıçrayış testi)** — qəfil yük artımı: kampaniya başlayan an istifadəçi sayı 10 dəqiqədə 10 dəfə artır.
- **Endurance / Soak testing (dözümlülük testi)** — uzun müddət normal yük: 12 saatdan sonra yaddaş sızması (memory leak) olurmu?

Performans testləri xüsusi alətlərlə aparılır: JMeter, k6, Gatling. Manual tester ən azı brauzerin Network panelində cavab müddətini görməyi bacarmalıdır (Fəsil 13).

### 6.3. Dəyişikliklərlə bağlı testlər

Proqramda dəyişiklik olanda (yeni build, düzəliş) dörd növ test gündəmə gəlir.

**Smoke testing (smoke test).** Yeni build-in əsas funksiyaları işləyirmi, ümumiyyətlə test etməyə dəyərmi? Bu, geniş, amma dayaz yoxlamadır: 10–30 dəqiqə. Ad elektronikadan gəlir: yeni cihazı ilk dəfə işə salanda tüstü çıxırsa, daha dərin yoxlamağa ehtiyac yoxdur.

Misal: sayt açılır, login işləyir, kataloq görünür, məhsul səbətə əlavə olunur, ödəniş səhifəsi açılır.

**Sanity testing (sanity test).** Konkret dəyişiklikdən sonra həmin sahə məntiqli işləyirmi? Bu, dar, amma dərin yoxlamadır. Misal: axtarış filtrinə yeni “Qiymət aralığı” əlavə olunub — filtrin özünü və ona yaxın funksiyaları qısa yoxlayırsan.

**Retest / Confirmation testing (təkrar yoxlama).** Düzəldilmiş defekt həqiqətən düzəlibmi? Bug report-dakı eyni addımlar və eyni data ilə yoxlanılır.

**Regression testing (reqressiya testi).** Dəyişiklik əvvəl işləyən funksiyaları sındırmayıb? Misal: endirim kodundakı baq düzəldilib — səbətin cəmi, çatdırılma haqqı, vergi hələ düzgün hesablanırmı?

|  | Smoke | Sanity | Retest | Regression |
| --- | --- | --- | --- | --- |
| Sual | Build test üçün yararlıdırmı? | Dəyişən sahə məntiqli işləyirmi? | Bu baq düzəlibmi? | Başqa yer sınmayıb? |
| Əhatə | Geniş, dayaz | Dar, dərin | Bir defekt | Geniş, sistemli |
| Nə vaxt | Hər yeni build-dən sonra | Kiçik dəyişiklikdən sonra | Defekt “Fixed” olanda | Hər dəyişiklikdən sonra, reliz öncəsi |
| Avtomatlaşdırma | Çox vaxt avtomatik | Adətən manual | Adətən manual | Ən çox avtomatlaşdırılan növ |

### 6.4. Digər növlər

- **End-to-end (E2E) testing** — real istifadəçi ssenarisi uçdan-uca, bütün sistemlər birlikdə.
- **Installation testing** — quraşdırma, yeniləmə və silmə.
- **Recovery testing** — sistem nasazlıqdan sonra necə bərpa olunur: server yenidən başlayanda data itirmi?

### 6.5. Test kvadrantları {#c6x1}

Test kvadrantları (testing quadrants) test növlərini iki ox üzrə qruplaşdırır. Birinci ox: test **biznesə** yoxsa **texnologiyaya** yönəlib. İkinci ox: testin məqsədi **komandaya kömək etmək** (məhsul qurularkən) yoxsa **məhsulu tənqid etmək** (qurulanı yoxlamaq). Kvadrantlar Agile komandada heç bir test növünün unudulmadığını yoxlamağa kömək edir.

| Kvadrant | Yönəlib | Məqsəd | Nümunələr | Adətən |
| --- | --- | --- | --- | --- |
| Q1 | Texnologiyaya | Komandaya kömək | Unit və komponent inteqrasiya testləri | Avtomatik, CI-də |
| Q2 | Biznesə | Komandaya kömək | Funksional testlər, story testləri, misallar, API testləri, prototiplər | Manual və ya avtomatik |
| Q3 | Biznesə | Məhsulu tənqid | Exploratory, usability, UAT | Manual, istifadəçi gözü ilə |
| Q4 | Texnologiyaya | Məhsulu tənqid | Smoke və qeyri-funksional testlər: performans, yük, təhlükəsizlik | Alətlərlə, çox vaxt avtomatik |

Tester üçün nəticə: komanda yalnız Q2-də — funksional testlərdə — ilişib qalmamalıdır. Relizə hazırlıqda dörd kvadrantın hamısına baxılır. Test piramidası (19.2) isə avtomatik testlərin səviyyələr üzrə sayını göstərir: kvadrantlar “hansı növ testlər?”, piramida “hansı səviyyədə və nə qədər?” sualına cavab verir.

### Diqqət: tez-tez edilən səhvlər

- **Retest ilə regression-u qarışdırmaq.** Müsahibələrin ən populyar sualıdır. Retest: “bu baq düzəldi?” — konkret defekt. Regression: “düzəliş başqa yeri sındırmadı?” — ətraf funksiyalar.
- **Smoke ilə sanity-ni eyni saymaq.** Smoke geniş və dayazdır, bütün build üçündür. Sanity dar və dərindir, konkret dəyişiklik üçündür. Bəzi komandalar bu sözləri fərqli işlədir, ona görə komandanın terminologiyasını öyrən.
- **Qeyri-funksional testi “sonraya” saxlamaq.** Performans və təhlükəsizlik problemləri gec tapılanda düzəltmək ən bahalısı olur.

### Həll olunmuş nümunə

**Tapşırıq.** Onlayn mağazada “Promo kod 10% endirim vermir” baqı düzəldildi və yeni build gəldi. Hansı test növlərini hansı sırayla edərsən?

**Həll.**

1. **Smoke test** — build ümumiyyətlə işləyirmi: sayt, login, kataloq, səbət, ödəniş səhifəsi. Bu sınıqdırsa, dərin testə keçmə və build-i komandaya geri qaytar.
2. **Retest** — bug report-dakı addımlarla promo kodu tətbiq et: 100 AZN-lik səbət 90 AZN olurmu?
3. **Sanity** — promo kod sahəsinin yaxın davranışları: yanlış kod, müddəti bitmiş kod, kodu silmək, iki kod tətbiq etməyə cəhd.
4. **Regression** — promo kodun təsir edə biləcəyi yerlər: səbətin cəmi, çatdırılma, vergi, sifariş tarixçəsindəki məbləğ, promo kodsuz adi sifariş. Sonra komandanın planlaşdırılmış regression dəsti.

### Sənin növbən

1. Hər birinin test növünü yaz:
   1. “Ana səhifə 3G şəbəkədə 5 saniyədən tez açılmalıdır.”
   2. “Səbətə məhsul əlavə olunur.”
   3. “Sayt Firefox-da düzgün görünür.”
   4. “Eyni anda 5000 istifadəçi daxil olanda sistem çökmür.”
   5. “Görmə məhdudiyyətli istifadəçi ekran oxuyucu ilə qeydiyyatdan keçə bilir.”
   6. “Logout-dan sonra Geri düyməsi ilə profil səhifəsi açılmır.”
2. Smoke və sanity fərqini öz misalınla izah et.
3. “Şifrəni unutdum” funksiyasında dəyişiklik edilib. Hansı regression testlərini təklif edərdin? Ən azı 6 dənə yaz.
4. Load, stress və spike testinin fərqini onlayn bilet satışı saytı misalında izah et.

### Özünü yoxla

- Funksional və qeyri-funksional test arasında fərq nədir?
- 4 performans testi növünü sadala.
- Retest və regression fərqi nədir?
- Hansı test növü ən çox avtomatlaşdırılır və niyə?

## Fəsil 7. Test yanaşmaları

Yanaşma “necə test edirik?” sualına cavab verir: kodu bilərək və ya bilmədən, proqramı işə salaraq və ya salmadan, plana görə və ya kəşf edərək, əllə və ya avtomatik.

### 7.1. Black box (qara qutu)

Black box — daxili kodu bilmədən, yalnız giriş və çıxışa baxaraq test etməkdir. Sistem qara qutu kimidir: içini görmürsən, yalnız nə verdiyini və nə aldığını görürsən.

**Misal.** Kalkulyatorda 2 + 2 yazıb 4 gözləyirsən — onun necə hesabladığı səni maraqlandırmır.

Black box texnikaları: ekvivalent siniflər, sərhəd dəyərləri, qərar cədvəli, vəziyyət keçidləri (Fəsil 8–9). Bu, manual tester-in əsas yanaşmasıdır.

### 7.2. White box (ağ qutu)

White box — test case-ləri proqramın daxili quruluşuna görə seçməkdir: kod, arxitektura, iş axınları, data axınları. Kod səviyyəsində adətən proqramçılar edir (unit testlər), amma bütün test səviyyələrində işlədilə bilər.

Burada əsas anlayış **coverage (əhatə)** — testlərin kodun nə qədərini işə salmasıdır:

- **Statement coverage (operator əhatəsi)** — hər icra olunan operator ən azı bir dəfə işə düşübmü?
- **Branch coverage (budaq əhatəsi)** — hər `if`-in həm “doğru”, həm “yalan” yolu işə düşübmü?

```javascript
function getShippingCost(total) {
  if (total >= 50) {
    return 0;   // 50 AZN və yuxarı: pulsuz
  }
  return 3;     // qalan hallarda 3 AZN
}
```

Yalnız `getShippingCost(80)` testi olsa, `return 3` sətri heç vaxt işə düşmür. Bu halda 3 operatordan 2-si işləyir (statement coverage təxminən 67%), budaqların isə yarısı (branch coverage 50%). `getShippingCost(20)` testini də əlavə edəndə hər iki yol işləyir: statement və branch coverage 100% olur. Faizin necə hesablandığı və əhatənin həddi 7.9-dadır.

### 7.3. Grey box (boz qutu)

Grey box — qismən biliklə test etməkdir: kodu bilmirsən, amma sistemin quruluşunu (verilənlər bazası, API) bilirsən.

**Misal.** Saytda sifariş verirsən (black box), sonra SQL ilə bazada sifarişin düzgün yazıldığını yoxlayırsan (Fəsil 16). Ya da UI-də görünməyən xətanı brauzerin Network panelində tapırsan.

Müasir manual tester-lərin çoxu əslində grey box işləyir.

### 7.4. Statik və dinamik test

- **Statik test** — proqramı işə salmadan yoxlamaq: tələbləri, dizaynı, sənədləri, kodu oxumaq və nəzərdən keçirmək.
- **Dinamik test** — proqramı işə salaraq yoxlamaq: düymələri basmaq, sorğu göndərmək, avtomatik testləri işə salmaq.

Statik testin əsas forması review-dur (nəzərdən keçirmə):

| Növ | Əsas məqsəd | Necə aparılır | Misal |
| --- | --- | --- | --- |
| Informal review | Anomaliyaları tapmaq | Müəyyən proses və yazılı nəticə tələb olunmur | Həmkara “bu test case-ə bir bax” demək |
| Walkthrough | Keyfiyyəti qiymətləndirmək, öyrətmək, razılığa gəlmək, ideya yaratmaq, müəllifi yaxşılaşdırmağa həvəsləndirmək, anomaliya tapmaq | Müəllif aparır; əvvəlcədən fərdi oxumaq məcburi deyil | Analitik tələbləri komandaya oxuyur, suallar verilir |
| Technical review | Texniki məsələdə razılığa gəlmək və qərar vermək, anomaliya tapmaq | Moderator aparır; iştirakçılar texniki mütəxəssislərdir | Arxitekturanın müzakirəsi |
| Inspection | Mümkün qədər çox anomaliya tapmaq; metrik toplayıb prosesi yaxşılaşdırmaq | Ən formal növ, tam proses; müəllif review lideri və ya qeydiyyatçı ola bilməz | Tibbi proqramın tələb sənədinin rəsmi yoxlanması |

Statik analiz alətləri kodu avtomatik yoxlayır: məsələn, ESLint JavaScript kodunda şübhəli yerləri göstərir. Statik testin əsas üstünlüyü defekti kod yazılmazdan əvvəl tapmasıdır (Prinsip 3). Ətraflı müqayisə 7.10-dadır.

### 7.5. Pozitiv və neqativ test

- **Pozitiv test** — düzgün data ilə: sistem gözlənilən işi görürmü?
- **Neqativ test** — yanlış data ilə: sistem düzgün reaksiya verirmi? Aydın xəta mesajı çıxırmı, proqram çökmürmü, məlumat qorunurmu?

**Misal — email sahəsi.** Pozitiv: `ali@example.com`, `ali.veli@example.co.uk`, `ali+test@example.com`. Neqativ: boş sahə, `aliexample.com` (@ yoxdur), `ali@` (domen yoxdur), `ali @example.com` (boşluq), 300 simvolluq email.

Neqativ testlər adətən pozitivlərdən çox olur, çünki səhv etməyin yolu çoxdur.

### 7.6. Exploratory testing (kəşfiyyat testi)

Exploratory testdə öyrənmə, test dizaynı və icra eyni vaxtda gedir. Əvvəlcədən yazılmış test case yoxdur: tester sistemi kəşf edərək növbəti addımı seçir.

Ad hoc testdən fərqi var. Ad hoc tam plansız və sənədsizdir. Exploratory isə strukturludur: məqsədi (charter), vaxt limiti (timebox) və qeydləri olur.

**Sessiya əsaslı exploratory test:**

- **Charter (missiya):** “Səbəti kəşf et, məhsul sayının dəyişdirilməsinə fokuslan, məqsəd — hesablama xətaları.”
- **Timebox:** 60–90 dəqiqə.
- **Qeydlər:** nəyi yoxladım, nə tapdım, hansı suallar yarandı.
- **Sonda:** tapılan baqlar, risklər, növbəti sessiya üçün ideyalar. Sessiya maraqlı tərəflərlə qısa müzakirə (debrief) ilə bitir, qeydlər test sessiyası vərəqinə (test session sheet) yazılır.

Exploratory xüsusən tələblər zəif olanda, vaxt az olanda və digər texnikaları tamamlamaq lazım olanda faydalıdır. İçində BVA kimi texnikalar da işlədilə bilər. Nəticəsi isə tester-in bilik və təcrübəsindən çox asılıdır.

**Faydalı fikirlər (heuristics):**

- **Sıfır, bir, çox:** məhsul sayı 0, 1, 99, 1000.
- **Başla, dayan, geri qayıt:** prosesi yarıda kəs, “Geri” bas, səhifəni yenilə.
- **Eyni anda:** düyməni iki dəfə tez bas, iki tabda eyni əməliyyatı et.
- **Kənar data:** çox uzun mətn, emoji, xüsusi simvollar, Azərbaycan hərfləri (ə, ğ, ı, ö, ü, ç, ş).

### 7.7. Manual və avtomatik test

|  | Manual test | Avtomatik test |
| --- | --- | --- |
| Kim icra edir | İnsan | Kod (skript) |
| Sürət | Yavaş | Sürətli, gecə də işləyə bilər |
| İlkin xərc | Aşağı | Yüksək: kod yazmaq və dəstəkləmək lazımdır |
| Təkrar xərci | Hər dəfə eyni | Dəmək olar sıfır |
| Güclü tərəfi | Usability, exploratory, yeni funksiyalar | Regression, smoke, çox data, çox brauzer |
| Zəif tərəfi | Yorğunluq, təkrarda diqqətsizlik | Yalnız yazılanı yoxlayır, UI dəyişəndə sınır |

Avtomatlaşdırma manual testi əvəz etmir: onu yalnız insanın görə biləcəyi işlərə azad edir. Ətraflı — Fəsil 19-da.

### 7.8. Review prosesi: addımlar, rollar, uğur amilləri {#c7x1}

7.4-də review növlərini gördük. Rəsmi review — məsələn, inspection — bir proses kimi aparılır:

1. **Planlaşdırma** — nə nəzərdən keçiriləcək, məqsəd, çıxış meyarları, iştirakçılar və vaxt.
2. **Başlanğıc (review initiation)** — iştirakçılar sənədi, rollarını və checklist-i alır; hər kəs nə edəcəyini bilir.
3. **Fərdi review** — hər iştirakçı sənədi təkbaşına oxuyur və tapıntıları (anomaliyaları) qeyd edir. Ən çox defekt bu addımda tapılır.
4. **Müzakirə və analiz** — tapıntılar görüşdə müzakirə olunur: hansı defektdir, kim düzəldəcək, sənəd qəbul olunurmu.
5. **Düzəliş və hesabat** — müəllif düzəldir, defektlər qeydə alınır, çıxış meyarı yoxlanır.

| Rol | Nə edir |
| --- | --- |
| Müəllif (author) | Sənədi yazıb, tapıntıları düzəldir |
| Rəhbər (manager) | Review-a qərar verir, vaxt və adam ayırır |
| Moderator (facilitator) | Görüşü aparır, hər kəsə söz verir, mübahisəni faktlara qaytarır |
| Qeydiyyatçı (scribe) | Tapıntıları və qərarları yazır |
| Reviewer | Sənədi oxuyur və defekt axtarır: tester, proqramçı, analitik, istifadəçi |
| Review lideri | Review-un bütövlükdə təşkilinə cavabdehdir |

**Uğur amilləri:** aydın məqsəd və ölçülə bilən çıxış meyarları; sənədi kiçik hissələrlə nəzərdən keçirmək; hazırlıq üçün vaxt; checklist; rəhbərliyin dəstəyi. Ən vacibi — **insanı yox, sənədi tənqid etmək**. Review-da tapılan defekt müəllifin “günahı” deyil, komandanın qazancıdır.

Tester üçün: tələblərin review-u defekt tapmağın ən ucuz yoludur (Prinsip 3). 10-cu fəsildəki “tələbə sual vermək” vərdişi məhz fərdi review-dur.

### 7.9. Statement və branch coverage-i hesablamaq {#c7x2}

Sillabus white box-dan hesablamadan çox izah tələb edir: əhatənin nə olduğunu və nəyə zəmanət verdiyini bilməlisən. Hesablamaq bunu başa düşməyin ən yaxşı yoludur. Bu kodla öyrənək:

```javascript
function price(total, vip) {
  let discount = 0;
  if (total >= 100) {
    discount = 10;
  }
  if (vip) {
    discount = discount + 5;
  }
  return total - discount;
}
```

**Statement coverage** = işə düşən icra olunan operatorlar / bütün icra olunan operatorlar × 100. Operator (statement) sətirlə eyni deyil: `}` sətri icra olunmur. Bu funksiyada 6 operator var: `let`, iki `if`, iki mənimsətmə və `return`.

**Branch coverage** = işə düşən budaqlar / bütün budaqlar × 100. Budaq (branch) idarənin bir yerdən digərinə keçməsidir. Şərtli budaqlar `if`-in doğru və yalan çıxışları, `switch`-in halları, dövrdən çıxmaq və ya davam etməkdir. Şərtsiz budaqlar düz xətt üzrə keçiddir. Bu kitabın misallarında yalnız şərtli budaqları sayırıq: burada 2 `if`, yəni 4 budaq var.

| Test | Operatorlar | Statement | Budaqlar | Branch |
| --- | --- | --- | --- | --- |
| `price(150, true)` | 6 / 6 | 100% | 2 / 4 | 50% |
| `price(50, false)` | 4 / 6 | ≈ 67% | 2 / 4 | 50% |
| Hər ikisi | 6 / 6 | 100% | 4 / 4 | 100% |

Birinci sətirdən əsas qayda çıxır: **100% branch coverage həmişə 100% statement coverage verir, tərsi isə doğru deyil.** Hər budaq işə düşübsə, hər operator da işə düşüb. Amma bütün operatorlar işə düşsə də, `if`-in yalan çıxışı yoxlanmamış qala bilər.

**White box-un dəyəri.**

- Kodun hamısı nəzərə alınır, ona görə tələblər zəif, köhnə və ya natamam olanda da defekt tapıla bilər.
- Əhatənin obyektiv ölçüsünü verir. Yalnız black box test kod əhatəsini ölçmür.
- Statik testdə də işlədilir: kodu işə salmadan, addım-addım “quru qaçış” (dry run) ilə.

**Həddi.**

- Koda yazılmamış tələbi tapmır: bu, yoxluq defektidir (omission).
- 100% statement datadan asılı defekti buraxa bilər: `a / b` sətri işləyib, amma `b = 0` yoxlanmayıb.
- `total >= 100` əvəzinə `total > 100` yazılsa, yuxarıdakı iki test yenə 100% verir, çünki 100 dəyəri yoxlanmır. Bunu BVA tutar (8.3).

### 7.10. Statik testin dəyəri və erkən rəy {#c7x3}

**Nəyə baxmaq olar?** Oxunub başa düşülən demək olar hər şeyə: tələblər, backlog elementləri, kod, test planı, test case, charter, layihə sənədi, müqavilə, model. Statik analiz alətinə isə quruluş lazımdır: kod, model və ya formal sintaksisli mətn. Yararsız olanlar: insanın çətin başa düşdüyü və alətlə analizinə icazə olmayan şeylər, məsələn, hüquqi səbəbə görə üçüncü tərəfin icra olunan kodu.

|  | Statik test | Dinamik test |
| --- | --- | --- |
| Proqram işə düşürmü? | Xeyr | Bəli |
| Nə tapır | Defekti birbaşa | Nasazlığı; defekt sonra analizlə tapılır |
| Harada işlədilir | İcra olunmayan sənədlərdə də | Yalnız icra olunan məhsulda |
| Nəyi ölçür | İcradan asılı olmayan keyfiyyəti (baxım rahatlığı) | İcradan asılı keyfiyyəti (performans) |
| Güclü tərəfi | Nadir işləyən kod yollarındakı defektlər | Real işləmə davranışı |

İkisi bir-birini tamamlayır: bəzi defektləri yalnız biri tapa bilər.

**Statik testin asan tapdığı defektlər:**

- Tələblərdə: ziddiyyət, qeyri-müəyyənlik, unudulmuş hal, təkrar.
- Dizaynda: səmərəsiz baza quruluşu, modullara zəif bölünmə.
- Kodda: təyin olunmamış dəyişən, çatılmayan və ya təkrarlanan kod, həddən artıq mürəkkəblik.
- Standartdan kənarlaşma: adlandırma qaydasının pozulması.
- İnterfeys təsvirində: parametrlərin sayı, tipi və ya sırası uyğun deyil.
- Bəzi təhlükəsizlik zəiflikləri, məsələn, buffer overflow.
- Test əsasının əhatəsində boşluq: qəbul meyarına test yoxdur.

**Dəyəri.** Statik test erkən başlayır (Prinsip 3), dinamik testin tapa bilmədiyini tapır, maraqlı tərəflərin eyni şeyi eyni cür başa düşməsinə kömək edir. Review bahalı görünsə də, layihənin ümumi xərci adətən azalır, çünki sonradan düzəliş daha bahadır.

**Erkən və tez-tez rəy (early and frequent stakeholder feedback).** Maraqlı tərəflər yalnız sonda qoşulanda məhsul onların istədiyi kimi çıxmaya bilər. Nəticə: bahalı yenidən iş, gecikən tarix, bir-birini günahlandırma, ağır halda layihənin uğursuzluğu. Tez-tez rəy tələbin səhv başa düşülməsinin qarşısını alır, dəyişikliklər tez anlaşılır, komanda nə qurduğunu daha yaxşı bilir, ən dəyərli funksiyalara və risklərə fokuslanır.

**Misal.** Sprint Review-da Product Owner yeni filtri görür: “Kateqoriya üzrə də süzmək lazım idi.” Düzəliş iki gün çəkir. Eyni fikir relizdən sonra gəlsəydi, plan, test və reliz yenidən başlayardı.

### Diqqət: tez-tez edilən səhvlər

- **100% coverage defektsiz kod demək deyil.** Yuxarıdakı funksiyada `>= 50` əvəzinə səhvən `> 50` yazılsa, 80 və 20 ilə testlər yenə 100% əhatə verəcək. Amma 50 AZN-lik sifariş üçün səhvən 3 AZN çıxacaq. Bunu yalnız sərhəd dəyəri (50) tutar — Fəsil 8.
- **Exploratory-ni “təsadüfi klikləmək” saymaq.** Exploratory-nin məqsədi, vaxtı və qeydləri var.
- **Hər şeyi avtomatlaşdırmaq istəmək.** Bir dəfə icra olunacaq və ya tez dəyişən testi avtomatlaşdırmaq çox vaxt zərərdir.

### Həll olunmuş nümunə

**Tapşırıq.** Bu funksiya üçün 100% branch coverage verən minimum test dəstini tap. Sonra black box tester kimi dəsti genişləndir.

```javascript
function getTicketPrice(age) {
  if (age < 7) {
    return 0;   // uşaqlar pulsuz
  } else if (age >= 65) {
    return 2;   // təqaüdçülər: 2 AZN
  }
  return 5;     // böyüklər: 5 AZN
}
```

**Həll.**

1. Kodda 3 yol var: `age < 7` doğrudur; `age < 7` yalandır və `age >= 65` doğrudur; hər ikisi yalandır.
2. Hər yol üçün bir dəyər seçirik: 5 yaş → 0 AZN, 70 yaş → 2 AZN, 30 yaş → 5 AZN.
3. Bu 3 test 100% branch coverage verir — minimum dəst budur.
4. Black box gözü ilə sərhədləri əlavə edirik: 6 → 0, 7 → 5, 64 → 5, 65 → 2. Proqramçı `<` ilə `<=`-ni qarışdırıbsa, məhz bu testlər tutacaq.
5. Neqativ hallar: -1, “abc”, boş dəyər — funksiya nə qaytarır? Tələbdə bu hallar yazılmayıbsa, sual ver.

### Sənin növbən

1. Bu funksiya üçün 100% branch coverage verən minimum testləri tap:

```javascript
function getGrade(score) {
  if (score >= 90) {
    return 'A';
  } else if (score >= 70) {
    return 'B';
  } else if (score >= 50) {
    return 'C';
  }
  return 'F';
}
```

2. Telefon nömrəsi sahəsi (+994 formatı) üçün 3 pozitiv və 6 neqativ test ideyası yaz.
3. Sevdiyin onlayn mağazanın axtarışı üçün exploratory charter yaz və 30 dəqiqəlik sessiya keçir. Qeydlərini və tapdıqlarını yaz.
4. Bu ssenarilərdən hansılarını avtomatlaşdırardın, hansılarını manual saxlayardın və niyə: (a) hər relizdə login regression; (b) yeni dizaynın rahatlığı; (c) 500 fərqli məhsulun qiymət hesablaması; (d) bir dəfəlik məlumat köçürülməsinin yoxlanması; (e) hər gecə avtomatik smoke test.

### Özünü yoxla

- Black, white və grey box fərqi nədir?
- Statement və branch coverage nədir?
- Exploratory test ad hoc testdən nə ilə fərqlənir?
- Niyə 100% coverage defektsizliyə zəmanət vermir?

# III hissə — Test dizayn texnikaları

## Fəsil 8. Ekvivalent siniflər və sərhəd dəyərləri

Bu iki texnika manual tester-in əsas alətidir: az testlə çox defekt tapmağa imkan verir. Ekvivalent siniflərə bölmə testlərin sayını azaldır, sərhəd dəyərlərinin analizi isə defektlərin ən çox gizləndiyi yerləri yoxlayır.

### 8.1. Niyə lazımdır

Tam test mümkün deyil (Prinsip 2). Yaş sahəsi 18–60 arası qəbul edirsə, hər ədədi (1, 2, 3 … 1000) yoxlamaq mənasızdır. Sual belədir: hansı dəyərləri seçək ki, az testlə maksimum defekt tapaq?

### 8.2. Ekvivalent siniflərə bölmə (Equivalence Partitioning, EP)

İdeya: giriş dəyərlərini qruplara — siniflərə bölürük. Bir sinfin içindəki bütün dəyərlər sistem tərəfindən eyni cür emal olunur. Ona görə hər sinifdən bir nümayəndə yoxlamaq kifayətdir.

Muzey biletini düşün: uşaq, böyük, təqaüdçü. Kassir 25 yaşlıya da, 40 yaşlıya da eyni bileti satır. Böyüklər qrupundan bir nəfərə bilet satmaq bütün qrupu yoxlamaq deməkdir.

- **Valid (etibarlı) sinif** — sistemin qəbul etməli olduğu dəyərlər.
- **Invalid (etibarsız) sinif** — sistemin aydın xəta mesajı ilə rədd etməli olduğu dəyərlər.

**Addım-addım:**

1. Tələbi oxu və şərti tap: hansı dəyərlər qəbul olunur?
2. Valid sinifləri müəyyən et.
3. Invalid sinifləri müəyyən et: aralıqdan kiçik, aralıqdan böyük, yanlış tip, boş dəyər, yanlış format.
4. Hər sinifdən bir nümayəndə seç — sinfin ortasından, “adi” bir dəyər.
5. Hər nümayəndə üçün test yaz: dəyər və gözlənilən nəticə.

**Misal.** Tələb: “Yaş sahəsi 18-dən 60-a qədər (daxil olmaqla) tam ədəd qəbul edir.”

| Sinif | Növ | Nümayəndə | Gözlənilən nəticə |
| --- | --- | --- | --- |
| 18-dən kiçik | Invalid | 10 | Xəta: “Yaş 18–60 arasında olmalıdır” |
| 18–60 | Valid | 35 | Qəbul olunur |
| 60-dan böyük | Invalid | 75 | Xəta |
| Kəsr ədəd | Invalid | 25,5 | Xəta |
| Hərflər | Invalid | abc | Xəta |
| Boş sahə | Invalid | (boş) | Xəta: “Yaş daxil edin” |
| Mənfi ədəd | Invalid | -5 | Xəta |

Mənfi ədəd riyazi olaraq “18-dən kiçik” sinfinə düşür. Amma sistem “-” işarəsini ayrıca emal edə bilər, ona görə çox vaxt ayrıca yoxlanılır.

**Qızıl qayda: bir testdə yalnız bir invalid dəyər.** Formada həm yaşı 10, həm emaili səhv yazsan və xəta çıxsa, hansının xətaya səbəb olduğunu bilməyəcəksən. Bir xəta digərini gizlədə bilər (defect masking).

### 8.3. Sərhəd dəyərlərinin analizi (Boundary Value Analysis, BVA)

İdeya: defektlər ən çox siniflərin sərhədlərində olur. Səbəb sadədir: proqramçılar `<` ilə `<=`-ni, `>` ilə `>=`-ni tez-tez qarışdırır.

```javascript
// Tələb: 18 və yuxarı yaş qəbul olunur
if (age > 18) {   // SƏHV: >= olmalı idi
  accept();
}
```

Bu kodda 35, 50, 60 — hamısı düzgün işləyir. Yalnız 18 yaşlı rədd edilir. EP-də 35-i seçən tester bu defekti tapmaz, BVA isə tapar.

BVA-nın iki variantı var:

- **2 dəyərli BVA** — hər sərhəd dəyəri və onun qonşu sinifdəki ən yaxın qonşusu.
- **3 dəyərli BVA** — hər sərhəd dəyəri və onun hər iki qonşusu, hansı sinifdə olmasından asılı olmayaraq.

Sərhəd dəyəri sinfin ən kiçik və ən böyük dəyəridir. “18–60” tələbində siniflər bir-birinə toxunan iki yerdə sərhəd dəyərləri belədir: 17 (kiçik sinfin sonu) və 18 (valid sinfin əvvəli), 60 (valid sinfin sonu) və 61 (böyük sinfin əvvəli).

| Siniflərin toxunduğu yer | 2 dəyərli BVA | 3 dəyərli BVA |
| --- | --- | --- |
| 17 və 18 | 17, 18 | 16, 17, 18, 19 |
| 60 və 61 | 60, 61 | 59, 60, 61, 62 |

3 dəyərli BVA-da 17-nin qonşuları 16 və 18, 18-in qonşuları 17 və 19-dur. Üst-üstə düşənlər bir dəfə sayılır, ona görə hər yerdə 4 dəyər qalır. “3 dəyərli, yəni üç qat çox” fikri yanlışdır.

Gözlənilən nəticə: 16 və 17 → xəta, 18 və 19 → qəbul, 59 və 60 → qəbul, 61 və 62 → xəta.

**Qeyd.** Bəzi dərsliklər və komandalar sadələşdirilmiş 17, 18, 19 və 59, 60, 61 dəstini işlədir. İşdə bu da faydalıdır, amma ISTQB-nin qaydası yuxarıdakıdır.

**Addım-addım:**

1. EP ilə sinifləri tap.
2. Hər sinfin minimum və maksimum dəyərini — sərhədlərini müəyyən et.
3. Addımı müəyyən et: tam ədədlərdə 1, pulda 0,01, mətn uzunluğunda 1 simvol.
4. Hər sərhəd üçün sərhədi və qonşu(lar)ı seç.
5. Gözlənilən nəticəni yaz.

**Misal 2 — şifrə uzunluğu.** Tələb: “Şifrə 8–20 simvol olmalıdır.” Addım 1 simvoldur. 2 dəyərli BVA: 7 (xəta), 8 (qəbul), 20 (qəbul), 21 (xəta). 3 dəyərli BVA-da 6, 9, 19 və 22 də əlavə olunur. Uzun mətnləri əllə saymamaq üçün onlayn simvol sayğacından istifadə et.

**Misal 3 — kəsr ədədlər.** Tələb: “50 AZN və yuxarı sifarişdə çatdırılma pulsuzdur.” Burada addım 1 qəpikdir (0,01). Sərhəd dəyərləri: 49,99 → çatdırılma ödənişli; 50,00 → pulsuz. 3 dəyərli BVA üçün 49,98 və 50,01 də əlavə olunur.

Yalnız 49 və 50-ni yoxlasan, 49,50 kimi dəyərləri buraxırsan. Kəsr ədədlərdə addımı düzgün seçmək vacibdir.

### 8.4. EP və BVA birlikdə

Praktikada ikisi birlikdə işlədilir: əvvəlcə EP ilə siniflər, sonra BVA ilə sərhədlər. Yaş misalı üçün yekun dəst:

| # | Dəyər | Haradan gəlir | Gözlənilən |
| --- | --- | --- | --- |
| 1 | 35 | EP: valid sinif | Qəbul |
| 2 | 17 | BVA: aşağı sərhəddən kənar | Xəta |
| 3 | 18 | BVA: aşağı sərhəd | Qəbul |
| 4 | 60 | BVA: yuxarı sərhəd | Qəbul |
| 5 | 61 | BVA: yuxarı sərhəddən kənar | Xəta |
| 6 | 25,5 | EP: kəsr | Xəta |
| 7 | abc | EP: hərflər | Xəta |
| 8 | (boş) | EP: boş sahə | Xəta |

BVA dəyərləri (17, 61) invalid sinifləri də təmsil edir, ona görə 10 və 75-i ayrıca yoxlamağa ehtiyac qalmır. 8 test bütün vacib halları əhatə edir.

### 8.5. Tələbdəki qeyri-müəyyənliyə diqqət

“18 yaşdan yuxarı” ifadəsində 18 daxildirmi? “60-a qədər” — 60 daxildirmi? Gündəlik dildə bu ifadələr fərqli başa düşülür. Tester təxmin etmir, soruşur: “18 yaşlı istifadəçi qeydiyyatdan keçə bilərmi?”

### 8.6. Əhatəni hesablamaq: EP, Each Choice və BVA {#c8x1}

Texnikanın əhatəsi faizlə ölçülür. Əhatə elementi (coverage item) texnikadan asılıdır.

**EP əhatəsi** = işə düşən siniflər / bütün siniflər × 100. Invalid siniflər də sayılır. Siniflər boş olmur və üst-üstə düşmür: hər dəyər tam bir sinfə aiddir. (8.2-də “mənfi ədəd” sətri praktik əlavədir: ciddi bölgüdə o, “18-dən kiçik” sinfinin içindədir.)

**Each Choice coverage.** Bir neçə parametr olanda hər parametrin hər sinfi ən azı bir dəfə işə düşməlidir. Kombinasiyalar nəzərə alınmır. Minimum test sayı ən çox sinfi olan parametrin sinif sayına bərabərdir.

**Misal.** Çatdırılma: kuryer, poçt, özü götürür. Ödəniş: kart, nağd. Each Choice üçün 3 test kifayətdir:

| Test | Çatdırılma | Ödəniş |
| --- | --- | --- |
| 1 | Kuryer | Kart |
| 2 | Poçt | Nağd |
| 3 | Özü götürür | Kart |

Bütün kombinasiyalar 3 × 2 = 6 olardı.

**BVA yalnız sıralı siniflər üçündür.** Sərhəd yalnız dəyərlər sıralana bilirsə olur: yaş, qiymət, uzunluq, tarix. “Rəng” və ya “şəhər” sinifləri sıralanmır, onlarda BVA işlədilmir.

**BVA-da elementləri necə saymaq.** Tələb: “Şifrə 8–12 simvol olmalıdır.” Uzunluq 0-dan kiçik ola bilməz, ona görə siniflər belədir:

| Sinif | Dəyərlər | Sərhəd dəyərləri |
| --- | --- | --- |
| Qısa | 0–7 | 0, 7 |
| Düzgün | 8–12 | 8, 12 |
| Uzun | 13 və yuxarı | 13 (yuxarı həddi yoxdur) |

- **2 dəyərli BVA:** elementlər sərhəd dəyərlərinin özüdür: 0, 7, 8, 12, 13 — **5 element**.
- **3 dəyərli BVA:** hər sərhəd dəyəri və iki qonşusu: 0 üçün 0, 1 (−1 mümkün deyil); 7 üçün 6, 7, 8; 8 üçün 7, 8, 9; 12 üçün 11, 12, 13; 13 üçün 12, 13, 14. Üst-üstə düşənlər bir dəfə sayılır: 0, 1, 6, 7, 8, 9, 11, 12, 13, 14 — **10 element**.

**BVA əhatəsi** = yoxlanan elementlər / bütün elementlər × 100. Testlər 8, 12 və 13 uzunluqlarını yoxlayırsa, 2 dəyərli əhatə 3 / 5 = 60%, 3 dəyərli əhatə 3 / 10 = 30%-dir.

8.3-də yalnız valid sinfin kənarlarına baxdıq, çünki defektlər ən çox orada olur. İmtahanda isə sualın verdiyi siniflərin hamısını say.

**3 dəyərli BVA nəyi əlavə tutur?** Tələb: `x ≤ 10`. Proqramçı səhvən `x == 10` yazıb. 2 dəyərli dəyərlər (10, 11) bu səhvi görmür: 10 qəbul, 11 rədd, hər ikisi düzgün görünür. 3 dəyərlidəki 9 isə rədd olunur və defekti üzə çıxarır.

### Diqqət: tez-tez edilən səhvlər

- **Yalnız valid dəyərləri test etmək.** Invalid siniflər çox vaxt daha çox defekt tapır.
- **Bir testdə bir neçə invalid dəyər.** Xətanın səbəbi qeyri-müəyyən qalır.
- **Kəsr ədədlərdə addımı səhv seçmək.** Pul sahələrində addım 0,01-dir. Kəsr ayırıcısını da yoxla: 25,5 və 25.5 — sistem hər ikisini necə emal edir?
- **Gizli sərhədləri unutmaq.** Sahənin maksimum uzunluğu (məsələn, bazada 255 simvol), tarix sərhədləri (ayın 1-i və son günü), sıfır.

### Həll olunmuş nümunə 1 — EP

**Tapşırıq.** Kinoteatr bilet sistemində qiymət yaşa görədir: 0–6 yaş pulsuz, 7–17 yaş 3 AZN, 18–64 yaş 6 AZN, 65 yaş və yuxarı 4 AZN. Yaş 0–120 arası tam ədəd ola bilər. Ekvivalent sinifləri və testləri tap.

**Həll.**

1. Şərt: yaş 0–120 arası tam ədəddir, qiymət yaş qrupuna görə dəyişir.
2. Valid siniflər: 0–6, 7–17, 18–64, 65–120. Dörd sinif var, çünki dörd fərqli nəticə var.
3. Invalid siniflər: 0-dan kiçik, 120-dən böyük, kəsr, hərflər, boş.
4. Nümayəndələr və testlər:

| # | Sinif | Dəyər | Gözlənilən |
| --- | --- | --- | --- |
| 1 | 0–6 (valid) | 3 | 0 AZN |
| 2 | 7–17 (valid) | 12 | 3 AZN |
| 3 | 18–64 (valid) | 30 | 6 AZN |
| 4 | 65–120 (valid) | 80 | 4 AZN |
| 5 | 0-dan kiçik (invalid) | -5 | Xəta |
| 6 | 120-dən böyük (invalid) | 130 | Xəta |
| 7 | Kəsr (invalid) | 10,5 | Xəta |
| 8 | Hərflər (invalid) | on | Xəta |
| 9 | Boş (invalid) | (boş) | Xəta |

### Həll olunmuş nümunə 2 — BVA

**Tapşırıq.** Eyni sistem üçün sərhəd dəyərlərini 2 dəyərli BVA ilə tap.

**Həll.**

1. Sərhədlər: 0 (minimum), 6/7, 17/18, 64/65, 120 (maksimum).
2. Addım: 1 il.
3. Test dəyərləri:

| Dəyər | Hansı sərhəd | Gözlənilən |
| --- | --- | --- |
| -1 | Minimumdan kənar | Xəta |
| 0 | Minimum | 0 AZN |
| 6 | Pulsuz qrupun sonu | 0 AZN |
| 7 | Uşaq qrupunun əvvəli | 3 AZN |
| 17 | Uşaq qrupunun sonu | 3 AZN |
| 18 | Böyük qrupunun əvvəli | 6 AZN |
| 64 | Böyük qrupunun sonu | 6 AZN |
| 65 | Təqaüdçü qrupunun əvvəli | 4 AZN |
| 120 | Maksimum | 4 AZN |
| 121 | Maksimumdan kənar | Xəta |

4. **Nəticə:** BVA-nın 10 dəyəri bütün sinifləri də təmsil edir. Üstünə tip yoxlamalarını (kəsr, hərflər, boş) əlavə etsək, 13 test 121 mümkün yaşı və yanlış girişləri etibarlı əhatə edir.

### Sənin növbən

1. “İstifadəçi adı 3–15 simvol olmalıdır, yalnız latın hərfləri və rəqəmlər.” EP siniflərini və 2 dəyərli BVA dəyərlərini tap.
2. “Bank köçürməsi: minimum 1 AZN, maksimum 5000 AZN.” Addımı müəyyən et və 3 dəyərli BVA ilə test dəyərlərini yaz.
3. “Çatdırılma qiyməti çəkiyə görədir: 0–1 kq — 2 AZN, 1–5 kq — 5 AZN, 5–20 kq — 10 AZN; 20 kq-dan ağır qəbul olunmur.” Tələbdə hansı qeyri-müəyyənlik var? Proqramçıya hansı sualları verərdin? Sonra öz fərziyyənlə EP və BVA testlərini yaz.
4. Real bir saytın qeydiyyat formasını seç. Bir sahə (şifrə və ya ad) üçün EP+BVA test dəsti hazırla və icra et. Nəticələri yaz.

### Özünü yoxla

- EP-nin əsas ideyası nədir? Niyə bir sinifdən bir dəyər kifayətdir?
- Niyə defektlər sərhədlərdə çox olur?
- 2 dəyərli və 3 dəyərli BVA arasında fərq nədir?
- Niyə bir testdə yalnız bir invalid dəyər olmalıdır?

## Fəsil 9. Qərar cədvəli, vəziyyət keçidləri, pairwise və error guessing

Fəsil 8-in texnikaları bir sahəni yoxlayır. Bu fəsildəkilər isə bir neçə şərtin birləşməsini, sistemin vəziyyətlərini, çoxlu parametrləri və təcrübəyə əsaslanan yoxlamaları əhatə edir.

### 9.1. Qərar cədvəli (Decision Table)

Qərar cədvəli bir neçə şərtin birləşməsi nəticəni dəyişəndə işlədilir. Məsələn: “Əgər A və B, onda X; əgər A, amma B yox, onda Y.” Cədvəlin yuxarısında şərtlər (conditions), aşağısında nəticələr (actions) olur; hər sütun bir qaydadır (rule) və bir test deməkdir.

**Addım-addım:**

1. Şərtləri yaz — hər biri Bəli/Xeyr.
2. Nəticələri yaz.
3. Kombinasiyaların sayını hesabla: n şərt → 2ⁿ kombinasiya (2 şərt → 4, 3 şərt → 8, 4 şərt → 16).
4. Hər kombinasiya üçün tələbə görə nəticəni yaz.
5. Sadələşdir: nəticəyə təsir etməyən şərti “—” (fərqi yoxdur) ilə işarələ və eyni sütunları birləşdir.
6. Hər sütun üçün bir test case yaz.

**Misal — login, 3 şərt.** Şərtlər: istifadəçi qeydiyyatdadırmı, hesab bloklanıbmı, şifrə düzgündürmü? Bu, 2³ = 8 kombinasiya deməkdir. Amma istifadəçi qeydiyyatda deyilsə, digər iki şərtin fərqi yoxdur. Hesab bloklanıbsa, şifrənin fərqi yoxdur.

|  | Qayda 1 | Qayda 2 | Qayda 3 | Qayda 4 |
| --- | --- | --- | --- | --- |
| Qeydiyyatdadır? | Xeyr | Bəli | Bəli | Bəli |
| Hesab bloklanıb? | — | Bəli | Xeyr | Xeyr |
| Şifrə düzgündür? | — | — | Bəli | Xeyr |
| **Nəticə** | “Email və ya şifrə yanlışdır” | “Hesab bloklanıb” | Daxil olur | “Email və ya şifrə yanlışdır” |

8 kombinasiya 4 testə endi. Qayda 1-də sistem “Belə istifadəçi yoxdur” yazmamalıdır: bu, kiminsə saytda qeydiyyatda olub-olmadığını öyrənməyə imkan verir. Yaxşı tester bu təhlükəsizlik riskini də qeyd edir.

### 9.2. Vəziyyət keçidləri (State Transition Testing)

Bu texnika sistemin davranışı onun hazırkı vəziyyətindən asılı olanda işlədilir: eyni hərəkət müxtəlif vəziyyətlərdə fərqli nəticə verir.

- **Vəziyyət (state)** — sistemin halı: “Daxil olmayıb”, “Bloklanıb”.
- **Hadisə (event)** — vəziyyəti dəyişən hərəkət: “Səhv şifrə daxil edildi”.
- **Keçid (transition)** — bir vəziyyətdən digərinə keçmək.
- **Nəticə (action)** — keçid zamanı baş verən: “Xəta mesajı göstərilir”.

**Misal.** Bank tətbiqində 3 dəfə səhv şifrə yazanda hesab bloklanır.

&#91;embedded content: vəziyyət keçidləri · 5 vəziyyət\]

Hər səhv şifrə hesabı bir vəziyyət aşağı aparır; düzgün şifrə ilk üç vəziyyətdən girişə aparır, “Bloklanıb” vəziyyətindən isə çıxış yoxdur.

Vəziyyət cədvəli (state table) baş verməməli olan keçidləri də göstərir:

| Hazırkı vəziyyət | Düzgün şifrə | Səhv şifrə |
| --- | --- | --- |
| Daxil olmayıb (0 səhv) | Daxil olub | 1 səhv cəhd |
| 1 səhv cəhd | Daxil olub | 2 səhv cəhd |
| 2 səhv cəhd | Daxil olub | Bloklanıb |
| Bloklanıb | Bloklanıb qalır, giriş yoxdur | Bloklanıb qalır |

Ən vacib test: “Bloklanıb” vəziyyətində düzgün şifrə ilə daxil olmaq mümkün olmamalıdır. Bu, etibarsız keçidin testidir və burada tez-tez defekt çıxır.

- Hər keçidi ən azı bir dəfə yoxla.
- Etibarsız keçidləri yoxla — cədvəldə “olmamalı” olan xanaları.
- Əlavə suallar ver: uğurlu girişdən sonra sayğac sıfırlanırmı? Blok nə vaxt və necə açılır?

### 9.3. Pairwise (cüt-cüt test)

Pairwise çoxlu parametr və hər birinin bir neçə dəyəri olanda işlədilir. İdeya: defektlərin çoxu bir parametrdən və ya iki parametrin birləşməsindən yaranır. Ona görə hər iki parametrin bütün cütlərini əhatə etmək kifayətdir.

**Misal.** Brauzer (Chrome, Firefox, Edge) × OS (Windows, macOS, Linux) × Dil (AZ, EN) = 3 × 3 × 2 = 18 kombinasiya. Pairwise ilə 9 test kifayətdir:

| # | Brauzer | OS | Dil |
| --- | --- | --- | --- |
| 1 | Chrome | Windows | AZ |
| 2 | Chrome | macOS | EN |
| 3 | Chrome | Linux | AZ |
| 4 | Firefox | Windows | EN |
| 5 | Firefox | macOS | AZ |
| 6 | Firefox | Linux | EN |
| 7 | Edge | Windows | AZ |
| 8 | Edge | macOS | EN |
| 9 | Edge | Linux | AZ |

İstənilən iki sütundan istənilən cüt (məsələn, Firefox + AZ və ya Linux + EN) cədvəldə ən azı bir dəfə var. Böyük cədvəllər üçün alətlər mövcuddur, məsələn, Microsoft-un pulsuz PICT aləti.

### 9.4. Error guessing (səhv təxmini)

Error guessing təcrübəyə əsaslanır: tester tipik səhvləri bilir və onları yoxlayır. Başlanğıc üçün yoxlama siyahısı:

- Boş sahə, yalnız boşluqlar, əvvəldə və sonda boşluq.
- Çox uzun mətn (1000+ simvol), emoji, xüsusi simvollar: `<`, `>`, `'`, `"`, `&`, `%`.
- Azərbaycan hərfləri: ə, ğ, ı, İ, ö, ü, ç, ş — axtarışda, adlarda, sıralamada.
- 0, mənfi ədəd, çox böyük ədəd, kəsr.
- Düyməni iki dəfə tez basmaq: eyni sifariş iki dəfə yaranırmı?
- Prosesin ortasında “Geri” düyməsi və ya səhifəni yeniləmək.
- Sessiyanın vaxtı bitəndən sonra əməliyyat etmək.
- Tarixlər: 29 fevral, 31 aprel (belə gün yoxdur), ilin son günü, keçmiş və gələcək tarix.
- İnternetin əməliyyatın ortasında kəsilməsi.
- Eyni hesabla iki cihazdan eyni anda işləmək.

### 9.5. Use case testing (istifadə ssenarisi testi)

Use case istifadəçinin sistemlə qarşılıqlı əlaqəsini addım-addım təsvir edir: əsas axın (main flow), alternativ axınlar və istisnalar. Hər axın ən azı bir test olur.

**Misal — bankomatdan pul çıxarmaq:**

- **Əsas axın:** kartı daxil et → PIN yaz → məbləği seç → pulu və kartı götür.
- **Alternativ axınlar:** məbləği əl ilə yaz; qəbz istə.
- **İstisnalar:** səhv PIN; balans kifayət etmir; bankomatda pul qurtarıb; kart vaxtında götürülmür.

### 9.6. Hansı texnikanı nə vaxt seçməli

| Vəziyyət | Texnika |
| --- | --- |
| Bir sahə, dəyər aralığı | EP + BVA (Fəsil 8) |
| Bir neçə şərt birlikdə nəticəni müəyyən edir | Qərar cədvəli |
| Davranış sistemin hazırkı halından asılıdır | Vəziyyət keçidləri |
| Çoxlu parametr və konfiqurasiya | Pairwise |
| İstifadəçinin addım-addım prosesi | Use case |
| Hər yerdə, əlavə olaraq | Error guessing |

Texnikalar üç ailəyə bölünür:

| Ailə | Testlər nəyə əsaslanır | Əhatə nəyə görə ölçülür | Zəif tərəfi |
| --- | --- | --- | --- |
| Black box | Tələb olunan davranışa. Kod dəyişsə də, davranış eynidirsə, testlər qalır | Siniflər, sərhədlər, sütunlar, keçidlər | Kodun içindəki yolları ölçmür |
| White box | Proqramın daxili quruluşuna. Ona görə dizayn və ya kod hazır olmadan yazıla bilməz | Operatorlar, budaqlar | Yazılmamış tələbi tapmır |
| Təcrübəyə əsaslanan | Tester-in bilik və təcrübəsinə: error guessing, exploratory, checklist | Adətən ölçülmür | Nəticə tester-dən asılıdır |

Üçüncü ailə ilk ikisinin buraxdığını tapa bilər, ona görə onları əvəz etmir, tamamlayır. Pairwise və use case CTFL v4.0 sillabusunda yoxdur, amma işdə faydalıdır.

### 9.7. Əhatəni hesablamaq: qərar cədvəli və vəziyyət keçidləri {#c9x1}

**Qərar cədvəlində** əhatə elementi mümkün kombinasiyası olan sütundur.

Əhatə = yoxlanan sütunlar / bütün mümkün sütunlar × 100.

Mümkün olmayan sütunlar sayılmır: yaş eyni anda həm 18-dən kiçik, həm 65-dən böyük ola bilməz. 100% üçün hər sütuna ən azı bir test lazımdır. Yazılış: şərtlərdə T və F (Bəli və Xeyr), “—” fərqi yoxdur, N/A mümkün deyil; nəticələrdə X olur və ya boş qalır. **Misal.** 9.1-dəki sadələşdirilmiş cədvəldə 4 sütun var. Testlər yalnız Qayda 1 və Qayda 3-ü yoxlayırsa, əhatə 2 / 4 = 50%-dir.

**Vəziyyət keçidlərində** üç əhatə səviyyəsi var:

| Əhatə | Element | Hesablama | Zəmanəti |
| --- | --- | --- | --- |
| Bütün vəziyyətlər (all states) | Vəziyyətlər | Keçilən vəziyyətlər / bütün vəziyyətlər | Ən zəifidir |
| Etibarlı keçidlər (valid transitions, 0-switch) | Etibarlı keçidlər | İşlədilən / bütün etibarlı keçidlər | Bütün vəziyyətləri də əhatə edir; ən çox işlədilən budur |
| Bütün keçidlər (all transitions) | Etibarlı və etibarsız keçidlər | İşlədilən və cəhd edilən / hamısı | İlk ikisini də əhatə edir; kritik sistemlər üçün minimum budur |

**Test case keçiddən fərqlidir.** Bir test case bir neçə keçidi ardıcıl keçə bilər, ona görə test case-lərin sayı keçidlərin sayından az olur. Etibarsız keçid isə test case-i bitirir: hər test case-də yalnız bir etibarsız keçid yoxlanılır, yoxsa biri digərini gizlədə bilər (defect masking).

**Misal.** 9.2-dəki bank girişi. 5 vəziyyət: 0, 1 və 2 səhv cəhd, Daxil olub, Bloklanıb. 6 etibarlı keçid bu test case-lərlə əhatə olunur:

| Test case | Keçidlər |
| --- | --- |
| TC1 | 0 səhv → Daxil olub |
| TC2 | 0 səhv → 1 səhv → Daxil olub |
| TC3 | 0 səhv → 1 səhv → 2 səhv → Daxil olub |
| TC4 | 0 səhv → 1 səhv → 2 səhv → Bloklanıb |

- **Bütün vəziyyətlər** üçün 2 test case kifayətdir: TC4 və TC1.
- **Etibarlı keçidlər** üçün 4 test case lazımdır, çünki “Daxil olub” və “Bloklanıb” yolun sonudur: 4 keçid bura gətirir və hər test case onlardan yalnız birini işlədə bilər.
- TC1 və TC2 birlikdə 6 keçiddən 3-nü işlədir: etibarlı keçid əhatəsi 50%-dir.
- **Bütün keçidlər** üçün 9.2-dəki cədvəlin 8 xanası da işlədilməlidir: 6 etibarlı keçid və “Bloklanıb” sətrindəki 2 etibarsız cəhd (düzgün şifrə, səhv şifrə). Biri TC4-ün sonuna yazıla bilər, digəri üçün yeni test case lazımdır: cəmi 5. “Daxil olub” cədvəldə yoxdur: bu misalda o, yolun sonudur.

**Mühafizə şərti (guard condition)** keçidin yalnız şərt doğru olanda baş verməsidir. Yazılış: `hadisə [şərt] / nəticə`, məsələn, `Səhv şifrə [cəhd = 3] / Hesabı blokla`.

### Diqqət: tez-tez edilən səhvlər

- **Qərar cədvəlində kombinasiyanı unutmaq.** Sayı 2ⁿ düsturu ilə yoxla.
- **Vəziyyət keçidlərində yalnız “xoşbəxt yolu” test etmək.** Etibarsız keçidlər ən çox defekt tapan yerdir.
- **Pairwise-a kor-koranə güvənmək.** Kritik kombinasiya (məsələn, ən populyar brauzer və OS) cədvəldə yoxdursa, onu əlavə et.

### Həll olunmuş nümunə 1 — qərar cədvəli

**Tapşırıq.** Kuryer xidmətinin qaydaları:

- Sifariş 30 AZN və çoxdursa, çatdırılma pulsuzdur; azdırsa, 3 AZN.
- Premium üzvlər üçün çatdırılma həmişə pulsuzdur.
- Təcili çatdırılma seçilibsə, üstünə 5 AZN gəlir (premium üzvlər də daxil olmaqla).

Qərar cədvəlini qur və sadələşdir.

**Həll.**

1. Şərtlər: Premium üzvdür? Sifariş ≥ 30 AZN? Təcili çatdırılma?
2. Nəticə: çatdırılma haqqı (AZN).
3. 3 şərt → 2³ = 8 kombinasiya (B — Bəli, X — Xeyr):

|  | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Premium? | B | B | B | B | X | X | X | X |
| ≥ 30 AZN? | B | B | X | X | B | B | X | X |
| Təcili? | B | X | B | X | B | X | B | X |
| Haqq (AZN) | 5 | 0 | 5 | 0 | 5 | 0 | 8 | 3 |

4. Sadələşdirmə: premium üzvlər üçün məbləğin fərqi yoxdur. Q1 ilə Q3 (5 AZN), Q2 ilə Q4 (0 AZN) birləşir:

|  | P1 | P2 | Q5 | Q6 | Q7 | Q8 |
| --- | --- | --- | --- | --- | --- | --- |
| Premium? | B | B | X | X | X | X |
| ≥ 30 AZN? | — | — | B | B | X | X |
| Təcili? | B | X | B | X | B | X |
| Haqq (AZN) | 5 | 0 | 5 | 0 | 8 | 3 |

5. **Nəticə:** 6 test case. “≥ 30” şərti sərhəddir, ona görə Q5–Q8 testlərində 29,99 və 30,00 dəyərlərini işlət (Fəsil 8).

### Həll olunmuş nümunə 2 — vəziyyət keçidləri

**Tapşırıq.** Onlayn mağazada sifariş statusları: Yaradılıb → Ödənilib → Göndərilib → Çatdırılıb. Sifariş “Yaradılıb” və “Ödənilib” vəziyyətlərində ləğv edilə bilər, göndərildikdən sonra isə yox. Testləri tap.

**Həll.**

1. Vəziyyətlər: Yaradılıb, Ödənilib, Göndərilib, Çatdırılıb, Ləğv edilib.
2. Etibarlı keçidlər. Sadəlik üçün hər birini ayrıca yazırıq; bir test case bir neçəsini ardıcıl keçə bilər (9.7):

| # | Başlanğıc | Hadisə | Son vəziyyət |
| --- | --- | --- | --- |
| 1 | Yaradılıb | Ödəniş edildi | Ödənilib |
| 2 | Ödənilib | Kuryerə verildi | Göndərilib |
| 3 | Göndərilib | Müştəri təhvil aldı | Çatdırılıb |
| 4 | Yaradılıb | Ləğv edildi | Ləğv edilib |
| 5 | Ödənilib | Ləğv edildi | Ləğv edilib, pul qaytarılır |

3. Etibarsız keçidlər — sistem bunlara icazə verməməlidir:

| # | Vəziyyət | Cəhd | Gözlənilən |
| --- | --- | --- | --- |
| 6 | Göndərilib | Ləğv et | Rədd edilir, izah mesajı göstərilir |
| 7 | Çatdırılıb | Ləğv et | Rədd edilir |
| 8 | Ləğv edilib | Ödəniş et | Rədd edilir |
| 9 | Yaradılıb | Birbaşa “Göndərilib” et | Rədd edilir: ödənişsiz göndərmə olmaz |

4. **Tələbə sual:** “Ödənilib” vəziyyətində ləğv ediləndə pul nə vaxt və necə qaytarılır? 5-ci testin gözlənilən nəticəsi bundan asılıdır.

### Sənin növbən

1. **Qərar cədvəli:** “Kino bileti: tələbələrə 20% endirim. Çərşənbə günləri hər kəsə 30% endirim. Endirimlər toplanmır — böyük olanı tətbiq olunur.” Şərtləri, kombinasiyaları və nəticələri yaz.
2. **Vəziyyət keçidləri:** svetofor (qırmızı → yaşıl → sarı → qırmızı) üçün vəziyyətləri, keçidləri və ən azı 2 etibarsız keçidi yaz.
3. **Pairwise:** Cihaz (Telefon, Planşet) × OS (Android, iOS) × Şəbəkə (Wi-Fi, 4G, Offline). Bütün kombinasiyaların sayı nədir? Pairwise ilə minimum neçə test lazımdır? Cədvəli qur.
4. **Error guessing:** “Fayl yüklə” düyməsi üçün 10 test ideyası yaz.
5. **Use case:** “Taksi çağırmaq” üçün əsas axını, 2 alternativ axını və 3 istisnanı yaz.

### Özünü yoxla

- Qərar cədvəlində kombinasiyaların sayı necə hesablanır?
- “—” (fərqi yoxdur) işarəsi nə vaxt qoyulur?
- Etibarsız keçid nədir və niyə vacibdir?
- Pairwise hansı fərziyyəyə əsaslanır?

# IV hissə — Test sənədləri və iş prosesi

## Fəsil 10. Tələblərlə iş: user story, acceptance criteria, sual vermək

Yaxşı test yaxşı tələbdən başlayır: tester tələbi başa düşmədən nəyi yoxlayacağını bilə bilməz. Bu fəsildə tələbləri oxumağı, qeyri-müəyyənlikləri tapmağı və düzgün sual verməyi öyrənəcəksən.

### 10.1. Tələb nədir

Tələb (requirement) — sistemin nə etməli olduğunu və ya hansı keyfiyyətə malik olmalı olduğunu təsvir edən ifadədir.

- **Biznes tələbləri** — şirkət nəyə nail olmaq istəyir: “Onlayn sifarişlərin sayını artırmaq.”
- **İstifadəçi tələbləri** — istifadəçi nə edə bilməlidir: “Alıcı sifarişini izləyə bilməlidir.”
- **Funksional tələblər** — sistem konkret olaraq nə edir: “Sistem hər status dəyişikliyində SMS göndərir.”
- **Qeyri-funksional tələblər** — sistem necə işləyir: “Sifariş səhifəsi 2 saniyədən tez açılır.”

Tələblərin mənbələri: SRS sənədi (Software Requirements Specification), user story-lər, dizayn maketləri (məsələn, Figma), müştəri ilə görüş qeydləri, mövcud sistemin davranışı.

### 10.2. Yaxşı tələbin xüsusiyyətləri

| Xüsusiyyət | Pis | Yaxşı |
| --- | --- | --- |
| Birmənalı | “Səhifə tez açılmalıdır” | “Ana səhifə 4G şəbəkədə 3 saniyədən tez açılmalıdır” |
| Tam | “İstifadəçi şifrəni dəyişə bilər” | “…köhnə şifrəni daxil etdikdən sonra; yeni şifrə köhnəsi ilə eyni ola bilməz” |
| Testlənə bilən | “Sistem istifadəçi dostu olmalıdır” | “Yeni istifadəçi qeydiyyatı 2 dəqiqədən tez, köməksiz tamamlamalıdır” |
| Ziddiyyətsiz | Bir yerdə “şifrə 8+ simvol”, başqa yerdə “6+ simvol” | Bütün sənəddə eyni qayda |
| Həyata keçirilə bilən | “Sistem heç vaxt dayanmamalıdır” | “Sistem ayda 99,9% vaxt əlçatan olmalıdır” |

Qeyri-müəyyənlik siqnalı olan sözlər: tez, rahat, müasir, gözəl, adətən, lazım olduqda, və s., bəzən, bütün, heç vaxt, optimal. Bu sözləri görəndə dərhal sual yaz.

### 10.3. User story (istifadəçi həkayəsi)

Agile-da tələblər çox vaxt user story şəklində yazılır: “Bir \[rol\] kimi, \[istək\] istəyirəm ki, \[fayda\].” İngiliscə forması: “As a \[role\], I want \[goal\], so that \[benefit\].”

**Misal.** “Bir alıcı kimi, məhsulları qiymətə görə sıralamaq istəyirəm ki, büdcəmə uyğun olanları tez tapım.”

User story-nin üç hissəsi var: kim (rol), nə (istək), niyə (fayda). “Niyə” hissəsi tester üçün çox vacibdir: istifadəçinin məqsədini bilirsənsə, real ssenariləri daha yaxşı düşünürsən.

Yaxşı user story-nin meyarları INVEST adlanır: Independent (müstəqil), Negotiable (müzakirə edilə bilən), Valuable (dəyərli), Estimable (qiymətləndirilə bilən), Small (kiçik), Testable (testlənə bilən). Tester üçün ən vacibi sonuncudur.

### 10.4. Acceptance criteria (qəbul meyarları)

Acceptance criteria — user story-nin “hazır” sayılması üçün ödənməli olan konkret şərtlərdir. Tester test case-ləri məhz bunlardan çıxarır. Onlar story-nin həddini müəyyən edir, maraqlı tərəfləri razılaşdırır, həm pozitiv, həm neqativ halları təsvir edir, qəbul testinin əsası olur və qiymətləndirməni dəqiqləşdirir. İki yazılış forması var.

**Qaydaya əsaslanan forma (rule-oriented) — siyahı və ya giriş-çıxış cədvəli:**

- Sıralama seçimləri: “Ucuzdan bahaya”, “Bahadan ucuza”.
- Default sıralama: “Populyarlığa görə”.
- Sıralama seçilmiş filtrləri sıfırlamır.
- Seçilmiş sıralama səhifə yenilənəndə qalır.

**Ssenariyə əsaslanan forma (scenario-oriented) — Gherkin, Given–When–Then:**

```gherkin
Scenario: Məhsulları ucuzdan bahaya sıralamaq
  Given istifadəçi “Telefonlar” kateqoriyasındadır
  When “Qiymət: ucuzdan bahaya” seçimini edir
  Then məhsullar qiymətə görə artan sırada göstərilir
  And seçilmiş sıralamanın adı düymədə görünür
```

- **Given** — ilkin vəziyyət (“verilib ki…”).
- **When** — istifadəçinin hərəkəti (“əgər…”).
- **Then** — gözlənilən nəticə (“onda…”).
- **And** — əlavə addım və ya nəticə.

Komandalar açar sözləri adətən ingiliscə saxlayır — bu, avtomatlaşdırma alətləri (məsələn, Cucumber) ilə işləyəndə rahatdır.

### 10.5. Tələbi necə təhlil etməli

Hər tələbi oxuyanda bu sualları ver:

1. **Kim?** Hansı istifadəçi rolları: qonaq, qeydiyyatlı, admin?
2. **Nə?** Dəqiq nə baş verməlidir, hansı data göstərilir?
3. **Harada?** Hansı səhifədə, hansı platformada (veb, mobil)?
4. **Nə vaxt?** Hansı şərtlərdə işə düşür?
5. **Limitlər?** Minimum, maksimum, uzunluq, format, ölçü?
6. **Default?** Heç nə seçilməyəndə nə olur?
7. **Xəta halları?** Yanlış data, internet kəsilməsi, server cavab vermir — nə baş verir, hansı mesaj göstərilir?
8. **Əlaqələr?** Bu funksiya hansı başqa funksiyalara təsir edir?
9. **Data?** Harada və nə qədər saxlanır?
10. **Mətnlər?** Düymə adları, mesajlar, tərcümələr dəqiq necədir?

### 10.6. Sualı necə verməli

- **Pis sual:** “Bu nə deməkdir?”
- **Yaxşı sual:** “US-12-də ‘şifrə güclü olmalıdır’ yazılıb. Minimum uzunluq neçədir və xüsusi simvol məcburidirmi? Təklifim: ən azı 8 simvol, 1 böyük hərf, 1 rəqəm.”

Yaxşı sualın formulu: harada (sənəd, bənd) + nə aydın deyil + konkret variant və ya təklif. Cavabı yazılı saxla — o, tələbin bir hissəsi olur.

### 10.7. Tələblərin izlənmə matrisi (RTM)

RTM (Requirements Traceability Matrix) hər tələbin hansı test case-lərlə yoxlandığını göstərən cədvəldir. Məqsəd: heç bir tələb testsiz qalmasın.

| Tələb | Təsvir | Test case-lər | Status |
| --- | --- | --- | --- |
| REQ-01 | Email və şifrə ilə giriş | TC-01, TC-02, TC-03 | Keçdi |
| REQ-02 | Şifrəni unutdum | TC-04, TC-05 | 1 defekt açıqdır |
| REQ-03 | 5 səhv cəhddən sonra blok | — | Test case yoxdur |

RTM dərhal göstərir ki, REQ-03 üçün test yazılmayıb.

### 10.8. Sprint ortasında tələb dəyişəndə {#c10x1}

Proqramçı deyir: “Product Owner dəyişdi, promo kod indi yalnız bir dəfə işləyir.” Və ya sprintin 8-ci günü Product Owner çatda yeni qayda yazır. Agile dəyişikliyə açıqdır, amma dəyişiklik görünən olmalıdır. Beş addım:

1. **Mənbədən təsdiqlə.** Eşitdiyinə görə testi dəyişmə. Product Owner-dən soruş: “Promo kod yalnız bir dəfə işləyir: düzgün başa düşmüşəm?”
2. **Tiketi yenilət.** Qəbul meyarları tiketdə dəyişsin. Çatdakı razılığı tiketə bağla.
3. **Təsiri tap.** RTM və tiket linkləri ilə bax (10.7): hansı test case-lər köhnəlib, hansı “Passed” nəticə artıq keçərli deyil, hansı açıq baq köhnə qaydaya görə yazılıb?
4. **Yenidən qiymətləndir.** Əlavə iş neçə saatdır? Sprintə sığırmı?
5. **Komandaya de, qərarı Product Owner-ə burax.** “Bu dəyişiklik 4 saat əlavə edir, SHOP-220-yə vaxt qalmır. Hansını saxlayaq?” Qərar Product Owner-indir.

**Köhnə nəticələr.** Dünən keçmiş test yeni qaydaya görə yenidən işlədilir. Köhnə qaydaya görə yazılmış baq yenilənir və ya bağlanır, səbəbi qeyd olunur.

**Etmə:** susub köhnə tələblə testi bitirmək; tiket dəyişmədən, yalnız çat mesajına görə test case-i dəyişmək; “bu sprintdə dəyişmək olmaz” deyib müzakirəni bağlamaq. Sənin işin dəyişikliyi dayandırmaq yox, onun qiymətini görünən etməkdir.

### Diqqət: tez-tez edilən səhvlər

- **Tələbi təxmin etmək.** “Yəqin belə nəzərdə tutublar” — soruş.
- **Sualları şifahi verib yazmamaq.** Cavab unudulur, sonra mübahisə olur.
- **Yalnız yazılanı test etmək.** Yazılmayan, amma məntiqən gözlənilən davranış da yoxlanmalıdır: məsələn, şifrə ekranda gizli görünməlidir.

### Həll olunmuş nümunə

**Tapşırıq.** Tələbi təhlil et, suallar yaz və bir ssenari üçün Gherkin acceptance criteria hazırla: “İstifadəçi profil şəklini yükləyə bilər.”

**Həll.**

1. Suallar:
   - Hansı formatlar qəbul olunur: JPG, PNG, GIF, WebP?
   - Maksimum fayl ölçüsü neçə MB-dır? 5 MB 5 000 000 baytdır, yoxsa 5 242 880 bayt (5 × 1024 × 1024)?
   - Minimum və maksimum piksel ölçüsü varmı? Şəkli kəsmək (crop) olurmu?
   - Yeni şəkil köhnəsini əvəz edirmi? Şəkli silmək olurmu, silinəndə hansı default şəkil görünür?
   - Mobil tətbiqdə kameradan birbaşa çəkmək mümkündürmü?
   - Yükləmə uğursuz olanda hansı mesaj görünür?
   - Şəkil kimlərə görünür: hamıya, yoxsa yalnız dostlara?
2. Fərz edək ki, cavab belədir: JPG və PNG, maksimum 5 MB.
3. Gherkin ssenarisi:

```gherkin
Scenario: 5 MB-dan böyük şəkil yükləmək
  Given istifadəçi profil səhifəsindədir
  When ölçüsü 6 MB olan JPG faylını yükləməyə çalışır
  Then fayl yüklənmir
  And “Faylın ölçüsü 5 MB-dan çox olmamalıdır” mesajı görünür
  And köhnə profil şəkli dəyişmir
```

4. Növbəti addım: bu ssenaridən BVA ilə test case-lər çıxarılır — 4,99 MB, 5,00 MB və 5,01 MB fayllar.

### Sənin növbən

1. Bu tələbi təhlil et, qeyri-müəyyən sözləri tap və yenidən yaz: “Axtarış tez işləməli və nəticələr düzgün göstərilməlidir.”
2. “Şifrəni unutdum” funksiyası üçün user story və Gherkin formasında 3 acceptance criteria yaz.
3. 3 tələb və 5 test case üçün RTM qur. Bir tələbi qəsdən testsiz burax və RTM-in bunu necə göstərdiyini izah et.
4. Onlayn mağazanın “Səbət” funksiyası üçün 10 sual yaz.

### Özünü yoxla

- Funksional və qeyri-funksional tələb arasında fərq nədir?
- User story-nin 3 hissəsi hansılardır?
- Given–When–Then nə deməkdir?
- RTM nə üçün lazımdır?

## Fəsil 11. Test planı, checklist və test case yazmaq

Test sənədləri yoxlamanı təkrarlana bilən edir: başqa tester də eyni testi eyni cür icra edə bilməlidir. Bu fəsildə test planını oxumağı, checklist və test case yazmağı öyrənəcəksən. Test case yazmaq junior tester-dən gözlənilən əsas bacarıqdır.

### 11.1. Test sənədlərinin iyerarxiyası

1. **Test strategiyası** — şirkət və ya məhsul səviyyəsində ümumi yanaşma.
2. **Test planı** — konkret layihə və ya reliz üçün plan.
3. **Test ssenarisi (test scenario)** — nəyi test edəcəyik: “Login funksiyasını yoxla”.
4. **Test case və ya checklist** — necə test edəcəyik: addımlar, data, gözlənilən nəticə.
5. **Test data** — testlərdə istifadə olunan məlumatlar: hesablar, fayllar, dəyərlər.

### 11.2. Test planı

Test planı “nəyi, necə, kim, nə vaxt və nə ilə test edəcəyik?” suallarına cavab verən sənəddir. Adətən QA lead yazır, junior isə oxuyub ona uyğun işləyir.

Plan məqsədə necə və nə vaxt çatacağımızı qeyd edir, komanda və maraqlı tərəflər üçün ünsiyyət vasitəsi olur, testin şirkətin test siyasətinə və strategiyasına uyğun olduğunu göstərir. Planı yazmağın özü də faydalıdır: risklər, cədvəl, adamlar, alətlər və xərc barədə əvvəlcədən düşünməyə məcbur edir.

| Bölmə | Nə yazılır | Misal |
| --- | --- | --- |
| Məqsəd | Planın nə üçün olduğu | Mobil bankın 3.2 relizinin testi |
| Scope (əhatə) | Nə test olunur və nə olunmur | Daxil: köçürmələr, kommunal ödənişlər. Xaric: kredit modulu |
| Kontekst və fərziyyələr | Test əsası, məhdudiyyətlər, nəyə güvənirik | Tələb sənədi 3-cü versiya; mühit 1 mayda hazır olacaq |
| Yanaşma | Səviyyələr, növlər, texnikalar, test data, müstəqillik, toplanacaq metriklər | Sistem testi, regression, API testi; EP, BVA; icra faizi, açıq defektlər |
| Mühit | Server, cihazlar, brauzerlər | Test serveri; Android və iOS-un son iki versiyası |
| Rollar | Kim nəyə cavabdehdir, kimə təlim lazımdır | QA lead — plan, 2 tester — icra |
| Ünsiyyət | Kim, nə vaxt, necə məlumat alır | Hər gün stand-up, həftəlik hesabat |
| Cədvəl və büdcə | Mərhələlər, müddətlər, xərc | Test dizaynı — 2 gün, icra — 5 gün; 15 adam-gün |
| Giriş və çıxış meyarları | Nə vaxt başlayır və bitir | Fəsil 4-ə bax |
| Risklər (risk reyestri) | Nə pis gedə bilər və ehtiyat planı | Test mühiti gec hazır olarsa, icra 2 gün sürüşür |
| Nəticələr (deliverables) | Hansı sənədlər hazırlanacaq | Test case-lər, bug report-lar, yekun hesabat |

### 11.3. Checklist

Checklist — nəyi yoxlamaq lazım olduğunun qısa siyahısıdır. Ətraflı addımlar yoxdur: hər bənd bir yoxlama ideyasıdır. Tez yazılır və asan yenilənir, amma iki tester eyni bəndi fərqli icra edə bilər.

**Misal — login səhifəsi:**

- Düzgün email və şifrə ilə giriş
- Yanlış şifrə ilə giriş — xəta mesajı
- Qeydiyyatda olmayan email ilə giriş
- Boş email və ya boş şifrə
- Şifrə simvolları gizli göstərilir
- “Şifrəni göstər” ikonu işləyir
- Email böyük-kiçik hərfə həssas deyil
- Email-in əvvəlində və sonunda boşluq
- Enter düyməsi ilə göndərmək
- “Məni yadda saxla” — brauzeri bağlayıb açandan sonra
- “Şifrəni unutdum” linki düzgün səhifəni açır
- Bir neçə səhv cəhddən sonra blok və ya captcha
- Logout-dan sonra “Geri” düyməsi şəxsi səhifəni açmır

**Checklist test texnikası kimi (checklist-based testing).** Bəndlər təcrübədən, istifadəçi üçün nəyin vacib olduğundan və proqramın niyə sındığını bilməkdən gəlir. Hər bənd ayrıca və birbaşa yoxlanıla bilməlidir, çox vaxt sual kimi yazılır. Bəndlərə bunlar yazılmır: avtomatik yoxlanan şeylər, giriş və ya çıxış meyarı olan şeylər, çox ümumi cümlələr.

Checklist vaxtla gücünü itirir, çünki proqramçılar eyni səhvləri etməməyi öyrənir. Ona görə defekt analizinə əsasən yenilənir, amma şişirdilmir. Ətraflı test case olmayanda istiqamət və müəyyən ardıcıllıq verir. İki tester onu fərqli icra edə bilər: bu, əhatəni artıra, təkrarlanmanı isə azalda bilər.

### 11.4. Test case nədir

Test case — konkret bir yoxlamanın ətraflı təsviridir: ilkin şərtlər, addımlar, data və gözlənilən nəticə. Yaxşı test case-i layihəni ilk dəfə görən tester də eyni cür icra edə bilir.

| Sahə | Nə yazılır |
| --- | --- |
| ID | Unikal nömrə: TC-LOGIN-001 |
| Başlıq (Title) | Nəyi yoxladığını qısa deyir |
| Modul | Login, Səbət, Ödəniş |
| Prioritet | High / Medium / Low |
| İlkin şərtlər (Preconditions) | Testdən əvvəl nə hazır olmalıdır |
| Test data | Konkret dəyərlər |
| Addımlar (Steps) | Nömrələnmiş, ardıcıl hərəkətlər |
| Gözlənilən nəticə (Expected result) | Sistem nə etməlidir |
| Faktiki nəticə (Actual result) | İcra zamanı nə baş verdi |
| Status | Passed / Failed / Blocked / Not run |
| Tələbə istinad | User story və ya tələb nömrəsi (RTM üçün) |

### 11.5. Yaxşı test case-in qaydaları

1. **Başlıq nəyi yoxladığını deyir:** “Login: düzgün email və şifrə ilə uğurlu giriş”. “Login testi 1” yox.
2. **Bir test case — bir məqsəd.** Login və profil redaktəsi ayrı test case-lərdir.
3. **Hər addım — bir hərəkət:** “Email sahəsinə test@example.com yaz”.
4. **Gözlənilən nəticə konkret və yoxlana biləndir.** “Xəta çıxır” yox, “Formanın üstündə qırmızı rəngdə ‘Email və ya şifrə yanlışdır’ mesajı görünür”.
5. **Test data konkretdir.** “Düzgün şifrə” yox, “Test1234!”.
6. **Müstəqildir:** başqa test case-in nəticəsindən asılı deyil, lazım olan hər şey ilkin şərtlərdədir.
7. **Başqası da icra edə bilir:** “bildiyin kimi daxil ol” kimi ifadələr yoxdur.

### 11.6. Pis və yaxşı test case

**Pis:** Başlıq: “Axtarış”. Addımlar: “Axtarışa nəsə yaz və bax.” Gözlənilən nəticə: “İşləyir.” Nə yazılacaq bilinmir, “işləyir” yoxlana bilmir, ilkin şərt yoxdur.

**Yaxşı:**

| Sahə | Dəyər |
| --- | --- |
| ID | TC-SEARCH-003 |
| Başlıq | Axtarış: mövcud məhsulun tam adı ilə axtarış nəticə qaytarır |
| İlkin şərtlər | Kataloqda “Elektrik çaydanı Vito 1,7 L” məhsulu var; istifadəçi ana səhifədədir |
| Addımlar | 1) Axtarış sahəsinə klik et. 2) “Elektrik çaydanı Vito” yaz. 3) Enter bas. |
| Gözlənilən nəticə | Nəticələr səhifəsi açılır; siyahının əvvəlində “Elektrik çaydanı Vito 1,7 L” görünür; başlıqda axtarılan söz yazılır |

### 11.7. Test suite və test data

**Test suite (test dəsti)** — əlaqəli test case-lərin qrupudur: “Login regression”, “Smoke dəsti”, “Ödəniş — tam dəst”.

**Test data qaydaları:**

- Real şəxsi məlumat (real kart nömrəsi, real şəxsiyyət vəsiqəsi) işlətmə — test hesablarından və saxta datadan istifadə et.
- Data əvvəlcədən hazır olsun: test case-də hansı hesabla daxil olacağın yazılsın.
- Testdən sonra datanı təmizlə və ya hər test üçün yeni data yarat.

### 11.8. Alətlər

Başlanğıc üçün Google Sheets və ya Excel kifayətdir. Şirkətlərdə test idarəetmə alətləri işlədilir: TestRail, Qase, Zephyr və Xray (Jira əlavələri). Hamısının məntiqi eynidir: test case-lər, dəstlər, icra nəticələri və hesabatlar.

Testə kömək edən alətlər məqsədə görə qruplaşdırılır:

| Qrup | Nə üçün | Misal |
| --- | --- | --- |
| İdarəetmə | Tələb, test, defekt və konfiqurasiyanı izləmək | Jira, TestRail, Qase |
| Statik test | Review və statik analiz | ESLint, SonarQube |
| Test dizaynı və implementasiyası | Test case, test data və prosedur yaratmaq | Faker, Playwright codegen |
| İcra və əhatə | Testi avtomatik icra etmək, əhatəni ölçmək | Playwright, Cypress, Istanbul |
| Qeyri-funksional | Əllə çətin və ya mümkün olmayan yoxlamalar | k6, JMeter, Lighthouse |
| DevOps | Pipeline, avtomatik build, CI/CD | GitHub Actions, Jenkins |
| Əməkdaşlıq | Ünsiyyəti asanlaşdırmaq | Slack, Microsoft Teams, Confluence |
| Miqyas və yerləşdirmə | Eyni mühiti tez qurmaq | Docker, virtual maşınlar |

Testə kömək edən hər şey alətdir, hətta cədvəl proqramı da.

### 11.9. Test qiymətləndirməsi (estimation) {#c11x1}

“Bu funksiyanın testi nə qədər vaxt aparacaq?” — planlamada ən çox verilən sualdır. Dörd əsas üsul var:

| Üsul | Necə | Misal |
| --- | --- | --- |
| Nisbətə görə (ratio) | Keçmiş layihələrin nisbətindən | Əvvəlki layihələrdə test inkişafın 40%-ni aparıb; inkişaf 10 gündürsə, test təxminən 4 gün |
| Ekstrapolyasiya | Cari layihənin ilk ölçmələrindən | İlk 3 sprintdə hər story-nin testi orta 3 saat; qalan 20 story təxminən 60 saat |
| Wideband Delphi | Ekspertlər ayrı-ayrılıqda qiymət verir, fərqləri müzakirə edir, yaxınlaşana qədər təkrarlayır | Planning Poker bunun Agile variantıdır |
| Üç nöqtəli qiymətləndirmə | Optimist (a), ən ehtimallı (m) və pessimist (b) qiymət | Aşağıdakı düstur |

**Üç nöqtəli düstur:** E = (a + 4m + b) / 6. Standart kənarlaşma: SD = (b − a) / 6.

**Misal.** Optimist qiymət 6 saat, ən ehtimallı 9 saat, pessimist 18 saat. E = (6 + 4 × 9 + 18) / 6 = 60 / 6 = 10 saat. SD = (18 − 6) / 6 = 2 saat. Qiymət: 10 ± 2 saat, yəni 8–12 saat.

Qiymətə təsir edən amillər: məhsulun mürəkkəbliyi və riski, tələblərin keyfiyyəti, komandanın təcrübəsi, test mühiti, alətlər və test datası. Qiymət vəd deyil: risklər dəyişəndə yenilənir.

### 11.10. Risklər və test prioritetləri {#c11x2}

**Risk** gələcəkdə baş verə biləcək və mənfi nəticəsi olan hadisədir. Onun iki atributu var: **ehtimal (likelihood)** və **təsir (impact)**. **Risk səviyyəsi = ehtimal × təsir.**

- **Məhsul riskləri (product risks)** məhsulun keyfiyyəti ilə bağlıdır: funksiya düzgün işləmir, ödəniş iki dəfə çıxılır, səhifə yavaş açılır, data sızır. Nəticəsi: narazı istifadəçilər, pul və reputasiya itkisi, baxım xərci, cərimələr, ağır hallarda insan sağlamlığına zərər. Bunları test azaldır.
- **Layihə riskləri (project risks)** layihənin idarəsi ilə bağlıdır və cədvələ, büdcəyə, scope-a təsir edir. Dörd qrupa bölünür: təşkilati (iş gec çatır, qiymət səhvdir, xərc azaldılır), insan (bacarıq və ya adam çatmır, ünsiyyət problemi), texniki (scope böyüyür, alət zəifdir) və təchizatçı (xarici şirkət işi vaxtında vermir, bağlanır). Bunlar test planının “Risklər” bölməsinə yazılır (11.2).

**Məhsul risk analizi** iki addımdır: əvvəl riskləri **müəyyənləşdirmək** (beyin fırtınası, keçmiş defektlər, tələblərin review-u, istifadəçi şikayətləri), sonra hər birini **qiymətləndirmək** — ehtimal və təsiri, məsələn, 1–3 şkalası ilə.

| Risk | Ehtimal | Təsir | Səviyyə |
| --- | --- | --- | --- |
| Ödəniş iki dəfə çıxılır | 2 | 3 | 6 — yüksək |
| Promo kod məbləği yeniləmir | 3 | 2 | 6 — yüksək |
| “Haqqımızda” səhifəsində orfoqrafik səhv | 3 | 1 | 3 — orta |
| Profil şəkli yüklənmir | 2 | 1 | 2 — aşağı |

Rəqəm əvəzinə matris də işlədilir: ehtimal və təsir “aşağı, orta, yüksək” kimi qiymətləndirilir, kəsişdiyi xana səviyyəni verir.

| Ehtimal \ Təsir | Aşağı | Orta | Yüksək |
| --- | --- | --- | --- |
| Yüksək | Orta | Yüksək | Yüksək |
| Orta | Aşağı | Orta | Yüksək |
| Aşağı | Aşağı | Aşağı | Orta |

**Risk analizinin nəticəsi** bunları müəyyən edir: testin həddi (scope); test səviyyələri və növləri; texnikalar və əhatə səviyyəsi; hər tapşırığın qiyməti; icra sırası; testdən başqa tədbir lazım olub-olmadığı.

**Məhsul riskinə nəzarət (product risk control)** iki hissədir. **Riskin azaldılması (risk mitigation)** — planlaşdırılmış tədbirləri görmək. **Riskin izlənməsi (risk monitoring)** — tədbirlərin işlədiyini yoxlamaq, qiymətləndirməni yaxşılaşdırmaq və yeni riskləri görmək.

**Riskə cavab variantları:** testlə azaltmaq (mitigation by testing), qəbul etmək (risk acceptance), başqasına ötürmək (risk transfer, məsələn, xarici xidmətə və ya sığortaya) və ehtiyat plan (contingency plan).

**Testlə azaltmaq** belə olur: riskə uyğun təcrübəli tester seçmək; lazımi müstəqillik; review və statik analiz; uyğun texnika və əhatə səviyyəsi; riskli keyfiyyət xüsusiyyətinə uyğun test növü; dinamik test, o cümlədən regression.

**Test case-lərin prioritetləşdirilməsi:**

- **Riskə görə** — ən yüksək riskli sahələrin testləri birinci;
- **Əhatəyə görə (coverage)** — ən çox əhatə verən testlər birinci. Variantı, əlavə əhatə (additional coverage): birinci ən çox əhatə verən, sonra ən çox yeni əhatə gətirən test;
- **Tələblərə görə** — biznes üçün ən vacib tələblərin testləri birinci. Tələblərin prioritetini maraqlı tərəflər verir.

Asılılıqlar sıranı dəyişir: yüksək prioritetli test aşağı prioritetli testdən asılıdırsa, əvvəl aşağı prioritetli icra olunur, məsələn, login testi ödəniş testindən əvvəl. Resurslar da nəzərə alınır: alət, mühit və ya adam yalnız müəyyən vaxtda əlçatan ola bilər. Vaxt çatmayanda (21.6) risk əsaslı seçim tester-in ən güclü arqumentidir.

### 11.11. Komandanın yaddaşı: wiki {#c11x3}

Komandanın bildikləri çatda itir. Ona görə çox şirkətdə wiki olur: Confluence, Notion, GitHub Wiki və s. Məntiq eynidir.

| Səhifə | İçində nə olur |
| --- | --- |
| Mühitlər | Ünvanlar, kim deploy edir, build nömrəsi harada görünür (4.8) |
| Test hesabları və data | Hansı hesab nə üçündür. Şifrələrin özü wiki-yə yazılmır: onlar şifrə menecerində saxlanılır |
| Necə edilir | Mühiti qurmaq, test ödənişi etmək, loglara baxmaq |
| Bilinən problemlər (known issues) | Hələ açıq olan və ya baq sayılmayan hallar |
| Qərarlar | “Promo kod yalnız bir dəfə işləyir. Product Owner, 12 mart”, tiket linki |
| Şablonlar | Bug report, test case, yekun hesabat |

Üç vərdiş:

1. **Soruşmazdan əvvəl axtar.** Tapmadınsa, “wiki-də baxdım, tapmadım” de.
2. **Cavabı alanda yaz.** Bir dəfə soruşulan sual növbəti yeni işçi üçün artıq səhifədir.
3. **Köhnə səhifəni düzəlt.** Düzəldə bilmirsənsə, sahibinə de. Köhnə səhifə olmayan səhifədən pisdir: insanı yanlış yola aparır.

### Diqqət: tez-tez edilən səhvlər

- **Yoxlamanı addımlara qarışdırmaq.** “Daxil ol düyməsini bas və profilin açıldığını yoxla” — yoxlama “Gözlənilən nəticə”yə aiddir.
- **Çox ümumi test case.** “Bütün formanı yoxla” test ssenarisidir, test case yox.
- **Çox xırda test case.** Hər simvol üçün ayrıca test case yazmaq əvəzinə checklist və ya data cədvəli işlət.

### Həll olunmuş nümunə

**Tapşırıq.** Login səhifəsi üçün bir pozitiv və bir neqativ test case-i tam formada yaz.

**Həll — pozitiv test case:**

| Sahə | Dəyər |
| --- | --- |
| ID | TC-LOGIN-001 |
| Başlıq | Login: düzgün email və şifrə ilə uğurlu giriş |
| Modul | Login |
| Prioritet | High |
| İlkin şərtlər | 1) İstifadəçi qeydiyyatdadır: test.user@example.com / Test1234! 2) İstifadəçi daxil olmayıb. 3) Login səhifəsi açıqdır. |
| Addımlar | 1) Email sahəsinə test.user@example.com yaz. 2) Şifrə sahəsinə Test1234! yaz. 3) “Daxil ol” düyməsini bas. |
| Gözlənilən nəticə | 1) “Mənim hesabım” səhifəsi açılır. 2) Başlıqda istifadəçinin adı görünür. 3) “Daxil ol” düyməsinin yerində “Çıxış” görünür. |
| Tələb | US-01 |

**Həll — neqativ test case:**

| Sahə | Dəyər |
| --- | --- |
| ID | TC-LOGIN-002 |
| Başlıq | Login: düzgün email və yanlış şifrə ilə giriş mümkün deyil |
| Modul | Login |
| Prioritet | High |
| İlkin şərtlər | 1) İstifadəçi qeydiyyatdadır: test.user@example.com / Test1234! 2) Login səhifəsi açıqdır. |
| Addımlar | 1) Email sahəsinə test.user@example.com yaz. 2) Şifrə sahəsinə Wrong999! yaz. 3) “Daxil ol” düyməsini bas. |
| Gözlənilən nəticə | 1) İstifadəçi login səhifəsində qalır. 2) “Email və ya şifrə yanlışdır” mesajı görünür. 3) Şifrə sahəsi təmizlənir, email sahəsi dolu qalır. |
| Tələb | US-01 |

Gözlənilən nəticədəki mesaj mətni tələbdən götürülür; tələbdə yoxdursa, soruş. Bu iki test case login üçün tam dəstin başlanğıcıdır: ona boş sahələr, qeydiyyatsız email, böyük hərfli email, bloklanmış hesab və Enter ilə göndərmə də daxildir.

### Sənin növbən

1. Eyni login səhifəsi üçün 5 neqativ test case-i tam formada yaz.
2. Qeydiyyat forması (ad, email, şifrə, şifrənin təkrarı, şərtlərlə razılıq) üçün ən azı 15 bəndlik checklist yaz.
3. Bu pis test case-i düzəlt: “Başlıq: Səbət. Addımlar: Səbətə məhsul at. Gözlənilən: düzgün işləyir.”
4. Onlayn mağazanın axtarışı üçün 8 test ssenarisi yaz (yalnız başlıqlar).
5. Sevdiyin bir sayt üçün mini test planı yaz: scope, mühit, risklər, çıxış meyarları.

### Özünü yoxla

- Test ssenarisi ilə test case arasında fərq nədir?
- Checklist nə vaxt test case-dən daha uyğundur?
- Yaxşı test case-in 5 qaydasını sadala.
- Test suite nədir?

## Fəsil 12. Bug report, severity və priority, defektin həyat dövrü, Jira

Bug report tester-in əsas məhsuludur: yaxşı yazılmış hesabat defektin tez düzəldilməsinə, pis yazılmış isə vaxt itkisinə və mübahisəyə səbəb olur. Məqsəd sadədir: proqramçı defekti səndən heç nə soruşmadan təkrarlaya bilsin.

### 12.1. Bug report-un quruluşu

| Sahə | Nə yazılır | Misal |
| --- | --- | --- |
| ID | Sistem avtomatik verir | SHOP-142 |
| Başlıq (Summary) | Harada, nə, hansı şərtdə | Səbət: promo kod tətbiq edildikdə ümumi məbləğ yenilənmir |
| Mühit (Environment) | OS, brauzer və versiyası, cihaz, build, server | Windows 11, Chrome 141, build 3.2.1, test serveri |
| Ciddilik (Severity) | Texniki təsir | Major |
| Prioritet (Priority) | Nə qədər tez düzəlməlidir | High |
| İlkin şərtlər | Başlamazdan əvvəl nə lazımdır | Səbətdə 100 AZN-lik məhsul var; TEST10 promo kodu aktivdir |
| Təkrarlama addımları (Steps to reproduce) | Nömrələnmiş, dəqiq addımlar | 1) Səbətə keç. 2) Promo kod sahəsinə TEST10 yaz. 3) “Tətbiq et” bas. |
| Gözlənilən nəticə | Tələbə görə nə olmalı idi | Ümumi məbləğ 90 AZN olur |
| Faktiki nəticə | Əslində nə oldu | “Kod tətbiq olundu” yazılır, amma məbləğ 100 AZN qalır |
| Təkrarlanma tezliyi | Neçə cəhddən neçəsində | 5/5 (həmişə) |
| Əlavələr | Sübutlar | Ekran şəkli, video, konsol xətası, sorğunun cavabı |

Brauzerin dəqiq versiyasını Chrome-da `chrome://version`, Firefox-da `about:support` səhifəsində görə bilərsən.

**Bug report-un üç məqsədi** var: defekti həll edənlərə kifayət qədər məlumat vermək; məhsulun keyfiyyətini izləmək; inkişaf və test prosesini yaxşılaşdırmaq üçün ideya vermək.

ISTQB daha bu sahələri də sayır: tarix, müəllif və onun rolu, status, test obyekti, kontekst (hansı test case, hansı test fəaliyyəti, SDLC mərhələsi, texnika, data) və istinadlar (məsələn, test case-ə link). Jira ID-ni, tarixi, müəllifi və ilkin statusu özü doldurur, qalanını sən yazırsan.

### 12.2. Yaxşı başlığın formulu

Formul: **\[harada\] + \[nə baş verir\] + \[hansı şərtdə\]**.

| Pis | Niyə pisdir | Yaxşı |
| --- | --- | --- |
| Səbət işləmir | Nə işləmir? | Səbət: məhsul sayını 0 edəndə məhsul silinmir |
| BUG!!! TƏCİLİ | Heç bir məlumat yoxdur | Ödəniş: Visa kartla ödəniş 500 xətası ilə dayanır |
| Promo kod | Problem təsvir olunmayıb | Səbət: promo kod tətbiq edildikdə ümumi məbləğ yenilənmir |
| Login-də problem var, düzəldin | Emosional və qeyri-dəqiq | Login: böyük hərflə yazılmış email ilə giriş mümkün deyil |

### 12.3. Severity (ciddilik)

Severity defektin sistemə texniki təsiridir. Adətən tester təyin edir.

| Səviyyə | Mənası | Misal |
| --- | --- | --- |
| Blocker | İş tamamilə dayanır, test davam edə bilmir | Tətbiq açılmır; heç kim daxil ola bilmir |
| Critical | Əsas funksiya işləmir, data itir və ya təhlükəsizlik riski var | Ödəniş alınır, amma sifariş yaranmır |
| Major | Vacib funksiya düzgün işləmir, amma yolu var | Filtr səhv nəticə göstərir, səhifəni yeniləyəndə düzəlir |
| Minor | Kiçik funksional və ya vizual problem | Düymə mətni bir az sürüşüb |
| Trivial | Dəmək olar təsiri yoxdur | “Haqqımızda” səhifəsində orfoqrafik səhv |

### 12.4. Priority (prioritet)

Priority defektin nə qədər tez düzəldilməli olduğudur. Bu, biznes qərarıdır: adətən Product Owner və ya menecer təyin edir, tester isə təklif verir. Səviyyələr: High (dərhal və ya bu sprintdə), Medium (yaxın relizdə), Low (vaxt olanda).

### 12.5. Severity və priority fərqi

Bu, ən çox soruşulan müsahibə sualıdır. Severity “nə qədər pisdir?”, priority isə “nə vaxt düzəltməliyik?” sualına cavab verir. Onlar adətən uyğun gəlir, amma həmişə yox:

| Severity | Priority | Misal | Niyə |
| --- | --- | --- | --- |
| Yüksək | Yüksək | Ödəniş düyməsi işləmir | Heç kim alış edə bilmir, şirkət pul itirir |
| Yüksək | Aşağı | 10 il əvvəlki arxiv hesabatını açanda tətbiq çökür | Ciddi texniki problemdir, amma ildə bir-iki nəfər istifadə edir |
| Aşağı | Yüksək | Ana səhifədə şirkətin adı səhv yazılıb | Texniki təsiri yoxdur, amma hamı görür və reputasiyaya zərər vurur |
| Aşağı | Aşağı | Daxili ayarlar səhifəsində iki düymə arasında məsafə fərqlidir | Az adam görür, təsiri yoxdur |

### 12.6. Defektin həyat dövrü (Bug Life Cycle)

Hər defekt müəyyən statuslardan keçir. Statuslar şirkətdən şirkətə bir az fərqlənir, amma əsas yol eynidir.

&#91;embedded content: defektin həyat dövrü · əsas yol, geri dönüş və digər nəticələr\]

Əsas yol yuxarıdan aşağıdır; retest uğursuz olanda defekt Reopened olur və yenidən proqramçıya qayıdır.

| Status | Mənası | Kim keçirir |
| --- | --- | --- |
| New | Defekt yenicə yazılıb | Tester |
| Assigned | Proqramçıya təyin olunub | Lead və ya menecer |
| Open / In Progress | Proqramçı üzərində işləyir | Proqramçı |
| Fixed | Kod düzəldilib | Proqramçı |
| Ready for Test | Düzəliş test mühitinə çatıb | Proqramçı və ya DevOps |
| Verified | Tester yoxladı, defekt düzəlib | Tester |
| Closed | Defekt bağlanıb | Tester və ya lead |
| Reopened | Retest uğursuz oldu, defekt qalır | Tester |
| Rejected / Not a bug | Defekt deyil, gözlənilən davranışdır | Proqramçı və ya PO |
| Duplicate | Eyni defekt artıq yazılıb | Hər kəs |
| Deferred | Sonrakı relizə saxlanılıb | PO |
| Cannot Reproduce | Proqramçı defekti təkrarlaya bilmədi | Proqramçı |

Statuslar arxasında ümumi proses var: qeydə almaq, analiz edib təsnif etmək, cavab qərarı vermək (düzəltmək və ya olduğu kimi saxlamaq), bağlamaq. Analizdən sonra məlum ola bilər ki, qeydə alınan anomaliya real defekt deyil: yalançı həyəcan (false positive) və ya dəyişiklik sorğusu (change request) imiş.

### 12.7. Tester-in davranış qaydaları

- **Yazmazdan əvvəl axtar:** bu defekt artıq yazılıbmı? Dublikat hamının vaxtını alır.
- **Bir report — bir defekt.** İki problemi bir report-a yığma.
- **Faktları yaz, emosiyaları yox.** “Dəhşətli baq” yox, “ödəniş 500 xətası ilə dayanır”.
- **Şəxsiyyətə yox, problemə yönəl.** “Proqramçı yenə səhv edib” kimi ifadələr yazma.
- **Minimum addımlar:** defekti təkrarlamaq üçün lazım olmayan addımları çıxar.
- **“Rejected” və ya “Cannot Reproduce” cavabına inciyəmə:** əlavə məlumat ver, video çək, proqramçı ilə birlikdə bax.

### 12.8. Sübut toplamaq

- **Ekran şəkli:** Windows-da Win + Shift + S. Problemli yeri işarələ.
- **Ekran videosu:** Windows-da Xbox Game Bar (Win + Alt + R) və ya ShareX, OBS kimi pulsuz proqramlar. Video addımları göstərmək üçün ən güclü sübutdur.
- **Konsol xətaları və şəbəkə sorğuları:** brauzerin DevTools panelindən (Fəsil 13).
- **Mobil cihazda:** telefonun ekran yazısı funksiyası.

### 12.9. Jira

Jira — tapşırıqların və defektlərin izlənməsi üçün ən populyar alətdir (Atlassian şirkətinin məhsulu).

- **Issue növləri:** Epic (böyük iş), Story (user story), Task (tapşırıq), Bug (defekt), Sub-task (alt tapşırıq).
- **Workflow** — statusların ardıcıllığı, yuxarıdakı həyat dövrü kimi.
- **Board** — sütunlu lövhə: Scrum board (sprintlər) və ya Kanban board.
- **Sahələr:** Assignee (kimə təyin olunub), Reporter (kim yazıb), Priority, Labels, Components, Fix Version, Sprint.
- **Link** — bug-ı user story-yə bağlamaq: “is blocked by”, “relates to”.

**JQL (Jira Query Language)** — Jira-da axtarış dilidir:

```text
project = SHOP AND issuetype = Bug AND status = Open ORDER BY priority DESC
```

Bu sorğu SHOP layihəsindəki açıq baqları prioritetə görə sıralayır. Daha bir neçə nümunə:

- `assignee = currentUser() AND resolution = Unresolved` — mənə təyin olunmuş həll olunmamış tapşırıqlar.
- `reporter = currentUser() AND created >= -7d` — son 7 gündə yazdığım tapşırıqlar.
- `issuetype = Bug AND priority = Highest AND status != Closed` — bağlanmamış ən yüksək prioritetli baqlar.

Praktika üçün Jira-nın pulsuz planı ilə öz sınaq layihəni aç və bu fəslin tapşırıqlarını orada yaz. Alternativlər: Azure DevOps, YouTrack, Linear, GitHub Issues — məntiq eynidir.

### 12.10. Story-nin yolu: Ready for QA-dan Done-a {#c12x1}

12.6 defektin yoludur. Story-nin də yolu var. Tipik lövhə: To Do → In Progress → Code Review → Ready for QA → In QA → Done. Sütun adları komandadan asılıdır.

**1. Götürməzdən əvvəl yoxla.** Build mənim mühitimdədirmi? Qəbul meyarları varmı? Proqramçının qeydi varmı: nə dəyişib, nəyə diqqət etmək lazımdır, hansı data lazımdır? Asılı tapşırıqlar bitibmi? Bir şey çatmırsa, proqramçıya yaz, story-ni In QA-ya keçirmə.

**2. Test et.** Story-ni In QA-ya keçir ki, görünsün. Qəbul meyarlarını və öz test ideyalarını (neqativ, sərhəd) yoxla.

**3. Baq tapdın: nə etmək?**

| Hal | Nə edirsən |
| --- | --- |
| Qəbul meyarı pozulub, story bu halda buraxıla bilməz | Bug yaz, story-yə bağla (“is blocked by”), story-ni proqramçıya qaytar |
| Kiçik problem, qəbul meyarına toxunmur | Ayrı Bug yaz, story-yə bağla (“relates to”). Story davam edə bilər, prioriteti Product Owner seçir |
| Tapıntı yeni tələbə bənzəyir | Baq olmaya bilər: Product Owner-dən soruş, lazım olsa yeni story açılır |

Komandaların qaydası fərqlidir: bəziləri story-ni geri keçirir, bəziləri In QA-da saxlayıb baqı gözləyir. İlk həftə soruş. Geri qaytaranda səbəbi yaz: hansı meyar, hansı build, hansı baq.

**4. Bitirəndə şərh yaz.** “Test edildi” heç nə demir.

```text
Test edildi: build 3.2.1, test mühiti, Chrome 141 və Android 14.
Data: standard_user, TEST10 promo kodu.
Yoxlanıb: qəbul meyarları 1–4, boş və yanlış kod, ikinci dəfə tətbiq.
Yoxlanmayıb: Safari (cihaz yoxdur).
Baqlar: SHOP-240 (Minor, açıq; relizə mane olmur, Product Owner razıdır).
Nəticə: Done-a keçirirəm.
```

Bu şərh sənin sığortandır: iki həftə sonra soruşulanda nəyi yoxladığını dəqiq göstərir.

### 12.11. Bug triage: baqlar kimin qərarı ilə düzəlir {#c12x2}

**Triage** yeni baqlara baxıb qərar verməkdir: bu baqdırmı, nə qədər ciddidir, kim və nə vaxt düzəldəcək? Görüş şəklində olur (Product Owner, texniki lider, QA lead, bəzən tester) və ya QA lead hər gün özü baxır. Severity-ni adətən tester təyin edir (triage-da dəyişə bilər), priority-ni isə adətən Product Owner və ya menecer qoyur (12.3–12.5).

| Baq | Qərar | Niyə |
| --- | --- | --- |
| Ödəniş iki dəfə çıxılır (canlıda) | İndi düzəlsin, hotfix | Pul itkisi |
| Promo kod məbləği yeniləmir | Bu sprintdə | Kampaniyaya mane olur, canlıda hələ yoxdur |
| Profil şəkli 2 piksel sürüşüb | Deferred | Təsiri çox azdır |
| Dəstəklənməyən köhnə brauzerdə düymə görünmür | Rejected | Tələbdən kənardır |
| Login-də 500 xətası | Duplicate | SHOP-180 artıq açıqdır |

**Baqı necə təqdim etmək.** Üç şey de: təsir, tezlik, müvəqqəti həll.

> SHOP-318: promo kod tətbiq olunanda məbləğ yenilənmir. Hər dəfə təkrarlanır, kod işlədən bütün müştərilərə təsir edir. Müvəqqəti həll yoxdur. Tövsiyəm: relizdən əvvəl düzəltmək.

**Qərar sənin istədiyin kimi olmayanda.** Fakt əlavə etmək istəyirsənsə, bir dəfə de. Sonra qərarı tiketdə qeyd et və davam et. Prioritet biznes qərarıdır. Sənin işin riskin görünməsidir, mübahisəni udmaq yox.

### 12.12. Canlıda baq çıxanda {#c12x3}

Dəstək yazır: “Müştərilər ödəyə bilmir.” Canlıda xidmətin pozulmasına **incident** deyilir. Addımlar:

1. **Ciddiliyini anla.** Neçə müştəri, hansı funksiya, pul və ya data itkisi varmı? Kritikdirsə, dərhal QA lead-ə və komanda kanalına yaz. Tək başına həll etməyə çalışma.
2. **Təkrarla.** Əvvəl test mühitində və staging-də. Canlıda yalnız icazə ilə və test hesabı ilə (4.8). Müştərinin hesabına girmə, real əməliyyat etmə.
3. **Bug report yaz.** Müraciətin linki, müraciət sayı, təsir, vaxt, build, müvəqqəti həll.
4. **Düzəlişi yoxla.** Hotfix addımları (4.10), deploy-dan sonra canlıda smoke.
5. **Testi əlavə et.** Bu baq üçün test case və ya avtomatik test yaz, regression dəstinə sal.
6. **Nəticə çıxar.** Niyə tapılmadı? Tələbdə yox idi, test mühitinin datası fərqli idi, risk aşağı qiymətləndirilmişdi? Bu təhlilə postmortem deyilir və günahkar axtarmaq üçün deyil, prosesi yaxşılaşdırmaq üçündür (blameless).

**Baq sənin yoxladığın yerdədirsə.** Bəhanə gətirmə, özünü də günahlandırma. Belə de: “Bu halı yoxlamamışam. Test case-ə əlavə etdim, oxşar sahələri bu gün yoxlayıram.” Test defektin yoxluğunu sübut etmir (Prinsip 1), amma nəticə çıxarmaq sənin işindir.

### Diqqət: tez-tez edilən səhvlər

- **Faktiki nəticə ilə gözlənilən nəticəni qarışdırmaq.**
- **Mühiti yazmamaq.** “Məndə işləmir” — harada, hansı brauzerdə?
- **Severity-ni şişirtmək.** Hər baq “Critical” olanda heç biri critical olmur.
- **Bir dəfə görünüb itən problemi yazmamaq.** Aralıq (intermittent) defektləri də yaz və tezliyi göstər: məsələn, 2/10.

### Həll olunmuş nümunə

**Tapşırıq.** Bu pis bug report-u yaxşı formaya sal: “Login işləmir, düzəldin!!! Mən daxil ola bilmirəm.”

Tester-in araşdırmasından əlavə məlumat: istifadəçi test.user@example.com ilə qeydiyyatdan keçib. Telefonda email-in ilk hərfi avtomatik böyük yazılır: Test.user@example.com. Bu halda giriş alınmır, kiçik hərflə isə alınır.

**Həll.**

| Sahə | Dəyər |
| --- | --- |
| Başlıq | Login: böyük hərflə yazılmış email ilə daxil olmaq mümkün deyil |
| Mühit | Android 15, Chrome mobil; test serveri, build 2.4.0 |
| Severity | Major |
| Priority | High (təklif) |
| İlkin şərtlər | İstifadəçi test.user@example.com / Test1234! ilə qeydiyyatdadır |
| Addımlar | 1) Login səhifəsini aç. 2) Email sahəsinə Test.user@example.com yaz. 3) Şifrə sahəsinə Test1234! yaz. 4) “Daxil ol” bas. |
| Gözlənilən nəticə | İstifadəçi daxil olur: email böyük-kiçik hərfə həssas olmamalıdır (US-01, AC-3) |
| Faktiki nəticə | “Email və ya şifrə yanlışdır” xətası görünür |
| Təkrarlanma | 5/5. Kiçik hərflə (test.user@example.com) giriş uğurludur |
| Əlavələr | Ekran videosu; Network panelindən login sorğusunun cavabı (401) |

**Niyə belə qiymətləndirdik:**

1. **Severity Major:** login kiçik hərflə işləyir, amma istifadəçilərin bir qismi üçün yox. Yolu var, ona görə Critical deyil.
2. **Priority High:** telefon klaviaturaları ilk hərfi avtomatik böyük yazır. Deməli, mobil istifadəçilərin çoxu bu problemlə qarşılaşacaq.
3. **Faydalı detal:** “kiçik hərflə işləyir” cümləsi proqramçıya problemin səbəbini dərhal göstərir.

### Sənin növbən

1. Severity və priority təyin et və səbəbini yaz:
   1. Sifarişi ödəyəndə pul iki dəfə çıxılır.
   2. Footer-də il 2025 yazılıb.
   3. Admin panelində 1000-dən çox sətirli hesabatı ixrac edəndə sistem çökür.
   4. Mobil tətbiqdə qaranlıq rejimdə bir ikon görünmür.
   5. Axtarışda “ə” hərfi olan sözlər nəticə vermir.
2. Bu vəziyyət üçün tam bug report yaz: axtarışa “şəkər” yazanda nəticə çıxmır, “sekər” yazanda çıxır.
3. Real bir saytda kiçik bir problem (vizual və ya mətn) tap və tam bug report yaz.
4. Bug life cycle-ı yaddan kağıza çək: bütün statuslar və keçidlər.
5. JQL yaz: SHOP layihəsində son 14 gündə yaradılmış, statusu Closed olmayan bütün baqlar.

### Özünü yoxla

- Yaxşı bug report başlığının formulu nədir?
- Severity ilə priority fərqi nədir? Hər kombinasiyaya misal ver.
- Reopened statusu nə vaxt istifadə olunur?
- Duplicate və Cannot Reproduce nə deməkdir?

# V hissə — Texniki biliklər

## Fəsil 13. Veb necə işləyir: client-server, HTTP, status kodları, DevTools

Veb tətbiq iki tərəfin söhbətidir: brauzer (client) sorğu göndərir, server cavab qaytarır. Bu söhbəti başa düşən tester defektin harada olduğunu — ekranda, serverdə və ya bazada — özü tapa bilir.

### 13.1. Client-server modeli

Restoranı düşün. Sən (client) ofisianta sifariş verirsən, ofisiant (HTTP) sifarişi mətbəxə (server) çatdırır. Aşpaz lazım olanı anbardan (verilənlər bazası) götürüb hazırlayır, ofisiant yeməyi gətirir — bu, cavabdır.

- **Frontend** — istifadəçinin gördüyü hissə: HTML (quruluş), CSS (görünüş), JavaScript (davranış). Brauzerdə işləyir.
- **Backend** — serverdəki məntiq: hesablamalar, yoxlamalar, data ilə iş.
- **Verilənlər bazası** — məlumatların saxlandığı yer (Fəsil 16).

&#91;embedded content: client-server · bir sorğunun 5 addımı\]

Tester Network panelində 1-ci və 4-cü addımları görür; server ilə baza arasındakı hissəni isə SQL ilə yoxlayır (Fəsil 16).

### 13.2. URL-in anatomiyası

Misal: `https://shop.example.com:443/products/shoes?color=red&size=42#reviews`

| Hissə | Dəyər | Mənası |
| --- | --- | --- |
| Protokol | https | Hansı qaydalarla danışırıq |
| Domen | shop.example.com | Serverin ünvanı; shop — subdomen |
| Port | 443 | Serverdəki “qapı”; HTTPS üçün default 443-dür, ona görə adətən yazılmır |
| Yol (path) | /products/shoes | Serverdə hansı resurs |
| Sorğu parametrləri (query) | ?color=red&size=42 | Əlavə şərtlər; & ilə ayrılır |
| Fraqment | #reviews | Səhifənin içində hansı hissə; serverə göndərilmir |

URL-dəki parametrləri dəyişmək də testdir. Məsələn, `?page=2` əvəzinə `?page=-1` və ya `?page=abc` yaz — sayt necə reaksiya verir? DNS isə domeni IP ünvanına çevirən sistemdir: internetin telefon kitabçası.

### 13.3. HTTP və HTTPS

HTTP brauzerlə serverin danışıq qaydalarıdır. HTTPS eyni qaydalardır, amma şifrələnmiş kanalla (TLS): yolda kimsə məlumatı oxuya bilmir. Login, ödəniş və şəxsi məlumat olan səhifələr mütləq HTTPS üzərindən işləməlidir.

### 13.4. HTTP sorğusu və cavabı

**Sorğu (request)** dörd hissədən ibarətdir:

1. **Metod** — nə etmək istəyirik (GET, POST…).
2. **URL** — hansı resursla.
3. **Başlıqlar (headers)** — əlavə məlumat: dil, token, data formatı.
4. **Gövdə (body)** — göndərilən data; hər sorğuda olmur.

**Cavab (response)** üç hissədən ibarətdir: status kodu, başlıqlar və gövdə (HTML səhifə, JSON data, şəkil).

```http
POST /api/login HTTP/1.1
Host: shop.example.com
Content-Type: application/json

{"email": "test.user@example.com", "password": "Test1234!"}
```

Cavab:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"token": "eyJhbGciOi...", "name": "Test User"}
```

### 13.5. HTTP metodları

| Metod | Nə edir | CRUD | Misal |
| --- | --- | --- | --- |
| GET | Məlumatı oxuyur | Read | Məhsulların siyahısını almaq |
| POST | Yeni məlumat yaradır | Create | Yeni sifariş yaratmaq |
| PUT | Məlumatı tam əvəz edir | Update | Profili bütövlükdə yeniləmək |
| PATCH | Məlumatı qismən dəyişir | Update | Yalnız telefon nömrəsini dəyişmək |
| DELETE | Məlumatı silir | Delete | Səbətdən məhsulu silmək |

CRUD — Create, Read, Update, Delete sözlərinin baş hərfləridir: data ilə dörd əsas əməliyyat.

### 13.6. Status kodları

Status kodu 3 rəqəmlidir, birinci rəqəm qrupu göstərir.

| Kod | Mənası | Tester üçün nə deməkdir |
| --- | --- | --- |
| 200 OK | Uğurlu | Sorğu işlədi |
| 201 Created | Yaradıldı | POST ilə yeni resurs yarandı |
| 204 No Content | Uğurlu, gövdə yoxdur | Çox vaxt DELETE-dən sonra |
| 301 / 302 | Yönləndirmə | Səhifə başqa ünvana köçüb |
| 304 Not Modified | Dəyişməyib | Brauzer faylı keşdən götürür |
| 400 Bad Request | Sorğu səhvdir | Göndərilən data yanlışdır |
| 401 Unauthorized | Kimlik təsdiqlənməyib | Login olunmayıb və ya token səhvdir |
| 403 Forbidden | İcazə yoxdur | Kim olduğun bəllidir, amma bu resursa icazən yoxdur |
| 404 Not Found | Tapılmadı | Resurs və ya səhifə yoxdur |
| 405 Method Not Allowed | Metod qadağandır | Məsələn, yalnız GET qəbul edən yerə DELETE göndərilib |
| 409 Conflict | Konflikt | Məsələn, bu email artıq qeydiyyatdadır |
| 422 Unprocessable Content | Data emal oluna bilmir | Format düzgündür, amma qaydalara uymur |
| 429 Too Many Requests | Çox sorğu | Limit aşılıb |
| 500 Internal Server Error | Serverdə xəta | Backend defekti — mütləq bug report |
| 502 / 503 / 504 | Server əlçatan deyil və ya gec cavab verir | Mühit və ya infrastruktur problemi |

**Qızıl qayda:** 4xx — sorğunun (client tərəfin) problemidir, 5xx — serverin. İstifadəçi nə yazırsa yazsın, server 500 qaytarmamalıdır: yanlış dataya 400 və ya 422 ilə cavab verməlidir.

**401 və 403 fərqi:** 401 — “sən kimsən?”, 403 — “səni tanıyıram, amma bura girə bilməzsən”.

### 13.7. Cookie, sessiya və brauzer yaddaşı

HTTP özü “yaddaşsızdır”: hər sorğu ayrıdır. Server səni tanımaq üçün cookie və ya token işlədir.

- **Cookie** — serverin brauzerə qoyduğu kiçik məlumatdır; brauzer onu hər sorğu ilə geri göndərir. Sessiya cookie-si səni “daxil olmuş” saxlayır.
- **Token** (məsələn, JWT) — login-dən sonra verilən “keçid kartı”; sorğularda Authorization başlığında göndərilir.
- **localStorage və sessionStorage** — brauzerdə saxlanan data; sessionStorage tab bağlananda silinir.

Test ideyaları: cookie-ləri silib səhifəni yenilə (sessiya bitirmi?); logout-dan sonra köhnə token işləyirmi?; iki tabda eyni anda işlə.

### 13.8. Keş (cache)

Brauzer sürət üçün faylları yadda saxlayır. Klassik vəziyyət: proqramçı “düzəltdim” deyir, sən isə köhnə versiyanı görürsən.

- **Sərt yeniləmə:** Ctrl + Shift + R və ya Ctrl + F5.
- **Gizli pəncərə:** Chrome-da Ctrl + Shift + N.
- **DevTools → Network → “Disable cache”** — DevTools açıq olanda keş işləmir.

### 13.9. DevTools — tester-in əsas aləti

DevTools F12 və ya Ctrl + Shift + I ilə açılır.

| Panel | Nə üçün | Tester nə edir |
| --- | --- | --- |
| Elements | HTML və CSS-ə baxmaq | Elementin mətnini müvəqqəti dəyişib uzun mətnin sığmasını yoxlayır |
| Console | JavaScript xətaları və mesajlar | Qırmızı xətaları bug report-a əlavə edir |
| Network | Bütün sorğular və cavablar | Status kodlarını, cavab müddətini, göndərilən datanı yoxlayır |
| Application | Cookie, localStorage, sessionStorage | Cookie-ləri silib sessiya davranışını yoxlayır |
| Device toolbar (Ctrl + Shift + M) | Mobil ekran emulyasiyası | Saytı müxtəlif ekran ölçülərində yoxlayır |
| Lighthouse | Avtomatik audit | Performans və əlçatanlıq problemlərini tapır |

Network panelində faydalı funksiyalar:

- **Preserve log** — səhifə dəyişəndə sorğular silinmir.
- **Fetch/XHR filtri** — yalnız API sorğularını göstərir.
- **Throttling** — yavaş internet simulyasiyası (məsələn, “Slow 4G”).
- **Copy as cURL** — sorğuya sağ klik → Copy; sorğunu proqramçıya göndərmək üçün.
- **HAR faylı** — bütün şəbəkə fəaliyyətini faylda saxlamaq. Diqqət: HAR-da token və şifrələr ola bilər, ehtiyatla paylaş.

### 13.10. Frontend, yoxsa backend?

| Network-da nə görürsən | Nəticə |
| --- | --- |
| Heç bir sorğu getmir | Frontend: düymə işləmir. Console-da xəta axtar |
| Sorğu gedir, 500 qayıdır | Backend: serverdə xəta |
| 400 və ya 422 qayıdır | Göndərilən data yanlışdır: frontend səhv göndərir və ya ekranda xəta mesajı göstərilmir |
| 200 qayıdır, cavab düzgündür, ekran səhvdir | Frontend: data düzgün gəlir, amma səhv göstərilir |
| 200 qayıdır, amma cavabdakı data səhvdir | Backend: server səhv data qaytarır |

Bu cədvəl bug report-u dəqiqləşdirir və proqramçının vaxtına qənaət edir.

### Diqqət: tez-tez edilən səhvlər

- **Keşi unutmaq.** “Düzəlməyib” deməzdən əvvəl sərt yeniləmə et.
- **Yalnız ekrana baxmaq.** Network və Console-a baxmadan “işləmir” yazma.
- **Şəxsi məlumatı paylaşmaq.** HAR faylında və ekran şəklində token və şifrə ola bilər.

### Həll olunmuş nümunə

**Tapşırıq.** Saytda “Profili yadda saxla” düyməsini basırsan, heç nə olmur. Problem frontend-dədir, yoxsa backend-də? Addım-addım araşdır.

**Həll.**

1. F12 ilə DevTools-u aç, Network panelinə keç, “Preserve log”u yandır, Fetch/XHR filtrini seç.
2. Console panelini də aç ki, xətaları görəsən.
3. Düyməni bas və nəticəyə bax:
   - **Heç bir sorğu yoxdur** → frontend. Console-da qırmızı xəta varmı? Məsələn, “Cannot read properties of undefined”. Xətanın mətnini report-a köçür.
   - **Sorğu var, status 500** → backend. Response tabındakı xəta mətnini report-a əlavə et.
   - **Status 400 və ya 422** → Payload tabında göndərilən dataya bax: hansı sahə səhvdir? Ekranda xəta mesajı göstərilmirsə, bu da ayrıca defektdir.
   - **Status 200, cavabda yeni data var, ekran dəyişmir** → frontend: data gəlir, amma ekran yenilənmir.
4. Bug report-a əlavə et: sorğunun URL-i və metodu, status kodu, cavabın mətni, konsol xətası, ekran videosu.
5. **Nəticə:** proqramçı report-u açan kimi problemin harada olduğunu bilir.

### Sənin növbən

1. URL-i hissələrə ayır: `https://www.example.com:8080/catalog/books?author=nizami&page=2#top`
2. Hansı status kodu gözlənilir: (a) mövcud olmayan səhifə; (b) login olmadan profil API-si; (c) adi istifadəçi admin səhifəsini açır; (d) yeni istifadəçi uğurla yaradıldı; (e) serverdə xəta.
3. Sevdiyin saytı aç: ana səhifə yüklənəndə Network-da neçə sorğu gedir? Ən yavaş sorğu hansıdır və nə qədər çəkir?
4. Bir saytda daxil ol, sonra Application panelində cookie-ləri sil və səhifəni yenilə. Nə baş verdi? İzah et.
5. Bir neçə saytın Console panelinə bax və bir xəta tap. Xəta nə deyir?

### Özünü yoxla

- Frontend, backend və verilənlər bazası nədir?
- GET və POST fərqi nədir?
- 401 və 403 fərqi nədir?
- 4xx və 5xx kodları nəyi göstərir?
- Network panelinə baxaraq defektin frontend-də, yoxsa backend-də olduğunu necə müəyyən edirsən?

## Fəsil 14. Veb tətbiqlərin testi

Veb tətbiqi test etmək təkcə “düymələr işləyirmi?” sualı deyil: formalar, naviqasiya, brauzerlər, ekran ölçüləri, əlçatanlıq, təhlükəsizlik və dil də yoxlanılır. Bu fəsil hər sahə üçün nəyə baxmaq lazım olduğunu göstərir.

### 14.1. Formaların testi

Formalar defektlərin ən çox olduğu yerdir.

- **Məcburi sahələr:** boş göndərəndə hər sahənin altında aydın xəta mesajı çıxırmı?
- **Validasiya:** format (email, telefon), uzunluq, aralıq — EP və BVA ilə.
- **Xəta mesajları:** mətn aydındırmı, sahənin yanında görünürmü, düzələndə yox olurmu?
- **Boşluqlar:** əvvəldəki və sondakı boşluqlar silinir (trim), yoxsa xəta verir?
- **Kopyala-yapışdır:** telefon nömrəsini boşluqlarla yapışdıranda nə olur?
- **Klaviatura:** Tab sırası məntiqlidirmi, Enter formanı göndərirmi?
- **İkiqat göndərmə:** düyməni iki dəfə tez basanda iki qeyd yaranırmı?
- **Avtodoldurma (autofill):** brauzer sahələri düzgün doldururmu?
- **“Geri” düyməsi:** formadan çıxıb qayıdanda daxil edilən data qalırmı?

**Client və server validasiyası.** Brauzerdəki yoxlama (client-side) istifadəçiyə tez cavab vermək üçündür, amma onu keçmək olur. Əsas yoxlama serverdə (server-side) olmalıdır. Tester bunu öz test mühitində yoxlaya bilər: DevTools-un Elements panelində sahənin `maxlength` və ya `required` atributunu silib formanı göndərir. Server yanlış datanı qəbul edirsə, bu, defektdir.

### 14.2. Naviqasiya və linklər

- Bütün linklər işləyirmi? Qırıq link 404 verir.
- Loqo ana səhifəyə aparırmı?
- “Geri” və “İrəli” düymələri gözlənildiyi kimi işləyirmi?
- Xarici linklər yeni tabda açılırmı?
- Breadcrumbs (“Ana səhifə > Kataloq > Telefonlar”) düzgündürmü?
- Mövcud olmayan səhifə üçün səliqəli 404 səhifəsi varmı?

### 14.3. UI və vizual yoxlama

- Elementlər düzgün düzülübmü, üst-üstə düşmür ki?
- Şriftlər, rənglər, ikonlar dizayn maketinə (Figma) uyğundurmu?
- Uzun mətn sığırmı? Azərbaycan dilində sözlər ingilis dilindəkindən uzun olur: “Save” → “Yadda saxla”.
- Şəkillər yüklənirmi, ölçüləri düzgündürmü?
- Hover (siçanla üzərinə gələndə), aktiv və deaktiv vəziyyətlər fərqlənirmi?

### 14.4. Azərbaycan dilinə xas yoxlamalar

Bu yoxlamalar yerli layihələrdə çox defekt tapır:

- **Hərflər:** ə, ğ, ı, İ, ö, ü, ç, ş axtarışda, adlarda, fayl adlarında düzgün görünür və işləyirmi?
- **Böyük-kiçik hərf:** Azərbaycan dilində “i”-nin böyüyü “İ”, “ı”-nın böyüyü “I”-dır. Proqram ingilis qaydası ilə çevirsə, “İlkin” axtarışı “ilkin” sözünü tapmaya bilər.
- **Sıralama:** “Ç” “C”-dən, “Ə” “E”-dən, “Ş” “S”-dən sonra gəlməlidir. Siyahı əlifba ilə düzgün sıralanırmı?
- **Tarix:** format 24.10.2026; təqvimdə həftə bazar ertəsi başlayır.
- **Valyuta və ədədlər:** AZN və ya ₼; kəsr ayırıcısı vergül (12,50) və ya nöqtə — sistem hansını qəbul edir?
- **Telefon:** +994 formatı və operator prefiksləri.

### 14.5. Cross-browser (brauzerlərarası) test

Sayt müxtəlif brauzerlərdə eyni işləməlidir: Chrome, Firefox, Safari, Edge. Hər brauzerin öz mühərriki var: Chrome və Edge — Chromium, Firefox — Gecko, Safari — WebKit.

Hansı brauzerləri yoxlamalı? Bunu saytın statistikası (analitika) göstərir. Real cihaz və brauzerlər yoxdursa, bulud xidmətləri var: BrowserStack, LambdaTest. Tez-tez çıxan problemlər: düzülüş fərqləri, tarix seçicisinin fərqli görünüşü, Safari-də işləməyən JavaScript funksiyaları, şriftlər.

### 14.6. Responsive (adaptiv) dizayn

Sayt ekran ölçüsünə uyğunlaşmalıdır.

| Cihaz | Ekran eni (piksel) |
| --- | --- |
| Kiçik telefon | 360 |
| Böyük telefon | 390–430 |
| Planşet | 768–1024 |
| Laptop | 1280–1440 |
| Böyük monitor | 1920 və yuxarı |

Yoxla: menyu burger ikonuna çevrilirmi, üfüqi sürüşdürmə (horizontal scroll) yaranmır ki, düymələr barmaqla basılacaq qədər böyükdürmü, telefonu yan çevirəndə düzülüş pozulurmu? Alət: DevTools → Device toolbar (Ctrl + Shift + M). Amma son yoxlama real cihazda olmalıdır.

### 14.7. Əlçatanlıq (accessibility)

Əlçatanlıq saytın görmə, eşitmə, hərəkət və ya idrak məhdudiyyəti olan insanlar üçün də yararlı olmasıdır. Beynəlxalq standart WCAG-dır (Web Content Accessibility Guidelines).

- **Klaviatura:** saytı yalnız Tab, Shift + Tab, Enter, Space və Esc ilə idarə etmək olurmu? Fokusun harada olduğu görünürmü?
- **Şəkillərin alt mətni:** ekran oxuyucu şəkli necə təsvir edəcək?
- **Formalarda label:** hər sahənin adı var, yoxsa yalnız placeholder?
- **Rəng kontrastı:** WCAG-a görə adi mətn üçün minimum nisbət 4,5:1-dir.
- **Yalnız rəngə güvənməmək:** xəta yalnız qırmızı rənglə yox, mətnlə də göstərilməlidir.
- **Böyütmə:** səhifə 200% böyüdüləndə istifadə oluna bilirmi?

Alətlər: Lighthouse (DevTools-da), axe DevTools və WAVE brauzer əlavələri, Windows üçün pulsuz ekran oxuyucu NVDA.

### 14.8. Təhlükəsizliyin əsasları

Dərin təhlükəsizlik testini xüsusi mütəxəssislər (pentester-lər) aparır, amma hər tester sadə yoxlamaları bilməlidir. **Vacib qayda: belə yoxlamaları yalnız sənə icazə verilmiş sistemdə — öz layihənin test mühitində et.**

- **Giriş icazələri:** URL-dəki ID-ni dəyişəndə (məsələn, /orders/1001 → /orders/1002) başqasının sifarişi açılırmı? Açılırsa, bu, ciddi defektdir.
- **Rollar:** adi istifadəçi admin səhifəsinin linkini birbaşa açanda nə görür? 403 gözlənilir.
- **Sessiya:** logout-dan sonra “Geri” ilə şəxsi səhifə görünürmü? Sessiya müəyyən vaxtdan sonra bitirmi?
- **Şifrə:** ekranda gizlədilirmi, URL-də görünürmü?
- **Xəta mesajları:** həddən artıq məlumat verirmi? Məsələn, ekranda kod və ya verilənlər bazası xətası görünür.
- **Xüsusi simvollar:** sahələrə `<`, `>`, `'`, `"` daxil edəndə səhifə onları adi mətn kimi göstərməlidir, pozulmamalıdır. XSS və SQL injection adlanan hücumlar məhz giriş datasının düzgün emal olunmamasından yaranır.

Ətraflı öyrənmək üçün: OWASP Top 10 — veb tətbiqlərin ən geniş yayılmış təhlükəsizlik risklərinin siyahısı.

### 14.9. Performansın əsasları

- **Lighthouse auditi:** Performance balı və tövsiyələr.
- **Network paneli:** səhifənin yüklənmə müddəti və ən ağır fayllar (çox vaxt optimallaşdırılmamış şəkillər).
- **Yavaş şəbəkə:** throttling ilə sayt istifadə oluna bilirmi, yükləmə göstəricisi (loader) varmı?

### Diqqət: tez-tez edilən səhvlər

- **Yalnız bir brauzerdə və yalnız böyük ekranda test etmək.**
- **Təhlükəsizlik yoxlamalarını icazəsiz sistemdə etmək.** Bu, qanunla qadağan oluna bilər.
- **Əlçatanlığı “sonraya” saxlamaq.** Bir çox ölkədə bu, qanuni tələbdir.

### Həll olunmuş nümunə

**Tapşırıq.** Onlayn mağazanın axtarış sahəsi üçün kateqoriyalar üzrə veb test checklist-i hazırla.

**Həll.**

**Funksional:**

- Mövcud məhsulun tam adı ilə axtarış
- Adın bir hissəsi ilə axtarış (“çayd”)
- Mövcud olmayan söz — “Heç nə tapılmadı” mesajı və təkliflər
- Boş axtarış və yalnız boşluqlar
- Enter və axtarış ikonu ilə göndərmə
- Nəticələrin filtr və sıralama ilə birgə işləməsi

**Azərbaycan dilinə xas:**

- “şəkər”, “ŞƏKƏR” və “Şəkər” eyni nəticəni verirmi?
- “İlkin” və “ilkin” axtarışı
- Azərbaycan hərfləri olmadan yazılış (“seker”) üçün nəticə və ya təklif varmı?

**UI və responsive:**

- Uzun sorğu sahəyə sığırmı?
- Mobil ekranda klaviatura nəticələri örtmür ki?

**Təhlükəsizlik (test mühitində):**

- `<b>test</b>` yazanda səhifə onu adi mətn kimi göstərir, qalın şrift kimi yox
- Çox uzun sorğu (5000 simvol) — səhifə çökmür, aydın mesaj çıxır

**Performans:**

- Nəticələr məqbul vaxtda gəlirmi (məsələn, 2 saniyədən tez)?
- Avtotamamlama varsa, çox sürətli yazanda nəticələr qarışmır ki?

**Əlçatanlıq:**

- Sahəyə Tab ilə çatmaq olurmu, sahənin label-i varmı?

### Sənin növbən

1. Qeydiyyat forması üçün kateqoriyalar üzrə (funksional, UI, Azərbaycan dili, təhlükəsizlik, əlçatanlıq) checklist yaz.
2. Sevdiyin saytı DevTools-da 360, 768 və 1440 piksel enində aç. Tapdığın problemləri yaz.
3. Bir saytda siçandan istifadə etmədən, yalnız klaviatura ilə qeydiyyatdan keçməyə çalış. Harada çətinlik çəkdin?
4. Lighthouse auditini işə sal. Ən aşağı bal alan iki problemi öz sözlərinlə izah et.
5. Şəhərləri əlifba ilə sıralayan bir sayt tap: Ç, Ə, Ş hərfləri düzgün yerdədirmi?

### Özünü yoxla

- Client-side və server-side validasiya fərqi nədir? Hansı daha vacibdir?
- Azərbaycan dilinə xas 3 test ideyası de.
- Responsive test üçün hansı ekran enlərini yoxlayarsan?
- Tester-in edə biləcəyi 3 sadə təhlükəsizlik yoxlaması hansıdır və icazə niyə vacibdir?

## Fəsil 15. API testi və Postman

API testi sistemi ekransız, birbaşa “mühərrik” səviyyəsində yoxlayır: daha tez, daha sabitdir və UI-nin gizlətdiyi defektləri tapır. Bu fəsildə Postman ilə ilk sorğudan avtomatik yoxlamalara qədər addım-addım gedəcəyik.

### 15.1. API nədir

API (Application Programming Interface) — proqramların bir-biri ilə danışma qaydalarıdır. Restoranda menyu nəyi sifariş edə biləcəyini göstərir (API sənədi), ofisiant isə sifarişi mətbəxə çatdırır (API). Sən mətbəxin içini görmürsən, amma nə istəyəcəyini və nə alacağını bilirsən.

**Misal.** Mobil tətbiq və veb sayt eyni API-dən istifadə edir. Hava proqnozu tətbiqi məlumatı hava xidmətinin API-sindən alır.

### 15.2. Niyə API testi

- **Erkəndir:** UI hazır olmadan test etmək olur (Prinsip 3).
- **Sürətlidir:** brauzer açmadan saniyələrlə yüzlərlə yoxlama.
- **Sabitdir:** dizayn dəyişəndə testlər sınmır.
- **Gizli defektləri tapır:** UI sahəni 100 simvolla məhdudlaşdırır, amma API 10 000 simvolu qəbul edirsə, bu, defektdir. Kimsə UI-ni keçib birbaşa API-yə sorğu göndərə bilər.

### 15.3. REST və JSON

REST ən geniş yayılmış API üslubudur. Əsas ideya: hər şey resursdur (istifadəçi, sifariş, məhsul), hər resursun ünvanı var (endpoint), resursla HTTP metodları ilə işləyirik (Fəsil 13).

| Endpoint | Metod | Mənası |
| --- | --- | --- |
| /users | GET | Bütün istifadəçilər |
| /users/5 | GET | ID-si 5 olan istifadəçi |
| /users | POST | Yeni istifadəçi yarat |
| /users/5 | PUT / PATCH | 5 nömrəli istifadəçini yenilə |
| /users/5 | DELETE | 5 nömrəli istifadəçini sil |

JSON API-lərin ən çox istifadə etdiyi data formatıdır:

```json
{
  "id": 5,
  "name": "Aysel Məmmədova",
  "email": "aysel@example.com",
  "isActive": true,
  "balance": 125.50,
  "phone": null,
  "roles": ["customer", "beta-tester"],
  "address": {
    "city": "Bakı",
    "street": "Nizami küç. 10"
  }
}
```

| Tip | Misal | Qeyd |
| --- | --- | --- |
| string (mətn) | "Aysel" | Həmişə dırnaq içində |
| number (ədəd) | 5, 125.50 | Dırnaqsız; kəsr nöqtə ilə |
| boolean (məntiqi) | true, false | Dırnaqsız |
| null (boş) | null | Dəyər yoxdur |
| object (obyekt) | { … } | Açar-dəyər cütləri |
| array (massiv) | \[ … \] | Sıralı siyahı |

Tester üçün: "5" (mətn) və 5 (ədəd) fərqlidir. API ədəd əvəzinə mətn qaytarırsa, bu, defekt ola bilər. API sənədləri adətən Swagger (OpenAPI) formatında olur: hər endpoint, parametrləri, nümunə sorğu və cavablar bir səhifədə görünür.

### 15.4. Postman ilə tanışlıq

Postman API sorğularını göndərmək və yoxlamaq üçün ən populyar alətdir. Onu postman.com saytından yüklə və hesab aç. Alternativlər: Insomnia, Bruno, VS Code-un Thunder Client əlavəsi.

- **Workspace** — iş sahəsi.
- **Collection** — sorğuların qovluğu (məsələn, “Users API”).
- **Request** — bir sorğu: metod, URL, başlıqlar, gövdə.
- **Environment** — dəyişənlər dəsti (məsələn, test və staging serverlərinin ünvanları).
- **Variable** — dəyişən: `{{baseUrl}}` kimi yazılır.

### 15.5. Addım-addım: ilk sorğular

Məşq üçün JSONPlaceholder-dən istifadə edəcəyik — öyrənmək üçün yaradılmış pulsuz saxta API. Orada 10 istifadəçi, 100 post, 500 şərh və 200 tapşırıq var. Vacib: yazma sorğuları (POST, PUT, DELETE) saxtadır — server düzgün cavab qaytarır, amma data həqiqətən dəyişmir.

**Addım 1 — GET: bir istifadəçini almaq.**

1. Postman-da yeni sorğu aç: New → HTTP.
2. Metod: GET. URL: `https://jsonplaceholder.typicode.com/users/1`
3. Send düyməsini bas.
4. Nəticə: status 200 OK, gövdədə JSON — id-si 1 olan istifadəçi (adı Leanne Graham). Aşağıda cavab müddətini (ms) və ölçüsünü də görəcəksən.

**Addım 2 — GET parametrlə: filtr.** URL: `https://jsonplaceholder.typicode.com/posts?userId=1`. Nəticə: 1 nömrəli istifadəçinin 10 postu. Params tabında userId=1 cütünü görəcəksən — Postman URL-dəki parametrləri cədvəl kimi göstərir.

**Addım 3 — POST: yeni post yaratmaq.**

1. Metod: POST. URL: `https://jsonplaceholder.typicode.com/posts`
2. Body → raw → JSON seç və yaz:

```json
{
  "title": "İlk testim",
  "body": "Postman ilə API testi",
  "userId": 1
}
```

3. Send. Nəticə: 201 Created; cavabda göndərdiyin data və "id": 101.

id 101 olur, çünki 100 post artıq var. Amma data saxlanmır: GET /posts/101 sorğusu 404 qaytaracaq.

**Addım 4 — PUT, PATCH, DELETE.**

- **PUT /posts/1** — postu tam əvəz edir, bütün sahələri göndərmək lazımdır.
- **PATCH /posts/1** — yalnız göndərilən sahəni dəyişir: `{"title": "Yeni başlıq"}`.
- **DELETE /posts/1** — 200 OK qaytarır.

**Addım 5 — neqativ sorğu.** `GET https://jsonplaceholder.typicode.com/posts/9999` → 404 Not Found və boş obyekt `{}`. Mövcud olmayan resurs üçün 404 düzgün cavabdır.

### 15.6. Postman-da avtomatik yoxlamalar

Hər dəfə cavaba gözlə baxmaq əvəzinə yoxlamaları kodla yazırıq — Postman onları hər Send-dən sonra işə salır. Postman-ın yeni versiyalarında bu, Scripts → Post-response tabıdır (köhnə versiyalarda “Tests” tabı). Kod JavaScript-dir (Fəsil 18).

```javascript
pm.test("Status kodu 200-dür", function () {
  pm.response.to.have.status(200);
});

pm.test("İstifadəçinin adı düzgündür", function () {
  const data = pm.response.json();
  pm.expect(data.name).to.eql("Leanne Graham");
});

pm.test("Email sahəsində @ var", function () {
  const data = pm.response.json();
  pm.expect(data.email).to.include("@");
});

pm.test("Cavab 1 saniyədən tez gəlir", function () {
  pm.expect(pm.response.responseTime).to.be.below(1000);
});
```

**Sətir-sətir izah:**

- `pm.test("ad", function () { … })` — bir yoxlama elan edir; ad nəticələrdə görünür.
- `pm.response.to.have.status(200)` — status kodu 200 olmalıdır.
- `pm.response.json()` — cavabın JSON gövdəsini obyektə çevirir; onu `data` dəyişəninə yazırıq.
- `pm.expect(a).to.eql(b)` — a b-yə bərabər olmalıdır.
- `.to.include("@")` — mətnin içində @ olmalıdır.
- `responseTime` — cavab müddəti millisaniyələrlə; `.to.be.below(1000)` — 1000-dən kiçik olmalıdır.

Send-dən sonra Test Results tabında hər yoxlamanın PASS və ya FAIL nəticəsini görəcəksən.

### 15.7. Dəyişənlər və environment

Eyni sorğular test və staging serverində işləməlidir. URL-i hər dəfə dəyişməmək üçün dəyişən işlədirik:

1. Environments → yeni environment yarat: “JSONPlaceholder”.
2. Dəyişən əlavə et: `baseUrl` = `https://jsonplaceholder.typicode.com`
3. Environment-i seç və URL-ləri belə yaz: `{{baseUrl}}/users/1`

Cavabdan dəyər götürüb sonrakı sorğuda istifadə etmək də olur:

```javascript
const data = pm.response.json();
pm.environment.set("postId", data.id);
```

Sonrakı sorğuda: `{{baseUrl}}/posts/{{postId}}`. Real layihələrdə login cavabındakı token məhz belə saxlanılır və digər sorğularda istifadə olunur.

### 15.8. Collection Runner və Newman

- **Collection Runner** — kolleksiyadakı bütün sorğuları və testləri ardıcıl işə salır; regression üçün idealdır.
- **Newman** — Postman kolleksiyalarını terminaldan işə salan alətdir. Kolleksiyanı JSON faylı kimi ixrac edib belə işə salırsan:

```bash
npm install -g newman
newman run users-api.postman_collection.json
```

Newman CI/CD-də (Fəsil 20) avtomatik işə salına bilər.

### 15.9. API test ideyaları

| Yoxlama | Nə gözlənilir |
| --- | --- |
| Düzgün sorğu | 200 və ya 201, düzgün data |
| Cavabın quruluşu | Bütün sahələr var, tipləri düzgündür (id — ədəd, email — mətn) |
| Məcburi sahə göndərilməyib | 400 və ya 422, aydın xəta mesajı |
| Yanlış tip (ədəd yerinə mətn) | 400 və ya 422 |
| Token olmadan | 401 |
| Başqasının resursu | 403 və ya 404 |
| Mövcud olmayan ID | 404 |
| Yanlış metod | 405 |
| Çox böyük data, boş gövdə | Server 500 qaytarmamalıdır |
| Xüsusi simvollar və Azərbaycan hərfləri | Data düzgün saxlanır və qaytarılır |
| Təkrar sorğu (eyni POST iki dəfə) | Dublikat yaranırmı, tələbə uyğundurmu? |
| Cavab müddəti | Razılaşdırılmış limitdən tezdir |
| Səhifələmə (pagination) | page və limit parametrləri düzgün işləyir |

### Diqqət: tez-tez edilən səhvlər

- **Yalnız status koduna baxmaq.** 200 qayıdıb, amma data səhv ola bilər — gövdəni də yoxla.
- **Test datasını yaradıb silməmək.** Server lazımsız qeydlərlə dolur və başqa testlərə mane olur.
- **Token və şifrələri kolleksiya ilə paylaşmaq.** Onları environment-də saxla, kolleksiyaya yazma.

### Həll olunmuş nümunə

**Tapşırıq.** JSONPlaceholder-də POST /posts üçün pozitiv test hazırla: sorğu, gövdə, gözlənilən nəticə və Postman yoxlamaları.

**Həll.**

1. **Sorğu:** POST `{{baseUrl}}/posts`. Body → raw → JSON seçəndə Postman `Content-Type: application/json` başlığını özü əlavə edir.
2. **Gövdə:**

```json
{
  "title": "Test post",
  "body": "Avtomatik yoxlama",
  "userId": 1
}
```

3. **Gözlənilən nəticə:** status 201; cavabda göndərilən title, body, userId və yeni id.
4. **Yoxlamalar** (Scripts → Post-response):

```javascript
const data = pm.response.json();

pm.test("Status 201 Created", function () {
  pm.response.to.have.status(201);
});

pm.test("Göndərilən başlıq qaytarılır", function () {
  pm.expect(data.title).to.eql("Test post");
});

pm.test("userId ədəd tipindədir və 1-dir", function () {
  pm.expect(data.userId).to.be.a("number");
  pm.expect(data.userId).to.eql(1);
});

pm.test("Yeni id yaradılıb", function () {
  pm.expect(data.id).to.be.a("number");
});
```

5. **Nəticə:** 4 yoxlama PASS olur. JSONPlaceholder data saxlamadığı üçün “yaradılan post GET ilə tapılır” testi burada keçməyəcək. Real API-də bu, mütləq yoxlanmalıdır.

### Sənin növbən

1. GET /users/5 sorğusunu göndər və istifadəçinin şəhərini (address.city) yoxlayan test yaz.
2. GET /posts?userId=3 cavabında düz 10 post olduğunu yoxlayan test yaz. İpucu: massivin uzunluğu `.length` ilə tapılır.
3. GET /comments?postId=1 üçün 3 fərqli test yaz.
4. Qeydiyyat API-si üçün (POST /register: email, password) 8 neqativ test ideyası yaz: sorğu və gözlənilən status.
5. baseUrl dəyişənli environment yarat və bütün sorğularını ona keçir.

### Özünü yoxla

- API nədir? Niyə API testi UI testindən tez və sabitdir?
- JSON-un 6 data tipini sadala.
- PUT və PATCH fərqi nədir?
- pm.test, pm.expect və pm.response nə edir?
- Niyə yalnız status koduna baxmaq kifayət deyil?

## Fəsil 16. Tester üçün SQL

SQL verilənlər bazası ilə danışmaq dilidir: tester onunla UI-də görünən məlumatın bazada düzgün saxlandığını yoxlayır, test datası tapır və defektin səbəbini araşdırır. Bu fəsildəki bütün sorğuları özün işə sala biləcəyin hazır məşq bazası ilə öyrənəcəyik.

### 16.1. Verilənlər bazası nədir

Verilənlər bazası (database) strukturlu məlumat anbarıdır. Ən geniş yayılmış növ relyasion (əlaqəli) bazalardır: məlumat cədvəllərdə saxlanılır.

| Baza | Excel-də qarşılığı |
| --- | --- |
| Cədvəl (table) | Vərəq |
| Sətir (row, record) | Bir sətir — bir qeyd, məsələn, bir müştəri |
| Sütun (column, field) | Bir sahə: ad, şəhər |

- **Primary key (əsas açar)** — hər sətri unikal tanıdan sütun, məsələn, id. İki müştərinin eyni id-si ola bilməz.
- **Foreign key (xarici açar)** — başqa cədvələ istinad edən sütun. orders cədvəlindəki customer\_id müştərinin id-sinə işarə edir.

Populyar sistemlər: PostgreSQL, MySQL, Microsoft SQL Server, Oracle, SQLite. SQL-in əsasları hamısında eynidir.

### 16.2. Tester SQL-i nə üçün işlədir

- UI-də edilən əməliyyatın bazaya düzgün yazıldığını yoxlamaq: sifariş, qeydiyyat.
- Test üçün lazım olan datanı tapmaq: “statusu new olan sifariş”.
- Defektin səbəbini tapmaq: ekranda səhv məbləğ var — bazada nə yazılıb?
- Data keyfiyyətini yoxlamaq: dublikatlar, boş dəyərlər, “yetim” qeydlər.

### 16.3. Məşq bazasını hazırlayaq

SQLite ilə işləyəcəyik — server tələb etməyən sadə baza. Kompüterə pulsuz DB Browser for SQLite proqramını yüklə və ya brauzerdə onlayn SQLite redaktoru aç. Aşağıdakı kodu köçür və işə sal (Execute):

```sql
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  email TEXT
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  total REAL,
  status TEXT,
  order_date TEXT
);

INSERT INTO customers (id, name, city, email) VALUES
  (1, 'Aysel Məmmədova', 'Bakı', 'aysel@example.com'),
  (2, 'Murad Əliyev', 'Gəncə', 'murad@example.com'),
  (3, 'Leyla Hüseynova', 'Bakı', 'leyla@example.com'),
  (4, 'Orxan Quliyev', 'Sumqayıt', 'orxan@example.com'),
  (5, 'Nigar Kərimova', 'Şəki', NULL);

INSERT INTO orders (id, customer_id, total, status, order_date) VALUES
  (101, 1, 45.50, 'paid', '2026-09-01'),
  (102, 1, 120.00, 'shipped', '2026-09-15'),
  (103, 2, 15.00, 'cancelled', '2026-09-20'),
  (104, 3, 80.00, 'paid', '2026-10-01'),
  (105, 3, 30.00, 'new', '2026-10-05'),
  (106, 4, 200.00, 'shipped', '2026-10-10'),
  (107, 9, 50.00, 'paid', '2026-10-12');
```

İndi iki cədvəlimiz var: 5 müştəri və 7 sifariş. Diqqət et: 107 nömrəli sifarişin müştərisi (customer\_id = 9) bazada yoxdur — bu, qəsdən qoyulmuş data defektidir, aşağıda onu tapacağıq. Nigarın isə emaili və sifarişi yoxdur.

### 16.4. SELECT — məlumatı oxumaq

SELECT bazadan məlumat oxuyur və heç nəyi dəyişmir — ən təhlükəsiz əmrdir.

```sql
SELECT * FROM customers;          -- bütün sütunlar, bütün sətirlər
SELECT name, city FROM customers; -- yalnız iki sütun
```

`*` “bütün sütunlar” deməkdir. `--` ilə başlayan mətn şərhdir, icra olunmur.

### 16.5. WHERE — filtr

```sql
SELECT name, city FROM customers WHERE city = 'Bakı';
```

| name | city |
| --- | --- |
| Aysel Məmmədova | Bakı |
| Leyla Hüseynova | Bakı |

| Operator | Mənası | Misal |
| --- | --- | --- |
| = | bərabərdir | status = 'paid' |
| <> və ya != | bərabər deyil | status <> 'cancelled' |
| >, <, >=, <= | müqayisə | total > 50 |
| AND, OR | və, və ya | status = 'paid' AND total >= 50 |
| IN | siyahıdan biri | status IN ('paid', 'shipped') |
| BETWEEN | aralıqda, sərhədlər daxil | total BETWEEN 30 AND 100 |
| LIKE | şablon | name LIKE 'L%' |
| IS NULL | dəyər yoxdur | email IS NULL |

Misallar və nəticələri:

- `SELECT * FROM orders WHERE total > 50;` → 102, 104, 106. 107-nin məbləği düz 50-dir, “50 > 50” isə yalandır.
- `SELECT * FROM orders WHERE status = 'paid' AND total >= 50;` → 104, 107.
- `SELECT * FROM orders WHERE total BETWEEN 30 AND 100;` → 101, 104, 105, 107. 30 daxildir.
- `SELECT name FROM customers WHERE name LIKE '%ova';` → Aysel Məmmədova, Leyla Hüseynova, Nigar Kərimova. `%` — “istənilən sayıda simvol” deməkdir.
- `SELECT name FROM customers WHERE email IS NULL;` → Nigar Kərimova.

NULL-u `= NULL` ilə yoxlamaq olmaz — həmişə `IS NULL` və ya `IS NOT NULL` yaz.

### 16.6. ORDER BY və LIMIT

```sql
SELECT id, total FROM orders ORDER BY total DESC LIMIT 3;
```

| id | total |
| --- | --- |
| 106 | 200.0 |
| 102 | 120.0 |
| 104 | 80.0 |

ASC — artan sıra (default), DESC — azalan. LIMIT nəticədəki sətirlərin sayını məhdudlaşdırır.

### 16.7. Aqreqat funksiyalar və GROUP BY

| Funksiya | Nə edir | Misal | Nəticə |
| --- | --- | --- | --- |
| COUNT(\*) | Sətirləri sayır | SELECT COUNT(\*) FROM orders; | 7 |
| SUM() | Cəmləyir | SELECT SUM(total) FROM orders; | 540.5 |
| AVG() | Orta qiymət | SELECT AVG(total) FROM orders; | ≈ 77.21 |
| MIN(), MAX() | Ən kiçik və ən böyük | SELECT MIN(total), MAX(total) FROM orders; | 15.0 və 200.0 |

GROUP BY sətirləri qruplaşdırır və hər qrup üçün hesablama edir:

```sql
SELECT status, COUNT(*) AS orders_count, SUM(total) AS total_sum
FROM orders
GROUP BY status
ORDER BY status;
```

| status | orders\_count | total\_sum |
| --- | --- | --- |
| cancelled | 1 | 15.0 |
| new | 1 | 30.0 |
| paid | 3 | 175.5 |
| shipped | 2 | 320.0 |

AS sütuna ad (ləqəb) verir. HAVING isə qruplar üzərində filtrdir (WHERE sətirlər üzərində):

```sql
SELECT customer_id, COUNT(*) AS orders_count
FROM orders
GROUP BY customer_id
HAVING COUNT(*) > 1;
```

Nəticə: customer\_id 1 (2 sifariş) və 3 (2 sifariş).

### 16.8. JOIN — cədvəlləri birləşdirmək

Müştərinin adı customers cədvəlində, sifariş isə orders cədvəlindədir. JOIN onları əlaqəli sütun üzrə birləşdirir.

**INNER JOIN** — yalnız hər iki cədvəldə uyğunluğu olan sətirlər:

```sql
SELECT c.name, o.id, o.total
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id;
```

| name | id | total |
| --- | --- | --- |
| Aysel Məmmədova | 101 | 45.5 |
| Aysel Məmmədova | 102 | 120.0 |
| Murad Əliyev | 103 | 15.0 |
| Leyla Hüseynova | 104 | 80.0 |
| Leyla Hüseynova | 105 | 30.0 |
| Orxan Quliyev | 106 | 200.0 |

Nigar (sifarişi yoxdur) və 107 nömrəli sifariş (müştərisi yoxdur) nəticəyə düşmədi. `c` və `o` cədvəllərin qısa adlarıdır (alias).

**LEFT JOIN** — sol cədvəlin bütün sətirləri; sağda uyğunluq yoxdursa, NULL:

```sql
SELECT c.name, o.id, o.total
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id;
```

Nəticə: yuxarıdakı 6 sətir və əlavə olaraq “Nigar Kərimova | NULL | NULL”. Sifarişi olmayan müştəriləri tapmaq üçün idealdır.

### 16.9. Data keyfiyyəti yoxlamaları

“Yetim” sifarişlər — müştərisi olmayan sifarişlər:

```sql
SELECT o.*
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
WHERE c.id IS NULL;
```

Nəticə: 107 nömrəli sifariş. Bu, data defektidir: real bazada xarici açar məhdudiyyəti belə qeydin yaranmasına imkan verməməli idi.

Dublikat emaillər:

```sql
SELECT email, COUNT(*)
FROM customers
GROUP BY email
HAVING COUNT(*) > 1;
```

Nəticə boşdur, deməli, dublikat yoxdur. Boş nəticə də nəticədir.

### 16.10. INSERT, UPDATE, DELETE — datanı dəyişmək

```sql
INSERT INTO customers (id, name, city, email)
VALUES (6, 'Rəşad Babayev', 'Bakı', 'reshad@example.com');

UPDATE orders SET status = 'shipped' WHERE id = 105;

DELETE FROM orders WHERE id = 103;
```

**Çox vacib:** WHERE-siz UPDATE və DELETE bütün cədvələ təsir edir. `DELETE FROM orders;` bütün sifarişləri silir.

1. Əvvəl eyni WHERE ilə SELECT işə sal və hansı sətirlərin dəyişəcəyini gör.
2. Canlı (production) bazada heç vaxt test etmə — yalnız test bazasında.
3. Şübhə varsa, soruş.

### Diqqət: tez-tez edilən səhvlər

- **`= NULL` yazmaq.** Həmişə `IS NULL`.
- **WHERE-siz UPDATE və ya DELETE.**
- **Mətnləri dırnaqsız yazmaq.** `WHERE city = Bakı` səhvdir, `WHERE city = 'Bakı'` düzgündür.
- **Böyük-kiçik hərfə diqqətsizlik.** SQLite-da LIKE yalnız latın hərflərində böyük-kiçik hərfi fərqləndirmir; “ə” və “Ə” fərqli sayıla bilər.

### Həll olunmuş nümunə

**Tapşırıq.** Leyla saytda sifariş verdi. Bazada onun ən son sifarişini — nömrəsini, məbləğini, statusunu və tarixini göstərən sorğu yaz.

**Həll.**

1. Lazım olan data iki cədvəldədir: ad customers-də, sifariş orders-də. Deməli, JOIN lazımdır.
2. Filtr müştərinin adı ilə olacaq. Real layihədə email və ya id ilə axtarmaq daha etibarlıdır, çünki adlar təkrarlana bilər.
3. Ən son sifariş üçün tarixə görə azalan sıralama və LIMIT 1 lazımdır.

```sql
SELECT o.id, o.total, o.status, o.order_date
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE c.name = 'Leyla Hüseynova'
ORDER BY o.order_date DESC
LIMIT 1;
```

| id | total | status | order\_date |
| --- | --- | --- | --- |
| 105 | 30.0 | new | 2026-10-05 |

4. Nəticəni UI ilə müqayisə et: saytdakı məbləğ, status və tarix eynidirmi? Fərq varsa, defektdir.
5. Qeyd: JOIN yazanda INNER sözü buraxıla bilər — JOIN default olaraq INNER JOIN-dir. Tarixlər YYYY-MM-DD formatında saxlandığı üçün mətn kimi sıralama da düzgün işləyir.

### Sənin növbən

1. Bakıdan olan müştərilərin sayını tap.
2. Statusu cancelled olmayan sifarişlərin ümumi məbləğini tap.
3. Hər müştərinin adını və sifarişlərinin ümumi məbləğini göstər; ən çox xərcləyən yuxarıda olsun.
4. Heç sifarişi olmayan müştəriləri tap.
5. 2026-cı ilin oktyabr ayında verilmiş sifarişləri tap.
6. Emaili olmayan müştəriləri tap və bunun sistemdə hansı problemlərə səbəb ola biləcəyini yaz.

### Özünü yoxla

- Primary key və foreign key nədir?
- WHERE və HAVING fərqi nədir?
- INNER JOIN və LEFT JOIN fərqi nədir?
- Niyə `= NULL` işləmir?
- WHERE-siz DELETE nə edir və bundan necə qorunmalı?

## Fəsil 17. Mobil və oyun testi

Mobil tətbiq və oyun testi veb testin bütün bilgilərini tələb edir və üstəlik öz risklərini gətirir: cihaz müxtəlifliyi, şəbəkə, kəsintilər, batareya. Oyunlarda bunlara fizika, performans və “əyləncə” də əlavə olunur.

### 17.1. Mobil tətbiq növləri

| Növ | Nədir | Texnologiyalar |
| --- | --- | --- |
| Native | Bir platforma üçün yazılır | Kotlin (Android), Swift (iOS) |
| Cross-platform | Bir kodla iki platforma | Flutter, React Native |
| Mobil veb / PWA | Brauzerdə açılan sayt, tətbiq kimi işləyə bilər | HTML, CSS, JavaScript |

### 17.2. Mobil test niyə fərqlidir

- **Cihaz müxtəlifliyi:** yüzlərlə model, fərqli ekran ölçüləri, OS versiyaları, istehsalçı interfeysləri.
- **Şəbəkə:** Wi-Fi, 4G, 5G, zəif siqnal, şəbəkəsiz rejim.
- **Resurslar:** batareya, yaddaş və prosessor məhduddur.
- **Kəsintilər:** zəng, SMS, bildirişlər, siqnal (alarm).
- **Toxunma və jestlər:** siçan yerinə barmaq.
- **Mağaza qaydaları:** Google Play və App Store tələbləri.

### 17.3. Mobil test sahələri

| Sahə | Nə yoxlanılır |
| --- | --- |
| Quraşdırma və yeniləmə | Quraşdırma; yeniləmədən sonra data qalırmı; silmə və yenidən quraşdırma |
| Kəsintilər | Zəng, SMS, bildiriş, siqnal gələndə tətbiq vəziyyətini qoruyurmu? |
| Şəbəkə | Şəbəkəsiz rejim, zəif şəbəkə, Wi-Fi ↔ mobil internet keçidi, uçuş rejimi |
| Fon rejimi | Tətbiqi fona salıb 10 dəqiqə sonra qayıdanda nə olur? Sistem onu bağlayıbsa? |
| Orientasiya | Portret ↔ albom: data itmir, düzülüş pozulmur |
| İcazələr | Kamera, yer, bildiriş icazəsi rədd ediləndə tətbiq çökmür, aydın izah verir |
| Jestlər | Sürüşdürmə (swipe), böyütmə (pinch), uzun basma, geri jesti |
| Klaviatura | Telefon sahəsində rəqəm klaviaturası açılırmı, klaviatura sahəni örtmür ki? |
| Performans | Açılış vaxtı, batareya sərfi, qızma, yaddaş az olanda davranış |
| Bildirişlər | Push bildiriş gəlirmi, basanda düzgün ekran açılırmı (deep link)? |
| Görünüş və əlçatanlıq | Qaranlıq rejim, böyük şrift, ekran oxuyucu (TalkBack, VoiceOver) |

### 17.4. Emulyator, yoxsa real cihaz?

|  | Emulyator / simulyator | Real cihaz |
| --- | --- | --- |
| Qiymət | Pulsuz | Baha |
| Sürət | Çox konfiqurasiyanı tez yoxlamaq olur | Hər cihaz ayrıca yoxlanılır |
| Sensorlar, kamera, zəng | Məhdud və ya simulyasiya | Real |
| Performans və batareya | Etibarlı deyil | Real nəticə |
| Ən uyğun iş | Erkən funksional test, müxtəlif ekranlar | Son yoxlama, performans, kəsintilər |

Alətlər: Android Studio emulyatoru (Windows-da işləyir), Xcode simulyatoru (yalnız macOS-da), bulud cihaz fermaları (BrowserStack, Sauce Labs). Mobil avtomatlaşdırma üçün Appium işlədilir.

### 17.5. Android-də tester üçün faydalı ayarlar

- **Developer options:** Ayarlar → Telefon haqqında → “Build number” üzərinə 7 dəfə bas.
- **Show taps (toxunuşları göstər):** ekran videosunda barmağın harada basdığı görünür — bug report üçün əladır.
- **USB debugging:** kompüterdən cihaza qoşulmaq və loqları (adb logcat) almaq üçün.
- **iOS-da** beta versiyalar adətən TestFlight vasitəsilə paylaşılır.

### 17.6. Oyun testinin xüsusiyyətləri

Oyun da proqramdır, amma əlavə çətinlikləri var: vəziyyətlərin sayı çox böyükdür, fizika və süni intellekt (AI) var, keyfiyyətin bir hissəsi isə subyektivdir — oyun “əyləncəli” olmalıdır.

| Sahə | Nə yoxlanılır | Tipik defekt |
| --- | --- | --- |
| Funksional | Menyular, ayarlar, save/load, inventar, tapşırıqlar (quest), nailiyyətlər | Tapşırıq tamamlanır, amma mükafat verilmir |
| Gameplay və balans | Çətinlik, oyun iqtisadiyyatı, silahların balansı | Bir silah digərlərindən o qədər güclüdür ki, başqasını seçməyə ehtiyac qalmır |
| Toqquşma və fizika (collision) | Personaj obyektlərlə düzgün qarşılıqlı əlaqədədirmi? | Divardan keçmək, xəritədən düşmək, ilişib qalmaq |
| Qrafika | Teksturalar, işıq, animasiya, kamera | Tekstura yüklənmir, model divarın içindən görünür (clipping) |
| Performans | FPS (saniyədə kadr sayı), yükləmə vaxtı, yaddaş | Döyüş səhnəsində FPS kəskin düşür |
| Audio | Səs effektləri, musiqi, dialoqların sinxronluğu | Səs gecikir və ya təkrarlanır |
| Save sistemi | Yadda saxlama və bərpa | Saxlama zamanı enerji kəsiləndə save fayl korlanır |
| Lokalizasiya | Tərcümə, mətnlərin sığması, şriftlər | Azərbaycan hərfləri kvadrat kimi görünür |
| Uyğunluq | Fərqli GPU, ekran nisbətləri (16:9, 21:9), kontrollerlər | Gamepad düymələri səhv göstərilir |
| Sertifikasiya (compliance) | Platforma tələbləri (konsollar, mağazalar) | Platforma qaydasına uymayan element relizi ləngidir |

### 17.7. Oyun bug report-unun xüsusiyyətləri

- **Yer:** səviyyə, xəritə, koordinatlar və ya ən yaxın checkpoint.
- **Video dəmək olar ki, məcburidir:** oyun baqlarını sözlə izah etmək çətindir.
- **Save fayl:** problemi yaradan vəziyyətin save faylını əlavə et ki, proqramçı birbaşa həmin yerə gələ bilsin.
- **Təkrarlanma tezliyi:** oyunlarda aralıq baqlar çoxdur — “10 cəhddən 3-də” yaz.
- **Build və platforma:** PC, konsol və ya mobil; qrafika ayarları.

### Diqqət: tez-tez edilən səhvlər

- **Yalnız emulyatorda test etmək.** Kəsinti, batareya və real performans problemləri gözdən qaçır.
- **Yalnız yaxşı Wi-Fi-da test etmək.** İstifadəçilərin çoxu metroda, zəif şəbəkədədir.
- **Oyunda yalnız “düzgün oynamaq”.** Oyunçular gözlənilməz şeylər edir: divara dırmaşır, ardıcıllığı pozur, düymələri eyni anda basır.

### Həll olunmuş nümunə

**Tapşırıq.** Mobil oyunun “Save” (yadda saxlama) funksiyası üçün test ideyaları hazırla. Oyun həm cihazda, həm buludda yadda saxlayır.

**Həll — sahələr üzrə:**

1. **Əsas funksionallıq:** save → oyundan çıx → yenidən aç → load. Mövqe, inventar, səviyyə, oyun vaxtı düzgündürmü?
2. **Kəsintilər:** saxlama zamanı zəng gəlir; saxlama zamanı tətbiq fona salınır; saxlama zamanı sistem tətbiqi bağlayır.
3. **Şəbəkə:** şəbəkəsiz save edilir — internet qoşulanda buludla sinxronlaşırmı? Zəif şəbəkədə buluda saxlama yarımçıq qalarsa nə olur?
4. **Resurslar:** cihazın yaddaşı dolu olanda save cəhdi — aydın mesaj çıxırmı? Batareya 1%-də ikən save.
5. **İki cihaz:** eyni hesabla telefon və planşetdə fərqli irəliləyiş — hansı save qalib gəlir? Oyunçudan soruşulurmu?
6. **Yeniləmə:** köhnə versiyada save, tətbiqi yenilə, yeni versiyada load.
7. **Sərhədlər:** maksimum save slotu sayı; çox uzun save adı; Azərbaycan hərfləri ilə ad.
8. **Korlanmış fayl:** save faylı korlananda oyun çökür, yoxsa ehtiyat nüsxə təklif edir?

### Sənin növbən

1. Taksi tətbiqi üçün kəsinti və şəbəkə ilə bağlı 10 test ideyası yaz.
2. Sevdiyin oyunda 30 dəqiqəlik exploratory sessiya keçir: toqquşma və vizual problemlər axtar. Tapdığın bir problem üçün oyun bug report-u yaz (yer, video, tezlik).
3. Bu testlərdən hansılarını emulyatorda, hansılarını real cihazda edərdin: (a) 5 fərqli ekran ölçüsündə düzülüş; (b) zəng zamanı davranış; (c) 1 saatlıq oyunda batareya sərfi; (d) qeydiyyat formasının validasiyası.
4. Android telefonunda Developer options-u aç və “Show taps”-ı yandır. Ekran videosu çək və bunun bug report üçün niyə faydalı olduğunu izah et.

### Özünü yoxla

- Native və cross-platform tətbiqin fərqi nədir?
- Mobil testə xas 5 sahəni sadala.
- Emulyator və real cihazın üstünlükləri nədir?
- Oyun testində hansı sahələr veb testdə yoxdur?
- Oyun bug report-una nə əlavə olunmalıdır?

# VI hissə — Avtomatlaşdırma

## Fəsil 18. Tester üçün JavaScript əsasları

Avtomatlaşdırma, Postman skriptləri və Playwright testləri üçün JavaScript-in əsasları kifayətdir: dəyişənlər, şərtlər, funksiyalar, massivlər, obyektlər və async/await. Fəslin sonunda test framework-ünün hər sətirdə işlətdiyi class, modullar və mühit dəyişənləri gəlir. Bu fəsildə hər anlayışı tester gözü ilə, kiçik nümunələrlə öyrənəcəyik.

### 18.1. Kodu harada işə salmaq

Kompüterində Node.js və VS Code varsa:

1. VS Code-da yeni fayl yarat: `ders.js`
2. İçinə yaz: `console.log('Salam, tester!');`
3. Terminal → New Terminal menyusu ilə terminalı aç və yaz: `node ders.js`
4. Nəticə: `Salam, tester!`

Alternativ: brauzerdə DevTools → Console panelində kodu birbaşa yazıb Enter basmaq. `console.log()` ekrana çap edir — kodu yoxlamanın ən sadə yoludur.

### 18.2. Dəyişənlər və data tipləri

Dəyişən məlumatı saxlayan adlı “qutu”dur.

```javascript
const siteName = 'Swag Labs';   // const — dəyişməyən dəyər
let attempts = 0;               // let — dəyişə bilən dəyər
attempts = attempts + 1;        // indi attempts = 1
```

Qayda: default olaraq `const` yaz, dəyər dəyişəcəksə — `let`. Köhnə `var` açar sözündən istifadə etmə.

| Tip | Misal |
| --- | --- |
| string (mətn) | 'Bakı', "test@example.com" |
| number (ədəd) | 42, 19.99, -5 |
| boolean | true, false |
| undefined | Dəyər hələ verilməyib |
| null | Qəsdən “boş” |
| object | { name: 'Aysel', age: 25 } |
| array | \[1, 2, 3\] |

`typeof` operatoru tipi göstərir: `typeof 42` → 'number', `typeof '42'` → 'string'.

### 18.3. Operatorlar

- **Riyazi:** `+`, `-`, `*`, `/`, `%` (qısmətdən qalıq: 10 % 3 → 1).
- **Müqayisə:** `===` (bərabərdir), `!==` (bərabər deyil), `>`, `<`, `>=`, `<=`.
- **Məntiqi:** `&&` (və), `||` (və ya), `!` (deyil).

```javascript
console.log(5 == '5');   // true  — tipi çevirib müqayisə edir
console.log(5 === '5');  // false — tip də eyni olmalıdır
```

Həmişə `===` işlət. Tester üçün tip fərqi vacibdir: API-dən "5" (mətn) gəlirsə, amma 5 (ədəd) gözlənilirsə, `===` bunu tutur.

### 18.4. Mətnlərlə iş

```javascript
const email = '  Test.User@Example.com ';
console.log(email.length);                // 24 — boşluqlar da sayılır
console.log(email.trim());                // Test.User@Example.com
console.log(email.trim().toLowerCase());  // test.user@example.com
console.log(email.includes('@'));         // true

const name = 'Aysel';
console.log(`Salam, ${name}!`);           // Salam, Aysel!
```

Tərs dırnaqla (backtick) yazılan mətndə (template literal) `${…}` içinə dəyişən qoymaq olur.

Azərbaycan hərfləri üçün diqqət: `'İLKİN'.toLowerCase()` ingilis qaydası ilə işləyir və “ilkin” ilə eyni olmayan nəticə verir. Düzgün çevirmə üçün `toLocaleLowerCase('az')` işlədilir. Bu, Fəsil 14-dəki “İ” probleminin kod səviyyəsindəki səbəbidir.

### 18.5. Şərtlər — if / else

```javascript
const age = 17;

if (age >= 18) {
  console.log('Qeydiyyat mümkündür');
} else if (age >= 14) {
  console.log('Valideyn icazəsi lazımdır');
} else {
  console.log('Qeydiyyat mümkün deyil');
}
// Nəticə: Valideyn icazəsi lazımdır
```

Bu kodun 3 yolu var, deməli, branch coverage üçün 3 test lazımdır (Fəsil 7).

### 18.6. Funksiyalar

Funksiya adı olan, təkrar istifadə olunan kod blokudur: giriş alır (parametrlər) və nəticə qaytarır (return).

```javascript
function calculateDiscount(price, percent) {
  return price - (price * percent / 100);
}

console.log(calculateDiscount(100, 10)); // 90
```

Qısa yazılış — arrow function (ox funksiyası):

```javascript
const calculateDiscount = (price, percent) => price - (price * percent / 100);
```

Playwright və Postman-da ox funksiyalarını tez-tez görəcəksən.

### 18.7. Massivlər və dövrlər

```javascript
const prices = [45.5, 120, 15, 80];

console.log(prices[0]);       // 45.5 — indeks 0-dan başlayır!
console.log(prices.length);   // 4
prices.push(30);              // sona əlavə: [45.5, 120, 15, 80, 30]

for (const price of prices) {
  console.log(price);         // hər elementi növbə ilə çap edir
}

const expensive = prices.filter(p => p > 50);   // [120, 80]
const withTax = prices.map(p => p * 1.18);      // hər qiymətə 18% əlavə
const firstCheap = prices.find(p => p < 20);    // 15
```

- `filter` — şərtə uyğun elementləri seçir.
- `map` — hər elementi çevirir.
- `find` — şərtə uyğun ilk elementi qaytarır.

İlk elementin indeksi 0-dır, sonuncunun indeksi `length - 1`. Bunu qarışdırmaq proqramçıların ən çox etdiyi səhvlərdən biridir (off-by-one), sərhəd testləri də məhz bunu tutur.

### 18.8. Obyektlər və JSON

```javascript
const user = {
  name: 'Aysel',
  email: 'aysel@example.com',
  roles: ['customer'],
  address: { city: 'Bakı' }
};

console.log(user.name);          // Aysel
console.log(user.address.city);  // Bakı
user.phone = '+994501234567';    // yeni sahə əlavə etmək

const text = JSON.stringify(user);  // obyekt → JSON mətni
const back = JSON.parse(text);      // JSON mətni → obyekt
```

Postman-dakı `pm.response.json()` məhz `JSON.parse` kimi işləyir: API-nin cavab mətnini obyektə çevirir.

### 18.9. async / await — gözləməni öyrənmək

Brauzerdə və şəbəkədə hər şey vaxt aparır: səhifə açılır, sorğu cavab gözləyir. JavaScript belə əməliyyatları asinxron icra edir. Kafedə sifariş verəndə kassir sənə qəbz verir — bu, “nəticə gələcək” vədidir (Promise). Sən gözləyirsən və sifariş hazır olanda alırsan.

```javascript
async function getUser() {
  const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
  const user = await response.json();
  console.log(user.name);   // Leanne Graham
}

getUser();
```

- `async` — funksiyanın içində gözləmə olacağını bildirir.
- `await` — “nəticə gələnə qədər gözlə, sonra davam et”.

Playwright-da dəmək olar ki, hər sətirdə `await` görəcəksən. `await`-i unutmaq avtomatlaşdırmada ən çox rast gəlinən səhvlərdəndir.

### 18.10. Mini məşq: öz “test”imizi yazaq

Fəsil 8-in yaş sahəsini kodla yoxlayaq:

```javascript
function isValidAge(age) {
  return Number.isInteger(age) && age >= 18 && age <= 60;
}

function check(description, actual, expected) {
  if (actual === expected) {
    console.log('PASS:', description);
  } else {
    console.log('FAIL:', description, '| gözlənilən:', expected, '| faktiki:', actual);
  }
}

check('17 rədd olunur', isValidAge(17), false);
check('18 qəbul olunur', isValidAge(18), true);
check('60 qəbul olunur', isValidAge(60), true);
check('61 rədd olunur', isValidAge(61), false);
check('25.5 rədd olunur', isValidAge(25.5), false);
check('Mətn "30" rədd olunur', isValidAge('30'), false);
```

Nəticə:

```text
PASS: 17 rədd olunur
PASS: 18 qəbul olunur
PASS: 60 qəbul olunur
PASS: 61 rədd olunur
PASS: 25.5 rədd olunur
PASS: Mətn "30" rədd olunur
```

`check()` funksiyası avtomatik testin mahiyyətidir: faktiki nəticəni gözlənilənlə müqayisə edir və PASS və ya FAIL yazır. Playwright-ın `expect()` funksiyası da eyni işi görür, sadəcə daha güclüdür.

### 18.11. Class: eyni quruluşlu obyektlər {#c18x1}

Obyekt (18.8) bir şeyin datasını saxlayır. Çox vaxt eyni quruluşlu çoxlu obyekt lazım olur və onların öz hərəkətləri də olur. **Class** belə obyektlər düzəldən qəlibdir: çertyoj bir dənədir, ondan istənilən qədər ev tikmək olar. Page Object Model (19.7) məhz bunun üzərində qurulub, ona görə bu bölməni yaxşı başa düşmək lazımdır.

```javascript
class Cart {
  constructor(owner) {
    this.owner = owner;
    this.count = 0;
  }

  add(n) {
    this.count = this.count + n;
    return this.count;
  }
}

const cart = new Cart('Aysel');
const after = cart.add(2);
console.log(cart.owner, after); // Aysel 2
```

| Söz | Nə edir |
| --- | --- |
| class Cart | Qəlib elan edir. Bu sətir hələ heç bir obyekt yaratmır |
| new Cart('Aysel') | Qəlibdən yeni obyekt yaradır və constructor-u işə salır |
| constructor(owner) | Yeni obyektin ilkin hazırlığı. new-dakı dəyərlər buraya gəlir |
| this | “Bu obyektin özü”. this.count bu obyektin count sahəsidir |
| add(n) | Metod: obyektin hərəkəti. cart.add(2) kimi çağırılır |

Hər obyektin öz datası olur. Bir səbətə məhsul əlavə etmək o birisinə toxunmur:

```javascript
const a = new Cart('Aysel');
const b = new Cart('Leyla');
a.add(3);
console.log(a.count, b.count); // 3 0
```

**Tipik səhvlər və mesajları:**

| Səhv | Mesaj | Səbəb |
| --- | --- | --- |
| Cart('Aysel') | TypeError: Class constructor Cart cannot be invoked without 'new' | new yazılmayıb |
| this.count əvəzinə count | ReferenceError: count is not defined | Sahəyə this ilə müraciət olunur |
| cart.ad(2) | TypeError: cart.ad is not a function | Metodun adı səhvdir |

**Page Object ilə bağlantı.** 19.7-dəki LoginPage indi oxunur:

```javascript
export class LoginPage {
  constructor(page) {
    this.page = page;
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  async open() {
    await this.page.goto('https://www.saucedemo.com/');
  }
}
```

- `constructor(page)`: testdən brauzer tabı gəlir, `this.page = page` onu saxlayır ki, metodlar da işlədə bilsin.
- `this.loginButton`: lokator bir dəfə yazılır, bütün metodlar onu götürür.
- `async open()`: metodun içində gözləmə var (18.9), ona görə `async`-dir. Testdə də `await loginPage.open()` yazılır. `await` yazılmasa, test gözləmədən irəli qaçır.
- Testdə `new LoginPage(page)` hər test üçün ayrıca obyekt yaradır, testlər bir-birinə mane olmur.

### 18.12. Modullar: import və export {#c18x2}

Kod çoxalanda bir fayla sığmır. **Modul** ayrıca fayldır: `export` “bunu başqa fayllara verirəm” deyir, `import` isə “bunu oradan götürürəm”. Page class-lar `pages/`, testlər `tests/` qovluğunda durur (19.11) və bir-birini belə tapır.

```javascript
// pricing.mjs
export const CURRENCY = 'AZN';

export function tax(amount) {
  return amount * 18 / 100;
}
```

```javascript
// main.mjs
import { tax, CURRENCY } from './pricing.mjs';

console.log(tax(100), CURRENCY); // 18 AZN
```

Burada fayl uzantısı `.mjs`-dir, çünki `.mjs` faylı Node üçün həmişə modul deməkdir. `.js` faylını isə Node `package.json`-dakı ayara görə köhnə qaydada (CommonJS) oxuya bilər. `package.json` layihənin parametrlər faylıdır: `npm install` və `npm init playwright` onu yaradır.

Yolun əvvəli hara baxılacağını deyir:

| Yazılış | Hara baxır | Misal |
| --- | --- | --- |
| ./ad | Eyni qovluq | ./pricing.mjs |
| ../ad | Bir qovluq yuxarı | ../pages/LoginPage |
| ../../ad | İki qovluq yuxarı | ../../fixtures/pages |
| Nöqtəsiz | Quraşdırılmış paket (node_modules) | @playwright/test |

Yol **import yazılan fayla görə** hesablanır. `tests/ui/cart.spec.js` faylından `pages/LoginPage.js` belə görünür: bir yuxarı `tests/`, iki yuxarı layihənin kökü, sonra `pages/`:

```javascript
import { LoginPage } from '../../pages/LoginPage';
```

**Fiqurlu mötərizə nə vaxt lazımdır:**

```javascript
// Adla export: bir faylda bir neçə ola bilər, adı dəqiq yazılır
export class LoginPage { /* … */ }
import { LoginPage } from '../pages/LoginPage';

// Default export: faylda biri olur, mötərizə yazılmır
export default defineConfig({ /* … */ });
import config from './playwright.config';
```

**Başqa adla götürmək.** 19.12-dəki `import { test as base }` belə oxunur: paketin `test`-ini bu faylda `base` adlandır. Çünki eyni faylda öz `test`-imizi yaradırıq. Sətrin ardınca gələn `export { expect };` isə paketdən gələn `expect`-i bu fayldan da verir ki, testlər ikisini bir yerdən götürsün.

**Tipik səhvlər və mesajları:**

| Mesaj | Harada görünür | Səbəb | Həll |
| --- | --- | --- | --- |
| Cannot find module / Cannot find package | Node və Playwright | Yol və ya paket səhvdir | Qovluğu say; paket üçün npm install |
| does not provide an export named 'X' | Node | Faylda elə adla export yoxdur | Faylda export yaz, adın hərflərini yoxla |
| _LoginPage.X is not a constructor (class), (0 , _users.x) is not a function (funksiya), Cannot read properties of undefined (sabit) | Playwright testi | Eyni səhv: ad səhvdir və ya mötərizə unudulub | import sətrini faylın export-u ilə tutuşdur |
| Cannot use import statement outside a module | Node | package.json faylı CommonJS sayır | Faylı .mjs et və ya package.json-da "type": "module" yaz |

Playwright `import`-u özü emal edir, ona görə 19.6-dakı testlər `.js` faylında işləyir, amma səhv adın mesajı da fərqli olur: fayl yüklənir və xəta adın işlədildiyi sətirdə çıxır.

### 18.13. Mühit dəyişənləri və testin kodunu oxumaq {#c18x3}

Şifrə koda yazılmır (19.11), ünvan da mühitə görə dəyişir. **Mühit dəyişəni** (environment variable) proqrama kənardan verilən dəyərdir. Node-da onlar `process.env` obyektindədir:

```javascript
console.log(process.env.SAUCE_PASSWORD);        // verilməyibsə: undefined
const url = process.env.BASE_URL || 'https://www.saucedemo.com';
const retries = process.env.CI ? 2 : 0;
```

- `||` soldakı dəyər boşdursa, sağdakını götürür: `BASE_URL` verilməyibsə, standart ünvan işlənir.
- `şərt ? a : b` qısa `if`-dir: şərt doğrudursa `a`, deyilsə `b`. GitHub Actions `CI` dəyişənini özü verir, ona görə kompüterdə 0, CI-da 2 olur.

**Dəyəri necə vermək olar:**

```bash
# PowerShell
$env:SAUCE_PASSWORD = "secret_sauce"
npx playwright test

# Bash (Linux, Mac, Git Bash)
SAUCE_PASSWORD=secret_sauce npx playwright test
```

Hər dəfə yazmamaq üçün `.env` faylı işlədilir. Faylda `SAUCE_PASSWORD=secret_sauce` yazılır, `npm install -D dotenv` qurulur, `playwright.config.js` (19.11) faylının başına `import 'dotenv/config';` əlavə olunur. `.env` `.gitignore`-da olmalıdır (20.3). Diqqət: **dəyər həmişə mətndir**: `process.env.RETRIES` üçün `'2'` gəlir, ədəd lazımdırsa, `Number(process.env.RETRIES)` yazılır.

**Hazır dəyəri parçalamaq.** Framework kodunda iki qısa yazılış tez-tez görünür: **destructuring** obyektdən və ya massivdən dəyər götürür, **spread** (`...`) isə içindəkiləri köçürür.

```javascript
const user = { name: 'Aysel', age: 25 };
const { name } = user;                  // const name = user.name; ilə eynidir
const prices = [45, 120];
const [first] = prices;                 // const first = prices[0]; ilə eynidir
const more = [...prices, 80];           // [45, 120, 80]
const older = { ...user, age: 26 };     // { name: 'Aysel', age: 26 }
```

**Testin kodunu oxumaq.** Framework kodunda bu fəslin bütün yazılışları bir yerə yığılır:

```javascript
test(`giriş xətası: ${user}`, async ({ page }) => {
  const { token } = await login.json();
  await page.goto(`${API}/cart`);
});
```

| Yazılış | Mənası | Harada |
| --- | --- | --- |
| \`mətn ${x}\` | Mətnin içinə dəyər qoymaq (template literal) | 18.4 |
| async () => { } | İçində gözləmə olan ox funksiyası (arrow function) | 18.6, 18.9 |
| ({ page }) | Gələn obyektdən page sahəsini götürmək | Bu bölmə |
| const { token } = obyekt | const token = obyekt.token ilə eynidir | Bu bölmə |
| await | Nəticəni gözləmək | 18.9 |
| { ...devices['Desktop Chrome'] } | Obyektin bütün sahələrini köçürmək | Bu bölmə |

Yad sətir görəndə onu parçala: əvvəl hansı funksiya çağırılır, ona nə verilir, nəticə hara yazılır. Bir sətri başa düşməyənə qədər növbətisinə keçmə: framework kodu təzə söz yox, bu yazılışların birləşməsidir.

### 18.14. TypeScript: JavaScript-ə tiplər {#c18x4}

TypeScript JavaScript-in üzərinə tiplər əlavə edir: hər dəyişənin, parametrin və obyektin nə növ dəyər daşıdığını yazırsan, kompilyator (`tsc`) isə kodu işə salmadan uyğunsuzluğu tapır. Playwright layihəsini `npm init playwright@latest` ilə yaradanda “TypeScript, yoxsa JavaScript?” soruşulur və standart seçim TypeScript-dir, ona görə çox komandada testlər `.ts` fayllarındadır.

**Əsas yazılış.** Tip iki nöqtədən sonra gəlir:

```typescript
let username: string = 'standard_user';
const price: number = 29.99;
const products: string[] = ['Backpack', 'Bike Light'];

function addTax(amount: number, rate: number): number {
  return amount + amount * rate;
}
```

Hər yerə tip yazmaq lazım deyil: `let total = 0;` yazanda TypeScript `total`-un `number` olduğunu özü başa düşür (type inference). Tipi parametrlərə və obyektlərin quruluşuna yaz.

**Obyektin quruluşu.** `type` (və ya `interface`) obyektin hansı sahələri olduğunu deyir. `?` sahənin məcburi olmadığını bildirir. `|` isə “bu dəyərlərdən biri” deməkdir:

```typescript
type Product = {
  name: string;
  price: number;
  discount?: number;
};

type UserName = 'standard_user' | 'locked_out_user' | 'problem_user';
```

**Kompilyator nə tapır.** `npx tsc --noEmit` kodu yoxlayır, fayl yaratmır. Real xəta mesajları belədir:

```text
error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
error TS2322: Type 'string' is not assignable to type 'number'.
error TS2741: Property 'price' is missing in type '{ name: string; }' but required in type 'Product'.
error TS2820: Type '"standart_user"' is not assignable to type 'UserName'. Did you mean '"standard_user"'?
```

Sonuncu tester üçün xüsusilə faydalıdır: istifadəçi adındakı hərf səhvini test işə düşmədən tutur.

**Tiplər işləmə vaxtında yoxdur.** Kompilyasiyadan sonra tiplər silinir və kod adi JavaScript kimi işləyir. API-dən gələn cavab sənin yazdığın tipə uyğun gəlməsə də, TypeScript bunu görmür. Ona görə cavabın sahələrini testdə yenə də yoxlayırsan (15.6, 19.14): tip kodu yazanı qoruyur, yoxlama isə məhsulu.

### Diqqət: tez-tez edilən səhvlər

- **`==` yazmaq.** Həmişə `===`.
- **`await`-i unutmaq.** Kod gözləmədən irəli qaçır, test təsadüfi düşür.
- **Massivdə indeksin 0-dan başladığını unutmaq.**
- **Pul hesablamalarında kəsr ədədlərə güvənmək.** `0.1 + 0.2` nəticəsi 0.3 yox, 0.30000000000000004-dür. Bu, real defekt mənbəyidir.
- **`new` yazmamaq.** `TypeError: Class constructor … cannot be invoked without 'new'`.
- **Class-ın içində `this.` yazmamaq.** `ReferenceError: … is not defined`.
- **`import` yolunu səhv saymaq.** Yol import yazılan fayldan hesablanır: qovluqları say.
- **Şifrəni koda yazmaq.** Git tarixində qalır. `process.env` və `.env` işlət.

### Həll olunmuş nümunə

**Tapşırıq.** `calculateTotal(price, quantity, discountPercent)` funksiyasını yaz və yuxarıdakı `check()` ilə 3 yoxlama et. Sonra kəsr ədədlə yoxla.

**Həll.**

```javascript
function calculateTotal(price, quantity, discountPercent) {
  const subtotal = price * quantity;
  const discount = subtotal * discountPercent / 100;
  return subtotal - discount;
}

check('Endirimsiz: 10 × 3 = 30', calculateTotal(10, 3, 0), 30);
check('10% endirim: 50 × 2 = 100 → 90', calculateTotal(50, 2, 10), 90);
check('100% endirim → 0', calculateTotal(20, 1, 100), 0);
check('Kəsr: 0.1 × 3 = 0.3', calculateTotal(0.1, 3, 0), 0.3);
```

Nəticə:

```text
PASS: Endirimsiz: 10 × 3 = 30
PASS: 10% endirim: 50 × 2 = 100 → 90
PASS: 100% endirim → 0
FAIL: Kəsr: 0.1 × 3 = 0.3 | gözlənilən: 0.3 | faktiki: 0.30000000000000004
```

1. İlk üç test keçir — funksiya adi hallarda düzgündür.
2. Dördüncü test real problemi göstərir: kompüter kəsr ədədləri ikilik sistemdə saxlayır və 0.1 dəqiq saxlanılmır.
3. Pulla işləyən sistemlərdə bu, “1 qəpik fərqi” kimi defektlərə səbəb olur. Həll yolları: məbləği qəpiylə (tam ədəd kimi) saxlamaq və ya nəticəni yuvarlaqlaşdırmaq.
4. Tester üçün dərs: qiymət hesablamalarını həmişə kəsr ədədlərlə də yoxla.

### Sənin növbən

1. `isValidPassword(password)` funksiyasını yaz: uzunluq 8–20 simvol. `check()` ilə BVA dəyərlərini (7, 8, 20, 21 simvol) yoxla.
2. `[45.5, 120, 15, 80, 30, 200, 50]` massivindən 50-dən böyük məbləğləri seçən və onların cəmini hesablayan kod yaz.
3. Bir istifadəçi obyekti yarat və email sahəsində @ olub-olmadığını yoxla.
4. `calculateTotal` üçün mənfi qiymətlə (-10) test yaz. Funksiya nə qaytarır? Bu, defektdirmi? Funksiyanı necə düzəldərdin?
5. `'İLKİN'.toLowerCase()` və `'İLKİN'.toLocaleLowerCase('az')` nəticələrini 'ilkin' ilə `===` vasitəsilə müqayisə et. Nə gördün?
6. `TestRun` class-ı yaz: `constructor(name)` adı saxlayır, `passed` və `failed`-i 0 edir; `record(ok)` uyğun sayğacı artırır; `summary()` `"Smoke: 2 passed, 1 failed"` kimi mətn qaytarır. Üç nəticə yaz və çap et. İkinci `TestRun` yarat və sayğaclarının ayrı olduğunu göstər.
7. `TestRun`-u `test-run.mjs` faylına köçür və `export` et. `main.mjs`-də `import` et, adı `process.env.RUN_NAME`-dən oxu, verilməyibsə `Smoke` olsun. Dəyişənlə və dəyişənsiz işə sal.

### Özünü yoxla

- let və const fərqi nədir?
- == və === fərqi nədir?
- filter, map və find nə edir?
- await nə üçün lazımdır?
- Niyə 0.1 + 0.2 !== 0.3?
- `new` və `this` nə edir?
- `../../pages/LoginPage` yolu necə oxunur?
- Şifrə niyə `process.env`-dən oxunur və `.env` niyə repo-ya düşmür?
## Fəsil 19. Avtomatlaşdırma: test piramidası, Playwright framework-ü, Cypress və Selenium

Avtomatlaşdırma təkrarlanan yoxlamaları koda tapşırmaqdır: regression testləri hər dəyişiklikdən sonra dəqiqələr ərzində, insansız işləyir. Bu fəsildə nəyi avtomatlaşdırmaq lazım olduğunu, test piramidasını və Playwright ilə ilk real testi öyrənəcəksən, sonra onun üstündə tam framework quracaqsan: Page Object, fixture, data-driven test, API testi, login vəziyyəti, trace və hesabat. Sonra eyni fikirləri Cypress və Selenium-da görəcəksən. Fəsil real səhifələrin çətin hissələri ilə bitir: fayl yükləmə, təsdiq pəncərəsi, iframe, yeni tab və saxta şəbəkə cavabları.

### 19.1. Nəyi avtomatlaşdırmalı, nəyi yox

**Avtomatlaşdır:**

- Regression və smoke testləri — hər relizdə təkrarlanır.
- Çox data ilə eyni ssenari: 100 fərqli məhsul, 50 istifadəçi.
- Çox brauzer və konfiqurasiyada eyni test.
- API testləri — sürətli və sabitdir.

**Manual saxla:**

- Exploratory və usability testləri.
- Bir dəfə icra olunacaq yoxlamalar.
- Dizaynı tez-tez dəyişən, hələ sabitləşməmiş funksiyalar.
- “Göz” tələb edən vizual qiymətləndirmə.

Kobud qayda: test dəfələrlə təkrarlanacaqsa və funksiya sabitdirsə, avtomatlaşdırmağa namizəddir.

**Alətin və avtomatlaşdırmanın faydaları:**

- Təkrarlanan işdə vaxt qənaəti: regression, eyni datanın yazılması, nəticələrin müqayisəsi.
- Sadə insan səhvlərinin azalması: hər dəfə eyni addımlar, eyni sıra.
- Obyektiv ölçülər (məsələn, əhatə) və insanın çətin hesablayacağı rəqəmlər.
- Test statistikasına asan giriş: gedişat, defekt sayı, icra vaxtı.
- Qısa icra, tez rəy, tez reliz.
- Tester-in yeni və daha dərin testlər üçün vaxtının qalması.

**Riskləri:**

- Alətdən real olmayan gözlənti.
- Alətin tətbiqi, skriptlərin baxımı və prosesin dəyişməsi üçün vaxtın və xərcin az hesablanması.
- Manual testin daha uyğun olduğu yerdə alət işlətmək.
- Alətə həddən artıq güvənmək, insanın tənqidi düşüncəsini unutmaq.
- Satıcıdan asılılıq: şirkət bağlana, aləti dayandıra, başqasına sata və ya zəif dəstək verə bilər.
- Açıq mənbəli alətin tərk edilməsi və ya komponentlərinin tez-tez yenilənmə tələb etməsi.
- Alətin inkişaf platforması ilə uyğun gəlməməsi.
- Qanuni tələblərə və ya təhlükəsizlik standartlarına uyğun olmayan alət seçmək.

### 19.2. Test piramidası

&#91;embedded content: test piramidası · 3 səviyyə\]

Aşağı səviyyədə testlər çox, sürətli və ucuzdur; yuxarıya qalxdıqca testlər azalır, yavaşlayır və bahalaşır.

- **Aşağıda — çoxlu unit test:** sürətli (millisaniyələr), ucuz, adətən proqramçılar yazır.
- **Ortada — inteqrasiya və API testləri:** orta sürət, servislərin əlaqəsini yoxlayır.
- **Yuxarıda — az sayıda UI / E2E test:** yavaş, baha və kövrək, amma real istifadəçi ssenarisini yoxlayır.

Pis nümunə “dondurma qabı” (ice cream cone) adlanır: testlərin çoxu UI səviyyəsindədir, unit test azdır. Nəticə yavaş və tez-tez sınan testlər olur.

### 19.3. Alətlər

| Alət | Dillər | Brauzerlər | Xüsusiyyəti |
| --- | --- | --- | --- |
| Playwright | JavaScript/TypeScript, Python, Java, C# | Chromium, Firefox, WebKit | Avtomatik gözləmə, sürət, güclü alətlər (codegen, trace viewer) |
| Cypress | JavaScript/TypeScript | Chrome ailəsi, Firefox; WebKit dəstəyi məhduddur | Brauzerin içində işləyir, rahat debug |
| Selenium | Java, Python, C#, JavaScript və başqaları | Bütün əsas brauzerlər | Ən köhnə və geniş ekosistem, W3C WebDriver standartı |

Bu kitabda Playwright seçirik: müasirdir, JavaScript ilə işləyir və öyrənməsi asandır. Prinsiplər bütün alətlərdə eynidir.

### 19.4. Playwright quraşdırma (Windows, VS Code)

Node.js quraşdırılmış olmalıdır.

1. Layihə üçün qovluq yarat və onu VS Code-da aç: File → Open Folder.
2. Terminalda yaz:

```bash
npm init playwright@latest
```

3. Suallara cavab ver: dil — JavaScript; testlər qovluğu — tests; GitHub Actions workflow — hələlik yox (Fəsil 20-də qayıdacağıq); brauzerlər yüklənsin — bəli.
4. Quraşdırma bitəndə nümunə testləri işə sal:

```bash
npx playwright test
npx playwright show-report
```

Birinci əmr testləri işə salır, ikincisi HTML hesabatı açır.

| Əmr | Nə edir |
| --- | --- |
| npx playwright test | Bütün testləri işə salır; default olaraq brauzer görünmür (headless) |
| npx playwright test --headed | Brauzeri görərək işə salır |
| npx playwright test --ui | Testləri addım-addım izləmək üçün UI rejimi |
| npx playwright test login.spec.js | Yalnız bir faylı işə salır |
| npx playwright codegen https://www.saucedemo.com/ | Sənin hərəkətlərini yazıb kod yaradır |
| npx playwright show-report | Son icranın hesabatını açır |

VS Code üçün “Playwright Test for VSCode” əlavəsini də quraşdır: testləri bir kliklə işə salmaq olur.

### 19.5. Lokatorlar — elementi necə tapmaq

Lokator (locator) Playwright-a səhifədə hansı elementlə işləyəcəyini deyir. Tövsiyə olunan sıra:

| Lokator | Nə vaxt | Misal |
| --- | --- | --- |
| getByRole | Düymə, link, sahə — əlçatanlıq rolu ilə | page.getByRole('button', { name: 'Login' }) |
| getByLabel | Label-i olan form sahələri | page.getByLabel('Email') |
| getByPlaceholder | Placeholder mətni ilə | page.getByPlaceholder('Username') |
| getByText | Görünən mətn ilə | page.getByText('Products') |
| getByTestId | Proqramçının qoyduğu test atributu ilə | page.getByTestId('login-button') |
| locator (CSS) | Başqa yol olmayanda | page.locator('#login-button') |

İstifadəçinin gördüyünə əsaslanan lokatorlar (role, label, text) daha sabitdir: dizayn dəyişəndə də işləyir.

### 19.6. İlk test: Swag Labs-a giriş

Məşq üçün saucedemo.com (Swag Labs) — Sauce Labs şirkətinin avtomatlaşdırma öyrənmək üçün açdığı demo mağaza. Login səhifəsində test istifadəçiləri göstərilib: məsələn, standard\_user və bloklanmış locked\_out\_user; şifrə — secret\_sauce.

tests qovluğunda `login.spec.js` faylı yarat:

```javascript
import { test, expect } from '@playwright/test';

test('düzgün istifadəçi ilə uğurlu giriş', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/inventory/);
  await expect(page.getByText('Products')).toBeVisible();
});

test('bloklanmış istifadəçi xəta mesajı görür', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder('Username').fill('locked_out_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.locator('[data-test="error"]')).toContainText('locked out');
});
```

İşə sal: `npx playwright test login.spec.js --headed`

**Sətir-sətir izah:**

- `import { test, expect }` — Playwright-ın test və yoxlama funksiyalarını qoşur.
- `test('ad', async ({ page }) => { … })` — bir test; `page` Playwright-ın verdiyi brauzer tabıdır.
- `page.goto(url)` — səhifəni açır.
- `getByPlaceholder('Username').fill(…)` — placeholder-i “Username” olan sahəni tapır və mətni yazır.
- `getByRole('button', { name: 'Login' }).click()` — “Login” adlı düyməni tapır və basır.
- `expect(page).toHaveURL(/inventory/)` — URL-də “inventory” sözü olmalıdır.
- `toBeVisible()` — element ekranda görünməlidir.
- `toContainText('locked out')` — elementin mətnində bu ifadə olmalıdır.
- Hər hərəkətin qarşısında `await` var — Playwright hər addımı gözləyir.

**Avtomatik gözləmə (auto-waiting).** Playwright elementin görünməsini və basıla bilən olmasını özü gözləyir. Ona görə “3 saniyə gözlə” kimi sabit gözləmələrə ehtiyac yoxdur.

### 19.7. Page Object Model (POM)

Testlər çoxaldıqca eyni lokatorlar hər yerdə təkrarlanır. Login düyməsinin lokatoru dəyişsə, 50 testi düzəltmək lazım gələcək. POM bunu həll edir: hər səhifə üçün bir class yaradılır, lokatorlar və hərəkətlər orada bir dəfə yazılır. Class, `new` və `this` 18.11-də, `import` və `export` 18.12-dədir.

`pages/LoginPage.js`:

```javascript
export class LoginPage {
  constructor(page) {
    this.page = page;
    this.username = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.error = page.locator('[data-test="error"]');
  }

  async open() {
    await this.page.goto('https://www.saucedemo.com/');
  }

  async login(user, pass) {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.loginButton.click();
  }
}
```

Test indi belə görünür:

```javascript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('bloklanmış istifadəçi xəta görür', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login('locked_out_user', 'secret_sauce');
  await expect(loginPage.error).toContainText('locked out');
});
```

### 19.8. Yaxşı avtomatik testin qaydaları

- **Hər test müstəqildir:** başqa testin nəticəsindən asılı deyil, istənilən sırada işləyir.
- **Sabit gözləmə yoxdur:** `page.waitForTimeout(3000)` əvəzinə `expect` ilə şərti gözlə.
- **Sabit lokatorlar:** role, label, test ID; uzun CSS zəncirləri yox.
- **Aydın ad:** testin adı nəyi yoxladığını deyir.
- **Bir test — bir ssenari.**
- **Test datası kodun içində səpələnmir:** ayrıca faylda və ya dəyişənlərdə saxlanılır.

### 19.9. Flaky (qeyri-sabit) testlər

Flaky test — kod dəyişmədən bəzən keçən, bəzən düşən testdir. Səbəbləri: vaxtla bağlı problemlər (element hələ yüklənməyib), testlərin bir-birindən asılılığı, paylaşılan test datası, qeyri-sabit mühit.

Həll: səbəbi tap, testi təkrar cəhdlə (retry) gizlətmə. Playwright-ın trace viewer aləti uğursuz testin hər addımını göstərir: ekran şəkilləri, şəbəkə, konsol.

### 19.10. Cypress və Selenium ilə müqayisə

Eyni login testi Cypress-də:

```javascript
describe('Login', () => {
  it('düzgün istifadəçi ilə uğurlu giriş', () => {
    cy.visit('https://www.saucedemo.com/');
    cy.get('[data-test="username"]').type('standard_user');
    cy.get('[data-test="password"]').type('secret_sauce');
    cy.get('[data-test="login-button"]').click();
    cy.url().should('include', '/inventory');
  });
});
```

Cypress-də `await` yoxdur: o, əmrləri öz növbəsinə qoyur və ardıcıl icra edir. Selenium isə WebDriver protokolu ilə brauzeri idarə edir; çox dili dəstəklədiyi üçün böyük şirkətlərdə hələ də geniş yayılıb. Bir aləti yaxşı öyrənsən, digərinə keçmək asan olacaq: lokator, hərəkət və yoxlama məntiqi eynidir.

### 19.11. Test framework-ünün quruluşu {#c19x1}

Üç test bir faylda rahatdır. 300 test isə qaydasız oxunmaz olur: hər testdə eyni giriş kodu, hər yerdə açıq URL, kodun içində şifrə. **Test framework-ü** (test framework) testlərin hansı qovluqda durduğunu, ümumi kodun harada yazıldığını və ayarların haradan gəldiyini müəyyən edən quruluşdur. Playwright Test hazır alətdir (test runner); framework isə onun üstündə komandanın qurduğu nizamdır.

```text
qa-playwright/
├── tests/
│   ├── ui/
│   │   ├── login.spec.js
│   │   └── cart.spec.js
│   ├── api/
│   │   └── products.spec.js
│   └── auth.setup.js
├── pages/
│   ├── LoginPage.js
│   └── InventoryPage.js
├── fixtures/
│   └── pages.js
├── data/
│   └── login-errors.json
├── playwright.config.js
├── package.json
├── .env
└── .gitignore
```

| Yer | Nə saxlayır |
| --- | --- |
| tests/ | Yalnız testlər: nə edilir və nə gözlənilir |
| pages/ | Page Object class-ları: lokatorlar və hərəkətlər |
| fixtures/ | Testlərə hazır obyekt verən kod (19.12) |
| data/ | Test datası (19.13) |
| playwright.config.js | Bütün ayarlar: ünvan, brauzerlər, təkrar cəhd, hesabat |
| .env | Şifrələr və mühit ünvanları; Git-ə düşmür |

Bütün ayarlar bir yerdədir:

```javascript
import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
```

`baseURL` yazılanda testlərdə qısa yol işlənir: `await page.goto('/')`. Mühit dəyişəndə (test → staging) testlərin heç biri dəyişmir, yalnız `BASE_URL` dəyişir. Şifrə `.env` faylındadır (`SAUCE_PASSWORD=...`), kodda isə `process.env.SAUCE_PASSWORD` kimi oxunur (18.13). Bunun üçün paket lazımdır: `npm install -D dotenv`. `.env` mütləq `.gitignore`-a yazılır.

### 19.12. Fixture-lər {#c19x2}

Testin başlığındakı `{ page }` artıq **fixture**-dir: Playwright testdən əvvəl brauzer tabını hazırlayır, testə verir, test bitəndə bağlayır. Fixture testə hazır obyekt verən hazırlıq koddur. Eyni üsulla öz fixture-ini yaza bilərsən.

```javascript
// fixtures/pages.js
import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

export const test = base.extend({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await use(loginPage);
  },

  inventoryPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login('standard_user', process.env.SAUCE_PASSWORD);
    await use(new InventoryPage(page));
  },
});

export { expect };
```

Test indi yalnız öz işini yazır:

```javascript
import { test, expect } from '../../fixtures/pages';

test('məhsul səbətə əlavə olunur', async ({ inventoryPage }) => {
  await inventoryPage.addToCart('Sauce Labs Backpack');
  await expect(inventoryPage.cartBadge).toHaveText('1');
});
```

- `import { test as base }` — paketin `test`-i bu faylda `base` adlanır, `export { expect }` isə `expect`-i bu fayldan da verir (18.12).
- `base.extend({ … })` — öz fixture-lərimizlə yeni `test` yaradır.
- `async ({ page }, use) => { … }` — fixture başqa fixture-dən (`page`) istifadə edə bilər.
- `await use(x)` — `x`-i testə verir və test bitənə qədər burada gözləyir. `use`-dan əvvəlki kod hazırlıq, sonrakı kod təmizlikdir (teardown).
- Fixture yalnız onu istəyən testdə işləyir: testin başlığında adı yoxdursa, hazırlıq vaxt aparmır.

| | test.beforeEach | Fixture |
| --- | --- | --- |
| Harada | Bir faylın içində | İstənilən faylda, bir yerdə yazılır |
| Nə vaxt işləyir | Fayldakı hər testdən əvvəl | Yalnız onu istəyən testdə |
| Təmizlik | Ayrıca test.afterEach | Eyni yerdə, use-dan sonra |
| Nə vaxt seç | Kiçik, bir fayllıq hazırlıq | Bir neçə faylda təkrarlanan hazırlıq |

### 19.13. Data-driven testlər {#c19x3}

Testin addımları eyni, yalnız dəyərlər fərqlidirsə, onu dəfələrlə köçürmə. **Data-driven test** eyni addımları bir data siyahısı ilə işlədir. EP və BVA ilə seçdiyin dəyərlər (Fəsil 8) burada birbaşa cədvələ çevrilir.

```javascript
import { test, expect } from '@playwright/test';

const cases = [
  { user: 'locked_out_user', pass: 'secret_sauce', error: 'locked out' },
  { user: 'standard_user', pass: 'yanlis_sifre', error: 'do not match' },
  { user: '', pass: 'secret_sauce', error: 'Username is required' },
  { user: 'standard_user', pass: '', error: 'Password is required' },
];

for (const { user, pass, error } of cases) {
  test(`giriş xətası: "${user}" / "${pass}"`, async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');
    await page.getByPlaceholder('Username').fill(user);
    await page.getByPlaceholder('Password').fill(pass);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.locator('[data-test="error"]')).toContainText(error);
  });
}
```

Dörd ayrı test yaranır: biri düşəndə o birilər işləməyə davam edir, hesabatda hansı dəyərin düşdüyü adından görünür. **Testin adı unikal olmalıdır:** adda dəyər olmasa, Playwright “duplicate test title” xətası verir.

Data çoxalanda onu ayrıca fayla çıxar, testçi kod yazmadan yeni sətir əlavə edə bilər:

```javascript
import cases from '../../data/login-errors.json' with { type: 'json' };
```

**Nə vaxt işlətmə:** sətirlərdə addımlar fərqlidirsə. Dövrün içində `if` yaranırsa, bu, ayrı test olmalıdır, çünki test oxunmur və səhv hesabatı başa düşülmür.

### 19.14. Playwright ilə API testləri {#c19x4}

Postman (Fəsil 15) API-ni öyrənmək və əl ilə yoxlamaq üçün rahatdır. Eyni yoxlamalar UI testləri ilə bir layihədə, bir hesabatda olsun deyə Playwright-ın `request` fixture-i işlənir. Brauzer açılmır, ona görə testlər saniyənin bir hissəsinə gedir.

```javascript
import { test, expect } from '@playwright/test';

const API = 'https://jsonplaceholder.typicode.com';

test('GET /users/1 düzgün istifadəçini qaytarır', async ({ request }) => {
  const response = await request.get(`${API}/users/1`);

  expect(response.status()).toBe(200);
  const user = await response.json();
  expect(user.name).toBe('Leanne Graham');
});

test('POST /posts yeni yazı yaradır', async ({ request }) => {
  const response = await request.post(`${API}/posts`, {
    data: { title: 'Test post', body: 'Mətn', userId: 1 },
  });

  expect(response.status()).toBe(201);
  const post = await response.json();
  expect(post.title).toBe('Test post');
});

test('olmayan yazı 404 qaytarır', async ({ request }) => {
  const response = await request.get(`${API}/posts/9999`);
  expect(response.status()).toBe(404);
});
```

| Postman | Playwright | Nə edir |
| --- | --- | --- |
| Sorğu pəncərəsi | request.get(url) | Sorğu göndərir |
| Body → raw JSON | { data: { … } } | Gövdə göndərir |
| Headers | { headers: { … } } | Başlıq göndərir |
| pm.response.code | response.status() | Status kodu |
| pm.response.json() | await response.json() | Gövdəni oxuyur; await lazımdır |

**API ilə hazırlıq, UI ilə yoxlama.** Ən faydalı üsul budur: test datasını API ilə yaradırsan (sürətli, sabit), yalnız yoxlanan hissəni UI ilə edirsən. Məsələn, sifariş tarixçəsi ekranını yoxlamaq üçün 8 ekranlıq checkout-dan keçmək lazım deyil: `request.post('/api/orders', …)` ilə sifariş yarat, sonra `page.goto('/orders')`. Piramidanın (19.2) kodda görünüşü belədir.

**Token ilə sorğu:**

```javascript
const login = await request.post(`${API}/login`, {
  data: { username: 'standard_user', password: process.env.SAUCE_PASSWORD },
});
const { token } = await login.json();

const cart = await request.get(`${API}/cart`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

### 19.15. Login vəziyyətini saxlamaq {#c19x5}

100 testin hər biri giriş formasını doldursa, 100 dəfə eyni ekran yoxlanır və vaxt itir. Playwright bir dəfə daxil olub **vəziyyəti** (cookie və localStorage) fayla yaza, sonrakı testlərdə bu fayldan başlaya bilər. Buna `storageState` deyilir.

```javascript
// tests/auth.setup.js
import { test as setup, expect } from '@playwright/test';

setup('giriş vəziyyətini saxla', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill(process.env.SAUCE_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory/);

  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
```

Konfiqurasiyada ayrıca `setup` layihəsi yazılır, testlər ondan asılı olur:

```javascript
projects: [
  { name: 'setup', testMatch: /.*\.setup\.js/ },
  {
    name: 'chromium',
    testIgnore: /.*\.setup\.js/,
    use: {
      ...devices['Desktop Chrome'],
      storageState: 'playwright/.auth/user.json',
    },
    dependencies: ['setup'],
  },
],
```

İndi testlər daxil olmuş halda başlayır:

```javascript
test('məhsullar səhifəsi açılır', async ({ page }) => {
  await page.goto('/inventory.html');
  await expect(page.getByText('Products')).toBeVisible();
});
```

- **Giriş testi ayrıca qalır.** Login forması özü də funksiyadır, onun testləri vəziyyətsiz başlamalıdır: `test.use({ storageState: { cookies: [], origins: [] } });`.
- **Fayl gizlidir.** İçində işləyən sessiya var: `playwright/.auth` `.gitignore`-a yazılır.
- **Hər rol üçün ayrıca fayl:** `admin.json`, `user.json`.
- **Vəziyyət paylaşılır.** Paralel testlər eyni hesabda səbəti dəyişirsə, bir-birinə mane olur (19.9). Hesabı dəyişən testlər ayrıca hesab işlətsin.

### 19.16. Trace, hesabat və teqlər {#c19x6}

Framework-ün dəyəri test düşəndə görünür: harada, niyə, nə baş verdi?

**Trace viewer.** Testin hər addımını, ekranını, şəbəkə sorğularını və konsolunu yazır. Konfiqurasiyada `trace: 'on-first-retry'` yazılanda trace yalnız düşən testin təkrarında yaranır, ona görə CI-ı ləngitmir.

```bash
npx playwright test --trace on
npx playwright show-trace test-results/login-chromium/trace.zip
npx playwright show-report
```

Trace-də addıma basanda həmin anın ekranı açılır: “Before” və “After”, sorğular, konsol xətaları. Flaky testin (19.9) səbəbi çox vaxt burada görünür.

**Hesabatlar.** Bir neçə hesabat birlikdə işləyə bilər:

```javascript
reporter: [
  ['list'],
  ['html', { open: 'never' }],
  ['junit', { outputFile: 'results/junit.xml' }],
],
```

`list` terminal üçündür, `html` insan üçündür, `junit` isə CI və test idarəetmə alətləri üçün.

**Teqlər.** Dəstin bir hissəsini işlətmək üçün:

```javascript
test('uğurlu giriş', { tag: '@smoke' }, async ({ page }) => {
  // …
});
```

```bash
npx playwright test --grep @smoke
npx playwright test --grep-invert @slow
npx playwright test --last-failed
```

Bu teq CI planını qurur: PR-da `@smoke`, gecə isə tam dəst (20.10).

**Addımlar.** `test.step` uzun testi hesabatda oxunan hissələrə bölür:

```javascript
await test.step('Məhsulu səbətə at', async () => {
  await inventoryPage.addToCart('Sauce Labs Backpack');
  await expect(inventoryPage.cartBadge).toHaveText('1');
});
```

### 19.17. Eyni framework Cypress və Selenium-da {#c19x7}

19.10 üç aləti bir testlə müqayisə etdi. Framework səviyyəsində fərqlər daha aydındır, çünki hər alət hazırlığı və datanı öz yolu ilə həll edir. Eyni ssenari: daxil ol, məhsulu səbətə at, nişanı yoxla.

**Cypress.** Ortaq kod “əmr” (custom command) olur, vəziyyəti `cy.session` saxlayır.

```javascript
// cypress/support/commands.js
Cypress.Commands.add('login', (user, pass) => {
  cy.session(user, () => {
    cy.visit('https://www.saucedemo.com/');
    cy.get('[data-test="username"]').type(user);
    cy.get('[data-test="password"]').type(pass);
    cy.get('[data-test="login-button"]').click();
    cy.url().should('include', '/inventory');
  });
});

// cypress/e2e/cart.cy.js
describe('Səbət', () => {
  it('məhsul səbətə əlavə olunur', () => {
    cy.login('standard_user', Cypress.env('SAUCE_PASSWORD'));
    cy.visit('https://www.saucedemo.com/inventory.html');
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    cy.get('.shopping_cart_badge').should('have.text', '1');
  });
});
```

**Selenium.** Selenium yalnız brauzeri idarə edir, test runner deyil: testi işə salan, yoxlayan və hesabat verən hissəni ayrıca seçirsən (burada Node-un `node:test` və `node:assert`-i; Java-da JUnit və ya TestNG, Python-da pytest). Gözləmələri özün yazırsan.

```javascript
import { test, before, after } from 'node:test';
import assert from 'node:assert';
import { Builder, By, until } from 'selenium-webdriver';

class LoginPage {
  constructor(driver) {
    this.driver = driver;
  }

  async open() {
    await this.driver.get('https://www.saucedemo.com/');
  }

  async login(user, pass) {
    await this.driver.findElement(By.css('[data-test="username"]')).sendKeys(user);
    await this.driver.findElement(By.css('[data-test="password"]')).sendKeys(pass);
    await this.driver.findElement(By.css('[data-test="login-button"]')).click();
  }
}

let driver;
before(async () => {
  driver = await new Builder().forBrowser('chrome').build();
});
after(async () => {
  await driver.quit();
});

test('məhsul səbətə əlavə olunur', async () => {
  const loginPage = new LoginPage(driver);
  await loginPage.open();
  await loginPage.login('standard_user', process.env.SAUCE_PASSWORD);

  const add = await driver.wait(
    until.elementLocated(By.css('[data-test="add-to-cart-sauce-labs-backpack"]')),
    5000
  );
  await add.click();

  const badge = await driver.wait(until.elementLocated(By.css('.shopping_cart_badge')), 5000);
  assert.strictEqual(await badge.getText(), '1');
});
```

| Mövzu | Playwright | Cypress | Selenium |
| --- | --- | --- | --- |
| Dil | JS/TS, Python, Java, C# | JS/TS | Java, Python, C#, JS, Ruby və s. |
| Test runner | Daxildir | Daxildir | Ayrıca seçilir (JUnit, pytest, node:test) |
| Gözləmə | Avtomatik | Avtomatik (retry-ability) | Əsasən açıq (explicit wait) |
| Ortaq hazırlıq | Fixture | beforeEach, custom command | Runner-in imkanları |
| API testi | request | cy.request | Ayrıca kitabxana (REST Assured, axios) |
| Login vəziyyəti | storageState | cy.session | Cookie-ni özün yazırsan |
| Paralel icra | Daxildir (workers, shard) | Cloud və ya əlavə alətlər | Selenium Grid |
| Brauzerlər | Chromium, Firefox, WebKit | Chromium ailəsi, Firefox, WebKit (eksperimental) | Bütün əsas brauzerlər, real Safari da |
| Köməkçi alət | Trace viewer, codegen, UI mode | Time travel, Cypress App | Grid, IDE, ekosistem |

**Necə seçməli:** yeni JavaScript layihəsi üçün Playwright, komanda brauzerdə debug rahatlığını üstün tutursa Cypress, Java və ya C# komandası, köhnə infrastruktur və ya geniş brauzer şəbəkəsi varsa Selenium (bəzən Playwright-ın həmin dil versiyası). Əsas fikirlər (Page Object, müstəqil test, test datasının ayrılması, CI) üçündə eynidir: bir aləti dərindən bilən adam o birisini həftələrlə öyrənir, aylarla yox.

### 19.18. Real səhifə hərəkətləri {#c19x8}

Giriş və səbətdən sonra iş başqa elementlərə gəlib çıxır: işarə qutusu (checkbox), fayl yükləmə, təsdiq pəncərəsi, iframe, yeni tab. Aşağıdakı kod **məşq səhifəsində** işləyir: `https://ministore.test/settings.html` yalnız bu kitabın Playwright məşqindədir (PW-14, PW-15, PW-16), internetdə açılmır. Real layihədə eyni kodu öz lokatorlarınla yazırsan.

**İşarə qutusu, siyahı, üzərinə gəlmək, klaviatura.** Tooltip üzərinə gələndə çıxan kiçik izahdır:

```javascript
const news = page.getByLabel('Xəbərlər gəlsin');
await news.check();
await expect(news).toBeChecked();

await page.getByLabel('Ölkə').selectOption('ge');
await expect(page.getByLabel('Ölkə')).toHaveValue('ge');

await page.getByRole('button', { name: 'Kömək' }).hover();
await expect(page.getByRole('tooltip')).toBeVisible();

await page.getByPlaceholder('Məhsul axtar').fill('bolt');
await page.getByPlaceholder('Məhsul axtar').press('Enter');
await expect(page.getByTestId('search-result')).toHaveText('«bolt» üçün 1 nəticə');

await page.getByRole('button', { name: 'Şərtlər' }).click();
await page.keyboard.press('Escape');
await expect(page.getByRole('dialog')).toBeHidden();
```

- `check()` və `uncheck()` qutunu lazımi vəziyyətə gətirir və nəticəni yoxlayır. `click()` isə sadəcə vəziyyəti tərsinə çevirir, ona görə əvvəlki vəziyyətdən asılıdır.
- `selectOption('ge')` dəyərə və ya görünən mətnə görə seçir, `selectOption({ label: 'Gürcüstan' })` yalnız görünən mətnə görə.
- Lokatorun `press` metodu əvvəl həmin elementə fokuslanır, `page.keyboard.press` isə düyməni fokus hazırda haradadırsa, ora göndərir.

**Fayl yükləmək.** Fayl pəncərəsi açılmır, fayl birbaşa sahəyə verilir:

```javascript
await page.getByLabel('CV faylı').setInputFiles('cv.pdf');
await expect(page.getByTestId('file-status')).toHaveText('Seçildi: cv.pdf');
await page.getByLabel('CV faylı').setInputFiles([]);
```

Nisbi yol testi işə saldığın qovluğa görə hesablanır, boş massiv seçimi təmizləyir. Test ideyaları: icazəsiz format, limitdən böyük fayl, 0 baytlıq fayl (14.1).

**Təsdiq pəncərəsi (dialog).** «Şərtlər» səhifənin öz elementi idi (`role=dialog`). Brauzerin `confirm` pəncərəsi isə səhifənin elementi deyil, lokatorla tapılmır. `page.on('dialog', funksiya)` deməkdir: pəncərə açılan an bu funksiyanı işlət. Belə funksiyaya dinləyici (listener) deyilir və o, **klikdən əvvəl** yazılır:

```javascript
page.on('dialog', dialog => dialog.accept());
await page.getByRole('button', { name: 'Hesabı sil' }).click();
await expect(page.getByTestId('account-status')).toHaveText('Hesab silindi');
```

Dinləyici olmasa, Playwright pəncərəni özü ləğv edir və test “Ləğv edildi” halını görür. Dinləyici yazıb `accept()` və ya `dismiss()` çağırmasan, klik qalıb timeout olur. Mətni də yoxlamaq olar: `expect(dialog.message()).toContain('silmək')`.

**iframe.** iframe səhifənin içində açılan başqa səhifədir: ödəniş forması çox vaxt başqa saytdan belə gəlir. Adi lokator onun içinə baxmır:

```javascript
const pay = page.frameLocator('#pay');
await pay.getByRole('button', { name: 'Ödə' }).click();
await expect(pay.getByTestId('pay-status')).toHaveText('Ödəniş qəbul olundu');
```

`page.getByRole('button', { name: 'Ödə' })` burada heç nə tapmır, timeout olur. Element gözlə görünür, amma lokator tapmırsa, əvvəlcə iframe olub-olmadığını yoxla.

**Yeni tab.** Gözləmə klikdən **əvvəl** başladılır, `await` isə klikdən sonra yazılır:

```javascript
const popupPromise = page.waitForEvent('popup');
await page.getByRole('link', { name: 'Çatdırılma qaydaları' }).click();
const popup = await popupPromise;
await expect(popup).toHaveURL(/rules/);
await expect(popup.getByRole('heading')).toHaveText('Çatdırılma qaydaları');
```

`popup` da `page` kimidir: lokatorlar və yoxlamalar onda işləyir. Əvvəl `await page.waitForEvent('popup')` yazsan, test klikə çatmır və timeout olur.

### 19.19. Şəbəkə, yumşaq yoxlama və vizual müqayisə {#c19x9}

Bu bölmənin kodunu da məşq səhifəsində sınaya bilərsən (PW-17, PW-18, PW-19). Yalnız vizual müqayisə orada işləmir.

**Cavabı gözləmək.** Elementə baxmaq kifayət deyilsə, sorğunun özünü yoxlamaq olar. Yeni tabdakı kimi: əvvəl gözləmə, sonra klik.

```javascript
const responsePromise = page.waitForResponse('**/api/orders');
await page.getByRole('button', { name: 'Sifarişləri yüklə' }).click();
const response = await responsePromise;
expect(response.status()).toBe(200);
await expect(page.getByText('Sifariş 1001')).toBeVisible();
```

**Cavabı saxtalaşdırmaq (mock).** Server 500 qaytaranda ekran nə göstərir? Real serveri sındırmaq olmur, amma cavabı test özü verə bilər:

```javascript
await page.route('**/api/orders', route => route.fulfill({
  status: 500,
  json: { error: 'server down' },
}));
await page.getByRole('button', { name: 'Sifarişləri yüklə' }).click();
await expect(page.getByRole('alert')).toContainText('yüklənmədi');
```

| Nə lazımdır | Yazılış | Nəyi yoxlayır |
| --- | --- | --- |
| Server xətası | route.fulfill({ status: 500, json: { … } }) | Xəta mesajı görünürmü, səhifə dağılırmı |
| Boş siyahı | route.fulfill({ json: [] }) | “Sifariş yoxdur” vəziyyəti |
| İnternet kəsilməsi | route.abort() | Bağlantı xətası mesajı |
| Dəyişmədən keçir | route.continue() | Yalnız bəzi sorğuları tutmaq üçün |

Bu, UI testinin ən güclü alətlərindən biridir: nadir halları sabit və tez yoxlayır. **Məhdudiyyəti:** saxta cavabla test real API-nin düzgün işlədiyini sübut etmir. Ona görə API-nin özünü ayrıca yoxla (19.14).

**Yumşaq yoxlama (soft assertion).** Adi `expect` düşəndə test dayanır. `expect.soft` qeyd edir və davam edir, test sonda uğursuz sayılır. Bir ekranda bir neçə müstəqil şeyi yoxlayanda faydalıdır, çünki bütün fərqləri bir dəfəyə görürsən:

```javascript
await expect.soft(page.getByTestId('title')).toHaveText('Ayarlar');
await expect.soft(page.getByTestId('account-status')).toHaveText('Hesab aktivdir');
await expect.soft(page.getByTestId('file-status')).toHaveText('Fayl seçilməyib');
```

Sonrakı addım əvvəlkindən asılıdırsa, adi `expect` yaz: uğursuz girişdən sonra davam etməyin mənası yoxdur.

**Hook-lar.** `beforeEach` hər testdən əvvəl (19.6), `beforeAll` isə bir dəfə işləyir:

```javascript
let token;

test.beforeAll(async ({ request }) => {
  const res = await request.post(`${API}/login`, {
    data: { username: 'standard_user', password: process.env.SAUCE_PASSWORD },
  });
  const body = await res.json();
  token = body.token;
});

test.afterAll(async () => {
  console.log('Testlər bitdi');
});
```

`beforeAll`-da `page` işlətmək olmur, çünki `page` hər test üçün yenidən yaradılır. `beforeAll` hər worker (testləri paralel işlədən ayrıca proses) üçün ayrıca işləyir. Test düşəndə də worker yenidən başlayır və `beforeAll` təkrar işləyir, ona görə “cəmi bir dəfə” deyə güvənmə. `beforeAll` düşərsə, faylın qalan testləri işə düşmür (`did not run`), `afterAll` isə yenə işləyir. Təkrarlanan hazırlıq üçün çox vaxt fixture (19.12) daha yaxşıdır.

**Vizual müqayisə.** Playwright ekranın şəklini əvvəlki etalonla (baseline) tutuşdura bilər:

```javascript
await expect(page).toHaveScreenshot('settings.png', { maxDiffPixels: 100 });
```

İlk icrada etalon yoxdur: şəkil yaradılır, test isə uğursuz sayılır (`A snapshot doesn't exist at …, writing actual`). Şəklə bax, düzgündürsə, növbəti icralar onunla müqayisə olunur. Dizayn dəyişəndə: `npx playwright test --update-snapshots`. Şrift və sistem fərqinə görə etalonlar brauzer və əməliyyat sisteminə görə ayrıca saxlanılır (`settings-chromium-win32.png`), ona görə Windows-da çəkilən etalon Linux CI-da işləmir. Etalonu CI ilə eyni mühitdə yarat. Bu yoxlama kitabın məşqində işləmir, real brauzer lazımdır.

### 19.20. Test düşəndə: səbəbi addım-addım tapmaq {#c19x10}

Düşən test hələ baq demək deyil. Dörd səbəb ola bilər: məhsulda baq, testin özündə səhv (lokator, data, köhnə gözlənti), mühit (server, şəbəkə, test datası) və qeyri-sabitlik (flaky, 19.9). Təxmin etmək əvəzinə beş addımla get.

**1. Xətanı oxu.** Playwright 1.63 yoxlama düşəndə belə yazır:

```text
Error: expect(locator).toHaveText(expected) failed

Locator:  locator('.title')
Expected: "Products"
Received: "Your Cart"
Timeout:  5000ms

Call log:
  - Expect "toHaveText" locator('.title') with timeout 5000ms
  - waiting for locator('.title')
    14 × locator resolved to <span class="title" data-test="title">Your Cart</span>
       - unexpected value "Your Cart"
```

Birinci sətir hansı yoxlamanın düşdüyünü, `Locator` hansı elementə baxıldığını, `Expected` və `Received` nə gözlənildiyini və nə gəldiyini deyir. `Call log`-da “resolved to” varsa, element tapılıb: lokator işləyir, problem dəyərdədir. Sətir nömrəsi isə xətanın aşağısında, faylın adı ilə gəlir.

| Mesajda | Mənası | İlk şübhə |
| --- | --- | --- |
| `Error: element(s) not found` | Lokator heç nə tapmadı | Lokator köhnəlib və ya başqa səhifə açılıb |
| `strict mode violation … resolved to 2 elements` | Lokator birdən çox element tapdı | Lokator dəqiq deyil (19.5) |
| `Expected` ilə `Received` fərqlidir | Element var, dəyəri fərqlidir | Məhsul baqı və ya köhnə gözlənti |
| `Test timeout of 30000ms exceeded` və `waiting for` | Hərəkət elementi gözlədi, tapmadı | Əvvəlki addım baş tutmayıb |
| `toHaveURL` və `Received` köhnə səhifədir | Keçid olmayıb | Login və ya klik alınmayıb: ekrana bax |

**2. Təkrarla.** Yalnız düşən testi, təkrar cəhd olmadan işə sal. Sətir nömrəsi bir testi seçir:

```bash
npx playwright test tests/cart.spec.js:12 --project=chromium --retries=0
npx playwright test tests/cart.spec.js:12 --repeat-each=10
```

Bəzən keçib bəzən düşürsə, flaky-dir: səbəbi yenə də axtarılır (19.9).

**3. Bax.** Xəta mesajı nə olduğunu deyir, ekran isə niyə olduğunu göstərir.

```bash
npx playwright test --ui
npx playwright test tests/cart.spec.js:12 --debug
npx playwright show-trace test-results/cart-chromium/trace.zip
```

- **UI mode (`--ui`)** testləri siyahı ilə göstərir və hər addımın ekranını saxlayır: addıma basıb həmin anı görürsən.
- **`--debug`** Playwright Inspector-u açır: test addım-addım icra olunur, lokatoru səhifədə sınaya bilərsən. Testin içində `await page.pause();` yazsan, test həmin yerdə dayanır.
- **Trace viewer** CI-da düşən test üçündür (19.16). 20.8-dəki workflow hesabatı artifact kimi saxlayır: onu endir və aç.
- Konfiqurasiyada `screenshot: 'only-on-failure'` və `video: 'retain-on-failure'` düşən testin şəklini və videosunu saxlayır.

**4. Təsnif et.**

| Gördüyün | Səbəb | Nə edirsən |
| --- | --- | --- |
| Element ekrandadır, amma başqa class və ya adla | Test: lokator köhnəlib | Lokatoru yenilə, mümkünsə `data-test` ilə |
| Ekrandakı nəticə tələbə uyğun deyil | Məhsul baqı | Bug report yaz, trace-i əlavə et. Testi “keçirmək” üçün yoxlamanı dəyişmə |
| Səhifə açılmır, 502, test datası yoxdur | Mühit | Mühiti yoxla və de (4.9), testə toxunma |
| Bəzən keçir, bəzən yox | Flaky | Gözləməyə, data asılılığına, test sırasına bax (19.9) |
| Ekran tələbə uyğundur, testdəki gözlənti fərqlidir | Test: köhnə və ya səhv gözlənti | Tələbə baxıb testi düzəlt |

**5. Düzəlt və yoxla.** Düzəlişdən sonra testi bir neçə dəfə işə sal. Məhsul baqında test qırmızı qalır və bu, düzgündür. Baqın nömrəsini testin özünə yaz, hesabatda görünür:

```javascript
test('Bolt T-Shirt səbətə əlavə olunur', {
  annotation: { type: 'issue', description: 'SHOP-412' },
}, async ({ page }) => {
  // …
});
```

Baq düzələnə qədər bəzi komandalar testi `test.fixme()` ilə keçir və ya `test.fail()` ilə “gözlənilən düşmə” kimi işarələyir. Hansı yolun seçildiyini komandanın qaydası həll edir.

Ən təhlükəli “düzəliş” yoxlamanı silmək və ya gözləntini ekrana uyğunlaşdırmaqdır: test yaşıl olur, baq isə müştəriyə gedir.

### 19.21. Playwright TypeScript ilə {#c19x11}

Playwright TypeScript-i əlavə ayar olmadan işə salır: fayl `login.spec.ts` olur, idxal isə eynidir. Tiplər `@playwright/test`-dən gəlir: `Page`, `Locator` və başqaları.

**Page Object TypeScript-də.** 19.7-dəki sinif burada tiplərlə yazılır. Redaktor (VS Code) indi `loginPage.` yazanda metodları özü təklif edir, səhv tipli arqument isə dərhal qırmızı xəttlə görünür:

```typescript
import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    this.page = page;
    this.username = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.error = page.getByTestId('error');
  }

  async goto() {
    await this.page.goto('https://www.saucedemo.com/');
  }

  async login(user: string, password: string) {
    await this.username.fill(user);
    await this.password.fill(password);
    await this.loginButton.click();
  }
}
```

`readonly` sahənin sonradan dəyişdirilməyəcəyini deyir.

**Fixture-in tipi.** 19.12-dəki fixture-ə `base.extend<…>` ilə tip verilir, sonra testdə `loginPage`-in nə olduğunu redaktor bilir:

```typescript
import { test as base } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

type Fixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },
});

export { expect } from '@playwright/test';
```

**Data-driven test tipli data ilə.** 19.13-dəki cədvələ tip verəndə sahə adının səhvi və ya unudulmuş sahə dərhal görünür:

```typescript
import { test, expect } from './fixtures';

type User = {
  name: string;
  canLogin: boolean;
  error?: string;
};

const users: User[] = [
  { name: 'standard_user', canLogin: true },
  { name: 'locked_out_user', canLogin: false, error: 'Sorry, this user has been locked out.' },
];

for (const user of users) {
  test(`giriş: ${user.name}`, async ({ loginPage, page }) => {
    await loginPage.login(user.name, process.env.SAUCE_PASSWORD ?? '');
    if (user.canLogin) {
      await expect(page).toHaveURL(/inventory/);
    } else {
      await expect(loginPage.error).toContainText(user.error ?? '');
    }
  });
}
```

`??` sol tərəf boş (`undefined` və ya `null`) olanda sağ tərəfi götürür: şifrə mühitdə yoxdursa, boş mətn.

**Playwright tipləri yoxlamır.** `npx playwright test` `.ts` faylını işə salır, amma tip xətasına görə dayanmır. Tipləri ayrıca yoxla və bunu CI-a da əlavə et (20.10):

```bash
npx tsc --noEmit
```

Bunun üçün layihədə `tsconfig.json` olmalıdır. `process.env` üçün isə Node.js tipləri (`@types/node`) lazımdır: yoxdursa, `tsc` “Cannot find name 'process'” yazır. `npm init playwright` onu özü qurur, sonradan əlavə edəndə: `npm install -D @types/node`.

Kitabın Playwright məşqi JavaScript-dədir. TypeScript kodunu öz layihəndə işə sal: məntiq eynidir, yalnız tiplər əlavə olunur.

### Diqqət: tez-tez edilən səhvlər

- **`await`-i unutmaq.** Test gözləmədən irəli qaçır.
- **Sabit gözləmələr (`waitForTimeout`).** Testi yavaşladır və yenə də flaky edir.
- **Hər şeyi UI ilə test etmək.** API ilə yoxlana bilən şeyi API ilə yoxla — piramidanı xatırla.
- **Testləri bir-birinə bağlamaq.** Birinci test istifadəçi yaradır, ikincisi onu işlədirsə, birinci düşəndə hamısı düşür.
- **Fixture-də `await use(…)` yazmamaq.** Test heç başlamır, timeout olur.
- **Data-driven testdə dövrü `test`-in içinə qoymaq.** Birinci səhv dəyərdə dayanır, qalanlar yoxlanmır.
- **`await response.json()` yazmamaq.** Dəyər Promise olur, `user.name` isə `undefined`.
- **Şifrəni və `playwright/.auth`-u repo-ya atmaq.** `.env` və `.auth` `.gitignore`-a yazılır.
- **İşarə qutusunu `click()` ilə işarələmək.** Qutu artıq işarəli idisə, işarə gedir. `check()` yaz.
- **Dialog dinləyicisini klikdən sonra yazmaq.** Playwright pəncərəni artıq ləğv edib, dinləyici işləmir.
- **`await page.waitForEvent('popup')`-u klikdən əvvəl yazmaq.** Test klikə çatmır, timeout olur.
- **Hər şeyi saxta cavabla yoxlamaq.** Real API sınsa da, testlər yaşıl qalır.

### Həll olunmuş nümunə

**Tapşırıq.** “Məhsul səbətə əlavə olunur” test case-ini Playwright testinə çevir.

**Həll.**

1. Əvvəlcə manual test case kimi düşün:
   - İlkin şərt: istifadəçi standard\_user ilə daxil olub.
   - Addım: “Sauce Labs Backpack” məhsulunun “Add to cart” düyməsini bas.
   - Gözlənilən: səbət ikonunda “1” görünür; düymə “Remove” olur.
2. Lokatorları DevTools ilə və ya codegen ilə tap. Swag Labs elementlərində `data-test` atributu var.
3. Kod:

```javascript
import { test, expect } from '@playwright/test';

test('məhsul səbətə əlavə olunur', async ({ page }) => {
  // İlkin şərt: giriş
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  // Addım
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

  // Gözlənilən nəticə
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toBeVisible();
});
```

4. İşə sal: `npx playwright test --headed` — brauzerdə hər addımı görəcəksən.
5. Diqqət et: test case-in hər hissəsi koda çevrildi — ilkin şərt, addım, iki gözlənilən nəticə. Yaxşı manual test case yaxşı avtomatik testin əsasıdır.

### Sənin növbən

1. “Səbətdən məhsulu silmək” testini yaz.
2. Yanlış şifrə ilə giriş testini yaz: xəta mesajının mətnini yoxla.
3. codegen ilə checkout prosesini (səbət → Checkout → məlumatlar → Finish) yaz. Yaranan kodu oxu və hər sətrini öz sözlərinlə izah et.
4. LoginPage POM-unu yarat və yazdığın bütün login testlərini ona keçir.
5. Testlərdən birini qəsdən sındır (gözlənilən mətni dəyiş) və HTML hesabatda xətanın necə göstərildiyinə bax.
6. Öz framework-ünü qur: Swag Labs üçün qovluq quruluşu, 2 page class, 1 fixture, 1 data-driven test, 2 API testi, login vəziyyəti və GitHub Actions. README yaz və GitHub-a yüklə: bu, portfolio-nun əsas layihəsi olacaq.
7. Real saytda sına: `https://the-internet.herokuapp.com` sınaq üçün açıq saytdır, giriş istəmir. `/checkboxes`, `/dropdown`, `/hovers`, `/javascript_alerts` və `/windows` səhifələrinin hər biri üçün bir test yaz və öz kompüterində işə sal.

### Özünü yoxla

- Hansı testləri avtomatlaşdırmaq lazımdır, hansıları yox?
- Test piramidası nəyi göstərir? “Dondurma qabı” nədir?
- Tövsiyə olunan lokator sırası necədir və niyə?
- Auto-waiting nədir?
- Flaky test nədir və səbəbləri hansılardır?
- Fixture nədir və `test.beforeEach`-dən nə ilə fərqlənir?
- Data-driven test nə vaxt lazımdır, nə vaxt lazım deyil?
- `storageState` hansı problemi həll edir və fayl niyə repo-ya düşməməlidir?
- Dialog və yeni tab üçün hazırlıq niyə klikdən əvvəl yazılır?
- `page.route` nəyi yoxlamağa kömək edir, nəyi sübut etmir?
- `expect.soft` nə vaxt faydalıdır, nə vaxt yox?
## Fəsil 20. Git, GitHub və CI/CD

Git kodun versiyalarını saxlayır, GitHub onu komanda ilə paylaşmağa imkan verir, CI/CD isə hər dəyişiklikdən sonra testləri avtomatik işə salır. Avtomatlaşdırma ilə işləyən tester üçün üçü də gündəlik alətdir.

### 20.1. Git nədir

Git versiya nəzarət sistemidir: faylların hər dəyişikliyini tarixçə kimi saxlayır. İstənilən vaxt əvvəlki vəziyyətə qayıtmaq və kimin nəyi dəyişdiyini görmək olur. Sənədin “versiya tarixçəsi”ni düşün — amma bütün layihə üçün.

| Anlayış | Mənası |
| --- | --- |
| Repository (repo) | Layihə qovluğu və onun bütün tarixçəsi |
| Commit | Yadda saxlanmış dəyişiklik “şəkli”; mesajı olur |
| Branch (budaq) | Paralel iş xətti; əsas budaq adətən main adlanır |
| Merge | Bir budağın dəyişikliklərini digərinə birləşdirmək |
| Remote | Uzaq serverdəki repo, məsələn, GitHub-da |
| Clone | Uzaq repo-nun lokal nüsxəsini yaratmaq |
| Push / Pull | Dəyişiklikləri serverə göndərmək / serverdən almaq |
| Pull request (PR) | Budağı main-ə birləşdirmək üçün sorğu; komanda onu nəzərdən keçirir |
| Conflict | İki nəfər eyni sətri fərqli dəyişəndə yaranan ziddiyyət |

### 20.2. Əsas əmrlər

| Əmr | Nə edir |
| --- | --- |
| git init | Qovluqda yeni repo yaradır |
| git clone URL | Uzaq repo-nu kompüterə köçürür |
| git status | Hansı faylların dəyişdiyini göstərir — ən çox işlədilən əmr |
| git add . | Bütün dəyişiklikləri commit üçün hazırlayır (staging) |
| git commit -m "mesaj" | Dəyişikliyi mesajla yadda saxlayır |
| git push | Commit-ləri serverə göndərir |
| git pull | Serverdəki yenilikləri alır |
| git switch -c ad | Yeni budaq yaradır və ona keçir |
| git switch main | main budağına qayıdır |
| git log --oneline | Commit tarixçəsini qısa göstərir |
| git diff | Commit olunmamış dəyişiklikləri göstərir |

Faylın yolu belədir: işçi qovluq → `git add` → staging (hazırlıq) → `git commit` → repo tarixçəsi → `git push` → GitHub.

### 20.3. .gitignore

Bəzi faylları repo-ya əlavə etmək lazım deyil: yüklənmiş paketlər, hesabatlar, şifrələr. `.gitignore` faylı Git-ə onlara baxmamağı deyir. Playwright quraşdırılanda bu faylı özü yaradır; tipik məzmun:

```text
node_modules/
test-results/
playwright-report/
.env
```

`.env` faylında şifrə və tokenlər saxlanılır — onu heç vaxt GitHub-a yükləmə.

### 20.4. Komanda ilə iş axını

1. main budağı həmişə işlək vəziyyətdə saxlanılır.
2. Hər tapşırıq üçün ayrıca budaq yaradılır: `feature/login-tests`, `fix/cart-test`.
3. İş bitəndə budaq push edilir və pull request açılır.
4. Komanda yoldaşı kodu nəzərdən keçirir (code review) və şərh yazır.
5. Testlər keçirsə və review təsdiqlənsə, PR main-ə birləşdirilir.

Yaxşı commit mesajı qısa və konkretdir: “Add login tests for locked user”, “Fix flaky cart badge assertion”. Pis mesajlar: “dəyişiklik”, “düzəliş”, “asdf”.

### 20.5. Tester Git-dən nə üçün istifadə edir

- Avtomatlaşdırma kodunu saxlamaq və komanda ilə paylaşmaq.
- Portfolio: GitHub profili işəgötürən üçün bacarığın sübutudur (Fəsil 21).
- Proqramçıların PR-larına baxmaq: hansı fayllar dəyişib, hansı sahələri test etmək lazımdır.
- Defektin hansı dəyişiklikdən sonra yarandığını tapmaq: commit tarixçəsi bunu göstərir.

### 20.6. Addım-addım: Playwright layihəsini GitHub-a yükləmək

1. GitHub-da yeni repository yarat, məsələn, `playwright-practice`. README əlavə etmə — repo boş olmalıdır.
2. Layihə qovluğunda terminalı aç və yaz:

```bash
git init
git add .
git commit -m "Initial Playwright tests"
git branch -M main
git remote add origin https://github.com/<istifadəçi-adın>/playwright-practice.git
git push -u origin main
```

3. İlk push zamanı Windows-da Git Credential Manager brauzer pəncərəsi açır — GitHub hesabınla icazə ver.
4. GitHub-da repo səhifəsini yenilə: fayllar orada olmalıdır, node\_modules isə olmamalıdır.

### 20.7. CI/CD nədir

- **CI (Continuous Integration — davamlı inteqrasiya):** hər push və ya PR-dan sonra kod avtomatik yığılır (build) və testlər işə düşür. Problem dərhal görünür.
- **CD (Continuous Delivery / Deployment — davamlı çatdırılma / yerləşdirmə):** testlərdən keçən versiya avtomatik olaraq test mühitinə və ya istifadəçilərə çatdırılır.

Zavod konveyerini düşün: hər detal xəttdən keçəndə avtomatik yoxlanılır, qüsurlu detal növbəti mərhələyə keçmir. Populyar alətlər: GitHub Actions, GitLab CI, Jenkins, Azure Pipelines.

Mühitlər zənciri: development (dev) → test / QA → staging (istehsala ən yaxın) → production (canlı).

### 20.8. GitHub Actions ilə Playwright testləri

Layihədə `.github/workflows/playwright.yml` faylı yaradılır. Playwright quraşdırılanda “GitHub Actions workflow” sualına “bəli” demsən, bu faylı özü yaradır. Sadələşdirilmiş forma:

```yaml
name: Playwright Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - name: Paketləri qur
        run: npm ci
      - name: Brauzerləri qur
        run: npx playwright install --with-deps
      - name: Testləri işə sal
        run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

- **on** — nə vaxt işə düşür: main-ə push və main-ə açılan PR.
- **runs-on** — hansı virtual maşında: Ubuntu Linux.
- **steps** — ardıcıl addımlar: kodu yüklə (checkout), Node.js qur, paketləri qur (npm ci), brauzerləri qur, testləri işə sal.
- **upload-artifact** — HTML hesabatı saxlayır; `if: always()` testlər düşsə belə işləyir.

`actions/…` sətirlərindəki versiya nömrələri (v4 və s.) zamanla yenilənir — Playwright-ın yaratdığı fayldakı versiyalara güvən. Nəticəyə GitHub-da repo-nun Actions tabında baxılır: yaşıl — testlər keçdi, qırmızı — düşdü. Hesabatı Artifacts bölməsindən yükləmək olur.

### 20.9. Tester-in CI-dakı rolu

- **Qırmızı pipeline-ı oxumaq:** hansı test, hansı addımda, hansı xəta ilə düşüb?
- **Defekt, yoxsa test problemi?** Məhsul sınıbsa — bug report; test köhnəlibsə — testi yenilə.
- **Flaky testləri izləmək və düzəltmək.**
- **Deploy-dan sonra smoke testlərin avtomatik işə düşməsini təmin etmək.**

### 20.10. Framework-ü CI-a bağlamaq {#c20x1}

20.8-dəki fayl başlanğıcdır. Testlər çoxalanda üç sual yaranır: şifrə haradan gəlir, hər PR-da nə işləyir, 30 dəqiqəlik dəsti necə qısaltmaq olar?

**Secrets.** Şifrə repo-ya yazılmır. GitHub-da: repo → Settings → Secrets and variables → Actions → New repository secret. Ad: `SAUCE_PASSWORD`. Workflow-da belə oxunur:

```yaml
env:
  SAUCE_PASSWORD: ${{ secrets.SAUCE_PASSWORD }}
```

Testlərdə o, `process.env.SAUCE_PASSWORD` kimi görünür: kompüterdə `.env`-dən, CI-da secrets-dən gəlir, test kodu dəyişmir.

**PR-da az, gecə çox.** Teqlərlə (19.16) iki rejim qurulur: PR-da yalnız `@smoke`, gecə tam dəst.

**Shard.** Dəsti bir neçə maşına bölür: `--shard=1/3` dəstin birinci üçdə birini işlədir. `strategy.matrix` isə üç paralel job yaradır.

```yaml
name: E2E
on:
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 20 * * *'
jobs:
  smoke:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    env:
      SAUCE_PASSWORD: ${{ secrets.SAUCE_PASSWORD }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test --project=chromium --grep @smoke
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: smoke-report
          path: playwright-report/
  full:
    if: github.event_name == 'schedule'
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: [1, 2, 3]
    env:
      SAUCE_PASSWORD: ${{ secrets.SAUCE_PASSWORD }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test --shard=${{ matrix.shard }}/3
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: full-report-${{ matrix.shard }}
          path: |
            playwright-report/
            test-results/
          retention-days: 14
```

- `cron: '0 20 * * *'` — GitHub UTC vaxtı ilə işləyir: 20:00 UTC = 00:00 Bakı.
- `if: github.event_name == …` — job-u yalnız uyğun hadisədə işə salır.
- `fail-fast: false` — bir shard düşəndə o birilər dayanmır.
- `test-results/` — trace və ekran şəkillərini də saxlayır: düşən testin diaqnozu üçün.
- Hər shard ayrıca hesabat verir. Onları bir hesabatda birləşdirmək üçün Playwright-ın `blob` hesabatı və `merge-reports` əmri var.

**PR-ı qoruyan qayda.** Pipeline-ın nəticəsi məcburi olmayanda proqramçılar gözləmir. GitHub-da: Settings → Branches → main üçün qayda → “Require status checks to pass”. İndi `smoke` qırmızıdırsa, PR birləşmir. Bu qaydanın düzgün işləməsi üçün flaky testlər tez düzəldilməlidir, yoxsa komanda onu söndürməyi istəyəcək.

**Portfolio üçün.** README-yə workflow-un nişanını (badge) və son hesabatın linkini əlavə et: işəgötürən testlərin həqiqətən işlədiyini bir baxışda görür.

### Diqqət: tez-tez edilən səhvlər

- **Birbaşa main-ə push etmək.** Hər dəyişiklik budaq və PR ilə getməlidir.
- **Şifrə və tokenləri repo-ya yükləmək.** GitHub-da Settings → Secrets bölməsindən istifadə et.
- **Qırmızı CI-ı görməzdən gəlmək.** “Sonra baxarıq” deyilən qırmızı testlər tezliklə heç kimin inanmadığı testlərə çevrilir.
- **node\_modules-u commit etmək.** .gitignore-u yoxla.

### Həll olunmuş nümunə

**Tapşırıq.** Səbət testindəki xətanı düzəltdin. Yeni budaq yarat, dəyişikliyi commit et, push et və pull request aç.

**Həll.**

```bash
git switch main
git pull
git switch -c fix/cart-badge-test
# ... faylda düzəliş edilir ...
git status
git add tests/cart.spec.js
git commit -m "Fix cart badge assertion"
git push -u origin fix/cart-badge-test
```

1. `git switch main` və `git pull` — ən son versiyadan başlayırıq ki, köhnə kodun üzərində işləməyək.
2. `git switch -c` — yeni budaq; adı nə etdiyimizi deyir.
3. `git status` — hansı faylların dəyişdiyini yoxlayırıq ki, təsadüfi faylı commit etməyək.
4. `git add` faylın adı ilə — yalnız lazım olan faylı əlavə edirik.
5. `git commit -m` — aydın mesajla yadda saxlayırıq.
6. `git push -u origin …` — budağı GitHub-a göndəririk; `-u` gələcəkdə sadəcə `git push` yazmağa imkan verir.
7. GitHub-da “Compare & pull request” düyməsi görünəcək: başlıq və təsvir yaz, PR-ı aç. CI testləri avtomatik işə düşəcək.

### Sənin növbən

1. Playwright layihəni GitHub-a yüklə və linkini mənə göndər.
2. .gitignore-a hansı qovluqlar və fayllar düşməlidir və niyə? Öz sözlərinlə yaz.
3. Workflow faylını əlavə et və Actions tabında testlərin yaşıl keçdiyini göstər.
4. Bir testi qəsdən sındır, push et və CI-da qırmızı nəticəni oxu: harada və niyə düşdü?
5. Yeni budaqda bir test əlavə et və pull request aç.

### Özünü yoxla

- Commit, branch və pull request nədir?
- git add və git commit fərqi nədir?
- .gitignore nə üçündür?
- CI və CD nədir?
- Qırmızı pipeline görəndə tester nə edir?

# VII hissə — Karyera

## Fəsil 21. Karyera: portfolio, CV və müsahibəyə hazırlıq

İşə qəbulda bilikdən çox, biliyin sübutu qiymətləndirilir: işlək portfolio, aydın CV və müsahibədə məntiqli düşünmək bacarığı. Bu fəsil üçünü də addım-addım qurmağa kömək edir.

### 21.1. Junior QA-dan nə gözlənilir

| Sahə | Minimum | Üstünlük verir |
| --- | --- | --- |
| Test nəzəriyyəsi | Prinsiplər, SDLC/STLC, test növləri və səviyyələri | ISTQB Foundation sertifikatı |
| Test dizaynı | EP, BVA, qərar cədvəli, vəziyyət keçidləri | Pairwise, exploratory sessiyalar |
| Sənədlər | Test case, checklist, bug report | Test planı, yekun hesabat |
| Alətlər | Jira, DevTools, Postman | TestRail və ya Qase |
| Texniki | HTTP, REST, JSON, SQL əsasları | Git, Linux əmrləri |
| Avtomatlaşdırma | Tələb olunmur | JavaScript + Playwright və ya Cypress, CI |
| Dil | İngilis dilində texniki mətni oxumaq | Danışıq səviyyəsi (B1 və yuxarı) |
| Yumşaq bacarıqlar | Ünsüiyyət, diqqət, öyrənmə həvəsi | Komandada iş təcrübəsi |

### 21.2. Portfolio — bacarığın sübutu

GitHub-da bir neçə layihə topla, hər birinin README faylı olsun:

1. **Manual test layihəsi** — saucedemo.com üçün: test planı, checklist, 20–30 test case, 5–10 bug report.
2. **API test layihəsi** — JSONPlaceholder üçün Postman kolleksiyası, testlər və Newman hesabatı.
3. **Avtomatlaşdırma layihəsi** — Playwright testləri, POM və GitHub Actions ilə avtomatik icra.
4. **SQL tapşırıqları** — Fəsil 16-nın sorğuları və həlləri.

Yaxşı README-də layihənin məqsədi, istifadə olunan alətlər, necə işə salındığı və nəticələr (ekran şəkli, hesabat linki) olur. Real şirkətlərin saytlarında icazəsiz təhlükəsizlik testi etmə — ən təhlükəsiz yol test üçün açılmış demo saytlardır.

### 21.3. CV

- **Uzunluq:** 1 səhifə.
- **Başlıq:** “Junior QA Engineer” və ya “Manual QA Tester”.
- **Qısa xülasə (2–3 cümlə):** kim olduğun, nə bacardığın, nə axtardığın.
- **Bacarıqlar:** qruplarla yaz — test dizaynı; alətlər (Jira, Postman, DevTools, Git); texniki (SQL, HTTP/REST, JavaScript əsasları); avtomatlaşdırma (Playwright).
- **Layihələr:** portfolio linkləri ilə; hər layihə üçün 1–2 sətir nəticə: “Swag Labs üçün 30 test case yazdım, 6 defekt tapıb sənədləşdirdim”.
- **Təcrübə:** əvvəlki işin IT olmasa belə, ötürülə bilən bacarıqları göstər. Məsələn, təlim və ya menecment təcrübəsi: prosesləri sənədləşdirmək, mürəkkəb mövzunu aydın izah etmək, komanda ilə ünsüiyyət. Bunlar test sənədləri və bug report üçün birbaşa faydalıdır.
- **Təhsil, kurslar, sertifikatlar.**
- **Dillər:** səviyyə ilə.

Qaçın: uzun ümumi sözlər (“məsuliyyətli, çalışqan”) və bacarmadığın alətləri yazmaq — müsahibədə mütləq soruşulacaq.

### 21.4. İş axtarışı

- **LinkedIn profili:** başlıq, xülasə, bacarıqlar, portfolio linki. QA icmalarına qoşul, öyrəndiklərin barədə qısa paylaşımlar et.
- **İş elanı saytları** və şirkətlərin karyera səhifələri.
- **Təcrübə proqramları (internship)** və könüllü layihələr — ilk təcrübə üçün yaxşı yoldur.
- **Crowdtesting platformaları** — real məhsulları pullu test etmək imkanı.
- **Şəbəkə:** tədbirlər, onlayn icmalar, tanışların tövsiyəsi.

### 21.5. Müsahibənin mərhələləri

1. **HR söhbəti** — motivasiya, gözləntilər, ünsüiyyət.
2. **Texniki müsahibə** — nəzəriyyə, test dizaynı, praktik suallar.
3. **Praktik tapşırıq** — sayt və ya tətbiq test etmək, test case və bug report yazmaq.
4. **Final** — komanda rəhbəri ilə söhbət.

### 21.6. Tez-tez verilən texniki suallar

| Sual | Nümunə cavab |
| --- | --- |
| QA, QC və testing fərqi nədir? | QA prosesi yaxşılaşdırıb problemin qarşısını alır, QC hazır məhsulu yoxlayır, testing isə konkret yoxlama hərəkətləridir. |
| Severity və priority fərqi? | Severity — defektin texniki təsiri, priority — düzəlişin təcililiyi. Misal: şirkət adının səhv yazılması — aşağı severity, yüksək priority. |
| Retest və regression fərqi? | Retest düzəldilmiş konkret defekti yoxlayır, regression isə dəyişikliyin başqa funksiyaları sındırmadığını. |
| Smoke və sanity fərqi? | Smoke — yeni build-in geniş və dayaz yoxlanılması; sanity — konkret dəyişikliyin dar və dərin yoxlanılması. |
| Bug life cycle-ı izah et. | New → Assigned → Open → Fixed → Ready for Test → Verified → Closed; retest uğursuzdursa Reopened; həmçinin Rejected, Duplicate, Deferred. |
| Yaxşı bug report-da nə olur? | Aydın başlıq, mühit, təkrarlama addımları, gözlənilən və faktiki nəticə, severity, sübutlar. |
| EP və BVA nədir? | EP — dəyərləri eyni emal olunan siniflərə bölmək; BVA — sinif sərhədlərini və qonşularını yoxlamaq. 18–60 üçün: 17, 18, 60, 61. |
| 401 və 403 fərqi? | 401 — kimlik təsdiqlənməyib; 403 — kimlik bəllidir, amma icazə yoxdur. |
| GET və POST fərqi? | GET məlumatı oxuyur, POST yeni məlumat yaradır və datanı gövdədə göndərir. |
| Baq təkrarlanmırsa nə edərsən? | Mühiti, datanı və addımları dəqiqləşdirərəm, loqlara və Network-a baxaram, tezliyi qeyd edərəm, video çəkərəm, proqramçı ilə birlikdə baxaram. |
| Proqramçı “bu baq deyil” desə? | Tələbə və acceptance criteria-ya istinad edərəm. Tələb aydın deyilsə, Product Owner ilə aydınlaşdırarıq. Mübahisəni şəxsi yox, faktlarla aparıram. |
| Testə vaxt çatmırsa? | Risk əsaslı prioritetləşdirmə: ən kritik biznes ssenariləri və ən çox dəyişən sahələr birinci; qalan riskləri komandaya açıq bildirirəm. |

### 21.7. “Bu əşyanı test et” sualı

Müsahibədə tez-tez soruşulur: “Bu qələmi (lifti, kofe aparatını) test et.” Məqsəd düşüncə tərzini görməkdir. Strukturlu cavab belə qurulur:

1. **Əvvəlcə sual ver:** kim istifadə edir, məqsəd nədir, tələblər nələrdir?
2. **Funksional:** əsas iş (qələm yazırmı?), müxtəlif səthlərdə, müxtəlif bucaqlarda.
3. **Qeyri-funksional:** rahatlıq, davamlılıq, təhlükəsizlik, görünüş.
4. **Neqativ və sərhəd halları:** soyuqda, istidə, düşəndə, mürəkkəb bitəndə.
5. **Prioritet:** hansı testlər ən vacibdir və niyə.

### 21.8. Davranış sualları — STAR metodu

“Çətin vəziyyəti necə həll etdin?” tipli suallara STAR ilə cavab ver:

- **S (Situation)** — vəziyyət: harada, nə baş verirdi.
- **T (Task)** — sənin vəzifən.
- **A (Action)** — nə etdin, konkret addımlar.
- **R (Result)** — nəticə, mümkünsə rəqəmlə.

**Misal.** “Kursdakı komanda layihəsində (S) testlərə vaxt az qalmışdı (T). Risklərə görə ən vacib 10 ssenarini seçib onlara fokuslandım, qalanlarını checklist ilə qısa yoxladım (A). Relizdən əvvəl 3 kritik defekt tapıldı və düzəldildi (R).”

### 21.9. Sertifikat

ISTQB Certified Tester Foundation Level (CTFL) tester-lər üçün ən tanınan beynəlxalq sertifikatdır. Junior üçün məcburi deyil, amma CV-də üstünlük verir və nəzəriyyəni sistemləşdirir. Bu kitabın I–IV hissələri onun əsas mövzularını əhatə edir.

### 21.10. Bu kitabdan sonra

- Portfolio-nu tamamla və hər həftə ona nəsə əlavə et.
- Bir avtomatlaşdırma alətində dərinləş: Playwright, sonra TypeScript.
- İxtisaslaşma seç: performans testi (k6, JMeter), mobil avtomatlaşdırma (Appium), təhlükəsizlik əsasları, oyun testi.
- İngilis dilini inkişaf etdir: sənədlər və icma əsasən ingiliscədir.

### 21.11. İşdə ilk 30 gün {#c21x1}

Təklifi qəbul etdin, işə başladın. Sınaq müddətində səndən hər şeyi bilmək gözlənilmir. Gözlənilən: tez öyrənmək, dediyini etmək, aydın danışmaq, qeyd aparmaq.

| Vaxt | Nə et | Nəticə |
| --- | --- | --- |
| 1-ci həftə | Girişlər: Jira, wiki, mühitlər, çat. Məhsulu istifadəçi kimi işlət. Açıq və köhnə baqları oxu. Həmkarın işinə bax | Qeyd dəftərin, mühit cədvəlin (4.8), “kimdən soruşum” siyahın |
| 2-ci həftə | Mövcud test case-ləri icra et, ilk bug report-larını QA lead-ə göstər, stand-up-da qısa danış | İlk baqlar, köhnəlmiş test case-lərin düzəlişi |
| 3-cü həftə | Kiçik bir story götür: suallardan Done şərhinə qədər (12.10) | İlk tam story |
| 4-cü həftə | Daha böyük story və ya bir sahəyə cavabdehlik. Rəhbərlə rəy söhbəti: nə yaxşıdır, nəyi dəyişim? | Növbəti ay üçün plan |

**Kömək istəmək.** Qayda: bir mövzuda 15–30 dəqiqə özün çalış, sonra soruş. Bloklanmısansa, gözləmə (4.9). Sualda üç şey yaz: nə etmək istəyirəm, nə sınadım, nə gözləyirəm.

```text
Salam! SHOP-214-ü test edirəm. Promo kod səhifəsi test mühitində menyuda görünmür.
Wiki-yə baxdım, standard_user və admin ilə yoxladım.
Bu funksiya üçün xüsusi hesab lazımdır?
```

**Gecikəcəyini vaxtında de.**

```text
Salam! SHOP-220-ni bu gün bitirəcəyimi demişdim, amma bitməyəcək: mühit 3 saat işləmədi.
Sabah saat 12:00-a qədər bitirəcəyəm. Relizə təsir edirsə, birlikdə baxaq.
```

**İşinə baxış istə.**

```text
Salam! Promo kod üçün 8 test case yazdım (link).
15 dəqiqə vaxtın olanda baxa bilərsən? Xüsusən neqativ hallardan əmin deyiləm.
```

**İlk ayda etmə:**

- Soruşmaqdan qorxub susma: səhv yolda bir gün itirmək bir sualdan bahadır.
- Eyni sualı iki dəfə vermə: cavabı wiki-yə və ya qeydlərinə yaz (11.11).
- Canlı mühitdə sınama (4.8).
- “Bizdə əvvəlki yerdə belə idi” deyib prosesi dərhal dəyişmək istəmə: əvvəl niyə belə olduğunu öyrən.
- Özünü başqaları ilə müqayisə edib ruhdan düşmə: bir ayda hər şeyi bilən yoxdur.

### 21.12. İş üçün ingiliscə: bug report və test sənədləri {#c21x2}

Çox komandada tiketlər, bug report-lar və çat ingiliscədir, hətta komanda azərbaycanca danışanda da. Səndən ədəbi ingiliscə gözlənilmir. Aydın, qısa və səhvsiz cümlə kifayətdir: bir neçə qəlib və 30–40 feil işin çoxunu görür.

**Azərbaycan dilindən gələn üç əsas fərq.**

| Fərq | Azərbaycanca | İngiliscə |
| --- | --- | --- |
| Feil cümlənin ortasındadır | Səhifə xəta göstərir | The page **shows** an error |
| İnkar do, does, did ilə olur | Düymə işləmir | The button **does not** work |
| Artikl var: a, an, the | Xəta çıxır | **An** error appears |

**Artikl qısaca.** `a` və `an` birinci dəfə deyilən, say bilən bir şey üçündür: “shows an error”. `the` hər iki tərəfin bildiyi konkret şey üçündür: “Click the button”. `an` hərfə yox, səsə baxır: “an error”, amma “a user”. Bug başlığında artikl çox vaxt buraxılır, cümlələrdə isə yazılır.

**Bug report-un qəlibləri.**

| Sahə | Qəlib | Misal |
| --- | --- | --- |
| Başlıq | Harada: nə, hansı şərtdə | Cart: total is not updated after applying a promo code |
| Addımlar | Əmr forması | 1. Open the cart. 2. Enter TEST10. 3. Click “Apply”. |
| Gözlənilən | Expected + indiki zaman | Expected: The total changes to 90 AZN. |
| Faktiki | Actual + indiki zaman | Actual: “Code applied” appears, but the total stays at 100 AZN. |
| Tezlik | Reproducible | Reproducible: 5 of 5 |
| Mühit | Environment | Environment: build 3.2.1, test server, Chrome 141 |

Report-da indiki sadə zaman (Present Simple) işlədilir, çünki baq hər dəfə təkrarlanır: “The page shows”, “It showed” yox. Ekrandakı mətn dırnaqda və olduğu kimi yazılır: “Apply”, tərcümə olunmur.

**Baq üçün feillər.**

| Azərbaycanca | İngiliscə |
| --- | --- |
| göstərir | shows, displays |
| xəta ilə bitir | fails with an error |
| qaytarır | returns |
| çökür, donur | crashes, freezes |
| yönləndirir | redirects to |
| yox olur | disappears |
| dəyişmir, qalır | stays, does not change |
| üst-üstə düşür, sığmır | overlaps, is cut off |
| yenilənmir, yadda saxlanmır | is not updated, is not saved |

**Hərfi tərcümə tələləri.**

| Hərfi | Düzgün |
| --- | --- |
| write a bug | file a bug, report a bug |
| make a test | run a test |
| solve the bug | fix the bug |
| I cannot login | I cannot log in (login isimdir, log in feildir) |
| The button is not work | The button does not work |
| an user, a error | a user, an error |

### 21.13. İş üçün ingiliscə: stand-up, çat və görüşlər {#c21x3}

Danışıqda qısa cümlə yaxşıdır. Mürəkkəb cümlə qurmağa çalışıb dolaşmaqdansa, iki sadə cümlə de.

**Stand-up.**

> Yesterday I finished SHOP-210 and filed two bugs. Today I am testing SHOP-214. I am blocked on SHOP-198: the fix is not on the test environment yet. Elvin, will it be deployed today?

| Məqsəd | Qəlib |
| --- | --- |
| Dünən | Yesterday I finished…, I tested…, I filed… |
| Bu gün | Today I am testing…, I will retest… |
| Maneə | I am blocked by…, I can't test … because … |
| Maneə yoxdur | No blockers. |
| Kömək | I need help with…, Could someone take a look? |

**Çat və tiket.** “You must” və “You broke” sərt səslənir. Xahiş “Could you please…?” ilə başlayır, problem isə adamla yox, faktla: “You broke login” yerinə “Login stopped working in build 3.2.1.” Əmin deyilsənsə: “It looks like…”.

| Vəziyyət | İfadə |
| --- | --- |
| Baxmaq xahişi | Could you please take a look at SHOP-311? |
| Tələbi dəqiqləşdirmək | What should happen when the code has expired? |
| Baq, yoxsa normal? | Is this a bug or expected behavior? |
| Sən təkrarlaya bilmirsən | I can't reproduce it on build 3.2.1. Could you share the steps? |
| Baq qalır | I can still reproduce it on build 3.2.1. Video attached. |
| Düzəlib | The fix works on build 3.2.2. Closing the ticket. |
| Gecikirsən | This will take longer than expected. I will finish it by noon tomorrow. |

**Görüşdə.** Başa düşməmək normaldır. Başa düşmədən “OK” demək ən bahalı səhvdir, çünki sonra yanlış şeyi test edirsən.

- “Sorry, I didn't catch that. Could you repeat it, please?”
- “Just to confirm: the code works only once?”
- “Let me check and get back to you.”

**E-poçt.** “Hi Anar,”, bir qısa abzas, “Thanks,” və adın. Birinci cümlədə nə istədiyini yaz. Tanımadığın adama “Hello Anar,” kifayətdir.

**Necə öyrənmək.**

1. Hər bug report-unu əvvəl özün ingiliscə yaz, sonra yoxla: tərcüməçidən ilk mətn üçün yox, yoxlama üçün istifadə et.
2. Komandanın yaxşı report-larını oxu və bəyəndiyin ifadəni öz siyahına köçür.
3. Stand-up mətnini görüşdən əvvəl iki sətirlə yaz: ucadan oxumaq danışmağı asanlaşdırır.
4. Şirkət datasını, müştəri məlumatını və kodu xarici tərcümə və ya AI xidmətinə yapışdırma, əvvəl qaydanı soruş.

### Diqqət: tez-tez edilən səhvlər

- **Portfolio-suz müraciət etmək.** “Öyrənmişəm” sözünün sübutu olmalıdır.
- **Bacarmadığın aləti CV-yə yazmaq.**
- **Müsahibədə “bilmirəm” deyib susmaq.** “Dəqiq bilmirəm, amma belə düşünürəm…” de və məntiqini izah et.

### Həll olunmuş nümunə

**Tapşırıq.** “Lifti test et” sualına strukturlu cavab hazırla.

**Həll.**

1. **Aydınlaşdırıcı suallar:** Bina neçə mərtəbədir? Lift yaşayış, yoxsa yük liftidir? Maksimum yük nə qədərdir? Təcili hallarda nə baş verməlidir?
2. **Funksional:** çağırış düyməsi hər mərtəbədə işləyir; seçilən mərtəbəyə gedir; qapılar açılır və bağlanır; bir neçə düymə basılanda ardıcıllıq məntiqlidir; mərtəbə göstəricisi düzgündür.
3. **Sərhəd və neqativ:** maksimum yükdə hərəkət edir; limitdən artıq yükdə xəbərdarlıq verir və hərəkət etmir; qapı bağlanarkən maneə olanda yenidən açılır; ən aşağı və ən yuxarı mərtəbə.
4. **Təhlükəsizlik:** təcili zəng düyməsi, enerji kəsiləndə davranış, yanğın rejimi, qapı mərtəbələr arasında açılmır.
5. **Qeyri-funksional:** gözləmə və hərəkət vaxtı, səs-küy, rahat hərəkət, əlçatanlıq (Brayl yazısı, səsli elan).
6. **Prioritet:** əvvəlcə təhlükəsizlik və yük limiti, sonra əsas funksionallıq, sonra rahatlıq.

Bu cavab göstərir ki, təxminlə yox, sistemlə düşünürsən: tələb → funksional → sərhəd → təhlükəsizlik → qeyri-funksional → prioritet.

### Sənin növbən

1. CV-nin “Bacarıqlar” və “Layihələr” bölmələrini yaz.
2. “Kofe aparatını test et” sualına bu fəsildəki strukturla cavab yaz.
3. GitHub portfolio-n üçün README planı hazırla: bölmələr və hər bölmədə nə olacaq.
4. Cədvəldəki 12 sualdan 5-nə öz sözlərinlə cavab yaz, sonra cədvəldəki nümunə ilə tutuşdur.
5. STAR metodu ilə öz həyatından bir hekayə yaz: çətin vəziyyəti necə həll etdin?

### Özünü yoxla

- Junior QA portfolio-sunda hansı layihələr olmalıdır?
- CV-də əvvəlki qeyri-IT təcrübəni necə göstərmək olar?
- “Bu əşyanı test et” sualına cavabın strukturu necədir?
- STAR nə deməkdir?

# Əlavələr

## Əlavə A. Terminlər lüğəti

Bu lüğət kitabdakı əsas terminləri ingiliscə əlifba sırası ilə toplayır. Son sütun terminin ətraflı izah olunduğu fəsli göstərir.

| Termin | Azərbaycanca | Qısa izah | Fəsil |
| --- | --- | --- | --- |
| Acceptance criteria | Qəbul meyarları | User story-nin hazır sayılması üçün şərtlər | 10 |
| Acceptance testing | Qəbul testi | Məhsulun biznes ehtiyacına uyğunluğunun yoxlanması | 5 |
| Ad hoc testing | Plansız test | Hazırlıqsız, sənədsiz sərbəst yoxlama | 7 |
| Agile | Çevik yanaşma | Qısa iterasiyalarla, rəy alaraq məhsul hazırlamaq | 3 |
| API | Proqram interfeysi | Proqramların bir-biri ilə danışma qaydası | 15 |
| Assertion | Yoxlama ifadəsi | Kodda gözlənilən nəticəni yoxlayan sətir (expect) | 15, 19 |
| ATDD | Qəbul testi ilə idarə olunan inkişaf | Qəbul meyarlarından koddan əvvəl testlər yazmaq | 3 |
| Backlog refinement | Backlog-un dəqiqləşdirilməsi | Story-lərin sprintdən əvvəl oxunması, aydınlaşdırılması və qiymətləndirilməsi | 3 |
| BDD | Davranışla idarə olunan inkişaf | Davranışı Given–When–Then ilə təsvir edib avtomatlaşdırmaq | 3, 10 |
| Black box testing | Qara qutu testi | Kodu bilmədən, giriş və çıxışa görə test | 7 |
| Blocker | Bloklayıcı defekt | İşi və testi tamamilə dayandıran defekt | 12 |
| Boundary Value Analysis (BVA) | Sərhəd dəyərlərinin analizi | Sərhədləri və qonşu dəyərləri yoxlamaq | 8 |
| Branch | Budaq | Git-də paralel iş xətti | 20 |
| Branch coverage | Budaq əhatəsi | İşə düşən budaqların bütün budaqlara faizi | 7 |
| Bug / Defect | Baq / defekt | Kodda və ya sənəddə qüsur | 1 |
| Bug life cycle | Defektin həyat dövrü | Defektin keçdiyi statuslar | 12 |
| Bug report | Defekt hesabatı | Defekt haqqında sənəd | 12 |
| Bug triage | Baqların triajı | Yeni baqlara baxıb qərar vermək: nə qədər ciddidir, kim, nə vaxt düzəldəcək | 12 |
| Build | Yığım | Proqramın test üçün hazırlanmış versiyası | 6 |
| Checklist | Yoxlama siyahısı | Yoxlanacaq bəndlərin qısa siyahısı | 11 |
| CI/CD | Davamlı inteqrasiya və çatdırılma | Hər dəyişiklikdən sonra avtomatik build, test və yerləşdirmə | 20 |
| Commit | Commit | Git-də yadda saxlanmış dəyişiklik | 20 |
| Compatibility testing | Uyğunluq testi | Müxtəlif brauzer, OS və cihazlarda yoxlama | 6, 14 |
| Configuration management | Konfiqurasiya idarəetməsi | Build, mühit və testware-in versiyalarla izlənməsi | 4 |
| Cookie | Cookie | Serverin brauzerdə saxladığı kiçik məlumat | 13 |
| Coverage | Əhatə | Testlərin kodu və ya tələbləri nə qədər əhatə etməsi | 7 |
| CRUD | CRUD | Create, Read, Update, Delete — data ilə 4 əsas əməliyyat | 13 |
| Data-driven test | Dataya əsaslanan test | Eyni addımların data siyahısı ilə işlədildiyi test | 19 |
| Debugging | Debugging (sazlama) | Defektin kodda yerini tapıb düzəltmək; adətən proqramçının işi | 1 |
| Decision table | Qərar cədvəli | Şərt kombinasiyalarını və nəticələri göstərən cədvəl | 9 |
| Defect clustering | Defektlərin qruplaşması | Defektlərin az sayıda modulda toplanması | 2 |
| Definition of Done (DoD) | “Hazır” anlayışı | Tapşırığın bitmiş sayılması şərtləri | 3 |
| Definition of Ready | “Başlamağa hazır” anlayışı | Story-nin işə götürülməsi üçün ödənməli şərtlər; Agile-da giriş meyarı | 3 |
| Deployment | Yerləşdirmə | Məhsulun serverə və istifadəçilərə çatdırılması | 3 |
| DevOps | DevOps | İnkişaf və istismar komandalarının birgə, avtomatik işləməsi | 3, 20 |
| DevTools | Tərtibatçı alətləri | Brauzerin daxili analiz alətləri (F12) | 13 |
| Duplicate | Dublikat | Artıq yazılmış defektin təkrarı | 12 |
| Each Choice coverage | Hər seçim əhatəsi | Hər parametrin hər sinfinin ən azı bir dəfə işə düşməsi; kombinasiyalar sayılmır | 8 |
| End-to-end (E2E) testing | Uçdan-uca test | Real istifadəçi ssenarisinin tam yoxlanması | 6 |
| Endpoint | Endpoint | API-də resursun ünvanı | 15 |
| Entry / Exit criteria | Giriş / çıxış meyarları | Mərhələnin başlama və bitmə şərtləri | 4 |
| Environment | Mühit | Testin aparıldığı server, cihaz və versiya | 4 |
| Equivalence Partitioning (EP) | Ekvivalent siniflərə bölmə | Eyni emal olunan dəyər qrupları | 8 |
| Error / Mistake | Səhv | İnsanın etdiyi yanlışlıq | 1 |
| Error guessing | Səhv təxmini | Təcrübəyə əsaslanan test ideyaları | 9 |
| Expected / Actual result | Gözlənilən / faktiki nəticə | Olmalı olan və əslində olan davranış | 11 |
| Exploratory testing | Kəşfiyyat testi | Öyrənmə, dizayn və icranın eyni vaxtda getməsi | 7 |
| Failure | Nasazlıq | İstifadəçinin gördüyü yanlış davranış | 1 |
| Fixture | Test hazırlığı | Testə hazır obyekt verən və sonda təmizlik edən kod | 19 |
| Flaky test | Qeyri-sabit test | Kod dəyişmədən bəzən keçən, bəzən düşən test | 19 |
| Functional testing | Funksional test | Sistemin nə etdiyinin yoxlanması | 6 |
| Gherkin | Gherkin | Given–When–Then formatlı ssenari dili | 10 |
| Go/No-Go | Buraxılış qərarı | Relizin buraxılıb-buraxılmamasına dair görüş və qərar | 4 |
| Grey box testing | Boz qutu testi | Qismən daxili biliklə test | 7 |
| Hotfix | Təcili düzəliş | Canlıdakı ciddi problem üçün tez buraxılan kiçik dəyişiklik | 4 |
| HTTP status code | Status kodu | Sorğunun nəticəsini bildirən 3 rəqəmli kod | 13 |
| Impact analysis | Təsir analizi | Dəyişikliyin sistemin hansı hissələrinə toxunduğunu müəyyən etmək | 5 |
| Independence of testing | Testin müstəqilliyi | Testi müəllifdən başqasının aparması | 1 |
| Integration testing | İnteqrasiya testi | Modullar arası əlaqənin yoxlanması | 5 |
| JQL | JQL | Jira-da axtarış dili | 12 |
| JSON | JSON | API-lərdə ən çox işlənən data formatı | 15 |
| Load testing | Yük testi | Gözlənilən yükdə performansın yoxlanması | 6 |
| Locator | Lokator | Avtomatlaşdırmada elementi tapma yolu | 19 |
| Maintenance testing | Baxım testi | Canlıdakı sistemin dəyişikliklərinin testi | 5 |
| Mock / Stub | Saxta əvəzedici | Hazır olmayan komponentin yerinə işləyən imitasiya | 5 |
| Negative testing | Neqativ test | Yanlış data ilə sistemin reaksiyasını yoxlamaq | 7 |
| Non-functional testing | Qeyri-funksional test | Sistemin necə işlədiyinin yoxlanması | 6 |
| Page Object Model (POM) | Page Object modeli | Lokatorları və hərəkətləri səhifə class-larında saxlamaq | 19 |
| Pairwise testing | Cüt-cüt test | Parametrlərin bütün cütlərini əhatə etmək | 9 |
| Pesticide paradox | Pestisid paradoksu | Eyni testlərin yeni defekt tapmaması | 2 |
| Positive testing | Pozitiv test | Düzgün data ilə gözlənilən davranışı yoxlamaq | 7 |
| Precondition | İlkin şərt | Testdən əvvəl hazır olmalı olan vəziyyət | 11 |
| Priority | Prioritet | Defektin nə qədər tez düzəldilməli olduğu | 12 |
| Product / Project risk | Məhsul / layihə riski | Keyfiyyətlə bağlı risk / layihənin idarəsi ilə bağlı risk | 11 |
| Production (prod) | Canlı mühit | Real istifadəçilərin işlətdiyi sistem | 20 |
| Pull request (PR) | Birləşdirmə sorğusu | Budağı main-ə birləşdirmək üçün sorğu | 20 |
| QA / QC | Keyfiyyətin təminatı / keyfiyyətə nəzarət | Prosesi və məhsulu hədəf alan keyfiyyət fəaliyyəti | 1 |
| Regression testing | Reqressiya testi | Dəyişikliyin köhnə funksiyaları sındırmadığını yoxlamaq | 6 |
| Release | Reliz | Məhsulun yeni versiyasının buraxılışı | 3 |
| Requirement | Tələb | Sistemin nə etməli olduğunun təsviri | 10 |
| Retest (confirmation testing) | Təkrar yoxlama | Düzəldilmiş defektin yoxlanması | 6 |
| Retrospective | Retrospektiv | Komandanın prosesi yaxşılaşdırmaq üçün sprintin sonunda geriyə baxışı | 3 |
| Review | Nəzərdən keçirmə (review) | İş məhsulunu işə salmadan oxuyub defekt axtarmaq | 7 |
| Risk level | Risk səviyyəsi | Riskin ehtimalı ilə təsirinin hasili | 11 |
| Rollback | Geri qaytarma | Yeni versiyanı götürüb əvvəlki versiyanı qaytarmaq | 4 |
| Root cause | Kök səbəb | Səhvin baş verməsinin əsas səbəbi | 1 |
| RTM | Tələblərin izlənmə matrisi | Tələblər ilə test case-lərin əlaqə cədvəli | 10 |
| Sanity testing | Sanity test | Konkret dəyişikliyin dar və dərin yoxlanması | 6 |
| Scrum | Scrum | Sprintlərə əsaslanan Agile çərçivəsi | 3 |
| SDLC | Proqramın həyat dövrü | Proqramın ideyadan dəstəyə qədər mərhələləri | 3 |
| Severity | Ciddilik | Defektin texniki təsiri | 12 |
| Shift left | Sola sürüşdürmə | Testi SDLC-də mümkün qədər erkən başlatmaq | 2, 3 |
| Smoke testing | Smoke test | Yeni build-in əsas funksiyalarının qısa yoxlanması | 6 |
| Sprint | Sprint | Scrum-da 1–4 həftəlik iş dövrü | 3 |
| SQL | SQL | Verilənlər bazası ilə işləmək dili | 16 |
| Staging | Staging | İstehsala ən yaxın test mühiti | 20 |
| State transition testing | Vəziyyət keçidləri testi | Vəziyyətlərin və onlar arası keçidlərin yoxlanması | 9 |
| Statement coverage | Operator əhatəsi | İşə düşən icra olunan operatorların bütün operatorlara faizi | 7 |
| Static testing | Statik test | Proqramı işə salmadan yoxlama (review) | 7 |
| STLC | Testin həyat dövrü | Test işinin mərhələləri | 4 |
| Storage state | Giriş vəziyyəti | Fayla yazılan cookie və localStorage: testlər daxil olmuş halda başlayır | 19 |
| Stress testing | Stress testi | Limitdən yuxarı yükdə davranışın yoxlanması | 6 |
| System testing | Sistem testi | Bütöv sistemin yoxlanması | 5 |
| TDD | Testlə idarə olunan inkişaf | Əvvəl unit test, sonra onu keçirən kod: qırmızı → yaşıl → refaktor | 3 |
| Test basis | Test əsası | Testin çıxarıldığı mənbə: tələblər, user story, dizayn, kod | 4 |
| Test case | Test case (test keysi) | Konkret yoxlamanın addımları və gözlənilən nəticəsi | 11 |
| Test completion report | Yekun test hesabatı | Mərhələnin və ya relizin sonunda nəticələr, qalan risklər və dərslər | 4 |
| Test condition | Test şərti | Test olunacaq şey; “nə yoxlanılır” sualının cavabı | 4 |
| Test data | Test məlumatları | Testlərdə işlədilən məlumatlar | 11 |
| Test plan | Test planı | Nəyin, necə və kim tərəfindən test olunacağı | 11 |
| Test scenario | Test ssenarisi | Nəyin test olunacağının yüksək səviyyəli təsviri | 11 |
| Test suite | Test dəsti | Əlaqəli test case-lərin qrupu | 11 |
| Testing quadrants | Test kvadrantları | Test növlərini biznes/texnologiya və kömək/tənqid oxları ilə qruplaşdırmaq | 6 |
| Testware | Test materialları | Testin bütün iş məhsulları: plan, case, data, skript, hesabat | 1 |
| Three-point estimation | Üç nöqtəli qiymətləndirmə | Optimist, ən ehtimallı və pessimist qiymətdən: E = (a + 4m + b) / 6 | 11 |
| Trace viewer | Trace baxıcısı | Düşən testin hər addımını, ekranını və sorğularını göstərən alət | 19 |
| TypeScript | TypeScript | Tipləri olan JavaScript; kod işə düşmədən tsc ilə yoxlanır | 18 |
| UAT | İstifadəçi qəbul testi | Real istifadəçilərin apardığı qəbul testi | 5 |
| Unit testing | Unit (modul) testi | Ən kiçik kod hissəsinin yoxlanması | 5 |
| Usability testing | İstifadə rahatlığı testi | Məhsulun nə qədər asan işlədildiyinin yoxlanması | 6 |
| User story | İstifadəçi həkayəsi | “Bir \[rol\] kimi … istəyirəm ki …” formatında tələb | 10 |
| Verification / Validation | Yoxlama / təsdiqləmə | Tələbə uyğunluq / istifadəçi ehtiyacına uyğunluq | 1 |
| White box testing | Ağ qutu testi | Kodu bilərək test etmək | 7 |
| Whole team approach | Bütün komanda yanaşması | Keyfiyyətə bütün komandanın cavabdeh olması | 1 |
| Workaround | Müvəqqəti həll yolu | Defekt düzələnə qədər problemi keçmək üsulu | 12 |

## Əlavə B. Hazır şablonlar və checklist-lər

Bu əlavə gündəlik işdə dərhal istifadə edə biləcəyin şablonları və checklist-ləri toplayır. Checklist-ləri layihəyə uyğunlaşdır: lazımsız bəndləri sil, öz risklərini əlavə et.

### B.1. Test case şablonu

```markdown
ID: TC-<MODUL>-<NÖMRƏ>
Başlıq: <Modul>: <nəyi yoxlayır>
Modul / komponent:
Prioritet: High / Medium / Low
Tələbə istinad: <US və ya REQ nömrəsi>
İlkin şərtlər:
1.
Test data:
Addımlar:
1.
2.
Gözlənilən nəticə:
1.
Faktiki nəticə:
Status: Passed / Failed / Blocked / Not run
Qeyd:
```

### B.2. Bug report şablonu

```markdown
Başlıq: [Harada] + [nə baş verir] + [hansı şərtdə]
Mühit: OS, brauzer və versiya, cihaz, build, server
Severity: Blocker / Critical / Major / Minor / Trivial
Priority (təklif): High / Medium / Low
İlkin şərtlər:
Təkrarlama addımları:
1.
2.
3.
Gözlənilən nəticə: (tələbə istinadla)
Faktiki nəticə:
Təkrarlanma tezliyi: x/y
Əlavələr: ekran şəkli, video, konsol xətası, sorğu və cavab
```

### B.3. Exploratory sessiya şablonu

```markdown
Charter: <Nəyi> kəşf et, <nəyə> fokuslan, məqsəd — <hansı riskləri tapmaq>
Timebox: 60 dəqiqə
Mühit və build:
Yoxladıqlarım:
Tapılan defektlər:
Suallar və risklər:
Növbəti sessiya üçün ideyalar:
```

### B.4. Yekun hesabat (test summary report) şablonu

```markdown
Layihə / reliz:
Test dövrü: <başlanğıc> – <son>
Scope: nə test olundu, nə olunmadı
Nəticələr: planlaşdırılan / icra olunan / keçən / düşən / bloklanan test case-lər
İcra faizi və pass rate:
Defektlər: ciddiliyə görə; açıq və bağlı
Açıq risklər:
Tövsiyə: relizə hazırdır / şərtlə hazırdır / hazır deyil
```

### B.5. Checklist: login

- [ ] Düzgün email və şifrə ilə giriş
- [ ] Yanlış şifrə — ümumi xəta mesajı
- [ ] Qeydiyyatda olmayan email — eyni ümumi mesaj
- [ ] Boş email, boş şifrə, hər ikisi boş
- [ ] Email böyük-kiçik hərfə həssas deyil
- [ ] Email-in əvvəlində və sonunda boşluq
- [ ] Şifrə gizli göstərilir, “göstər” ikonu işləyir
- [ ] Enter ilə göndərmə
- [ ] “Məni yadda saxla” — brauzeri bağlayıb açanda
- [ ] Bir neçə səhv cəhddən sonra blok və ya captcha
- [ ] Logout-dan sonra “Geri” düyməsi şəxsi səhifəni açmır
- [ ] Sessiyanın vaxtı bitəndə yenidən giriş tələb olunur
- [ ] Login səhifəsi HTTPS üzərindən açılır

### B.6. Checklist: qeydiyyat forması

- [ ] Bütün məcburi sahələr doldurulanda qeydiyyat uğurludur
- [ ] Hər məcburi sahə boş qalanda öz xəta mesajı çıxır
- [ ] Email formatı: @ yoxdur, domen yoxdur, boşluq var
- [ ] Artıq qeydiyyatda olan email
- [ ] Şifrə qaydaları: minimum və maksimum uzunluq (BVA), tələb olunan simvollar
- [ ] Şifrə və onun təkrarı uyğun deyil
- [ ] Ad sahəsi: Azərbaycan hərfləri, defis, apostrof, çox uzun ad
- [ ] Telefon: +994 formatı, boşluqlu yazılış, hərflər
- [ ] Şərtlərlə razılıq işarələnməyibsə, qeydiyyat olmur
- [ ] Qeydiyyatdan sonra təsdiq emaili gəlir, link işləyir
- [ ] Düyməni iki dəfə tez basanda iki hesab yaranmır
- [ ] Tab sırası məntiqlidir, sahələrin label-i var
- [ ] Mobil ekranda forma rahat doldurulur

### B.7. Checklist: axtarış

- [ ] Tam ad, adın bir hissəsi, səhv yazılış
- [ ] Nəticə olmayanda aydın mesaj
- [ ] Boş axtarış və yalnız boşluqlar
- [ ] Böyük-kiçik hərf və Azərbaycan hərfləri (İ/i, I/ı, ə, ş, ç)
- [ ] Xüsusi simvollar adi mətn kimi göstərilir
- [ ] Çox uzun sorğu
- [ ] Filtr və sıralama ilə birlikdə işləmə
- [ ] Səhifələmə (pagination)
- [ ] Cavab müddəti məqbuldur

### B.8. Checklist: fayl yükləmə

- [ ] İcazə verilən formatlar yüklənir
- [ ] İcazə verilməyən format rədd olunur, aydın mesaj çıxır
- [ ] Maksimum ölçü: sərhəddən bir az kiçik, düz sərhəd, bir az böyük
- [ ] Boş (0 bayt) fayl
- [ ] Faylın adında boşluq, Azərbaycan hərfləri, çox uzun ad
- [ ] Uzantısı dəyişdirilmiş fayl (məsələn, .exe faylının adı .jpg edilib)
- [ ] Yükləmə zamanı internet kəsilir
- [ ] Eyni faylı iki dəfə yükləmək
- [ ] Yükləmə prosesi göstərilir, ləğv etmək olur
- [ ] Mobil cihazda kameradan və qalereyadan yükləmə

### B.9. Checklist: ödəniş (checkout)

- [ ] Səbətin cəmi, endirim, çatdırılma və vergi düzgün hesablanır
- [ ] Kəsr məbləğlərdə yuvarlaqlaşdırma düzgündür
- [ ] Promo kod: düzgün, yanlış, müddəti bitmiş, iki kod birlikdə
- [ ] Məcburi ünvan və əlaqə sahələri
- [ ] Ödəniş uğurlu olanda sifariş yaranır, təsdiq göstərilir və emaillə gəlir
- [ ] Ödəniş rədd ediləndə sifariş yaranmır, aydın mesaj çıxır
- [ ] “Ödə” düyməsini iki dəfə basanda pul iki dəfə çıxılmır
- [ ] Ödəniş zamanı “Geri” düyməsi və ya səhifəni yeniləmək
- [ ] Sessiyanın vaxtı ödəniş zamanı bitəndə
- [ ] Bazada sifarişin məbləği və statusu ekrandakı ilə eynidir (SQL)

### B.10. Checklist: mobil tətbiq

- [ ] Quraşdırma, yeniləmə (data qalır), silmə
- [ ] Zəng, SMS, bildiriş gələndə vəziyyət qorunur
- [ ] Şəbəkəsiz rejim, zəif şəbəkə, Wi-Fi ↔ mobil internet keçidi
- [ ] Fona salıb qayıtmaq
- [ ] Portret ↔ albom
- [ ] İcazələr rədd ediləndə davranış
- [ ] Müxtəlif ekran ölçüləri və OS versiyaları
- [ ] Qaranlıq rejim və böyük şrift
- [ ] Batareya sərfi və qızma
- [ ] Push bildiriş və deep link

### B.11. Checklist: API endpoint

- [ ] Düzgün sorğu — gözlənilən status və data
- [ ] Cavabın quruluşu və data tipləri
- [ ] Məcburi sahə yoxdur — 400 və ya 422
- [ ] Yanlış tip və format — 400 və ya 422
- [ ] Token yoxdur və ya yanlışdır — 401
- [ ] Başqasının resursu — 403 və ya 404
- [ ] Mövcud olmayan ID — 404
- [ ] Yanlış metod — 405
- [ ] Böyük data, boş gövdə — 500 olmamalıdır
- [ ] Azərbaycan hərfləri düzgün saxlanır və qaytarılır
- [ ] Cavab müddəti limit daxilindədir
