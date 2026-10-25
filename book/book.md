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
| Sənin növbən | Oxşar tapşırıqlar, cavabsız | Öyrəndiyini özün tətbiq etmək |
| Özünü yoxla | Fəsil üzrə qısa suallar | Boşluqları tapmaq |

“Sənin növbən” tapşırıqlarının cavabları kitabda yoxdur, bu bilərəkdən belədir. Həll edəndən sonra cavabını mənə göndər — yoxlayıb rəy verəcəyəm.

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

QA (Quality Assurance — keyfiyyətin təminatı) məhsulun keyfiyyətli çıxması üçün görülən bütün işlərdir. Test (testing) isə onun bir hissəsidir: proqramı yoxlayıb problemləri tapmaq.

### 1.1. Test nədir

Test — proqramın gözlənildiyi kimi işləyib-işləmədiyini yoxlamaq və problemləri tapmaq prosesidir. Avtomobil zavodunu düşün: hər maşın satışa çıxmazdan əvvəl yoxlanılır — əyləc, işıqlar, mühərrik. Proqram da istifadəçiyə çatmazdan əvvəl yoxlanılır.

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

Testing QC-nin içindədir, QC isə QA-nın içində. Praktikada “QA engineer” deyəndə çox vaxt tester nəzərdə tutulur, amma yaxşı QA mütəxəssisi yalnız baq tapmır — prosesin özünü də yaxşılaşdırır.

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

Yaxşı tester-in keyfiyyətləri: diqqət, maraq, məntiq, səbr, istifadəçi kimi düşünmək və ünsüiyyət — defekti kimisə incitmədən, faktlarla izah etmək bacarığı.

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

### 4.5. Agile-da STLC

Scrum-da bu 6 mərhələ hər sprintdə kiçik miqyasda təkrarlanır. Sprint planning-də analiz və planlaşdırma, sprint boyu dizayn və icra, retrospektivdə bağlanış və dərslər olur. Mərhələlər qısadır və bir-birinə qarışır, amma məntiq eynidir.

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

Test səviyyələri sistemin hansı miqyasda yoxlandığını göstərir: ən kiçik kod parçasından tutmuş bütöv məhsulun müştəri tərəfindən qəbuluna qədər. Dörd səviyyə var: unit, inteqrasiya, sistem və qəbul testi.

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

White box — kodu bilərək, kodun daxili yollarını yoxlayaraq test etməkdir. Adətən proqramçılar edir (unit testlər).

Burada əsas anlayış **coverage (əhatə)** — testlərin kodun nə qədərini işə salmasıdır:

- **Statement coverage (operator əhatəsi)** — kodun hər sətri ən azı bir dəfə işə düşübmü?
- **Branch coverage (budaq əhatəsi)** — hər `if`-in həm “doğru”, həm “yalan” yolu işə düşübmü?

```javascript
function getShippingCost(total) {
  if (total >= 50) {
    return 0;   // 50 AZN və yuxarı: pulsuz
  }
  return 3;     // qalan hallarda 3 AZN
}
```

Yalnız `getShippingCost(80)` testi olsa, `return 3` sətri heç vaxt işə düşmür. Bu halda branch coverage 50%-dir. `getShippingCost(20)` testini də əlavə edəndə hər iki yol işləyir: statement və branch coverage 100% olur.

### 7.3. Grey box (boz qutu)

Grey box — qismən biliklə test etməkdir: kodu bilmirsən, amma sistemin quruluşunu (verilənlər bazası, API) bilirsən.

**Misal.** Saytda sifariş verirsən (black box), sonra SQL ilə bazada sifarişin düzgün yazıldığını yoxlayırsan (Fəsil 16). Ya da UI-də görünməyən xətanı brauzerin Network panelində tapırsan.

Müasir manual tester-lərin çoxu əslində grey box işləyir.

### 7.4. Statik və dinamik test

