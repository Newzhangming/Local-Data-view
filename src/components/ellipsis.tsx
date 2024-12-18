import { Tooltip, Typography } from "antd";
import React from "react";

const { Paragraph } = Typography;

export default function Ellipsis(props: { text: string, lines?: number }) {
  const { text, lines } = props;
  if (!text) return null;
  return (
    <Tooltip title={props.text}>
      <Paragraph copyable ellipsis={{ rows: lines || 2 }}>
        {text}
      </Paragraph>
    </Tooltip>
  );
}
