import React, { useState, useMemo } from 'react';
import './App.css';
import 'antd/dist/antd.css';
import fakeData from './fakeData';
import SvgContainer from './Components/SgvComponent/SvgContainer';
import Form from './Components/Form/Form';
import { Button, Upload, Icon, Select, Drawer } from 'antd';
import CKEditor from '@ckeditor/ckeditor5-react';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
const { Option } = Select;

const getTableOptions = (tables) => {
  return tables.map((table, index) => (
    <Option key={index} value={table.name}>
      {table.name}
    </Option>
  ));
};

const getTableFieldsOptions = tables => {
  let options = [];
  tables.map(({ name, fields }, index) => {
    fields.map(({ fieldName }) => {
      options.push(
        <Option key={index} value={`${name}-${fieldName}`}>
          {`${name}-${fieldName}`}
        </Option>
      );
    });
  });
  return options;
};

const configRefsOnTableNameChange = (newTable, data) => {
  let nextRefs = data.refs.map((ref, index) => {
    let nextRef = { ...ref };
    if (nextRef.id === newTable.id) {
      nextRef.from = { ...ref.from };
      const tableName = nextRef.from.fromField.split('-')[0];
      nextRef.from.fromField = nextRef.from.fromField.replace(
        tableName,
        newTable.name
      );
    }
    if (nextRef.toId === newTable.id) {
      nextRef.to = { ...ref.to };
      const tableName = nextRef.to.toField.split('-')[0];
      nextRef.to.toField = nextRef.to.toField.replace(tableName, newTable.name);
    }
    return nextRef;
  });
  return { ...data, refs: nextRefs };
};

function App() {
  const [data, setData] = useState(fakeData);
  const [tableEditing, setTableEditing] = useState({});
  const [refsEditing, setRefsEditing] = useState([]);
  const [visible, setVisible] = useState(false);
  const [description, setDescription] = useState('');

  const handleAddTable = ({ newTable, newRefs }) => {
    const nextData = {
      settings: data.settings,
      tables: [...data.tables, newTable],
      refs: [...data.refs, ...newRefs]
    };
    const dataConfiged = configRefsOnTableNameChange(newTable, nextData);
    setData(dataConfiged);
    setData(nextData);
  };

  const handleUpdateTable = ({ newTable, newRefs }) => {
    const index = data.tables.findIndex(table => table.id === newTable.id);
    const nextTables = [...data.tables];
    nextTables[index] = newTable;
    const nextData = {
      settings: data.settings,
      tables: nextTables,
      refs: [...data.refs.filter(ref => ref.id !== newTable.id), ...newRefs]
    };
    const dataConfiged = configRefsOnTableNameChange(newTable, nextData);
    setData(dataConfiged);
    setTableEditing(newTable);
  };

  const exportToJsonFile = () => {
    let dataStr = JSON.stringify(data);
    let dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    let exportFileDefaultName = 'dataBase.json';
    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const onImportFile = file => {
    var fr = new FileReader();
    fr.onload = function(e) {
      var result = JSON.parse(e.target.result);
      setData(result);
    };
    fr.readAsText(file);
    return false;
  };

  const reDrawSvgs = (tableId, coordinates) => {
    let nextTables = [...data.tables];
    const tableIndex = nextTables.findIndex(({ id }) => id == tableId);
    nextTables[tableIndex] = {
      ...nextTables[tableIndex],
      coordinates: coordinates
    };
    const nextData = { ...data, tables: nextTables };
    setData(nextData);
  };

  const onTableDrag = ({ tableId, coordinates }) => {
    reDrawSvgs(tableId, coordinates);
  };

  const tableOptions = useMemo(() => getTableOptions(data.tables || []), [
    data.tables
  ]);

  const tableFieldsOptions = useMemo(
    () => getTableFieldsOptions(data.tables || []),
    [data.tables]
  );

  const onEditorChange = (event, editor) => {
    const data = editor.getData();
  };

  const onEditorBlur = (event, editor) => {
    const data = editor.getData();
    setDescription(data);
  };

  const submitAddDescription = () => {
    const index = data.tables.findIndex(table => table.id === tableEditing.id);
    const nextTables = [...data.tables];
    const nextTable = { ...tableEditing, description };
    nextTables[index] = nextTable;
    const nextData = {
      ...data,
      tables: nextTables
    };
    setData(nextData);
    setTableEditing(nextTable);
  };

  const onSelectTableEditing = table => {
    setRefsEditing(data.refs.filter(ref => ref.id === table.id));
    setTableEditing(table);
  };

  const onSettingsChange = propChange => {
    setData({ ...data, settings: { ...data.settings, ...propChange } });
  };

  const onTableSettingsChange = (tableId, settingChanged) => {
    const indexChanged = data.tables.findIndex(table => table.id === tableId);
    if (indexChanged !== -1) {
      const nextTables = [...data.tables];
      const tableChanged = nextTables[indexChanged];
      nextTables[indexChanged] = {
        ...tableChanged,
        settings: { ...tableChanged.settings, ...settingChanged }
      };
      const nextData = {
        ...data,
        tables: nextTables
      };

      setData(nextData);
    }
  };

  return (
    <div className='App'>
      <div className='left-tool-bar'>
        <div className='button-group'>
          <Upload beforeUpload={onImportFile} fileList={[]}>
            <Button type='primary'>
              <Icon type='upload' /> Import
            </Button>
          </Upload>
          <Button
            type='primary'
            className='button-group__import'
            onClick={() => exportToJsonFile()}>
            <Icon type='export' />
            Export
          </Button>
          <Button type='primary' onClick={() => setVisible(true)}>
            <Icon type='plus' /> Description
          </Button>
        </div>
        <Drawer
          title='Table Description'
          width={520}
          onClose={() => setVisible(false)}
          visible={visible}
          bodyStyle={{ paddingBottom: 80 }}
          placement='left'
          maskClosable={false}>
          <div className='ck_editor-container'>
            <CKEditor
              editor={DecoupledEditor}
              onInit={editor => {
                editor.ui
                  .getEditableElement()
                  .parentElement.insertBefore(
                    editor.ui.view.toolbar.element,
                    editor.ui.getEditableElement()
                  );
              }}
              data={tableEditing.description || ''}
              onChange={(event, editor) => onEditorChange(event, editor)}
              onBlur={(event, editor) => onEditorBlur(event, editor)}
            />
            <Button
              type='primary'
              className='submit-description'
              onClick={() => submitAddDescription()}>
              Submit
            </Button>
          </div>
        </Drawer>
        <Form
          tables={data.tables}
          handleAddTable={handleAddTable}
          tableEditing={tableEditing}
          refs={data.refs}
          refsEditing={refsEditing}
          onSelectTableEditing={onSelectTableEditing}
          handleUpdateTable={handleUpdateTable}
          tableOptions={tableOptions}
          tableFieldsOptions={tableFieldsOptions}
        />
      </div>
      <SvgContainer
        data={data}
        onSelectTableEditing={onSelectTableEditing}
        onTableDrag={onTableDrag}
        onSettingsChange={onSettingsChange}
        onTableSettingsChange={onTableSettingsChange}
      />
    </div>
  );
}

export default App;
