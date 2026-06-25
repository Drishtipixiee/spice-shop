import os
import psycopg2
from dotenv import load_dotenv

# Load env variables from backend/.env
env_path = r"c:\Users\pande\New folder\spice-shop\backend\.env"
load_dotenv(env_path)

db_url = os.getenv("DATABASE_URL")
print("Connecting to DB:", db_url.split("@")[-1]) # print host only for safety

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    # 1. Check if tables exist
    cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public';
    """)
    tables = cur.fetchall()
    print("Tables found in 'public':", [t[0] for t in tables])
    
    # 2. Check products count
    if ('products',) in tables:
        cur.execute("SELECT count(*) FROM products;")
        count = cur.fetchone()[0]
        print("Products count:", count)
        
        cur.execute("SELECT id, name, category, price FROM products LIMIT 3;")
        for row in cur.fetchall():
            print(" - Product:", row)
    else:
        print("Table 'products' does not exist!")

    # 3. Check site_settings
    if ('site_settings',) in tables:
        cur.execute("SELECT key, value FROM site_settings;")
        for row in cur.fetchall():
            print(" - Setting:", row[0], row[1])
    else:
        print("Table 'site_settings' does not exist!")

    # 4. Check orders
    if ('orders',) in tables:
        cur.execute("SELECT count(*) FROM orders;")
        count = cur.fetchone()[0]
        print("Orders count:", count)
    else:
        print("Table 'orders' does not exist!")
        
    # 5. Check if we can get jwt_secret
    try:
        cur.execute("show app.settings.jwt_secret;")
        val = cur.fetchone()
        print("app.settings.jwt_secret:", val)
    except Exception as e:
        print("Could not fetch app.settings.jwt_secret:", e)
        conn.rollback()

    cur.close()
    conn.close()
except Exception as e:
    print("Database connection or query failed:", e)
