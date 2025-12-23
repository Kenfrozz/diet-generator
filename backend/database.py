"""
Veritabanı modülü - SQLite ile tarif ve ayar yönetimi.
"""
import sqlite3
import os
import json
import bcrypt
from datetime import datetime
from typing import Optional


def get_data_dir() -> str:
    """Data klasörü yolunu döndür."""
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(data_dir, exist_ok=True)
    return data_dir


def get_config_path() -> str:
    """Config dosya yolunu döndür."""
    return os.path.join(get_data_dir(), "config.json")


def get_season_config() -> dict:
    """Config dosyasını oku."""
    config_path = get_config_path()
    default_config = {
        "summer_start": "04-01", # MM-DD
        "summer_end": "10-01"    # MM-DD
    }
    
    if os.path.exists(config_path):
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                return {**default_config, **json.load(f)}
        except Exception:
            pass
            
    return default_config

def save_season_config(summer_start: str, summer_end: str):
    """Sezon tarihlerini kaydet."""
    config_path = get_config_path()
    config = get_season_config()
    config["summer_start"] = summer_start
    config["summer_end"] = summer_end
    
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(config, f, ensure_ascii=False, indent=2)

def get_current_season() -> str:
    """Tarihe göre aktif mevsimi döndür (yaz veya kis)."""
    config = get_season_config()
    start_str = config.get("summer_start", "04-01")
    end_str = config.get("summer_end", "10-01")
    
    try:
        today = datetime.now()
        # Yıl önemli değil, ay ve gün karşılaştıracağız
        # Tarih formatı: MM-DD
        s_month, s_day = map(int, start_str.split('-'))
        e_month, e_day = map(int, end_str.split('-'))
        
        # Mevcut tarih için yıl kullan, sınırlar için o yılı kullan
        current_date = datetime(today.year, today.month, today.day)
        start_date = datetime(today.year, s_month, s_day)
        end_date = datetime(today.year, e_month, e_day)
        
        # Eğer bitiş başlangıçtan küçükse (örn: kış dönemi yıl atlıyorsa) - ama burada YAZ dönemi genelde aynı yıl içindedir.
        # Yaz dönemi: Başlangıç -> Bitiş arası.
        
        if start_date <= current_date < end_date:
            return "yaz"
        else:
            return "kis"
            
    except Exception as e:
        print(f"Season calculation error: {e}")
        return "yaz"

# set_current_season artık kullanılmıyor (otomatik hesaplanıyor) ama geriye uyumluluk için dummy bırakabiliriz veya silebiliriz.
# API tarafında hatayı önlemek için boş bırakıyorum.
def set_current_season(season: str):
    pass


def get_season_db_path(season: str = None) -> str:
    """Mevsime göre veritabanı yolunu döndür."""
    if season is None:
        season = get_current_season()
    return os.path.join(get_data_dir(), f"detoksbot_{season}.db")


