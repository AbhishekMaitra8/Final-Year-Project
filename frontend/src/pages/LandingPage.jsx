import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Users, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 overflow-hidden relative select-none">
      <Navbar />

      {/* Decorative Top Band */}
      <div className="w-full h-2 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

      <main className="flex-grow container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl"
        >
          {/* Emblem Placeholder (Optional) */}
          <div className="mb-6 flex justify-center">
            <Shield className="w-16 h-16 text-violet-800" />
          </div>

          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 tracking-tight text-violet-900">
            Sahayta
          </h1>
          <h2 className="text-xl md:text-2xl font-medium text-gray-600 mb-12 uppercase tracking-widest border-b-2 border-orange-400 inline-block pb-2">
            Official Unified Portal
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Citizen Card */}
            <Link to="/citizen" className="group">
              <div className="bg-white border-2 border-gray-200 p-8 rounded-lg shadow-sm hover:shadow-md hover:border-violet-700 transition-all h-full text-left flex flex-col items-start min-h-[250px]">
                <div className="mb-6 bg-violet-50 p-4 rounded-full">
                  <Users size={32} className="text-violet-800" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-violet-900">
                  Citizen Services
                </h3>
                <p className="text-gray-600 mb-6 flex-grow">
                  File complaints, track status, and access public safety
                  services.
                </p>
                <span className="inline-flex items-center text-violet-800 font-bold group-hover:underline">
                  Enter Portal <ArrowRight className="ml-2 w-4 h-4" />
                </span>
              </div>
            </Link>

            {/* Police Card */}
            <Link to="/police" className="group">
              <div className="bg-white border-2 border-gray-200 p-8 rounded-lg shadow-sm hover:shadow-md hover:border-violet-700 transition-all h-full text-left flex flex-col items-start min-h-[250px]">
                <div className="mb-6 bg-violet-50 p-4 rounded-full">
                  <Shield size={32} className="text-violet-800" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-violet-900">
                  Police Department
                </h3>
                <p className="text-gray-600 mb-6 flex-grow">
                  Authorized personnel login for case management and operations.
                </p>
                <span className="inline-flex items-center text-violet-800 font-bold group-hover:underline">
                  Officer Login <ArrowRight className="ml-2 w-4 h-4" />
                </span>
              </div>
            </Link>
          </div>
        </motion.div>
      </main>

      <div className="bg-gray-100 py-4 border-t border-gray-200">
        <div className="container mx-auto text-center text-sm text-gray-500">
          <p>
            © 2024 Sahita - Government of India Initiative. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
