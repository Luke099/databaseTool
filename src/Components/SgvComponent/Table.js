import React, { Fragment, useEffect, useState } from 'react';
import './index.css';

const initWidth = 250;
const fieldHeight = 50;

const Table = ({ table, onSelectTableEditing, onTableSettingsChange }) => {
  const { name, fields, coordinates, id, settings } = table;
  const { width } = settings;
  const [offsetWidthName, setOffsetWidthName] = useState(100);
  useEffect(() => {
    const thisTable = document.getElementById(id);
    const tableElements = thisTable.getElementsByClassName('field-name');
    const tableNameElement = thisTable.getElementsByClassName(
      'field-name-table'
    )[0];
    let tableWidth = initWidth;
    for (let i = 0; i < tableElements.length; i++) {
      if (tableElements[i].clientWidth > 200)
        tableWidth = tableElements[i].clientWidth + 80;
      if (tableNameElement.getBBox().width > 200)
        tableWidth = tableNameElement.getBBox().width + 80;
    }
    if (tableWidth !== initWidth) {
      onTableSettingsChange(id, { width: tableWidth });
    } else {
      if (width !== initWidth) onTableSettingsChange(id, { width: initWidth });
    }
  }, [JSON.stringify(table)]);

  useEffect(() => {
    const thisTable = document.getElementById(id);
    const textTableNameWidth = thisTable
      .getElementsByClassName('field-name-table')[0]
      .getBBox().width;
    setOffsetWidthName(parseFloat(width - textTableNameWidth) / 2);
  }, [width]);

  useEffect(() => {
    const thisTable = document.getElementById(id);
    const textTableNameWidth = thisTable
      .getElementsByClassName('field-name-table')[0]
      .getBBox().width;
    const nextWidthOffset = parseFloat(width - textTableNameWidth) / 2;
    if (nextWidthOffset != offsetWidthName) {
      setOffsetWidthName(nextWidthOffset);
    }
  },[table]);

  return (
    <svg {...coordinates} className='table-container' data-id={id} id={id}>
      <rect
        x='0'
        y='0'
        width={width}
        height='50'
        stroke='#a0aec0'
        fill='#9ae6b4'
        strokeWidth='1'
        className='table'
        onClick={() => onSelectTableEditing(table)}
      />
      <text x={offsetWidthName} y='30' className='field-name-table'>
        {name}
      </text>
      {fields.map((field, index) => (
        <Fragment key={index}>
          <rect
            x='0'
            y={(index + 1) * fieldHeight}
            width={width}
            height={fieldHeight}
            stroke='#a0aec0'
            fill='#f7fafc'
            strokeWidth='1'
            id={`${name}-${field.fieldName}`}
          />
          <text
            x='20'
            y={(index + 1) * fieldHeight + 30}
            className='field-name'>
            {field.fieldName}
          </text>
          <text x={width - 70} y={(index + 1) * fieldHeight + 30}>
            {field.type}
          </text>
          )}
        </Fragment>
      ))}
    </svg>
  );
};

export default Table;
