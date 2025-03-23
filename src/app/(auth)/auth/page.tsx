'use client';

import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { message, theme } from 'antd';
import { useRouter } from 'next/navigation';
import React, { useCallback, useState } from 'react';

import { UserReq } from '@/constants/user';
import { UserService } from '@/services/user';
import { setStorage } from '@/utils/storage';

const userService = new UserService();

export default function Page() {
  const { token } = theme.useToken();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  const getRequestData = useCallback(async (formData: UserReq) => {
    setLoading(true);
    const result = await userService.login(formData);
    if (!result || !result.data) {
      messageApi.error('服务器错误', 3);
      setLoading(false);
    }
    if (result.msg !== 'success') {
      messageApi.error(result.msg || '用户名或密码错误', 3);
      setLoading(false);
    }
    if (result.data?.token) {
      setStorage('token', result.data.token);
      router.replace('/project', { scroll: false });
      messageApi.success('登录成功', 2);
      setLoading(false);
    }
  }, []);

  return (
    <>
      {contextHolder}
      <LoginForm<UserReq>
        logo={'https://images.unsplash.com/photo-1534239697798-120952b76f2b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1280&q=80'}
        onFinish={getRequestData}
        title={process.env.NEXT_PUBLIC_APP_NAME}
        subTitle="您要找的建筑项目、建筑公司和高级项目经理都在这儿"
        actions={undefined}
        loading={loading}
      >
        <ProFormText name="name" fieldProps={{ size: 'large', prefix: <UserOutlined className={'prefixIcon'} /> }} placeholder={'请输入用户名'} rules={[{ required: true, message: '请输入用户名' }]} />
        <ProFormText.Password
          name="password"
          fieldProps={{
            size: 'large',
            prefix: <LockOutlined className={'prefixIcon'} />,
            strengthText: '建议密码要包含数字与字符, 至少有6位长度',
            statusRender: (value) => {
              const getStatus = () => {
                if (value && value.length > 12) {
                  return 'ok';
                }
                if (value && value.length > 6) {
                  return 'pass';
                }
                return 'poor';
              };
              const status = getStatus();
              if (status === 'pass') {
                return <div style={{ color: token.colorWarning }}>强度：中</div>;
              }
              if (status === 'ok') {
                return <div style={{ color: token.colorSuccess }}>强度：强</div>;
              }
              return <div style={{ color: token.colorError }}>强度：弱</div>;
            },
          }}
          placeholder={'请输入密码'}
          rules={[{ required: true, message: '请输入密码' }]}
        />
      </LoginForm>
    </>
  );
}
