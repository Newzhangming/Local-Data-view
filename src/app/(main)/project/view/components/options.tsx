import { RadioGroupProps, Tag } from 'antd';

export const conclusionOptions: RadioGroupProps['options'] = [
  { value: 'pass', label: <Tag color="green">通过</Tag> },
  { value: 'pending', label: <Tag color="orange">待补充材料</Tag> },
  { value: 'scrap', label: <Tag color="red">废弃</Tag> },
];
