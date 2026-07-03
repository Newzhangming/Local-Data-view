'use client';

import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { message, theme } from 'antd';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

import { UserReq } from '@/constants/user';
import { UserService } from '@/services/user';
import { setStorage } from '@/utils/storage';

const userService = new UserService();

export default function AuthContent() {
  const { token } = theme.useToken();
  const searchParams = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  // 页面加载时检查 URL 参数并显示提示
  useEffect(() => {
    const reason = searchParams.get('reason');
    console.log('[LoginPage] reason:', reason);
    if (reason === 'kicked') {
      messageApi.error('您的账号已在其他设备登录，请重新登录', 5);
    } else if (reason === 'expired') {
      messageApi.error('登录已过期，请重新登录', 5);
    }
  }, [searchParams, messageApi]);

  const getRequestData = useCallback(async (formData: UserReq) => {
    setLoading(true);
    try {
      const result = await userService.login(formData);
      if (result.data?.token) {
        // 存储到 localStorage
        setStorage('token', result.data.token);
        
        // 写入 cookie，动态判断是否使用 Secure 属性
        const maxAge = 7 * 24 * 3600;
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `token=${result.data.token}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;

        messageApi.success('登录成功', 2);
        
        // 强制跳转到 /customer，确保 cookie 写入完成
        window.location.replace('/customer');
      } else {
        messageApi.error(result.msg || '用户名或密码错误', 3);
      }
    } catch (error) {
      messageApi.error('请求失败，请检查网络', 3);
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

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