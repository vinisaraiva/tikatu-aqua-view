import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useMenosMovimento } from "./useMenosMovimento";
import { useT } from "./idioma";

/**
 * Medidor de qualidade da água em 3D (modelo "Water Quality Meter", de Dreamsoft Innovations, CC BY 4.0,
 * comprimido para ~480 KB). A three.js só é baixada quando a cena chega perto da tela.
 * Gira devagar sozinho; arrastar gira à mão. Com menos movimento, fica parado.
 */
export const Sonda3D = ({ compacto = false }: { compacto?: boolean }) => {
  const caixa = useRef<HTMLDivElement>(null);
  const perto = useInView(caixa, { margin: "300px 0px", once: true });
  const visivel = useInView(caixa, { amount: 0.2 });
  const visivelRef = useRef(false);
  visivelRef.current = visivel;
  const reduce = useMenosMovimento();
  const t = useT();
  const [estado, setEstado] = useState<"carregando" | "pronto" | "erro">("carregando");

  useEffect(() => {
    if (!perto || !caixa.current) return;
    const el = caixa.current;
    let parar = () => {};
    let cancelado = false;

    (async () => {
      try {
        const THREE = await import("three");
        const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
        const { MeshoptDecoder } = await import("three/examples/jsm/libs/meshopt_decoder.module.js");
        const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
        if (cancelado) return;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.35;
        el.appendChild(renderer.domElement);
        renderer.domElement.style.touchAction = "pan-y";

        const cena = new THREE.Scene();
        const pmrem = new THREE.PMREMGenerator(renderer);
        cena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 10);
        const luz = new THREE.DirectionalLight(0x9be7ff, 1.4);
        luz.position.set(-1, 1.5, 1);
        cena.add(luz);
        // Luz de contorno ciano por trás: separa o plástico escuro do fundo.
        const contorno = new THREE.DirectionalLight(0x5eead4, 2.2);
        contorno.position.set(1.2, 0.6, -1.5);
        cena.add(contorno);

        const loader = new GLTFLoader();
        loader.setMeshoptDecoder(MeshoptDecoder);
        const gltf = await loader.loadAsync("/apresentacao/medidor-qualidade-agua.glb");
        if (cancelado) {
          renderer.dispose();
          return;
        }
        const modelo = gltf.scene;
        // Centraliza e enquadra o conjunto (aparelho + sonda).
        const box = new THREE.Box3().setFromObject(modelo);
        const centro = box.getCenter(new THREE.Vector3());
        const tam = box.getSize(new THREE.Vector3());
        modelo.position.sub(centro);
        const pivo = new THREE.Group();
        pivo.add(modelo);
        cena.add(pivo);
        const raio = Math.max(tam.x, tam.y, tam.z);
        camera.position.set(0, raio * 0.15, raio * 2.25);
        camera.lookAt(0, 0, 0);

        const ajustar = () => {
          const w = el.clientWidth;
          const h = el.clientHeight;
          renderer.setSize(w, h, false);
          renderer.domElement.style.width = "100%";
          renderer.domElement.style.height = "100%";
          camera.aspect = w / h;
          // Quadro estreito: a câmera recua para o conjunto não ser cortado nas laterais.
          const recuo = Math.max(1, 0.95 / camera.aspect);
          camera.position.set(0, raio * 0.15 * recuo, raio * 2.25 * recuo);
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();
        };
        ajustar();
        const ro = new ResizeObserver(ajustar);
        ro.observe(el);

        // Arrastar para girar.
        let arrastando = false;
        let ultimoX = 0;
        let velocidade = 0;
        const down = (e: PointerEvent) => {
          arrastando = true;
          ultimoX = e.clientX;
          renderer.domElement.setPointerCapture(e.pointerId);
        };
        const move = (e: PointerEvent) => {
          if (!arrastando) return;
          const dx = e.clientX - ultimoX;
          ultimoX = e.clientX;
          pivo.rotation.y += dx * 0.01;
          velocidade = dx * 0.01;
        };
        const up = () => {
          arrastando = false;
        };
        renderer.domElement.addEventListener("pointerdown", down);
        renderer.domElement.addEventListener("pointermove", move);
        renderer.domElement.addEventListener("pointerup", up);
        renderer.domElement.addEventListener("pointercancel", up);

        pivo.rotation.y = -0.5;
        const relogio = new THREE.Clock();
        let raf = 0;
        const quadro = () => {
          raf = requestAnimationFrame(quadro);
          if (!visivelRef.current) return;
          const dt = Math.min(relogio.getDelta(), 0.05);
          if (!arrastando) {
            velocidade *= 0.92;
            if (!reduce) pivo.rotation.y += dt * 0.35 + velocidade;
            const t = relogio.elapsedTime;
            pivo.position.y = reduce ? 0 : Math.sin(t * 0.9) * raio * 0.02;
          }
          renderer.render(cena, camera);
        };
        renderer.render(cena, camera);
        quadro();
        setEstado("pronto");

        parar = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          renderer.domElement.remove();
          pmrem.dispose();
          renderer.dispose();
        };
      } catch {
        if (!cancelado) setEstado("erro");
      }
    })();

    return () => {
      cancelado = true;
      parar();
    };
  }, [perto, reduce]);

  return (
    <figure className="flex h-full flex-col">
      <div
        ref={caixa}
        className={`relative flex-1 cursor-grab overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(60%_55%_at_50%_45%,rgba(34,211,238,0.18),transparent_70%)] active:cursor-grabbing ${compacto ? "min-h-[16rem] sm:min-h-[18rem]" : "min-h-[18rem] sm:min-h-[24rem]"}`}
        role="img"
        aria-label={t([
          "Modelo 3D de um medidor de qualidade da água portátil, com aparelho de leitura e sonda",
          "3D model of a portable water quality meter, with a reading unit and probe",
        ])}
      >
        {estado !== "pronto" && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
            {estado === "erro"
              ? t(["Não foi possível carregar o modelo 3D.", "Could not load the 3D model."])
              : t(["Carregando modelo 3D…", "Loading 3D model…"])}
          </div>
        )}
      </div>
      <figcaption className="mt-3 text-xs text-slate-500">
        {t([
          "Ilustração de um medidor portátil (modelo genérico, não o equipamento a ser adquirido). Arraste para girar. Modelo “Water Quality Meter”, de",
          "Illustration of a portable meter (generic model, not the equipment to be purchased). Drag to rotate. “Water Quality Meter” model by",
        ])}{" "}
        <a
          href="https://sketchfab.com/3d-models/water-quality-meter-aa2fd13dda004eeca52ac1634dd07a60"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-slate-300"
        >
          Dreamsoft Innovations
        </a>
        ,{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-slate-300"
        >
          CC BY 4.0
        </a>
        .
      </figcaption>
    </figure>
  );
};
