exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    const { password, products, imageUpdates } = body;

    // Secure simple password
    if (password !== 'owner123') {
      return { statusCode: 401, body: JSON.stringify({ message: "Invalid Admin Password" }) };
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return { statusCode: 500, body: JSON.stringify({ message: "Server misconfiguration: GITHUB_TOKEN not set" }) };
    }

    const REPO = "Drishtipixiee/spice-shop";

    // 1. Upload new images to GitHub if any
    if (imageUpdates && imageUpdates.length > 0) {
      for (let img of imageUpdates) {
        // img.filename, img.base64
        const imgPath = `site/images/${img.filename}`;
        
        // Check if file exists to get SHA (for overwrite)
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

    // 2. Update products.js
    const productsPath = "site/products.js";
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
    
    // Base64 encode the string content
    const base64Content = Buffer.from(newContent, 'utf-8').toString('base64');

    const putBody = {
      message: "Admin Dashboard: Update products",
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
      return { statusCode: 500, body: JSON.stringify({ message: "Failed to update GitHub: " + errText }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Successfully saved to GitHub!" })
    };

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error", error: error.message })
    };
  }
};