- **Statik test** — proqramı işə salmadan yoxlamaq: tələbləri, dizaynı, sənədləri, kodu oxumaq və nəzərdən keçirmək.
- **Dinamik test** — proqramı işə salaraq yoxlamaq: düymələri basmaq, sorğu göndərmək, avtomatik testləri işə salmaq.

Statik testin əsas forması review-dur (nəzərdən keçirmə):

| Növ | Necədir | Misal |
| --- | --- | --- |
| Informal review | Planlaşdırılmamış, sadə | Həmkara “bu test case-ə bir bax” demək |
| Walkthrough | Müəllif sənədi komandaya izah edir | Analitik tələbləri komandaya oxuyur, suallar verilir |
| Technical review | Mütəxəssislər texniki həlli qiymətləndirir | Arxitekturanın müzakirəsi |
| Inspection | Ən formal növ: rollar, qaydalar, qeydlər, metriklər | Tibbi proqramın tələb sənədinin rəsmi yoxlanması |

Statik analiz alətləri kodu avtomatik yoxlayır: məsələn, ESLint JavaScript kodunda şübhəli yerləri göstərir. Statik testin əsas üstünlüyü defekti kod yazılmazdan əvvəl tapmasıdır (Prinsip 3).

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
- **Sonda:** tapılan baqlar, risklər, növbəti sessiya üçün ideyalar.

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

- **2 dəyərli BVA** — hər sərhəd üçün sərhədin özü və ondan kənardakı qonşu.
- **3 dəyərli BVA** — sərhədin özü və hər iki qonşusu.

| Sərhəd | 2 dəyərli BVA | 3 dəyərli BVA |
| --- | --- | --- |
| Aşağı sərhəd (18) | 17, 18 | 17, 18, 19 |
| Yuxarı sərhəd (60) | 60, 61 | 59, 60, 61 |

Gözlənilən nəticə: 17 → xəta, 18 → qəbul, 19 → qəbul, 59 → qəbul, 60 → qəbul, 61 → xəta.

**Addım-addım:**

1. EP ilə sinifləri tap.
2. Hər sinfin minimum və maksimum dəyərini — sərhədlərini müəyyən et.
3. Addımı müəyyən et: tam ədədlərdə 1, pulda 0,01, mətn uzunluğunda 1 simvol.
4. Hər sərhəd üçün sərhədi və qonşu(lar)ı seç.
5. Gözlənilən nəticəni yaz.

**Misal 2 — şifrə uzunluğu.** Tələb: “Şifrə 8–20 simvol olmalıdır.” Addım 1 simvoldur. 2 dəyərli BVA: 7 (xəta), 8 (qəbul), 20 (qəbul), 21 (xəta). 3 dəyərli BVA-da 9 və 19 da əlavə olunur. Uzun mətnləri əllə saymamaq üçün onlayn simvol sayğacından istifadə et.

**Misal 3 — kəsr ədədlər.** Tələb: “50 AZN və yuxarı sifarişdə çatdırılma pulsuzdur.” Burada addım 1 qəpikdir (0,01). Sərhəd dəyərləri: 49,99 → çatdırılma ödənişli; 50,00 → pulsuz. 3 dəyərli BVA üçün 50,01 də əlavə olunur.

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
2. Etibarlı keçidlər — hər biri bir test:

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

Acceptance criteria — user story-nin “hazır” sayılması üçün ödənməli olan konkret şərtlərdir. Tester test case-ləri məhz bunlardan çıxarır. İki yazılış forması var.

**Siyahı forması:**

- Sıralama seçimləri: “Ucuzdan bahaya”, “Bahadan ucuza”.
- Default sıralama: “Populyarlığa görə”.
- Sıralama seçilmiş filtrləri sıfırlamır.
- Seçilmiş sıralama səhifə yenilənəndə qalır.

**Gherkin forması (Given–When–Then):**

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

