// Vercel Serverless Function: /api/products
// This serves as the live backend API for the products.

const MOCK_PRODUCTS = [
  {id:1,name:"A2 Cow Ghee (Bilona)",category:"dairy",price:650,mrp:750,weight:"500ml",stock:12,desc:"100% pure A2 Gir cow ghee made using traditional bilona method.",image:"https://images.unsplash.com/photo-1628102479435-93863412338b?w=640&h=480&fit=crop",badge:"bestseller",rating:4.9,reviews:128},
  {id:2,name:"Fresh Malai Paneer",category:"dairy",price:90,mrp:110,weight:"200g",stock:45,desc:"Soft, creamy, melt-in-mouth paneer made fresh every morning.",image:"https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=640&h=480&fit=crop",badge:"new",rating:4.8,reviews:86},
  {id:3,name:"Kashmiri Red Chilli",category:"spices",price:120,mrp:150,weight:"250g",stock:100,desc:"Authentic Kashmiri chilli powder for vibrant red colour without extreme heat.",image:"https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=640&h=480&fit=crop",badge:null,rating:4.7,reviews:214},
  {id:4,name:"Turmeric (Haldi) Powder",category:"spices",price:80,mrp:95,weight:"250g",stock:150,desc:"High curcumin turmeric sourced directly from Salem farms.",image:"https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=640&h=480&fit=crop",badge:"organic",rating:4.9,reviews:342},
  {id:32,name:"Milk Cake (Kalakand)",category:"cake",price:149,mrp:180,weight:"200g",stock:15,desc:"Soft and moist Kalakand made from pure cow milk.",image:"https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=640&h=480&fit=crop",badge:"new",rating:4.7,reviews:67},
  {id:5,name:"Coriander (Dhania) Powder",category:"spices",price:65,mrp:85,weight:"250g",stock:80,desc:"Freshly ground coriander seeds with rich aroma.",image:"https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=640&h=480&fit=crop",badge:null,rating:4.6,reviews:112},
  {id:6,name:"Garam Masala Special",category:"spices",price:180,mrp:220,weight:"100g",stock:50,desc:"Blend of 15 premium roasted spices for authentic Indian curries.",image:"https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=640&h=480&fit=crop",badge:"bestseller",rating:4.9,reviews:543},
  {id:7,name:"Fresh Curd (Dahi)",category:"dairy",price:45,mrp:55,weight:"400g",stock:0,desc:"Thick, creamy set curd made from full cream cow milk.",image:"https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=640&h=480&fit=crop",badge:"sold out",rating:4.8,reviews:92},
  {id:8,name:"Chocolate Truffle Cake",category:"cake",price:550,mrp:650,weight:"500g",stock:5,desc:"Rich chocolate sponge layered with dark chocolate ganache.",image:"https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=640&h=480&fit=crop",badge:"premium",rating:4.9,reviews:44},
  {id:9,name:"Premium Black Pepper",category:"spices",price:220,mrp:280,weight:"100g",stock:30,desc:"Whole black peppercorns from Kerala.",image:"https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=640&h=480&fit=crop",badge:null,rating:4.8,reviews:156},
  {id:10,name:"Motichoor Ladoo",category:"cake",price:250,mrp:300,weight:"500g",stock:20,desc:"Classic Indian sweet made with pure desi ghee.",image:"https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=640&h=480&fit=crop",badge:"bestseller",rating:4.8,reviews:220}
];

export default function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET /api/products
  if (req.method === 'GET') {
    return res.status(200).json(MOCK_PRODUCTS);
  }

  // POST /api/products (Admin only)
  if (req.method === 'POST') {
    const newProduct = req.body;
    newProduct.id = Math.floor(Math.random() * 10000);
    // In a real DB like Supabase/Vercel Postgres, we would INSERT here.
    return res.status(201).json({ success: true, product: newProduct });
  }

  res.status(405).json({ error: "Method not allowed" });
}
