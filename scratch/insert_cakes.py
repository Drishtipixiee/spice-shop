import os
import psycopg2
from dotenv import load_dotenv

# Load env variables from backend/.env
env_path = r"c:\Users\pande\New folder\spice-shop\backend\.env"
load_dotenv(env_path)

db_url = os.getenv("DATABASE_URL")
print("Connecting to DB:", db_url.split("@")[-1])

sql_script = """
INSERT INTO products (name, name_hindi, category, price, mrp, description, weight, is_bestseller, is_new, rating, review_count) VALUES
('Milk Cake (Kalakand)', 'मिल्क केक (कलाकंद)', 'cakes', 149, 180, 'Soft and moist traditional Kalakand made from pure cow milk.', '200g', false, true, 4.7, 67),
('Chocolate Truffle Cake', 'चॉकलेट ट्रफल केक', 'cakes', 550, 650, 'Rich chocolate sponge layered with dark chocolate ganache.', '500g', false, false, 4.9, 44);
"""

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute(sql_script)
    conn.commit()
    print("Successfully inserted Cake products into database!")
    cur.close()
    conn.close()
except Exception as e:
    print("Failed to insert Cake products:", e)
