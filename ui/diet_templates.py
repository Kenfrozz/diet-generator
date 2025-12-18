"""
Diyet Kalıpları sekmesi - Kalıp yönetimi arayüzü.
"""
import os
from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QTableWidget, QTableWidgetItem, QHeaderView, QDialog,
    QLineEdit, QComboBox, QFormLayout, QGroupBox, QMessageBox,
    QAbstractItemView, QTimeEdit, QScrollArea
)
from PyQt6.QtCore import Qt, QTime, QSize
from PyQt6.QtGui import QFont, QIcon


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


class MealRowWidget(QWidget):
    """Tek bir öğün satırı widget'ı."""
    
    def __init__(self, time_str="08:00", meal_name="", meal_type="kahvalti", parent=None):
        super().__init__(parent)
        self.setup_ui(time_str, meal_name, meal_type)
    
    def setup_ui(self, time_str, meal_name, meal_type):
        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 2, 0, 2)
        
        # Saat
        self.time_edit = QTimeEdit()
        hours, mins = map(int, time_str.split(":"))
        self.time_edit.setTime(QTime(hours, mins))
        self.time_edit.setDisplayFormat("HH:mm")
        self.time_edit.setFixedWidth(80)
        layout.addWidget(self.time_edit)
        
        # Öğün adı
        self.name_input = QLineEdit()
        self.name_input.setText(meal_name)
        self.name_input.setPlaceholderText("Öğün adı")
        layout.addWidget(self.name_input, 1)
        
        # Öğün türü
        self.type_combo = QComboBox()
        for key, name in MEAL_TYPES.items():
            self.type_combo.addItem(name, key)
        type_index = self.type_combo.findData(meal_type)
        if type_index >= 0:
            self.type_combo.setCurrentIndex(type_index)
        layout.addWidget(self.type_combo)
        
        # Sil butonu
        self.delete_btn = QPushButton()
        self.delete_btn.setIcon(get_colored_icon("delete.svg", ICON_COLOR_ERROR))
        self.delete_btn.setIconSize(QSize(16, 16))
        self.delete_btn.setFixedWidth(40)
        self.delete_btn.setStyleSheet("QPushButton { border: none; } QPushButton:hover { background-color: #ffebee; }")
        layout.addWidget(self.delete_btn)
    
    def get_data(self):
        """Öğün verisini döndür."""
        return (
            self.time_edit.time().toString("HH:mm"),
            self.name_input.text().strip(),
            self.type_combo.currentData()
        )


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


