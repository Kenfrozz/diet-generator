"""
Global UI stilleri - Tüm widget'lar için tutarlı görünüm.
Finrise teması renkleri ve tablo stilleri.

TÜM RENK KODLARI BU DOSYADA TANIMLIDIR.
Diğer dosyalar renklere bu dosyadaki COLORS sözlüğünden erişmelidir.
"""

# ==================== MERKEZI RENK TANIMLARI ====================
COLORS = {
    # Arka planlar
    "bg_darkest": "#0f0f1a",       # En koyu (ana içerik alanı)
    "bg_dark": "#1a1a2e",          # Koyu (sidebar, kartlar, inputlar)
    "bg_card": "#1a1a2e",          # Kart arka planı (bg_dark ile aynı)
    "bg_hover": "#2a2a4a",         # Hover state
    "bg_active": "#2d2d50",        # Aktif/selected state
    "bg_selected": "rgba(203, 205, 255, 0.15)",  # Seçili öğe (şeffaf lavender)
    
    # Kenarlıklar
    "border": "#2d2d50",           # Normal kenarlık
    "border_light": "#3d3d60",     # Açık kenarlık (hover)
    
    # Metinler
    "text_primary": "#FFFFFF",     # Ana metin (beyaz)
    "text_secondary": "#9999aa",   # İkincil metin (gri)
    "text_accent": "#CBCDFF",      # Vurgu metin (lavender)
    "text_dark": "#0f0f1a",        # Koyu metin (butonlar için)
    
    # Ana vurgu renkleri (Finrise gradient)
    "accent_lavender": "#CBCDFF",  # Lavender
    "accent_pink": "#F79ACC",      # Pembe
    "accent_lavender_light": "#d8daff",  # Açık lavender (hover)
    "accent_pink_light": "#f9b3d6",      # Açık pembe (hover)
    
    # Durum renkleri
    "success": "#4ade80",          # Başarı (yeşil)
    "error": "#f87171",            # Hata (kırmızı)
    "warning": "#fbbf24",          # Uyarı (sarı)
    
    # Özel renkler
    "summer": "#ffd700",           # Yaz mevsimi (altın)
    "winter": "#87ceeb",           # Kış mevsimi (açık mavi)
    
    # Şeffaflık
    "transparent": "transparent",
}

# İkon renkleri (styles'dan erişilebilir)
ICON_COLORS = {
    "normal": COLORS["text_secondary"],    # #9999aa
    "hover": COLORS["text_primary"],       # #FFFFFF
    "active": COLORS["accent_lavender"],   # #CBCDFF
    "success": COLORS["success"],          # #4ade80
    "error": COLORS["error"],              # #f87171
    "pink": COLORS["accent_pink"],         # #F79ACC
}


# ==================== STİL FONKSİYONLARI ====================

def get_table_style() -> str:
    """Finrise temalı tablo stili - temiz ve modern."""
    return f"""
        QTableWidget {{
            background-color: {COLORS["bg_dark"]};
            alternate-background-color: {COLORS["bg_dark"]};
            border: none;
            border-radius: 8px;
            gridline-color: transparent;
            color: {COLORS["text_primary"]};
            selection-background-color: {COLORS["bg_selected"]};
            selection-color: {COLORS["text_accent"]};
        }}
        QTableWidget::item {{
            padding: 12px 16px;
            border-bottom: 1px solid {COLORS["border"]};
            font-size: 13px;
        }}
        QTableWidget::item:hover {{
            background-color: {COLORS["bg_hover"]};
        }}
        QTableWidget::item:selected {{
            background-color: {COLORS["bg_selected"]};
            color: {COLORS["text_accent"]};
        }}
        QHeaderView::section {{
            background-color: {COLORS["bg_dark"]};
            color: {COLORS["text_secondary"]};
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            text-align: left;
            padding: 12px 16px;
            border: none;
            border-bottom: 1px solid {COLORS["border"]};
        }}
        QHeaderView::section:last {{
            border-right: none;
        }}
        QTableWidget QTableCornerButton::section {{
            background-color: {COLORS["bg_dark"]};
            border: none;
        }}
        QScrollBar:vertical {{
            background-color: {COLORS["bg_dark"]};
            width: 8px;
            border-radius: 4px;
        }}
        QScrollBar::handle:vertical {{
            background-color: {COLORS["border_light"]};
            border-radius: 4px;
            min-height: 30px;
        }}
        QScrollBar::handle:vertical:hover {{
            background-color: {COLORS["text_secondary"]};
        }}
        QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
            height: 0px;
        }}
        QScrollBar:horizontal {{
            background-color: {COLORS["bg_dark"]};
            height: 8px;
            border-radius: 4px;
        }}
        QScrollBar::handle:horizontal {{
            background-color: {COLORS["border_light"]};
            border-radius: 4px;
            min-width: 30px;
        }}
        QScrollBar::handle:horizontal:hover {{
            background-color: {COLORS["text_secondary"]};
        }}
        QScrollBar::add-line:horizontal, QScrollBar::sub-line:horizontal {{
            width: 0px;
        }}
    """


