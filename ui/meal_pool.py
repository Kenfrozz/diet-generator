"""
Öğün Havuzu sekmesi - Tarif yönetimi arayüzü.
"""
import os
from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QComboBox,
    QPushButton, QTableWidget, QTableWidgetItem, QHeaderView,
    QDialog, QLineEdit, QTextEdit, QFormLayout, QGroupBox,
    QMessageBox, QAbstractItemView
)
from PyQt6.QtCore import Qt, QSize
from PyQt6.QtGui import QFont, QIcon, QColor


def get_icon_path(icon_name: str) -> str:
    """İkon dosya yolunu döndür."""
    return os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "icons", icon_name)


from .icon_utils import get_colored_icon, ICON_COLOR_NORMAL, ICON_COLOR_ACTIVE, ICON_COLOR_ERROR
from .styles import get_table_style, get_input_style, get_search_input_style, get_label_style, get_title_style, get_cancel_button_style, get_primary_button_style, COLORS



# Öğün türleri
MEAL_TYPES = {
    "kahvalti": "Kahvaltı",
    "ara_ogun_1": "Ara Öğün 1",
    "ogle": "Öğle Yemeği",
    "ara_ogun_2": "Ara Öğün 2",
    "aksam": "Akşam Yemeği",
    "ara_ogun_3": "Ara Öğün 3",
    "ozel_icecek": "Özel İçecek"
}

# Havuz türleri
POOL_TYPES = {
    "normal": "Normal",
    "hastalik": "Hastalık"
}


class ActionButtonsWidget(QWidget):
    """Tablo satırı için düzenle/sil butonları."""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(4)
        
        self.edit_btn = QPushButton()
        self.edit_btn.setIcon(get_colored_icon("edit.svg", ICON_COLOR_NORMAL))
        self.edit_btn.setIconSize(QSize(16, 16))
        self.edit_btn.setFixedSize(26, 26)
        self.edit_btn.setStyleSheet("""
            QPushButton { 
                border: none; 
                background-color: transparent;
                border-radius: 6px;
            } 
            QPushButton:hover { 
                background-color: rgba(203, 205, 255, 0.2); 
            }
        """)
        self.edit_btn.setToolTip("Düzenle")
        layout.addWidget(self.edit_btn)
        
        self.delete_btn = QPushButton()
        self.delete_btn.setIcon(get_colored_icon("delete.svg", ICON_COLOR_ERROR))
        self.delete_btn.setIconSize(QSize(16, 16))
        self.delete_btn.setFixedSize(26, 26)
        self.delete_btn.setStyleSheet("""
            QPushButton { 
                border: none; 
                background-color: transparent;
                border-radius: 6px;
            } 
            QPushButton:hover { 
                background-color: rgba(248, 113, 113, 0.2); 
            }
        """)
        self.delete_btn.setToolTip("Sil")
        layout.addWidget(self.delete_btn)


