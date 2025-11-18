const https = require('https');
const fs = require('fs');
const path = require('path');

// Create directories if they don't exist
const uploadDirs = {
  designs: path.join(__dirname, '..', 'uploads', 'designs'),
  avatars: path.join(__dirname, '..', 'uploads', 'avatars'),
  products: path.join(__dirname, '..', 'uploads', 'products')
};

Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Download a file from URL
const downloadFile = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        file.close();
        fs.unlinkSync(filepath);
        downloadFile(response.headers.location, filepath).then(resolve).catch(reject);
      } else {
        file.close();
        fs.unlinkSync(filepath);
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
};

// Product design images (using Picsum with specific seeds)
const productImages = [
  { name: 'rock-design.jpg', seed: 'rock-design' },
  { name: 'art-design.jpg', seed: 'art-design' },
  { name: 'tech-design.jpg', seed: 'tech-design' },
  { name: 'nature-design.jpg', seed: 'nature-design' },
  { name: 'gaming-design.jpg', seed: 'gaming-design' },
  { name: 'urban-design.jpg', seed: 'urban-design' },
  { name: 'ocean-design.jpg', seed: 'ocean-design' },
  { name: 'geometry-design.jpg', seed: 'geometry-design' }
];

// Designer avatars (using DiceBear API)
const designerAvatars = [
  { name: 'rock-designs-avatar.svg', seed: 'RockDesigns' },
  { name: 'art-studio-avatar.svg', seed: 'ArtStudio' },
  { name: 'techwear-avatar.svg', seed: 'TechWear' },
  { name: 'admin-user-avatar.svg', seed: 'AdminUser' }
];

const downloadImages = async () => {
  console.log('📥 Downloading placeholder images...\n');

  // Download product images
  console.log('Downloading product design images...');
  for (const img of productImages) {
    const url = `https://picsum.photos/seed/${img.seed}/800/800`;
    const filepath = path.join(uploadDirs.designs, img.name);
    try {
      await downloadFile(url, filepath);
      console.log(`  ✅ ${img.name}`);
    } catch (error) {
      console.log(`  ❌ ${img.name}: ${error.message}`);
    }
  }

  // Download designer avatars
  console.log('\nDownloading designer avatars...');
  for (const avatar of designerAvatars) {
    const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatar.seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
    const filepath = path.join(uploadDirs.avatars, avatar.name);
    try {
      await downloadFile(url, filepath);
      console.log(`  ✅ ${avatar.name}`);
    } catch (error) {
      console.log(`  ❌ ${avatar.name}: ${error.message}`);
    }
  }

  console.log('\n✅ Image download complete!');
  console.log('\n📁 Images saved to:');
  console.log(`   - Designs: ${uploadDirs.designs}`);
  console.log(`   - Avatars: ${uploadDirs.avatars}`);
};

downloadImages().catch(console.error);


