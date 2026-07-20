import { ObserverNetworkProvider } from "./context/ObserverNetworkContext";
import { ObserverBootOverlay } from "./components/ObserverBootOverlay";
import "./styles/observer-network.css";

export default function App() {
  return (
    <ObserverNetworkProvider>
      <ObserverBootOverlay />
      {/* Keep your existing BLACKTERM application here. */}
    </ObserverNetworkProvider>
  );
}