class RecipeDialog(QDialog):
    """Tarif ekleme/düzenleme dialogu."""
    
    def __init__(self, parent=None, recipe=None, pool_type="normal"):
        super().__init__(parent)
        self.recipe = recipe
        self.pool_type = pool_type
        self.setup_ui()
        
        if recipe:
            self.load_recipe(recipe)
    
    def setup_ui(self):
        """Arayüzü oluştur."""
        self.setWindowTitle("Tarif Ekle" if not self.recipe else "Tarif Düzenle")
        self.setMinimumSize(600, 700)
        
        layout = QVBoxLayout(self)
        layout.setSpacing(15)
        
        # Temel bilgiler
        basic_group = QGroupBox("Temel Bilgiler")
        basic_layout = QFormLayout(basic_group)
        
        self.name_input = QLineEdit()
        self.name_input.setPlaceholderText("Tarif adını girin")
        basic_layout.addRow("Tarif Adı:", self.name_input)
        
        self.meal_type_combo = QComboBox()
        for key, name in MEAL_TYPES.items():
            self.meal_type_combo.addItem(name, key)
        basic_layout.addRow("Öğün Türü:", self.meal_type_combo)
        
        # Havuz türü bilgisi (sadece görüntüleme)
        pool_label = QLabel(POOL_TYPES.get(self.pool_type, self.pool_type))
        pool_label.setStyleSheet("font-weight: bold; color: #3498db;")
        basic_layout.addRow("Havuz:", pool_label)
        
        layout.addWidget(basic_group)
        
        # BKİ metinleri
        bki_group = QGroupBox("BKİ Gruplarına Göre Tarifler")
        bki_layout = QVBoxLayout(bki_group)
        
        # 21-25 BKİ
        bki_layout.addWidget(QLabel("21-25 BKİ:"))
        self.bki_21_25_input = QTextEdit()
        self.bki_21_25_input.setMaximumHeight(80)
        self.bki_21_25_input.setPlaceholderText("21-25 BKİ grubu için tarif metnini girin")
        bki_layout.addWidget(self.bki_21_25_input)
        
        # 26-29 BKİ
        bki_layout.addWidget(QLabel("26-29 BKİ:"))
        self.bki_26_29_input = QTextEdit()
        self.bki_26_29_input.setMaximumHeight(80)
        self.bki_26_29_input.setPlaceholderText("26-29 BKİ grubu için tarif metnini girin")
        bki_layout.addWidget(self.bki_26_29_input)
        
        # 30-33 BKİ
        bki_layout.addWidget(QLabel("30-33 BKİ:"))
        self.bki_30_33_input = QTextEdit()
        self.bki_30_33_input.setMaximumHeight(80)
        self.bki_30_33_input.setPlaceholderText("30-33 BKİ grubu için tarif metnini girin")
        bki_layout.addWidget(self.bki_30_33_input)
        
        # 34+ BKİ
        bki_layout.addWidget(QLabel("34+ BKİ:"))
        self.bki_34_plus_input = QTextEdit()
        self.bki_34_plus_input.setMaximumHeight(80)
        self.bki_34_plus_input.setPlaceholderText("34+ BKİ grubu için tarif metnini girin")
        bki_layout.addWidget(self.bki_34_plus_input)
        
        layout.addWidget(bki_group)
        
        # Butonlar
        btn_layout = QHBoxLayout()
        
        self.cancel_btn = QPushButton("İptal")
        self.cancel_btn.setStyleSheet("""
            QPushButton {
                background-color: transparent;
                color: #9999aa;
                border: 1px solid #2d2d50;
                padding: 10px 30px;
                border-radius: 8px;
            }
            QPushButton:hover {
                background-color: #2a2a4a;
                color: #FFFFFF;
            }
        """)
        self.cancel_btn.clicked.connect(self.reject)
        btn_layout.addWidget(self.cancel_btn)
        
        self.save_btn = QPushButton("  Kaydet")
        self.save_btn.setIcon(get_colored_icon("save.svg", "#1a1a2e"))
        self.save_btn.setStyleSheet("""
            QPushButton {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #CBCDFF, stop:1 #F79ACC);
                color: #0f0f1a;
                border: none;
                padding: 10px 30px;
                border-radius: 8px;
                font-weight: 600;
            }
            QPushButton:hover {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #d8daff, stop:1 #f9b3d6);
            }
        """)
        self.save_btn.clicked.connect(self.validate_and_accept)
        btn_layout.addWidget(self.save_btn)
        
        layout.addLayout(btn_layout)
    
    def load_recipe(self, recipe: dict):
        """Mevcut tarifi forma yükle."""
        self.name_input.setText(recipe["name"])
        
        # Öğün türünü seç
        meal_index = self.meal_type_combo.findData(recipe["meal_type"])
        if meal_index >= 0:
            self.meal_type_combo.setCurrentIndex(meal_index)
        
        # BKİ metinlerini yükle
        self.bki_21_25_input.setPlainText(recipe.get("bki_21_25", ""))
        self.bki_26_29_input.setPlainText(recipe.get("bki_26_29", ""))
        self.bki_30_33_input.setPlainText(recipe.get("bki_30_33", ""))
        self.bki_34_plus_input.setPlainText(recipe.get("bki_34_plus", ""))
    
    def validate_and_accept(self):
        """Formu doğrula ve kabul et."""
        if not self.name_input.text().strip():
            QMessageBox.warning(self, "Hata", "Tarif adı boş olamaz!")
            return
        
        if not self.bki_21_25_input.toPlainText().strip():
            QMessageBox.warning(self, "Hata", "En az 21-25 BKİ grubu için metin girilmelidir!")
            return
        
        self.accept()
    
    def get_recipe_data(self) -> dict:
        """Form verilerini döndür."""
        return {
            "name": self.name_input.text().strip(),
            "meal_type": self.meal_type_combo.currentData(),
            "pool_type": self.pool_type,
            "bki_21_25": self.bki_21_25_input.toPlainText().strip(),
            "bki_26_29": self.bki_26_29_input.toPlainText().strip() or self.bki_21_25_input.toPlainText().strip(),
            "bki_30_33": self.bki_30_33_input.toPlainText().strip() or self.bki_21_25_input.toPlainText().strip(),
            "bki_34_plus": self.bki_34_plus_input.toPlainText().strip() or self.bki_21_25_input.toPlainText().strip(),
        }


