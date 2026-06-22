-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;

-- Create Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL REFERENCES categories(name) ON DELETE RESTRICT ON UPDATE CASCADE,
  stock INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insert Categories
INSERT INTO categories (name) VALUES 
('Whole Spices'), 
('Powdered Spices'), 
('Spice Blends'), 
('Herbs');

-- Insert 11 Sample Products
INSERT INTO products (name, description, price, image_url, category, stock, is_featured) VALUES
('Kashmiri Red Chilli', 'Vibrant red color with a mild heat. Perfect for giving your dishes a rich, authentic hue without overwhelming spiciness.', 250.00, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80', 'Powdered Spices', 150, true),
('Turmeric Powder', 'Golden, aromatic, and packed with curcumin. An essential anti-inflammatory spice for everyday cooking.', 120.00, 'https://images.unsplash.com/photo-1615486171448-4fbaf0c12c75?auto=format&fit=crop&w=800&q=80', 'Powdered Spices', 200, true),
('Garam Masala', 'A fragrant blend of warming spices like cumin, cardamom, and cinnamon. The secret to rich Indian curries.', 350.00, 'https://images.unsplash.com/photo-1599909695276-80db2cd3914a?auto=format&fit=crop&w=800&q=80', 'Spice Blends', 85, true),
('Cumin Seeds (Jeera)', 'Earthy, nutty, and warm. An absolute must-have for tempering dals and vegetables.', 180.00, 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80', 'Whole Spices', 300, false),
('Coriander Powder', 'Freshly milled from premium seeds. Adds a mild, citrusy sweetness to gravies.', 140.00, 'https://images.unsplash.com/photo-1564149504298-00c351fd7f16?auto=format&fit=crop&w=800&q=80', 'Powdered Spices', 180, false),
('Black Pepper (Kali Mirch)', 'The King of Spices. Adds a sharp, penetrating aroma and heat to any dish.', 450.00, 'https://images.unsplash.com/photo-1618218168350-6e7c81151b64?auto=format&fit=crop&w=800&q=80', 'Whole Spices', 120, true),
('Green Cardamom', 'Highly aromatic with a complex, sweet flavor. Perfect for biryanis, teas, and desserts.', 850.00, 'https://images.unsplash.com/photo-1564149504817-d1378368526f?auto=format&fit=crop&w=800&q=80', 'Whole Spices', 50, true),
('Cloves (Laung)', 'Intensely warm and sweet. Use sparingly for an incredible depth of flavor in savory dishes.', 550.00, 'https://images.unsplash.com/photo-1596443360213-94c6fdf164cc?auto=format&fit=crop&w=800&q=80', 'Whole Spices', 90, false),
('Cinnamon Sticks', 'Sweet, woody aroma perfect for baking, curries, and warm beverages.', 320.00, 'https://images.unsplash.com/photo-1559144490-84a1e944b067?auto=format&fit=crop&w=800&q=80', 'Whole Spices', 140, false),
('Mustard Seeds (Rai)', 'Tiny seeds that pop with a nutty, sharp flavor when fried in hot oil.', 90.00, 'https://images.unsplash.com/photo-1613963435133-722c801d1c92?auto=format&fit=crop&w=800&q=80', 'Whole Spices', 250, false),
('Starter Kit Combo', 'The essential Indian spice collection. Contains 6 mini jars of our best-selling spices to kickstart your journey.', 999.00, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80', 'Spice Blends', 30, true);

-- Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create Policies (Public Read, Public Write for Demo purposes per user request)
CREATE POLICY "Allow public read access on products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read access on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public insert on products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on products" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on products" ON products FOR DELETE USING (true);
