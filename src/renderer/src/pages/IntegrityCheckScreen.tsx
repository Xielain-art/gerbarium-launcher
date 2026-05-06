import { useIntegrityCheckScreen } from "../hooks/useIntegrityCheckScreen";

export function IntegrityCheckScreen(): React.JSX.Element {
  useIntegrityCheckScreen();
  return <div className="hidden" aria-hidden="true" />;
}
