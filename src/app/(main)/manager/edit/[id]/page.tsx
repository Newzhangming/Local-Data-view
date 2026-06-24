'use client';

import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { ProForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback } from 'react';
import { CustomerService } from '@/services/customer';
import { CustomerDto } from '@/constants/customer';

const customerService = new CustomerService();

export default function CustomerEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string; // 例如 /customer/edit/123 或 /customer/edit/new
  const isNew = id === 'new';

  // 加载数据的 request 函数（类似 ManagerEdit）
  const request = useCallback(async () => {
    if (isNew) {
      // 新增时返回空对象（或默认值）
      return {
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state_province: '',
        postal_code: '',
        country: '',
        level: 'D',
        status: 'active',
        source: '',
        remark: '',
        language: 'en',
        timezone: 'UTC',
      };
    }
    // 编辑时按 ID 查询
    const res = await customerService.queryCustomer({ id });
    if (res.code === 0) {
      return res.data;
    }
    throw new Error(res.msg || '加载失败');
  }, [id, isNew]);

  // 提交处理
  const onFinish = useCallback(
    async (values: CustomerDto) => {
      try {
        if (isNew) {
          await customerService.createCustomer(values);
        } else {
          // 更新时需要传入 ID
          await customerService.updateCustomer({ id, ...values });
        }
        router.push('/customer');
      } catch (error: any) {
        throw new Error(error?.message || '保存失败');
      }
    },
    [id, isNew, router]
  );

  // 自定义表单样式（保留你原有的卡片风格）
  const formStyle = {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    border: '1px solid #f3f4f6',
    padding: '24px',
  };

  // 字段布局（每行两列，使用 ProForm.Group）
  const groupStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '20px',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* 头部（返回 + 保存按钮） */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 transition"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>返回</span>
          </button>
          <div className="flex-1" />
          {/* 保存按钮由 ProForm 的 submitter 控制，这里可隐藏或用 ProForm 自带的 */}
        </div>

        {/* 表单卡片 */}
        <div style={formStyle}>
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h1 className="text-xl font-semibold text-gray-800">
              {isNew ? '新增客户' : '编辑客户'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              填写客户信息，带 <span className="text-red-500">*</span> 为必填
            </p>
          </div>

          <ProForm
            request={request}
            onFinish={onFinish}
            submitter={{
              // 自定义提交按钮（放在卡片底部或其他位置）
              render: (props) => (
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    onClick={props.submit}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm disabled:opacity-50"
                  >
                    <CheckIcon className="w-5 h-5" />
                    保存
                  </button>
                </div>
              ),
            }}
            // 让 ProForm 不自动包裹额外样式，我们完全控制布局
            grid={false}
            layout="vertical"
          >
            {/* 客户名称（必填） */}
            <ProFormText
              name="name"
              label="客户名称"
              rules={[{ required: true, message: '请填写客户名称' }]}
              placeholder="请输入客户名称"
              fieldProps={{ className: 'w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500' }}
            />

            {/* 两列布局 */}
            <div style={groupStyle}>
              <ProFormText
                name="contact_person"
                label="联系人"
                placeholder="请输入联系人"
                fieldProps={{ className: 'w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500' }}
              />
              <ProFormText
                name="phone"
                label="电话"
                placeholder="请输入电话"
                fieldProps={{ className: 'w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500' }}
              />
            </div>

            <ProFormText
              name="email"
              label="邮箱"
              placeholder="请输入邮箱"
              fieldProps={{ className: 'w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500' }}
            />

            <ProFormText
              name="address_line1"
              label="地址第一行"
              placeholder="请输入地址"
              fieldProps={{ className: 'w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500' }}
            />

            <ProFormText
              name="address_line2"
              label="地址第二行"
              placeholder="请输入地址（选填）"
              fieldProps={{ className: 'w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500' }}
            />

            <div style={groupStyle}>
              <ProFormText
                name="city"
                label="城市"
                placeholder="请输入城市"
                fieldProps={{ className: 'w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500' }}
              />
              <ProFormText
                name="state_province"
                label="州/省"
                placeholder="请输入州/省"
                fieldProps={{ className: 'w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500' }}
              />
            </div>

            <div style={groupStyle}>
              <ProFormText
                name="postal_code"
                label="邮政编码"
                placeholder="请输入邮编"
                fieldProps={{ className: 'w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500' }}
              />
              <ProFormText
                name="country"
                label="国家"
                placeholder="请输入国家"
                fieldProps={{ className: 'w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500' }}
              />
            </div>

            <div style={groupStyle}>
              <ProFormSelect
                name="level"
                label="客户等级"
                valueEnum={{
                  A: 'A级',
                  B: 'B级',
                  C: 'C级',
                  D: 'D级',
                }}
                placeholder="请选择等级"
                fieldProps={{ className: 'w-full border border-gray-200 rounded-lg px-3 py-2' }}
              />
              <ProFormSelect
                name="status"
                label="状态"
                valueEnum={{
                  active: '启用',
                  inactive: '停用',
                }}
                placeholder="请选择状态"
                fieldProps={{ className: 'w-full border border-gray-200 rounded-lg px-3 py-2' }}
              />
            </div>

            <ProFormText
              name="source"
              label="客户来源"
              placeholder="请输入来源"
              fieldProps={{ className: 'w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500' }}
            />

            <ProFormTextArea
              name="remark"
              label="备注"
              placeholder="请输入备注"
              fieldProps={{ rows: 3, className: 'w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500' }}
            />

            <div style={groupStyle}>
              <ProFormText
                name="language"
                label="语言偏好"
                placeholder="如 zh-CN"
                fieldProps={{ className: 'w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500' }}
              />
              <ProFormText
                name="timezone"
                label="时区"
                placeholder="如 Asia/Shanghai"
                fieldProps={{ className: 'w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500' }}
              />
            </div>
          </ProForm>
        </div>
      </div>
    </div>
  );
}