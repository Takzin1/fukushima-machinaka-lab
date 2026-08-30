"use client";
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="ja"><body><main style={{maxWidth:640,margin:"0 auto",padding:"96px 24px",fontFamily:"system-ui",textAlign:"center"}}><h1>問題が発生しました</h1><p>画面を再読み込みするか、時間をおいて再度お試しください。</p><button onClick={reset} style={{marginTop:24,padding:"12px 20px",borderRadius:999,background:"#253238",color:"white",border:0}}>再試行する</button></main></body></html>;
}
