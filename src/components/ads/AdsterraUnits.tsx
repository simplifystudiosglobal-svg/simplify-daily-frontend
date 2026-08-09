import { useEffect, useRef } from 'react';

const SKYSCRAPER_KEY = '636174ac7332e295e72e425d0954d5f7';
const NATIVE_CONTAINER_ID = 'container-698769f2ffc8a5ff10c04c2915a994d2';
const NATIVE_SCRIPT_SRC = 'https://pl30771759.effectivecpmnetwork.com/698769f2ffc8a5ff10c04c2915a994d2/invoke.js';

// Adsterra's classic banner format (atOptions + invoke.js) calls document.write()
// internally. Calling document.write on the *main* document after the page has already
// loaded — which is exactly when a React effect runs — can wipe out the entire rendered
// app instead of just inserting the ad. Rendering it inside a fresh iframe we create
// ourselves isolates that document.write() to the iframe's own blank document, where
// it's the normal, safe way for this kind of legacy ad tag to work.
export function AdsterraSkyscraper160x600({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const iframe = document.createElement('iframe');
    iframe.style.width = '160px';
    iframe.style.height = '600px';
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
          `"key":"${SKYSCRAPER_KEY}",` +
          '"format":"iframe","height":600,"width":160,"params":{}' +
          '};</script>' +
          `<script src="https://www.highperformanceformat.com/${SKYSCRAPER_KEY}/invoke.js"><\/script>` +
          '</body></html>'
      );
      doc.close();
    }

    return () => {
      if (container.contains(iframe)) container.removeChild(iframe);
    };
  }, []);

  return <div ref={containerRef} className={className} style={{ width: 160, height: 600 }} />;
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
