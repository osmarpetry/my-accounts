import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  LanguageToggle,
  LanguageSwitcher,
} from "@/components/ui/language-switcher";

describe("LanguageSwitcher Components", () => {
  const mockOnLocaleChange = jest.fn();

  beforeEach(() => {
    mockOnLocaleChange.mockClear();
  });

  describe("LanguageToggle", () => {
    it("renders with English flag and text", () => {
      render(
        <LanguageToggle
          currentLocale="en"
          onLocaleChange={mockOnLocaleChange}
        />
      );

      expect(screen.getByRole("button")).toBeInTheDocument();
      expect(screen.getByText("🇺🇸")).toBeInTheDocument();
      expect(screen.getByText("EN")).toBeInTheDocument();
    });

    it("renders with French flag and text", () => {
      render(
        <LanguageToggle
          currentLocale="fr"
          onLocaleChange={mockOnLocaleChange}
        />
      );

      expect(screen.getByRole("button")).toBeInTheDocument();
      expect(screen.getByText("🇫🇷")).toBeInTheDocument();
      expect(screen.getByText("FR")).toBeInTheDocument();
    });

    it("calls onLocaleChange with opposite locale when clicked", () => {
      render(
        <LanguageToggle
          currentLocale="en"
          onLocaleChange={mockOnLocaleChange}
        />
      );

      fireEvent.click(screen.getByRole("button"));
      expect(mockOnLocaleChange).toHaveBeenCalledWith("fr");
    });

    it("toggles from French to English", () => {
      render(
        <LanguageToggle
          currentLocale="fr"
          onLocaleChange={mockOnLocaleChange}
        />
      );

      fireEvent.click(screen.getByRole("button"));
      expect(mockOnLocaleChange).toHaveBeenCalledWith("en");
    });

    it("has correct accessibility attributes", () => {
      render(
        <LanguageToggle
          currentLocale="en"
          onLocaleChange={mockOnLocaleChange}
        />
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("title", "Switch Language");
    });
  });

  describe("LanguageSwitcher", () => {
    it("renders with current locale selected", () => {
      render(
        <LanguageSwitcher
          currentLocale="en"
          onLocaleChange={mockOnLocaleChange}
        />
      );

      // The Select component renders as a combobox trigger in tests
      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.getByText("🇺🇸")).toBeInTheDocument();
    });

    it("shows language switcher button", () => {
      render(
        <LanguageSwitcher
          currentLocale="en"
          onLocaleChange={mockOnLocaleChange}
        />
      );

      // Test that the component renders without crashing and shows the combobox
      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.getByText("🇺🇸")).toBeInTheDocument();
    });
  });
});
