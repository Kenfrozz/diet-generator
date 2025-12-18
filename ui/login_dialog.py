"""
Giriş ekranı - Kullanıcı kimlik doğrulama dialogu.
"""
import os
from PyQt6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QLineEdit,
    QPushButton, QMessageBox, QFrame
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
        self.setFixedSize(400, 500)
        self.setStyleSheet(f"""
            QDialog {{
                background-color: {COLORS['bg_darkest']};
            }}
        """)
        
        # Frameless pencere
        self.setWindowFlags(Qt.WindowType.FramelessWindowHint | Qt.WindowType.Dialog)
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(40, 40, 40, 40)
        layout.setSpacing(20)
        
        # Başlık
        title = QLabel("DetoksBot")
        title.setFont(QFont("Segoe UI", 28, QFont.Weight.Bold))
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title.setStyleSheet(f"""
            color: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                stop:0 {COLORS['accent_lavender']}, stop:1 {COLORS['accent_pink']});
        """)
        layout.addWidget(title)
        
        # Alt başlık
        mode_text = "Hesap Oluştur" if self.is_register_mode else "Giriş Yap"
        self.subtitle = QLabel(mode_text)
        self.subtitle.setFont(QFont("Segoe UI", 14))
        self.subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.subtitle.setStyleSheet(f"color: {COLORS['text_secondary']};")
        layout.addWidget(self.subtitle)
        
        layout.addSpacing(20)
        
        # Kullanıcı adı
        username_label = QLabel("Kullanıcı Adı")
        username_label.setStyleSheet(f"color: {COLORS['text_secondary']}; font-size: 12px;")
        layout.addWidget(username_label)
        
        self.username_input = QLineEdit()
        self.username_input.setPlaceholderText("Kullanıcı adınızı girin")
        self.username_input.setStyleSheet(f"""
            QLineEdit {{
                background-color: {COLORS['bg_dark']};
                border: 1px solid {COLORS['border']};
                border-radius: 10px;
                padding: 14px;
                color: {COLORS['text_primary']};
                font-size: 14px;
            }}
            QLineEdit::placeholder {{
                color: {COLORS['text_secondary']};
            }}
            QLineEdit:focus {{
                border-color: {COLORS['accent_lavender']};
            }}
        """)
        layout.addWidget(self.username_input)
        
        # Şifre
        password_label = QLabel("Şifre")
        password_label.setStyleSheet(f"color: {COLORS['text_secondary']}; font-size: 12px;")
        layout.addWidget(password_label)
        
        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("Şifrenizi girin")
        self.password_input.setEchoMode(QLineEdit.EchoMode.Password)
        self.password_input.setStyleSheet(f"""
            QLineEdit {{
                background-color: {COLORS['bg_dark']};
                border: 1px solid {COLORS['border']};
                border-radius: 10px;
                padding: 14px;
                color: {COLORS['text_primary']};
                font-size: 14px;
            }}
            QLineEdit::placeholder {{
                color: {COLORS['text_secondary']};
            }}
            QLineEdit:focus {{
                border-color: {COLORS['accent_lavender']};
            }}
        """)
        self.password_input.returnPressed.connect(self.handle_action)
        layout.addWidget(self.password_input)
        
        # Şifre onay (sadece kayıt modunda)
        self.confirm_label = QLabel("Şifre Tekrar")
        self.confirm_label.setStyleSheet(f"color: {COLORS['text_secondary']}; font-size: 12px;")
        layout.addWidget(self.confirm_label)
        
        self.confirm_input = QLineEdit()
        self.confirm_input.setPlaceholderText("Şifrenizi tekrar girin")
        self.confirm_input.setEchoMode(QLineEdit.EchoMode.Password)
        self.confirm_input.setStyleSheet(f"""
            QLineEdit {{
                background-color: {COLORS['bg_dark']};
                border: 1px solid {COLORS['border']};
                border-radius: 10px;
                padding: 14px;
                color: {COLORS['text_primary']};
                font-size: 14px;
            }}
            QLineEdit::placeholder {{
                color: {COLORS['text_secondary']};
            }}
            QLineEdit:focus {{
                border-color: {COLORS['accent_lavender']};
            }}
        """)
        self.confirm_input.returnPressed.connect(self.handle_action)
        layout.addWidget(self.confirm_input)
        
        # Kayıt modu değilse şifre onayını gizle
        if not self.is_register_mode:
            self.confirm_label.hide()
            self.confirm_input.hide()
        
        layout.addSpacing(10)
        
        # Hata mesajı
        self.error_label = QLabel("")
        self.error_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.error_label.setStyleSheet(f"color: {COLORS['error']}; font-size: 12px;")
        self.error_label.hide()
        layout.addWidget(self.error_label)
        
        # Giriş/Kayıt butonu
        button_text = "Hesap Oluştur" if self.is_register_mode else "Giriş Yap"
        self.action_btn = QPushButton(button_text)
        self.action_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.action_btn.setStyleSheet(f"""
            QPushButton {{
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 {COLORS['accent_lavender']}, stop:1 {COLORS['accent_pink']});
                color: {COLORS['text_dark']};
                border: none;
                border-radius: 10px;
                padding: 14px;
                font-size: 14px;
                font-weight: 600;
            }}
            QPushButton:hover {{
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 {COLORS['accent_lavender_light']}, stop:1 {COLORS['accent_pink_light']});
            }}
        """)
        self.action_btn.clicked.connect(self.handle_action)
        layout.addWidget(self.action_btn)
        
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
        self.close_btn.move(360, 10)
    
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
    
    # Sürükleme için mouse event'leri
    def mousePressEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton:
            self._drag_pos = event.globalPosition().toPoint() - self.frameGeometry().topLeft()
    
    def mouseMoveEvent(self, event):
        if event.buttons() == Qt.MouseButton.LeftButton and hasattr(self, '_drag_pos'):
            self.move(event.globalPosition().toPoint() - self._drag_pos)