| Bölmə | Nə yazılır | Misal |
| --- | --- | --- |
| Məqsəd | Planın nə üçün olduğu | Mobil bankın 3.2 relizinin testi |
| Scope (əhatə) | Nə test olunur və nə olunmur | Daxil: köçürmələr, kommunal ödənişlər. Xaric: kredit modulu |
| Yanaşma | Səviyyələr, növlər, texnikalar | Sistem testi, regression, API testi; EP, BVA |
| Mühit | Server, cihazlar, brauzerlər | Test serveri; Android və iOS-un son iki versiyası |
| Rollar | Kim nəyə cavabdehdir | QA lead — plan, 2 tester — icra |
| Cədvəl | Mərhələlər və müddətlər | Test dizaynı — 2 gün, icra — 5 gün |
| Giriş və çıxış meyarları | Nə vaxt başlayır və bitir | Fəsil 4-ə bax |
| Risklər | Nə pis gedə bilər və ehtiyat planı | Test mühiti gec hazır olarsa, icra 2 gün sürüşür |
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

Avtomatlaşdırma, Postman skriptləri və Playwright testləri üçün JavaScript-in əsasları kifayətdir: dəyişənlər, şərtlər, funksiyalar, massivlər, obyektlər və async/await. Bu fəsildə hər anlayışı tester gözü ilə, kiçik nümunələrlə öyrənəcəyik.

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

### Diqqət: tez-tez edilən səhvlər

- **`==` yazmaq.** Həmişə `===`.
- **`await`-i unutmaq.** Kod gözləmədən irəli qaçır, test təsadüfi düşür.
- **Massivdə indeksin 0-dan başladığını unutmaq.**
- **Pul hesablamalarında kəsr ədədlərə güvənmək.** `0.1 + 0.2` nəticəsi 0.3 yox, 0.30000000000000004-dür. Bu, real defekt mənbəyidir.

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

### Özünü yoxla

- let və const fərqi nədir?
- == və === fərqi nədir?
- filter, map və find nə edir?
- await nə üçün lazımdır?
- Niyə 0.1 + 0.2 !== 0.3?

## Fəsil 19. Avtomatlaşdırma: test piramidası, Playwright ilə ilk test, Cypress və Selenium

Avtomatlaşdırma təkrarlanan yoxlamaları koda tapşırmaqdır: regression testləri hər dəyişiklikdən sonra dəqiqələr ərzində, insansız işləyir. Bu fəsildə nəyi avtomatlaşdırmaq lazım olduğunu, test piramidasını və Playwright ilə ilk real testi yazmağı öyrənəcəksən.

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

Testlər çoxaldıqca eyni lokatorlar hər yerdə təkrarlanır. Login düyməsinin lokatoru dəyişsə, 50 testi düzəltmək lazım gələcək. POM bunu həll edir: hər səhifə üçün bir class yaradılır, lokatorlar və hərəkətlər orada bir dəfə yazılır.

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

### Diqqət: tez-tez edilən səhvlər

- **`await`-i unutmaq.** Test gözləmədən irəli qaçır.
- **Sabit gözləmələr (`waitForTimeout`).** Testi yavaşladır və yenə də flaky edir.
- **Hər şeyi UI ilə test etmək.** API ilə yoxlana bilən şeyi API ilə yoxla — piramidanı xatırla.
- **Testləri bir-birinə bağlamaq.** Birinci test istifadəçi yaradır, ikincisi onu işlədirsə, birinci düşəndə hamısı düşür.

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

### Özünü yoxla

