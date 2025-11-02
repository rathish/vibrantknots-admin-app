const API_BASE = 'http://localhost:8000/api/v1';

// Premium Cotton Collection product ID (replace with actual ID)
const PRODUCT_ID = '179fa27d-884b-415d-92fa-3ffabc45948e';

async function addDummyData() {
  try {
    // 1. Create Partners
    const partners = [
      { name: 'Textile Partners Ltd', email: 'contact@textilepartners.com', phone: '+91-9876543210', address: 'Mumbai, Maharashtra' },
      { name: 'Cotton Suppliers Co', email: 'info@cottonsuppliers.com', phone: '+91-9876543211', address: 'Delhi, India' },
      { name: 'Fabric Distributors', email: 'sales@fabricdist.com', phone: '+91-9876543212', address: 'Bangalore, Karnataka' }
    ];

    const createdPartners = [];
    for (const partner of partners) {
      const response = await fetch(`${API_BASE}/partners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partner)
      });
      if (response.ok) {
        const partnerData = await response.json();
        createdPartners.push(partnerData);
        console.log('Created partner:', partnerData.name);
      }
    }

    // 2. Create Variants
    const variants = [
      { variant_name: 'Red Cotton', color_code: '#DC143C', color_name: 'Crimson Red', sku_suffix: 'RED' },
      { variant_name: 'Blue Cotton', color_code: '#000080', color_name: 'Navy Blue', sku_suffix: 'BLUE' },
      { variant_name: 'Green Cotton', color_code: '#228B22', color_name: 'Forest Green', sku_suffix: 'GREEN' }
    ];

    const createdVariants = [];
    for (const variant of variants) {
      const response = await fetch(`${API_BASE}/products/${PRODUCT_ID}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variant)
      });
      if (response.ok) {
        const variantData = await response.json();
        createdVariants.push(variantData);
        console.log('Created variant:', variantData.variant_name);
      }
    }

    // 3. Create Stock Records for each variant
    for (let i = 0; i < createdVariants.length; i++) {
      const variant = createdVariants[i];
      
      // Add 2-3 stock records per variant with different partners
      for (let j = 0; j < Math.min(createdPartners.length, 2); j++) {
        const partner = createdPartners[j];
        const stockRecord = {
          partner_id: partner.id,
          available_quantity: Math.floor(Math.random() * 200) + 50, // 50-250
          retail_price: (Math.random() * 20 + 15).toFixed(2), // 15-35
          wholesale_price: (Math.random() * 15 + 10).toFixed(2), // 10-25
          currency: 'INR'
        };

        const response = await fetch(`${API_BASE}/products/${PRODUCT_ID}/variants/${variant.id}/stock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stockRecord)
        });
        
        if (response.ok) {
          const stockData = await response.json();
          console.log(`Created stock record for ${variant.variant_name} with partner ${partner.name}`);
        }
      }
    }

    // 4. Create Product Prices
    const prices = [
      { currency: 'INR', base_price: 25.99, sale_price: 22.99, effective_from: new Date().toISOString() },
      { currency: 'USD', base_price: 0.31, sale_price: 0.28, effective_from: new Date().toISOString() }
    ];

    for (const price of prices) {
      const response = await fetch(`${API_BASE}/products/${PRODUCT_ID}/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(price)
      });
      
      if (response.ok) {
        console.log(`Created price record in ${price.currency}`);
      }
    }

    console.log('✅ All dummy data created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating dummy data:', error);
  }
}

// Run the script
addDummyData();
