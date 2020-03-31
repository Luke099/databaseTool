import React, { Fragment, useEffect, useState } from 'react';
import Table from './Table';
import Reference from './Reference';
import './index.css';

const tableWidth = 250;
const fieldHeight = 50;
const distance = 50;
let initCountReDrawLine = 0;
let gScale = 1;

const leftToolBarWidth = 400;
function getMousePosition(evt) {
  const svgContainer = document.getElementById('svg-container');
  var CTM = svgContainer.getScreenCTM();
  return {
    x: (evt.clientX - CTM.e) / CTM.a,
    y: (evt.clientY - CTM.f) / CTM.d
  };
}

function getMousePositionForPath(evt) {
  const groupContainer = document.getElementById('svg-group');
  let ctm = groupContainer.getScreenCTM();
  const position = {
    x: (evt.clientX - ctm.e) / (ctm.a / gScale),
    y: (evt.clientY - ctm.f) / (ctm.d / gScale)
  };
  return position;
}

const getCoordinates = (ref, scale, translate) => {
  const { from, to, id, toId } = ref;
  const fromElement = document.getElementById(from.fromField);
  const toElement = document.getElementById(to.toField);
  let tableFromWidth = 0;
  let tableToWidth = 0;
  if (fromElement) {
    from.x = fromElement.getBoundingClientRect().right - leftToolBarWidth;
    from.y =
      fromElement.getBoundingClientRect().top + (fieldHeight / 2) * scale;
    from.x = from.x / scale - translate.x;
    from.y = from.y / scale - translate.y;
    tableFromWidth = fromElement.getBBox().width;
  }

  if (toElement) {
    to.x = toElement.getBoundingClientRect().right - leftToolBarWidth;
    to.y = toElement.getBoundingClientRect().top + (fieldHeight / 2) * scale;
    to.x = to.x / scale - translate.x;
    to.y = to.y / scale - translate.y;
    tableToWidth = toElement.getBBox().width;
  }

  const maxTableWidth =
    tableFromWidth > tableToWidth ? tableFromWidth : tableToWidth;

  const minTableWidth =
    tableFromWidth > tableToWidth ? tableToWidth : tableFromWidth;
  let text = {};
  let path = '';
  const isLeftToRight = from.x < to.x;
  const isDistanceOverTableWidth = (x1, x2) => x1 - x2 > maxTableWidth;
  let x1 = from.x;
  let y1 = from.y;
  let x6 = to.x;
  let y6 = to.y;

  if (isLeftToRight) {
    if (isDistanceOverTableWidth(x6, x1)) {
      x6 -= tableToWidth;
      const x2 = x1 + (x6 - x1) / 2 - 10;
      const y2 = y1;
      const x3 = x2 + 10;
      const y3 = y6 > y1 ? y2 + 10 : y2 - 10;
      const x4 = x3;
      const y4 = y6 > y1 ? y6 - 10 : y6 + 10;
      const x5 = x4 + 10;
      const y5 = y6;
      path = `M ${x1} ${y1} L ${x2} ${y2}  Q ${x3} ${y2}, ${x3} ${y3} L ${x4} ${y4} Q ${x4} ${y5}, ${x5} ${y5}  L ${x6} ${y6}`;
      const pkText = { x: x6 - 10, y: to.y - 5 };
      const fkText = { x: from.x + 5, y: from.y };
      text = { pkText, fkText };
    } else {
      const x2 = x1 + (x6 - x1) + 10;
      const y2 = y1;
      const x3 = x2 + 10;
      const y3 = y6 > y1 ? y2 + 10 : y2 - 10;
      const x4 = x3;
      const y4 = y6 > y1 ? y6 - 10 : y6 + 10;
      const x5 = x4 - 10;
      const y5 = y6;
      path = `M ${x1} ${y1} L ${x2} ${y2}  Q ${x3} ${y2}, ${x3} ${y3} L ${x4} ${y4} Q ${x4} ${y5}, ${x5} ${y5}  L ${x6} ${y6}`;
      const pkText = { x: x6 + 10, y: y6 - 5 };
      const fkText = { x: x1 + 5, y: y1 };
      text = { pkText, fkText };
    }
  } else {
    if (isDistanceOverTableWidth(x1, x6)) {
      x1 -= tableFromWidth;
      const x2 = x1 + (x6 - x1) / 2;
      const y2 = y1;
      const x3 = x2 - 10;
      const y3 = y6 > y1 ? y2 + 10 : y2 - 10;
      const x4 = x3;
      const y4 = y6 > y1 ? y6 - 10 : y6 + 10;
      const x5 = x4 - 10;
      const y5 = y6;

      path = `M ${x1} ${y1} L ${x2} ${y2}  Q ${x3} ${y2}, ${x3} ${y3} L ${x4} ${y4} Q ${x4} ${y5}, ${x5} ${y5}  L ${x6} ${y6}`;
      const pkText = { x: x6 + 5, y: y6 - 5 };
      const fkText = { x: x1 - 10, y: y1 };
      text = { pkText, fkText };
    } else {
      x1 -= tableFromWidth;
      x6 -= tableToWidth;
      const x2 = x6 > x1 ? x1 - 10 : x6 - 10;
      const y2 = y1;
      const x3 = x2 - 10;
      const y3 = y6 > y1 ? y2 + 10 : y2 - 10;
      const x4 = x3;
      const y4 = y6 > y1 ? y6 - 10 : y6 + 10;
      const x5 = x4 + 10;
      const y5 = y6;
      path = `M ${x1} ${y1} L ${x2} ${y2}  Q ${x3} ${y2}, ${x3} ${y3} L ${x4} ${y4} Q ${x4} ${y5}, ${x5} ${y5}  L ${x6} ${y6}`;
      const pkText = { x: x6 + -10, y: y6 - 5 };
      const fkText = { x: x1 - 10, y: y1 };
      text = { pkText, fkText };
    }
  }
  return { ...ref, text, path };
};

