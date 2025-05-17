export default function handler(req, res) {
  // Читаємо номер студента з параметрів запиту або тіла
  const studentNumber = Number(
    req.query.student_number || (req.body && req.body.student_number) || 1
  );
  const a = studentNumber * 0.1;
  const lower = a;
  const upper = a + 5;

  const popSize = 50;
  const generations = 100;
  const crossoverRate = 0.9;
  const mutationRate = 0.1;

  // Бокс-Мюллер для гаусової мутації
  function randnBm() {
    let u = 1 - Math.random();
    let v = 1 - Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  // Функція f(x)
  function f(x) {
    return a * x * Math.sin(a * x);
  }

  // Турнірний відбір
  function tournamentSelection(pop, fits, k = 3) {
    const selected = [];
    for (let i = 0; i < pop.length; i++) {
      const aspirants = [];
      for (let j = 0; j < k; j++) {
        const idx = Math.floor(Math.random() * pop.length);
        aspirants.push([pop[idx], fits[idx]]);
      }
      aspirants.sort((a, b) => b[1] - a[1]);
      selected.push(aspirants[0][0]);
    }
    return selected;
  }

  // Арифметичний кросовер
  function crossover(p1, p2) {
    if (Math.random() < crossoverRate) {
      const alpha = Math.random();
      return [
        alpha * p1 + (1 - alpha) * p2,
        alpha * p2 + (1 - alpha) * p1
      ];
    }
    return [p1, p2];
  }

  // Мутація
  function mutate(x) {
    if (Math.random() < mutationRate) {
      x += randnBm() * ((upper - lower) * 0.1);
    }
    return Math.min(upper, Math.max(lower, x));
  }

  // Запуск GA для максимуму або мінімуму
  function runGA(maximize = true) {
    let pop = Array.from({ length: popSize }, () =>
      lower + Math.random() * (upper - lower)
    );
    for (let gen = 0; gen < generations; gen++) {
      const fits = pop.map(x => (maximize ? f(x) : -f(x)));
      const sel = tournamentSelection(pop, fits);
      const next = [];
      for (let i = 0; i < sel.length; i += 2) {
        const [c1, c2] = crossover(sel[i], sel[(i + 1) % sel.length]);
        next.push(mutate(c1), mutate(c2));
      }
      pop = next;
    }
    const finalFits = pop.map(x => f(x));
    const evalFits = maximize ? finalFits : finalFits.map(v => -v);
    const idx = evalFits.indexOf(Math.max(...evalFits));
    return { x: pop[idx], value: f(pop[idx]) };
  }

  const { x: xMax, value: fMax } = runGA(true);
  const { x: xMin, value: fMin } = runGA(false);

  // Відповідь JSON
  res.status(200).json({
    a,
    x_max: xMax,
    f_max: fMax,
    x_min: xMin,
    f_min: fMin
  });
}