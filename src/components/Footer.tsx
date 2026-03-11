import { Heart } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => (
  <footer className="border-t bg-card mt-auto">
    <div className="container py-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src={logo} alt="BloodLink" className="h-10 w-10" />
          <span className="font-bold text-primary">Blood<span className="text-secondary">Link</span></span>
        </div>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          Made with <Heart className="h-3.5 w-3.5 text-primary fill-primary" /> for saving lives
        </p>
        <p className="text-xs text-muted-foreground">© 2026 BloodLink. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