def get_input_style() -> str:
    """Finrise temalı input stili."""
    return f"""
        QLineEdit, QComboBox, QSpinBox, QTimeEdit, QDateEdit {{
            background-color: {COLORS["bg_dark"]};
            border: 1px solid {COLORS["border"]};
            border-radius: 8px;
            padding: 10px 14px;
            color: {COLORS["text_primary"]};
            min-height: 20px;
        }}
        QLineEdit:focus, QComboBox:focus, QSpinBox:focus, QTimeEdit:focus, QDateEdit:focus {{
            border-color: {COLORS["accent_lavender"]};
        }}
        QLineEdit:hover, QComboBox:hover, QSpinBox:hover, QTimeEdit:hover, QDateEdit:hover {{
            border-color: {COLORS["border_light"]};
        }}
        QComboBox::drop-down {{
            border: none;
            padding-right: 12px;
        }}
        QComboBox::down-arrow {{
            image: none;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 6px solid {COLORS["text_secondary"]};
        }}
        QComboBox QAbstractItemView {{
            background-color: {COLORS["bg_dark"]};
            border: 1px solid {COLORS["border"]};
            border-radius: 8px;
            selection-background-color: {COLORS["bg_hover"]};
            color: {COLORS["text_primary"]};
            padding: 4px;
        }}
    """


def get_groupbox_style() -> str:
    """Finrise temalı GroupBox stili."""
    return f"""
        QGroupBox {{
            background-color: {COLORS["bg_dark"]};
            border: 1px solid {COLORS["border"]};
            border-radius: 12px;
            margin-top: 16px;
            padding: 24px 20px 20px 20px;
            font-weight: 600;
            color: {COLORS["text_accent"]};
        }}
        QGroupBox::title {{
            subcontrol-origin: margin;
            subcontrol-position: top left;
            left: 20px;
            padding: 2px 12px;
            background-color: {COLORS["bg_dark"]};
            border-radius: 6px;
            color: {COLORS["text_accent"]};
        }}
    """


def get_button_style() -> str:
    """Finrise temalı normal buton stili."""
    return f"""
        QPushButton {{
            background-color: {COLORS["bg_hover"]};
            border: 1px solid {COLORS["border"]};
            border-radius: 8px;
            padding: 10px 18px;
            color: {COLORS["text_primary"]};
            font-weight: 500;
        }}
        QPushButton:hover {{
            background-color: {COLORS["border_light"]};
            border-color: {COLORS["border_light"]};
        }}
        QPushButton:pressed {{
            background-color: {COLORS["bg_darkest"]};
        }}
    """


def get_primary_button_style() -> str:
    """Finrise gradient buton stili (ana aksiyon butonları için)."""
    return f"""
        QPushButton {{
            background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                stop:0 {COLORS["accent_lavender"]}, stop:1 {COLORS["accent_pink"]});
            color: {COLORS["text_dark"]};
            border: none;
            border-radius: 10px;
            padding: 10px 20px;
            font-weight: 600;
        }}
        QPushButton:hover {{
            background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                stop:0 {COLORS["accent_lavender_light"]}, stop:1 {COLORS["accent_pink_light"]});
        }}
    """


def get_secondary_button_style() -> str:
    """İkincil buton stili (iptal, geri gibi)."""
    return f"""
        QPushButton {{
            background-color: {COLORS["transparent"]};
            color: {COLORS["text_secondary"]};
            border: 1px solid {COLORS["border"]};
            padding: 10px 25px;
            border-radius: 8px;
        }}
        QPushButton:hover {{
            background-color: {COLORS["bg_hover"]};
            color: {COLORS["text_primary"]};
        }}
    """


