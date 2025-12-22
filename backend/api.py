from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import sys

# Add current directory to path to allow importing local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import Database

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("--- API RELOADED: Using Popen for Bot ---")
    db = Database()
    db.initialize()
    yield
    # Shutdown (if needed)

app = FastAPI(title="DetoksBot API", lifespan=lifespan)

# Configure CORS for Electron/React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the Electron app's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database
def get_db():
    db = Database()
    return db

@app.get("/")
def read_root():
    return {"status": "ok", "message": "DetoksBot Backend is running"}

# --- Auth Models ---
class LoginRequest(BaseModel):
    username: str
    password: str

# --- Recipe Models ---
class RecipeRequest(BaseModel):
    name: str
    content: str
    meal_type: str
    pool_type: str

# --- API Endpoints ---

@app.post("/api/login")
def login(request: LoginRequest):
    db = get_db()
    user = db.verify_user(request.username, request.password)
    if user:
        return {"status": "success", "user": user}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/recipes")
def get_recipes(pool_type: Optional[str] = None):
    db = get_db()
    recipes = db.get_all_recipes(pool_type=pool_type)
    # Map bki_21_25 to content for frontend compatibility
    for recipe in recipes:
        recipe['content'] = recipe.get('bki_21_25', '')
    return recipes

@app.post("/api/recipes")
def create_recipe(recipe: RecipeRequest):
    db = get_db()
    try:
        # Pass content to all BMI fields
        db.add_recipe(
            recipe.name, 
            recipe.meal_type, 
            recipe.pool_type, 
            recipe.content, # bki_21_25
            recipe.content, # bki_26_29
            recipe.content, # bki_30_33
            recipe.content  # bki_34_plus
        )
        return {"status": "success", "message": "Recipe added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/recipes/{recipe_id}")
def update_recipe(recipe_id: int, recipe: RecipeRequest):
    db = get_db()
    try:
        # Pass content to all BMI fields
        db.update_recipe(
            recipe_id,
            recipe.name, 
            recipe.meal_type, 
            recipe.pool_type, 
            recipe.content, # bki_21_25
            recipe.content, # bki_26_29
            recipe.content, # bki_30_33
            recipe.content  # bki_34_plus
        )
        return {"status": "success", "message": "Recipe updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/recipes/{recipe_id}")
