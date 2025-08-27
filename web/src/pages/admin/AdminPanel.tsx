import React, { useState, useEffect } from 'react';
import {
  Tabs,
  Form,
  Input,
  Modal,
  message,
  Space,
  Button,
} from 'antd';
import {
  RobotOutlined,
  DatabaseOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { dinosaurApi } from '../../services/api';
import type { Dinosaur } from '../../types/dinosaur';
import AgentPanel from './AgentPanel';
import DataPanel from './DataPanel';
import ImageManager from './ImageManager';

const { TabPane } = Tabs;

// 定义空接口，表示没有额外的属性
interface AdminPanelProps {}

const AdminPanel: React.FC<AdminPanelProps> = () => {
  const [dinosaurs, setDinosaurs] = useState<Dinosaur[]>([]);
  const [loading, setLoading] = useState(false);
  const [researchModalVisible, setResearchModalVisible] = useState(false);
  const [researchLoading, setResearchLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadDinosaurs();
  }, []);

  const loadDinosaurs = async () => {
    try {
      setLoading(true);
      const data = await dinosaurApi.getAllDinosaurs();
      setDinosaurs(data || []);
    } catch (error) {
      message.error('加载恐龙数据失败');
      console.error('Load dinosaurs error:', error);
    } finally {
      setLoading(false);
    }
  };

  const researchDinosaur = async (dinosaurName: string) => {
    try {
      setResearchLoading(true);
      const response = await fetch('/api/ai-agent/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dinosaur_name: dinosaurName }),
      });

      if (response.ok) {
        await response.json();
        message.success(`恐龙 ${dinosaurName} 研究完成`);
        loadDinosaurs();
        setResearchModalVisible(false);
        form.resetFields();
      } else {
        const error = await response.json();
        message.error(`研究失败: ${error.message}`);
      }
    } catch (error) {
      message.error('研究失败');
      console.error('Research dinosaur error:', error);
    } finally {
      setResearchLoading(false);
    }
  };



  return (
    <div>
      <Tabs defaultActiveKey="data" size="large">
        <TabPane
          tab={
            <span>
              <DatabaseOutlined />
              数据管理
            </span>
          }
          key="data"
        >
          <DataPanel
            dinosaurs={dinosaurs}
            loading={loading}
            loadDinosaurs={loadDinosaurs}
          />
        </TabPane>
        <TabPane
          tab={
            <span>
              <PictureOutlined />
              图片管理
            </span>
          }
          key="images"
        >
          <ImageManager dinosaurs={dinosaurs} />
        </TabPane>
        <TabPane
          tab={
            <span>
              <RobotOutlined />
              AI Agent
            </span>
          }
          key="agent"
        >
          <AgentPanel setResearchModalVisible={setResearchModalVisible} />
        </TabPane>
      </Tabs>

      {/* 研究恐龙模态框 */}
      <Modal
        title="研究新恐龙"
        open={researchModalVisible}
        onCancel={() => setResearchModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => researchDinosaur(values.dinosaurName)}
        >
          <Form.Item
            label="恐龙名称"
            name="dinosaurName"
            rules={[{ required: true, message: '请输入恐龙名称' }]}
          >
            <Input placeholder="例如：霸王龙、三角龙" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={researchLoading}
              >
                开始研究
              </Button>
              <Button onClick={() => setResearchModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPanel;
