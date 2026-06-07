/** Inline `<style>` block shared by both confirmation pages. Matches
 * the comprom.org public visual language: dark by default with a
 * `prefers-color-scheme: light` override. */
export const CONFIRMATION_STYLE = `<style>
:root{
  --bg:#0e0e0e;--surface:#1a1a1a;--text:hsl(0,0%,95%);
  --muted:hsl(0,0%,65%);--accent:#ee6f57;
}
@media (prefers-color-scheme: light){
  :root{
    --bg:hsl(0,0%,98%);--surface:hsl(0,0%,100%);--text:hsl(0,0%,13%);
    --muted:hsl(0,0%,40%);--accent:#c25434;
  }
}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:var(--bg);color:var(--text);
  font-family:'Inter',system-ui,-apple-system,sans-serif;line-height:1.5}
main{min-height:100vh;display:flex;align-items:center;
  justify-content:center;padding:2rem 1rem}
.card{max-width:min(36rem,100%);width:100%;background:var(--surface);
  border-radius:1rem;padding:2.5rem 2rem;
  box-shadow:0 10px 30px rgb(0 0 0 / 30%)}
h1{margin:0 0 0.75rem;font-size:1.75rem;font-weight:800;line-height:1.2;
  color:var(--text)}
p{margin:0 0 1.5rem;color:var(--muted);font-size:1rem}
.cta{display:inline-flex;align-items:center;padding:0.7rem 1.15rem;
  background:transparent;color:var(--accent);
  border:2px solid var(--accent);border-radius:0.5rem;
  text-decoration:none;font-weight:700;font-size:0.95rem;
  transition:background 150ms,color 150ms}
.cta:hover{background:var(--accent);color:var(--bg)}
.cta:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
@media (prefers-reduced-motion: reduce){.cta{transition:none}}
</style>`
