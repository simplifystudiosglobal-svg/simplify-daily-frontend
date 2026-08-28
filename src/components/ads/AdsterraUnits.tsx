import { useEffect, useRef } from 'react';

const SKYSCRAPER_KEY = '636174ac7332e295e72e425d0954d5f7';
const LEADERBOARD_KEY = 'd0b096ecb0a8b5914582b86b34bafcb0';
const RECTANGLE_KEY = '7965f66d89e280d28afc03888b015066';
const NATIVE_CONTAINER_ID = 'container-698769f2ffc8a5ff10c04c2915a994d2';
const NATIVE_SCRIPT_SRC = 'https://pl30771759.profitableratecpmnetwork.com/698769f2ffc8a5ff10c04c2915a994d2/invoke.js';

// Adsterra's classic banner format (atOptions + invoke.js) calls document.write()
// internally. Calling document.write on the *main* document after the page has already
// loaded — which is exactly when a React effect runs — can wipe out the entire rendered
// app instead of just inserting the ad. Rendering it inside a fresh iframe we create
// ourselves isolates that document.write() to the iframe's own blank document, where
// it's the normal, safe way for this kind of legacy ad tag to work.
function AtOptionsBanner({ adKey, width, height, className = '' }: { adKey: string; width: number; height: number; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const iframe = document.createElement('iframe');
    iframe.style.width = `${width}px`;
    iframe.style.height = `${height}px`;
    iframe.style.border = '0';
    iframe.style.display = 'block';
    iframe.title = 'Advertisement';
    container.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(
        '<!doctype html><html><head><meta charset="utf-8">' +
          '<style>body{margin:0;padding:0;overflow:hidden;}</style></head><body>' +
          '<script>atOptions = {' +
          `"key":"${adKey}",` +
          `"format":"iframe","height":${height},"width":${width},"params":{}` +
          '};</script>' +
          `<script src="https://www.highrevenueformat.com/${adKey}/invoke.js"><\/script>` +
          '</body></html>'
      );
      doc.close();
    }

    return () => {
      if (container.contains(iframe)) container.removeChild(iframe);
    };
  }, [adKey, width, height]);

  return <div ref={containerRef} className={className} style={{ width, height }} />;
}

export function AdsterraSkyscraper160x600({ className = '' }: { className?: string }) {
  return <AtOptionsBanner adKey={SKYSCRAPER_KEY} width={160} height={600} className={className} />;
}

export function AdsterraLeaderboard728x90({ className = '' }: { className?: string }) {
  return <AtOptionsBanner adKey={LEADERBOARD_KEY} width={728} height={90} className={className} />;
}

export function AdsterraRectangle300x250({ className = '' }: { className?: string }) {
  return <AtOptionsBanner adKey={RECTANGLE_KEY} width={300} height={250} className={className} />;
}

// Native Banner uses an async script targeting a specific container div by id — a
// standard, dynamic-insertion-safe pattern (unlike the classic banner above), so no
// iframe isolation is needed here.
export function AdsterraNativeBanner({ className = '' }: { className?: string }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = NATIVE_SCRIPT_SRC;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  return (
    <div className={className}>
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 text-center">Advertisement</p>
      <div id={NATIVE_CONTAINER_ID} />
    </div>
  );
}
