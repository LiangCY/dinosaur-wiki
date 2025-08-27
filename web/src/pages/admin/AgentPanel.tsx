import React from 'react';
import { Card, Button, Space } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';

interface AgentPanelProps {
  setResearchModalVisible: (visible: boolean) => void;
}

const AgentPanel: React.FC<AgentPanelProps> = ({ setResearchModalVisible }) => {
  return (
    <div>
      <Card title="AI Agent 控制" style={{ marginBottom: 24 }}>
        <Space wrap>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => setResearchModalVisible(true)}
          >
            研究恐龙
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default AgentPanel;