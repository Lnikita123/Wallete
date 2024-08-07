import React, { useState } from 'react';
import { toast } from 'react-toastify';

const Poll = ({ poll, onVote, userId }) => {
    const [selectedOption, setSelectedOption] = useState(null);

    const handleVote = (option) => {
        const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]');
        if (votedPolls.includes(poll._id)) {
            toast.error('You have already voted in this poll');
            return;
        }

        setSelectedOption(option);
        onVote(poll._id, option);
    };

    const getPollPercentage = (option) => {
        const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
        const pollOption = poll.options.find(opt => opt.option === option);
        const votes = pollOption ? pollOption.votes : 0;
        const percentage = totalVotes ? (votes / totalVotes) * 100 : 0;
        return { votes, percentage };
    };

    return (
        <div className="poll-container">
            <h3 className="poll-title">{poll.title}</h3>
            {poll.options.map((option, index) => (
                <div
                    key={index}
                    className={`poll-option ${selectedOption?.option === option.option ? 'selected' : ''}`}
                    onClick={() => handleVote(option)}
                    style={{ background: `linear-gradient(to right, #4caf50 ${getPollPercentage(option.option).percentage}%, transparent ${getPollPercentage(option.option).percentage}%)` }}
                >
                    <div className="poll-option-content">
                        <span className="poll-option-text">{option.option}</span>
                        <span className="poll-option-votes">{option.votes} votes</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Poll;
