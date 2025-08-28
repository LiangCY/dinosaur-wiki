import React, { useState, useEffect } from 'react';
import {
  Card,
  Tag,
  Descriptions,
  Tabs,
  Spin,
  Button,
  Row,
  Col,
  Image,
  Empty,
  Carousel,
} from 'antd';
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  ScissorOutlined,
} from '@ant-design/icons';
import type { DinosaurDetail } from '../../types/dinosaur';
import { dinosaurApi } from '../../services/api';

const { TabPane } = Tabs;

interface DinosaurDetailProps {
  dinosaurId: string;
  onBack: () => void;
}

const DinosaurDetailComponent: React.FC<DinosaurDetailProps> = ({
  dinosaurId,
  onBack,
}) => {
  const [dinosaur, setDinosaur] = useState<DinosaurDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDinosaurDetail = async () => {
      try {
        setLoading(true);
        const data = await dinosaurApi.getDinosaurById(dinosaurId);
        setDinosaur(data);
      } catch (error) {
        console.error('获取恐龙详情失败:', error);
      } finally {
        setLoading(false);
      }
    };

    if (dinosaurId) {
      fetchDinosaurDetail();
    }
  }, [dinosaurId]);

  const getDietColor = (diet: string) => {
    switch (diet.toLowerCase()) {
      case 'carnivore':
      case '肉食性':
        return 'red';
      case 'herbivore':
      case '草食性':
        return 'green';
      case 'omnivore':
      case '杂食性':
        return 'orange';
      default:
        return 'blue';
    }
  };

  const getPeriodColor = (period: string) => {
    switch (period.toLowerCase()) {
      case 'triassic':
      case '三叠纪':
        return 'purple';
      case 'jurassic':
      case '侏罗纪':
        return 'blue';
      case 'cretaceous':
      case '白垩纪':
        return 'cyan';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div
        className="flex justify-center items-center"
        style={{ minHeight: '400px' }}
      >
        <Spin size="large" tip="正在加载恐龙详情..." />
      </div>
    );
  }

  if (!dinosaur) {
    return (
      <div className="text-center" style={{ padding: '60px 0' }}>
        <Empty description="未找到恐龙信息" />
        <Button type="primary" onClick={onBack} style={{ marginTop: '16px' }}>
          返回列表
        </Button>
      </div>
    );
  }

  return (
    <div className="dinosaur-detail">
      {/* 返回按钮 */}
      <div className="back-button" style={{ marginBottom: '24px' }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          size="large"
        >
          返回列表
        </Button>
      </div>

      {/* 主要信息卡片 */}
      <Card className="main-info-card">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={10} lg={8}>
            <div className="dinosaur-image">
              {/* 主图片 */}
              <div
                style={{
                  display:
                    dinosaur.images && dinosaur.images.length > 1
                      ? 'none'
                      : 'block',
                }}
              >
                <Image
                  src={
                    dinosaur.images && dinosaur.images.length > 0
                      ? dinosaur.images[0].url
                      : '/placeholder-dinosaur.png'
                  }
                  alt={dinosaur.name}
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                  }}
                  fallback="/placeholder-dinosaur.png"
                />
              </div>

              {/* 图片轮播 */}
              {dinosaur.images && dinosaur.images.length > 1 && (
                <Carousel autoplay>
                  {dinosaur.images.map((image, index) => (
                    <div key={index}>
                      <Image
                        src={image.url}
                        alt={`${dinosaur.name} - ${index + 1}`}
                        style={{
                          width: '100%',
                          borderRadius: '8px',
                        }}
                        fallback="/placeholder-dinosaur.png"
                      />
                    </div>
                  ))}
                </Carousel>
              )}
            </div>
          </Col>
          <Col xs={24} md={14} lg={16}>
            <div className="dinosaur-info">
              <div className="title-section">
                <h1 className="dinosaur-name">{dinosaur.name}</h1>
                <p className="scientific-name">{dinosaur.scientific_name}</p>
                <div className="tags" style={{ margin: '16px 0' }}>
                  <Tag
                    color={getPeriodColor(dinosaur.era)}
                    icon={<ClockCircleOutlined />}
                  >
                    {dinosaur.era}
                  </Tag>
                  <Tag color={getDietColor(dinosaur.diet)}>{dinosaur.diet}</Tag>
                </div>
              </div>

              <Descriptions title="基本信息" column={{ sm: 2, md: 4, lg: 6 }}>
                {(dinosaur.length_min_meters || dinosaur.length_max_meters) && (
                  <Descriptions.Item label="体长" span={2}>
                    {dinosaur.length_min_meters && dinosaur.length_max_meters
                      ? `${dinosaur.length_min_meters}-${dinosaur.length_max_meters} 米`
                      : `$
                          dinosaur.length_min_meters ||
                          dinosaur.length_max_meters
                        } 米`}
                  </Descriptions.Item>
                )}
                {(dinosaur.weight_min_tons || dinosaur.weight_max_tons) && (
                  <Descriptions.Item label="体重" span={2}>
                    {dinosaur.weight_min_tons && dinosaur.weight_max_tons
                      ? `${dinosaur.weight_min_tons}-${dinosaur.weight_max_tons} 吨`
                      : `$
                          dinosaur.weight_min_tons || dinosaur.weight_max_tons
                        } 吨`}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="饮食习惯" span={2}>
                  {dinosaur.diet}
                </Descriptions.Item>
                <Descriptions.Item label="年代范围" span={2}>
                  {dinosaur.start_mya}-{dinosaur.end_mya} 百万年前
                </Descriptions.Item>
                <Descriptions.Item label="生存时期" span={4}>
                  {dinosaur.period}
                </Descriptions.Item>
                {dinosaur.habitat && (
                  <Descriptions.Item label="栖息地" span="filled">
                    {dinosaur.habitat}
                  </Descriptions.Item>
                )}
                {dinosaur.region && (
                  <Descriptions.Item label="发现地区" span="filled">
                    {dinosaur.region}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 分类信息卡片 */}
      <Card title="分类信息" style={{ marginTop: '24px' }}>
        <Descriptions column={{ xs: 1, sm: 1, md: 1 }} size="middle">
          {dinosaur.taxonomy_kingdom && (
            <Descriptions.Item label="界">
              {dinosaur.taxonomy_kingdom}
            </Descriptions.Item>
          )}
          {dinosaur.taxonomy_phylum && (
            <Descriptions.Item label="门">
              {dinosaur.taxonomy_phylum}
            </Descriptions.Item>
          )}
          {dinosaur.taxonomy_class && (
            <Descriptions.Item label="纲">
              {dinosaur.taxonomy_class}
            </Descriptions.Item>
          )}
          {dinosaur.taxonomy_order && (
            <Descriptions.Item label="目">
              {dinosaur.taxonomy_order}
            </Descriptions.Item>
          )}
          {dinosaur.taxonomy_suborder && (
            <Descriptions.Item label="亚目">
              {dinosaur.taxonomy_suborder}
            </Descriptions.Item>
          )}
          {dinosaur.taxonomy_family && (
            <Descriptions.Item label="科">
              {dinosaur.taxonomy_family}
            </Descriptions.Item>
          )}
          {dinosaur.taxonomy_subfamily && (
            <Descriptions.Item label="亚科">
              {dinosaur.taxonomy_subfamily}
            </Descriptions.Item>
          )}
          {dinosaur.taxonomy_genus && (
            <Descriptions.Item label="属">
              {dinosaur.taxonomy_genus}
            </Descriptions.Item>
          )}
          {dinosaur.taxonomy_species && (
            <Descriptions.Item label="种">
              {dinosaur.taxonomy_species}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* 详细信息标签页 */}
      <Card style={{ marginTop: '24px' }}>
        <Tabs defaultActiveKey="description" size="large">
          <TabPane tab="描述" key="description">
            <div className="description-content">
              {dinosaur.description ? (
                <p
                  style={{
                    fontSize: '16px',
                    lineHeight: '1.8',
                    color: '#262626',
                  }}
                >
                  {dinosaur.description}
                </p>
              ) : (
                <Empty description="暂无描述" />
              )}
            </div>
          </TabPane>

          <TabPane tab="特征信息" key="characteristics">
            <div className="characteristics-content">
              {dinosaur.characteristics &&
              dinosaur.characteristics.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {dinosaur.characteristics.map((characteristic) => (
                    <Col xs={24} sm={12} md={8} key={characteristic.id}>
                      <Card size="small" className="characteristic-card">
                        <div className="characteristic-type">
                          <ScissorOutlined
                            style={{ marginRight: '8px', color: '#1890ff' }}
                          />
                          <strong>{characteristic.feature_type}</strong>
                        </div>
                        <p style={{ margin: '8px 0 0 0', color: '#595959' }}>
                          {characteristic.description}
                        </p>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty description="暂无特征信息" />
              )}
            </div>
          </TabPane>

          <TabPane tab="化石发现" key="fossils">
            <div className="fossils-content">
              {dinosaur.fossils && dinosaur.fossils.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {dinosaur.fossils.map((fossil) => (
                    <Col xs={24} sm={12} md={8} key={fossil.id}>
                      <Card size="small" className="fossil-card">
                        <div className="fossil-header">
                          <h4 style={{ margin: 0, color: '#1890ff' }}>
                            {fossil.fossil_type}
                          </h4>
                          {fossil.discovery_date && (
                            <span
                              style={{ color: '#8c8c8c', fontSize: '12px' }}
                            >
                              {new Date(fossil.discovery_date).getFullYear()}
                              年发现
                            </span>
                          )}
                        </div>
                        <div
                          className="fossil-location"
                          style={{ margin: '8px 0' }}
                        >
                          <EnvironmentOutlined style={{ marginRight: '4px' }} />
                          <span>{fossil.discovery_location}</span>
                        </div>
                        {fossil.description && (
                          <p
                            style={{
                              margin: '8px 0 0 0',
                              color: '#595959',
                              fontSize: '14px',
                            }}
                          >
                            {fossil.description}
                          </p>
                        )}
                        {fossil.image_url && (
                          <div style={{ marginTop: '12px' }}>
                            <Image
                              src={fossil.image_url}
                              alt={`${fossil.fossil_type} 化石`}
                              style={{ width: '100%', borderRadius: '4px' }}
                            />
                          </div>
                        )}
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty description="暂无化石发现记录" />
              )}
            </div>
          </TabPane>
        </Tabs>
      </Card>

      <style>{`
        .dinosaur-detail {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0;
        }
        
        .main-info-card {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .dinosaur-name {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: #262626;
        }
        
        .scientific-name {
          font-size: 18px;
          font-style: italic;
          color: #8c8c8c;
          margin: 0;
        }
        
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .characteristic-card,
        .fossil-card {
          height: 100%;
          transition: all 0.3s ease;
        }
        
        .characteristic-card:hover,
        .fossil-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }
        
        .characteristic-type {
          display: flex;
          align-items: center;
          color: #1890ff;
          font-weight: 600;
        }
        
        .fossil-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        
        .fossil-location {
          display: flex;
          align-items: center;
          color: #595959;
          font-size: 14px;
        }
        
        /* 轮播图相关样式 */
        .ant-carousel .slick-slide {
          text-align: center;
          height: 280px;
          line-height: 280px;
          background: #364d79;
          overflow: hidden;
          border-radius: 8px;
        }
        
        .ant-carousel .slick-slide img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        @media (max-width: 768px) {
          .dinosaur-name {
            font-size: 24px;
          }
          
          .scientific-name {
            font-size: 16px;
          }
          
          .back-button {
            margin-bottom: 16px;
          }
          
          .ant-carousel .slick-slide {
            line-height: 100px;
          }
        }
      `}</style>
    </div>
  );
};

export default DinosaurDetailComponent;
