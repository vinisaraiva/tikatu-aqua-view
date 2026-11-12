import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * A gota que abre a apresentação: ao sair da tela 1, uma gota d'água em 3D se forma no alto, cai e,
 * ao tocar a "superfície", abre ondas; a tela 2 se revela a partir desse ponto.
 * A three.js é carregada com antecedência, em segundo plano; se ainda não estiver pronta (ou se o
 * navegador não tiver WebGL), `cair()` devolve false e a troca de tela acontece sem a gota.
 */
export const GOTA_IMPACTO_MS = 780;
/** Ponto de impacto na tela (fração da largura e da altura); a tela seguinte se abre daqui. */
export const GOTA_PONTO = { x: 0.5, y: 0.58 };

const FORMAR = 220;
const SOLTAR = 330;
const SUMIR = 140;
const TOPO = 0.13; // onde a gota se forma (fração da altura)

export interface GotaHandle {
  /** Solta a gota. Devolve false se ela não estiver pronta. */
  cair: () => boolean;
}

const mola = (x: number) => 1 + 2.7 * Math.pow(x - 1, 3) + 1.7 * Math.pow(x - 1, 2); // easeOutBack

export const Gota3D = forwardRef<GotaHandle>((_, ref) => {
  const tela = useRef<HTMLCanvasElement>(null);
  const soltar = useRef<(() => boolean) | null>(null);
  const [ondas, setOndas] = useState(0);

  useImperativeHandle(ref, () => ({ cair: () => soltar.current?.() ?? false }), []);

  useEffect(() => {
    const canvas = tela.current;
    if (!canvas) return;
    let cancelado = false;
    let limpar = () => {};

    const preparar = async () => {
      try {
        const THREE = await import("three");
        const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
        if (cancelado) return;

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;

        const cena = new THREE.Scene();
        const pmrem = new THREE.PMREMGenerator(renderer);
        cena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
        camera.position.set(0, 0, 10);
        const alturaVisivel = 2 * 10 * Math.tan((15 * Math.PI) / 180);
        const luz = new THREE.DirectionalLight(0xffffff, 2.2);
        luz.position.set(-2, 3, 4);
        cena.add(luz);
        const contorno = new THREE.DirectionalLight(0x8fd0f5, 2.4);
        contorno.position.set(2.5, 0.5, -2);
        cena.add(contorno);

        // Perfil de gota: ponta fina em cima, bojo redondo embaixo, girado em torno do eixo.
        const perfil: InstanceType<typeof THREE.Vector2>[] = [];
        for (let k = 0; k <= 48; k++) {
          const a = (k / 48) * Math.PI;
          perfil.push(new THREE.Vector2(Math.sin(a) * Math.pow(Math.sin(a / 2), 1.5) * 0.36, Math.cos(a) * 0.46));
        }
        const geometria = new THREE.LatheGeometry(perfil, 56);
        const material = new THREE.MeshPhysicalMaterial({
          color: 0x2f9be0,
          roughness: 0.06,
          metalness: 0,
          clearcoat: 1,
          clearcoatRoughness: 0.04,
          envMapIntensity: 1.7,
          transparent: true,
          opacity: 0.94,
        });
        const gota = new THREE.Mesh(geometria, material);
        gota.visible = false;
        cena.add(gota);

        const ajustar = () => {
          renderer.setSize(window.innerWidth, window.innerHeight, false);
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
        };
        ajustar();
        window.addEventListener("resize", ajustar);
        // Compila os programas agora, para o primeiro quadro da queda não engasgar.
        renderer.compile(cena, camera);

        const yDe = (fracao: number) => (0.5 - fracao) * alturaVisivel;
        let raf = 0;
        let aviso = 0;
        const quadro = (inicio: number) => {
          const t = performance.now() - inicio;
          if (t >= GOTA_IMPACTO_MS + SUMIR) {
            gota.visible = false;
            renderer.render(cena, camera);
            raf = 0;
            return;
          }
          let y = yDe(TOPO);
          let sx = 1;
          let sy = 1;
          let opacidade = 0.94;
          if (t < FORMAR) {
            const s = Math.max(0.001, mola(t / FORMAR));
            sx = s;
            sy = s;
          } else if (t < SOLTAR) {
            // Pendura um instante: estica um pouco antes de soltar.
            const p = (t - FORMAR) / (SOLTAR - FORMAR);
            sy = 1 + 0.12 * p;
            sx = 1 - 0.05 * p;
          } else if (t < GOTA_IMPACTO_MS) {
            const p = (t - SOLTAR) / (GOTA_IMPACTO_MS - SOLTAR);
            y = yDe(TOPO + (GOTA_PONTO.y - TOPO) * p * p); // queda acelerada
            sy = 1.12 + 0.2 * p;
            sx = 0.95 - 0.08 * p;
          } else {
            // Toca a superfície: achata e some.
            const p = (t - GOTA_IMPACTO_MS) / SUMIR;
            y = yDe(GOTA_PONTO.y) - 0.1 * p;
            sy = 1.32 - 1.1 * p;
            sx = 0.87 + 1.1 * p;
            opacidade = 0.94 * (1 - p);
          }
          gota.position.set((GOTA_PONTO.x - 0.5) * alturaVisivel * camera.aspect, y, 0);
          gota.scale.set(sx, sy, sx);
          gota.rotation.y = t * 0.004;
          material.opacity = opacidade;
          gota.visible = true;
          renderer.render(cena, camera);
          raf = requestAnimationFrame(() => quadro(inicio));
        };

        soltar.current = () => {
          if (raf) return false;
          const inicio = performance.now();
          raf = requestAnimationFrame(() => quadro(inicio));
          window.clearTimeout(aviso);
          aviso = window.setTimeout(() => setOndas((n) => n + 1), GOTA_IMPACTO_MS);
          return true;
        };

        limpar = () => {
          soltar.current = null;
          cancelAnimationFrame(raf);
          window.clearTimeout(aviso);
          window.removeEventListener("resize", ajustar);
          geometria.dispose();
          material.dispose();
          pmrem.dispose();
          renderer.dispose();
        };
      } catch {
        /* sem WebGL ou sem rede: a apresentação segue sem a gota */
      }
    };

    // Espera a página assentar antes de baixar a three.js.
    const espera = window.setTimeout(preparar, 600);
    return () => {
      cancelado = true;
      window.clearTimeout(espera);
      limpar();
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-40" aria-hidden>
      <canvas ref={tela} className="absolute inset-0 h-full w-full" />
      {ondas > 0 && (
        <div
          key={ondas}
          className="absolute"
          style={{ left: `${GOTA_PONTO.x * 100}%`, top: `${GOTA_PONTO.y * 100}%` }}
        >
          {[0, 1, 2].map((k) => (
            <motion.span
              key={k}
              className="absolute -ml-[35vmin] -mt-[35vmin] block h-[70vmin] w-[70vmin] rounded-full border-2 border-tk-rio-claro"
              initial={{ scale: 0.04, opacity: 0.85 }}
              animate={{ scale: 1 + k * 0.35, opacity: 0 }}
              transition={{ duration: 1.3, delay: k * 0.16, ease: [0.16, 0.8, 0.3, 1] }}
            />
          ))}
        </div>
      )}
    </div>
  );
});
Gota3D.displayName = "Gota3D";
