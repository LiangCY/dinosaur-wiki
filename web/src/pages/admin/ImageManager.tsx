import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Space,
  Table,
  Modal,
  Form,
  Input,
  message,
  Select,
  Popconfirm,
  Image,
} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { Dinosaur } from '../../types/dinosaur';
import { dinosaurApi } from '../../services/api';

interface ImageManagerProps {
  dinosaurs: Dinosaur[];
}

interface DinosaurImage {
  url: string;
  description?: string;
}

const ImageManager: React.FC<ImageManagerProps> = ({ dinosaurs }) => {
  const [selectedDinosaurId, setSelectedDinosaurId] = useState<string>('');
  const [images, setImages] = useState<DinosaurImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);

  const loadImages = useCallback(async (selectedDinosaurId: string) => {
    try {
      setLoading(true);
      const data = await dinosaurApi.getDinosaurImages(selectedDinosaurId);
      setImages(data);
    } catch (error) {
      message.error('加载图片失败');
      console.error('Load images error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDinosaurId) {
      loadImages(selectedDinosaurId);
    }
  }, [selectedDinosaurId, loadImages]);

  const handleAddImage = async (values: {
    imageUrl: string;
    description?: string;
  }) => {
    try {
      setUploading(true);
      await dinosaurApi.addDinosaurImages(selectedDinosaurId, [
        { url: values.imageUrl, description: values.description },
      ]);
      message.success('图片添加成功');
      setAddModalVisible(false);
      form.resetFields();
      loadImages(selectedDinosaurId);
    } catch (error) {
      message.error('添加图片失败');
      console.error('Add image error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (url: string) => {
    try {
      await dinosaurApi.deleteDinosaurImage(selectedDinosaurId, url);
      message.success('图片删除成功');
      loadImages(selectedDinosaurId);
    } catch (error) {
      message.error('删除图片失败');
      console.error('Delete image error:', error);
    }
  };

  const columns = [
    {
      title: '图片',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => (
        <Image
          src={url}
          alt="dinosaur"
          style={{ width: 100, height: 100, objectFit: 'contain' }}
          preview={{
            src: url,
          }}
        />
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: DinosaurImage) => (
        <Space size="middle">
          <Popconfirm
            title="确定要删除这张图片吗？"
            onConfirm={() => handleDeleteImage(record.url)}
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
      <Card title="图片管理">
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="选择恐龙"
            style={{ width: 200 }}
            onChange={setSelectedDinosaurId}
            value={selectedDinosaurId}
          >
            {dinosaurs.map((dinosaur) => (
              <Select.Option key={dinosaur.id} value={dinosaur.id}>
                {dinosaur.name}
              </Select.Option>
            ))}
          </Select>
          <Button
            type="primary"
            onClick={() => setAddModalVisible(true)}
            disabled={!selectedDinosaurId}
          >
            添加图片
          </Button>
        </Space>

        {selectedDinosaurId && (
          <Table
            columns={columns}
            dataSource={images}
            rowKey="url"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 张图片`,
            }}
          />
        )}
      </Card>

      <Modal
        title="添加图片"
        open={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddImage}>
          <Form.Item
            label="图片URL"
            name="imageUrl"
            rules={[{ required: true, message: '请输入图片URL' }]}
          >
            <Input placeholder="例如：https://example.com/dinosaur.jpg" />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input placeholder="图片描述" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={uploading}>
                添加
              </Button>
              <Button
                onClick={() => {
                  setAddModalVisible(false);
                  form.resetFields();
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ImageManager;
