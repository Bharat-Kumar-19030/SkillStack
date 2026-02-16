import { Github, Linkedin, Mail, Shield, Info } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          
          <div className="">
          <div className="flex items-start gap-3 border-r border-gray-700">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className=" font-semibold text-blue-900 dark:text-blue-300 mb-1">
                  Data Usage & Privacy Commitment
                </h4>
                <div className="space-y-2 text-xs text-gray-700 dark:text-gray-500">
                  {/* <p className="leading-relaxed">
                    <strong>🔒 Data Sourcing:</strong> All information displayed on VibeSpace is sourced through ethical means using official public APIs 
                    (GitHub API, LeetCode GraphQL API, etc.) with proper authentication and within rate limits.
                  </p> */}
                  <p className="leading-relaxed">
                    <strong>No Misuse:</strong> We strictly do not promote, encourage, or facilitate any misuse, unauthorized scraping, 
                    or exploitation of data from any public platform. We respect platform terms of service and API usage guidelines.
                  </p>
                  <p className="leading-relaxed">
                    <strong>Your Privacy:</strong> We only access and display public information that you explicitly authorize through OAuth connections. 
                    Your private data remains private and encrypted. You maintain full control over what data is displayed.
                  </p>
                  {/* <p className="leading-relaxed">
                    <strong>✅ Compliance:</strong> VibeSpace operates in full compliance with GitHub Terms of Service, LeetCode API policies, 
                    and other platform guidelines. We use official APIs with user consent only.
                  </p> */}
                </div>
              </div>
            </div>
        </div>

          {/* Contact Section */}
          <div>
            <h4 className=" font-semibold mb-4 flex items-center gap-2">
              <Mail size={20} />
              Get in Touch
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Have questions or feedback? We'd love to hear from you!
            </p>
            <a 
              href="mailto:bharatkumar19030@gmail.com" 
              className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
            >
              <Mail size={16} />
              bharatkumar19030@gmail.com
            </a>
          </div>
        </div>

        {/* Ethical Data Usage Notice */}
        

        {/* Bottom Bar */}
        <div className="">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} VibeSpace. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 dark:text-gray-500">
                Made with ❤️ for developers
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
