'use client';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { Button, Checkbox, Flex, Form, Input, Modal, message } from 'antd';
import { FaTrash } from 'react-icons/fa6';

const MIN_RECOMMENDED_CHOICES: number = 4;

type QuestionFormProps = {
    questionId: string;
};

export default function QuestionForm({ questionId }: QuestionFormProps) {
    const [questionForm] = Form.useForm();
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [modalMessage, setModalMessage] = useState('')
    const [messageApi, contextHolder] = message.useMessage();

    async function handleFinish() {
      setModalOpen(false);
      const data = questionForm.getFieldsValue(true)
      const correctKeys: number[] = []
      data.choices.forEach((choice: any, i: number) => {
        if (choice.isChecked) {
          correctKeys.push(i)
        }
      })
      const refactoredChoices = data.choices.map(choice => {
        delete choice.isChecked;
        return choice;
      })
      console.log('test')
      // messageApi.open({
      //     key: 'FORM_SUBMITTED',
      //     type: 'loading',
      //     content: 'Loading...',
      // });
      // const response = await axios({
      //     method: 'post',
      //     url: 'http://localhost:3000/api/questions',
      //     data: { ...data, choices: refactoredChoices, correct_keys: correctKeys, type: 'SINGLE_BEST_ANSWER' },
      // });

      // if (response.status === 201) {
      //     messageApi.open({
      //         key: 'FORM_SUBMITTED',
      //         type: 'success',
      //         content: 'Question added.',
      //     });
      // }
    }

    function validate() {
        if (questionForm.getFieldValue('choices')!.length < MIN_RECOMMENDED_CHOICES) {
          // Soft rejection. Prompt user to have at least minimum number of choices.
          setModalMessage('It is recommended to have at least four answer choices. Would you like to continue?')
          setModalOpen(true)
        } else {
            const test = questionForm.getFieldsError(['summary', 'explanation'])
            let test1 = false
            test.forEach((item) => {
              console.log(item)
              if (item.warnings.length > 0) {
                test1 = true
              }
            })
            if (test1) {
              setModalMessage('It is recommended to have an explanation for each answer item as well as an explanation and summary for the question. Would you like to continue?')
              setModalOpen(true)
            } else {
              handleFinish();
            }
          }
    }

    return (
        <>
            {contextHolder}
            <Modal
                onOk={handleFinish}
                onCancel={() => setModalOpen(false)}
                open={modalOpen}
                title='Hold on...'>
                {modalMessage}
            </Modal>
            <Form
                autoComplete="off"
                className="max-w-screen-lg flex-1"
                form={questionForm}
                layout="vertical"
                onFinish={validate}
                name="new_question">
                <Form.Item
                    hasFeedback
                    initialValue=""
                    label="Stem"
                    name="stem"
                    rules={[{ required: true, message: 'Question stem cannot be empty.' }]}>
                    <Input.TextArea />
                </Form.Item>
                <Form.Item label="Choices">
                    <Form.List
                        initialValue={[]}
                        name="choices"
                        rules={[
                          {
                            validator: async (_, choices) => {
                              if (choices.length < 2) {
                                return Promise.reject(new Error('At least 2 choices required.'));
                              }
                              if (choices.findIndex((i: any) => i.isChecked === true) === -1) {
                                return Promise.reject(new Error('At least one correct choice required.'));
                              }
                            },
                            // @ts-ignore
                            validateTrigger: "onSubmit"
                          }
                        ]}>
                        {(fields, { add, remove }, { errors }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Flex
                                        key={key}
                                        align="center"
                                        gap={12}>
                                        <Form.Item
                                            {...restField}
                                            initialValue={false}
                                            name={[name, 'isChecked']}
                                            valuePropName="checked">
                                            <Checkbox />
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
                                            initialValue=""
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
                                    <Button onClick={() => add()}>Add choice</Button>
                                </Form.Item>
                                <Form.ErrorList errors={errors} />
                            </>
              )}
              
                    </Form.List>
                </Form.Item>
                <Form.Item
                    hasFeedback
                    initialValue=""
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
                    initialValue=""
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
                <Form.Item className="flex justify-center">
                    <Button
                        htmlType="submit"
                        type="primary">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
}
