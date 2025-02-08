import { Typography } from 'antd';
import React from 'react';

const { Paragraph } = Typography;

export default function Copyable(props: { content: string | number | undefined; link?: string; target?: string }) {
  const { content, link, target = '_self' } = props;
  if (!content) return null;
  if (content && link) {
    return (
      <Paragraph copyable={{ text: `${content}` }}>
        <a href={link} target={target}>
          {content}
        </a>
      </Paragraph>
    );
  }
  return <Paragraph copyable>{content}</Paragraph>;
}
