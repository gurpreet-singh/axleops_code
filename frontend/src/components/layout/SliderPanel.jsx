import useSliderStore from '../../stores/sliderStore';

export default function SliderPanel() {
  const { isOpen, title, content, width, closeSlider } = useSliderStore();

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
        {/* Slider Header */}
        <div className="slider-header">
          <h3>{title}</h3>
          <button
            className="slider-close-btn"
            onClick={closeSlider}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Slider Content */}
        <div className="slider-content">
          {content}
        </div>
      </div>
    </>
  );
}
