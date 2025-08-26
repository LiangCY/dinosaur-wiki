import React from "react";
import { Card, Tag, Button } from "antd";
import {
  EyeOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import type { Dinosaur } from "../types/dinosaur";
import "../styles/responsive.css";

interface DinosaurCardProps {
  dinosaur: Dinosaur;
  onViewDetail: (id: string) => void;
}

const { Meta } = Card;

const DinosaurCard: React.FC<DinosaurCardProps> = ({
  dinosaur,
  onViewDetail,
}) => {
  const getDietColor = (diet: string) => {
    switch (diet.toLowerCase()) {
      case "carnivore":
      case "肉食性":
        return "red";
      case "herbivore":
      case "草食性":
        return "green";
      case "omnivore":
      case "杂食性":
        return "orange";
      default:
        return "blue";
    }
  };

  const getPeriodColor = (period: string) => {
    switch (period.toLowerCase()) {
      case "triassic":
      case "三叠纪":
        return "purple";
      case "jurassic":
      case "侏罗纪":
        return "blue";
      case "cretaceous":
      case "白垩纪":
        return "cyan";
      default:
        return "default";
    }
  };

  return (
    <Card
      hoverable
      className="dinosaur-card"
      cover={<div className="card-cover"></div>}
      actions={[
        <Button
          key="view"
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => onViewDetail(dinosaur.id)}
          className="mobile-full-width"
        >
          查看详情
        </Button>,
      ]}
    >
      <Meta
        title={
          <div className="card-title">
            <h3 style={{ margin: 0, fontSize: "18px" }}>{dinosaur.name}</h3>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "14px",
                color: "#8c8c8c",
                fontStyle: "italic",
              }}
            >
              {dinosaur.scientific_name}
            </p>
          </div>
        }
        description={
          <div className="card-content">
            <div className="card-tags" style={{ marginBottom: "12px" }}>
              <Tag
                color={getPeriodColor(dinosaur.period)}
                icon={<ClockCircleOutlined />}
              >
                {dinosaur.period}
              </Tag>
              <Tag color={getDietColor(dinosaur.diet)}>{dinosaur.diet}</Tag>
            </div>

            <div className="card-info">
              {dinosaur.length_meters && (
                <div className="info-item">
                  <span className="info-label">体长:</span>
                  <span className="info-value">{dinosaur.length_meters}米</span>
                </div>
              )}
              {dinosaur.weight_tons && (
                <div className="info-item">
                  <span className="info-label">体重:</span>
                  <span className="info-value">{dinosaur.weight_tons}吨</span>
                </div>
              )}
              {dinosaur.region && (
                <div className="info-item">
                  <EnvironmentOutlined style={{ marginRight: "4px" }} />
                  <span className="info-value">{dinosaur.region}</span>
                </div>
              )}
            </div>

            {dinosaur.description && (
              <p className="card-description">
                {dinosaur.description.length > 100
                  ? `${dinosaur.description.substring(0, 100)}...`
                  : dinosaur.description}
              </p>
            )}
          </div>
        }
      />

      <style>{`
        .dinosaur-card {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .card-cover {
          overflow: hidden;
          border-radius: 8px 8px 0 0;
        }
        
        .card-title h3 {
          color: var(--text-color);
          font-weight: 600;
        }
        
        .card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        
        .card-info {
          margin-bottom: 12px;
        }
        
        .info-item {
          display: flex;
          align-items: center;
          margin-bottom: 4px;
          font-size: 14px;
        }
        
        .info-label {
          font-weight: 500;
          margin-right: 8px;
          color: var(--text-secondary);
          min-width: 40px;
        }
        
        .info-value {
          color: var(--text-color);
        }
        
        .card-description {
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }
        
        @media (max-width: 768px) {
          .card-title h3 {
            font-size: 16px;
          }
          
          .info-item {
            font-size: 13px;
          }
          
          .card-description {
            font-size: 13px;
          }
        }
      `}</style>
    </Card>
  );
};

export default DinosaurCard;
