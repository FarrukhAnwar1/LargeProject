import { useState, useEffect } from 'react';
import LeftArrowImage from '../resources/icons/left_arrow.png';
import RightArrowImage from '../resources/icons/right_arrow.png';

const TileCarousel = ({
    options,
    value,
    onChange,
    ariaLabel,
}: {
    options: { id: string; label: string; icon: string }[];
    value: string;
    onChange: (id: string) => void;
    ariaLabel?: string;
}) => {
    const count = options.length;
    const [scrollIndex, setScrollIndex] = useState(0);
    const [tempValue, setTempValue] = useState(value);

    // Sync tempValue with external value changes
    useEffect(() => {
        setTempValue(value);
    }, [value]);

    const goLeft = () => {
        const currentSelectedIndex = options.findIndex(opt => opt.id === value);
        
        if (currentSelectedIndex > 0) {
            const newSelectedIndex = currentSelectedIndex - 1;
            
            // If we need to scroll, clear selection first, then scroll
            if (newSelectedIndex < scrollIndex) {
                // Clear selection immediately
                setTempValue('');
                onChange('');
                
                // Scroll in the next frame
                requestAnimationFrame(() => {
                    setScrollIndex(newSelectedIndex);
                    
                    // After scroll animation (200ms), set new selection
                    setTimeout(() => {
                        setTempValue(options[newSelectedIndex].id);
                        onChange(options[newSelectedIndex].id);
                    }, 200);
                });
            } else {
                // No scroll needed, just change selection immediately
                setTempValue(options[newSelectedIndex].id);
                onChange(options[newSelectedIndex].id);
            }
        }
    };

    const goRight = () => {
        const currentSelectedIndex = options.findIndex(opt => opt.id === value);
        
        if (currentSelectedIndex < count - 1) {
            const newSelectedIndex = currentSelectedIndex + 1;
            
            // If we need to scroll, clear selection first, then scroll
            if (newSelectedIndex >= scrollIndex + 3) {
                // Clear selection immediately
                setTempValue('');
                onChange('');
                
                // Scroll in the next frame
                requestAnimationFrame(() => {
                    setScrollIndex(newSelectedIndex - 2); // Show it as the rightmost tile
                    
                    // After scroll animation (200ms), set new selection
                    setTimeout(() => {
                        setTempValue(options[newSelectedIndex].id);
                        onChange(options[newSelectedIndex].id);
                    }, 200);
                });
            } else {
                // No scroll needed, just change selection immediately
                setTempValue(options[newSelectedIndex].id);
                onChange(options[newSelectedIndex].id);
            }
        }
    };

    // Get the three visible items based on scroll index
    const visibleOptions = options.slice(scrollIndex, scrollIndex + 3);

    return (
        <div
            className="tile-carousel"
            aria-label={ariaLabel}
            style={{ userSelect: 'none' }}
        >
            {/* Left Arrow */}
            <button
                onClick={goLeft}
                aria-label={`Previous ${ariaLabel ?? 'item'}`}
                className="tile-arrow"
                type="button"
            >
                <img
                    src={LeftArrowImage}
                    alt="left"
                    className="tile-arrow-img"
                    draggable={false}
                />
            </button>

            {/* Three Tiles Container */}
            <div className="tile-viewport">
                <div className="tile-track">
                    {visibleOptions.map((option) => {
                        const selected = tempValue === option.id;
                        let iconSrc = '';
                        try {
                            iconSrc = new URL(`../resources/icons/${option.icon}`, import.meta.url).href;
                        } catch {
                            console.warn(`Icon not found: ${option.icon}`);
                        }
                        
                        return (
                            <div
                                key={option.id}
                                className={`tile ${selected ? 'selected' : ''}`}
                                onClick={() => onChange(option.id)}
                            >
                                {iconSrc ? (
                                    <img
                                        src={iconSrc}
                                        alt={option.label}
                                        className="tile-img"
                                        draggable={false}
                                    />
                                ) : (
                                    <div className="tile-img" style={{ 
                                        background: '#e5e7eb', 
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                            {option.label.substring(0, 2).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div className="tile-label">{option.label}</div>
                            </div>
                        );
                    })}
                    {/* Fill empty slots if less than 3 items */}
                    {visibleOptions.length < 3 && 
                        Array.from({ length: 3 - visibleOptions.length }).map((_, i) => (
                            <div key={`empty-${i}`} className="tile" style={{ visibility: 'hidden' }} />
                        ))
                    }
                </div>
            </div>

            {/* Right Arrow */}
            <button
                onClick={goRight}
                aria-label={`Next ${ariaLabel ?? 'item'}`}
                className="tile-arrow"
                type="button"
            >
                <img
                    src={RightArrowImage}
                    alt="right"
                    className="tile-arrow-img"
                    draggable={false}
                />
            </button>
        </div>
    );
};

export default TileCarousel;