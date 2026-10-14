import AlertBox from '../../../components/common/AlertBox';

export default function DisclaimerNotice({ text }) {
  return (
    <AlertBox variant="warning" title="Disclaimer">
      <p>{text}</p>
    </AlertBox>
  );
}
