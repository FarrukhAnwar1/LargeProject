import React from 'react';
import { NumericFormat } from 'react-number-format';

type NumericInputProps = {
  value: number;
  onChange: (val: number) => void;
  allowDecimal?: boolean;
  placeholder?: string;
  className?: string;
  showCurrency?: boolean;
  step?: number;
};

const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  allowDecimal = false,
  placeholder = '',
  className = '',
  showCurrency = false,
  step = 1
}) => {
  const handleIncrement = () => {
    const newVal = (value || 0) + step;
    onChange(Number(newVal.toFixed(2)));
  };

  const handleDecrement = () => {
    const newVal = Math.max(0, (value || 0) - step);
    onChange(Number(newVal.toFixed(2)));
  };

  return (
    <div className="relative inline-block w-full">
      <NumericFormat
        value={value}
        onValueChange={(values) => {
          const { floatValue } = values;
          onChange(floatValue ?? 0);
        }}
        thousandSeparator=","
        decimalSeparator="."
        prefix={showCurrency ? '$' : ''}
        decimalScale={allowDecimal ? 2 : 0}
        fixedDecimalScale={showCurrency}
        allowNegative={false}
        allowLeadingZeros={false}
        placeholder={placeholder}
        className={`${className}`}
        style={{ paddingRight: '32px' }}
      />
      <div 
        className="absolute right-0 top-0 h-full flex flex-col border-l border-gray-300" 
        style={{ width: '24px' }}
      >
        <button
          type="button"
          onClick={handleIncrement}
          className="flex-1 hover:bg-gray-100 border-b border-gray-300 flex items-center justify-center"
          style={{ fontSize: '8px', lineHeight: '1' }}
          tabIndex={-1}
        >
          ▲
        </button>
        <button
          type="button"
          onClick={handleDecrement}
          className="flex-1 hover:bg-gray-100 flex items-center justify-center"
          style={{ fontSize: '8px', lineHeight: '1' }}
          tabIndex={-1}
        >
          ▼
        </button>
      </div>
    </div>
  );
};

export default NumericInput;