def delete_recipe(recipe_id: int):
    db = get_db()
    try:
        db.delete_recipe(recipe_id)
        return {"status": "success", "message": "Recipe deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Settings Endpoints ---

class SettingsRequest(BaseModel):
    season: Optional[str] = None # Deprecated but kept for compatibility
    summer_start: Optional[str] = None
    summer_end: Optional[str] = None
    days_count: Optional[str] = None
    save_path: Optional[str] = None

@app.get("/api/settings")
def get_settings():
    db = get_db()
    settings = db.get_all_settings()
    
    # Add season config info
    from database import get_current_season, get_season_config
    settings['season'] = get_current_season()
    
    config = get_season_config()
    settings['summer_start'] = config.get('summer_start', '04-01')
    settings['summer_end'] = config.get('summer_end', '10-01')
    
    return settings

@app.post("/api/settings")
def update_settings(settings: SettingsRequest):
    db = get_db()
    try:
        if settings.days_count:
            db.set_setting('days_count', settings.days_count)
        if settings.save_path:
            db.set_setting('save_path', settings.save_path)
            
        # Update season dates if provided
        if settings.summer_start and settings.summer_end:
            from database import save_season_config
            save_season_config(settings.summer_start, settings.summer_end)
            
        return {"status": "success", "message": "Settings updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Template Models ---

class MealRequest(BaseModel):
    time: str
    meal_name: str
    meal_type: str

class TemplateRequest(BaseModel):
    name: str
    meals: List[MealRequest]

# --- Template Endpoints ---

@app.get("/api/templates")
def get_templates():
    db = get_db()
    templates = db.get_all_templates()
    return templates

@app.get("/api/templates/{template_id}")
def get_template(template_id: int):
    db = get_db()
    template = db.get_template(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

@app.post("/api/templates")
def create_template(template: TemplateRequest):
    db = get_db()
    try:
        # Convert Pydantic models back to tuple list expected by database.py
        meals_data = [
            (m.time, m.meal_name, m.meal_type) for m in template.meals
        ]
        
        template_id = db.add_template(template.name, meals_data)
        return {"status": "success", "id": template_id, "message": "Template created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/templates/{template_id}")
def update_template(template_id: int, template: TemplateRequest):
    db = get_db()
    try:
        meals_data = [
            (m.time, m.meal_name, m.meal_type) for m in template.meals
        ]
        
        db.update_template(template_id, template.name, meals_data)
        return {"status": "success", "message": "Template updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/templates/{template_id}")
def delete_template(template_id: int):
    db = get_db()
    try:
        db.delete_template(template_id)
        return {"status": "success", "message": "Template deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/templates/{template_id}")
def delete_template(template_id: int):
    db = get_db()
    try:
        db.delete_template(template_id)
        return {"status": "success", "message": "Template deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Generator Models ---

class GenerateDietRequest(BaseModel):
    patient_name: str
    weight: float
    height: float
    birth_year: int
    gender: str
    template_id: int
    pool_type: str
    days: int
    start_date: str
    excluded_foods: Optional[str] = ""
    combination_code: Optional[str] = ""
    output_format: str = "pdf" # pdf, docx, both

# --- Generator Utils ---

def calculate_bmi_group(weight: float, height: float) -> str:
    # height in cm, convert to meters
    h_m = height / 100.0
    bmi = weight / (h_m * h_m)
    
    if bmi < 26:
        return "21_25"
    elif bmi < 30:
        return "26_29"
    elif bmi < 34:
        return "30_33"
    else:
        return "34_plus"

# --- Generator Endpoints ---

@app.post("/api/generate")
def generate_diet(request: GenerateDietRequest):
    import random
    import datetime
    from pdf_generator import PDFGenerator
    from docx_generator import DOCXGenerator
    
    db = get_db()
    try:
        # 1. Get Template
        template = db.get_template(request.template_id)
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
            
        # 2. Calculate BMI Group
        bki_group = calculate_bmi_group(request.weight, request.height)
        
        # 3. Prepare Logic
        exclude_words = [w.strip().lower() for w in request.excluded_foods.split(",") if w.strip()]
        diet_program = []
        
        # 4. Generate Program
        for day in range(1, request.days + 1):
            day_meals = []
            
            # Sort meals by order (they are tuples: (time, name, type)) in template['meals']
            for meal_tuple in template['meals']:
                meal_time, meal_name, meal_type = meal_tuple
                
                # Fetch recipes for this slot
                recipes = db.get_all_recipes(request.pool_type, meal_type)
                
                # Filter (BMI content check + Exclusions)
                candidates = []
                for r in recipes:
                    # Determine which content field to use based on BMI
                    # db.add_recipe columns: bki_21_25, bki_26_29, etc.
                    content_key = f"bki_{bki_group}"
                    recipe_content = r.get(content_key, r.get('bki_21_25', '')) # Fallback
                    
                    # Check exclusions
                    if exclude_words:
                         if any(x in recipe_content.lower() for x in exclude_words):
                             continue
                             
                    candidates.append({
                        "id": r['id'],
                        "name": r['name'],
                        "content": recipe_content
                    })
                
                # Select Random
                if candidates:
                    selected = random.choice(candidates)
                    recipe_text = selected['content']
                else:
                    recipe_text = "Uygun tarif bulunamadı."
                    
                day_meals.append({
                    "time": meal_time,
                    "meal_name": meal_name,
                    "meal_type": meal_type,
                    "recipe_text": recipe_text
                })
            
            diet_program.append({
                "day": day,
                "meals": day_meals
            })
            
        # 5. Determine Save Path and Filenames
        save_dir = db.get_setting('save_path')
        if not save_dir or not os.path.exists(save_dir):
            save_dir = os.path.join(os.path.expanduser("~"), "Desktop")
            
        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M')
        base_filename = f"Diyet_{request.patient_name.replace(' ', '_')}_{timestamp}"
        
        generated_files = []
        
        # Get footer info from DB
        footer_info = {
            "phone": db.get_setting("footer_phone", ""),
            "website": db.get_setting("footer_website", ""),
            "instagram": db.get_setting("footer_instagram", "")
        }

        # 6. Generate Requested Formats
        
        # PDF Generation
        if request.output_format in ["pdf", "both"]:
            pdf_path = os.path.join(save_dir, f"{base_filename}.pdf")
            pdf_gen = PDFGenerator(footer_info=footer_info)
            pdf_gen.create_diet_pdf(
                file_path=pdf_path,
                diet_program=diet_program,
                template_name=template['name'],
                pool_type=request.pool_type,
                bki_group=bki_group
            )
            generated_files.append(pdf_path)

        # DOCX Generation
        if request.output_format in ["docx", "both"]:
            docx_path = os.path.join(save_dir, f"{base_filename}.docx")
            docx_gen = DOCXGenerator(footer_info=footer_info)
            docx_gen.create_diet_docx(
                file_path=docx_path,
                diet_program=diet_program,
                patient_name=request.patient_name,
                start_date=request.start_date,
                template_name=template['name'],
                bki_group=bki_group,
                excluded_foods=request.excluded_foods,
                combination_code=request.combination_code
            )
            generated_files.append(docx_path)
        
        return {
            "status": "success", 
            "message": "Diet generated successfully", 
            "files": generated_files,
            "bki_group": bki_group
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/pools")
def get_pools():
    db = get_db()
    pools = db.get_all_pools()
    return pools

# Global variable to store process
bot_process = None

class DetoksBotRequest(BaseModel):
    count: int

@app.post("/api/run-detoks-bot")
def run_detoks_bot(request: DetoksBotRequest):
    global bot_process
    import subprocess
    
    # Check if already running
    if bot_process and bot_process.poll() is None:
        raise HTTPException(status_code=400, detail="Bot is already running")

    try:
        script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "detoks-liste-gonder.py")
        # Use Popen for non-blocking execution
        bot_process = subprocess.Popen([sys.executable, script_path, str(request.count)])
        return {"status": "success", "message": "Bot started"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/stop-detoks-bot")
def stop_detoks_bot():
    global bot_process
    if bot_process and bot_process.poll() is None:
        bot_process.terminate()
        return {"status": "success", "message": "Bot stopped"}
    return {"status": "info", "message": "Bot is not running"}

@app.get("/api/detoks-bot-status")
def get_detoks_bot_status():
    global bot_process
    if bot_process and bot_process.poll() is None:
        return {"status": "running"}
    return {"status": "stopped"}

if __name__ == "__main__":
    import uvicorn
    # Run on a specific port, e.g., 8000
    uvicorn.run(app, host="127.0.0.1", port=8000)
