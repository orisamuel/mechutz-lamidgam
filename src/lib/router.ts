import { QUESTION_COUNT } from '../data/questions';

/** Hash routes, so every step is a real history entry: swipe-back and Android back behave. */
export type Route =
  | { name: 'intro' }
  | { name: 'question'; index: number }
  | { name: 'result' }
  | { name: 'methodology' };

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '').replace(/\/+$/, '');
  const question = /^\/q\/(\d+)$/.exec(path);
  if (question) {
    const n = Number(question[1]);
    if (n >= 1 && n <= QUESTION_COUNT) return { name: 'question', index: n - 1 };
    return { name: 'intro' };
  }
  switch (path) {
    case '/result':
      return { name: 'result' };
    case '/methodology':
      return { name: 'methodology' };
    default:
      return { name: 'intro' };
  }
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'intro':
      return '#/';
    case 'question':
      return `#/q/${route.index + 1}`;
    case 'result':
      return '#/result';
    case 'methodology':
      return '#/methodology';
  }
}

export function sameRoute(a: Route, b: Route): boolean {
  return routeToHash(a) === routeToHash(b);
}
