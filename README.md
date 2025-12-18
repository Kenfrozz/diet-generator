# DetoksBot - Diyet Programı Oluşturucu

Diyetisyenler için öğün havuzlarından kişiselleştirilmiş diyet programları oluşturup PDF olarak dışa aktaran masaüstü uygulaması.

---

## 🎯 Özellikler

- **Diyet Programı Oluşturma**: Öğün havuzlarından rastgele tarif seçerek kişiselleştirilmiş diyet programları oluşturma
- **BKİ Bazlı Tarifler**: Her tarif 4 farklı BKİ grubu için özelleştirilebilir içerik sunar
- **PDF Dışa Aktarma**: Türkçe karakter destekli profesyonel PDF çıktısı
- **Diyet Kalıpları**: Özelleştirilebilir öğün zamanlaması ve yapısı
- **İki Öğün Havuzu**: Normal ve Hastalık olmak üzere ayrı tarif havuzları
- **Arama ve Filtreleme**: Tablolarda anlık arama özelliği
- **Veritabanı Yedekleme**: SQLite veritabanını içe/dışa aktarma

---

## 📁 Proje Yapısı

```
detoksbot/
├── main.py                 # Uygulama giriş noktası
├── database.py             # SQLite veritabanı yönetimi
├── pdf_generator.py        # PDF oluşturma modülü
├── populate_db.py          # Örnek veri ekleme scripti
├── requirements.txt        # Python bağımlılıkları
│
├── ui/                     # Kullanıcı arayüzü modülleri
│   ├── __init__.py
│   ├── main_window.py      # Ana pencere ve sidebar
│   ├── diet_creator.py     # Diyet oluşturma sekmesi
│   ├── diet_templates.py   # Diyet kalıpları yönetimi
│   ├── meal_pool.py        # Öğün havuzu yönetimi
│   └── settings.py         # Ayarlar sekmesi
│
├── assets/
│   └── icons/              # Uygulama ikonları (13 adet)
│
└── data/
    └── detoksbot.db        # SQLite veritabanı
```

---

## 🛠 Teknoloji Stack

| Teknoloji     | Amaç                   |
| ------------- | ---------------------- |
| **Python 3**  | Ana programlama dili   |
| **PyQt6**     | Masaüstü GUI framework |
| **SQLite**    | Veritabanı             |
| **ReportLab** | PDF oluşturma          |

---

## 📋 Veritabanı Şeması

### `recipes` - Tarifler

| Alan        | Tür     | Açıklama                                                       |
| ----------- | ------- | -------------------------------------------------------------- |
| id          | INTEGER | Primary Key                                                    |
| name        | TEXT    | Tarif adı                                                      |
| meal_type   | TEXT    | Öğün türü (kahvalti, ogle, aksam, ara_ogun_1/2/3, ozel_icecek) |
| pool_type   | TEXT    | Havuz türü (normal, hastalik)                                  |
| bki_21_25   | TEXT    | 21-25 BKİ grubu tarif metni                                    |
| bki_26_29   | TEXT    | 26-29 BKİ grubu tarif metni                                    |
| bki_30_33   | TEXT    | 30-33 BKİ grubu tarif metni                                    |
| bki_34_plus | TEXT    | 34+ BKİ grubu tarif metni                                      |

### `diet_templates` - Diyet Kalıpları

| Alan | Tür     | Açıklama    |
| ---- | ------- | ----------- |
| id   | INTEGER | Primary Key |
| name | TEXT    | Kalıp adı   |

### `template_meals` - Kalıp Öğünleri

| Alan        | Tür     | Açıklama            |
| ----------- | ------- | ------------------- |
| id          | INTEGER | Primary Key         |
| template_id | INTEGER | FK → diet_templates |
| time        | TEXT    | Öğün saati (HH:mm)  |
| meal_name   | TEXT    | Öğün görünen adı    |
| meal_type   | TEXT    | Öğün türü           |
| sort_order  | INTEGER | Sıralama            |

### `settings` - Ayarlar

| Alan  | Tür  | Açıklama      |
| ----- | ---- | ------------- |
| key   | TEXT | Ayar anahtarı |
| value | TEXT | Ayar değeri   |

