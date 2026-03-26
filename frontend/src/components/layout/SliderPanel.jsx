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
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.3)', zIndex: 998,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      {/* Slider Panel */}
      <div
        className="slider-panel"
        style={{
          position: 'fixed', top: 0, right: isOpen ? 0 : `-${width}`,
          width, height: '100vh', background: '#fff',
          boxShadow: isOpen ? '-4px 0 24px rgba(0,0,0,0.15)' : 'none',
          zIndex: 999,
          transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Slider Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e1e5eb',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a2e' }}>
            {title}
          </h3>
          <button
            onClick={closeSlider}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '1.1rem', color: '#8e99a9', padding: 4,
              borderRadius: 4, transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#1a1a2e'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#8e99a9'}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Slider Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {content}
        </div>
      </div>
    </>
  );
}
