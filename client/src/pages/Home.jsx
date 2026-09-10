import Customizer from '../components/Customizer';

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>Design your belief sign</h1>
        <p>
          Choose your lines, colors, and optional background image. Preview updates live —
          then checkout securely and we print &amp; ship via Printify.
        </p>
      </section>
      <Customizer />
    </>
  );
}
