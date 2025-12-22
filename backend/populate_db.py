# -*- coding: utf-8 -*-
"""
Veritabanını örnek verilerle doldur.
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

from database import Database

db = Database()
db.initialize()

# Normal havuz için örnek tarifler
normal_recipes = [
    # Kahvaltı
    ("Yulaf Ezmeli Kahvaltı", "kahvalti", "normal",
     "3 yemek kaşığı yulaf ezmesi, 1 bardak süt, 1 adet muz, 5 adet badem",
     "4 yemek kaşığı yulaf ezmesi, 1 bardak süt, 1 adet muz, 8 adet badem",
     "5 yemek kaşığı yulaf ezmesi, 1.5 bardak süt, 1 adet muz, 10 adet badem",
     "6 yemek kaşığı yulaf ezmesi, 2 bardak süt, 1 adet muz, 12 adet badem"),
    
    ("Peynirli Omlet", "kahvalti", "normal",
     "2 yumurta, 30g beyaz peynir, yeşillik",
     "2 yumurta, 40g beyaz peynir, yeşillik, 1 dilim tam buğday ekmeği",
     "3 yumurta, 50g beyaz peynir, yeşillik, 1 dilim tam buğday ekmeği",
     "3 yumurta, 60g beyaz peynir, yeşillik, 2 dilim tam buğday ekmeği"),
    
    ("Avokadolu Tost", "kahvalti", "normal",
     "1/2 avokado, 1 dilim tam buğday ekmeği, domates",
     "1/2 avokado, 2 dilim tam buğday ekmeği, domates, 1 yumurta",
     "1 avokado, 2 dilim tam buğday ekmeği, domates, 1 yumurta",
     "1 avokado, 2 dilim tam buğday ekmeği, domates, 2 yumurta"),
    
    ("Türk Kahvaltısı", "kahvalti", "normal",
     "1 yumurta, 30g peynir, 5 zeytin, domates, salatalık",
     "2 yumurta, 40g peynir, 8 zeytin, domates, salatalık, 1 dilim ekmek",
     "2 yumurta, 50g peynir, 10 zeytin, domates, salatalık, 2 dilim ekmek",
     "3 yumurta, 60g peynir, 12 zeytin, domates, salatalık, 2 dilim ekmek"),
    
    ("Smoothie Bowl", "kahvalti", "normal",
     "1 muz, 1 kase yoğurt, müsli, çilek",
     "1 muz, 1.5 kase yoğurt, müsli, çilek, bal",
     "2 muz, 2 kase yoğurt, müsli, çilek, bal, chia",
     "2 muz, 2 kase yoğurt, müsli, çilek, bal, chia, fıstık ezmesi"),
    
    # Ara Öğün 1 (Sabah)
    ("Meyve Tabağı", "ara_ogun_1", "normal",
     "1 porsiyon mevsim meyvesi (elma veya armut)",
     "1.5 porsiyon mevsim meyvesi, 5 adet badem",
     "2 porsiyon mevsim meyvesi, 8 adet badem",
     "2 porsiyon mevsim meyvesi, 10 adet ceviz"),
    
    ("Yoğurt ve Ceviz", "ara_ogun_1", "normal",
     "1 kase yoğurt, 3 adet ceviz",
     "1 kase yoğurt, 5 adet ceviz",
     "1.5 kase yoğurt, 7 adet ceviz",
     "2 kase yoğurt, 10 adet ceviz"),
    
    ("Havuç ve Humus", "ara_ogun_1", "normal",
     "1 adet havuç, 2 yemek kaşığı humus",
     "2 adet havuç, 3 yemek kaşığı humus",
     "2 adet havuç, 4 yemek kaşığı humus",
     "3 adet havuç, 5 yemek kaşığı humus"),
    
    ("Badem ve Kuru Üzüm", "ara_ogun_1", "normal",
     "8 adet badem, 1 yemek kaşığı kuru üzüm",
     "10 adet badem, 1.5 yemek kaşığı kuru üzüm",
     "12 adet badem, 2 yemek kaşığı kuru üzüm",
     "15 adet badem, 2 yemek kaşığı kuru üzüm"),
    
    ("Peynirli Galeta", "ara_ogun_1", "normal",
     "2 galeta, 20g beyaz peynir",
     "3 galeta, 30g beyaz peynir",
     "4 galeta, 40g beyaz peynir",
     "5 galeta, 50g beyaz peynir"),
    
    # Öğle yemeği
    ("Izgara Tavuk Salata", "ogle", "normal",
     "100g ızgara tavuk, yeşil salata, domates, salatalık",
     "120g ızgara tavuk, yeşil salata, domates, salatalık, zeytinyağı",
     "150g ızgara tavuk, yeşil salata, domates, salatalık, zeytinyağı, 1 dilim ekmek",
     "180g ızgara tavuk, yeşil salata, domates, salatalık, zeytinyağı, 2 dilim ekmek"),
    
    ("Mercimek Çorbası", "ogle", "normal",
     "1 kase mercimek çorbası",
     "1.5 kase mercimek çorbası, 1 dilim ekmek",
     "2 kase mercimek çorbası, 1 dilim ekmek, salata",
     "2 kase mercimek çorbası, 2 dilim ekmek, salata"),
    
    ("Kinoa Salatası", "ogle", "normal",
     "80g kinoa, domates, salatalık, maydanoz",
     "100g kinoa, domates, salatalık, maydanoz, zeytinyağı",
     "120g kinoa, domates, salatalık, maydanoz, zeytinyağı, 50g beyaz peynir",
     "150g kinoa, domates, salatalık, maydanoz, zeytinyağı, 80g beyaz peynir"),
    
    ("Zeytinyağlı Enginar", "ogle", "normal",
     "2 adet enginar, 1 yemek kaşığı zeytinyağı",
     "2 adet enginar, 1.5 yemek kaşığı zeytinyağı, limon",
     "3 adet enginar, 2 yemek kaşığı zeytinyağı, limon",
     "3 adet enginar, 2 yemek kaşığı zeytinyağı, limon, 1 dilim ekmek"),
    
    ("Ton Balıklı Salata", "ogle", "normal",
     "1 kutu ton balığı, yeşillik, domates",
     "1 kutu ton balığı, yeşillik, domates, mısır, zeytinyağı",
     "1 kutu ton balığı, yeşillik, domates, mısır, zeytinyağı, 1 dilim ekmek",
     "1 kutu ton balığı, yeşillik, domates, mısır, fasulye, zeytinyağı, 1 dilim ekmek"),
    
    # Ara Öğün 2 (Öğleden sonra)
    ("Elma ve Fıstık Ezmesi", "ara_ogun_2", "normal",
     "1 elma, 1 yemek kaşığı fıstık ezmesi",
     "1 elma, 1.5 yemek kaşığı fıstık ezmesi",
     "1 büyük elma, 2 yemek kaşığı fıstık ezmesi",
     "1 büyük elma, 2 yemek kaşığı fıstık ezmesi, bal"),
    
    ("Ayran ve Ceviz", "ara_ogun_2", "normal",
     "1 bardak ayran, 4 adet ceviz",
     "1 bardak ayran, 6 adet ceviz",
     "1.5 bardak ayran, 8 adet ceviz",
     "2 bardak ayran, 10 adet ceviz"),
    
    ("Muz ve Badem", "ara_ogun_2", "normal",
     "1 muz, 5 adet badem",
     "1 muz, 8 adet badem",
     "1 muz, 10 adet badem",
     "1 büyük muz, 12 adet badem"),
    
    ("Lor Peyniri ve Meyve", "ara_ogun_2", "normal",
     "50g lor peyniri, çilek",
     "70g lor peyniri, çilek, bal",
     "100g lor peyniri, çilek, bal",
     "120g lor peyniri, çilek, bal, ceviz"),
    
    ("Nohut Atıştırmalığı", "ara_ogun_2", "normal",
     "1 avuç kavrulmuş nohut",
     "1.5 avuç kavrulmuş nohut",
     "2 avuç kavrulmuş nohut",
     "2 avuç kavrulmuş nohut, 1 meyve"),
    
    # Akşam yemeği
    ("Fırında Somon", "aksam", "normal",
     "120g somon, brokoli, limon",
     "150g somon, brokoli, limon, zeytinyağı",
     "180g somon, brokoli, kuşkonmaz, limon, zeytinyağı",
     "200g somon, brokoli, kuşkonmaz, limon, zeytinyağı, 1 dilim ekmek"),
    
    ("Sebzeli Tavuk Sote", "aksam", "normal",
     "100g tavuk, karışık sebze",
     "120g tavuk, karışık sebze, zeytinyağı",
     "150g tavuk, karışık sebze, zeytinyağı, 4 yemek kaşığı bulgur",
     "180g tavuk, karışık sebze, zeytinyağı, 6 yemek kaşığı bulgur"),
    
    ("Izgara Köfte", "aksam", "normal",
     "80g köfte, salata",
     "100g köfte, salata, 1 dilim ekmek",
     "120g köfte, salata, 2 dilim ekmek",
     "150g köfte, salata, 2 dilim ekmek, yoğurt"),
    
    ("Zeytinyağlı Fasulye", "aksam", "normal",
     "1 porsiyon fasulye, salata",
     "1.5 porsiyon fasulye, salata, 1 dilim ekmek",
     "2 porsiyon fasulye, salata, 1 dilim ekmek",
     "2 porsiyon fasulye, salata, 2 dilim ekmek, yoğurt"),
    
    ("Fırında Levrek", "aksam", "normal",
     "150g levrek, sebze",
     "180g levrek, sebze, limon, zeytinyağı",
     "200g levrek, sebze, limon, zeytinyağı, salata",
     "220g levrek, sebze, limon, zeytinyağı, salata, 1 dilim ekmek"),
    
    # Ara Öğün 3 (Akşam)
    ("Gece Yoğurdu", "ara_ogun_3", "normal",
     "1 kase light yoğurt",
     "1 kase yoğurt, tarçın",
     "1 kase yoğurt, tarçın, 3 badem",
     "1.5 kase yoğurt, tarçın, 5 badem"),
    
    ("Süt ve Tarçın", "ara_ogun_3", "normal",
     "1 bardak ılık süt, tarçın",
     "1 bardak süt, tarçın, 1 yemek kaşığı bal",
     "1.5 bardak süt, tarçın, bal",
     "1.5 bardak süt, tarçın, bal, 3 kuru kayısı"),
    
    ("Bir Avuç Kuruyemiş", "ara_ogun_3", "normal",
     "5 adet badem, 2 adet ceviz",
     "7 adet badem, 3 adet ceviz",
     "10 adet badem, 4 adet ceviz",
     "12 adet badem, 5 adet ceviz"),
    
    ("Keçi Peyniri ve İncir", "ara_ogun_3", "normal",
     "30g keçi peyniri, 1 kuru incir",
     "40g keçi peyniri, 2 kuru incir",
     "50g keçi peyniri, 2 kuru incir",
     "60g keçi peyniri, 3 kuru incir"),
    
    ("Kefir", "ara_ogun_3", "normal",
     "1 bardak kefir",
     "1 bardak kefir, tarçın",
     "1.5 bardak kefir, tarçın",
     "1.5 bardak kefir, tarçın, bal"),
    
    # Özel içecek
    ("Yeşil Smoothie", "ozel_icecek", "normal",
     "1 avuç ıspanak, 1/2 muz, 1 bardak su",
     "2 avuç ıspanak, 1 muz, 1 bardak badem sütü",
     "2 avuç ıspanak, 1 muz, 1/2 avokado, 1 bardak badem sütü",
     "3 avuç ıspanak, 1 muz, 1/2 avokado, 1.5 bardak badem sütü"),
    
    ("Detoks Suyu", "ozel_icecek", "normal",
     "1 litre su, 1/2 limon, 5 yaprak nane",
     "1 litre su, 1 limon, 1/2 salatalık, 5 yaprak nane",
     "1.5 litre su, 1 limon, 1 salatalık, zencefil",
     "2 litre su, 1 limon, 1 salatalık, zencefil, nane"),
    
    ("Zencefilli Çay", "ozel_icecek", "normal",
     "1 fincan zencefil çayı, limon",
     "2 fincan zencefil çayı, limon",
     "2 fincan zencefil çayı, limon, bal",
     "2 fincan zencefil çayı, limon, bal, tarçın"),
    
    ("Papatya Çayı", "ozel_icecek", "normal",
     "1 fincan papatya çayı",
     "2 fincan papatya çayı",
     "2 fincan papatya çayı, bal",
     "2 fincan papatya çayı, bal, limon"),
    
    ("Yeşil Çay", "ozel_icecek", "normal",
     "1 fincan yeşil çay, limon",
     "2 fincan yeşil çay, limon",
     "2 fincan yeşil çay, limon, zencefil",
     "2 fincan yeşil çay, limon, zencefil, bal"),
]

# Hastalık havuzu için örnek tarifler
hastalik_recipes = [
    # Kahvaltı
    ("Tam Tahıllı Kahvaltı", "kahvalti", "hastalik",
     "4 yemek kaşığı yulaf, 1 bardak süt, 1 muz, 8 badem, 1 yemek kaşığı bal",
     "5 yemek kaşığı yulaf, 1.5 bardak süt, 1 muz, 10 badem, 1 yemek kaşığı bal",
     "6 yemek kaşığı yulaf, 2 bardak süt, 1 muz, 12 badem, 2 yemek kaşığı bal",
     "7 yemek kaşığı yulaf, 2 bardak süt, 1 muz, 15 badem, 2 yemek kaşığı bal"),
    
    ("Zengin Omlet", "kahvalti", "hastalik",
     "3 yumurta, 50g peynir, mantar, biber, 2 dilim ekmek",
     "3 yumurta, 60g peynir, mantar, biber, 2 dilim ekmek, zeytinyağı",
     "4 yumurta, 70g peynir, mantar, biber, 2 dilim ekmek, zeytinyağı",
     "4 yumurta, 80g peynir, mantar, biber, 3 dilim ekmek, zeytinyağı, 1 avokado"),
    
    # Ara öğün 1
    ("Enerji Tabağı", "ara_ogun_1", "hastalik",
     "2 porsiyon meyve, 10 badem, 5 ceviz",
     "2 porsiyon meyve, 12 badem, 7 ceviz, 1 yemek kaşığı bal",
     "2.5 porsiyon meyve, 15 badem, 10 ceviz, 1 yemek kaşığı bal",
     "3 porsiyon meyve, 18 badem, 12 ceviz, 2 yemek kaşığı bal"),
    
    ("Protein Atıştırmalık", "ara_ogun_1", "hastalik",
     "2 kase yoğurt, 8 ceviz, 1 yemek kaşığı bal",
     "2 kase yoğurt, 10 ceviz, 1 muz, 1 yemek kaşığı bal",
     "2.5 kase yoğurt, 12 ceviz, 1 muz, 2 yemek kaşığı bal",
     "3 kase yoğurt, 15 ceviz, 1 muz, 2 yemek kaşığı bal, granola"),
    
    # Öğle yemeği
    ("Bol Proteinli Salata", "ogle", "hastalik",
     "150g tavuk, yeşillik, domates, avokado, zeytinyağı, 2 dilim ekmek",
     "180g tavuk, yeşillik, domates, avokado, zeytinyağı, 2 dilim ekmek, peynir",
     "200g tavuk, yeşillik, domates, avokado, zeytinyağı, 2 dilim ekmek, peynir",
     "230g tavuk, yeşillik, domates, avokado, zeytinyağı, 3 dilim ekmek, peynir"),
    
    ("Besleyici Çorba", "ogle", "hastalik",
     "2 kase mercimek çorbası, 2 dilim ekmek, yoğurt",
     "2.5 kase mercimek çorbası, 2 dilim ekmek, yoğurt, peynir",
     "3 kase mercimek çorbası, 3 dilim ekmek, yoğurt, peynir",
     "3 kase mercimek çorbası, 3 dilim ekmek, yoğurt, peynir, zeytinyağı"),
    
    # Ara öğün 2
    ("Besleyici Ara Öğün", "ara_ogun_2", "hastalik",
     "1 muz, 10 badem, 1 yemek kaşığı bal",
     "1 muz, 12 badem, 1 yemek kaşığı bal, yoğurt",
     "1 muz, 15 badem, 2 yemek kaşığı bal, yoğurt",
     "2 muz, 15 badem, 2 yemek kaşığı bal, yoğurt"),
    
    # Akşam yemeği
    ("Zengin Balık Tabağı", "aksam", "hastalik",
     "180g somon, sebze, 6 yemek kaşığı bulgur, zeytinyağı",
     "200g somon, sebze, 8 yemek kaşığı bulgur, zeytinyağı, salata",
     "220g somon, sebze, 10 yemek kaşığı bulgur, zeytinyağı, salata",
     "250g somon, sebze, 12 yemek kaşığı bulgur, zeytinyağı, salata, yoğurt"),
    
    ("Bol Porsiyonlu Et", "aksam", "hastalik",
     "150g köfte, sebze, 6 yemek kaşığı pilav, yoğurt",
     "180g köfte, sebze, 8 yemek kaşığı pilav, yoğurt, salata",
     "200g köfte, sebze, 10 yemek kaşığı pilav, yoğurt, salata",
     "230g köfte, sebze, 12 yemek kaşığı pilav, yoğurt, salata, 2 dilim ekmek"),
    
    # Ara öğün 3
    ("Gece Atıştırması", "ara_ogun_3", "hastalik",
     "1 bardak süt, 5 badem",
     "1 bardak süt, 8 badem, bal",
     "1.5 bardak süt, 10 badem, bal",
     "1.5 bardak süt, 12 badem, bal, tarçın"),
    
    # Özel içecek
    ("Protein Smoothie", "ozel_icecek", "hastalik",
     "1 muz, 1 bardak süt, 1 yemek kaşığı fıstık ezmesi, bal",
     "1 muz, 1.5 bardak süt, 2 yemek kaşığı fıstık ezmesi, bal, yulaf",
     "2 muz, 2 bardak süt, 2 yemek kaşığı fıstık ezmesi, bal, yulaf",
     "2 muz, 2 bardak süt, 3 yemek kaşığı fıstık ezmesi, bal, yulaf, protein tozu"),
]

print("Tarifler ekleniyor...")

# Normal tarifleri ekle
for recipe in normal_recipes:
    db.add_recipe(*recipe)
    print(f"  + {recipe[0]} (Normal)")

# Hastalık tariflerini ekle
for recipe in hastalik_recipes:
    db.add_recipe(*recipe)
    print(f"  + {recipe[0]} (Hastalik)")

print(f"\n[OK] Toplam {len(normal_recipes) + len(hastalik_recipes)} tarif eklendi!")
print("   Normal havuz: {0} tarif".format(len(normal_recipes)))
print("   Hastalık havuzu: {0} tarif".format(len(hastalik_recipes)))
