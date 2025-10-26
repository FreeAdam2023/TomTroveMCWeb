import dayjs from 'dayjs';

// 导出数据格式类型
export type ExportFormat = 'csv' | 'excel' | 'json';

// 导出配置接口
export interface ExportConfig {
  filename?: string;
  format?: ExportFormat;
  includeHeaders?: boolean;
}

// 通用导出工具类
export class ExportUtils {
  /**
   * 导出 CSV 格式数据
   */
  static exportToCSV<T extends Record<string, any>>(
    data: T[],
    config: ExportConfig = {}
  ): void {
    const { filename = 'export', includeHeaders = true } = config;
    
    if (data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // 获取表头
    const headers = Object.keys(data[0]);
    
    // 构建 CSV 内容
    let csvContent = '';
    
    if (includeHeaders) {
      csvContent += headers.join(',') + '\n';
    }
    
    // 添加数据行
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        // 处理包含逗号、引号或换行符的值
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvContent += values.join(',') + '\n';
    });

    // 下载文件
    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  }

  /**
   * 导出 JSON 格式数据
   */
  static exportToJSON<T>(
    data: T[],
    config: ExportConfig = {}
  ): void {
    const { filename = 'export' } = config;
    
    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadFile(jsonContent, `${filename}.json`, 'application/json');
  }

  /**
   * 导出 Excel 格式数据（简化版，实际项目中建议使用专门的库）
   */
  static exportToExcel<T extends Record<string, any>>(
    data: T[],
    config: ExportConfig = {}
  ): void {
    const { filename = 'export' } = config;
    
    // 这里使用 CSV 格式，实际项目中可以使用 xlsx 库
    this.exportToCSV(data, { ...config, filename: `${filename}.xlsx` });
  }

  /**
   * 下载文件
   */
  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
  }

  /**
   * 格式化数据用于导出
   */
  static formatDataForExport<T extends Record<string, any>>(
    data: T[],
    fieldMapping: Record<string, string> = {}
  ): Record<string, any>[] {
    return data.map(item => {
      const formattedItem: Record<string, any> = {};
      
      Object.keys(item).forEach(key => {
        const displayKey = fieldMapping[key] || key;
        let value = item[key];
        
        // 处理特殊字段类型
        if (value instanceof Date) {
          value = dayjs(value).format('YYYY-MM-DD HH:mm:ss');
        } else if (typeof value === 'object' && value !== null) {
          // 处理对象类型（如多语言字段）
          if (value.zh && value.en) {
            value = `${value.zh} (${value.en})`;
          } else {
            value = JSON.stringify(value);
          }
        } else if (typeof value === 'boolean') {
          value = value ? '是' : '否';
        }
        
        formattedItem[displayKey] = value;
      });
      
      return formattedItem;
    });
  }
}

// 主题数据导出工具
export class TopicExportUtils {
  static exportTopics(topics: any[], config: ExportConfig = {}) {
    const formattedData = ExportUtils.formatDataForExport(topics, {
      id: 'ID',
      name: '主题名称',
      description: '主题描述',
      isActive: '状态',
      sentenceCount: '句子数量',
      createdAt: '创建时间',
      updatedAt: '更新时间',
    });

    ExportUtils.exportToCSV(formattedData, {
      filename: `topics_${dayjs().format('YYYY-MM-DD')}`,
      ...config,
    });
  }
}

// 句子数据导出工具
export class SentenceExportUtils {
  static exportSentences(sentences: any[], config: ExportConfig = {}) {
    const formattedData = ExportUtils.formatDataForExport(sentences, {
      id: 'ID',
      originalText: '原文',
      referenceAnswer: '参考答案',
      difficulty: '难度',
      order: '排序',
      isActive: '状态',
      createdAt: '创建时间',
      updatedAt: '更新时间',
    });

    ExportUtils.exportToCSV(formattedData, {
      filename: `sentences_${dayjs().format('YYYY-MM-DD')}`,
      ...config,
    });
  }
}

// 尝试记录导出工具
export class AttemptExportUtils {
  static exportAttempts(attempts: any[], config: ExportConfig = {}) {
    const formattedData = ExportUtils.formatDataForExport(attempts, {
      id: 'ID',
      userTranslation: '用户翻译',
      score: '分数',
      feedback: '反馈',
      createdAt: '尝试时间',
    });

    ExportUtils.exportToCSV(formattedData, {
      filename: `attempts_${dayjs().format('YYYY-MM-DD')}`,
      ...config,
    });
  }
}

// 错题数据导出工具
export class MistakeExportUtils {
  static exportMistakes(mistakes: any[], config: ExportConfig = {}) {
    const formattedData = ExportUtils.formatDataForExport(mistakes, {
      id: 'ID',
      mistakeType: '错题类型',
      description: '错误描述',
      isResolved: '解决状态',
      createdAt: '创建时间',
      resolvedAt: '解决时间',
    });

    ExportUtils.exportToCSV(formattedData, {
      filename: `mistakes_${dayjs().format('YYYY-MM-DD')}`,
      ...config,
    });
  }
}

export default ExportUtils;
