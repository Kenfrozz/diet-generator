"""
Havuz Yönetimi sekmesi - Havuz yönetimi ve istatistik arayüzü.
"""
import os
from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QTableWidget, QTableWidgetItem, QHeaderView, QDialog,
    QLineEdit, QTextEdit, QFormLayout, QGroupBox, QMessageBox,
    QAbstractItemView, QCheckBox, QColorDialog, QComboBox,
    QTabWidget, QProgressBar, QListWidget, QListWidgetItem
)
from PyQt6.QtCore import Qt, QSize
from PyQt6.QtGui import QFont, QIcon, QColor


def get_icon_path(icon_name: str) -> str:
    """İkon dosya yolunu döndür."""
    return os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "icons", icon_name)


from .icon_utils import get_colored_icon, ICON_COLOR_NORMAL, ICON_COLOR_ACTIVE, ICON_COLOR_ERROR
from .styles import get_table_style, get_input_style, get_groupbox_style, get_search_input_style, get_label_style, get_title_style, get_cancel_button_style, get_primary_button_style, COLORS



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


class ColorButton(QPushButton):
    """Renk seçici buton."""
    
    def __init__(self, color="#6b2fa3", parent=None):
        super().__init__(parent)
        self._color = color
        self.setFixedSize(40, 30)
        self.update_style()
        self.clicked.connect(self.choose_color)
    
    def update_style(self):
        self.setStyleSheet(f"""
            QPushButton {{
                background-color: {self._color};
                border: 2px solid #333;
                border-radius: 4px;
            }}
            QPushButton:hover {{
                border: 2px solid #fff;
            }}
        """)
    
    def choose_color(self):
        color = QColorDialog.getColor(QColor(self._color), self)
        if color.isValid():
            self._color = color.name()
            self.update_style()
    
    def get_color(self):
        return self._color
    
    def set_color(self, color):
        self._color = color
        self.update_style()


class PoolDialog(QDialog):
    """Havuz ekleme/düzenleme dialogu."""
    
    def __init__(self, parent=None, pool=None):
        super().__init__(parent)
        self.pool = pool
        self.setup_ui()
        
        if pool:
            self.load_pool(pool)
    
    def setup_ui(self):
        """Arayüzü oluştur."""
        self.setWindowTitle("Havuz Ekle" if not self.pool else "Havuz Düzenle")
        self.setMinimumSize(400, 300)
        
        layout = QVBoxLayout(self)
        layout.setSpacing(15)
        
        # Form alanları
        form_group = QGroupBox("Havuz Bilgileri")
        form_group.setStyleSheet(get_groupbox_style())
        form_layout = QFormLayout(form_group)
        form_layout.setSpacing(10)
        
        self.name_input = QLineEdit()
        self.name_input.setPlaceholderText("Havuz adı (örn: Vejetaryen)")
        form_layout.addRow("Ad:", self.name_input)
        
        self.desc_input = QTextEdit()
        self.desc_input.setMaximumHeight(80)
        self.desc_input.setPlaceholderText("Havuz açıklaması")
        form_layout.addRow("Açıklama:", self.desc_input)
        
        color_layout = QHBoxLayout()
        self.color_btn = ColorButton("#6b2fa3")
        color_layout.addWidget(self.color_btn)
        color_layout.addStretch()
        form_layout.addRow("Renk:", color_layout)
        
        self.active_check = QCheckBox("Aktif")
        self.active_check.setChecked(True)
        form_layout.addRow("Durum:", self.active_check)
        
        layout.addWidget(form_group)
        
        # Butonlar
        btn_layout = QHBoxLayout()
        
        cancel_btn = QPushButton("İptal")
        cancel_btn.setStyleSheet(get_cancel_button_style())
        cancel_btn.clicked.connect(self.reject)
        btn_layout.addWidget(cancel_btn)
        
        save_btn = QPushButton("  Kaydet")
        save_btn.setIcon(get_colored_icon("save.svg", COLORS["text_dark"]))
        save_btn.setStyleSheet(get_primary_button_style())
        save_btn.clicked.connect(self.validate_and_accept)
        btn_layout.addWidget(save_btn)
        
        layout.addLayout(btn_layout)
    
    def load_pool(self, pool: dict):
        """Mevcut havuzu forma yükle."""
        self.name_input.setText(pool.get("name", ""))
        self.desc_input.setPlainText(pool.get("description", ""))
        self.color_btn.set_color(pool.get("color", "#6b2fa3"))
        self.active_check.setChecked(pool.get("is_active", True))
    
    def validate_and_accept(self):
        """Formu doğrula ve kabul et."""
        if not self.name_input.text().strip():
            QMessageBox.warning(self, "Hata", "Havuz adı boş olamaz!")
            return
        self.accept()
    
    def get_pool_data(self) -> dict:
        """Form verilerini döndür."""
        return {
            "name": self.name_input.text().strip(),
            "description": self.desc_input.toPlainText().strip(),
            "color": self.color_btn.get_color(),
            "is_active": self.active_check.isChecked()
        }


