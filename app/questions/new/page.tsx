'use client';
import { useState, useRef } from 'react';
import axios from 'axios';
import { Button, Checkbox, Flex, Form, Input, Modal } from 'antd';
import { FaTrash } from 'react-icons/fa6';

const MIN_RECOMMENDED_CHOICES: number = 4;

export default function NewQuestionPage() {
  const [correctKeys, setCorrectKeys] = useState<number[]>([]);
  const minChoiceBypassed = useRef(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalMessage, setModalMessage] = useState<string>('');

  function handleCheckbox(isChecked: boolean, key: number) {
    if (isChecked) {
      if (correctKeys.findIndex((k) => k === key) === -1) {
        // Answer choice marked correct but not in correctKeys
        setCorrectKeys([...correctKeys, key]);
      }
    } else {
      setCorrectKeys([...correctKeys].filter((k) => k !== key));
    }
  }

  async function handleFinish(finalData: any) {
    console.log(finalData);
    const response = await axios({
      method: 'post',
      url: 'http://localhost:3000/api/questions',
      data: { ...finalData },
    });
    console.log(response);
  }

  function validate(data: any) {
    if (correctKeys.length !== 1) {
      // Do not allow submission with more or less that 1 correct answer on SINGLE_BEST_ANSWER types.
      setModalTitle('Please review correct answers');
      setModalMessage(
        'Exactly one correct answer choice must be indicated for single best answer questions.'
      );
      setModalOpen(true);
      return;
    }

    if (data.choices.length < 1) {
      // Do not allow submission with no answer choices.
      return;
    }
    if (data.choices.length < MIN_RECOMMENDED_CHOICES && !minChoiceBypassed.current) {
      // Soft rejection. Prompt user to have at least minimum number of choices.
      console.log('Bypassing min number');
      minChoiceBypassed.current = true;
      return;
    }

    // TODO: Add soft rejections for 1) empty answer explanations, 2) empty question explanation, and 3) empty question summary.

    handleFinish({ ...data, correct_keys: correctKeys, type: 'SINGLE_BEST_ANSWER' });
  }

  return (
    <>
      <Modal
        footer={[
          <Button
            key="back"
            onClick={() => setModalOpen(false)}>
            Close
          </Button>,
        ]}
        onOk={() => setModalOpen(false)}
        onCancel={() => setModalOpen(false)}
        open={modalOpen}
        title={modalTitle}>
        {modalMessage}
      </Modal>
      <Form
        autoComplete="off"
        className="max-w-screen-lg flex-1"
        layout="vertical"
        onFinish={validate}
        name="new_question">
        <Form.Item
          hasFeedback
          label="Stem"
          name="stem"
          rules={[{ required: true, message: 'Question stem cannot be empty.' }]}>
          <Input.TextArea />
        </Form.Item>
        <Form.Item label="Choices">
          <Form.List name="choices">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Flex
                    key={key}
                    align="center"
                    gap={12}>
                    <Form.Item>
                      <Checkbox
                        onChange={({ target }) => handleCheckbox(target.checked, key)}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      className="flex-1"
                      hasFeedback
                      name={[name, 'content']}
                      rules={[
                        {
                          required: true,
                          message: 'Answer choice cannot be empty.',
                        },
                      ]}>
                      <Input />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      className="flex-1"
                      hasFeedback
                      name={[name, 'explanation']}
                      rules={[
                        {
                          required: true,
                          warningOnly: true,
                          message: 'Consider adding an explanation.',
                        },
                      ]}>
                      <Input placeholder="Explanation" />
                    </Form.Item>
                    <Form.Item>
                      <Button
                        danger
                        icon={<FaTrash />}
                        onClick={() => remove(name)}
                        shape="circle"
                      />
                    </Form.Item>
                  </Flex>
                ))}
                <Form.Item className="flex justify-center">
                  <Button
                    className="items-self-center"
                    onClick={() => add()}>
                    Add choice
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>
        <Form.Item
          hasFeedback
          label="Summary"
          name="summary"
          rules={[
            {
              required: true,
              warningOnly: true,
              message: 'Consider adding a summary.',
            },
          ]}>
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          hasFeedback
          label="Explanation"
          name="explanation"
          rules={[
            {
              required: true,
              warningOnly: true,
              message: 'Consider adding an explanation.',
            },
          ]}>
          <Input.TextArea />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit">Submit</Button>
        </Form.Item>
      </Form>
    </>
  );
}
