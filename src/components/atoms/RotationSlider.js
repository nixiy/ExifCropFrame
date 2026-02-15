import React from 'react';

const RotationSlider = ({ rotation, onRotationChange }) => {
  return (
    <div className="rotation-slider-container">
      <input
        type="range"
        min="-180"
        max="180"
        value={rotation}
        onChange={e => onRotationChange(Number(e.target.value))}
        className="rotation-slider"
      />
      <span className="rotation-value">{rotation}°</span>
    </div>
  );
};

export default RotationSlider;
