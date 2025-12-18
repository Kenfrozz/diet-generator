"""
Diyet Oluştur sekmesi - Diyet programı oluşturma arayüzü.
"""
import os
import random
from datetime import datetime, timedelta
from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QComboBox,
    QLineEdit, QPushButton, QGroupBox, QMessageBox, QFileDialog, 
    QSpinBox, QDateEdit, QFormLayout, QGridLayout
)
from PyQt6.QtCore import Qt, QSize, QDate
from PyQt6.QtGui import QFont, QIcon

from document_generator import DocumentGenerator


def get_icon_path(icon_name: str) -> str:
    """İkon dosya yolunu döndür."""
    return os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "icons", icon_name)


from .icon_utils import get_colored_icon, ICON_COLOR_NORMAL, ICON_COLOR_ACTIVE
from .styles import COLORS


# BKİ grupları
BKI_GROUPS = {
    "21_25": "21-25 BKİ",
    "26_29": "26-29 BKİ",
    "30_33": "30-33 BKİ",
    "34_plus": "34+ BKİ"
}

# Türkçe ay adları
TURKISH_MONTHS = {
    1: "OCAK", 2: "ŞUBAT", 3: "MART", 4: "NİSAN",
    5: "MAYIS", 6: "HAZİRAN", 7: "TEMMUZ", 8: "AĞUSTOS",
    9: "EYLÜL", 10: "EKİM", 11: "KASIM", 12: "ARALIK"
}


def format_turkish_date(date: QDate) -> str:
    """Tarihi Türkçe formatta döndür (örn: 1 OCAK)."""
    return f"{date.day()} {TURKISH_MONTHS[date.month()]}"


