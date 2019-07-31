import { merge, writeTo, getTodosFrom } from '../todo-txt/todo-txt';

export function toTodo(email) {
  const todo = merge({}, { text: email.subject, date: email.date });
  return todo;
}

export async function save(todo, filepath) {
  const originalTodos = await getTodosFrom(filepath);
  await writeTo(filepath, originalTodos.concat(todo));
}
