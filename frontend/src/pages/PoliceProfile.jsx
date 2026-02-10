import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield, MapPin, User, Badge, ArrowLeft } from "lucide-react";

const PoliceProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
        </button>

        <div className="max-w-2xl mx-auto bg-card border border-border rounded-lg shadow-sm p-8 official-card">
          <div className="flex items-center gap-4 mb-8 border-b pb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-800">
              <Shield size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {user.full_name || user.username}
              </h1>
              <p className="text-muted-foreground">Law Enforcement Officer</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">
                  Username
                </label>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded border">
                  <User size={16} className="text-gray-500" />
                  <span className="font-semibold">{user.username}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">
                  Police ID
                </label>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded border">
                  <Badge size={16} className="text-gray-500" />
                  <span className="font-semibold">
                    {user.police_id || "N/A"}
                  </span>
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground block mb-1">
                  Assigned Station
                </label>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded border">
                  <MapPin size={16} className="text-gray-500" />
                  <span className="font-semibold">
                    {user.station_name ||
                      `Station ID: ${user.station_id}` ||
                      "Unassigned"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PoliceProfile;
