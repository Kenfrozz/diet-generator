from database import Database, get_season_db_path

print(f"Populating DB at: {get_season_db_path()}")
db = Database()

# Recipes to add
recipes = [
    {
        "name": "Yulaf Lapası",
        "meal_type": "kahvalti",
        "pool_type": "normal",
        "content": "3 kaşık yulaf, 1 bardak süt, 1 muz"
    },
    {
        "name": "Izgara Tavuk Salata",
        "meal_type": "ogle",
        "pool_type": "normal",
        "content": "100gr tavuk göğüs, bol yeşillik, limon sosu"
    },
    {
        "name": "Yeşil Çay & Badem",
        "meal_type": "ara_ogun_1",
        "pool_type": "normal",
        "content": "1 kupa yeşil çay, 10 adet çiğ badem"
    },
    {
        "name": "Zeytinyağlı Brokoli",
        "meal_type": "aksam",
        "pool_type": "normal",
        "content": "Haşlanmış brokoli, sarımsaklı yoğurt, 1 kaşık zeytinyağı"
    },
    {
        "name": "Detoks Suyu",
        "meal_type": "ozel_icecek",
        "pool_type": "normal",
        "content": "1 litre su, salatalık, limon, nane"
    }
]

conn = db.connect()
cursor = conn.cursor()

try:
    count = 0
    for r in recipes:
        # Check if exists
        cursor.execute("SELECT COUNT(*) FROM recipes WHERE name = ?", (r['name'],))
        if cursor.fetchone()[0] == 0:
            db.add_recipe(
                r['name'], 
                r['meal_type'], 
                r['pool_type'], 
                r['content'], r['content'], r['content'], r['content']
            )
            count += 1
            
    print(f"Added {count} sample recipes.")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
