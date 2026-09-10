export default function About() {
  const beliefs = [
    'Wash your hands before supper.',
    'A good book beats a noisy parlor every time.',
    'Fresh air cures most moods.',
    'Margarine ought to be dyed pink so nobody mistakes it for butter.',
    'Hats come off indoors, always.',
    'Automobiles should not outpace a brisk walk through town.',
    'The tomato is, in fact, safe to eat.',
    'Spitting on the sidewalk deserves a fine.',
    'Be kind to animals.',
    'The phonograph has no place at the dinner table.',
    'Sunday is for resting, not for rushing.',
    'Home-canned beans require a proper pressure cooker — no exceptions.',
    'Write letters; people keep them.',
    'Bicycles are respectable transportation for ladies and gentlemen alike.',
    'Ice cream for breakfast is a rare but legitimate celebration.',
  ];

  return (
    <section className="about-page">
      <h1>In this website we believe</h1>
      <ul className="about-beliefs">
        {beliefs.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p className="about-foot">
        If one of these belongs on a yard sign, you know what to do upstairs.
      </p>
    </section>
  );
}