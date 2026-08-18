import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Check, MapPin, Users, ClipboardList, Share2, Copy, X, GripVertical, ThumbsUp, ThumbsDown, Calendar, DollarSign, Menu, Navigation } from 'lucide-react';
import { InteractiveMapComponent } from './InteractiveMapComponent';
import TripCreationAutocomplete from './TripCreationAutocomplete';
import ExpenseTab from './ExpenseTab';
// import ItineraryTab from './ItineraryTab';
import ProfileComponent from './ProfileComponent';
import TaskTab from './TaskTab';
import { TripsAPI, AuthAPI, InviteAPI, StopsAPI } from './apiService';

export default function TravelPlanner({ userData, onLogoutToHome }) {
  const [currentTab, setCurrentTab] = useState('map');
  const [trips, setTrips] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tripParticipants, setTripParticipants] = useState({});

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [tripInvites, setTripInvites] = useState({});

  const [customPins, setCustomPins] = useState({});
  const [draggedPin, setDraggedPin] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    if (userData) {
      fetchUserAndTrips();
    }
  }, [userData]);
  useEffect(() => {
    if (currentTrip) {
      loadStopsForTrip(currentTrip.id);
      loadTripParticipants(currentTrip.id);
    }
  }, [currentTrip]);

  const loadStopsForTrip = async (tripId) => {
    try {
      const stops = await StopsAPI.getAllStops(tripId);


      // Transform backend stops to customPins format
      const transformedPins = stops.map(stop => ({
        id: Number(stop.id),
        name: stop.customName || stop.placeName,
        description: stop.description || '',
        address: stop.fullAddress,
        lat: parseFloat(stop.latitude),
        lng: parseFloat(stop.longitude),
        addedBy: stop.addedBy ? `${stop.addedBy.firstName} ${stop.addedBy.lastName}` : 'Unknown',
        addedById: stop.addedBy?.id,
        likesCount: stop.likesCount || 0,
        dislikesCount: stop.dislikesCount || 0,
        currentUserVote: stop.currentUserVote || null,
      }));


      setCustomPins({
        ...customPins,
        [tripId]: transformedPins,
      });
    } catch (error) {
      console.error('Error loading stops:', error);
    }
  };

  const fetchUserAndTrips = async () => {
    setLoading(true);
    try {
      const user = await AuthAPI.getCurrentUser();
      setCurrentUser({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      });

      const tripsData = await TripsAPI.getAllTrips();

      const transformedTrips = tripsData.map(trip => {
        const startCoords = trip.startLatitude && trip.startLongitude
          ? [parseFloat(trip.startLongitude), parseFloat(trip.startLatitude)]
          : null;

        const destCoords = trip.destinationLatitude && trip.destinationLongitude
          ? [parseFloat(trip.destinationLongitude), parseFloat(trip.destinationLatitude)]
          : null;

        return {
          id: trip.id,
          name: trip.name,
          description: trip.description,
          destination: trip.destination,
          startingPoint: trip.startingPoint || '',
          startDate: trip.startDate,
          endDate: trip.endDate,
          startPoint: trip.startingPoint || '',
          start: trip.startingPoint || '',
          startCoords: startCoords,
          destCoords: destCoords,
          createdBy: trip.createdBy,
          members: [trip.createdBy ? `${trip.createdBy.firstName} ${trip.createdBy.lastName}` : 'Unknown'],
          shareCode: Math.random().toString(36).substr(2, 9).toUpperCase(),
          places: [],
          tasks: [],
          createdAt: trip.createdAt,
          updatedAt: trip.updatedAt
        };
      });

      setTrips(transformedTrips);

      // ✅ Load participants for all trips
      for (const trip of transformedTrips) {
        await loadTripParticipants(trip.id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTripParticipants = async (tripId) => {
  try {

    const participants = await InviteAPI.getTripParticipants(tripId);
    
    setTripParticipants(prev => ({  // ✅ Use functional update
      ...prev,
      [tripId]: participants,
    }));
    
  } catch (error) {
    console.error('❌ Error loading participants:', error);
    console.error('❌ Error details:', error.message);
  }
};

  const addCustomPin = async (pin) => {
    if (currentTrip && currentUser) {
      try {
        // First, add the stop to the backend
        const stopData = {
          placeName: pin.name,
          fullAddress: pin.address,
          customName: pin.name,
          description: pin.description || '',
          latitude: pin.lat,
          longitude: pin.lng,
        };

        await StopsAPI.addStopToTrip(currentTrip.id, stopData);

        // Then reload all stops to get fresh data from backend
        await loadStopsForTrip(currentTrip.id);

      } catch (error) {
        console.error('Error adding stop:', error);
        alert('Failed to add stop. Please try again.');
      }
    }
  };

  const deleteCustomPin = async (pinId) => {
    if (currentTrip) {
      try {
        await StopsAPI.deleteStop(pinId);

        // Reload stops after deletion
        await loadStopsForTrip(currentTrip.id);
      } catch (error) {
        console.error('Error deleting stop:', error);
        alert('Failed to delete stop. Please try again.');
      }
    }
  };

  const voteForPin = async (pinId, voteType) => {
    if (currentTrip && currentUser) {
      try {
        // Send vote to backend (LIKE or DISLIKE)
        await StopsAPI.voteOnStop(pinId, voteType.toUpperCase());

        // Reload stops to get updated votes
        await loadStopsForTrip(currentTrip.id);
      } catch (error) {
        console.error('Error voting on stop:', error);
        alert('Failed to vote on stop. Please try again.');
      }
    }
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    if (draggedPin === null || draggedPin === dropIndex) {
      setDraggedPin(null);
      setDragOverIndex(null);
      return;
    }

    if (currentTrip) {
      try {
        const currentPins = customPins[currentTrip.id] || [];

        if (!currentPins.length || !currentPins.every(pin => pin.id)) {
          console.error('Invalid stops - missing IDs');
          alert('Cannot reorder: stops are missing IDs');
          return;
        }

        const newPins = [...currentPins];
        const [movedPin] = newPins.splice(draggedPin, 1);
        newPins.splice(dropIndex, 0, movedPin);

        const stopIds = newPins.map(pin => Number(pin.id)).filter(id => !isNaN(id));


        if (stopIds.length === 0) {
          console.error('No valid stop IDs to reorder');
          return;
        }

        // Send reorder request to backend
        await StopsAPI.reorderStops(currentTrip.id, stopIds);


        // Update local state
        setCustomPins({
          ...customPins,
          [currentTrip.id]: newPins,
        });

        setMapKey(prev => prev + 1);
      } catch (error) {
        console.error('❌ Error reordering stops:', error);
        console.error('Error details:', error.message);
        alert('Failed to reorder stops: ' + (error.message || 'Unknown error'));

        // Reload stops to restore correct order
        await loadStopsForTrip(currentTrip.id);
      }
    }

    setDraggedPin(null);
    setDragOverIndex(null);
  };

  const updateCustomPin = (index, updatedPin) => {
    if (currentTrip) {
      const pins = [...(customPins[currentTrip.id] || [])];
      if (pins[index]) {
        pins[index] = {
          ...pins[index],
          x: updatedPin.x,
          y: updatedPin.y,
        };
        setCustomPins({
          ...customPins,
          [currentTrip.id]: pins,
        });
      }
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedPin(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };



  const inviteMember = () => {
    if (inviteEmail && currentTrip) {
      const currentMembers = tripInvites[currentTrip.id] || [];
      if (!currentMembers.includes(inviteEmail)) {
        const updated = {
          ...currentTrip,
          members: [...currentTrip.members, inviteEmail],
        };
        setCurrentTrip(updated);
        setTrips(trips.map(t => t.id === currentTrip.id ? updated : t));
        setTripInvites({
          ...tripInvites,
          [currentTrip.id]: [...currentMembers, inviteEmail],
        });
        setInviteEmail('');
      }
    }
  };

  const removeMember = (email) => {
    if (currentTrip) {
      const updated = {
        ...currentTrip,
        members: currentTrip.members.filter(m => m !== email),
      };
      setCurrentTrip(updated);
      setTrips(trips.map(t => t.id === currentTrip.id ? updated : t));
      const currentMembers = tripInvites[currentTrip.id] || [];
      setTripInvites({
        ...tripInvites,
        [currentTrip.id]: currentMembers.filter(m => m !== email),
      });
    }
  };

  const generateShareLink = async () => {
  if (currentTrip) {
    try {
      const response = await InviteAPI.generateInviteLink(currentTrip.id);


      const inviteToken = response.token || response.inviteToken;

      if (!inviteToken) {
        console.error('No token in response:', response);
        alert('Failed to generate invite link');
        return;
      }

      const link = `${window.location.origin}/?invite=${inviteToken}`;
      setShareLink(link);

      // ✅ Reload participants (will now work correctly)
      await loadTripParticipants(currentTrip.id);
    } catch (error) {
      console.error('Error generating invite link:', error);
      alert('Failed to generate invite link: ' + error.message);
    }
  }
};

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Share link copied to clipboard!');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentTrip(null);
    setTrips([]);
    AuthAPI.logout();
    onLogoutToHome();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3EC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF5A36] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#12222B]/60 font-medium">Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-[#12222B]/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#FF5A36] rounded-xl flex items-center justify-center">
                <MapPin className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#12222B]">TripSync</h1>
                <p className="text-xs text-[#12222B]/50 hidden sm:block">Collaborative trip planning</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {currentTrip && (
                <button
                  onClick={() => setCurrentTrip(null)}
                  className="px-4 py-2 text-sm font-medium text-[#12222B]/75 hover:text-[#12222B] hover:bg-[#F7F3EC] rounded-xl transition"
                >
                  All Trips
                </button>
              )}
              {currentUser && (
                <ProfileComponent
                  currentUser={currentUser.name}
                  userEmail={currentUser.email}
                  tripsCreated={trips.filter(t => t.createdBy?.id === currentUser.id).length}
                  tripsJoined={trips.length}
                  onLogout={handleLogout}
                />
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentTrip ? (
          <div className="mt-4">
            <TripCreationAutocomplete
              onCreateTrip={async (tripData) => {
                await fetchUserAndTrips();

                const allTrips = await TripsAPI.getAllTrips();
                const newTrip = allTrips.find(t => t.name === tripData.name);
                if (newTrip) {
                  const transformedTrip = {
                    id: newTrip.id,
                    name: newTrip.name,
                    description: newTrip.description,
                    destination: newTrip.destination,
                    startDate: newTrip.startDate,
                    endDate: newTrip.endDate,
                    startPoint: tripData.start || '',
                    start: tripData.start || '',
                    startCoords: tripData.startCoords,
                    destCoords: tripData.destCoords,
                    createdBy: newTrip.createdBy,
                    members: [currentUser?.name || 'You'],
                    shareCode: Math.random().toString(36).substr(2, 9).toUpperCase(),
                    places: [],
                    tasks: [],
                  };
                  setCurrentTrip(transformedTrip);
                  setCustomPins({ ...customPins, [transformedTrip.id]: [] });
                  setCurrentTab('map');
                }
              }}
              existingTrips={trips}
              onSelectTrip={(trip) => {
                setCurrentTrip(trip);
                // Stops will be loaded by the useEffect
              }}
              currentUser={currentUser}
              userEmail={currentUser?.email}
              onTripsUpdate={fetchUserAndTrips}
            />
          </div>
        ) : (
          <div>
            {/* Trip Header */}
            <div className="bg-white rounded-xl border border-[#12222B]/10 p-6 mb-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#FF5A36]/12 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-[#FF5A36]" size={24} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-[#12222B] mb-2">{currentTrip.name}</h2>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-[#12222B]/60 mb-2">
                        {(currentTrip.startPoint || currentTrip.start) && (
                          <>
                            <span className="font-medium text-[#12222B]">{currentTrip.startPoint || currentTrip.start}</span>
                            <span className="text-[#12222B]/35">→</span>
                          </>
                        )}
                        <span className="font-medium text-[#12222B]">{currentTrip.destination}</span>
                      </div>
                      {currentTrip.description && (
                        <p className="text-[#12222B]/60 text-sm mb-2">{currentTrip.description}</p>
                      )}
                      {currentTrip.startDate && currentTrip.endDate && (
                        <div className="flex items-center gap-2 text-sm text-[#12222B]/50">
                          <Calendar size={16} />
                          <span>
                            {new Date(currentTrip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(currentTrip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-4 py-2 bg-[#FF5A36] text-white text-sm font-medium rounded-xl hover:bg-[#e84a28] transition flex items-center gap-2 flex-shrink-0"
                >
                  <Share2 size={16} />
                  <span className="hidden sm:inline">Invite</span>
                </button>
              </div>

              {/* Members Section */}
              <div className="border-t border-[#12222B]/10 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users size={18} className="text-[#12222B]/35" />
                  <p className="text-sm font-medium text-[#12222B]/75">
                    {(tripParticipants[currentTrip.id] || []).length} Participant{(tripParticipants[currentTrip.id] || []).length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(tripParticipants[currentTrip.id] || []).map((participant, idx) => {
                    const initials = `${participant.firstName?.charAt(0) || ''}${participant.lastName?.charAt(0) || ''}`.toUpperCase();
                    const isCurrentUser = participant.id === currentUser?.id;

                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#12222B]/6 text-[#12222B]/75 rounded-full text-sm font-medium"
                      >
                        {/* Avatar Circle */}
                        <div className="w-6 h-6 bg-[#FF5A36] text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {initials}
                        </div>
                        <span>
                          {participant.firstName} {participant.lastName}
                          {isCurrentUser && ' (You)'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#12222B]">Invite to Trip</h3>
                    <button
                      onClick={() => {
                        setShowInviteModal(false);
                        setShareLink(''); // Clear share link when closing
                      }}
                      className="text-[#12222B]/35 hover:text-[#12222B]/60 rounded-xl p-1 transition"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Share Link Section - Generate First */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[#12222B]/75 mb-2">
                      Generate Invite Link
                    </label>
                    <button
                      onClick={generateShareLink}
                      className="w-full px-4 py-2 bg-[#FF5A36] text-white text-sm font-medium rounded-xl hover:bg-[#e84a28] transition flex items-center justify-center gap-2"
                    >
                      <Share2 size={16} />
                      {shareLink ? 'Regenerate Link' : 'Generate Link'}
                    </button>
                  </div>

                  {/* Show options only after link is generated */}
                  {shareLink && (
                    <>
                      {/* Display the link */}
                      <div className="mb-6 p-3 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-xs text-[#12222B]/60 mb-2">Your invite link:</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={shareLink}
                            readOnly
                            className="flex-1 px-2 py-1.5 text-xs bg-white border border-[#12222B]/15 rounded text-[#12222B]/75"
                          />
                          <button
                            onClick={copyToClipboard}
                            className="px-3 py-1.5 bg-[#FF5A36] text-white text-xs rounded hover:bg-[#e84a28] transition flex items-center gap-1"
                          >
                            <Copy size={14} />
                            Copy
                          </button>
                        </div>
                      </div>

                      {/* Email Invite Section */}
                      <div className="mb-6 pt-6 border-t border-[#12222B]/10">
                        <label className="block text-sm font-medium text-[#12222B]/75 mb-2">
                          Send Invite via Email
                        </label>
                        <p className="text-xs text-[#12222B]/50 mb-3">
                          Enter an email address to send the invite link directly
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            placeholder="friend@example.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="flex-1 px-3 py-2 border border-[#12222B]/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5A36]/40 focus:border-transparent text-sm"
                          />
                          <button
                            onClick={() => {
                              if (!inviteEmail.trim()) {
                                alert('Please enter an email address');
                                return;
                              }
                              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
                                alert('Please enter a valid email address');
                                return;
                              }

                              const subject = encodeURIComponent(`Join my trip: ${currentTrip.name}`);
                              const body = encodeURIComponent(
                                `Hi!\n\nYou're invited to join my trip "${currentTrip.name}"!\n\n` +
                                `📍 Route: ${currentTrip.startPoint || 'Starting point'} → ${currentTrip.destination}\n` +
                                `📅 ${currentTrip.startDate ? `${new Date(currentTrip.startDate).toLocaleDateString()} - ${new Date(currentTrip.endDate).toLocaleDateString()}` : 'Dates TBD'}\n\n` +
                                `Click the link below to join:\n${shareLink}\n\n` +
                                `Looking forward to planning this trip together!\n\n` +
                                `Sent via TripSync`
                              );
                              window.location.href = `mailto:${inviteEmail}?subject=${subject}&body=${body}`;

                              // Clear the email input after sending
                              setInviteEmail('');
                            }}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition flex items-center gap-2"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect width="20" height="16" x="2" y="4" rx="2" />
                              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                            Send
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    onClick={() => {
                      setShowInviteModal(false);
                      setShareLink(''); // Clear share link when closing
                      setInviteEmail(''); // Clear email input
                    }}
                    className="w-full px-4 py-2.5 bg-white border border-[#12222B]/20 text-[#12222B] text-sm font-semibold rounded-xl hover:bg-[#F7F3EC] hover:border-[#12222B]/30 transition mt-6"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="border-b border-[#12222B]/10 mb-6">
              <nav className="flex gap-8 overflow-x-auto" aria-label="Tabs">
                <button
                  onClick={() => setCurrentTab('map')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition ${currentTab === 'map'
                    ? 'border-[#FF5A36] text-[#FF5A36]'
                    : 'border-transparent text-[#12222B]/50 hover:text-[#12222B]/75 hover:border-[#12222B]/15'
                    }`}
                >
                  <MapPin className="inline mr-2" size={16} />
                  Map
                </button>
                <button
                  onClick={() => setCurrentTab('tasks')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition ${currentTab === 'tasks'
                    ? 'border-[#FF5A36] text-[#FF5A36]'
                    : 'border-transparent text-[#12222B]/50 hover:text-[#12222B]/75 hover:border-[#12222B]/15'
                    }`}
                >
                  <ClipboardList className="inline mr-2" size={16} />
                  Tasks
                </button>
                <button
                  onClick={() => setCurrentTab('expenses')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition ${currentTab === 'expenses'
                    ? 'border-[#FF5A36] text-[#FF5A36]'
                    : 'border-transparent text-[#12222B]/50 hover:text-[#12222B]/75 hover:border-[#12222B]/15'
                    }`}
                >
                  <DollarSign className="inline mr-2" size={16} />
                  Expenses
                </button>
                {/* <button
                  onClick={() => setCurrentTab('itinerary')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition ${currentTab === 'itinerary'
                    ? 'border-[#FF5A36] text-[#FF5A36]'
                    : 'border-transparent text-[#12222B]/50 hover:text-[#12222B]/75 hover:border-[#12222B]/15'
                    }`}
                >
                  <Calendar className="inline mr-2" size={16} />
                  Itinerary
                </button> */}
              </nav>
            </div>

            {/* Trip Map Tab */}
            {currentTab === 'map' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side - Timeline of stops */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl border border-[#12222B]/10 p-5">
                    <h3 className="text-base font-bold text-[#12222B] mb-6 flex items-center gap-2">
                      <MapPin size={18} className="text-[#FF5A36]" />
                      Route
                    </h3>

                    <div className="relative">
                      {/* Continuous connecting line behind the circles */}
                      <div className="absolute left-[19px] top-6 bottom-6 w-px bg-[#12222B]/10" />

                      <div className="space-y-5">
                        {/* Start Point */}
                        {(currentTrip.startingPoint || currentTrip.startPoint || currentTrip.start) && (
                          <div className="relative flex items-start gap-3">
                            <div className="relative z-10 w-10 h-10 rounded-full bg-[#2D9D8F]/15 border-2 border-white ring-1 ring-[#2D9D8F]/20 flex items-center justify-center flex-shrink-0">
                              <Navigation size={16} className="text-[#2D9D8F]" />
                            </div>
                            <div className="flex-1 pt-1.5">
                              <p className="text-[10px] font-bold text-[#2D9D8F] tracking-wide mb-0.5">START</p>
                              <p className="text-sm font-semibold text-[#12222B]">
                                {currentTrip.startingPoint || currentTrip.startPoint || currentTrip.start}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Custom Pins - Draggable, same handlers as before */}
                        {(customPins[currentTrip.id] || []).map((pin, idx) => (
                          <div
                            key={pin.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, idx)}
                            className={`relative flex items-start gap-3 cursor-move rounded-xl transition ${
                              dragOverIndex === idx ? 'bg-[#FF5A36]/6 ring-1 ring-dashed ring-[#FF5A36]/40' : ''
                            }`}
                          >
                            <div className="relative z-10 w-10 h-10 rounded-full bg-[#FF5A36]/12 border-2 border-white ring-1 ring-[#FF5A36]/20 flex items-center justify-center flex-shrink-0">
                              <MapPin size={16} className="text-[#FF5A36]" />
                            </div>
                            <div className="flex-1 py-1 pr-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <GripVertical size={14} className="text-[#12222B]/25 flex-shrink-0" />
                                  <p className="font-semibold text-[#12222B] text-sm">{pin.name}</p>
                                </div>
                                <button
                                  onClick={() => deleteCustomPin(pin.id)}
                                  className="text-[#12222B]/30 hover:text-red-600 rounded p-1 transition flex-shrink-0"
                                  title="Delete pin"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>

                              {pin.description && (
                                <p className="text-[#12222B]/55 text-xs mt-0.5 ml-5">{pin.description}</p>
                              )}
                              <p className="text-[#12222B]/40 text-xs mt-0.5 ml-5">{pin.address}</p>

                              <div className="flex items-center gap-2 mt-2 ml-5">
                                <button
                                  onClick={() => voteForPin(pin.id, 'like')}
                                  className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 text-xs font-medium ${pin.currentUserVote === 'LIKE'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-[#F7F3EC] text-[#12222B]/60 hover:bg-green-50 hover:text-green-700'
                                    }`}
                                >
                                  <ThumbsUp size={11} />
                                  <span>{pin.likesCount || 0}</span>
                                </button>
                                <button
                                  onClick={() => voteForPin(pin.id, 'dislike')}
                                  className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 text-xs font-medium ${pin.currentUserVote === 'DISLIKE'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-[#F7F3EC] text-[#12222B]/60 hover:bg-red-50 hover:text-red-700'
                                    }`}
                                >
                                  <ThumbsDown size={11} />
                                  <span>{pin.dislikesCount || 0}</span>
                                </button>
                                <span className="text-[10px] text-[#12222B]/35 ml-auto">by {pin.addedBy}</span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Destination */}
                        <div className="relative flex items-start gap-3">
                          <div className="relative z-10 w-10 h-10 rounded-full bg-red-50 border-2 border-white ring-1 ring-red-200 flex items-center justify-center flex-shrink-0">
                            <MapPin size={16} className="text-red-500" />
                          </div>
                          <div className="flex-1 pt-1.5">
                            <p className="text-[10px] font-bold text-red-500 tracking-wide mb-0.5">DESTINATION</p>
                            <p className="text-sm font-semibold text-[#12222B]">{currentTrip.destination}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Info Text */}
                    {(customPins[currentTrip.id] || []).length === 0 && (
                      <div className="mt-6 pt-4 border-t border-[#12222B]/10">
                        <p className="text-sm text-[#12222B]/50 text-center">
                          Click on the map to add places
                        </p>
                      </div>
                    )}
                    {(customPins[currentTrip.id] || []).length > 0 && (
                      <div className="mt-6 pt-4 border-t border-[#12222B]/10">
                        <p className="text-xs text-[#12222B]/45 text-center">
                          Drag a stop to reorder
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side - Interactive Map (unchanged component/props) */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-[#12222B]/10 overflow-hidden relative">
                  <div className="relative w-full h-96 lg:h-full min-h-96">
                    <InteractiveMapComponent
                      key={mapKey}
                      startPoint={currentTrip.startPoint}
                      destination={currentTrip.destination}
                      stops={[]}
                      customPins={customPins[currentTrip.id] || []}
                      onAddPin={addCustomPin}
                      onUpdatePin={updateCustomPin}
                      currentUser={currentUser?.name}
                      startCoordinates={currentTrip.startCoords}
                      destCoordinates={currentTrip.destCoords}
                    />
                  </div>

                  {/* Floating route badge, mirrors the reference's location pill */}
                  <div className="absolute top-4 right-4 hidden sm:flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-[#12222B]/10 z-[400]">
                    <MapPin size={12} className="text-[#FF5A36]" />
                    <span className="text-xs font-semibold text-[#12222B]">{currentTrip.destination}</span>
                  </div>

                  <div className="px-4 py-3 bg-[#F7F3EC] border-t border-[#12222B]/10">
                    <p className="text-xs text-[#12222B]/60">
                      <span className="font-medium">Route:</span> {currentTrip.startPoint || 'Your location'} → {currentTrip.destination}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tasks Tab */}
            {currentTab === 'tasks' && (
              <TaskTab
                currentTrip={currentTrip}
                setCurrentTrip={setCurrentTrip}
                trips={trips}
                setTrips={setTrips}
              />
            )}

            {currentTab === 'expenses' && (
              <ExpenseTab
                currentTrip={currentTrip}
                setCurrentTrip={setCurrentTrip}
                trips={trips}
                setTrips={setTrips}
              />
            )}

            {/* {currentTab === 'itinerary' && (
              <ItineraryTab
                currentTrip={currentTrip}
                setCurrentTrip={setCurrentTrip}
                trips={trips}
                setTrips={setTrips}
              />
            )} */}
          </div>
        )}
      </div>
    </div>
  );
}