let tableSelected = null;
let lineSelected = null;
let offset = null;

const startDrag = evt => {
  if (evt.target.classList.contains('table')) {
    tableSelected = evt.target.parentNode;
    offset = getMousePosition(evt);
    offset.x -= parseFloat(tableSelected.getAttributeNS(null, 'x'));
    offset.y -= parseFloat(tableSelected.getAttributeNS(null, 'y'));
  }

  if (evt.target.classList.contains('path')) {
    lineSelected = evt.target.parentNode.parentNode;
    offset = getMousePositionForPath(evt);
  }
};

const drag = (evt, setReDraw) => {
  if (tableSelected) {
    evt.preventDefault();
    const tableId = tableSelected.getAttribute('data-id');
    let coord = getMousePosition(evt);
    const nextCoordinates = { x: coord.x - offset.x, y: coord.y - offset.y };
    setReDraw({ tableId, coordinates: nextCoordinates, isMoveSvg: false });
  }
  if (lineSelected) {
    evt.preventDefault();
    let coord = getMousePosition(evt);
    let coordinates = { x: coord.x - offset.x, y: coord.y - offset.y };
    setReDraw({
      isMoveSvg: true,
      coordinates
    });
  }
};

const endDrag = () => {
  tableSelected = null;
  lineSelected = null;
};

const removeDraggable = () => {
  const svgContainer = document.getElementById('svg-container');
  svgContainer.removeEventListener('mousedown', startDrag);
  svgContainer.removeEventListener('mousemove', drag);
  svgContainer.removeEventListener('mouseup', endDrag);
  svgContainer.removeEventListener('mouseleave', endDrag);
};

const makeDraggable = setReDraw => {
  const svgContainer = document.getElementById('svg-container');
  svgContainer.addEventListener('mousedown', startDrag);
  svgContainer.addEventListener('mousemove', e => drag(e, setReDraw));
  svgContainer.addEventListener('mouseup', endDrag);
  svgContainer.addEventListener('mouseleave', endDrag);
};

const makeZoomAble = (event, size, setReScale) => {
  const maxScale = 5;
  const minScale = 0.2;
  if (event.deltaY < 0 && gScale < maxScale) {
    gScale += 0.1;
  } else if (event.deltaY > 0 && gScale > minScale) {
    gScale -= 0.1;
  }
  setReScale({ scale: gScale });
};

const SvgContainer = ({
  data,
  onSelectTableEditing,
  onTableDrag,
  onSettingsChange,
  onTableSettingsChange
}) => {
  const {
    tables,
    refs,
    settings: { scale, translate }
  } = data;
  const [nextRefs, setNextRefs] = useState(null);
  const [reDraw, setReDraw] = useState(0);
  const [reScale, setReScale] = useState(0);
  const getLines = () => {
    setNextRefs(refs.map(ref => getCoordinates(ref, scale, translate)));
  };

  useEffect(() => {
    if (!reDraw.isMoveSvg) getLines();
  }, [data, scale, reDraw]);

  useEffect(() => {
    onTableDrag(reDraw);
    if (reDraw.isMoveSvg) {
      const translate = {
        x: parseFloat(reDraw.coordinates.x ),
        y: parseFloat(reDraw.coordinates.y)
      };
      onSettingsChange({ translate });
    }
  }, [reDraw]);

  useEffect(() => {
    onSettingsChange(reScale);
  }, [reScale]);

  useEffect(() => {
    makeDraggable(setReDraw);
    return () => {
      removeDraggable();
    };
  }, []);

  useEffect(() => {
    const svgContainer = document.getElementById('svg-container');
    let size = {
      localScale: 1
    };
    svgContainer.addEventListener('wheel', event =>
      makeZoomAble(event, size, setReScale)
    );
    return () => {
      const svgContainer = document.getElementById('svg-container');
      svgContainer.removeEventListener('wheel', event =>
        makeZoomAble(event, size, setReScale)
      );
    };
  }, []);

  return (
    <svg id='svg-container' style={{ width: '100%', height: '100vh' }}>
      <g
        id='svg-group'
        className='wraped'
        style={{
          transform: `scale(${scale}) translate(${translate.x}px, ${translate.y}px)`
        }}>
        {nextRefs &&
          nextRefs.length > 0 &&
          nextRefs.map((ref, index) => <Reference key={index} {...ref} />)}
        {tables.map((table, index) => (
          <Table
            table={table}
            key={index}
            number={index}
            onSelectTableEditing={onSelectTableEditing}
            onTableSettingsChange={onTableSettingsChange}
          />
        ))}
      </g>
    </svg>
  );
};

export default SvgContainer;
