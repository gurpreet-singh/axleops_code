import useSliderStore from '../../stores/sliderStore';

export default function SliderPanel() {
  const { isOpen, title, subtitle, content, width, closeSlider } = useSliderStore();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="slider-overlay"
          onClick={closeSlider}
        />
      )}

      {/* Slider Panel */}
      <div
        className={`slider-panel${isOpen ? ' open' : ''}`}
        style={{
          right: isOpen ? 0 : `-${width}`,
          width,
        }}
      >
        {/* Slider Header — single dark gradient header */}
        <div className="slider-header">
          <div>
            <h3>{title}</h3>
            {subtitle && <div className="slider-subtitle">{subtitle}</div>}
          </div>
          <button
            className="slider-close-btn"
            onClick={closeSlider}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Slider Content */}
        <div className="slider-content" style={{ padding: 0 }}>
          {content}
        </div>
      </div>
    </>
  );
}
