import { useState } from 'react';
import { BACKGROUNDS, PHOTO_BACKGROUNDS } from '../constants';
import { IoClose } from 'react-icons/io5';

interface Props {
  current: string;
  onChange: (bg: string) => void;
  onClose: () => void;
}

export default function BackgroundPicker({ current, onChange, onClose }: Props) {
  // 사진 배경은 url(...)로 저장
  const handlePhoto = (url: string) => {
    onChange(`url(${url}?w=1920&q=80)`);
  };

  const isPhotoSelected = (url: string) =>
    current.includes(url);

  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ padding: '28px 32px', width: '520px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>배경 설정</h2>
          <button
            onClick={onClose}
            style={{ padding: '4px', borderRadius: '50%', cursor: 'pointer', background: 'none', border: 'none' }}
          >
            <IoClose size={22} />
          </button>
        </div>

        {/* 스크롤 영역 */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
          {/* 사진 배경 카테고리들 */}
          {PHOTO_BACKGROUNDS.map((category) => (
            <div key={category.name}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '10px' }}>
                {category.name}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
                {category.photos.map((url) => (
                  <button
                    key={url}
                    onClick={() => handlePhoto(url)}
                    style={{
                      width: '100%',
                      aspectRatio: '16/10',
                      borderRadius: '10px',
                      border: isPhotoSelected(url) ? '3px solid #6366f1' : '2px solid transparent',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      position: 'relative',
                      background: '#f1f5f9',
                      transition: 'all 0.15s',
                      transform: isPhotoSelected(url) ? 'scale(1.03)' : 'none',
                      boxShadow: isPhotoSelected(url) ? '0 4px 12px rgba(99,102,241,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
                      padding: 0,
                    }}
                  >
                    <img
                      src={`${url}?w=300&q=60`}
                      alt=""
                      loading="lazy"
                      onLoad={() => setLoadedImages((prev) => new Set(prev).add(url))}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        opacity: loadedImages.has(url) ? 1 : 0,
                        transition: 'opacity 0.3s',
                      }}
                    />
                    {/* 로딩 스피너 */}
                    {!loadedImages.has(url) && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          border: '2px solid #e2e8f0',
                          borderTopColor: '#6366f1',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                        }} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* 그라데이션 */}
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '10px' }}>그라데이션</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' }}>
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg}
                onClick={() => onChange(bg)}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '12px',
                  border: current === bg ? '3px solid #6366f1' : '2px solid transparent',
                  background: bg,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  transform: current === bg ? 'scale(1.05)' : 'none',
                  boxShadow: current === bg ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
                }}
              />
            ))}
          </div>

          {/* 단색 */}
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '10px' }}>단색</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginBottom: '24px' }}>
            {[
              '#ffffff', '#f1f5f9', '#e2e8f0', '#1e293b', '#0f172a', '#000000',
              '#fef2f2', '#fef9c3', '#f0fdf4', '#eff6ff', '#faf5ff', '#fff1f2',
            ].map((color) => (
              <button
                key={color}
                onClick={() => onChange(color)}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '8px',
                  border: current === color ? '3px solid #6366f1' : '2px solid #e2e8f0',
                  backgroundColor: color,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  transform: current === color ? 'scale(1.05)' : 'none',
                }}
              />
            ))}
          </div>

          {/* 직접 선택 */}
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '10px' }}>직접 선택</p>
          <input
            type="color"
            value={current.startsWith('#') ? current : '#667eea'}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              borderRadius: '8px',
              cursor: 'pointer',
              border: '1px solid #e2e8f0',
              marginBottom: '8px',
            }}
          />
        </div>
      </div>

      {/* 스피너 애니메이션 */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
