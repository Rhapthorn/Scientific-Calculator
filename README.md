[project_readme.md](https://github.com/user-attachments/files/33568542/project_readme.md)
# Matrix Calculator 🧮 

**Current Version:** v2.3.0

Matrix Calculator is a powerful, feature-rich desktop calculator application built with modern web technologies. Designed for developers, engineers, and students, it provides an intuitive, natively integrated experience with dynamic side-by-side expanding panels for advanced mathematical operations.

## ✨ Core Modes

*   **Scientific Mode:** Fully featured scientific calculator with trigonometric functions (sin, cos, tan, asin, acos, atan), exponents, roots, logarithms, factorials, and percentage calculations.
*   **Programmer Mode:** Real-time data conversion displaying base-N values concurrently: Hexadecimal (HEX), Decimal (DEC), Octal (OCT), and Binary (BIN).
*   **Graphing Mode:** Expandable side-panel using the `mafs` library to plot dynamic mathematical expressions on a Cartesian coordinate system.
*   **Matrix Operations:** Expandable dedicated panel for linear algebra. Supports 2x2 and 3x3 matrices with instant calculation of:
    *   Addition (A + B) & Subtraction (A - B)
    *   Multiplication (A × B)
    *   Determinants (Det(A), Det(B))
    *   Transposition (Aᵀ)
    *   Inverse (A⁻¹)

## 🛠️ System & UX Features

*   **Adaptive Window Architecture:** Seamlessly resizes the native OS window via Electron IPC channels (expanding from 360px to 800px) when opening Graphing or Matrix panels to maintain a clean UI.
*   **Customization:**
    *   **Themes:** Choose between 'Slate' (professional dark) and 'Neon' (vibrant synthwave).
    *   **Color Modes:** Distinct Light and Dark mode toggle button adapting to Windows themes.
    *   **Precision Control:** Set decimal formatting (Auto, 2, 4, or 8 places).
    *   **Angle Units:** Toggle between Degrees and Radians for trigonometry.
*   **Ghost Mode:** Toggle an invisible, click-through overlay state (`Ctrl+Shift+G`) so the calculator can hover transparently over your IDE or terminal.
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
   ```

### Development
Start the Vite dev server and the Electron app simultaneously:
```bash
npm run dev
```

### Production Build
To compile the application and generate a standalone Windows installer (`.exe`):
```bash
npm run build:win
```
The compiled output will be available in the `dist/` directory.

## 🔮 Upcoming Features (v2.4.0 Roadmap)
*   **Global Hotkey Summon:** Bring the calculator to the front instantly from any application.
*   **History Tape:** Persistent log of recent calculations.
*   **Dev Conversions Mode:** Deep dive into data unit conversions (Bytes/MB/GB), subnetting, and color values.

---
*Built with ❤️ using Electron, React, and Vite.*
