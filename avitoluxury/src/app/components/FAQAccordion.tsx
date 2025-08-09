'use client';

import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQCategoryProps {
  title: string;
  items: FAQItem[];
}

interface FAQAccordionProps {
  categories: FAQCategoryProps[];
}

const FAQCategory = ({ title, items }: FAQCategoryProps) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  
  const toggleItem = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="border border-gray-200 rounded-md overflow-hidden"
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="flex justify-between items-center w-full px-4 py-3 text-left bg-white hover:bg-gray-50 transition-colors"
              aria-expanded={expandedItems[item.id]}
            >
              <span className="font-medium">{item.question}</span>
              {expandedItems[item.id] 
                ? <FiChevronUp className="flex-shrink-0 ml-2" /> 
                : <FiChevronDown className="flex-shrink-0 ml-2" />
              }
            </button>
            
            {expandedItems[item.id] && (
              <div className="px-4 py-3 bg-gray-50 text-gray-600">
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function FAQAccordion({ categories }: FAQAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-t border-gray-200 pt-12 mt-12">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full py-4 px-6 bg-gray-100 hover:bg-gray-200 transition-colors rounded-md mb-8"
        aria-expanded={isOpen}
      >
        <span className="text-xl font-bold">Frequently Asked Questions</span>
        {isOpen 
          ? <FiChevronUp className="flex-shrink-0 ml-2" size={24} /> 
          : <FiChevronDown className="flex-shrink-0 ml-2" size={24} />
        }
      </button>
      
      {isOpen && (
        <div className="animate-fadeIn">
          {categories.map((category, index) => (
            <FAQCategory key={index} title={category.title} items={category.items} />
          ))}
        </div>
      )}
    </div>
  );
} 