class MealPoolWidget(QWidget):
    """Öğün havuzu yönetim widget'ı."""
    
    def __init__(self, db, pool_type=None):
        super().__init__()
        self.db = db
        self.pool_type = pool_type  # None = göster hepsini, dinamik seçim
        self.current_page = 1
        self.items_per_page = 50
        self.total_items = 0
        self.total_pages = 1
        self.all_recipes = []  # Filtrelenmiş tüm tarifler
        self.setup_ui()
    
    def setup_ui(self):
        """Arayüzü oluştur."""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(24, 24, 24, 24)
        layout.setSpacing(20)
        
        # Başlık ve açıklama
        title = QLabel("Tarif Yönetim Sistemi")
        title.setFont(QFont("Segoe UI", 22, QFont.Weight.Bold))
        title.setStyleSheet("color: #FFFFFF;")
        layout.addWidget(title)
        
        subtitle = QLabel("Tarifleri görüntüleyin, arayın, filtreleyin ve yönetin")
        subtitle.setFont(QFont("Segoe UI", 11))
        subtitle.setStyleSheet("color: #9999aa;")
        layout.addWidget(subtitle)
        
        # Üst bar: Arama | Filtreler | Export | Ekle
        top_bar_layout = QHBoxLayout()
        
        # Arama kutusu
        search_label = QLabel("Ara:")
        search_label.setStyleSheet("color: #9999aa;")
        top_bar_layout.addWidget(search_label)
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("Tarif adı ara...")
        self.search_input.setFixedWidth(180)
        self.search_input.setStyleSheet("background-color: #1a1a2e; border: 1px solid #2d2d50; border-radius: 6px; padding: 8px;")
        self.search_input.textChanged.connect(self.refresh_recipes)
        top_bar_layout.addWidget(self.search_input)
        
        # Havuz filtresi
        pool_label = QLabel("Havuz:")
        pool_label.setStyleSheet("color: #9999aa;")
        top_bar_layout.addWidget(pool_label)
        self.pool_filter = QComboBox()
        self.pool_filter.setMinimumWidth(150)
        self.pool_filter.setStyleSheet("background-color: #1a1a2e; border: 1px solid #2d2d50; border-radius: 6px; padding: 8px;")
        self.pool_filter.currentIndexChanged.connect(self.refresh_recipes)
        top_bar_layout.addWidget(self.pool_filter)
        
        # Öğün filtresi
        meal_label = QLabel("Öğün:")
        meal_label.setStyleSheet("color: #9999aa;")
        top_bar_layout.addWidget(meal_label)
        self.meal_filter = QComboBox()
        self.meal_filter.addItem("Tümü", None)
        for key, name in MEAL_TYPES.items():
            self.meal_filter.addItem(name, key)
        self.meal_filter.setStyleSheet("background-color: #1a1a2e; border: 1px solid #2d2d50; border-radius: 6px; padding: 8px;")
        self.meal_filter.currentIndexChanged.connect(self.refresh_recipes)
        top_bar_layout.addWidget(self.meal_filter)
        
        top_bar_layout.addStretch()
        
        # Export butonu
        self.export_btn = QPushButton("  Export")
        self.export_btn.setIcon(get_colored_icon("export.svg", "#FFFFFF"))
        self.export_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.export_btn.setStyleSheet("""
            QPushButton {
                background-color: transparent;
                border: 1px solid #2d2d50;
                border-radius: 8px;
                padding: 10px 20px;
                color: #FFFFFF;
            }
            QPushButton:hover {
                background-color: #2a2a4a;
            }
        """)
        top_bar_layout.addWidget(self.export_btn)
        
        # Ekle butonu - Finrise gradient
        self.add_btn = QPushButton("  Yeni Tarif Ekle")
        self.add_btn.setIcon(get_colored_icon("add.svg", "#1a1a2e"))
        self.add_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.add_btn.setStyleSheet("""
            QPushButton {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #CBCDFF, stop:1 #F79ACC);
                color: #0f0f1a;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: 600;
            }
            QPushButton:hover {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #d8daff, stop:1 #f9b3d6);
            }
        """)
        self.add_btn.clicked.connect(self.add_recipe)
        top_bar_layout.addWidget(self.add_btn)
        
        layout.addLayout(top_bar_layout)
        
        # Tablo
        self.table = QTableWidget()
        self.table.setColumnCount(5)
        self.table.setHorizontalHeaderLabels(["ID", "Tarif Adı", "Havuz", "Öğün Türü", "İşlemler"])
        self.table.horizontalHeader().setSectionResizeMode(1, QHeaderView.ResizeMode.Fixed)
        self.table.horizontalHeader().setSectionResizeMode(3, QHeaderView.ResizeMode.Stretch)
        self.table.horizontalHeader().setSectionResizeMode(4, QHeaderView.ResizeMode.Fixed)
        self.table.setColumnWidth(1, 300)
        self.table.setColumnWidth(2, 120)
        self.table.setColumnWidth(4, 100)
        self.table.setSelectionBehavior(QAbstractItemView.SelectionBehavior.SelectRows)
        self.table.setSelectionMode(QAbstractItemView.SelectionMode.SingleSelection)
        self.table.setEditTriggers(QAbstractItemView.EditTrigger.NoEditTriggers)
        self.table.setColumnHidden(0, True)
        self.table.setAlternatingRowColors(True)
        self.table.setShowGrid(False)
        self.table.setStyleSheet(get_table_style())
        self.table.verticalHeader().setVisible(False)
        # Satır yüksekliğini ayarla (butonlar için yeterli alan)
        self.table.verticalHeader().setDefaultSectionSize(50)
        # Başlıkları sola hizala
        self.table.horizontalHeader().setDefaultAlignment(Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignVCenter)
        layout.addWidget(self.table)
        
        # Sayfalama footer
        pagination_layout = QHBoxLayout()
        
        self.page_info = QLabel("Toplam 0 tarif")
        self.page_info.setStyleSheet("color: #9999aa;")
        pagination_layout.addWidget(self.page_info)
        
        pagination_layout.addStretch()
        
        # Sayfa kontrolleri
        self.prev_btn = QPushButton("<")
        self.prev_btn.setFixedWidth(36)
        self.prev_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.prev_btn.setStyleSheet("""
            QPushButton {
                background-color: transparent;
                border: 1px solid #2d2d50;
                border-radius: 6px;
                padding: 6px;
                color: #FFFFFF;
            }
            QPushButton:hover { background-color: #2a2a4a; }
            QPushButton:disabled { color: #555555; }
        """)
        self.prev_btn.clicked.connect(self.prev_page)
        pagination_layout.addWidget(self.prev_btn)
        
        self.page_label = QLabel("Sayfa 1 / 1")
        self.page_label.setStyleSheet("color: #FFFFFF; padding: 0 12px;")
        pagination_layout.addWidget(self.page_label)
        
        self.next_btn = QPushButton(">")
        self.next_btn.setFixedWidth(36)
        self.next_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.next_btn.setStyleSheet("""
            QPushButton {
                background-color: transparent;
                border: 1px solid #2d2d50;
                border-radius: 6px;
                padding: 6px;
                color: #FFFFFF;
            }
            QPushButton:hover { background-color: #2a2a4a; }
            QPushButton:disabled { color: #555555; }
        """)
        self.next_btn.clicked.connect(self.next_page)
        pagination_layout.addWidget(self.next_btn)
        
        layout.addLayout(pagination_layout)
        
        # Havuzları yükle
        self._load_pools()
        self.refresh_recipes()
    
    def _load_pools(self):
        """Havuz listesini yükle."""
        self.pool_filter.blockSignals(True)
        self.pool_filter.clear()
        self.pool_filter.addItem("Tüm Havuzlar", None)
        
        pools = self.db.get_all_pools(active_only=True)
        self.pool_colors = {}  # Havuz renklerini cache'le
        for pool in pools:
            self.pool_filter.addItem(pool["name"], pool["name"])
            self.pool_colors[pool["name"]] = pool.get("color", "#6b7280")
        
        self.pool_filter.blockSignals(False)
    
    def refresh_recipes(self):
        """Tarif listesini yenile."""
        pool_type = self.pool_filter.currentData()
        meal_type = self.meal_filter.currentData()
        search_text = self.search_input.text().strip().lower()
        
        recipes = self.db.get_all_recipes(pool_type, meal_type)
        
        # Arama filtresi uygula
        if search_text:
            recipes = [r for r in recipes if search_text in r["name"].lower()]
        
        # Sayfalama hesapla
        self.all_recipes = recipes
        self.total_items = len(recipes)
        self.total_pages = max(1, (self.total_items + self.items_per_page - 1) // self.items_per_page)
        
        # Sayfa sınırlarını kontrol et
        if self.current_page > self.total_pages:
            self.current_page = self.total_pages
        if self.current_page < 1:
            self.current_page = 1
        
        # Mevcut sayfa verilerini al
        start_idx = (self.current_page - 1) * self.items_per_page
        end_idx = start_idx + self.items_per_page
        page_recipes = recipes[start_idx:end_idx]
        
        self.table.setRowCount(len(page_recipes))
        
        for row, recipe in enumerate(page_recipes):
            self.table.setItem(row, 0, QTableWidgetItem(str(recipe["id"])))
            self.table.setItem(row, 1, QTableWidgetItem(recipe["name"]))
            
            # Havuz ismi - veritabanından renk ile
            pool_name = recipe.get("pool_type", "")
            pool_item = QTableWidgetItem(pool_name)
            if pool_name and hasattr(self, 'pool_colors'):
                pool_color = self.pool_colors.get(pool_name, "#6b7280")
                pool_item.setForeground(QColor(pool_color))
            self.table.setItem(row, 2, pool_item)
            
            self.table.setItem(row, 3, QTableWidgetItem(MEAL_TYPES.get(recipe["meal_type"], recipe["meal_type"])))
            
            # İşlem butonları
            action_widget = ActionButtonsWidget()
            recipe_id = recipe["id"]
            action_widget.edit_btn.clicked.connect(lambda checked, rid=recipe_id: self.edit_recipe(rid))
            action_widget.delete_btn.clicked.connect(lambda checked, rid=recipe_id: self.delete_recipe(rid))
            self.table.setCellWidget(row, 4, action_widget)
        
        # Sayfalama bilgilerini güncelle
        self._update_pagination_info()
    
    def _update_pagination_info(self):
        """Sayfalama bilgilerini güncelle."""
        start = (self.current_page - 1) * self.items_per_page + 1 if self.total_items > 0 else 0
        end = min(self.current_page * self.items_per_page, self.total_items)
        
        self.page_info.setText(f"Toplam {self.total_items} tarif ({start}-{end} arası gösteriliyor)")
        self.page_label.setText(f"Sayfa {self.current_page} / {self.total_pages}")
        
        self.prev_btn.setEnabled(self.current_page > 1)
        self.next_btn.setEnabled(self.current_page < self.total_pages)
    
    def prev_page(self):
        """Önceki sayfaya git."""
        if self.current_page > 1:
            self.current_page -= 1
            self.refresh_recipes()
    
    def next_page(self):
        """Sonraki sayfaya git."""
        if self.current_page < self.total_pages:
            self.current_page += 1
            self.refresh_recipes()
    
    def get_current_pool(self):
        """Seçili havuz türünü döndür."""
        pool = self.pool_filter.currentData()
        return pool if pool else "normal"  # Varsayılan normal
    
    def add_recipe(self):
        """Yeni tarif ekle."""
        dialog = RecipeDialog(self, pool_type=self.get_current_pool())
        if dialog.exec() == QDialog.DialogCode.Accepted:
            data = dialog.get_recipe_data()
            self.db.add_recipe(**data)
            self.refresh_recipes()
            QMessageBox.information(self, "Başarılı", "Tarif başarıyla eklendi!")
    
    def edit_recipe(self, recipe_id: int = None):
        """Tarifi düzenle."""
        if recipe_id is None:
            return
        
        recipe = self.db.get_recipe(recipe_id)
        if not recipe:
            QMessageBox.warning(self, "Hata", "Tarif bulunamadı!")
            return
        
        dialog = RecipeDialog(self, recipe, pool_type=recipe.get("pool_type", "normal"))
        if dialog.exec() == QDialog.DialogCode.Accepted:
            data = dialog.get_recipe_data()
            self.db.update_recipe(recipe_id, **data)
            self.refresh_recipes()
            QMessageBox.information(self, "Başarılı", "Tarif başarıyla güncellendi!")
    
    def delete_recipe(self, recipe_id: int = None):
        """Tarifi sil."""
        if recipe_id is None:
            return
        
        reply = QMessageBox.question(
            self,
            "Onay",
            "Bu tarifi silmek istediğinizden emin misiniz?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        
        if reply == QMessageBox.StandardButton.Yes:
            self.db.delete_recipe(recipe_id)
            self.refresh_recipes()
            QMessageBox.information(self, "Başarılı", "Tarif başarıyla silindi!")