---

## 🥗 Öğün Türleri

| Key           | Görünen Ad   |
| ------------- | ------------ |
| `kahvalti`    | Kahvaltı     |
| `ara_ogun_1`  | Ara Öğün 1   |
| `ogle`        | Öğle Yemeği  |
| `ara_ogun_2`  | Ara Öğün 2   |
| `aksam`       | Akşam Yemeği |
| `ara_ogun_3`  | Ara Öğün 3   |
| `ozel_icecek` | Özel İçecek  |

---

## 🏥 BKİ Grupları

| Grup      | Aralık          |
| --------- | --------------- |
| 21-25 BKİ | Normal kilolu   |
| 26-29 BKİ | Fazla kilolu    |
| 30-33 BKİ | Obez (Sınıf 1)  |
| 34+ BKİ   | Obez (Sınıf 2+) |

---

## 🖥 Uygulama Sekmeleri

### 1. Diyet Oluştur

- Havuz türü seçimi (Normal/Hastalık)
- Diyet kalıbı seçimi
- BKİ grubu seçimi
- Hariç tutulacak malzemeler
- PDF dosya adı belirleme
- Diyet programı oluştur ve PDF kaydet

### 2. Diyet Kalıpları

- Kalıp listesi (arama özellikli)
- Yeni kalıp ekleme
- Kalıp düzenleme/silme
- Öğün zamanı, adı ve türü belirleme

### 3. Normal Öğün Havuzu

- Normal tarifler listesi (arama özellikli)
- Öğün türüne göre filtreleme
- Tarif ekleme/düzenleme/silme
- 4 BKİ grubu için farklı içerikler

### 4. Hastalık Öğün Havuzu

- Hastalık tarifleri listesi
- Normal havuz ile aynı özellikler

### 5. Ayarlar

- Diyet programı gün sayısı (1-30)
- PDF kayıt yolu
- Veritabanı dışa/içe aktarma

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler

```bash
pip install PyQt6 reportlab
```

### Çalıştırma

```bash
python main.py
```

---

## 📄 PDF Çıktısı

Oluşturulan PDF şunları içerir:

- Başlık: "Kişisel Diyet Programı"
- Alt başlık: Kalıp adı, Havuz türü, BKİ grubu
- Her gün için ayrı bölüm
- Öğün saati, öğün adı ve tarif detayları

---

## 🔧 Modül Detayları

### `main.py`

Uygulamanın giriş noktası. Veritabanını başlatır ve PyQt6 uygulamasını çalıştırır.

### `database.py`

SQLite veritabanı işlemlerini yönetir:

- Tarif CRUD işlemleri
- Kalıp CRUD işlemleri
- Ayar yönetimi
- Varsayılan kalıplar oluşturma

### `pdf_generator.py`

ReportLab ile PDF oluşturma:

- Türkçe karakter desteği (Arial/Calibri/Segoe UI)
- Profesyonel stil şablonları
- Günlük öğün tabloları

### `ui/main_window.py`

Ana pencere yönetimi:

- Daraltılabilir sidebar
- Sekme navigasyonu
- 5 ana sekme

### `ui/diet_creator.py`

Diyet oluşturma arayüzü:

- Seçim formları
- Rastgele tarif atama
- PDF oluşturma

### `ui/diet_templates.py`

Kalıp yönetimi:

- Kalıp listesi (arama özellikli)
- Öğün ekleme/düzenleme dialogu

### `ui/meal_pool.py`

Tarif yönetimi:

- Tarif listesi (arama ve filtre)
- Tarif ekleme/düzenleme dialogu
- Normal ve Hastalık havuzları için ortak widget

### `ui/settings.py`

Ayarlar yönetimi:

- Genel uygulama ayarları
- Veritabanı yedekleme

---

## 👤 Kullanıcı Akışı Örneği

### Senaryo: Yeni Bir Danışan İçin Diyet Programı Hazırlama

#### Adım 1: Tarif Ekleme (İlk Kullanım)

