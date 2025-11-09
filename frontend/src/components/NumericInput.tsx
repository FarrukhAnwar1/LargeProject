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
    min?: number;
    max?: number;
    hideThousandSeparator?: boolean;
};

const NumericInput: React.FC<NumericInputProps> = ({
    value,
    onChange,
    allowDecimal = false,
    placeholder = '',
    className = '',
    showCurrency = false,
    step = 1,
    min,
    max,
    hideThousandSeparator = false,
}) => {
    const handleIncrement = () => {
        const newVal = (value || 0) + step;
        const clampedVal = max !== undefined ? Math.min(newVal, max) : newVal;
        onChange(Number(clampedVal.toFixed(2)));
    };

    const handleDecrement = () => {
        const newVal = (value || 0) - step;
        const clampedVal = min !== undefined ? Math.max(newVal, min) : Math.max(newVal, 0);
        onChange(Number(clampedVal.toFixed(2)));
    };

    const handleValueChange = (values: { floatValue?: number }) => {
        const { floatValue } = values;
        let newValue = floatValue ?? 0;

        // Apply min/max constraints
        if (min !== undefined && newValue < min) {
            newValue = min;
        }
        if (max !== undefined && newValue > max) {
            newValue = max;
        }

        onChange(newValue);
    };

    return (
        <div className="relative inline-block w-full">
            <NumericFormat
                value={value || ''}
                onValueChange={handleValueChange}
                thousandSeparator={
                    hideThousandSeparator
                        ? false
                        : showCurrency || !allowDecimal
                            ? ","
                            : false
                }
                decimalSeparator="."
                prefix={showCurrency ? '$' : ''}
                decimalScale={allowDecimal ? 2 : 0}
                fixedDecimalScale={showCurrency}
                allowNegative={false}
                allowLeadingZeros={false}
                placeholder={placeholder}
                className={`${className}`}
                style={{ paddingRight: '32px' }}
                isAllowed={(values) => {
                    const { floatValue } = values;
                    if (floatValue === undefined || floatValue === null) return true;
                    if (min !== undefined && floatValue < min) return false;
                    if (max !== undefined && floatValue > max) return false;
                    return true;
                }}
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