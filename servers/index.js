const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb+srv://qjoxqciedfjvrzyeyh:oVDaqdgLGKDxYT58@cluster0.kczadan.mongodb.net/telegram', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    phone: {
        type: String, required: true, unique: true, validate: {
            validator: function (v) {
                return /^\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    points: { type: Number, default: 50 }, // Start with 50 coins by default
    clicksToday: { type: Map, of: Number, default: {} }, // Store poll-specific clicks
    tapClicksToday: { type: Number, default: 0 }, // Store tap-to-earn clicks
    lastClickDate: { type: Date, default: null },
    votedPolls: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Poll' }],
    avatar: { type: String, default: 'default-avatar.png' }, // User avatar
    energy: { type: Number, default: 1000 }, // Start with 1000 energy by default
});

const User = mongoose.model('User', userSchema);

// Poll Schema
const pollSchema = new mongoose.Schema({
    title: { type: String, required: true },
    options: [{
        option: { type: String, required: true },
        votes: { type: Number, default: 0 },
    }],
    metaTags: [{ type: String, required: true }],
});

const Poll = mongoose.model('Poll', pollSchema);

// Create User Endpoint
app.post('/api/users/signup', async (req, res) => {
    const { username, phone, avatar } = req.body;
    if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({ message: 'Invalid phone number format' });
    }

    let user = await User.findOne({ phone });
    if (user) {
        return res.status(400).json({ message: 'Phone number already in use' });
    }

    user = new User({ username, phone, avatar, lastClickDate: new Date() }); // Initialize lastClickDate for new users
    await user.save();
    res.json(user);
});

// Login User Endpoint
app.post('/api/users/login', async (req, res) => {
    const { phone } = req.body;

    let user = await User.findOne({ phone });
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    res.json(user);
});

// Get User Endpoint
app.get('/api/users/:userId', async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// Click Endpoint for Tap to Earn
app.post('/api/users/tap', async (req, res) => {
    const { userId } = req.body;
    const user = await User.findById(userId);
    const today = new Date().toISOString().split('T')[0];

    if (user) {
        const lastClickDate = user.lastClickDate ? user.lastClickDate.toISOString().split('T')[0] : null;

        if (lastClickDate !== today) {
            user.tapClicksToday = 0;
            user.lastClickDate = new Date();
        }

        if (user.tapClicksToday < 100) {
            if (user.energy > 0) {
                user.points += 1;
                user.tapClicksToday += 1;
                user.energy -= 1;
                await user.save();
                res.json(user);
            } else {
                res.status(400).json({ message: 'Not enough energy to tap' });
            }
        } else {
            res.status(400).json({ message: 'Daily click limit reached for tap to earn' });
        }
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// Energy Regeneration Endpoint
app.post('/api/users/regenerate-energy', async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.energy < 1000) {
            user.energy += 1;
            await user.save();
        }

        res.json({ energy: user.energy });
    } catch (error) {
        console.error('Error regenerating energy:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Poll Endpoints
app.post('/api/poll', async (req, res) => {
    const { title, options, metaTags, userId } = req.body;
    const user = await User.findById(userId);
    if (user && user.points >= 5) {
        const poll = new Poll({
            title,
            options: options.map(option => ({ option, votes: 0 })),
            metaTags: metaTags.length ? metaTags : ['crypto', 'tech', 'general'] // Default meta tags
        });
        await poll.save();
        user.points -= 5; // Deduct 5 coins for creating a poll
        await user.save();
        res.json({ poll, points: user.points });
    } else {
        res.status(400).json({ message: 'Insufficient points or user not found' });
    }
});

app.get('/api/poll', async (req, res) => {
    const polls = await Poll.find();
    res.send(polls);
});

app.post('/api/poll/vote', async (req, res) => {
    const { option, userId, pollId } = req.body;

    if (!option || !userId || !pollId) {
        return res.status(400).send({ error: 'Option, userId, and pollId are required' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        const poll = await Poll.findById(pollId);
        if (!poll) {
            return res.status(404).send({ error: 'Poll not found' });
        }

        if (user.votedPolls.includes(pollId)) {
            return res.status(400).send({ error: 'You have already voted in this poll' });
        }

        const pollOption = poll.options.find(opt => opt.option === option);
        if (!pollOption) {
            return res.status(404).send({ error: 'Poll option not found' });
        }

        pollOption.votes += 1;
        user.votedPolls.push(poll._id);

        await poll.save();
        await user.save();

        res.send({ poll, points: user.points });
    } catch (error) {
        console.error('Error handling vote:', error);
        res.status(500).send({ error: 'An error occurred while processing your vote' });
    }
});

// Root Endpoint
app.get('/', (req, res) => {
    res.send('Hello, Telegram Mini App!');
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
