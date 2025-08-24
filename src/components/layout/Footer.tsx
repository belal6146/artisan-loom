import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">A</span>
              </div>
              <span className="font-semibold">Artisan</span>
            </div>
            <p className="text-caption max-w-xs">
              A platform for emerging artists to discover, connect, and grow together.
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/explore" className="text-caption hover:text-foreground transition-smooth">
                  Explore
                </Link>
              </li>
              <li>
                <Link to="/collaborate" className="text-caption hover:text-foreground transition-smooth">
                  Collaborate
                </Link>
              </li>
              <li>
                <Link to="/learn" className="text-caption hover:text-foreground transition-smooth">
                  Learn
                </Link>
              </li>
              <li>
                <Link to="/experience" className="text-caption hover:text-foreground transition-smooth">
                  Experience
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-caption hover:text-foreground transition-smooth">
                  Contact
                </Link>
              </li>
              <li>
                <a href="#" className="text-caption hover:text-foreground transition-smooth">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-caption hover:text-foreground transition-smooth">
                  Community Guidelines
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-caption hover:text-foreground transition-smooth">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-caption hover:text-foreground transition-smooth">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-caption hover:text-foreground transition-smooth">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-caption">
              © 2024 Artisan. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-caption hover:text-foreground transition-smooth">
                Twitter
              </a>
              <a href="#" className="text-caption hover:text-foreground transition-smooth">
                Instagram
              </a>
              <a href="#" className="text-caption hover:text-foreground transition-smooth">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};