class DietCreatorWidget(QWidget):
    """Diyet oluşturma widget'ı."""
    
    def __init__(self, db):
        super().__init__()
        self.db = db
        self.setup_ui()
        self.refresh_templates()
    
    def setup_ui(self):
        """Arayüzü oluştur."""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(24, 20, 24, 20)
        layout.setSpacing(12)
        
        # Başlık
        title = QLabel("Diyet Programı Oluştur")
        title.setFont(QFont("Segoe UI", 18, QFont.Weight.Bold))
        title.setStyleSheet("color: #CBCDFF;")
        layout.addWidget(title)
        
        # ==================== ÜST SATIR: Kişisel + Program ====================
        top_row = QHBoxLayout()
        top_row.setSpacing(15)
        
        # Kişisel Bilgiler Grubu (sol)
        personal_group = QGroupBox("Kişisel Bilgiler")
        personal_group.setStyleSheet(self._get_group_style())
        personal_grid = QGridLayout(personal_group)
        personal_grid.setSpacing(8)
        personal_grid.setContentsMargins(12, 20, 12, 12)
        
        # Satır 1: Ad Soyad | Doğum Yılı
        personal_grid.addWidget(self._create_label("Ad Soyad:"), 0, 0)
        self.name_input = QLineEdit()
        self.name_input.setPlaceholderText("Kenan Kanat")
        personal_grid.addWidget(self.name_input, 0, 1)
        
        personal_grid.addWidget(self._create_label("Doğum Yılı:"), 0, 2)
        self.birth_year_spin = QSpinBox()
        self.birth_year_spin.setRange(1940, 2010)
        self.birth_year_spin.setValue(1990)
        personal_grid.addWidget(self.birth_year_spin, 0, 3)
        
        # Satır 2: Boy | Kilo
        personal_grid.addWidget(self._create_label("Boy:"), 1, 0)
        self.height_spin = QSpinBox()
        self.height_spin.setRange(100, 250)
        self.height_spin.setValue(170)
        self.height_spin.setSuffix(" cm")
        self.height_spin.valueChanged.connect(self._update_bki)
        personal_grid.addWidget(self.height_spin, 1, 1)
        
        personal_grid.addWidget(self._create_label("Kilo:"), 1, 2)
        self.weight_spin = QSpinBox()
        self.weight_spin.setRange(30, 300)
        self.weight_spin.setValue(70)
        self.weight_spin.setSuffix(" kg")
        self.weight_spin.valueChanged.connect(self._update_bki)
        personal_grid.addWidget(self.weight_spin, 1, 3)
        
        top_row.addWidget(personal_group, 1)
        
        # Program Ayarları Grubu (sağ)
        program_group = QGroupBox("Program Ayarları")
        program_group.setStyleSheet(self._get_group_style())
        program_grid = QGridLayout(program_group)
        program_grid.setSpacing(8)
        program_grid.setContentsMargins(12, 20, 12, 12)
        
        # Satır 1: Başlama Tarihi | Gün Sayısı
        program_grid.addWidget(self._create_label("Başlama:"), 0, 0)
        self.start_date = QDateEdit()
        self.start_date.setDate(QDate.currentDate())
        self.start_date.setCalendarPopup(True)
        self.start_date.setDisplayFormat("dd.MM.yyyy")
        self.start_date.dateChanged.connect(self._update_end_date_label)
        program_grid.addWidget(self.start_date, 0, 1)
        
        program_grid.addWidget(self._create_label("Gün:"), 0, 2)
        self.days_spin = QSpinBox()
        self.days_spin.setRange(1, 365)
        self.days_spin.setValue(4)
        self.days_spin.valueChanged.connect(self._update_end_date_label)
        program_grid.addWidget(self.days_spin, 0, 3)
        
        # Satır 2: Bitiş Tarihi | Havuz
        program_grid.addWidget(self._create_label("Bitiş:"), 1, 0)
        self.end_date_label = QLabel()
        self.end_date_label.setStyleSheet("color: #CBCDFF; font-weight: 600;")
        self._update_end_date_label()
        program_grid.addWidget(self.end_date_label, 1, 1)
        
        program_grid.addWidget(self._create_label("Havuz:"), 1, 2)
        self.pool_combo = QComboBox()
        self.pool_combo.addItem("Normal", "normal")
        self.pool_combo.addItem("Hastalık", "hastalik")
        program_grid.addWidget(self.pool_combo, 1, 3)
        
        top_row.addWidget(program_group, 1)
        layout.addLayout(top_row)
        
        # ==================== ALT SATIR: Diyet Seçenekleri ====================
        options_group = QGroupBox("Diyet Seçenekleri")
        options_group.setStyleSheet(self._get_group_style())
        options_grid = QGridLayout(options_group)
        options_grid.setSpacing(8)
        options_grid.setContentsMargins(12, 20, 12, 12)
        
        # Satır 1: Kalıp | BKİ
        options_grid.addWidget(self._create_label("Diyet Kalıbı:"), 0, 0)
        self.template_combo = QComboBox()
        self.template_combo.setMinimumWidth(200)
        options_grid.addWidget(self.template_combo, 0, 1)
        
        options_grid.addWidget(self._create_label("BKİ Grubu:"), 0, 2)
        bki_container = QHBoxLayout()
        self.bki_combo = QComboBox()
        for key, name in BKI_GROUPS.items():
            self.bki_combo.addItem(name, key)
        bki_container.addWidget(self.bki_combo)
        self.bki_info_label = QLabel()
        self.bki_info_label.setStyleSheet("color: #9999aa; font-size: 10px;")
        bki_container.addWidget(self.bki_info_label)
        bki_container.addStretch()
        options_grid.addLayout(bki_container, 0, 3)
        
        # Satır 2: Hariç Tut (tam genişlik)
        options_grid.addWidget(self._create_label("Hariç Tut:"), 1, 0)
        self.filter_input = QLineEdit()
        self.filter_input.setPlaceholderText("Örn: domates, yumurta (virgülle ayırın)")
        options_grid.addWidget(self.filter_input, 1, 1, 1, 3)
        
        layout.addWidget(options_group)
        
        # Boşluk
        layout.addStretch()
        
        # Oluştur butonu
        self.create_btn = QPushButton("  Diyet Programı Oluştur")
        self.create_btn.setIcon(get_colored_icon("pdf.svg", "#1a1a2e"))
        self.create_btn.setIconSize(QSize(22, 22))
        self.create_btn.setFont(QFont("Segoe UI", 12, QFont.Weight.Bold))
        self.create_btn.setMinimumHeight(50)
        self.create_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.create_btn.setStyleSheet("""
            QPushButton {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #CBCDFF, stop:1 #F79ACC);
                color: #0f0f1a;
                border: none;
                border-radius: 10px;
                font-weight: 600;
            }
            QPushButton:hover {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #d8daff, stop:1 #f9b3d6);
            }
        """)
        self.create_btn.clicked.connect(self.create_diet)
        layout.addWidget(self.create_btn)
        
        # BKİ'yi güncelle
        self._update_bki()
    
    def _create_label(self, text: str) -> QLabel:
        """Form label'ı."""
        label = QLabel(text)
        label.setStyleSheet("color: #9999aa; background: transparent;")
        return label
    
    def _update_end_date_label(self):
        """Bitiş tarihini güncelle."""
        start = self.start_date.date()
        days = self.days_spin.value()
        end = start.addDays(days - 1)
        self.end_date_label.setText(format_turkish_date(end))
    
    def _update_bki(self):
        """BKİ hesapla ve grubu seç."""
        height_m = self.height_spin.value() / 100
        weight = self.weight_spin.value()
        bki = weight / (height_m * height_m)
        
        if bki <= 25:
            self.bki_combo.setCurrentIndex(0)
        elif bki <= 29:
            self.bki_combo.setCurrentIndex(1)
        elif bki <= 33:
            self.bki_combo.setCurrentIndex(2)
        else:
            self.bki_combo.setCurrentIndex(3)
        
        self.bki_info_label.setText(f"(BKİ: {bki:.1f})")
    
    def _generate_filename(self) -> str:
        """Otomatik dosya adı."""
        name = self.name_input.text().strip().upper()
        if not name:
            name = "DANISAN"
        
        start = self.start_date.date()
        days = self.days_spin.value()
        end = start.addDays(days - 1)
        
        return f"{name} {format_turkish_date(start)} - {format_turkish_date(end)}"
    
    def refresh_templates(self):
        """Kalıp listesini yükle."""
        self.template_combo.clear()
        templates = self.db.get_all_templates()
        for template in templates:
            self.template_combo.addItem(template["name"], template["id"])
    
    def create_diet(self):
        """Diyet programı oluştur."""
        if not self.name_input.text().strip():
            QMessageBox.warning(self, "Uyarı", "Lütfen ad soyad girin.")
            return
        
        pool_type = self.pool_combo.currentData()
        template_id = self.template_combo.currentData()
        bki_group = self.bki_combo.currentData()
        
        if not template_id:
            QMessageBox.warning(self, "Uyarı", "Lütfen bir diyet kalıbı seçin.")
            return
        
        try:
            # Şablonu al
            template = self.db.get_template(template_id)
            if not template:
                raise ValueError("Seçilen şablon bulunamadı.")
            
            # Tarihleri ayarla
            start_date = self.start_date.date()
            days = self.days_spin.value()
            
            # Diyet verilerini hazırla
            diet_data = {
                "name": self.name_input.text().strip().upper(),
                "birth_year": self.birth_year_spin.value(),
                "height": self.height_spin.value(),
                "weight": self.weight_spin.value(),
                "bki": self.weight_spin.value() / ((self.height_spin.value() / 100) ** 2),
                "start_date": format_turkish_date(start_date),
                "end_date": format_turkish_date(start_date.addDays(days - 1)),
                "days": days,
                "template_name": template["name"],
                "excluded_foods": self.filter_input.text().strip(),
                "pool_type": "Hastalık" if pool_type == "hastalik" else "Normal"
            }
            
            # Kayıt yeri sor
            filename = self._generate_filename()
            save_path, _ = QFileDialog.getSaveFileName(
                self, "Kaydet", 
                os.path.join(self.db.get_setting("save_path", os.path.expanduser("~/Desktop")), f"{filename}.pdf"),
                "PDF Dosyası (*.pdf)"
            )
            
            if not save_path:
                return
            
            # PDF oluşturucu
            generator = DocumentGenerator(self.db)
            success = generator.create_program(
                save_path=save_path,
                diet_data=diet_data,
                template_id=template_id,
                start_date=start_date,
                bki_group=bki_group,
                pool_type=pool_type,
                excluded_foods=diet_data["excluded_foods"]
            )
            
            if success:
                QMessageBox.information(self, "Başarılı", f"Diyet programı oluşturuldu:\n{save_path}")
            else:
                QMessageBox.critical(self, "Hata", "Program oluşturulurken bir hata oluştu.")
                
        except Exception as e:
            import traceback
            traceback.print_exc()
            QMessageBox.critical(self, "Hata", f"Beklenmeyen bir hata oluştu:\n{str(e)}")

    def _get_group_style(self) -> str:
        """GroupBox için ortak stil - merkezi COLORS kullanır."""
        return f"""
            QGroupBox {{
                background-color: rgba(26, 26, 46, 0.9);
                border: 1px solid {COLORS["border"]};
                border-radius: 10px;
                margin-top: 14px;
                padding-top: 20px;
            }}
            QGroupBox::title {{
                color: {COLORS["text_accent"]};
                font-weight: 600;
                font-size: 11px;
            }}
            QGroupBox QLineEdit, QGroupBox QSpinBox, QGroupBox QComboBox, QGroupBox QDateEdit {{
                background-color: {COLORS["bg_dark"]};
                border: 1px solid {COLORS["border"]};
                border-radius: 6px;
                padding: 6px 10px;
                color: {COLORS["text_primary"]};
            }}
            QGroupBox QLineEdit:focus, QGroupBox QSpinBox:focus, QGroupBox QComboBox:focus, QGroupBox QDateEdit:focus {{
                border-color: {COLORS["text_accent"]};
            }}
        """
