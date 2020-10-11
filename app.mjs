import {
  html,
  render,
  useState,
  useEffect,
  useRef,
} from "https://unpkg.com/htm/preact/standalone.module.js";
import ow from "https://unpkg.com/oceanwind";
document.body.className = ow`min-h-full bg-purple-500 text-white text-center`;

const Title = html`<h1>Zack Krida is a frontend engineer at creative commons</h1>`;

const useResizeable = () => {
  const ref = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const ro = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.contentRect) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    }
  });

  useEffect(() => {
    if (!ref.current) return;
    ro.observe(ref.current);
    return () => ro.unobserve(ref.current);
  }, [ref]);

  return [ref, dimensions];
};

const TestRectangle = () => {
  const [ref, { width, height }] = useResizeable();
  const bigStyles = ow`bg-blue-500 padding-lg max-w-2xl  mx-auto`;
  const smallStyles = ow`bg-black padding-lg max-w-2xl  mx-auto`;

  return html`<div ref=${ref} className=${width > 650 ? bigStyles : smallStyles}>
    This is a test rectangle. It is ${width} wide and ${height} tall!.
  </div>`;
};

const Timer = () => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const timeout = setInterval(() => {
      setTime(time + 1);
    }, 1000);

    return () => clearInterval(timeout);
  });

  return html`<div>${time}</div>`;
};

const app = html`
  ${Title}
  <${Timer} />
  <${TestRectangle} />
`;

render(app, document.body);
