"""
Giriş ekranı - Kullanıcı kimlik doğrulama dialogu.
"""
import os
from PyQt6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QLineEdit,
    QPushButton, QMessageBox, QFrame, QCheckBox
)
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QFont, QPixmap

from .styles import COLORS, get_primary_button_style, get_input_style


class LoginDialog(QDialog):
    """Kullanıcı giriş/kayıt dialogu."""
    
    def __init__(self, db, parent=None):
        super().__init__(parent)
        self.db = db
        self.current_user = None
        self.is_register_mode = not db.has_users()  # Kullanıcı yoksa kayıt modu
        self.setup_ui()
    
    def setup_ui(self):
        """Arayüzü oluştur."""
        self.setWindowTitle("DetoksBot - Giriş")
        self.setFixedSize(450, 680)
        self.setStyleSheet(f"""
            QDialog {{
                background-color: {COLORS['bg_darkest']};
            }}
        """)
        
        # Frameless pencere
        self.setWindowFlags(Qt.WindowType.FramelessWindowHint | Qt.WindowType.Dialog)
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(50, 30, 50, 30)
        layout.setSpacing(12)
        
        # Logo
        logo_label = QLabel()
        logo_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        logo_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "icons", "app_icon.png")
        if os.path.exists(logo_path):
            pixmap = QPixmap(logo_path)
            scaled_pixmap = pixmap.scaled(80, 80, Qt.AspectRatioMode.KeepAspectRatio, Qt.TransformationMode.SmoothTransformation)
            logo_label.setPixmap(scaled_pixmap)
        logo_label.setStyleSheet("background: transparent;")
        layout.addWidget(logo_label)
        
        layout.addSpacing(4)
        
        # Başlık
        title = QLabel("DetoksBot")
        title.setFont(QFont("Segoe UI", 26, QFont.Weight.Bold))
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title.setStyleSheet(f"""
            color: {COLORS['accent_lavender']};
        """)
        layout.addWidget(title)
        
        # Alt başlık
        mode_text = "Hesap Oluştur" if self.is_register_mode else "Giriş Yap"
        self.subtitle = QLabel(mode_text)
        self.subtitle.setFont(QFont("Segoe UI", 13))
        self.subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.subtitle.setStyleSheet(f"color: {COLORS['text_secondary']};")
        layout.addWidget(self.subtitle)
        
        layout.addSpacing(24)
        
        # Ortak input stili - Modern ve premium görünüm
        input_style = f"""
            QLineEdit {{
                background-color: {COLORS['bg_dark']};
                border: 2px solid {COLORS['border']};
                border-radius: 12px;
                padding: 14px 16px;
                color: {COLORS['text_primary']};
                font-size: 14px;
                font-family: 'Segoe UI';
            }}
            QLineEdit::placeholder {{
                color: {COLORS['text_secondary']};
            }}
            QLineEdit:hover {{
                border-color: {COLORS['accent_lavender']}40;
                background-color: {COLORS['bg_darker']};
            }}
            QLineEdit:focus {{
                border-color: {COLORS['accent_lavender']};
                background-color: {COLORS['bg_darker']};
            }}
        """
        
        # Ortak label stili
        label_style = f"color: {COLORS['text_secondary']}; font-size: 13px; font-weight: 500; margin-bottom: 4px;"
        
        # Kullanıcı adı
        username_label = QLabel("Kullanıcı Adı")
        username_label.setStyleSheet(label_style)
        layout.addWidget(username_label)
        
        self.username_input = QLineEdit()
        self.username_input.setPlaceholderText("Kullanıcı adınızı girin")
        self.username_input.setFixedHeight(50)
        self.username_input.setStyleSheet(input_style)
        layout.addWidget(self.username_input)
        
        layout.addSpacing(8)
        
        # Şifre
        password_label = QLabel("Şifre")
        password_label.setStyleSheet(label_style)
        layout.addWidget(password_label)
        
        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("Şifrenizi girin")
        self.password_input.setEchoMode(QLineEdit.EchoMode.Password)
        self.password_input.setFixedHeight(50)
        self.password_input.setStyleSheet(input_style)
        self.password_input.returnPressed.connect(self.handle_action)
        layout.addWidget(self.password_input)
        
        layout.addSpacing(8)
        
        # Şifre onay (sadece kayıt modunda)
        self.confirm_label = QLabel("Şifre Tekrar")
        self.confirm_label.setStyleSheet(label_style)
        layout.addWidget(self.confirm_label)
        
        self.confirm_input = QLineEdit()
        self.confirm_input.setPlaceholderText("Şifrenizi tekrar girin")
        self.confirm_input.setEchoMode(QLineEdit.EchoMode.Password)
        self.confirm_input.setFixedHeight(50)
        self.confirm_input.setStyleSheet(input_style)
        self.confirm_input.returnPressed.connect(self.handle_action)
        layout.addWidget(self.confirm_input)
        
        # Kayıt modu değilse şifre onayını gizle
        if not self.is_register_mode:
            self.confirm_label.hide()
            self.confirm_input.hide()
        
        layout.addSpacing(8)
        
        # Hata mesajı
        self.error_label = QLabel("")
        self.error_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.error_label.setStyleSheet(f"""
            color: {COLORS['error']}; 
            font-size: 12px;
            padding: 8px;
            background-color: rgba(248, 113, 113, 0.1);
            border-radius: 8px;
        """)
        self.error_label.hide()
        layout.addWidget(self.error_label)
        
        # Oturumu açık tut checkbox (şifre onay gizli ise göster)
        self.remember_checkbox = QCheckBox("Oturumu açık tut")
        self.remember_checkbox.setStyleSheet(f"""
            QCheckBox {{
                color: {COLORS['text_secondary']};
                font-size: 13px;
                spacing: 8px;
            }}
            QCheckBox::indicator {{
                width: 18px;
                height: 18px;
                border-radius: 4px;
                border: 2px solid {COLORS['border']};
                background-color: {COLORS['bg_dark']};
            }}
            QCheckBox::indicator:hover {{
                border-color: {COLORS['accent_lavender']};
            }}
            QCheckBox::indicator:checked {{
                background-color: {COLORS['accent_lavender']};
                border-color: {COLORS['accent_lavender']};
            }}
        """)
        # Kayıt modunda gizle
        if self.is_register_mode:
            self.remember_checkbox.hide()
        layout.addWidget(self.remember_checkbox)
        
        layout.addSpacing(8)
        
        # Giriş/Kayıt butonu
        button_text = "Hesap Oluştur" if self.is_register_mode else "Giriş Yap"
        self.action_btn = QPushButton(button_text)
        self.action_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.action_btn.setFixedHeight(50)
        self.action_btn.setStyleSheet(f"""
            QPushButton {{
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 {COLORS['accent_lavender']}, stop:1 {COLORS['accent_pink']});
                color: {COLORS['text_dark']};
                border: none;
                border-radius: 12px;
                font-size: 15px;
                font-weight: 600;
                font-family: 'Segoe UI';
            }}
            QPushButton:hover {{
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 {COLORS['accent_lavender_light']}, stop:1 {COLORS['accent_pink_light']});
            }}
            QPushButton:pressed {{
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 {COLORS['accent_lavender']}, stop:1 {COLORS['accent_pink']});
            }}
        """)
        self.action_btn.clicked.connect(self.handle_action)
        layout.addWidget(self.action_btn)
        
        # Login/Register geçiş butonu
        toggle_container = QHBoxLayout()
        toggle_container.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        toggle_text = "Zaten hesabınız var mı?" if self.is_register_mode else "Hesabınız yok mu?"
        self.toggle_label = QLabel(toggle_text)
        self.toggle_label.setStyleSheet(f"color: {COLORS['text_secondary']}; font-size: 12px;")
        toggle_container.addWidget(self.toggle_label)
        
        toggle_btn_text = "Giriş Yap" if self.is_register_mode else "Kayıt Ol"
        self.toggle_btn = QPushButton(toggle_btn_text)
        self.toggle_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.toggle_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: transparent;
                color: {COLORS['accent_lavender']};
                border: none;
                font-size: 12px;
                font-weight: 600;
                padding: 0 4px;
            }}
            QPushButton:hover {{
                color: {COLORS['accent_pink']};
                text-decoration: underline;
            }}
        """)
        self.toggle_btn.clicked.connect(self.toggle_mode)
        toggle_container.addWidget(self.toggle_btn)
        
        layout.addLayout(toggle_container)
        
        layout.addStretch()
        
        # Kapat butonu (sağ üst köşe)
        self.close_btn = QPushButton("✕")
        self.close_btn.setFixedSize(30, 30)
        self.close_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: transparent;
                color: {COLORS['text_secondary']};
                border: none;
                font-size: 16px;
            }}
            QPushButton:hover {{
                color: {COLORS['error']};
            }}
        """)
        self.close_btn.clicked.connect(self.reject)
        self.close_btn.setParent(self)
        self.close_btn.move(410, 10)
    
    def handle_action(self):
        """Giriş veya kayıt işlemini gerçekleştir."""
        username = self.username_input.text().strip()
        password = self.password_input.text()
        
        if not username:
            self.show_error("Kullanıcı adı boş olamaz!")
            return
        
        if not password:
            self.show_error("Şifre boş olamaz!")
            return
        
        if len(password) < 4:
            self.show_error("Şifre en az 4 karakter olmalıdır!")
            return
        
        if self.is_register_mode:
            # Kayıt modu
            confirm = self.confirm_input.text()
            if password != confirm:
                self.show_error("Şifreler eşleşmiyor!")
                return
            
            try:
                self.db.add_user(username, password, role="admin")
                self.current_user = self.db.get_user_by_username(username)
                self.accept()
            except Exception as e:
                self.show_error(f"Kayıt hatası: {str(e)}")
        else:
            # Giriş modu
            user = self.db.verify_user(username, password)
            if user:
                self.current_user = user
                
                # Oturumu açık tut seçili ise kaydet
                if self.remember_checkbox.isChecked():
                    self.db.set_setting("remembered_user_id", str(user['id']))
                else:
                    # Oturum bilgisini temizle
                    self.db.set_setting("remembered_user_id", "")
                
                self.accept()
            else:
                self.show_error("Kullanıcı adı veya şifre hatalı!")
    
    def show_error(self, message: str):
        """Hata mesajı göster."""
        self.error_label.setText(message)
        self.error_label.show()
    
    def get_user(self) -> dict:
        """Giriş yapan kullanıcıyı döndür."""
        return self.current_user
    
    def toggle_mode(self):
        """Login ve Register modları arasında geçiş yap."""
        self.is_register_mode = not self.is_register_mode
        
        # Arayüz öğelerini güncelle
        if self.is_register_mode:
            self.subtitle.setText("Hesap Oluştur")
            self.action_btn.setText("Hesap Oluştur")
            self.toggle_label.setText("Zaten hesabınız var mı?")
            self.toggle_btn.setText("Giriş Yap")
            self.confirm_label.show()
            self.confirm_input.show()
            self.remember_checkbox.hide()
        else:
            self.subtitle.setText("Giriş Yap")
            self.action_btn.setText("Giriş Yap")
            self.toggle_label.setText("Hesabınız yok mu?")
            self.toggle_btn.setText("Kayıt Ol")
            self.confirm_label.hide()
            self.confirm_input.hide()
            self.remember_checkbox.show()
        
        # Form alanlarını temizle
        self.username_input.clear()
        self.password_input.clear()
        self.confirm_input.clear()
        self.error_label.hide()
        self.remember_checkbox.setChecked(False)
    
    # Sürükleme için mouse event'leri
    def mousePressEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton:
            self._drag_pos = event.globalPosition().toPoint() - self.frameGeometry().topLeft()
    
    def mouseMoveEvent(self, event):
        if event.buttons() == Qt.MouseButton.LeftButton and hasattr(self, '_drag_pos'):
            self.move(event.globalPosition().toPoint() - self._drag_pos)
