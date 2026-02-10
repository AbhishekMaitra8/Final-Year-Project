import React, { useState, useEffect } from "react";
// Navbar and Footer removed for dashboard integration
import { useAuth } from "../context/AuthContext";
import { Eye, X, FileText, Calendar, MapPin, User } from "lucide-react";

const Archives = () => {
  const { token, role } = useAuth();
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFir, setSelectedFir] = useState(null);

  useEffect(() => {
    const fetchArchives = async () => {
      try {
        const response = await fetch("/api/fir/archives", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setArchives(data);
        } else {
          setError("Failed to fetch archives");
        }
      } catch (err) {
        setError("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };

    fetchArchives();
  }, [token]);

  return (
    <div className="flex flex-col h-full relative">
      <div className="">
        <h1 className="text-2xl font-bold font-serif text-gray-800 mb-6">
          Case Archives
        </h1>

        {loading ? (
          <div className="text-center py-10">Loading archives...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-600">{error}</div>
        ) : archives.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No archived cases found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archives.map((fir) => (
              <div
                key={fir._id}
                className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-all flex flex-col"
              >
                <div className="p-4 flex flex-col gap-2 flex-grow">
                  <div className="flex justify-between items-start">
                    <span className="inline-block px-2 py-0.5 text-xs font-bold text-green-700 bg-green-100 rounded-md uppercase tracking-wide">
                      {fir.status}
                    </span>
                    {role === "police" && (
                      <span className="text-[10px] items-center flex gap-1 text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        <User size={10} /> {fir.user_id.substring(0, 6)}...
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-primary">
                      FIR #{fir._id.substring(0, 8)}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Calendar size={12} />
                      <span>
                        {new Date(fir.submission_date).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 border-t border-border mt-auto">
                  <button
                    onClick={() => setSelectedFir(fir)}
                    className="w-full py-2 bg-white border border-input text-foreground rounded-md text-sm font-medium hover:bg-accent transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Eye size={14} /> View Detailed Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedFir && (
        <ArchiveDetailsModal
          fir={selectedFir}
          onClose={() => setSelectedFir(null)}
        />
      )}
    </div>
  );
};

const ArchiveDetailsModal = ({ fir, onClose }) => {
  if (!fir) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-xl shadow-2xl w-[800px] h-[700px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-5 border-b border-border flex justify-between items-center bg-muted/30">
          <div>
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <FileText size={20} /> Archived Report Details
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              FIR ID: <span className="font-mono">{fir._id}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Status Banner */}
          <div className="flex justify-between items-center bg-green-50 border border-green-200 p-4 rounded-lg">
            <div>
              <p className="text-xs font-bold text-green-700 uppercase">
                Case Status
              </p>
              <p className="font-bold text-green-900 text-lg">
                {fir.status.replace("_", " ").toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-green-700 uppercase">
                Filed On
              </p>
              <p className="font-semibold text-green-900">
                {new Date(fir.submission_date).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Complaint Section */}
          <div className="space-y-2">
            <h3 className="font-bold text-gray-800 border-b pb-2">
              Original Complaint
            </h3>
            <div className="bg-muted/30 p-4 rounded-md text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {fir.original_text}
            </div>
          </div>

          {/* Applied Sections */}
          {fir.applicable_sections && fir.applicable_sections.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-gray-800 border-b pb-2">
                Legal Sections Applied
              </h3>
              <div className="flex flex-wrap gap-2 pt-2">
                {fir.applicable_sections.map((sec, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {sec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Police Notes */}
          {fir.police_notes && (
            <div className="space-y-2">
              <h3 className="font-bold text-gray-800 border-b pb-2">
                Investigator's Notes
              </h3>
              <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-md text-sm text-gray-800 italic">
                "{fir.police_notes}"
              </div>
            </div>
          )}

          {/* User Info */}
          <div className="pt-4 border-t text-xs text-muted-foreground flex justify-between">
            <span>User ID: {fir.user_id}</span>
            <span>Station ID: {fir.station_id || "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Archives;
