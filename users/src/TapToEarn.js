import React from 'react';

const TapToEarn = ({ onTap, clicksToday }) => {
    return (
        <div className="tap-to-earn-container">
            <div onClick={onTap} className="tap-area">
                <img style={{ width: '100px', height: '100px', marginRight: '8px' }} src="logo.png" alt="Logo" className="logo " />
                <p>Clicks Today: {clicksToday}/100</p>
                <div className="emoji-animation">👍</div>
            </div>
        </div>
    );
};

export default TapToEarn;