class TemplateDialog(QDialog):
    """Kalıp ekleme/düzenleme dialogu."""
    
    def __init__(self, parent=None, template=None):
        super().__init__(parent)
        self.template = template
        self.meal_rows = []
        self.setup_ui()
        
        if template:
            self.load_template(template)
    
    def setup_ui(self):
        """Arayüzü oluştur."""
        self.setWindowTitle("Kalıp Ekle" if not self.template else "Kalıp Düzenle")
        self.setMinimumSize(600, 500)
        
        layout = QVBoxLayout(self)
        layout.setSpacing(15)
        
        # Kalıp adı
        name_group = QGroupBox("Kalıp Bilgileri")
        name_layout = QFormLayout(name_group)
        self.name_input = QLineEdit()
        self.name_input.setPlaceholderText("Kalıp adını girin")
        name_layout.addRow("Kalıp Adı:", self.name_input)
        layout.addWidget(name_group)
        
        # Öğünler
        meals_group = QGroupBox("Öğünler")
        meals_layout = QVBoxLayout(meals_group)
        
        # Öğün listesi scroll area
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        self.meals_container = QWidget()
        self.meals_list_layout = QVBoxLayout(self.meals_container)
        self.meals_list_layout.setSpacing(5)
        scroll.setWidget(self.meals_container)
        meals_layout.addWidget(scroll)
        
        # Öğün ekle butonu
        add_meal_btn = QPushButton(" Öğün Ekle")
        add_meal_btn.setIcon(get_colored_icon("add.svg", ICON_COLOR_ACTIVE))
        add_meal_btn.clicked.connect(lambda: self.add_meal_row())
        meals_layout.addWidget(add_meal_btn)
        
        layout.addWidget(meals_group, 1)
        
        # Butonlar
        btn_layout = QHBoxLayout()
        
        cancel_btn = QPushButton("İptal")
        cancel_btn.setStyleSheet("""
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
        cancel_btn.clicked.connect(self.reject)
        btn_layout.addWidget(cancel_btn)
        
        save_btn = QPushButton("  Kaydet")
        save_btn.setIcon(get_colored_icon("save.svg", "#1a1a2e"))
        save_btn.setStyleSheet("""
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
        save_btn.clicked.connect(self.validate_and_accept)
        btn_layout.addWidget(save_btn)
        
        layout.addLayout(btn_layout)
        
        # Varsayılan bir öğün ekle
        if not self.template:
            self.add_meal_row("08:00", "", "kahvalti")
    
    def add_meal_row(self, time_str="08:00", meal_name="", meal_type="kahvalti"):
        """Yeni öğün satırı ekle."""
        row = MealRowWidget(time_str, meal_name, meal_type)
        row.delete_btn.clicked.connect(lambda: self.remove_meal_row(row))
        self.meal_rows.append(row)
        self.meals_list_layout.addWidget(row)
    
    def remove_meal_row(self, row):
        """Öğün satırını kaldır."""
        if len(self.meal_rows) <= 1:
            QMessageBox.warning(self, "Uyarı", "En az bir öğün olmalıdır!")
            return
        
        self.meal_rows.remove(row)
        row.deleteLater()
    
    def load_template(self, template: dict):
        """Mevcut kalıbı forma yükle."""
        self.name_input.setText(template["name"])
        
        for time_str, meal_name, meal_type in template.get("meals", []):
            self.add_meal_row(time_str, meal_name, meal_type)
    
    def validate_and_accept(self):
        """Formu doğrula ve kabul et."""
        if not self.name_input.text().strip():
            QMessageBox.warning(self, "Hata", "Kalıp adı boş olamaz!")
            return
        
        for row in self.meal_rows:
            _, meal_name, _ = row.get_data()
            if not meal_name:
                QMessageBox.warning(self, "Hata", "Tüm öğünlerin adı girilmelidir!")
                return
        
        self.accept()
    
    def get_template_data(self) -> dict:
        """Form verilerini döndür."""
        meals = [row.get_data() for row in self.meal_rows]
        # Saate göre sırala
        meals.sort(key=lambda x: x[0])
        
        return {
            "name": self.name_input.text().strip(),
            "meals": meals
        }


class DietTemplatesWidget(QWidget):
    """Diyet kalıpları yönetim widget'ı."""
    
    def __init__(self, db):
        super().__init__()
        self.db = db
        self.setup_ui()
        self.refresh_templates()
    
    def setup_ui(self):
        """Arayüzü oluştur."""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(24, 24, 24, 24)
        layout.setSpacing(20)
        
        # Başlık - Finrise stili
        title = QLabel("Diyet Kalıpları")
        title.setObjectName("headingLabel")
        title.setFont(QFont("Segoe UI", 20, QFont.Weight.Bold))
        title.setStyleSheet("color: #CBCDFF;")
        layout.addWidget(title)
        
        # Üst bar: Arama ve Ekle butonu
        top_bar_layout = QHBoxLayout()
        
        # Arama kutusu
        search_label = QLabel("Ara:")
        search_label.setStyleSheet("color: #9999aa;")
        top_bar_layout.addWidget(search_label)
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("Kalıp adı ara...")
        self.search_input.setFixedWidth(220)
        self.search_input.setStyleSheet(f"background-color: {COLORS['bg_dark']}; border: 1px solid {COLORS['border']}; border-radius: 6px; padding: 8px;")
        self.search_input.textChanged.connect(self.refresh_templates)
        top_bar_layout.addWidget(self.search_input)
        
        top_bar_layout.addStretch()
        
        # Ekle butonu - Finrise gradient
        self.add_btn = QPushButton("  Yeni Kalıp Ekle")
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
        self.add_btn.clicked.connect(self.add_template)
        top_bar_layout.addWidget(self.add_btn)
        
        layout.addLayout(top_bar_layout)
        
        # Tablo
        self.table = QTableWidget()
        self.table.setColumnCount(4)
        self.table.setHorizontalHeaderLabels(["ID", "Kalıp Adı", "Öğün Sayısı", "İşlemler"])
        self.table.horizontalHeader().setSectionResizeMode(1, QHeaderView.ResizeMode.Stretch)
        self.table.horizontalHeader().setSectionResizeMode(3, QHeaderView.ResizeMode.Fixed)
        self.table.setColumnWidth(3, 80)
        self.table.setSelectionBehavior(QAbstractItemView.SelectionBehavior.SelectRows)
        self.table.setSelectionMode(QAbstractItemView.SelectionMode.SingleSelection)
        self.table.setEditTriggers(QAbstractItemView.EditTrigger.NoEditTriggers)
        self.table.setColumnHidden(0, True)
        self.table.setAlternatingRowColors(True)
        self.table.setShowGrid(False)
        self.table.setStyleSheet(get_table_style())
        self.table.verticalHeader().setVisible(False)
        layout.addWidget(self.table)
    
    def refresh_templates(self):
        """Kalıp listesini yenile."""
        search_text = self.search_input.text().strip().lower()
        templates = self.db.get_all_templates()
        
        # Arama filtresi uygula
        if search_text:
            templates = [t for t in templates if search_text in t["name"].lower()]
        
        self.table.setRowCount(len(templates))
        
        for row, template in enumerate(templates):
            self.table.setItem(row, 0, QTableWidgetItem(str(template["id"])))
            self.table.setItem(row, 1, QTableWidgetItem(template["name"]))
            
            # Öğün sayısını getir
            full_template = self.db.get_template(template["id"])
            meal_count = len(full_template["meals"]) if full_template else 0
            self.table.setItem(row, 2, QTableWidgetItem(str(meal_count)))
            
            # İşlem butonları
            action_widget = ActionButtonsWidget()
            template_id = template["id"]
            action_widget.edit_btn.clicked.connect(lambda checked, tid=template_id: self.edit_template(tid))
            action_widget.delete_btn.clicked.connect(lambda checked, tid=template_id: self.delete_template(tid))
            self.table.setCellWidget(row, 3, action_widget)
    
    def add_template(self):
        """Yeni kalıp ekle."""
        dialog = TemplateDialog(self)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            data = dialog.get_template_data()
            self.db.add_template(data["name"], data["meals"])
            self.refresh_templates()
            QMessageBox.information(self, "Başarılı", "Kalıp başarıyla eklendi!")
    
    def edit_template(self, template_id: int = None):
        """Kalıbı düzenle."""
        if template_id is None:
            return
        
        template = self.db.get_template(template_id)
        if not template:
            QMessageBox.warning(self, "Hata", "Kalıp bulunamadı!")
            return
        
        dialog = TemplateDialog(self, template)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            data = dialog.get_template_data()
            self.db.update_template(template_id, data["name"], data["meals"])
            self.refresh_templates()
            QMessageBox.information(self, "Başarılı", "Kalıp başarıyla güncellendi!")
    
    def delete_template(self, template_id: int = None):
        """Kalıbı sil."""
        if template_id is None:
            return
        
        reply = QMessageBox.question(
            self,
            "Onay",
            "Bu kalıbı silmek istediğinizden emin misiniz?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        
        if reply == QMessageBox.StandardButton.Yes:
            self.db.delete_template(template_id)
            self.refresh_templates()
            QMessageBox.information(self, "Başarılı", "Kalıp başarıyla silindi!")