- Hansı testləri avtomatlaşdırmaq lazımdır, hansıları yox?
- Test piramidası nəyi göstərir? “Dondurma qabı” nədir?
- Tövsiyə olunan lokator sırası necədir və niyə?
- Auto-waiting nədir?
- Flaky test nədir və səbəbləri hansılardır?

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
| Severity və priority fərqi? | Severity — defektin texniki təsiri, priority — düzəlişin təcilliyi. Misal: şirkət adının səhv yazılması — aşağı severity, yüksək priority. |
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
4. Cədvəldəki 12 sualdan 5-nə öz sözlərinlə cavab yaz və mənə göndər — yoxlayıb rəy verərəm.
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
| Black box testing | Qara qutu testi | Kodu bilmədən, giriş və çıxışa görə test | 7 |
| Blocker | Bloklayıcı defekt | İşi və testi tamamilə dayandıran defekt | 12 |
| Boundary Value Analysis (BVA) | Sərhəd dəyərlərinin analizi | Sərhədləri və qonşu dəyərləri yoxlamaq | 8 |
| Branch | Budaq | Git-də paralel iş xətti | 20 |
| Bug / Defect | Baq / defekt | Kodda və ya sənəddə qüsur | 1 |
| Bug life cycle | Defektin həyat dövrü | Defektin keçdiyi statuslar | 12 |
| Bug report | Defekt hesabatı | Defekt haqqında sənəd | 12 |
| Build | Yığım | Proqramın test üçün hazırlanmış versiyası | 6 |
| Checklist | Yoxlama siyahısı | Yoxlanacaq bəndlərin qısa siyahısı | 11 |
| CI/CD | Davamlı inteqrasiya və çatdırılma | Hər dəyişiklikdən sonra avtomatik build, test və yerləşdirmə | 20 |
| Commit | Commit | Git-də yadda saxlanmış dəyişiklik | 20 |
| Compatibility testing | Uyğunluq testi | Müxtəlif brauzer, OS və cihazlarda yoxlama | 6, 14 |
| Cookie | Cookie | Serverin brauzerdə saxladığı kiçik məlumat | 13 |
| Coverage | Əhatə | Testlərin kodu və ya tələbləri nə qədər əhatə etməsi | 7 |
| CRUD | CRUD | Create, Read, Update, Delete — data ilə 4 əsas əməliyyat | 13 |
| Decision table | Qərar cədvəli | Şərt kombinasiyalarını və nəticələri göstərən cədvəl | 9 |
| Defect clustering | Defektlərin qruplaşması | Defektlərin az sayıda modulda toplanması | 2 |
| Definition of Done (DoD) | “Hazır” anlayışı | Tapşırığın bitmiş sayılması şərtləri | 3 |
| Deployment | Yerləşdirmə | Məhsulun serverə və istifadəçilərə çatdırılması | 3 |
| DevTools | Tərtibatçı alətləri | Brauzerin daxili analiz alətləri (F12) | 13 |
| Duplicate | Dublikat | Artıq yazılmış defektin təkrarı | 12 |
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
| Flaky test | Qeyri-sabit test | Kod dəyişmədən bəzən keçən, bəzən düşən test | 19 |
| Functional testing | Funksional test | Sistemin nə etdiyinin yoxlanması | 6 |
| Gherkin | Gherkin | Given–When–Then formatlı ssenari dili | 10 |
| Grey box testing | Boz qutu testi | Qismən daxili biliklə test | 7 |
| HTTP status code | Status kodu | Sorğunun nəticəsini bildirən 3 rəqəmli kod | 13 |
| Integration testing | İnteqrasiya testi | Modullar arası əlaqənin yoxlanması | 5 |
| JQL | JQL | Jira-da axtarış dili | 12 |
| JSON | JSON | API-lərdə ən çox işlənən data formatı | 15 |
| Load testing | Yük testi | Gözlənilən yükdə performansın yoxlanması | 6 |
| Locator | Lokator | Avtomatlaşdırmada elementi tapma yolu | 19 |
| Mock / Stub | Saxta əvəzedici | Hazır olmayan komponentin yerinə işləyən imitasiya | 5 |
| Negative testing | Neqativ test | Yanlış data ilə sistemin reaksiyasını yoxlamaq | 7 |
| Non-functional testing | Qeyri-funksional test | Sistemin necə işlədiyinin yoxlanması | 6 |
| Page Object Model (POM) | Page Object modeli | Lokatorları və hərəkətləri səhifə class-larında saxlamaq | 19 |
| Pairwise testing | Cüt-cüt test | Parametrlərin bütün cütlərini əhatə etmək | 9 |
| Pesticide paradox | Pestisid paradoksu | Eyni testlərin yeni defekt tapmaması | 2 |
| Positive testing | Pozitiv test | Düzgün data ilə gözlənilən davranışı yoxlamaq | 7 |
| Precondition | İlkin şərt | Testdən əvvəl hazır olmalı olan vəziyyət | 11 |
| Priority | Prioritet | Defektin nə qədər tez düzəldilməli olduğu | 12 |
| Production (prod) | Canlı mühit | Real istifadəçilərin işlətdiyi sistem | 20 |
| Pull request (PR) | Birləşdirmə sorğusu | Budağı main-ə birləşdirmək üçün sorğu | 20 |
| QA / QC | Keyfiyyətin təminatı / keyfiyyətə nəzarət | Prosesi və məhsulu hədəf alan keyfiyyət fəaliyyəti | 1 |
| Regression testing | Reqressiya testi | Dəyişikliyin köhnə funksiyaları sındırmadığını yoxlamaq | 6 |
| Release | Reliz | Məhsulun yeni versiyasının buraxılışı | 3 |
| Requirement | Tələb | Sistemin nə etməli olduğunun təsviri | 10 |
| Retest (confirmation testing) | Təkrar yoxlama | Düzəldilmiş defektin yoxlanması | 6 |
| RTM | Tələblərin izlənmə matrisi | Tələblər ilə test case-lərin əlaqə cədvəli | 10 |
| Sanity testing | Sanity test | Konkret dəyişikliyin dar və dərin yoxlanması | 6 |
| Scrum | Scrum | Sprintlərə əsaslanan Agile çərçivəsi | 3 |
| SDLC | Proqramın həyat dövrü | Proqramın ideyadan dəstəyə qədər mərhələləri | 3 |
| Severity | Ciddilik | Defektin texniki təsiri | 12 |
| Smoke testing | Smoke test | Yeni build-in əsas funksiyalarının qısa yoxlanması | 6 |
| Sprint | Sprint | Scrum-da 1–4 həftəlik iş dövrü | 3 |
| SQL | SQL | Verilənlər bazası ilə işləmək dili | 16 |
| Staging | Staging | İstehsala ən yaxın test mühiti | 20 |
| State transition testing | Vəziyyət keçidləri testi | Vəziyyətlərin və onlar arası keçidlərin yoxlanması | 9 |
| Static testing | Statik test | Proqramı işə salmadan yoxlama (review) | 7 |
| STLC | Testin həyat dövrü | Test işinin mərhələləri | 4 |
| Stress testing | Stress testi | Limitdən yuxarı yükdə davranışın yoxlanması | 6 |
| System testing | Sistem testi | Bütöv sistemin yoxlanması | 5 |
| Test case | Test case (test keysi) | Konkret yoxlamanın addımları və gözlənilən nəticəsi | 11 |
| Test data | Test məlumatları | Testlərdə işlədilən məlumatlar | 11 |
| Test plan | Test planı | Nəyin, necə və kim tərəfindən test olunacağı | 11 |
| Test scenario | Test ssenarisi | Nəyin test olunacağının yüksək səviyyəli təsviri | 11 |
| Test suite | Test dəsti | Əlaqəli test case-lərin qrupu | 11 |
| UAT | İstifadəçi qəbul testi | Real istifadəçilərin apardığı qəbul testi | 5 |
| Unit testing | Unit (modul) testi | Ən kiçik kod hissəsinin yoxlanması | 5 |
| Usability testing | İstifadə rahatlığı testi | Məhsulun nə qədər asan işlədildiyinin yoxlanması | 6 |
| User story | İstifadəçi həkayəsi | “Bir \[rol\] kimi … istəyirəm ki …” formatında tələb | 10 |
| Verification / Validation | Yoxlama / təsdiqləmə | Tələbə uyğunluq / istifadəçi ehtiyacına uyğunluq | 1 |
| White box testing | Ağ qutu testi | Kodu bilərək test etmək | 7 |
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
