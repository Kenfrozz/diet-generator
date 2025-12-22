from database import Database, get_season_db_path

print(f"Checking DB at: {get_season_db_path()}")
db = Database()
conn = db.connect()
cursor = conn.cursor()

try:
    cursor.execute("SELECT COUNT(*) FROM diet_templates")
    templates = cursor.fetchone()[0]
    print(f"Templates: {templates}")

    cursor.execute("SELECT COUNT(*) FROM recipes")
    recipes = cursor.fetchone()[0]
    print(f"Recipes: {recipes}")
    
    cursor.execute("SELECT * FROM settings")
    settings = cursor.fetchall()
    print("Settings:", [dict(row) for row in settings])

except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
