-- Execute this entire file in your Supabase SQL Editor

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    image_url TEXT,
    description TEXT,
    product_count INTEGER DEFAULT 0
);

-- 2. Create Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Variants Table
CREATE TABLE IF NOT EXISTS variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    weight_label VARCHAR(50) NOT NULL,
    price_inr DECIMAL(10,2) NOT NULL,
    mrp_inr DECIMAL(10,2) NOT NULL,
    stock_qty INTEGER DEFAULT 0,
    sku VARCHAR(100) UNIQUE
);

-- 4. Insert Seed Data
INSERT INTO categories (id, name, slug, image_url, description, product_count) VALUES
(1, 'Spices', 'spices', 'https://upload.wikimedia.org/wikipedia/commons/3/35/Indian_Spices.jpg', 'Premium quality Indian spices', 8),
(2, 'Dairy', 'dairy', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Paneer_%28Indian_Cheese%29.jpg/640px-Paneer_%28Indian_Cheese%29.jpg', 'Fresh dairy products', 3),
(3, 'Combo Packs', 'combo-packs', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Indian_Spices.jpg/640px-Indian_Spices.jpg', 'Value combo packs', 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, category_id, name, slug, description, image_url, is_active, is_featured) VALUES
(1, 1, 'Turmeric Powder (Haldi)', 'turmeric-powder', 'Premium quality turmeric powder.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Turmeric_powder.jpg/640px-Turmeric_powder.jpg', TRUE, TRUE),
(2, 1, 'Red Chilli Powder (Lal Mirch)', 'red-chilli-powder', 'Fiery red chilli powder.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Chili_powder.jpg/640px-Chili_powder.jpg', TRUE, TRUE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO variants (product_id, weight_label, price_inr, mrp_inr, stock_qty, sku) VALUES
(1, '50g', 35.0, 45.0, 100, 'TUR-50'),
(1, '100g', 65.0, 85.0, 100, 'TUR-100'),
(2, '50g', 40.0, 50.0, 100, 'RCP-50')
ON CONFLICT (sku) DO NOTHING;

-- 5. Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;

-- 6. Create Public Read Access Policies
CREATE POLICY "Allow public read access on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access on products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read access on variants" ON variants FOR SELECT USING (true);
