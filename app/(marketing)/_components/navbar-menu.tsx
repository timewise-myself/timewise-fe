"use client";
import { useState, useEffect } from "react";
import Logo from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { signIn } from "next-auth/react";

// interface NavItemProps {
//   children: React.ReactNode;
//   href?: string;
// }

// const NavItem: React.FC<NavItemProps> = ({ children, href }) => {
//   return (
//     <li className="flex items-center gap-2 font-medium">
//       <Link href={href || "#"} passHref>
//         {children}
//       </Link>
//     </li>
//   );
// };

// const NAV_MENU = [
//   { name: "Page", icon: "" },
//   { name: "Account", icon: "" },
//   {
//     name: "Docs",
//     icon: "",
//     href: "https://www.material-tailwind.com/docs/react/installation",
//   },
// ];

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const handleSignIn = async () => {
    await signIn("google", { redirectTo: "/organization/calender" });
  };

  useEffect(() => {
    const handleResize = () => window.innerWidth >= 960 && setOpen(false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 z-50 p-2 w-full border-0 ${
        isScrolling ? "bg-white" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-5">
        <Logo hasText={true} />

        <div className="hidden lg:flex items-center gap-4">
          <Button
            onClick={handleSignIn}
            className="flex items-center space-x-2 px-4 py-2 rounded-full border border-gray-300 bg-black text-white hover:bg-gray-800 transition-all"
          >
            <img
              src="/images/icons/google.svg"
              alt="Google Logo"
              className="w-5 h-5"
            />
            <span className="text-sm font-medium">Continue with Google</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
