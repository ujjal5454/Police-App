const mongoose = require('mongoose');
const News = require('../models/News');
const User = require('../models/User');
require('dotenv').config();

const sampleNews = [
  {
    title: 'अवैध लागुऔषध सहित तीन जना पक्राउ',
    content: 'काठमाडौं महानगरपालिका वडा नं. ५ बाट अवैध लागुऔषध सहित तीन जनालाई प्रहरीले पक्राउ गरेको छ। पक्राउ पर्नेहरूमा २५ वर्षीय राम बहादुर तामाङ, २८ वर्षीय सीता गुरुङ र ३२ वर्षीय अनिल श्रेष्ठ रहेका छन्। उनीहरूको साथबाट ५० ग्राम हेरोइन र २०० ग्राम गाँजा बरामद गरिएको प्रहरीले जनाएको छ।',
    category: 'drug',
    province: 'Bagmati Province'
  },
  {
    title: 'सोलु नखुवा रक्षा महिला सहित दुई जना पक्राउ',
    content: 'सोलुखुम्बु जिल्लाको नेचासल्यान गाउँपालिकामा रक्षा महिला सहित दुई जनालाई प्रहरीले पक्राउ गरेको छ। पक्राउ पर्नेहरूमा ३५ वर्षीया सुनिता राई र ४२ वर्षीय पासाङ शेर्पा रहेका छन्। उनीहरूलाई भ्रष्टाचारको आरोपमा पक्राउ गरिएको हो।',
    category: 'bribery',
    province: 'Province 1'
  },
  {
    title: 'डल्लर देखाई ठगी गर्ने गिरोह पक्राउ',
    content: 'काठमाडौंमा डल्लर देखाई ठगी गर्ने गिरोहका चार जनालाई प्रहरीले पक्राउ गरेको छ। पक्राउ पर्नेहरूमा ३० वर्षीय रमेश गुरुङ, २८ वर्षीय सुरेश तामाङ, ३५ वर्षीय दिनेश राई र २६ वर्षीया सुनिता लामा रहेका छन्। उनीहरूले नक्कली डल्लर देखाएर विभिन्न व्यक्तिहरूसँग करोडौं रुपैयाँ ठगी गरेको आरोप छ।',
    category: 'crime report',
    province: 'Bagmati Province'
  },
  {
    title: 'कोशी प्रदेशमा बाढी पहिरोको जोखिम',
    content: 'कोशी प्रदेशका विभिन्न जिल्लाहरूमा निरन्तरको वर्षाका कारण बाढी र पहिरोको उच्च जोखिम रहेको छ। प्रहरीले स्थानीयवासीहरूलाई सतर्क रहन आग्रह गरेको छ। विशेष गरी सुनसरी, मोरङ र झापा जिल्लामा बाढीको जोखिम बढेको छ।',
    category: 'flood landslide',
    province: 'Province 1'
  },
  {
    title: 'साइबर अपराधमा वृद्धि, सचेत रहन आग्रह',
    content: 'हालैका दिनहरूमा साइबर अपराधका घटनाहरूमा उल्लेख्य वृद्धि भएको छ। विशेष गरी अनलाइन ठगी, फेसबुक ह्याकिङ र डिजिटल पेमेन्ट फ्रडका घटनाहरू बढेका छन्। प्रहरीले नागरिकहरूलाई सामाजिक सञ्जालमा व्यक्तिगत जानकारी साझा नगर्न र अज्ञात लिङ्कहरूमा क्लिक नगर्न आग्रह गरेको छ।',
    category: 'cyber crime',
    province: 'All Provinces'
  },
  {
    title: 'गृह मन्त्रालयको नयाँ कार्यक्रम सुरु',
    content: 'गृह मन्त्रालयले सुरक्षा व्यवस्था सुधारका लागि नयाँ कार्यक्रम सुरु गरेको छ। यस कार्यक्रम अन्तर्गत प्रहरी चौकीहरूमा आधुनिक प्रविधिको प्रयोग गरिनेछ। साथै नागरिकहरूलाई छिटो र प्रभावकारी सेवा प्रदान गर्ने लक्ष्य राखिएको छ।',
    category: 'home ministry program',
    province: 'All Provinces'
  },
  {
    title: 'चोरी डकैतीका घटनामा कमी',
    content: 'गत महिनाको तुलनामा चोरी डकैतीका घटनाहरूमा ३०% कमी आएको छ। प्रहरीको बढेको गस्ती र सुरक्षा व्यवस्थाका कारण अपराधिक गतिविधिमा कमी आएको प्रहरीले जनाएको छ। तर अझै पनि नागरिकहरूलाई सतर्क रहन आग्रह गरिएको छ।',
    category: 'burglary',
    province: 'All Provinces'
  },
  {
    title: 'प्रहरी दिवसको तयारी सुरु',
    content: 'आगामी प्रहरी दिवसको तयारी सुरु भएको छ। यस वर्षको प्रहरी दिवसमा विशेष कार्यक्रमहरू आयोजना गरिने छ। प्रहरी महानिरीक्षकले सबै प्रहरी कार्यालयहरूलाई उत्सवको तयारी गर्न निर्देशन दिएका छन्।',
    category: 'police day program',
    province: 'All Provinces'
  }
];

const createSampleNews = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/police_db';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('Admin user not found. Please create admin user first.');
      process.exit(1);
    }

    // Check if news already exist
    const existingNews = await News.countDocuments();
    if (existingNews > 0) {
      console.log('Sample news already exist');
      process.exit(0);
    }

    // Create sample news
    const newsPromises = sampleNews.map(newsData => {
      const news = new News({
        ...newsData,
        createdBy: adminUser._id,
        status: 'published',
        priority: 'medium'
      });
      return news.save();
    });

    await Promise.all(newsPromises);
    console.log(`${sampleNews.length} sample news articles created successfully!`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating sample news:', error);
    process.exit(1);
  }
};

createSampleNews();
