<p align="center">
  <img src="assets/icons/app_icon.png" alt="DetoksBot Logo" width="120" height="120">
</p>

<h1 align="center">DetoksBot</h1>

<p align="center">
  <strong>Profesyonel Diyet Programı Oluşturucu</strong><br>
  Diyetisyenler için öğün havuzlarından kişiselleştirilmiş diyet programları oluşturan masaüstü uygulaması
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-blue?logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/PyQt6-6.0+-green?logo=qt&logoColor=white" alt="PyQt6">
  <img src="https://img.shields.io/badge/Platform-Windows-lightgrey?logo=windows&logoColor=white" alt="Platform">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</p>

---

## ✨ Öne Çıkan Özellikler

| Özellik                        | Açıklama                                             |
| ------------------------------ | ---------------------------------------------------- |
| 🍽️ **Akıllı Tarif Havuzu**     | Normal ve Hastalık olmak üzere iki ayrı tarif havuzu |
| 📊 **BKİ Bazlı Özelleştirme**  | Her tarif 4 farklı BKİ grubu için ayrı içerik sunar  |
| 📄 **PDF & DOCX Çıktı**        | Profesyonel görünümlü doküman oluşturma              |
| 🎨 **Özelleştirilebilir Stil** | Font, boyut ve altbilgi ayarları                     |
| 👤 **Kullanıcı Yönetimi**      | Giriş sistemi ve oturum yönetimi                     |
| 📦 **Veritabanı Yedekleme**    | SQLite veritabanını içe/dışa aktarma                 |
| 🌗 **Mevsimlik Mod**           | Yaz/Kış için ayrı tarif veritabanları                |

---

## 🖥️ Ekran Görüntüleri

### Ana Ekran

Modern koyu tema ile tasarlanmış kullanıcı dostu arayüz.

### Diyet Oluşturma

- Kişisel bilgiler (Ad, yaş, boy, kilo)
- Program ayarları (Başlangıç tarihi, gün sayısı)
- BKİ otomatik hesaplama
- Hariç tutulacak yiyecekler

---

## 🚀 Kurulum

### Gereksinimler

- Python 3.10 veya üzeri
- Windows 10/11

### Bağımlılıkları Yükle

```bash
pip install -r requirements.txt
```

### Uygulamayı Başlat

```bash
python main.py
```

---

## 📁 Proje Yapısı

```
detoksbot/
├── main.py                  # Uygulama giriş noktası
├── database.py              # SQLite veritabanı yönetimi
├── document_generator.py    # DOCX & PDF oluşturma
├── pdf_generator.py         # ReportLab PDF desteği
├── requirements.txt         # Python bağımlılıkları
│
├── ui/                      # Kullanıcı arayüzü modülleri
│   ├── main_window.py       # Ana pencere ve sidebar
│   ├── login_dialog.py      # Giriş ekranı
│   ├── diet_creator.py      # Diyet oluşturma
│   ├── diet_templates.py    # Diyet kalıpları
│   ├── meal_pool.py         # Tarif havuzu
│   ├── settings.py          # Ayarlar
│   ├── styles.py            # Tema ve renkler
│   └── icon_utils.py        # İkon yönetimi
│
├── assets/icons/            # Uygulama ikonları
└── data/                    # Veritabanı dosyaları
```

---

## 🛠️ Teknoloji Stack

| Teknoloji       | Versiyon | Amaç                 |
| --------------- | -------- | -------------------- |
| **Python**      | 3.10+    | Ana programlama dili |
| **PyQt6**       | 6.0+     | Modern masaüstü GUI  |
| **SQLite**      | 3.x      | Yerel veritabanı     |
| **python-docx** | 0.8+     | DOCX oluşturma       |
| **docx2pdf**    | 0.1+     | PDF dönüştürme       |
| **bcrypt**      | 4.0+     | Şifre güvenliği      |

---

## 📋 Veritabanı Şeması

### Tablolar

| Tablo            | Açıklama               |
| ---------------- | ---------------------- |
| `users`          | Kullanıcı hesapları    |
| `recipes`        | Tarifler (4 BKİ grubu) |
| `diet_templates` | Diyet kalıpları        |
| `template_meals` | Kalıp öğünleri         |
| `settings`       | Uygulama ayarları      |

### BKİ Grupları

| Grup      | Aralık | Kategori        |
| --------- | ------ | --------------- |
| 21-25 BKİ | < 25   | Normal          |
| 26-29 BKİ | 25-30  | Fazla Kilolu    |
| 30-33 BKİ | 30-35  | Obez (Sınıf 1)  |
| 34+ BKİ   | > 35   | Obez (Sınıf 2+) |

---

## 🎯 Kullanım Kılavuzu

### 1. İlk Kurulum

1. Uygulamayı başlatın
2. Yeni hesap oluşturun
3. "Oturumu açık tut" ile kalıcı giriş yapın

### 2. Tarif Ekleme

1. **Tarif Havuzu** sekmesine gidin
2. **Yeni Tarif Ekle** butonuna tıklayın
3. Her BKİ grubu için ayrı tarif içeriği girin
4. Kaydedin

### 3. Diyet Kalıbı Oluşturma

1. **Diyet Kalıpları** sekmesine gidin
2. **Yeni Kalıp Ekle** butonuna tıklayın
3. Öğün saatlerini ve türlerini belirleyin
4. Kaydedin

### 4. Program Oluşturma

1. **Diyet Oluştur** sekmesine gidin
2. Danışan bilgilerini girin (ad, boy, kilo)
3. Kalıp ve BKİ grubunu seçin
4. **Diyet Programı Oluştur** butonuna tıklayın
5. PDF ve DOCX dosyaları oluşturulur

---

## ⚙️ Ayarlar

### Doküman Ayarları

| Ayar              | Varsayılan    | Açıklama                |
| ----------------- | ------------- | ----------------------- |
| Font              | Comic Sans MS | Doküman yazı tipi       |
| Başlık Boyutu     | 18 pt         | Gün başlıkları          |
| Alt Başlık Boyutu | 14 pt         | Öğün başlıkları         |
| İçerik Boyutu     | 11 pt         | Tarif metinleri         |
| Kayıt Yolu        | Masaüstü      | Varsayılan kayıt konumu |

### Altbilgi (Footer)

- Telefon numarası
- Website adresi
- Instagram kullanıcı adı

---

## 🔒 Güvenlik

- Şifreler **bcrypt** ile hashlenir
- Kullanıcı oturumları güvenli saklanır
- Veritabanı yerel olarak korunur

---

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

## 👨‍💻 Geliştirici

**Kenan Kanat**  
📧 kenankanat93@gmail.com  
🔗 [GitHub](https://github.com/Kenfrozz)

---

<p align="center">
  <sub>DetoksBot ile daha sağlıklı yaşam 🥗</sub>
</p>
