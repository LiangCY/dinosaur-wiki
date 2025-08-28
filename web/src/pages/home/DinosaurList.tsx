import React, { useState, useEffect } from 'react';
import { Row, Col, Input, Select, Spin, Empty, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import DinosaurCard from './DinosaurCard';
import type { Dinosaur } from '../../types/dinosaur';
import { dinosaurApi } from '../../services/api';

const { Search } = Input;
const { Option } = Select;

const DinosaurList: React.FC = () => {
  const [dinosaurs, setDinosaurs] = useState<Dinosaur[]>([]);
  const [filteredDinosaurs, setFilteredDinosaurs] = useState<Dinosaur[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEra, setSelectedEra] = useState<string>('all');
  const [selectedDiet, setSelectedDiet] = useState<string>('all');

  // 获取所有恐龙数据
  useEffect(() => {
    const fetchDinosaurs = async () => {
      try {
        setLoading(true);
        const data = await dinosaurApi.getAllDinosaurs();
        setDinosaurs(data);
        setFilteredDinosaurs(data);
      } catch (error) {
        console.error('获取恐龙数据失败:', error);
        message.error('获取恐龙数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchDinosaurs();
  }, []);

  // 筛选和搜索逻辑
  useEffect(() => {
    let filtered = dinosaurs;

    // 按搜索关键词筛选
    if (searchQuery) {
      filtered = filtered.filter(
        (dinosaur) =>
          dinosaur.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dinosaur.scientific_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (dinosaur.description &&
            dinosaur.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase())),
      );
    }

    // 按时期筛选
    if (selectedEra !== 'all') {
      filtered = filtered.filter((dinosaur) => dinosaur.era === selectedEra);
    }

    // 按饮食习惯筛选
    if (selectedDiet !== 'all') {
      filtered = filtered.filter((dinosaur) => dinosaur.diet === selectedDiet);
    }

    setFilteredDinosaurs(filtered);
  }, [dinosaurs, searchQuery, selectedEra, selectedDiet]);

  // 获取唯一的时期列表
  const eras = Array.from(new Set(dinosaurs.map((d) => d.era)));

  // 获取唯一的饮食习惯列表
  const diets = Array.from(new Set(dinosaurs.map((d) => d.diet)));

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleEraChange = (value: string) => {
    setSelectedEra(value);
  };

  const handleDietChange = (value: string) => {
    setSelectedDiet(value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedEra('all');
    setSelectedDiet('all');
  };

  if (loading) {
    return (
      <div
        className="flex justify-center items-center"
        style={{ minHeight: '400px' }}
      >
        <Spin size="large" tip="正在加载恐龙数据..." />
      </div>
    );
  }

  return (
    <div className="dinosaur-list">
      {/* 搜索和筛选区域 */}
      <div className="filter-section" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={8} lg={8}>
            <Search
              placeholder="搜索恐龙名称或描述"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={12} sm={12} md={4} lg={4}>
            <Select
              placeholder="选择时期"
              size="large"
              style={{ width: '100%' }}
              value={selectedEra}
              onChange={handleEraChange}
            >
              <Option value="all">所有时期</Option>
              {eras.map((period) => (
                <Option key={period} value={period}>
                  {period}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={12} md={4} lg={4}>
            <Select
              placeholder="选择饮食"
              size="large"
              style={{ width: '100%' }}
              value={selectedDiet}
              onChange={handleDietChange}
            >
              <Option value="all">所有饮食</Option>
              {diets.map((diet) => (
                <Option key={diet} value={diet}>
                  {diet}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8} lg={8}>
            <div className="filter-info flex items-center justify-between">
              <span className="text-secondary">
                找到 {filteredDinosaurs.length} 只恐龙
              </span>
              {(searchQuery ||
                selectedEra !== 'all' ||
                selectedDiet !== 'all') && (
                <a onClick={clearFilters} style={{ fontSize: '14px' }}>
                  清除筛选
                </a>
              )}
            </div>
          </Col>
        </Row>
      </div>

      {/* 恐龙卡片网格 */}
      {filteredDinosaurs.length === 0 ? (
        <Empty
          description="没有找到符合条件的恐龙"
          style={{ margin: '60px 0' }}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredDinosaurs.map((dinosaur) => (
            <Col key={dinosaur.id} xs={24} sm={12} md={8} lg={6} xl={6}>
              <DinosaurCard dinosaur={dinosaur} />
            </Col>
          ))}
        </Row>
      )}

      <style>{`
        .dinosaur-list {
          padding: 0;
        }
        
        .filter-section {
          background: #fafafa;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #f0f0f0;
      `}</style>
    </div>
  );
};

export default DinosaurList;
