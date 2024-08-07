import React, { useState, useEffect } from 'react';
import PollCreator from './PollCreator';
import Poll from './Poll';
import TapToEarn from './TapToEarn';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const API_URL = 'http://localhost:5000';

const App = () => {
  const [polls, setPolls] = useState([]);
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(true);
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('logo.png'); // Update default avatar path
  const [points, setPoints] = useState(0);
  const [energy, setEnergy] = useState(1000);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      axios.get(`${API_URL}/api/users/${savedUserId}`)
        .then(response => {
          setUser(response.data);
          setPoints(response.data.points);
          setEnergy(response.data.energy); // Set initial energy from user data
          setShowSignup(false);
        })
        .catch(error => {
          console.error('Error fetching user:', error);
        });
    }

    const fetchPolls = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/poll`);
        setPolls(response.data);
      } catch (error) {
        console.error('Error fetching polls:', error);
      }
    };

    fetchPolls();
  }, []);

  const handleEnergyRegeneration = async () => {
    if (!user) return;

    try {
      const response = await axios.post(`${API_URL}/api/users/regenerate-energy`, { userId: user._id });
      setEnergy(response.data.energy);
    } catch (error) {
      console.error('Error regenerating energy:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(handleEnergyRegeneration, 2000); // Regenerate energy every minute
    return () => clearInterval(interval);
  }, [user]);

  const handleSignup = async () => {
    if (!/^\d{10}$/.test(phone)) {
      toast.error('Invalid phone number. Please enter a valid 10-digit phone number.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/users/signup`, { username, phone, avatar });
      setUser(response.data);
      setPoints(response.data.points);
      setEnergy(response.data.energy);
      localStorage.setItem('userId', response.data._id);
      setShowSignup(false);
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.response?.data?.message || 'An error occurred during signup.');
    }
  };

  const handleLogin = async () => {
    if (!/^\d{10}$/.test(phone)) {
      toast.error('Invalid phone number. Please enter a valid 10-digit phone number.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/users/login`, { phone });
      setUser(response.data);
      setPoints(response.data.points);
      setEnergy(response.data.energy);
      localStorage.setItem('userId', response.data._id);
      setShowSignup(false);
      setShowLogin(false);
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'An error occurred during login.');
    }
  };

  const handleCreatePoll = async (poll) => {
    if (!user) {
      toast.error('Please login to create a poll');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/poll`, { ...poll, userId: user._id });
      setPolls([...polls, response.data.poll]);
      setPoints(response.data.points);
      toast.success(`Poll created successfully. 5 points deducted. Your current points: ${response.data.points}`);
    } catch (error) {
      console.error('Error creating poll:', error);
      toast.error('An error occurred while creating the poll.');
    }
  };

  const handleVote = async (pollId, option) => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }

    const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]');
    if (votedPolls.includes(pollId)) {
      toast.error('You have already voted in this poll');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/poll/vote`, {
        option: option.option,
        userId: user._id,
        pollId: pollId,
      });
      setPolls(polls.map(p => p._id === response.data.poll._id ? response.data.poll : p));
      setPoints(response.data.points);

      votedPolls.push(pollId);
      localStorage.setItem('votedPolls', JSON.stringify(votedPolls));

      toast.success('Vote recorded successfully.');
    } catch (error) {
      console.error('Error voting:', error);
      toast.error(error.response?.data?.error || 'An error occurred while recording your vote.');
    }
  };

  const handleTap = () => {
    if (!user) {
      toast.error('Please login to earn points');
      return;
    }

    axios.post(`${API_URL}/api/users/tap`, { userId: user._id })
      .then(response => {
        setUser(response.data);
        setPoints(response.data.points);
        setEnergy(response.data.energy);
      })
      .catch(error => {
        if (error.response && error.response.status === 400) {
          toast.error('Daily click limit reached for tap to earn');
        } else {
          console.error(error);
        }
      });
  };

  return (
    <div className="app-container">
      <ToastContainer position="top-center" />
      {showSignup && !showLogin && (
        <div className="signup-container">
          <h2>Signup</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number"
            required
          />
          <select onChange={(e) => setAvatar(e.target.value)} value={avatar}>
            <option value="logo.png">Default Avatar</option>
            <option value="A1.png">Avatar 1</option>
            <option value="A2.png">Avatar 2</option>
            <option value="A3.png">Avatar 3</option>
            <option value="A4.png">Avatar 4</option>
            <option value="A5.png">Avatar 5</option>
          </select>
          <button onClick={handleSignup}>Signup</button>
          <button onClick={() => setShowLogin(true)}>Already have an account? Login</button>
        </div>
      )}
      {showLogin && (
        <div className="login-container">
          <h2>Login</h2>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number"
            required
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      )}
      {!showSignup && !showLogin && user && (
        <>
          <div className="welcome-container">
            <h1>
              <img
                src={`/${user.avatar}`}
                alt="User Avatar"
                className="user-avatar"
                style={{ width: '32px', height: '32px', marginRight: '8px' }}
              />
              Welcome, {user.username}
            </h1>
          </div>
          <div className="poll-creator-container">
            <PollCreator onCreatePoll={handleCreatePoll} />
          </div>
          <div className="polls-container">
            <h2>All Polls</h2>
            {polls.map(poll => (
              <Poll key={poll._id} poll={poll} onVote={handleVote} userId={user._id} />
            ))}
          </div>
          <div className="stats-container">
            <h2>Your Points: {points}</h2>
            <h2>Your Energy: {energy} / 1000</h2>
            <TapToEarn onTap={handleTap} clicksToday={user.tapClicksToday} />
          </div>
        </>
      )}
    </div>
  );
};

export default App;
