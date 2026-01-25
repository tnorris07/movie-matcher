import { ReactNode } from 'react';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  leftContent?: ReactNode;
}

export const Header = ({ leftContent }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-[#9CAF88] border-b border-gray-300 shadow-sm w-full">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Logo/Branding */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎬</span>
            <h1 className="text-2xl font-bold text-gray-900">Movie Matcher</h1>
          </div>
          {leftContent && <div className="ml-4">{leftContent}</div>}
        </div>

        {/* User Profile */}
        <UserMenu />
      </div>
    </header>
  );
};
