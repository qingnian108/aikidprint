import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <div className="bg-white border-2 border-black shadow-brutal p-8 md:p-12 rounded-3xl">
        <h1 className="font-display font-bold text-4xl md:text-5xl mb-8 text-center">Privacy Policy</h1>
        <p className="text-slate-500 text-center mb-12 font-mono text-sm">Last Updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="font-bold text-xl md:text-2xl mb-4 text-black">1. Introduction</h2>
            <p>
              Welcome to AI Kid Print ("we," "our," or "us"). We are committed to protecting the privacy of our users, especially children, parents, and educators. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our AI-powered worksheet generation services.
            </p>
            <p className="mt-4">
              We comply with applicable data protection laws, including the General Data Protection Regulation (GDPR) for European users and the Children's Online Privacy Protection Act (COPPA) for users in the United States.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl md:text-2xl mb-4 text-black">2. Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Personal Information:</strong> When you create an account, we collect your email address and name. We do not require children to provide personal information to use our generation tools directly.</li>
              <li><strong>Usage Data:</strong> We automatically collect information about your interaction with our website, such as pages visited, time spent, and worksheet preferences, to improve our services.</li>
              <li><strong>Generated Content:</strong> The worksheets and images you generate are processed to provide the service. We do not claim ownership of the educational content you create for personal or classroom use.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-xl md:text-2xl mb-4 text-black">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Provide, operate, and maintain our AI worksheet generation services.</li>
              <li>Improve, personalize, and expand our website's functionality.</li>
              <li>Communicate with you regarding your account, updates, and support.</li>
              <li>Process transactions securely via our third-party payment processors.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-xl md:text-2xl mb-4 text-black">4. Children's Privacy (COPPA & GDPR-K)</h2>
            <p>
              Protecting the privacy of young children is especially important. AI Kid Print is intended for use by parents, teachers, and guardians. We do not knowingly collect personal identifiable information from children under the age of 13 without verifiable parental consent.
            </p>
            <p className="mt-2">
              If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we can take necessary actions.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl md:text-2xl mb-4 text-black">5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information. However, please note that no method of transmission over the Internet or method of electronic storage is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl md:text-2xl mb-4 text-black">6. Third-Party Services</h2>
            <p>
              We may employ third-party companies (such as Google Firebase for authentication and hosting, and payment processors) to facilitate our service. These third parties have access to your personal information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl md:text-2xl mb-4 text-black">7. Your Data Rights</h2>
            <p>
              Depending on your location, you may have the right to access, correct, delete, or restrict the use of your personal data. You can manage your account settings directly in the dashboard or contact us for assistance.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl md:text-2xl mb-4 text-black">8. Changes to This Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl md:text-2xl mb-4 text-black">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at support@aikidprint.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
