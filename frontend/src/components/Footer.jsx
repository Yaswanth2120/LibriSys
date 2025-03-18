import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10 mt-12">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        
        {/* Left Side - Navigation Links */}
        <div className="flex flex-col md:items-start md:text-left text-center space-y-4">
          <nav className="flex space-x-6 text-lg font-medium">
            <Link to="/" className="hover:text-blue-400 transition">Home</Link>
            <Link to="/about" className="hover:text-blue-400 transition">About</Link>
            <Link to="/services" className="hover:text-blue-400 transition">Services</Link>
            <Link to="/team" className="hover:text-blue-400 transition">Team</Link>
            <Link to="/contact" className="hover:text-blue-400 transition">Contact</Link>
          </nav>
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} LibriSys. All Rights Reserved.</p>
        </div>

        {/* Right Side - Social Links */}
        <div className="flex flex-col items-center md:items-end space-y-4">
          <h2 className="text-xl font-semibold">Follow Us</h2>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-blue-400 transition"><Facebook size={28} /></a>
            <a href="#" className="hover:text-blue-400 transition"><Twitter size={28} /></a>
            <a href="#" className="hover:text-blue-400 transition"><Linkedin size={28} /></a>
            <a href="#" className="hover:text-blue-400 transition"><Instagram size={28} /></a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
