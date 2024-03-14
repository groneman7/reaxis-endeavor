'use client';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Checkbox, Flex, Form, Input, Modal, message } from 'antd';
import { FaTrash } from 'react-icons/fa6';

const MIN_RECOMMENDED_CHOICES: number = 4;

type QuestionFormProps = {
    questionId?: string;
    isNew?: boolean;
};

export default function QuestionForm({ questionId, isNew }: QuestionFormProps) {
    const [questionForm] = Form.useForm();
    const [correctKeys, setCorrectKeys] = useState<number[]>([]);
    const minChoiceBypassed = useRef(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [modalTitle, setModalTitle] = useState<string>('');
    const [modalMessage, setModalMessage] = useState<string>('');
    const [messageApi, contextHolder] = message.useMessage();

    function handleCheckbox(isChecked: boolean, key: number) {
        if (isChecked) {
            if (correctKeys.findIndex((k) => k === key) === -1) {
                setCorrectKeys([...correctKeys, key]);
            }
        } else {
            setCorrectKeys([...correctKeys].filter((k) => k !== key));
        }
    }

    async function handleFinish(finalData: any) {
        messageApi.open({
            key: 'FORM_SUBMITTED',
            type: 'loading',
            content: 'Loading...',
        });
        const response = await axios({
            method: 'post',
            url: 'http://localhost:3000/api/questions',
            data: { ...finalData },
        });
        // console.log(response);
        if (response.status === 201) {
            messageApi.open({
                key: 'FORM_SUBMITTED',
                type: 'success',
                content: 'Question added.',
            });
        }
    }

    const test = Form.useWatch('choices', questionForm);
    console.log(test);

    // if (!isNew && questionId && questionId !== '') {
    //   // Prepopulate the form with the existing question.
    //   questionForm.setFieldsValue({...question})
    // }

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

        handleFinish({ ...data, correct_keys: correctKeys, type: 'SINGLE_BEST_ANSWER' });
    }

    return (
        <>
            {contextHolder}
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
                <Form.Item initialValue={[]} label="Choices">
                    <Form.List name="choices">
                        {(fields, { add, remove }) => (
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
                                            valuePropName="checked"
                                            >
                                            <Checkbox
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
