"""
Doküman oluşturucu modülü - python-docx ile DOCX, docx2pdf ile PDF oluşturma.
"""
import os
from docx import Document
from docx.shared import Pt, Inches, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE
from docx2pdf import convert


class DocumentGenerator:
    """DOCX ve PDF oluşturucu sınıfı."""
    
    def __init__(self, footer_info: dict = None):
        """Doküman oluşturucuyu başlat.
        
        Args:
            footer_info: Altbilgi bilgileri {"phone": "", "website": "", "instagram": ""}
        """
        self.footer_info = footer_info or {}
    
    def _get_meal_style(self, meal_type: str):
        """Öğün türüne göre renk ve görünen adı döndür."""
        main_meals = {
            "kahvalti": ("KAHVALTI", RGBColor(231, 76, 60)),  # Kırmızı
            "ogle": ("ÖĞLE YEMEĞİ", RGBColor(231, 76, 60)),   # Kırmızı
            "aksam": ("AKŞAM", RGBColor(231, 76, 60))         # Kırmızı
        }
        snacks = ["ara_ogun_1", "ara_ogun_2", "ara_ogun_3"]
        drinks = ["ozel_icecek"]
        
        if meal_type in main_meals:
            return main_meals[meal_type]
        elif meal_type in snacks:
            return ("ARA ÖĞÜN", RGBColor(39, 174, 96))  # Yeşil
        elif meal_type in drinks:
            return ("ARA ÖĞÜN", RGBColor(243, 156, 18))  # Sarı/Turuncu
        else:
            return ("ÖĞÜN", RGBColor(39, 174, 96))
    
    def _add_footer(self, doc):
        """Altbilgi ekle."""
        footer_parts = []
        if self.footer_info.get("phone"):
            footer_parts.append(self.footer_info['phone'])
        if self.footer_info.get("website"):
            footer_parts.append(self.footer_info['website'])
        if self.footer_info.get("instagram"):
            footer_parts.append(f"@{self.footer_info['instagram']}")
        
        if footer_parts:
            footer_text = "     |     ".join(footer_parts)
            
            # Her section için footer ekle
            for section in doc.sections:
                footer = section.footer
                footer.is_linked_to_previous = False
                p = footer.paragraphs[0] if footer.paragraphs else footer.add_paragraph()
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                run = p.add_run(footer_text)
                run.font.size = Pt(9)
                run.font.color.rgb = RGBColor(127, 140, 141)  # Gri
                run.font.name = 'Comic Sans MS'
    
    def create_diet_document(self, file_path: str, diet_program: list, 
                             template_name: str, pool_type: str, bki_group: str):
        """Diyet programı DOCX ve PDF oluştur.
        
        Args:
            file_path: Dosya yolu (uzantısız veya .docx'li)
            diet_program: Diyet programı verisi
            template_name: Kalıp adı
            pool_type: Havuz türü
            bki_group: BKİ grubu
            
        Returns:
            tuple: (docx_path, pdf_path)
        """
        # Dosya yollarını hazırla
        base_path = file_path.replace('.pdf', '').replace('.docx', '')
        docx_path = f"{base_path}.docx"
        pdf_path = f"{base_path}.pdf"
        
        # Yeni doküman oluştur
        doc = Document()
        
        # Varsayılan font ve satır aralığı ayarla
        style = doc.styles['Normal']
        font = style.font
        font.name = 'Comic Sans MS'
        font.size = Pt(11)
        # Satır aralığını 1.15 yap
        style.paragraph_format.line_spacing = 1.15
        style.paragraph_format.space_after = Pt(0)
        style.paragraph_format.space_before = Pt(0)
        
        # Her gün için içerik oluştur
        for i, day_data in enumerate(diet_program):
            day_num = day_data["day"]
            meals = day_data["meals"]
            
            # Gün başlığı (ortalı, yeşil, kalın)
            day_title = doc.add_paragraph()
            day_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = day_title.add_run(f"{day_num}. Gün")
            run.bold = True
            run.font.size = Pt(18)
            run.font.color.rgb = RGBColor(39, 174, 96)  # Yeşil
            run.font.name = 'Comic Sans MS'
            
            # Su hatırlatma (ortalı, yeşil, italik)
            water = doc.add_paragraph()
            water.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = water.add_run("(Her gün 2,5 litre su içmeyi unutmayın)")
            run.italic = True
            run.font.size = Pt(12)
            run.font.color.rgb = RGBColor(39, 174, 96)  # Yeşil
            run.font.name = 'Comic Sans MS'
            
            # Sabah aç karnına metin
            morning = doc.add_paragraph()
            run = morning.add_run("Sabah aç karnına 1 bardak su")
            run.bold = True
            run.font.size = Pt(11)
            run.font.name = 'Comic Sans MS'
            
            # Öğünler
            for meal in meals:
                time = meal["time"]
                meal_type = meal.get("meal_type", "")
                recipe_text = meal["recipe_text"]
                
                # Öğün başlığını ve rengini al
                display_name, color = self._get_meal_style(meal_type)
                
                # Öğün başlığı (kalın, renkli)
                meal_para = doc.add_paragraph()
                meal_para.paragraph_format.space_before = Pt(12)  # Öğünler arası boşluk
                run = meal_para.add_run(f"{display_name}:{time}")
                run.bold = True
                run.font.size = Pt(13)
                run.font.color.rgb = color
                run.font.name = 'Comic Sans MS'
                
                # İçerik - virgülle ayrılmış öğeleri liste olarak göster (girintili)
                items = [item.strip() for item in recipe_text.split(",")]
                for item in items:
                    if item:
                        # Manuel bullet ile girintili paragraf
                        item_para = doc.add_paragraph()
                        item_para.paragraph_format.left_indent = Cm(1.5)
                        item_para.paragraph_format.first_line_indent = Cm(-0.5)
                        run = item_para.add_run(f"• {item}")
                        run.font.size = Pt(11)
                        run.font.color.rgb = RGBColor(0, 0, 0)  # Siyah
                        run.font.name = 'Comic Sans MS'
            
            # Son gün değilse sayfa sonu ekle
            if i < len(diet_program) - 1:
                doc.add_page_break()
        
        # Footer ekle
        self._add_footer(doc)
        
        # DOCX kaydet
        doc.save(docx_path)
        
        # PDF'e dönüştür
        try:
            convert(docx_path, pdf_path)
        except Exception as e:
            print(f"PDF dönüştürme hatası: {e}")
            pdf_path = None
        
        return docx_path, pdf_path


# Geriye uyumluluk için alias
PDFGenerator = DocumentGenerator