def get_danger_button_style() -> str:
    """Tehlike butonu stili (silme işlemleri için)."""
    return f"""
        QPushButton {{
            background-color: rgba(248, 113, 113, 0.2);
            border: 1px solid {COLORS["error"]};
            color: {COLORS["error"]};
            border-radius: 8px;
            padding: 10px 18px;
        }}
        QPushButton:hover {{
            background-color: rgba(248, 113, 113, 0.3);
        }}
    """


def get_label_style(color_key: str = "text_secondary") -> str:
    """Label stili."""
    return f"color: {COLORS[color_key]}; background: transparent;"


def get_title_style() -> str:
    """Başlık etiketi stili."""
    return f"color: {COLORS['text_accent']};"


def get_search_input_style() -> str:
    """Arama kutusu stili."""
    return f"""
        background-color: {COLORS["bg_dark"]}; 
        border: 1px solid {COLORS["border"]}; 
        border-radius: 6px; 
        padding: 8px;
        color: {COLORS["text_primary"]};
    """


def get_cancel_button_style() -> str:
    """İptal butonu stili."""
    return f"""
        QPushButton {{
            background-color: {COLORS["transparent"]};
            color: {COLORS["text_secondary"]};
            border: 1px solid {COLORS["border"]};
            padding: 10px 30px;
            border-radius: 8px;
        }}
        QPushButton:hover {{
            background-color: {COLORS["bg_hover"]};
            color: {COLORS["text_primary"]};
        }}
    """


