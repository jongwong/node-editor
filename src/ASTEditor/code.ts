/** eslint-disable */
export const code1 = `
import React, { useState } from 'react';
import { Card, Input, Switch } from 'antd';
import type { ProDescriptionColumnType } from '@pupu/brick-pro';
import { ProDescriptions, toValEnumMap } from '@pupu/brick-pro';
import { EMPTY_TEXT } from 'src/constants';

interface DataType {
  name?: string;
  sex?: 1 | 2;
  age?: number;
  other?: Record<string, string>;
}
export default (): React.ReactElement => {
  const [editable, setEditable] = useState(true);
  const [user, setUser] = useState({
    name: '张三',
    sex: 1,
    age: 19,
    other: {
      love: '篮球、乒乓球',
    },
  });
  const useColumns: ProDescriptionColumnType<DataType>[] = [
    {
      label: '姓名',
      dataIndex: 'name',
      key: 'name',
      formItemProps: {
        required: true,
        rules: [{ required: true }],
      },
    },
    {
      label: '性别',
      dataIndex: 'sex',
      key: 'sex',
      formItemProps: {
        required: true,
        rules: [{ required: true }],
      },
      valueEnum: toValEnumMap([
        {
          value: 1,
          text: '男',
        },
        {
          value: 2,
          text: '女',
        },
      ]),
    },
  ];
  return (
    <Card
      extra={
        <Switch
          checked={editable}
          onChange={e => {
            setEditable(e);
          }}
          checkedChildren="编辑"
          unCheckedChildren="详情"
          defaultChecked
        />
      }
    >
      <ProDescriptions<DataType>
        editable={editable}
        columns={useColumns}
        dataSource={user}
        onChange={e => {
          console.log(e);
          setUser(e as any);
        }}
      />
    </Card>
  );
};
		`;

export const code2 = `import React, { useState } from 'react';`;
