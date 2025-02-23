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
📄 Total Lines of Code: 245
🔹 Functions Count: 12
🔸 Classes Count: 4
--------------------------------------------

📂 Analyzing: Hexagonal (./hexagonal/src)
📁 Files Analyzed: 10
📄 Total Lines of Code: 312
🔹 Functions Count: 15
🔸 Classes Count: 6
--------------------------------------------
```

Note: The numbers shown above are example values. Actual metrics will vary based on the current state of the codebase.
