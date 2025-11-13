export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-zinc-800/50">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-5">
              <span className="text-2xl font-bold">Antiginx</span>
            </div>
            <p className="text-zinc-400 leading-relaxed mb-5 max-w-sm text-sm">
              The most advanced website security scanner. 
              We protect users worldwide from online threats.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-zinc-700 transition-colors cursor-pointer">
                <i className="ri-linkedin-line text-zinc-400 text-sm"></i>
              </a>
              <a href="#" className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-zinc-700 transition-colors cursor-pointer">
                <i className="ri-github-line text-zinc-400 text-sm"></i>
              </a>
            </div>
          </div>

          <div>
            <h5 className="font-bold mb-5 text-base text-white">Product</h5>
            <ul className="space-y-2 text-zinc-400 text-sm">
              <li><a href="#" className="hover:text-cyan-400 transition-colors cursor-pointer">Features</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors cursor-pointer">API</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors cursor-pointer">Documentation</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold mb-5 text-base text-white">Support</h5>
            <ul className="space-y-2 text-zinc-400 text-sm">
              <li><a href="#" className="hover:text-cyan-400 transition-colors cursor-pointer">Contact</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors cursor-pointer">System Status</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors cursor-pointer">Report Bug</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold mb-5 text-base text-white">Company</h5>
            <ul className="space-y-2 text-zinc-400 text-sm">
              <li><a href="#" className="hover:text-cyan-400 transition-colors cursor-pointer">About</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800/50 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-zinc-400 text-sm">© 2025 Antiginx. All rights reserved.</p>
          <div className="flex items-center space-x-5 mt-3 md:mt-0">
            <a href="#" className="text-zinc-400 hover:text-cyan-400 transition-colors cursor-pointer text-xs">Privacy Policy</a>
            <a href="#" className="text-zinc-400 hover:text-cyan-400 transition-colors cursor-pointer text-xs">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
