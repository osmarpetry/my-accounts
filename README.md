# Bank Account Management App 

Hey there! Welcome to the Bank Account Management App. This is a cool little project I put together to let you manage bank accounts, move funds around, and all that good stuff. It's built with some modern web tech and designed to be super easy to use.

## What's Inside? (The Nitty-Gritty)

This app is more than just a pretty face. Here's a peek under the hood and what it can do:

*   **Built with Next.js 15 & TypeScript:** We're talking modern, fast, and type-safe. Using the latest App Router for a smooth experience.
*   **Redux for State Management:** Keeps all the app's data organized and in check.
*   **Mock Backend (MSW):** No need for a real bank! I've mocked a backend using Mock Service Worker (MSW). This means you can run the whole thing locally – frontend and "backend" – without any special setup. Just fire it up!
*   **Speak Your Language (Localization):** The app is multilingual! It supports English and Spanish right out of the box.
*   **Plays Nice on All Screens (Responsive UI):** Whether you're on your phone or a big monitor, the app looks and works great. I used Tailwind CSS to make it pretty and adaptable.
*   **Smart Forms (Input Validation):** Nobody likes confusing errors. The forms have clear validation and tell you exactly what's needed.
*   **Test Covered:** I've written a bunch of tests (using Playwright for end-to-end testing and Jest/React Testing Library for components) to make sure everything works as expected. This helps keep the code quality high and makes it easier to maintain.

## Core Features - What Can You Actually Do?

*   **Account Management:**
    *   **Create Accounts:** Easily set up new accounts. You'll need an Owner ID (a number), pick a currency (like USD, EUR, etc.), and set an initial balance.
    *   **Edit Accounts:** Change account holder names, update balances, switch currencies, and mark accounts as active or inactive.
    *   **View Accounts:** See all your accounts at a glance, with a nice summary and options to search and filter.
    *   **Delete Accounts:** Remove accounts you no longer need (with a confirmation, of course!).
*   **Fund Transfers:**
    *   **Move Money:** Transfer funds between any two accounts.
    *   **Different Currencies? No Problem!:** If the accounts have different currencies (e.g., USD to EUR), the app handles the conversion.
    *   **Safety First:** The app checks if there's enough money in the source account before letting a transfer go through.
*   **Search and Filter:**
    *   Quickly find accounts by name, number, or owner ID.
    *   Filter by account type (checking, savings, credit), currency, or status (active/inactive).

## How I Built It (A Little More Technical)

*   **Next.js App Router:** For a modern, server-component-friendly architecture.
*   **TypeScript:** For robust, maintainable code.
*   **Redux Toolkit:** For predictable state management.
*   **Mock Service Worker (MSW):** To simulate a backend API, allowing the app to run entirely client-side for development and testing. This was a key requirement!
*   **Tailwind CSS:** For a utility-first approach to styling, making it easy to build a responsive and good-looking UI.
*   **Playwright:** For end-to-end testing, ensuring all user flows work correctly.
*   **Jest & React Testing Library:** For unit and integration testing of components.
*   **`i18next` and `react-i18next`:** For handling translations and localization.

## Running the App

You don't need any fancy containers or special software.

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Run the development server: `npm run dev`
4.  Open your browser and go to `http://localhost:3000`.

That's it! The app should be up and running with the mocked backend.

## My Approach to "Good Quality & Easy to Maintain"

*   **Clear Structure:** The project is organized logically, separating concerns like components, store, types, and utilities.
*   **Component-Based:** The UI is built with reusable React components.
*   **TypeScript Everywhere:** Helps catch errors early and makes the code easier to understand.
*   **Comprehensive Testing:** Good test coverage means less fear when making changes.
*   **Sensible Defaults & Business Logic:** Since the specs were light, I used common sense for things like Owner ID generation, validation rules, and how deactivation of accounts with balances should work (spoiler: it prevents it unless the balance is zeroed out first!).


---

Thanks for checking out the app! I had fun building it and making sure it hit all the marks.

P.S. I believe tools like LLMs can really help us code faster and smarter. Pretty exciting stuff for the future of development! 🚀
`
