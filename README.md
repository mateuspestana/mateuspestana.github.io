# mateuspestana.github.io

Site pessoal / CV de Matheus C. Pestana. Estático, sem etapa de build:
`index.html` + `assets/` servidos direto pelo GitHub Pages a partir do branch `main`.

- `assets/css/style.css` - estilos (tema único, dark)
- `assets/js/main.js` - boot, efeitos e grafo; GSAP/ScrollTrigger/Lenis via CDN, degrada sem eles
- `assets/fonts/` - IBM Plex Mono + Space Grotesk (SIL OFL, ver `OFL-*.txt`)
- `assets/cv.pdf` - cópia de `cv_ptbr.pdf`; recopiar quando o CV for atualizado no repo `mateuspestana/mateuspestana`

Rodar localmente: `python3 -m http.server 8000` e abrir <http://localhost:8000>.
