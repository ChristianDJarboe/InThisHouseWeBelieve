import Customizer from '../components/Customizer';

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>Design your plastic yard sign</h1>
        <p>
          Customize every line on a corrugated plastic yard sign — ROYGBIV stripes, your
          words, your colors. Preview stays live while you edit, then we print and ship via
          Printify.
        </p>
      </section>
      <Customizer />
    </>
  );
}
