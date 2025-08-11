'use client';

import Nav from '../components/Nav';
import Footer from '../components/Footer';

export default function RefundPolicyPage() {
  return (
    <>
      <Nav />
      <main className="bg-gray-50">
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <header className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Refund Policy</h1>
              <p className="mt-2 text-gray-600">AVITO Luxury</p>
            </header>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 md:p-8 space-y-5 leading-7 text-gray-700">
                <p className="text-sm text-gray-500">Dear Customer,</p>
                <p>
                  We are committed to providing you with the best service and experience. Your satisfaction is our utmost
                  priority and for that, we do accept returns in case of an unforeseen situation, such as damaged products
                  during transit or circumstances affecting the product which are beyond the control of the customer.
                </p>
                <p>
                  In the unlikely event of an item arriving in a damaged condition, AVITO Luxury provides free returns.
                  We will either exchange or refund the product if stock is not available to exchange within 10 days of your
                  request to return. The returned items will undergo an inspection, and a refund/exchange will be accepted,
                  provided the returned products are in their original packaging, unopened, unused, and sellable condition.
                </p>

                <div className="bg-gray-50 border border-gray-200 rounded-md p-5">
                  <h2 className="text-lg font-semibold mb-3">Return & Refund Conditions</h2>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>Return request must be raised within 10 days of delivery.</li>
                    <li>Products must be in original packaging, unopened, unused, and sellable condition.</li>
                    <li>All packaging components provided with the order must be intact.</li>
                    <li>Acceptance of return is subject to inspection upon receipt.</li>
                    <li>
                      We reserve the right to reject a return request if the condition of the product received is not up to
                      the standards set by AVITO Luxury.
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-md p-5">
                  <h2 className="text-lg font-semibold mb-3">Refund Timeline</h2>
                  <p>
                    Your refund will be processed in 2–4 days after approval and should be credited within 3–5 working days,
                    depending on the mode of payment.
                  </p>
                </div>


              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
} 