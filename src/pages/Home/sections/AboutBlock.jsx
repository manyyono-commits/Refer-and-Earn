import { FaInfoCircle } from 'react-icons/fa';
import Section from '../../../components/common/Section';

export default function AboutBlock() {
  return (
    <Section title="About ManyYonoGames.com" icon={FaInfoCircle}>
      <p>
        ManyYonoGames.com provides information about gaming applications and related topics,
        including app identity, technical requirements, privacy and installation safety.
      </p>
      <p>
        Our editorial approach should prioritize accurate information, clear explanations and
        reliable references. App details should be reviewed when relevant information changes.
      </p>
      <p>
        The website should also disclose its ownership, contact details, editorial standards and any
        applicable commercial relationships.
      </p>
    </Section>
  );
}
