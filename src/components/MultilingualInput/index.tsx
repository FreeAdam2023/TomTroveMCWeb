import { useState, useEffect } from 'react';
import { Input, Select } from 'antd';
import type { SelectProps } from 'antd';
import { SUPPORTED_LANGUAGES } from '@/types';

export interface MultilingualInputProps {
  value?: Record<string, string>;
  onChange?: (value: Record<string, string>) => void;
  languages?: string[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  showAllLanguages?: boolean;
}

function MultilingualInput({
  value = {},
  onChange,
  languages = ['zh', 'en'],
  placeholder = '请输入内容',
  disabled = false,
  required = false,
  showAllLanguages = false,
}: MultilingualInputProps) {
  const [currentLanguages, setCurrentLanguages] = useState<string[]>(languages);

  useEffect(() => {
    if (showAllLanguages) {
      setCurrentLanguages(SUPPORTED_LANGUAGES.map(lang => lang.code));
    } else {
      setCurrentLanguages(languages);
    }
  }, [languages, showAllLanguages]);

  const handleInputChange = (lang: string, text: string) => {
    const newValue = { ...value, [lang]: text };
    onChange?.(newValue);
  };

  const getLanguageName = (code: string) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return lang ? `${lang.flag} ${lang.name}` : code;
  };

  return (
    <div className="multilingual-input">
      {currentLanguages.map((lang) => (
        <div key={lang} className="language-input-item" style={{ marginBottom: 16 }}>
          <label className="language-label" style={{ 
            display: 'block', 
            marginBottom: 8, 
            fontWeight: 500,
            color: '#262626'
          }}>
            {getLanguageName(lang)}
            {required && <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>}
          </label>
          <Input
            value={value[lang] || ''}
            onChange={(e) => handleInputChange(lang, e.target.value)}
            placeholder={`${placeholder} (${getLanguageName(lang)})`}
            disabled={disabled}
            size="middle"
          />
        </div>
      ))}
    </div>
  );
}

// 多语言选择器组件
export interface MultilingualSelectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  languages?: string[];
  placeholder?: string;
  disabled?: boolean;
  mode?: 'multiple' | 'tags';
  maxTagCount?: number;
}

function MultilingualSelect({
  value = [],
  onChange,
  languages = ['zh', 'en'],
  placeholder = '选择语言',
  disabled = false,
  mode = 'multiple',
  maxTagCount = 3,
}: MultilingualSelectProps) {
  const options: SelectProps['options'] = languages.map((lang) => {
    const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === lang);
    return {
      value: lang,
      label: langInfo ? `${langInfo.flag} ${langInfo.name}` : lang,
    };
  });

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      mode={mode}
      maxTagCount={maxTagCount}
      style={{ width: '100%' }}
    />
  );
}

export { MultilingualSelect };
export default MultilingualInput;
