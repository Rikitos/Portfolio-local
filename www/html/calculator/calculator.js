class Calculator {
  constructor(display, expression) {
    this.display = display;
    this.expression = expression;
    this.clear();
  }

  clear() {
    this.currentValue = '0';
    this.previousValue = '';
    this.operator = null;
    this.waitingForOperand = false;
    this.render();
  }

  inputDigit(digit) {
    if (this.waitingForOperand) {
      this.currentValue = digit;
      this.waitingForOperand = false;
    } else {
      this.currentValue = this.currentValue === '0' ? digit : this.currentValue + digit;
    }
    this.render();
  }

  inputDecimal() {
    if (this.waitingForOperand) {
      this.currentValue = '0.';
      this.waitingForOperand = false;
      this.render();
      return;
    }
    if (!this.currentValue.includes('.')) {
      this.currentValue += '.';
      this.render();
    }
  }

  inputOperator(op) {
    if (this.operator && !this.waitingForOperand) {
      this.calculate();
    }
    this.previousValue = this.currentValue;
    this.operator = op;
    this.waitingForOperand = true;
    this.render();
  }

  calculate() {
    if (!this.operator || this.waitingForOperand) return;

    const prev = parseFloat(this.previousValue);
    const curr = parseFloat(this.currentValue);
    let result;

    switch (this.operator) {
      case '+': result = prev + curr; break;
      case '-': result = prev - curr; break;
      case '*': result = prev * curr; break;
      case '/': result = curr !== 0 ? prev / curr : 'Error'; break;
    }

    this.currentValue = result === 'Error' ? 'Error' : String(parseFloat(result.toFixed(10)));
    this.operator = null;
    this.previousValue = '';
    this.waitingForOperand = false;
    this.render();
  }

  toggleSign() {
    this.currentValue = String(parseFloat(this.currentValue) * -1);
    this.render();
  }

  percent() {
    this.currentValue = String(parseFloat(this.currentValue) / 100);
    this.render();
  }

  render() {
    this.display.textContent = this.currentValue;

    const opSymbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    this.expression.textContent = this.operator
      ? `${this.previousValue} ${opSymbols[this.operator]}`
      : '';
  }
}

const calc = new Calculator(
  document.getElementById('display'),
  document.getElementById('expression')
);

document.querySelector('.calc__buttons').addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  switch (btn.dataset.action) {
    case 'digit':    calc.inputDigit(btn.dataset.value); break;
    case 'operator': calc.inputOperator(btn.dataset.value); break;
    case 'decimal':  calc.inputDecimal(); break;
    case 'equals':   calc.calculate(); break;
    case 'clear':    calc.clear(); break;
    case 'sign':     calc.toggleSign(); break;
    case 'percent':  calc.percent(); break;
  }
});
