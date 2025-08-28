import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  Table,
  Tag,
  Typography,
  Popconfirm,
  Modal,
  Form,
  Input,
  Row,
  Col,
  InputNumber,
  message,
} from 'antd';
import {
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { Dinosaur } from '../../types/dinosaur';
import { dinosaurApi } from '../../services/api';

const { Text } = Typography;

interface DataPanelProps {
  dinosaurs: Dinosaur[];
  loading: boolean;
  loadDinosaurs: () => void;
}

const DataPanel: React.FC<DataPanelProps> = ({
  dinosaurs,
  loading,
  loadDinosaurs,
}) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentDinosaur, setCurrentDinosaur] = useState<Dinosaur | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm] = Form.useForm();

  const handleEditDinosaur = (dinosaur: Dinosaur) => {
    setCurrentDinosaur(dinosaur);
    setIsCreating(false);
    setEditModalVisible(true);
    // 使用setTimeout确保模态框完全打开后再设置表单值
    setTimeout(() => {
      editForm.setFieldsValue({
        ...dinosaur,
      });
    }, 100);
  };

  const handleCreateDinosaur = () => {
    setCurrentDinosaur(null);
    setIsCreating(true);
    setEditModalVisible(true);
    // 清空表单
    setTimeout(() => {
      editForm.resetFields();
    }, 100);
  };

  const handleUpdateDinosaur = async (
    values: Omit<Dinosaur, 'id' | 'created_at' | 'updated_at'>,
  ) => {
    try {
      if (isCreating) {
        // 创建恐龙
        await dinosaurApi.createDinosaur(values);
        message.success('恐龙信息创建成功');
      } else {
        // 更新恐龙
        if (!currentDinosaur) {
          message.error('未选择恐龙');
          return;
        }
        await dinosaurApi.updateDinosaur(currentDinosaur.id, values);
        message.success('恐龙信息更新成功');
      }
      setEditModalVisible(false);
      loadDinosaurs();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error(isCreating ? '创建失败' : '更新失败');
      console.error(
        isCreating ? 'Create dinosaur error:' : 'Update dinosaur error:',
        error,
      );
    }
  };

  const deleteDinosaur = async (id: string) => {
    try {
      await dinosaurApi.deleteDinosaur(id);
      message.success('恐龙删除成功');
      loadDinosaurs();
    } catch (error) {
      message.error('删除失败');
      console.error('Delete dinosaur error:', error);
    }
  };

  const dinosaurColumns = [
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
      dataIndex: 'era',
      key: 'era',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '饮食',
      dataIndex: 'diet',
      key: 'diet',
      render: (text: string) => {
        const color =
          text === '肉食' ? 'red' : text === '草食' ? 'green' : 'orange';
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
            onClick={() => handleEditDinosaur(record)}
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

  return (
    <div>
      <Card
        title="恐龙数据管理"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadDinosaurs}>
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateDinosaur}
            >
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

      {/* 编辑恐龙模态框 */}
      <Modal
        title={isCreating ? '添加恐龙信息' : '编辑恐龙信息'}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <div style={{ marginBottom: '16px' }}>
          <Input.TextArea
            rows={4}
            placeholder="请输入JSON格式的恐龙数据，点击解析按钮将自动填充表单"
            onChange={(e) => {
              // 保存JSON输入到状态，而不是表单字段
              editForm.setFieldsValue({ _jsonInput: e.target.value });
            }}
          />
          <Button
            type="primary"
            onClick={() => {
              const jsonInput = editForm.getFieldValue('_jsonInput');
              if (jsonInput) {
                try {
                  const jsonData = JSON.parse(jsonInput);
                  editForm.setFieldsValue(jsonData);
                  message.success('JSON解析成功');
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (err: any) {
                  message.error('JSON格式错误, ' + err.message);
                }
              }
            }}
            style={{ marginTop: '8px' }}
          >
            解析JSON
          </Button>
        </div>
        <Form form={editForm} layout="vertical" onFinish={handleUpdateDinosaur}>
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true, message: '请输入恐龙名称' }]}
          >
            <Input placeholder="例如：霸王龙" />
          </Form.Item>
          <Form.Item
            label="学名"
            name="scientific_name"
            rules={[{ required: true, message: '请输入恐龙学名' }]}
          >
            <Input placeholder="例如：Tyrannosaurus Rex" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="年代" name="era">
                <Input placeholder="例如：白垩纪" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="地质时期" name="period">
                <Input placeholder="例如：白垩纪" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="开始年代 (百万年前)" name="start_mya">
                <InputNumber style={{ width: '100%' }} placeholder="例如：68" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="结束年代 (百万年前)" name="end_mya">
                <InputNumber style={{ width: '100%' }} placeholder="例如：66" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="饮食习惯"
                name="diet"
                rules={[{ required: true, message: '请输入饮食习惯' }]}
              >
                <Input placeholder="例如：肉食性" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="最小体长 (米)" name="length_min_meters">
                <InputNumber style={{ width: '100%' }} placeholder="例如：10" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="最大体长 (米)" name="length_max_meters">
                <InputNumber style={{ width: '100%' }} placeholder="例如：15" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="最小体重 (吨)" name="weight_min_tons">
                <InputNumber style={{ width: '100%' }} placeholder="例如：5" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="最大体重 (吨)" name="weight_max_tons">
                <InputNumber style={{ width: '100%' }} placeholder="例如：8" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="栖息地" name="habitat">
            <Input placeholder="例如：森林、平原" />
          </Form.Item>
          <Form.Item label="发现地区" name="region">
            <Input placeholder="例如：北美洲" />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={4} placeholder="请输入恐龙描述" />
          </Form.Item>

          {/* 生物学分类信息 */}
          <Typography.Title
            level={5}
            style={{ marginTop: '24px', marginBottom: '16px' }}
          >
            生物学分类信息
          </Typography.Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="界" name="taxonomy_kingdom">
                <Input placeholder="例如：动物界" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="门" name="taxonomy_phylum">
                <Input placeholder="例如：脊索动物门" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="纲" name="taxonomy_class">
                <Input placeholder="例如：蜥形纲" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="目" name="taxonomy_order">
                <Input placeholder="例如：蜥臀目" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="亚目" name="taxonomy_suborder">
                <Input placeholder="例如：兽脚亚目" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="科" name="taxonomy_family">
                <Input placeholder="例如：暴龙科" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="亚科" name="taxonomy_subfamily">
                <Input placeholder="例如：暴龙亚科" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="属" name="taxonomy_genus">
                <Input placeholder="例如：暴龙属" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="种" name="taxonomy_species">
            <Input placeholder="例如：雷克斯暴龙" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DataPanel;