def get_global_stylesheet() -> str:
    """Tüm uygulama için global stylesheet - COLORS kullanır."""
    return f"""
        /* ==================== GENEL STİLLER ==================== */
        
        * {{
            font-family: 'Segoe UI', 'Arial', sans-serif;
        }}
        
        QWidget {{
            color: {COLORS["text_primary"]};
        }}
        
        /* ==================== TABLO STİLLERİ ==================== */
        
        QTableWidget {{
            background-color: {COLORS["bg_dark"]};
            gridline-color: {COLORS["border"]};
            border: 1px solid {COLORS["border"]};
            border-radius: 8px;
            selection-background-color: {COLORS["bg_selected"]};
        }}
        
        QTableWidget::item {{
            padding: 8px 12px;
            border-bottom: 1px solid {COLORS["border"]};
            font-size: 13px;
        }}
        
        QTableWidget::item:hover {{
            background-color: rgba(203, 205, 255, 0.1);
        }}
        
        QTableWidget::item:selected {{
            background-color: {COLORS["bg_selected"]};
            color: {COLORS["text_accent"]};
        }}
        
        QHeaderView::section {{
            background-color: {COLORS["bg_dark"]};
            color: {COLORS["text_accent"]};
            padding: 10px 12px;
            border: none;
            border-bottom: 2px solid {COLORS["text_accent"]};
            font-weight: 600;
            font-size: 12px;
            text-align: left;
        }}
        
        QHeaderView::section:hover {{
            background-color: {COLORS["bg_hover"]};
        }}
        
        /* ==================== COMBOBOX ==================== */
        
        QComboBox {{
            background-color: {COLORS["bg_dark"]};
            border: 1px solid {COLORS["border"]};
            border-radius: 8px;
            padding: 8px 12px;
            min-height: 20px;
            color: {COLORS["text_primary"]};
        }}
        
        QComboBox:hover {{
            border-color: {COLORS["text_accent"]};
        }}
        
        QComboBox:focus {{
            border-color: {COLORS["text_accent"]};
            background-color: {COLORS["bg_hover"]};
        }}
        
        QComboBox::drop-down {{
            border: none;
            padding-right: 12px;
        }}
        
        QComboBox::down-arrow {{
            width: 12px;
            height: 12px;
        }}
        
        QComboBox QAbstractItemView {{
            background-color: {COLORS["bg_dark"]};
            border: 1px solid {COLORS["border"]};
            border-radius: 8px;
            selection-background-color: {COLORS["bg_selected"]};
            outline: none;
        }}
        
        QComboBox QAbstractItemView::item {{
            padding: 10px 12px;
            min-height: 24px;
        }}
        
        QComboBox QAbstractItemView::item:hover {{
            background-color: rgba(203, 205, 255, 0.1);
        }}
        
        QComboBox QAbstractItemView::item:selected {{
            background-color: {COLORS["bg_selected"]};
            color: {COLORS["text_accent"]};
        }}
        
        /* ==================== LINE EDIT ==================== */
        
        QLineEdit {{
            background-color: {COLORS["bg_dark"]};
            border: 1px solid {COLORS["border"]};
            border-radius: 8px;
            padding: 10px 12px;
            color: {COLORS["text_primary"]};
            selection-background-color: rgba(203, 205, 255, 0.3);
        }}
        
        QLineEdit:hover {{
            border-color: {COLORS["border_light"]};
        }}
        
        QLineEdit:focus {{
            border-color: {COLORS["text_accent"]};
            background-color: {COLORS["bg_hover"]};
        }}
        
        /* ==================== TEXT EDIT ==================== */
        
        QTextEdit {{
            background-color: {COLORS["bg_dark"]};
            border: 1px solid {COLORS["border"]};
            border-radius: 8px;
            padding: 8px;
            color: {COLORS["text_primary"]};
            selection-background-color: rgba(203, 205, 255, 0.3);
        }}
        
        QTextEdit:hover {{
            border-color: {COLORS["border_light"]};
        }}
        
        QTextEdit:focus {{
            border-color: {COLORS["text_accent"]};
            background-color: {COLORS["bg_hover"]};
        }}
        
        /* ==================== SPINBOX ==================== */
        
        QSpinBox, QDoubleSpinBox {{
            background-color: {COLORS["bg_dark"]};
            border: 1px solid {COLORS["border"]};
            border-radius: 8px;
            padding: 8px 12px;
            color: {COLORS["text_primary"]};
        }}
        
        QSpinBox:hover, QDoubleSpinBox:hover {{
            border-color: {COLORS["border_light"]};
        }}
        
        QSpinBox:focus, QDoubleSpinBox:focus {{
            border-color: {COLORS["text_accent"]};
        }}
        
        QSpinBox::up-button, QSpinBox::down-button,
        QDoubleSpinBox::up-button, QDoubleSpinBox::down-button {{
            background-color: {COLORS["border"]};
            border: none;
            width: 20px;
        }}
        
        QSpinBox::up-button:hover, QSpinBox::down-button:hover,
        QDoubleSpinBox::up-button:hover, QDoubleSpinBox::down-button:hover {{
            background-color: {COLORS["text_accent"]};
        }}
        
        /* ==================== TIME/DATE EDIT ==================== */
        
        QTimeEdit, QDateEdit {{
            background-color: {COLORS["bg_dark"]};
            border: 1px solid {COLORS["border"]};
            border-radius: 8px;
            padding: 8px 12px;
            color: {COLORS["text_primary"]};
        }}
        
        QTimeEdit:hover, QDateEdit:hover {{
            border-color: {COLORS["border_light"]};
        }}
        
        QTimeEdit:focus, QDateEdit:focus {{
            border-color: {COLORS["text_accent"]};
        }}
        
        /* ==================== GROUP BOX ==================== */
        
        QGroupBox {{
            background-color: {COLORS["bg_dark"]};
            border: 1px solid {COLORS["border"]};
            border-radius: 12px;
            margin-top: 16px;
            padding: 24px 20px 20px 20px;
            font-weight: 600;
            color: {COLORS["text_accent"]};
        }}
        
        QGroupBox::title {{
            subcontrol-origin: margin;
            subcontrol-position: top left;
            left: 20px;
            padding: 2px 12px;
            background-color: {COLORS["bg_dark"]};
            border-radius: 6px;
            color: {COLORS["text_accent"]};
        }}
        
        /* ==================== TAB WIDGET ==================== */
        
        QTabWidget::pane {{
            border: 1px solid {COLORS["border"]};
            border-radius: 8px;
            background-color: {COLORS["bg_dark"]};
        }}
        
        QTabBar::tab {{
            background-color: {COLORS["bg_darkest"]};
            color: {COLORS["text_secondary"]};
            border: 1px solid {COLORS["border"]};
            padding: 10px 20px;
            margin-right: 2px;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
        }}
        
        QTabBar::tab:selected {{
            background-color: {COLORS["bg_dark"]};
            color: {COLORS["text_accent"]};
            border-bottom-color: {COLORS["bg_dark"]};
        }}
        
        QTabBar::tab:hover:!selected {{
            background-color: {COLORS["bg_hover"]};
            color: {COLORS["text_primary"]};
        }}
        
        /* ==================== SCROLL BAR ==================== */
        
        QScrollBar:vertical {{
            background-color: {COLORS["bg_dark"]};
            width: 10px;
            border-radius: 5px;
        }}
        
        QScrollBar::handle:vertical {{
            background-color: {COLORS["border_light"]};
            border-radius: 5px;
            min-height: 30px;
        }}
        
        QScrollBar::handle:vertical:hover {{
            background-color: {COLORS["text_secondary"]};
        }}
        
        QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
            height: 0px;
        }}
        
        QScrollBar:horizontal {{
            background-color: {COLORS["bg_dark"]};
            height: 10px;
            border-radius: 5px;
        }}
        
        QScrollBar::handle:horizontal {{
            background-color: {COLORS["border_light"]};
            border-radius: 5px;
            min-width: 30px;
        }}
        
        QScrollBar::handle:horizontal:hover {{
            background-color: {COLORS["text_secondary"]};
        }}
        
        QScrollBar::add-line:horizontal, QScrollBar::sub-line:horizontal {{
            width: 0px;
        }}
        
        /* ==================== CHECKBOX ==================== */
        
        QCheckBox {{
            color: {COLORS["text_primary"]};
            spacing: 8px;
        }}
        
        QCheckBox::indicator {{
            width: 20px;
            height: 20px;
            border-radius: 4px;
            border: 2px solid {COLORS["border"]};
            background-color: {COLORS["bg_dark"]};
        }}
        
        QCheckBox::indicator:hover {{
            border-color: {COLORS["text_accent"]};
        }}
        
        QCheckBox::indicator:checked {{
            background-color: {COLORS["text_accent"]};
            border-color: {COLORS["text_accent"]};
        }}
        
        /* ==================== PROGRESS BAR ==================== */
        
        QProgressBar {{
            background-color: {COLORS["bg_dark"]};
            border: 1px solid {COLORS["border"]};
            border-radius: 8px;
            text-align: center;
            color: {COLORS["text_primary"]};
        }}
        
        QProgressBar::chunk {{
            background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                stop:0 {COLORS["accent_lavender"]}, stop:1 {COLORS["accent_pink"]});
            border-radius: 6px;
        }}
        
        /* ==================== DIALOG ==================== */
        
        QDialog {{
            background-color: {COLORS["bg_dark"]};
        }}
        
        /* ==================== MESSAGE BOX ==================== */
        
        QMessageBox {{
            background-color: {COLORS["bg_dark"]};
        }}
        
        QMessageBox QLabel {{
            color: {COLORS["text_primary"]};
        }}
        
        /* ==================== LABEL ==================== */
        
        QLabel {{
            color: {COLORS["text_primary"]};
        }}
        
        QLabel#headingLabel {{
            color: {COLORS["text_accent"]};
            font-size: 18px;
            font-weight: 600;
        }}
        
        QLabel#subheadingLabel {{
            color: {COLORS["text_secondary"]};
            font-size: 12px;
        }}
        
        /* ==================== TOOLTIP ==================== */
        
        QToolTip {{
            background-color: {COLORS["bg_darkest"]};
            border: 1px solid {COLORS["border"]};
            border-radius: 4px;
            padding: 8px;
            color: {COLORS["text_primary"]};
        }}
        
        /* ==================== MENU ==================== */
        
        QMenu {{
            background-color: {COLORS["bg_dark"]};
            border: 1px solid {COLORS["border"]};
            border-radius: 8px;
            padding: 4px;
        }}
        
        QMenu::item {{
            padding: 8px 24px;
            border-radius: 4px;
        }}
        
        QMenu::item:selected {{
            background-color: {COLORS["bg_selected"]};
            color: {COLORS["text_accent"]};
        }}
        
        QMenu::separator {{
            height: 1px;
            background-color: {COLORS["border"]};
            margin: 4px 8px;
        }}
        
        /* ==================== SCROLL AREA ==================== */
        
        QScrollArea {{
            background-color: transparent;
            border: none;
        }}
        
        QScrollArea > QWidget > QWidget {{
            background-color: transparent;
        }}
    """
