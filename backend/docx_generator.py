from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import os
import datetime

class DOCXGenerator:
    def __init__(self, footer_info=None):
        self.footer_info = footer_info or {}

    def create_diet_docx(self, file_path, diet_program, patient_name, start_date, template_name, bki_group, excluded_foods, combination_code):
        doc = Document()
        
        # --- Styles ---
        style = doc.styles['Normal']
        font = style.font
        font.name = 'Calibri'
        font.size = Pt(11)

        # --- Header ---
        header_section = doc.sections[0]
        header = header_section.header
        htable = header.add_table(1, 2, width=Inches(6))
        htable.autofit = False
        htable.columns[0].width = Inches(4)
        htable.columns[1].width = Inches(2)
        
        # Left Header (Title)
        h_cell1 = htable.cell(0, 0)
        p = h_cell1.paragraphs[0]
        p.add_run("KİŞİYE ÖZEL BESLENME PROGRAMI").bold = True
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        
        # Right Header (Date)
        h_cell2 = htable.cell(0, 1)
        p = h_cell2.paragraphs[0]
        p.add_run(datetime.datetime.now().strftime("%d.%m.%Y")).italic = True
        p.alignment = WD_ALIGN_PARAGRAPH.RIGHT

        # --- Client Info ---
        doc.add_paragraph() # Spacer
        
        info_table = doc.add_table(rows=4, cols=2)
        info_table.autofit = False
        info_table.columns[0].width = Inches(1.5)
        info_table.columns[1].width = Inches(4.5)

        def add_row(label, value):
            row = info_table.add_row().cells
            p = row[0].paragraphs[0]
            p.add_run(label).bold = True
            row[1].text = str(value)

        # Remove empty first row created by add_table
        # info_table._tbl.remove(info_table.rows[0]._tr) 
        # Actually simplest is just to set values on existing rows if we knew count, 
        # but add_row adds new ones. Let's just use the ones we created.
        
        # We created 4 rows initially
        
        cells = info_table.rows[0].cells
        cells[0].paragraphs[0].add_run("Danışan Adı:").bold = True
        cells[1].text = patient_name

        cells = info_table.rows[1].cells
        cells[0].paragraphs[0].add_run("Başlangıç Tarihi:").bold = True
        cells[1].text = start_date

        cells = info_table.rows[2].cells
        cells[0].paragraphs[0].add_run("Diyet Tipi:").bold = True
        cells[1].text = f"{template_name} ({bki_group})"

        cells = info_table.rows[3].cells
        cells[0].paragraphs[0].add_run("Kombinasyon:").bold = True
        cells[1].text = combination_code or "-"

        if excluded_foods:
            row = info_table.add_row().cells
            row[0].paragraphs[0].add_run("İstenmeyenler:").bold = True
            row[1].text = excluded_foods

        doc.add_paragraph() # Spacer

        # --- Diet Program ---
        
        for day_data in diet_program:
            # Day Title
            h = doc.add_heading(f"{day_data['day']}. GÜN", level=2)
            h.alignment = WD_ALIGN_PARAGRAPH.CENTER
            
            # Meals Table
            table = doc.add_table(rows=1, cols=2)
            table.style = 'Table Grid'
            table.autofit = False
            table.columns[0].width = Inches(1.5) # Time/Meal Name
            table.columns[1].width = Inches(5.0) # Content
            
            # Header Row
            hdr_cells = table.rows[0].cells
            hdr_cells[0].text = "Öğün"
            hdr_cells[1].text = "İçerik"
            
            # Make header bold
            for cell in hdr_cells:
                for paragraph in cell.paragraphs:
                    for run in paragraph.runs:
                        run.font.bold = True
                        
            # Meals
            for meal in day_data['meals']:
                row = table.add_row().cells
                
                # Left Column: Time & Name
                p = row[0].paragraphs[0]
                p.add_run(f"{meal['time']}\n").bold = True
                p.add_run(meal['meal_name'])
                
                # Right Column: Recipe
                row[1].text = meal['recipe_text']
            
            doc.add_paragraph() # Spacer between days

        # --- Footer ---
        section = doc.sections[0]
        footer = section.footer
        p = footer.paragraphs[0]
        
        footer_text = []
        if self.footer_info.get("website"): footer_text.append(self.footer_info["website"])
        if self.footer_info.get("instagram"): footer_text.append(f"IG: {self.footer_info['instagram']}")
        if self.footer_info.get("phone"): footer_text.append(f"Tel: {self.footer_info['phone']}")
        
        p.text = " | ".join(footer_text)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.style.font.size = Pt(9)
        p.style.font.color.rgb = RGBColor(100, 100, 100)

        doc.save(file_path)
        return file_path
