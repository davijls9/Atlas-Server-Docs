import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// ATLAS INTERNAL AUDIT SYSTEM (STARTUP VERIFICATION)
import { runner } from './tests/AtlasTestRunner';
import { runWhiteBoxTests } from './tests/WhiteBox.test';
import { runBlackBoxTests } from './tests/BlackBox.test';
import { runGreyBoxTests } from './tests/GreyBox.test';
import { runPerformanceTests } from './tests/Performance.test';
import { runStressTests } from './tests/Stress.test';
import { runChaosTests } from './tests/Chaos.test';

if (import.meta.env.DEV) {
  (async () => {
    console.log('\x1b[1m\x1b[35m[ATLAS SYSTEM] Initiating MASS-SCALE internal audit (300+ Tests)...\x1b[0m');
    await runWhiteBoxTests();
    await runBlackBoxTests();
    await runGreyBoxTests();
    await runPerformanceTests();
    await runStressTests();
    await runChaosTests();
    await runner.report();
  })();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
