const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
async function connectToDatabase() {
  try {
    // Use the MongoDB URI directly since .env file might not be available
    const MONGODB_URI = 'mongodb+srv://avitoluxury:l2AuSv97J5FW4ZvU@freetester.667mr8b.mongodb.net/ecommerce';
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Define the Leadership schema
const LeadershipSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    bio: { type: String, required: true },
  },
  { timestamps: true }
);

// Create or use existing model
const Leadership = mongoose.models.Leadership || mongoose.model('Leadership', LeadershipSchema);

// Leadership data
const leadershipData = [
  {
    name: 'Mr. Arvind Soni',
    title: 'Founder & Visionary',
    position: 'founder',
    image: '/ARVIND SONI.jpeg.jpg',
    bio: "Founder's Vision: Mr. Arvind Soni\nAVITO Perfume is the brainchild of Mr. Arvind Soni, a trailblazer in the fragrance industry with over 18 years of expertise and a legacy of perfume craftsmanship dating back to 1983. His passion for creating world-class fragrances has established AVITO as a beacon of elegance and innovation in the world of perfumery.\n\nExcellence in Fragrance Craftsmanship\nMr. Soni's mastery lies in crafting unique, long-lasting perfumes inspired by the sophistication of French scent artistry. Specializing in high-concentration perfume oils, he creates international-standard fragrances that blend elegant freshness with enduring essence, ensuring every scent leaves a lasting impression.\n\nComprehensive Business Expertise\nWith deep knowledge in retail, finance, and supply chain management, Mr. Soni ensures AVITO Perfume delivers exceptional quality at every stage. His holistic approach guarantees a seamless journey from sourcing premium ingredients to delivering luxurious fragrances to customers across India.\n\nCrafted for India, Inspired Globally\nAVITO Perfume is proud to serve India-wide, with scents thoughtfully designed to suit the country's diverse weather conditions and evolving trends. Our collections cater to all—men, women, and unisex preferences—offering affordable luxury without compromising on quality. Each fragrance is crafted to resonate with Indian sensibilities while maintaining a global standard of elegance.\n\nOur Commitment\nUnder Mr. Soni's visionary leadership, AVITO Perfume is dedicated to creating timeless, inclusive fragrances that celebrate individuality. Whether it's a bold masculine note, a delicate feminine essence, or a versatile unisex scent, our perfumes are designed to be accessible, enduring, and trendsetting for every Indian on affordable price with high quality ingredients.\n\nOur Legacy\nSince 1983, AVITO Perfume has carried forward a legacy of craftsmanship and innovation. With a commitment to affordability, diversity, and quality, we invite you to experience AVITO Perfume—where global artistry meets the heart of India in every bottle."
  },
  {
    name: 'Mr. Naresh Dadhich',
    title: 'Managing Director & CEO',
    position: 'ceo',
    image: '/NARESH DADHICH.jpeg.jpg',
    bio: "Leadership Vision: Mr. Naresh Dadhich, Managing Director & CEO\nAt the helm of AVITO Perfume is Mr. Naresh Dadhich, a dynamic leader with over 12 years of experience in the fragrance industry. As Managing Director and CEO, he drives the brand's mission to deliver world-class perfumes tailored to the Indian market, aligning with the Make in India vision championed by our Honorable Prime Minister Mr. Narendra Modi.\n\nExpertise in Fragrance and Indian Market\nMr. Dadhich possesses an in-depth understanding of the Indian market, distribution networks, and customer preferences. His expertise ensures AVITO Perfume offers premium fragrances with international-level concentrations of perfume oils, providing an unmatched sensory experience at affordable prices.\n\nDiverse Industry Experience\nWith a robust background in the hotel industry, retail, and supply chain management, Mr. Dadhich brings a holistic approach to business. His knowledge enables AVITO Perfume to implement best-in-class practices, ensuring seamless delivery of high-quality fragrances to customers across India.\n\nCommitment to the Indian Consumer\nMr. Dadhich is dedicated to capturing the unserved segments of the Indian market like: Tier 2 & Tier 3 cities by offering world-class perfumes designed for Indian tastes and climates. His vision is to make luxury fragrances accessible to all, combining affordability with global standards of elegance and sophistication.\n\nDriving the Make in India Vision\nInspired by the Make in India initiative, Mr. Dadhich aims to elevate Indian perfumery to international standards. By focusing on high-quality fragrance oils and innovative production, AVITO Perfume contributes to India's growth as a global hub for premium fragrances.\n\nOur Promise\nUnder Mr. Dadhich's leadership, AVITO Perfume is committed to crafting exceptional fragrances that resonate with Indian consumers while delivering a world-class experience. We strive to redefine luxury by making it inclusive, affordable, and proudly Indian."
  },
  {
    name: 'Ms. Gayatri Soni',
    title: 'Marketing Head',
    position: 'marketing',
    image: '/GAYATRI SONI.jpeg.jpg',
    bio: "Marketing Leadership: Ms. Gayatri Soni, Marketing Head\n\nLeading the marketing endeavors of AVITO Perfume is Ms. Gayatri Soni, a seasoned professional with over 10 years of rich experience in marketing, product strategy, and policy formulation. As Marketing Head, she is instrumental in shaping AVITO's brand identity and delivering exceptional customer experiences.\n\nExpertise in Marketing and Digital Innovation\nMs. Gayatri brings a wealth of knowledge in marketing, digital tools, and brand management, backed by an impressive academic record. Her expertise in leveraging digital marketing platforms and analyzing market trends ensures AVITO Perfume remains at the forefront of customer engagement and innovation.\n\nDiverse Professional Background\nWith a proven track record of serving educational institutions and online marketing platforms for various corporate houses, Ms. Gayatri has honed her skills in creating impactful marketing strategies. Her versatile experience enables her to craft customer-centric campaigns that resonate with diverse audiences.\n\nCommitment to Brand Excellence\nAs Marketing Head, Ms. Gayatri is dedicated to establishing AVITO Perfume as a trusted and aspirational brand in the Indian market. She oversees market trend analysis, brand image development, customer support, and grievance redressal, ensuring every customer enjoys a seamless and delightful fragrance experience.\n\nCustomer-Centric Vision\nMs. Gayatri's focus is on delivering the best product experience to AVITO's customers. By blending creativity with data-driven strategies, she ensures that AVITO Perfume's offerings align with evolving customer preferences, making luxury fragrances accessible and memorable for all.\n\nOur Promise\nUnder Ms. Gayatri Soni's leadership, AVITO Perfume is committed to building a brand that stands for quality, trust, and innovation. We strive to create meaningful connections with our customers, offering world-class fragrances backed by exceptional service and a customer-first approach."
  },
  {
    name: 'Mr. Chinesh Soni',
    title: 'Operation & IT Management',
    position: 'operations',
    image: '/CHINESH.jpeg.jpg',
    bio: "Operations & IT Leadership: Mr. Chinesh Soni\n\nMr. Chinesh Soni serves as the backbone of AVITO Perfume's operational and technological infrastructure. With his extensive expertise in IT systems and operations management, he ensures that all aspects of the business run smoothly and efficiently.\n\nTechnological Innovation\nMr. Chinesh brings a forward-thinking approach to AVITO Perfume, implementing cutting-edge technologies that enhance customer experience and streamline internal processes. His knowledge of e-commerce platforms and digital infrastructure has been instrumental in establishing the company's strong online presence.\n\nOperational Excellence\nWith meticulous attention to detail and a commitment to operational efficiency, Mr. Chinesh oversees the day-to-day functioning of AVITO Perfume. From inventory management to logistics coordination, he ensures that customers receive their premium fragrances promptly and in perfect condition.\n\nSupply Chain Optimization\nMr. Chinesh has developed robust supply chain solutions that maintain the highest quality standards while optimizing costs. His strategic approach to procurement and distribution has enabled AVITO Perfume to offer luxury fragrances at competitive prices.\n\nCustomer-Focused Systems\nUnderstanding that exceptional customer service is crucial in the luxury market, Mr. Chinesh has implemented systems that prioritize customer satisfaction at every touchpoint. His IT solutions enable personalized shopping experiences and efficient customer support.\n\nVision for Growth\nAs AVITO Perfume continues to expand, Mr. Chinesh's expertise in scalable operations and IT infrastructure provides a solid foundation for sustainable growth. His innovative strategies ensure that the company can meet increasing demand while maintaining its commitment to quality and excellence."
  }
];

// Populate the database
async function populateDatabase() {
  try {
    await connectToDatabase();
    
    // Clear existing data
    await Leadership.deleteMany({});
    console.log('Cleared existing leadership data');
    
    // Insert new data
    const result = await Leadership.insertMany(leadershipData);
    console.log(`Successfully inserted ${result.length} leadership records`);
    
    console.log('Database population completed successfully');
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the population script
populateDatabase(); 