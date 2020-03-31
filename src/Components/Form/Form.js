import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Form, Input, Button } from 'antd';
import './form.css';
import DynamicField from './DynamicField';
import DynamicRef from './DynamicRef';
import uuidv1 from 'uuid/v1';
import { Select } from 'antd';
const { Option } = Select;

const TableForm = props => {
  const {
    form,
    handleAddTable,
    handleUpdateTable,
    tableEditing,
    refsEditing,
    onSelectTableEditing,
    tableOptions,
    tableFieldsOptions,
    tables
  } = props;

  const { name, fields, coordinates, id, description } = tableEditing;
  const initCoordinates = { x: '100', y: '100' };
  const { getFieldDecorator, validateFields, getFieldsValue } = form;
  const [rerender, setRerender] = useState(false);

  useEffect(() => {
    setRerender(true);
  }, [id]);

  useEffect(() => {
    if (rerender === true) setRerender(false);
  });

  const handleSubmit = e => {
    e.preventDefault();
    validateFields((err, values) => {
      if (!err) {
        const tableId = id ? id : uuidv1();
        let fieldsNotNull = values.fields.filter(field => {
          if (field) return field;
        });

        let totalFields = [
          ...fieldsNotNull.map(field => ({
            fieldName: field.name,
            type: field.type,
            isFK: field.isHaveRef,
            refToTable: field.toTable,
            isPK: field.name === 'id'
          }))
        ];

        const newSettings = id ? tableEditing.settings : { width: 250 };

        let newTable = {
          id: tableId,
          name: values.tableName,
          fields: totalFields,
          coordinates: !id ? initCoordinates : coordinates,
          description: description ? description : '',
          settings: newSettings
        };

        let newRefs = values.refs
          ? values.refs
              .filter(ref => !!ref)
              .map(ref => ({
                id: tableId,
                toId: tables.find(table=>table.name === ref.to.toField.split('-')[0]).id,
                ...ref
              }))
          : [];

        const newData = { newTable, newRefs };
        !id ? handleAddTable(newData) : handleUpdateTable(newData);
        form.resetFields();
      }
    });
  };

  const tableFields = getFieldsValue().fields;
  const tableName = getFieldsValue().tableName;
  const getFieldOptions = tableFields => {
    return tableFields.map(({ name }, index) => {
      if (name)
        return (
          <Option key={index} value={`${tableName}-${name}`}>
            {`${tableName}-${name}`}
          </Option>
        );
    });
  };

  const fieldsOptions = useMemo(() => getFieldOptions(tableFields || []), [
    JSON.stringify(tableFields),
    tableName,
    tableEditing.name
  ]);

  return (
    <div className='add-table-form'>
      {rerender === false && (
        <Form onSubmit={handleSubmit}>
          <Form.Item label='Table Name'>
            {getFieldDecorator('tableName', {
              initialValue: name ? name : '',
              rules: [
                {
                  required: true,
                  message: 'Please input or delete this field.'
                }
              ]
            })(<Input />)}
          </Form.Item>
          <DynamicField
            form={form}
            tableOptions={tableOptions}
            fields={fields}
          />
          <DynamicRef
            form={form}
            tableFieldsOptions={tableFieldsOptions}
            fieldsOptions={fieldsOptions}
            fields={fields}
            refsEditing={refsEditing}
          />
          <Form.Item className='flex-center'>
            <Button
              type='primary'
              onClick={() => onSelectTableEditing({ fields: [] })}>
              New Table
            </Button>
            <Button type='primary' htmlType='submit' style={{ marginLeft: 20 }}>
              {tableEditing.id ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

const WrappedTableForm = Form.create({ name: 'TableForm' })(TableForm);

const MemoFormWraped = React.memo(
  WrappedTableForm,
  (prevProps, nextProps) => prevProps == nextProps
);
export default MemoFormWraped;
