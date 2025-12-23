"""
PDF oluşturucu modülü - ReportLab ile Türkçe destekli PDF oluşturma.
"""
import os
import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_CENTER, TA_LEFT


class PDFGenerator:
    """PDF oluşturucu sınıfı."""
    
    def __init__(self, footer_info: dict = None):
        """PDF oluşturucuyu başlat.
        
        Args:
            footer_info: Altbilgi bilgileri {"phone": "", "website": "", "instagram": ""}
        """
        self.footer_info = footer_info or {}
        self._register_fonts()
        self._setup_styles()
    
    def _register_fonts(self):
        """Comic Sans MS fontunu kaydet (normal ve bold)."""
        from reportlab.pdfbase.pdfmetrics import registerFontFamily
        
        # Normal font
        normal_paths = [
            "C:/Windows/Fonts/comic.ttf",
            "C:/Windows/Fonts/arial.ttf",
            "C:/Windows/Fonts/calibri.ttf",
        ]
        
        # Bold font
        bold_paths = [
            "C:/Windows/Fonts/comicbd.ttf",  # Comic Sans Bold
            "C:/Windows/Fonts/arialbd.ttf",   # Arial Bold
            "C:/Windows/Fonts/calibrib.ttf",  # Calibri Bold
        ]
        
        normal_registered = False
        bold_registered = False
        
        # Normal font kaydet
        for font_path in normal_paths:
            if os.path.exists(font_path):
                try:
                    pdfmetrics.registerFont(TTFont('ComicSans', font_path))
                    normal_registered = True
                    break
                except Exception:
                    continue
        
        # Bold font kaydet
        for font_path in bold_paths:
            if os.path.exists(font_path):
                try:
                    pdfmetrics.registerFont(TTFont('ComicSansBold', font_path))
                    bold_registered = True
                    break
                except Exception:
                    continue
        
        if normal_registered and bold_registered:
            # Font ailesini kaydet (bu sayede <b> tag'i çalışır)
            registerFontFamily('ComicSans', normal='ComicSans', bold='ComicSansBold')
            self.font_name = 'ComicSans'
        elif normal_registered:
            self.font_name = 'ComicSans'
        else:
            self.font_name = 'Helvetica'
    
    def _setup_styles(self):
        """Stil şablonlarını oluştur."""
        self.styles = getSampleStyleSheet()
        
        # Kapak başlık stili
        self.styles.add(ParagraphStyle(
            name='CoverTitleStyle',
            fontName=self.font_name,
            fontSize=24,
            leading=30,
            alignment=TA_CENTER,
            spaceBefore=40,
            spaceAfter=30,
            textColor=colors.HexColor('#27ae60')
        ))
        
        # Kapak bilgi label stili
        self.styles.add(ParagraphStyle(
            name='CoverLabelStyle',
            fontName=self.font_name,
            fontSize=12,
            leading=16,
            textColor=colors.HexColor('#2c3e50')
        ))
        
        # Kapak bilgi değer stili
        self.styles.add(ParagraphStyle(
            name='CoverValueStyle',
            fontName=self.font_name,
            fontSize=12,
            leading=16,
            textColor=colors.black
        ))
        
        # Gün başlığı stili (ortalı, yeşil)
        self.styles.add(ParagraphStyle(
            name='DayTitleStyle',
            fontName=self.font_name,
            fontSize=18,
            leading=22,
            alignment=TA_CENTER,
            spaceBefore=10,
            spaceAfter=5,
            textColor=colors.HexColor('#27ae60')  # Yeşil
        ))
        
        # Su hatırlatma stili (ortalı, yeşil, italik)
        self.styles.add(ParagraphStyle(
            name='WaterReminderStyle',
            fontName=self.font_name,
            fontSize=12,
            leading=16,
            alignment=TA_CENTER,
            spaceAfter=15,
            textColor=colors.HexColor('#27ae60')  # Yeşil
        ))
        
        # Sabah aç karnına metin stili (siyah)
        self.styles.add(ParagraphStyle(
            name='MorningTextStyle',
            fontName=self.font_name,
            fontSize=11,
            leading=14,
            alignment=TA_LEFT,
            spaceAfter=10,
            textColor=colors.black
        ))
        
        # Ana öğün başlık stili (Kahvaltı, Öğle, Akşam) - Kırmızı, kalın
        self.styles.add(ParagraphStyle(
            name='MainMealStyle',
            fontName=self.font_name,
            fontSize=13,
            leading=16,
            spaceBefore=15,
            spaceAfter=5,
            textColor=colors.HexColor('#e74c3c')  # Kırmızı
        ))
        
        # Ara öğün başlık stili - Yeşil
        self.styles.add(ParagraphStyle(
            name='SnackMealStyle',
            fontName=self.font_name,
            fontSize=13,
            leading=16,
            spaceBefore=15,
            spaceAfter=5,
            textColor=colors.HexColor('#27ae60')  # Yeşil
        ))
        
        # Özel içecek başlık stili - Sarı/Turuncu
        self.styles.add(ParagraphStyle(
            name='DrinkMealStyle',
            fontName=self.font_name,
            fontSize=13,
            leading=16,
            spaceBefore=15,
            spaceAfter=5,
            textColor=colors.HexColor('#f39c12')  # Sarı/Turuncu
        ))
        
        # İçerik madde stili - Siyah (bullet point)
        self.styles.add(ParagraphStyle(
            name='BulletStyle',
            fontName=self.font_name,
            fontSize=11,
            leading=14,
            leftIndent=20,
            textColor=colors.black
        ))
        
        # Alt bilgi stili
        self.styles.add(ParagraphStyle(
            name='FooterStyle',
            fontName=self.font_name,
            fontSize=9,
            leading=12,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#7f8c8d')
        ))
    
    def _get_meal_style_and_name(self, meal_type: str, meal_name: str, time: str):
        """Öğün türüne göre stil ve görünen adı döndür."""
        main_meals = {
            "kahvalti": "KAHVALTI",
            "ogle": "OGLE YEMEGI",
            "aksam": "AKSAM"
        }
        snacks = ["ara_ogun_1", "ara_ogun_2", "ara_ogun_3"]
        drinks = ["ozel_icecek"]
        
        if meal_type in main_meals:
            display_name = f"{main_meals[meal_type]}:{time}"
            return self.styles['MainMealStyle'], display_name
        elif meal_type in snacks:
            display_name = f"ARA OGUN:{time}"
            return self.styles['SnackMealStyle'], display_name
        elif meal_type in drinks:
            display_name = f"OZEL ICECEK:{time}"
            return self.styles['DrinkMealStyle'], display_name
        else:
            display_name = f"{meal_name.upper()}:{time}"
            return self.styles['SnackMealStyle'], display_name
    
    def _footer(self, canvas, doc):
        """Sayfa altbilgisi."""
        canvas.saveState()
        
        # Footer metni oluştur
        footer_parts = []
        if self.footer_info.get("phone"):
            footer_parts.append(self.footer_info['phone'])
        if self.footer_info.get("website"):
            footer_parts.append(self.footer_info['website'])
        if self.footer_info.get("instagram"):
            footer_parts.append(f"@{self.footer_info['instagram']}")
        
        if footer_parts:
            footer_text = "     |     ".join(footer_parts)
            canvas.setFont(self.font_name if self.font_name != 'Helvetica' else 'Helvetica', 9)
            canvas.setFillColor(colors.HexColor('#7f8c8d'))
            
            # Ortalanmış footer
            page_width = A4[0]
            text_width = canvas.stringWidth(footer_text, self.font_name if self.font_name != 'Helvetica' else 'Helvetica', 9)
            x = (page_width - text_width) / 2
            canvas.drawString(x, 1.5*cm, footer_text)
        
        canvas.restoreState()
    
    def _create_cover_page(self, elements, patient_info: dict, start_date: str):
        """Kapak sayfası oluştur."""
        # Başlık
        elements.append(Paragraph("<b>KİŞİYE ÖZEL BESLENME PROGRAMI</b>", self.styles['CoverTitleStyle']))
        elements.append(Spacer(1, 40))
        
        weight = patient_info.get('weight', 0)
        height = patient_info.get('height', 0)
        birth_year = patient_info.get('birth_year', 0)
        end_date = patient_info.get('end_date', '')
        patient_name = patient_info.get('patient_name', '')
        
        # Hesaplamalar
        current_year = datetime.datetime.now().year
        yas = current_year - birth_year if birth_year else 0
        
        # BKİ hesapla
        height_m = height / 100 if height else 1
        bki = weight / (height_m * height_m) if height_m else 0
        
        # İdeal ve geçmemesi gereken kilo hesapla
        if yas < 35:
            ideal_kilo = height_m * height_m * 21
            gecmemesi_gereken = height_m * height_m * 27
        elif 35 <= yas <= 45:
            ideal_kilo = height_m * height_m * 22
            gecmemesi_gereken = height_m * height_m * 28
        else:
            ideal_kilo = height_m * height_m * 23
            gecmemesi_gereken = height_m * height_m * 30
        
        # Bilgi tablosu
        table_data = [
            ["Ad Soyad", patient_name.upper()],
            ["Başlangıç Kilosu", f"{weight:.1f} kg" if weight else "-"],
            ["Boy", f"{height:.0f} cm" if height else "-"],
            ["Yaş", f"{yas} yaş" if yas else "-"],
            ["BKİ (Vücut Kitle İndeksi)", f"{bki:.1f}" if bki else "-"],
            ["İdeal Kilo", f"{ideal_kilo:.1f} kg" if ideal_kilo else "-"],
            ["Geçmemeniz Gereken Kilo", f"{gecmemesi_gereken:.1f} kg" if gecmemesi_gereken else "-"],
            ["Başlangıç Tarihi", start_date if start_date else "-"],
            ["Kontrol Tarihi", end_date if end_date else "-"],
        ]
        
        # Tablo stilini oluştur
        table_style = TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), self.font_name),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f5f5f5')),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#2c3e50')),
            ('FONTNAME', (0, 0), (0, -1), self.font_name),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#dddddd')),
            # İdeal kilo - yeşil
            ('TEXTCOLOR', (1, 5), (1, 5), colors.HexColor('#27ae60')),
            ('FONTNAME', (1, 5), (1, 5), self.font_name),
            # Geçmemesi gereken - kırmızı
            ('TEXTCOLOR', (1, 6), (1, 6), colors.HexColor('#e74c3c')),
            ('FONTNAME', (1, 6), (1, 6), self.font_name),
        ])
        
        # BKİ değerine göre renk ayarla
        if bki:
            if bki < 26:
                bki_color = colors.HexColor('#27ae60')  # Yeşil
            elif bki < 30:
                bki_color = colors.HexColor('#f39c12')  # Turuncu
            else:
                bki_color = colors.HexColor('#e74c3c')  # Kırmızı
            table_style.add('TEXTCOLOR', (1, 4), (1, 4), bki_color)
        
        table = Table(table_data, colWidths=[6*cm, 9*cm])
        table.setStyle(table_style)
        
        elements.append(table)
        elements.append(PageBreak())
    
    def create_diet_pdf(self, file_path: str, diet_program: list, 
                        template_name: str, pool_type: str, bki_group: str,
                        patient_info: dict = None, start_date: str = None):
        """Diyet programı PDF'i oluştur.
        
        Args:
            file_path: PDF dosya yolu
            diet_program: Diyet programı verisi
            template_name: Kalıp adı
            pool_type: Havuz türü
            bki_group: BKİ grubu
            patient_info: Hasta bilgileri (opsiyonel, kapak sayfası için)
            start_date: Başlangıç tarihi (opsiyonel)
        """
        doc = SimpleDocTemplate(
            file_path,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2.5*cm  # Footer için biraz daha boşluk
        )
        
        elements = []
        
        # Kapak sayfası (eğer hasta bilgileri varsa)
        if patient_info:
            self._create_cover_page(elements, patient_info, start_date or '')
        
        # Her gün için içerik oluştur (her gün ayrı sayfa)
        for i, day_data in enumerate(diet_program):
            day_num = day_data["day"]
            meals = day_data["meals"]
            
            # Gün başlığı (ortalı, yeşil)
            day_title = Paragraph(f"<b>{day_num}. Gün</b>", self.styles['DayTitleStyle'])
            elements.append(day_title)
            
            # Su hatırlatma (italik, yeşil)
            water_reminder = Paragraph(
                "<i>(Her gün 2,5 litre su içmeyi unutmayın)</i>",
                self.styles['WaterReminderStyle']
            )
            elements.append(water_reminder)
            
            # Sabah aç karnına metin
            elements.append(Paragraph("<b>Sabah aç karnına 1 bardak su</b>", self.styles['MorningTextStyle']))
            
            elements.append(Spacer(1, 10))
            
            # Öğünler listesi
            for meal in meals:
                time = meal["time"]
                meal_name = meal["meal_name"]
                meal_type = meal.get("meal_type", "")
                recipe_text = meal["recipe_text"]
                
                # Öğün stilini ve başlığını belirle
                meal_style, display_name = self._get_meal_style_and_name(meal_type, meal_name, time)
                
                # Öğün başlığı
                elements.append(Paragraph(f"<b>{display_name}</b>", meal_style))
                
                # İçerik - virgülle ayrılmış öğeleri bullet point olarak göster
                items = [item.strip() for item in recipe_text.split(",")]
                for item in items:
                    if item:  # Boş değilse
                        bullet_text = f"- {item}"
                        elements.append(Paragraph(bullet_text, self.styles['BulletStyle']))
                
                elements.append(Spacer(1, 5))
            
            # Son gün değilse sayfa sonu ekle
            if i < len(diet_program) - 1:
                elements.append(PageBreak())
        
        # PDF oluştur (footer callback ile)
        doc.build(elements, onFirstPage=self._footer, onLaterPages=self._footer)
