
'use client';

import { Facebook, Twitter, Instagram } from 'lucide-react';

const socialLinks = [
    { name: 'Facebook', icon: <Facebook className="h-5 w-5" />, href: 'https://facebook.com' },
    { name: 'Twitter', icon: <Twitter className="h-5 w-5" />, href: 'https://twitter.com' },
    { name: 'Instagram', icon: <Instagram className="h-5 w-5" />, href: 'https://instagram.com' },
];

// This is a new component based on the user's provided UI,
// adapted for Tailwind CSS and the existing project structure.
export function SocialLinks() {
  return (
    <div className="p-2 rounded-2xl backdrop-blur-sm bg-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.1),inset_0_0_5px_rgba(255,255,255,0.2),0_5px_5px_rgba(0,0,0,0.1)] transition-colors duration-500 hover:bg-white/10">
      <ul className="flex list-none gap-4 p-0">
        {socialLinks.map((item) => (
          <li key={item.name} className="iso-pro group relative cursor-pointer transition-transform duration-500">
            {/* These spans create the 3D isometric effect on hover */}
            <span className="absolute h-12 w-12 rounded-full opacity-0 transition-all duration-300 group-hover:opacity-20" style={{ transform: 'translate(0px, 0px)', backgroundColor: 'hsl(var(--primary))' }}></span>
            <span className="absolute h-12 w-12 rounded-full opacity-0 transition-all duration-300 group-hover:opacity-40" style={{ transform: 'translate(3px, -3px)', backgroundColor: 'hsl(var(--primary))' }}></span>
            <span className="absolute h-12 w-12 rounded-full opacity-0 transition-all duration-300 group-hover:opacity-60" style={{ transform: 'translate(6px, -6px)', backgroundColor: 'hsl(var(--primary))' }}></span>

            <a href={item.href} target="_blank" rel="noopener noreferrer" className="relative block h-12 w-12 text-primary transition-transform duration-300 group-hover:translate-x-2 group-hover:-translate-y-2">
              <div className="flex items-center justify-center h-full w-full rounded-full shadow-[inset_0_0_10px_rgba(255,255,255,0.2),inset_0_0_5px_rgba(255,255,255,0.3),0_5px_5px_rgba(0,0,0,0.1)]">
                {item.icon}
              </div>
            </a>
            <div className="absolute z-10 rounded py-1 px-2 text-xs text-primary-foreground bg-primary/80 opacity-0 transition-all duration-300 group-hover:opacity-100" style={{ transform: 'translate(45px, -30px) skew(-5deg)' }}>
              {item.name}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
