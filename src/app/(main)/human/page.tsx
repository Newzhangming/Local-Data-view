"use client";
import { ProForm, ProFormTextArea } from '@ant-design/pro-components';
import { useState } from "react";

import { HumanReq, HumanResp } from "@/constants/dto";
import { queryHuman } from "@/services/human";

export default function Page() {
  const [result, setResult] = useState<HumanResp>({ role:'', content:'' });
  return (
    <>
      <ProForm
        onFinish={async (values: HumanReq) => {
          const result = await queryHuman(values);
          setResult(result.data);
        }}
      >
        <ProFormTextArea
          placeholder={"{\"address\":\"南宁市西乡塘区高新大道以南、发展大道以东3街\"}"}
          fieldProps={{ autoSize: { minRows: 5 } }}
          name="content"
          label={<span className={'text-lg'}>{`请输入建筑师JSON结构，调用 LLM 来验证信息是否准确。如：{"address":"南宁市西乡塘区高新大道以南、发展大道以东3街"}`}</span>}/>
      </ProForm>
      <div className={'flex mt-2 text-base'}>
        <h1>结果：</h1>
        <span>{result?.content || '未知'}</span>
      </div>
    </>
  );
}
