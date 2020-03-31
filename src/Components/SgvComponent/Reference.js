import React  from 'react';

const Reference = ({ text, path, index }) => (
  <svg className='path-svg' key={index}>
    <path d={path} stroke='black' fill='transparent' className='path' />
    <text x={text.pkText.x} y={text.pkText.y} className='ref-text'>
      1
    </text>
    <text x={text.fkText.x} y={text.fkText.y} className='ref-text'>
      *
    </text>
  </svg>
);

export default Reference;
