/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import FireCalculator from "./components/FireCalculator";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-blue-500/30">
        <FireCalculator />
      </div>
    </ErrorBoundary>
  );
}
