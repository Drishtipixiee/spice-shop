"""
Seed script for the Spice Shop database.
Idempotent – checks before inserting so it can be run multiple times safely.
"""

from passlib.context import CryptContext
from sqlalchemy.orm import Session

from database import SessionLocal, engine
from models import (
    AdminUser,
    Base,
    Category,
    PincodeZone,
    Product,
    ProductVariant,
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ─────────────────────────── Seed Data ───────────────────────────

CATEGORIES = [
    {
        "name": "Spices",
        "slug": "spices",
        "image_url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400",
        "description": "Premium quality Indian spices",
    },
    {
        "name": "Dairy",
        "slug": "dairy",
        "image_url": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400",
        "description": "Fresh dairy products",
    },
    {
        "name": "Combo Packs",
        "slug": "combo-packs",
        "image_url": "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400",
        "description": "Value combo packs",
    },
]

PRODUCTS = [
    {
        "name": "Turmeric Powder (Haldi)",
        "slug": "turmeric-powder",
        "category_slug": "spices",
        "is_featured": True,
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Turmeric-powder.jpg/800px-Turmeric-powder.jpg",
        "description": "Premium quality turmeric powder sourced from Erode, Tamil Nadu. Known for its rich golden color and high curcumin content.",
        "variants": [
            {"weight_label": "50g", "price_inr": 35, "mrp_inr": 45, "sku": "TUR-50"},
            {"weight_label": "100g", "price_inr": 65, "mrp_inr": 85, "sku": "TUR-100"},
            {"weight_label": "250g", "price_inr": 150, "mrp_inr": 190, "sku": "TUR-250"},
            {"weight_label": "500g", "price_inr": 280, "mrp_inr": 360, "sku": "TUR-500"},
        ],
    },
    {
        "name": "Red Chilli Powder (Lal Mirch)",
        "slug": "red-chilli-powder",
        "category_slug": "spices",
        "is_featured": True,
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Red_chili_powder.jpg/800px-Red_chili_powder.jpg",
        "description": "Fiery red chilli powder made from hand-picked Guntur chillies. Perfect heat level for Indian cooking.",
        "variants": [
            {"weight_label": "50g", "price_inr": 40, "mrp_inr": 50, "sku": "RCP-50"},
            {"weight_label": "100g", "price_inr": 75, "mrp_inr": 95, "sku": "RCP-100"},
            {"weight_label": "250g", "price_inr": 175, "mrp_inr": 220, "sku": "RCP-250"},
            {"weight_label": "500g", "price_inr": 330, "mrp_inr": 420, "sku": "RCP-500"},
        ],
    },
    {
        "name": "Coriander Powder (Dhaniya)",
        "slug": "coriander-powder",
        "category_slug": "spices",
        "is_featured": True,
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Coriander_powder.jpg/800px-Coriander_powder.jpg",
        "description": "Freshly ground coriander powder with an aromatic flavor. Essential for curries and chutneys.",
        "variants": [
            {"weight_label": "50g", "price_inr": 30, "mrp_inr": 40, "sku": "COR-50"},
            {"weight_label": "100g", "price_inr": 55, "mrp_inr": 70, "sku": "COR-100"},
            {"weight_label": "250g", "price_inr": 130, "mrp_inr": 165, "sku": "COR-250"},
            {"weight_label": "500g", "price_inr": 240, "mrp_inr": 310, "sku": "COR-500"},
        ],
    },
    {
        "name": "Cumin Seeds (Jeera)",
        "slug": "cumin-seeds",
        "category_slug": "spices",
        "is_featured": True,
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Cumin_seeds.jpg/800px-Cumin_seeds.jpg",
        "description": "Whole cumin seeds with strong aroma. Perfect for tempering dals and curries.",
        "variants": [
            {"weight_label": "50g", "price_inr": 45, "mrp_inr": 60, "sku": "CUM-50"},
            {"weight_label": "100g", "price_inr": 85, "mrp_inr": 110, "sku": "CUM-100"},
            {"weight_label": "250g", "price_inr": 200, "mrp_inr": 255, "sku": "CUM-250"},
            {"weight_label": "500g", "price_inr": 380, "mrp_inr": 480, "sku": "CUM-500"},
        ],
    },
    {
        "name": "Garam Masala",
        "slug": "garam-masala",
        "category_slug": "spices",
        "is_featured": True,
        "image_url": "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=600",
        "description": "A perfect blend of 13 whole spices, roasted and ground fresh. The soul of Indian cooking.",
        "variants": [
            {"weight_label": "50g", "price_inr": 55, "mrp_inr": 70, "sku": "GAR-50"},
            {"weight_label": "100g", "price_inr": 100, "mrp_inr": 130, "sku": "GAR-100"},
            {"weight_label": "250g", "price_inr": 240, "mrp_inr": 305, "sku": "GAR-250"},
            {"weight_label": "500g", "price_inr": 450, "mrp_inr": 575, "sku": "GAR-500"},
        ],
    },
    {
        "name": "Black Pepper (Kali Mirch)",
        "slug": "black-pepper",
        "category_slug": "spices",
        "is_featured": True,
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Black_pepper.jpg/800px-Black_pepper.jpg",
        "description": "Premium Malabar black pepper, hand-picked and sun-dried. Bold flavor and strong aroma.",
        "variants": [
            {"weight_label": "50g", "price_inr": 70, "mrp_inr": 90, "sku": "BPP-50"},
            {"weight_label": "100g", "price_inr": 130, "mrp_inr": 170, "sku": "BPP-100"},
            {"weight_label": "250g", "price_inr": 310, "mrp_inr": 395, "sku": "BPP-250"},
            {"weight_label": "500g", "price_inr": 590, "mrp_inr": 750, "sku": "BPP-500"},
        ],
    },
    {
        "name": "Green Cardamom (Elaichi)",
        "slug": "green-cardamom",
        "category_slug": "spices",
        "is_featured": True,
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Green_Cardamom_pods.jpg/800px-Green_Cardamom_pods.jpg",
        "description": "Aromatic green cardamom pods from Kerala. Perfect for chai, biryani, and desserts.",
        "variants": [
            {"weight_label": "10g", "price_inr": 60, "mrp_inr": 80, "sku": "ELA-10"},
            {"weight_label": "25g", "price_inr": 140, "mrp_inr": 180, "sku": "ELA-25"},
            {"weight_label": "50g", "price_inr": 270, "mrp_inr": 345, "sku": "ELA-50"},
            {"weight_label": "100g", "price_inr": 520, "mrp_inr": 665, "sku": "ELA-100"},
        ],
    },
    {
        "name": "Fennel Seeds (Saunf)",
        "slug": "fennel-seeds",
        "category_slug": "spices",
        "is_featured": False,
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Fennel_seed.jpg/800px-Fennel_seed.jpg",
        "description": "Sweet and aromatic fennel seeds. Great as a mouth freshener and cooking spice.",
        "variants": [
            {"weight_label": "50g", "price_inr": 35, "mrp_inr": 45, "sku": "FEN-50"},
            {"weight_label": "100g", "price_inr": 65, "mrp_inr": 85, "sku": "FEN-100"},
            {"weight_label": "250g", "price_inr": 150, "mrp_inr": 195, "sku": "FEN-250"},
            {"weight_label": "500g", "price_inr": 280, "mrp_inr": 360, "sku": "FEN-500"},
        ],
    },
    {
        "name": "Pure Desi Ghee",
        "slug": "pure-desi-ghee",
        "category_slug": "dairy",
        "is_featured": True,
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Ghee.jpg/800px-Ghee.jpg",
        "description": "Traditional bilona method ghee made from A2 cow milk. Rich aroma and golden texture.",
        "variants": [
            {"weight_label": "250ml", "price_inr": 180, "mrp_inr": 220, "sku": "GHE-250"},
            {"weight_label": "500ml", "price_inr": 340, "mrp_inr": 420, "sku": "GHE-500"},
            {"weight_label": "1L", "price_inr": 650, "mrp_inr": 800, "sku": "GHE-1000"},
            {"weight_label": "2L", "price_inr": 1250, "mrp_inr": 1540, "sku": "GHE-2000"},
        ],
    },
    {
        "name": "Fresh Paneer",
        "slug": "fresh-paneer",
        "category_slug": "dairy",
        "is_featured": False,
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Paneer.jpg/800px-Paneer.jpg",
        "description": "Soft and fresh paneer made daily from farm-fresh milk. Perfect for curries and tikka.",
        "variants": [
            {"weight_label": "200g", "price_inr": 80, "mrp_inr": 100, "sku": "PAN-200"},
            {"weight_label": "500g", "price_inr": 190, "mrp_inr": 240, "sku": "PAN-500"},
            {"weight_label": "1kg", "price_inr": 370, "mrp_inr": 470, "sku": "PAN-1000"},
        ],
    },
    {
        "name": "White Butter (Makhan)",
        "slug": "white-butter",
        "category_slug": "dairy",
        "is_featured": False,
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Butter_on_a_plate.jpg/800px-Butter_on_a_plate.jpg",
        "description": "Fresh white butter churned from cream. Adds rich taste to parathas and rotis.",
        "variants": [
            {"weight_label": "100g", "price_inr": 55, "mrp_inr": 70, "sku": "BUT-100"},
            {"weight_label": "200g", "price_inr": 105, "mrp_inr": 135, "sku": "BUT-200"},
            {"weight_label": "500g", "price_inr": 250, "mrp_inr": 320, "sku": "BUT-500"},
        ],
    },
    {
        "name": "Shahi Indian Spice Box",
        "slug": "shahi-indian-spice-box",
        "category_slug": "combo-packs",
        "is_featured": True,
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Indian_Spices.jpg/800px-Indian_Spices.jpg",
        "description": "A premium bundle containing Haldi, Lal Mirch, Dhaniya, and Garam Masala. Perfect for everyday cooking.",
        "variants": [
            {"weight_label": "Standard (100g each)", "price_inr": 280, "mrp_inr": 380, "sku": "CMB-SHAHI-STD"},
            {"weight_label": "Premium (250g each)", "price_inr": 650, "mrp_inr": 875, "sku": "CMB-SHAHI-PRM"},
        ],
    },
    {
        "name": "Daily Pure Dairy Essentials Combo",
        "slug": "daily-pure-dairy-essentials",
        "category_slug": "combo-packs",
        "is_featured": True,
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Dairy_products.jpg/800px-Dairy_products.jpg",
        "description": "Get all your daily dairy needs in one bundle. Contains Desi Ghee, Fresh Paneer, and White Butter.",
        "variants": [
            {"weight_label": "Starter Pack", "price_inr": 310, "mrp_inr": 390, "sku": "CMB-DAIRY-STR"},
            {"weight_label": "Family Pack", "price_inr": 750, "mrp_inr": 980, "sku": "CMB-DAIRY-FAM"},
        ],
    },
    {
        "name": "Festive Cooking Kit",
        "slug": "festive-cooking-kit",
        "category_slug": "combo-packs",
        "is_featured": True,
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Indian_sweets_and_snacks.jpg/800px-Indian_sweets_and_snacks.jpg",
        "description": "A luxurious combination of our finest Pure Desi Ghee and Green Cardamom to make your festive desserts extra special.",
        "variants": [
            {"weight_label": "Standard Pack", "price_inr": 420, "mrp_inr": 560, "sku": "CMB-FEST-STD"},
            {"weight_label": "Large Pack", "price_inr": 850, "mrp_inr": 1145, "sku": "CMB-FEST-LRG"},
        ],
    },
]

PINCODE_ZONES = [
    ("400001", "South Mumbai"),
    ("400002", "CST Area"),
    ("400003", "Mandvi"),
    ("400004", "Girgaon"),
    ("400005", "Colaba"),
    ("400006", "Malabar Hill"),
    ("400007", "Grant Road"),
    ("400008", "Mumbai Central"),
    ("400009", "Mazgaon"),
    ("400010", "Wadi Bunder"),
    ("400011", "Parel"),
    ("400012", "Dadar"),
    ("400013", "Naigaon"),
    ("400014", "Mahim"),
    ("400015", "Sewri"),
]


# ─────────────────────────── Seed Functions ───────────────────────────


def seed_categories(db: Session) -> dict[str, int]:
    """Seed categories and return a slug -> id mapping."""
    slug_to_id: dict[str, int] = {}
    for cat_data in CATEGORIES:
        existing = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
        if existing:
            slug_to_id[existing.slug] = existing.id
            continue
        cat = Category(**cat_data)
        db.add(cat)
        db.flush()
        slug_to_id[cat.slug] = cat.id
    return slug_to_id


def seed_products(db: Session, category_slug_to_id: dict[str, int]) -> None:
    """Seed products with their variants."""
    for prod_data in PRODUCTS:
        existing = db.query(Product).filter(Product.slug == prod_data["slug"]).first()
        if existing:
            continue

        category_id = category_slug_to_id[prod_data["category_slug"]]
        product = Product(
            name=prod_data["name"],
            slug=prod_data["slug"],
            category_id=category_id,
            description=prod_data["description"],
            image_url=prod_data["image_url"],
            is_featured=prod_data["is_featured"],
            is_active=True,
        )
        db.add(product)
        db.flush()

        for v in prod_data["variants"]:
            variant = ProductVariant(
                product_id=product.id,
                weight_label=v["weight_label"],
                price_inr=v["price_inr"],
                mrp_inr=v["mrp_inr"],
                stock_qty=100,
                sku=v["sku"],
            )
            db.add(variant)


def seed_pincodes(db: Session) -> None:
    """Seed pincode zones."""
    for pincode, zone_name in PINCODE_ZONES:
        existing = (
            db.query(PincodeZone).filter(PincodeZone.pincode == pincode).first()
        )
        if existing:
            continue
        pz = PincodeZone(pincode=pincode, zone_name=zone_name, is_active=True)
        db.add(pz)


def seed_admin(db: Session) -> None:
    """Seed the default admin user."""
    email = "admin@spiceshop.in"
    existing = db.query(AdminUser).filter(AdminUser.email == email).first()
    if existing:
        return
    hashed = pwd_context.hash("Admin@1234")
    admin = AdminUser(email=email, hashed_password=hashed)
    db.add(admin)


def run_seed() -> None:
    """Main entry point – creates tables then seeds all data idempotently."""
    # Create all tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        category_map = seed_categories(db)
        seed_products(db, category_map)
        seed_pincodes(db)
        seed_admin(db)
        db.commit()
        print("✅ Seed completed successfully.")
    except Exception as exc:
        db.rollback()
        print(f"❌ Seed failed: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
