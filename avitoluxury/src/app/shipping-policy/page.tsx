'use client';

import Nav from '../components/Nav';
import Footer from '../components/Footer';

export default function ShippingPolicyPage() {
  return (
    <>
      <Nav />
      <main className="bg-gray-50">
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <header className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Shipping and Delivery Policy</h1>
              <p className="mt-2 text-gray-600">AVITO Luxury</p>
            </header>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 md:p-8 space-y-5 leading-7 text-gray-700">
                <p className="text-sm text-gray-500">Dear Customer,</p>
                <p>
                  Pls find Shipping Policy of AVITO for our website as appended below:
                </p>
                <p>
                  The standard ground mail service is shipped via DRTC/Maruti Courier/BlueDart/Aramex/Ecom/IndiaPost. We try
                  to dispatch all our orders within 24-48 hours in normal business days. Please be advised that shipments are
                  not sent out on Saturdays, Sundays, or any Holidays. We do not guarantee arrival dates or times and it is
                  dependent on the courier partner and location.
                </p>

                <div className="bg-gray-50 border border-gray-200 rounded-md p-5">
                  <h2 className="text-lg font-semibold mb-3">Key Points</h2>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>Dispatch within 24–48 hours on business days.</li>
                    <li>No dispatch on Saturdays, Sundays, or public holidays.</li>
                    <li>Delivery timelines depend on courier partner and destination.</li>
                    <li>Tracking details will be shared as available.</li>
                  </ul>
                </div>

                <p className="text-sm text-gray-500">
                  Regards:<br />
                  Arvind Soni
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
} 