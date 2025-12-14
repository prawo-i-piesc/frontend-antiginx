import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="relative text-white py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-7xl mx-auto relative">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-8">
          {/* Brand Section */}
          <div className="flex-1 max-w-sm">
            <Image
              src="/logotype.png"
              alt="Antiginx"
              width={150}
              height={32}
              className="h-8 w-auto mb-3"
            />
            <p className="text-zinc-500 text-sm leading-relaxed mb-4">
              Advanced AI-powered website security scanner protecting users from online threats.
            </p>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 flex-1">
            {/* Product */}
            <div>
              <h5 className="font-semibold text-sm text-white/90 mb-3">Product</h5>
              <ul className="space-y-2">
                <li><a href="#features" className="text-zinc-500 hover:text-cyan-400 transition-colors text-sm cursor-pointer">Features</a></li>
                <li><a href="#" className="text-zinc-500 hover:text-cyan-400 transition-colors text-sm cursor-pointer">API</a></li>
                <li><a href="https://prawo-i-piesc.github.io/engine-antiginx/" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-cyan-400 transition-colors text-sm cursor-pointer">Docs</a></li>
                <li><a href="/pricing" className="text-zinc-500 hover:text-cyan-400 transition-colors text-sm cursor-pointer">Pricing</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h5 className="font-semibold text-sm text-white/90 mb-3">Company</h5>
              <ul className="space-y-2">
                <li><a href="#" className="text-zinc-500 hover:text-cyan-400 transition-colors text-sm cursor-pointer">About</a></li>
                <li><a href="#" className="text-zinc-500 hover:text-cyan-400 transition-colors text-sm cursor-pointer">Blog</a></li>
                <li><a href="#" className="text-zinc-500 hover:text-cyan-400 transition-colors text-sm cursor-pointer">Careers</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h5 className="font-semibold text-sm text-white/90 mb-3">Support</h5>
              <ul className="space-y-2">
                <li><a href="#" className="text-zinc-500 hover:text-cyan-400 transition-colors text-sm cursor-pointer">Help</a></li>
                <li><a href="#" className="text-zinc-500 hover:text-cyan-400 transition-colors text-sm cursor-pointer">Contact</a></li>
                <li><a href="#" className="text-zinc-500 hover:text-cyan-400 transition-colors text-sm cursor-pointer">Status</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h5 className="font-semibold text-sm text-white/90 mb-3">Legal</h5>
              <ul className="space-y-2">
                <li><a href="#" className="text-zinc-500 hover:text-cyan-400 transition-colors text-sm cursor-pointer">Privacy</a></li>
                <li><a href="#" className="text-zinc-500 hover:text-cyan-400 transition-colors text-sm cursor-pointer">Terms</a></li>
                <li><a href="#" className="text-zinc-500 hover:text-cyan-400 transition-colors text-sm cursor-pointer">Cookies</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-zinc-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-xs">
            © 2025 Antiginx. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="text-zinc-600 hover:text-cyan-400 transition-colors cursor-pointer">
              <i className="ri-twitter-x-line text-sm"></i>
            </a>
            <a href="#" className="text-zinc-600 hover:text-cyan-400 transition-colors cursor-pointer">
              <i className="ri-linkedin-line text-sm"></i>
            </a>
            <a href="#" className="text-zinc-600 hover:text-cyan-400 transition-colors cursor-pointer">
              <i className="ri-github-line text-sm"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
