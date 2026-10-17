# Matrix Calculator 🧮 

**Current Version:** v2.4.0

Matrix Calculator is a powerful, feature-rich desktop calculator application built with modern web technologies. Designed for developers, engineers, and students, it provides an intuitive, natively integrated experience with dynamic side-by-side expanding panels for advanced mathematical operations. 

## ✨ Core Modes

*   **Scientific Mode:** Fully featured scientific calculator with trigonometric functions (sin, cos, tan, asin, acos, atan), exponents, roots, logarithms, factorials, and percentage calculations.
*   **Programmer Mode:** Real-time data conversion displaying base-N values concurrently: Hexadecimal (HEX), Decimal (DEC), Octal (OCT), and Binary (BIN).
*   **Graphing Mode:** Expandable side-panel using the `mafs` library to plot dynamic mathematical expressions on a Cartesian coordinate system.
*   **Matrix Operations:** Expandable dedicated panel for linear algebra. Supports 2x2 and 3x3 matrices with instant calculation of Addition, Subtraction, Multiplication, Determinants, Transposition, and Inverse.
*   **Dev/IT Conversions (New in v2.4.0):** Specialized toolkit featuring IPv4 CIDR subnet calculations, exact base-1024 data storage conversions (MB/GB/TB), and dual-bound HEX/RGB web color translations.

## 🛠️ System & UX Features

*   **Global Summon (New):** Register a system-wide hotkey (`Alt+C`) to instantly snap the calculator over active windows for rapid access without disrupting your workflow.
*   **History Tape (New):** A persistent, slide-out drawer that auto-logs your recent calculations to local storage, allowing you to click past results and drop them directly into your active display.
*   **Adaptive Window Architecture:** Seamlessly resizes the native OS window via Electron IPC channels (expanding from 360px to 800px) when opening Graphing or Matrix panels to maintain a clean UI.
*   **Ghost Mode:** Toggle an invisible, click-through overlay state (`Ctrl+Shift+G`) so the calculator can hover transparently over your IDE or terminal.
*   **Customization:** 
    *   Choose between 'Slate' (professional dark) and 'Neon' (vibrant synthwave) themes.
    *   Distinct Light and Dark mode toggle adapting to OS themes.
    *   Decimal precision control (Auto, 2, 4, or 8 places) and Angle unit toggles (Degrees/Radians).
*   **Key Audio:** Toggleable mechanical key click sounds generated natively via the Web Audio API.
*   **System Tray Integration:** Option to run quietly in the system tray when closing the window instead of fully quitting the app.

## 💻 Tech Stack

*   **Framework:** React 18
*   **Desktop Environment:** Electron
*   **Build Tool:** Vite
*   **Language:** TypeScript
*   **Math Engine:** `mathjs`
*   **Graphing Engine:** `mafs`

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation
1. Clone the repository.
2. Install the dependencies:
   ```bash
   npm install

## 🔮 Upcoming Features (v2.5.0 Roadmap)
*   **Exportable Ticket Logs:** One-click export of the history tape to a formatted Markdown snippet, making it effortless to paste subnet boundaries or infrastructure math directly into support tickets.
*   **Network & Ping Utilities:** Integrating Node.js native child processes to allow the Dev/IT panel to execute raw ping or traceroute commands directly from the calculator UI.
*   **Floating Widgets:** Deep dive into data unit conversions (Bytes/MB/GB), subnetting, and color values.
*   **Timezone & Currency Panel:** A dedicated module for live currency exchange rates and international timezone translation.
*   **JSON & JWT Developer Tools:** A lightweight tab to instantly format/validate JSON payloads or decode JWT tokens without needing to open a browser tab during API development.
---