class Database:
    """SQLite veritabanı yönetim sınıfı."""
    
    def __init__(self, db_path: str = None):
        """Veritabanı bağlantısını başlat."""
        if db_path is None:
            db_path = get_season_db_path()
        
        self.db_path = db_path
        self.conn = None
    
    def connect(self):
        """Veritabanına bağlan."""
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row
        return self.conn
    
    def close(self):
        """Veritabanı bağlantısını kapat."""
        if self.conn:
            self.conn.close()
            self.conn = None
    
    def initialize(self):
        """Veritabanı tablolarını oluştur."""
        conn = self.connect()
        cursor = conn.cursor()
        
        # Paketler tablosu (yeni sistem - havuzları değiştirir)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS packages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                save_path TEXT NOT NULL,
                list_count INTEGER NOT NULL DEFAULT 1,
                days_per_list INTEGER NOT NULL DEFAULT 7,
                weight_change_per_list REAL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Tarif-Paket ilişki tablosu (Many-to-Many)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS recipe_packages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                recipe_id INTEGER NOT NULL,
                package_id INTEGER NOT NULL,
                FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
                FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
                UNIQUE(recipe_id, package_id)
            )
        """)
        
        # Eski havuzlar tablosu (geriye uyumluluk için korunuyor, yeni kayıt eklenmeyecek)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS pools (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                color TEXT DEFAULT '#6b2fa3',
                icon TEXT,
                is_active BOOLEAN DEFAULT 1,
                sort_order INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Tarifler tablosu
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS recipes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                meal_type TEXT NOT NULL,
                pool_type TEXT,
                bki_21_25 TEXT NOT NULL,
                bki_26_29 TEXT NOT NULL,
                bki_30_33 TEXT NOT NULL,
                bki_34_plus TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Diyet kalıpları tablosu
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS diet_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Kalıp öğünleri tablosu
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS template_meals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                template_id INTEGER NOT NULL,
                time TEXT NOT NULL,
                meal_name TEXT NOT NULL,
                meal_type TEXT NOT NULL,
                sort_order INTEGER NOT NULL,
                FOREIGN KEY (template_id) REFERENCES diet_templates(id) ON DELETE CASCADE
            )
        """)
        
        # Ayarlar tablosu
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        """)
        
        # Randevular tablosu
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS appointments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_name TEXT NOT NULL,
                phone TEXT,
                date TEXT NOT NULL,
                time TEXT NOT NULL,
                types TEXT,
                note TEXT,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Kullanıcılar tablosu
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                display_name TEXT,
                role TEXT DEFAULT 'user',
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME,
                avatar_path TEXT,
                security_question TEXT,
                security_answer_hash TEXT
            )
        """)
        
        # Migrasyon: avatar_path sütunu yoksa ekle
        try:
            cursor.execute("SELECT avatar_path FROM users LIMIT 1")
        except sqlite3.OperationalError:
            print("Migrating database: Adding avatar_path column...")
            cursor.execute("ALTER TABLE users ADD COLUMN avatar_path TEXT")
            conn.commit()

        # Migrasyon: security_question sütunu yoksa ekle
        try:
            cursor.execute("SELECT security_question FROM users LIMIT 1")
        except sqlite3.OperationalError:
            print("Migrating database: Adding security_question column...")
            cursor.execute("ALTER TABLE users ADD COLUMN security_question TEXT")
            conn.commit()

        # Migrasyon: security_answer_hash sütunu yoksa ekle
        try:
            cursor.execute("SELECT security_answer_hash FROM users LIMIT 1")
        except sqlite3.OperationalError:
            print("Migrating database: Adding security_answer_hash column...")
            cursor.execute("ALTER TABLE users ADD COLUMN security_answer_hash TEXT")
            conn.commit()
        
        # Varsayılan havuzları ekle
        self._add_default_pools(cursor)
        
        # Varsayılan ayarları ekle
        default_settings = [
            ("days_count", "4"),
            ("save_path", os.path.expanduser("~/Desktop"))
        ]
        
        for key, value in default_settings:
            cursor.execute("""
                INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)
            """, (key, value))
        
        # Varsayılan kalıpları ekle
        self._add_default_templates(cursor)
        
        conn.commit()
        self.close()
    
    def _add_default_pools(self, cursor):
        """Varsayılan havuzları ekle."""
        cursor.execute("SELECT COUNT(*) FROM pools")
        if cursor.fetchone()[0] > 0:
            return
        
        default_pools = [
            ("normal", "Normal Öğün Havuzu", "Standart diyet tarifleri", "#6b2fa3", 1),
            ("hastalik", "Hastalık Öğün Havuzu", "Özel durum tarifleri", "#e74c3c", 2),
        ]
        
        for name, display_name, desc, color, order in default_pools:
            cursor.execute("""
                INSERT INTO pools (name, description, color, sort_order) VALUES (?, ?, ?, ?)
            """, (name, desc, color, order))
    
    def _add_default_templates(self, cursor):
        """Varsayılan diyet kalıplarını ekle."""
        # Mevcut kalıp var mı kontrol et
        cursor.execute("SELECT COUNT(*) FROM diet_templates")
        if cursor.fetchone()[0] > 0:
            return
        
        # 2 Öğünlü kalıp
        cursor.execute("INSERT INTO diet_templates (name) VALUES (?)", ("2 Öğünlü",))
        template_2_id = cursor.lastrowid
        meals_2 = [
            ("10:00", "Kahvaltı", "kahvalti", 1),
            ("12:30", "Ara Öğün 1", "ara_ogun_1", 2),
            ("14:00", "Özel İçecek", "ozel_icecek", 3),
            ("15:30", "Ara Öğün 2", "ara_ogun_2", 4),
            ("17:30", "Akşam Yemeği", "aksam", 5),
            ("20:30", "Ara Öğün 3", "ara_ogun_3", 6),
        ]
        for time, meal_name, meal_type, order in meals_2:
            cursor.execute("""
                INSERT INTO template_meals (template_id, time, meal_name, meal_type, sort_order)
                VALUES (?, ?, ?, ?, ?)
            """, (template_2_id, time, meal_name, meal_type, order))
        
        # 3 Öğünlü kalıp
        cursor.execute("INSERT INTO diet_templates (name) VALUES (?)", ("3 Öğünlü",))
        template_3_id = cursor.lastrowid
        meals_3 = [
            ("08:00", "Kahvaltı", "kahvalti", 1),
            ("10:30", "Ara Öğün 1", "ara_ogun_1", 2),
            ("12:00", "Öğle Yemeği", "ogle", 3),
            ("15:00", "Ara Öğün 2", "ara_ogun_2", 4),
            ("18:00", "Akşam Yemeği", "aksam", 5),
            ("21:00", "Özel İçecek", "ozel_icecek", 6),
        ]
        for time, meal_name, meal_type, order in meals_3:
            cursor.execute("""
                INSERT INTO template_meals (template_id, time, meal_name, meal_type, sort_order)
                VALUES (?, ?, ?, ?, ?)
            """, (template_3_id, time, meal_name, meal_type, order))
    
    # ==================== TARİF İŞLEMLERİ ====================
    
    def add_recipe(self, name: str, meal_type: str, pool_type: str,
                   bki_21_25: str, bki_26_29: str, bki_30_33: str, bki_34_plus: str) -> int:
        """Yeni tarif ekle."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO recipes (name, meal_type, pool_type, bki_21_25, bki_26_29, bki_30_33, bki_34_plus)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (name, meal_type, pool_type, bki_21_25, bki_26_29, bki_30_33, bki_34_plus))
        
        recipe_id = cursor.lastrowid
        conn.commit()
        self.close()
        return recipe_id
    
    def update_recipe(self, recipe_id: int, name: str, meal_type: str, pool_type: str,
                      bki_21_25: str, bki_26_29: str, bki_30_33: str, bki_34_plus: str):
        """Mevcut tarifi güncelle."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE recipes 
            SET name = ?, meal_type = ?, pool_type = ?, 
                bki_21_25 = ?, bki_26_29 = ?, bki_30_33 = ?, bki_34_plus = ?
            WHERE id = ?
        """, (name, meal_type, pool_type, bki_21_25, bki_26_29, bki_30_33, bki_34_plus, recipe_id))
        
        conn.commit()
        self.close()
    
    def delete_recipe(self, recipe_id: int):
        """Tarif sil."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM recipes WHERE id = ?", (recipe_id,))
        
        conn.commit()
        self.close()
    
    def get_recipe(self, recipe_id: int) -> Optional[dict]:
        """Tek bir tarifi getir."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM recipes WHERE id = ?", (recipe_id,))
        row = cursor.fetchone()
        
        self.close()
        return dict(row) if row else None
    
    def get_all_recipes(self, pool_type: str = None, meal_type: str = None) -> list:
        """Tüm tarifleri getir (opsiyonel filtre ile)."""
        conn = self.connect()
        cursor = conn.cursor()
        
        query = "SELECT * FROM recipes WHERE 1=1"
        params = []
        
        if pool_type:
            query += " AND pool_type = ?"
            params.append(pool_type)
        
        if meal_type:
            query += " AND meal_type = ?"
            params.append(meal_type)
        
        query += " ORDER BY name"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        self.close()
        return [dict(row) for row in rows]
    
    def get_recipes_for_diet(self, pool_type: str, meal_type: str, exclude_keywords: list = None) -> list:
        """Diyet oluşturmak için tarifleri getir (hariç tutma filtresi ile)."""
        conn = self.connect()
        cursor = conn.cursor()
        
        query = "SELECT * FROM recipes WHERE pool_type = ? AND meal_type = ?"
        params = [pool_type, meal_type]
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        recipes = [dict(row) for row in rows]
        
        # Hariç tutma filtresi uygula
        if exclude_keywords:
            filtered_recipes = []
            for recipe in recipes:
                exclude = False
                for keyword in exclude_keywords:
                    keyword_lower = keyword.lower().strip()
                    if keyword_lower and keyword_lower in recipe['name'].lower():
                        exclude = True
                        break
                if not exclude:
                    filtered_recipes.append(recipe)
            recipes = filtered_recipes
        
        self.close()
        return recipes
    
    # ==================== AYAR İŞLEMLERİ ====================
    
    def get_setting(self, key: str, default: str = None) -> str:
        """Ayar değerini getir."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("SELECT value FROM settings WHERE key = ?", (key,))
        row = cursor.fetchone()
        
        self.close()
        return row['value'] if row else default
    
    def set_setting(self, key: str, value: str):
        """Ayar değerini kaydet."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)
        """, (key, value))
        
        conn.commit()
        self.close()
    
    def get_all_settings(self) -> dict:
        """Tüm ayarları getir."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("SELECT key, value FROM settings")
        rows = cursor.fetchall()
        
        self.close()
        return {row['key']: row['value'] for row in rows}
    
    # ==================== DİYET KALIBI İŞLEMLERİ ====================
    
    def add_template(self, name: str, meals: list) -> int:
        """Yeni diyet kalıbı ekle.
        
        Args:
            name: Kalıp adı
            meals: Öğün listesi [(time, meal_name, meal_type), ...]
        """
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("INSERT INTO diet_templates (name) VALUES (?)", (name,))
        template_id = cursor.lastrowid
        
        for order, (time, meal_name, meal_type) in enumerate(meals, 1):
            cursor.execute("""
                INSERT INTO template_meals (template_id, time, meal_name, meal_type, sort_order)
                VALUES (?, ?, ?, ?, ?)
            """, (template_id, time, meal_name, meal_type, order))
        
        conn.commit()
        self.close()
        return template_id
    
    def update_template(self, template_id: int, name: str, meals: list):
        """Diyet kalıbını güncelle."""
        conn = self.connect()
        cursor = conn.cursor()
        
        # Kalıp adını güncelle
        cursor.execute("UPDATE diet_templates SET name = ? WHERE id = ?", (name, template_id))
        
        # Eski öğünleri sil
        cursor.execute("DELETE FROM template_meals WHERE template_id = ?", (template_id,))
        
        # Yeni öğünleri ekle
        for order, (time, meal_name, meal_type) in enumerate(meals, 1):
            cursor.execute("""
                INSERT INTO template_meals (template_id, time, meal_name, meal_type, sort_order)
                VALUES (?, ?, ?, ?, ?)
            """, (template_id, time, meal_name, meal_type, order))
        
        conn.commit()
        self.close()
    
    def delete_template(self, template_id: int):
        """Diyet kalıbını sil."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM template_meals WHERE template_id = ?", (template_id,))
        cursor.execute("DELETE FROM diet_templates WHERE id = ?", (template_id,))
        
        conn.commit()
        self.close()
    
    def get_template(self, template_id: int) -> Optional[dict]:
        """Tek bir kalıbı öğünleriyle birlikte getir."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM diet_templates WHERE id = ?", (template_id,))
        template_row = cursor.fetchone()
        
        if not template_row:
            self.close()
            return None
        
        cursor.execute("""
            SELECT * FROM template_meals 
            WHERE template_id = ? 
            ORDER BY sort_order
        """, (template_id,))
        meal_rows = cursor.fetchall()
        
        self.close()
        
        return {
            "id": template_row["id"],
            "name": template_row["name"],
            "meals": [(row["time"], row["meal_name"], row["meal_type"]) for row in meal_rows]
        }
    
    def get_all_templates(self) -> list:
        """Tüm kalıpları getir."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM diet_templates ORDER BY name")
        rows = cursor.fetchall()
        
        self.close()
        return [dict(row) for row in rows]
    
    def get_template_with_meals(self, template_id: int) -> Optional[dict]:
        """Kalıbı öğünleriyle birlikte getir (diyet oluşturma için)."""
        return self.get_template(template_id)
    
    # ==================== HAVUZ İŞLEMLERİ ====================
    
    def add_pool(self, name: str, description: str = "", color: str = "#6b2fa3", 
                 icon: str = None, is_active: bool = True) -> int:
        """Yeni havuz ekle."""
        conn = self.connect()
        cursor = conn.cursor()
        
        # En yüksek sıra numarasını bul
        cursor.execute("SELECT MAX(sort_order) FROM pools")
        max_order = cursor.fetchone()[0] or 0
        
        cursor.execute("""
            INSERT INTO pools (name, description, color, icon, is_active, sort_order)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (name, description, color, icon, is_active, max_order + 1))
        
        pool_id = cursor.lastrowid
        conn.commit()
        self.close()
        return pool_id
    
    def update_pool(self, pool_id: int, name: str, description: str = "", 
                    color: str = "#6b2fa3", icon: str = None, is_active: bool = True):
        """Havuzu güncelle."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE pools 
            SET name = ?, description = ?, color = ?, icon = ?, is_active = ?
            WHERE id = ?
        """, (name, description, color, icon, is_active, pool_id))
        
        conn.commit()
        self.close()
    
    def delete_pool(self, pool_id: int) -> bool:
        """Havuzu sil. Varsayılan havuzlar silinemez."""
        conn = self.connect()
        cursor = conn.cursor()
        
        # Varsayılan havuzları kontrol et (id 1 ve 2)
        if pool_id <= 2:
            self.close()
            return False
        
        # Havuza ait tarifleri kontrol et
        cursor.execute("SELECT COUNT(*) FROM recipes WHERE pool_type = (SELECT name FROM pools WHERE id = ?)", (pool_id,))
        recipe_count = cursor.fetchone()[0]
        
        if recipe_count > 0:
            self.close()
            return False
        
        cursor.execute("DELETE FROM pools WHERE id = ?", (pool_id,))
        conn.commit()
        self.close()
        return True
    
    def get_pool(self, pool_id: int) -> Optional[dict]:
        """Tek bir havuzu getir."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM pools WHERE id = ?", (pool_id,))
        row = cursor.fetchone()
        
        self.close()
        return dict(row) if row else None
    
    def get_pool_by_name(self, name: str) -> Optional[dict]:
        """Havuzu ada göre getir."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM pools WHERE name = ?", (name,))
        row = cursor.fetchone()
        
        self.close()
        return dict(row) if row else None
    
    def get_all_pools(self, active_only: bool = False) -> list:
        """Tüm havuzları getir."""
        conn = self.connect()
        cursor = conn.cursor()
        
        query = "SELECT * FROM pools"
        if active_only:
            query += " WHERE is_active = 1"
        query += " ORDER BY sort_order"
        
        cursor.execute(query)
        rows = cursor.fetchall()
        
        self.close()
        return [dict(row) for row in rows]
    
    def get_pool_statistics(self, pool_name: str) -> dict:
        """Havuz istatistiklerini getir."""
        conn = self.connect()
        cursor = conn.cursor()
        
        # Toplam tarif sayısı
        cursor.execute("SELECT COUNT(*) FROM recipes WHERE pool_type = ?", (pool_name,))
        total_recipes = cursor.fetchone()[0]
        
        # Öğün türüne göre dağılım
        cursor.execute("""
            SELECT meal_type, COUNT(*) as count 
            FROM recipes 
            WHERE pool_type = ? 
            GROUP BY meal_type
        """, (pool_name,))
        meal_distribution = {row["meal_type"]: row["count"] for row in cursor.fetchall()}
        
        self.close()
        
        # Tüm öğün türleri
        all_meal_types = ["kahvalti", "ara_ogun_1", "ogle", "ara_ogun_2", "aksam", "ara_ogun_3", "ozel_icecek"]
        missing_types = [mt for mt in all_meal_types if mt not in meal_distribution]
        
        return {
            "total_recipes": total_recipes,
            "meal_distribution": meal_distribution,
            "missing_meal_types": missing_types
        }
    
    def copy_recipes_to_pool(self, recipe_ids: list, target_pool: str) -> int:
        """Tarifleri başka havuza kopyala."""
        conn = self.connect()
        cursor = conn.cursor()
        
        copied = 0
        for recipe_id in recipe_ids:
            cursor.execute("SELECT * FROM recipes WHERE id = ?", (recipe_id,))
            row = cursor.fetchone()
            if row:
                cursor.execute("""
                    INSERT INTO recipes (name, meal_type, pool_type, bki_21_25, bki_26_29, bki_30_33, bki_34_plus)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (row["name"], row["meal_type"], target_pool, 
                      row["bki_21_25"], row["bki_26_29"], row["bki_30_33"], row["bki_34_plus"]))
                copied += 1
        
        conn.commit()
        self.close()
        return copied
    
    def move_recipes_to_pool(self, recipe_ids: list, target_pool: str) -> int:
        """Tarifleri başka havuza taşı."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute(f"""
            UPDATE recipes SET pool_type = ? WHERE id IN ({','.join('?' * len(recipe_ids))})
        """, [target_pool] + recipe_ids)
        
        moved = cursor.rowcount
        conn.commit()
        self.close()
        return moved
    
    def bulk_delete_recipes(self, recipe_ids: list) -> int:
        """Toplu tarif silme."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute(f"""
            DELETE FROM recipes WHERE id IN ({','.join('?' * len(recipe_ids))})
        """, recipe_ids)
        
        deleted = cursor.rowcount
        conn.commit()
        self.close()
        return deleted
    
    # ==================== KULLANICI İŞLEMLERİ ====================
    
    def has_users(self) -> bool:
        """Kayıtlı kullanıcı var mı kontrol et."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM users")
        count = cursor.fetchone()[0]
        
        self.close()
        return count > 0
    
    def add_user(self, username: str, password: str, display_name: str = None, role: str = "user") -> int:
        """Yeni kullanıcı ekle."""
        conn = self.connect()
        cursor = conn.cursor()
        
        # Şifreyi hashle
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        cursor.execute("""
            INSERT INTO users (username, password_hash, display_name, role)
            VALUES (?, ?, ?, ?)
        """, (username, password_hash, display_name or username, role))
        
        user_id = cursor.lastrowid
        conn.commit()
        self.close()
        return user_id
    
    def verify_user(self, username: str, password: str) -> Optional[dict]:
        """Kullanıcı adı ve şifre doğrula. Başarılıysa kullanıcı bilgilerini döndür."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM users WHERE username = ? AND is_active = 1", (username,))
        row = cursor.fetchone()
        
        if not row:
            self.close()
            return None
        
        # Şifreyi doğrula
        if bcrypt.checkpw(password.encode('utf-8'), row['password_hash'].encode('utf-8')):
            # Son giriş tarihini güncelle
            cursor.execute("UPDATE users SET last_login = ? WHERE id = ?", 
                          (datetime.now().isoformat(), row['id']))
            conn.commit()
            self.close()
            return dict(row)
        
        self.close()
        return None
    
    def get_user(self, user_id: int) -> Optional[dict]:
        """Kullanıcı bilgilerini getir."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        
        self.close()
        return dict(row) if row else None
    
    def get_user_by_username(self, username: str) -> Optional[dict]:
        """Kullanıcı adına göre kullanıcı bilgilerini getir."""
        conn = self.connect()
        cursor = conn.cursor()
        
        # Windows cp1252 encoding hatasını önlemek için tüm kullanıcıları çekip Python'da filtrele
        try:
            cursor.execute("SELECT * FROM users")
            rows = cursor.fetchall()
        finally:
            self.close()
        
        # Exact match
        for row in rows:
            if row['username'] == username:
                return dict(row)
                
        # Case insensitive match
        target_lower = username.lower()
        for row in rows:
            if row['username'].lower() == target_lower:
                return dict(row)
                
        return None
    
    def get_all_users(self) -> list:
        """Tüm kullanıcıları getir."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, username, display_name, role, avatar_path, is_active, last_login FROM users ORDER BY username")
        rows = cursor.fetchall()
        
        self.close()
        return [dict(row) for row in rows]
    
    def delete_user(self, user_id: int):
        """Kullanıcı sil."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        
        conn.commit()
        self.close()
    
    def update_user_profile(self, user_id: int, username: str = None, password: str = None, avatar_path: str = None, security_question: str = None, security_answer: str = None) -> bool:
        """Kullanıcı profil bilgilerini güncelle."""
        conn = self.connect()
        cursor = conn.cursor()
        
        fields = []
        values = []
        
        if username:
            fields.append("username = ?")
            values.append(username)
            # Eğer kullanıcı adı değişiyorsa display_name'i de güncelle (isteğe bağlı)
            fields.append("display_name = ?")
            values.append(username)
            
        if password:
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            fields.append("password_hash = ?")
            values.append(password_hash)
            
        if avatar_path:
            fields.append("avatar_path = ?")
            values.append(avatar_path)
            
        if security_question:
            fields.append("security_question = ?")
            values.append(security_question)
            
        if security_answer:
            security_answer_hash = bcrypt.hashpw(security_answer.lower().strip().encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            fields.append("security_answer_hash = ?")
            values.append(security_answer_hash)
            
        if not fields:
            self.close()
            return False
            
        values.append(user_id)
        
        try:
            cursor.execute(f"UPDATE users SET {', '.join(fields)} WHERE id = ?", values)
            conn.commit()
            success = True
        except sqlite3.IntegrityError:  # Örn: Kullanıcı adı zaten varsa
            success = False
        finally:
            self.close()
            
        return success

    def reset_password_with_security_answer(self, username: str, security_answer: str, new_password: str) -> bool:
        """Güvenlik sorusunu doğrulayarak şifre sıfırla."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, security_answer_hash FROM users WHERE username = ?", (username,))
        row = cursor.fetchone()
        
        if not row or not row['security_answer_hash']:
            self.close()
            return False
            
        # Cevabı doğrula
        try:
            if bcrypt.checkpw(security_answer.lower().strip().encode('utf-8'), row['security_answer_hash'].encode('utf-8')):
                # Yeni şifreyi hashle ve kaydet
                new_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                cursor.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, row['id']))
                conn.commit()
                self.close()
                return True
        except ValueError:
            pass # Hash formatı bozuksa
            
        self.close()
        return False

    def update_user(self, user_id: int, role: str, is_active: bool, avatar_path: str = None):
        """Kullanıcı bilgilerini güncelle."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE users 
            SET role = ?, is_active = ?, avatar_path = ?
            WHERE id = ?
        """, (role, is_active, avatar_path, user_id))
        
        conn.commit()
        self.close()
    
    def change_password(self, user_id: int, new_password: str):
        """Kullanıcı şifresini değiştir."""
        conn = self.connect()
        cursor = conn.cursor()
        
        # Şifreyi hashle
        password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        cursor.execute("UPDATE users SET password_hash = ? WHERE id = ?", (password_hash, user_id))
        
        conn.commit()
        self.close()

    def verify_password(self, user_id: int, password: str) -> bool:
        """Şifre doğrula (Eski şifre kontrolü için)."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("SELECT password_hash FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        self.close()
        
        if not row:
            return False
            
        return bcrypt.checkpw(password.encode('utf-8'), row['password_hash'].encode('utf-8'))

    # ==================== PAKET İŞLEMLERİ (YENİ SİSTEM) ====================
    
    def add_package(self, name: str, save_path: str, list_count: int = 1, 
                    days_per_list: int = 7, weight_change_per_list: float = 0,
                    description: str = "") -> int:
        """Yeni paket ekle."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO packages (name, description, save_path, list_count, days_per_list, weight_change_per_list)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (name, description, save_path, list_count, days_per_list, weight_change_per_list))
        
        package_id = cursor.lastrowid
        conn.commit()
        self.close()
        return package_id
    
    def update_package(self, package_id: int, name: str, save_path: str, 
                       list_count: int, days_per_list: int, 
                       weight_change_per_list: float, description: str = ""):
        """Paketi güncelle."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE packages 
            SET name = ?, description = ?, save_path = ?, list_count = ?, 
                days_per_list = ?, weight_change_per_list = ?
            WHERE id = ?
        """, (name, description, save_path, list_count, days_per_list, 
              weight_change_per_list, package_id))
        
        conn.commit()
        self.close()
    
    def delete_package(self, package_id: int):
        """Paketi sil."""
        conn = self.connect()
        cursor = conn.cursor()
        
        # Önce tarif-paket ilişkilerini sil
        cursor.execute("DELETE FROM recipe_packages WHERE package_id = ?", (package_id,))
        # Sonra paketi sil
        cursor.execute("DELETE FROM packages WHERE id = ?", (package_id,))
        
        conn.commit()
        self.close()
    
    def get_package(self, package_id: int) -> Optional[dict]:
        """Tek bir paketi getir."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM packages WHERE id = ?", (package_id,))
        row = cursor.fetchone()
        
        self.close()
        return dict(row) if row else None
    
    def get_all_packages(self) -> list:
        """Tüm paketleri getir."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM packages ORDER BY name")
        rows = cursor.fetchall()
        
        self.close()
        return [dict(row) for row in rows]
    
    # ==================== TARİF-PAKET İLİŞKİ İŞLEMLERİ ====================
    
    def add_recipe_to_packages(self, recipe_id: int, package_ids: list):
        """Tarifi belirtilen paketlere ekle."""
        conn = self.connect()
        cursor = conn.cursor()
        
        # Önce mevcut ilişkileri sil
        cursor.execute("DELETE FROM recipe_packages WHERE recipe_id = ?", (recipe_id,))
        
        # Yeni ilişkileri ekle
        for package_id in package_ids:
            cursor.execute("""
                INSERT OR IGNORE INTO recipe_packages (recipe_id, package_id) VALUES (?, ?)
            """, (recipe_id, package_id))
        
        conn.commit()
        self.close()
    
    def remove_recipe_from_package(self, recipe_id: int, package_id: int):
        """Tarifi paketten çıkar."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("""
            DELETE FROM recipe_packages WHERE recipe_id = ? AND package_id = ?
        """, (recipe_id, package_id))
        
        conn.commit()
        self.close()
    
    def get_recipe_packages(self, recipe_id: int) -> list:
        """Tarifin dahil olduğu paketleri getir."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT p.* FROM packages p
            INNER JOIN recipe_packages rp ON p.id = rp.package_id
            WHERE rp.recipe_id = ?
            ORDER BY p.name
        """, (recipe_id,))
        rows = cursor.fetchall()
        
        self.close()
        return [dict(row) for row in rows]
    
    def get_recipes_by_package(self, package_id: int, meal_type: str = None) -> list:
        """Pakete ait tarifleri getir (opsiyonel öğün tipi filtresi ile)."""
        conn = self.connect()
        cursor = conn.cursor()
        
        query = """
            SELECT r.* FROM recipes r
            INNER JOIN recipe_packages rp ON r.id = rp.recipe_id
            WHERE rp.package_id = ?
        """
        params = [package_id]
        
        if meal_type:
            query += " AND r.meal_type = ?"
            params.append(meal_type)
        
        query += " ORDER BY r.name"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        self.close()
        return [dict(row) for row in rows]
    
    def get_recipes_for_diet_by_package(self, package_id: int, meal_type: str, 
                                         exclude_keywords: list = None) -> list:
        """Diyet oluşturmak için pakete ait tarifleri getir (hariç tutma filtresi ile)."""
        recipes = self.get_recipes_by_package(package_id, meal_type)
        
        # Hariç tutma filtresi uygula
        if exclude_keywords:
            filtered_recipes = []
            for recipe in recipes:
                exclude = False
                for keyword in exclude_keywords:
                    keyword_lower = keyword.lower().strip()
                    if keyword_lower:
                        # Tüm BKİ içeriklerinde ara
                        all_content = " ".join([
                            recipe.get('name', '').lower(),
                            recipe.get('bki_21_25', '').lower(),
                            recipe.get('bki_26_29', '').lower(),
                            recipe.get('bki_30_33', '').lower(),
                            recipe.get('bki_34_plus', '').lower()
                        ])
                        if keyword_lower in all_content:
                            exclude = True
                            break
                if not exclude:
                    filtered_recipes.append(recipe)
            recipes = filtered_recipes
        
        return recipes

    # --- Appointment Methods ---
    
    def add_appointment(self, client_name: str, phone: str, date: str, time: str, 
                        types: list, note: str, status: str = 'pending') -> int:
        """Yeni randevu ekle."""
        conn = self.connect()
        cursor = conn.cursor()
        
        types_str = ','.join(types) if types else ''
        
        cursor.execute("""
            INSERT INTO appointments (client_name, phone, date, time, types, note, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (client_name, phone, date, time, types_str, note, status))
        
        appointment_id = cursor.lastrowid
        conn.commit()
        self.close()
        return appointment_id
    
    def update_appointment(self, appointment_id: int, client_name: str, phone: str, 
                          date: str, time: str, types: list, note: str, status: str):
        """Randevuyu güncelle."""
        conn = self.connect()
        cursor = conn.cursor()
        
        types_str = ','.join(types) if types else ''
        
        cursor.execute("""
            UPDATE appointments 
            SET client_name = ?, phone = ?, date = ?, time = ?, types = ?, note = ?, status = ?
            WHERE id = ?
        """, (client_name, phone, date, time, types_str, note, status, appointment_id))
        
        conn.commit()
        self.close()
    
    def delete_appointment(self, appointment_id: int):
        """Randevuyu sil."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM appointments WHERE id = ?", (appointment_id,))
        
        conn.commit()
        self.close()
    
    def get_appointment(self, appointment_id: int) -> dict:
        """Tek bir randevuyu getir."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM appointments WHERE id = ?", (appointment_id,))
        row = cursor.fetchone()
        
        self.close()
        
        if row:
            result = dict(row)
            result['types'] = result['types'].split(',') if result['types'] else []
            return result
        return None
    
    def get_all_appointments(self, date: str = None) -> list:
        """Tüm randevuları getir (opsiyonel tarih filtresi)."""
        conn = self.connect()
        cursor = conn.cursor()
        
        if date:
            cursor.execute("SELECT * FROM appointments WHERE date = ? ORDER BY time", (date,))
        else:
            cursor.execute("SELECT * FROM appointments ORDER BY date, time")
        
        rows = cursor.fetchall()
        self.close()
        
        result = []
        for row in rows:
            appointment = dict(row)
            appointment['types'] = appointment['types'].split(',') if appointment['types'] else []
            result.append(appointment)
        
        return result
    
    def update_appointment_status(self, appointment_id: int, status: str):
        """Randevu durumunu güncelle."""
        conn = self.connect()
        cursor = conn.cursor()
        
        cursor.execute("UPDATE appointments SET status = ? WHERE id = ?", (status, appointment_id))
        
        conn.commit()
        self.close()
