#!/usr/bin/env node
/**
 * Comprehensive Smithery Deployment Test Suite
 * Tests both Smithery and non-Smithery execution paths
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class SmitheryTestSuite {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      'info': '📋',
      'pass': '✅',
      'fail': '❌',
      'warn': '⚠️'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runTest(testName, testFn) {
    this.log(`Running test: ${testName}`);
    try {
      await testFn();
      this.results.passed++;
      this.results.tests.push({ name: testName, status: 'PASS', error: null });
      this.log(`Test passed: ${testName}`, 'pass');
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name: testName, status: 'FAIL', error: error.message });
      this.log(`Test failed: ${testName} - ${error.message}`, 'fail');
    }
  }

  async testSmitheryConfiguration() {
    const smitheryPath = path.join(process.cwd(), 'smithery.yaml');
    
    if (!fs.existsSync(smitheryPath)) {
      throw new Error('smithery.yaml not found');
    }

    const content = fs.readFileSync(smitheryPath, 'utf8');
    if (!content.includes('runtime: "typescript"')) {
      throw new Error('smithery.yaml missing TypeScript runtime configuration');
    }

    this.log('Smithery configuration valid', 'pass');
  }

  async testPackageManagerCompatibility() {
    // Test bun
    return new Promise((resolve, reject) => {
      exec('bun --version', (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`bun not available: ${error.message}`));
        } else {
          const version = stdout.trim();
          if (!version.match(/^\d+\.\d+\.\d+/)) {
            reject(new Error(`Invalid bun version format: ${version}`));
          }
          resolve();
        }
      });
    });
  }

  async testTypeScriptCompilation() {
    return new Promise((resolve, reject) => {
      exec('bun run build', (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`TypeScript compilation failed: ${error.message}`));
        } else if (!fs.existsSync(path.join(process.cwd(), 'dist', 'server.js'))) {
          reject(new Error('Build output not found'));
        } else {
          resolve();
        }
      });
    });
  }

  async testServerExecution() {
    return new Promise((resolve, reject) => {
      const env = { ...process.env, IDEOGRAM_API_KEY: 'test_key_123' };
      const server = spawn('timeout', ['2s', 'node', 'dist/server.js'], { 
        env,
        stdio: 'pipe'
      });

      let output = '';
      server.stdout.on('data', (data) => {
        output += data.toString();
      });

      server.stderr.on('data', (data) => {
        output += data.toString();
      });

      server.on('close', (code) => {
        if (output.includes('[Ideogram MCP] Server started successfully')) {
          resolve();
        } else if (output.includes('IDEOGRAM_API_KEY environment variable must be set')) {
          reject(new Error('Environment variable validation not working'));
        } else {
          reject(new Error(`Server failed to start properly. Output: ${output}`));
        }
      });

      server.on('error', (error) => {
        reject(new Error(`Server spawn error: ${error.message}`));
      });
    });
  }

  async testMCPServerFunctionality() {
    return new Promise((resolve, reject) => {
      const env = { ...process.env, IDEOGRAM_API_KEY: 'test_key_123' };
      const server = spawn('node', ['dist/server.js'], { 
        env,
        stdio: 'pipe'
      });

      let hasStarted = false;
      let timeout;

      server.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('[Ideogram MCP] Server started successfully')) {
          hasStarted = true;
          clearTimeout(timeout);
          server.kill('SIGTERM');
          resolve();
        }
      });

      server.stderr.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Error:') && !hasStarted) {
          clearTimeout(timeout);
          reject(new Error(`Server error: ${output}`));
        }
      });

      timeout = setTimeout(() => {
        if (!hasStarted) {
          server.kill('SIGKILL');
          reject(new Error('Server failed to start within timeout'));
        }
      }, 5000);

      server.on('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Server process error: ${error.message}`));
      });
    });
  }

  async testEnvironmentVariableValidation() {
    return new Promise((resolve, reject) => {
      // Test without API key
      const server = spawn('timeout', ['2s', 'node', 'dist/server.js'], { 
        env: { ...process.env, IDEOGRAM_API_KEY: undefined },
        stdio: 'pipe'
      });

      let output = '';
      server.stdout.on('data', (data) => {
        output += data.toString();
      });

      server.stderr.on('data', (data) => {
        output += data.toString();
      });

      server.on('close', (code) => {
        if (output.includes('IDEOGRAM_API_KEY environment variable must be set') && code === 1) {
          resolve();
        } else {
          reject(new Error(`Environment validation failed. Output: ${output}, Code: ${code}`));
        }
      });
    });
  }

  async testBothExecutionPaths() {
    // Test direct execution
    await this.testMCPServerFunctionality();
    
    // Test if smithery would work (simulate)
    const smitheryConfig = fs.readFileSync('smithery.yaml', 'utf8');
    if (!smitheryConfig.includes('runtime: "typescript"')) {
      throw new Error('Smithery configuration not ready for TypeScript runtime');
    }
    
    this.log('Both execution paths validated (direct & smithery-ready)', 'pass');
  }

  async generateReport() {
    const total = this.results.passed + this.results.failed;
    const successRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;
    
    console.log('\n' + '='.repeat(60));
    console.log('🧪 SMITHERY DEPLOYMENT TEST REPORT');
    console.log('='.repeat(60));
    console.log(`📊 Total Tests: ${total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    console.log('='.repeat(60));
    
    if (this.results.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.tests
        .filter(test => test.status === 'FAIL')
        .forEach(test => {
          console.log(`   • ${test.name}: ${test.error}`);
        });
    }
    
    if (this.results.passed === total && total > 0) {
      console.log('\n🎉 ALL TESTS PASSED! Deployment is ready.');
    } else {
      console.log('\n⚠️  Some tests failed. Review issues before deployment.');
    }
    
    return {
      success: this.results.failed === 0,
      results: this.results
    };
  }

  async run() {
    this.log('Starting Smithery Deployment Test Suite', 'info');
    
    await this.runTest('Smithery Configuration', () => this.testSmitheryConfiguration());
    await this.runTest('Package Manager Compatibility', () => this.testPackageManagerCompatibility());
    await this.runTest('TypeScript Compilation', () => this.testTypeScriptCompilation());
    await this.runTest('Server Execution', () => this.testServerExecution());
    await this.runTest('MCP Server Functionality', () => this.testMCPServerFunctionality());
    await this.runTest('Environment Variable Validation', () => this.testEnvironmentVariableValidation());
    await this.runTest('Both Execution Paths', () => this.testBothExecutionPaths());
    
    return this.generateReport();
  }
}

// Run tests if called directly
if (require.main === module) {
  const testSuite = new SmitheryTestSuite();
  testSuite.run()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = SmitheryTestSuite;