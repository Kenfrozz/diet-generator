"""
Özel widget'lar - Yeniden kullanılabilir bileşenler.
"""
from PyQt6.QtWidgets import QWidget, QHBoxLayout, QLabel
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QFont


# Havuz renkleri
POOL_COLORS = {
    "normal": {"bg": "#dc2626", "text": "#ffffff"},        # Kırmızı - Türk Mutfağı gibi
    "detoks": {"bg": "#16a34a", "text": "#ffffff"},        # Yeşil - Vejetaryen gibi
    "vegan": {"bg": "#22c55e", "text": "#ffffff"},         # Açık yeşil
    "vejeteryan": {"bg": "#10b981", "text": "#ffffff"},    # Teal
    "glutensiz": {"bg": "#3b82f6", "text": "#ffffff"},     # Mavi
    "akdeniz": {"bg": "#0ea5e9", "text": "#ffffff"},       # Açık mavi
    "dunya": {"bg": "#f97316", "text": "#ffffff"},         # Turuncu
    "default": {"bg": "#6b7280", "text": "#ffffff"},       # Gri
}


class PoolBadgeWidget(QWidget):
    """Havuz türü için renkli badge widget'ı."""
    
    def __init__(self, pool_name: str, parent=None):
        super().__init__(parent)
        self.setup_ui(pool_name)
    
    def setup_ui(self, pool_name: str):
        """Arayüzü oluştur."""
        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)
        
        # Renkleri belirle
        pool_key = pool_name.lower().replace(" ", "_").replace("ı", "i").replace("ü", "u").replace("ö", "o")
        
        # Anahtar kelime eşleştirmesi
        colors = POOL_COLORS.get("default")
        for key, color in POOL_COLORS.items():
            if key in pool_key or pool_key in key:
                colors = color
                break
        
        # Badge label
        self.badge = QLabel(pool_name)
        self.badge.setFont(QFont("Segoe UI", 9, QFont.Weight.Medium))
        self.badge.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.badge.setStyleSheet(f"""
            QLabel {{
                background-color: {colors["bg"]};
                color: {colors["text"]};
                padding: 4px 12px;
                border-radius: 12px;
            }}
        """)
        
        layout.addWidget(self.badge)
        layout.addStretch()

