'use client';

import { useState } from 'react';
import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import LeadershipTeam from '../components/LeadershipTeam';
import FAQAccordion from '../components/FAQAccordion';
import { FiArrowRight } from 'react-icons/fi';

export default function AboutUsPage() {
  // FAQ data
  const faqCategories = [
    {
      title: "Orders & Shipping",
      items: [
        {
          id: "order-process-time",
          question: "How long does it take to process an order?",
          answer: "Orders are typically processed within 24-48 business hours after confirmation."
        },
        {
          id: "delivery-time",
          question: "How long will delivery take?",
          answer: "Delivery usually takes 3-8 business days depending on your location. You will receive tracking details once your order is shipped."
        },
        {
          id: "free-shipping",
          question: "Do you offer free shipping?",
          answer: "Yes, we offer free shipping on all orders above ₹499. For orders below ₹499, a standard shipping charge applies."
        },
        {
          id: "track-order",
          question: "How can I track my order?",
          answer: "Once your order is shipped, you'll receive a tracking link via email and SMS. You can also track it from the \"My Orders\" section on your account."
        }
      ]
    },
    {
      title: "Returns & Refunds",
      items: [
        {
          id: "return-policy",
          question: "What is your return policy?",
          answer: "We offer a 10-day return window from the date of delivery. Items must be unused and in original packaging. "
        },
        {
          id: "return-process",
          question: "How do I return a product?",
          answer: "Visit the \"My Orders\" section, select the item, and click on \"Return.\" Our team will arrange a pickup if eligible."
        },
        {
          id: "refund-time",
          question: "When will I receive my refund?",
          answer: "Refunds are processed within 5-7 working days after the returned item is received and inspected."
        },
        {
          id: "exchange-product",
          question: "Can I exchange a product?",
          answer: "Yes, you can request an exchange for size or color variants within the 7-day return window."
        }
      ]
    },
    {
      title: "Payments",
      items: [
        {
          id: "payment-methods",
          question: "What payment methods do you accept?",
          answer: "We accept UPI, Credit/Debit Cards, Net Banking, Wallets, and Cash on Delivery (COD)."
        },
        {
          id: "cod-availability",
          question: "Is Cash on Delivery available?",
          answer: "Yes, COD is available on orders up to ₹3,000."
        },
        {
          id: "payment-security",
          question: "Is it safe to use my card on your site?",
          answer: "Absolutely. Our payment gateways are 100% secure and encrypted."
        }
      ]
    },
    {
      title: "Account & Support",
      items: [
        {
          id: "account-required",
          question: "Do I need to create an account to place an order?",
          answer: "No, you can check out as a guest. However, creating an account allows you to track orders and access offers."
        },
        {
          id: "forgot-password",
          question: "I forgot my password. How do I reset it?",
          answer: "Click on \"Forgot Password\" on the login page and follow the instructions to reset it via email."
        },
        {
          id: "contact-support",
          question: "How can I contact customer support?",
          answer: "You can reach us at support@avitostore.com or via WhatsApp at +919928200900. We are available Mon-Sat, 10 AM to 6 PM."
        }
      ]
    },
    {
      title: "Product & Order Issues",
      items: [
        {
          id: "damaged-item",
          question: "I received a damaged or wrong item. What should I do?",
          answer: "We're sorry! Please raise a return request with images within 48 hours of delivery. We'll resolve it promptly."
        },
        {
          id: "delayed-order",
          question: "My order is delayed. What now?",
          answer: "If your order hasn't arrived within the expected time, please contact our support team with your order ID."
        }
      ]
    },
    {
      title: "Discounts & Promotions",
      items: [
        {
          id: "apply-promo",
          question: "How do I apply a promo code?",
          answer: "You can enter the promo code on the checkout page before making the payment."
        },
        {
          id: "promo-not-working",
          question: "Why is my discount code not working?",
          answer: "Make sure it hasn't expired and check if your cart meets the minimum order value."
        }
      ]
    },
    {
      title: "Refund policy",
      items: [
        {
          id: "Refund policy",
          question: "Refund?",
          answer: "We are committed to provide you the best of service and experience. Your satisfaction is our utmost priority and for that, we do accept returns in case of an unforeseen situation such as damaged products during transit or circumstances affecting the product which are beyond the control of the customer.  In an unlikely event of an item arriving in a damaged condition, we provide free returns in which we either exchange or refund the product if stock is not available to exchange within 10 days of your request to return. The returned items will undergo an inspection and a refund/exchange will be accepted, provided the returned products are in their original packaging, unopened, unused and sell-able condition. All the necessary parts of packaging accompanying the order should be intact in order to process a refund. Your refund will be processed in 2–4 days and should be credited in 3–5 working days depending on mode of payment. Acceptance of a return is subject to the condition in which we receive the order. We reserve the right to reject a return request if the condition of the product received is not up to the standards set by us."
        }
      ]
    }
  ];
  
  return (
    <>
      <Nav />
      
      {/* Hero Section */}
      <div className="relative">
        <div className="w-full h-[80vh] bg-gray-100 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-70 z-10"></div>
          <img 
            src="/2.svg" 
            alt="About Us"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="text-center px-4 z-20 relative text-white">
            <h1 className="text-3xl md:text-5xl text-red-100 font-bold mb-4">Our Story</h1>
            {/* <p className="text-lg md:text-xl max-w-lg mx-auto">
              Crafting memorable fragrances since 2015
            </p> */}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {/* Our Story Content */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
              <div>
                <h2 className="text-2xl font-bold mb-4">How It All Began</h2>
                <p className="text-gray-600 mb-4">
                  AVITO Perfume was created to make luxury fragrances accessible to everyone in India. The goal was simple—high-quality, long-lasting scents at a fair price.
                </p>
                <p className="text-gray-600 mb-4">
                Led by founder Mr. Arvind Soni, with years of industry experience, AVITO blends global fragrance trends with Indian tastes and climate.
                </p>
                <p className="text-gray-600">
                Today, AVITO offers a diverse range of perfumes for all genders—crafted with care, inspired by the world, and made for everyday elegance.
                </p>
              </div>
              <div>
                <img 
                  src="/ARVIND SONI.jpeg.jpg" 
                  alt="A V I T O   S C E N T S Founder"
                  className="w-full h-auto rounded-lg shadow-md"
                />
              </div>
            </div>
            
            <div className="text-center">
              <Link 
                href="/collection"
                className="inline-flex items-center px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Discover Our Collections <FiArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Leadership Team Section */}
        <LeadershipTeam />
        
        {/* Careers Section */}
        <div className="max-w-4xl mx-auto border-t border-gray-200 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Join Our Team</h2>
              <p className="text-gray-600 mb-4">
                We're always looking for passionate individuals to join our growing team. If you share our love for fragrances and our commitment to quality and sustainability, we'd love to hear from you.
              </p>
              <p className="text-gray-600 mb-6">
                Explore current opportunities and discover what it's like to be part of the A V I T O   S C E N T S family.
              </p>
              <Link 
                href="/careers"
                className="inline-flex items-center px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800"
              >
                View Open Positions <FiArrowRight className="ml-2" />
              </Link>
            </div>
            <div>
              <img 
                src="/team.jpg" 
                alt="Career Opportunities"
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <FAQAccordion categories={faqCategories} />
        </div>
      </div>
      
      <Footer />
    </>
  );
}