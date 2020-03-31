import { Form, Input, Icon, Button, Row, Col, Select, Checkbox } from 'antd';
import React, { Component, Fragment } from 'react';
const FormItem = Form.Item;
const Option = Select.Option;

export const DbValueTypes = ['string', 'number', 'date'];

const valueTypes = DbValueTypes
  ? DbValueTypes.map((valType, index) => {
      return (
        <Option key={index} value={valType}>
          {valType}
        </Option>
      );
    })
  : null;

class Fields extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: [0],
      formProperty: {},
      id: 0
    };
  }

  remove = (k, index) => {
    const { form } = this.props;
    const Fields = form.getFieldValue('Fields');

    form.setFieldsValue({
      Fields: Fields.filter(key => key !== k)
    });
    if (this.state.fields && this.state.fields.length) {
      let colRemove = this.state.fields[index];
      this.setState({
        fields: this.state.fields.filter(col => col !== colRemove)
      });
    }
  };

  add = () => {
    const { form } = this.props;
    const Fields = form.getFieldValue('Fields');
    let id = this.state.id + 1;
    const nextKeys = Fields.concat(id);
    form.setFieldsValue({
      Fields: nextKeys
    });
    this.setState({
      id: id
    });
  };

  componentDidMount() {
    if (this.props.fields)
      this.setState({
        fields: this.props.fields,
        id: this.props.fields.length
      });
  }

  componentWillReceiveProps(nexpProps) {
    if (JSON.stringify(nexpProps.fields) != JSON.stringify(this.props.fields)) {
      this.setState(
        {
          fields: nexpProps.fields,
          id: nexpProps.fields.length
        },
        () => {
          this.props.form.setFieldsValue({
            Fields: nexpProps.fields.map((col, index) => {
              return index;
            })
          });
          this.setState({
            formProperty: {
              trigger: 'onBlur',
              valuePropName: 'defaultValue'
            }
          });
        }
      );
    }
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    let { formProperty, fields } = this.state;
    let initFields = fields
      ? fields.map((col, index) => {
          return index;
        })
      : [];
    getFieldDecorator('Fields', { initialValue: initFields });
    const Fields = getFieldValue('Fields');
    const formItems = Fields.map((k, index) => {
      return (
        <Row className='field-item' type='flex' gutter={48} key={k}>
          <Col span={24}>
            <FormItem label={'Field Name'} required={false}>
              {getFieldDecorator(`fields[${k}].name`, {
                validateTrigger: ['onBlur'],
                initialValue:
                  fields[index] && fields[index].fieldName
                    ? fields[index].fieldName
                    : '',
                ...formProperty,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: 'Please input or delete this field.'
                  }
                ]
              })(<Input placeholder='column name' />)}
            </FormItem>
          </Col>

          <Col span={24}>
            <FormItem
              className='last-form-item'
              label={'Field Type'}
              required={false}>
              {getFieldDecorator(`fields[${k}].type`, {
                validateTrigger: ['onBlur'],
                initialValue:
                  fields[index] && fields[index].type ? fields[index].type : '',
                ...formProperty,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: 'Please input or delete this field.'
                  }
                ]
              })(<Select>{valueTypes}</Select>)}
              <Icon
                className='dynamic-delete-button'
                type='minus-circle-o'
                onClick={() => this.remove(k, index)}
              />
            </FormItem>
          </Col>
        </Row>
      );
    });
    return (
      <div>
        <FormItem>
          <Button type='dashed' onClick={this.add}>
            <Icon type='plus' /> Add Field
          </Button>
        </FormItem>
        {formItems}
      </div>
    );
  }
}

export default Fields;
