const mongoose = require('mongoose');
const Notice = require('../models/Notice');
const User = require('../models/User');
require('dotenv').config();

const sampleNotices = [
  {
    title: "बाढी अवस्थाको सम्बन्धमा: मिति २०८१/०३/०६ गते २२:०० बजे अत्यावश्यक गरिएको",
    content: "बाढी अवस्थाको कारण सबै नागरिकहरूलाई सुरक्षित स्थानमा बस्न आग्रह गरिएको छ। स्थानीय प्रशासनले आपतकालीन सेवाहरू सक्रिय गरेको छ।",
    category: "bipad notice",
    province: "Bagmati Province",
    status: "published",
    priority: "urgent"
  },
  {
    title: "जनपद प्रहरी समूहतर्फ प्रहरी हवलदार पदवाट प्रहरी वरिष्ठ हवलदार पदमा बढुवा नियुक्ति तथा पदस्थापन गरिएको (मिति २०८१०३१०२...)",
    content: "प्रहरी मुख्यालयको निर्णय अनुसार निम्नलिखित प्रहरी कर्मचारीहरूको बढुवा भएको छ। यो निर्णय तत्काल प्रभावकारी हुनेछ।",
    category: "promotion",
    province: "All Provinces",
    status: "published",
    priority: "medium"
  },
  {
    title: "प्रहरी सहायक निरीक्षक (जनपद) पदको विशेष स्वास्थ्य परीक्षण तालिका सम्बन्धी सूचना (२०८२-०३-०१)",
    content: "प्रहरी सहायक निरीक्षक पदका लागि आवेदन दिएका उम्मेदवारहरूको स्वास्थ्य परीक्षण तालिका सार्वजनिक गरिएको छ।",
    category: "exam schedule",
    province: "All Provinces",
    status: "published",
    priority: "high"
  },
  {
    title: "प्रहरी जवान (प्राविधिक) पदको प्रारम्भिक स्वास्थ्य परीक्षण तथा शारीरिक तन्दुरुस्ती परीक्षा सम्बन्धी सूचना (२०८२-०३-२५)",
    content: "प्रहरी जवान प्राविधिक पदका लागि छनोट भएका उम्मेदवारहरूको स्वास्थ्य परीक्षण र शारीरिक तन्दुरुस्ती परीक्षा सम्बन्धी जानकारी।",
    category: "exam schedule",
    province: "All Provinces",
    status: "published",
    priority: "medium"
  },
  {
    title: "Notice for Enlistment (2082-02-22)",
    content: "This notice is regarding the enlistment process for new police personnel. All eligible candidates are requested to submit their applications within the specified deadline.",
    category: "general notice",
    province: "All Provinces",
    status: "published",
    priority: "medium"
  },
  {
    title: "जनपद प्रहरी समूहतर्फ प्रहरी नायब महानिरीक्षक पदमा बढुवा नियुक्ति तथा पदस्थापन गरिएको (मिति २०८२०२१६ गते)",
    content: "प्रहरी प्रशासनको निर्णय अनुसार वरिष्ठ प्रहरी अधिकारीहरूको बढुवा र सरुवा सम्बन्धी आदेश जारी गरिएको छ।",
    category: "transfer notices",
    province: "All Provinces",
    status: "published",
    priority: "medium"
  },
  {
    title: "सार्वजनिक खरिद नियमावली २०८१",
    content: "सार्वजनिक खरिद ऐन २०६३ को दफा ६७ ले दिएको अधिकार प्रयोग गरी सार्वजनिक खरिद नियमावली २०८१ जारी गरिएको छ।",
    category: "public procurement",
    province: "All Provinces",
    status: "published",
    priority: "high"
  },
  {
    title: "प्रहरी नियमावली संशोधन आदेश २०८१",
    content: "प्रहरी ऐन २०७२ को दफा ८६ ले दिएको अधिकार प्रयोग गरी प्रहरी नियमावली २०७३ मा केही संशोधन गरिएको छ।",
    category: "rules",
    province: "All Provinces",
    status: "published",
    priority: "medium"
  },
  {
    title: "संयुक्त राष्ट्र शान्ति सेनामा खटिने प्रहरी कर्मचारी छनोट सम्बन्धी सूचना",
    content: "संयुक्त राष्ट्र शान्ति सेनामा खटिने प्रहरी कर्मचारी छनोटका लागि आवेदन आह्वान गरिएको छ। योग्यता पुगेका इच्छुक प्रहरी कर्मचारीहरूले आवेदन दिन सक्नेछन्।",
    category: "un notices",
    province: "All Provinces",
    status: "published",
    priority: "medium"
  },
  {
    title: "करियर विकास कार्यक्रम सम्बन्धी सूचना",
    content: "प्रहरी कर्मचारीहरूको करियर विकासका लागि विशेष तालिम कार्यक्रम सञ्चालन गरिने भएको छ। इच्छुक कर्मचारीहरूले दर्ता गराउन सक्नेछन्।",
    category: "other notice (career)",
    province: "All Provinces",
    status: "published",
    priority: "low"
  }
];

async function createSampleNotices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/police_db');
    console.log('Connected to MongoDB');

    // Find an admin user to assign as creator
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('No admin user found. Creating one...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      adminUser = new User({
        name: 'Admin User',
        email: 'admin@police.gov.np',
        password: hashedPassword,
        role: 'admin'
      });
      
      await adminUser.save();
      console.log('Admin user created');
    }

    // Clear existing notices
    await Notice.deleteMany({});
    console.log('Cleared existing notices');

    // Create sample notices
    const noticesWithCreator = sampleNotices.map(notice => ({
      ...notice,
      createdBy: adminUser._id
    }));

    await Notice.insertMany(noticesWithCreator);
    console.log(`Created ${sampleNotices.length} sample notices`);

    console.log('Sample notices created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating sample notices:', error);
    process.exit(1);
  }
}

createSampleNotices();
