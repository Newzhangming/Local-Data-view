"use client";
import { ProForm, ProFormTextArea } from '@ant-design/pro-components';
import { useState } from "react";

import { HumanReq, ManagerResp } from "@/constants/dto";
import { queryHuman } from "@/services/manager";

export default function Page() {
  const [result, setResult] = useState<ManagerResp[]>([]);
  return (
    <>
      <ProForm
        onFinish={async (values: HumanReq) => {
          const result = await queryHuman(values);
          setResult(result.data);
        }}
      >
        <ProFormTextArea
          placeholder={"{\"address\":\"请输入项目JSON结构，调用 LLM 来验证信息是否准确\"}"}
          fieldProps={{ autoSize: { minRows: 5 } }}
          name="content"
          label={<span className={'text-lg'}>{`请输入项目JSON结构，调用 LLM 来验证信息是否准确`}</span>}/>
      </ProForm>
      <div className={'flex mt-2 text-base'}>
        <div className={'ml-2 flex-col'}>
          {result.map((item, index) => {
            if (item.msg) {
              let emoji = item.result ? '✅️' : '❌';
              if (item.result && item.msg.indexOf('注意') > -1) {
                emoji = '⚠️';
              }
              return (
                <div key={index}>{item.msg} {emoji}</div>
              );
            }
          })}
        </div>
      </div>
    </>
  );
}
