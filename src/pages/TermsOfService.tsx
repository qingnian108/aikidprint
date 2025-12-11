import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <div className="bg-white border-2 border-black shadow-brutal p-8 md:p-12 rounded-3xl">
        <h1 className="font-display font-bold text-4xl md:text-5xl mb-8 text-center">Terms of Service</h1>
        <p className="text-slate-500 text-center mb-12 font-mono text-sm">Last Updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="font-bold text-xl md:text-2xl mb-4 text-black">1. Acceptance of Terms</h2>
            <p>
              By accessing or using AI Kid Print, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl md:text-2xl mb-4 text-black">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on AI Kid Print's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Modify or copy the materials for commercial resale (generated worksheets are for personal or classroom use only);</li>
              <li>Attempt to decompile or reverse engineer any software contained on AI Kid Print's website;</li>
              <li>Remove any copyright or other proprietary notations from the materials; or</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-xl md:text-2xl mb-4 text-black">3. User Accounts</h2>
            <p>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our service.
            </p>
            <p className="mt-2">
              You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl md:text-2xl mb-4 text-black">4. AI Generation Disclaimer</h2>
            <p>
              Our service uses Artificial Intelligence to generate worksheets and images. While we strive for high quality and appropriateness, AI generation may occasionally produce unexpected results. You agree to review all generated content before presenting it to children.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl md:text-2xl mb-4 text-black">5. Subscriptions and Payments</h2>
            <p>
              Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis (such as monthly or annually).
            </p>
            <p className="mt-2">
              You may cancel your subscription renewal at any time through your account management page. Refunds are handled on a case-by-case basis in accordance with our refund policy.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl md:text-2xl mb-4 text-black">6. Intellectual Property</h2>
            <p>
              The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of AI Kid Print and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl md:text-2xl mb-4 text-black">7. Limitation of Liability</h2>
            <p>
              In no event shall AI Kid Print, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl md:text-2xl mb-4 text-black">8. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl md:text-2xl mb-4 text-black">9. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl md:text-2xl mb-4 text-black">10. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at support@aikidprint.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
