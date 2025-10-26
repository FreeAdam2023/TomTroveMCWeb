import React from 'react';
import { Card, Statistic, Tooltip } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';

export interface StatCardProps {
  title: string;
  value: number | string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: string;
  precision?: number;
  suffix?: string;
  prefix?: string;
  loading?: boolean;
  tooltip?: string;
  onClick?: () => void;
  className?: string;
}

function StatCard({
  title,
  value,
  trend,
  trendValue,
  icon,
  color = '#1890ff',
  precision,
  suffix,
  prefix,
  loading = false,
  tooltip,
  onClick,
  className,
}: StatCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <ArrowUpOutlined style={{ color: '#52c41a' }} />;
      case 'down':
        return <ArrowDownOutlined style={{ color: '#ff4d4f' }} />;
      case 'stable':
        return <MinusOutlined style={{ color: '#8c8c8c' }} />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return '#52c41a';
      case 'down':
        return '#ff4d4f';
      case 'stable':
        return '#8c8c8c';
      default:
        return undefined;
    }
  };

  const cardContent = (
    <Card
      className={`stat-card ${className || ''}`}
      hoverable={!!onClick}
      onClick={onClick}
      style={{ 
        cursor: onClick ? 'pointer' : 'default',
        border: `1px solid ${color}20`,
      }}
    >
      <Statistic
        title={title}
        value={value}
        precision={precision}
        valueStyle={{ 
          color: color,
          fontSize: '24px',
          fontWeight: 600,
        }}
        prefix={prefix}
        suffix={suffix}
        loading={loading}
      />
      
      {trend && trendValue && (
        <div 
          className="trend-info" 
          style={{ 
            marginTop: 8,
            fontSize: '12px',
            color: getTrendColor(),
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {getTrendIcon()}
          <span>{trendValue}</span>
        </div>
      )}
      
      {icon && (
        <div 
          className="stat-icon" 
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            fontSize: '24px',
            color: color,
            opacity: 0.3,
          }}
        >
          {icon}
        </div>
      )}
    </Card>
  );

  return tooltip ? (
    <Tooltip title={tooltip}>
      {cardContent}
    </Tooltip>
  ) : (
    cardContent
  );
}

// 统计卡片组组件
export interface StatCardGroupProps {
  cards: StatCardProps[];
  columns?: number;
  gutter?: number;
  className?: string;
}

function StatCardGroup({
  cards,
  columns = 4,
  gutter = 16,
  className,
}: StatCardGroupProps) {
  return (
    <div className={`stat-card-group ${className || ''}`}>
      <div 
        className="stat-cards-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: gutter,
        }}
      >
        {cards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
}

export { StatCardGroup };
export default StatCard;
