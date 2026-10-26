import { FaGamepad } from 'react-icons/fa';
import Section from '../../../components/common/Section';

export default function ExploreInfo() {
  return (
    <Section title="Explore Yono Games and App Information" icon={FaGamepad}>
      <p>
        Users searching for Yono Games, Yono777, Yonorummy or Jaiho777 should first confirm which
        specific application they are researching.
      </p>
      <p>
        App names, publisher identities, available features and supported versions can change.
        Information should be verified against reliable publisher documentation before being
        presented as fact.
      </p>
    </Section>
  );
}
