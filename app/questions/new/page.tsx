'use client';
import { Button, Checkbox, Flex, Form, Input } from 'antd';

export default function NewQuestionPage() {
  return (
    <>
      <Form
        autoComplete="off"
        name="new_question">
        <Form.Item label="Stem">
          <Input.TextArea />
        </Form.Item>
        <Form.List name="choice">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Flex
                  key={key}
                  align="center"
                  gap="small">
                  <Form.Item>
                    <Checkbox />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'content']}>
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'explanation']}>
                    <Input />
                  </Form.Item>
                </Flex>
              ))}
              <Form.Item>
                <Button onClick={() => add()}>Add choice</Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </>
  );
}
