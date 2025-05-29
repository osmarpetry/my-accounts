// Global type declarations

// CSS modules
declare module "*.css" {
  const content: string;
  export default content;
}

// Jest DOM types extension
import "@testing-library/jest-dom";

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: string): R;
    }
  }
}