class ActionButtonsWidget(QWidget):
    """Tablo satırı için düzenle/sil butonları."""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        layout = QHBoxLayout(self)
        layout.setContentsMargins(2, 2, 2, 2)
        layout.setSpacing(2)
        
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


class PoolManagerWidget(QWidget):
    """Havuz yönetimi widget'ı."""
    
    def __init__(self, db):
        super().__init__()
        self.db = db
        self.setup_ui()
        self.refresh_pools()
    
    def setup_ui(self):
        """Arayüzü oluştur."""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(24, 24, 24, 24)
        layout.setSpacing(20)
        
        # Başlık - Finrise stili
        title = QLabel("Havuz Yönetimi")
        title.setObjectName("headingLabel")
        title.setFont(QFont("Segoe UI", 20, QFont.Weight.Bold))
        title.setStyleSheet(get_title_style())
        layout.addWidget(title)
        
        # Tab widget
        self.tabs = QTabWidget()
        self.tabs.setFont(QFont("Segoe UI", 10))
        
        # Tab 1: Havuz Listesi
        self.tabs.addTab(self._create_pools_tab(), "Havuzlar")
        
        # Tab 2: İstatistikler
        self.tabs.addTab(self._create_stats_tab(), "İstatistikler")
        
        # Tab 3: Toplu İşlemler
        self.tabs.addTab(self._create_batch_tab(), "Toplu İşlemler")
        
        layout.addWidget(self.tabs)
    
    def _create_pools_tab(self):
        """Havuz listesi sekmesi."""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        layout.setSpacing(15)
        
        # Üst bar
        top_bar = QHBoxLayout()
        top_bar.addStretch()
        
        self.add_pool_btn = QPushButton("  Yeni Havuz Ekle")
        self.add_pool_btn.setIcon(get_colored_icon("add.svg", COLORS["text_dark"]))
        self.add_pool_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.add_pool_btn.setStyleSheet(get_primary_button_style())
        self.add_pool_btn.clicked.connect(self.add_pool)
        top_bar.addWidget(self.add_pool_btn)
        
        layout.addLayout(top_bar)
        
        # Havuz tablosu
        self.pool_table = QTableWidget()
        self.pool_table.setColumnCount(5)
        self.pool_table.setHorizontalHeaderLabels(["ID", "Renk", "Havuz Adı", "Durum", "İşlemler"])
        self.pool_table.horizontalHeader().setSectionResizeMode(2, QHeaderView.ResizeMode.Stretch)
        self.pool_table.setColumnWidth(1, 60)
        self.pool_table.setColumnWidth(3, 80)
        self.pool_table.setColumnWidth(4, 80)
        self.pool_table.setSelectionBehavior(QAbstractItemView.SelectionBehavior.SelectRows)
        self.pool_table.setSelectionMode(QAbstractItemView.SelectionMode.SingleSelection)
        self.pool_table.setEditTriggers(QAbstractItemView.EditTrigger.NoEditTriggers)
        self.pool_table.setColumnHidden(0, True)
        self.pool_table.setAlternatingRowColors(True)
        self.pool_table.setShowGrid(False)
        self.pool_table.setStyleSheet(get_table_style())
        self.pool_table.verticalHeader().setVisible(False)
        self.pool_table.itemSelectionChanged.connect(self.on_pool_selected)
        layout.addWidget(self.pool_table)
        
        return tab
    
    def _create_stats_tab(self):
        """İstatistikler sekmesi."""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        layout.setSpacing(15)
        
        # Havuz seçimi
        select_layout = QHBoxLayout()
        select_layout.addWidget(QLabel("Havuz:"))
        self.stats_pool_combo = QComboBox()
        self.stats_pool_combo.currentIndexChanged.connect(self.refresh_statistics)
        select_layout.addWidget(self.stats_pool_combo, 1)
        layout.addLayout(select_layout)
        
        # İstatistik paneli
        stats_group = QGroupBox("İstatistikler")
        stats_layout = QVBoxLayout(stats_group)
        
        self.total_label = QLabel("Toplam Tarif: 0")
        self.total_label.setFont(QFont("Segoe UI", 12, QFont.Weight.Bold))
        stats_layout.addWidget(self.total_label)
        
        # Öğün dağılımı
        self.meal_stats_layout = QVBoxLayout()
        stats_layout.addLayout(self.meal_stats_layout)
        
        # Eksik öğünler uyarısı
        self.missing_label = QLabel()
        self.missing_label.setStyleSheet("color: #e74c3c;")
        stats_layout.addWidget(self.missing_label)
        
        layout.addWidget(stats_group)
        layout.addStretch()
        
        return tab
    
    def _create_batch_tab(self):
        """Toplu işlemler sekmesi."""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        layout.setSpacing(15)
        
        # Kaynak havuz seçimi
        source_layout = QHBoxLayout()
        source_layout.addWidget(QLabel("Kaynak Havuz:"))
        self.source_pool_combo = QComboBox()
        self.source_pool_combo.currentIndexChanged.connect(self.load_source_recipes)
        source_layout.addWidget(self.source_pool_combo, 1)
        layout.addLayout(source_layout)
        
        # Tarif listesi
        self.recipe_list = QListWidget()
        self.recipe_list.setSelectionMode(QAbstractItemView.SelectionMode.MultiSelection)
        self.recipe_list.setStyleSheet(f"background-color: {COLORS['bg_dark']}; border: 1px solid {COLORS['border']}; border-radius: 8px; padding: 5px;")
        layout.addWidget(self.recipe_list)
        
        # Hedef havuz seçimi
        target_layout = QHBoxLayout()
        target_layout.addWidget(QLabel("Hedef Havuz:"))
        self.target_pool_combo = QComboBox()
        target_layout.addWidget(self.target_pool_combo, 1)
        layout.addLayout(target_layout)
        
        # İşlem butonları
        btn_layout = QHBoxLayout()
        
        copy_btn = QPushButton(" Seçilenleri Kopyala")
        copy_btn.setStyleSheet("""
            QPushButton {
                background-color: #3498db;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
            }
            QPushButton:hover { background-color: #2980b9; }
        """)
        copy_btn.clicked.connect(self.copy_selected_recipes)
        btn_layout.addWidget(copy_btn)
        
        move_btn = QPushButton(" Seçilenleri Taşı")
        move_btn.setStyleSheet("""
            QPushButton {
                background-color: #f39c12;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
            }
            QPushButton:hover { background-color: #e67e22; }
        """)
        move_btn.clicked.connect(self.move_selected_recipes)
        btn_layout.addWidget(move_btn)
        
        delete_btn = QPushButton(" Seçilenleri Sil")
        delete_btn.setStyleSheet("""
            QPushButton {
                background-color: #e74c3c;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
            }
            QPushButton:hover { background-color: #c0392b; }
        """)
        delete_btn.clicked.connect(self.delete_selected_recipes)
        btn_layout.addWidget(delete_btn)
        
        layout.addLayout(btn_layout)
        
        return tab
    
    def refresh_pools(self):
        """Havuz listesini yenile."""
        pools = self.db.get_all_pools()
        
        self.pool_table.setRowCount(len(pools))
        
        for row, pool in enumerate(pools):
            self.pool_table.setItem(row, 0, QTableWidgetItem(str(pool["id"])))
            
            # Renk göstergesi
            color_item = QTableWidgetItem()
            color_item.setBackground(QColor(pool.get("color", "#6b2fa3")))
            self.pool_table.setItem(row, 1, color_item)
            
            self.pool_table.setItem(row, 2, QTableWidgetItem(pool["name"]))
            
            status = "Aktif" if pool.get("is_active", True) else "Pasif"
            status_item = QTableWidgetItem(status)
            status_item.setForeground(QColor("#2ecc71" if pool.get("is_active") else "#e74c3c"))
            self.pool_table.setItem(row, 3, status_item)
            
            # İşlem butonları
            action_widget = ActionButtonsWidget()
            pool_id = pool["id"]
            action_widget.edit_btn.clicked.connect(lambda checked, pid=pool_id: self.edit_pool(pid))
            action_widget.delete_btn.clicked.connect(lambda checked, pid=pool_id: self.delete_pool(pid))
            self.pool_table.setCellWidget(row, 4, action_widget)
        
        # Combo boxları güncelle
        self._update_pool_combos()
    
    def _update_pool_combos(self):
        """Havuz combo boxlarını güncelle."""
        pools = self.db.get_all_pools()
        
        for combo in [self.stats_pool_combo, self.source_pool_combo, self.target_pool_combo]:
            combo.blockSignals(True)
            combo.clear()
            for pool in pools:
                combo.addItem(pool["name"], pool["name"])
            combo.blockSignals(False)
        
        self.refresh_statistics()
        self.load_source_recipes()
    
    def on_pool_selected(self):
        """Havuz seçildiğinde."""
        pass
    
    def add_pool(self):
        """Yeni havuz ekle."""
        dialog = PoolDialog(self)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            data = dialog.get_pool_data()
            try:
                self.db.add_pool(**data)
                self.refresh_pools()
                QMessageBox.information(self, "Başarılı", "Havuz başarıyla eklendi!")
            except Exception as e:
                QMessageBox.warning(self, "Hata", f"Havuz eklenemedi: {str(e)}")
    
    def edit_pool(self, pool_id: int):
        """Havuzu düzenle."""
        pool = self.db.get_pool(pool_id)
        if not pool:
            QMessageBox.warning(self, "Hata", "Havuz bulunamadı!")
            return
        
        dialog = PoolDialog(self, pool)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            data = dialog.get_pool_data()
            self.db.update_pool(pool_id, **data)
            self.refresh_pools()
            QMessageBox.information(self, "Başarılı", "Havuz başarıyla güncellendi!")
    
    def delete_pool(self, pool_id: int):
        """Havuzu sil."""
        if pool_id <= 2:
            QMessageBox.warning(self, "Uyarı", "Varsayılan havuzlar silinemez!")
            return
        
        reply = QMessageBox.question(
            self, "Onay", "Bu havuzu silmek istediğinizden emin misiniz?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        
        if reply == QMessageBox.StandardButton.Yes:
            if self.db.delete_pool(pool_id):
                self.refresh_pools()
                QMessageBox.information(self, "Başarılı", "Havuz başarıyla silindi!")
            else:
                QMessageBox.warning(self, "Hata", "Havuz silinemedi! İçinde tarif olabilir.")
    
    def refresh_statistics(self):
        """İstatistikleri güncelle."""
        pool_name = self.stats_pool_combo.currentData()
        if not pool_name:
            return
        
        stats = self.db.get_pool_statistics(pool_name)
        
        self.total_label.setText(f"Toplam Tarif: {stats['total_recipes']}")
        
        # Mevcut öğün istatistiklerini temizle
        while self.meal_stats_layout.count():
            item = self.meal_stats_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()
        
        # Öğün dağılımını göster
        for meal_type, count in stats['meal_distribution'].items():
            label = QLabel(f"  • {MEAL_TYPES.get(meal_type, meal_type)}: {count} tarif")
            self.meal_stats_layout.addWidget(label)
        
        # Eksik öğünleri göster
        if stats['missing_meal_types']:
            missing_names = [MEAL_TYPES.get(mt, mt) for mt in stats['missing_meal_types']]
            self.missing_label.setText(f"⚠️ Eksik öğün türleri: {', '.join(missing_names)}")
        else:
            self.missing_label.setText("✓ Tüm öğün türleri mevcut")
            self.missing_label.setStyleSheet("color: #2ecc71;")
    
    def load_source_recipes(self):
        """Kaynak havuzun tariflerini yükle."""
        self.recipe_list.clear()
        
        pool_name = self.source_pool_combo.currentData()
        if not pool_name:
            return
        
        recipes = self.db.get_all_recipes(pool_type=pool_name)
        
        for recipe in recipes:
            item = QListWidgetItem(f"{recipe['name']} ({MEAL_TYPES.get(recipe['meal_type'], recipe['meal_type'])})")
            item.setData(Qt.ItemDataRole.UserRole, recipe['id'])
            self.recipe_list.addItem(item)
    
    def get_selected_recipe_ids(self) -> list:
        """Seçili tarif ID'lerini döndür."""
        return [item.data(Qt.ItemDataRole.UserRole) for item in self.recipe_list.selectedItems()]
    
    def copy_selected_recipes(self):
        """Seçili tarifleri kopyala."""
        recipe_ids = self.get_selected_recipe_ids()
        if not recipe_ids:
            QMessageBox.warning(self, "Uyarı", "Lütfen kopyalanacak tarifleri seçin!")
            return
        
        target = self.target_pool_combo.currentData()
        if not target:
            return
        
        copied = self.db.copy_recipes_to_pool(recipe_ids, target)
        QMessageBox.information(self, "Başarılı", f"{copied} tarif kopyalandı!")
        self.refresh_statistics()
    
    def move_selected_recipes(self):
        """Seçili tarifleri taşı."""
        recipe_ids = self.get_selected_recipe_ids()
        if not recipe_ids:
            QMessageBox.warning(self, "Uyarı", "Lütfen taşınacak tarifleri seçin!")
            return
        
        target = self.target_pool_combo.currentData()
        if not target:
            return
        
        moved = self.db.move_recipes_to_pool(recipe_ids, target)
        QMessageBox.information(self, "Başarılı", f"{moved} tarif taşındı!")
        self.load_source_recipes()
        self.refresh_statistics()
    
    def delete_selected_recipes(self):
        """Seçili tarifleri sil."""
        recipe_ids = self.get_selected_recipe_ids()
        if not recipe_ids:
            QMessageBox.warning(self, "Uyarı", "Lütfen silinecek tarifleri seçin!")
            return
        
        reply = QMessageBox.question(
            self, "Onay", f"{len(recipe_ids)} tarif silinecek. Emin misiniz?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        
        if reply == QMessageBox.StandardButton.Yes:
            deleted = self.db.bulk_delete_recipes(recipe_ids)
            QMessageBox.information(self, "Başarılı", f"{deleted} tarif silindi!")
            self.load_source_recipes()
            self.refresh_statistics()
