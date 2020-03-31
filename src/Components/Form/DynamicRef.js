import { Form, Icon, Button, Row, Col, Select } from 'antd';
import React, { Component } from 'react';
const FormItem = Form.Item;

class Refs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refs: [],
      formProperty: {},
      id: 0
    };
  }

  remove = (k, index) => {
    const { form } = this.props;
    const Refs = form.getFieldValue('Refs');

    form.setFieldsValue({
      Refs: Refs.filter(key => key !== k)
    });
    if (this.state.refs && this.state.refs.length) {
      let colRemove = this.state.refs[index];
      this.setState({
        refs: this.state.refs.filter(col => col !== colRemove)
      });
    }
  };

  add = () => {
    const { form } = this.props;
    const Refs = form.getFieldValue('Refs');
    let id = this.state.id + 1;
    const nextKeys = Refs.concat(id);
    form.setFieldsValue({
      Refs: nextKeys
    });
    this.setState({
      id: id
    });
  };

  componentDidMount() {
    if (this.props.refsEditing)
      this.setState({
        refs: this.props.refsEditing,
        id: this.props.refsEditing.length
      });
  }

  componentWillReceiveProps(nexpProps) {
    if (
      JSON.stringify(nexpProps.refsEditing) !=
      JSON.stringify(this.props.refsEditing)
    ) {
      this.setState(
        {
          refs: nexpProps.refsEditing,
          id: nexpProps.refsEditing.length
        },
        () => {
          this.props.form.setFieldsValue({
            Refs: nexpProps.refsEditing.map((col, index) => {
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
    const { tableFieldsOptions, fieldsOptions } = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    let { formProperty, refs } = this.state;

    let initRefs = refs
      ? refs.map((ref, index) => {
          return index;
        })
      : [];

    getFieldDecorator('Refs', { initialValue: initRefs });
    const Refs = getFieldValue('Refs');
    const formItems = Refs.map((k, index) => {
      return (
        <Row className='field-item' type='flex' gutter={48} key={k}>
          <Col span={24}>
            <FormItem label={'From'} required={false}>
              {getFieldDecorator(`refs[${k}].from.fromField`, {
                validateTrigger: ['onBlur'],
                initialValue:
                  refs[index] && refs[index].from
                    ? refs[index].from.fromField
                    : '',
                ...formProperty,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: 'Please input or delete this field.'
                  }
                ]
              })(<Select>{fieldsOptions}</Select>)}
            </FormItem>
          </Col>

          <Col span={24}>
            <FormItem className='last-form-item' label={'To'} required={false}>
              {getFieldDecorator(`refs[${k}].to.toField`, {
                validateTrigger: ['onBlur'],
                initialValue:
                  refs[index] && refs[index].to ? refs[index].to.toField : '',
                ...formProperty,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: 'Please input or delete this field.'
                  }
                ]
              })(<Select>{tableFieldsOptions}</Select>)}
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
        <FormItem
        //  className='flex-center'
        >
          <Button type='dashed' onClick={this.add}>
            <Icon type='plus' /> Add Reference
          </Button>
        </FormItem>
        {formItems}
      </div>
    );
  }
}

export default Refs;
