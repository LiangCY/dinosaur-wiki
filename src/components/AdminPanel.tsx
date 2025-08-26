import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Button,
  Table,
  Form,
  Input,
  Modal,
  message,
  Space,
  Tag,
  Popconfirm,
  Statistic,
  Row,
  Col,
  Alert,
  Typography,

  Select,
  InputNumber,
} from 'antd';
import {
  RobotOutlined,
  DatabaseOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SettingOutlined,
  PlayCircleOutlined,

  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { dinosaurApi } from '../services/api';
import type { Dinosaur } from '../types/dinosaur';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const { Option } = Select;

interface AdminPanelProps {
  onBack: () => void;
}

interface AgentConfig {
  openaiApiKey: string;
  tavilyApiKey: string;
  backendUrl: string;
  maxRetries: number;
  timeout: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

interface AgentStatus {
  initialized: boolean;
  config?: Partial<AgentConfig>;
  stats?: {
    totalDinosaurs: number;
    recentActivity: unknown[];
    systemStatus: unknown;
  };
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [dinosaurs, setDinosaurs] = useState<Dinosaur[]>([]);
  const [loading, setLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({ initialized: false });
  const [, ] = useState<Partial<AgentConfig>>({});
  const [researchModalVisible, setResearchModalVisible] = useState(false);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [researchLoading, setResearchLoading] = useState(false);
  const [form] = Form.useForm();
  const [configForm] = Form.useForm();

  useEffect(() => {
    loadDinosaurs();
    loadAgentStatus();
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

  const loadAgentStatus = async () => {
    try {
      const response = await fetch('/api/ai-agent/status');
      if (response.ok) {
        const data = await response.json();
        setAgentStatus(data);
      }
    } catch (error) {
      console.error('Load agent status error:', error);
    }
  };

  const initializeAgent = async (config: AgentConfig) => {
    try {
      const response = await fetch('/api/ai-agent/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        message.success('AI Agent 初始化成功');
        loadAgentStatus();
        setConfigModalVisible(false);
      } else {
        const error = await response.json();
        message.error(`初始化失败: ${error.message}`);
      }
    } catch (error) {
      message.error('初始化失败');
      console.error('Initialize agent error:', error);
    }
  };

  const testConnections = async () => {
    try {
      const response = await fetch('/api/ai-agent/test-connections');
      if (response.ok) {
        const data = await response.json();
        const { backend, tavily, openai, overall } = data;
        
        if (overall) {
          message.success('所有连接测试通过');
        } else {
          message.warning(`连接测试结果: 后端${backend ? '✓' : '✗'}, Tavily${tavily ? '✓' : '✗'}, OpenAI${openai ? '✓' : '✗'}`);
        }
      } else {
        message.error('连接测试失败');
      }
    } catch (error) {
      message.error('连接测试失败');
      console.error('Test connections error:', error);
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

  const deleteDinosaur = async (_id: string) => {
    try {
      // TODO: 实现删除API
      message.info('删除功能开发中...');
      // await dinosaurApi.deleteDinosaur(id);
      // loadDinosaurs();
    } catch (error) {
      message.error('删除失败');
      console.error('Delete dinosaur error:', error);
    }
  };

  const dinosaurColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: '学名',
      dataIndex: 'scientific_name',
      key: 'scientific_name',
      render: (text: string) => <Text italic>{text}</Text>,
    },
    {
      title: '时期',
      dataIndex: 'period',
      key: 'period',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '饮食',
      dataIndex: 'diet',
      key: 'diet',
      render: (text: string) => {
        const color = text === '肉食' ? 'red' : text === '草食' ? 'green' : 'orange';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Dinosaur) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              // TODO: 实现编辑功能
              message.info('编辑功能开发中...');
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个恐龙吗？"
            onConfirm={() => deleteDinosaur(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderAgentPanel = () => (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="AI Agent 状态"
              value={agentStatus.initialized ? '已初始化' : '未初始化'}
              prefix={agentStatus.initialized ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
              valueStyle={{ color: agentStatus.initialized ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="恐龙总数"
              value={agentStatus.stats?.totalDinosaurs || 0}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="最大重试次数"
              value={agentStatus.config?.maxRetries || 0}
              prefix={<ReloadOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="超时时间"
              value={`${(agentStatus.config?.timeout || 0) / 1000}s`}
              prefix={<SettingOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="AI Agent 控制" style={{ marginBottom: 24 }}>
        <Space wrap>
          <Button
            type="primary"
            icon={<SettingOutlined />}
            onClick={() => setConfigModalVisible(true)}
          >
            {agentStatus.initialized ? '更新配置' : '初始化 Agent'}
          </Button>
          <Button
            icon={<CheckCircleOutlined />}
            onClick={testConnections}
            disabled={!agentStatus.initialized}
          >
            测试连接
          </Button>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => setResearchModalVisible(true)}
            disabled={!agentStatus.initialized}
          >
            研究恐龙
          </Button>
        </Space>
      </Card>

      {!agentStatus.initialized && (
        <Alert
          message="AI Agent 未初始化"
          description="请先配置并初始化 AI Agent 才能使用研究功能。需要提供 OpenAI API Key 和 Tavily API Key。"
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}
    </div>
  );

  const renderDataPanel = () => (
    <div>
      <Card
        title="恐龙数据管理"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadDinosaurs}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />}>
              添加恐龙
            </Button>
          </Space>
        }
      >
        <Table
          columns={dinosaurColumns}
          dataSource={dinosaurs}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>
          <DatabaseOutlined style={{ marginRight: 8 }} />
          管理后台
        </Title>
        <Button onClick={onBack}>返回恐龙百科</Button>
      </div>

      <Tabs defaultActiveKey="agent" size="large">
        <TabPane tab={<span><RobotOutlined />AI Agent</span>} key="agent">
          {renderAgentPanel()}
        </TabPane>
        <TabPane tab={<span><DatabaseOutlined />数据管理</span>} key="data">
          {renderDataPanel()}
        </TabPane>
      </Tabs>

      {/* AI Agent 配置模态框 */}
      <Modal
        title={agentStatus.initialized ? '更新 AI Agent 配置' : '初始化 AI Agent'}
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={configForm}
          layout="vertical"
          onFinish={initializeAgent}
          initialValues={{
            backendUrl: 'http://localhost:3000',
            maxRetries: 3,
            timeout: 60000,
            logLevel: 'info',
            ...agentStatus.config,
          }}
        >
          <Form.Item
            label="OpenAI API Key"
            name="openaiApiKey"
            rules={[{ required: true, message: '请输入 OpenAI API Key' }]}
          >
            <Input.Password placeholder="sk-..." />
          </Form.Item>
          <Form.Item
            label="Tavily API Key"
            name="tavilyApiKey"
            rules={[{ required: true, message: '请输入 Tavily API Key' }]}
          >
            <Input.Password placeholder="tvly-..." />
          </Form.Item>
          <Form.Item
            label="后端 URL"
            name="backendUrl"
            rules={[{ required: true, message: '请输入后端 URL' }]}
          >
            <Input placeholder="http://localhost:3000" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="最大重试次数"
                name="maxRetries"
                rules={[{ required: true, message: '请输入最大重试次数' }]}
              >
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="超时时间 (毫秒)"
                name="timeout"
                rules={[{ required: true, message: '请输入超时时间' }]}
              >
                <InputNumber min={10000} max={300000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="日志级别"
            name="logLevel"
            rules={[{ required: true, message: '请选择日志级别' }]}
          >
            <Select>
              <Option value="debug">Debug</Option>
              <Option value="info">Info</Option>
              <Option value="warn">Warn</Option>
              <Option value="error">Error</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {agentStatus.initialized ? '更新配置' : '初始化'}
              </Button>
              <Button onClick={() => setConfigModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

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
              <Button type="primary" htmlType="submit" loading={researchLoading}>
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