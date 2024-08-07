import React, { useState } from 'react';

const PollCreator = ({ onCreatePoll }) => {
    const [title, setTitle] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [metaTags, setMetaTags] = useState(['']);

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleMetaTagChange = (index, value) => {
        const newMetaTags = [...metaTags];
        newMetaTags[index] = value;
        setMetaTags(newMetaTags);
    };

    const addOption = () => setOptions([...options, '']);
    const addMetaTag = () => setMetaTags([...metaTags, '']);

    const handleSubmit = () => {
        if (title && options.every(opt => opt.trim() !== '')) {
            onCreatePoll({ title, options, metaTags });
            setTitle('');
            setOptions(['', '']);
            setMetaTags(['']);
        }
    };

    return (
        <div className="poll-creator">
            <h2>Create Poll</h2>
            <div className="poll-field">
                <label htmlFor="title">Poll Title</label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Poll Title"
                    required
                />
            </div>
            {options.map((option, index) => (
                <div key={index} className="poll-field">
                    <label htmlFor={`option-${index}`}>Option {index + 1}</label>
                    <input
                        id={`option-${index}`}
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        required
                    />
                </div>
            ))}
            <button onClick={addOption} className="add-button">Add Option</button>
            {metaTags.map((tag, index) => (
                <div key={index} className="poll-field">
                    <label htmlFor={`metaTag-${index}`}>Meta Tag {index + 1}</label>
                    <input
                        id={`metaTag-${index}`}
                        type="text"
                        value={tag}
                        onChange={(e) => handleMetaTagChange(index, e.target.value)}
                        placeholder={`Meta Tag ${index + 1}`}
                    />
                </div>
            ))}
            <button onClick={addMetaTag} className="add-button">Add Meta Tag</button>
            <button onClick={handleSubmit} className="submit-button">Create Poll</button>
        </div>
    );
};

export default PollCreator;
