# Architecture Performance Comparison

This project compares different architectural approaches (MVC and Hexagonal) for building applications.

## Running Tests

Before running the tests, make sure to install all dependencies:

```bash
cd mvc
npm install
```

### Single Test Run

To run all tests once:

```bash
npm test
```

### Watch Mode

To run tests in watch mode (tests will re-run when files change):

```bash
npm run test:watch
```

## Load Testing

The project includes load tests using k6 to measure performance under heavy load conditions. These tests cover all API endpoints and simulate realistic user scenarios.

### Running Load Tests

1. First, make sure your application is running:

```bash
cd mvc
npm run dev
```

2. In a new terminal, run the load test:

```bash
k6 run mvc/load-tests/links.js
```

```bash
k6 run hexagonal/load-tests/links.js
```

The load test simulates the following scenario:

- Ramps up to 50 virtual users over 1 minute
- Maintains 50 virtual users for 3 minutes
- Ramps down to 0 users over 1 minute

Each virtual user performs the following operations:

- Creates a new link
- Lists all links
- Gets a specific link
- Redirects using the short code
- Updates the link
- Gets analytics for the link
- Deletes the link

Performance thresholds:

- 95% of requests should complete within 2 seconds
- Less than 1% of requests should fail

## Code Metrics

The project includes a code metrics tool that analyzes the codebase and provides insights about:

- Total number of files
- Total lines of code
- Number of functions
- Number of classes

To run the code metrics analysis:

```bash
node codeMetrics.js
```

### Example Output

```
================ CODE METRICS =================

📂 Analyzing: MVC (./mvc/src)
📁 Files Analyzed: 8
📄 Total Lines of Code: 300
🔹 Functions Count: 9
🔸 Classes Count: 6
--------------------------------------------

📂 Analyzing: Hexagonal (./hexagonal)
📁 Files Analyzed: 19
📄 Total Lines of Code: 813
🔹 Functions Count: 33
🔸 Classes Count: 17
--------------------------------------------
```

Note: The numbers shown above are example values. Actual metrics will vary based on the current state of the codebase.
