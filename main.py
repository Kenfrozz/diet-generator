"""
DetoksBot - Diyet Programı Oluşturucu
Diyetisyenler için öğün havuzlarından diyet programı oluşturup PDF'e aktaran uygulama.
Finrise Dashboard teması ile modern UI.
"""
import sys
from PyQt6.QtWidgets import QApplication
from ui.main_window import MainWindow
from ui.login_dialog import LoginDialog
from database import Database

# Merkezi renk tanımları ve stiller - tüm uygulama bu kaynağı kullanır
from ui.styles import COLORS, get_global_stylesheet


def main():
    """Ana uygulama giriş noktası."""
    # Veritabanını başlat
    db = Database()
    db.initialize()
    
    # PyQt uygulamasını başlat
    app = QApplication(sys.argv)
    app.setApplicationName("DetoksBot")
    
    # Finrise teması
    app.setStyle("Fusion")
    
    from PyQt6.QtGui import QPalette, QColor
    palette = QPalette()
    
    # Ana arka plan: koyu lacivert
    palette.setColor(QPalette.ColorRole.Window, QColor(26, 26, 46))  # #1a1a2e
    palette.setColor(QPalette.ColorRole.WindowText, QColor(255, 255, 255))
    
    # İçerik arka planı
    palette.setColor(QPalette.ColorRole.Base, QColor(26, 26, 46))  # #1a1a2e
    palette.setColor(QPalette.ColorRole.AlternateBase, QColor(26, 26, 46))  # #1a1a2e
    
    # Tooltip
    palette.setColor(QPalette.ColorRole.ToolTipBase, QColor(15, 15, 26))  # #0f0f1a
    palette.setColor(QPalette.ColorRole.ToolTipText, QColor(255, 255, 255))
    
    # Metin
    palette.setColor(QPalette.ColorRole.Text, QColor(255, 255, 255))
    palette.setColor(QPalette.ColorRole.PlaceholderText, QColor(153, 153, 170))  # #9999aa
    
    # Butonlar
    palette.setColor(QPalette.ColorRole.Button, QColor(26, 26, 46))  # #1a1a2e
    palette.setColor(QPalette.ColorRole.ButtonText, QColor(255, 255, 255))
    palette.setColor(QPalette.ColorRole.BrightText, QColor(247, 154, 204))  # #F79ACC
    
    # Vurgu renkleri - Lavender
    palette.setColor(QPalette.ColorRole.Link, QColor(203, 205, 255))  # #CBCDFF
    palette.setColor(QPalette.ColorRole.Highlight, QColor(203, 205, 255))  # #CBCDFF
    palette.setColor(QPalette.ColorRole.HighlightedText, QColor(15, 15, 26))  # #0f0f1a
    
    app.setPalette(palette)
    
    # Global Finrise stylesheet - merkezi COLORS sistemini kullanır
    app.setStyleSheet(get_global_stylesheet())
    
    # Giriş dialogunu göster
    login_dialog = LoginDialog(db)
    if login_dialog.exec() != LoginDialog.DialogCode.Accepted:
        # Giriş iptal edildi, uygulamadan çık
        sys.exit(0)
    
    # Giriş başarılı - kullanıcı bilgilerini al
    current_user = login_dialog.get_user()
    
    # Ana pencereyi oluştur ve göster
    window = MainWindow(db)
    window.current_user = current_user  # Kullanıcı bilgisini sakla
    window.show()
    
    # Uygulamayı çalıştır
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
