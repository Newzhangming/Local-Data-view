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
    try {
      const result = await userService.login(formData);
      console.log('登录响应:', result);

      if (result.data?.token) {
        // 1. 存入 localStorage（原有逻辑）
        setStorage('token', result.data.token);

        // 2. 存入 Cookie（原生方式，供中间件读取）
        const maxAge = 7 * 24 * 3600; // 7天，单位秒
        const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
        document.cookie = `token=${result.data.token}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;

        // 3. 跳转到客户页面
        router.replace('/customer', { scroll: false });
        messageApi.success('登录成功', 2);
      } else {
        messageApi.error(result.msg || '用户名或密码错误', 3);
      }
    } catch (error) {
      messageApi.error('请求失败，请检查网络', 3);
    } finally {
      setLoading(false);
    }
  }, [messageApi, router]);

  return (
    <>
      {contextHolder}
      <LoginForm<UserReq>
        logo={'https://tse4.mm.bing.net/th/id/OIP.Mbq2kHHiODLO6TL1vZrs9gHaG3?rs=1&pid=ImgDetMain&o=7&rm=3'}
        onFinish={getRequestData}
        title={process.env.NEXT_PUBLIC_APP_NAME}
        subTitle="储存信息用的"
        actions={undefined}
        loading={loading}
      >
        <ProFormText
          name="name"
          fieldProps={{ size: 'large', prefix: <UserOutlined className={'prefixIcon'} /> }}
          placeholder={'请输入用户名'}
          rules={[{ required: true, message: '请输入用户名' }]}
        />
        <ProFormText.Password
          name="password"
          fieldProps={{
            size: 'large',
            prefix: <LockOutlined className={'prefixIcon'} />,
            strengthText: '建议密码要包含数字与字符, 至少有6位长度',
            statusRender: (value) => {
              const getStatus = () => {
                if (value && value.length > 12) return 'ok';
                if (value && value.length > 6) return 'pass';
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