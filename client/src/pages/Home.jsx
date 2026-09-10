import Customizer from '../components/Customizer';

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>Whats your message?</h1>
        <p>
          Express yourself with a custom &quot;In This House We Believe&quot; yard sign. Your
          words, your colors.
        </p>
        <p className="hero-note">
          Every order is made just for you — a one-of-one print of the design you create here.
          No two signs are exactly alike.
        </p>
      </section>
      <Customizer />
    </>
  );
}