```
1. Uygulamayı başlat: python main.py
2. Soldaki menüden "Normal Öğün Havuzu" sekmesine tıkla
3. "Yeni Tarif Ekle" butonuna tıkla
4. Dialog açılır:
   - Tarif Adı: "Zeytinyağlı Enginar"
   - Öğün Türü: "Öğle Yemeği" seç
   - Havuz: Normal (otomatik)
   - 21-25 BKİ: "2 adet enginar, 1 yemek kaşığı zeytinyağı..."
   - 26-29 BKİ: "1.5 adet enginar, 1 tatlı kaşığı zeytinyağı..."
   - 30-33 BKİ: "1 adet enginar, az yağ..."
   - 34+ BKİ: "1 adet enginar, yağsız..."
5. "Kaydet" butonuna bas
6. Tarif listede görünür ✓
```

#### Adım 2: Diyet Kalıbı Oluşturma

```
1. "Diyet Kalıpları" sekmesine geç
2. "Yeni Kalıp Ekle" butonuna tıkla
3. Kalıp Adı: "5 Öğünlü Standart"
4. Öğünleri ekle:
   - 08:00 | Kahvaltı | Kahvaltı
   - 10:30 | Kuşluk | Ara Öğün 1
   - 12:30 | Öğle | Öğle Yemeği
   - 15:30 | İkindi | Ara Öğün 2
   - 19:00 | Akşam | Akşam Yemeği
5. "Kaydet" butonuna bas
```

#### Adım 3: Diyet Programı Oluşturma

```
1. "Diyet Oluştur" sekmesine geç
2. Ayarları yap:
   - Havuz Türü: "Normal"
   - Diyet Kalıbı: "5 Öğünlü Standart"
   - BKİ Grubu: "26-29 BKİ" (danışanın BKİ'sine göre)
   - Hariç Tut: "ceviz, fındık" (alerjisi varsa)
   - Dosya Adı: "ayse_hanim_diyet"
3. "Diyet Programı Oluştur" butonuna bas
4. PDF kaydetme dialogu açılır
5. Konum seç ve "Kaydet" de
6. PDF oluşturuldu mesajı görünür ✓
```

#### Adım 4: PDF Çıktısı

```
Oluşturulan PDF içeriği:

┌─────────────────────────────────────────┐
│     KİŞİSEL DİYET PROGRAMI              │
│  Kalıp: 5 Öğünlü | Havuz: Normal        │
│            26-29 BKİ                    │
├─────────────────────────────────────────┤
│ 📅 1. Gün                               │
├─────────────────────────────────────────┤
│ 08:00 | Kahvaltı | 2 dilim tam buğday...│
│ 10:30 | Kuşluk   | 1 avuç badem...      │
│ 12:30 | Öğle     | Zeytinyağlı enginar..│
│ 15:30 | İkindi   | 1 kase yoğurt...     │
│ 19:00 | Akşam    | Izgara tavuk göğsü...│
├─────────────────────────────────────────┤
│ 📅 2. Gün                               │
│ ...                                     │
└─────────────────────────────────────────┘
```

---

### Diğer Yaygın İşlemler

#### Tarif Arama

```
Öğün Havuzu sekmesinde:
1. "Ara:" kutusuna "yoğurt" yaz
2. Liste anında filtrelenir
3. Sadece adında "yoğurt" geçen tarifler görünür
```

#### Tarif Düzenleme

```
1. Tabloda tarifi bul
2. Sağdaki kalem ikonuna (📝) tıkla
3. Dialog açılır, değişiklikleri yap
4. "Kaydet" butonuna bas
```

#### Veritabanı Yedekleme

```
Ayarlar sekmesinde:
1. "Veritabanını Dışa Aktar" butonuna tıkla
2. Kayıt konumu seç
3. .db dosyası kaydedilir

Geri yükleme:
1. "Veritabanını İçe Aktar" butonuna tıkla
2. Yedek .db dosyasını seç
3. Uygulamayı yeniden başlat
```

---

## 📌 Notlar

- Uygulama Windows için optimize edilmiştir
- Türkçe karakter desteği için Windows fontları kullanılır
- Veritabanı ilk çalıştırmada otomatik oluşturulur
- Varsayılan olarak 2 diyet kalıbı (2 Öğünlü, 3 Öğünlü) eklenir
