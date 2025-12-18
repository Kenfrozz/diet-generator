"""
Ana pencere - Sidebar navigasyonu ve sekme yönetimi.
Özel frameless pencere ve başlık çubuğu ile.
"""
import os
from PyQt6.QtWidgets import (
    QMainWindow, QWidget, QHBoxLayout, QVBoxLayout,
    QStackedWidget, QPushButton, QButtonGroup, QLabel
)
from PyQt6.QtCore import Qt, QSize, QPoint
from PyQt6.QtGui import QFont, QIcon, QMouseEvent

from .diet_creator import DietCreatorWidget
from .diet_templates import DietTemplatesWidget
from .meal_pool import MealPoolWidget
from .pool_manager import PoolManagerWidget
from .settings import SettingsWidget
from .styles import COLORS


def get_icon_path(icon_name: str) -> str:
    """İkon dosya yolunu döndür."""
    return os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "icons", icon_name)


def get_colored_icon(icon_name: str, color: str) -> QIcon:
    """SVG ikonunu belirtilen renkte döndür."""
    from PyQt6.QtSvg import QSvgRenderer
    from PyQt6.QtGui import QPixmap, QPainter
    from PyQt6.QtCore import QByteArray
    
    icon_path = get_icon_path(icon_name)
    if not os.path.exists(icon_path):
        return QIcon()
    
    try:
        with open(icon_path, 'r', encoding='utf-8') as f:
            svg_content = f.read()
        
        # Renk değiştirme - yaygın fill/stroke değerlerini değiştir
        svg_content = svg_content.replace('fill="currentColor"', f'fill="{color}"')
        svg_content = svg_content.replace('stroke="currentColor"', f'stroke="{color}"')
        svg_content = svg_content.replace('fill="#000000"', f'fill="{color}"')
        svg_content = svg_content.replace('fill="#000"', f'fill="{color}"')
        svg_content = svg_content.replace('fill="black"', f'fill="{color}"')
        svg_content = svg_content.replace('stroke="#000000"', f'stroke="{color}"')
        svg_content = svg_content.replace('stroke="#000"', f'stroke="{color}"')
        svg_content = svg_content.replace('stroke="black"', f'stroke="{color}"')
        # Beyaz renkleri de değiştir
        svg_content = svg_content.replace('fill="#FFFFFF"', f'fill="{color}"')
        svg_content = svg_content.replace('fill="#fff"', f'fill="{color}"')
        svg_content = svg_content.replace('fill="white"', f'fill="{color}"')
        # SVG Repo'dan gelen yaygın renkler
        svg_content = svg_content.replace('stroke="#1C274C"', f'stroke="{color}"')
        svg_content = svg_content.replace('fill="#1C274C"', f'fill="{color}"')
        svg_content = svg_content.replace('stroke="#1c274c"', f'stroke="{color}"')
        svg_content = svg_content.replace('fill="#1c274c"', f'fill="{color}"')
        # Çok koyu siyah (maximize/restore)
        svg_content = svg_content.replace('fill="#0F0F0F"', f'fill="{color}"')
        svg_content = svg_content.replace('stroke="#0F0F0F"', f'stroke="{color}"')
        svg_content = svg_content.replace('fill="#0f0f0f"', f'fill="{color}"')
        svg_content = svg_content.replace('stroke="#0f0f0f"', f'stroke="{color}"')
        
        # SVG'yi QPixmap'e dönüştür
        svg_bytes = QByteArray(svg_content.encode('utf-8'))
        renderer = QSvgRenderer(svg_bytes)
        
        pixmap = QPixmap(64, 64)
        pixmap.fill(Qt.GlobalColor.transparent)
        painter = QPainter(pixmap)
        renderer.render(painter)
        painter.end()
        
        return QIcon(pixmap)
    except Exception:
        return QIcon(icon_path)


