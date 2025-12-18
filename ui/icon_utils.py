"""
Paylaşılan ikon yardımcı fonksiyonları.
SVG ikonlarını renklendirme desteği.
"""
import os
from PyQt6.QtGui import QIcon, QPixmap, QPainter
from PyQt6.QtCore import Qt, QByteArray


def get_icon_path(icon_name: str) -> str:
    """İkon dosya yolunu döndür."""
    return os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "icons", icon_name)


def get_colored_icon(icon_name: str, color: str, size: int = 64) -> QIcon:
    """SVG ikonunu belirtilen renkte döndür.
    
    Args:
        icon_name: İkon dosya adı (örn: "add.svg")
        color: Hex renk kodu (örn: "#CBCDFF")
        size: İkon boyutu (varsayılan: 64)
    
    Returns:
        Renklendirilmiş QIcon
    """
    from PyQt6.QtSvg import QSvgRenderer
    
    icon_path = get_icon_path(icon_name)
    if not os.path.exists(icon_path):
        return QIcon()
    
    try:
        with open(icon_path, 'r', encoding='utf-8') as f:
            svg_content = f.read()
        
        # Renk değiştirme - yaygın fill/stroke değerlerini değiştir
        color_replacements = [
            ('fill="currentColor"', f'fill="{color}"'),
            ('stroke="currentColor"', f'stroke="{color}"'),
            ('fill="#000000"', f'fill="{color}"'),
            ('fill="#000"', f'fill="{color}"'),
            ('fill="black"', f'fill="{color}"'),
            ('stroke="#000000"', f'stroke="{color}"'),
            ('stroke="#000"', f'stroke="{color}"'),
            ('stroke="black"', f'stroke="{color}"'),
            ('fill="#FFFFFF"', f'fill="{color}"'),
            ('fill="#fff"', f'fill="{color}"'),
            ('fill="white"', f'fill="{color}"'),
            ('stroke="#FFFFFF"', f'stroke="{color}"'),
            ('stroke="#fff"', f'stroke="{color}"'),
            ('stroke="white"', f'stroke="{color}"'),
            # SVG Repo'dan gelen yaygın renkler
            ('stroke="#1C274C"', f'stroke="{color}"'),
            ('fill="#1C274C"', f'fill="{color}"'),
            ('stroke="#1c274c"', f'stroke="{color}"'),
            ('fill="#1c274c"', f'fill="{color}"'),
            # Çok koyu siyah (maximize/restore)
            ('fill="#0F0F0F"', f'fill="{color}"'),
            ('stroke="#0F0F0F"', f'stroke="{color}"'),
            ('fill="#0f0f0f"', f'fill="{color}"'),
            ('stroke="#0f0f0f"', f'stroke="{color}"'),
        ]
        
        for old, new in color_replacements:
            svg_content = svg_content.replace(old, new)
        
        # SVG'yi QPixmap'e dönüştür
        svg_bytes = QByteArray(svg_content.encode('utf-8'))
        renderer = QSvgRenderer(svg_bytes)
        
        pixmap = QPixmap(size, size)
        pixmap.fill(Qt.GlobalColor.transparent)
        painter = QPainter(pixmap)
        renderer.render(painter)
        painter.end()
        
        return QIcon(pixmap)
    except Exception:
        return QIcon(icon_path)

# Renk sabitleri - styles.py'den import (merkezi kaynak)
from .styles import ICON_COLORS

ICON_COLOR_NORMAL = ICON_COLORS["normal"]
ICON_COLOR_HOVER = ICON_COLORS["hover"]
ICON_COLOR_ACTIVE = ICON_COLORS["active"]
ICON_COLOR_SUCCESS = ICON_COLORS["success"]
ICON_COLOR_ERROR = ICON_COLORS["error"]
ICON_COLOR_PINK = ICON_COLORS["pink"]
