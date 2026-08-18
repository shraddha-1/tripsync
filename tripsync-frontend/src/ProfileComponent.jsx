import React, { useState } from 'react';
import { User, LogOut, Mail, UserCircle, X, MapPin } from 'lucide-react';

export default function ProfileComponent({ currentUser, userEmail, onLogout, tripsCreated = 0, tripsJoined = 0 }) {
  const [showProfileModal, setShowProfileModal] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const handleLogout = () => {
    setShowProfileModal(false);
    onLogout();
    window.location.href = '/';
  };

  return (
    <>
      {/* Profile Icon Button */}
      <button
        onClick={() => setShowProfileModal(true)}
        className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#FF5A36] text-white font-semibold hover:bg-[#e84a28] transition"
        title="View Profile"
      >
        <span className="text-sm">{getInitials(currentUser)}</span>
      </button>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="bg-[#FF5A36] px-6 py-8 rounded-t-xl relative">
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-xl p-1 transition"
              >
                <X size={20} />
              </button>
              
              {/* Avatar Circle */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-md mb-3">
                  <span className="text-3xl font-bold text-[#FF5A36]">
                    {getInitials(currentUser)}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white text-center">
                  {currentUser || 'User'}
                </h2>
              </div>
            </div>

            {/* Profile Information */}
            <div className="p-6 space-y-4">
              {/* Name Section */}
              <div className="flex items-center gap-3 p-3 bg-[#F7F3EC] rounded-xl border border-[#12222B]/10">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#FF5A36]/12 flex items-center justify-center">
                  <UserCircle size={18} className="text-[#FF5A36]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#12222B]/50 font-medium uppercase mb-0.5">Full Name</p>
                  <p className="text-sm font-semibold text-[#12222B] truncate">
                    {currentUser || 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Email Section */}
              <div className="flex items-center gap-3 p-3 bg-[#F7F3EC] rounded-xl border border-[#12222B]/10">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#2D9D8F]/12 flex items-center justify-center">
                  <Mail size={18} className="text-[#2D9D8F]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#12222B]/50 font-medium uppercase mb-0.5">Email Address</p>
                  <p className="text-sm font-semibold text-[#12222B] truncate">
                    {userEmail || 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Account Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#FF5A36]/8 rounded-xl text-center border border-[#FF5A36]/20">
                  <p className="text-2xl font-extrabold text-[#FF5A36]">{tripsCreated}</p>
                  <p className="text-xs text-[#12222B]/60 font-medium mt-1">Trips Created</p>
                </div>
                <div className="p-3 bg-[#2D9D8F]/8 rounded-xl text-center border border-[#2D9D8F]/20">
                  <p className="text-2xl font-extrabold text-[#2D9D8F]">{tripsJoined}</p>
                  <p className="text-xs text-[#12222B]/60 font-medium mt-1">Trips Joined</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#12222B]/10">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium text-sm flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}