class CustomTitleBar(QWidget):
    """Özel başlık çubuğu widget'ı."""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.parent_window = parent
        self._drag_pos = None
        self._is_maximized = False
        self.setup_ui()
    
    def setup_ui(self):
        """Başlık çubuğu arayüzünü oluştur."""
        self.setFixedHeight(40)
        self.setStyleSheet("""
            QWidget {
                background-color: #0f0f1a;
            }
        """)
        
        layout = QHBoxLayout(self)
        layout.setContentsMargins(12, 0, 8, 0)
        layout.setSpacing(0)
        
        # Boşluk (drag alanı)
        layout.addStretch()
        
        # Pencere kontrol butonları - Finrise stili
        button_style = """
            QPushButton {{
                background-color: transparent;
                border: none;
                border-radius: 6px;
                margin: 4px 2px;
            }}
            QPushButton:hover {{
                background-color: {hover_color};
            }}
        """
        
        # Minimize butonu
        self.minimize_btn = QPushButton()
        self.minimize_btn.setIcon(get_colored_icon("minimize.svg", "#9999aa"))
        self.minimize_btn.setIconSize(QSize(12, 12))
        self.minimize_btn.setFixedSize(40, 32)
        self.minimize_btn.setStyleSheet(button_style.format(hover_color="#2a2a4a"))
        self.minimize_btn.clicked.connect(self.minimize_window)
        self.minimize_btn.enterEvent = lambda e: self.minimize_btn.setIcon(get_colored_icon("minimize.svg", "#FFFFFF"))
        self.minimize_btn.leaveEvent = lambda e: self.minimize_btn.setIcon(get_colored_icon("minimize.svg", "#9999aa"))
        layout.addWidget(self.minimize_btn)
        
        # Maximize/Restore butonu
        self.maximize_btn = QPushButton()
        self.maximize_btn.setIcon(get_colored_icon("maximize.svg", "#9999aa"))
        self.maximize_btn.setIconSize(QSize(12, 12))
        self.maximize_btn.setFixedSize(40, 32)
        self.maximize_btn.setStyleSheet(button_style.format(hover_color="#2a2a4a"))
        self.maximize_btn.clicked.connect(self.toggle_maximize)
        self._max_icon_name = "maximize.svg"
        self.maximize_btn.enterEvent = lambda e: self.maximize_btn.setIcon(get_colored_icon(self._max_icon_name, "#FFFFFF"))
        self.maximize_btn.leaveEvent = lambda e: self.maximize_btn.setIcon(get_colored_icon(self._max_icon_name, "#9999aa"))
        layout.addWidget(self.maximize_btn)
        
        # Close butonu - Kırmızı hover arka plan, beyaz ikon
        self.close_btn = QPushButton()
        self.close_btn.setIcon(get_colored_icon("close.svg", "#9999aa"))
        self.close_btn.setIconSize(QSize(12, 12))
        self.close_btn.setFixedSize(40, 32)
        self.close_btn.setStyleSheet("""
            QPushButton {
                background-color: transparent;
                border: none;
                border-radius: 6px;
                margin: 4px 2px;
            }
            QPushButton:hover {
                background-color: #f87171;
            }
        """)
        self.close_btn.enterEvent = lambda e: self.close_btn.setIcon(get_colored_icon("close.svg", "#FFFFFF"))
        self.close_btn.leaveEvent = lambda e: self.close_btn.setIcon(get_colored_icon("close.svg", "#9999aa"))
        self.close_btn.clicked.connect(self.close_window)
        layout.addWidget(self.close_btn)
    
    def minimize_window(self):
        """Pencereyi küçült."""
        if self.parent_window:
            self.parent_window.showMinimized()
    
    def toggle_maximize(self):
        """Pencereyi maximize/restore yap."""
        if self.parent_window:
            if self._is_maximized:
                self.parent_window.showNormal()
                self._max_icon_name = "maximize.svg"
                self.maximize_btn.setIcon(get_colored_icon("maximize.svg", "#9999aa"))
            else:
                self.parent_window.showMaximized()
                self._max_icon_name = "restore.svg"
                self.maximize_btn.setIcon(get_colored_icon("restore.svg", "#9999aa"))
            self._is_maximized = not self._is_maximized
    
    def close_window(self):
        """Pencereyi kapat."""
        if self.parent_window:
            self.parent_window.close()
    
    def mousePressEvent(self, event: QMouseEvent):
        """Başlık çubuğuna tıklanınca sürükleme başlat."""
        if event.button() == Qt.MouseButton.LeftButton:
            self._drag_pos = event.globalPosition().toPoint() - self.parent_window.frameGeometry().topLeft()
            event.accept()
    
    def mouseMoveEvent(self, event: QMouseEvent):
        """Pencereyi sürükle."""
        if event.buttons() == Qt.MouseButton.LeftButton and self._drag_pos is not None:
            # Maximized iken sürüklenince normal boyuta getir
            if self._is_maximized:
                self._is_maximized = False
                self.parent_window.showNormal()
                self._max_icon_name = "maximize.svg"
                self.maximize_btn.setIcon(get_colored_icon("maximize.svg", "#9999aa"))
                # Pencereyi fare konumuna ortala
                self._drag_pos = QPoint(self.parent_window.width() // 2, 17)
            
            self.parent_window.move(event.globalPosition().toPoint() - self._drag_pos)
            event.accept()
    
    def mouseReleaseEvent(self, event: QMouseEvent):
        """Sürüklemeyi bitir."""
        self._drag_pos = None
        event.accept()
    
    def mouseDoubleClickEvent(self, event: QMouseEvent):
        """Çift tıklama ile maximize/restore."""
        if event.button() == Qt.MouseButton.LeftButton:
            self.toggle_maximize()
            event.accept()


class MainWindow(QMainWindow):
    """Ana uygulama penceresi."""
    
    def __init__(self, db):
        super().__init__()
        self.db = db
        self.sidebar_expanded = False  # Sidebar varsayılan: icon modu
        
        # Frameless pencere ayarları
        self.setWindowFlags(Qt.WindowType.FramelessWindowHint)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, False)
        
        # Sidebar durumunu veritabanından yükle
        saved_state = self.db.get_setting("sidebar_expanded", "0")
        self.sidebar_expanded = saved_state == "1"
        
        self.setup_ui()
    
    def setup_ui(self):
        """Arayüzü oluştur."""
        self.setMinimumSize(1200, 800)
        
        # Uygulama ikonunu ayarla (taskbar için)
        app_icon_path = get_icon_path("app_icon.png")
        if os.path.exists(app_icon_path):
            self.setWindowIcon(QIcon(app_icon_path))
        
        # Ana widget
        central_widget = QWidget()
        central_widget.setStyleSheet("""
            QWidget {
                background-color: #0f0f1a;
            }
        """)
        self.setCentralWidget(central_widget)
        
        # Ana yatay layout (sidebar + sağ içerik)
        root_layout = QHBoxLayout(central_widget)
        root_layout.setContentsMargins(0, 0, 0, 0)
        root_layout.setSpacing(0)
        
        # Sol sidebar container - Tam yükseklik
        self.sidebar_container = QWidget()
        self.sidebar_container.setObjectName("sidebarContainer")
        self.sidebar_container.setStyleSheet("""
            #sidebarContainer {
                background-color: #1a1a2e;
                border-right: 1px solid #2d2d50;
            }
        """)
        self.sidebar_layout = QVBoxLayout(self.sidebar_container)
        self.sidebar_layout.setContentsMargins(0, 12, 0, 12)
        self.sidebar_layout.setSpacing(4)
        
        # Uygulama logosu ve ismi (sidebar üstü)
        self.brand_container = QWidget()
        self.brand_container.setStyleSheet("border: none; background: transparent;")
        brand_layout = QHBoxLayout(self.brand_container)
        brand_layout.setContentsMargins(6, 12, 6, 8)
        brand_layout.setSpacing(8)
        
        self.app_icon = QLabel()
        self.app_icon.setAlignment(Qt.AlignmentFlag.AlignCenter)
        icon_path = get_icon_path("app_icon.png")
        if os.path.exists(icon_path):
            self.app_icon.setPixmap(QIcon(icon_path).pixmap(48, 48))
        self.app_icon.setFixedSize(48, 48)
        self.app_icon.setStyleSheet("border: none; background: transparent;")
        brand_layout.addWidget(self.app_icon)
        
        self.brand_text_container = QWidget()
        self.brand_text_container.setStyleSheet("border: none; background: transparent;")
        brand_text_layout = QVBoxLayout(self.brand_text_container)
        brand_text_layout.setContentsMargins(0, 4, 0, 4)
        brand_text_layout.setSpacing(2)
        
        self.app_title = QLabel("DetoksBot")
        self.app_title.setStyleSheet("""
            QLabel {
                color: #CBCDFF;
                font-size: 16px;
                font-weight: 700;
                border: none;
                background: transparent;
            }
        """)
        brand_text_layout.addWidget(self.app_title)
        
        self.app_subtitle = QLabel("Diyet Oluşturucu")
        self.app_subtitle.setStyleSheet("""
            QLabel {
                color: #9999aa;
                font-size: 11px;
                border: none;
                background: transparent;
            }
        """)
        brand_text_layout.addWidget(self.app_subtitle)
        
        brand_layout.addWidget(self.brand_text_container)
        
        self.sidebar_layout.addWidget(self.brand_container)
        
        # Logo ve menü arasında boşluk (toggle hizası için)
        self.spacer_widget = QWidget()
        self.spacer_widget.setFixedHeight(20)
        self.spacer_widget.setStyleSheet("background: transparent; border: none;")
        self.sidebar_layout.addWidget(self.spacer_widget)
        
        # Menü öğeleri (kısa, büyük harfli isimler)
        self.menu_items = [
            ("diet_create.svg", "DİYET OLUŞTUR"),
            ("recipe_manager.svg", "TARİFLER"),
            ("diet_templates.svg", "KALIPLAR"),
            ("pool_manager.svg", "HAVUZLAR"),
            ("settings.svg", "AYARLAR")
        ]
        
        # Sidebar butonları - Ana menü öğeleri (Ayarlar hariç)
        self.nav_buttons = []
        self.button_group = QButtonGroup(self)
        self.button_group.setExclusive(True)
        
        # Finrise stili navigasyon buton stili
        nav_btn_style = """
            QPushButton {
                background-color: transparent;
                border: none;
                border-radius: 8px;
                color: #9999aa;
                text-align: left;
                padding-left: 14px;
                margin: 2px 8px;
            }
            QPushButton:hover {
                background-color: #2a2a4a;
                color: #FFFFFF;
            }
            QPushButton:checked {
                background-color: rgba(203, 205, 255, 0.15);
                color: #CBCDFF;
                border-left: 3px solid #CBCDFF;
                padding-left: 11px;
            }
        """
        
        # Ayarlar hariç tüm butonları ekle
        for i, (icon_name, text) in enumerate(self.menu_items[:-1]):  # Son öğe hariç
            btn = QPushButton()
            btn.setIcon(get_colored_icon(icon_name, "#9999aa"))
            btn.setIconSize(QSize(22, 22))
            btn.setCheckable(True)
            btn.setFixedHeight(48)
            btn.setStyleSheet(nav_btn_style)
            btn.clicked.connect(lambda checked, idx=i: self.on_nav_clicked(idx))
            self.nav_buttons.append(btn)
            self.button_group.addButton(btn, i)
            self.sidebar_layout.addWidget(btn)
        
        # İlk buton seçili
        self.nav_buttons[0].setChecked(True)
        
        # Boşluk ekle (Ayarlar'ı alta it)
        self.sidebar_layout.addStretch()
        
        # Ayarlar butonu (en altta) - Finrise stili
        settings_idx = len(self.menu_items) - 1
        icon_name, text = self.menu_items[settings_idx]
        settings_btn = QPushButton()
        settings_btn.setIcon(get_colored_icon(icon_name, "#9999aa"))
        settings_btn.setIconSize(QSize(22, 22))
        settings_btn.setCheckable(True)
        settings_btn.setFixedHeight(48)
        settings_btn.setStyleSheet(nav_btn_style)
        settings_btn.clicked.connect(lambda checked, idx=settings_idx: self.on_nav_clicked(idx))
        self.nav_buttons.append(settings_btn)
        self.button_group.addButton(settings_btn, settings_idx)
        self.sidebar_layout.addWidget(settings_btn)
        
        root_layout.addWidget(self.sidebar_container)
        
        # Sağ taraf container (başlık çubuğu + içerik)
        right_container = QWidget()
        right_layout = QVBoxLayout(right_container)
        right_layout.setContentsMargins(0, 0, 0, 0)
        right_layout.setSpacing(0)
        
        # Özel başlık çubuğu
        self.title_bar = CustomTitleBar(self)
        right_layout.addWidget(self.title_bar)
        
        # Sağ içerik alanı
        self.content_stack = self.create_content_stack()
        right_layout.addWidget(self.content_stack, 1)
        
        root_layout.addWidget(right_container, 1)
        
        # Toggle butonu - Sidebar kenarında yuvarlak buton
        self.toggle_btn = QPushButton(central_widget)
        self.toggle_btn.setFixedSize(32, 32)
        self.toggle_btn.setIconSize(QSize(16, 16))
        self.toggle_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.toggle_btn.setStyleSheet("""
            QPushButton {
                background-color: #1a1a2e;
                border: 1px solid #2d2d50;
                border-radius: 16px;
            }
            QPushButton:hover {
                background-color: #2a2a4a;
                border-color: #3d3d60;
            }
        """)
        self.toggle_btn.clicked.connect(self.toggle_sidebar)
        self.toggle_btn.raise_()  # En üste getir
        
        # Başlangıç sidebar genişliği
        self.update_sidebar_width()
    
    def create_content_stack(self) -> QStackedWidget:
        """İçerik alanını oluştur."""
        stack = QStackedWidget()
        
        # Sekme widgetları
        self.diet_creator = DietCreatorWidget(self.db)
        self.diet_templates = DietTemplatesWidget(self.db)
        self.meal_pool = MealPoolWidget(self.db)
        self.pool_manager = PoolManagerWidget(self.db)
        self.settings = SettingsWidget(self.db)
        
        stack.addWidget(self.diet_creator)
        stack.addWidget(self.meal_pool)
        stack.addWidget(self.diet_templates)
        stack.addWidget(self.pool_manager)
        stack.addWidget(self.settings)
        
        return stack
    
    def toggle_sidebar(self):
        """Sidebar'ı genişlet/daralt ve durumu kaydet."""
        self.sidebar_expanded = not self.sidebar_expanded
        # Durumu veritabanına kaydet
        self.db.set_setting("sidebar_expanded", "1" if self.sidebar_expanded else "0")
        self.update_sidebar_width()
    
    def update_sidebar_width(self):
        """Sidebar genişliğini güncelle - Finrise stili."""
        # Finrise navigasyon buton stilleri
        expanded_style = """
            QPushButton {
                background-color: transparent;
                border: none;
                border-radius: 8px;
                color: #9999aa;
                text-align: left;
                padding-left: 14px;
                margin: 2px 8px;
            }
            QPushButton:hover {
                background-color: #2a2a4a;
                color: #FFFFFF;
            }
            QPushButton:checked {
                background-color: rgba(203, 205, 255, 0.15);
                color: #CBCDFF;
                border-left: 3px solid #CBCDFF;
                padding-left: 11px;
            }
        """
        
        collapsed_style = """
            QPushButton {
                background-color: transparent;
                border: none;
                border-radius: 8px;
                color: #9999aa;
                margin: 2px 8px;
            }
            QPushButton:hover {
                background-color: #2a2a4a;
                color: #FFFFFF;
            }
            QPushButton:checked {
                background-color: rgba(203, 205, 255, 0.15);
                color: #CBCDFF;
                border-left: 3px solid #CBCDFF;
            }
        """
        
        if self.sidebar_expanded:
            # Genişletilmiş mod - ikon + metin
            self.sidebar_container.setFixedWidth(200)
            self.brand_text_container.show()
            self.app_icon.setPixmap(QIcon(get_icon_path("app_icon.png")).pixmap(48, 48))
            # Toggle butonu - spacer hizasında
            self.toggle_btn.move(200 - 16, 70)
            self.toggle_btn.setIcon(get_colored_icon("left.svg", "#9999aa"))
            for i, btn in enumerate(self.nav_buttons):
                btn.setText("  " + self.menu_items[i][1])
                btn.setStyleSheet(expanded_style)
                # Seçili duruma göre ikon rengi
                icon_name = self.menu_items[i][0]
                if btn.isChecked():
                    btn.setIcon(get_colored_icon(icon_name, "#CBCDFF"))
                else:
                    btn.setIcon(get_colored_icon(icon_name, "#9999aa"))
        else:
            # Daraltılmış mod - sadece ikon (ortalı)
            self.sidebar_container.setFixedWidth(60)
            self.brand_text_container.hide()
            self.app_icon.setPixmap(QIcon(get_icon_path("app_icon.png")).pixmap(40, 40))
            # Toggle butonu - spacer hizasında
            self.toggle_btn.move(60 - 16, 70)
            self.toggle_btn.setIcon(get_colored_icon("right.svg", "#9999aa"))
            for i, btn in enumerate(self.nav_buttons):
                btn.setText("")
                btn.setStyleSheet(collapsed_style)
                # Seçili duruma göre ikon rengi
                icon_name = self.menu_items[i][0]
                if btn.isChecked():
                    btn.setIcon(get_colored_icon(icon_name, "#CBCDFF"))
                else:
                    btn.setIcon(get_colored_icon(icon_name, "#9999aa"))
    
    def on_nav_clicked(self, index: int):
        """Navigasyon butonuna tıklandığında."""
        self.content_stack.setCurrentIndex(index)
        
        # İkon renklerini güncelle
        for i, btn in enumerate(self.nav_buttons):
            icon_name = self.menu_items[i][0]
            if btn.isChecked():
                btn.setIcon(get_colored_icon(icon_name, "#CBCDFF"))
            else:
                btn.setIcon(get_colored_icon(icon_name, "#9999aa"))
        
        # Sekmelere geçildiğinde listeyi yenile
        if index == 1:
            self.meal_pool.refresh_recipes()
        elif index == 3:
            self.pool_manager.refresh_pools()
        elif index == 2:
            self.diet_templates.refresh_templates()
        elif index == 0:
            self.diet_creator.refresh_templates()
