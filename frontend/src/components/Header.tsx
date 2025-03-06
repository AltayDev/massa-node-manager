import React, { useState } from "react";
import LogoSvg from "../assets/node.svg";

const MENU_ITEMS = [
  { title: "Menu1", href: "#" },
  { title: "Menu2", href: "#" },
  { title: "Menu3", href: "#" },
  { title: "Menu4", href: "#" },
];

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  return (
    <header className="bg-gray-900 text-white">
      <div className="px-4 mx-auto sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          {/* Logo on the left */}
          <div className="flex-shrink-0">
            <a href="#" title="Node Manager" className="flex">
              <img
                className="w-auto h-8"
                src={LogoSvg}
                alt="Node Manager Logo"
              />
            </a>
          </div>

          {/* Hamburger button for mobile */}
          <button
            type="button"
            className="lg:hidden p-2 text-white rounded-md hover:bg-gray-700 focus:bg-gray-700"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>

          {/* Desktop Menu (right-aligned) */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            {MENU_ITEMS.map((item) => (
              <a
                key={item.title}
                href={item.href}
                title={item.title}
                className="text-base font-medium text-white hover:text-gray-300"
              >
                {item.title}
              </a>
            ))}
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <nav
        className={`fixed inset-y-0 right-0 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } lg:hidden z-50`}
      >
        <div className="flex justify-end p-4">
          <button
            type="button"
            className="p-2 text-white rounded-md hover:bg-gray-700 focus:bg-gray-700"
            onClick={toggleMobileMenu}
            aria-label="Close mobile menu"
          >
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-col space-y-4 p-4">
          {MENU_ITEMS.map((item) => (
            <a
              key={item.title}
              href={item.href}
              title={item.title}
              className="text-lg font-medium text-white hover:text-gray-300"
              onClick={toggleMobileMenu}
            >
              {item.title}
            </a>
          ))}
        </div>
      </nav>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={toggleMobileMenu}
        ></div>
      )}
    </header>
  );
}

export default Header;
