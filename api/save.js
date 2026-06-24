export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { password, products, imageUpdates } = req.body;

    if (password !== 'owner123') {
      return res.status(401).json({ message: "Invalid Admin Password" });
    }

    const token = process.env.GITHUB_TOKEN || process.env.token || process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    if (!token) {
      return res.status(500).json({ message: "Server misconfiguration: GITHUB_TOKEN not set" });
    }

    const REPO = "Drishtipixiee/spice-shop";

    if (imageUpdates && imageUpdates.length > 0) {
      for (let img of imageUpdates) {
        const imgPath = `frontend/images/${img.filename}`;
        
        let sha = null;
        const checkRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${imgPath}`, {
          headers: { 'Authorization': `token ${token}` }
        });
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          sha = checkData.sha;
        }

        const putBody = {
          message: `Upload image ${img.filename}`,
          content: img.base64
        };
        if (sha) putBody.sha = sha;

        const uploadRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${imgPath}`, {
          method: 'PUT',
          headers: { 
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify(putBody)
        });

        if (!uploadRes.ok) {
          console.error("Failed to upload image:", await uploadRes.text());
        }
      }
    }

    const productsPath = "frontend/products.js";
    let sha = null;
    const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${productsPath}`, {
      headers: { 'Authorization': `token ${token}` }
    });
    
    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
    }

    const productsJson = JSON.stringify(products, null, 2).replace(/"([^"]+)":/g, '$1:');
    const newContent = `const PRODUCTS = ${productsJson};\n`;
    
    const base64Content = Buffer.from(newContent, 'utf-8').toString('base64');

    const putBody = {
      message: "Admin Dashboard: Update products via Vercel",
      content: base64Content
    };
    if (sha) putBody.sha = sha;

    const putRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${productsPath}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(putBody)
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      return res.status(500).json({ message: "Failed to update GitHub: " + errText });
    }

    return res.status(200).json({ success: true, message: "Successfully saved to GitHub!" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
