import os
import psycopg2
from dotenv import load_dotenv

# Load env variables from backend/.env
env_path = r"c:\Users\pande\New folder\spice-shop\backend\.env"
load_dotenv(env_path)

db_url = os.getenv("DATABASE_URL")
print("Connecting to DB:", db_url.split("@")[-1])

sql_script = """
-- DROP OLD TABLES
DROP TABLE IF EXISTS variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;

-- Enable gen_random_uuid
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- PRODUCTS TABLE
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_hindi text,
  category text not null check (category in ('dairy','spices','combos','cakes')),
  price integer not null,
  mrp integer not null,
  image_url text default 'https://via.placeholder.com/400x300?text=Product',
  description text,
  weight text,
  is_bestseller boolean default false,
  is_new boolean default false,
  in_stock boolean default true,
  rating numeric default 4.5,
  review_count integer default 0,
  created_at timestamptz default now()
);

-- ORDERS TABLE
create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  customer_pincode text,
  items jsonb not null,
  subtotal integer not null,
  delivery_charge integer default 40,
  total integer not null,
  payment_method text default 'razorpay' check (payment_method in ('razorpay','cod')),
  payment_status text default 'pending' check (payment_status in ('pending','paid','failed')),
  razorpay_order_id text,
  razorpay_payment_id text,
  order_status text default 'placed' check (order_status in ('placed','confirmed','packed','shipped','delivered','cancelled')),
  notes text,
  created_at timestamptz default now()
);

-- SITE SETTINGS TABLE (for homepage sections admin can edit)
create table site_settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

-- Insert default settings
insert into site_settings (key, value) values
  ('hero', '{"headline":"Fresh Dairy, Authentic Spices","subheadline":"Farm-fresh dairy delivered to your doorstep. Handpicked spices from the finest farms of India.","cta_dairy":"Shop Dairy","cta_spices":"Shop Spices"}'),
  ('announcement', '{"text":"🚚 Free delivery above ₹499 🏛️ FSSAI Certified 🌿 100% Natural ⭐ 4.9/5 from 10,000+ customers"}'),
  ('stats', '{"products":33,"customers":10000,"states":15,"since":2020}'),
  ('contact', '{"phone1":"+91 98923 60874","phone2":"+91 88793 14335","email1":"pandeyanurag15@gmail.com","email2":"darshanbhalerao07@gmail.com","whatsapp":"919892360874"}');

-- ENABLE Row Level Security
alter table products enable row level security;
alter table orders enable row level security;
alter table site_settings enable row level security;

-- Policies
create policy "Anyone can read products" on products for select using (true);
create policy "Anyone can read settings" on site_settings for select using (true);
create policy "Service role manages products" on products for all using (true);
create policy "Service role manages orders" on orders for all using (true);
create policy "Service role manages settings" on site_settings for all using (true);

-- SEED 10 sample products
insert into products (name, name_hindi, category, price, mrp, description, weight, is_bestseller, is_new, rating, review_count) values
('Pure Desi Ghee', 'शुद्ध देसी घी', 'dairy', 450, 520, 'Farm-fresh A2 cow ghee, slow-churned the traditional way. Rich aroma, golden colour.', '500ml', true, false, 4.9, 2847),
('Fresh Paneer', 'ताज़ा पनीर', 'dairy', 180, 200, 'Soft, fresh paneer made daily from full-fat cow milk. No preservatives.', '200g', true, false, 4.8, 1923),
('Sweet Lassi', 'मीठी लस्सी', 'dairy', 60, 70, 'Thick, creamy lassi made from pure curd. Chilled and ready to drink.', '300ml', false, true, 4.7, 834),
('Fresh Dahi', 'ताज़ी दही', 'dairy', 80, 90, 'Set curd from pure cow milk. Perfect for raita, kadhi, and everyday eating.', '500g', false, false, 4.6, 1205),
('Turmeric Powder', 'हल्दी पाउडर', 'spices', 120, 150, 'Pure haldi sourced from Erode farms. Lab-tested, no added colour or fillers.', '200g', true, false, 4.9, 3241),
('Garam Masala', 'गरम मसाला', 'spices', 90, 110, 'Authentic blend of 18 spices. Hand-ground in small batches for maximum aroma.', '100g', true, false, 4.8, 2156),
('Cumin Seeds', 'जीरा', 'spices', 75, 90, 'Bold, aromatic jeera from Rajasthan. Essential for tempering dals and vegetables.', '200g', false, false, 4.7, 987),
('Red Chilli Powder', 'लाल मिर्च पाउडर', 'spices', 85, 100, 'Vibrant, spicy red chilli powder. Adds deep colour and heat to curries.', '200g', false, false, 4.6, 1432),
('Dairy & Spice Starter Pack', 'डेयरी और मसाला स्टार्टर पैक', 'combos', 599, 750, 'Perfect starter kit: 200ml Ghee + 200g Paneer + Haldi + Garam Masala + Jeera. Save ₹151!', '5 items', true, true, 4.9, 562),
('Festival Gift Hamper', 'फेस्टिवल गिफ्ट हैम्पर', 'combos', 1199, 1500, 'Premium gifting box: 500ml Ghee + 400g Paneer + 3 spice packs in a beautiful gift box.', '7 items', false, true, 4.8, 341);
"""

try:
    conn = psycopg2.connect(db_url)
    conn.autocommit = False
    cur = conn.cursor()
    
    print("Executing SQL script...")
    cur.execute(sql_script)
    
    conn.commit()
    print("Database setup and seeding completed successfully!")
    
    cur.close()
    conn.close()
except Exception as e:
    print("Database setup failed:", e)
