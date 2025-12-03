import React, { useState } from 'react';
import { Gift, Users, Copy, Check, Trash2 } from 'lucide-react';

export default function SecretSantaApp() {
  const [participants, setParticipants] = useState(['']);
  const [groupName, setGroupName] = useState('');
  const [isCreated, setIsCreated] = useState(false);
  const [groupId, setGroupId] = useState('');
  const [viewMode, setViewMode] = useState('create');
  const [viewCode, setViewCode] = useState('');
  const [myMatch, setMyMatch] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  const addParticipant = () => {
    setParticipants([...participants, '']);
  };

  const removeParticipant = (index) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const updateParticipant = (index, value) => {
    const newParticipants = [...participants];
    newParticipants[index] = value;
    setParticipants(newParticipants);
  };

  const generateRandomId = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  const generateMatches = () => {
    const validParticipants = participants.filter(p => p.trim() !== '');
    
    if (validParticipants.length < 2) {
      alert('Please add at least 2 participants!');
      return;
    }

    if (!groupName.trim()) {
      alert('Please enter a group name!');
      return;
    }

    setLoading(true);

    try {
      let givers = [...validParticipants];
      let receivers = [...validParticipants];
      let isValid = false;
      
      while (!isValid) {
        receivers = [...validParticipants].sort(() => Math.random() - 0.5);
        isValid = givers.every((giver, i) => giver !== receivers[i]);
      }

      const newGroupId = generateRandomId();
      const matches = [];
      
      for (let i = 0; i < givers.length; i++) {
        const code = generateRandomId();
        const matchData = {
          giver: givers[i],
          receiver: receivers[i],
          groupName: groupName.trim(),
          groupId: newGroupId
        };
        
        localStorage.setItem(`match:${code}`, JSON.stringify(matchData));
        matches.push({ giver: givers[i], code });
      }

      localStorage.setItem(`group:${newGroupId}`, JSON.stringify({
        name: groupName.trim(),
        matches: matches,
        created: new Date().toISOString()
      }));

      setGroupId(newGroupId);
      setIsCreated(true);
    } catch (error) {
      console.error('Storage error:', error);
      alert('Failed to create Secret Santa. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const viewMyMatch = () => {
    if (!viewCode.trim()) {
      alert('Please enter your code!');
      return;
    }

    setLoading(true);
    try {
      const matchData = localStorage.getItem(`match:${viewCode.trim()}`);
      if (matchData) {
        setMyMatch(JSON.parse(matchData));
      } else {
        alert('Invalid code! Please check and try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Invalid code! Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      alert('Failed to copy code');
    }
  };

  const reset = () => {
    setIsCreated(false);
    setGroupId('');
    setParticipants(['']);
    setGroupName('');
    setViewMode('create');
    setViewCode('');
    setMyMatch(null);
  };

  const loadGroup = () => {
    if (!groupId) return null;
    
    try {
      const data = localStorage.getItem(`group:${groupId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading group:', error);
      return null;
    }
  };

  if (myMatch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <Gift className="w-20 h-20 mx-auto text-red-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{myMatch.groupName}</h1>
          </div>
          
          <div className="bg-gradient-to-r from-red-100 to-green-100 rounded-xl p-6 mb-6">
            <p className="text-gray-700 text-lg mb-3">Hi <span className="font-bold text-gray-900">{myMatch.giver}</span>! 🎅</p>
            <p className="text-gray-600 mb-4">You're the Secret Santa for:</p>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <p className="text-3xl font-bold text-red-600">{myMatch.receiver}</p>
            </div>
          </div>
          
          <p className="text-gray-500 text-sm mb-6">🤫 Keep it secret!</p>
          
          <button
            onClick={() => setMyMatch(null)}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (isCreated) {
    const groupData = loadGroup();

    if (!groupData) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Gift className="text-red-500" />
                {groupData.name}
              </h1>
              <button
                onClick={reset}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition"
              >
                Create New Group
              </button>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-yellow-800 font-semibold">⚠️ Important: Share codes individually!</p>
              <p className="text-yellow-700 text-sm mt-1">
                Each person should only receive their own code. Don't share this page!
              </p>
            </div>

            <div className="space-y-4">
              {groupData.matches.map((match, index) => (
                <div key={index} className="bg-gradient-to-r from-red-50 to-green-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                        {match.giver.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{match.giver}</p>
                        <p className="text-xs text-gray-500">Send them this code →</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <code className="px-3 py-2 bg-white rounded border border-gray-300 font-mono text-sm">
                        {match.code}
                      </code>
                      <button
                        onClick={() => copyToClipboard(match.code, index)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>💡 Tip: Send each code via email, text, or messaging app</p>
              <p className="mt-1">Recipients enter their code to see who they're gifting for</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <Gift className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Secret Santa</h1>
            <p className="text-gray-600">Create a group or view your match!</p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setViewMode('create')}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                viewMode === 'create'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Create Group
            </button>
            <button
              onClick={() => setViewMode('view')}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                viewMode === 'view'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              View My Match
            </button>
          </div>

          {viewMode === 'create' ? (
            <>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g., Family Christmas 2024"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Participants</h2>
                </div>

                <div className="space-y-3">
                  {participants.map((participant, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={participant}
                        onChange={(e) => updateParticipant(index, e.target.value)}
                        placeholder={`Person ${index + 1}`}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      {participants.length > 1 && (
                        <button
                          onClick={() => removeParticipant(index)}
                          className="px-4 py-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={addParticipant}
                  className="mt-4 w-full px-4 py-3 bg-green-100 hover:bg-green-200 text-green-700 font-semibold rounded-lg transition"
                >
                  + Add Another Person
                </button>
              </div>

              <button
                onClick={generateMatches}
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-green-500 hover:from-red-600 hover:to-green-600 text-white font-bold text-lg rounded-xl shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : '🎁 Generate Secret Santa'}
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 text-center mb-4">
                Enter the code you received to see your match!
              </p>
              
              <input
                type="text"
                value={viewCode}
                onChange={(e) => setViewCode(e.target.value)}
                placeholder="Enter your code"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center font-mono text-lg"
              />

              <button
                onClick={viewMyMatch}
                disabled={loading}
                className="w-full px-6 py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-xl shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : '🎅 View My Match'}
              </button>
            </div>
          )}

          <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-blue-800 text-sm">
              <strong>How it works:</strong> Create a group and get unique codes for each person. They enter their code to see who they're gifting for - completely anonymous!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}