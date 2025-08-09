import { useState, useEffect } from 'react';
import LeadershipCard from './LeadershipCard';

interface Leader {
  _id: string;
  name: string;
  title: string;
  position: string;
  image: string;
  bio: string;
}

export default function LeadershipTeam() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const response = await fetch('/api/leadership');
        if (!response.ok) {
          throw new Error('Failed to fetch leadership data');
        }
        const data = await response.json();
        setLeaders(data);
      } catch (err) {
        console.error('Error fetching leadership data:', err);
        setError('Failed to load leadership team data. Please try again later.');
        // Fallback to hardcoded data if API fails
        setLeaders([
          {
            _id: '1',
            name: 'Mr. Arvind Soni',
            title: 'Founder & Visionary',
            position: 'founder',
            image: '/ARVIND SONI.jpeg.jpg',
            bio: "Founder's Vision: Mr. Arvind Soni\nAVITO Perfume is the brainchild of Mr. Arvind Soni, a trailblazer in the fragrance industry with over 18 years of expertise and a legacy of perfume craftsmanship dating back to 1983. His passion for creating world-class fragrances has established AVITO as a beacon of elegance and innovation in the world of perfumery.\n\nExcellence in Fragrance Craftsmanship\nMr. Soni's mastery lies in crafting unique, long-lasting perfumes inspired by the sophistication of French scent artistry. Specializing in high-concentration perfume oils, he creates international-standard fragrances that blend elegant freshness with enduring essence, ensuring every scent leaves a lasting impression.\n\nComprehensive Business Expertise\nWith deep knowledge in retail, finance, and supply chain management, Mr. Soni ensures AVITO Perfume delivers exceptional quality at every stage. His holistic approach guarantees a seamless journey from sourcing premium ingredients to delivering luxurious fragrances to customers across India.\n\nCrafted for India, Inspired Globally\nAVITO Perfume is proud to serve India-wide, with scents thoughtfully designed to suit the country's diverse weather conditions and evolving trends. Our collections cater to all—men, women, and unisex preferences—offering affordable luxury without compromising on quality. Each fragrance is crafted to resonate with Indian sensibilities while maintaining a global standard of elegance.\n\nOur Commitment\nUnder Mr. Soni's visionary leadership, AVITO Perfume is dedicated to creating timeless, inclusive fragrances that celebrate individuality. Whether it's a bold masculine note, a delicate feminine essence, or a versatile unisex scent, our perfumes are designed to be accessible, enduring, and trendsetting for every Indian on affordable price with high quality ingredients.\n\nOur Legacy\nSince 1983, AVITO Perfume has carried forward a legacy of craftsmanship and innovation. With a commitment to affordability, diversity, and quality, we invite you to experience AVITO Perfume—where global artistry meets the heart of India in every bottle."
          },
          {
            _id: '2',
            name: 'Mr. Naresh Dadhich',
            title: 'Managing Director & CEO',
            position: 'ceo',
            image: '/NARESH DADHICH.jpeg.jpg',
            bio: "Leadership Vision: Mr. Naresh Dadhich, Managing Director & CEO\nAt the helm of AVITO Perfume is Mr. Naresh Dadhich, a dynamic leader with over 12 years of experience in the fragrance industry. As Managing Director and CEO, he drives the brand's mission to deliver world-class perfumes tailored to the Indian market, aligning with the Make in India vision championed by our Honorable Prime Minister Mr. Narendra Modi.\n\nExpertise in Fragrance and Indian Market\nMr. Dadhich possesses an in-depth understanding of the Indian market, distribution networks, and customer preferences. His expertise ensures AVITO Perfume offers premium fragrances with international-level concentrations of perfume oils, providing an unmatched sensory experience at affordable prices.\n\nDiverse Industry Experience\nWith a robust background in the hotel industry, retail, and supply chain management, Mr. Dadhich brings a holistic approach to business. His knowledge enables AVITO Perfume to implement best-in-class practices, ensuring seamless delivery of high-quality fragrances to customers across India.\n\nCommitment to the Indian Consumer\nMr. Dadhich is dedicated to capturing the unserved segments of the Indian market like: Tier 2 & Tier 3 cities by offering world-class perfumes designed for Indian tastes and climates. His vision is to make luxury fragrances accessible to all, combining affordability with global standards of elegance and sophistication.\n\nDriving the Make in India Vision\nInspired by the Make in India initiative, Mr. Dadhich aims to elevate Indian perfumery to international standards. By focusing on high-quality fragrance oils and innovative production, AVITO Perfume contributes to India's growth as a global hub for premium fragrances.\n\nOur Promise\nUnder Mr. Dadhich's leadership, AVITO Perfume is committed to crafting exceptional fragrances that resonate with Indian consumers while delivering a world-class experience. We strive to redefine luxury by making it inclusive, affordable, and proudly Indian."
          },

          {
            _id: '4',
            name: 'Mr. Chinesh Soni',
            title: 'Operation & IT Management',
            position: 'operations',
            image: '/CHINESH.jpeg.jpg',
            bio: "Operations & IT Leadership: Mr. Chinesh Soni\n\nMr. Chinesh Soni serves as the backbone of AVITO Perfume's operational and technological infrastructure. With his extensive expertise in IT systems and operations management, he ensures that all aspects of the business run smoothly and efficiently.\n\nTechnological Innovation\nMr. Chinesh brings a forward-thinking approach to AVITO Perfume, implementing cutting-edge technologies that enhance customer experience and streamline internal processes. His knowledge of e-commerce platforms and digital infrastructure has been instrumental in establishing the company's strong online presence.\n\nOperational Excellence\nWith meticulous attention to detail and a commitment to operational efficiency, Mr. Chinesh oversees the day-to-day functioning of AVITO Perfume. From inventory management to logistics coordination, he ensures that customers receive their premium fragrances promptly and in perfect condition.\n\nSupply Chain Optimization\nMr. Chinesh has developed robust supply chain solutions that maintain the highest quality standards while optimizing costs. His strategic approach to procurement and distribution has enabled AVITO Perfume to offer luxury fragrances at competitive prices.\n\nCustomer-Focused Systems\nUnderstanding that exceptional customer service is crucial in the luxury market, Mr. Chinesh has implemented systems that prioritize customer satisfaction at every touchpoint. His IT solutions enable personalized shopping experiences and efficient customer support.\n\nVision for Growth\nAs AVITO Perfume continues to expand, Mr. Chinesh's expertise in scalable operations and IT infrastructure provides a solid foundation for sustainable growth. His innovative strategies ensure that the company can meet increasing demand while maintaining its commitment to quality and excellence."
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaders();
  }, []);

  if (loading) {
    return (
      <div className="mt-20 mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Our Leadership Team</h2>
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  if (error && leaders.length === 0) {
    return (
      <div className="mt-20 mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Our Leadership Team</h2>
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="mt-20 mb-16">
  <h2 className="text-2xl font-bold mb-8 text-center">Our Leadership Team</h2>
  
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
    {leaders.map((leader) => (
      <LeadershipCard
        key={leader._id}
        name={leader.name}
        title={leader.title}
        image={leader.image}
        bio={leader.bio}
      />
    ))}
  </div>
</div>

  );
}