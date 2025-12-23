from docx import Document
from docx.shared import Pt, Inches, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import os
import datetime

class DOCXGenerator:
    def __init__(self, footer_info=None):
        self.footer_info = footer_info or {}
        
        # Renkler (PDF ile aynı)
        self.colors = {
            'green': RGBColor(0x27, 0xae, 0x60),      # #27ae60
            'red': RGBColor(0xe7, 0x4c, 0x3c),        # #e74c3c
            'orange': RGBColor(0xf3, 0x9c, 0x12),     # #f39c12
            'gray': RGBColor(0x7f, 0x8c, 0x8d),       # #7f8c8d
            'dark': RGBColor(0x2c, 0x3e, 0x50),       # #2c3e50
        }

    def _set_cell_shading(self, cell, hex_color):
        """Hücre arka plan rengini ayarla."""
        tc = cell._tc
        tcPr = tc.get_or_add_tcPr()
        shd = OxmlElement('w:shd')
        shd.set(qn('w:fill'), hex_color)
        tcPr.append(shd)

    def create_diet_docx(self, file_path, diet_program, patient_name, start_date, 
                         template_name, bki_group, excluded_foods, combination_code,
                         patient_info=None):
        """
        Diyet programı DOCX oluştur (PDF ile aynı stil).
        
        Args:
            patient_info: Opsiyonel hasta bilgileri dict:
                - weight: Başlangıç kilosu
                - height: Boy (cm)
                - birth_year: Doğum yılı
                - end_date: Liste bitiş tarihi (kontrol tarihi)
        """
        doc = Document()
        
        # --- Sayfa Ayarları ---
        section = doc.sections[0]
        section.page_height = Cm(29.7)  # A4
        section.page_width = Cm(21)
        section.left_margin = Cm(2)
        section.right_margin = Cm(2)
        section.top_margin = Cm(2)
        section.bottom_margin = Cm(2.5)
        
        # --- Font Ayarları (Comic Sans benzeri) ---
        style = doc.styles['Normal']
        font = style.font
        font.name = 'Comic Sans MS'
        font.size = Pt(11)
        
        # Heading stilleri güncelle
        for i in range(1, 4):
            heading_style = doc.styles[f'Heading {i}']
            heading_style.font.name = 'Comic Sans MS'
            heading_style.font.color.rgb = self.colors['green']
        
        # === KAPAK SAYFASI ===
        if patient_info:
            self._create_cover_page(doc, patient_name, start_date, patient_info)
            doc.add_page_break()
        
        # === DİYET PROGRAMI ===
        for i, day_data in enumerate(diet_program):
            self._create_day_page(doc, day_data)
            
            # Son gün değilse sayfa sonu
            if i < len(diet_program) - 1:
                doc.add_page_break()

        # --- Footer ---
        self._add_footer(doc)
        
        doc.save(file_path)
        return file_path
    
    def _create_cover_page(self, doc, patient_name, start_date, patient_info):
        """Kapak sayfası oluştur."""
        
        # Başlık
        title = doc.add_paragraph()
        title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = title.add_run("KİŞİYE ÖZEL BESLENME PROGRAMI")
        run.bold = True
        run.font.size = Pt(24)
        run.font.color.rgb = self.colors['green']
        
        doc.add_paragraph()  # Boşluk
        
        # Hasta bilgileri
        weight = patient_info.get('weight', 0)
        height = patient_info.get('height', 0)
        birth_year = patient_info.get('birth_year', 0)
        end_date = patient_info.get('end_date', '')
        
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
        table = doc.add_table(rows=9, cols=2)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False
        
        # Sütun genişlikleri
        for cell in table.columns[0].cells:
            cell.width = Cm(6)
        for cell in table.columns[1].cells:
            cell.width = Cm(8)
        
        info_rows = [
            ("Ad Soyad", patient_name.upper()),
            ("Başlangıç Kilosu", f"{weight:.1f} kg" if weight else "-"),
            ("Boy", f"{height:.0f} cm" if height else "-"),
            ("Yaş", f"{yas} yaş" if yas else "-"),
            ("BKİ (Vücut Kitle İndeksi)", f"{bki:.1f}" if bki else "-"),
            ("İdeal Kilo", f"{ideal_kilo:.1f} kg" if ideal_kilo else "-"),
            ("Geçmemeniz Gereken Kilo", f"{gecmemesi_gereken:.1f} kg" if gecmemesi_gereken else "-"),
            ("Başlangıç Tarihi", start_date if start_date else "-"),
            ("Kontrol Tarihi", end_date if end_date else "-"),
        ]
        
        for idx, (label, value) in enumerate(info_rows):
            row = table.rows[idx]
            
            # Sol hücre (etiket)
            left_cell = row.cells[0]
            left_para = left_cell.paragraphs[0]
            left_run = left_para.add_run(label)
            left_run.bold = True
            left_run.font.size = Pt(12)
            left_run.font.color.rgb = self.colors['dark']
            self._set_cell_shading(left_cell, 'F5F5F5')
            
            # Sağ hücre (değer)
            right_cell = row.cells[1]
            right_para = right_cell.paragraphs[0]
            right_run = right_para.add_run(str(value))
            right_run.font.size = Pt(12)
            
            # Önemli değerleri renklendir
            if label == "BKİ (Vücut Kitle İndeksi)":
                if bki < 26:
                    right_run.font.color.rgb = self.colors['green']
                elif bki < 30:
                    right_run.font.color.rgb = self.colors['orange']
                else:
                    right_run.font.color.rgb = self.colors['red']
            elif label == "İdeal Kilo":
                right_run.font.color.rgb = self.colors['green']
                right_run.bold = True
            elif label == "Geçmemeniz Gereken Kilo":
                right_run.font.color.rgb = self.colors['red']
                right_run.bold = True

    def _create_day_page(self, doc, day_data):
        """Gün sayfası oluştur (PDF stili ile)."""
        day_num = day_data["day"]
        meals = day_data["meals"]
        
        # Gün başlığı (yeşil, ortalı)
        day_title = doc.add_paragraph()
        day_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = day_title.add_run(f"{day_num}. Gün")
        run.bold = True
        run.font.size = Pt(18)
        run.font.color.rgb = self.colors['green']
        
        # Su hatırlatma (yeşil, italik, ortalı)
        water = doc.add_paragraph()
        water.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = water.add_run("(Her gün 2,5 litre su içmeyi unutmayın)")
        run.italic = True
        run.font.size = Pt(12)
        run.font.color.rgb = self.colors['green']
        
        # Sabah aç karnına
        morning = doc.add_paragraph()
        run = morning.add_run("Sabah aç karnına 1 bardak su")
        run.bold = True
        run.font.size = Pt(11)
        
        doc.add_paragraph()  # Boşluk
        
        # Öğünler
        for meal in meals:
            self._add_meal(doc, meal)
    
    def _add_meal(self, doc, meal):
        """Öğün ekle (PDF stili ile)."""
        time = meal["time"]
        meal_name = meal["meal_name"]
        meal_type = meal.get("meal_type", "")
        recipe_text = meal["recipe_text"]
        
        # Öğün başlığı
        meal_para = doc.add_paragraph()
        
        # Öğün tipine göre stil
        main_meals = {"kahvalti": "KAHVALTI", "ogle": "ÖĞLE YEMEĞİ", "aksam": "AKŞAM"}
        snacks = ["ara_ogun_1", "ara_ogun_2", "ara_ogun_3"]
        drinks = ["ozel_icecek"]
        
        if meal_type in main_meals:
            display_name = f"{main_meals[meal_type]}: {time}"
            color = self.colors['red']
        elif meal_type in snacks:
            display_name = f"ARA ÖĞÜN: {time}"
            color = self.colors['green']
        elif meal_type in drinks:
            display_name = f"ÖZEL İÇECEK: {time}"
            color = self.colors['orange']
        else:
            display_name = f"{meal_name.upper()}: {time}"
            color = self.colors['green']
        
        run = meal_para.add_run(display_name)
        run.bold = True
        run.font.size = Pt(13)
        run.font.color.rgb = color
        
        # İçerik - bullet points (virgülle ayrılmış)
        items = [item.strip() for item in recipe_text.split(",")]
        for item in items:
            if item:
                bullet = doc.add_paragraph(style='List Bullet')
                bullet.paragraph_format.left_indent = Cm(1)
                run = bullet.add_run(item)
                run.font.size = Pt(11)

    def _add_footer(self, doc):
        """Footer ekle."""
        section = doc.sections[0]
        footer = section.footer
        p = footer.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        footer_parts = []
        if self.footer_info.get("phone"):
            footer_parts.append(self.footer_info['phone'])
        if self.footer_info.get("website"):
            footer_parts.append(self.footer_info['website'])
        if self.footer_info.get("instagram"):
            footer_parts.append(f"@{self.footer_info['instagram']}")
        
        if footer_parts:
            run = p.add_run("     |     ".join(footer_parts))
            run.font.size = Pt(9)
            run.font.color.rgb = self.colors['gray']
