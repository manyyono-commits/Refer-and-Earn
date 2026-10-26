import { FaLock } from 'react-icons/fa';
import Section from '../../../components/common/Section';

export default function PrivacySecurity() {
  return (
    <Section title="Privacy and Security Considerations" icon={FaLock}>
      <p>Protecting personal information is important when using gaming applications.</p>
      <p>
        Users should choose strong, unique passwords where accounts are required, avoid sharing
        verification codes, review privacy settings and be cautious of websites requesting
        unnecessary personal or payment information.
      </p>
      <p>
        Never assume that an application is safe because it has a familiar name, attractive interface
        or positive-looking testimonials.
      </p>
      <p>
        ManyYonoGames.com should publish only accurate, independently supportable information and
        should clearly disclose any commercial relationships.
      </p>
    </Section>
  );
}
