import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// A RTL automatikus takarítása csak globális afterEach esetén fut; mivel a
// projekten a vitest-globálok nincsenek bekapcsolva, itt tesszük meg kézzel,
// hogy a tesztek ne szennyezzék egymás DOM-ját.
afterEach(() => cleanup());
