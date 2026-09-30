# SenseIT — Cyclone Vulnerability Forecaster

SenseIT is a real-time cyclone vulnerability forecasting and emergency response dashboard designed to assess structural, medical, and power grid exposure before landfall occurs.

## Features

- **Interactive Coastal Risk Map**: Real-time asset mapping of critical infrastructure (hospitals, power grids, emergency shelters) with risk severity indices and flood surge projections.
- **Incident Overview & Live Telemetry**: Live tracking of cyclone coordinates, sustained wind speeds, pressure, and landfall ETA.
- **AI-Powered Disaster Analysis**: Automated triage assessments and operational dispatches with an integrated intelligent assistant.
- **Vulnerability Situation Reports**: PDF export with customizable emergency parameters, status indicators, and contact directives.
- **Emergency Dispatch & Direct Contacts**: Quick-dial operational contacts for Ambulance, Fire Brigade, Police, Disaster Authority, and Coastal Patrol.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/adii3404/SenseIT.git
   cd SenseIT
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your API keys if available (the application will gracefully fall back to simulation engines if keys are not provided).

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.
