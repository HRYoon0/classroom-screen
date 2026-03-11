import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
  config: Record<string, unknown>;
  onConfigChange: (config: Record<string, unknown>) => void;
}

export default function QRCodeWidget({ config, onConfigChange }: Props) {
  const url = (config.url as string) || '';
  const [inputUrl, setInputUrl] = useState(url);

  const handleGenerate = () => {
    let finalUrl = inputUrl.trim();
    if (finalUrl && !finalUrl.startsWith('http')) {
      finalUrl = 'https://' + finalUrl;
    }
    onConfigChange({ url: finalUrl });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      {url ? (
        <>
          <div className="bg-white p-3 rounded-xl">
            <QRCodeSVG value={url} size={140} />
          </div>
          <p className="text-xs text-slate-500 max-w-full truncate px-2">{url}</p>
          <button
            onClick={() => onConfigChange({ url: '' })}
            className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs hover:bg-slate-200"
          >
            변경
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-700"
            placeholder="URL을 입력하세요"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button
            onClick={handleGenerate}
            className="px-4 py-1.5 bg-indigo-500 text-white rounded-lg text-sm font-semibold hover:bg-indigo-600 disabled:opacity-50"
            disabled={!inputUrl.trim()}
          >
            생성
          </button>
        </>
      )}
    </div>
  );
}
