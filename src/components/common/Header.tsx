import type { ReactNode } from 'react';
import { Film } from 'lucide-react';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  leftContent?: ReactNode;
}

export const Header = ({ leftContent }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-lg border-b border-secondary-100 shadow-soft">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Logo/Branding */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-button">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-secondary-800">
                Movie<span className="text-primary-500">Matcher</span>
              </h1>
            </div>
          </div>
          {leftContent && <div className="ml-4">{leftContent}</div>}
        </div>

        {/* User Profile */}
        <UserMenu />
      </div>
    </header>
  );
};
